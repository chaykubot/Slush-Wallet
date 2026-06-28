import { byId } from '../dom';
import { state } from '../state';
import { PRESETS, PRESETS_SWIRL } from '../presets';
import { renderStops } from './stops';
import { updateCSS } from './cssSnapshot';

/** Swirl keeps the original 5-colour presets; every other type uses 6-colour ones. */
function activePresets(): string[][] {
  return state.gradType === 'mesh' ? PRESETS_SWIRL : PRESETS;
}

/** (Re)build the preset chips for the current gradient type. */
export function renderPresets(): void {
  const root = byId<HTMLDivElement>('presets');
  root.innerHTML = '';
  activePresets().forEach((preset) => {
    const chip = document.createElement('button');
    chip.className = 'preset';
    // Two-colour flat split preview: skip the darkest/lightest ends.
    const a = preset[1];
    const b = preset[preset.length - 2];
    chip.style.background = `linear-gradient(90deg, ${a} 0 50%, ${b} 50% 100%)`;
    chip.title = preset.join(' · ');
    chip.addEventListener('click', () => {
      state.stops = [...preset];
      renderStops();
      updateCSS();
    });
    root.appendChild(chip);
  });
}

export function initPresets(): void {
  renderPresets();
}
