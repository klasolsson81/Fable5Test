import * as THREE from 'three';
import {
  RAIN_VERT, RAIN_FRAG, FLOOR_VERT, FLOOR_FRAG, HOLO_VERT, HOLO_FRAG, HOLO_WIRE_FRAG,
  HOLO_MODEL_VERT, HOLO_MODEL_FRAG,
  CONE_VERT, CONE_FRAG, PANEL_VERT, PANEL_FRAG, PARTICLE_VERT, PARTICLE_FRAG,
} from './shaders';
import { buildGlyphAtlas, buildLabelTexture, buildIconTexture, buildRabbitTexture } from './glyphs';
import type { StationId } from '../core/store';

export interface SceneCallbacks {
  onSelect: (id: StationId) => void;
  onArrive: (id: StationId) => void;
  onRabbit: () => void;
  onHover: (hovering: boolean) => void;
}

interface StationNode {
  id: StationId;
  group: THREE.Group;
  panelMat: THREE.ShaderMaterial;
  hit: THREE.Mesh;
  label: THREE.Sprite;
  basePos: THREE.Vector3;
  outward: THREE.Vector3;
  hover: number;
}

const STATION_ORDER: StationId[] = ['projects', 'skills', 'experience', 'chat', 'contact', 'cv'];
const STATION_ACCENTS: Record<StationId, string> = {
  projects: '#46ff8e',
  skills: '#5ec8ff',
  experience: '#ffb84d',
  chat: '#b48bff',
  contact: '#ff7ad9',
  cv: '#e8fff1',
};

const HUB_TARGET = new THREE.Vector3(0, 2.4, 0);
const HUB_RADIUS = 11.2;
const HUB_HEIGHT = 3.8;

/** Drop a Tripo/Meshy GLB here and it replaces the relief bust automatically. */
const HEAD_MODEL_PATH = '/models/klas-head.glb';

const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

export class ConstructScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private paused = false;
  private reducedMotion: boolean;
  private callbacks: SceneCallbacks;

  private rainMats: THREE.ShaderMaterial[] = [];
  private floorMat!: THREE.ShaderMaterial;
  private holoMat: THREE.ShaderMaterial | null = null;
  private holoGroup = new THREE.Group();
  private coneMat!: THREE.ShaderMaterial;
  private particleMat!: THREE.ShaderMaterial;
  private particles!: THREE.Points;
  private innerRain: THREE.Mesh | null = null;
  /** True when a real GLB head model is loaded instead of the relief bust. */
  private holoIsModel = false;
  private stations: StationNode[] = [];
  private rabbit: THREE.Sprite | null = null;
  private rabbitAnim: { t: number; from: THREE.Vector3; to: THREE.Vector3 } | null = null;
  private nextRabbitAt = 22;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pointerDown = new THREE.Vector2();
  private dragging = false;
  private hovered: StationId | 'rabbit' | null = null;

  // Camera rig
  private azimuth = Math.PI * 0.5;
  private azimuthVel = 0;
  private focused: StationId | null = null;
  private flight: {
    t: number; dur: number;
    fromPos: THREE.Vector3; toPos: THREE.Vector3;
    fromLook: THREE.Vector3; toLook: THREE.Vector3;
    arriveId: StationId | null;
  } | null = null;
  private curLook = HUB_TARGET.clone();
  private intro: { t: number; dur: number } | null = null;

  // Quality management
  private dpr: number;
  private fpsEma = 60;
  private lastQualityCheck = 0;
  private qualityLevel = 2; // 2 high, 1 medium, 0 low
  private glitchAt = 3;
  private gold = 0;
  private goldTarget = 0;

  constructor(canvas: HTMLCanvasElement, reducedMotion: boolean, callbacks: SceneCallbacks) {
    this.reducedMotion = reducedMotion;
    this.callbacks = callbacks;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.dpr <= 1.5,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0x020705);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    this.resize();

    this.buildRain();
    this.buildFloor();
    this.buildHologram();
    this.buildStations();
    this.buildRabbit();

    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    window.addEventListener('resize', this.resize);

    if (reducedMotion) {
      this.applyCamera(this.hubPos(), HUB_TARGET);
    } else {
      this.camera.position.set(0, 16, 34);
      this.curLook.set(0, 4, 0);
      this.intro = { t: 0, dur: 3.0 };
    }

    this.raf = requestAnimationFrame(this.loop);
  }

  /* ── Builders ──────────────────────────────────────────────────── */

  private makeRainCylinder(atlas: THREE.Texture, radius: number, cols: number, rows: number, opacity: number, speed: number): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(radius, radius, 38, 48, 1, true);
    const mat = new THREE.ShaderMaterial({
      vertexShader: RAIN_VERT,
      fragmentShader: RAIN_FRAG,
      uniforms: {
        uAtlas: { value: atlas },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uGold: { value: 0 },
        uCols: { value: cols },
        uRows: { value: rows },
        uSpeed: { value: this.reducedMotion ? speed * 0.25 : speed },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    });
    this.rainMats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 8;
    return mesh;
  }

  private buildRain(): void {
    const atlas = buildGlyphAtlas();
    // cols ≈ circumference / cell height keeps the glyphs square
    const outer = this.makeRainCylinder(atlas, 27, 280, 64, 0.85, 1.0);
    outer.renderOrder = -2;
    this.scene.add(outer);
    this.innerRain = this.makeRainCylinder(atlas, 15, 112, 46, 0.4, 0.7);
    this.innerRain.renderOrder = -1;
    this.scene.add(this.innerRain);
  }

  private buildFloor(): void {
    this.floorMat = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      uniforms: { uTime: { value: 0 }, uGold: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }

  private buildHologram(): void {
    // Prefer a real 3D head (GLB from e.g. Tripo) when one is provided;
    // fall back to the depth-baked relief bust. Both load async.
    void fetch(HEAD_MODEL_PATH, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok || !/model|octet|gltf/i.test(res.headers.get('content-type') ?? '')) {
          throw new Error('no head model');
        }
        return this.buildGlbHead();
      })
      .catch(() => this.buildReliefBust());

    this.buildProjector();
  }

  private async buildGlbHead(): Promise<void> {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync(HEAD_MODEL_PATH);
    if (this.disposed) return;
    const root = gltf.scene;

    // Steal the first base-color texture, then swap every material for the holo shader
    let map: THREE.Texture | null = null;
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          const std = m as THREE.MeshStandardMaterial;
          if (!map && std.map) map = std.map;
        }
      }
    });
    this.holoMat = new THREE.ShaderMaterial({
      vertexShader: HOLO_MODEL_VERT,
      fragmentShader: HOLO_MODEL_FRAG,
      uniforms: {
        uMap: { value: map ?? new THREE.Texture() },
        uHasMap: { value: map ? 1 : 0 },
        uTime: { value: 0 },
        uGlitch: { value: 0 },
        uOpacity: { value: 0.96 },
      },
      transparent: true,
    });
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          // Free everything from the original materials except the kept map
          for (const value of Object.values(m)) {
            if (value instanceof THREE.Texture && value !== map) value.dispose();
          }
          m.dispose();
        }
        obj.material = this.holoMat!;
      }
    });

    // Normalize: ~3.2 units tall, centered over the projector
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    root.scale.setScalar(3.2 / Math.max(size.y, 1e-4));
    box.setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center).add(new THREE.Vector3(0, 3.1, 0));

    this.holoIsModel = true;
    this.holoGroup.add(root);
  }

  private buildReliefBust(): void {
    if (this.disposed) return;
    const loader = new THREE.TextureLoader();
    void Promise.all([
      loader.loadAsync('/img/profile/klas-cutout.webp'),
      loader.loadAsync('/img/profile/klas-depth.webp'),
    ]).then(([cutout, depth]) => {
      if (this.disposed) { cutout.dispose(); depth.dispose(); return; }
      cutout.colorSpace = THREE.SRGBColorSpace;
      depth.colorSpace = THREE.NoColorSpace;
      // Sampled in the vertex shader — keep filtering mip-free
      depth.generateMipmaps = false;
      depth.minFilter = THREE.LinearFilter;
      depth.magFilter = THREE.LinearFilter;

      const aspect = cutout.image.width / cutout.image.height;
      const h = 3.6;
      const relief = 1.0;
      const uniforms = {
        uMap: { value: cutout },
        uDepth: { value: depth },
        uRelief: { value: relief },
        uTime: { value: 0 },
        uGlitch: { value: 0 },
        uOpacity: { value: 0.96 },
      };
      this.holoMat = new THREE.ShaderMaterial({
        vertexShader: HOLO_VERT,
        fragmentShader: HOLO_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
      });
      const surface = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h, 160, 160), this.holoMat);
      surface.position.set(0, 3.15, -relief * 0.45);
      this.holoGroup.add(surface);

      // Coarse wireframe overlay sells the "reconstructed mesh" reading
      const wireMat = new THREE.ShaderMaterial({
        vertexShader: HOLO_VERT,
        fragmentShader: HOLO_WIRE_FRAG,
        uniforms: {
          uMap: { value: cutout },
          uDepth: { value: depth },
          uRelief: { value: relief },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        wireframe: true,
      });
      const wire = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h, 48, 48), wireMat);
      wire.position.copy(surface.position);
      wire.position.z += 0.012;
      this.holoGroup.add(wire);
    }).catch((err) => console.warn('hologram textures failed to load', err));
  }

  /** Cone of light, emitter ring and particle halo around the hologram. */
  private buildProjector(): void {
    this.coneMat = new THREE.ShaderMaterial({
      vertexShader: CONE_VERT,
      fragmentShader: CONE_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.6, 5.2, 40, 1, true), this.coneMat);
    cone.position.y = 2.6;
    this.holoGroup.add(cone);

    // Emitter ring flat at the projector base — never crosses the face
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.016, 8, 80),
      new THREE.MeshBasicMaterial({
        color: 0x2eff7e, transparent: true, opacity: 0.38,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.18;
    this.holoGroup.add(ring);

    // Particle halo — kept sparse and out of the corridor in front of the
    // face (the group billboards toward the camera along local +z)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const count = isMobile ? 320 : 750;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 2.7 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      let z = r * Math.sin(phi) * Math.sin(theta);
      if (Math.abs(x) < 2.2 && z > -0.3) z = -0.6 - Math.abs(z) * 0.7;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 3.0 + r * Math.cos(phi) * 0.8;
      positions[i * 3 + 2] = z;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.particleMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      uniforms: { uTime: { value: 0 }, uSize: { value: 9 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.particles = new THREE.Points(geo, this.particleMat);
    this.holoGroup.add(this.particles);

    this.scene.add(this.holoGroup);
  }

  private buildStations(): void {
    const radius = 7.4;
    STATION_ORDER.forEach((id, i) => {
      const angle = (i / STATION_ORDER.length) * Math.PI * 2 + Math.PI / 6;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, 2.3, Math.sin(angle) * radius);
      const outward = pos.clone().setY(0).normalize();

      const group = new THREE.Group();
      group.position.copy(pos);
      group.lookAt(pos.clone().add(outward));

      const accent = new THREE.Color(STATION_ACCENTS[id]);
      const panelMat = new THREE.ShaderMaterial({
        vertexShader: PANEL_VERT,
        fragmentShader: PANEL_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uDim: { value: 0 },
          uAccent: { value: accent },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), panelMat);
      group.add(panel);

      const icon = new THREE.Sprite(new THREE.SpriteMaterial({
        map: buildIconTexture(id), transparent: true, depthWrite: false, opacity: 0.95,
      }));
      icon.scale.setScalar(0.78);
      icon.position.set(0, 0.12, 0.05);
      group.add(icon);

      const label = new THREE.Sprite(new THREE.SpriteMaterial({
        map: null, transparent: true, depthWrite: false,
      }));
      label.position.set(0, -1.12, 0.05);
      group.add(label);

      const hit = new THREE.Mesh(
        new THREE.PlaneGeometry(3.0, 2.6),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hit.userData.stationId = id;
      group.add(hit);

      this.scene.add(group);
      this.stations.push({ id, group, panelMat, hit, label, basePos: pos.clone(), outward, hover: 0 });
    });
  }

  private buildRabbit(): void {
    if (this.reducedMotion) return;
    this.rabbit = new THREE.Sprite(new THREE.SpriteMaterial({
      map: buildRabbitTexture(), transparent: true, depthWrite: false, opacity: 0,
    }));
    this.rabbit.scale.setScalar(0.9);
    this.rabbit.userData.rabbit = true;
    this.scene.add(this.rabbit);
  }

  /** Station labels are canvas textures — regenerate on language switch. */
  setLabels(labels: Record<StationId, string>): void {
    for (const st of this.stations) {
      const { texture, aspect } = buildLabelTexture(labels[st.id]);
      const mat = st.label.material;
      mat.map?.dispose();
      mat.map = texture;
      mat.needsUpdate = true;
      st.label.scale.set(0.62 * aspect, 0.62, 1);
    }
  }

  /* ── Camera ────────────────────────────────────────────────────── */

  private hubPos(): THREE.Vector3 {
    return new THREE.Vector3(
      Math.cos(this.azimuth) * HUB_RADIUS,
      HUB_HEIGHT,
      Math.sin(this.azimuth) * HUB_RADIUS,
    );
  }

  private applyCamera(pos: THREE.Vector3, look: THREE.Vector3): void {
    this.camera.position.copy(pos);
    this.curLook.copy(look);
    this.camera.lookAt(look);
  }

  focusStation(id: StationId | null): void {
    if (id === this.focused) return;
    const fromPos = this.camera.position.clone();
    const fromLook = this.curLook.clone();
    if (id) {
      const st = this.stations.find((s) => s.id === id)!;
      const toPos = st.basePos.clone()
        .add(st.outward.clone().multiplyScalar(3.4))
        .add(new THREE.Vector3(0, 0.45, 0));
      this.flight = {
        t: 0, dur: this.reducedMotion ? 0.01 : 1.35,
        fromPos, toPos,
        fromLook, toLook: st.basePos.clone(),
        arriveId: id,
      };
    } else {
      // Return to the hub orbit near the previously focused station's angle
      const prev = this.stations.find((s) => s.id === this.focused);
      if (prev) this.azimuth = Math.atan2(prev.basePos.z, prev.basePos.x);
      this.flight = {
        t: 0, dur: this.reducedMotion ? 0.01 : 1.1,
        fromPos, toPos: this.hubPos(),
        fromLook, toLook: HUB_TARGET.clone(),
        arriveId: null,
      };
    }
    this.focused = id;
    for (const st of this.stations) {
      st.panelMat.uniforms.uDim!.value = 0; // recomputed each frame below
    }
  }

  setRabbitMode(on: boolean): void {
    this.goldTarget = on ? 1 : 0;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (!paused) this.clock.getDelta(); // swallow the gap
  }

  /* ── Pointer ───────────────────────────────────────────────────── */

  private setPointer(e: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerMove = (e: PointerEvent): void => {
    this.setPointer(e);
    if (this.dragging && !this.focused) {
      this.azimuthVel += (e.movementX || 0) * 0.00018;
    }
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.dragging = true;
    this.pointerDown.set(e.clientX, e.clientY);
    this.setPointer(e);
  };

  private onPointerUp = (e: PointerEvent): void => {
    this.dragging = false;
    const dx = e.clientX - this.pointerDown.x;
    const dy = e.clientY - this.pointerDown.y;
    if (dx * dx + dy * dy > 64) return; // it was a drag, not a click
    this.setPointer(e);
    const hit = this.pick();
    if (hit === 'rabbit') {
      this.callbacks.onRabbit();
    } else if (hit) {
      this.callbacks.onSelect(hit);
    }
  };

  private onPointerLeave = (): void => {
    this.dragging = false;
    this.hovered = null;
  };

  private pick(): StationId | 'rabbit' | null {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets: THREE.Object3D[] = this.stations.map((s) => s.hit);
    if (this.rabbit && this.rabbitAnim) targets.push(this.rabbit);
    const hits = this.raycaster.intersectObjects(targets, false);
    const first = hits[0]?.object;
    if (!first) return null;
    if (first.userData.rabbit) return 'rabbit';
    return (first.userData.stationId as StationId) ?? null;
  }

  /* ── Frame loop ────────────────────────────────────────────────── */

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.paused || document.hidden) { this.clock.getDelta(); return; }

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    // FPS watchdog → degrade gracefully instead of lagging
    this.fpsEma = this.fpsEma * 0.95 + (1 / Math.max(dt, 1e-4)) * 0.05;
    if (t - this.lastQualityCheck > 2.5 && !this.intro) {
      this.lastQualityCheck = t;
      if (this.fpsEma < 42 && this.qualityLevel === 2) {
        this.qualityLevel = 1;
        this.dpr = Math.max(1, this.dpr - 0.5);
        this.renderer.setPixelRatio(this.dpr);
      } else if (this.fpsEma < 30 && this.qualityLevel === 1) {
        this.qualityLevel = 0;
        if (this.innerRain) this.innerRain.visible = false;
        this.particles.visible = false;
      }
    }

    // Uniform clock
    for (const m of this.rainMats) m.uniforms.uTime!.value = t;
    this.floorMat.uniforms.uTime!.value = t;
    this.coneMat.uniforms.uTime!.value = t;
    this.particleMat.uniforms.uTime!.value = this.reducedMotion ? 0 : t;
    if (this.holoMat) this.holoMat.uniforms.uTime!.value = t;

    // Gold (white rabbit) blend
    this.gold += (this.goldTarget - this.gold) * Math.min(1, dt * 2.5);
    for (const m of this.rainMats) m.uniforms.uGold!.value = this.gold;
    this.floorMat.uniforms.uGold!.value = this.gold;

    // Hologram life
    if (!this.reducedMotion) {
      this.holoGroup.position.y = Math.sin(t * 0.7) * 0.1;
      if (this.holoIsModel) {
        // A real 3D head can rotate freely
        this.holoGroup.rotation.y += dt * 0.22;
      } else {
        // The relief bust always faces the camera (with a soft lag)
        const camAz = Math.atan2(this.camera.position.x, this.camera.position.z);
        const delta = Math.atan2(Math.sin(camAz - this.holoGroup.rotation.y), Math.cos(camAz - this.holoGroup.rotation.y));
        this.holoGroup.rotation.y += delta * Math.min(1, dt * 2.2);
      }
      if (this.holoMat) {
        const g = this.holoMat.uniforms.uGlitch!;
        g.value = Math.max(0, (g.value as number) - dt * 2.4);
        if (t > this.glitchAt) {
          g.value = 0.5 + Math.random() * 0.5;
          this.glitchAt = t + 3.5 + Math.random() * 6;
        }
      }
    }

    // Stations: hover + dim + idle bob
    const hoveredNow = !this.dragging && !this.intro ? this.pick() : null;
    if (hoveredNow !== this.hovered) {
      this.hovered = hoveredNow;
      this.callbacks.onHover(hoveredNow !== null);
    }
    for (const st of this.stations) {
      const targetHover = this.hovered === st.id ? 1 : 0;
      st.hover += (targetHover - st.hover) * Math.min(1, dt * 8);
      st.panelMat.uniforms.uTime!.value = t;
      st.panelMat.uniforms.uHover!.value = st.hover;
      const dim = this.focused && this.focused !== st.id ? 1 : 0;
      const u = st.panelMat.uniforms.uDim!;
      u.value += (dim - (u.value as number)) * Math.min(1, dt * 5);
      const scale = 1 + st.hover * 0.1;
      st.group.scale.setScalar(scale);
      if (!this.reducedMotion) {
        st.group.position.y = st.basePos.y + Math.sin(t * 0.9 + st.basePos.x) * 0.08;
      }
    }
    this.renderer.domElement.style.cursor = this.hovered ? 'pointer' : this.dragging ? 'grabbing' : 'grab';

    // White rabbit choreography
    if (this.rabbit && !this.focused) {
      if (!this.rabbitAnim && t > this.nextRabbitAt) {
        const a = Math.random() * Math.PI * 2;
        this.rabbitAnim = {
          t: 0,
          from: new THREE.Vector3(Math.cos(a) * 13, 0.5, Math.sin(a) * 13),
          to: new THREE.Vector3(Math.cos(a + 2.4) * 13, 0.5, Math.sin(a + 2.4) * 13),
        };
      }
      if (this.rabbitAnim) {
        this.rabbitAnim.t += dt / 7;
        const k = this.rabbitAnim.t;
        if (k >= 1) {
          this.rabbitAnim = null;
          this.nextRabbitAt = t + 18 + Math.random() * 22;
          this.rabbit.material.opacity = 0;
        } else {
          const p = this.rabbit.position.lerpVectors(this.rabbitAnim.from, this.rabbitAnim.to, k);
          p.y = 0.5 + Math.abs(Math.sin(k * Math.PI * 9)) * 0.5;
          this.rabbit.material.opacity = Math.min(1, Math.min(k, 1 - k) * 6) * 0.9;
        }
      }
    }

    // Camera
    if (this.intro) {
      this.intro.t += dt / this.intro.dur;
      const k = easeOut(Math.min(this.intro.t, 1));
      const start = new THREE.Vector3(0, 16, 34);
      const startLook = new THREE.Vector3(0, 4, 0);
      this.applyCamera(start.clone().lerp(this.hubPos(), k), startLook.clone().lerp(HUB_TARGET, k));
      if (this.intro.t >= 1) this.intro = null;
    } else if (this.flight) {
      this.flight.t += dt / this.flight.dur;
      const k = easeInOut(Math.min(this.flight.t, 1));
      this.applyCamera(
        this.flight.fromPos.clone().lerp(this.flight.toPos, k),
        this.flight.fromLook.clone().lerp(this.flight.toLook, k),
      );
      if (this.flight.t >= 1) {
        const arriveId = this.flight.arriveId;
        this.flight = null;
        if (arriveId) this.callbacks.onArrive(arriveId);
      }
    } else if (!this.focused) {
      if (!this.dragging && !this.reducedMotion) this.azimuthVel += 0.0062 * dt;
      this.azimuth += this.azimuthVel;
      this.azimuthVel *= Math.pow(0.0035, dt); // exponential damping
      this.applyCamera(this.hubPos(), HUB_TARGET);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private resize = (): void => {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    window.removeEventListener('resize', this.resize);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          for (const key of Object.keys((m as THREE.ShaderMaterial).uniforms ?? {})) {
            const v = (m as THREE.ShaderMaterial).uniforms[key]?.value;
            if (v instanceof THREE.Texture) v.dispose();
          }
          if ((m as THREE.MeshBasicMaterial).map) (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        }
      }
      if (obj instanceof THREE.Sprite) {
        obj.material.map?.dispose();
        obj.material.dispose();
      }
    });
    this.renderer.dispose();
  }
}
