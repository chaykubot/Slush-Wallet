import { dom } from './dom';

/** Visible canvas. */
export const ctx = dom.gc.getContext('2d')!;

/** Offscreen low-res buffer the gradient is rendered into before upscaling. */
export const offC = document.createElement('canvas');
export const offCtx = offC.getContext('2d')!;

/** Destination buffer for the swirl displacement pass. */
export const dstC = document.createElement('canvas');
export const dstCtx = dstC.getContext('2d')!;

/**
 * Full-resolution buffer for the colour-mix grain pass. The gradient is blitted
 * here (already upscaled + blurred), then dithered at display resolution so the
 * grain stays crisp, before being copied to the visible canvas. willReadFrequently
 * because it's read back every frame. */
export const mixC = document.createElement('canvas');
export const mixCtx = mixC.getContext('2d', { willReadFrequently: true })!;

/** 256x1 lookup table used to sample the colour ramp for wave gradients. */
export const lutC = document.createElement('canvas');
lutC.width = 256;
lutC.height = 1;
export const lutCtx = lutC.getContext('2d', { willReadFrequently: true })!;
