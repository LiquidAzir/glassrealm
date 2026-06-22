// Your own farmstead: buy the land, raise livestock (they mature + produce goods over real
// time, even while closed — capped), hire farmhands that run it for passive coin, and sell
// mature animals + produce for profit. Pure data/bookkeeping; UI + gold transfers live in main.js.
import { LIVESTOCK, FARM } from './content.js';

const CAP_MS = FARM.capMin * 60 * 1000;
const defOf = (k) => LIVESTOCK.find((l) => l.key === k);

export function createFarm(saved) {
  const state = { owned: false, animals: {}, workers: 0, produce: {}, gold: 0, lastTick: Date.now() };
  if (saved) {
    state.owned = !!saved.owned;
    state.animals = saved.animals || {};
    state.workers = saved.workers || 0;
    state.produce = saved.produce || {};
    state.gold = saved.gold || 0;
    if (saved.lastTick) state.lastTick = saved.lastTick;
  }
  const A = (k) => state.animals[k] || (state.animals[k] = { count: 0, mature: 0, prog: 0 });

  // advance growth + produce + worker income since the last tick (offline catch-up + live)
  function accrue() {
    const now = Date.now();
    let ms = now - (state.lastTick || now);
    state.lastTick = now;
    if (ms < 0) ms = 0;
    if (ms > CAP_MS) ms = CAP_MS;
    const min = ms / 60000;
    if (!state.owned || min <= 0) return;
    for (const def of LIVESTOCK) {
      const a = state.animals[def.key];
      if (!a || a.count <= 0) continue;
      a.prog = (a.prog || 0) + min;
      while (a.prog >= def.growMin && a.mature < a.count) { a.mature++; a.prog -= def.growMin; }
      if (a.mature >= a.count) a.prog = Math.min(a.prog, def.growMin);   // don't bank progress with no young left
      if (def.produce && a.mature > 0) state.produce[def.produce] = (state.produce[def.produce] || 0) + a.mature * def.ppm * min;
    }
    if (state.workers > 0) state.gold += state.workers * Math.max(0, FARM.workerOutput - FARM.workerWage) * min;
  }

  return {
    state,
    owned: () => state.owned,
    buyFarm: () => { accrue(); state.owned = true; },
    countOf: (k) => A(k).count,
    matureOf: (k) => A(k).mature,
    buyAnimal: (k) => { accrue(); A(k).count++; },
    sellMature: (k) => { accrue(); const a = A(k), def = defOf(k); if (a.mature <= 0) return 0; a.mature--; a.count--; return def.sell; },
    workerCount: () => state.workers,
    canHire: () => state.workers < FARM.maxWorkers,
    hireCost: () => Math.round(FARM.workerCost * (1 + state.workers * 0.6)),
    hireWorker: () => { accrue(); state.workers++; },
    netGoldPerMin: () => state.workers * Math.max(0, FARM.workerOutput - FARM.workerWage),
    goldAccrued: () => Math.floor(state.gold),
    collectGold: () => { accrue(); const g = Math.floor(state.gold); state.gold = 0; return g; },
    produceAccrued: () => { const o = {}; for (const k in state.produce) { const n = Math.floor(state.produce[k]); if (n > 0) o[k] = n; } return o; },
    collectProduce: () => { accrue(); const o = {}; for (const k in state.produce) { const n = Math.floor(state.produce[k]); if (n > 0) { o[k] = n; state.produce[k] -= n; } } return o; },
    tick: accrue,
    serialize: () => ({ owned: state.owned, animals: state.animals, workers: state.workers, produce: state.produce, gold: state.gold, lastTick: state.lastTick }),
  };
}
