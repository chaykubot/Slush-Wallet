import { dom } from '../dom';

/**
 * Colour-mixing grain (the reference shader's `u_grainMixer`).
 *
 * The shader jitters the position each pixel samples its colour from
 * (`pos = getPosition(i,t) + mixerGrain`, with `grainUV = uv * 1000.` — i.e.
 * roughly per-pixel noise). Sampling a smooth gradient at a noise-displaced
 * position is identical to displacing the rendered image by a per-pixel noise
 * vector — so we do exactly that. The orange↔purple boundary stops being a clean
 * ramp and breaks into interleaved specks of each colour, which the eye averages
 * into a dithered "the two colours are mixing" transition.
 *
 * This runs at FULL display resolution (after the upscale + blur), so the dither
 * stays crisp — the same reason the black/white overlay grain in grain.ts is
 * painted full-res on its own canvas. Distinct from that overlay: this one moves
 * colour, the overlay sits on top of it.
 */

/** Fast integer hash of a lattice point → [0,1). */
function hash21(ix: number, iy: number): number {
  let h = (ix * 374761393 + iy * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

// Precomputed per-pixel displacement field, rebuilt only when the buffer size,
// the mix amount, or the speck scale changes — per frame we just gather, which
// is one O(N) pass.
let mapW = 0, mapH = 0, mapAmt = -1, mapScale = -1, mapSharp = -1;
let dxMap: Int16Array = new Int16Array(0);
let dyMap: Int16Array = new Int16Array(0);

function buildMap(w: number, h: number, amount: number, scale: number, sharp: number): void {
  dxMap = new Int16Array(w * h);
  dyMap = new Int16Array(w * h);
  const minDim = Math.min(w, h);
  // Max displacement as a fraction of the buffer. The reference jitters up to
  // ~0.2 of the image; 0.15 gives a wide sandy mixing band that matches the look
  // without smearing the colours into mud. Scaled by the slider (0..1).
  const maxDisp = amount * 0.15 * minDim;
  // Speck size: the noise is hashed per `scale × scale` block, so the specks are
  // crisp squares. scale = 1 → per-pixel white noise (the finest, original look).
  const cell = Math.max(1, scale);
  // Sharpness: shape the [-1,1] noise toward its extremes so specks commit fully
  // to one side (crisp salt-and-pepper) rather than landing on muddy in-between
  // shades. sharp = 1 → unchanged uniform jitter.
  const exp = 1 / Math.max(1, sharp);
  const shape = (v: number): number =>
    sharp <= 1 ? v : Math.sign(v) * Math.pow(Math.abs(v), exp);
  for (let y = 0; y < h; y++) {
    const cy = Math.floor(y / cell);
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const cx = Math.floor(x / cell);
      // Two hashes of the block coords, decorrelated by an integer lattice shift.
      const nx = shape(hash21(cx, cy) * 2 - 1);
      const ny = shape(hash21(cx + 9173, cy + 4271) * 2 - 1);
      dxMap[i] = (nx * maxDisp) | 0;
      dyMap[i] = (ny * maxDisp) | 0;
    }
  }
  mapW = w; mapH = h; mapAmt = amount; mapScale = scale; mapSharp = sharp;
}

/**
 * Displace the gradient already drawn into `canvas`, in place. Reads the slider
 * each call; 0 is a no-op so there's zero cost when disabled.
 */
export function applyMixerGrain(canvas: HTMLCanvasElement): void {
  const amount = +dom.grainMix.value / 100;
  if (amount <= 0) return;
  const scale = +dom.grainMixScale.value;
  const sharp = +dom.grainSharpness.value;

  const ctx = canvas.getContext('2d')!;
  const w = canvas.width, h = canvas.height;
  if (w === 0 || h === 0) return;

  if (w !== mapW || h !== mapH || amount !== mapAmt || scale !== mapScale || sharp !== mapSharp) {
    buildMap(w, h, amount, scale, sharp);
  }

  const src = ctx.getImageData(0, 0, w, h);
  const s = src.data;
  const out = ctx.createImageData(w, h);
  const o = out.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let sx = x + dxMap[i];
      let sy = y + dyMap[i];
      // Clamp to edge so the displacement never reads outside the buffer.
      if (sx < 0) sx = 0; else if (sx >= w) sx = w - 1;
      if (sy < 0) sy = 0; else if (sy >= h) sy = h - 1;
      const si = (sy * w + sx) * 4;
      const di = i * 4;
      o[di] = s[si];
      o[di + 1] = s[si + 1];
      o[di + 2] = s[si + 2];
      o[di + 3] = s[si + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}
