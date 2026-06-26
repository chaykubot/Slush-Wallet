import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { dom } from '../dom';
import { state } from '../state';
import { drawGradient, loop } from '../render/renderer';
import { paintGrain } from '../render/grain';
import { grainCompositeOp } from '../settings';

const FPS = 15;
const MAX_SIDE = 480; // cap the longest side to keep GIF file size reasonable

/**
 * Render a self-contained animated GIF of the given duration. Steps the
 * animation clock deterministically (matching the live motion speed), downscales
 * each frame, quantizes to 256 colours and encodes. Yields periodically so the
 * UI stays responsive; reports progress in 0..1.
 */
export async function exportGIF(durationSec: number, onProgress?: (p: number) => void): Promise<void> {
  const frames = Math.round(durationSec * FPS);
  const speed = +dom.speed.value;
  // Live loop advances t by 0.004*speed per ~60fps frame → 0.24*speed per second.
  const dt = (0.24 * speed) / FPS;

  const sc = Math.min(1, MAX_SIDE / Math.max(state.W, state.H));
  const gw = Math.max(1, Math.round(state.W * sc));
  const gh = Math.max(1, Math.round(state.H * sc));

  // Pause the live loop and remember where we were.
  const wasPlaying = state.playing;
  cancelAnimationFrame(state.raf);
  const savedT = state.t;

  const frame = document.createElement('canvas');
  frame.width = gw;
  frame.height = gh;
  const fctx = frame.getContext('2d', { willReadFrequently: true })!;

  // One static grain layer at GIF resolution — gradient-independent, so it
  // composites identically over every frame.
  let grain: HTMLCanvasElement | null = null;
  if (state.grainOn) {
    grain = document.createElement('canvas');
    grain.width = gw;
    grain.height = gh;
    paintGrain(grain.getContext('2d')!, gw, gh);
  }

  const enc = GIFEncoder();
  const delay = Math.round(1000 / FPS);

  for (let i = 0; i < frames; i++) {
    state.t = savedT + i * dt;
    drawGradient();

    fctx.imageSmoothingEnabled = true;
    fctx.clearRect(0, 0, gw, gh);
    fctx.drawImage(dom.gc, 0, 0, gw, gh);
    if (grain) {
      fctx.globalCompositeOperation = grainCompositeOp();
      fctx.drawImage(grain, 0, 0);
      fctx.globalCompositeOperation = 'source-over';
    }

    const { data } = fctx.getImageData(0, 0, gw, gh);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    enc.writeFrame(index, gw, gh, { palette, delay });

    onProgress?.((i + 1) / frames);
    if (i % 4 === 3) await new Promise((r) => setTimeout(r)); // yield to the UI
  }

  enc.finish();
  const bytes = enc.bytes();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: 'image/gif' });

  // Restore the live animation.
  state.t = savedT;
  state.playing = wasPlaying;
  if (wasPlaying) loop();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `gradient-${durationSec}s.gif`;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
