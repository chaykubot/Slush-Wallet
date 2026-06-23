import { dom } from '../dom';
import { state } from '../state';
import { MAX_STOPS, MIN_STOPS } from '../constants';
import { randomHex } from '../utils/color';
import { makeGrain } from '../render/grain';
import { updateCSS } from './cssSnapshot';

/** Index of the row currently being dragged, or null when not dragging. */
let dragIndex: number | null = null;

/** Move a stop from one position to another, then refresh everything. */
function moveStop(from: number, to: number): void {
  if (from === to) return;
  const [c] = state.stops.splice(from, 1);
  state.stops.splice(to, 0, c);
  renderStops();
  updateCSS();
  makeGrain();
}

/** Rebuild the colour-stop editor rows from state. */
export function renderStops(): void {
  dom.stopsList.innerHTML = '';
  state.stops.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'stop-row';

    // Drag handle — only the grip arms the row for reordering, so the inputs
    // stay clickable/selectable.
    const grip = document.createElement('button');
    grip.className = 'stop-drag';
    grip.innerHTML = '⠿';
    grip.title = 'Drag to reorder';
    grip.addEventListener('mousedown', () => { row.draggable = true; });
    grip.addEventListener('mouseup', () => { row.draggable = false; });

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = c;

    const hex = document.createElement('input');
    hex.className = 'stop-hex';
    hex.value = c.toUpperCase();

    const del = document.createElement('button');
    del.className = 'stop-del';
    del.innerHTML = '×';
    del.disabled = state.stops.length <= MIN_STOPS;

    picker.addEventListener('input', (e) => {
      const v = (e.target as HTMLInputElement).value;
      state.stops[i] = v;
      hex.value = v.toUpperCase();
      updateCSS();
      makeGrain();
    });
    hex.addEventListener('input', (e) => {
      const v = (e.target as HTMLInputElement).value.trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        state.stops[i] = v;
        picker.value = v;
        updateCSS();
        makeGrain();
      }
    });
    del.addEventListener('click', () => {
      if (state.stops.length <= MIN_STOPS) return;
      state.stops.splice(i, 1);
      renderStops();
      updateCSS();
      makeGrain();
    });

    row.addEventListener('dragstart', (e) => {
      dragIndex = i;
      row.classList.add('dragging');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      row.draggable = false;
      row.classList.remove('dragging');
      dragIndex = null;
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragIndex !== null) moveStop(dragIndex, i);
    });

    row.append(grip, picker, hex, del);
    dom.stopsList.appendChild(row);
  });

  dom.addStop.disabled = state.stops.length >= MAX_STOPS;
}

/** Wire the "add stop" button. */
export function initStops(): void {
  dom.addStop.addEventListener('click', () => {
    if (state.stops.length >= MAX_STOPS) return;
    state.stops.push(randomHex());
    renderStops();
    updateCSS();
    makeGrain();
  });
}
