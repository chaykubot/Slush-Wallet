import { byId } from '../dom';
import { state, DEFAULT_STOPS } from '../state';
import { PATTERNS, type PatternPreset } from '../presets';
import { applyGradType, applyTypeDefaults, setPlaying } from './controls';
import { drawGradient } from '../render/renderer';
import { renderStops } from './stops';
import { renderPresets } from './presets';
import { updateCSS } from './cssSnapshot';

/** Apply a pattern preset: default palette + its gradient type + its framing,
 * rendered as a static (paused) frame. */
function applyPattern(p: PatternPreset): void {
  state.stops = [...DEFAULT_STOPS];
  state.gradType = p.type;
  applyGradType();
  applyTypeDefaults(p.sliders);
  renderStops();
  renderPresets();
  updateCSS();
  setPlaying(false);
  drawGradient();
}

/** Build the pattern-preset chips. */
export function initPatterns(): void {
  const root = byId<HTMLDivElement>('patterns');
  PATTERNS.forEach((p) => {
    const chip = document.createElement('button');
    chip.className = 'preset';
    chip.style.background = p.css;
    chip.title = p.name;
    chip.setAttribute('aria-label', p.name);
    chip.addEventListener('click', () => applyPattern(p));
    root.appendChild(chip);
  });
}
