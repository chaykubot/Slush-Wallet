import './styles/style.css';
import { byId } from './dom';
import { SLIDER_IDS } from './constants';
import { initStops, renderStops } from './ui/stops';
import { initPresets } from './ui/presets';
import { initBrandSwatches } from './ui/brandSwatches';
import { initCssSnapshot, updateCSS } from './ui/cssSnapshot';
import { applyGradType, initControls } from './ui/controls';
import { initExportControls } from './ui/exportControls';
import { makeGrain } from './render/grain';
import { loop, resize } from './render/renderer';

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
['grain-scale', 'grain-strength', 'grain-contrast'].forEach((id) => {
  byId(`${id}-v`).textContent = byId<HTMLInputElement>(id).value;
});
applyGradType();
updateCSS();
makeGrain();
loop();
