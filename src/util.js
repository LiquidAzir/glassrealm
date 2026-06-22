// Small shared helpers. Game runs in-browser, so Math.random / performance.now
// are all fair game; we seed world-gen for determinism so saved world changes line up.

export const TAU = Math.PI * 2;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

// Frame-rate independent damping factor for lerp(current, target, damp(rate, dt)).
export const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

// Shortest signed angular difference b - a, in (-PI, PI].
export function angDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export function lerpAngle(a, b, t) { return a + angDiff(a, b) * clamp(t, 0, 1); }

// Deterministic PRNG (mulberry32). Returns a function -> [0,1).
export function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const dist2D = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// Distance from point (px,pz) to segment (ax,az)-(bx,bz). Used for the isthmus.
export function distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz || 1;
  let t = ((px - ax) * dx + (pz - az) * dz) / len2;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}
