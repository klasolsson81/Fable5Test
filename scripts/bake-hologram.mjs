/**
 * Bakes the hologram bust assets from the profile photo:
 *
 *   public/img/profile/klas-cutout.webp  — RGBA: photo with background removed
 *   public/img/profile/klas-depth.webp   — grayscale depth map ("inflated" silhouette)
 *
 * Pipeline (no external AI services, works on any portrait with a uniform background):
 *   1. flood-fill background from the borders (color distance to corner sample)
 *   2. chamfer distance transform inside the person mask
 *   3. depth = sqrt(distance) inflation, modulated by blurred luminance (facial relief)
 *   4. smooth + feathered alpha matte
 *
 * Run after replacing the profile photo:  node scripts/bake-hologram.mjs
 */
import sharp from 'sharp';

const SRC = 'public/img/profile/klas.webp';
const OUT_CUTOUT = 'public/img/profile/klas-cutout.webp';
const OUT_DEPTH = 'public/img/profile/klas-depth.webp';
const OUT_PREVIEW = '/tmp/hologram-preview.png';

const WIDTH = 640;
const BG_THRESHOLD = 34;

const { data, info } = await sharp(SRC)
  .resize({ width: WIDTH })
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const C = info.channels;
const px = (x, y) => (y * W + x) * C;

/* 1 ── background flood fill from borders ─────────────────────────── */

// Reference background color = median of the top strip (in a portrait the
// top edge is always background; bottom corners may be shoulders/suit).
const strip = [[], [], []];
for (let y = 0; y < 8; y++)
  for (let x = 0; x < W; x++) {
    const i = px(x, y);
    strip[0].push(data[i]); strip[1].push(data[i + 1]); strip[2].push(data[i + 2]);
  }
const median = (arr) => arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)];
const bg = strip.map(median);

// The background is neutral gray; clothing/skin highlights that come close in
// brightness differ in chroma, so gate on the blue–red balance as well.
const bgChroma = bg[2] - bg[0];
const isBgColor = (i) => {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  if (Math.abs(data[i + 2] - data[i] - bgChroma) > 8) return false;
  return Math.sqrt(dr * dr + dg * dg + db * db) < BG_THRESHOLD;
};

const background = new Uint8Array(W * H);
const queue = [];
for (let x = 0; x < W; x++) { queue.push(x, 0, x, H - 1); }
for (let y = 0; y < H; y++) { queue.push(0, y, W - 1, y); }
for (let q = 0; q < queue.length; q += 2) {
  const x = queue[q], y = queue[q + 1];
  if (background[y * W + x] || !isBgColor(px(x, y))) continue;
  // BFS
  const stack = [x, y];
  background[y * W + x] = 1;
  while (stack.length) {
    const cy = stack.pop(), cx = stack.pop();
    for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const idx = ny * W + nx;
      if (!background[idx] && isBgColor(px(nx, ny))) {
        background[idx] = 1;
        stack.push(nx, ny);
      }
    }
  }
}

// Fill enclosed holes (teeth, glasses glare …): any "background" pixel that
// can't be reached from the image border through background is person.
{
  const reach = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) { stack.push(x, 0, x, H - 1); }
  for (let y = 0; y < H; y++) { stack.push(0, y, W - 1, y); }
  const work = [];
  for (let q = 0; q < stack.length; q += 2) {
    const x = stack[q], y = stack[q + 1];
    const i = y * W + x;
    if (background[i] && !reach[i]) { reach[i] = 1; work.push(x, y); }
  }
  while (work.length) {
    const cy = work.pop(), cx = work.pop();
    for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const idx = ny * W + nx;
      if (background[idx] && !reach[idx]) { reach[idx] = 1; work.push(nx, ny); }
    }
  }
  for (let i = 0; i < W * H; i++) if (background[i] && !reach[i]) background[i] = 0;
}

/* 2 ── chamfer distance transform inside the person mask ──────────── */

const INF = 1e9;
const dist = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) dist[i] = background[i] ? 0 : INF;
// forward pass
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (dist[i] === 0) continue;
    let d = dist[i];
    if (x > 0) d = Math.min(d, dist[i - 1] + 1);
    if (y > 0) d = Math.min(d, dist[i - W] + 1);
    if (x > 0 && y > 0) d = Math.min(d, dist[i - W - 1] + 1.414);
    if (x < W - 1 && y > 0) d = Math.min(d, dist[i - W + 1] + 1.414);
    dist[i] = d;
  }
// backward pass
for (let y = H - 1; y >= 0; y--)
  for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x;
    let d = dist[i];
    if (x < W - 1) d = Math.min(d, dist[i + 1] + 1);
    if (y < H - 1) d = Math.min(d, dist[i + W] + 1);
    if (x < W - 1 && y < H - 1) d = Math.min(d, dist[i + W + 1] + 1.414);
    if (x > 0 && y < H - 1) d = Math.min(d, dist[i + W - 1] + 1.414);
    dist[i] = d;
  }

// Normalize by a high percentile of the person-region distances so one
// deep pocket doesn't flatten the rest
const personDists = Array.from(dist).filter((d) => d > 0);
personDists.sort((a, b) => a - b);
const maxD = personDists[Math.floor(personDists.length * 0.97)] || 1;

/* 3 ── depth: inflation + luminance relief ────────────────────────── */

const lum = new Float32Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = px(x, y);
    lum[y * W + x] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
  }

const boxBlur = (src, radius) => {
  const out = new Float32Array(src.length);
  const tmp = new Float32Array(src.length);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < W) { s += src[y * W + xx]; n++; }
      }
      tmp[y * W + x] = s / n;
    }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -radius; k <= radius; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < H) { s += tmp[yy * W + x]; n++; }
      }
      out[y * W + x] = s / n;
    }
  return out;
};

const lumSoft = boxBlur(lum, 6);

let depth = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  if (background[i]) { depth[i] = 0; continue; }
  const y = Math.floor(i / W);
  const inflate = Math.sqrt(Math.min(dist[i] / maxD, 1)); // balloon shape
  const relief = 0.85 + 0.42 * (lumSoft[i] - 0.5);        // bright features forward
  const headBias = 1.12 - 0.26 * (y / H);                 // face leads, torso recedes
  depth[i] = Math.max(0, Math.min(1, inflate * relief * headBias));
}
depth = boxBlur(depth, 3);
depth = boxBlur(depth, 2);

/* 4 ── feathered alpha matte ──────────────────────────────────────── */

const matte = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) matte[i] = background[i] ? 0 : 1;
const alpha = boxBlur(matte, 2);

/* 5 ── encode outputs ─────────────────────────────────────────────── */

const cutout = Buffer.alloc(W * H * 4);
const depthImg = Buffer.alloc(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const s = px(x, y);
    cutout[i * 4] = data[s];
    cutout[i * 4 + 1] = data[s + 1];
    cutout[i * 4 + 2] = data[s + 2];
    cutout[i * 4 + 3] = Math.round(alpha[i] * 255);
    depthImg[i] = Math.round(depth[i] * 255);
  }

await sharp(cutout, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 84, alphaQuality: 90 })
  .toFile(OUT_CUTOUT);
await sharp(depthImg, { raw: { width: W, height: H, channels: 1 } })
  .webp({ quality: 90 })
  .toFile(OUT_DEPTH);

// Side-by-side preview for eyeballing the bake
const depthRgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  const v = depthImg[i];
  depthRgba[i * 4] = v * 0.2;
  depthRgba[i * 4 + 1] = v;
  depthRgba[i * 4 + 2] = v * 0.45;
  depthRgba[i * 4 + 3] = 255;
}
await sharp({ create: { width: W * 2, height: H, channels: 4, background: '#111' } })
  .composite([
    { input: await sharp(cutout, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer(), left: 0, top: 0 },
    { input: await sharp(depthRgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer(), left: W, top: 0 },
  ])
  .png()
  .toFile(OUT_PREVIEW);

const bgShare = background.reduce((a, b) => a + b, 0) / (W * H);
console.log(`bake done: ${W}x${H}, background ${(bgShare * 100).toFixed(1)}%, maxDist ${maxD.toFixed(1)}px`);
