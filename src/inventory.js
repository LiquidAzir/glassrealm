import { ITEMS } from './content.js';

export function createInventory(saved) {
  const items = { ...(saved || {}) };
  return {
    items,
    count(key) { return items[key] || 0; },
    has(key, n = 1) { return (items[key] || 0) >= n; },
    add(key, n = 1) { items[key] = (items[key] || 0) + n; return items[key]; },
    remove(key, n = 1) {
      items[key] = Math.max(0, (items[key] || 0) - n);
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
