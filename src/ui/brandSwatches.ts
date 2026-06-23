import { byId } from '../dom';
import { state } from '../state';
import { MAX_STOPS } from '../constants';
import { BRAND_RAMPS } from '../brandColors';
import { makeGrain } from '../render/grain';
import { renderStops } from './stops';
import { updateCSS } from './cssSnapshot';

/** Build the Slush brand-colour swatch grid; clicking a chip adds it as a stop. */
export function initBrandSwatches(): void {
  const root = byId<HTMLDivElement>('brand-swatches');
  BRAND_RAMPS.forEach((ramp) => {
    const row = document.createElement('div');
    row.className = 'swatch-row';
    ramp.colors.forEach((c) => {
      const chip = document.createElement('button');
      chip.className = 'swatch';
      chip.style.background = c;
      chip.title = `${ramp.name} · ${c}`;
      chip.addEventListener('click', () => {
        if (state.stops.length >= MAX_STOPS) return;
        state.stops.push(c);
        renderStops();
        updateCSS();
        makeGrain();
      });
      row.appendChild(chip);
    });
    root.appendChild(row);
  });
}
