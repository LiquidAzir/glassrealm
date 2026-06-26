import * as THREE from 'three';
import { TAU, clamp, smoothstep, mulberry32, dist2D, distToSeg } from './util.js';
import { DISCOVERIES, NPCS, WANDERERS, ENEMY_SPAWNS, QUESTS, CLUE_SPOTS } from './content.js';
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
  crystal:  { sea: 0x1a3a5a, sand: 0xb8c0d8, low: 0x6a7fb0, low2: 0x5a6fa0, high: 0x8a9fcf, peak: 0xdfe8ff, fol: [0x7c9bff, 0xa0c0ff], trunk: 0x5a6a8a },
  spore:    { sea: 0x2a1a3a, sand: 0x8a7a9a, low: 0x7a4a8a, low2: 0x6a3a7a, high: 0x9a6aaf, peak: 0xe0c8ff, fol: [0xc060c0, 0xe080d0], trunk: 0x6a4a6a },
  lagoon:   { sea: 0x1aa6b8, sand: 0xf0e2b2, low: 0x4fd0c0, low2: 0x3ab0a8, high: 0x8ac0b0, peak: 0xeaf8f4, fol: [0x4fae84, 0x6ec98a], trunk: 0x8a6a4a },
  sky:      { sea: 0x2a4a66, sand: 0xcdd6e6, low: 0x9fb6d6, low2: 0x8aa6c8, high: 0xbcd0e6, peak: 0xffffff, fol: [0xaec6e6, 0xd0e0f4], trunk: 0x6a7280 },
  cinder:   { sea: 0x2a1a1a, sand: 0x6a4a3a, low: 0xb5482a, low2: 0x9a3a22, high: 0x6a3a2a, peak: 0xff7a3d, fol: [0x8a4a2a, 0xb5622e], trunk: 0x4a2a1a },
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
  // --- Big-Map Upgrade: 5 frontier regions (NW crystal/spore cluster, NW lagoon, NE sky shelf, SW cinder isle) ---
  { key: 'shardspire',  x: -140, z: 96,   r: 38, biome: 'crystal', village: { name: 'Prismhold',   x: -140, z: 96,   hut: [0x6a7fb0, 0x2a3a6a] }, peak: { x: -148, z: 86,  r: 16, h: 13 }, tree: 'pine',     nTree: 14, nBush: 6,  nRock: 22, nFish: 3, ore: [['copper', 3], ['coal', 3]] },
  { key: 'sporevale',   x: -164, z: 54,   r: 32, biome: 'spore',                                                                                  peak: { x: -172, z: 46,  r: 12, h: 7 },  tree: 'mushroom', nTree: 40, nBush: 18, nRock: 6,  nFish: 3, ore: [['copper', 3]] },
  { key: 'lagoon',      x: -100, z: -118, r: 36, biome: 'lagoon',  village: { name: 'Coralside',   x: -100, z: -118, hut: [0x4fbfb8, 0xe6d29a] },                                          tree: 'palm',     nTree: 18, nBush: 10, nRock: 8,  nFish: 9, ore: [['copper', 3], ['iron', 2]] },
  { key: 'skyreach',    x: 144,  z: -130, r: 38, biome: 'sky',     village: { name: 'Aerie Watch', x: 144,  z: -130, hut: [0x9fb6d6, 0xf0f6ff] }, peak: { x: 152,  z: -140, r: 18, h: 16 }, tree: 'pine',     nTree: 22, nBush: 6,  nRock: 16, nFish: 2, ore: [['coal', 4], ['iron', 3]] },
  { key: 'cinderbreak', x: -56,  z: 176,  r: 32, biome: 'cinder',                                                                                 peak: { x: -56,  z: 170, r: 14, h: 12 }, tree: 'cactus',   nTree: 10, nBush: 0,  nRock: 20, nFish: 3, ore: [['iron', 5], ['coal', 5]] },
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
  // Big-Map Upgrade cross-links. 'ferry' = a sea route (no land laid; tap the dock to sail across).
  ['shardspire', 'sporevale', 'isthmus'], ['shardspire', 'highland', 'span'], ['shardspire', 'mistmoor', 'causeway'],
  ['sporevale', 'forest', 'span'], ['glade', 'lagoon', 'isthmus'], ['lagoon', 'highland', 'span'],
  ['lagoon', 'amberfell', 'ferry'], ['snow', 'skyreach', 'isthmus'], ['skyreach', 'amberfell', 'span'],
  ['skyreach', 'ember', 'ferry'], ['cinderbreak', 'mistmoor', 'ferry'], ['cinderbreak', 'saltcrest', 'ferry'],
];
// One signature landmark per region (offsets are raw, scaled by WS at build time).
const REGION_SIG = {
  verdant:    { kind: 'henge',      dx: -20, dz: -22 },
  desert:     { kind: 'pyramid',    dx: 14,  dz: -14 },
  snow:       { kind: 'frozenlake', dx: -16, dz: 8 },
  ember:      { kind: 'lavalake',   dx: -18, dz: -4 },
  glade:      { kind: 'mushrooms',  dx: 16,  dz: 10 },
  amberfell:  { kind: 'giantoak',   dx: -14, dz: 8 },
  shardspire: { kind: 'spires',     dx: 14,  dz: 10 },
  skyreach:   { kind: 'skytemple',  dx: -16, dz: 10 },
  jungle:     { kind: 'totem',      dx: -18, dz: 12 },
  lagoon:     { kind: 'coralarch',  dx: 14,  dz: 10 },
  sporevale:  { kind: 'mushrooms',  dx: 8,   dz: 4 },
  cinderbreak: { kind: 'monolith',  dx: 14,  dz: 6 },
};
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
  else if (kind === 'obelisk') { box(1.0, 0.4, 1.0, 0x6a6f78, 0, 0.2, 0); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.5, 3.4, 4), mat(0x8a8f9a)); sh.position.y = 2.0; sh.rotation.y = Math.PI / 4; g.add(sh); orb(0.3, 0x8fd0ff, 0, 3.9, 0); }
  else if (kind === 'statue') { box(1.4, 0.5, 1.4, 0x7a7068, 0, 0.25, 0); box(0.8, 2.0, 0.6, 0xb0a89a, 0, 1.5, 0); box(0.95, 0.55, 0.75, 0xb0a89a, 0, 2.75, 0); box(0.25, 0.7, 0.25, 0xb0a89a, -0.5, 2.0, 0, 0.3); box(0.25, 0.7, 0.25, 0xb0a89a, 0.5, 2.0, 0, -0.3); }
  else if (kind === 'geyser') { box(1.6, 0.3, 1.6, 0x5a6a5a, 0, 0.15, 0); const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.2, 12), glow(0x6fe0d0)); pool.position.y = 0.32; pool.material.transparent = true; pool.material.opacity = 0.7; g.add(pool); const jet = orb(0.32, 0xbff4ee, 0, 1.3, 0); jet.material.transparent = true; jet.material.opacity = 0.55; }
  else if (kind === 'crystal') { box(1.2, 0.3, 1.2, 0x5a6273, 0, 0.15, 0); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.5 + (i % 2) * 0.3, 0), glow(0x9bd0ff)); cr.position.set(Math.cos(a) * 0.6, 0.7 + (i % 2) * 0.45, Math.sin(a) * 0.6); cr.material.transparent = true; cr.material.opacity = 0.85; g.add(cr); } }
  else if (kind === 'arch') { box(0.5, 3.0, 0.7, 0xb0a89a, -1.4, 1.5, 0); box(0.5, 3.0, 0.7, 0xb0a89a, 1.4, 1.5, 0); box(3.3, 0.6, 0.7, 0xc0b8a8, 0, 3.1, 0); orb(0.26, 0xffd47a, 0, 2.6, 0); }
  else if (kind === 'waterfall') { box(2.4, 3.2, 0.6, 0x6a7a8a, 0, 1.6, -0.6); const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.0), glow(0x8fd0ff)); fall.position.set(0, 1.6, -0.25); fall.material.transparent = true; fall.material.opacity = 0.5; fall.material.side = THREE.DoubleSide; g.add(fall); const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.2, 12), glow(0x6fb0e0)); pool.position.y = 0.12; pool.material.transparent = true; pool.material.opacity = 0.55; g.add(pool); }
  else if (kind === 'lighthouse') { box(1.6, 0.4, 1.6, 0x6a6f78, 0, 0.2, 0); const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 3.6, 10), mat(0xe8e0d0)); tw.position.y = 2.0; g.add(tw); box(1.1, 0.7, 1.1, 0x8a4a3a, 0, 4.1, 0); orb(0.42, 0xffe066, 0, 4.1, 0); }
  else if (kind === 'mushroom') { box(0.4, 1.2, 0.4, 0xe0d0c0, 0, 0.6, 0); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 6, 0, TAU, 0, Math.PI / 2), glow(0xc060c0)); cap.position.y = 1.2; cap.material.transparent = true; cap.material.opacity = 0.9; g.add(cap); orb(0.12, 0xe080d0, 0.5, 1.5, 0.3); orb(0.1, 0xe080d0, -0.4, 1.3, -0.4); }
  else if (kind === 'tower') { box(1.8, 0.4, 1.8, 0x5a5550, 0, 0.2, 0); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 3.0, 8), mat(0x7a6f64)); t.position.y = 1.7; g.add(t); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; box(0.3, 0.5, 0.3, 0x7a6f64, Math.cos(a) * 0.85, 3.35, Math.sin(a) * 0.85); } }
  else if (kind === 'well') { box(1.4, 0.7, 1.4, 0x8a8076, 0, 0.35, 0); const wt = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12), glow(0x6fb0e0)); wt.position.y = 0.6; wt.material.transparent = true; wt.material.opacity = 0.7; g.add(wt); box(0.15, 1.4, 0.15, 0x5a4326, -0.6, 1.4, 0); box(0.15, 1.4, 0.15, 0x5a4326, 0.6, 1.4, 0); box(1.7, 0.2, 0.5, 0x6a4a2a, 0, 2.12, 0); }
  else if (kind === 'campsite') { box(0.95, 0.18, 0.95, 0x5a4326, 0, 0.09, 0); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; box(0.12, 0.62, 0.12, 0x6a4a2a, Math.cos(a) * 0.35, 0.3, Math.sin(a) * 0.35, a); } orb(0.3, 0xff8a3d, 0, 0.5, 0); orb(0.18, 0xffd24a, 0, 0.72, 0); }
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
  // --- Frontier dungeons (5 new regions) ---
  { key: 'grotto',    name: 'The Tide Grotto',     x: -100, z: -126, r: 12, style: 'crystal', spire: 0x2f8a8a, orb: 0x7ae6d6, chest: { label: 'Drowned Hoard', gold: 300, loot: { pearl: 3, coral_chunk: 3, sapphire: 2 } }, ore: [['copper', 2], ['iron', 2]] },
  { key: 'geode',     name: 'The Singing Geode',   x: -120, z: 116,  r: 12, flat: true, style: 'crystal', spire: 0x6a5fb0, orb: 0xd0a8ff, chest: { label: 'Geode-Heart Vault', gold: 400, loot: { shard_dust: 4, sapphire: 3, emerald: 2 } }, ore: [['gem_rock', 2], ['coal', 2]] },
  { key: 'stormcrowneyrie', name: 'Stormcrown Eyrie', x: 118, z: -150, r: 12, flat: true, style: 'spire', spire: 0xb9c6e0, orb: 0x8fd6ff, chest: { label: 'Windward Vault', gold: 400, loot: { skyfeather: 3, gale_core: 2, storm_shard: 2, sapphire: 2 } }, ore: [['iron', 3], ['coal', 3]] },
  { key: 'mycelheart', name: 'The Mycelial Heart', x: -156, z: 66, r: 12, flat: true, style: 'fungal', spire: 0x7a4a8a, orb: 0x9aff7a, chest: { label: 'Spore Vault', gold: 340, loot: { creeping_ichor: 3, sporecap: 5, emerald: 1 } }, ore: [['copper', 3]] },
  { key: 'caldera', name: 'The Caldera Sanctum', x: -56, z: 160, r: 12, flat: true, style: 'spike', spire: 0x16121a, orb: 0xff5a2a, chest: { label: 'Reliquary of Ash', gold: 480, loot: { obsidian_shard: 4, magma_core: 2, ruby: 2 } }, ore: [['coal', 4], ['iron', 3]] },
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
  for (const c of CLUE_SPOTS) sp(c);
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
  const BRIDGE_CFG = { causeway: { w: 6, inset: 5, fall: 5, flat: 1.8 }, isthmus: { w: 11, inset: 9, fall: 9, flat: 0 }, span: { w: 5, inset: 4, fall: 5, flat: 2.0 }, ferry: { w: 4, inset: 2, fall: 0, flat: 0 } };
  const BRIDGES = BRIDGE_LINKS.map(([a, b, type = 'causeway']) => {
    const A = byKey[a], B = byKey[b], cfg = BRIDGE_CFG[type] || BRIDGE_CFG.causeway;
    const dx = B.x - A.x, dz = B.z - A.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
    return { ax: A.x + ux * (A.r - cfg.inset), az: A.z + uz * (A.r - cfg.inset), bx: B.x - ux * (B.r - cfg.inset), bz: B.z - uz * (B.r - cfg.inset), halfW: cfg.w, fall: cfg.fall, flat: cfg.flat, type };
  });

  // --- height field -------------------------------------------------------
  function landMask(x, z) {
    let m = 0;
    for (const r of REGIONS) m = Math.max(m, smoothstep((r.r - Math.hypot(x - r.x, z - r.z)) / (16 * WS)));   // coastline width scales with the world so beaches stay proportional (rim features stay on land)
    for (const b of BRIDGES) { if (b.type === 'ferry') continue; m = Math.max(m, smoothstep((b.halfW - distToSeg(x, z, b.ax, b.az, b.bx, b.bz)) / b.fall)); }   // ferries are sea routes — no land
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
      if (b.type === 'ferry') continue;   // no walkway flattening for sea routes
      const d = distToSeg(x, z, b.ax, b.az, b.bx, b.bz);
      if (b.type === 'isthmus') { const fl = smoothstep(clamp((b.halfW - d) / b.fall, 0, 1)); if (fl > 0) h = Math.max(h, 1.4 * fl); }   // natural neck: raise troughs only, keep rolling land
      else { const fl = smoothstep(clamp((b.halfW - d) / 4, 0, 1)); h = h * (1 - fl) + b.flat * fl; }   // causeway/span: flat walkway
    }
    for (const v of villages) { const flat = smoothstep(clamp((16.5 - dist2D(x, z, v.x, v.z)) / 16.5, 0, 1)); h = h * (1 - flat) + 2.0 * flat; }
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
      for (const v of villages) if (dist2D(x, z, v.x, v.z) < 16.5) { bad = true; break; }
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
    else if (reg.tree === 'mushroom' || reg.tree === 'palm') scatterIn(reg, reg.nTree, 1.2, 6.0, 3.0, (x, z, y) => trees.push({ x, z, y, s: 0.8 + rng() * 0.6, alive: true, low: bi.fol[0], hi: bi.fol[1], trunk: bi.trunk }));   // reuse the tree builder, tinted by biome
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
  // rune essence outcrop in the fae glade — feeds Runecrafting (mine essence here, bind it at a rune altar)
  if (byKey.glade) { const g = byKey.glade; for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, rad = g.r * 0.42; const x = g.x + Math.cos(a) * rad, z = g.z + Math.sin(a) * rad; if (isWalkable(x, z)) oreNodes.push({ x, z, y: height(x, z), type: 'essence', alive: true, respawn: 0 }); } }
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
    return { ...d, x, z, y, found: false, cooldown: 0, mesh: grp };
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
  const oreCol = { copper: 0xc87a3a, iron: 0xb9a99a, coal: 0x6c6f7a, mithril: 0x5a8fc0, gem_rock: 0x6fe0ff, essence: 0xb98fff };
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
  const shimMeshes = [], ambientEmitters = [];   // region-signature shimmer meshes + particle emitter anchors
  const solids = [];                       // circular collision obstacles (buildings, wells)
  const animalSpawns = [];                 // {kind,x,z,home,roam,penned} — farm livestock + wild creatures (entities.js builds them)
  const stations = [];
  const lmat = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });   // hoisted: used by builders below
  const waystones = [];   // fast-travel network nodes
  const snapLand = (x, z) => { if (isWalkable(x, z)) return { x, z }; for (let r = 3; r <= 44; r += 3) for (let a = 0; a < TAU; a += TAU / 16) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (isWalkable(nx, nz)) return { x: nx, z: nz }; } return { x, z }; };
  // nearest walkable tile that sits right by the water's edge (for ducks/waterfowl)
  const shore = (x, z) => { const wet = (ax, az) => height(ax, az) <= 0.35; for (let r = 0; r <= 70; r += 2.5) for (let a = 0; a < TAU; a += TAU / 24) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (!isWalkable(nx, nz)) continue; for (let b = 0; b < TAU; b += TAU / 8) if (wet(nx + Math.cos(b) * 3.2, nz + Math.sin(b) * 3.2)) return { x: nx, z: nz }; } return snapLand(x, z); };
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
  function runeAltar(x, z) {
    const y = height(x, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 1.1, 6), lmat(0x4a3a6a)); base.position.set(x, y + 0.55, z); group.add(base);
    const rune = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 6, 16), new THREE.MeshBasicMaterial({ color: 0xb98fff })); rune.position.set(x, y + 1.5, z); rune.rotation.x = Math.PI / 2; group.add(rune);
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: 0x8af0ff })); orb.position.set(x, y + 1.5, z); group.add(orb);
    stations.push({ kind: 'rune', label: 'Rune Altar', x, z, y });
  }
  function sawmill(x, z) {
    const y = height(x, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.2), lmat(0x6e5436)); base.position.set(x, y + 0.4, z); group.add(base);
    const logpile = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 7), lmat(0x8a6a45)); logpile.position.set(x - 1.1, y + 0.3, z); logpile.rotation.z = Math.PI / 2; group.add(logpile);
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 12), new THREE.MeshLambertMaterial({ color: 0xc8ccd2, flatShading: true })); blade.position.set(x + 0.2, y + 1.1, z); blade.rotation.x = Math.PI / 2; group.add(blade);
    stations.push({ kind: 'sawmill', label: 'Sawmill', x, z, y });
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
  function waystone(key, name, x, z) {
    const s = snapLand(x, z); x = s.x; z = s.z; const y = height(x, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.5, 6), lmat(0x5a6273)); base.position.set(x, y + 0.25, z); group.add(base);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2.6, 6), lmat(0x7a85a0)); pillar.position.set(x, y + 1.6, z); group.add(pillar);
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial({ color: 0x8fd0ff })); shard.position.set(x, y + 3.4, z); group.add(shard); orbMeshes.push({ m: shard, baseY: y + 3.4, seed: x });
    solids.push({ x, z, r: 1.3 });
    waystones.push({ key, name, x, z, y });
    stations.push({ kind: 'waystone', label: 'Waystone Network', x, z, y });
  }
  for (const v of villages) {
    const types = v.smithy ? ['home', 'store', 'bank', 'workshop', 'tavern', 'forge'] : ['home', 'store', 'bank', 'workshop', 'tavern'];
    for (let i = 0; i < types.length; i++) { const a = (i / types.length) * TAU + 0.5; building(v.x + Math.cos(a) * 13, v.z + Math.sin(a) * 13, v.x, v.z, types[i], v.hut, v.biome); }
    well(v.x, v.z);
    // service stations spread evenly on an inner ring so each sits in its own clear sector (easy to navigate)
    const svc = [
      (x, z) => fire(x, z),
      (x, z) => altar(x, z),
      (x, z) => stall(x, z),
      (x, z) => fletchBench(x, z),
      (x, z) => runeAltar(x, z),
      (x, z) => sawmill(x, z),
      (x, z) => { signpost(x, z, 0xffd45f); stations.push({ kind: 'ledger', label: 'Merchants’ Guild', x, z, y: height(x, z) }); },
      (x, z) => { signpost(x, z, 0x9bf2ff); stations.push({ kind: 'jobboard', label: 'Job Board', x, z, y: height(x, z) }); },
    ];
    svc.forEach((fn, i) => { const a = (i / svc.length) * TAU + 0.3; fn(v.x + Math.cos(a) * 6.5, v.z + Math.sin(a) * 6.5); });
    for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.78; lampPost(v.x + Math.cos(a) * 8, v.z + Math.sin(a) * 8); }
    plot(v.x + 15, v.z + 1.4); plot(v.x + 15.6, v.z + 2.9); plot(v.x + 14.7, v.z + 4.3);
    waystone('ws_' + v.name.replace(/\W+/g, '').toLowerCase(), v.name, v.x - 9, v.z - 9);
  }
  waystone('ws_emberdeep', 'Emberdeep Waystone', CAVE.x + 6, CAVE.z + 6);   // a couple of frontier stones away from towns
  waystone('ws_crossroads', 'Crossroads Waystone', 61 * WS, 4 * WS);

  // region signatures — one big landmark per region so each reads distinctly from afar
  function buildSignature(reg) {
    const sig = REGION_SIG[reg.key]; if (!sig) return;
    const s = snapLand(reg.x + (sig.dx || 0) * WS, reg.z + (sig.dz || 0) * WS); const x = s.x, z = s.z, y = height(x, z);
    const g = new THREE.Group(); g.position.set(x, y, z); group.add(g);
    const bx = (w, h, d, c, px, py, pz, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lmat(c)); m.position.set(px, py, pz); if (ry) m.rotation.y = ry; g.add(m); return m; };
    const gl = (geo, c) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c })); g.add(m); return m; };
    if (sig.kind === 'pyramid') { for (let i = 0; i < 5; i++) { const w = 7 - i * 1.3; bx(w, 1.4, w, i % 2 ? 0xd6b25e : 0xe3c277, 0, 0.7 + i * 1.3, 0); } gl(new THREE.IcosahedronGeometry(0.7, 0), 0xffe066).position.y = 7.3; solids.push({ x, z, r: 4.2 }); }
    else if (sig.kind === 'frozenlake') { const disc = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.2, 20), new THREE.MeshLambertMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.7 })); disc.position.y = 0.12; g.add(disc); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; bx(0.6, 1.6 + (i % 2), 0.6, 0xeaf6ff, Math.cos(a) * 4, 0.9, Math.sin(a) * 4, a); } }
    else if (sig.kind === 'mushrooms') { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, r = 2.2, sx = Math.cos(a) * r, sz = Math.sin(a) * r, hh = 2.4 + (i % 2); bx(0.5, hh, 0.5, 0xe0d0c0, sx, hh / 2, sz); solids.push({ x: x + sx, z: z + sz, r: 0.7 }); const cap = gl(new THREE.SphereGeometry(1.2 + (i % 2) * 0.4, 10, 6, 0, TAU, 0, Math.PI / 2), 0xb04acf); cap.position.set(sx, hh, sz); cap.material.transparent = true; cap.material.opacity = 0.85; shimMeshes.push({ m: cap, baseY: hh, seed: i * 2, kind: 'pulse' }); } ambientEmitters.push({ x, y: y + 1.6, z, color: 0xc6a8ff, every: 0.8, opts: { n: 5, spread: 3, up: 2.4, life: 1.6 } }); }
    else if (sig.kind === 'lavalake') { const lake = gl(new THREE.CylinderGeometry(7, 7, 0.2, 18), 0xff5a2a); lake.position.y = 0.14; lake.material.transparent = true; lake.material.opacity = 0.85; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; bx(1.3, 0.8, 1.3, 0x5a4632, Math.cos(a) * 7.3, 0.4, Math.sin(a) * 7.3); } solids.push({ x, z, r: 6.6 }); ambientEmitters.push({ x, y: y + 0.6, z, color: 0xff8a3d, every: 0.5, opts: { n: 6, spread: 5, up: 5, life: 1.4 } }); }
    else if (sig.kind === 'giantoak') { const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.5, 6, 8), lmat(0x5c4326)); tr.position.y = 3; tr.rotation.z = 0.08; g.add(tr); for (let i = 0; i < 3; i++) { const cv = new THREE.Mesh(new THREE.IcosahedronGeometry(3 - i * 0.5, 0), lmat(i % 2 ? 0xe0852e : 0xf0b040)); cv.position.set(0.3, 6 + i * 1.6, 0); cv.scale.y = 0.8; g.add(cv); } solids.push({ x, z, r: 1.5 }); }
    else if (sig.kind === 'spires') { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU, r = 2, hh = 2 + (i % 2); const col = gl(new THREE.ConeGeometry(0.6, 4 + (i % 2) * 2, 5), 0x9bd0ff); col.position.set(Math.cos(a) * r, hh, Math.sin(a) * r); col.material.transparent = true; col.material.opacity = 0.8; shimMeshes.push({ m: col, baseY: hh, seed: i, kind: 'spin' }); solids.push({ x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, r: 0.7 }); } }
    else if (sig.kind === 'skytemple') { bx(8, 0.6, 8, 0xcdd6e6, 0, 0.3, 0); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.78; bx(0.7, 4, 0.7, 0xe8eef6, Math.cos(a) * 3, 2.3, Math.sin(a) * 3); solids.push({ x: x + Math.cos(a) * 3, z: z + Math.sin(a) * 3, r: 0.7 }); } bx(6, 0.5, 6, 0xe8eef6, 0, 4.5, 0); gl(new THREE.IcosahedronGeometry(0.8, 0), 0x8fd0ff).position.y = 5.4; }
    else if (sig.kind === 'totem') { bx(1.2, 5, 1.2, 0x6a4a2a, 0, 2.5, 0); bx(1.9, 1, 1.9, 0xc97a3a, 0, 1, 0); bx(1.7, 1, 1.7, 0x4f7a32, 0, 3, 0); gl(new THREE.IcosahedronGeometry(0.7, 0), 0xffd24a).position.y = 5.4; solids.push({ x, z, r: 1.2 }); }
    else if (sig.kind === 'henge') { for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; bx(0.8, 3, 0.8, 0x8a8f96, Math.cos(a) * 3.2, 1.5, Math.sin(a) * 3.2); solids.push({ x: x + Math.cos(a) * 3.2, z: z + Math.sin(a) * 3.2, r: 0.7 }); } gl(new THREE.IcosahedronGeometry(0.7, 0), 0x8fd0ff).position.y = 1.5; }
    else if (sig.kind === 'coralarch') {
      const pool = gl(new THREE.CylinderGeometry(7, 7, 0.2, 18), 0x3fd0c4); pool.position.y = 0.12; pool.material.transparent = true; pool.material.opacity = 0.4;
      const legL = gl(new THREE.ConeGeometry(1.1, 5.2, 6), 0xe07a8a); legL.position.set(-2.6, 2.6, 0); legL.rotation.z = 0.22; legL.material.transparent = true; legL.material.opacity = 0.92;
      const legR = gl(new THREE.ConeGeometry(1.1, 5.2, 6), 0xe07a8a); legR.position.set(2.6, 2.6, 0); legR.rotation.z = -0.22; legR.material.transparent = true; legR.material.opacity = 0.92;
      bx(6.2, 0.8, 1.2, 0xff9ab0, 0, 5.0, 0);
      gl(new THREE.IcosahedronGeometry(0.7, 0), 0xeaffff).position.set(0, 5.6, 0);
      gl(new THREE.SphereGeometry(0.4, 8, 6), 0x7ae6d6).position.set(-1.8, 3.6, 0);
      gl(new THREE.SphereGeometry(0.32, 8, 6), 0x7ae6d6).position.set(1.9, 3.2, 0);
      solids.push({ x: x - 2.6, z, r: 1.1 }, { x: x + 2.6, z, r: 1.1 });
      ambientEmitters.push({ x, y: y + 0.5, z, color: 0x9ff2e6, every: 0.9, opts: { n: 4, spread: 5, up: 3, life: 1.8 } });
    }
    else if (sig.kind === 'monolith') {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 0.18, 18), new THREE.MeshLambertMaterial({ color: 0x2a2222, flatShading: true })); ring.position.y = 0.1; g.add(ring);
      const shard = gl(new THREE.OctahedronGeometry(2.4, 0), 0x16121a); shard.scale.set(1, 3.0, 1); shard.position.y = 6.2; shard.rotation.z = 0.12;
      const shard2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), lmat(0x201826)); shard2.scale.set(1, 2.2, 1); shard2.position.set(2.6, 3.0, 0.4); shard2.rotation.z = -0.18; g.add(shard2);
      gl(new THREE.IcosahedronGeometry(0.55, 0), 0xff5a2a).position.set(0.2, 5.4, 0);
      const core = gl(new THREE.IcosahedronGeometry(0.32, 0), 0xff8a3d); core.position.set(-0.1, 8.6, 0);
      shimMeshes.push({ m: core, baseY: 8.6, seed: 3, kind: 'pulse' });
      solids.push({ x, z, r: 2.4 });
      ambientEmitters.push({ x, y: y + 5.0, z, color: 0xff7a3a, every: 1.2, opts: { n: 3, spread: 1.6, up: 3.4, life: 1.8 } });
    }
  }
  for (const reg of REGIONS) buildSignature(reg);

  // ---- collision: props, gatherables + landmarks block the player (dynamic refs unblock when chopped/depleted) ----
  for (const t of trees) solids.push({ x: t.x, z: t.z, r: 0.7, ref: t });
  for (const c of cacti) solids.push({ x: c.x, z: c.z, r: 0.6 });
  for (const o of oreNodes) solids.push({ x: o.x, z: o.z, r: 0.95, ref: o });   // re-blocks when the node respawns (o.alive)
  for (const rk of rocks) if (rk.s > 0.7) solids.push({ x: rk.x, z: rk.z, r: 0.5 + rk.s * 0.4 });   // only the larger boulders
  const BLOCK_DISC = { obelisk: 1.0, tower: 1.0, statue: 1.0, lighthouse: 1.1, crystal: 0.9, well: 0.9, idol: 0.8, shrine: 0.7, cairn: 0.7, meteor: 1.0, wreck: 1.4 };
  for (const d of discoveries) { const r = BLOCK_DISC[d.kind]; if (r) solids.push({ x: d.x, z: d.z, r }); }
  // find a spot that's both walkable AND clear of solids — used by teleports so you never land stuck inside an obstacle
  function inSolid(x, z) { for (const o of solids) { if (o.ref && !o.ref.alive) continue; const dx = x - o.x, dz = z - o.z; if (dx * dx + dz * dz < o.r * o.r) return true; } return false; }
  function findClear(x, z) { if (isWalkable(x, z) && !inSolid(x, z)) return { x, z }; for (let r = 2; r <= 40; r += 2) for (let a = 0; a < TAU; a += TAU / 16) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (isWalkable(nx, nz) && !inSolid(nx, nz)) return { x: nx, z: nz }; } return { x, z }; }

  // Player house at Hearth Village — a Bed to rest + boss trophy pedestals.
  const trophyMeshes = {};
  const houseFurniture = {};
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
    // Carpenter's Workbench (always present) opens the build menu; furniture below is hidden until built via Construction.
    { const wx = hx + 1.6, wz = hz - 2.6, wy = height(wx, wz); const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.0), new THREE.MeshLambertMaterial({ color: 0x8a6a44, flatShading: true })); t.position.set(wx, wy + 0.9, wz); const saw = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.18), new THREE.MeshLambertMaterial({ color: 0xc8ccd2, flatShading: true })); saw.position.set(wx, wy + 1.06, wz); group.add(t, saw); stations.push({ kind: 'workbench', label: 'Carpenter’s Workbench', x: wx, z: wz, y: wy }); }
    const furn = [
      { key: 'shrine', kind: 'altar', label: 'Home Shrine',   dx: 3.2, dz: -1.4, col: 0xbf9bff },
      { key: 'hearth', kind: 'cook',  label: 'Home Hearth',   dx: 3.2, dz: 1.4,  col: 0x55585f },
      { key: 'chest',  kind: 'bank',  label: 'Storage Chest', dx: 5.2, dz: 0,    col: 0xffd45f },
    ];
    for (const f of furn) {
      const fx = hx + f.dx, fz = hz + f.dz, fy = height(fx, fz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), new THREE.MeshLambertMaterial({ color: f.col, flatShading: true })); m.position.set(fx, fy + 0.5, fz); m.visible = false; group.add(m);
      houseFurniture[f.key] = { mesh: m, station: { kind: f.kind, label: f.label, x: fx, z: fz, y: fy }, built: false };
    }
  })();

  // Your buyable Farmstead, just west of Hearth Village — fenced fields, a barn, and animal
  // pens. Crops use the normal plot system; livestock + workers are managed at the Foreman.
  (function farmstead() {
    const vA = byKey.verdant.village, cx = vA.x - 42, cz = vA.z + 4, R = 13;
    const post = (x, z, h) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, h || 1.2, 0.22), lmat(0x6e4a2b)); m.position.set(x, height(x, z) + (h || 1.2) / 2, z); group.add(m); };
    const rail = (x, z, len, ang) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.13, 0.09), lmat(0x9a7a52)); m.position.set(x, height(x, z) + 0.85, z); m.rotation.y = ang; group.add(m); };
    for (let i = -R; i <= R; i += 2.4) { post(cx + i, cz - R); post(cx + i, cz + R); post(cx - R, cz + i); post(cx + R, cz + i); }
    for (let i = -R + 1.2; i < R; i += 2.4) {
      rail(cx + i, cz - R, 2.4, 0); solids.push({ x: cx + i, z: cz - R, r: 1.2 });
      rail(cx + i, cz + R, 2.4, 0); solids.push({ x: cx + i, z: cz + R, r: 1.2 });
      rail(cx - R, cz + i, 2.4, Math.PI / 2); solids.push({ x: cx - R, z: cz + i, r: 1.2 });
      if (Math.abs(i) > 2.5) { rail(cx + R, cz + i, 2.4, Math.PI / 2); solids.push({ x: cx + R, z: cz + i, r: 1.2 }); }   // east GATE gap (toward the village + the Farm Deed)
    }
    for (const [sx, sz] of [[-R, -R], [-R, R], [R, -R], [R, R]]) solids.push({ x: cx + sx, z: cz + sz, r: 1.3 });   // seal the corners
    { const bx = cx - 6.5, bz = cz - 7.5, by = height(bx, bz); const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), lmat(0x9a3a2e)); wall.position.set(bx, by + 2, bz); const roof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.6, 4), lmat(0x6a2a22)); roof.position.set(bx, by + 5.2, bz); roof.rotation.y = Math.PI / 4; const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.2), lmat(0x4a2018)); door.position.set(bx, by + 1.3, bz + 2.5); group.add(wall, roof, door); solids.push({ x: bx, z: bz, r: 3 }); }
    // Real, moving farm livestock (built + animated by entities.js). Penned = never flees + stays within roam of home → inside the fence.
    const penned = (kind, x, z, roam) => animalSpawns.push({ kind, x, z, home: { x, z }, roam, penned: true });
    penned('chicken', cx + 5, cz - 6, 3.0); penned('chicken', cx + 6.5, cz - 5, 3.0); penned('chicken', cx + 4, cz - 7.5, 3.0);
    penned('pig', cx + 8, cz + 6, 3.4); penned('pig', cx + 6.5, cz + 7.5, 3.4);
    penned('cow', cx - 5, cz + 7, 4.0); penned('cow', cx - 2.5, cz + 8, 4.0);
    penned('sheep', cx - 9, cz - 3, 3.4); penned('sheep', cx - 7, cz - 2, 3.4); penned('sheep', cx - 9, cz + 1, 3.4);
    penned('goat', cx + 1, cz - 8, 3.4);
    for (let i = 0; i < 6; i++) plot(cx - 1 + (i % 3) * 2.2, cz - 1 + Math.floor(i / 3) * 2.2);
    const dx = cx + R, dz = cz; signpost(dx, dz, 0x8ae06a); stations.push({ kind: 'farmdeed', label: 'Farm Deed', x: dx, z: dz, y: height(dx, dz) });
    const ox = cx - 4, oz = cz - 3; { const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.0, 6), lmat(0x6e4a2b)); fp.position.set(ox, height(ox, oz) + 1.0, oz); const bd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.12), lmat(0xc8a24a)); bd.position.set(ox, height(ox, oz) + 1.9, oz); group.add(fp, bd); }
    stations.push({ kind: 'foreman', label: 'Farm Foreman', x: ox, z: oz, y: height(ox, oz) });
  })();

  // Wild creatures scattered across fitting biomes — they wander/graze; prey species flee the player.
  // [regionKey, kind, count, offsetX, offsetZ] — placed near the (scaled) region centre + jitter, snapped to walkable land.
  for (const [rk, kind, n, ox, oz] of [
    ['verdant', 'deer', 2, 18, -20], ['verdant', 'rabbit', 2, -12, 8], ['verdant', 'fox', 1, 8, -10],
    ['forest', 'deer', 2, -8, 12], ['forest', 'boar', 1, 12, -10], ['forest', 'rabbit', 2, -4, -16],
    ['glade', 'deer', 2, 14, -8], ['glade', 'rabbit', 2, -10, 12], ['glade', 'squirrel', 1, 4, 6],
    ['amberfell', 'squirrel', 2, 8, -6], ['amberfell', 'deer', 1, -10, 8], ['amberfell', 'fox', 1, 0, 10],
    ['highland', 'goat', 2, -10, 16], ['highland', 'boar', 1, 12, -8],
    ['jungle', 'boar', 2, 10, 8], ['jungle', 'fox', 1, -12, -14],
    ['snow', 'goat', 2, -10, 16], ['snow', 'rabbit', 1, 12, -8],
    ['sporevale', 'badger', 2, 4, -8], ['sporevale', 'squirrel', 1, -10, 12],
    ['mistmoor', 'duck', 2, -10, 12], ['mistmoor', 'badger', 1, 4, -8],
    ['lagoon', 'duck', 3, -6, 10],
    ['saltcrest', 'duck', 2, -8, 12], ['saltcrest', 'rabbit', 1, 10, 8],
    ['desert', 'rabbit', 2, -14, 10],
    ['skyreach', 'goat', 2, -8, -12],
  ]) {
    const reg = byKey[rk]; if (!reg) continue;
    for (let i = 0; i < n; i++) {
      const jx = reg.x + ox + (rng() - 0.5) * 9, jz = reg.z + oz + (rng() - 0.5) * 9;
      const p = kind === 'duck' ? shore(jx, jz) : snapLand(jx, jz);   // ducks settle at the water's edge
      if (kind !== 'duck' && !isWalkable(p.x, p.z)) continue;
      animalSpawns.push({ kind, x: p.x, z: p.z, home: { x: p.x, z: p.z } });
    }
  }

  // Emberdeep cave: ring of rock spires with a SW entrance gap + a loot chest.
  (function cave() {
    const cols = 16;
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * TAU; if (a > 3.3 && a < 4.3) continue;
      const x = CAVE.x + Math.cos(a) * CAVE.r, z = CAVE.z + Math.sin(a) * CAVE.r, hh = 4 + rng() * 2;
      const col = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), new THREE.MeshLambertMaterial({ color: 0x6a6358, flatShading: true }));
      col.position.set(x, height(x, z) + hh * 0.4, z); col.scale.set(1.3, hh, 1.3); col.rotation.y = rng() * TAU; group.add(col); solids.push({ x, z, r: 1.6 });
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
      col.position.set(x, height(x, z) + hh * 0.4, z); col.scale.set(1.2, hh, 1.2); col.rotation.y = rng() * TAU; group.add(col); solids.push({ x, z, r: 1.6 });
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
      group.add(col); solids.push({ x, z, r: 1.5 });   // dungeon walls (SW gap stays the entrance)
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
  for (const s of SHORTCUT_LINKS) { const a = snapLand(s.a.x, s.a.z), b = snapLand(s.b.x, s.b.z); pad(a.x, a.z, b.x, b.z, s.level, s.name); pad(b.x, b.z, a.x, a.z, s.level, s.name); }

  // crossing visuals vary by type: a grand stone-arch span, a rustic plank causeway, a
  // natural isthmus (blended land), or a FERRY (a dock at each shore + a boat shuttling the sea-lane).
  const ferries = [], ferryBoats = [];
  function dock(x, z) {
    const y = height(x, z);
    const plat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 6), lmat(0x6a4a2a)); plat.position.set(x, Math.max(y, 1.0) + 0.2, z); group.add(plat);
    for (const o of [-2.2, 2.2]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.6, 6), lmat(0x5a3a22)); post.position.set(x, y + 0.7, z + o); group.add(post); }
    const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0x7fe0ff })); lamp.position.set(x, y + 1.7, z); group.add(lamp);
  }
  for (const b of BRIDGES) {
    if (b.type === 'ferry') {
      const A = snapLand(b.ax, b.az), B = snapLand(b.bx, b.bz);   // docks must sit on solid (walkable) shore, not beach
      dock(A.x, A.z); dock(B.x, B.z);
      const boat = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 4.2), lmat(0x7a4a2a)); hull.position.y = 0.35; boat.add(hull);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), lmat(0x5a3a22)); mast.position.y = 1.6; boat.add(mast);
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshLambertMaterial({ color: 0xe8e0c8, side: THREE.DoubleSide })); sail.position.y = 1.7; boat.add(sail);
      group.add(boat); ferryBoats.push({ m: boat, ax: b.ax, az: b.az, bx: b.bx, bz: b.bz });   // boat sails the open-water rim line
      ferries.push({ x: A.x, z: A.z, toX: B.x, toZ: B.z }, { x: B.x, z: B.z, toX: A.x, toZ: A.z });
      continue;
    }
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

  // The Frostmaw — a skilling-boss arena in the snowfields: an ice idol + a brazier you feed
  (function frostmaw() {
    const reg = byKey.snow; if (!reg) return;
    const p = snapLand(reg.x, reg.z + 18), fx = p.x, fz = p.z, fy = height(fx, fz);
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(3.0, 0), lmat(0x9bd0ff)); body.position.set(fx, fy + 3, fz); body.scale.y = 1.5; group.add(body);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 5), lmat(0xcfeaff)); horn.position.set(fx - 1, fy + 5.2, fz); horn.rotation.z = 0.45; group.add(horn);
    const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 5), lmat(0xcfeaff)); horn2.position.set(fx + 1, fy + 5.2, fz); horn2.rotation.z = -0.45; group.add(horn2);
    const eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), new THREE.MeshBasicMaterial({ color: 0x2bd6ff })); eye.position.set(fx, fy + 4.2, fz + 2.4); group.add(eye);
    shimMeshes.push({ m: eye, baseY: fy + 4.2, seed: 7, kind: 'spin' });
    solids.push({ x: fx, z: fz, r: 3.0 });
    const bx = fx, bz = fz + 6, by = height(bx, bz);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 1.1, 8), lmat(0x4a4036)); stand.position.set(bx, by + 0.55, bz); group.add(stand);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.55, 0.4, 8), lmat(0x6a5a44)); bowl.position.set(bx, by + 1.2, bz); group.add(bowl);
    const fire = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 6), new THREE.MeshBasicMaterial({ color: 0xff8a3d })); fire.position.set(bx, by + 1.95, bz); group.add(fire);
    shimMeshes.push({ m: fire, baseY: by + 1.95, seed: 3, kind: 'spin' });
    stations.push({ kind: 'frostmaw', label: 'Frostmaw Brazier', x: bx, z: bz, y: by });
    locations.push({ name: 'The Frostmaw', x: fx, z: fz });
  })();
  for (const dg of DUNGEONS) locations.push({ name: dg.name, x: dg.x, z: dg.z });
  locations.push({ name: 'The Mistmoor', x: byKey.mistmoor.x, z: byKey.mistmoor.z });
  locations.push({ name: 'Tide Isle', x: byKey.tideisle.x, z: byKey.tideisle.z });
  locations.push({ name: 'Kytari Jungle', x: byKey.jungle.x, z: byKey.jungle.z });
  locations.push({ name: 'Scorched Wastes', x: byKey.badlands.x, z: byKey.badlands.z });
  locations.push({ name: 'Stormhold Highlands', x: byKey.highland.x, z: byKey.highland.z });
  locations.push({ name: 'Moonlit Glade', x: byKey.glade.x, z: byKey.glade.z });
  locations.push({ name: 'Saltcrest Shoals', x: 80 * WS, z: 200 * WS });
  locations.push({ name: 'Amberfell Woods', x: 50 * WS, z: -148 * WS });
  locations.push({ name: 'The Spore Vale', x: byKey.sporevale.x, z: byKey.sporevale.z });
  locations.push({ name: 'Cinderbreak Isle', x: byKey.cinderbreak.x, z: byKey.cinderbreak.z });
  function peakName(key) { return ({ verdant: 'North Peak', forest: 'Forest Tor', snow: 'Frostpeak', ember: 'Emberpeak', jungle: 'Kytari Spire', badlands: 'Red Mesa', highland: 'Thunderpeak', glade: 'Moonspire', amberfell: 'Amber Tor', shardspire: 'Prism Peak', skyreach: 'Aerie Spire', cinderbreak: 'Cinder Cone', sporevale: 'Spore Knoll' })[key] || 'Peak'; }

  const zero = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);
  function setOreScale(o, s) { dummy.position.set(o.x, o.y + 0.5 * s, o.z); dummy.scale.set(s, 1.2 * s, s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); oreIM.setMatrixAt(o.idx, dummy.matrix); oreIM.instanceMatrix.needsUpdate = true; }

  return {
    group, height, isWalkable, WATER_Y,
    village: VILLAGE_A,
    villages: villages.map((v) => ({ name: v.name, x: v.x, z: v.z })),
    regions: REGIONS, biomes: BIOMES, isles: REGIONS, bridges: BRIDGES, bridge: BRIDGES[0],
    peaks: REGIONS.filter((r) => r.peak).map((r) => r.peak), cave: CAVE, cave2: CAVE2, dungeons: DUNGEONS, locations,
    trees, rocks, bushes, oreNodes, fishingSpots, stations, plots, stalls, shortcuts, solids, animalSpawns, obstacles: solids.filter((s) => s.r >= 1.2), mines: MINES, discoveries, houseFurniture, ferries, waystones, snapLand, findClear, ambientEmitters,
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
      for (const s of shimMeshes) { if (s.kind === 'spin') s.m.rotation.y = animT * 0.6 + s.seed; else if (s.kind === 'pulse') s.m.scale.setScalar(0.9 + Math.sin(animT * 2 + s.seed) * 0.12); s.m.position.y = s.baseY + Math.sin(animT * 1.1 + s.seed) * 0.25; }
      water.position.y = WATER_Y + Math.sin(animT * 0.5) * 0.08;
      for (const f of ferryBoats) { const t = (Math.sin(animT * 0.18) + 1) / 2; f.m.position.set(f.ax + (f.bx - f.ax) * t, 0.9 + Math.sin(animT * 2) * 0.06, f.az + (f.bz - f.az) * t); f.m.rotation.y = Math.atan2(f.bx - f.ax, f.bz - f.az); }
      for (const o of oreNodes) if (!o.alive) { o.respawn -= dt; if (o.respawn <= 0) { o.alive = true; setOreScale(o, 1); } }
      for (const pl of plots) if (pl.state === 'growing') { pl.grow -= dt; if (pl.grow <= 0) { pl.state = 'grown'; plotVisual(pl); } }
      for (const s of stalls) if (s.cooldown > 0) s.cooldown -= dt;
      for (const s of shortcuts) if (s.cooldown > 0) s.cooldown -= dt;
      for (const d of discoveries) if (d.cooldown > 0) d.cooldown -= dt;   // repeatable POIs recharge
    },
  };
}
