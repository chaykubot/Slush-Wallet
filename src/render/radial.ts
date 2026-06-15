import { offCtx } from '../canvas';
import { state } from '../state';

/**
 * Concentric colour bands radiating from the bottom edge (vertical) or the left
 * edge (horizontal). The centre sways slightly and the inner band positions
 * ripple, giving a soft round-wave motion.
 */
export function drawRadial(ow: number, oh: number, blobSc: number, horizontal: boolean): void {
  const { stops, t } = state;
  const n = stops.length;
  const sway = Math.sin(t * 0.3);
  const cx = horizontal ? -ow * 0.08 : ow / 2 + ow * 0.04 * sway;
  const cy = horizontal ? oh / 2 + oh * 0.04 * sway : oh * 1.08;
  // Farthest corner from the centre — bands must reach the whole canvas.
  const farthest = Math.sqrt(Math.max(cx, ow - cx) ** 2 + Math.max(cy, oh - cy) ** 2);
  // Blob size sets the spread of the bands; radius breathes gently.
  const R = farthest * (0.5 + blobSc) * (1 + 0.03 * Math.sin(t * 0.25));
  const grd = offCtx.createRadialGradient(cx, cy, 0, cx, cy, R);

  let prev = 0;
  stops.forEach((c, i) => {
    let p = n > 1 ? i / (n - 1) : 0.5;
    if (i > 0 && i < n - 1) p += 0.03 * Math.sin(t * 0.6 + i * 1.7); // ripple the inner bands
    p = Math.min(1, Math.max(prev + 0.005, p));
    prev = p;
    grd.addColorStop(p, c);
  });

  offCtx.fillStyle = grd;
  offCtx.fillRect(0, 0, ow, oh);
}
