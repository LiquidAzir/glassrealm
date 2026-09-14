import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventory } from '../src/inventory.js';

test('loaded item stacks remain numeric through rewards, crafting and save reload', () => {
  const inventory = createInventory({ wood: '9', gold: '450', raw_shrimp: 2 });
  inventory.add('wood', 1);
  assert.equal(inventory.count('wood'), 10);
  assert.equal(inventory.has('gold', 450), true);
  inventory.remove('gold', 450);
  inventory.remove('raw_shrimp', 2); inventory.add('cooked_shrimp', 2);
  const restored = createInventory(JSON.parse(JSON.stringify(inventory.serialize())));
  assert.equal(restored.count('gold'), 0);
  assert.equal(restored.count('raw_shrimp'), 0);
  assert.equal(restored.count('cooked_shrimp'), 2);
  assert.equal(restored.count('wood'), 10);
});

test('damaged save entries cannot poison valid stacks or create invisible inventory items', () => {
  const inventory = createInventory({ wood: -8, gold: 'NaN', raw_shrimp: 3.8, unknown_relic: 20, milk: null });
  assert.deepEqual(inventory.serialize(), { raw_shrimp: 3 });
  inventory.add('wood', 2);
  assert.equal(inventory.count('wood'), 2);
  inventory.add('unknown_relic', 5);
  assert.equal(inventory.count('unknown_relic'), 0);
});

test('unlimited stacked inventory and detached save snapshots preserve legitimate quantities', () => {
  const inventory = createInventory({ gold: 4000000000, wood: 250000 });
  const snapshot = inventory.serialize();
  inventory.add('gold', 1000); inventory.remove('wood', 4);
  assert.deepEqual(snapshot, { gold: 4000000000, wood: 250000 });
  assert.equal(inventory.count('gold'), 4000001000);
  assert.equal(inventory.count('wood'), 249996);
});
