// Cross-platform controls so GlassRealm plays the same on glasses, phone, and PC.
//   - Glasses: EMG/captouch arrive as arrow keys (handled in input.js) — untouched here.
//   - PC: keyboard (input.js) + mouse drag-to-move / click-to-interact on the canvas.
//   - Phone: swipe-to-move / tap-to-interact on the canvas + an optional on-screen pad.
// Everything funnels into the same semantic actions (up/down/left/right/tap/menu),
// so the rest of the game is input-source agnostic.

const TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const UIKEY = 'glassrealm.touchUI.v1';

export function createControls({ app, canvas, input, notify }) {
  const note = notify || (() => {});
  // ---- responsive: scale the 600x600 logical app to fit any viewport, centred ----
  function fit() {
    if (!window.innerWidth || !window.innerHeight) return;   // ignore transient 0-size resizes (would blank the view)
    const s = Math.min(window.innerWidth / 600, window.innerHeight / 600);
    app.style.transform = `scale(${s})`;
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  // ---- Bluetooth / USB gamepad (PC + phone) via the Gamepad API ----
  // Funnels into the same semantic actions as keyboard/touch, so it works everywhere:
  // left stick + d-pad = move (held) & navigate menus; A = action/select, X = quick
  // attack, B / Start / Back = open menu / back. Set up before the glasses early-return
  // so a paired controller works on any platform (no-op when none is connected).
  (function initGamepad() {
    const DZ = 0.5, DIRS = ['up', 'down', 'left', 'right'];
    const held = { up: false, down: false, left: false, right: false };
    const nextRep = { up: 0, down: 0, left: 0, right: 0 };
    let prev = [], raf = 0;
    function applyPad(gp, now) {
      const b = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      const want = { up: ay < -DZ || b(12), down: ay > DZ || b(13), left: ax < -DZ || b(14), right: ax > DZ || b(15) };
      for (const d of DIRS) {
        input.setHeld(d, want[d]);                                  // continuous movement (survives blur/clearHeld)
        if (want[d]) {                                              // discrete press + hold-repeat for menu/dialogue/picker nav
          if (!held[d]) { input.emit(d); held[d] = true; nextRep[d] = now + 350; }
          else if (now >= nextRep[d]) { input.emit(d); nextRep[d] = now + 150; }
        } else held[d] = false;
      }
      const edge = (i) => b(i) && !prev[i];                          // buttons fire once per press
      if (edge(0)) input.emit('tap');                               // A — interact / attack / select
      if (edge(2)) input.emit('doubletap');                         // X — quick attack
      if (edge(1) || edge(8) || edge(9)) input.emit('menu');        // B / Back / Start — open menu / back
      prev = gp.buttons.map((x) => !!(x && x.pressed));
    }
    function activePad() { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of pads) if (p && p.connected) return p; return null; }
    function poll() {
      const gp = activePad();
      if (!gp) { for (const d of DIRS) { input.setHeld(d, false); held[d] = false; } raf = 0; return; }   // none → release + stop
      applyPad(gp, performance.now());
      raf = requestAnimationFrame(poll);
    }
    function start() { if (!raf) raf = requestAnimationFrame(poll); }
    window.addEventListener('gamepadconnected', () => { note('🎮 Controller connected'); start(); });
    window.addEventListener('gamepaddisconnected', () => { for (const d of DIRS) { input.setHeld(d, false); held[d] = false; } note('Controller disconnected'); });
    if (activePad()) start();   // a pad already present at load
    if (typeof window !== 'undefined') window.__grpad = { applyPad, held, start };   // test hook
  })();

  // Glasses deliver input as arrow keys with no pointer — skip all touch/mouse
  // wiring there so on-device behaviour is exactly as before (only fit() applies).
  const hasPointer = (window.matchMedia && (matchMedia('(pointer: coarse)').matches || matchMedia('(pointer: fine)').matches));
  if (!hasPointer) return { fit, isTouch: false };

  // ---- canvas swipe / tap (works for finger swipes AND mouse drags) ----
  let sx = 0, sy = 0, down = false, moved = false;
  const TH = 26;                                  // px before a drag counts as a swipe
  canvas.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; down = true; moved = false; });
  canvas.addEventListener('pointermove', (e) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > TH) moved = true; });
  const endSwipe = (e) => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy, ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < TH && ay < TH) { input.emit('tap'); return; }
    if (ax > ay) input.emit(dx > 0 ? 'right' : 'left');
    else input.emit(dy > 0 ? 'down' : 'up');
  };
  canvas.addEventListener('pointerup', endSwipe);
  canvas.addEventListener('pointercancel', () => { down = false; });

  // ---- on-screen d-pad + action/menu buttons (phone-friendly, also clickable on PC) ----
  const pad = document.createElement('div');
  pad.id = 'touchPad';
  pad.innerHTML =
    '<div id="dpad">' +
      '<button class="tcbtn d-up" data-dir="up" aria-label="up">▲</button>' +
      '<button class="tcbtn d-left" data-dir="left" aria-label="left">◀</button>' +
      '<button class="tcbtn d-right" data-dir="right" aria-label="right">▶</button>' +
      '<button class="tcbtn d-down" data-dir="down" aria-label="down">▼</button>' +
    '</div>' +
    '<div id="actpad">' +
      '<button class="tcbtn act-menu" data-act="menu" aria-label="menu">☰</button>' +
      '<button class="tcbtn act-tap" data-act="tap" aria-label="action">TAP</button>' +
    '</div>';
  app.appendChild(pad);

  // d-pad: press-and-hold to keep walking; emit once on press for the "coast" + menu nav
  pad.querySelectorAll('[data-dir]').forEach((b) => {
    const dir = b.dataset.dir;
    const press = (e) => { e.preventDefault(); input.emit(dir); input.setHeld(dir, true); b.classList.add('on'); };
    const release = (e) => { e.preventDefault(); input.setHeld(dir, false); b.classList.remove('on'); };
    b.addEventListener('pointerdown', press);
    b.addEventListener('pointerup', release);
    b.addEventListener('pointerleave', release);
    b.addEventListener('pointercancel', release);
  });
  pad.querySelectorAll('[data-act]').forEach((b) => {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.classList.add('on'); input.emit(b.dataset.act); });
    const off = () => b.classList.remove('on');
    b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  });

  // ---- visibility toggle (defaults on for touch devices, off for keyboard/mouse) ----
  let on;
  try { const v = localStorage.getItem(UIKEY); on = v === null ? TOUCH : v === '1'; } catch (e) { on = TOUCH; }
  const toggle = document.createElement('button');
  toggle.id = 'tcToggle'; toggle.textContent = '🎮'; toggle.title = 'Toggle touch controls';
  app.appendChild(toggle);
  function apply() { pad.classList.toggle('hidden', !on); toggle.classList.toggle('dim', !on); document.body.classList.toggle('controls-on', on); }
  toggle.addEventListener('pointerdown', (e) => { e.preventDefault(); on = !on; try { localStorage.setItem(UIKEY, on ? '1' : '0'); } catch (e2) {} apply(); });
  apply();

  return { fit, isTouch: TOUCH };
}
