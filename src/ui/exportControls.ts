import { byId, dom } from '../dom';
import { downloadPNG } from '../export/compose';
import { exportGIF } from '../export/gif';
import { isRecording, startRecording, stopRecording } from '../export/recorder';

/** Wire the PNG / 2× / 4× PNG / GIF / video-record buttons and the GIF-length slider. */
export function initExportControls(): void {
  const gifLen = byId<HTMLInputElement>('gif-len');
  const gifLenV = byId('gif-len-v');
  gifLen.addEventListener('input', () => {
    gifLenV.textContent = `${gifLen.value}s`;
  });

  // Rendering a 2×/4× frame is synchronous and can block for a second or two,
  // so show a busy label and let the browser paint it before starting.
  const wirePNG = (btn: HTMLButtonElement, scale: number) => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = '… rendering';
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      try {
        downloadPNG(scale);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  };
  wirePNG(dom.dlBtn, 1);
  wirePNG(byId<HTMLButtonElement>('dl2x-btn'), 2);
  wirePNG(byId<HTMLButtonElement>('dl4x-btn'), 4);

  const recBtn = byId<HTMLButtonElement>('rec-btn');
  recBtn.addEventListener('click', () => {
    if (isRecording()) {
      stopRecording();
      recBtn.classList.remove('recording');
      recBtn.textContent = '● Record';
    } else {
      startRecording();
      recBtn.classList.add('recording');
      recBtn.textContent = '■ Stop';
    }
  });

  const gifBtn = byId<HTMLButtonElement>('gif-btn');
  gifBtn.addEventListener('click', async () => {
    if (gifBtn.disabled) return;
    const label = gifBtn.textContent;
    gifBtn.disabled = true;
    try {
      await exportGIF(+gifLen.value, (p) => {
        gifBtn.textContent = `${Math.round(p * 100)}%`;
      });
    } finally {
      gifBtn.disabled = false;
      gifBtn.textContent = label;
    }
  });
}
