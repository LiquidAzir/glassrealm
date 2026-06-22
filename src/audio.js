// Tiny self-contained sound engine — synthesised SFX via Web Audio (no files,
// no network). Browsers need a user gesture before audio starts, so call resume()
// from the first input. All effects are short tone+envelope blips kept quiet.
export function createAudio(muted = false) {
  let ctx = null;
  const state = { muted };
  function ensure() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } } return ctx; }
  function resume() { const c = ensure(); if (c && c.state === 'suspended') c.resume().catch(() => {}); }

  function blip(freq, dur, type = 'sine', vol = 0.12, glideTo) {
    if (state.muted) return;
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  const SFX = {
    hit:    () => blip(220, 0.10, 'square', 0.08, 140),
    kill:   () => { blip(320, 0.12, 'triangle', 0.11, 180); setTimeout(() => blip(180, 0.16, 'sawtooth', 0.09, 90), 70); },
    hurt:   () => blip(160, 0.14, 'sawtooth', 0.10, 80),
    pickup: () => blip(680, 0.07, 'sine', 0.07, 880),
    ui:     () => blip(520, 0.05, 'sine', 0.05),
    level:  () => { [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.14, 'triangle', 0.1), i * 90)); },
    ach:    () => { [659, 784, 988, 1175].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'triangle', 0.1), i * 100)); },
    cast:   () => blip(440, 0.16, 'sine', 0.08, 760),
  };

  return {
    get muted() { return state.muted; },
    resume,
    sfx(type) { const fn = SFX[type]; if (fn) fn(); },
    setMuted(m) { state.muted = m; },
    toggleMuted() { state.muted = !state.muted; return state.muted; },
  };
}
