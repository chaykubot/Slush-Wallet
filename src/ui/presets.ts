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
    chip.style.background = `linear-gradient(90deg, ${preset.join(', ')})`;
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
