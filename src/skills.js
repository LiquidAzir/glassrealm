import { clamp } from './util.js';

const DEFS = [
  { key: 'combat',      name: 'Combat',      icon: '⚔️' },
  { key: 'woodcutting', name: 'Woodcutting', icon: '🪓' },
  { key: 'foraging',    name: 'Foraging',    icon: '🌿' },
];

// Gentle curve: L1=0, L2≈8, L3≈29, L5≈90, L10≈430 xp.
const xpForLevel = (l) => Math.round(8 * Math.pow(l - 1, 1.85));
function levelForXp(xp) { let l = 1; while (l < 99 && xpForLevel(l + 1) <= xp) l++; return l; }

export function createSkills(saved) {
  const xp = { combat: 0, woodcutting: 0, foraging: 0, ...(saved || {}) };
  return {
    DEFS,
    xp,
    level(key) { return levelForXp(xp[key] || 0); },
    progress(key) {
      const l = levelForXp(xp[key] || 0);
      const cur = xpForLevel(l), next = xpForLevel(l + 1);
      return next > cur ? clamp(((xp[key] || 0) - cur) / (next - cur), 0, 1) : 1;
    },
    toNext(key) {
      const l = levelForXp(xp[key] || 0);
      return Math.max(0, xpForLevel(l + 1) - (xp[key] || 0));
    },
    addXp(key, amount) {
      const before = levelForXp(xp[key] || 0);
      xp[key] = (xp[key] || 0) + amount;
      const after = levelForXp(xp[key]);
      return { leveled: after > before, level: after, amount };
    },
    total() { return DEFS.reduce((s, d) => s + levelForXp(xp[d.key] || 0), 0); },
    serialize() { return { ...xp }; },
  };
}
