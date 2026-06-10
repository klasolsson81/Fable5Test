/** GLSL for the construct. All effects fade manually (no scene fog needed). */

export const RAIN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const RAIN_FRAG = /* glsl */ `
  precision mediump float;
  uniform sampler2D uAtlas;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uGold;
  uniform float uCols;
  uniform float uRows;
  uniform float uSpeed;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

  void main() {
    vec2 grid = vec2(uCols, uRows);
    vec2 cell = floor(vUv * grid);
    vec2 cellUv = fract(vUv * grid);

    float colSeed = hash(cell.x * 1.37 + 7.0);
    float speed = mix(0.045, 0.16, fract(colSeed * 9.7)) * uSpeed;
    float head = fract(uTime * speed + colSeed * 13.7);

    // Trail extends upward from the falling head, wrapped around the column.
    float y = (cell.y + 0.5) / uRows;
    float t = fract(y - (1.0 - head));
    float trailLen = mix(0.18, 0.42, fract(colSeed * 5.3));
    float bright = exp(-t / trailLen * 4.0);
    float isHead = step(t, 1.5 / uRows);

    // Some columns rest, dim or re-roll over time.
    float colGate = step(0.12, fract(colSeed * 3.1 + floor(uTime * 0.05)));
    bright *= mix(0.25, 1.0, colGate);

    // Glyph flicker: index changes a few times per second per cell.
    float flick = floor(uTime * (2.0 + 4.0 * hash2(cell)));
    float glyphId = floor(hash2(cell + flick) * 256.0);
    vec2 atlasPos = vec2(mod(glyphId, 16.0), floor(glyphId / 16.0));
    vec2 atlasUv = (atlasPos + cellUv) / 16.0;
    float glyph = texture2D(uAtlas, atlasUv).r;

    vec3 green = vec3(0.13, 1.0, 0.46);
    vec3 gold = vec3(1.0, 0.82, 0.25);
    vec3 base = mix(green, gold, uGold);
    vec3 color = mix(base * bright, vec3(0.85, 1.0, 0.9), isHead * bright);

    float edge = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
    float alpha = glyph * bright * edge * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const FLOOR_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const FLOOR_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uGold;
  varying vec3 vWorld;

  float gridLine(float coord) {
    float d = abs(fract(coord) - 0.5);
    float w = fwidth(coord) * 1.4;
    return 1.0 - smoothstep(0.5 - w * 2.0, 0.5 - w * 0.2, d);
  }

  void main() {
    float r = length(vWorld.xz);
    float fade = exp(-r * 0.055);

    float grid = max(gridLine(vWorld.x / 1.6), gridLine(vWorld.z / 1.6));
    float glow = exp(-r * 0.30);
    float ring = 1.0 - smoothstep(0.0, 0.45, abs(fract(r * 0.16 - uTime * 0.10) - 0.5));

    vec3 green = vec3(0.10, 0.95, 0.42);
    vec3 gold = vec3(1.0, 0.80, 0.25);
    vec3 base = mix(green, gold, uGold);

    float lum = grid * 0.38 * fade + glow * 0.50 + ring * ring * 0.10 * fade;
    gl_FragColor = vec4(base * lum, lum);
  }
`;

/**
 * Hologram bust: the photo cutout is displaced by a baked depth map into a
 * relief mesh — a "volumetric AI reconstruction" with real parallax.
 */
export const HOLO_VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uRelief;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(uDepth, uv).r * uRelief;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const HOLO_FRAG = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform float uTime;
  uniform float uGlitch;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec2 uv = vUv;

    // Horizontal slice displacement during glitch spikes
    float row = floor(uv.y * 26.0 + uTime * 30.0);
    uv.x += (hash(row) - 0.5) * 0.14 * uGlitch;

    float alpha = texture2D(uMap, uv).a;
    if (alpha < 0.12) discard;

    float split = 0.006 * uGlitch + 0.0012;
    float rC = texture2D(uMap, uv + vec2(split, 0.0)).r;
    float gC = texture2D(uMap, uv).g;
    float bC = texture2D(uMap, uv - vec2(split, 0.0)).b;
    vec3 c = vec3(rC, gC, bC);

    // Normal from the depth gradient → relief shading + rim glow
    float e = 1.0 / 320.0;
    float dL = texture2D(uDepth, uv - vec2(e, 0.0)).r;
    float dR = texture2D(uDepth, uv + vec2(e, 0.0)).r;
    float dB = texture2D(uDepth, uv - vec2(0.0, e)).r;
    float dT = texture2D(uDepth, uv + vec2(0.0, e)).r;
    vec3 n = normalize(vec3((dL - dR) * 2.4, (dB - dT) * 2.4, 0.55));
    float lambert = 0.70 + 0.45 * max(dot(n, normalize(vec3(0.4, 0.55, 0.75))), 0.0);
    float rim = pow(1.0 - max(n.z, 0.0), 1.7);

    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 green = vec3(0.35, 1.0, 0.6);
    c = mix(c, green * lum * 1.25, 0.55);
    c *= lambert;
    c += green * rim * 0.55;

    float scan = 0.82 + 0.18 * sin(uv.y * 320.0 + uTime * 7.0);
    float flicker = 0.95 + 0.05 * sin(uTime * 53.0) * sin(uTime * 19.0);

    // Materialize out of the projector cone at the bottom edge
    alpha *= smoothstep(0.01, 0.14, vUv.y);

    gl_FragColor = vec4(c * scan * flicker, alpha * uOpacity);
  }
`;

export const HOLO_WIRE_FRAG = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  varying vec2 vUv;
  void main() {
    float alpha = texture2D(uMap, vUv).a;
    if (alpha < 0.2) discard;
    float d = texture2D(uDepth, vUv).r;
    gl_FragColor = vec4(vec3(0.25, 1.0, 0.55), (0.05 + d * 0.10) * smoothstep(0.01, 0.14, vUv.y));
  }
`;

export const CONE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const CONE_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float pulse = 0.75 + 0.25 * sin(uTime * 2.2);
    float a = pow(vUv.y, 1.6) * 0.16 * pulse;
    a *= smoothstep(0.0, 0.15, vUv.y);
    gl_FragColor = vec4(vec3(0.25, 1.0, 0.55) * a, a);
  }
`;

export const PANEL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const PANEL_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uHover;
  uniform float uDim;
  uniform vec3 uAccent;
  varying vec2 vUv;

  float roundedRect(vec2 uv, vec2 halfSize, float radius) {
    vec2 d = abs(uv - 0.5) - halfSize + radius;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
  }

  void main() {
    float dist = roundedRect(vUv, vec2(0.48, 0.46), 0.07);
    float border = 1.0 - smoothstep(0.0, 0.012, abs(dist));
    float inside = 1.0 - smoothstep(-0.012, 0.0, dist);

    float scan = 0.5 + 0.5 * sin(vUv.y * 60.0 - uTime * 2.0);
    float sweep = smoothstep(0.0, 0.25, 1.0 - abs(fract(uTime * 0.18) * 1.6 - vUv.y - 0.3));

    vec3 c = uAccent * (border * (0.85 + uHover * 0.8));
    c += uAccent * inside * (0.05 + scan * 0.035 + sweep * 0.06 + uHover * 0.10);

    float alpha = border * (0.85 + uHover * 0.15) + inside * (0.16 + uHover * 0.12 + scan * 0.02);
    alpha *= 1.0 - uDim * 0.78;
    gl_FragColor = vec4(c, alpha);
  }
`;

export const PARTICLE_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    float t = uTime * 0.4 + aSeed * 17.0;
    p.x += sin(t * 0.9 + aSeed * 6.28) * 0.25;
    p.y += sin(t * 0.6 + aSeed * 3.14) * 0.35;
    p.z += cos(t * 0.8 + aSeed * 1.57) * 0.25;
    vTwinkle = 0.45 + 0.55 * sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (1.0 + aSeed) * (12.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const PARTICLE_FRAG = /* glsl */ `
  precision mediump float;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vTwinkle * 0.7;
    gl_FragColor = vec4(vec3(0.3, 1.0, 0.55), a);
  }
`;
