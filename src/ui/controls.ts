import { byId, dom } from '../dom';
import { gCtx } from '../canvas';
import { state } from '../state';
import { PALETTES, SLIDER_IDS } from '../constants';
import type { GradientType } from '../types';
import { loop, resize } from '../render/renderer';
import { makeGrain } from '../render/grain';
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

  // Grain blend mode — keep the live canvas in sync (exports read state directly).
  dom.grain.style.mixBlendMode = state.grainBlend;
  dom.grainBlend.value = state.grainBlend;
  dom.grainBlend.addEventListener('change', () => {
    state.grainBlend = dom.grainBlend.value;
    dom.grain.style.mixBlendMode = state.grainBlend;
  });

  // Grain presets set all four sliders; manual edits clear the active preset.
  const grainBtns = [dom.grainFine, dom.grainCoarse, dom.grainSharp];
  const clearGrainPreset = () => grainBtns.forEach((b) => b.classList.remove('active'));
  const applyGrainPreset = (
    btn: HTMLButtonElement,
    size: number,
    density: number,
    opacity: number,
    color: number,
  ) => {
    dom.grainSize.value = String(size);
    dom.grainDensity.value = String(density);
    dom.grainOpacity.value = String(opacity);
    dom.grainColor.value = String(color);
    [dom.grainSize, dom.grainDensity, dom.grainOpacity, dom.grainColor]
      .forEach((s) => s.dispatchEvent(new Event('input')));
    btn.classList.add('active');
  };
  dom.grainFine.addEventListener('click', () => applyGrainPreset(dom.grainFine, 1, 65, 45, 75));
  dom.grainCoarse.addEventListener('click', () => applyGrainPreset(dom.grainCoarse, 3, 28, 85, 100));
  dom.grainSharp.addEventListener('click', () => applyGrainPreset(dom.grainSharp, 2, 25, 85, 100));

  // Grain sliders: update label, clear the active preset, and re-roll the grain.
  (['grain-size', 'grain-density', 'grain-opacity', 'grain-color'] as const).forEach((id) => {
    const input = byId<HTMLInputElement>(id);
    const label = byId(`${id}-v`);
    input.addEventListener('input', () => {
      label.textContent = input.value;
      clearGrainPreset();
      makeGrain();
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
