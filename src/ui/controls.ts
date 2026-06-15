import { byId, dom } from '../dom';
import { gCtx } from '../canvas';
import { state } from '../state';
import { PALETTES, SLIDER_IDS } from '../constants';
import type { GradientType } from '../types';
import { loop, resize } from '../render/renderer';
import { makeGrain } from '../render/grain';
import { renderStops } from './stops';
import { updateCSS } from './cssSnapshot';

/** Sync UI to the selected gradient type: show/hide swirl, relabel blob size. */
export function applyGradType(): void {
  state.gradType = dom.gradType.value as GradientType;
  dom.swirlSec.style.display = state.gradType === 'mesh' ? '' : 'none';
  dom.blobsizeLabel.textContent =
    state.gradType === 'wave-h' || state.gradType === 'wave-v' ? 'Wave amplitude' : 'Blob size';
  updateCSS();
}

/** Attach all control listeners (sliders, grain, playback, actions, resize). */
export function initControls(): void {
  dom.gradType.addEventListener('change', applyGradType);

  // Sliders that update a value label and the CSS snapshot.
  SLIDER_IDS.forEach((id) => {
    const input = byId<HTMLInputElement>(id);
    const label = byId<HTMLSpanElement>(`${id}-v`);
    input.addEventListener('input', () => {
      label.textContent = input.value;
      updateCSS();
    });
  });

  // Grain sliders re-roll the grain layer.
  dom.grainAmt.addEventListener('input', () => {
    byId('grain-v').textContent = dom.grainAmt.value;
    makeGrain();
  });
  dom.grainSize.addEventListener('input', () => {
    byId('grain-size-v').textContent = dom.grainSize.value;
    makeGrain();
  });

  dom.grainToggle.addEventListener('click', () => {
    state.grainOn = !state.grainOn;
    dom.grainToggle.classList.toggle('on', state.grainOn);
    dom.grain.style.opacity = state.grainOn ? '1' : '0';
    if (state.grainOn) makeGrain();
    else gCtx.clearRect(0, 0, dom.grain.width, dom.grain.height);
  });

  dom.modeMono.addEventListener('click', () => {
    state.grainColor = false;
    dom.modeMono.classList.add('active');
    dom.modeColor.classList.remove('active');
    makeGrain();
  });
  dom.modeColor.addEventListener('click', () => {
    state.grainColor = true;
    dom.modeColor.classList.add('active');
    dom.modeMono.classList.remove('active');
    makeGrain();
  });

  dom.playBtn.addEventListener('click', () => {
    state.playing = !state.playing;
    dom.playBtn.textContent = state.playing ? '⏸ Pause' : '▶ Play';
    if (state.playing) loop();
    else cancelAnimationFrame(state.raf);
  });

  dom.randBtn.addEventListener('click', () => {
    state.stops = [...PALETTES[Math.floor(Math.random() * PALETTES.length)]];
    renderStops();
    updateCSS();
    makeGrain();
  });

  dom.dlBtn.addEventListener('click', () => {
    const out = document.createElement('canvas');
    out.width = state.W;
    out.height = state.H;
    const oc = out.getContext('2d')!;
    oc.drawImage(dom.gc, 0, 0);
    if (state.grainOn) {
      oc.globalCompositeOperation = 'overlay';
      oc.drawImage(dom.grain, 0, 0);
    }
    const a = document.createElement('a');
    a.download = 'gradient.png';
    a.href = out.toDataURL('image/png');
    a.click();
  });

  window.addEventListener('resize', () => {
    resize();
    makeGrain();
  });
}
