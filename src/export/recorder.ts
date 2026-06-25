import { dom } from '../dom';
import { state } from '../state';
import { loop, setFrameHook } from '../render/renderer';
import { grainCompositeOp } from '../settings';

/** Codec preference: MP4 (Safari) first, then WebM (Chrome/Firefox). */
const MIME_CANDIDATES = [
  'video/mp4;codecs=h264',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

function pickMime(): string {
  for (const m of MIME_CANDIDATES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let wasPlaying = false;

export function isRecording(): boolean {
  return recorder !== null;
}

/** Begin recording the composited (gradient + grain) animation to a video file. */
export function startRecording(): void {
  if (recorder) return;

  const canvas = document.createElement('canvas');
  canvas.width = state.W;
  canvas.height = state.H;
  const ctx = canvas.getContext('2d')!;

  const mime = pickMime();
  const ext = mime.includes('mp4') ? 'mp4' : 'webm';
  const stream = canvas.captureStream(30);
  recorder = new MediaRecorder(
    stream,
    mime ? { mimeType: mime, videoBitsPerSecond: 12_000_000 } : undefined,
  );
  chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  recorder.onstop = () => {
    setFrameHook(null);
    const blob = new Blob(chunks, { type: mime || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `gradient.${ext}`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Composite gradient + grain into the recording canvas on every rendered frame.
  setFrameHook(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(dom.gc, 0, 0);
    if (state.grainOn) {
      ctx.globalCompositeOperation = grainCompositeOp();
      ctx.drawImage(dom.grain, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  // The loop must run to produce frames; force it on for the duration.
  wasPlaying = state.playing;
  if (!state.playing) {
    state.playing = true;
    loop();
  }

  recorder.start();
}

/** Stop recording and trigger the download (handled in onstop). */
export function stopRecording(): void {
  if (!recorder) return;
  recorder.stop();
  recorder = null;
  if (!wasPlaying) {
    state.playing = false;
    cancelAnimationFrame(state.raf);
  }
}
