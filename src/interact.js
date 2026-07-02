import { dist2D } from './util.js';

// Picks the nearest interactable within its range. Enemy range scales with the
// equipped weapon (a bow/staff lets you target far foes), and ranged/magic styles
// prioritise enemies so nearby trees/NPCs don't steal a tap mid-fight.
export function createInteraction(G) {
  const RANGE = { tree: 3.4, bush: 3.0, ore: 3.2, fish: 4.6, hive: 3.2, station: 3.8, plot: 3.2, stall: 3.2, shortcut: 3.2, npc: 3.8, mob: 3.6, discovery: 3.8, ferry: 4.2, dig: 8, tame: 3.0, enemy: 2.7 };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function nearestEnemy(p, range) {
    let best = null, bd2 = range * range;
    for (const e of G.entities.enemies) {
      if (!e.alive) continue;
      const dx = p.x - e.pos.x, dz = p.z - e.pos.z, d2 = dx * dx + dz * dz;
      if (d2 <= bd2) { bd2 = d2; best = { kind: 'enemy', ref: e, x: e.pos.x, z: e.pos.z, label: 'Attack ' + e.def.name, dist: Math.sqrt(d2) }; }
    }
    return best;
  }

  function best() {
    const p = G.player.position;
    if (G.inInterior) {   // inside a building: only the room's stations are interactable
      let bc = null, bd2 = 3.6 * 3.6;
      for (const s of (G.interiorStations || [])) { const dx = p.x - s.x, dz = p.z - s.z, d2 = dx * dx + dz * dz; if (d2 <= bd2) { bd2 = d2; bc = { kind: 'station', ref: s, x: s.x, z: s.z, label: s.label, dist: Math.sqrt(d2) }; } }
      return bc;
    }
    const w = G.player.weapon();
    // squared distances throughout — avoids a sqrt for every object every frame
    let bestC = null, bestD2 = Infinity;
    const consider = (kind, ref, x, z, label) => {
      const dx = p.x - x, dz = p.z - z, d2 = dx * dx + dz * dz, r = RANGE[kind];
      if (d2 <= r * r && d2 < bestD2) { bestD2 = d2; bestC = { kind, ref, x, z, label, dist: Math.sqrt(d2) }; }
    };
    // PERF: max interact range is ~5 units — skip anything beyond 6 units (cheap dx/dz pre-check avoids sqrt for ~99% of objects)
    const px = p.x, pz = p.z, CUT = 6;
    const near = (x, z) => { const dx = px - x, dz = pz - z; return dx > -CUT && dx < CUT && dz > -CUT && dz < CUT; };
    for (const t of G.world.trees) if (t.alive && near(t.x, t.z)) consider('tree', t, t.x, t.z, 'Chop tree');
    for (const b of G.world.bushes) if (b.alive && near(b.x, b.z)) consider('bush', b, b.x, b.z, 'Forage berries');
    for (const o of G.world.oreNodes) if (o.alive && near(o.x, o.z)) consider('ore', o, o.x, o.z, 'Mine ' + cap(o.type));
    for (const f of G.world.fishingSpots) if (near(f.x, f.z)) consider('fish', f, f.x, f.z, 'Fish here');
    for (const h of (G.world.hives || [])) if (h.alive && near(h.x, h.z)) consider('hive', h, h.x, h.z, 'Rob the beehive');
    for (const s of G.world.stations) if (near(s.x, s.z)) consider('station', s, s.x, s.z, 'Use ' + s.label);
    for (const pl of G.world.plots) if (near(pl.x, pl.z)) consider('plot', pl, pl.x, pl.z, pl.state === 'grown' ? 'Harvest crop' : pl.state === 'growing' ? 'Crop growing…' : 'Plant seeds');
    for (const st of G.world.stalls) if (near(st.x, st.z)) consider('stall', st, st.x, st.z, st.cooldown > 0 ? 'Stall (watched)' : 'Steal from stall');
    for (const sc of G.world.shortcuts) if (near(sc.x, sc.z)) consider('shortcut', sc, sc.x, sc.z, `Shortcut: ${sc.name} (Agility ${sc.level})`);
    for (const f of G.world.ferries) if (near(f.x, f.z)) consider('ferry', f, f.x, f.z, 'Take the ferry');
    for (const n of G.entities.npcs) if (near(n.pos.x, n.pos.z)) consider('npc', n, n.pos.x, n.pos.z, 'Talk to ' + n.def.name);
    for (const m of (G.entities.mobs || [])) if (near(m.pos.x, m.pos.z)) consider('mob', m, m.pos.x, m.pos.z, m.prisoner ? 'Talk to the prisoner' : 'Talk to ' + (m.def.name || 'the watch'));   // ambient guards / wanderers / prisoner
    for (const a of (G.entities.animals || [])) if (near(a.pos.x, a.pos.z) && !(G.pets && G.pets.has(a.kind))) consider('tame', a, a.pos.x, a.pos.z, 'Tame ' + cap(a.kind));
    for (const d of G.world.discoveries) {
      if (!near(d.x, d.z)) continue;
      if (d.repeat) { if (d.cooldown <= 0) consider('discovery', d, d.x, d.z, d.prompt || 'Use'); }
      else if (!d.found) consider('discovery', d, d.x, d.z, d.prompt || 'Investigate');
    }
    if (G.activeClue) consider('dig', G.activeClue, G.activeClue.x, G.activeClue.z, 'Dig here (clue)');

    // Enemy targeting: a bow/staff reaches out to weapon range. Attack when nothing
    // else is in reach, or when a foe is in melee range and at least as close — so a
    // station/NPC/chest you're standing on still wins with a weapon equipped.
    const enemy = nearestEnemy(p, Math.max(RANGE.enemy, w.range));
    const enemyReach = (w.style === 'ranged' || w.style === 'magic') ? w.range : RANGE.enemy;   // bow/staff can attack far foes, not just melee-range
    if (enemy && (!bestC || (enemy.dist <= enemyReach && enemy.dist * enemy.dist <= bestD2))) return enemy;
    return bestC;
  }
  return { best, RANGE };
}
