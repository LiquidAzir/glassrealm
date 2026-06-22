import { clamp } from './util.js';

const DEFS = [
  { key: 'combat',      name: 'Combat',      icon: '⚔️' },
  { key: 'ranged',      name: 'Ranged',      icon: '🏹' },
  { key: 'magic',       name: 'Magic',       icon: '🪄' },
  { key: 'defence',     name: 'Defence',     icon: '🛡️' },
  { key: 'slayer',      name: 'Slayer',      icon: '☠️' },
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
  { key: 'fletching',   name: 'Fletching',   icon: '🪶' },
  { key: 'runecraft',   name: 'Runecrafting', icon: '🔮' },
  { key: 'agility',     name: 'Agility',     icon: '🤸' },
  { key: 'prayer',      name: 'Prayer',      icon: '✨' },
];

const DEFAULTS = {};
DEFS.forEach((d) => (DEFAULTS[d.key] = 0));

// Steep RuneScape-like curve: levels come fast early, then a real long-term grind
// (e.g. lvl 10 ≈ 1.3k xp, lvl 30 ≈ 21k, lvl 50 ≈ 74k, lvl 99 ≈ 416k).
const xpForLevel = (l) => Math.round(8 * Math.pow(l - 1, 2.3));
function levelForXp(xp) { let l = 1; while (l < 99 && xpForLevel(l + 1) <= xp) l++; return l; }
const PRESTIGE_AT = 20;

export function createSkills(saved, savedPrestige) {
  const xp = { ...DEFAULTS, ...(saved || {}) };
  const prestige = { ...(savedPrestige || {}) };
  return {
    DEFS,
    xp,
    level(key) { return levelForXp(xp[key] || 0); },
    progress(key) {
      const l = levelForXp(xp[key] || 0);
      const cur = xpForLevel(l), next = xpForLevel(l + 1);
      return next > cur ? clamp(((xp[key] || 0) - cur) / (next - cur), 0, 1) : 1;
    },
    toNext(key) { const l = levelForXp(xp[key] || 0); return Math.max(0, xpForLevel(l + 1) - (xp[key] || 0)); },
    prestigeOf(key) { return prestige[key] || 0; },
    canPrestige(key) { return levelForXp(xp[key] || 0) >= PRESTIGE_AT; },
    doPrestige(key) {
      if (levelForXp(xp[key] || 0) < PRESTIGE_AT) return false;
      xp[key] = 0; prestige[key] = (prestige[key] || 0) + 1; return true;
    },
    addXp(key, amount) {
      amount = Math.round(amount * (1 + 0.08 * (prestige[key] || 0)));
      const before = levelForXp(xp[key] || 0);
      xp[key] = (xp[key] || 0) + amount;
      const after = levelForXp(xp[key]);
      return { leveled: after > before, level: after, amount };
    },
    total() { return DEFS.reduce((s, d) => s + levelForXp(xp[d.key] || 0), 0); },
    prestigeTotal() { return DEFS.reduce((s, d) => s + (prestige[d.key] || 0), 0); },
    serialize() { return { ...xp }; },
    serializePrestige() { return { ...prestige }; },
  };
}
