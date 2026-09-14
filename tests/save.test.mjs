import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSave, createSave, loadSave, mergeRemoteSave } from '../src/save.js';
import { createInventory } from '../src/inventory.js';
import { createSkills } from '../src/skills.js';
import { ownedEquipment, restoreLegacyStarterGear } from '../src/equipment.js';
import { CLASSES } from '../src/content.js';

const KEY = 'glassrealm.save.v1';
const valid = () => ({ v: 1, t: 120, player: { x: 12, z: -9, hp: 80, equipment: { weapon: 'bronze_sword' } }, skills: { combat: 1200 }, inventory: { gold: 40, bronze_sword: 1 }, world: {} });
const code = (s) => Buffer.from(JSON.stringify(s), 'utf8').toString('base64');
function storage(initial) {
  const data = new Map(initial ? [[KEY, JSON.stringify(initial)]] : []);
  globalThis.localStorage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
  return data;
}
function game() {
  return {
    player: { position: { x: 12, z: 8 }, state: { heading: 1.2, hp: 75, prayer: 12, equipment: { weapon: 'bronze_sword' }, combatStance: 'accurate' } },
    skills: createSkills({ combat: 1300 }), inventory: createInventory({ bronze_sword: 1, gold: 21 }), bankItems: { wood: 12 },
    quests: { serialize: () => ({ first_steps: { status: 'complete', progress: {} } }) },
    world: { trees: [{ idx: 2, alive: false }], bushes: [], stations: [], plots: [{ state: 'growing', crop: 'carrot', grow: 13.75 }, { state: 'grown', crop: 'crop', grow: 0 }, { state: 'empty', grow: 0 }] },
    grave: { x: 50, z: -30, t: 73.5, items: { wood: 7, gold: 15 } },
  };
}

test('all save entry points reject non-save data before replacing existing progress', () => {
  const data = storage(valid()), before = data.get(KEY), api = createSave({});
  for (const s of [null, [], {}, { player: [], skills: {} }, { player: {}, skills: [] }, { ...valid(), v: 2 }]) {
    assert.equal(normalizeSave(s), null);
    assert.equal(mergeRemoteSave(s), false);
    assert.equal(api.importCode(code(s)), false);
    assert.equal(data.get(KEY), before);
  }
  assert.equal(api.importCode('broken-code'), false);
  assert.equal(data.get(KEY), before);
});

test('damaged optional save fields recover without discarding intact progress', () => {
  const s = valid();
  Object.assign(s, { collection: {}, pets: [null, 123, 'cat'], activePet: 'cat', diaries: 'oops', market: { mult: { wood: 'bad' } }, grave: { x: 1, z: 1, t: 30, items: { gold: '7', missing_item: 20 } }, stats: { kills: 12, regions: 'oops', bosses: {}, killsByType: { boar: 3 } } });
  s.bank = { wood: '31', missing_item: 50, gold: -4 };
  s.world.choppedTrees = { 2: true };
  const result = normalizeSave(s);
  assert.equal(result.skills.combat, 1200);
  assert.deepEqual(result.bank, { wood: 31 });
  assert.deepEqual(result.inventory, s.inventory);
  assert.deepEqual(result.collection, []);
  assert.deepEqual(result.pets, ['cat']);
  assert.deepEqual(result.stats.regions, []);
  assert.equal(result.stats.kills, 12);
  assert.deepEqual(result.grave.items, { gold: 7 });
  assert.deepEqual(result.world.choppedTrees, []);
  assert.equal(s.bank.wood, '31', 'normalization must not mutate the incoming save');
});

test('snapshot and portable reload preserve crop identity, remaining growth, grave and indoor return door', () => {
  storage(); const G = game(), api = createSave(G);
  G.inInterior = true; G.returnPos = { x: 31, z: -18, heading: .2 };
  G.player.position = { x: 4000, z: 4000 };
  assert.equal(api.save(), true);
  const saved = loadSave();
  assert.deepEqual(saved.world.plots, [{ idx: 0, state: 'growing', crop: 'carrot', grow: 13.75 }, { idx: 1, state: 'grown', crop: 'crop', grow: 0 }]);
  assert.deepEqual(saved.grave, { x: 50, z: -30, t: 73.5, items: { wood: 7, gold: 15 } });
  assert.equal(saved.player.x, 31); assert.equal(saved.player.z, -18);
  assert.equal(saved.equipmentOwnership, 1);
  const exported = api.exportCode(); assert(exported.length > 100);
  assert.equal(api.importCode(exported), true);
  assert.deepEqual(loadSave().world, saved.world);
  assert.deepEqual(loadSave().inventory, saved.inventory);
});

test('expired and invalid graves are not resurrected by a save reload', () => {
  for (const t of [0, -1, null, '90', Infinity]) assert.equal(normalizeSave({ ...valid(), grave: { x: 0, z: 0, t, items: { wood: 1 } } }).grave, undefined);
});

test('remote merge keeps newer local progress and explicit imports become the new local choice', () => {
  const s = valid(); storage(s);
  assert.equal(mergeRemoteSave({ ...s, t: 119, inventory: { gold: 5 } }), false);
  assert.equal(loadSave().inventory.gold, 40);
  assert.equal(mergeRemoteSave({ ...s, t: 121, inventory: { gold: 55 } }), true);
  assert.equal(loadSave().inventory.gold, 55);
  assert.equal(createSave({}).importCode(code({ ...s, t: 1, inventory: { gold: 7 } })), true);
  assert.equal(loadSave().inventory.gold, 7);
  assert(loadSave().t > 121);
  assert.equal(mergeRemoteSave({ ...s, t: 121 }), false);
});

test('failed writes report failure and preserve a valid existing save', () => {
  const data = storage(valid()), before = data.get(KEY);
  localStorage.setItem = () => { throw new Error('quota'); };
  const api = createSave(game());
  assert.equal(api.save(), false);
  assert.equal(api.importCode(code(valid())), false);
  assert.equal(data.get(KEY), before);
});

test('every legacy starter kit can be unequipped and re-equipped without inventing duplicate holdings', () => {
  for (const c of CLASSES) {
    const equipment = Object.fromEntries(['weapon', 'armor', 'shield'].map(k => [k, c.grant[k] || null]));
    const saved = { player: { equipment }, bank: {}, grave: null }, inventory = createInventory(c.grant.items);
    restoreLegacyStarterGear(saved, inventory);
    const once = inventory.serialize(); restoreLegacyStarterGear(saved, inventory);
    assert.deepEqual(inventory.serialize(), once);
    for (const key of Object.values(equipment).filter(Boolean)) assert.equal(inventory.count(key), 1);
    assert.equal(ownedEquipment(equipment, inventory).weapon, equipment.weapon);
  }
});

test('ownership migration does not copy bank/grave goods or re-create a removed item in current saves', () => {
  for (const saved of [
    { equipmentOwnership: 1 }, { bank: { bronze_sword: 1 } }, { grave: { items: { bronze_sword: 1 } } },
  ]) {
    saved.player = { equipment: { weapon: 'bronze_sword' } };
    const inv = createInventory(); restoreLegacyStarterGear(saved, inv);
    assert.equal(inv.count('bronze_sword'), 0);
    assert.equal(ownedEquipment(saved.player.equipment, inv).weapon, null);
  }
  const inv = createInventory({ wood: 3, bronze_sword: 2 });
  inv.remove('bronze_sword'); assert.equal(ownedEquipment({ weapon: 'bronze_sword' }, inv).weapon, 'bronze_sword');
  inv.remove('bronze_sword'); assert.equal(ownedEquipment({ weapon: 'bronze_sword' }, inv).weapon, null);
  assert.equal(ownedEquipment({ weapon: 'wood', armor: 'bronze_sword' }, inv).weapon, null);
});
