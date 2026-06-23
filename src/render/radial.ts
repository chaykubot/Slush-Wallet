import { offCtx } from '../canvas';
import { state } from '../state';

/**
 * Concentric colour bands radiating from the bottom edge (vertical) or the left
 * edge (horizontal). The whole emitter drifts smoothly along both axes so the
 * bands translate together (in unison) — a flowing motion rather than a pulse.
 */
export function drawRadial(ow: number, oh: number, blobSc: number, horizontal: boolean): void {
  const { stops, t } = state;
  const n = stops.length;

  // Two slow, out-of-phase drifts so the centre wanders on a gentle path.
  const driftA = Math.sin(t * 0.3);
  const driftB = Math.sin(t * 0.21 + 1.3);

  // Vertical bands sway left-right (primary) and bob up-down (secondary);
  // horizontal bands do the opposite. The emitter sits off-frame either way.
  const cx = horizontal ? -ow * 0.08 + ow * 0.05 * driftB : ow / 2 + ow * 0.12 * driftA;
  const cy = horizontal ? oh / 2 + oh * 0.12 * driftA : oh * 1.08 + oh * 0.05 * driftB;

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
