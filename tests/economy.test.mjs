import test from 'node:test';
import assert from 'node:assert/strict';
import { createEconomy } from '../src/economy.js';
import { createFarm } from '../src/farm.js';
import { BUSINESSES, LIVESTOCK, FARM } from '../src/content.js';

function clock(t) {
  let now = 1800000000000;
  t.mock.method(Date, 'now', () => now);
  return { advance: minutes => { now += minutes * 60000; }, set: value => { now = value; }, get now() { return now; } };
}
const near = (value, expected) => assert.ok(Math.abs(value - expected) < 1e-7, `${value} != ${expected}`);

test('frequent business collections preserve fractional coin and equal a single later collection', t => {
  const time = clock(t), economy = createEconomy(); economy.found('shop');
  let collected = 0;
  for (let i = 0; i < 20; i++) { time.advance(.05); collected += economy.collect('shop'); }
  near(collected + economy.state.businesses.shop.accrued, 6);
  assert.equal(collected, 6);
});

test('business upgrades and hiring apply only after already-earned income is settled', t => {
  const time = clock(t), economy = createEconomy(); economy.found('shop');
  time.advance(2); economy.upgrade('shop');
  time.advance(3); economy.hire('shop');
  time.advance(1);
  assert.equal(economy.collect('shop'), 12 + 36 + 18);
});

test('business catch-up caps offline time and a backward clock cannot pay the same interval twice', t => {
  const time = clock(t), economy = createEconomy(); economy.found('shop');
  time.advance(600); economy.tick();
  assert.equal(economy.collect('shop'), 6 * 240);
  const last = time.now;
  time.advance(-10); economy.tick(); time.set(last); economy.tick();
  assert.equal(economy.collect('shop'), 0);
});

test('business state is detached from loaded and serialized snapshots', t => {
  const time = clock(t), saved = { businesses: { shop: { owned: true, level: 2, emp: 1, accrued: 1.5 } }, lastTick: time.now };
  const economy = createEconomy(saved), snapshot = economy.serialize();
  time.advance(1); economy.upgrade('shop');
  assert.equal(saved.businesses.shop.level, 2);
  assert.equal(snapshot.businesses.shop.level, 2);
  assert.equal(snapshot.businesses.shop.accrued, 1.5);
});

test('livestock bought together matures together and produces only after reaching adulthood', t => {
  const time = clock(t), farm = createFarm(); farm.buyFarm();
  farm.buyAnimal('chicken'); farm.buyAnimal('chicken');
  time.advance(6); farm.tick();
  assert.equal(farm.matureOf('chicken'), 2);
  assert.deepEqual(farm.collectProduce(), {});
  time.advance(2); farm.tick();
  assert.deepEqual(farm.collectProduce(), { egg: 2 });
});

test('offline livestock production matches frequent live ticks through maturity', t => {
  const time = clock(t);
  const make = () => { const farm = createFarm(); farm.buyFarm(); farm.buyAnimal('chicken'); farm.buyAnimal('cow'); return farm; };
  const offline = make(), live = make();
  for (let i = 0; i < 240; i++) { time.advance(.25); live.tick(); }
  offline.tick();
  near(offline.state.produce.egg, 27); near(offline.state.produce.milk, 9);
  near(live.state.produce.egg, offline.state.produce.egg);
  near(live.state.produce.milk, offline.state.produce.milk);
  assert.deepEqual(live.collectProduce(), offline.collectProduce());
});

test('later purchases start young after an idle mature herd and preserve earlier animal ages', t => {
  const time = clock(t), farm = createFarm(); farm.buyFarm(); farm.buyAnimal('chicken');
  time.advance(12); farm.tick();
  farm.buyAnimal('chicken'); time.advance(1); farm.tick();
  assert.equal(farm.matureOf('chicken'), 1);
  time.advance(2); farm.buyAnimal('chicken'); time.advance(3); farm.tick();
  assert.equal(farm.matureOf('chicken'), 2);
  time.advance(3); farm.tick(); assert.equal(farm.matureOf('chicken'), 3);
});

test('farm gold collections retain fractional income and cannot repeat a backward interval', t => {
  const time = clock(t), farm = createFarm(); farm.buyFarm(); farm.hireWorker();
  let collected = 0;
  for (let i = 0; i < 20; i++) { time.advance(.05); collected += farm.collectGold(); }
  near(collected + farm.state.gold, FARM.workerOutput - FARM.workerWage);
  const last = time.now; time.advance(-.5); farm.tick(); time.set(last); farm.tick();
  near(collected + farm.state.gold, FARM.workerOutput - FARM.workerWage);
});

test('farm reload preserves mature stock, young ages, pending produce and detached snapshots', t => {
  const time = clock(t), farm = createFarm(); farm.buyFarm(); farm.buyAnimal('chicken');
  time.advance(4); farm.buyAnimal('chicken');
  const snapshot = farm.serialize(), preserved = JSON.stringify(snapshot);
  const reloaded = createFarm(JSON.parse(preserved));
  time.advance(3); farm.tick(); reloaded.tick();
  assert.equal(reloaded.matureOf('chicken'), 1);
  near(reloaded.state.produce.egg, .5);
  assert.deepEqual(reloaded.serialize(), farm.serialize());
  assert.equal(JSON.stringify(snapshot), preserved);
});

test('legacy livestock progress migrates without changing counts or existing mature animals', t => {
  const time = clock(t), farm = createFarm({ owned: true, animals: { chicken: { count: 4, mature: 2, prog: 3 } }, workers: 1, produce: { egg: 7.5 }, gold: 5.7, lastTick: time.now });
  assert.equal(farm.countOf('chicken'), 4); assert.equal(farm.matureOf('chicken'), 2);
  time.advance(3); farm.tick();
  assert.equal(farm.matureOf('chicken'), 3);
  near(farm.state.produce.egg, 10.5);
  time.advance(3); farm.tick(); assert.equal(farm.matureOf('chicken'), 4);
});

test('each livestock species has the advertised maturity, sale value and capped production', t => {
  const time = clock(t), farm = createFarm(); farm.buyFarm();
  for (const def of LIVESTOCK) farm.buyAnimal(def.key);
  time.advance(600); farm.tick();
  for (const def of LIVESTOCK) {
    assert.equal(farm.countOf(def.key), 1); assert.equal(farm.matureOf(def.key), 1);
    if (def.produce) near(farm.state.produce[def.produce], (FARM.capMin - def.growMin) * def.ppm);
    assert.equal(farm.sellMature(def.key), def.sell);
    assert.equal(farm.countOf(def.key), 0);
    assert.equal(farm.sellMature(def.key), 0);
  }
  const produce = { ...farm.state.produce };
  time.advance(10); farm.tick(); assert.deepEqual(farm.state.produce, produce);
});

test('ownership and employee limits keep repeated purchases from applying a second transition', t => {
  clock(t); const economy = createEconomy(), farm = createFarm();
  assert.equal(farm.hireWorker(), false); assert.equal(farm.buyAnimal('chicken'), false);
  assert.equal(farm.buyFarm(), true); assert.equal(farm.buyFarm(), false);
  for (let i = 0; i < FARM.maxWorkers; i++) assert.equal(farm.hireWorker(), true);
  assert.equal(farm.canHire(), false); assert.equal(farm.hireWorker(), false);
  for (const def of BUSINESSES) {
    assert.equal(economy.upgrade(def.key), false); assert.equal(economy.hire(def.key), false);
    assert.equal(economy.found(def.key), true); assert.equal(economy.found(def.key), false);
    for (let i = 0; i < def.maxEmp; i++) assert.equal(economy.hire(def.key), true);
    assert.equal(economy.canHire(def.key), false); assert.equal(economy.hire(def.key), false);
    assert.equal(economy.empOf(def.key), def.maxEmp);
  }
});

test('damaged nested economic save fields normalize without losing intact holdings', t => {
  const time = clock(t);
  const economy = createEconomy({ lastTick: 'broken', businesses: {
    shop: { owned: true, level: '3', emp: '2', accrued: '7.25' },
    farm: { owned: true, level: -5, emp: 600, accrued: 'bad' },
    mystery: { owned: true, level: 50, emp: 20, accrued: 20000 },
  } });
  assert.equal(economy.levelOf('shop'), 3); assert.equal(economy.empOf('shop'), 2);
  near(economy.state.businesses.shop.accrued, 7.25);
  assert.equal(economy.levelOf('farm'), 1); assert.equal(economy.empOf('farm'), 5);
  assert.equal(economy.state.businesses.mystery, undefined);
  const farm = createFarm({ owned: true, workers: '2', gold: '5.75', produce: { egg: '3.5', milk: -9, missing: 40 }, animals: { chicken: { count: '4', mature: '2', prog: '3' }, cow: { count: 1, mature: 20, prog: -1 } }, lastTick: time.now });
  assert.equal(farm.workerCount(), 2); near(farm.state.gold, 5.75); near(farm.state.produce.egg, 3.5);
  assert.equal(farm.state.produce.missing, undefined); assert.equal(farm.matureOf('cow'), 1);
  time.advance(3); farm.tick(); assert.equal(farm.matureOf('chicken'), 3);
  assert.ok(Number.isFinite(farm.collectGold()));
});
