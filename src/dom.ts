/** Typed `getElementById` that throws if the element is missing. */
export function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

/** Cached references to every element the app interacts with. */
export const dom = {
  gc: byId<HTMLCanvasElement>('gc'),
  grain: byId<HTMLCanvasElement>('grain'),
  stopsList: byId<HTMLDivElement>('stops-list'),
  addStop: byId<HTMLButtonElement>('add-stop'),
  gradType: byId<HTMLSelectElement>('grad-type'),
  swirlSec: byId<HTMLDivElement>('swirl-sec'),
  stretchSec: byId<HTMLDivElement>('stretch-sec'),
  blobsizeLabel: byId<HTMLDivElement>('blobsize-label'),
  cssOut: byId<HTMLDivElement>('css-out'),
  playBtn: byId<HTMLButtonElement>('play-btn'),
  randBtn: byId<HTMLButtonElement>('rand-btn'),
  dlBtn: byId<HTMLButtonElement>('dl-btn'),
  grainToggle: byId<HTMLButtonElement>('grain-toggle'),
  modeMono: byId<HTMLButtonElement>('mode-mono'),
  modeColor: byId<HTMLButtonElement>('mode-color'),
  grainAmt: byId<HTMLInputElement>('grain-amt'),
  grainSize: byId<HTMLInputElement>('grain-size'),
  speed: byId<HTMLInputElement>('speed'),
  blobsize: byId<HTMLInputElement>('blobsize'),
  swirl: byId<HTMLInputElement>('swirl'),
  stretch: byId<HTMLInputElement>('stretch'),
  zoom: byId<HTMLInputElement>('zoom'),
  offx: byId<HTMLInputElement>('offx'),
  offy: byId<HTMLInputElement>('offy'),
  blur: byId<HTMLInputElement>('blur'),
};
