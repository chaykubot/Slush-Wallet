import { dom } from './dom';

/** Visible canvases. */
export const ctx = dom.gc.getContext('2d')!;
export const gCtx = dom.grain.getContext('2d')!;

/** Offscreen low-res buffer the gradient is rendered into before upscaling. */
export const offC = document.createElement('canvas');
export const offCtx = offC.getContext('2d')!;

/** Destination buffer for the swirl displacement pass. */
export const dstC = document.createElement('canvas');
export const dstCtx = dstC.getContext('2d')!;

/** 256x1 lookup table used to sample the colour ramp for wave gradients. */
export const lutC = document.createElement('canvas');
lutC.width = 256;
lutC.height = 1;
export const lutCtx = lutC.getContext('2d', { willReadFrequently: true })!;
