import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuests } from '../src/quests.js';
import { QUESTS } from '../src/content.js';
import { makeGame, questSave, satisfy } from './quests.helpers.mjs';

test('all 113 quests can progress through their prerequisite chains and pay exactly once', () => {
  const G = makeGame(), remaining = new Set(Object.keys(QUESTS));
  let iterations = 0;
  while (remaining.size) {
    const id = [...remaining].find(key => G.quests.status(key) === 'available');
    assert.ok(id, 'quest dependency graph has no reachable next quest');
    assert.equal(G.quests.accept(id), true, id);
    assert.equal(G.quests.accept(id), false, 'cannot restart an active quest');
    assert.equal(G.quests.isReady(id), false, id + ' should initially need work');
    satisfy(G, id);
    assert.equal(G.quests.isReady(id), true, id);
    const before = G.inventory.serialize(), xp = G.xpAwards.length;
    assert.equal(G.quests.complete(id), true, id);
    const expected = { ...before };
    for (const o of QUESTS[id].objectives) if (o.type === 'have') expected[o.item] -= o.count;
    for (const [key, amount] of Object.entries(QUESTS[id].rewards.items || {})) expected[key] = (expected[key] || 0) + amount;
    for (const [key, amount] of Object.entries(expected)) assert.equal(G.inventory.count(key), amount, id + ':' + key);
    assert.deepEqual(G.xpAwards.slice(xp), Object.entries(QUESTS[id].rewards.xp || {}).map(([key, amount]) => ({ key, amount })));
    assert.ok(G.quests.objectives(id).every(o => o.done), 'completed journal objectives remain complete after hand-in');
    const paid = G.inventory.serialize(), completed = G.completed.length;
    assert.equal(G.quests.complete(id), false); assert.deepEqual(G.inventory.serialize(), paid); assert.equal(G.completed.length, completed);
    remaining.delete(id); iterations++;
  }
  assert.equal(iterations, Object.keys(QUESTS).length); assert.equal(G.quests.points(), G.quests.maxPoints());
});

test('event counters are active-only, capped, changed-only, and survive save/reload', () => {
  const id = 'q_saga_v3', G = makeGame(questSave(id, 'active'));
  assert.equal(G.quests.notifyKill('boar'), false); assert.equal(G.quests.notifyTalk('elder'), false);
  assert.equal(G.quests.notifyKill('ember_boss'), true); assert.equal(G.quests.notifyKill('ember_boss'), false);
  assert.equal(G.quests.notifyTalk('vael'), true); assert.equal(G.quests.notifyTalk('vael'), false);
  const restored = createQuests(G, G.quests.serialize());
  assert.equal(restored.isReady(id), true); assert.equal(restored.progress(id, 'boss'), 1);
  assert.equal(restored.complete(id), true); assert.equal(restored.notifyTalk('vael'), false);
});

test('have objectives read live inventory and failed turn-in does not consume or grant anything', () => {
  const G = makeGame(); G.quests.accept('q_wood'); G.inventory.add('wood', 3);
  assert.equal(G.quests.isReady('q_wood'), true); G.inventory.remove('wood', 1);
  const before = G.inventory.serialize(); assert.equal(G.quests.complete('q_wood'), false); assert.deepEqual(G.inventory.serialize(), before);
  G.inventory.add('wood'); assert.equal(G.quests.complete('q_wood'), true); assert.equal(G.inventory.count('wood'), 0);
});

test('saved quest records are normalized without discarding valid active or completed progress', () => {
  const saved = JSON.parse('{"q_wood":null,"q_boar":{"status":"active","progress":{"boar":"1.9","bogus":99}},"q_snow":{"status":"broken","progress":{"k":-2}},"constructor":{"status":"active"},"__proto__":{"status":"active"}}');
  const G = makeGame(saved);
  assert.equal(G.quests.status('q_wood'), 'available'); assert.equal(G.quests.status('q_boar'), 'active'); assert.equal(G.quests.progress('q_boar', 'boar'), 1);
  assert.equal(G.quests.progress('q_boar', 'bogus'), 0); assert.equal(G.quests.canAccept('constructor'), false); assert.deepEqual(G.quests.objectives('constructor'), []);
  assert.equal(G.quests.accept('missing'), false); assert.equal(G.quests.complete('missing'), false);
});

test('one active quest and skill prerequisites reject acceptance with a boolean result', () => {
  const G = makeGame(); assert.equal(G.quests.accept('q_wood'), true); assert.equal(G.quests.accept('q_berry'), false);
  assert.equal(G.quests.status('q_berry'), 'available'); assert.match(G.toasts.at(-1), /one quest at a time/);
  const novice = makeGame(questSave('q_boss'), 1); assert.equal(novice.quests.accept('q_boss'), false); assert.match(novice.toasts.at(-1), /combat 15/);
});

test('reward callbacks cannot re-enter completion and repeat rewards', () => {
  const G = makeGame(); G.quests.accept('q_wood'); satisfy(G, 'q_wood'); let calls = 0;
  G.gainXp = () => { calls++; assert.equal(G.quests.status('q_wood'), 'complete'); assert.equal(G.quests.complete('q_wood'), false); };
  assert.equal(G.quests.complete('q_wood'), true); assert.equal(calls, 1); assert.equal(G.inventory.count('gold'), 30); assert.deepEqual(G.completed, ['q_wood']);
});
