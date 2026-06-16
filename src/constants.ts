/** Render the gradient at 35% resolution, then upscale — fast and still smooth. */
export const OFF_SCALE = 0.35;

/** Sliders that share the same wiring: update their value label + the CSS snapshot. */
export const SLIDER_IDS = [
  'speed',
  'blobsize',
  'swirl',
  'stretch',
  'zoom',
  'offx',
  'offy',
  'blur',
] as const;

/** Preset palettes cycled through by the Randomize button. */
export const PALETTES: string[][] = [
  ['#dc5247', '#ff8f66', '#f2703f', '#6d3ef0'],
  ['#ff3a3a', '#ff6b35', '#ff1f7a', '#ff4d6d', '#e8274b'],
  ['#7c3aed', '#4f46e5', '#ec4899', '#f9a8d4', '#a78bfa'],
  ['#0ea5e9', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
  ['#f97316', '#ef4444', '#fbbf24', '#84cc16'],
  ['#14b8a6', '#0ea5e9', '#6366f1', '#818cf8'],
  ['#fb7185', '#f43f5e', '#c026d3', '#7c3aed'],
  ['#22d3ee', '#818cf8', '#c084fc', '#f472b6', '#ffffff'],
];
