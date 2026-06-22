import * as THREE from 'three';
import { TAU, clamp, smoothstep, mulberry32, dist2D, distToSeg } from './util.js';
import { DISCOVERIES, NPCS, WANDERERS, ENEMY_SPAWNS, QUESTS } from './content.js';
import { WORLD_SCALE as WS } from './scale.js';

// ============================================================================
// MODULAR WORLD — one contiguous heightfield (no loading zones).
// To grow the map: add an entry to REGIONS and a link to BRIDGE_LINKS. That's it.
// A region = an island with a biome (palette + prop kinds), optional peak, and
// optional village. Bridges are auto-computed edge-to-edge between linked regions.
// ============================================================================

const WATER_Y = 0;

const BIOMES = {
  grass:    { sea: 0x123842, sand: 0xe6d29a, low: 0x66c97a, low2: 0x4fae84, high: 0x9aa6b2, peak: 0xeaf2ff, fol: [0x3f9d5a, 0x5fc77d], trunk: 0x6e4a2b },
  forest:   { sea: 0x123842, sand: 0xd8cf9a, low: 0x3f8f56, low2: 0x2f7a48, high: 0x8a9a7a, peak: 0xcfe0d0, fol: [0x2f7a48, 0x46a166], trunk: 0x5c4326 },
  desert:   { sea: 0x16566a, sand: 0xe6d49a, low: 0xe3c277, low2: 0xd6b25e, high: 0xc9a05a, peak: 0xf1e4b4, fol: [0x4a8f5a, 0x5aa56a], trunk: 0x6e4a2b },
  snow:     { sea: 0x2a4a66, sand: 0xdfe8f2, low: 0xeaf2ff, low2: 0xd6e4f4, high: 0xb8c6d6, peak: 0xffffff, fol: [0xbcd0e0, 0xe8f2ff], trunk: 0x5a5350 },
  volcanic: { sea: 0x123842, sand: 0xd7be8e, low: 0xb07045, low2: 0x9c6a3f, high: 0x8f8a86, peak: 0xff8a3d, fol: [0xc9742e, 0xe39a3c], trunk: 0x5a4632 },
  swamp:    { sea: 0x163a3a, sand: 0x6a6a4a, low: 0x4a6a44, low2: 0x3a5a3e, high: 0x5a5e4a, peak: 0x7a8a6a, fol: [0x3a5a36, 0x4f6a40], trunk: 0x40342a },
  jungle:   { sea: 0x0e5a52, sand: 0xcdbf86, low: 0x2faa4a, low2: 0x1f8a3e, high: 0x6a8a3a, peak: 0xc8e0a0, fol: [0x1f9a3e, 0x4fd06a], trunk: 0x4a3520 },
  badlands: { sea: 0x2a4a52, sand: 0xc99a5a, low: 0xb5622e, low2: 0x9a4f28, high: 0x7a3a22, peak: 0xe0b080, fol: [0x8a6a3a, 0xa07a44], trunk: 0x5a3a22 },
  highland: { sea: 0x2a4a66, sand: 0x9aa0a8, low: 0x6a7a6a, low2: 0x566a58, high: 0x8a93a0, peak: 0xf4f8ff, fol: [0x4a6a52, 0x6a8a6a], trunk: 0x55534e },
  fae:      { sea: 0x241a5a, sand: 0x8a7ab0, low: 0x6a4a9a, low2: 0x7a3a9a, high: 0x9a6abf, peak: 0xe0c8ff, fol: [0xb04acf, 0x6a8aff], trunk: 0x9a8ab0 },
  coast:    { sea: 0x1aa6b8, sand: 0xf0e2b2, low: 0x6ec98a, low2: 0x54b6a2, high: 0x9aa6b2, peak: 0xeaf2ff, fol: [0x4fae84, 0x6ec98a], trunk: 0x6e4a2b },
  autumn:   { sea: 0x123842, sand: 0xd8c89a, low: 0xd07a2e, low2: 0xb5602a, high: 0x8a7a5a, peak: 0xf0d0a0, fol: [0xe0852e, 0xf0b040], trunk: 0x5c4326 },
};

const REGIONS = [
  { key: 'verdant', x: 0,   z: 0,   r: 54, biome: 'grass',    village: { name: 'Hearth Village', x: 6, z: -12, hut: [0xcaa878, 0x9a4f3a] }, peak: { x: 0, z: -36, r: 20, h: 9 },  tree: 'pine',   nTree: 36, nBush: 14, nRock: 14, nFish: 5, ore: [['copper', 6]] },
  { key: 'forest',  x: -96, z: 14,  r: 42, biome: 'forest',                                                                                  peak: { x: -104, z: 2, r: 18, h: 7 }, tree: 'pine',   nTree: 52, nBush: 12, nRock: 8,  nFish: 3, ore: [['copper', 4]] },
  { key: 'desert',  x: 26,  z: 104, r: 46, biome: 'desert',   village: { name: 'Sunspire Oasis', x: 26, z: 104, hut: [0xd9b98a, 0xc09050] },                                       tree: 'cactus', nTree: 22, nBush: 3,  nRock: 12, nFish: 3, ore: [['iron', 5]] },
  { key: 'snow',    x: 98,  z: -86, r: 44, biome: 'snow',                                                                                     peak: { x: 98, z: -92, r: 22, h: 12 }, tree: 'pine',  nTree: 30, nBush: 5,  nRock: 10, nFish: 3, ore: [['coal', 5]] },
  { key: 'ember',   x: 116, z: 8,   r: 46, biome: 'volcanic', village: { name: 'Emberhold', x: 110, z: 18, hut: [0xb98c63, 0x6b4636], smithy: true }, peak: { x: 122, z: -4, r: 17, h: 11 }, tree: 'pine', nTree: 14, nBush: 0, nRock: 16, nFish: 4, ore: [['iron', 5], ['coal', 4]] },
  { key: 'mistmoor', x: -72, z: 80, r: 30, biome: 'swamp', village: { name: "Mire's End", x: -80, z: 86, hut: [0x6a5a44, 0x3a4a36] }, tree: 'pine', nTree: 20, nBush: 10, nRock: 6, nFish: 3, ore: [['coal', 3]] },
  { key: 'tideisle', x: 60, z: 70, r: 24, biome: 'grass', tree: 'pine', nTree: 8, nBush: 4, nRock: 8, nFish: 4, ore: [['iron', 3]] },
  { key: 'jungle',   x: 196, z: 36,  r: 48, biome: 'jungle',   village: { name: 'Kytari Hollow', x: 184, z: 28, hut: [0x3a6a3a, 0x9a4f3a] }, peak: { x: 208, z: 22, r: 16, h: 9 },  tree: 'pine',   nTree: 64, nBush: 18, nRock: 8,  nFish: 4, ore: [['copper', 4], ['iron', 3]] },
  { key: 'badlands', x: 150, z: 118, r: 44, biome: 'badlands',                                                                            peak: { x: 160, z: 126, r: 16, h: 10 }, tree: 'cactus', nTree: 16, nBush: 2,  nRock: 20, nFish: 2, ore: [['iron', 5], ['coal', 5]] },
  { key: 'highland', x: -158, z: -38, r: 48, biome: 'highland', village: { name: 'Stormhold', x: -158, z: -32, hut: [0x6a7280, 0x3a4a58] }, peak: { x: -168, z: -52, r: 22, h: 15 }, tree: 'pine', nTree: 28, nBush: 6,  nRock: 18, nFish: 3, ore: [['coal', 4], ['iron', 4]] },
  { key: 'glade',    x: -25, z: -110, r: 46, biome: 'fae',      village: { name: 'Moonwell', x: -25, z: -100, hut: [0x6a4a9a, 0x3a2a6a] }, peak: { x: -34, z: -124, r: 14, h: 8 },  tree: 'pine',   nTree: 44, nBush: 20, nRock: 8,  nFish: 4, ore: [['copper', 3]] },
  // --- Expansion III: a southern harbour town + a northern autumn town ---
  { key: 'saltcrest', x: 80, z: 185, r: 46, biome: 'coast',  village: { name: 'Saltcrest Harbor', x: 80, z: 185, hut: [0x8aa6b6, 0x355a68], smithy: true }, tree: 'pine', nTree: 20, nBush: 8,  nRock: 12, nFish: 8, ore: [['iron', 4], ['copper', 3]] },
  { key: 'amberfell', x: 50, z: -160, r: 42, biome: 'autumn', village: { name: 'Amberfell',       x: 50, z: -160, hut: [0xb5752e, 0x6a3a22] }, peak: { x: 58, z: -172, r: 14, h: 8 }, tree: 'pine', nTree: 48, nBush: 16, nRock: 8,  nFish: 4, ore: [['copper', 4], ['coal', 3]] },
];
// Region links with a transition TYPE: 'causeway' = rustic plank land bridge (the classic),
// 'isthmus' = a wide natural land neck where the islands nearly merge (clean, no built deck),
// 'span' = a grand built stone-arch bridge (distinct). A bare [a,b] defaults to causeway.
// The last two are extra cross-links so the world is a connected NETWORK with loops, not a chain.
const BRIDGE_LINKS = [
  ['verdant', 'ember', 'span'], ['verdant', 'forest', 'isthmus'], ['verdant', 'desert', 'causeway'],
  ['verdant', 'glade', 'isthmus'], ['ember', 'snow', 'span'], ['ember', 'jungle', 'causeway'],
  ['forest', 'mistmoor', 'isthmus'], ['forest', 'highland', 'span'], ['desert', 'tideisle', 'causeway'],
  ['desert', 'saltcrest', 'span'], ['badlands', 'saltcrest', 'causeway'], ['jungle', 'badlands', 'isthmus'],
  ['glade', 'amberfell', 'causeway'], ['snow', 'amberfell', 'span'],
  ['verdant', 'tideisle', 'isthmus'], ['ember', 'tideisle', 'causeway'],
];
const CAVE = { x: 138, z: -14, r: 11 };
const CAVE2 = { x: 118, z: -98, r: 11 };   // Frost Cavern (snow)
// Dedicated mining sites — ore clustered near the mountains (RuneScape-style), each with a
// tier mix. mithril is gated to a high Mining level (main.js); gem_rock yields cut gems.
const MINES = [
  { name: 'Hearth Quarry',   x: 16,   z: -30, rocks: [['copper', 5], ['iron', 3], ['coal', 3]] },
  { name: 'Emberforge Lode', x: 118,  z: -2,  rocks: [['iron', 5], ['coal', 5]] },
  { name: 'Sunspire Dig',    x: 14,   z: 112, rocks: [['copper', 4], ['gem_rock', 3]] },
  { name: 'Frostpeak Mine',  x: 92,   z: -84, rocks: [['coal', 4], ['mithril', 3]] },
  { name: 'Stormhold Mine',  x: -158, z: -46, rocks: [['iron', 4], ['coal', 3], ['mithril', 2]] },
  { name: 'Red Mesa Mine',   x: 150,  z: 116, rocks: [['iron', 4], ['coal', 4], ['gem_rock', 2]] },
];
const MINE_R = 6;

// Low-poly props for each hidden discovery kind. Bright bits use MeshBasic so they glow
// on the additive display. Built into a small group placed on the ground at the site.
function buildDiscovery(g, kind) {
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
  const box = (w, h, d, c, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); if (ry) m.rotation.y = ry; g.add(m); return m; };
  const orb = (r, c, x, y, z) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), glow(c)); m.position.set(x, y, z); g.add(m); return m; };
  if (kind === 'chest') { box(1.3, 0.7, 0.9, 0x6a4a2a, 0, 0.35, 0); box(1.36, 0.32, 0.96, 0x8a6a3a, 0, 0.78, 0); box(0.14, 0.5, 0.12, 0xe0c050, 0, 0.5, 0.46); }
  else if (kind === 'shrine') { box(0.5, 2.2, 0.5, 0x8a8f9a, 0, 1.1, 0); box(0.9, 0.3, 0.9, 0x6a6f78, 0, 0.15, 0); orb(0.34, 0x8fd0ff, 0, 2.35, 0); }
  else if (kind === 'meteor') { box(2.8, 0.2, 2.8, 0x5a4a3a, 0, 0.02, 0); const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 0), mat(0x3a3340)); m.position.y = 0.6; m.scale.set(1, 0.8, 1); g.add(m); orb(0.22, 0x6fb0e8, 0.3, 0.85, 0.2); orb(0.16, 0x6fb0e8, -0.3, 0.7, -0.25); }
  else if (kind === 'wreck') { box(3.6, 0.55, 1.2, 0x5a4630, 0, 0.3, 0, 0.3); for (let i = -2; i <= 2; i++) box(0.16, 1.3 - Math.abs(i) * 0.2, 0.16, 0x6a5436, i * 0.65, 0.75, 0.55, 0.3); box(0.2, 2.1, 0.2, 0x6a5436, -1.3, 1.1, -0.1, 0.3); }
  else if (kind === 'cairn') { box(0.95, 0.42, 0.95, 0x8a8f96, 0, 0.21, 0); box(0.74, 0.42, 0.74, 0x9aa0a8, 0.05, 0.62, -0.03); box(0.52, 0.42, 0.52, 0x7a8088, -0.04, 1.0, 0.04); box(0.3, 0.3, 0.3, 0x9aa0a8, 0.02, 1.32, 0); }
  else if (kind === 'ring') { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; box(0.3, 0.9 + (i % 2) * 0.35, 0.3, 0xb0a0c0, Math.cos(a) * 1.7, 0.5, Math.sin(a) * 1.7); } const c = orb(0.5, 0xb98fff, 0, 0.7, 0); c.material.transparent = true; c.material.opacity = 0.55; }
  else if (kind === 'idol') { box(0.5, 0.3, 0.5, 0x6a5436, 0, 0.15, 0); box(0.7, 1.3, 0.6, 0xe0c050, 0, 0.95, 0); orb(0.36, 0xf4d860, 0, 1.85, 0); }
  else { box(0.8, 0.8, 0.8, 0x9a8f7a, 0, 0.4, 0); }
}
// Modular dungeons — themed spire rings (SW entrance gap) with a loot chest + a
// boss at the centre. Add one here, drop a boss/trash into ENEMY_SPAWNS, and
// (optionally) wire a quest chain in content.js. That's the whole extension point.
const DUNGEONS = [
  { key: 'catacombs', name: 'Gloomroot Catacombs', x: -64, z: 74,  r: 11, spire: 0x4a4458, orb: 0x9b7ad6, chest: { label: 'Catacomb Chest', gold: 200, loot: { bone_shard: 3, ruby: 1 } }, ore: [['coal', 3]] },
  { key: 'warren',    name: 'Goblin Warren',       x: -24, z: 24,  r: 11, spire: 0x6b5a3a, orb: 0x9ac46a, chest: { label: 'Warren Stash',   gold: 180, loot: { goblin_tooth: 4, iron_bar: 2 } }, ore: [['iron', 3]] },
  { key: 'crystal',   name: 'Crystal Hollow',      x: 82,  z: -74, r: 11, spire: 0x9b8bd6, orb: 0x9bf2ff, chest: { label: 'Geode Chest',    gold: 220, loot: { crystal_shard: 3, sapphire: 2, emerald: 1 } }, ore: [['coal', 2]] },
  { key: 'magma',     name: 'Magma Depths',        x: 130, z: 28,  r: 11, spire: 0x7a3320, orb: 0xff6a2a, chest: { label: 'Molten Chest',   gold: 240, loot: { magma_core: 2, coal: 5, iron_ore: 4 } }, ore: [['iron', 3], ['coal', 3]] },
  { key: 'temple',    name: 'Sunken Temple',       x: 60,  z: 70,  r: 12, spire: 0x3a7a7a, orb: 0x2bd6cf, chest: { label: 'Reliquary',      gold: 260, loot: { pearl: 2, sapphire: 2 } }, ore: [] },
  { key: 'ziggurat',  name: 'Overgrown Ziggurat',  x: 205, z: 55,  r: 12, style: 'pillar',  spire: 0x5a7a4a, orb: 0x7cff8a, chest: { label: 'Jungle Reliquary', gold: 280, loot: { vine_coil: 3, emerald: 2 } }, ore: [['copper', 2]] },
  { key: 'glimmer',   name: 'Glimmer Cavern',      x: 178, z: 52,  r: 11, style: 'crystal', spire: 0x9bf2ff, orb: 0x9bf2ff, chest: { label: 'Glimmer Chest',   gold: 240, loot: { crystal_shard: 3, sapphire: 2 } }, ore: [['copper', 2]] },
  { key: 'ashpit',    name: 'The Ashpit',          x: 140, z: 108, r: 12, style: 'spike',   spire: 0x3a2230, orb: 0xff5a2a, chest: { label: 'Cinder Hoard',    gold: 320, loot: { demon_ash: 3, magma_core: 2 } }, ore: [['coal', 4]] },
  { key: 'thunderhold', name: 'Thunderpeak Hold',  x: -145, z: -55, r: 12, style: 'pillar', spire: 0x6a7280, orb: 0x9bdcff, chest: { label: 'Storm Vault',     gold: 340, loot: { storm_shard: 3, iron_bar: 2 } }, ore: [['iron', 3]] },
  { key: 'feywild',   name: 'Feywild Hollow',      x: -8, z: -118, r: 12, style: 'fungal',  spire: 0xff7af0, orb: 0xb04acf, chest: { label: 'Fae Cache',       gold: 300, loot: { fae_dust: 3, sapphire: 2 } }, ore: [] },
  { key: 'galleon',   name: 'The Drowned Galleon', x: 100, z: 206, r: 11, flat: true, style: 'pillar',  spire: 0x35434c, orb: 0x2bd6cf, chest: { label: "Captain's Hold",  gold: 360, loot: { barnacle_plate: 2, pearl: 3, sapphire: 2 } }, ore: [['iron', 3]] },
  { key: 'barrow',    name: 'The Hollow Barrow',   x: 36, z: -182, r: 11, flat: true, style: 'spire',   spire: 0x6a5a44, orb: 0xe0852e, chest: { label: 'Barrow Hoard',    gold: 380, loot: { grave_iron: 2, ruby: 2, emerald: 1 } }, ore: [['coal', 3]] },
];
const SHORTCUT_LINKS = [
  { name: 'Stepping Stones', a: { x: 34, z: -28 }, b: { x: 86, z: -72 }, level: 5 },
  { name: 'Tangle Vines',    a: { x: 16, z: 42 },  b: { x: 24, z: 86 },  level: 1 },
  { name: 'Forest Climb',    a: { x: -40, z: 8 },  b: { x: -86, z: 14 }, level: 3 },
];

// Grow the whole world uniformly: multiply every world POSITION + land RADIUS by WS, and
// bump surface prop counts (sub-quadratically, so bigger regions feel MORE open). Object
// sizes (building rings, bridge width, mine/dungeon arena internals, interaction ranges)
// stay fixed. Runs exactly once — mutates the shared data singletons in place before any
// consumer (heightfield, entities, quests, minimap) reads them.
let _worldScaled = false;
function scaleWorldData() {
  if (_worldScaled || WS === 1) return; _worldScaled = true;
  const sp = (o) => { if (o && typeof o.x === 'number') { o.x *= WS; o.z *= WS; } };
  for (const r of REGIONS) {
    sp(r); r.r *= WS;
    if (r.village) sp(r.village);
    if (r.peak) { sp(r.peak); r.peak.r *= WS; }
    r.nTree = Math.round((r.nTree || 0) * WS); r.nBush = Math.round((r.nBush || 0) * WS);
    r.nRock = Math.round((r.nRock || 0) * WS); if (r.nFish) r.nFish = Math.round(r.nFish * WS);
  }
  sp(CAVE); CAVE.r *= WS; sp(CAVE2); CAVE2.r *= WS;
  for (const m of MINES) sp(m);
  for (const d of DUNGEONS) { sp(d); d.r *= WS; }
  for (const s of SHORTCUT_LINKS) { sp(s.a); sp(s.b); }
  for (const d of DISCOVERIES) sp(d);
  for (const n of NPCS) sp(n.pos);
  for (const w of WANDERERS) { if (w.loop) w.loop.forEach(sp); if (w.home) sp(w.home); }
  for (const s of ENEMY_SPAWNS) sp(s);
  for (const q of Object.values(QUESTS)) (q.objectives || []).forEach((o) => { if (o.type === 'visit') sp(o); });
}

export function createWorld(scene, seed = 1337) {
  scaleWorldData();
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  const byKey = {}; REGIONS.forEach((r) => (byKey[r.key] = r));
  const villages = REGIONS.filter((r) => r.village).map((r) => { r.village.biome = r.biome; return r.village; });

  // bridges: edge-to-edge segments between linked regions, varied by transition type.
  // isthmus is wide + bites deep into both islands (natural merge); span/causeway are narrower.
  const BRIDGE_CFG = { causeway: { w: 6, inset: 5, fall: 5, flat: 1.8 }, isthmus: { w: 11, inset: 9, fall: 9, flat: 0 }, span: { w: 5, inset: 4, fall: 5, flat: 2.0 } };
  const BRIDGES = BRIDGE_LINKS.map(([a, b, type = 'causeway']) => {
    const A = byKey[a], B = byKey[b], cfg = BRIDGE_CFG[type] || BRIDGE_CFG.causeway;
    const dx = B.x - A.x, dz = B.z - A.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
    return { ax: A.x + ux * (A.r - cfg.inset), az: A.z + uz * (A.r - cfg.inset), bx: B.x - ux * (B.r - cfg.inset), bz: B.z - uz * (B.r - cfg.inset), halfW: cfg.w, fall: cfg.fall, flat: cfg.flat, type };
  });

  // --- height field -------------------------------------------------------
  function landMask(x, z) {
    let m = 0;
    for (const r of REGIONS) m = Math.max(m, smoothstep((r.r - Math.hypot(x - r.x, z - r.z)) / (16 * WS)));   // coastline width scales with the world so beaches stay proportional (rim features stay on land)
    for (const b of BRIDGES) m = Math.max(m, smoothstep((b.halfW - distToSeg(x, z, b.ax, b.az, b.bx, b.bz)) / b.fall));
    return m;
  }
  function height(x, z) {
    const land = landMask(x, z);
    let h = land * 2.4;
    h += (Math.sin(x * (0.10 / WS)) * Math.cos(z * (0.09 / WS)) * 1.3 + Math.sin(x * (0.06 / WS) + z * (0.045 / WS) + 2.0) * 1.1 + Math.cos(z * (0.08 / WS)) * 0.7) * land;   // noise freq /WS → heightfield is a true scaled copy (features keep their original height)
    for (const r of REGIONS) if (r.peak) h += smoothstep(clamp(1 - Math.hypot(x - r.peak.x, z - r.peak.z) / r.peak.r, 0, 1)) * r.peak.h * land;
    h += (land - 1) * 1.6;
    // flatten bridges into level causeways so noise dips never break the path
    for (const b of BRIDGES) {
      const d = distToSeg(x, z, b.ax, b.az, b.bx, b.bz);
      if (b.type === 'isthmus') { const fl = smoothstep(clamp((b.halfW - d) / b.fall, 0, 1)); if (fl > 0) h = Math.max(h, 1.4 * fl); }   // natural neck: raise troughs only, keep rolling land
      else { const fl = smoothstep(clamp((b.halfW - d) / 4, 0, 1)); h = h * (1 - fl) + b.flat * fl; }   // causeway/span: flat walkway
    }
    for (const v of villages) { const flat = smoothstep(clamp((11 - dist2D(x, z, v.x, v.z)) / 11, 0, 1)); h = h * (1 - flat) + 2.0 * flat; }
    // flatten the new dungeon floors into level arenas so the boss/chest never sink underwater near a coast
    for (const dg of DUNGEONS) { if (!dg.flat) continue; const flat = smoothstep(clamp((dg.r - 3 - dist2D(x, z, dg.x, dg.z)) / 6, 0, 1)); h = h * (1 - flat) + 1.8 * flat; }
    return h;
  }
  const isWalkable = (x, z) => height(x, z) > 0.35;
  function biomeAt(x, z) { let best = REGIONS[0], bd = Infinity; for (const r of REGIONS) { const d = Math.hypot(x - r.x, z - r.z) - r.r; if (d < bd) { bd = d; best = r; } } return best.biome; }

  // --- terrain mesh (biome-coloured) -------------------------------------
  const SIZE = Math.ceil(480 * WS), SEG = Math.round(128 * WS), CX = 19 * WS, CZ = 3 * WS;   // heightfield grows with WORLD_SCALE to cover the (now larger) frontier regions
  let geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2); geo.translate(CX, 0, CZ);
  const pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) pa.setY(i, height(pa.getX(i), pa.getZ(i)));
  geo = geo.toNonIndexed(); geo.computeVertexNormals();
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const bi = BIOMES[biomeAt(cx, cz)];
    let hex;
    if (h < -0.2) hex = bi.sea;
    else if (h < 0.9) hex = bi.sand;
    else if (h < 5) hex = rng() > 0.5 ? bi.low : bi.low2;
    else if (h < 8.2) hex = bi.high;
    else hex = bi.peak;
    c.setHex(hex).multiplyScalar(0.9 + rng() * 0.2);
    for (let k = 0; k < 3; k++) { colors[(i + k) * 3] = c.r; colors[(i + k) * 3 + 1] = c.g; colors[(i + k) * 3 + 2] = c.b; }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  group.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));

  const water = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0x2bd6cf, transparent: true, opacity: 0.5, depthWrite: false }));
  water.position.set(CX, WATER_Y, CZ); group.add(water);

  // --- prop scatter (per region, by biome config) ------------------------
  const occupied = [];
  function scatterIn(reg, count, hMin, hMax, minGap, fn) {
    let placed = 0, tries = 0;
    while (placed < count && tries < count * 40) {
      tries++;
      const a = rng() * TAU, rad = Math.sqrt(rng()) * reg.r * 0.92;
      const x = reg.x + Math.cos(a) * rad, z = reg.z + Math.sin(a) * rad;
      const h = height(x, z);
      if (h < hMin || h > hMax) continue;
      let bad = false;
      for (const v of villages) if (dist2D(x, z, v.x, v.z) < 11) { bad = true; break; }
      if (!bad) for (const dg of DUNGEONS) if (dist2D(x, z, dg.x, dg.z) < dg.r + 2) { bad = true; break; }
      if (!bad) for (const o of occupied) if (dist2D(x, z, o.x, o.z) < minGap) { bad = true; break; }
      if (bad) continue;
      occupied.push({ x, z }); fn(x, z, h); placed++;
    }
  }
  const dummy = new THREE.Object3D();
  const tmpC = new THREE.Color();

  const trees = [], cacti = [], rocks = [], bushes = [], oreNodes = [];
  for (const reg of REGIONS) {
    const bi = BIOMES[reg.biome];
    if (reg.tree === 'pine') scatterIn(reg, reg.nTree, 1.4, 6.5, 3.0, (x, z, y) => trees.push({ x, z, y, s: 0.8 + rng() * 0.7, alive: true, low: bi.fol[0], hi: bi.fol[1], trunk: bi.trunk }));
    else if (reg.tree === 'cactus') scatterIn(reg, reg.nTree, 1.0, 6.0, 3.2, (x, z, y) => cacti.push({ x, z, y, s: 0.8 + rng() * 0.5 }));
    scatterIn(reg, reg.nBush, 1.2, 5.0, 2.6, (x, z, y) => bushes.push({ x, z, y, alive: true }));
    scatterIn(reg, reg.nRock, 0.4, 10.5, 2.4, (x, z, y) => rocks.push({ x, z, y, s: 0.5 + rng() * 1.0 }));
    // ore is no longer scattered across regions — it lives in dedicated MINES (below)
  }
  for (let i = 0; i < 6; i++) { const a = rng() * TAU, rad = 2 + rng() * (CAVE.r - 4); const x = CAVE.x + Math.cos(a) * rad, z = CAVE.z + Math.sin(a) * rad; oreNodes.push({ x, z, y: height(x, z), type: rng() > 0.4 ? 'iron' : 'coal', alive: true, respawn: 0 }); }
  for (let i = 0; i < 6; i++) { const a = rng() * TAU, rad = 2 + rng() * (CAVE2.r - 4); const x = CAVE2.x + Math.cos(a) * rad, z = CAVE2.z + Math.sin(a) * rad; oreNodes.push({ x, z, y: height(x, z), type: rng() > 0.5 ? 'iron' : 'coal', alive: true, respawn: 0 }); }
  for (const dg of DUNGEONS) for (const [type, n] of dg.ore) for (let i = 0; i < n; i++) { const a = rng() * TAU, rad = 3 + rng() * (dg.r - 5); const x = dg.x + Math.cos(a) * rad, z = dg.z + Math.sin(a) * rad; oreNodes.push({ x, z, y: height(x, z), type, alive: true, respawn: 0 }); }
  // dedicated mines: ore clustered tight + a ring of big rocks so the site reads as a quarry
  for (const m of MINES) {
    for (const [type, n] of m.rocks) for (let i = 0; i < n; i++) { const a = rng() * TAU, rad = rng() * MINE_R; const x = m.x + Math.cos(a) * rad, z = m.z + Math.sin(a) * rad; oreNodes.push({ x, z, y: height(x, z), type, alive: true, respawn: 0 }); }
    for (let i = 0; i < 6; i++) { const a = rng() * TAU, rad = MINE_R * 0.75 + rng() * 3; const x = m.x + Math.cos(a) * rad, z = m.z + Math.sin(a) * rad; rocks.push({ x, z, y: height(x, z), s: 1.5 + rng() * 1.3 }); }
  }
  // hidden discoveries — placed off the beaten path, each snapped to nearby walkable land
  const CLEAR_R2 = 18;   // clear scattered props so each discovery sits in its own clearing (and wins the tap)
  const clearNear = (arr, x, z) => { for (let i = arr.length - 1; i >= 0; i--) { const dx = arr[i].x - x, dz = arr[i].z - z; if (dx * dx + dz * dz < CLEAR_R2) arr.splice(i, 1); } };
  const discoveries = DISCOVERIES.map((d) => {
    let x = d.x, z = d.z;
    if (!isWalkable(x, z)) { outer: for (let r = 4; r <= 56; r += 4) for (let a = 0; a < TAU; a += TAU / 18) { const nx = d.x + Math.cos(a) * r, nz = d.z + Math.sin(a) * r; if (isWalkable(nx, nz)) { x = nx; z = nz; break outer; } } }
    clearNear(trees, x, z); clearNear(bushes, x, z); clearNear(rocks, x, z);
    const y = height(x, z);
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = rng() * TAU;
    buildDiscovery(grp, d.kind); group.add(grp);
    return { ...d, x, z, y, found: false, mesh: grp };
  });

  // trees (instanced, per-instance colour)
  const N = Math.max(trees.length, 1);
  const trunkIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.3, 1.7, 5), new THREE.MeshLambertMaterial({ flatShading: true }), N);
  const folLowIM = new THREE.InstancedMesh(new THREE.ConeGeometry(1.5, 2.3, 6), new THREE.MeshLambertMaterial({ flatShading: true }), N);
  const folHiIM = new THREE.InstancedMesh(new THREE.ConeGeometry(1.05, 1.9, 6), new THREE.MeshLambertMaterial({ flatShading: true }), N);
  trees.forEach((t, i) => {
    const s = t.s; dummy.rotation.set(0, rng() * TAU, 0); dummy.scale.setScalar(s);
    dummy.position.set(t.x, t.y + 0.85 * s, t.z); dummy.updateMatrix(); trunkIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.y + 2.15 * s, t.z); dummy.updateMatrix(); folLowIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.y + 3.35 * s, t.z); dummy.updateMatrix(); folHiIM.setMatrixAt(i, dummy.matrix);
    trunkIM.setColorAt(i, tmpC.setHex(t.trunk)); folLowIM.setColorAt(i, tmpC.setHex(t.low)); folHiIM.setColorAt(i, tmpC.setHex(t.hi)); t.idx = i;
  });
  group.add(trunkIM, folLowIM, folHiIM);

  // cacti (desert)
  const cactusMat = new THREE.MeshLambertMaterial({ color: 0x4a8f5a, flatShading: true });
  const CN = Math.max(cacti.length, 1);
  const cactusIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.5, 2.8, 7), cactusMat, CN);
  const cactusArmIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.26, 1.1, 6), cactusMat, CN);
  cacti.forEach((cc, i) => {
    const s = cc.s; dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s);
    dummy.position.set(cc.x, cc.y + 1.4 * s, cc.z); dummy.updateMatrix(); cactusIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(cc.x + 0.5 * s, cc.y + 1.7 * s, cc.z); dummy.rotation.set(0, 0, 0.5); dummy.updateMatrix(); cactusArmIM.setMatrixAt(i, dummy.matrix);
  });
  group.add(cactusIM, cactusArmIM);

  // rocks
  const rockIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x8b96a3, flatShading: true }), Math.max(rocks.length, 1));
  rocks.forEach((rk, i) => { dummy.position.set(rk.x, rk.y + rk.s * 0.4, rk.z); dummy.scale.set(rk.s, rk.s * 0.8, rk.s); dummy.rotation.set(rng(), rng() * TAU, rng()); dummy.updateMatrix(); rockIM.setMatrixAt(i, dummy.matrix); });
  group.add(rockIM);

  // bushes
  const bushIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.55, 0), new THREE.MeshLambertMaterial({ color: 0x2f8f57, flatShading: true }), Math.max(bushes.length, 1));
  bushes.forEach((b, i) => { dummy.position.set(b.x, b.y + 0.4, b.z); dummy.scale.setScalar(0.9 + rng() * 0.4); dummy.rotation.set(0, rng() * TAU, 0); dummy.updateMatrix(); bushIM.setMatrixAt(i, dummy.matrix); b.idx = i; });
  group.add(bushIM);

  // ore
  const oreCol = { copper: 0xc87a3a, iron: 0xb9a99a, coal: 0x6c6f7a, mithril: 0x5a8fc0, gem_rock: 0x6fe0ff };
  const oreIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.85, 0), new THREE.MeshLambertMaterial({ flatShading: true }), Math.max(oreNodes.length, 1));
  oreNodes.forEach((o, i) => { dummy.position.set(o.x, o.y + 0.5, o.z); dummy.scale.set(1, 1.2, 1); dummy.rotation.set(rng(), rng() * TAU, rng()); dummy.updateMatrix(); oreIM.setMatrixAt(i, dummy.matrix); oreIM.setColorAt(i, tmpC.setHex(oreCol[o.type] || 0x999999)); o.idx = i; });
  group.add(oreIM);

  // fishing spots (per region shore)
  const fishingSpots = [];
  function addFishing(reg, n) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + rng() * 0.4;
      let r = reg.r * 0.5;
      while (r < reg.r + 12 && height(reg.x + Math.cos(a) * r, reg.z + Math.sin(a) * r) > 0.15) r += 1.2;
      fishingSpots.push({ x: reg.x + Math.cos(a) * (r + 1.2), z: reg.z + Math.sin(a) * (r + 1.2), y: WATER_Y + 0.06, alive: true });
    }
  }
  for (const reg of REGIONS) addFishing(reg, reg.nFish || 3);
  const fishIM = new THREE.InstancedMesh(new THREE.RingGeometry(0.5, 1.0, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x9bf2ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }), Math.max(fishingSpots.length, 1));
  fishingSpots.forEach((f, i) => { dummy.position.set(f.x, f.y, f.z); dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); fishIM.setMatrixAt(i, dummy.matrix); f.idx = i; });
  group.add(fishIM);

  // --- settlements + stations (modular kit per village) ------------------
  let animT = 0;
  const fireMeshes = [], orbMeshes = [];   // ambient meshes animated in tick()
  const solids = [];                       // circular collision obstacles (buildings, wells)
  const stations = [];
  function hut(x, z, a, wallHex, roofHex) {
    const y = height(x, z);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 3), new THREE.MeshLambertMaterial({ color: wallHex, flatShading: true }));
    wall.position.set(x, y + 1.1, z); wall.rotation.y = a;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.7, 4), new THREE.MeshLambertMaterial({ color: roofHex, flatShading: true }));
    roof.position.set(x, y + 3.05, z); roof.rotation.y = a + Math.PI / 4;
    group.add(wall, roof);
  }
  // An enterable town building: walls + pitched roof + door + lit windows + a
  // coloured sign, and a 'door' station out front that opens its interior.
  const SIGN_COL = { home: 0x9a4f3a, store: 0xffd45f, bank: 0x5b7cff, workshop: 0x9bf2ff, tavern: 0xc9742e, forge: 0xff7a33 };
  const BLD_NAME = { home: 'Home', store: 'General Store', bank: 'Bank', workshop: 'Workshop', tavern: 'Tavern', forge: 'Forge' };
  // per-type size + roof so each building reads distinctly (bank tall w/ columns, tavern wide, forge w/ chimney, …)
  const BLD = {
    home:     { roof: 0x8a4a36, roofH: 2.0, h: 3.6 },
    store:    { roof: 0xb8863a, roofH: 2.0, h: 3.8 },
    bank:     { roof: 0x46568a, roofH: 1.8, h: 4.8 },
    workshop: { roof: 0x3f7a8a, roofH: 2.0, h: 3.8 },
    tavern:   { roof: 0x8a5a2e, roofH: 2.4, h: 4.4 },
    forge:    { roof: 0x55585f, roofH: 1.8, h: 4.0 },
  };
  // per-BIOME town architecture: each region's town gets distinct walls, roof colour AND
  // silhouette + structural accents, so you know the region from the rooftops alone.
  const TOWN = {
    grass:    { wall: 0xe8d6a8, wall2: 0x9a5a38, roof: 0xc24a3a, roofStyle: 'pitch',  glow: 0xffd47a, accents: [] },
    forest:   { wall: 0xc9a85a, wall2: 0x4f7a3a, roof: 0x2f8b48, roofStyle: 'gable',  glow: 0xffe08a, accents: ['vines', 'stonebase'] },
    desert:   { wall: 0xefd49a, wall2: 0xc07a3a, roof: 0x46b8c0, roofStyle: 'dome',   glow: 0xffc24a, accents: ['awning', 'banners'] },
    snow:     { wall: 0xdce8f6, wall2: 0x7fa0c8, roof: 0x2f5ed8, roofStyle: 'steep',  glow: 0xffe08a, accents: ['snowcap', 'lanterns'] },
    volcanic: { wall: 0xb07048, wall2: 0x6a5048, roof: 0xf0552e, roofStyle: 'pitch',  glow: 0xff7a2a, accents: ['embers', 'stonebase'] },
    swamp:    { wall: 0x8a9a5a, wall2: 0x6e5a3c, roof: 0x9aa84e, roofStyle: 'thatch', glow: 0xc8e07a, accents: ['stilts', 'lanterns'] },
    jungle:   { wall: 0xcba24e, wall2: 0x3fa84a, roof: 0x4fcc3a, roofStyle: 'thatch', glow: 0xffd24a, accents: ['vines', 'banners'] },
    badlands: { wall: 0xd98a4a, wall2: 0x9a5230, roof: 0xc04a2a, roofStyle: 'flat',   glow: 0xffb04a, accents: ['awning', 'stonebase'] },
    highland: { wall: 0x9faebe, wall2: 0x6e7a88, roof: 0x6e8470, roofStyle: 'steep',  glow: 0xffd060, accents: ['stonebase', 'banners'] },
    fae:      { wall: 0x8a5ad0, wall2: 0x3a8aff, roof: 0x5ac8c0, roofStyle: 'spire',  glow: 0x8af0ff, accents: ['glow', 'lanterns'] },
    coast:    { wall: 0xcfe0e8, wall2: 0x3a93a6, roof: 0x2fb0c8, roofStyle: 'gable',  glow: 0xffe08a, accents: ['lanterns', 'awning'] },
    autumn:   { wall: 0xe4ac4e, wall2: 0x9a4a24, roof: 0xd85a26, roofStyle: 'pagoda', glow: 0xffb84a, accents: ['lanterns', 'banners'] },
  };
  function building(bx, bz, vcx, vcz, type, pal, biome) {
    const st = TOWN[biome] || TOWN.grass;
    const y = height(bx, bz);
    const faceA = Math.atan2(vcx - bx, vcz - bz);                 // face the plaza
    const fx = Math.sin(faceA), fz = Math.cos(faceA), rx = Math.cos(faceA), rz = -Math.sin(faceA);
    const cfg = BLD[type] || BLD.home, W = 5.2, D = 5.2, H = cfg.h;
    // place at building-local coords: side = right offset, oy = height, fwd = toward the plaza
    const put = (geo, mat, side, oy, fwd, rotX) => { const m = new THREE.Mesh(geo, mat); m.position.set(bx + fx * fwd + rx * side, y + oy, bz + fz * fwd + rz * side); m.rotation.y = faceA; if (rotX) m.rotation.x = rotX; group.add(m); return m; };
    const basic = (c) => new THREE.MeshBasicMaterial({ color: c });
    if (st.accents.includes('stonebase')) put(new THREE.BoxGeometry(W * 1.1, 1.2, D * 1.1), lmat(st.wall2), 0, 0.6, 0);   // stone footing peeks below the walls
    put(new THREE.BoxGeometry(W, H, D), lmat(st.wall), 0, H / 2, 0);                                                   // walls (biome colour)
    // ---- roof silhouette per biome ----
    const rc = lmat(st.roof), top = y + H, rh = cfg.roofH;
    const atTop = (mesh, oy, ry) => { mesh.position.set(bx, top + oy, bz); mesh.rotation.y = (ry === undefined ? faceA : ry); group.add(mesh); return mesh; };
    if (st.roofStyle === 'flat') {
      atTop(new THREE.Mesh(new THREE.BoxGeometry(W * 1.02, 0.45, D * 1.02), rc), 0.22);
      atTop(new THREE.Mesh(new THREE.BoxGeometry(W * 1.12, 0.16, D * 1.12), lmat(st.wall2)), 0.5);                    // parapet lip
    } else if (st.roofStyle === 'dome') {
      atTop(new THREE.Mesh(new THREE.SphereGeometry(W * 0.6, 12, 8, 0, TAU, 0, Math.PI * 0.5), rc), 0);
    } else if (st.roofStyle === 'thatch') {
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.92, rh * 1.45, 8), rc), rh * 1.45 / 2 - 0.1);                 // rounded straw cone
    } else if (st.roofStyle === 'steep') {
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.74, rh * 2.2, 4), rc), rh * 2.2 / 2 - 0.1, faceA + Math.PI / 4);
    } else if (st.roofStyle === 'spire') {
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.78, rh, 4), rc), rh / 2 - 0.1, faceA + Math.PI / 4);          // flared base
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.34, rh * 3.4, 6), rc), rh * 0.6 + rh * 3.4 / 2);             // tall spire
      atTop(new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), basic(st.glow)), rh * 0.6 + rh * 3.4 + 0.2);     // glowing finial
    } else if (st.roofStyle === 'pagoda') {
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.95, rh * 0.8, 4), rc), rh * 0.8 / 2 - 0.1, faceA + Math.PI / 4);
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.62, rh * 0.8, 4), rc), rh * 0.8 + rh * 0.8 / 2 - 0.1, faceA + Math.PI / 4);
    } else if (st.roofStyle === 'gable') {
      for (const s of [1, -1]) put(new THREE.BoxGeometry(W * 1.06, 0.18, D * 0.72), rc, 0, H + 0.55, s * D * 0.2, -s * 0.62);   // two slopes → ridge
      put(new THREE.BoxGeometry(W * 1.04, 0.7, 0.16), lmat(st.wall2), 0, H + rh * 0.62, 0);                          // ridge beam
    } else {
      atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.82, rh, 4), rc), rh / 2 - 0.1, faceA + Math.PI / 4);         // pitch (default)
    }
    put(new THREE.BoxGeometry(1.5, 2.3, 0.25), lmat(0x3a2a1c), 0, 1.15, D / 2 - 0.02);                                // door
    for (const s of [-W * 0.3, W * 0.3]) put(new THREE.BoxGeometry(1.0, 1.0, 0.12), basic(st.glow), s, H * 0.58, D / 2);   // lit windows (biome glow)
    put(new THREE.BoxGeometry(2.0, 0.6, 0.12), lmat(SIGN_COL[type] || 0xcaa878), 0, H - 0.5, D / 2 + 0.08);           // per-type sign
    if (type === 'tavern') {
      put(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 10), lmat(0x6e4a2b), W * 0.42, 0.5, D / 2 + 0.7);                 // barrel
      put(new THREE.BoxGeometry(0.18, 2.4, 0.18), lmat(0x4a3526), -W * 0.42, 1.2, D / 2 + 0.7);                       // sign post
      put(new THREE.BoxGeometry(1.1, 0.6, 0.1), lmat(0xc9742e), -W * 0.42, 2.0, D / 2 + 1.05);                        // hanging sign
    } else if (type === 'bank') {
      for (const s of [-W * 0.34, W * 0.34]) put(new THREE.CylinderGeometry(0.3, 0.34, H, 8), lmat(0xdfe4ee), s, H / 2, D / 2 - 0.1);   // columns
    } else if (type === 'forge') {
      put(new THREE.BoxGeometry(0.9, H + 1.8, 0.9), lmat(0x4a4d54), W * 0.32, (H + 1.8) / 2, -D * 0.25);              // chimney
      put(new THREE.BoxGeometry(0.7, 0.4, 0.7), new THREE.MeshBasicMaterial({ color: 0xff7a33 }), W * 0.32, H + 1.7, -D * 0.25);   // ember top
    } else if (type === 'store') {
      put(new THREE.BoxGeometry(W * 0.7, 0.16, 1.5), lmat(0xc0452e), 0, H - 0.55, D / 2 + 0.55, -0.4);                // tilted awning
      put(new THREE.BoxGeometry(0.9, 0.9, 0.9), lmat(0x8a6a44), W * 0.42, 0.45, D / 2 + 0.7);                         // crate
    } else if (type === 'workshop') {
      put(new THREE.BoxGeometry(0.7, H + 1.2, 0.7), lmat(0x6a6f78), W * 0.32, (H + 1.2) / 2, -D * 0.25);              // chimney
      put(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 8), lmat(0x6e4a2b), W * 0.42, 0.5, D / 2 + 0.7);                  // barrel
    } else {
      put(new THREE.BoxGeometry(0.6, H + 0.9, 0.6), lmat(0x7a5a44), W * 0.3, (H + 0.9) / 2, -D * 0.25);               // home chimney
      put(new THREE.BoxGeometry(1.5, 0.32, 0.32), lmat(0x4a7a3a), 0, H * 0.4, D / 2 + 0.12);                          // flower box
    }
    // ---- biome structural accents (on top of per-type props) ----
    for (const acc of st.accents) {
      if (acc === 'snowcap') { atTop(new THREE.Mesh(new THREE.ConeGeometry(W * 0.6, 0.5, 4), basic(0xffffff)), rh * 0.9, faceA + Math.PI / 4); put(new THREE.BoxGeometry(W * 1.0, 0.18, D * 1.0), basic(0xeef6ff), 0, H + 0.05, 0); }
      else if (acc === 'awning') { put(new THREE.BoxGeometry(W * 0.7, 0.14, 1.5), lmat(st.wall2), 0, H * 0.5, D / 2 + 0.55, -0.4); }
      else if (acc === 'banners') { for (const s of [-W * 0.34, W * 0.34]) put(new THREE.BoxGeometry(0.5, 1.5, 0.08), lmat(st.roof), s, H * 0.45, D / 2 + 0.06); }
      else if (acc === 'stilts') { for (const ax of [-W * 0.4, W * 0.4]) for (const az of [-D * 0.4, D * 0.4]) put(new THREE.BoxGeometry(0.26, 1.5, 0.26), lmat(st.wall2), ax, 0.75, az); }
      else if (acc === 'glow') { put(new THREE.IcosahedronGeometry(0.24, 0), basic(st.glow), 0, H + 0.4, D / 2 + 0.3); for (const s of [-W * 0.4, W * 0.4]) put(new THREE.IcosahedronGeometry(0.2, 0), basic(st.glow), s, H * 0.75, D / 2 + 0.2); }
      else if (acc === 'lanterns') { for (const s of [-W * 0.42, W * 0.42]) { put(new THREE.BoxGeometry(0.08, 0.5, 0.08), lmat(0x2a2018), s, H * 0.74, D / 2 + 0.2); put(new THREE.IcosahedronGeometry(0.2, 0), basic(0xffce6a), s, H * 0.5, D / 2 + 0.2); } }
      else if (acc === 'embers') { for (const e of [[-W * 0.3, 0.5], [W * 0.36, 0.8], [0, 1.4]]) put(new THREE.BoxGeometry(0.16, 0.16, 0.16), basic(0xff7a33), e[0], e[1], D / 2 + 0.3); }
      else if (acc === 'vines') { for (const s of [-W * 0.36, 0, W * 0.36]) put(new THREE.BoxGeometry(0.34, 1.6, 0.12), lmat(0x3f8f3f), s, H * 0.55, D / 2 + 0.02); }
    }
    const sx = bx + fx * (D / 2 + 1.2), sz = bz + fz * (D / 2 + 1.2);
    stations.push({ kind: 'door', label: 'Enter ' + (BLD_NAME[type] || 'building'), x: sx, z: sz, y: height(sx, sz), building: type });
    solids.push({ x: bx, z: bz, r: 2.9 });
  }
  function well(x, z) {
    const y = height(x, z);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 1.0, 10), lmat(0x8a8a92)); ring.position.set(x, y + 0.5, z); group.add(ring);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 10), new THREE.MeshBasicMaterial({ color: 0x2bd6cf })); water.position.set(x, y + 0.95, z); group.add(water);
    for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.9, 0.16), lmat(0x6e4a2b)); post.position.set(x + s, y + 1.45, z); group.add(post); }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.8, 4), lmat(0x7a8aa0)); roof.position.set(x, y + 2.7, z); roof.rotation.y = Math.PI / 4; group.add(roof);
    solids.push({ x, z, r: 1.6 });
  }
  function lampPost(x, z) {
    const y = height(x, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.6, 6), lmat(0x40434a)); post.position.set(x, y + 1.3, z); group.add(post);
    const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), new THREE.MeshBasicMaterial({ color: 0xffd47a })); lamp.position.set(x, y + 2.7, z); group.add(lamp);
  }
  function signpost(x, z, color) {   // a plaza notice post (Merchants' Guild / Job Board)
    const y = height(x, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.0, 6), lmat(0x6e4a2b)); post.position.set(x, y + 1.0, z); group.add(post);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.14), lmat(color)); board.position.set(x, y + 1.95, z); group.add(board);
  }
  const lmat = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  function fire(x, z) {   // a proper cast-iron stove with a flickering fire window + pot
    const y = height(x, z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.3, 1.4), lmat(0x55585f)); body.position.set(x, y + 0.65, z); group.add(body);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 1.6), lmat(0x3a3d44)); top.position.set(x, y + 1.35, z); group.add(top);
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.7, 6), lmat(0x40434a)); chimney.position.set(x + 0.7, y + 2.1, z - 0.3); group.add(chimney);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.34, 0.42, 8), lmat(0x2a2d33)); pot.position.set(x - 0.4, y + 1.62, z); group.add(pot);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.12), new THREE.MeshBasicMaterial({ color: 0xff7a33 })); glow.position.set(x, y + 0.6, z + 0.72); group.add(glow);
    fireMeshes.push({ m: glow, baseY: y + 0.6, seed: x });
    stations.push({ kind: 'cook', label: 'Stove', x, z, y });
  }
  function bankChest(x, z) {
    const y = height(x, z);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), new THREE.MeshLambertMaterial({ color: 0x5b7cff, flatShading: true })); chest.position.set(x, y + 0.5, z);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.0), new THREE.MeshLambertMaterial({ color: 0x9bb0ff, flatShading: true })); lid.position.set(x, y + 1.05, z);
    group.add(chest, lid); stations.push({ kind: 'bank', label: 'Bank', x, z, y });
  }
  function altar(x, z) {
    const y = height(x, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.6), new THREE.MeshLambertMaterial({ color: 0xd8d2e6, flatShading: true })); base.position.set(x, y + 0.5, z);
    const glow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), new THREE.MeshBasicMaterial({ color: 0xbf9bff })); glow.position.set(x, y + 1.35, z);
    group.add(base, glow); stations.push({ kind: 'altar', label: 'Altar', x, z, y });
  }
  function cauldron(x, z) {
    const y = height(x, z);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 0.9, 8), new THREE.MeshLambertMaterial({ color: 0x40454d, flatShading: true })); pot.position.set(x, y + 0.5, z);
    const brew = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 8), new THREE.MeshBasicMaterial({ color: 0x7cffb0 })); brew.position.set(x, y + 0.96, z);
    group.add(pot, brew); stations.push({ kind: 'cauldron', label: 'Cauldron', x, z, y });
  }
  function craftBench(x, z) {
    const y = height(x, z);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.1), new THREE.MeshLambertMaterial({ color: 0x8a6a44, flatShading: true })); top.position.set(x, y + 0.95, z);
    for (const lx of [-0.7, 0.7]) for (const lz of [-0.35, 0.35]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.14), new THREE.MeshLambertMaterial({ color: 0x6e4a2b, flatShading: true })); leg.position.set(x + lx, y + 0.48, z + lz); group.add(leg); }
    const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: 0x9bf2ff })); gem.position.set(x, y + 1.2, z);
    group.add(top, gem); stations.push({ kind: 'craft', label: 'Crafting Bench', x, z, y });
  }
  function fletchBench(x, z) {
    const y = height(x, z);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.1), lmat(0x7a5a36)); top.position.set(x, y + 0.95, z); group.add(top);
    for (const lx of [-0.7, 0.7]) for (const lz of [-0.35, 0.35]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.14), lmat(0x5e4326)); leg.position.set(x + lx, y + 0.48, z + lz); group.add(leg); }
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 6, 10, Math.PI), lmat(0x9a6a3a)); bow.position.set(x, y + 1.5, z + 0.1); bow.rotation.z = Math.PI / 2; group.add(bow);   // a bowstave on the bench
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.7, 7), lmat(0x6e4a2b)); quiver.position.set(x + 0.6, y + 1.4, z); group.add(quiver);
    stations.push({ kind: 'fletch', label: 'Fletching Bench', x, z, y });
  }
  function smithy(x, z) {
    const fy = height(x, z);
    const furnace = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 1.8), new THREE.MeshLambertMaterial({ color: 0x7a6f66, flatShading: true })); furnace.position.set(x, fy + 1.0, z);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.4), new THREE.MeshBasicMaterial({ color: 0xff7a33 })); glow.position.set(x, fy + 0.8, z + 0.95);
    group.add(furnace, glow); stations.push({ kind: 'furnace', label: 'Furnace', x, z, y: fy });
    const ax = x - 2, az = z + 3, ay = height(ax, az);
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.6), new THREE.MeshLambertMaterial({ color: 0x55585f, flatShading: true })); anvil.position.set(ax, ay + 0.7, az);
    group.add(anvil); stations.push({ kind: 'anvil', label: 'Anvil', x: ax, z: az, y: ay });
  }
  const stalls = [];
  const stallMat = new THREE.MeshLambertMaterial({ color: 0xb06a3a, flatShading: true });
  const goodsMat = new THREE.MeshLambertMaterial({ color: 0xffd45f, flatShading: true });
  function stall(x, z) {
    const y = height(x, z);
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 1.2), stallMat); table.position.set(x, y + 0.9, z);
    for (const lx of [-0.8, 0.8]) for (const lz of [-0.4, 0.4]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), stallMat); leg.position.set(x + lx, y + 0.45, z + lz); group.add(leg); }
    const goods = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), goodsMat); goods.position.set(x, y + 1.2, z);
    group.add(table, goods); stalls.push({ x, z, y, cooldown: 0 });
  }
  const plots = [];
  const GROW = 22;
  function plotVisual(pl) {
    const m = pl.cropMesh;
    if (pl.state === 'empty') m.visible = false;
    else if (pl.state === 'growing') { m.visible = true; m.scale.setScalar(0.4); m.material.color.setHex(0x8a9a5a); }
    else { m.visible = true; m.scale.setScalar(1.1); m.material.color.setHex(0x57c98a); }
  }
  function plot(x, z) {
    const y = height(x, z);
    const soil = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), new THREE.MeshLambertMaterial({ color: 0x6b4a2e, flatShading: true })); soil.position.set(x, y + 0.1, z);
    const crop = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 6), new THREE.MeshLambertMaterial({ color: 0x57c98a, flatShading: true })); crop.position.set(x, y + 0.6, z); crop.visible = false;
    group.add(soil, crop); plots.push({ x, z, y, state: 'empty', grow: 0, cropMesh: crop });
  }

  // Build the standard kit for every village (smithy only where flagged).
  // Each village is a ring of enterable typed buildings around a plaza (well, stove,
  // altar, market stall, lamps) with a farm garden off to the side. Bank/forge/craft/
  // cauldron services now live INSIDE their buildings (entered via the door).
  for (const v of villages) {
    const types = v.smithy ? ['home', 'store', 'bank', 'workshop', 'tavern', 'forge'] : ['home', 'store', 'bank', 'workshop', 'tavern'];
    for (let i = 0; i < types.length; i++) { const a = (i / types.length) * TAU + 0.5; building(v.x + Math.cos(a) * 8.5, v.z + Math.sin(a) * 8.5, v.x, v.z, types[i], v.hut, v.biome); }
    well(v.x, v.z);
    fire(v.x - 3.5, v.z + 3.5);
    altar(v.x + 3.5, v.z + 3.5);
    stall(v.x - 4, v.z - 3.5);
    fletchBench(v.x + 5, v.z - 3);
    lampPost(v.x + 4.6, v.z - 4.6); lampPost(v.x - 4.6, v.z + 4.6);
    plot(v.x + 12, v.z + 2); plot(v.x + 13.4, v.z + 3.2); plot(v.x + 12.6, v.z + 4.6);
    { const lx = v.x - 2.4, lz = v.z - 5.0; signpost(lx, lz, 0xffd45f); stations.push({ kind: 'ledger', label: 'Merchants’ Guild', x: lx, z: lz, y: height(lx, lz) }); }
    { const jx = v.x + 2.4, jz = v.z - 5.0; signpost(jx, jz, 0x9bf2ff); stations.push({ kind: 'jobboard', label: 'Job Board', x: jx, z: jz, y: height(jx, jz) }); }
  }

  // Player house at Hearth Village — a Bed to rest + boss trophy pedestals.
  const trophyMeshes = {};
  (function house() {
    const vA = byKey.verdant.village, hx = vA.x - 15, hz = vA.z, y = height(hx, hz);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.6, 4), new THREE.MeshLambertMaterial({ color: 0xb9a07a, flatShading: true })); wall.position.set(hx, y + 1.3, hz);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.9, 4), new THREE.MeshLambertMaterial({ color: 0x7a8aa0, flatShading: true })); roof.position.set(hx, y + 3.5, hz); roof.rotation.y = Math.PI / 4;
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.8), new THREE.MeshLambertMaterial({ color: 0x9b6bff, flatShading: true })); bed.position.set(hx - 1.4, y + 0.4, hz);
    group.add(wall, roof, bed);
    stations.push({ kind: 'bed', label: 'Bed (rest)', x: hx - 1.4, z: hz, y });
    const tcol = { ember_boss: 0xff5a2a, sandwyrm: 0xd8a85a, frost_warden: 0xbfe0ff };
    ['ember_boss', 'sandwyrm', 'frost_warden'].forEach((bk, i) => {
      const tx = hx - 3 + i * 3, tz = hz + 4.5, ty = height(tx, tz);
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.8, 6), new THREE.MeshLambertMaterial({ color: 0x8a8a92, flatShading: true })); ped.position.set(tx, ty + 0.4, tz);
      const tro = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial({ color: tcol[bk] })); tro.position.set(tx, ty + 1.25, tz);
      ped.visible = false; tro.visible = false; group.add(ped, tro);
      trophyMeshes[bk] = [ped, tro];
    });
  })();

  // Emberdeep cave: ring of rock spires with a SW entrance gap + a loot chest.
  (function cave() {
    const cols = 16;
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * TAU; if (a > 3.3 && a < 4.3) continue;
      const x = CAVE.x + Math.cos(a) * CAVE.r, z = CAVE.z + Math.sin(a) * CAVE.r, hh = 4 + rng() * 2;
      const col = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), new THREE.MeshLambertMaterial({ color: 0x6a6358, flatShading: true }));
      col.position.set(x, height(x, z) + hh * 0.4, z); col.scale.set(1.3, hh, 1.3); col.rotation.y = rng() * TAU; group.add(col);
    }
    const cy = height(CAVE.x, CAVE.z);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), new THREE.MeshLambertMaterial({ color: 0xffd45f, flatShading: true })); chest.position.set(CAVE.x, cy + 0.5, CAVE.z); group.add(chest);
    stations.push({ kind: 'chest', label: 'Cave Chest', x: CAVE.x, z: CAVE.z, y: cy, looted: false, gold: 120, loot: { iron_bar: 3, coal: 4 } });
  })();

  // Frost Cavern (snow) — icy spires + a frozen chest (the Frost Warden lurks here).
  (function frostCavern() {
    const cols = 16;
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * TAU; if (a > 3.3 && a < 4.3) continue;
      const x = CAVE2.x + Math.cos(a) * CAVE2.r, z = CAVE2.z + Math.sin(a) * CAVE2.r, hh = 4 + rng() * 2.5;
      const col = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), new THREE.MeshLambertMaterial({ color: 0xbcd0e6, flatShading: true }));
      col.position.set(x, height(x, z) + hh * 0.4, z); col.scale.set(1.2, hh, 1.2); col.rotation.y = rng() * TAU; group.add(col);
    }
    const cy = height(CAVE2.x, CAVE2.z);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), new THREE.MeshLambertMaterial({ color: 0x9bd0ff, flatShading: true })); chest.position.set(CAVE2.x, cy + 0.5, CAVE2.z); group.add(chest);
    stations.push({ kind: 'chest', label: 'Frozen Chest', x: CAVE2.x, z: CAVE2.z, y: cy, looted: false, gold: 160, loot: { sapphire: 2, emerald: 1 } });
  })();

  // Modular dungeons — themed spire ring (SW entrance gap), a glowing core orb,
  // and a generic loot chest. The boss/trash for each spawn from ENEMY_SPAWNS.
  for (const dg of DUNGEONS) {
    const cols = 16;
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * TAU; if (a > 3.3 && a < 4.3) continue;
      const x = dg.x + Math.cos(a) * dg.r, z = dg.z + Math.sin(a) * dg.r, gy = height(x, z), hh = 4 + rng() * 2.5, style = dg.style || 'spire';
      const cmat = new THREE.MeshLambertMaterial({ color: dg.spire, flatShading: true });
      let col;
      if (style === 'pillar') { col = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1.5), cmat); col.scale.set(1, hh * 1.15, 1); col.position.set(x, gy + hh * 0.55, z); col.rotation.y = rng() * 0.5; }
      else if (style === 'spike') { col = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1, 5), cmat); col.scale.set(1, hh * 1.4, 1); col.position.set(x, gy + hh * 0.6, z); col.rotation.y = rng() * TAU; }
      else if (style === 'crystal') { col = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1, 5), cmat); col.scale.set(1, hh * 1.5, 1); col.position.set(x, gy + hh * 0.65, z); col.rotation.set((rng() - 0.5) * 0.5, rng() * TAU, (rng() - 0.5) * 0.5); }
      else if (style === 'fungal') { const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, hh * 1.4, 6), new THREE.MeshLambertMaterial({ color: 0xd8d0e6, flatShading: true })); stalk.position.set(x, gy + hh * 0.7, z); group.add(stalk); col = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 5, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: dg.spire })); col.position.set(x, gy + hh * 1.4, z); }
      else { col = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), cmat); col.scale.set(1.25, hh, 1.25); col.position.set(x, gy + hh * 0.4, z); col.rotation.y = rng() * TAU; }
      group.add(col);
    }
    const cy = height(dg.x, dg.z);
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), new THREE.MeshBasicMaterial({ color: dg.orb })); orb.position.set(dg.x, cy + 4.6, dg.z); group.add(orb); orbMeshes.push({ m: orb, baseY: cy + 4.6, seed: dg.x });
    const cx = dg.x + 2.6, cz = dg.z + 2.6, ccy = height(cx, cz);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), new THREE.MeshLambertMaterial({ color: 0xffd45f, flatShading: true })); chest.position.set(cx, ccy + 0.5, cz); group.add(chest);
    stations.push({ kind: 'chest', label: dg.chest.label, x: cx, z: cz, y: ccy, looted: false, gold: dg.chest.gold, loot: dg.chest.loot });
  }

  // Agility shortcut pads (two per link, one at each end → bidirectional hop).
  const shortcuts = [];
  const padMat = new THREE.MeshBasicMaterial({ color: 0x9bf2ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  function pad(x, z, toX, toZ, level, name) {
    const y = height(x, z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.1, 14).rotateX(-Math.PI / 2), padMat); ring.position.set(x, y + 0.08, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), new THREE.MeshLambertMaterial({ color: 0x9bf2ff, flatShading: true })); post.position.set(x, y + 0.7, z);
    group.add(ring, post);
    shortcuts.push({ x, z, toX, toZ, level, name, cooldown: 0 });
  }
  const snapLand = (x, z) => { if (isWalkable(x, z)) return { x, z }; for (let r = 3; r <= 44; r += 3) for (let a = 0; a < TAU; a += TAU / 16) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (isWalkable(nx, nz)) return { x: nx, z: nz }; } return { x, z }; };
  for (const s of SHORTCUT_LINKS) { const a = snapLand(s.a.x, s.a.z), b = snapLand(s.b.x, s.b.z); pad(a.x, a.z, b.x, b.z, s.level, s.name); pad(b.x, b.z, a.x, a.z, s.level, s.name); }

  // crossing visuals vary by type: a grand stone-arch span, a rustic plank causeway, or
  // nothing for a natural isthmus (it's just blended land you walk straight across).
  for (const b of BRIDGES) {
    if (b.type === 'isthmus') continue;                                             // natural land neck — no built deck
    const mx = (b.ax + b.bx) / 2, mz = (b.az + b.bz) / 2;
    const len = Math.hypot(b.bx - b.ax, b.bz - b.az), ang = Math.atan2(b.bx - b.ax, b.bz - b.az);
    const ex = Math.cos(ang), ez = -Math.sin(ang);                                  // perpendicular (across the deck)
    if (b.type === 'span') {
      const dy = 1.7;
      const deck = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.5, len + 2.5), lmat(0xcfc7b4)); deck.position.set(mx, dy, mz); deck.rotation.y = ang; group.add(deck);   // pale stone roadway
      for (const s of [-2.3, 2.3]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, len + 2.5), lmat(0xb8b09a)); rail.position.set(mx + ex * s, dy + 0.7, mz + ez * s); rail.rotation.y = ang; group.add(rail);   // stone balustrade
      }
      for (let t = -len / 2; t <= len / 2 + 0.1; t += 4.5) {
        const px = mx + Math.sin(ang) * t, pz = mz + Math.cos(ang) * t;
        for (const s of [-2.3, 2.3]) { const pil = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.4, 0.55), lmat(0xbdb59f)); pil.position.set(px + ex * s, dy - 1.4, pz + ez * s); group.add(pil); }   // arch pillars dipping toward the water
        const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), new THREE.MeshBasicMaterial({ color: 0xffd47a })); lamp.position.set(px + ex * 2.3, dy + 1.55, pz + ez * 2.3); group.add(lamp);   // warm lamp on the rail
      }
    } else {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, len + 2.5), lmat(0x8a6a45)); deck.position.set(mx, 1.66, mz); deck.rotation.y = ang; group.add(deck);   // rustic planks
      for (const s of [-2.5, 2.5]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, len + 2.5), lmat(0x5a4630)); rail.position.set(mx + ex * s, 2.15, mz + ez * s); rail.rotation.y = ang; group.add(rail);
        for (let t = -len / 2; t <= len / 2 + 0.1; t += 3) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.3), lmat(0x5a4630)); post.position.set(mx + Math.sin(ang) * t + ex * s, 1.95, mz + Math.cos(ang) * t + ez * s); group.add(post); }
      }
    }
  }

  scene.add(group);

  const VILLAGE_A = byKey.verdant.village;
  const locations = [];
  for (const r of REGIONS) { if (r.village) locations.push({ name: r.village.name, x: r.village.x, z: r.village.z }); if (r.peak) locations.push({ name: peakName(r.key), x: r.peak.x, z: r.peak.z }); }
  locations.push({ name: 'Whispering Wood', x: byKey.forest.x, z: byKey.forest.z });
  locations.push({ name: 'Snowfields', x: byKey.snow.x, z: byKey.snow.z });
  locations.push({ name: 'The Isthmus', x: 61 * WS, z: 4 * WS });
  locations.push({ name: 'Emberdeep Cave', x: CAVE.x, z: CAVE.z });
  locations.push({ name: 'Frost Cavern', x: CAVE2.x, z: CAVE2.z });
  for (const m of MINES) locations.push({ name: m.name, x: m.x, z: m.z });
  for (const dg of DUNGEONS) locations.push({ name: dg.name, x: dg.x, z: dg.z });
  locations.push({ name: 'The Mistmoor', x: byKey.mistmoor.x, z: byKey.mistmoor.z });
  locations.push({ name: 'Tide Isle', x: byKey.tideisle.x, z: byKey.tideisle.z });
  locations.push({ name: 'Kytari Jungle', x: byKey.jungle.x, z: byKey.jungle.z });
  locations.push({ name: 'Scorched Wastes', x: byKey.badlands.x, z: byKey.badlands.z });
  locations.push({ name: 'Stormhold Highlands', x: byKey.highland.x, z: byKey.highland.z });
  locations.push({ name: 'Moonlit Glade', x: byKey.glade.x, z: byKey.glade.z });
  locations.push({ name: 'Saltcrest Shoals', x: 80 * WS, z: 200 * WS });
  locations.push({ name: 'Amberfell Woods', x: 50 * WS, z: -148 * WS });
  function peakName(key) { return ({ verdant: 'North Peak', forest: 'Forest Tor', snow: 'Frostpeak', ember: 'Emberpeak', jungle: 'Kytari Spire', badlands: 'Red Mesa', highland: 'Thunderpeak', glade: 'Moonspire', amberfell: 'Amber Tor' })[key] || 'Peak'; }

  const zero = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);
  function setOreScale(o, s) { dummy.position.set(o.x, o.y + 0.5 * s, o.z); dummy.scale.set(s, 1.2 * s, s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); oreIM.setMatrixAt(o.idx, dummy.matrix); oreIM.instanceMatrix.needsUpdate = true; }

  return {
    group, height, isWalkable, WATER_Y,
    village: VILLAGE_A,
    villages: villages.map((v) => ({ name: v.name, x: v.x, z: v.z })),
    regions: REGIONS, biomes: BIOMES, isles: REGIONS, bridges: BRIDGES, bridge: BRIDGES[0],
    peaks: REGIONS.filter((r) => r.peak).map((r) => r.peak), cave: CAVE, cave2: CAVE2, dungeons: DUNGEONS, locations,
    trees, rocks, bushes, oreNodes, fishingSpots, stations, plots, stalls, shortcuts, solids, mines: MINES, discoveries,
    removeTree(idx) {
      const t = trees[idx]; if (!t || !t.alive) return; t.alive = false;
      trunkIM.setMatrixAt(idx, zero); folLowIM.setMatrixAt(idx, zero); folHiIM.setMatrixAt(idx, zero);
      trunkIM.instanceMatrix.needsUpdate = folLowIM.instanceMatrix.needsUpdate = folHiIM.instanceMatrix.needsUpdate = true;
    },
    harvestBush(idx) {
      const b = bushes[idx]; if (!b || !b.alive) return; b.alive = false;
      dummy.position.set(b.x, b.y - 0.2, b.z); dummy.scale.setScalar(0.45); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      bushIM.setMatrixAt(idx, dummy.matrix); bushIM.instanceMatrix.needsUpdate = true;
    },
    restoreBush(idx) {
      const b = bushes[idx]; if (!b) return; b.alive = true;
      dummy.position.set(b.x, b.y + 0.4, b.z); dummy.scale.setScalar(1); dummy.updateMatrix();
      bushIM.setMatrixAt(idx, dummy.matrix); bushIM.instanceMatrix.needsUpdate = true;
    },
    depleteOre(o) { if (!o.alive) return; o.alive = false; o.respawn = 14; setOreScale(o, 0.32); },
    plantPlot(pl) { pl.state = 'growing'; pl.grow = GROW; plotVisual(pl); },
    harvestPlot(pl) { pl.state = 'empty'; plotVisual(pl); },
    showTrophy(key) { const m = trophyMeshes[key]; if (m) m.forEach((x) => (x.visible = true)); },
    tick(dt) {
      animT += dt;
      for (const f of fireMeshes) { f.m.scale.setScalar(0.82 + Math.sin(animT * 9 + f.seed) * 0.18); f.m.position.y = f.baseY + Math.sin(animT * 13 + f.seed) * 0.05; }
      for (const o of orbMeshes) { o.m.rotation.y = animT * 0.8; o.m.position.y = o.baseY + Math.sin(animT * 1.4 + o.seed) * 0.4; }
      water.position.y = WATER_Y + Math.sin(animT * 0.5) * 0.08;
      for (const o of oreNodes) if (!o.alive) { o.respawn -= dt; if (o.respawn <= 0) { o.alive = true; setOreScale(o, 1); } }
      for (const pl of plots) if (pl.state === 'growing') { pl.grow -= dt; if (pl.grow <= 0) { pl.state = 'grown'; plotVisual(pl); } }
      for (const s of stalls) if (s.cooldown > 0) s.cooldown -= dt;
      for (const s of shortcuts) if (s.cooldown > 0) s.cooldown -= dt;
    },
  };
}
