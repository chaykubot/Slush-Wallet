import { offC, offCtx, dstC, dstCtx } from '../canvas';
import { state } from '../state';

/**
 * Twist the mesh buffer around a slowly wandering centre. The rotation is
 * strongest near that centre (quadratic falloff), so colours wrap into visible
 * spiral arms like paint being stirred. Returns the buffer to draw from.
 */
export function applySwirl(ow: number, oh: number, swirlAmt: number): HTMLCanvasElement {
  if (swirlAmt <= 0) return offC;

  const { t } = state;
  const src = offCtx.getImageData(0, 0, ow, oh).data;
  dstC.width = ow;
  dstC.height = oh;
  const dstData = dstCtx.createImageData(ow, oh);
  const dst = dstData.data;

  // Stir point drifts around the canvas over time.
  const scx = ow / 2 + ow * 0.12 * Math.sin(t * 0.13);
  const scy = oh / 2 + oh * 0.12 * Math.cos(t * 0.17);
  const maxDist = Math.sqrt(ow * ow + oh * oh) / 2;
  // Up to ~2.5 full turns at the centre, breathing slightly with time.
  const strength = swirlAmt * Math.PI * 5 * (0.85 + 0.15 * Math.sin(t * 0.5));

  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const dx = x - scx, dy = y - scy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let f = 1 - dist / maxDist;
      if (f < 0) f = 0;
      f = f * f;
      const srcAngle = Math.atan2(dy, dx) - strength * f;
      let fx = scx + dist * Math.cos(srcAngle);
      let fy = scy + dist * Math.sin(srcAngle);
      // Bilinear sample for smooth arms.
      fx = Math.max(0, Math.min(ow - 1.001, fx));
      fy = Math.max(0, Math.min(oh - 1.001, fy));
      const x0 = fx | 0, y0 = fy | 0;
      const x1 = Math.min(ow - 1, x0 + 1), y1 = Math.min(oh - 1, y0 + 1);
      const tx = fx - x0, ty = fy - y0;
      const i00 = (y0 * ow + x0) * 4, i10 = (y0 * ow + x1) * 4;
      const i01 = (y1 * ow + x0) * 4, i11 = (y1 * ow + x1) * 4;
      const di = (y * ow + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[i00 + c] + (src[i10 + c] - src[i00 + c]) * tx;
        const bot = src[i01 + c] + (src[i11 + c] - src[i01 + c]) * tx;
        dst[di + c] = top + (bot - top) * ty;
      }
      dst[di + 3] = 255;
    }
  }
  dstCtx.putImageData(dstData, 0, 0);
  return dstC;
}
