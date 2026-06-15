import { offCtx, lutCtx } from '../canvas';
import { state } from '../state';

/** Bake the colour stops into a 256-entry RGBA lookup table. */
function gradientLUT(): Uint8ClampedArray {
  const { stops } = state;
  const n = stops.length;
  const g = lutCtx.createLinearGradient(0, 0, 256, 0);
  stops.forEach((c, i) => g.addColorStop(n > 1 ? i / (n - 1) : 0.5, c));
  lutCtx.fillStyle = g;
  lutCtx.fillRect(0, 0, 256, 1);
  return lutCtx.getImageData(0, 0, 256, 1).data;
}

/**
 * Linear gradient whose colour boundaries are bent into a soft S-curve. The
 * wave stays inside the frame and only sways gently — no swirling.
 */
export function drawWave(ow: number, oh: number, amp: number, horizontal: boolean): void {
  const { t } = state;
  const lut = gradientLUT();
  const img = offCtx.createImageData(ow, oh);
  const d = img.data;
  const along = horizontal ? ow : oh; // axis the wave travels along
  const perp = horizontal ? oh : ow;  // axis the colours run along

  // Amplitude from the slider, breathing slightly; based on the smaller canvas
  // dimension so the S-curve stays round in wide/tall frames.
  const A = Math.min(ow, oh) * amp * 0.5 * (0.9 + 0.1 * Math.sin(t * 0.2));
  const tilt = -0.15 + 0.05 * Math.sin(t * 0.18);

  // One soft S-period across the frame + a faint second harmonic, swaying in place.
  const shift = new Float32Array(along);
  for (let a = 0; a < along; a++) {
    const ph = (a / along) * Math.PI * 2;
    shift[a] = A * (0.7 * Math.sin(ph + t * 0.45 + 0.8) + 0.3 * Math.sin(ph * 2.2 + t * 0.3))
      + tilt * (a / along - 0.5) * perp;
  }

  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const a = horizontal ? x : y;
      const p = horizontal ? y : x;
      let u = (p + shift[a]) / perp;
      u = Math.max(0, Math.min(1, u));
      const li = ((u * 255) | 0) * 4;
      const di = (y * ow + x) * 4;
      d[di] = lut[li];
      d[di + 1] = lut[li + 1];
      d[di + 2] = lut[li + 2];
      d[di + 3] = 255;
    }
  }
  offCtx.putImageData(img, 0, 0);
}
