import { byId } from '../dom';
import { state } from '../state';
import { PRESETS } from '../presets';
import { makeGrain } from '../render/grain';
import { renderStops } from './stops';
import { updateCSS } from './cssSnapshot';

/** Build the preset chips; clicking one loads its full set of colour stops. */
export function initPresets(): void {
  const root = byId<HTMLDivElement>('presets');
  PRESETS.forEach((preset) => {
    const chip = document.createElement('button');
    chip.className = 'preset';
    // Two-colour flat split preview: skip the darkest/lightest ends and show
    // the two vibrant tones (2nd and 2nd-to-last stops).
    const a = preset[1];
    const b = preset[preset.length - 2];
    chip.style.background = `linear-gradient(90deg, ${a} 0 50%, ${b} 50% 100%)`;
    chip.title = preset.join(' · ');
    chip.addEventListener('click', () => {
      state.stops = [...preset];
      renderStops();
      updateCSS();
      makeGrain();
    });
    root.appendChild(chip);
  });
}
