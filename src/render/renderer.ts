import { dom } from '../dom';
import { ctx, offC } from '../canvas';
import { state } from '../state';
import { OFF_SCALE } from '../constants';
import { drawMeshBlobs } from './mesh';
import { applySwirl } from './swirl';
import { drawWave } from './wave';
import { drawRadial } from './radial';

/**
 * Render one frame: draw the gradient into the offscreen buffer, then blit it
 * to the visible canvas applying zoom, offset (pan) and softness (blur).
 */
export function drawGradient(): void {
  const blobSc = +dom.blobsize.value / 100;
  const swirlAmt = +dom.swirl.value / 100;
  const zoom = +dom.zoom.value / 100;
  const offX = +dom.offx.value / 100;
  const offY = +dom.offy.value / 100;
  const blurPx = +dom.blur.value;

  const ow = offC.width, oh = offC.height;
  if (ow === 0 || oh === 0) return;

  let result: HTMLCanvasElement;
  switch (state.gradType) {
    case 'mesh':
      drawMeshBlobs(ow, oh, blobSc);
      result = applySwirl(ow, oh, swirlAmt);
      break;
    case 'wave-h':
    case 'wave-v':
      drawWave(ow, oh, blobSc, state.gradType === 'wave-h');
      result = offC;
      break;
    default:
      drawRadial(ow, oh, blobSc, state.gradType === 'radial-h');
      result = offC;
  }

  const { W, H } = state;
  ctx.clearRect(0, 0, W, H);
  ctx.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none';
  const drawW = ow / zoom;
  const drawH = oh / zoom;
  // Offset pans the crop zone: -100 = left/top edge, 0 = centre, 100 = right/bottom edge.
  const panX = (ow - drawW) / 2 * (1 + offX);
  const panY = (oh - drawH) / 2 * (1 + offY);
  ctx.drawImage(result, panX, panY, drawW, drawH, 0, 0, W, H);
  ctx.filter = 'none';
}

/** Match canvas sizes to the preview area and resize the offscreen buffer. */
export function resize(): void {
  const wrap = dom.gc.parentElement!;
  state.W = wrap.offsetWidth;
  state.H = wrap.offsetHeight;
  dom.gc.width = state.W;
  dom.gc.height = state.H;
  dom.grain.width = state.W;
  dom.grain.height = state.H;
  offC.width = Math.round(state.W * OFF_SCALE);
  offC.height = Math.round(state.H * OFF_SCALE);
}

/** Animation loop: advance the clock by the speed slider and draw. */
export function loop(): void {
  state.t += 0.004 * +dom.speed.value;
  drawGradient();
  state.raf = requestAnimationFrame(loop);
}
