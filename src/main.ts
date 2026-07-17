import './styles/style.css';
import { byId } from './dom';
import { SLIDER_IDS } from './constants';
import { initStops, renderStops } from './ui/stops';
import { applyActivePresetForType, initPresets } from './ui/presets';
import { initBrandSwatches } from './ui/brandSwatches';
import { initCssSnapshot, updateCSS } from './ui/cssSnapshot';
import { applyGradType, applyTypeStaticDefaults, initControls } from './ui/controls';
import { initExportControls } from './ui/exportControls';
import { drawGradient, loop, resize } from './render/renderer';
import { state } from './state';

// Attach event listeners.
initStops();
initPresets();
initBrandSwatches();
initCssSnapshot();
initControls();
initExportControls();

// Initialise — mirrors the original prototype's boot sequence.
resize();
renderStops();
// Browsers restore form values on reload without firing events — sync labels from the DOM.
SLIDER_IDS.forEach((id) => {
  byId(`${id}-v`).textContent = byId<HTMLInputElement>(id).value;
});
['grain-mix', 'grain-mix-scale', 'grain-sharpness'].forEach((id) => {
  byId(`${id}-v`).textContent = byId<HTMLInputElement>(id).value;
});
applyGradType();
// Deterministic first paint: load the boot type's static defaults (sliders +
// frozen phase), then the boot preset's own settings (e.g. base grain) on top.
applyTypeStaticDefaults();
applyActivePresetForType();
updateCSS();
// Boot paused: render a single static frame; the loop only runs if un-paused.
drawGradient();
if (state.playing) loop();
