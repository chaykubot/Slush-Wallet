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
  const px = Math.max(1, Math.round(+dom.grainSize.value * pxScale)); // speck size in px
  const bw = Math.ceil(w / px), bh = Math.ceil(h / px);
  const id = ctx.createImageData(bw, bh);
  const d = id.data;
  const amt = +dom.grainAmt.value / 100;

  if (state.grainColor) {
    const rgbs = state.stops.map(hexToRgb);
    for (let i = 0; i < d.length; i += 4) {
      const col = rgbs[Math.floor(Math.random() * rgbs.length)];
      const n = (Math.random() - 0.5) * 255 * amt * 2.5;
      d[i] = Math.max(0, Math.min(255, col[0] + n));
      d[i + 1] = Math.max(0, Math.min(255, col[1] + n));
      d[i + 2] = Math.max(0, Math.min(255, col[2] + n));
      d[i + 3] = Math.round(140 * amt * (0.4 + Math.random() * 0.6));
    }
  } else {
    for (let i = 0; i < d.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255 * amt * 2;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = Math.round(150 * amt);
    }
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
