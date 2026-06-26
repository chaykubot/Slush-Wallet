import { dom } from '../dom';
import { gCtx } from '../canvas';
import { state } from '../state';

/** Fast integer hash of a lattice point → [0,1). */
function hash21(ix: number, iy: number): number {
  let h = (ix * 374761393 + iy * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** Smooth 2D value noise → [0,1] (bilinear lattice interpolation, smoothstep). */
function valueNoise(px: number, py: number): number {
  const ix = Math.floor(px), iy = Math.floor(py);
  const fx = px - ix, fy = py - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash21(ix, iy);
  const b = hash21(ix + 1, iy);
  const c = hash21(ix, iy + 1);
  const d = hash21(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/**
 * Paint the film grain into `ctx` at w×h, ported from the reference WebGL recipe:
 * two rotated octaves of value noise, contrast-shaped, thresholded to pure
 * black/white, with strength strongest at the noise extremes. The layer carries
 * NO colour of its own — composited over the gradient (normal blend) the specks
 * read as darkened/lightened local colour, so a dark speck on the orange→purple
 * transition reads purple. Gradient-independent, so it's static + export-safe.
 */
export function paintGrain(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const scale = +dom.grainScale.value;            // noise frequency (≈ cells across width)
  const uGrain = +dom.grainStrength.value / 100;  // master speck intensity
  const contrast = +dom.grainContrast.value / 100; // noise shaping power (sparsity/contrast)

  // Two octaves rotated by 1 and 2 radians (decorrelates them, as in the shader).
  const c1 = Math.cos(1), s1 = Math.sin(1);
  const c2 = Math.cos(2), s2 = Math.sin(2);

  const id = ctx.createImageData(w, h);
  const d = id.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Divide both axes by w so the cells stay square and scale with resolution.
      const gx = (x / w) * scale;
      const gy = (y / w) * scale;

      let g = valueNoise(gx * c1 - gy * s1 + 3, gx * s1 + gy * c1 + 3);
      g = g * 0.5 + valueNoise(gx * c2 - gy * s2 - 1, gx * s2 + gy * c2 - 1) * 0.5;
      g = Math.pow(g, contrast);

      const v = g * 2 - 1;
      const bw = v >= 0 ? 255 : 0; // pure black or white — no hue
      let strength = Math.pow(uGrain * Math.abs(v), 0.8);
      let a = 0.35 * strength;
      if (a > 1) a = 1;

      const i = (y * w + x) * 4;
      d[i] = bw;
      d[i + 1] = bw;
      d[i + 2] = bw;
      d[i + 3] = (a * 255) | 0;
    }
  }
  ctx.putImageData(id, 0, 0);
}

/** Re-paint the visible grain overlay. Static (gradient-independent): re-run only
 * on grain-setting or canvas-size change. */
export function makeGrain(): void {
  if (!state.grainOn) return;
  const w = dom.grain.width, h = dom.grain.height;
  if (w === 0 || h === 0) return;
  paintGrain(gCtx, w, h);
}

/** rAF-coalesced makeGrain so dragging a grain slider doesn't queue many full
 * regenerations (each is a full-canvas pass). */
let pending = false;
export function requestGrain(): void {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    makeGrain();
  });
}
