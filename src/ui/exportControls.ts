import { byId, dom } from '../dom';
import { downloadPNG } from '../export/compose';
import { exportGIF } from '../export/gif';
import { isRecording, startRecording, stopRecording } from '../export/recorder';

/** Wire the PNG / 2× PNG / GIF / video-record buttons and the GIF-length slider. */
export function initExportControls(): void {
  const gifLen = byId<HTMLInputElement>('gif-len');
  const gifLenV = byId('gif-len-v');
  gifLen.addEventListener('input', () => {
    gifLenV.textContent = `${gifLen.value}s`;
  });

  dom.dlBtn.addEventListener('click', () => downloadPNG(1));
  byId<HTMLButtonElement>('dl2x-btn').addEventListener('click', () => downloadPNG(2));

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
