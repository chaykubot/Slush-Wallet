import type { RGB } from '../types';

/** Parse a `#rrggbb` string into a numeric RGB triplet. */
export function hexToRgb(h: string): RGB {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
}

/** Generate a random opaque `#rrggbb` colour. */
export function randomHex(): string {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}
