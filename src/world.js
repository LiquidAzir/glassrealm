import * as THREE from 'three';
import { TAU, clamp, smoothstep, mulberry32, dist2D, distToSeg } from './util.js';

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
};

const REGIONS = [
  { key: 'verdant', x: 0,   z: 0,   r: 54, biome: 'grass',    village: { name: 'Hearth Village', x: 6, z: -12, hut: [0xcaa878, 0x9a4f3a] }, peak: { x: 0, z: -36, r: 20, h: 9 },  tree: 'pine',   nTree: 36, nBush: 14, nRock: 14, nFish: 5, ore: [['copper', 6]] },
  { key: 'forest',  x: -96, z: 14,  r: 42, biome: 'forest',                                                                                  peak: { x: -104, z: 2, r: 18, h: 7 }, tree: 'pine',   nTree: 52, nBush: 12, nRock: 8,  nFish: 3, ore: [['copper', 4]] },
  { key: 'desert',  x: 26,  z: 104, r: 46, biome: 'desert',   village: { name: 'Sunspire Oasis', x: 26, z: 104, hut: [0xd9b98a, 0xc09050] },                                       tree: 'cactus', nTree: 22, nBush: 3,  nRock: 12, nFish: 3, ore: [['iron', 5]] },
  { key: 'snow',    x: 98,  z: -86, r: 44, biome: 'snow',                                                                                     peak: { x: 98, z: -92, r: 22, h: 12 }, tree: 'pine',  nTree: 30, nBush: 5,  nRock: 10, nFish: 3, ore: [['coal', 5]] },
  { key: 'ember',   x: 116, z: 8,   r: 46, biome: 'volcanic', village: { name: 'Emberhold', x: 110, z: 18, hut: [0xb98c63, 0x6b4636], smithy: true }, peak: { x: 122, z: -4, r: 17, h: 11 }, tree: 'pine', nTree: 14, nBush: 0, nRock: 16, nFish: 4, ore: [['iron', 5], ['coal', 4]] },
];
const BRIDGE_LINKS = [['verdant', 'ember'], ['verdant', 'forest'], ['verdant', 'desert'], ['ember', 'snow']];
const CAVE = { x: 138, z: -14, r: 11 };

export function createWorld(scene, seed = 1337) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  const byKey = {}; REGIONS.forEach((r) => (byKey[r.key] = r));
  const villages = REGIONS.filter((r) => r.village).map((r) => r.village);

  // bridges: edge-to-edge segments between linked regions
  const BRIDGES = BRIDGE_LINKS.map(([a, b]) => {
    const A = byKey[a], B = byKey[b];
    const dx = B.x - A.x, dz = B.z - A.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
    return { ax: A.x + ux * (A.r - 5), az: A.z + uz * (A.r - 5), bx: B.x - ux * (B.r - 5), bz: B.z - uz * (B.r - 5), halfW: 6 };
  });

  // --- height field -------------------------------------------------------
  function landMask(x, z) {
    let m = 0;
    for (const r of REGIONS) m = Math.max(m, smoothstep((r.r - Math.hypot(x - r.x, z - r.z)) / 16));
    for (const b of BRIDGES) m = Math.max(m, smoothstep((b.halfW - distToSeg(x, z, b.ax, b.az, b.bx, b.bz)) / 5));
    return m;
  }
  function height(x, z) {
    const land = landMask(x, z);
    let h = land * 2.4;
    h += (Math.sin(x * 0.10) * Math.cos(z * 0.09) * 1.3 + Math.sin(x * 0.06 + z * 0.045 + 2.0) * 1.1 + Math.cos(z * 0.08) * 0.7) * land;
    for (const r of REGIONS) if (r.peak) h += smoothstep(clamp(1 - Math.hypot(x - r.peak.x, z - r.peak.z) / r.peak.r, 0, 1)) * r.peak.h * land;
    h += (land - 1) * 1.6;
    // flatten bridges into level causeways so noise dips never break the path
    for (const b of BRIDGES) { const fl = smoothstep(clamp((b.halfW - distToSeg(x, z, b.ax, b.az, b.bx, b.bz)) / 4, 0, 1)); h = h * (1 - fl) + 1.8 * fl; }
    for (const v of villages) { const flat = smoothstep(clamp((9 - dist2D(x, z, v.x, v.z)) / 9, 0, 1)); h = h * (1 - flat) + 2.0 * flat; }
    return h;
  }
  const isWalkable = (x, z) => height(x, z) > 0.35;
  function biomeAt(x, z) { let best = REGIONS[0], bd = Infinity; for (const r of REGIONS) { const d = Math.hypot(x - r.x, z - r.z) - r.r; if (d < bd) { bd = d; best = r; } } return best.biome; }

  // --- terrain mesh (biome-coloured) -------------------------------------
  const SIZE = 330, SEG = 92, CX = 12, CZ = 10;
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
    for (const [type, n] of (reg.ore || [])) scatterIn(reg, n, 0.8, 10.0, 2.8, (x, z, y) => oreNodes.push({ x, z, y, type, alive: true, respawn: 0 }));
  }
  for (let i = 0; i < 6; i++) { const a = rng() * TAU, rad = 2 + rng() * (CAVE.r - 4); const x = CAVE.x + Math.cos(a) * rad, z = CAVE.z + Math.sin(a) * rad; oreNodes.push({ x, z, y: height(x, z), type: rng() > 0.4 ? 'iron' : 'coal', alive: true, respawn: 0 }); }

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
  const oreCol = { copper: 0xc87a3a, iron: 0xb9a99a, coal: 0x6c6f7a };
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
  const stations = [];
  function hut(x, z, a, wallHex, roofHex) {
    const y = height(x, z);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 3), new THREE.MeshLambertMaterial({ color: wallHex, flatShading: true }));
    wall.position.set(x, y + 1.1, z); wall.rotation.y = a;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.7, 4), new THREE.MeshLambertMaterial({ color: roofHex, flatShading: true }));
    roof.position.set(x, y + 3.05, z); roof.rotation.y = a + Math.PI / 4;
    group.add(wall, roof);
  }
  function fire(x, z) { const y = height(x, z); const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0xffb347 })); m.position.set(x, y + 0.7, z); group.add(m); stations.push({ kind: 'cook', label: 'Cooking Fire', x, z, y }); }
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
  for (const v of villages) {
    const huts = 5;
    for (let i = 0; i < huts; i++) { const a = (i / huts) * TAU + 0.3; hut(v.x + Math.cos(a) * 5.2, v.z + Math.sin(a) * 5.2, a, v.hut[0], v.hut[1]); }
    fire(v.x, v.z + 5);
    bankChest(v.x + 7, v.z - 2);
    altar(v.x - 6, v.z - 4);
    cauldron(v.x + 9, v.z + 3);
    stall(v.x - 9, v.z + 4);
    plot(v.x + 11, v.z - 6); plot(v.x + 13, v.z - 6); plot(v.x + 12, v.z - 8);
    if (v.smithy) smithy(v.x + 4, v.z - 1);
  }

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
    stations.push({ kind: 'chest', label: 'Cave Chest', x: CAVE.x, z: CAVE.z, y: cy, looted: false });
  })();

  scene.add(group);

  const VILLAGE_A = byKey.verdant.village;
  const locations = [];
  for (const r of REGIONS) { if (r.village) locations.push({ name: r.village.name, x: r.village.x, z: r.village.z }); if (r.peak) locations.push({ name: peakName(r.key), x: r.peak.x, z: r.peak.z }); }
  locations.push({ name: 'Whispering Wood', x: byKey.forest.x, z: byKey.forest.z });
  locations.push({ name: 'Snowfields', x: byKey.snow.x, z: byKey.snow.z });
  locations.push({ name: 'The Isthmus', x: 61, z: 4 });
  locations.push({ name: 'Emberdeep Cave', x: CAVE.x, z: CAVE.z });
  function peakName(key) { return ({ verdant: 'North Peak', forest: 'Forest Tor', snow: 'Frostpeak', ember: 'Emberpeak' })[key] || 'Peak'; }

  const zero = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);
  function setOreScale(o, s) { dummy.position.set(o.x, o.y + 0.5 * s, o.z); dummy.scale.set(s, 1.2 * s, s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); oreIM.setMatrixAt(o.idx, dummy.matrix); oreIM.instanceMatrix.needsUpdate = true; }

  return {
    group, height, isWalkable, WATER_Y,
    village: VILLAGE_A,
    villages: villages.map((v) => ({ name: v.name, x: v.x, z: v.z })),
    regions: REGIONS, biomes: BIOMES, isles: REGIONS, bridges: BRIDGES, bridge: BRIDGES[0],
    peaks: REGIONS.filter((r) => r.peak).map((r) => r.peak), cave: CAVE, locations,
    trees, rocks, bushes, oreNodes, fishingSpots, stations, plots, stalls,
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
    tick(dt) {
      for (const o of oreNodes) if (!o.alive) { o.respawn -= dt; if (o.respawn <= 0) { o.alive = true; setOreScale(o, 1); } }
      for (const pl of plots) if (pl.state === 'growing') { pl.grow -= dt; if (pl.grow <= 0) { pl.state = 'grown'; plotVisual(pl); } }
      for (const s of stalls) if (s.cooldown > 0) s.cooldown -= dt;
    },
  };
}
