import { dist2D } from './util.js';

// Picks the nearest interactable within its range — forgiving on a tiny display
// (no precise aiming needed). Enemies have a short range so you must close in.
export function createInteraction(G) {
  const RANGE = { tree: 3.4, bush: 3.0, npc: 3.8, enemy: 2.7 };
  function best() {
    const p = G.player.position;
    let bestC = null, bestD = Infinity;
    const consider = (kind, ref, x, z, label) => {
      const d = dist2D(p.x, p.z, x, z);
      if (d <= RANGE[kind] && d < bestD) { bestD = d; bestC = { kind, ref, x, z, label, dist: d }; }
    };
    for (const t of G.world.trees) if (t.alive) consider('tree', t, t.x, t.z, 'Chop tree');
    for (const b of G.world.bushes) if (b.alive) consider('bush', b, b.x, b.z, 'Forage berries');
    for (const n of G.entities.npcs) consider('npc', n, n.pos.x, n.pos.z, 'Talk to ' + n.def.name);
    for (const e of G.entities.enemies) if (e.alive) consider('enemy', e, e.pos.x, e.pos.z, 'Attack ' + e.def.name);
    return bestC;
  }
  return { best, RANGE };
}
