import { WORLD_SCALE } from './scale.js';

const KEY = 'glassrealm.save.v1';

export function loadSave() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; }
  catch (e) { return null; }
}

// Adopt a cloud save iff it is newer-or-equal to the local one (last-write-wins).
export function mergeRemoteSave(remote) {
  if (!remote || !remote.player) return false;
  try {
    let local = null; try { local = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    const lt = (local && local.t) || 0, rt = remote.t || 0;
    if (!local || rt >= lt) { localStorage.setItem(KEY, JSON.stringify(remote)); return true; }
  } catch (e) {}
  return false;
}

export function createSave(G) {
  function snapshot() {
    return {
      v: 1,
      t: Date.now(),                 // timestamp for cross-device last-write-wins merge

      player: (() => {
        // while inside a building the player sits on a far interior plot — persist
        // the door we came in by instead, so reloads put us back in town.
        const r = (G.inInterior && G.returnPos) ? G.returnPos : { x: G.player.position.x, z: G.player.position.z, heading: G.player.state.heading };
        return { x: r.x, z: r.z, heading: r.heading, hp: G.player.state.hp, prayer: G.player.state.prayer, equipment: { ...G.player.state.equipment }, combatStance: G.player.state.combatStance };
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
      audioMuted: G.audio ? G.audio.muted : false,
      worldScale: WORLD_SCALE,
      collection: G.collection ? [...G.collection] : [],
      pets: G.pets ? [...G.pets] : [],
      activePet: G.activePet || undefined,
      perksOwned: G.perksOwned ? [...G.perksOwned] : [],
      capesEarned: G.capesEarned ? [...G.capesEarned] : [],
      wornCape: G.wornCape || undefined,
      colBest: G.colBest || 0,
      trawlerBest: G.trawlerBest || 0,
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
      },
    };
  }
  return {
    save() { try { const snap = snapshot(); localStorage.setItem(KEY, JSON.stringify(snap)); if (G.cloud) G.cloud.push(snap); } catch (e) {} },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} },
    // Portable save string so the same game can move across glasses / phone / PC.
    exportCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot())))); } catch (e) { return ''; } },
    importCode(code) {
      try {
        const obj = JSON.parse(decodeURIComponent(escape(atob((code || '').trim()))));
        if (!obj || !obj.player || !obj.skills) return false;
        localStorage.setItem(KEY, JSON.stringify(obj));
        return true;
      } catch (e) { return false; }
    },
  };
}
