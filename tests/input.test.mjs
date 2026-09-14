import test from 'node:test';
import assert from 'node:assert/strict';
import { createInput } from '../src/input.js';

function fixture() {
  globalThis.window = new EventTarget();
  const target = new EventTarget(), input = createInput(target), actions = [];
  input.on(a => actions.push(a));
  const key = (name, repeat = false, type = 'keydown') => { const e = new Event(type, { cancelable: true }); e.key = name; e.repeat = repeat; target.dispatchEvent(e); };
  return { input, actions, key };
}
test('world double tap remains immediate while held confirmation cannot repeat', () => {
  const f = fixture(); f.key('Enter'); f.key('Enter', true); f.key('Enter');
  assert.deepEqual(f.actions, ['tap', 'tap', 'doubletap']); f.input.destroy();
});
test('modal transitions cancel the trailing world double tap from the same key event', () => {
  const f = fixture(); f.key('Enter');
  f.input.on(a => { if (a === 'tap') f.input.resetTap(); });
  f.key('Enter'); assert.deepEqual(f.actions, ['tap', 'tap']); f.input.destroy();
});
test('focus loss clears held movement and Escape remains an explicit single back action', () => {
  const f = fixture(); f.key('ArrowUp'); assert(f.input.keys.has('up'));
  window.dispatchEvent(new Event('blur')); assert.equal(f.input.keys.size, 0);
  f.key('Escape'); f.key('Escape', true); assert.equal(f.actions.filter(a => a === 'back').length, 1);
  f.input.destroy(); f.key('Enter'); assert(!f.actions.includes('tap'));
});
