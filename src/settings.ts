import { dom } from './dom';

/**
 * The sliders display logical, 0-based values; these map them to the actual
 * functional values the renderer uses. Defaults are chosen so the mapped values
 * match the look that the old (absolute) sliders produced.
 *
 *   blob size  UI 0..25 (mesh 0..40)  ->  50..75 (mesh 50..90)
 *   swirl      UI 0..40               ->  40..80
 *   softness   UI 0..60               ->  20..80 px
 *   stretch    UI 0..30               ->  120..160 %
 */
export const blobSizeActual = (): number => +dom.blobsize.value + 50;
export const swirlActual = (): number => +dom.swirl.value + 40;
export const softnessActual = (): number => +dom.blur.value + 20;
export const stretchActual = (): number => 120 + +dom.stretch.value * (40 / 30);
