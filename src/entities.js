import * as THREE from 'three';
import { NPCS, ENEMIES, ENEMY_SPAWNS, WANDERERS } from './content.js';
import { TAU, dist2D } from './util.js';
import { WORLD_SCALE as WS } from './scale.js';

const DEATH_DUR = 0.55;   // topple/shrink/sink before the corpse vanishes
const ATK_ANIM = 0.3;     // forward-lean bite when an enemy strikes
const ANIMAL_FREEZE2 = (75 * WS) * (75 * WS);   // animals beyond this (squared) freeze + hide (perf)

const SKIN = [0xf2c79a, 0xe0a878, 0xc98a5a, 0x8d5a3a];
const HAIR = [0x2a2330, 0x5c4326, 0x8a8a92, 0x6e4a2b, 0xb5602a];
const lmat = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
const mkBox = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); return me; };

// A proper bipedal person: hip-pivoted legs + shoulder-pivoted arms (with skin hands),
// a clothed torso, a head, and hair — limb pivots exposed via userData.anim for walking.
function buildPerson({ cloth, skin, hair, weaponMat, helm = null, seed = 0 }) {
  const g = new THREE.Group();
  const clothM = lmat(cloth), skinM = lmat(skin), darkM = lmat(0x2a2330);
  const mkLeg = (x) => { const p = new THREE.Group(); p.position.set(x, 0.72, 0); p.add(mkBox(0.2, 0.72, 0.2, darkM, 0, -0.36, 0)); g.add(p); return p; };
  const legL = mkLeg(-0.16), legR = mkLeg(0.16);
  g.add(mkBox(0.66, 0.8, 0.4, clothM, 0, 1.15, 0));          // torso (clothes)
  g.add(mkBox(0.72, 0.2, 0.44, darkM, 0, 0.82, 0));          // belt / hips
  const mkArm = (x) => { const p = new THREE.Group(); p.position.set(x, 1.48, 0); p.add(mkBox(0.17, 0.56, 0.2, clothM, 0, -0.26, 0)); p.add(mkBox(0.16, 0.16, 0.16, skinM, 0, -0.56, 0)); g.add(p); return p; };
  const armL = mkArm(-0.45), armR = mkArm(0.45);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), skinM); head.position.set(0, 1.82, 0); g.add(head);
  if (hair != null) g.add(mkBox(0.42, 0.18, 0.42, lmat(hair), 0, 2.0, 0));   // hair cap
  if (helm != null) { g.add(mkBox(0.44, 0.32, 0.44, lmat(helm), 0, 2.02, 0)); g.add(mkBox(0.12, 0.36, 0.5, lmat(0xb0452e), 0, 2.34, 0)); }   // helmet + red crest
  if (weaponMat) armR.add(mkBox(0.1, 0.85, 0.1, weaponMat, 0, -0.78, 0));     // weapon held in the right hand
  g.userData.anim = { legL, legR, armL, armR, biped: true };
  return g;
}

// An ambient mobile NPC (a soldier with helm + spear, or a plain wanderer).
function makeMob(def) {
  const g = buildPerson({ cloth: def.color, skin: SKIN[def.seed % SKIN.length], hair: def.soldier ? null : HAIR[def.seed % HAIR.length], helm: def.soldier ? def.helm : null, seed: def.seed });
  if (def.soldier) { const arm = g.userData.anim.armR; arm.add(mkBox(0.09, 1.6, 0.09, lmat(0xa9b2bc), 0, -0.05, 0.05)); arm.add(mkBox(0.16, 0.28, 0.16, lmat(0xeaf2ff), 0, 0.73, 0.05)); }   // spear + tip
  return g;
}

function makeNpc(def, world) {
  const seed = Math.abs((def.key || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const g = buildPerson({ cloth: def.color, skin: SKIN[seed % SKIN.length], hair: HAIR[seed % HAIR.length], seed });
  g.position.set(def.pos.x, world.height(def.pos.x, def.pos.z), def.pos.z);
  let nv = world.villages[0], best = Infinity;
  for (const v of world.villages) { const d = (v.x - def.pos.x) ** 2 + (v.z - def.pos.z) ** 2; if (d < best) { best = d; nv = v; } }
  g.rotation.y = Math.atan2(nv.x - def.pos.x, nv.z - def.pos.z);
  return g;
}

function makeBeast(def) {
  const g = new THREE.Group();
  const mat = lmat(def.color), dark = lmat(0x3a2a20);
  g.add(mkBox(1.5, 0.9, 0.9, mat, 0, 0.95, 0));    // body
  g.add(mkBox(0.7, 0.7, 0.75, mat, 0.9, 0.8, 0));  // head
  g.add(mkBox(0.35, 0.3, 0.55, dark, 1.3, 0.65, 0)); // snout
  // four legs on hip pivots (front-left, front-right, back-left, back-right) for a trot
  const legs = [[-0.5, 0.35], [0.5, 0.35], [-0.5, -0.35], [0.5, -0.35]].map(([x, z]) => {
    const p = new THREE.Group(); p.position.set(x, 0.7, z); p.add(mkBox(0.2, 0.72, 0.2, dark, 0, -0.36, 0)); g.add(p); return p;
  });
  g.userData.anim = { legs, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

function makeHumanoid(def) {
  const g = buildPerson({ cloth: def.color, skin: 0xd9a273, hair: 0x2a2330, weaponMat: lmat(0xb9c2cc) });
  g.scale.setScalar(def.scale || 1);
  return g;
}

const makeEnemyMesh = (def) => (def.shape === 'humanoid' ? makeHumanoid(def) : makeBeast(def));

// --- Animals: farm livestock + wild creatures. Distinct low-poly meshes; wander/graze; prey flee; hens & ducks lay eggs. ---
const ANIMAL_DEF = {
  chicken: { body: 0xf2efe6, accent: 0xe0584a, scale: 0.85, solidR: 0.30, speed: 1.8, roam: 3.0, graze: true,  skittish: false, lays: true,  hop: false },
  pig:     { body: 0xe79ab0, accent: 0xd07a92, scale: 0.95, solidR: 0.42, speed: 1.5, roam: 3.5, graze: true,  skittish: false, lays: false, hop: false },
  sheep:   { body: 0xf1f0ec, accent: 0x3a2e2a, scale: 1.00, solidR: 0.42, speed: 1.6, roam: 3.5, graze: true,  skittish: false, lays: false, hop: false },
  cow:     { body: 0xf4f4f4, accent: 0x3a2e2a, scale: 1.30, solidR: 0.55, speed: 1.3, roam: 4.0, graze: true,  skittish: false, lays: false, hop: false },
  goat:    { body: 0xd4c5b9, accent: 0x8a7a6a, scale: 0.90, solidR: 0.38, speed: 2.1, roam: 6.0, graze: true,  skittish: true,  lays: false, hop: false },
  deer:    { body: 0xa0845a, accent: 0x5a4a3a, scale: 1.10, solidR: 0.40, speed: 2.9, roam: 12,  graze: true,  skittish: true,  lays: false, hop: false },
  rabbit:  { body: 0xc8a074, accent: 0xf4ece0, scale: 0.70, solidR: 0.25, speed: 2.6, roam: 9,   graze: true,  skittish: true,  lays: false, hop: true  },
  boar:    { body: 0x6a5a4a, accent: 0x241c16, scale: 1.15, solidR: 0.45, speed: 2.4, roam: 9,   graze: true,  skittish: false, lays: false, hop: false },
  duck:    { body: 0x2f5560, accent: 0xe0a23a, scale: 0.70, solidR: 0.26, speed: 1.6, roam: 6,   graze: true,  skittish: true,  lays: true,  hop: false, water: true },
  fox:     { body: 0xd07a2a, accent: 0xf4e0c0, scale: 0.85, solidR: 0.32, speed: 2.6, roam: 13,  graze: false, skittish: false, lays: false, hop: false },
  badger:  { body: 0x4a4a4a, accent: 0xf2f2f2, scale: 0.80, solidR: 0.30, speed: 1.4, roam: 7,   graze: false, skittish: false, lays: false, hop: false },
  squirrel:{ body: 0x8a6a3a, accent: 0xf4e0c0, scale: 0.55, solidR: 0.20, speed: 2.2, roam: 8,   graze: true,  skittish: true,  lays: false, hop: true  },
};

// Build one distinct animal. Head sits toward +x (forward) so a graze-dip reads as nose-to-ground.
function makeAnimal(kind) {
  const D = ANIMAL_DEF[kind];
  const g = new THREE.Group();
  const vis = new THREE.Group(); g.add(vis);                 // inner group: hop-bobs without breaking terrain follow
  const bodyM = lmat(D.body), accM = lmat(D.accent), darkM = lmat(0x241c16), brownM = lmat(0x5c4326), whiteM = lmat(0xf4f4f4);
  const legs = []; let head = null;
  const B = (w, h, d, m, x, y, z) => { const me = mkBox(w, h, d, m, x, y, z); vis.add(me); return me; };
  const Cone = (rb, h, m, x, y, z, rz) => { const me = new THREE.Mesh(new THREE.ConeGeometry(rb, h, 6), m); me.position.set(x, y, z); if (rz) me.rotation.z = rz; vis.add(me); return me; };
  const Ico = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(x, y, z); vis.add(me); return me; };
  const quadLegs = (lx, ly, lz, w, h, m) => { for (const [x, z] of [[-lx, lz], [lx, lz], [-lx, -lz], [lx, -lz]]) { const p = new THREE.Group(); p.position.set(x, ly, z); p.add(mkBox(w, h, w, m, 0, -h / 2, 0)); vis.add(p); legs.push(p); } };
  const twoLegs = (lx, ly, lz, w, h, m) => { for (const x of [-lx, lx]) { const p = new THREE.Group(); p.position.set(x, ly, lz); p.add(mkBox(w, h, w, m, 0, -h / 2, 0)); vis.add(p); legs.push(p); } };
  switch (kind) {
    case 'chicken':
      B(0.42, 0.36, 0.32, bodyM, 0, 0.46, 0);
      head = B(0.2, 0.24, 0.2, bodyM, 0.24, 0.66, 0);
      B(0.14, 0.07, 0.1, accM, 0.38, 0.62, 0);                 // beak
      Cone(0.07, 0.18, accM, 0.22, 0.86, 0);                   // red comb
      Ico(0.05, accM, 0.32, 0.5, 0);                           // wattle
      twoLegs(0.09, 0.3, 0.04, 0.04, 0.3, lmat(0xe0a23a));
      break;
    case 'duck':
      Ico(0.32, bodyM, 0, 0.4, 0);                             // round body
      B(0.1, 0.18, 0.1, bodyM, 0.16, 0.6, 0);                  // neck
      head = B(0.16, 0.16, 0.16, bodyM, 0.24, 0.74, 0);
      Cone(0.08, 0.16, accM, 0.4, 0.72, 0, -Math.PI / 2);      // orange bill (+x)
      twoLegs(0.1, 0.22, 0, 0.04, 0.22, lmat(0xe0a23a));
      break;
    case 'pig':
      B(0.62, 0.44, 0.44, bodyM, 0, 0.56, 0);
      head = B(0.32, 0.34, 0.36, bodyM, 0.44, 0.6, 0);
      Cone(0.13, 0.16, accM, 0.64, 0.55, 0, -Math.PI / 2);     // snout
      Cone(0.07, 0.1, bodyM, 0.36, 0.84, 0.12); Cone(0.07, 0.1, bodyM, 0.36, 0.84, -0.12);
      quadLegs(0.2, 0.34, 0.16, 0.09, 0.34, brownM);
      break;
    case 'sheep':
      Ico(0.5, whiteM, 0, 0.62, 0);                            // woolly body
      head = B(0.2, 0.24, 0.2, accM, 0.42, 0.62, 0);           // dark face
      B(0.05, 0.12, 0.05, whiteM, 0.36, 0.82, 0.12); B(0.05, 0.12, 0.05, whiteM, 0.36, 0.82, -0.12);
      quadLegs(0.16, 0.36, 0.18, 0.06, 0.36, darkM);
      break;
    case 'cow':
      B(0.78, 0.5, 0.5, bodyM, 0, 0.72, 0);
      head = B(0.34, 0.34, 0.36, bodyM, 0.52, 0.78, 0);
      B(0.18, 0.18, 0.24, accM, 0.74, 0.66, 0);                // snout
      Cone(0.05, 0.2, darkM, 0.5, 1.04, 0.14); Cone(0.05, 0.2, darkM, 0.5, 1.04, -0.14);   // horns
      Ico(0.12, accM, 0.1, 0.92, 0.24); Ico(0.09, accM, -0.24, 0.78, -0.2);                // spots
      quadLegs(0.26, 0.46, 0.2, 0.1, 0.46, darkM);
      break;
    case 'goat':
      B(0.46, 0.36, 0.32, bodyM, 0, 0.5, 0);
      head = B(0.22, 0.24, 0.22, bodyM, 0.32, 0.58, 0);
      B(0.12, 0.1, 0.14, accM, 0.46, 0.52, 0);                 // snout
      Cone(0.04, 0.2, accM, 0.24, 0.82, 0.1); Cone(0.04, 0.2, accM, 0.24, 0.82, -0.1);     // horns
      Cone(0.06, 0.14, accM, 0.4, 0.42, 0, Math.PI);          // beard (tip hangs down)
      quadLegs(0.14, 0.34, 0.12, 0.05, 0.34, accM);
      break;
    case 'deer':
      B(0.56, 0.4, 0.3, bodyM, 0, 0.82, 0);
      B(0.12, 0.3, 0.12, bodyM, 0.26, 1.02, 0);                // neck
      head = B(0.18, 0.2, 0.18, bodyM, 0.36, 1.2, 0);
      B(0.12, 0.1, 0.12, accM, 0.48, 1.16, 0);                 // muzzle
      Cone(0.03, 0.3, accM, 0.3, 1.42, 0.1); Cone(0.03, 0.3, accM, 0.3, 1.42, -0.1);       // antlers
      Ico(0.07, whiteM, -0.3, 0.78, 0);                        // white tail
      quadLegs(0.18, 0.6, 0.12, 0.05, 0.6, accM);
      break;
    case 'boar':
      B(0.6, 0.42, 0.36, bodyM, 0, 0.56, 0);
      B(0.16, 0.2, 0.46, darkM, 0, 0.82, 0);                   // bristly mane ridge
      head = B(0.32, 0.32, 0.32, bodyM, 0.42, 0.58, 0);
      Cone(0.13, 0.16, darkM, 0.64, 0.52, 0, -Math.PI / 2);    // snout
      Cone(0.03, 0.14, whiteM, 0.56, 0.42, 0.1); Cone(0.03, 0.14, whiteM, 0.56, 0.42, -0.1);  // tusks
      quadLegs(0.18, 0.36, 0.16, 0.08, 0.36, darkM);
      break;
    case 'fox':
      B(0.44, 0.32, 0.28, bodyM, 0, 0.46, 0);
      B(0.26, 0.2, 0.2, accM, 0, 0.34, 0);                     // white belly/chest
      head = B(0.2, 0.22, 0.2, bodyM, 0.26, 0.54, 0);
      Cone(0.1, 0.14, bodyM, 0.4, 0.5, 0, -Math.PI / 2);       // pointed snout
      Cone(0.06, 0.14, bodyM, 0.18, 0.74, 0.1); Cone(0.06, 0.14, bodyM, 0.18, 0.74, -0.1);   // ears
      Cone(0.12, 0.4, accM, -0.36, 0.42, 0, Math.PI / 2);      // bushy tail toward -x
      quadLegs(0.14, 0.32, 0.12, 0.05, 0.32, darkM);
      break;
    case 'badger':
      B(0.5, 0.3, 0.34, bodyM, 0, 0.36, 0);
      head = B(0.2, 0.2, 0.24, bodyM, 0.28, 0.4, 0);
      B(0.1, 0.22, 0.1, accM, 0.32, 0.42, 0);                  // white face stripe
      B(0.14, 0.07, 0.34, accM, 0, 0.52, 0);                   // white back stripe
      Cone(0.1, 0.12, darkM, 0.44, 0.36, 0, -Math.PI / 2);     // snout
      quadLegs(0.18, 0.24, 0.14, 0.07, 0.24, darkM);
      break;
    case 'rabbit':
      Ico(0.26, bodyM, 0, 0.3, 0);                             // round body
      head = B(0.16, 0.18, 0.16, bodyM, 0.16, 0.42, 0);
      Cone(0.045, 0.26, bodyM, 0.1, 0.66, 0.07); Cone(0.045, 0.26, bodyM, 0.1, 0.66, -0.07);  // tall ears
      Ico(0.09, accM, -0.2, 0.22, 0);                          // puff tail
      quadLegs(0.1, 0.16, 0.1, 0.04, 0.16, bodyM);
      break;
    case 'squirrel':
      Ico(0.22, bodyM, 0, 0.28, 0);
      head = B(0.13, 0.14, 0.13, bodyM, 0.13, 0.38, 0);
      Cone(0.04, 0.1, bodyM, 0.06, 0.5, 0.07); Cone(0.04, 0.1, bodyM, 0.06, 0.5, -0.07);    // tufted ears
      Cone(0.16, 0.36, bodyM, -0.16, 0.4, 0, Math.PI / 2);     // big fluffy tail (-x, curls up)
      quadLegs(0.08, 0.14, 0.08, 0.035, 0.14, bodyM);
      break;
    default:
      B(0.5, 0.4, 0.4, bodyM, 0, 0.5, 0); head = B(0.3, 0.3, 0.3, bodyM, 0.4, 0.55, 0); quadLegs(0.18, 0.34, 0.16, 0.08, 0.34, brownM);
  }
  g.userData.anim = { legs, head, vis, hop: D.hop, biped: legs.length === 2 };
  g.scale.setScalar(D.scale);
  return g;
}

export function createEntities(scene, world, G) {
  let T = 0;
  const npcs = NPCS.map((def) => {
    const group = makeNpc(def, world);
    scene.add(group);
    return { def, group, kind: 'npc', baseRot: group.rotation.y, phase: Math.random() * TAU, get pos() { return group.position; } };
  });

  // ambient mobile NPCs — patrolling guard squads (formation) + lone wanderers
  const mobs = [];
  WANDERERS.forEach((def, di) => {
    if (def.kind === 'squad') {
      const squad = { loop: def.loop, members: [] };
      for (let k = 0; k < def.count; k++) {
        const g = makeMob({ color: def.color, helm: def.helm, soldier: true, seed: di * 7 + k });
        const s0 = def.loop[0]; g.position.set(s0.x, world.height(s0.x, s0.z), s0.z); scene.add(g);
        const m = { def, group: g, squad, idx: k, heading: 0, walkPhase: Math.random() * TAU, speed: def.speed, loopI: 0, get pos() { return g.position; } };
        squad.members.push(m); mobs.push(m);
      }
    } else {
      const g = makeMob({ color: def.color, soldier: !!def.soldier, helm: def.helm, seed: di * 5 });
      g.position.set(def.home.x, world.height(def.home.x, def.home.z), def.home.z); scene.add(g);
      mobs.push({ def, group: g, heading: Math.random() * TAU, walkPhase: Math.random() * TAU, speed: def.speed, home: def.home, radius: def.radius, target: null, pauseT: 0, get pos() { return g.position; } });
    }
  });

  // ambient animals — built from world.animalSpawns; not saved (rebuilt each load). Hens/ducks drop collectible eggs.
  const animals = [];
  const eggs = [];
  function spawnEgg(x, z) {
    const y = Math.max(world.height(x, z), world.WATER_Y) + 0.14;   // float on water (duck eggs), rest on land
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), new THREE.MeshLambertMaterial({ color: 0xf6e9a8, flatShading: true }));
    m.scale.y = 1.35; m.position.set(x, y, z); scene.add(m);
    eggs.push({ mesh: m, x, z, y, t: 90 });
  }
  (world.animalSpawns || []).forEach((sp) => {
    const D = ANIMAL_DEF[sp.kind]; if (!D) return;
    const g = makeAnimal(sp.kind);
    g.position.set(sp.x, world.height(sp.x, sp.z), sp.z);
    g.rotation.y = Math.random() * TAU;
    scene.add(g);
    const hd = g.userData.anim.head;
    animals.push({
      kind: sp.kind, def: D, group: g,
      home: { x: sp.home ? sp.home.x : sp.x, z: sp.home ? sp.home.z : sp.z },
      roam: sp.roam || D.roam, penned: !!sp.penned, solidR: D.solidR,
      heading: g.rotation.y, walkPhase: Math.random() * TAU, state: 'pause', pauseT: Math.random() * 3, target: null,
      eggCD: 18 + Math.random() * 35, headBaseY: hd ? hd.position.y : 0,
      get pos() { return g.position; },
    });
  });
  // Can an animal stand at (nx,nz)? Walkable land (or shallow water for waterfowl), clear of big
  // structures (buildings/barn/spires) and not stacked on another animal.
  function animalStep(a, nx, nz) {
    if (!(world.isWalkable(nx, nz) || (a.def.water && world.height(nx, nz) <= 0.4))) return false;
    const ob = world.obstacles;
    if (ob) for (let i = 0; i < ob.length; i++) { const o = ob[i], dx = nx - o.x, dz = nz - o.z, rr = o.r + 0.3; if (dx * dx + dz * dz < rr * rr) return false; }
    for (let i = 0; i < animals.length; i++) { const b = animals[i]; if (b === a) continue; const dx = nx - b.pos.x, dz = nz - b.pos.z, rr = a.solidR + b.solidR; if (dx * dx + dz * dz < rr * rr) return false; }
    return true;
  }

  // companion pet — one tamed animal (or a rare boss pet) that trails a step behind the player
  let pet = null;
  function setPet(kind) {
    if (pet) { scene.remove(pet.group); pet = null; }
    if (!kind) return;
    let g;
    if (kind.indexOf('pet_') === 0) { const def = ENEMIES[kind.slice(4)]; if (!def) return; g = makeEnemyMesh(def); g.scale.setScalar((def.scale || 1) * 0.42); }
    else { if (!ANIMAL_DEF[kind]) return; g = makeAnimal(kind); g.scale.multiplyScalar(0.85); }
    scene.add(g);
    pet = { group: g, kind, walkPhase: 0, snap: true };
  }

  const enemies = [];
  function spawnEnemy(key, x, z) {
    if (!world.isWalkable(x, z)) { outer: for (let r = 4; r <= 40; r += 4) for (let a = 0; a < TAU; a += TAU / 16) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (world.isWalkable(nx, nz)) { x = nx; z = nz; break outer; } } }   // keep spawns out of the sea
    const def = ENEMIES[key];
    const group = makeEnemyMesh(def);
    group.position.set(x, world.height(x, z), z);
    scene.add(group);
    const e = {
      def, group, kind: 'enemy', enemyKey: key,
      hp: def.hp, maxHp: def.hp, alive: true, state: 'wander',
      home: { x, z }, heading: Math.random() * TAU, wanderT: 0, moving: false,
      attackCd: 0, hurtFlash: 0, respawn: 0, baseScale: def.scale || 1, leash: (def.boss ? 26 : 16) * WS,
      provoked: false,   // peaceful until the player attacks it
      dying: 0, deathY: 0, atkAnim: 0, walkPhase: Math.random() * TAU,
      get pos() { return group.position; },
    };
    enemies.push(e);
    return e;
  }
  ENEMY_SPAWNS.forEach((s) => spawnEnemy(s.enemy, s.x, s.z));

  const telegraphs = [];   // boss slam warnings: a growing ground ring that hits its area after a windup
  function spawnTelegraph(x, z, dmg, delay) {
    const y = world.height(x, z) + 0.12;
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.0, 2.7, 24), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, y, z); scene.add(ring);
    telegraphs.push({ mesh: ring, x, z, r: 2.7, t: delay || 1.2, dmg: dmg || 22 });
  }
  function update(dt, player) {
    T += dt;
    for (const e of enemies) {
      if (!e.alive) {
        if (e.dying > 0) {                                  // death: topple sideways, shrink, sink
          e.dying -= dt;
          const u = 1 - Math.max(0, e.dying) / DEATH_DUR;
          e.group.rotation.z = (Math.PI / 2) * u;
          e.group.scale.setScalar(e.baseScale * (1 - 0.55 * u));
          e.group.position.y = e.deathY - 0.7 * u;
          if (e.dying <= 0) { e.group.visible = false; e.group.rotation.z = 0; }
          continue;
        }
        e.respawn -= dt;
        if (e.respawn <= 0) {
          e.hp = e.maxHp; e.alive = true; e.state = 'wander'; e.provoked = false; e.group.visible = true;
          e.hurtFlash = 0; e.atkAnim = 0; e.group.rotation.x = 0; e.group.rotation.z = 0; e.group.scale.setScalar(e.baseScale);
          e.group.position.set(e.home.x, world.height(e.home.x, e.home.z), e.home.z);
        }
        continue;
      }
      if (e.hurtFlash > 0) e.hurtFlash -= dt;
      if (e.atkAnim > 0) e.atkAnim -= dt;
      if (e.dot) {   // poison/burn damage-over-time applied by the player
        e.dot.t -= dt; e.dot.tick -= dt;
        if (e.dot.tick <= 0) { e.dot.tick = 1.5; damageEnemy(e, e.dot.dmg); if (G.fx) G.fx.burst(e.pos.x, e.pos.y + 1.2, e.pos.z, e.dot.kind === 'burn' ? 0xff7a33 : 0x6ad06a, { n: 5, up: 1.6 }); }
        if (e.dot.t <= 0) e.dot = null;
        if (!e.alive) continue;
      }
      const d = dist2D(e.pos.x, e.pos.z, player.position.x, player.position.z);
      if (d > 70 * WS) { e.group.rotation.z = 0; continue; }   // cull far-away AI — perf with 50+ spawns
      // peaceful by default (RuneScape-style) — chase/attack only once provoked by being
      // struck, and give up if dragged beyond its leash from home or the player flees far
      if (e.provoked) {
        const homeD = dist2D(e.pos.x, e.pos.z, e.home.x, e.home.z);
        if (player.state.hp <= 0 || homeD > e.leash || d > e.def.aggro * 2 + 6) { e.provoked = false; e.state = 'wander'; }
        else e.state = 'chase';
      } else e.state = 'wander';

      let moving = false;
      if (e.state === 'chase') {
        if (e.def.boss) {   // boss mechanics: enrage, telegraphed slam, optional phase-adds + grove-feed
          if (!e.enraged && e.hp < e.maxHp * (e.def.enrageAt || 0.5)) { e.enraged = true; if (G.ui) G.ui.toast(`${e.def.name} enrages!`, 'bad', 2200); }
          const ph = e.def.phase;   // one-shot phase: spawn adds + shift attack style when HP crosses the threshold
          if (ph && !e.phased && e.hp < e.maxHp * ph.at) {
            e.phased = true;
            if (ph.atkStyle) e.atkStyle = ph.atkStyle;
            if (ph.adds) for (let i = 0; i < ph.adds.n; i++) { const a = (i / ph.adds.n) * TAU; spawnEnemy(ph.adds.enemy, e.pos.x + Math.cos(a) * 4, e.pos.z + Math.sin(a) * 4); }
            if (G.ui) G.ui.toast(ph.msg || `${e.def.name} shifts!`, 'bad', 2600);
          }
          const gr = e.def.grove;   // grove-feed: while its minions live nearby, the boss heals — clear the grove first
          if (gr) {
            let fed = false;
            for (const o of enemies) if (o.alive && o !== e && gr.enemies.includes(o.enemyKey) && dist2D(o.pos.x, o.pos.z, e.pos.x, e.pos.z) < (gr.r || 24) * WS) { fed = true; break; }
            if (fed && e.hp < e.maxHp) { e.hp = Math.min(e.maxHp, e.hp + (gr.regen || 5) * dt); if (G.fx && Math.random() < 0.06) G.fx.burst(e.pos.x, e.pos.y + 1.6, e.pos.z, 0x6ad06a, { n: 3, up: 1.4 }); }
          }
          e.slamCd = (e.slamCd == null ? 4 : e.slamCd) - dt;
          if (e.slamCd <= 0 && d < e.def.aggro * 2 + 6) { e.slamCd = (e.enraged ? 4.5 : 6.5) + Math.random() * 2; spawnTelegraph(player.position.x, player.position.z, Math.round(e.def.dmg * 1.6), e.enraged ? 0.95 : 1.25); }
        }
        e.heading = Math.atan2(player.position.x - e.pos.x, player.position.z - e.pos.z);
        if (d > 1.7) {
          const nx = e.pos.x + Math.sin(e.heading) * e.def.speed * dt;
          const nz = e.pos.z + Math.cos(e.heading) * e.def.speed * dt;
          if (world.isWalkable(nx, nz)) { e.group.position.x = nx; e.group.position.z = nz; moving = true; }
        } else {
          e.attackCd -= dt;
          if (e.attackCd <= 0) { e.attackCd = e.enraged ? 0.85 : 1.3; e.atkAnim = ATK_ANIM; G.damagePlayer(Math.round(e.def.dmg * (e.enraged ? 1.25 : 1)), e); }
        }
      } else {
        const homeDist = dist2D(e.pos.x, e.pos.z, e.home.x, e.home.z);
        if (homeDist > e.leash) {
          // beyond leash (e.g. kited out of its arena) — walk straight back toward home
          e.heading = Math.atan2(e.home.x - e.pos.x, e.home.z - e.pos.z);
          const nx = e.pos.x + Math.sin(e.heading) * e.def.speed * 0.6 * dt;
          const nz = e.pos.z + Math.cos(e.heading) * e.def.speed * 0.6 * dt;
          if (world.isWalkable(nx, nz)) { e.group.position.x = nx; e.group.position.z = nz; moving = true; }
          e.wanderT = 0;
        } else {
          e.wanderT -= dt;
          if (e.wanderT <= 0) { e.wanderT = 1 + Math.random() * 2.5; e.heading = Math.random() * TAU; e.moving = Math.random() > 0.45; }
          if (e.moving) {
            const sp = e.def.speed * 0.4;
            const nx = e.pos.x + Math.sin(e.heading) * sp * dt;
            const nz = e.pos.z + Math.cos(e.heading) * sp * dt;
            if (world.isWalkable(nx, nz) && dist2D(nx, nz, e.home.x, e.home.z) < e.leash) { e.group.position.x = nx; e.group.position.z = nz; moving = true; }
            else e.wanderT = 0;
          }
        }
      }
      e.group.position.y = world.height(e.pos.x, e.pos.z);
      e.group.rotation.y = e.heading;
      // walk cycle (limbs swing at hips/shoulders) + a subtle body waddle + attack lean
      if (moving) e.walkPhase += dt * 9;
      e.group.rotation.z = moving ? Math.sin(e.walkPhase) * 0.05 : e.group.rotation.z * (1 - Math.min(1, dt * 8));
      const anim = e.group.userData.anim;
      if (anim) {
        const gait = moving ? Math.sin(e.walkPhase) * 0.55 : 0;
        const k = Math.min(1, dt * 10);
        if (anim.biped) {
          anim.legL.rotation.x += (gait - anim.legL.rotation.x) * k;
          anim.legR.rotation.x += (-gait - anim.legR.rotation.x) * k;
          anim.armL.rotation.x += (-gait - anim.armL.rotation.x) * k;
          if (e.atkAnim <= 0) anim.armR.rotation.x += (gait - anim.armR.rotation.x) * k;
        } else {
          anim.legs[0].rotation.x = gait; anim.legs[3].rotation.x = gait;     // diagonal trot
          anim.legs[1].rotation.x = -gait; anim.legs[2].rotation.x = -gait;
        }
      }
      e.group.rotation.x = e.atkAnim > 0 ? -0.5 * Math.sin((1 - e.atkAnim / ATK_ANIM) * Math.PI) : e.group.rotation.x * (1 - Math.min(1, dt * 10));
      e.group.scale.setScalar((e.hurtFlash > 0 ? 1.14 : 1) * e.baseScale);
    }
    // NPC idle — gentle sway, and turn to face the player when close
    for (const n of npcs) {
      const d = dist2D(n.pos.x, n.pos.z, player.position.x, player.position.z);
      const target = d < 7 ? Math.atan2(player.position.x - n.pos.x, player.position.z - n.pos.z) : n.baseRot;
      let dy = target - n.group.rotation.y; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU;
      n.group.rotation.y += dy * Math.min(1, dt * 6);
      n.group.rotation.z = Math.sin(T * 1.4 + n.phase) * 0.03;
      const a = n.group.userData.anim;   // gentle idle arm sway so they feel alive
      if (a) { const s = Math.sin(T * 1.3 + n.phase) * 0.09; a.armL.rotation.x = s; a.armR.rotation.x = -s; }
    }
    // ambient mobs — squads patrol a loop in formation, wanderers stroll near home; all walk-cycle
    for (const m of mobs) {
      if (dist2D(m.pos.x, m.pos.z, player.position.x, player.position.z) > 75 * WS) continue;   // freeze when far (perf)
      let tx, tz, stop = 1.2;
      if (m.squad) {
        if (m.idx === 0) {
          const wp = m.squad.loop[m.loopI]; tx = wp.x; tz = wp.z;
          if (dist2D(m.pos.x, m.pos.z, tx, tz) < 2.2) m.loopI = (m.loopI + 1) % m.squad.loop.length;
        } else {
          const L = m.squad.members[0], lh = L.heading, back = 2.2 * Math.ceil(m.idx / 2), side = (m.idx % 2 ? 1.4 : -1.4);
          tx = L.pos.x - Math.sin(lh) * back + Math.cos(lh) * side;
          tz = L.pos.z - Math.cos(lh) * back - Math.sin(lh) * side;
          stop = 0.7;
        }
      } else {
        if (!m.target || dist2D(m.pos.x, m.pos.z, m.target.x, m.target.z) < 1.4) {
          m.pauseT -= dt;
          if (m.pauseT <= 0) { const ang = Math.random() * TAU, r = Math.random() * m.radius; m.target = { x: m.home.x + Math.cos(ang) * r, z: m.home.z + Math.sin(ang) * r }; m.pauseT = 1.5 + Math.random() * 3; }
        }
        tx = m.target ? m.target.x : m.pos.x; tz = m.target ? m.target.z : m.pos.z;
      }
      const dx = tx - m.pos.x, dz = tz - m.pos.z, dd = Math.hypot(dx, dz);
      let moving = false;
      if (dd > stop) {
        m.heading = Math.atan2(dx, dz);
        const nx = m.pos.x + Math.sin(m.heading) * m.speed * dt, nz = m.pos.z + Math.cos(m.heading) * m.speed * dt;
        if (world.isWalkable(nx, nz)) { m.group.position.x = nx; m.group.position.z = nz; moving = true; }
      }
      m.group.position.y = world.height(m.pos.x, m.pos.z);
      m.group.rotation.y = m.heading;
      if (moving) m.walkPhase += dt * 9;
      const a = m.group.userData.anim;
      if (a) {
        const gait = moving ? Math.sin(m.walkPhase) * 0.5 : 0, k = Math.min(1, dt * 10);
        a.legL.rotation.x += (gait - a.legL.rotation.x) * k; a.legR.rotation.x += (-gait - a.legR.rotation.x) * k;
        a.armL.rotation.x += (-gait - a.armL.rotation.x) * k; a.armR.rotation.x += (gait - a.armR.rotation.x) * k;
      }
    }
    // ambient animals — wander then pause to graze; wild prey bolt from the player; hens/ducks lay eggs
    for (const a of animals) {
      const D = a.def, anim = a.group.userData.anim;
      const pdx = a.pos.x - player.position.x, pdz = a.pos.z - player.position.z, pd2 = pdx * pdx + pdz * pdz;
      const far = pd2 > ANIMAL_FREEZE2; a.group.visible = !far; if (far) continue;   // freeze + hide far away (perf)
      let moving = false, grazing = false;
      const flee = D.skittish && !a.penned && pd2 < 18;   // wild prey bolt when the player gets within ~4.2
      if (flee) {
        a.heading = Math.atan2(pdx, pdz);   // directly away from the player
        const nx = a.pos.x + Math.sin(a.heading) * D.speed * 1.7 * dt, nz = a.pos.z + Math.cos(a.heading) * D.speed * 1.7 * dt;
        if (world.isWalkable(nx, nz) || (D.water && world.height(nx, nz) <= 0.4)) { a.group.position.x = nx; a.group.position.z = nz; moving = true; }
        a.state = 'pause'; a.pauseT = 0.6; a.target = null;
      } else if (a.state === 'wander' && a.target) {
        const dx = a.target.x - a.pos.x, dz = a.target.z - a.pos.z, dd = Math.hypot(dx, dz);
        if (dd < 0.7) { a.state = 'pause'; a.pauseT = 1.6 + Math.random() * 4; a.target = null; }
        else {
          a.heading = Math.atan2(dx, dz);
          const nx = a.pos.x + Math.sin(a.heading) * D.speed * dt, nz = a.pos.z + Math.cos(a.heading) * D.speed * dt;
          const inPen = !a.penned || dist2D(nx, nz, a.home.x, a.home.z) <= a.roam + 0.4;
          const clearOfPlayer = ((nx - player.position.x) ** 2 + (nz - player.position.z) ** 2) > (a.solidR + 0.55) * (a.solidR + 0.55);   // don't walk onto the player
          if (inPen && clearOfPlayer && animalStep(a, nx, nz)) { a.group.position.x = nx; a.group.position.z = nz; moving = true; }
          else { a.state = 'pause'; a.pauseT = 0.5 + Math.random(); a.target = null; }
        }
      } else {   // pause + graze, then pick a fresh roam target near home
        grazing = D.graze;
        a.pauseT -= dt;
        if (a.pauseT <= 0) { const ang = Math.random() * TAU, r = (0.4 + Math.random() * 0.6) * a.roam; a.target = { x: a.home.x + Math.cos(ang) * r, z: a.home.z + Math.sin(ang) * r }; a.state = 'wander'; }
      }
      const gh = world.height(a.pos.x, a.pos.z);
      a.group.position.y = (D.water && gh <= 0.4) ? world.WATER_Y + 0.06 : gh;   // waterfowl float on the surface
      a.group.rotation.y = a.heading;
      if (moving) a.walkPhase += dt * (D.hop ? 7 : 9);
      if (anim) {
        if (anim.hop) anim.vis.position.y = moving ? Math.abs(Math.sin(a.walkPhase)) * 0.22 : 0;
        const gait = moving ? Math.sin(a.walkPhase) * 0.5 : 0, k = Math.min(1, dt * 10), L = anim.legs;
        if (anim.biped) { if (L[0]) L[0].rotation.x += (gait - L[0].rotation.x) * k; if (L[1]) L[1].rotation.x += (-gait - L[1].rotation.x) * k; }
        else if (L.length >= 4) { L[0].rotation.x = gait; L[3].rotation.x = gait; L[1].rotation.x = -gait; L[2].rotation.x = -gait; }
        if (anim.head) { const dip = (grazing && !moving) ? -0.18 + Math.sin(T * 2.4) * 0.03 : 0; anim.head.position.y += ((a.headBaseY + dip) - anim.head.position.y) * Math.min(1, dt * 6); }
      }
      if (D.lays && !flee && eggs.length < 8) { a.eggCD -= dt; if (a.eggCD <= 0) { a.eggCD = 28 + Math.random() * 32; spawnEgg(a.pos.x, a.pos.z); } }
    }
    // egg pickups (walk within ~1.6) + despawn after their lifespan
    for (let i = eggs.length - 1; i >= 0; i--) {
      const eg = eggs[i]; eg.t -= dt;
      const ex = player.position.x - eg.x, ez = player.position.z - eg.z;
      if (ex * ex + ez * ez < 2.56) {
        if (G.inventory) G.inventory.add('egg', 1);
        if (G.fx) G.fx.burst(eg.x, eg.y + 0.3, eg.z, 0xf4ecc0, { n: 6, up: 1.4 });
        if (G.ui) G.ui.toast('Collected an egg', 'good', 1100);
        if (G.audio) G.audio.sfx('pickup');
        scene.remove(eg.mesh); eggs.splice(i, 1); continue;
      }
      if (eg.t <= 0) { scene.remove(eg.mesh); eggs.splice(i, 1); }
    }
    // companion pet trails a step behind the player + walk-cycles its legs
    if (pet) {
      const ph = player.state.heading;
      const bx = player.position.x - Math.sin(ph) * 2.4 + Math.cos(ph) * 1.0;
      const bz = player.position.z - Math.cos(ph) * 2.4 - Math.sin(ph) * 1.0;
      const dx = bx - pet.group.position.x, dz = bz - pet.group.position.z, moving = Math.hypot(dx, dz) > 0.4;
      if (moving) pet.group.rotation.y = Math.atan2(dx, dz);
      const k = pet.snap ? 1 : Math.min(1, dt * 4); pet.snap = false;
      pet.group.position.x += dx * k; pet.group.position.z += dz * k;
      pet.group.position.y = world.height(pet.group.position.x, pet.group.position.z);
      if (moving) pet.walkPhase += dt * 9;
      const pa = pet.group.userData.anim;
      if (pa && pa.legs) { const gait = moving ? Math.sin(pet.walkPhase) * 0.5 : 0, L = pa.legs; if (pa.biped) { if (L[0]) L[0].rotation.x = gait; if (L[1]) L[1].rotation.x = -gait; } else for (let i = 0; i < L.length; i++) L[i].rotation.x = (i === 0 || i === 3) ? gait : -gait; }
    }
    // grow each boss slam-warning ring, then deal AoE if the player didn't step out in time
    for (let i = telegraphs.length - 1; i >= 0; i--) {
      const tg = telegraphs[i]; tg.t -= dt;
      const k = 1 + 0.35 * Math.abs(Math.sin(T * 14)); tg.mesh.scale.set(k, k, 1); tg.mesh.material.opacity = 0.4 + 0.3 * Math.abs(Math.sin(T * 14));
      if (tg.t <= 0) {
        if (dist2D(player.position.x, player.position.z, tg.x, tg.z) < tg.r + 0.6) G.damagePlayer(tg.dmg);
        if (G.fx) G.fx.burst(tg.x, world.height(tg.x, tg.z) + 0.5, tg.z, 0xff5a2a, { n: 22, spread: 3.6, up: 3.2, life: 1 });
        scene.remove(tg.mesh); telegraphs.splice(i, 1);
      }
    }
  }

  function damageEnemy(e, amount) {
    if (!e.alive) return false;
    e.provoked = true;   // striking a foe makes it (and only it) fight back
    e.hp -= amount; e.hurtFlash = 0.2;
    if (e.hp <= 0) {
      e.alive = false; e.dying = DEATH_DUR; e.deathY = e.group.position.y; e.atkAnim = 0; e.group.rotation.x = 0; e.respawn = 18;
      if (G.fx) G.fx.burst(e.pos.x, e.pos.y + 1, e.pos.z, e.def.color, { n: 14, spread: 4, up: 4, life: 0.7 });
      if (G.onEnemyKilled) G.onEnemyKilled(e);
      return true;
    }
    return false;
  }

  // Hide/show all entity meshes (used while indoors to skip ~300 draw calls).
  function setHidden(flag) {
    for (const n of npcs) n.group.visible = !flag;
    for (const m of mobs) m.group.visible = !flag;
    for (const a of animals) a.group.visible = !flag;
    for (const eg of eggs) eg.mesh.visible = !flag;
    if (pet) pet.group.visible = !flag;
    for (const e of enemies) e.group.visible = flag ? false : e.alive;
  }

  return { npcs, mobs, animals, eggs, enemies, update, damageEnemy, spawnEnemy, setHidden, setPet, getPet: () => (pet ? pet.kind : null) };
}
