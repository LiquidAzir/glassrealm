import test from 'node:test';
import assert from 'node:assert/strict';
import { tradeValue } from '../src/trade.js';
import { SHOP, TAVERN, FACTIONS } from '../src/content.js';

const buyModifiers = [...new Set([1, ...Object.values(FACTIONS).flatMap(f => f.tiers.map(t => t.shop || 1))])];
const sellModifiers = [...new Set([1, ...Object.values(FACTIONS).flatMap(f => f.tiers.map(t => t.sell || 1))])];

test('every stock item stays below its purchase cost across market events, drift and faction combinations', () => {
  for (const drift of [.65, .75, .8, .9, 1, 1.1, 1.2, 1.3, 1.55]) {
    for (const shop of buyModifiers) for (const sell of sellModifiers) for (const event of ['none', 'caravan', 'shortage']) {
      const buyPrice = (key, price) => Math.max(1, Math.round(price * drift * shop * (event === 'caravan' ? .75 : 1)));
      for (const item of SHOP.stock) {
        if (!SHOP.sell[item.key]) continue;
        const rawSell = Math.max(1, Math.round(SHOP.sell[item.key] * drift * sell * (event === 'shortage' ? 1.3 : 1)));
        const resale = tradeValue(item.key, rawSell, buyPrice);
        const alchemy = tradeValue(item.key, Math.round(SHOP.sell[item.key] * 1.5), buyPrice);
        const cost = buyPrice(item.key, item.price);
        assert.ok(resale < cost, `${item.key} resale ${resale} >= ${cost}`);
        assert.ok(alchemy < cost, `${item.key} alchemy ${alchemy} >= ${cost}`);
        assert.ok(Number.isSafeInteger(resale) && resale >= 0);
        assert.ok(Number.isSafeInteger(alchemy) && alchemy >= 0);
      }
    }
  }
});

test('fixed tavern purchases cannot bypass the resale or alchemy limit', () => {
  for (const item of TAVERN) {
    const value = tradeValue(item.key, 10000, (key, price) => price * 2);
    assert.ok(value < item.price);
  }
});

test('gathered and crafted goods unavailable from a vendor keep their full offered rewards', () => {
  const sold = new Set([...SHOP.stock, ...TAVERN].map(item => item.key));
  for (const [key, base] of Object.entries(SHOP.sell)) {
    if (sold.has(key)) continue;
    assert.equal(tradeValue(key, Math.round(base * 1.5), (key, price) => price), Math.round(base * 1.5));
    assert.equal(tradeValue(key, Math.round(base * 1.3 * 1.22), (key, price) => price), Math.round(base * 1.3 * 1.22));
  }
});
