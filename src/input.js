// Input — maps the glasses' EMG/captouch (delivered as arrow keys + Enter) into
// semantic actions. We expose BOTH a held-key set (for continuous world movement)
// and discrete action events, plus a world-only double-tap attack shortcut.
//
// Robust to however the band delivers a swipe: held key, key-repeat, or a single
// momentary press all work — the player controller adds a short "coast" on each
// discrete press so a single swipe still produces meaningful movement.

const TAP_GAP = 240; // ms window for a double-tap

export function createInput(target = window) {
  const keys = new Set();
  const handlers = [];
  let lastTapAt = -1;

  const emit = (action) => { for (const h of handlers) h(action); };

  // Fire 'tap' immediately so on-device interactions feel instant (no disambiguation
  // wait — double-tap doesn't register on the band anyway). A quick second press
  // additionally emits 'doubletap' as a desktop-only convenience.
  function resolveTap() {
    const now = performance.now();
    const previous = lastTapAt;
    lastTapAt = now;
    emit('tap');
    // Opening/closing an overlay during tap cancels its trailing doubletap.
    if (lastTapAt === now && previous >= 0 && now - previous < TAP_GAP) { lastTapAt = -1; emit('doubletap'); }
  }

  function onKeyDown(e) {
    const k = e.key;
    switch (k) {
      case 'ArrowUp': case 'w': case 'W':
        keys.add('up'); e.preventDefault(); emit('up'); break;
      case 'ArrowDown': case 's': case 'S':
        keys.add('down'); e.preventDefault(); emit('down'); break;
      case 'ArrowLeft': case 'a': case 'A':
        keys.add('left'); e.preventDefault(); emit('left'); break;
      case 'ArrowRight': case 'd': case 'D':
        keys.add('right'); e.preventDefault(); emit('right'); break;
      case 'Enter': case ' ':
        e.preventDefault();
        if (e.repeat) break;
        resolveTap();
        break;
      case 'Escape':
        // Keyboard back/exit — closes any open overlay (menu/dialogue/picker).
        e.preventDefault();
        if (e.repeat) break;
        emit('back');
        break;
      case 'Tab':
        // Keyboard: open/close the menu (mirrors the on-screen ☰ button).
        e.preventDefault();
        if (e.repeat) break;
        emit('menu');
        break;
    }
  }

  function onKeyUp(e) {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': keys.delete('up'); break;
      case 'ArrowDown': case 's': case 'S': keys.delete('down'); break;
      case 'ArrowLeft': case 'a': case 'A': keys.delete('left'); break;
      case 'ArrowRight': case 'd': case 'D': keys.delete('right'); break;
    }
  }

  // Held-direction control for on-screen / touch d-pads (press-and-hold to walk).
  function setHeld(dir, on) { if (on) keys.add(dir); else keys.delete(dir); }

  // If focus is lost (e.g. app backgrounded) drop held keys so the player doesn't
  // walk forever.
  function clearHeld() { keys.clear(); }

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', clearHeld);

  return {
    keys,
    on(cb) { handlers.push(cb); return () => { const i = handlers.indexOf(cb); if (i >= 0) handlers.splice(i, 1); }; },
    emit, // drive a semantic action directly (used by tests / alt input sources)
    setHeld,
    clearHeld,
    resetTap() { lastTapAt = -1; },
    destroy() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
    },
  };
}
