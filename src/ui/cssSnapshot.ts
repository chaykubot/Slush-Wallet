import { dom } from '../dom';
import { state } from '../state';

/** Regenerate the CSS snapshot text for the current gradient type + stops. */
export function updateCSS(): void {
  const sc = +dom.blobsize.value;
  const { gradType, stops } = state;
  let css: string;

  if (gradType === 'mesh') {
    const parts = stops.map((c, i) => {
      const x = Math.round(5 + (i * 90) / Math.max(stops.length - 1, 1));
      const y = i % 2 === 0 ? 30 : 70;
      return `radial-gradient(ellipse ${sc}% ${sc}% at ${x}% ${y}%, ${c} 0%, transparent 70%)`;
    });
    css = `background:\n  ${parts.join(',\n  ')};`;
  } else if (gradType === 'wave-h' || gradType === 'wave-v') {
    const horizontal = gradType === 'wave-h';
    css = `background: linear-gradient(${horizontal ? '180deg' : '90deg'}, ${stops.join(', ')});\n`
      + `/* S-curve wave is canvas-only — download PNG for the exact pattern */`;
  } else {
    const horizontal = gradType === 'radial-h';
    const at = horizontal ? '0% 50%' : '50% 100%';
    css = `background: radial-gradient(circle ${sc + 60}% at ${at}, ${stops.join(', ')});`;
  }

  dom.cssOut.textContent = css;
}

/** Wire the click-to-copy behaviour on the CSS snapshot block. */
export function initCssSnapshot(): void {
  dom.cssOut.addEventListener('click', () => {
    navigator.clipboard.writeText(dom.cssOut.textContent ?? '').then(() => {
      dom.cssOut.classList.add('copied');
      dom.cssOut.textContent = '✓ copied!';
      setTimeout(() => {
        dom.cssOut.classList.remove('copied');
        updateCSS();
      }, 1400);
    });
  });
}
