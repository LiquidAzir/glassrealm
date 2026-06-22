import * as THREE from 'three';
import { TAU, clamp, smoothstep, mulberry32, dist2D, distToSeg } from './util.js';

// One contiguous world (single heightfield, one terrain mesh, no loading zones):
// the Verdant Isle (start) and the volcanic Ember Isle, joined by a walkable
// land isthmus. Instanced props keep it to a handful of draw calls.

const WATER_Y = 0;
const ISLES = [
  { key: 'verdant', x: 0, z: 0, r: 54 },
  { key: 'ember', x: 116, z: 8, r: 46 },
];
const BRIDGE = { ax: 48, az: 2, bx: 74, bz: 6, halfW: 6 };
const PEAK_A = { x: 0, z: -36, r: 20, h: 9 };
const PEAK_B = { x: 122, z: -4, r: 17, h: 11 };
const VILLAGE_A = { x: 6, z: -12 };
const VILLAGE_B = { x: 110, z: 18 };
const CAVE = { x: 138, z: -14, r: 11 };

export function createWorld(scene, seed = 1337) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  const emberC = ISLES[1];

  // --- height field -------------------------------------------------------
  function landMask(x, z) {
    let m = 0;
    for (const i of ISLES) m = Math.max(m, smoothstep((i.r - Math.hypot(x - i.x, z - i.z)) / 16));
    const bd = distToSeg(x, z, BRIDGE.ax, BRIDGE.az, BRIDGE.bx, BRIDGE.bz);
    m = Math.max(m, smoothstep((BRIDGE.halfW - bd) / 5));
    return m;
  }
  function height(x, z) {
    const land = landMask(x, z);
    let h = land * 2.4;
    let n = Math.sin(x * 0.10) * Math.cos(z * 0.09) * 1.3
          + Math.sin(x * 0.05 + z * 0.045 + 2.0) * 1.1
          + Math.cos(z * 0.08) * 0.7;
    h += n * land;
    h += smoothstep(clamp(1 - Math.hypot(x - PEAK_A.x, z - PEAK_A.z) / PEAK_A.r, 0, 1)) * PEAK_A.h * land;
    h += smoothstep(clamp(1 - Math.hypot(x - PEAK_B.x, z - PEAK_B.z) / PEAK_B.r, 0, 1)) * PEAK_B.h * land;
    h += (land - 1) * 1.6;
    for (const v of [VILLAGE_A, VILLAGE_B]) {
      const flat = smoothstep(clamp((9 - dist2D(x, z, v.x, v.z)) / 9, 0, 1));
      h = h * (1 - flat) + 2.0 * flat;
    }
    return h;
  }
  const isWalkable = (x, z) => height(x, z) > 0.35;
  const onEmber = (x, z) => dist2D(x, z, emberC.x, emberC.z) < emberC.r + 8;

  // --- terrain mesh (region-coloured) ------------------------------------
  const SIZE = 240, SEG = 80;
  let geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  geo.translate(54, 0, 3);
  const pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) pa.setY(i, height(pa.getX(i), pa.getZ(i)));
  geo = geo.toNonIndexed();
  geo.computeVertexNormals();

  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  const C = {
    sea: 0x123842, sand: 0xe6d29a, grass: 0x66c97a, grass2: 0x4fae84, rock: 0x9aa6b2, snow: 0xeaf2ff,
    eSand: 0xd7be8e, eGround: 0xb07045, eGround2: 0x9c6a3f, eRock: 0x8f8a86, lava: 0xff8a3d,
  };
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    let hex;
    if (h < -0.2) hex = C.sea;
    else if (onEmber(cx, cz)) {
      if (h < 0.9) hex = C.eSand;
      else if (h > 8.5) hex = C.lava;
      else if (h < 5) hex = rng() > 0.5 ? C.eGround : C.eGround2;
      else hex = C.eRock;
    } else {
      if (h < 0.9) hex = C.sand;
      else if (h < 5) hex = rng() > 0.5 ? C.grass : C.grass2;
      else if (h < 8.2) hex = C.rock;
      else hex = C.snow;
    }
    c.setHex(hex).multiplyScalar(0.9 + rng() * 0.2);
    for (let k = 0; k < 3; k++) { colors[(i + k) * 3] = c.r; colors[(i + k) * 3 + 1] = c.g; colors[(i + k) * 3 + 2] = c.b; }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  group.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));

  // --- water --------------------------------------------------------------
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1100, 1100).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0x2bd6cf, transparent: true, opacity: 0.5, depthWrite: false }));
  water.position.set(54, WATER_Y, 3);
  group.add(water);

  // --- scatter helper -----------------------------------------------------
  const occupied = [];
  function scatterIn(isle, count, hMin, hMax, minGap, avoidVillages, fn) {
    let placed = 0, tries = 0;
    while (placed < count && tries < count * 40) {
      tries++;
      const a = rng() * TAU, rad = Math.sqrt(rng()) * isle.r * 0.92;
      const x = isle.x + Math.cos(a) * rad, z = isle.z + Math.sin(a) * rad;
      const h = height(x, z);
      if (h < hMin || h > hMax) continue;
      if (avoidVillages && (dist2D(x, z, VILLAGE_A.x, VILLAGE_A.z) < 9 || dist2D(x, z, VILLAGE_B.x, VILLAGE_B.z) < 9)) continue;
      let ok = true;
      for (const o of occupied) if (dist2D(x, z, o.x, o.z) < minGap) { ok = false; break; }
      if (!ok) continue;
      occupied.push({ x, z });
      fn(x, z, h); placed++;
    }
  }
  const dummy = new THREE.Object3D();
  const tmpC = new THREE.Color();

  // --- trees (instanced, per-instance foliage colour) ---------------------
  const trees = [];
  scatterIn(ISLES[0], 42, 1.5, 6.0, 3.0, true, (x, z, y) => trees.push({ x, z, y, s: 0.8 + rng() * 0.7, alive: true, ember: false }));
  scatterIn(ISLES[1], 16, 1.5, 5.5, 3.0, true, (x, z, y) => trees.push({ x, z, y, s: 0.8 + rng() * 0.6, alive: true, ember: true }));
  const N = Math.max(trees.length, 1);
  const trunkIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.3, 1.7, 5), new THREE.MeshLambertMaterial({ flatShading: true }), N);
  const folLowIM = new THREE.InstancedMesh(new THREE.ConeGeometry(1.5, 2.3, 6), new THREE.MeshLambertMaterial({ flatShading: true }), N);
  const folHiIM = new THREE.InstancedMesh(new THREE.ConeGeometry(1.05, 1.9, 6), new THREE.MeshLambertMaterial({ flatShading: true }), N);
  trees.forEach((t, i) => {
    const s = t.s;
    dummy.rotation.set(0, rng() * TAU, 0);
    dummy.scale.setScalar(s);
    dummy.position.set(t.x, t.y + 0.85 * s, t.z); dummy.updateMatrix(); trunkIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.y + 2.15 * s, t.z); dummy.updateMatrix(); folLowIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.y + 3.35 * s, t.z); dummy.updateMatrix(); folHiIM.setMatrixAt(i, dummy.matrix);
    trunkIM.setColorAt(i, tmpC.setHex(t.ember ? 0x5a4632 : 0x6e4a2b));
    folLowIM.setColorAt(i, tmpC.setHex(t.ember ? 0xc9742e : 0x3f9d5a));
    folHiIM.setColorAt(i, tmpC.setHex(t.ember ? 0xe39a3c : 0x5fc77d));
    t.idx = i;
  });
  group.add(trunkIM, folLowIM, folHiIM);

  // --- decorative rocks ---------------------------------------------------
  const rocks = [];
  scatterIn(ISLES[0], 18, 0.4, 9.5, 2.4, false, (x, z, y) => rocks.push({ x, z, y, s: 0.5 + rng() * 1.0 }));
  scatterIn(ISLES[1], 16, 0.4, 10.5, 2.4, false, (x, z, y) => rocks.push({ x, z, y, s: 0.6 + rng() * 1.1 }));
  const rockIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x8b96a3, flatShading: true }), Math.max(rocks.length, 1));
  rocks.forEach((rk, i) => {
    dummy.position.set(rk.x, rk.y + rk.s * 0.4, rk.z); dummy.scale.set(rk.s, rk.s * 0.8, rk.s); dummy.rotation.set(rng(), rng() * TAU, rng()); dummy.updateMatrix(); rockIM.setMatrixAt(i, dummy.matrix);
  });
  group.add(rockIM);

  // --- berry bushes -------------------------------------------------------
  const bushes = [];
  scatterIn(ISLES[0], 16, 1.2, 5.0, 2.6, true, (x, z, y) => bushes.push({ x, z, y, alive: true }));
  const bushIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.55, 0), new THREE.MeshLambertMaterial({ color: 0x2f8f57, flatShading: true }), Math.max(bushes.length, 1));
  bushes.forEach((b, i) => { dummy.position.set(b.x, b.y + 0.4, b.z); dummy.scale.setScalar(0.9 + rng() * 0.4); dummy.rotation.set(0, rng() * TAU, 0); dummy.updateMatrix(); bushIM.setMatrixAt(i, dummy.matrix); b.idx = i; });
  group.add(bushIM);

  // --- ore nodes (Mining) -------------------------------------------------
  const oreNodes = [];
  scatterIn(ISLES[0], 6, 0.8, 7.0, 3.0, true, (x, z, y) => oreNodes.push({ x, z, y, type: 'copper', alive: true, respawn: 0 }));
  scatterIn(ISLES[1], 9, 0.8, 10.0, 2.8, true, (x, z, y) => oreNodes.push({ x, z, y, type: rng() > 0.45 ? 'iron' : 'coal', alive: true, respawn: 0 }));
  for (let i = 0; i < 6; i++) {   // rich ore inside the Emberdeep cave
    const a = rng() * TAU, rad = 2 + rng() * (CAVE.r - 4);
    const x = CAVE.x + Math.cos(a) * rad, z = CAVE.z + Math.sin(a) * rad;
    oreNodes.push({ x, z, y: height(x, z), type: rng() > 0.4 ? 'iron' : 'coal', alive: true, respawn: 0 });
  }
  const oreCol = { copper: 0xc87a3a, iron: 0xb9a99a, coal: 0x6c6f7a };
  const oreIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.85, 0), new THREE.MeshLambertMaterial({ flatShading: true }), Math.max(oreNodes.length, 1));
  oreNodes.forEach((o, i) => {
    dummy.position.set(o.x, o.y + 0.5, o.z); dummy.scale.set(1, 1.2, 1); dummy.rotation.set(rng(), rng() * TAU, rng()); dummy.updateMatrix(); oreIM.setMatrixAt(i, dummy.matrix);
    oreIM.setColorAt(i, tmpC.setHex(oreCol[o.type])); o.idx = i;
  });
  group.add(oreIM);

  // --- fishing spots ------------------------------------------------------
  const fishingSpots = [];
  function addFishing(isle, n) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + rng() * 0.4;
      let r = isle.r * 0.5;
      while (r < isle.r + 12 && height(isle.x + Math.cos(a) * r, isle.z + Math.sin(a) * r) > 0.15) r += 1.2;
      const x = isle.x + Math.cos(a) * (r + 1.2), z = isle.z + Math.sin(a) * (r + 1.2);
      fishingSpots.push({ x, z, y: WATER_Y + 0.06, alive: true });
    }
  }
  addFishing(ISLES[0], 5); addFishing(ISLES[1], 4);
  const fishIM = new THREE.InstancedMesh(new THREE.RingGeometry(0.5, 1.0, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x9bf2ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }), Math.max(fishingSpots.length, 1));
  fishingSpots.forEach((f, i) => { dummy.position.set(f.x, f.y, f.z); dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); fishIM.setMatrixAt(i, dummy.matrix); f.idx = i; });
  group.add(fishIM);

  // --- settlements + stations --------------------------------------------
  function hut(x, z, a, wallHex, roofHex) {
    const y = height(x, z);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 3), new THREE.MeshLambertMaterial({ color: wallHex, flatShading: true }));
    wall.position.set(x, y + 1.1, z); wall.rotation.y = a;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.7, 4), new THREE.MeshLambertMaterial({ color: roofHex, flatShading: true }));
    roof.position.set(x, y + 3.05, z); roof.rotation.y = a + Math.PI / 4;
    group.add(wall, roof);
  }
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.3; hut(VILLAGE_A.x + Math.cos(a) * 5.2, VILLAGE_A.z + Math.sin(a) * 5.2, a, 0xcaa878, 0x9a4f3a); }
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.6; hut(VILLAGE_B.x + Math.cos(a) * 5.0, VILLAGE_B.z + Math.sin(a) * 5.0, a, 0xb98c63, 0x6b4636); }

  const stations = [];
  function fire(x, z, label, kind) {
    const y = height(x, z);
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
    m.position.set(x, y + 0.7, z); group.add(m);
    stations.push({ kind, label, x, z, y });
  }
  fire(VILLAGE_A.x, VILLAGE_A.z + 4, 'Cooking Fire', 'cook');
  fire(VILLAGE_B.x - 4, VILLAGE_B.z - 3, 'Cooking Fire', 'cook');
  // furnace + anvil at Emberhold
  (function smithy() {
    const fx = VILLAGE_B.x + 3, fz = VILLAGE_B.z - 1, fy = height(fx, fz);
    const furnace = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 1.8), new THREE.MeshLambertMaterial({ color: 0x7a6f66, flatShading: true }));
    furnace.position.set(fx, fy + 1.0, fz);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.4), new THREE.MeshBasicMaterial({ color: 0xff7a33 }));
    glow.position.set(fx, fy + 0.8, fz + 0.95);
    group.add(furnace, glow);
    stations.push({ kind: 'furnace', label: 'Furnace', x: fx, z: fz, y: fy });
    const ax = VILLAGE_B.x + 1, az = VILLAGE_B.z + 2, ay = height(ax, az);
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.6), new THREE.MeshLambertMaterial({ color: 0x55585f, flatShading: true }));
    anvil.position.set(ax, ay + 0.7, az);
    group.add(anvil);
    stations.push({ kind: 'anvil', label: 'Anvil', x: ax, z: az, y: ay });
  })();

  function bankChest(x, z) {
    const y = height(x, z);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), new THREE.MeshLambertMaterial({ color: 0x5b7cff, flatShading: true }));
    chest.position.set(x, y + 0.5, z);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.0), new THREE.MeshLambertMaterial({ color: 0x9bb0ff, flatShading: true }));
    lid.position.set(x, y + 1.05, z);
    group.add(chest, lid);
    stations.push({ kind: 'bank', label: 'Bank', x, z, y });
  }
  bankChest(VILLAGE_A.x + 4, VILLAGE_A.z - 1);
  bankChest(VILLAGE_B.x - 2, VILLAGE_B.z + 5);

  // Emberdeep cave: a ring of rock spires with a south-west entrance gap + a loot chest.
  (function cave() {
    const cols = 16;
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * TAU;
      if (a > 3.3 && a < 4.3) continue;   // entrance gap
      const x = CAVE.x + Math.cos(a) * CAVE.r, z = CAVE.z + Math.sin(a) * CAVE.r;
      const hh = 4 + rng() * 2;
      const col = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), new THREE.MeshLambertMaterial({ color: 0x6a6358, flatShading: true }));
      col.position.set(x, height(x, z) + hh * 0.4, z); col.scale.set(1.3, hh, 1.3); col.rotation.y = rng() * TAU;
      group.add(col);
    }
    const cy = height(CAVE.x, CAVE.z);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), new THREE.MeshLambertMaterial({ color: 0xffd45f, flatShading: true }));
    chest.position.set(CAVE.x, cy + 0.5, CAVE.z); group.add(chest);
    stations.push({ kind: 'chest', label: 'Cave Chest', x: CAVE.x, z: CAVE.z, y: cy, looted: false });
  })();

  scene.add(group);

  const locations = [
    { name: 'Hearth Village', x: VILLAGE_A.x, z: VILLAGE_A.z },
    { name: 'Whispering Wood', x: -34, z: 6 },
    { name: 'North Peak', x: PEAK_A.x, z: PEAK_A.z },
    { name: 'The Isthmus', x: 61, z: 4 },
    { name: 'Emberhold', x: VILLAGE_B.x, z: VILLAGE_B.z },
    { name: 'Emberpeak', x: PEAK_B.x, z: PEAK_B.z },
    { name: 'Ashen Shore', x: 146, z: 10 },
    { name: 'Emberdeep Cave', x: CAVE.x, z: CAVE.z },
  ];

  const zero = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);
  function setOreScale(o, s) {
    dummy.position.set(o.x, o.y + 0.5 * s, o.z); dummy.scale.set(s, 1.2 * s, s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
    oreIM.setMatrixAt(o.idx, dummy.matrix); oreIM.instanceMatrix.needsUpdate = true;
  }

  return {
    group, height, isWalkable, WATER_Y, onEmber,
    village: VILLAGE_A,
    villages: [{ name: 'Hearth Village', x: VILLAGE_A.x, z: VILLAGE_A.z }, { name: 'Emberhold', x: VILLAGE_B.x, z: VILLAGE_B.z }],
    isles: ISLES, bridge: BRIDGE, peaks: [PEAK_A, PEAK_B], cave: CAVE, locations,
    trees, rocks, bushes, oreNodes, fishingSpots, stations,
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
    tick(dt) {
      for (const o of oreNodes) {
        if (!o.alive) { o.respawn -= dt; if (o.respawn <= 0) { o.alive = true; setOreScale(o, 1); } }
      }
    },
  };
}
