// Opt-in economy: businesses you found earn coin passively over real time (even
// while the game is closed, up to a cap) and can be upgraded + staffed with hired
// employees. Pure data/bookkeeping — UI + gold transfers live in main.js.
import { BUSINESSES } from './content.js';

const CAP_MS = 4 * 3600 * 1000;                 // offline earnings cap at 4 hours
const defOf = (k) => BUSINESSES.find((b) => b.key === k);

export function createEconomy(saved) {
  const state = { businesses: {}, lastTick: Date.now() };
  const nonnegative = (value, fallback = 0) => {
    const n = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
    return Number.isFinite(n) && n >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, n) : fallback;
  };
  if (saved) {
    state.lastTick = nonnegative(saved.lastTick, state.lastTick);
    for (const def of BUSINESSES) {
      const b = saved.businesses && saved.businesses[def.key];
      if (!b || b.owned !== true) continue;
      state.businesses[def.key] = {
        owned: true, level: Math.max(1, Math.floor(nonnegative(b.level, 1))),
        emp: Math.min(def.maxEmp, Math.floor(nonnegative(b.emp))), accrued: nonnegative(b.accrued),
      };
    }
  }

  // net coin/min = (base output + employees·(boost − wage)) · level
  function netPerMin(key) {
    const def = defOf(key), b = state.businesses[key];
    if (!def || !b || !b.owned) return 0;
    return Math.max(0, (def.base + b.emp * (def.empBoost - def.wage)) * b.level);
  }
  // bank the coin earned since the last tick (called on load for offline catch-up,
  // and periodically while playing)
  function accrue() {
    const now = Date.now();
    if (now <= state.lastTick) return;   // a clock correction must not repay an already counted interval
    let ms = now - state.lastTick;
    state.lastTick = now;
    if (ms < 0) ms = 0;
    if (ms > CAP_MS) ms = CAP_MS;
    const min = ms / 60000;
    for (const def of BUSINESSES) { const b = state.businesses[def.key]; if (b && b.owned) b.accrued = Math.min(Number.MAX_SAFE_INTEGER, b.accrued + netPerMin(def.key) * min); }
  }

  return {
    state,
    owned: (k) => { const b = state.businesses[k]; return !!(b && b.owned); },
    levelOf: (k) => { const b = state.businesses[k]; return b ? b.level : 0; },
    empOf: (k) => { const b = state.businesses[k]; return b ? b.emp : 0; },
    anyOwned: () => BUSINESSES.some((d) => { const b = state.businesses[d.key]; return b && b.owned; }),
    netPerMin,
    accruedOf: (k) => { const b = state.businesses[k]; return b ? Math.floor(b.accrued || 0) : 0; },
    upgradeCost: (k) => { const def = defOf(k), b = state.businesses[k]; return def ? Math.round(def.foundCost * 0.8 * (b ? b.level : 1)) : 0; },
    hireCost: (k) => { const def = defOf(k), b = state.businesses[k]; return def ? Math.round(def.empBase * (1 + (b ? b.emp : 0) * 0.5)) : 0; },
    canHire: (k) => { const def = defOf(k), b = state.businesses[k]; return !!(def && b && b.owned && b.emp < def.maxEmp); },
    found: (k) => { accrue(); if (!defOf(k) || state.businesses[k]) return false; state.businesses[k] = { owned: true, level: 1, emp: 0, accrued: 0 }; return true; },
    upgrade: (k) => { accrue(); const b = state.businesses[k]; if (!b || !b.owned || b.level >= Number.MAX_SAFE_INTEGER) return false; b.level++; return true; },
    hire: (k) => { accrue(); const b = state.businesses[k], def = defOf(k); if (!def || !b || !b.owned || b.emp >= def.maxEmp) return false; b.emp++; return true; },
    collect: (k) => { accrue(); const b = state.businesses[k]; if (!b || !b.owned) return 0; const g = Math.floor(b.accrued); b.accrued -= g; return g; },
    tick: accrue,
    serialize: () => ({ businesses: Object.fromEntries(Object.entries(state.businesses).map(([key, b]) => [key, { ...b }])), lastTick: state.lastTick }),
  };
}
