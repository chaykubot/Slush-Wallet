import type { GradientType } from './types';

/** Single source of mutable runtime state, shared across render + UI modules. */
export const state = {
  stops: ['#c10800', '#ff5127', '#ff8062', '#702de6', '#9f83fb'] as string[],
  gradType: 'mesh' as GradientType,
  playing: true,
  grainOn: true,
  grainColor: true,
  /** Animation clock, advanced every frame by the loop. */
  t: 0,
  /** Main canvas dimensions in CSS pixels. */
  W: 0,
  H: 0,
  /** Handle for the active requestAnimationFrame, so it can be cancelled on pause. */
  raf: 0,
};
