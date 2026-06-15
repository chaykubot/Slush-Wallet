# Gradient Studio

Animated gradient generator (mesh · radial · wave) with film grain, a live CSS
snapshot, and PNG export. Refactored from a single-file prototype into a
Vite + TypeScript project — behaviour is unchanged.

## Scripts

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Structure

```
index.html              markup (IDs consumed by src/dom.ts)
src/
  main.ts               entry point + boot sequence
  state.ts              shared mutable runtime state
  dom.ts                typed element references
  canvas.ts             visible + offscreen canvas contexts
  constants.ts          OFF_SCALE, slider ids, preset palettes
  types.ts              GradientType, RGB
  styles/style.css      all styles
  utils/
    color.ts            hexToRgb, randomHex
  render/
    renderer.ts         frame orchestration, resize, animation loop
    mesh.ts             orbiting mesh blobs
    swirl.ts            swirl displacement pass
    wave.ts             S-curve wave gradient
    radial.ts           radial band gradient
    grain.ts            film-grain overlay
  ui/
    stops.ts            colour-stop editor
    cssSnapshot.ts      CSS output + click-to-copy
    controls.ts         sliders, grain, playback, actions
```
