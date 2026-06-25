import { dom } from '../dom';
import { state } from '../state';
import { paintGrain } from '../render/grain';
import { grainCompositeOp } from '../settings';

/**
 * Composite the current visible frame (gradient + grain overlay) into a target
 * canvas, scaled by `scale`. Grain is re-rolled crisply at the target size so
 * 2× exports stay sharp. Returns the target's 2D context.
 */
export function composite(target: HTMLCanvasElement, scale: number): CanvasRenderingContext2D {
  const w = Math.round(state.W * scale);
  const h = Math.round(state.H * scale);
  target.width = w;
  target.height = h;
  const ctx = target.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(dom.gc, 0, 0, w, h);

  if (state.grainOn) {
    const grain = document.createElement('canvas');
    grain.width = w;
    grain.height = h;
    paintGrain(grain.getContext('2d')!, w, h, scale);
    ctx.globalCompositeOperation = grainCompositeOp();
    ctx.drawImage(grain, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  return ctx;
}

/** Composite at the given scale and trigger a PNG download. */
export function downloadPNG(scale: number): void {
  const out = document.createElement('canvas');
  composite(out, scale);
  const a = document.createElement('a');
  a.download = scale === 1 ? 'gradient.png' : `gradient@${scale}x.png`;
  a.href = out.toDataURL('image/png');
  a.click();
}
