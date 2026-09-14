// Farm bookkeeping uses real elapsed time, capped while away. Each purchased
// animal grows independently; only time actually spent mature yields produce.
import { LIVESTOCK, FARM } from './content.js';

const CAP_MS = FARM.capMin * 60 * 1000;
const defOf = key => LIVESTOCK.find(def => def.key === key);
const nonnegative = (value, fallback = 0) => {
  const n = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, n) : fallback;
};
const whole = value => Math.floor(nonnegative(value));

export function createFarm(saved) {
  const state = { owned: saved?.owned === true, animals: {}, workers: 0, produce: {}, gold: 0, lastTick: Date.now() };
  if (saved) {
    state.lastTick = nonnegative(saved.lastTick, state.lastTick);
    state.workers = Math.min(FARM.maxWorkers, whole(saved.workers));
    state.gold = nonnegative(saved.gold);
    for (const def of LIVESTOCK) {
      if (def.produce) {
        const amount = nonnegative(saved.produce && saved.produce[def.produce]);
        if (amount > 0) state.produce[def.produce] = amount;
      }
      const raw = saved.animals && saved.animals[def.key];
      if (!raw || typeof raw !== 'object') continue;
      const count = whole(raw.count), mature = Math.min(count, whole(raw.mature));
      const a = { count, mature, prog: 0, young: [] };
      let remaining = count - mature;
      if (Array.isArray(raw.young)) {
        for (const cohort of raw.young) {
          if (!cohort || remaining <= 0) continue;
          const n = Math.min(remaining, whole(cohort.count));
          if (n > 0) { a.young.push({ count: n, age: Math.min(def.growMin, nonnegative(cohort.age)) }); remaining -= n; }
        }
      } else if (remaining > 0 && nonnegative(raw.prog) > 0) {
        // Legacy saves tracked one growing animal. Preserve that earned progress,
        // the already mature herd, and every other young animal without inventing ages.
        a.young.push({ count: 1, age: Math.min(def.growMin, nonnegative(raw.prog)) }); remaining--;
      }
      if (remaining > 0) a.young.push({ count: remaining, age: 0 });
      a.prog = a.young.reduce((oldest, cohort) => Math.max(oldest, cohort.age), 0);
      state.animals[def.key] = a;
    }
  }
  const animal = key => state.animals[key] || (state.animals[key] = { count: 0, mature: 0, prog: 0, young: [] });

  function accrue() {
    const now = Date.now();
    if (now <= state.lastTick) return;
    const minutes = Math.min(CAP_MS, now - state.lastTick) / 60000;
    state.lastTick = now;
    if (!state.owned) return;
    for (const def of LIVESTOCK) {
      const a = state.animals[def.key];
      if (!a || a.count <= 0) continue;
      let matureMinutes = a.mature * minutes;
      const young = [];
      for (const cohort of a.young) {
        const remaining = Math.max(0, def.growMin - cohort.age);
        if (minutes + 1e-9 >= remaining) {
          a.mature += cohort.count;
          matureMinutes += cohort.count * Math.max(0, minutes - remaining);
        } else young.push({ count: cohort.count, age: cohort.age + minutes });
      }
      a.young = young;
      a.prog = young.reduce((oldest, cohort) => Math.max(oldest, cohort.age), 0);
      if (def.produce && matureMinutes > 0) state.produce[def.produce] = Math.min(Number.MAX_SAFE_INTEGER, (state.produce[def.produce] || 0) + matureMinutes * def.ppm);
    }
    state.gold = Math.min(Number.MAX_SAFE_INTEGER, state.gold + state.workers * Math.max(0, FARM.workerOutput - FARM.workerWage) * minutes);
  }

  return {
    state,
    owned: () => state.owned,
    buyFarm: () => { accrue(); if (state.owned) return false; state.owned = true; return true; },
    countOf: key => state.animals[key]?.count || 0,
    matureOf: key => state.animals[key]?.mature || 0,
    buyAnimal: key => {
      accrue(); if (!state.owned || !defOf(key)) return false;
      const a = animal(key); if (a.count >= Number.MAX_SAFE_INTEGER) return false;
      a.count++;
      const newborn = a.young.find(cohort => cohort.age === 0);
      if (newborn) newborn.count++; else a.young.push({ count: 1, age: 0 });
      return true;
    },
    sellMature: key => { accrue(); const a = state.animals[key], def = defOf(key); if (!state.owned || !def || !a || a.mature <= 0) return 0; a.mature--; a.count--; return def.sell; },
    workerCount: () => state.workers,
    canHire: () => state.owned && state.workers < FARM.maxWorkers,
    hireCost: () => Math.round(FARM.workerCost * (1 + state.workers * 0.6)),
    hireWorker: () => { accrue(); if (!state.owned || state.workers >= FARM.maxWorkers) return false; state.workers++; return true; },
    netGoldPerMin: () => state.owned ? state.workers * Math.max(0, FARM.workerOutput - FARM.workerWage) : 0,
    goldAccrued: () => Math.floor(state.gold),
    collectGold: () => { accrue(); const gold = Math.floor(state.gold); state.gold -= gold; return gold; },
    produceAccrued: () => { const out = {}; for (const key in state.produce) { const n = Math.floor(state.produce[key]); if (n > 0) out[key] = n; } return out; },
    collectProduce: () => { accrue(); const out = {}; for (const key in state.produce) { const n = Math.floor(state.produce[key]); if (n > 0) { out[key] = n; state.produce[key] -= n; } } return out; },
    tick: accrue,
    serialize: () => ({
      owned: state.owned, workers: state.workers, produce: { ...state.produce }, gold: state.gold, lastTick: state.lastTick,
      animals: Object.fromEntries(Object.entries(state.animals).map(([key, a]) => [key, { ...a, young: a.young.map(cohort => ({ ...cohort })) }])),
    }),
  };
}
