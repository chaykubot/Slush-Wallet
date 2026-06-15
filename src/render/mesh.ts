import { offCtx } from '../canvas';
import { state } from '../state';
import { hexToRgb } from '../utils/color';

/**
 * Soft colour blobs over a darkened average-colour base. Each blob orbits the
 * canvas centre on its own phase + radius, so the colours drift like fluid.
 */
export function drawMeshBlobs(ow: number, oh: number, blobSc: number): void {
  const { stops, t } = state;
  const n = stops.length;

  // Base fill: the average of all stops, darkened to 50%.
  let sumR = 0, sumG = 0, sumB = 0;
  for (const c of stops) {
    const [r, g, b] = hexToRgb(c);
    sumR += r; sumG += g; sumB += b;
  }
  offCtx.fillStyle =
    `rgb(${Math.round(sumR / n * 0.5)},${Math.round(sumG / n * 0.5)},${Math.round(sumB / n * 0.5)})`;
  offCtx.fillRect(0, 0, ow, oh);

  const cx = ow / 2, cy = oh / 2;
  const baseRad = Math.min(ow, oh) * blobSc;

  stops.forEach((col, i) => {
    const orbitPhase = t * (0.2 + i * 0.05) + (i / n) * Math.PI * 2;
    const orbitR = baseRad * 0.38 * (1 + 0.3 * Math.sin(t * 0.11 + i * 1.7));
    const bx = cx + Math.cos(orbitPhase) * orbitR;
    const by = cy + Math.sin(orbitPhase) * orbitR;
    const br = baseRad * (0.75 + 0.2 * Math.sin(t * 0.15 + i * 2.1));
    const [rr, gg, bb] = hexToRgb(col);
    const grd = offCtx.createRadialGradient(bx, by, 0, bx, by, br);
    grd.addColorStop(0, `rgba(${rr},${gg},${bb},1)`);
    grd.addColorStop(0.45, `rgba(${rr},${gg},${bb},0.7)`);
    grd.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
    offCtx.fillStyle = grd;
    offCtx.fillRect(0, 0, ow, oh);
  });
}
