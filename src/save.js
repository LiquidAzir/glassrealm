import { WORLD_SCALE } from './scale.js';
import { createInventory } from './inventory.js';
import { ITEMS, CROPS, ENEMIES, FACTIONS, DYE_PALETTE } from './content.js';

const KEY = 'glassrealm.save.v1';
const record = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v) => Array.isArray(v) ? [...new Set(v.filter((s) => typeof s === 'string'))] : [];
const nonnegative = (v, fallback = 0) => Number.isFinite(v) && v >= 0 ? v : fallback;
const counter = (v) => Math.min(Number.MAX_SAFE_INTEGER, Math.floor(nonnegative(v)));
const counts = (v) => Object.fromEntries(Object.entries(record(v) ? v : {}).filter(([k]) => !['__proto__', 'constructor', 'prototype'].includes(k)).map(([k, n]) => [k, counter(n)]));

// Validate all save entry points before they reach renderers or replace local data.
// Optional damaged fields recover independently, preserving valid progress and old v1 saves.
export function normalizeSave(value) {
  if (!record(value) || !record(value.player) || !record(value.skills) || (value.v != null && value.v !== 1)) return null;
  const s = { ...value, v: 1, t: nonnegative(value.t) }, p = { ...value.player };
  s.player = p;
  for (const k of ['x', 'z', 'heading', 'hp', 'prayer']) if (!Number.isFinite(p[k])) delete p[k];
  if (p.prayer != null) p.prayer = Math.max(0, p.prayer);
  p.equipment = record(p.equipment) ? { ...p.equipment } : {};
  const cosmetic = record(p.cosmetic) ? p.cosmetic : {}, dyes = record(cosmetic.dyes) ? cosmetic.dyes : {};
  p.cosmetic = { dyes: {} };
  for (const slot of ['weapon', 'armor', 'shield']) {
    p.cosmetic[slot] = ITEMS[cosmetic[slot]]?.type === slot ? cosmetic[slot] : null;
    p.cosmetic.dyes[slot] = Object.values(DYE_PALETTE).includes(dyes[slot]) ? dyes[slot] : null;
  }
  for (const k of ['inventory', 'bank']) s[k] = createInventory(record(s[k]) ? s[k] : {}).serialize();
  for (const k of ['skills', 'prestige', 'quests', 'economy', 'farm', 'sagaChoices']) s[k] = record(s[k]) ? { ...s[k] } : {};
  for (const k of ['collection', 'pets', 'perksOwned', 'capesEarned', 'diaries', 'achievements', 'slayerPerks']) s[k] = strings(s[k]);
  for (const k of ['activePet', 'wornCape', 'tracked']) if (typeof s[k] !== 'string') delete s[k];
  if (!s.pets.includes(s.activePet)) delete s.activePet;
  if (!s.capesEarned.includes(s.wornCape)) delete s.wornCape;
  for (const k of ['colBest', 'trawlerBest', 'slayerPoints']) s[k] = counter(s[k]);
  s.deathMode = s.deathMode === 'safe' ? 'safe' : 'standard';
  s.audioMuted = s.audioMuted === true;
  if (!Number.isFinite(s.worldScale) || s.worldScale <= 0) delete s.worldScale;
  if (!Number.isFinite(s.tod)) delete s.tod; else s.tod = ((s.tod % 1) + 1) % 1;
  const stats = record(s.stats) ? s.stats : {};
  s.stats = { kills: counter(stats.kills), crafted: counter(stats.crafted), deaths: counter(stats.deaths), regions: strings(stats.regions), bosses: strings(stats.bosses), killsByType: counts(stats.killsByType) };
  const rep = record(s.factionRep) ? s.factionRep : {};
  s.factionRep = Object.fromEntries(Object.entries(FACTIONS).map(([k, d]) => [k, Math.min(nonnegative(rep[k]), d.tiers[d.tiers.length - 1].rep)]));
  s.market = { mult: Object.fromEntries(Object.entries(record(s.market?.mult) ? s.market.mult : {}).filter(([k, v]) => Object.hasOwn(ITEMS, k) && Number.isFinite(v) && v > 0).map(([k, v]) => [k, Math.max(.65, Math.min(1.55, v))])) };
  const sl = s.slayer;
  s.slayer = record(sl) && sl.active === true && Object.hasOwn(ENEMIES, sl.enemy) && counter(sl.count) > 0
    ? { active: true, enemy: sl.enemy, count: counter(sl.count), progress: Math.min(counter(sl.progress), counter(sl.count)) }
    : { active: false, enemy: null, count: 0, progress: 0 };
  if (!record(s.clue) || !Number.isFinite(s.clue.x) || !Number.isFinite(s.clue.z) || typeof s.clue.hint !== 'string') delete s.clue;
  const world = record(s.world) ? { ...s.world } : {};
  for (const k of ['lootedChests', 'foundDiscoveries', 'builtFurniture', 'waystonesAttuned']) world[k] = strings(world[k]);
  for (const k of ['choppedTrees', 'harvestedBushes']) world[k] = Array.isArray(world[k]) ? world[k].filter((i) => Number.isSafeInteger(i) && i >= 0) : [];
  world.plots = Array.isArray(world.plots) ? world.plots.filter((p) => record(p) && Number.isSafeInteger(p.idx) && p.idx >= 0 && ['growing', 'grown'].includes(p.state) && CROPS.some((c) => c.produce === p.crop)).map((p) => ({ idx: p.idx, state: p.state, crop: p.crop, grow: nonnegative(p.grow) })) : [];
  s.world = world;
  const gr = s.grave;
  if (record(gr) && Number.isFinite(gr.x) && Number.isFinite(gr.z) && nonnegative(gr.t) > 0) {
    s.grave = { x: gr.x, z: gr.z, t: Math.min(240, gr.t), items: createInventory(record(gr.items) ? gr.items : {}).serialize() };
    if (!Object.keys(s.grave.items).length) delete s.grave;
  } else delete s.grave;
  return s;
}

export function loadSave() {
  try { const s = localStorage.getItem(KEY); return s ? normalizeSave(JSON.parse(s)) : null; }
  catch (e) { return null; }
}

// Adopt a cloud save iff it is newer-or-equal to the local one (last-write-wins).
export function mergeRemoteSave(remote) {
  remote = normalizeSave(remote);
  if (!remote) return false;
  try {
    const local = loadSave();
    const lt = (local && local.t) || 0, rt = remote.t || 0;
    if (!local || rt >= lt) { localStorage.setItem(KEY, JSON.stringify(remote)); return true; }
  } catch (e) {}
  return false;
}

export function createSave(G) {
  function snapshot() {
    return {
      v: 1,
      equipmentOwnership: 1,
      t: Date.now(),                 // timestamp for cross-device last-write-wins merge

      player: (() => {
        // while inside a building the player sits on a far interior plot — persist
        // the door we came in by instead, so reloads put us back in town.
        const r = (G.inInterior && G.returnPos) ? G.returnPos : { x: G.player.position.x, z: G.player.position.z, heading: G.player.state.heading };
        return { x: r.x, z: r.z, heading: r.heading, hp: G.player.state.hp, prayer: G.player.state.prayer, equipment: { ...G.player.state.equipment }, cosmetic: G.cosmetic ? { weapon: G.cosmetic.weapon, armor: G.cosmetic.armor, shield: G.cosmetic.shield, dyes: { ...G.cosmetic.dyes } } : undefined, combatStance: G.player.state.combatStance };
      })(),
      skills: G.skills.serialize(),
      prestige: G.skills.serializePrestige(),
      inventory: G.inventory.serialize(),
      bank: { ...G.bankItems },
      economy: G.economy ? G.economy.serialize() : undefined,
      farm: G.farm ? G.farm.serialize() : undefined,
      quests: G.quests.serialize(),
      slayer: G.slayer ? { ...G.slayer } : undefined,
      slayerPoints: G.slayerPoints || 0,
      slayerPerks: G.slayerPerks ? [...G.slayerPerks] : [],
      tracked: G.trackedQuest || undefined,
      sagaChoices: (G.sagaChoices && Object.keys(G.sagaChoices).length) ? { ...G.sagaChoices } : undefined,   // branching saga-finale outcomes
      audioMuted: G.audio ? G.audio.muted : false,
      worldScale: WORLD_SCALE,
      tod: (typeof G.tod === 'number') ? G.tod : undefined,   // time-of-day continuity across reloads
      collection: G.collection ? [...G.collection] : [],
      pets: G.pets ? [...G.pets] : [],
      activePet: G.activePet || undefined,
      perksOwned: G.perksOwned ? [...G.perksOwned] : [],
      capesEarned: G.capesEarned ? [...G.capesEarned] : [],
      wornCape: G.wornCape || undefined,
      colBest: G.colBest || 0,
      trawlerBest: G.trawlerBest || 0,
      factionRep: G.factionRep ? { ...G.factionRep } : undefined,
      clue: G.activeClue || undefined,
      diaries: G.diaries ? [...G.diaries] : [],
      deathMode: G.deathMode || 'standard',
      market: G.market ? { mult: G.market.mult } : undefined,
      grave: G.grave ? { x: G.grave.x, z: G.grave.z, items: G.grave.items, t: G.grave.t } : undefined,
      stats: G.stats ? { kills: G.stats.kills, crafted: G.stats.crafted, deaths: G.stats.deaths || 0, regions: [...G.stats.regions], bosses: [...G.stats.bosses], killsByType: { ...G.stats.killsByType } } : undefined,
      achievements: G.ach ? [...G.ach.unlocked] : undefined,
      world: {
        choppedTrees: G.world.trees.filter((t) => !t.alive).map((t) => t.idx),
        harvestedBushes: G.world.bushes.filter((b) => !b.alive).map((b) => b.idx),
        lootedChests: G.world.stations.filter((s) => s.kind === 'chest' && s.looted).map((s) => s.label),
        foundDiscoveries: (G.world.discoveries || []).filter((d) => d.found).map((d) => d.key),
        builtFurniture: G.world.houseFurniture ? Object.keys(G.world.houseFurniture).filter((k) => G.world.houseFurniture[k].built) : [],
        waystonesAttuned: G.waystonesAttuned ? [...G.waystonesAttuned] : [],
        plots: (G.world.plots || []).map((p, idx) => ({ idx, state: p.state, crop: p.crop, grow: p.grow })).filter((p) => p.state !== 'empty'),
      },
    };
  }
  return {
    /* cloud-write-reduce-v1: save() is LOCAL ONLY now (localStorage). Cloud push is
       decoupled and driven by main.js (5-min safety net + hide/pagehide flush). This
       stops the 15s autosave from exhausting the shared Cloudflare KV daily write cap. */
    save() { try { const snap = snapshot(); localStorage.setItem(KEY, JSON.stringify(snap)); return true; } catch (e) { return false; } },
    snapshot,   // exposed so main.js can feed the cloud safety-net / flush pushes
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} },
    // Portable save string so the same game can move across glasses / phone / PC.
    exportCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot())))); } catch (e) { return ''; } },
    importCode(code) {
      try {
        const obj = normalizeSave(JSON.parse(decodeURIComponent(escape(atob((code || '').trim())))));
        if (!obj) return false;
        obj.t = Date.now();   // importing is an explicit new local choice
        localStorage.setItem(KEY, JSON.stringify(obj));
        return true;
      } catch (e) { return false; }
    },
  };
}
