import type { GradientType } from './types';
import { BRAND_RAMPS } from './brandColors';

export type PresetVariant = 'base' | 'dark' | 'light';

const K = '#0a0a0b';
const W = '#ffffff';

const ramp = (name: string): string[] => BRAND_RAMPS.find((r) => r.name === name)!.colors;
const RED = ramp('Red');
const PINK = ramp('Pink');
const PURPLE = ramp('Purple');
const BLUE = ramp('Blue');

/** Per-pattern stop lists for a dark/light variant (radials share one list). */
interface VariantStops {
  radial: string[];
  'wave-h': string[];
  'wave-v': string[];
}

/**
 * Dark variant stops, generalised from the approved dark orange–purple preset:
 * warm ramp head, deep cool steps, black tail. Other colourways substitute
 * their own ramps at the same steps (e.g. Purple 600 → Pink 600).
 */
const dark = (w: string[], c: string[]): VariantStops => ({
  radial: [w[1], w[2], w[2], w[3], c[6], c[8], K, K, K, K, K],
  'wave-h': [w[1], w[2], w[3], w[3], c[5], c[6], c[8], K, K, K, K, K],
  'wave-v': [w[2], w[2], w[3], w[3], c[5], c[6], c[8], K, K, K, K, K],
});

/**
 * Light variant stops — PLACEHOLDER until the approved lists arrive: white
 * head, then the warm→cool ramp (white → warm → cool reading order).
 */
const light = (w: string[], c: string[]): VariantStops => ({
  radial: [W, W, W, W, W, w[1], w[2], w[3], c[5], c[4], c[3]],
  'wave-h': [W, W, W, W, W, w[1], w[2], w[3], w[3], c[5], c[4], c[3]],
  'wave-v': [W, W, W, W, W, w[2], w[2], w[3], w[3], c[5], c[4], c[3]],
});

export interface Colorway {
  name: string;
  /** Base 6-stop preset — same list for every gradient type. */
  base: string[];
  dark: VariantStops;
  light: VariantStops;
}

/** Preset rows: each colourway renders as [base, dark, light] chips. */
export const COLORWAYS: Colorway[] = [
  {
    name: 'Orange–Purple',
    base: ['#ffa186', '#ff8062', '#ff5127', '#702de6', '#895ffa', '#9f83fb'],
    dark: dark(RED, PURPLE),
    light: light(RED, PURPLE),
  },
  {
    name: 'Blue–Pink',
    base: ['#9ec7fe', '#70b0ff', '#4697ff', '#eb1478', '#fa5997', '#f77dac'],
    dark: dark(BLUE, PINK),
    light: light(BLUE, PINK),
  },
  {
    name: 'Orange–Pink',
    base: ['#ff8062', '#ff8062', '#ff5127', '#eb1478', '#f77dac', '#ffaacd'],
    dark: dark(RED, PINK),
    light: light(RED, PINK),
  },
  {
    name: 'Purple–Blue',
    base: ['#af9dff', '#9f83fb', '#702de6', '#0079fa', '#4697ff', '#9ec7fe'],
    dark: dark(PURPLE, BLUE),
    light: light(PURPLE, BLUE),
  },
  {
    name: 'Purple–Pink',
    base: ['#af9dff', '#9f83fb', '#895ffa', '#eb1478', '#fa5997', '#ffaacd'],
    dark: dark(PURPLE, PINK),
    light: light(PURPLE, PINK),
  },
];

/** Resolve a colourway variant to the stop list for the given gradient type. */
export const variantStops = (cw: Colorway, v: PresetVariant, type: GradientType): string[] =>
  v === 'base' ? cw.base : cw[v][type === 'wave-h' ? 'wave-h' : type === 'wave-v' ? 'wave-v' : 'radial'];

/**
 * Slider values applied when a dark/light variant preset is active, per
 * gradient type (from the approved variant-preset shots). Base presets leave
 * the type's own defaults untouched.
 */
export const VARIANT_TYPE_SETTINGS: Record<Exclude<GradientType, 'mesh'>, Record<string, number>> = {
  'radial-h': { speed: 3, blobsize: 10, stretch: 0, zoom: 136, offx: 42, offy: 0, blur: 10, 'grain-mix': 100, 'grain-mix-scale': 1, 'grain-sharpness': 2 },
  'radial-v': { speed: 3, blobsize: 10, stretch: 8, zoom: 138, offx: 0, offy: -75, blur: 10, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 5 },
  'wave-h': { speed: 3, blobsize: 4, stretch: 8, zoom: 100, offx: 0, offy: 0, blur: 52, 'grain-mix': 62, 'grain-mix-scale': 1, 'grain-sharpness': 2 },
  'wave-v': { speed: 3, blobsize: 14, stretch: 23, zoom: 128, offx: 38, offy: -43, blur: 25, 'grain-mix': 56, 'grain-mix-scale': 1, 'grain-sharpness': 4 },
};

/** Original 5-colour presets, kept for the Mesh-Swirl gradient. */
export const PRESETS_SWIRL: string[][] = [
  ['#c10800', '#f12200', '#ff8062', '#f77dac', '#eb1478'],
  ['#702de6', '#753fe7', '#9f83fb', '#9ec7fe', '#4697ff'],
  ['#f12200', '#ff5127', '#ffa186', '#702de6', '#9f83fb'],
  ['#702de6', '#753fe7', '#9f83fb', '#f77dac', '#eb1478'],
  ['#005fd4', '#4697ff', '#9ec7fe', '#fa5997', '#eb1478'],
];
