import { dist2D } from './util.js';

// Picks the nearest interactable within its range. Enemy range scales with the
// equipped weapon (a bow/staff lets you target far foes), and ranged/magic styles
// prioritise enemies so nearby trees/NPCs don't steal a tap mid-fight.
export function createInteraction(G) {
  const RANGE = { tree: 3.4, bush: 3.0, ore: 3.2, fish: 4.6, station: 3.8, plot: 3.2, stall: 3.2, shortcut: 3.2, npc: 3.8, enemy: 2.7 };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function nearestEnemy(p, range) {
    let best = null, bd = range;
    for (const e of G.entities.enemies) {
      if (!e.alive) continue;
      const d = dist2D(p.x, p.z, e.pos.x, e.pos.z);
      if (d <= bd) { bd = d; best = { kind: 'enemy', ref: e, x: e.pos.x, z: e.pos.z, label: 'Attack ' + e.def.name, dist: d }; }
    }
    return best;
  }

  function best() {
    const p = G.player.position;
    if (G.inInterior) {   // inside a building: only the room's stations are interactable
      let bc = null, bd = 3.6;
      for (const s of (G.interiorStations || [])) { const d = dist2D(p.x, p.z, s.x, s.z); if (d <= bd) { bd = d; bc = { kind: 'station', ref: s, x: s.x, z: s.z, label: s.label, dist: d }; } }
      return bc;
    }
    const w = G.player.weapon();
    let bestC = null, bestD = Infinity;
    const consider = (kind, ref, x, z, label) => {
      const d = dist2D(p.x, p.z, x, z);
      if (d <= RANGE[kind] && d < bestD) { bestD = d; bestC = { kind, ref, x, z, label, dist: d }; }
    };
    for (const t of G.world.trees) if (t.alive) consider('tree', t, t.x, t.z, 'Chop tree');
    for (const b of G.world.bushes) if (b.alive) consider('bush', b, b.x, b.z, 'Forage berries');
    for (const o of G.world.oreNodes) if (o.alive) consider('ore', o, o.x, o.z, 'Mine ' + cap(o.type));
    for (const f of G.world.fishingSpots) consider('fish', f, f.x, f.z, 'Fish here');
    for (const s of G.world.stations) consider('station', s, s.x, s.z, 'Use ' + s.label);
    for (const pl of G.world.plots) consider('plot', pl, pl.x, pl.z, pl.state === 'grown' ? 'Harvest crop' : pl.state === 'growing' ? 'Crop growing…' : 'Plant seeds');
    for (const st of G.world.stalls) consider('stall', st, st.x, st.z, st.cooldown > 0 ? 'Stall (watched)' : 'Steal from stall');
    for (const sc of G.world.shortcuts) consider('shortcut', sc, sc.x, sc.z, `Shortcut: ${sc.name} (Agility ${sc.level})`);
    for (const n of G.entities.npcs) consider('npc', n, n.pos.x, n.pos.z, 'Talk to ' + n.def.name);

    // Enemy targeting: a bow/staff reaches out to weapon range. Attack when nothing
    // else is in reach, or when a foe is in melee range and at least as close — so a
    // station/NPC/chest you're standing on still wins with a weapon equipped.
    const enemy = nearestEnemy(p, Math.max(RANGE.enemy, w.range));
    if (enemy && (!bestC || (enemy.dist <= RANGE.enemy && enemy.dist <= bestD))) return enemy;
    return bestC;
  }
  return { best, RANGE };
}
