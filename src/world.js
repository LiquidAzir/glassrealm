import * as THREE from 'three';
import { TAU, clamp, smoothstep, mulberry32, dist2D } from './util.js';

// Procedural island. One terrain mesh + one water plane + instanced props, so the
// whole world is a handful of draw calls. Heights are deterministic (seeded) so
// saved world edits (chopped trees, harvested bushes) realign on reload.

const EDGE = 58;       // radius where land meets water
const WATER_Y = 0;

export function createWorld(scene, seed = 1337) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();

  const village = { x: 6, z: -12 };

  // --- height field -------------------------------------------------------
  const peak = { x: 0, z: -34 };
  function height(x, z) {
    const r = Math.hypot(x, z);
    const land = smoothstep((EDGE - r) / 16);   // 1 inland, ramps down over the last ~16u (beach)
    let h = land * 2.4;                          // gentle plains
    let n = Math.sin(x * 0.12) * Math.cos(z * 0.10) * 1.3
          + Math.sin(x * 0.06 + z * 0.05 + 2.0) * 1.1
          + Math.cos(z * 0.09) * 0.7;
    h += n * land;                              // rolling hills, calmed at the shore
    const pd = Math.hypot(x - peak.x, z - peak.z);
    h += smoothstep(clamp(1 - pd / 20, 0, 1)) * 8.5 * land;  // one northern peak
    h += (land - 1) * 1.6;                      // dip the very edge below the waterline
    // flatten a disc around the village so huts/NPCs sit level
    const dv = dist2D(x, z, village.x, village.z);
    const flat = smoothstep(clamp((9 - dv) / 9, 0, 1));
    h = h * (1 - flat) + 2.0 * flat;
    return h;
  }

  function isWalkable(x, z) {
    if (Math.hypot(x, z) > EDGE + 1) return false;
    return height(x, z) > 0.35;
  }

  // --- terrain mesh -------------------------------------------------------
  const SIZE = 150, SEG = 58;
  let geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) pa.setY(i, height(pa.getX(i), pa.getZ(i)));
  geo = geo.toNonIndexed();
  geo.computeVertexNormals();

  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const col = new THREE.Color();
  const sand = new THREE.Color(0xe6d29a);
  const grass = new THREE.Color(0x66c97a);
  const grass2 = new THREE.Color(0x4fae84);
  const rock = new THREE.Color(0x9aa6b2);
  const snow = new THREE.Color(0xeaf2ff);
  const sea = new THREE.Color(0x123842);
  for (let i = 0; i < p.count; i += 3) {
    const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const v = 0.9 + rng() * 0.2;
    if (h < -0.2) col.copy(sea);
    else if (h < 0.9) col.copy(sand);
    else if (h < 5.0) col.copy(rng() > 0.5 ? grass : grass2);
    else if (h < 8.2) col.copy(rock);
    else col.copy(snow);
    col.multiplyScalar(v);
    for (let k = 0; k < 3; k++) { colors[(i + k) * 3] = col.r; colors[(i + k) * 3 + 1] = col.g; colors[(i + k) * 3 + 2] = col.b; }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const terrain = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  group.add(terrain);

  // --- water --------------------------------------------------------------
  const waterGeo = new THREE.PlaneGeometry(600, 600, 1, 1);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x2bd6cf, transparent: true, opacity: 0.5, depthWrite: false });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = WATER_Y;
  group.add(water);

  // --- prop placement helpers --------------------------------------------
  const occupied = [];
  function place(rMin, rMax, hMin, hMax, minGap, avoidVillage) {
    for (let tries = 0; tries < 40; tries++) {
      const a = rng() * TAU;
      const rad = rMin + rng() * (rMax - rMin);
      const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      const h = height(x, z);
      if (h < hMin || h > hMax) continue;
      if (avoidVillage && dist2D(x, z, village.x, village.z) < 9) continue;
      let ok = true;
      for (const o of occupied) if (dist2D(x, z, o.x, o.z) < minGap) { ok = false; break; }
      if (!ok) continue;
      occupied.push({ x, z });
      return { x, z, y: h };
    }
    return null;
  }

  const dummy = new THREE.Object3D();

  // --- trees (trunk + 2 foliage layers, instanced) ------------------------
  const trees = [];
  for (let i = 0; i < 46; i++) {
    const pt = place(13, 52, 1.5, 6.0, 3.0, true);
    if (pt) trees.push({ ...pt, s: 0.8 + rng() * 0.7, alive: true });
  }
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.3, 1.7, 5);
  const folLowGeo = new THREE.ConeGeometry(1.5, 2.3, 6);
  const folHiGeo = new THREE.ConeGeometry(1.05, 1.9, 6);
  const trunkIM = new THREE.InstancedMesh(trunkGeo, new THREE.MeshLambertMaterial({ color: 0x6e4a2b, flatShading: true }), Math.max(trees.length, 1));
  const folLowIM = new THREE.InstancedMesh(folLowGeo, new THREE.MeshLambertMaterial({ color: 0x3f9d5a, flatShading: true }), Math.max(trees.length, 1));
  const folHiIM = new THREE.InstancedMesh(folHiGeo, new THREE.MeshLambertMaterial({ color: 0x5fc77d, flatShading: true }), Math.max(trees.length, 1));
  trees.forEach((t, i) => {
    const s = t.s;
    dummy.position.set(t.x, t.y + 0.85 * s, t.z); dummy.scale.setScalar(s); dummy.rotation.set(0, rng() * TAU, 0); dummy.updateMatrix(); trunkIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.y + 2.15 * s, t.z); dummy.updateMatrix(); folLowIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.y + 3.35 * s, t.z); dummy.updateMatrix(); folHiIM.setMatrixAt(i, dummy.matrix);
    t.idx = i;
  });
  group.add(trunkIM, folLowIM, folHiIM);

  // --- rocks --------------------------------------------------------------
  const rocks = [];
  for (let i = 0; i < 22; i++) {
    const pt = place(8, 56, 0.4, 9.5, 2.4, false);
    if (pt) rocks.push({ ...pt, s: 0.5 + rng() * 1.0 });
  }
  const rockIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x8b96a3, flatShading: true }), Math.max(rocks.length, 1));
  rocks.forEach((rk, i) => {
    dummy.position.set(rk.x, rk.y + rk.s * 0.4, rk.z); dummy.scale.set(rk.s, rk.s * 0.8, rk.s); dummy.rotation.set(rng(), rng() * TAU, rng()); dummy.updateMatrix(); rockIM.setMatrixAt(i, dummy.matrix);
  });
  group.add(rockIM);

  // --- berry bushes (foraging) -------------------------------------------
  const bushes = [];
  for (let i = 0; i < 16; i++) {
    const pt = place(11, 48, 1.2, 5.0, 2.6, true);
    if (pt) bushes.push({ ...pt, alive: true });
  }
  const bushIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.55, 0), new THREE.MeshLambertMaterial({ color: 0x2f8f57, flatShading: true }), Math.max(bushes.length, 1));
  bushes.forEach((b, i) => {
    dummy.position.set(b.x, b.y + 0.4, b.z); dummy.scale.setScalar(0.9 + rng() * 0.4); dummy.rotation.set(0, rng() * TAU, 0); dummy.updateMatrix(); bushIM.setMatrixAt(i, dummy.matrix);
    b.idx = i;
  });
  group.add(bushIM);

  // --- village huts -------------------------------------------------------
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3;
    const rad = 5.2;
    const x = village.x + Math.cos(a) * rad, z = village.z + Math.sin(a) * rad;
    const y = height(x, z);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 3), new THREE.MeshLambertMaterial({ color: 0xcaa878, flatShading: true }));
    wall.position.set(x, y + 1.1, z);
    wall.rotation.y = a;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.7, 4), new THREE.MeshLambertMaterial({ color: 0x9a4f3a, flatShading: true }));
    roof.position.set(x, y + 3.05, z);
    roof.rotation.y = a + Math.PI / 4;
    group.add(wall, roof);
  }
  // village bonfire centrepiece (a glowing marker so the hub reads at distance)
  const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
  fire.position.set(village.x, height(village.x, village.z) + 0.7, village.z);
  group.add(fire);

  scene.add(group);

  const locations = [
    { name: 'Hearth Village', x: village.x, z: village.z },
    { name: 'North Peak', x: 0, z: -40 },
    { name: 'Driftwood Shore', x: -2, z: 50 },
    { name: 'Whispering Wood', x: -34, z: 6 },
  ];

  return {
    group, terrain, height, isWalkable, EDGE, WATER_Y, village, locations,
    trees, rocks, bushes,
    removeTree(idx) {
      const t = trees[idx]; if (!t || !t.alive) return;
      t.alive = false;
      dummy.position.set(0, -9999, 0); dummy.scale.setScalar(0.0001); dummy.updateMatrix();
      trunkIM.setMatrixAt(idx, dummy.matrix); folLowIM.setMatrixAt(idx, dummy.matrix); folHiIM.setMatrixAt(idx, dummy.matrix);
      trunkIM.instanceMatrix.needsUpdate = folLowIM.instanceMatrix.needsUpdate = folHiIM.instanceMatrix.needsUpdate = true;
    },
    harvestBush(idx) {
      const b = bushes[idx]; if (!b || !b.alive) return;
      b.alive = false;
      dummy.position.set(b.x, b.y - 0.2, b.z); dummy.scale.setScalar(0.45); dummy.updateMatrix();
      bushIM.setMatrixAt(idx, dummy.matrix); bushIM.instanceMatrix.needsUpdate = true;
    },
    restoreBush(idx) {
      const b = bushes[idx]; if (!b) return;
      b.alive = true;
      dummy.position.set(b.x, b.y + 0.4, b.z); dummy.scale.setScalar(1.0); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      bushIM.setMatrixAt(idx, dummy.matrix); bushIM.instanceMatrix.needsUpdate = true;
    },
  };
}
