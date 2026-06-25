import type { GradientType } from './types';

/** Single source of mutable runtime state, shared across render + UI modules. */
export const state = {
  stops: ['#f12200', '#ff5127', '#ffa186', '#702de6', '#895ffa', '#9f83fb'] as string[],
  gradType: 'radial-h' as GradientType,
  playing: true,
  grainOn: true,
  /** Animation clock, advanced every frame by the loop. */
  t: 0,
  /** Main canvas dimensions in CSS pixels. */
  W: 0,
  H: 0,
  /** Handle for the active requestAnimationFrame, so it can be cancelled on pause. */
  raf: 0,
};
