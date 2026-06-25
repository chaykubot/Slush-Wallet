import { dom } from '../dom';
import { gCtx } from '../canvas';
import { state } from '../state';
import { hexToRgb } from '../utils/color';

/**
 * Paint a film-grain layer into an arbitrary context at w×h. Generated at
 * 1/size resolution then upscaled with smoothing off, so specks stay square.
 * `pxScale` keeps speck size visually consistent when rendering at a different
 * resolution than the live canvas (e.g. 2 for a 2× export).
 */
export function paintGrain(ctx: CanvasRenderingContext2D, w: number, h: number, pxScale = 1): void {
  const px = Math.max(1, Math.round(+dom.grainSize.value * pxScale)); // speck block size in px
  const bw = Math.ceil(w / px), bh = Math.ceil(h / px);
  const id = ctx.createImageData(bw, bh);
  const d = id.data;
  const density = +dom.grainDensity.value / 100; // fraction of cells that get a speck
  const opacity = +dom.grainOpacity.value / 100; // per-speck alpha strength
  const chroma = +dom.grainColor.value / 100;    // 1 = full palette colour, 0 = grayscale

  // Stippled colour grain: only some cells get a speck (the rest stay transparent,
  // leaving gaps). Each speck takes a random stop colour plus brightness variation.
  const rgbs = state.stops.map(hexToRgb);
  for (let i = 0; i < d.length; i += 4) {
    if (Math.random() >= density) continue; // gap — leave this cell transparent
    const col = rgbs[Math.floor(Math.random() * rgbs.length)];
    const n = (Math.random() - 0.5) * 120; // brightness variation; keeps the hue
    const gray = 0.299 * col[0] + 0.587 * col[1] + 0.114 * col[2];
    d[i] = Math.max(0, Math.min(255, gray + (col[0] - gray) * chroma + n));
    d[i + 1] = Math.max(0, Math.min(255, gray + (col[1] - gray) * chroma + n));
    d[i + 2] = Math.max(0, Math.min(255, gray + (col[2] - gray) * chroma + n));
    d[i + 3] = Math.round(255 * opacity * (0.55 + 0.45 * Math.random()));
  }

  const tmpC = document.createElement('canvas');
  tmpC.width = bw;
  tmpC.height = bh;
  tmpC.getContext('2d')!.putImageData(id, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmpC, 0, 0, w, h);
}

/**
 * Re-roll the static film-grain overlay on the visible grain canvas. Called
 * only when grain settings, colours or canvas size change — never per frame.
 */
export function makeGrain(): void {
  if (!state.grainOn) return;
  const w = dom.grain.width, h = dom.grain.height;
  if (w === 0 || h === 0) return;
  paintGrain(gCtx, w, h);
}
