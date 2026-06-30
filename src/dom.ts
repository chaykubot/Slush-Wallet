/** Typed `getElementById` that throws if the element is missing. */
export function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

/** Cached references to every element the app interacts with. */
export const dom = {
  gc: byId<HTMLCanvasElement>('gc'),
  stopsList: byId<HTMLDivElement>('stops-list'),
  addStop: byId<HTMLButtonElement>('add-stop'),
  swirlSec: byId<HTMLDivElement>('swirl-sec'),
  stretchSec: byId<HTMLDivElement>('stretch-sec'),
  blobsizeLabel: byId<HTMLDivElement>('blobsize-label'),
  cssOut: byId<HTMLDivElement>('css-out'),
  playBtn: byId<HTMLButtonElement>('play-btn'),
  randBtn: byId<HTMLButtonElement>('rand-btn'),
  dlBtn: byId<HTMLButtonElement>('dl-btn'),
  grainMix: byId<HTMLInputElement>('grain-mix'),
  grainMixScale: byId<HTMLInputElement>('grain-mix-scale'),
  grainSharpness: byId<HTMLInputElement>('grain-sharpness'),
  speed: byId<HTMLInputElement>('speed'),
  blobsize: byId<HTMLInputElement>('blobsize'),
  swirl: byId<HTMLInputElement>('swirl'),
  stretch: byId<HTMLInputElement>('stretch'),
  zoom: byId<HTMLInputElement>('zoom'),
  offx: byId<HTMLInputElement>('offx'),
  offy: byId<HTMLInputElement>('offy'),
  blur: byId<HTMLInputElement>('blur'),
};
