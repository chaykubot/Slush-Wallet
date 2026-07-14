import type { GradientType } from './types';

/** Default colour stops — the tool's stock orange→purple palette. */
export const DEFAULT_STOPS = ['#ffa186', '#ff8062', '#ff5127', '#702de6', '#895ffa', '#9f83fb'];

/** Single source of mutable runtime state, shared across render + UI modules. */
export const state = {
  stops: [...DEFAULT_STOPS] as string[],
  gradType: 'radial-h' as GradientType,
  /** Animation is opt-in: the tool boots paused and renders a static frame. */
  playing: false,
  /** Animation clock, advanced every frame by the loop. */
  t: 0,
  /** Main canvas dimensions in CSS pixels. */
  W: 0,
  H: 0,
  /** Handle for the active requestAnimationFrame, so it can be cancelled on pause. */
  raf: 0,
};
