import test from 'node:test';
import assert from 'node:assert/strict';
import { createSkills } from '../src/skills.js';

const threshold = level => Math.round(8 * (level - 1) ** 2.3);

test('all level thresholds, including the final level, report attainable progress', () => {
  for (let level = 2; level <= 99; level++) {
    const skill = createSkills({ mining: threshold(level) - 1 });
    assert.equal(skill.level('mining'), level - 1);
    const reward = skill.addXp('mining', 1);
    assert.deepEqual(reward, { leveled: true, level, amount: 1 });
    assert.equal(skill.level('mining'), level);
    if (level === 99) {
      assert.equal(skill.progress('mining'), 1);
      assert.equal(skill.toNext('mining'), 0);
      skill.addXp('mining', 50000);
      assert.equal(skill.progress('mining'), 1);
      assert.equal(skill.toNext('mining'), 0);
    } else {
      assert.equal(skill.progress('mining'), 0);
      assert.equal(skill.toNext('mining'), threshold(level + 1) - threshold(level));
    }
  }
});

test('prestige requires the threshold, resets once and survives save reload with its XP boost', () => {
  const skill = createSkills({ fishing: threshold(20) - 1 });
  assert.equal(skill.doPrestige('fishing'), false);
  skill.addXp('fishing', 1);
  assert.equal(skill.doPrestige('fishing'), true);
  assert.equal(skill.level('fishing'), 1);
  assert.equal(skill.doPrestige('fishing'), false);
  const restored = createSkills(skill.serialize(), skill.serializePrestige());
  assert.equal(restored.prestigeOf('fishing'), 1);
  assert.equal(restored.addXp('fishing', 100).amount, 108);
  assert.equal(restored.serialize().fishing, 108);
});

test('save repair retains legitimate XP and prestige without string concatenation or invalid levels', () => {
  const skill = createSkills({ combat: '120', mining: -40, cooking: null, imaginary: 100000 }, { combat: '2', mining: -2 });
  assert.equal(skill.addXp('combat', 100).amount, 116);
  assert.equal(skill.serialize().combat, 236);
  assert.equal(skill.level('mining'), 1);
  assert.equal(skill.prestigeTotal(), 2);
  assert.equal(skill.serialize().imaginary, undefined);
  assert.equal(skill.progress('mining'), 0);
});
