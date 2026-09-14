import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuestGuidance, questNpcName } from '../src/quest-guidance.js';
import { QUESTS, NPCS, ENEMIES } from '../src/content.js';
import { makeGame, questSave, satisfy } from './quests.helpers.mjs';

function fixture(saved) {
  const G = makeGame(saved); G.player = { position: { x: 0, z: 0 } };
  const node = (x = 10, rest = {}) => ({ x, y: 5, z: 10, alive: true, ...rest });
  G.world = { trees: [node()], bushes: [node()], oreNodes: ['copper', 'iron', 'coal', 'silver', 'gold', 'mithril', 'adamant', 'runite', 'essence'].map(type => node(20, { type })), fishingSpots: [node()], plots: [node(30, { state: 'empty' })], walkHeight: () => 12,
    stations: [...['castle', 'cathedral', 'forgehall', 'guildhall', 'store', 'workshop', 'tavern', 'forge'].map(building => node(50, { kind: 'door', building, label: 'Enter ' + building })), ...['furnace', 'anvil', 'cook', 'craft', 'cauldron', 'rune', 'fletch', 'sawmill'].map(kind => node(30, { kind }))] };
  G.entities = { npcs: NPCS.map(def => ({ def, pos: node() })), enemies: Object.entries(ENEMIES).map(([enemyKey, def], i) => ({ enemyKey, def, alive: true, pos: node(i + 25) })) };
  return G;
}

test('all 39 required quest items and all 113 ready givers have live guidance', () => {
  const G = fixture(), guide = createQuestGuidance(G);
  const items = new Set(Object.values(QUESTS).flatMap(q => q.objectives.filter(o => o.type === 'have').map(o => o.item)));
  for (const item of items) { const s = guide.itemTarget(item); assert.ok(s, item); assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.z), item); }
  for (const id of Object.keys(QUESTS)) { const g = fixture(questSave(id, 'active')); satisfy(g, id); assert.ok(createQuestGuidance(g).targetForQuest(id), id); }
});

test('indoor NPC guidance uses the correct doorway outside and the current station inside', () => {
  const G = fixture(), guide = createQuestGuidance(G);
  for (const [key, building] of Object.entries({ king: 'castle', steward: 'castle', courtmage: 'castle', highpriest: 'cathedral', forgemaster: 'forgehall', vessa: 'guildhall' })) {
    const t = guide.npcTarget(key, 'Return to'); assert.equal(t.kind, 'door'); assert.equal(t.ref.building, building); assert.notEqual(questNpcName(key), key); assert.match(t.label, /Return to/);
  }
  G.inInterior = true; G.interiorStations = [{ npcKey: 'king', x: 1500, y: 0, z: 1480, kind: 'talk' }];
  assert.equal(guide.npcTarget('king').ref, G.interiorStations[0]);
});

test('recipe guidance follows missing materials then a nearby real service', () => {
  const G = fixture(), guide = createQuestGuidance(G);
  let t = guide.itemTarget('gold_bar'); assert.equal(t.kind, 'ore'); assert.equal(t.ref.type, 'gold');
  G.inventory.add('gold_ore', 1); t = guide.itemTarget('gold_bar'); assert.equal(t.ref.kind, 'furnace');
  G.world.stations = G.world.stations.filter(s => s.kind !== 'furnace');
  t = guide.itemTarget('gold_bar'); assert.equal(t.kind, 'door'); assert.ok(['forge', 'forgehall'].includes(t.ref.building));
  assert.equal(guide.itemTarget('torn_index_page').kind, 'enemy');
  assert.ok(guide.itemTarget('torn_index_page').ref.def.loot.torn_index_page);
});

test('guidance skips depleted resources and grounds visit markers at the actual terrain', () => {
  const G = fixture(questSave('q_spire3', 'active')), guide = createQuestGuidance(G);
  G.world.trees.unshift({ x: 0, y: 0, z: 1, alive: false }); assert.equal(guide.itemTarget('wood').ref, G.world.trees[1]);
  const t = guide.targetForQuest('q_spire3'); assert.equal(t.kind, 'visit'); assert.equal(t.y, 14.4);
  G.world.plots[0].state = 'growing'; G.world.plots[0].crop = 'carrot'; assert.equal(guide.itemTarget('crop'), null);
});
