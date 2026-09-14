import { ITEMS, CLASSES } from './content.js';

export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'amulet', 'ring', 'shield'];

export function restoreLegacyStarterGear(saved, inventory) {
  if (!saved || saved.equipmentOwnership === 1) return;
  // Old classes equipped their kit without putting it in the pack. Materialize
  // only that known kit; never copy an item already held by a bank or gravestone.
  const starters = new Set(CLASSES.flatMap((c) => EQUIPMENT_SLOTS.map((s) => c.grant[s]).filter(Boolean)));
  for (const key of Object.values(saved.player?.equipment || {})) {
    if (starters.has(key) && !inventory.has(key) && !(saved.bank?.[key] > 0) && !(saved.grave?.items?.[key] > 0)) inventory.add(key);
  }
}

// Worn gear is a reference to one item in the pack, never an extra copy.
export function ownedEquipment(equipment, inventory) {
  return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => {
    const key = equipment && equipment[slot];
    return [slot, ITEMS[key]?.type === slot && inventory.has(key, 1) ? key : null];
  }));
}
