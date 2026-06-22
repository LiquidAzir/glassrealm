import { clamp } from './util.js';

const DEFS = [
  { key: 'combat',      name: 'Combat',      icon: '⚔️' },
  { key: 'ranged',      name: 'Ranged',      icon: '🏹' },
  { key: 'magic',       name: 'Magic',       icon: '🪄' },
  { key: 'defence',     name: 'Defence',     icon: '🛡️' },
  { key: 'woodcutting', name: 'Woodcutting', icon: '🪓' },
  { key: 'mining',      name: 'Mining',      icon: '⛏️' },
  { key: 'fishing',     name: 'Fishing',     icon: '🎣' },
  { key: 'foraging',    name: 'Foraging',    icon: '🌿' },
  { key: 'cooking',     name: 'Cooking',     icon: '🍳' },
  { key: 'smithing',    name: 'Smithing',    icon: '🔨' },
  { key: 'farming',     name: 'Farming',     icon: '🌱' },
  { key: 'herblore',    name: 'Herblore',    icon: '⚗️' },
  { key: 'thieving',    name: 'Thieving',    icon: '🎭' },
  { key: 'crafting',    name: 'Crafting',    icon: '💍' },
  { key: 'agility',     name: 'Agility',     icon: '🤸' },
  { key: 'prayer',      name: 'Prayer',      icon: '✨' },
];

// Gentle curve: L1=0, L2≈8, L3≈29, L5≈90, L10≈430 xp.
const xpForLevel = (l) => Math.round(8 * Math.pow(l - 1, 1.85));
function levelForXp(xp) { let l = 1; while (l < 99 && xpForLevel(l + 1) <= xp) l++; return l; }

export function createSkills(saved) {
  const xp = { combat: 0, ranged: 0, magic: 0, defence: 0, woodcutting: 0, mining: 0, fishing: 0, foraging: 0, cooking: 0, smithing: 0, farming: 0, herblore: 0, thieving: 0, crafting: 0, agility: 0, prayer: 0, ...(saved || {}) };
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
