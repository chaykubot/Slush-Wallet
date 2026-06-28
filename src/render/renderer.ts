import { dom } from '../dom';
import { ctx, offC, mixC, mixCtx } from '../canvas';
import { state } from '../state';
import { OFF_SCALE } from '../constants';
import { blobSizeActual, softnessActual, stretchActual, swirlActual } from '../settings';
import { drawMeshBlobs } from './mesh';
import { applyMixerGrain } from './mixerGrain';
import { applySwirl } from './swirl';
import { drawWave } from './wave';
import { drawRadial } from './radial';

/**
 * Render one frame: draw the gradient into the offscreen buffer, then blit it
 * to the visible canvas applying zoom, offset (pan) and softness (blur).
 */
export function drawGradient(): void {
  const blobSc = blobSizeActual() / 100;
  const swirlAmt = swirlActual() / 100;
  const zoom = +dom.zoom.value / 100;
  const offX = +dom.offx.value / 100;
  const offY = +dom.offy.value / 100;
  const blurPx = softnessActual();

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

  // Stretch for wave gradients: magnify along the wave's travel axis by sampling
  // a narrower source slice, so the pattern spreads out. Wave-H stretches
  // horizontally, Wave-V vertically.
  const isWaveH = state.gradType === 'wave-h';
  const isWaveV = state.gradType === 'wave-v';
  const stretch = isWaveH || isWaveV ? stretchActual() / 100 : 1;

  const { W, H } = state;
  // Colour-mix grain dithers the gradient at full display resolution so it stays
  // crisp (the 35% offscreen + blur would otherwise smear it away). When active,
  // upscale + blur into the full-res mix buffer, dither it, then copy to the
  // visible canvas. When off, blit straight to the visible canvas — no extra cost.
  const mixOn = +dom.grainMix.value > 0;
  const target = mixOn ? mixCtx : ctx;
  target.clearRect(0, 0, W, H);
  target.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none';
  const drawW = ow / zoom / (isWaveH ? stretch : 1);
  const drawH = oh / zoom / (isWaveV ? stretch : 1);
  // Offset pans the crop zone: -100 = left/top edge, 0 = centre, 100 = right/bottom edge.
  const panX = (ow - drawW) / 2 * (1 + offX);
  const panY = (oh - drawH) / 2 * (1 + offY);
  // Overscan the destination by the blur radius so the blur kernel never samples
  // the transparent area outside the canvas — that's what darkened the corners.
  const over = blurPx * 2;
  target.drawImage(result, panX, panY, drawW, drawH, -over, -over, W + over * 2, H + over * 2);
  target.filter = 'none';

  if (mixOn) {
    applyMixerGrain(mixC);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(mixC, 0, 0);
  }
}

/** Match canvas sizes to the preview area and resize the offscreen buffer. */
export function resize(): void {
  const wrap = dom.gc.parentElement!;
  state.W = wrap.offsetWidth;
  state.H = wrap.offsetHeight;
  dom.gc.width = state.W;
  dom.gc.height = state.H;
  mixC.width = state.W;
  mixC.height = state.H;
  offC.width = Math.round(state.W * OFF_SCALE);
  offC.height = Math.round(state.H * OFF_SCALE);
}

/** Optional per-frame callback (used by the video recorder to grab each frame). */
let frameHook: (() => void) | null = null;
export function setFrameHook(fn: (() => void) | null): void {
  frameHook = fn;
}

/** Animation loop: advance the clock by the speed slider and draw. */
export function loop(): void {
  state.t += 0.004 * +dom.speed.value;
  drawGradient();
  frameHook?.();
  state.raf = requestAnimationFrame(loop);
}
