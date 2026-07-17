import type { GradientType } from './types';
import { BRAND_RAMPS } from './brandColors';

export type PresetVariant = 'base' | 'dark' | 'light';
type NonMesh = Exclude<GradientType, 'mesh'>;

const K = '#0a0a0b';
const W = '#ffffff';

const ramp = (name: string): string[] => BRAND_RAMPS.find((r) => r.name === name)!.colors;
const RED = ramp('Red');
const PINK = ramp('Pink');
const PURPLE = ramp('Purple');

/** Per-pattern stop lists for a dark/light variant (radials share one list). */
interface VariantStops {
  radial: string[];
  'wave-h': string[];
  'wave-v': string[];
}

/** Same stop list for every pattern. */
const allPatterns = (stops: string[]): VariantStops => ({
  radial: stops,
  'wave-h': stops,
  'wave-v': stops,
});

/**
 * Generated dark/light stops (approved for orange–purple; orange–pink reuses
 * the same ramp steps until its own lists arrive).
 */
const dark = (w: string[], c: string[]): VariantStops => ({
  radial: [w[1], w[2], w[2], w[3], c[6], c[8], K, K, K, K, K],
  'wave-h': [w[1], w[2], w[3], w[3], c[5], c[6], c[8], K, K, K, K, K],
  'wave-v': [w[2], w[2], w[3], w[3], c[5], c[6], c[8], K, K, K, K, K],
});
const light = (w: string[], c: string[]): VariantStops => ({
  radial: [w[1], w[2], w[3], c[5], c[3], c[0], W, W, W, W, W],
  'wave-h': [W, W, W, W, c[0], c[3], c[4], c[5], w[3], w[3], w[2], w[2]],
  'wave-v': [W, W, W, W, c[0], c[3], c[4], c[5], w[3], w[3], w[2], w[2]],
});

export interface Colorway {
  name: string;
  /** Base 6-stop preset — same list for every gradient type. */
  base: string[];
  /** Grain settings the base (two-coloured) preset applies. */
  baseGrain: Record<string, number>;
  dark: VariantStops;
  light: VariantStops;
  /** Per-variant, per-type slider overrides applied on top of VARIANT_TYPE_SETTINGS. */
  overrides?: Partial<Record<'dark' | 'light', Partial<Record<NonMesh, Record<string, number>>>>>;
}

/** Base-preset grain flavours. */
const GRAIN_75 = { 'grain-mix': 75, 'grain-mix-scale': 1, 'grain-sharpness': 4.5 };
const GRAIN_100 = { 'grain-mix': 100, 'grain-mix-scale': 1, 'grain-sharpness': 5 };

/** Dark radials of these colourways sit centred: no crop offsets. */
const centredDarkRadials = {
  dark: {
    'radial-v': { offy: 0 },
    'radial-h': { offx: 0 },
  },
} as const;

/** Preset rows: each colourway renders as [base, dark, light] chips. */
export const COLORWAYS: Colorway[] = [
  {
    name: 'Orange–Purple',
    base: ['#ffa186', '#ff8062', '#ff5127', '#702de6', '#895ffa', '#9f83fb'],
    baseGrain: GRAIN_75,
    dark: dark(RED, PURPLE),
    light: light(RED, PURPLE),
  },
  {
    name: 'Blue–Pink',
    base: ['#70b0ff', '#4697ff', '#0079fa', '#eb1478', '#fa5997', '#f77dac'],
    baseGrain: GRAIN_75,
    dark: allPatterns(['#ffaacd', '#f77dac', '#fa5997', '#eb1478', '#dd1dd7', '#004ea8', '#002c61', K, K, K, K, K]),
    light: {
      radial: ['#ffaacd', '#fa5997', '#bb015d', '#dd1dd7', '#4697ff', '#70b0ff', '#c8dfff', W, W, W, W, W],
      'wave-h': [W, W, W, W, W, '#c8dfff', '#70b0ff', '#4697ff', '#dd1dd7', '#bb015d', '#fa5997', '#ffaacd'],
      'wave-v': [W, W, W, W, W, '#c8dfff', '#70b0ff', '#4697ff', '#dd1dd7', '#bb015d', '#fa5997', '#ffaacd'],
    },
  },
  {
    name: 'Orange–Pink',
    base: ['#ff8062', '#ff8062', '#ff5127', '#eb1478', '#f77dac', '#ffaacd'],
    baseGrain: GRAIN_100,
    dark: dark(RED, PINK),
    light: light(RED, PINK),
  },
  {
    name: 'Purple–Blue',
    base: ['#9f83fb', '#702de6', '#5d0dc9', '#005fd4', '#0079fa', '#4697ff'],
    baseGrain: GRAIN_100,
    dark: {
      radial: ['#9f83fb', '#895ffa', '#702de6', '#5d0dc9', '#004ea8', '#002c61', K, K, K, K, K, K],
      'wave-h': ['#af9dff', '#9f83fb', '#895ffa', '#702de6', '#005fd4', '#004ea8', '#002c61', K, K, K, K, K],
      'wave-v': ['#af9dff', '#9f83fb', '#895ffa', '#702de6', '#005fd4', '#004ea8', '#002c61', K, K, K, K, K],
    },
    light: {
      radial: ['#70b0ff', '#4697ff', '#0079fa', '#005fd4', '#702de6', '#895ffa', '#c1b6fd', '#dcd8fd', W, W, W, W],
      'wave-h': [W, W, W, W, '#dcd8fd', '#c1b6fd', '#895ffa', '#702de6', '#005fd4', '#0079fa', '#4697ff', '#70b0ff'],
      'wave-v': [W, W, W, W, '#dcd8fd', '#c1b6fd', '#895ffa', '#702de6', '#005fd4', '#0079fa', '#4697ff', '#70b0ff'],
    },
    overrides: centredDarkRadials,
  },
  {
    name: 'Purple–Pink',
    base: ['#af9dff', '#9f83fb', '#895ffa', '#eb1478', '#fa5997', '#ffaacd'],
    baseGrain: GRAIN_75,
    dark: {
      radial: ['#f77dac', '#fa5997', '#eb1478', '#5d0dc9', '#2e1f5c', K, K, K, K, K],
      'wave-h': ['#f77dac', '#fa5997', '#eb1478', '#702de6', '#5d0dc9', '#2e1f5c', K, K, K, K, K],
      'wave-v': ['#f77dac', '#fa5997', '#eb1478', '#702de6', '#5d0dc9', '#2e1f5c', K, K, K, K, K],
    },
    light: {
      radial: ['#fa5997', '#fa5997', '#eb1478', '#bb015d', '#702de6', '#9f83fb', '#c1b6fd', '#dcd8fd', W, W, W, W],
      'wave-h': [W, W, W, W, '#dcd8fd', '#c1b6fd', '#9f83fb', '#702de6', '#bb015d', '#eb1478', '#fa5997', '#fa5997'],
      'wave-v': [W, W, W, W, '#dcd8fd', '#c1b6fd', '#9f83fb', '#702de6', '#bb015d', '#eb1478', '#fa5997', '#fa5997'],
    },
    overrides: centredDarkRadials,
  },
];

/** Resolve a colourway variant to the stop list for the given gradient type. */
export const variantStops = (cw: Colorway, v: PresetVariant, type: GradientType): string[] =>
  v === 'base' ? cw.base : cw[v][type === 'wave-h' ? 'wave-h' : type === 'wave-v' ? 'wave-v' : 'radial'];

/**
 * Slider values applied when a dark/light variant preset is active, per
 * variant and gradient type (from the approved variant-preset shots). All
 * variants use grain mix 50 / sharpness 3.5; base presets leave the type's
 * own defaults untouched.
 */
export const VARIANT_TYPE_SETTINGS: Record<'dark' | 'light', Record<NonMesh, Record<string, number>>> = {
  dark: {
    'radial-h': { speed: 3, blobsize: 10, stretch: 0, zoom: 136, offx: 42, offy: 0, blur: 10, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
    'radial-v': { speed: 3, blobsize: 10, stretch: 8, zoom: 138, offx: 0, offy: -75, blur: 10, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
    'wave-h': { speed: 3, blobsize: 4, stretch: 8, zoom: 100, offx: 0, offy: 0, blur: 35, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
    'wave-v': { speed: 3, blobsize: 14, stretch: 23, zoom: 128, offx: -35, offy: -43, blur: 35, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
  },
  light: {
    'radial-h': { speed: 3, blobsize: 10, stretch: 10, zoom: 136, offx: -65, offy: 0, blur: 40, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
    'radial-v': { speed: 3, blobsize: 10, stretch: 20, zoom: 138, offx: 0, offy: 45, blur: 40, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
    'wave-h': { speed: 3, blobsize: 4, stretch: 8, zoom: 100, offx: 0, offy: 0, blur: 35, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
    'wave-v': { speed: 3, blobsize: 14, stretch: 23, zoom: 128, offx: -35, offy: -43, blur: 35, 'grain-mix': 50, 'grain-mix-scale': 1, 'grain-sharpness': 3.5 },
  },
};

/** Original 5-colour presets, kept for the Mesh-Swirl gradient. */
export const PRESETS_SWIRL: string[][] = [
  ['#c10800', '#f12200', '#ff8062', '#f77dac', '#eb1478'],
  ['#702de6', '#753fe7', '#9f83fb', '#9ec7fe', '#4697ff'],
  ['#f12200', '#ff5127', '#ffa186', '#702de6', '#9f83fb'],
  ['#702de6', '#753fe7', '#9f83fb', '#f77dac', '#eb1478'],
  ['#005fd4', '#4697ff', '#9ec7fe', '#fa5997', '#eb1478'],
];
