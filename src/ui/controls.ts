import { byId, dom } from '../dom';
import { state } from '../state';
import { PALETTES, SLIDER_IDS } from '../constants';
import type { GradientType } from '../types';
import { loop, resize, drawGradient } from '../render/renderer';
import { renderStops } from './stops';
import { renderPresets } from './presets';
import { updateCSS } from './cssSnapshot';

/** Default slider values (UI scale) loaded when switching to each gradient type. */
const TYPE_DEFAULTS: Record<GradientType, Record<string, number>> = {
  'radial-h': { speed: 3, blobsize: 10, stretch: 0, zoom: 136, offx: 69, offy: 0, blur: 10, 'grain-mix': 100, 'grain-mix-scale': 1, 'grain-sharpness': 5 },
  'radial-v': { speed: 3, blobsize: 10, stretch: 8, zoom: 138, offx: 0, offy: -100, blur: 10, 'grain-mix': 100, 'grain-mix-scale': 1, 'grain-sharpness': 5 },
  'wave-h': { speed: 3, blobsize: 4, stretch: 8, zoom: 100, offx: 0, offy: 0, blur: 10, 'grain-mix': 80, 'grain-mix-scale': 1, 'grain-sharpness': 4 },
  'wave-v': { speed: 3, blobsize: 14, stretch: 23, zoom: 128, offx: 38, offy: -43, blur: 10, 'grain-mix': 71, 'grain-mix-scale': 1, 'grain-sharpness': 4 },
  'mesh': { speed: 3, blobsize: 10, swirl: 0, zoom: 150, offx: 0, offy: 0, blur: 10 },
};

/**
 * Animation-clock phase each type freezes on when selected (the tool boots and
 * switches types paused). Chosen so the static frame matches the approved
 * reference shots: radials read straight horizontal/vertical, waves pause
 * mid-sway where their band tilts into a diagonal. Swirl is exempt.
 */
const TYPE_STATIC_T: Partial<Record<GradientType, number>> = {
  'radial-h': 0,
  'radial-v': 0,
  'wave-h': 2,
  'wave-v': 14,
};

export function applyTypeDefaults(defaults: Record<string, number>): void {
  for (const [id, value] of Object.entries(defaults)) {
    const input = byId<HTMLInputElement>(id);
    input.value = String(value);
    byId(`${id}-v`).textContent = input.value;
  }
}

/** Start/stop the animation loop and keep the play button label in sync. */
export function setPlaying(playing: boolean): void {
  if (state.playing === playing) return;
  state.playing = playing;
  dom.playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
  if (playing) loop();
  else cancelAnimationFrame(state.raf);
}

/** Redraw the current frame when paused (the loop handles it while playing). */
export function requestDraw(): void {
  if (!state.playing) drawGradient();
}

/** Apply the current type's default sliders + frozen phase (used at boot so the
 * first paint matches the type's reference frame). */
export function applyTypeStaticDefaults(): void {
  applyTypeDefaults(TYPE_DEFAULTS[state.gradType]);
  const staticT = TYPE_STATIC_T[state.gradType];
  if (staticT !== undefined) state.t = staticT;
}

/** Icon buttons for picking the gradient type. */
let gradTypeBtns: HTMLButtonElement[] = [];

/** Sync UI to the current `state.gradType`: show/hide swirl, relabel blob size,
 * and highlight the active icon. */
export function applyGradType(): void {
  const isWave = state.gradType === 'wave-h' || state.gradType === 'wave-v';
  const isRadial = state.gradType === 'radial-h' || state.gradType === 'radial-v';
  dom.swirlSec.style.display = state.gradType === 'mesh' ? '' : 'none';
  dom.stretchSec.style.display = isWave || isRadial ? '' : 'none';
  byId('stretch-label').textContent =
    state.gradType === 'radial-h' ? 'Stretch vertically'
    : state.gradType === 'radial-v' ? 'Stretch horizontally'
    : 'Stretch';
  dom.blobsizeLabel.textContent = isWave ? 'Wave amplitude' : 'Blob size';

  // Mesh allows larger blobs (UI 0-40 = actual 50-90); other types cap at 25.
  // Setting `max` auto-clamps the value in the browser, so just resync the label.
  dom.blobsize.max = state.gradType === 'mesh' ? '40' : '25';
  byId('blobsize-v').textContent = dom.blobsize.value;

  gradTypeBtns.forEach((b) => b.classList.toggle('active', b.dataset.type === state.gradType));
  updateCSS();
}

/** Picking a gradient type loads that type's default sliders + preset set. */
function selectGradType(type: GradientType): void {
  if (type === state.gradType) return;
  state.gradType = type;
  const staticT = TYPE_STATIC_T[type];
  if (staticT !== undefined) state.t = staticT;
  applyGradType();
  applyTypeDefaults(TYPE_DEFAULTS[type]);
  renderPresets();
  updateCSS();
  requestDraw();
}

/** Attach all control listeners (sliders, grain, playback, actions, resize). */
export function initControls(): void {
  gradTypeBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.gtype'));
  gradTypeBtns.forEach((btn) => {
    btn.addEventListener('click', () => selectGradType(btn.dataset.type as GradientType));
  });

  // Sliders that update a value label and the CSS snapshot.
  SLIDER_IDS.forEach((id) => {
    const input = byId<HTMLInputElement>(id);
    const label = byId<HTMLSpanElement>(`${id}-v`);
    input.addEventListener('input', () => {
      label.textContent = input.value;
      updateCSS();
      requestDraw();
    });
  });

  // Colour-mix grain displaces the gradient itself (per-frame in the loop), so
  // it just needs a redraw to show up while paused.
  (['grain-mix', 'grain-mix-scale', 'grain-sharpness'] as const).forEach((id) => {
    const input = byId<HTMLInputElement>(id);
    const label = byId(`${id}-v`);
    input.addEventListener('input', () => {
      label.textContent = input.value;
      drawGradient();
    });
  });

  dom.playBtn.addEventListener('click', () => setPlaying(!state.playing));

  dom.randBtn.addEventListener('click', () => {
    state.stops = [...PALETTES[Math.floor(Math.random() * PALETTES.length)]];
    renderStops();
    updateCSS();
    drawGradient();
  });

  window.addEventListener('resize', () => {
    resize();
    drawGradient();
  });
}
