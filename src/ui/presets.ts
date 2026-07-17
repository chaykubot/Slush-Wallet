import { byId } from '../dom';
import { state } from '../state';
import { COLORWAYS, PRESETS_SWIRL, VARIANT_TYPE_SETTINGS, variantStops, type PresetVariant } from '../presets';
import type { GradientType } from '../types';
import { drawGradient } from '../render/renderer';
import { applyTypeDefaults, setPlaying } from './controls';
import { renderStops } from './stops';
import { updateCSS } from './cssSnapshot';

/**
 * Re-apply the active preset for the current gradient type: its stop list
 * (radials and waves have different ones) and, for dark/light variants, the
 * variant's per-type slider settings. No-op on mesh or with no active preset.
 */
export function applyActivePresetForType(): void {
  const ap = state.activePreset;
  if (!ap || state.gradType === 'mesh') return;
  const cw = COLORWAYS[ap.row];
  state.stops = [...variantStops(cw, ap.variant, state.gradType)];
  if (ap.variant !== 'base') {
    applyTypeDefaults(VARIANT_TYPE_SETTINGS[ap.variant][state.gradType as Exclude<GradientType, 'mesh'>]);
  }
  renderStops();
  updateCSS();
}

function makeChip(bg: string, title: string, onClick: () => void, bordered = false): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'preset';
  b.style.background = bg;
  // The white-headed light chips need an outline to read against the sidebar.
  if (bordered) b.style.border = '1px solid rgba(10,10,11,0.13)';
  b.title = title;
  b.addEventListener('click', onClick);
  return b;
}

/** (Re)build the preset chips for the current gradient type. */
export function renderPresets(): void {
  const root = byId<HTMLDivElement>('presets');
  root.innerHTML = '';

  // Mesh keeps its original 5 single presets (no dark/light variants).
  if (state.gradType === 'mesh') {
    PRESETS_SWIRL.forEach((preset) => {
      const a = preset[1];
      const b = preset[preset.length - 2];
      root.appendChild(makeChip(`linear-gradient(90deg, ${a} 0 50%, ${b} 50% 100%)`, preset.join(' · '), () => {
        state.stops = [...preset];
        state.activePreset = null;
        renderStops();
        updateCSS();
        setPlaying(false);
        drawGradient();
      }));
    });
    return;
  }

  // One row per colourway: base | dark | light.
  COLORWAYS.forEach((cw, row) => {
    const warm = cw.base[1];
    const cool = cw.base[cw.base.length - 2];
    const variants: [PresetVariant, string, boolean][] = [
      ['base', `linear-gradient(90deg, ${warm} 0 50%, ${cool} 50% 100%)`, false],
      ['dark', `linear-gradient(90deg, #0a0a0b 0 34%, ${warm} 34% 67%, ${cool} 67% 100%)`, false],
      // Light reads white → cool → warm, matching its wave stop order.
      ['light', `linear-gradient(90deg, #ffffff 0 34%, ${cool} 34% 67%, ${warm} 67% 100%)`, true],
    ];
    variants.forEach(([variant, bg, bordered]) => {
      root.appendChild(makeChip(bg, `${cw.name} · ${variant}`, () => {
        state.activePreset = { row, variant };
        applyActivePresetForType();
        // Presets render static by default; the user can un-pause to animate.
        setPlaying(false);
        drawGradient();
      }, bordered));
    });
  });
}

export function initPresets(): void {
  renderPresets();
}
