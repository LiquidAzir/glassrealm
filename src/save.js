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
        equipment: { weapon: G.player.state.equipment.weapon, armor: G.player.state.equipment.armor },
      },
      skills: G.skills.serialize(),
      inventory: G.inventory.serialize(),
      bank: { ...G.bankItems },
      quests: G.quests.serialize(),
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
