import { offCtx } from '../canvas';
import { state } from '../state';

/**
 * Concentric colour bands radiating from the left edge (horizontal) or the
 * bottom edge (vertical). The emitter drifts smoothly along a single axis so the
 * bands translate together — horizontal moves only horizontally, vertical only
 * vertically.
 */
export function drawRadial(ow: number, oh: number, blobSc: number, horizontal: boolean): void {
  const { stops, t } = state;
  const n = stops.length;

  const drift = Math.sin(t * 0.3);
  // Horizontal: emitter off the left edge, drifts left-right only (cy fixed).
  // Vertical:   emitter off the bottom edge, drifts up-down only (cx fixed).
  const cx = horizontal ? -ow * 0.08 + ow * 0.1 * drift : ow / 2;
  const cy = horizontal ? oh / 2 : oh * 1.08 + oh * 0.1 * drift;

  // Farthest corner from the centre — bands must reach the whole canvas.
  const farthest = Math.sqrt(Math.max(cx, ow - cx) ** 2 + Math.max(cy, oh - cy) ** 2);
  // Blob size sets the spread of the bands; no breathing, so they hold shape.
  const R = farthest * (0.5 + blobSc);
  const grd = offCtx.createRadialGradient(cx, cy, 0, cx, cy, R);

  let prev = 0;
  stops.forEach((c, i) => {
    let p = n > 1 ? i / (n - 1) : 0.5;
    p = Math.min(1, Math.max(prev + 0.005, p));
    prev = p;
    grd.addColorStop(p, c);
  });

  offCtx.fillStyle = grd;
  offCtx.fillRect(0, 0, ow, oh);
}
