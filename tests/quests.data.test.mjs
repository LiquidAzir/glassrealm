import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { QUESTS, DIALOGUE, NPCS, NPC_GOSSIP, NPC_BRANCH, ITEMS, ENEMIES, ENEMY_SPAWNS } from '../src/content.js';
import { makeGame, questSave, satisfy } from './quests.helpers.mjs';

const indoorKeys = [...fs.readFileSync(new URL('../src/interiors.js', import.meta.url), 'utf8').matchAll(/npcKey:\s*'([^']+)'/g)].map(m => m[1]);
const npcKeys = new Set([...NPCS.map(n => n.key), ...indoorKeys]);
const skillKeys = new Set(makeGame().skills.DEFS.map(d => d.key));

test('all authored quest dependencies, objectives and rewards reference obtainable game definitions', () => {
  for (const [id, q] of Object.entries(QUESTS)) {
    assert.ok(npcKeys.has(q.giver), id + ': missing giver');
    assert.ok(q.startsAvailable || q.requires, id + ': permanently locked');
    const seen = new Set([id]); let req = q.requires;
    while (req) { assert.ok(QUESTS[req], id + ': missing prerequisite ' + req); assert.ok(!seen.has(req), id + ': prerequisite cycle'); seen.add(req); req = QUESTS[req].requires; }
    const objectiveIds = new Set();
    for (const o of q.objectives) {
      const at = id + ':' + o.id;
      assert.ok(o.id && !objectiveIds.has(o.id), at + ': duplicate or empty objective'); objectiveIds.add(o.id);
      assert.ok(['have', 'kill', 'talk', 'visit'].includes(o.type), at + ': unknown type');
      if (o.type === 'have') assert.ok(ITEMS[o.item], at + ': missing item');
      if (o.type === 'kill') { assert.ok(ENEMIES[o.enemy], at + ': missing enemy'); assert.ok(ENEMY_SPAWNS.some(s => s.enemy === o.enemy), at + ': enemy never spawns'); }
      if (o.type === 'talk') assert.ok(npcKeys.has(o.npc), at + ': missing talk target');
      if (o.type === 'visit') { assert.ok([o.x, o.z, o.r || 9].every(Number.isFinite), at + ': invalid location'); assert.ok((o.r || 9) > 0, at + ': empty visit radius'); }
      if (['have', 'kill'].includes(o.type)) assert.ok(Number.isInteger(o.count) && o.count > 0, at + ': invalid count');
    }
    for (const [sk, n] of Object.entries(q.reqSkills || {})) { assert.ok(skillKeys.has(sk), id + ': missing skill'); assert.ok(Number.isInteger(n) && n > 0 && n <= 99, id + ': invalid skill requirement'); }
    for (const [sk, n] of Object.entries(q.rewards.xp || {})) { assert.ok(skillKeys.has(sk), id + ': missing XP skill'); assert.ok(Number.isFinite(n) && n > 0, id + ': invalid XP'); }
    for (const [item, n] of Object.entries(q.rewards.items || {})) { assert.ok(ITEMS[item], id + ': missing reward'); assert.ok(Number.isInteger(n) && n > 0, id + ': invalid reward count'); }
  }
});

test('every authored dialogue node and edge resolves across all quest phases', () => {
  for (const n of NPCS) assert.ok(DIALOGUE[n.dialogue], n.key + ': missing dialogue');
  for (const key of indoorKeys) assert.ok(DIALOGUE[key], key + ': missing indoor dialogue');
  for (const key of Object.keys(NPC_GOSSIP)) assert.ok(DIALOGUE[key], key + ': gossip missing tree');
  for (const key of Object.keys(NPC_BRANCH)) assert.ok(NPC_GOSSIP[key], key + ': branch missing topic menu');
  const scenarios = [{ saved: undefined }, { saved: questSave(null) }];
  for (const id of Object.keys(QUESTS)) for (const phase of ['available', 'active', 'ready']) scenarios.push({ id, saved: questSave(id, phase === 'ready' ? 'active' : phase), ready: phase === 'ready' });
  const offers = new Set(), claims = new Set();
  for (const scenario of scenarios) for (const [tree, nodes] of Object.entries(DIALOGUE)) {
    const G = makeGame(scenario.saved); if (scenario.ready) satisfy(G, scenario.id);
    const accept = G.quests.accept.bind(G.quests), complete = G.quests.complete.bind(G.quests);
    G.quests.accept = id => { assert.ok(QUESTS[id], tree + ': invalid offer'); offers.add(id); return accept(id); };
    G.quests.complete = id => { assert.ok(QUESTS[id], tree + ': invalid claim'); claims.add(id); return complete(id); };
    for (const [key, raw] of Object.entries(nodes)) {
      const node = typeof raw === 'function' ? raw(G) : raw, at = tree + ':' + key;
      assert.equal(typeof node?.speaker, 'string', at); assert.equal(typeof node?.text, 'string', at); assert.ok(Array.isArray(node?.choices), at);
      for (const c of node.choices) { assert.ok(c.label, at + ': unlabeled choice'); if (c.to != null) assert.ok(nodes[c.to], at + ': missing edge ' + c.to); if (c.action) c.action(G); }
    }
  }
  assert.deepEqual([...offers].sort(), Object.keys(QUESTS).sort(), 'every quest has an offer');
  assert.deepEqual([...claims].sort(), Object.keys(QUESTS).sort(), 'every quest has a claim');
});
