import { QUESTS, NPCS, NPC_GOSSIP, DIALOGUE, ITEMS, ENEMIES, SMELT, COOK, BREW, FLETCH, RUNECRAFT, CRAFT, FORGE, ENCHANT, MEALS, SHOP, FISH, LOGS, CROPS } from './content.js';

const INDOOR_NPCS = { king: 'castle', steward: 'castle', courtmage: 'castle', highpriest: 'cathedral', forgemaster: 'forgehall', vessa: 'guildhall' };
const SERVICE_BUILDINGS = { furnace: ['forge', 'forgehall'], anvil: ['forge', 'forgehall'], cook: ['tavern'], craft: ['workshop'], cauldron: ['workshop'], shop: ['store'] };
const RECIPES = new Map();
for (const [rows, kind] of [[SMELT, 'furnace'], [BREW, 'cauldron'], [FLETCH, 'fletch'], [RUNECRAFT, 'rune'], [CRAFT, 'craft'], [FORGE, 'anvil'], [ENCHANT, 'rune'], [MEALS, 'cook']]) {
  for (const r of rows) RECIPES.set(r.out, { cost: r.cost || r.in, kind });
}
for (const [raw, cooked] of Object.entries(COOK)) RECIPES.set(cooked, { cost: { [raw]: 1 }, kind: 'cook' });
RECIPES.set('plank', { cost: { wood: 1 }, kind: 'sawmill' });
const ORES = { copper_ore: 'copper', iron_ore: 'iron', coal: 'coal', mithril_ore: 'mithril', silver_ore: 'silver', gold_ore: 'gold', adamant_ore: 'adamant', runite_ore: 'runite', rune_essence: 'essence' };
const DROPPERS = new Map();
for (const [key, def] of Object.entries(ENEMIES)) for (const [item, count] of Object.entries(def.loot || {})) {
  if (count > 0) { if (!DROPPERS.has(item)) DROPPERS.set(item, new Set()); DROPPERS.get(item).add(key); }
}

const NPC_NAMES = new Map(NPCS.map(n => [n.key, n.name]));
for (const key of Object.keys(INDOOR_NPCS)) NPC_NAMES.set(key, Object.values(DIALOGUE[key] || {}).find(n => n && typeof n !== 'function' && n.speaker)?.speaker || key);
export function questNpcName(key) { return NPC_NAMES.get(key) || NPC_GOSSIP[key]?.name || key; }

// Resolve guide positions from live actors/services. A recipe points to its
// missing ingredient first, then to a real station (or the door containing it).
export function createQuestGuidance(G) {
  const position = ref => ref.pos || ref;
  function nearest(rows, predicate = () => true) {
    const p = G.player.position; let best = null, distance = Infinity;
    for (const ref of rows || []) { if (!predicate(ref)) continue; const s = position(ref), d = Math.hypot(s.x - p.x, s.z - p.z); if (d < distance) { distance = d; best = ref; } }
    return best;
  }
  function target(ref, kind, label) {
    if (!ref) return null;
    const p = position(ref), h = Number.isFinite(p.y) ? p.y : G.world.walkHeight?.(p.x, p.z) ?? 0;
    return { x: p.x, z: p.z, y: h + (kind === 'npc' ? 2.9 : 2.4), ref, kind, label, ...(kind === 'enemy' ? { enemyKey: ref.enemyKey } : {}) };
  }
  function service(kind, label) {
    const indoor = G.inInterior && nearest(G.interiorStations, s => s.kind === kind);
    const s = indoor || nearest(G.world.stations, s => s.kind === kind || (s.kind === 'door' && (SERVICE_BUILDINGS[kind] || []).includes(s.building)));
    return target(s, s?.kind === 'door' ? 'door' : 'station', s?.kind === 'door' ? `${s.label} · ${label}` : label);
  }
  function npcTarget(key, verb = 'Speak with') {
    const label = `${verb} ${questNpcName(key)}`;
    const indoor = G.inInterior && G.interiorStations?.find(s => s.npcKey === key);
    if (indoor) return target(indoor, 'station', label);
    const actor = G.entities.npcs.find(n => n.def.key === key);
    if (actor) return target(actor, 'npc', label);
    const building = INDOOR_NPCS[key];
    const door = building && nearest(G.world.stations, s => s.kind === 'door' && s.building === building);
    return target(door, 'door', door ? `${door.label} · ${label}` : label);
  }
  function itemTarget(item, seen = new Set()) {
    if (!ITEMS[item] || seen.has(item)) return null;
    seen.add(item); const name = ITEMS[item].name, w = G.world;
    if (LOGS.some(l => l.log === item)) return target(nearest(w.trees, n => n.alive), 'tree', `Chop trees for ${name}`);
    if (['berry', 'herb', 'mushroom', 'nectar'].includes(item)) return target(nearest(w.bushes, n => n.alive), 'bush', `Forage ${name}`);
    if (ORES[item]) return target(nearest(w.oreNodes, n => n.alive && n.type === ORES[item]), 'ore', `Mine ${name}`);
    if (FISH.some(f => f.raw === item) || item === 'pearl') return target(nearest(w.fishingSpots), 'fish', `Fish for ${name}`);
    const crop = CROPS.find(c => c.produce === item);
    if (crop) return target(nearest(w.plots, p => p.state === 'empty' || (p.crop || 'crop') === item), 'plot', `Grow ${name}`);
    const recipe = RECIPES.get(item);
    if (recipe) {
      for (const [ingredient, count] of Object.entries(recipe.cost)) if (!G.inventory.has(ingredient, count)) {
        const source = itemTarget(ingredient, new Set(seen));
        if (source) return { ...source, label: `${source.label} · for ${name}` };
      }
      return service(recipe.kind, `Make ${name}`);
    }
    const droppers = DROPPERS.get(item);
    if (droppers) {
      const enemy = nearest(G.entities.enemies, e => e.alive && droppers.has(e.enemyKey));
      if (enemy) return target(enemy, 'enemy', `Defeat ${enemy.def.name} for ${name}`);
    }
    if (SHOP.stock.some(s => s.key === item)) return service('shop', `Buy ${name}`);
    return null;
  }
  function targetForQuest(id) {
    const def = QUESTS[id]; if (!def || G.quests.status(id) !== 'active') return null;
    if (G.quests.isReady(id)) return npcTarget(def.giver, 'Return to');
    const objectives = G.quests.objectives(id);
    for (let i = 0; i < def.objectives.length; i++) {
      if (objectives[i].done) continue;
      const o = def.objectives[i]; let found = null;
      if (o.type === 'have') found = itemTarget(o.item);
      else if (o.type === 'kill') found = target(nearest(G.entities.enemies, e => e.alive && e.enemyKey === o.enemy), 'enemy', `Defeat ${ENEMIES[o.enemy].name}`);
      else if (o.type === 'talk') found = npcTarget(o.npc);
      else if (o.type === 'visit') found = target(o, 'visit', o.name);
      if (found) return found;
    }
    return null;
  }
  return { npcTarget, itemTarget, targetForQuest, npcName: questNpcName };
}
