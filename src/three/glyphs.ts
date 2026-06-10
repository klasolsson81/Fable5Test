import * as THREE from 'three';
import type { StationId } from '../core/store';

/**
 * Runtime-generated textures: glyph atlas for the rain shader,
 * text sprites for station labels, stroke icons for station panels.
 * No image assets, always crisp, bilingual for free.
 */

const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンャュョ';
const EXTRA = '0123456789KLASONXZ#$+*=<>:・"';

export function buildGlyphAtlas(): THREE.Texture {
  const SIZE = 1024;
  const GRID = 16;
  const cell = SIZE / GRID;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.font = `${Math.floor(cell * 0.78)}px "Share Tech Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';

  const chars = (KATAKANA + EXTRA).split('');
  for (let i = 0; i < GRID * GRID; i++) {
    const ch = chars[i % chars.length]!;
    const cx = (i % GRID) * cell + cell / 2;
    const cy = Math.floor(i / GRID) * cell + cell / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // The Matrix mirrors many of its glyphs
    if ((i * 2654435761) % 5 < 2) ctx.scale(-1, 1);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  // Keep canvas orientation so atlas cell math maps 1:1 in the shader
  tex.flipY = false;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export interface SpriteTex {
  texture: THREE.Texture;
  aspect: number;
}

export function buildLabelTexture(text: string, accent = '#bfffd9'): SpriteTex {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = '600 96px Rajdhani, "Share Tech Mono", monospace';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 96;
  canvas.width = Math.max(2, w);
  canvas.height = 160;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#2eff7e';
  ctx.shadowBlur = 26;
  ctx.fillStyle = accent;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
  ctx.shadowBlur = 0;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: canvas.width / canvas.height };
}

export function buildIconTexture(id: StationId): THREE.Texture {
  const S = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.strokeStyle = '#caffe2';
  ctx.fillStyle = '#caffe2';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#2eff7e';
  ctx.shadowBlur = 12;

  const draw: Record<StationId, () => void> = {
    projects: () => {
      ctx.strokeRect(24, 44, 80, 52);
      ctx.beginPath();
      ctx.moveTo(24, 44);
      ctx.lineTo(24, 32);
      ctx.lineTo(56, 32);
      ctx.lineTo(64, 44);
      ctx.stroke();
    },
    skills: () => {
      ctx.strokeRect(38, 38, 52, 52);
      ctx.strokeRect(54, 54, 20, 20);
      for (let i = 0; i < 3; i++) {
        const p = 48 + i * 16;
        ctx.beginPath(); ctx.moveTo(p, 38); ctx.lineTo(p, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p, 90); ctx.lineTo(p, 106); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(38, p); ctx.lineTo(22, p); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(90, p); ctx.lineTo(106, p); ctx.stroke();
      }
    },
    experience: () => {
      ctx.beginPath(); ctx.arc(36, 36, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(92, 92, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(43, 43);
      ctx.bezierCurveTo(70, 55, 58, 75, 85, 85);
      ctx.stroke();
    },
    chat: () => {
      ctx.beginPath();
      ctx.moveTo(30, 36); ctx.lineTo(54, 60); ctx.lineTo(30, 84);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(62, 92); ctx.lineTo(98, 92); ctx.stroke();
    },
    contact: () => {
      ctx.strokeRect(24, 40, 80, 52);
      ctx.beginPath();
      ctx.moveTo(26, 42); ctx.lineTo(64, 70); ctx.lineTo(102, 42);
      ctx.stroke();
    },
    cv: () => {
      ctx.strokeRect(36, 22, 56, 72);
      ctx.beginPath(); ctx.moveTo(48, 40); ctx.lineTo(80, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(48, 54); ctx.lineTo(80, 54); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(64, 66); ctx.lineTo(64, 104);
      ctx.moveTo(50, 92); ctx.lineTo(64, 106); ctx.lineTo(78, 92);
      ctx.stroke();
    },
  };
  draw[id]();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildRabbitTexture(): THREE.Texture {
  const S = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.strokeStyle = '#f4fff8';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 14;
  // body
  ctx.beginPath(); ctx.ellipse(58, 86, 26, 18, -0.2, 0, Math.PI * 2); ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(88, 66, 13, 0, Math.PI * 2); ctx.stroke();
  // ears
  ctx.beginPath(); ctx.ellipse(86, 40, 5, 16, -0.15, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(98, 42, 5, 16, 0.25, 0, Math.PI * 2); ctx.stroke();
  // tail
  ctx.beginPath(); ctx.arc(30, 84, 6, 0, Math.PI * 2); ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
