import { offCtx } from '../canvas';
import { state } from '../state';
import { hexToRgb } from '../utils/color';

/**
 * Soft colour blobs that orbit the canvas centre on their own phase + radius.
 * The base is filled with the lightest stop (not a dark average) and the blob
 * cores stay near-opaque, so colours read vibrant instead of muddy.
 */
export function drawMeshBlobs(ow: number, oh: number, blobSc: number): void {
  const { stops, t } = state;
  const n = stops.length;

  const cx = ow / 2, cy = oh / 2;
  const baseRad = Math.min(ow, oh) * blobSc;

  // Base = a saturated ramp through all stops (slowly rotating). Full vibrant
  // coverage everywhere — no muddy average, no washed-out single colour — and
  // because it only blends neighbouring stops it never desaturates to grey.
  const ang = t * 0.06;
  const dx = Math.cos(ang) * ow * 0.65;
  const dy = Math.sin(ang) * oh * 0.65;
  const baseGrad = offCtx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  stops.forEach((c, i) => baseGrad.addColorStop(n > 1 ? i / (n - 1) : 0.5, c));
  offCtx.fillStyle = baseGrad;
  offCtx.fillRect(0, 0, ow, oh);

  stops.forEach((col, i) => {
    const orbitPhase = t * (0.2 + i * 0.05) + (i / n) * Math.PI * 2;
    const orbitR = baseRad * 0.38 * (1 + 0.3 * Math.sin(t * 0.11 + i * 1.7));
    const bx = cx + Math.cos(orbitPhase) * orbitR;
    const by = cy + Math.sin(orbitPhase) * orbitR;
    const br = baseRad * (0.75 + 0.2 * Math.sin(t * 0.15 + i * 2.1));
    const [rr, gg, bb] = hexToRgb(col);
    const grd = offCtx.createRadialGradient(bx, by, 0, bx, by, br);
    // Keep the core near-opaque so each blob holds its hue; only the soft edge
    // blends with neighbours.
    grd.addColorStop(0, `rgba(${rr},${gg},${bb},1)`);
    grd.addColorStop(0.55, `rgba(${rr},${gg},${bb},0.92)`);
    grd.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
    offCtx.fillStyle = grd;
    offCtx.fillRect(0, 0, ow, oh);
  });
}
