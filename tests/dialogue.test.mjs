import test from 'node:test';
import assert from 'node:assert/strict';
import { createDialogue } from '../src/dialogue.js';
import { QUESTS, DIALOGUE, NPCS, NPC_GOSSIP, NPC_BRANCH } from '../src/content.js';
import { makeGame, questSave, satisfy } from './quests.helpers.mjs';

const giverTree = id => NPCS.find(n => n.key === QUESTS[id].giver)?.dialogue || QUESTS[id].giver;
const latest = G => G.renders.at(-1);

test('every quest can be accepted and turned in through its actual giver root', () => {
  for (const id of Object.keys(QUESTS)) {
    const G = makeGame(questSave(id)), d = createDialogue(G); d.open(giverTree(id));
    d.select(); assert.equal(G.quests.status(id), 'active', id + ': actual giver must offer it');
    satisfy(G, id); d.open(giverTree(id)); d.select(); assert.equal(G.quests.status(id), 'complete', id + ': actual giver must accept turn-in');
  }
});

test('rejected acceptance stays on the offer instead of claiming a quest was accepted', () => {
  const G = makeGame(); G.quests.accept('q_wood'); const d = createDialogue(G); d.open('merchant'); const offer = latest(G).text;
  d.select(); assert.equal(G.quests.status('q_berry'), 'available'); assert.equal(latest(G).text, offer); assert.match(G.toasts.at(-1), /one quest at a time/);
  const novice = makeGame(questSave('q_boss'), 1), low = createDialogue(novice); low.open('smith'); const body = latest(novice).text;
  low.select(); assert.equal(latest(novice).text, body); assert.equal(novice.quests.status('q_boss'), 'available');
});

test('every finale branch grants once and a stale alternate choice cannot replace its outcome', () => {
  let tested = 0;
  for (const id of Object.keys(QUESTS)) {
    const G = makeGame(questSave(id, 'active')); satisfy(G, id);
    const raw = DIALOGUE[giverTree(id)].root, n = typeof raw === 'function' ? raw(G) : raw;
    if (n.choices.filter(c => c.action).length < 2) continue;
    for (let i = 0; i < n.choices.length; i++) {
      if (!n.choices[i].action) continue;
      const branch = makeGame(questSave(id, 'active')); satisfy(branch, id);
      const node = typeof raw === 'function' ? raw(branch) : raw;
      node.choices[i].action(branch);
      if (!branch.sagaChoices[id]) continue; // e.g. a trade choice on a standard quest
      tested++;
      const paid = branch.inventory.serialize(), chosen = branch.sagaChoices[id];
      for (const c of node.choices) if (c.action) c.action(branch);
      assert.deepEqual(branch.inventory.serialize(), paid, id); assert.equal(branch.sagaChoices[id], chosen, id);
    }
  }
  assert.ok(tested >= 10, 'all authored finale variants should be exercised');
});

test('all gossip topics and interactive replies navigate and close safely', () => {
  for (const [tree, gossip] of Object.entries(NPC_GOSSIP)) {
    const topicCount = gossip.topics.length + (NPC_BRANCH[tree] ? 1 : 0);
    for (let i = 0; i < topicCount; i++) {
      const G = makeGame(questSave(null)), d = createDialogue(G); let closed = 0; d.open(tree, () => closed++);
      d.move(latest(G).choices.findIndex(c => c.to === '__chat')); d.select(); d.move(i); d.select();
      assert.equal(typeof latest(G).text, 'string', tree);
      if (latest(G).choices[0]?.to?.startsWith('__r')) { d.select(); assert.equal(typeof latest(G).text, 'string'); }
      d.close(); d.close(); assert.equal(closed, 1, tree);
    }
  }
});

test('dialogue action replacement and re-entrant selection preserve the new conversation', () => {
  const G = makeGame(), d = createDialogue(G); let calls = 0, closed = 0;
  d.openNode({ speaker: 'A', text: 'Offer', choices: [{ label: 'Go', action: () => { calls++; d.select(); d.openNode({ speaker: 'B', text: 'New conversation', choices: [{ label: 'Bye', to: null }] }, () => closed++); }, to: null }] });
  d.select(); assert.equal(calls, 1); assert.equal(d.active, true); assert.equal(latest(G).speaker, 'B'); d.select(); assert.equal(closed, 1);
});

test('missing trees and changing visible choices cannot strand or crash dialogue', () => {
  const G = makeGame(), d = createDialogue(G); let closed = 0; d.open('missing_tree', () => closed++); assert.equal(d.active, false); assert.equal(closed, 1);
  let show = true, picked = 0; d.openNode({ speaker: 'A', text: 'Choices', choices: [{ label: 'Always', action: () => picked++, to: null }, { label: 'Sometimes', show: () => show, to: null }] });
  d.move(1); show = false; assert.doesNotThrow(() => d.select()); assert.equal(picked, 1);
});

test('pointing at a dialogue choice selects its visible index without changing keyboard selection first', () => {
  const G = makeGame(), d = createDialogue(G); let chosen = '';
  d.openNode({ speaker: 'A', text: 'Choose', choices: [{ label: 'Hidden', show: () => false }, { label: 'First', action: () => { chosen = 'first'; }, to: null }, { label: 'Second', action: () => { chosen = 'second'; }, to: null }] });
  d.select(1); assert.equal(chosen, 'second'); assert.equal(d.active, false);
});
