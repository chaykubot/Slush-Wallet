import { dom } from '../dom';
import { state } from '../state';

/**
 * Composite the current visible frame (gradient, with its colour-mix grain
 * already baked into the visible canvas) into a target canvas, scaled by
 * `scale`. Returns the target's 2D context.
 */
export function composite(target: HTMLCanvasElement, scale: number): CanvasRenderingContext2D {
  const w = Math.round(state.W * scale);
  const h = Math.round(state.H * scale);
  target.width = w;
  target.height = h;
  const ctx = target.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(dom.gc, 0, 0, w, h);
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
