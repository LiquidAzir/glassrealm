const KEY = 'glassrealm.save.v1';

export function loadSave() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; }
  catch (e) { return null; }
}

export function createSave(G) {
  function snapshot() {
    return {
      v: 1,
      player: {
        x: G.player.position.x, z: G.player.position.z,
        heading: G.player.state.heading, hp: G.player.state.hp,
        equipment: { ...G.player.state.equipment },
      },
      skills: G.skills.serialize(),
      prestige: G.skills.serializePrestige(),
      inventory: G.inventory.serialize(),
      bank: { ...G.bankItems },
      quests: G.quests.serialize(),
      slayer: G.slayer ? { ...G.slayer } : undefined,
      audioMuted: G.audio ? G.audio.muted : false,
      stats: G.stats ? { kills: G.stats.kills, crafted: G.stats.crafted, regions: [...G.stats.regions], bosses: [...G.stats.bosses], killsByType: { ...G.stats.killsByType } } : undefined,
      achievements: G.ach ? [...G.ach.unlocked] : undefined,
      world: {
        choppedTrees: G.world.trees.filter((t) => !t.alive).map((t) => t.idx),
        harvestedBushes: G.world.bushes.filter((b) => !b.alive).map((b) => b.idx),
      },
    };
  }
  return {
    save() { try { localStorage.setItem(KEY, JSON.stringify(snapshot())); } catch (e) {} },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} },
  };
}
