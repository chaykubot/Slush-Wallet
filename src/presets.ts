import type { GradientType } from './types';

/**
 * Pattern presets: pre-configured gradient structures (type + direction +
 * framing), always applied with the default colour palette. The diagonals work
 * by zooming into a corner of the radial buffer so the emitter sits in a corner
 * of the view and the bands run diagonally.
 */
export interface PatternPreset {
  name: string;
  type: GradientType;
  /** CSS background for the picker chip (direction cue only). */
  css: string;
  /** Slider values (UI scale) applied with the pattern. */
  sliders: Record<string, number>;
}

export const PATTERNS: PatternPreset[] = [
  {
    name: 'Diagonal · from bottom-left',
    type: 'radial-v',
    css: 'linear-gradient(45deg, #ff8062, #702de6)',
    sliders: { speed: 3, blobsize: 10, stretch: 0, zoom: 200, offx: 100, offy: 0, blur: 10 },
  },
  {
    name: 'Vertical',
    type: 'radial-v',
    css: 'linear-gradient(0deg, #ff8062, #702de6)',
    sliders: { speed: 3, blobsize: 10, stretch: 0, zoom: 100, offx: 0, offy: 0, blur: 10 },
  },
  {
    name: 'Horizontal',
    type: 'radial-h',
    css: 'linear-gradient(90deg, #ff8062, #702de6)',
    sliders: { speed: 3, blobsize: 10, stretch: 0, zoom: 100, offx: 0, offy: 0, blur: 10 },
  },
  {
    name: 'Diagonal · from bottom-right',
    type: 'radial-v',
    css: 'linear-gradient(315deg, #ff8062, #702de6)',
    sliders: { speed: 3, blobsize: 10, stretch: 0, zoom: 200, offx: -100, offy: 0, blur: 10 },
  },
];

/** Curated Slush brand gradient presets (6 colours) for non-swirl gradient types. */
export const PRESETS: string[][] = [
  ['#ff8062', '#ff8062', '#ff5127', '#eb1478', '#f77dac', '#ffaacd'],
  ['#af9dff', '#9f83fb', '#702de6', '#0079fa', '#4697ff', '#9ec7fe'],
  ['#ffa186', '#ff8062', '#ff5127', '#702de6', '#895ffa', '#9f83fb'],
  ['#af9dff', '#9f83fb', '#895ffa', '#eb1478', '#fa5997', '#ffaacd'],
  ['#9ec7fe', '#70b0ff', '#4697ff', '#eb1478', '#fa5997', '#f77dac'],
];

/** Original 5-colour presets, kept for the Mesh-Swirl gradient. */
export const PRESETS_SWIRL: string[][] = [
  ['#c10800', '#f12200', '#ff8062', '#f77dac', '#eb1478'],
  ['#702de6', '#753fe7', '#9f83fb', '#9ec7fe', '#4697ff'],
  ['#f12200', '#ff5127', '#ffa186', '#702de6', '#9f83fb'],
  ['#702de6', '#753fe7', '#9f83fb', '#f77dac', '#eb1478'],
  ['#005fd4', '#4697ff', '#9ec7fe', '#fa5997', '#eb1478'],
];
