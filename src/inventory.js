import { ITEMS } from './content.js';

export function createInventory(saved) {
  const known = key => Object.hasOwn(ITEMS, key);
  const quantity = value => {
    const n = typeof value === 'number' || typeof value === 'string' ? Number(value) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n))) : 0;
  };
  const items = {};
  for (const [key, value] of Object.entries(saved && typeof saved === 'object' ? saved : {})) {
    const n = quantity(value);
    if (known(key) && n > 0) items[key] = n;
  }
  const count = key => known(key) ? items[key] || 0 : 0;
  const validAmount = n => Number.isSafeInteger(n) && n > 0;
  return {
    items,
    count,
    has(key, n = 1) { return known(key) && validAmount(n) && count(key) >= n; },
    // Quantities are whole items; invalid rewards leave the existing stack intact.
    // Keep the original return contract: the resulting stack count, not the delta.
    add(key, n = 1) {
      if (!known(key) || !validAmount(n)) return count(key);
      items[key] = Math.min(Number.MAX_SAFE_INTEGER, count(key) + n);
      return items[key];
    },
    remove(key, n = 1) {
      if (!known(key) || !validAmount(n)) return count(key);
      items[key] = Math.max(0, count(key) - n);
      if (items[key] === 0) delete items[key];
      return items[key] || 0;
    },
    // everything except currency, for the inventory grid (gold shown separately)
    list() {
      return Object.keys(items).filter((k) => items[k] > 0 && ITEMS[k] && ITEMS[k].type !== 'currency')
        .map((k) => ({ key: k, count: items[k], def: ITEMS[k] }));
    },
    serialize() { return { ...items }; },
  };
}
