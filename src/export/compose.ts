import { renderAtScale } from '../render/renderer';

/**
 * Render the current frame at `scale`× the preview resolution and trigger a PNG
 * download. The frame is re-rendered at the target size (not upscaled), so 2×
 * and 4× exports are genuinely sharper.
 */
export function downloadPNG(scale: number): void {
  const out = renderAtScale(scale);
  const a = document.createElement('a');
  a.download = scale === 1 ? 'gradient.png' : `gradient@${scale}x.png`;
  a.href = out.toDataURL('image/png');
  a.click();
}
