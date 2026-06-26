import { byId, dom } from '../dom';
import { gCtx } from '../canvas';
import { state } from '../state';
import { PALETTES, SLIDER_IDS } from '../constants';
import type { GradientType } from '../types';
import { loop, resize } from '../render/renderer';
import { makeGrain, requestGrain } from '../render/grain';
import { renderStops } from './stops';
import { renderPresets } from './presets';
import { updateCSS } from './cssSnapshot';

/** Default slider values (UI scale) loaded when switching to each gradient type. */
const TYPE_DEFAULTS: Record<GradientType, Record<string, number>> = {
  'radial-h': { speed: 3, blobsize: 10, zoom: 100, offx: 0, offy: 0, blur: 10 },
  'radial-v': { speed: 3, blobsize: 10, zoom: 100, offx: 0, offy: 0, blur: 10 },
  'wave-h': { speed: 3, blobsize: 10, stretch: 10, zoom: 130, offx: 0, offy: 0, blur: 10 },
  'wave-v': { speed: 3, blobsize: 10, stretch: 10, zoom: 130, offx: 0, offy: 0, blur: 10 },
  'mesh': { speed: 3, blobsize: 10, swirl: 0, zoom: 150, offx: 0, offy: 0, blur: 10 },
};

function applyTypeDefaults(defaults: Record<string, number>): void {
  for (const [id, value] of Object.entries(defaults)) {
    const input = byId<HTMLInputElement>(id);
    input.value = String(value);
    byId(`${id}-v`).textContent = input.value;
  }
}

/** Sync UI to the selected gradient type: show/hide swirl, relabel blob size. */
export function applyGradType(): void {
  state.gradType = dom.gradType.value as GradientType;
  const isWave = state.gradType === 'wave-h' || state.gradType === 'wave-v';
  dom.swirlSec.style.display = state.gradType === 'mesh' ? '' : 'none';
  dom.stretchSec.style.display = isWave ? '' : 'none';
  dom.blobsizeLabel.textContent = isWave ? 'Wave amplitude' : 'Blob size';

  // Mesh allows larger blobs (UI 0-40 = actual 50-90); other types cap at 25.
  // Setting `max` auto-clamps the value in the browser, so just resync the label.
  dom.blobsize.max = state.gradType === 'mesh' ? '40' : '25';
  byId('blobsize-v').textContent = dom.blobsize.value;
  updateCSS();
}

/** Switching gradient type loads that type's default sliders + preset set. */
function onGradTypeChange(): void {
  applyGradType();
  applyTypeDefaults(TYPE_DEFAULTS[state.gradType]);
  renderPresets();
  updateCSS();
}

/** Attach all control listeners (sliders, grain, playback, actions, resize). */
export function initControls(): void {
  dom.gradType.addEventListener('change', onGradTypeChange);

  // Sliders that update a value label and the CSS snapshot.
  SLIDER_IDS.forEach((id) => {
    const input = byId<HTMLInputElement>(id);
    const label = byId<HTMLSpanElement>(`${id}-v`);
    input.addEventListener('input', () => {
      label.textContent = input.value;
      updateCSS();
    });
  });

  // Grain presets set scale / strength / contrast; manual edits clear the preset.
  const grainBtns = [dom.grainFine, dom.grainCoarse, dom.grainSharp];
  const clearGrainPreset = () => grainBtns.forEach((b) => b.classList.remove('active'));
  const applyGrainPreset = (
    btn: HTMLButtonElement,
    scale: number,
    strength: number,
    contrast: number,
  ) => {
    dom.grainScale.value = String(scale);
    dom.grainStrength.value = String(strength);
    dom.grainContrast.value = String(contrast);
    [dom.grainScale, dom.grainStrength, dom.grainContrast]
      .forEach((s) => s.dispatchEvent(new Event('input')));
    btn.classList.add('active');
  };
  dom.grainFine.addEventListener('click', () => applyGrainPreset(dom.grainFine, 1000, 90, 120));
  dom.grainCoarse.addEventListener('click', () => applyGrainPreset(dom.grainCoarse, 280, 130, 160));
  dom.grainSharp.addEventListener('click', () => applyGrainPreset(dom.grainSharp, 500, 100, 130));

  // Grain sliders: update label, clear the active preset, and re-roll the grain.
  (['grain-scale', 'grain-strength', 'grain-contrast'] as const).forEach((id) => {
    const input = byId<HTMLInputElement>(id);
    const label = byId(`${id}-v`);
    input.addEventListener('input', () => {
      label.textContent = input.value;
      clearGrainPreset();
      requestGrain();
    });
  });

  dom.grainToggle.addEventListener('click', () => {
    state.grainOn = !state.grainOn;
    dom.grainToggle.classList.toggle('on', state.grainOn);
    dom.grain.style.opacity = state.grainOn ? '1' : '0';
    if (state.grainOn) makeGrain();
    else gCtx.clearRect(0, 0, dom.grain.width, dom.grain.height);
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

  window.addEventListener('resize', () => {
    resize();
    makeGrain();
  });
}
