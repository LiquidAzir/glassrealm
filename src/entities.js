import * as THREE from 'three';
import { NPCS, ENEMIES, ENEMY_SPAWNS, WANDERERS, NPC_VOICE, WANDER_VOICE, NPC_CHATS, REACT_LINES } from './content.js';
import { TAU, dist2D } from './util.js';
import { WORLD_SCALE as WS } from './scale.js';
import { rimLight } from './shaders.js';

const DEATH_DUR = 0.55;   // topple/shrink/sink before the corpse vanishes
const ATK_ANIM = 0.3;     // forward-lean bite when an enemy strikes
const ANIMAL_FREEZE2 = (70 * WS) * (70 * WS);   // animals beyond this (squared) freeze + hide (perf; ~just past the fog line)

const SKIN = [0xf2c79a, 0xe0a878, 0xc98a5a, 0x8d5a3a];
const HAIR = [0x2a2330, 0x5c4326, 0x8a8a92, 0x6e4a2b, 0xb5602a];
// PERF: cache rimLight materials by colour — entities share palette colours, so this
// avoids hundreds of duplicate shader compiles that each create a separate GPU program.
const _matCache = {};
const lmat = (c) => { if (_matCache[c]) return _matCache[c]; const m = rimLight(new THREE.MeshLambertMaterial({ color: c, flatShading: true })); _matCache[c] = m; return m; };
const mkBox = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); return me; };
// shared low-poly primitives for the enemy archetype models below
const mkCone = (rb, h, m, x, y, z, rx = 0, rz = 0) => { const me = new THREE.Mesh(new THREE.ConeGeometry(rb, h, 6), m); me.position.set(x, y, z); if (rx) me.rotation.x = rx; if (rz) me.rotation.z = rz; return me; };
const mkIco = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(x, y, z); return me; };
const legAt = (g, x, y, z, w, h, m) => { const p = new THREE.Group(); p.position.set(x, y, z); p.add(mkBox(w, h, w, m, 0, -h / 2, 0)); g.add(p); return p; };   // hip-pivoted leg (swings in the walk cycle)
const glowMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: o != null, opacity: o == null ? 1 : o });   // self-lit (pops on the additive display)

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
  // head on its own pivot so it can nod + look around (hair + helm ride with the face)
  const head = new THREE.Group(); head.position.set(0, 1.82, 0); g.add(head);
  head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), skinM));
  if (hair != null) head.add(mkBox(0.42, 0.18, 0.42, lmat(hair), 0, 0.18, 0));   // hair cap (relative to head)
  if (helm != null) { head.add(mkBox(0.44, 0.32, 0.44, lmat(helm), 0, 0.20, 0)); head.add(mkBox(0.12, 0.36, 0.5, lmat(0xb0452e), 0, 0.52, 0)); }   // helmet + red crest
  if (weaponMat) armR.add(mkBox(0.1, 0.85, 0.1, weaponMat, 0, -0.78, 0));     // weapon held in the right hand
  g.userData.anim = { legL, legR, armL, armR, head, biped: true };
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

// A drifting fae spirit: a bright self-lit core (glows on the additive display), a
// translucent aura, and a few trailing motes — no legs; it hovers + swirls (see the
// `float` branch in update). Distinct from the quadruped beast so wisps don't read as sheep.
function makeWisp(def) {
  const g = new THREE.Group();
  const col = def.color || 0xc6a8ff;
  const core = new THREE.Group(); core.position.y = 1.15; g.add(core);   // the bobbing/swirling body sits here
  const glow = new THREE.MeshBasicMaterial({ color: col });
  core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), glow));                                           // bright core
  const aura = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 0), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22 }));
  core.add(aura);                                                                                                   // soft pulsing halo
  for (const [x, y, z, r] of [[-0.42, -0.2, -0.28, 0.16], [0.4, 0.1, 0.24, 0.13], [0.05, -0.5, -0.36, 0.11], [-0.2, 0.45, 0.3, 0.1]]) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), glow); m.position.set(x, y, z); core.add(m);     // trailing motes (swirl with the core)
  }
  g.userData.anim = { float: true, core, aura, spin: true, hoverY: 1.15, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// ---------------------------------------------------------------------------
// Enemy archetype models — one distinct silhouette per creature family so a
// scorpion no longer reads like a wolf. Same-family variants (e.g. grey/frost/
// blight wolves) share a builder and differ by colour + scale. Each sets a
// userData.anim describing how update() animates it: biped (legL/R + armL/R),
// quad/multi-leg (legs[]), or float (a hovering `core` child group).
// ---------------------------------------------------------------------------

// Canine — wolves, hounds, fanged beasts. Lean quadruped with snout, ears, tail.
function makeCanine(def) {
  const g = new THREE.Group(), m = lmat(def.color), d = lmat(0x2a2018);
  g.add(mkBox(1.3, 0.7, 0.7, m, 0, 0.95, 0));                                   // body
  g.add(mkBox(0.5, 0.46, 0.5, m, 0.78, 1.06, 0));                              // head
  g.add(mkBox(0.34, 0.26, 0.32, d, 1.06, 0.96, 0));                            // muzzle
  g.add(mkCone(0.1, 0.24, m, 0.66, 1.42, 0.16)); g.add(mkCone(0.1, 0.24, m, 0.66, 1.42, -0.16));   // ears
  g.add(mkCone(0.16, 0.55, m, -0.82, 1.1, 0, 0, -1.1));                         // tail (raised, back)
  const legs = [[-0.45, 0.27], [0.45, 0.27], [-0.45, -0.27], [0.45, -0.27]].map(([x, z]) => legAt(g, x, 0.62, z, 0.18, 0.64, d));
  g.userData.anim = { legs, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Panther — sleek low big-cat / shadow-stalker. Long body, long trailing tail.
function makePanther(def) {
  const g = new THREE.Group(), m = lmat(def.color);
  g.add(mkBox(1.55, 0.5, 0.55, m, 0, 0.72, 0));                                // long low body
  g.add(mkBox(0.44, 0.42, 0.46, m, 0.9, 0.8, 0));                              // head
  g.add(mkBox(0.18, 0.16, 0.16, lmat(0xf0e6c0), 1.12, 0.76, 0));               // pale muzzle
  g.add(mkCone(0.08, 0.18, m, 0.78, 1.06, 0.14)); g.add(mkCone(0.08, 0.18, m, 0.78, 1.06, -0.14));   // ears
  g.add(mkCone(0.12, 0.95, m, -0.92, 0.7, 0, 0, -1.65));                        // long tail
  const legs = [[-0.52, 0.21], [0.52, 0.21], [-0.52, -0.21], [0.52, -0.21]].map(([x, z]) => legAt(g, x, 0.5, z, 0.15, 0.52, m));
  g.userData.anim = { legs, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Boar — bulky tusked quadruped with a bristly mane ridge.
function makeBoarFoe(def) {
  const g = new THREE.Group(), m = lmat(def.color), d = lmat(0x241c16), w = lmat(0xf2ead0);
  g.add(mkBox(1.3, 0.85, 0.85, m, 0, 0.95, 0));                                // body
  g.add(mkBox(0.34, 0.4, 0.9, d, 0, 1.38, 0));                                 // mane ridge
  g.add(mkBox(0.64, 0.6, 0.62, m, 0.82, 0.86, 0));                             // head
  g.add(mkCone(0.24, 0.32, d, 1.2, 0.78, 0, 0, -Math.PI / 2));                  // snout (+x)
  g.add(mkCone(0.05, 0.28, w, 1.0, 0.66, 0.18, 0, 0.6)); g.add(mkCone(0.05, 0.28, w, 1.0, 0.66, -0.18, 0, 0.6));   // tusks
  const legs = [[-0.42, 0.34], [0.42, 0.34], [-0.42, -0.34], [0.42, -0.34]].map(([x, z]) => legAt(g, x, 0.62, z, 0.2, 0.64, d));
  g.userData.anim = { legs, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Scorpion — low armoured body, forward pincers, a tail curled over the back with a stinger. 6 legs (front 4 trot).
function makeScorpion(def) {
  const g = new THREE.Group(), m = lmat(def.color), d = lmat(0x6a4a28);
  g.add(mkBox(1.0, 0.38, 0.7, m, 0, 0.5, 0));                                  // abdomen
  g.add(mkBox(0.5, 0.34, 0.5, m, 0.6, 0.5, 0));                                // cephalothorax
  for (const s of [1, -1]) { g.add(mkBox(0.42, 0.14, 0.14, m, 0.92, 0.5, 0.28 * s)); g.add(mkBox(0.24, 0.28, 0.26, m, 1.18, 0.5, 0.34 * s)); }   // pincer arms + claws
  const tail = new THREE.Group(); tail.position.set(-0.5, 0.55, 0); g.add(tail);
  let px = 0, py = 0;
  for (let i = 0; i < 5; i++) { const sz = 0.22 - i * 0.022; tail.add(mkBox(sz, 0.2, sz, m, px, py, 0)); px -= 0.15; py += 0.18; }
  tail.add(mkCone(0.1, 0.3, d, px + 0.02, py + 0.08, 0, 0, 1.4));               // stinger
  const legs = [[-0.18, 0.42], [0.22, 0.42], [-0.18, -0.42], [0.22, -0.42], [0.46, 0.44], [0.46, -0.44]].map(([x, z]) => legAt(g, x, 0.4, z, 0.07, 0.42, d));
  g.userData.anim = { legs, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Serpent / wyrm — legless, stacked coils rising to a reared, fanged head. Sways idly.
function makeSerpent(def) {
  const g = new THREE.Group(), m = lmat(def.color), d = lmat(0x1f5a26);
  const body = new THREE.Group(); g.add(body);
  [[-0.7, 0.4, 0.66], [-0.3, 0.5, 0.62], [0.1, 0.64, 0.56], [0.45, 0.92, 0.48], [0.72, 1.28, 0.42]].forEach(([x, y, s]) => body.add(mkBox(s, s, s, m, x, y, 0)));
  body.add(mkBox(0.52, 0.44, 0.52, m, 0.96, 1.56, 0));                          // head
  body.add(mkCone(0.18, 0.32, d, 1.24, 1.52, 0, 0, -Math.PI / 2));              // snout
  body.add(mkCone(0.04, 0.2, lmat(0xffffff), 1.08, 1.32, 0.1, 0, 0.5)); body.add(mkCone(0.04, 0.2, lmat(0xffffff), 1.08, 1.32, -0.1, 0, 0.5));   // fangs
  g.userData.anim = { legs: [], biped: false, sway: body };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Bat — small furry body with membrane wings; hovers and flaps.
function makeBat(def) {
  const g = new THREE.Group(), m = lmat(def.color), d = lmat(0x2a2230);
  const core = new THREE.Group(); core.position.y = 1.4; g.add(core);
  core.add(mkIco(0.3, m, 0, 0, 0));                                            // body
  core.add(mkCone(0.09, 0.18, d, 0.05, 0.26, 0.12)); core.add(mkCone(0.09, 0.18, d, 0.05, 0.26, -0.12));   // ears
  const wingM = glowMat(def.color, 0.5);
  const mkWing = (s) => { const p = new THREE.Group(); p.add(mkBox(0.55, 0.05, 0.6, wingM, 0, 0, 0.36 * s)); core.add(p); return p; };
  const wings = [mkWing(1), mkWing(-1)];
  g.userData.anim = { float: true, core, hoverY: 1.4, hoverAmp: 0.2, wings, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Raptor — upright bird (roc / harrier): two legs, beak, tail feathers, flapping wings.
function makeRaptor(def) {
  const g = new THREE.Group(), m = lmat(def.color), beak = lmat(0xe0a23a), d = lmat(0x4a3a2a);
  g.add(mkBox(0.7, 0.66, 0.5, m, 0, 1.05, 0));                                 // body
  g.add(mkBox(0.32, 0.34, 0.32, m, 0.2, 1.55, 0));                             // head
  g.add(mkCone(0.1, 0.28, beak, 0.44, 1.55, 0, 0, -Math.PI / 2));              // beak
  g.add(mkCone(0.2, 0.6, m, -0.52, 1.0, 0, 0, -1.5));                          // tail feathers
  const mkWing = (s) => { const p = new THREE.Group(); p.position.set(0, 1.15, 0); p.add(mkBox(1.0, 0.1, 0.5, m, 0, 0, 0.5 * s)); g.add(p); return p; };
  const wings = [mkWing(1), mkWing(-1)];
  const legs = [legAt(g, 0, 0.7, 0.16, 0.08, 0.7, d), legAt(g, 0, 0.7, -0.16, 0.08, 0.7, d)];
  g.userData.anim = { legs, biped: false, wings };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Crab — wide shell, eyestalks, two big forward claws, side legs.
function makeCrab(def) {
  const g = new THREE.Group(), m = lmat(def.color), d = lmat(0x7a3a2a), eye = lmat(0x201010);
  g.add(mkBox(1.1, 0.5, 0.82, m, 0, 0.58, 0));                                 // shell
  g.add(mkIco(0.1, eye, 0.32, 0.78, 0.22)); g.add(mkIco(0.1, eye, 0.32, 0.78, -0.22));   // eyestalks
  for (const s of [1, -1]) { g.add(mkBox(0.4, 0.16, 0.16, m, 0.58, 0.5, 0.42 * s)); g.add(mkBox(0.3, 0.36, 0.3, m, 0.88, 0.5, 0.48 * s)); }   // claw arm + claw
  const legs = [[-0.3, 0.52], [0.12, 0.52], [-0.3, -0.52], [0.12, -0.52]].map(([x, z]) => legAt(g, x, 0.46, z, 0.08, 0.46, d));
  g.userData.anim = { legs, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Imp — small biped demon (horns + tail), built on the person rig so it walks.
function makeImp(def) {
  const g = buildPerson({ cloth: def.color, skin: def.color, hair: null });
  const horn = lmat(0x2a1810);
  g.add(mkCone(0.07, 0.24, horn, 0.13, 2.08, 0, 0, -0.5)); g.add(mkCone(0.07, 0.24, horn, -0.13, 2.08, 0, 0, 0.5));   // horns
  g.add(mkCone(0.1, 0.55, lmat(def.color), 0, 0.7, -0.32, -1.4, 0));            // tail
  g.scale.setScalar((def.scale || 1) * 0.82);
  return g;
}

// Golem — bulky blocky construct with a glowing core eye. Walks (biped rig).
function makeGolem(def) {
  const g = new THREE.Group(), m = lmat(def.color);
  const legL = legAt(g, -0.3, 0.92, 0, 0.36, 0.92, m), legR = legAt(g, 0.3, 0.92, 0, 0.36, 0.92, m);
  g.add(mkBox(1.15, 1.0, 0.82, m, 0, 1.55, 0));                                // torso
  g.add(mkBox(0.52, 0.46, 0.52, m, 0, 2.26, 0));                               // head
  g.add(mkIco(0.14, glowMat(0xfff0a0), 0, 2.3, 0.27));                          // core eye
  const armL = new THREE.Group(); armL.position.set(-0.72, 2.0, 0); armL.add(mkBox(0.36, 0.95, 0.36, m, 0, -0.48, 0)); g.add(armL);
  const armR = new THREE.Group(); armR.position.set(0.72, 2.0, 0); armR.add(mkBox(0.36, 0.95, 0.36, m, 0, -0.48, 0)); g.add(armR);
  g.userData.anim = { legL, legR, armL, armR, biped: true };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Skeleton — gaunt bone biped: a ribcage plate + jaw over the person rig.
function makeSkeleton(def) {
  const bone = def.color || 0xe8e4d8;
  const g = buildPerson({ cloth: bone, skin: bone, hair: null, weaponMat: lmat(0xc8ccd2) });
  g.add(mkBox(0.52, 0.5, 0.36, lmat(0xf0ecdd), 0, 1.15, 0.04));                 // ribcage plate
  g.add(mkBox(0.22, 0.12, 0.2, lmat(0xd8d2c2), 0, 1.66, 0.18));                 // jaw
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Wraith — robed spectre that floats, no legs; tapers to a smoke point and sways.
function makeWraith(def) {
  const g = new THREE.Group(), col = def.color;
  const core = new THREE.Group(); core.position.y = 1.2; g.add(core);
  const robe = glowMat(col, 0.5);
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6), robe); body.rotation.x = Math.PI; body.position.y = 0; core.add(body);   // apex points down (smoke)
  core.add(mkIco(0.26, glowMat(0xeaf0ff, 0.85), 0, 0.78, 0));                   // pale head
  for (const s of [1, -1]) { const a = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.6, 5), robe); a.position.set(0.44 * s, 0.18, 0); a.rotation.z = 0.6 * s; core.add(a); }   // sleeves
  g.userData.anim = { float: true, core, hoverY: 1.2, hoverAmp: 0.16, sway: core, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Crystal — floating cluster of glowing shards; bobs and slowly spins.
function makeCrystal(def) {
  const g = new THREE.Group(), glow = glowMat(def.color, 0.85);
  const core = new THREE.Group(); core.position.y = 1.1; g.add(core);
  [[0, 0, 0, 0.55, 0], [0.22, 0.1, 0.16, 0.34, 0.5], [-0.2, 0.06, -0.13, 0.32, -0.6], [0.06, -0.1, 0.24, 0.28, 0.3], [-0.12, 0.13, 0.2, 0.26, -0.3]]
    .forEach(([x, y, z, h, rz]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(h * 0.42, h, 5), glow); c.position.set(x, y, z); c.rotation.z = rz; core.add(c); });
  g.userData.anim = { float: true, core, spin: true, hoverY: 1.1, hoverAmp: 0.14, biped: false };
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Myconid — fungal humanoid with a big mushroom cap. Walks (biped rig).
function makeMyconid(def) {
  const g = buildPerson({ cloth: def.color, skin: 0xe8dcc0, hair: null });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.5, 7), lmat(def.color)); cap.position.y = 2.12; g.add(cap);   // mushroom cap
  g.add(mkIco(0.07, lmat(0xf2e6cc), 0.18, 2.04, 0.26)); g.add(mkIco(0.06, lmat(0xf2e6cc), -0.15, 2.1, 0.22));   // pale cap spots
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Harpy — winged person; the wings flap while it strides/dives.
function makeHarpy(def) {
  const g = buildPerson({ cloth: def.color, skin: 0xe6c79a, hair: 0x2a2330 });
  const mkWing = (s) => { const p = new THREE.Group(); p.position.set(0, 1.45, 0.18 * s); p.add(mkBox(0.95, 0.1, 0.5, lmat(def.color), 0, 0, 0.48 * s)); g.add(p); return p; };
  g.userData.anim.wings = [mkWing(1), mkWing(-1)];
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Siren / drowned — finned aquatic humanoid (fin-ears + a dorsal back-fin).
function makeSiren(def) {
  const g = buildPerson({ cloth: def.color, skin: 0x9ad6c0, hair: 0x2a6a5a });
  for (const s of [1, -1]) g.add(mkCone(0.13, 0.32, lmat(def.color), 0.34 * s, 1.84, -0.08, 0, 1.3 * s));   // fin ears
  g.add(mkBox(0.1, 0.75, 0.5, lmat(def.color), 0, 1.2, -0.26));                 // dorsal fin
  g.scale.setScalar(def.scale || 1);
  return g;
}

// --- Humanoid foe variants — so bandits, goblins, cultists and caster-bosses
//     don't all read as the same person. Each is the buildPerson rig + props. ---

// Goblin — short green raider with big ears and a club.
function makeGoblin(def) {
  const g = buildPerson({ cloth: def.color, skin: 0x6f9a4a, hair: null, weaponMat: lmat(0x6e4a2b) });
  for (const s of [1, -1]) g.add(mkCone(0.08, 0.36, lmat(0x6f9a4a), 0.34 * s, 1.84, -0.04, 0, 1.2 * s));   // pointed ears
  g.userData.anim.armR.add(mkBox(0.2, 0.2, 0.2, lmat(0x6e4a2b), 0, -0.96, 0));                              // club head
  g.scale.setScalar((def.scale || 1) * 0.95);
  return g;
}

// Rogue — hooded bandit / stalker with a short blade and a shadowed cowl.
function makeRogue(def) {
  const g = buildPerson({ cloth: def.color, skin: SKIN[0], hair: null });
  g.add(mkBox(0.44, 0.36, 0.48, lmat(0x2a2330), 0, 1.92, 0));     // hood
  g.add(mkBox(0.32, 0.16, 0.1, lmat(0x14111a), 0, 1.84, 0.27));   // shadowed face
  g.userData.anim.armR.add(mkBox(0.08, 0.46, 0.12, lmat(0xc8ccd2), 0, -0.7, 0));   // dagger
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Pirate — tricorn hat, sash, and a cutlass (brigands, drowned captains).
function makePirate(def) {
  const g = buildPerson({ cloth: def.color, skin: SKIN[2], hair: HAIR[1], weaponMat: lmat(0xd8dde4) });
  g.add(mkBox(0.54, 0.1, 0.5, lmat(0x1a1510), 0, 2.02, 0));       // hat brim
  g.add(mkBox(0.34, 0.2, 0.34, lmat(0x1a1510), 0, 2.14, 0));      // hat crown
  g.add(mkBox(0.7, 0.12, 0.42, lmat(0xb03030), 0, 1.0, 0.02));    // red sash
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Cultist — deep hood hiding the face (a glowing eye) over a robe, holding a staff.
function makeCultist(def) {
  const g = buildPerson({ cloth: def.color, skin: 0x101010, hair: null });
  g.add(mkBox(0.46, 0.42, 0.5, lmat(def.color), 0, 1.9, 0));      // deep hood
  g.add(mkIco(0.07, glowMat(0xff7a3a), 0, 1.88, 0.27));           // glowing eye
  const ah = g.userData.anim.armR;
  ah.add(mkBox(0.07, 1.3, 0.07, lmat(0x3a2a1a), 0, -0.5, 0)); ah.add(mkIco(0.12, glowMat(0xffcf6a), 0, -1.16, 0));   // staff + gem
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Warden — robed caster-boss with a horned crown and a tall glowing staff.
function makeWarden(def) {
  const g = buildPerson({ cloth: def.color, skin: 0xcdb9d6, hair: null });
  g.add(mkBox(0.5, 0.44, 0.52, lmat(def.color), 0, 1.92, 0));     // crowned hood
  for (const s of [1, -1]) g.add(mkCone(0.06, 0.36, lmat(0xf0e6a0), 0.2 * s, 2.16, 0, 0, 0.45 * s));   // crown horns
  const ah = g.userData.anim.armR;
  ah.add(mkBox(0.08, 1.7, 0.08, lmat(0x4a3a2a), 0, -0.65, 0)); ah.add(mkIco(0.17, glowMat(def.color), 0, -1.5, 0));   // staff + orb
  g.scale.setScalar(def.scale || 1);
  return g;
}

// Prisoner — a bound, ragged captive escorted by guards. Not an enemy; talkable.
function makePrisoner(def) {
  const g = buildPerson({ cloth: (def && def.color) || 0x8a7a66, skin: SKIN[1], hair: HAIR[3] });
  g.add(mkBox(0.32, 0.12, 0.14, lmat(0x5a4226), 0, 1.2, 0.34));   // rope binding the wrists in front
  g.userData.anim.bound = true;                                   // keeps the arms forward (see mob walk-cycle)
  return g;
}

// Which archetype each enemy uses. Keys absent here fall back to def.shape
// (generic 'humanoid' people-with-weapons, or 'beast'/'wisp').
const SHAPE_BUILDERS = { humanoid: makeHumanoid, beast: makeBeast, wisp: makeWisp, wolf: makeCanine, panther: makePanther, boar: makeBoarFoe, scorpion: makeScorpion, serpent: makeSerpent, bat: makeBat, raptor: makeRaptor, crab: makeCrab, imp: makeImp, golem: makeGolem, skeleton: makeSkeleton, wraith: makeWraith, crystal: makeCrystal, myconid: makeMyconid, harpy: makeHarpy, siren: makeSiren, goblin: makeGoblin, rogue: makeRogue, pirate: makePirate, cultist: makeCultist, warden: makeWarden };
const ENEMY_SHAPE = {
  // canines & fanged beasts
  wolf: 'wolf', frost_wolf: 'wolf', blight_wolf: 'wolf', ash_hound: 'wolf', lava_hound: 'wolf', ember_boss: 'wolf',
  jungle_panther: 'panther', shade_stalker: 'panther',
  boar: 'boar',
  scorpion: 'scorpion', shard_skitter: 'scorpion',
  // serpents / wyrms / worms
  serpent: 'serpent', sandwyrm: 'serpent', jorath: 'serpent', deep_lurker: 'serpent', glimmer_leech: 'serpent', the_glassmaw: 'serpent',
  glimmer_bat: 'bat',
  roc_fledgling: 'raptor', gale_harrier: 'raptor', stormcrown: 'raptor',
  marsh_crab: 'crab', reef_reaver: 'crab', the_brinemother: 'crab',
  magma_imp: 'imp', scorchling: 'imp',
  crystal_sprite: 'crystal', heart_of_hoarfrost: 'crystal',
  // golems / constructs
  crystal_golem: 'golem', crag_golem: 'golem', stoneward: 'golem', obsidian_sentinel: 'golem', prism_tyrant: 'golem', cinder_colossus: 'golem', chime_warden: 'golem',
  // bony undead
  skeleton: 'skeleton', grave_husk: 'skeleton', bonelord: 'skeleton', ashen_revenant: 'skeleton',
  // spectral undead (float)
  wraith: 'wraith', frost_wraith: 'wraith', edgewraith: 'wraith', salt_wraith: 'wraith', barrow_wight: 'wraith', the_dreamward: 'wraith', glacier_wight: 'wraith', the_reckoner: 'wraith', the_lantern_drowned: 'wraith', the_hollowed_warden: 'wraith',
  // fungal
  myconid_warden: 'myconid', spore_thrall: 'myconid', pollen_drifter: 'myconid', the_chorus: 'myconid', thornling: 'myconid',
  // winged folk
  storm_harpy: 'harpy', sky_warden: 'harpy',
  // finned / drowned folk
  lure_siren: 'siren', sea_witch: 'siren', drowned_king: 'siren', coral_warden: 'siren',
  // goblinoids
  goblin: 'goblin', goblin_brute: 'goblin', warchief: 'goblin',
  // hooded rogues / stalkers
  bandit: 'rogue', cinderglass_stalker: 'rogue',
  // pirates / brigands
  brigand: 'pirate', drowned_captain: 'pirate',
  // robed cultists / priests
  cinder_cultist: 'cultist', tide_priest: 'cultist',
  // robed caster-bosses (horned crown + staff)
  frost_warden: 'warden', vurak: 'warden', thruun: 'warden', hollow_king: 'warden', pyraxis: 'warden', resona: 'warden', the_glasswake: 'warden', the_rimewright: 'warden',
};
function makeEnemyMesh(def, key) {
  const shape = (key && ENEMY_SHAPE[key]) || def.shape || 'beast';
  return (SHAPE_BUILDERS[shape] || makeBeast)(def);
}

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
    if (def.kind === 'squad' || def.kind === 'escort') {
      const squad = { loop: def.loop, members: [] };
      const s0 = def.loop[0];
      const addMember = (g, extra) => { g.position.set(s0.x, world.height(s0.x, s0.z), s0.z); scene.add(g); const m = Object.assign({ def, group: g, squad, idx: squad.members.length, heading: 0, walkPhase: Math.random() * TAU, speed: def.speed, loopI: 0, get pos() { return g.position; } }, extra); squad.members.push(m); mobs.push(m); };
      for (let k = 0; k < def.count; k++) addMember(makeMob({ color: def.color, helm: def.helm, soldier: true, seed: di * 7 + k }), null);
      if (def.prisoner) addMember(makePrisoner(def.prisoner), { prisoner: true });   // escort: a bound captive walks hemmed in by the guards
    } else {
      const g = makeMob({ color: def.color, soldier: !!def.soldier, helm: def.helm, seed: di * 5 });
      g.position.set(def.home.x, world.height(def.home.x, def.home.z), def.home.z); scene.add(g);
      mobs.push({ def, group: g, heading: Math.random() * TAU, walkPhase: Math.random() * TAU, speed: def.speed, home: def.home, radius: def.radius, target: null, pauseT: 0, get pos() { return g.position; } });
    }
  });

  // ---- ambient personality: time-of-day barks + overheard NPC conversations (content.js NPC_VOICE / NPC_CHATS) ----
  npcs.forEach((n) => { n.barkT = 5 + Math.random() * 12; n.busy = false; });
  const chats = NPC_CHATS.map((c) => ({ a: c.a, b: c.b, lines: c.lines, A: npcs.find((n) => n.def.key === c.a), B: npcs.find((n) => n.def.key === c.b), cd: 10 + Math.random() * 20, active: false, lineI: 0, lineT: 0 }))
    .filter((c) => {   // drop chats whose NPCs can't both load or sit too far apart to ever converse (the <22 runtime gate would never fire)
      if (!c.A || !c.B) { console.warn('NPC_CHATS: unknown NPC key', c.a, c.b); return false; }
      if (dist2D(c.A.pos.x, c.A.pos.z, c.B.pos.x, c.B.pos.z) >= 22) { console.warn('NPC_CHATS: pair too far to converse', c.a, c.b); return false; }
      return true;
    });
  const pickOne = (a) => a[(Math.random() * a.length) | 0];
  function reactiveLine() {   // NPCs notice the PLAYER — boss kills, weather, wounds, weapon (returns null to fall through to flavour barks)
    const R = REACT_LINES; if (!R) return null;
    if (G.bossFresh > 0 && G.bossName && R.boss && Math.random() < 0.65) return pickOne(R.boss).replace('{boss}', G.bossName);
    const ps = G.player && G.player.state;
    if (ps && ps.maxHp && ps.hp / ps.maxHp < 0.3 && R.hurt && Math.random() < 0.6) return pickOne(R.hurt);
    const wk = G.weatherKind; if (wk && R[wk] && Math.random() < 0.5) return pickOne(R[wk]);
    const st = G.player && G.player.weapon && G.player.weapon() && G.player.weapon().style;
    if (st && R[st] && Math.random() < 0.3) return pickOne(R[st]);
    return null;
  }
  // Out in the world, bubbles should LINGER long enough to read — scale the on-screen time with the line
  // length (a comfortable ~16 chars/sec) on a generous base, capped so a wall of text doesn't camp forever.
  const readDur = (t) => Math.min(9, 3.8 + (t ? t.length : 0) * 0.06);
  function emitBark(ent, v, prefix) {
    if (!G.ui || !G.ui.sayAt) return;
    const rx = reactiveLine();
    if (rx) { G.ui.sayAt(ent.group.position, rx, readDur(rx), { owner: (prefix || 'npc_') + (ent.def.key || ent.def.name) }); return; }
    sayVoice(ent, v, prefix);
  }
  function sayVoice(ent, v, prefix) {
    if (!v || !G.ui || !G.ui.sayAt) return;
    const night = (typeof G.tod === 'number') && (G.tod < 0.22 || G.tod > 0.8);   // wearier lines after dusk
    const pool = (night && v.night && v.night.length ? v.night : (v.day || []));
    const all = pool.concat(v.any || []);
    if (all.length) { const line = all[(Math.random() * all.length) | 0]; G.ui.sayAt(ent.group.position, line, readDur(line), { owner: (prefix || 'npc_') + (ent.def.key || ent.def.name) }); }
  }
  function updateSpeech(dt, player) {
    if (!G.ui || !G.ui.sayAt) return;
    const px = player.position.x, pz = player.position.z, EAR2 = 24 * 24;   // only chatter within earshot of the player (world coords are WORLD_SCALE'd)
    const near2 = (e) => { const dx = e.pos.x - px, dz = e.pos.z - pz; return dx * dx + dz * dz; };
    for (const c of chats) {   // overheard two-NPC conversations, advanced line by line as bubbles
      if (c.active) {
        c.lineT -= dt;
        if (c.lineT <= 0) {
          if (c.lineI < c.lines.length) {
            const ln = c.lines[c.lineI++], sp = ln.who === c.a ? c.A : c.B;
            G.ui.sayAt(sp.group.position, ln.text, readDur(ln.text), { owner: 'npc_' + sp.def.key, chat: true });
            c.lineT = 3.2 + ln.text.length * 0.045;   // hold each line long enough to read before the reply lands
          } else { c.active = false; c.A.busy = c.B.busy = false; c.cd = 26 + Math.random() * 36; }
        }
      } else {
        c.cd -= dt;
        if (c.cd <= 0) {
          if (!c.A.busy && !c.B.busy && dist2D(c.A.pos.x, c.A.pos.z, c.B.pos.x, c.B.pos.z) < 22 && (near2(c.A) < EAR2 || near2(c.B) < EAR2)) {
            c.active = true; c.lineI = 0; c.lineT = 0.15; c.A.busy = c.B.busy = true;
          } else c.cd = 3 + Math.random() * 3;   // retry soon (player out of earshot / busy)
        }
      }
    }
    for (const n of npcs) {   // solo ambient barks (skip anyone mid-conversation)
      if (n.busy) continue;
      n.barkT -= dt;
      if (n.barkT <= 0) { n.barkT = 9 + Math.random() * 11; if (near2(n) < EAR2) emitBark(n, NPC_VOICE[n.def.key]); }
    }
    for (const m of mobs) {   // lone wanderers mutter too (their bubble follows them)
      if (m.squad || !m.def || m.def.kind !== 'wander') continue;
      if (m.barkT == null) m.barkT = 8 + Math.random() * 14;
      m.barkT -= dt;
      if (m.barkT <= 0) { m.barkT = 12 + Math.random() * 12; if (near2(m) < EAR2) emitBark(m, WANDER_VOICE[m.def.name], 'wm_'); }
    }
  }

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
  // structures (buildings/barn/spires). PERF: skip inter-animal collision (cosmetic-only, saves O(N²)).
  // shared: is (nx,nz) clear of big structures (buildings / barn / spires)? used by animals, ambient mobs
  // AND enemies so none of them phase through walls.
  function obstacleClear(nx, nz) {
    const ob = world.obstacles;
    if (ob) for (let i = 0; i < ob.length; i++) { const o = ob[i], dx = nx - o.x, dz = nz - o.z, rr = o.r + 0.4; if (dx * dx + dz * dz < rr * rr) return false; }
    return true;
  }
  function animalStep(a, nx, nz) {
    if (!(world.isWalkable(nx, nz) || (a.def.water && world.height(nx, nz) <= 0.4))) return false;
    return obstacleClear(nx, nz);
  }
  // Move group by (sx,sz), sliding along walls (try full, then X-only, then Z-only) so it routes AROUND
  // a building instead of phasing through it or sticking. `gate(nx,nz)` is an optional extra constraint
  // (e.g. an enemy's leash). Returns true if it moved.
  function stepSlide(group, px, pz, sx, sz, gate) {
    const ok = (nx, nz) => world.isWalkable(nx, nz) && obstacleClear(nx, nz) && (!gate || gate(nx, nz));
    if (ok(px + sx, pz + sz)) { group.position.x = px + sx; group.position.z = pz + sz; return true; }
    if (ok(px + sx, pz)) { group.position.x = px + sx; return true; }
    if (ok(px, pz + sz)) { group.position.z = pz + sz; return true; }
    return false;
  }
  // Steer toward `heading`, fanning out to ever-wider angles when the direct path is
  // blocked, so ambient folk route AROUND fences/walls instead of pressing into them.
  // Returns the heading actually travelled (to face that way), or null if boxed in.
  function seekStep(group, px, pz, heading, spd, dt, gate) {
    for (const off of [0, 0.6, -0.6, 1.15, -1.15, 1.7, -1.7, 2.4, -2.4]) {
      const h = heading + off, sx = Math.sin(h) * spd * dt, sz = Math.cos(h) * spd * dt;
      if (stepSlide(group, px, pz, sx, sz, gate)) return h;
    }
    return null;
  }

  // companion pet — one tamed animal (or a rare boss pet) that trails a step behind the player
  let pet = null;
  function setPet(kind) {
    if (pet) { scene.remove(pet.group); pet = null; }
    if (!kind) return;
    let g;
    if (kind.indexOf('pet_') === 0) { const def = ENEMIES[kind.slice(4)]; if (!def) return; g = makeEnemyMesh(def, kind.slice(4)); g.scale.setScalar((def.scale || 1) * 0.42); }
    else { if (!ANIMAL_DEF[kind]) return; g = makeAnimal(kind); g.scale.multiplyScalar(0.85); }
    scene.add(g);
    pet = { group: g, kind, walkPhase: 0, snap: true };
  }

  const enemies = [];
  function spawnEnemy(key, x, z) {
    if (!world.isWalkable(x, z)) { outer: for (let r = 4; r <= 40; r += 4) for (let a = 0; a < TAU; a += TAU / 16) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (world.isWalkable(nx, nz)) { x = nx; z = nz; break outer; } } }   // keep spawns out of the sea
    const def = ENEMIES[key];
    const group = makeEnemyMesh(def, key);
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
    const lf = (update._lf = (update._lf | 0) + 1);   // frame counter for distant-entity LOD (half-rate AI far away)
    const LOD2 = (45 * WS) * (45 * WS);                // beyond this (squared) an ambient entity updates every OTHER frame — imperceptible through fog
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
      if (d > 70 * WS) { e.group.visible = false; e.group.rotation.z = 0; continue; }   // PERF: hide + skip far-away enemies (saves draw calls)
      if (!e.group.visible) e.group.visible = true;
      if (d * d > LOD2 && (lf & 1)) continue;   // LOD: distant (non-engaging) enemies update at half-rate; anyone chasing the player is near, so unaffected
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
          const sx = Math.sin(e.heading) * e.def.speed * dt, sz = Math.cos(e.heading) * e.def.speed * dt;
          if (stepSlide(e.group, e.pos.x, e.pos.z, sx, sz)) moving = true;   // route around walls toward the player
        } else {
          e.attackCd -= dt;
          if (e.attackCd <= 0) { e.attackCd = e.enraged ? 0.85 : 1.3; e.atkAnim = ATK_ANIM; G.damagePlayer(Math.round(e.def.dmg * (e.enraged ? 1.25 : 1)), e); }
        }
      } else {
        const homeDist = dist2D(e.pos.x, e.pos.z, e.home.x, e.home.z);
        if (homeDist > e.leash) {
          // beyond leash (e.g. kited out of its arena) — walk straight back toward home
          e.heading = Math.atan2(e.home.x - e.pos.x, e.home.z - e.pos.z);
          const sx = Math.sin(e.heading) * e.def.speed * 0.6 * dt, sz = Math.cos(e.heading) * e.def.speed * 0.6 * dt;
          if (stepSlide(e.group, e.pos.x, e.pos.z, sx, sz)) moving = true;
          e.wanderT = 0;
        } else {
          e.wanderT -= dt;
          if (e.wanderT <= 0) { e.wanderT = 1 + Math.random() * 2.5; e.heading = Math.random() * TAU; e.moving = Math.random() > 0.45; }
          if (e.moving) {
            const sp = e.def.speed * 0.4;
            const sx = Math.sin(e.heading) * sp * dt, sz = Math.cos(e.heading) * sp * dt;
            if (stepSlide(e.group, e.pos.x, e.pos.z, sx, sz, (nx, nz) => dist2D(nx, nz, e.home.x, e.home.z) < e.leash)) moving = true;
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
      if (anim && anim.float) {
        // floating creature (wisp/wraith/crystal/bat) — always bobs even when idle
        const base = anim.hoverY != null ? anim.hoverY : 1.15, amp = anim.hoverAmp || 0.13;
        anim.core.position.y = base + Math.sin(T * 2 + e.home.x) * amp;
        if (anim.spin) anim.core.rotation.y += dt * 1.1;                                  // wisps/crystals slowly rotate
        if (anim.sway) anim.sway.rotation.z = Math.sin(T * 1.8 + e.home.x) * 0.1;         // wraiths drift side to side
        if (anim.aura) anim.aura.scale.setScalar(1 + Math.sin(T * 3 + e.home.x) * 0.09);
        if (anim.wings) { const f = Math.sin(T * 9 + e.home.x) * 0.6; anim.wings[0].rotation.x = f; anim.wings[1].rotation.x = -f; }
      } else if (anim) {
        const gait = moving ? Math.sin(e.walkPhase) * 0.55 : 0;
        const k = Math.min(1, dt * 10);
        if (anim.biped) {
          anim.legL.rotation.x += (gait - anim.legL.rotation.x) * k;
          anim.legR.rotation.x += (-gait - anim.legR.rotation.x) * k;
          anim.armL.rotation.x += (-gait - anim.armL.rotation.x) * k;          // off-arm counter-swings
          if (e.atkAnim > 0) {                                                  // biped strike: wind the arm back, then chop forward
            const ap = 1 - e.atkAnim / ATK_ANIM;
            anim.armR.rotation.x = ap < 0.4 ? -1.5 * (ap / 0.4) : -1.5 + 2.1 * ((ap - 0.4) / 0.6);
          } else {
            anim.armR.rotation.x += (gait - anim.armR.rotation.x) * k;
          }
          if (anim.head) {                                                       // idle head life: a slow look-around + breathing nod
            anim.head.rotation.y = Math.sin(T * 0.6 + e.home.x) * 0.14;
            anim.head.rotation.x = Math.sin(T * 1.5 + e.home.x) * 0.04 + (moving ? -Math.abs(Math.sin(e.walkPhase)) * 0.05 : 0);
          }
        } else if (anim.legs && anim.legs.length >= 4) {
          anim.legs[0].rotation.x = gait; anim.legs[3].rotation.x = gait;     // diagonal trot
          anim.legs[1].rotation.x = -gait; anim.legs[2].rotation.x = -gait;
        } else if (anim.legs && anim.legs.length === 2) {
          anim.legs[0].rotation.x = gait; anim.legs[1].rotation.x = -gait;    // two-legged stride (birds)
        }
        if (anim.wings) { const f = 0.3 + Math.sin(T * 7 + e.home.x) * 0.45; anim.wings[0].rotation.x = f; anim.wings[1].rotation.x = -f; }   // harpy/raptor wing-flap
        if (anim.sway) anim.sway.rotation.z = Math.sin(T * 2.2 + e.home.x) * 0.12;        // serpent reared-head sway
      }
      if (moving) e.group.position.y += Math.abs(Math.sin(e.walkPhase)) * 0.05;              // walk bob (on top of the terrain snap above)
      // forward strike-lean takes priority over a hurt recoil so a hit visibly knocks the foe back
      if (e.hurtFlash > 0) e.group.rotation.x = 0.3 * Math.min(1, e.hurtFlash / 0.2);
      else if (e.atkAnim > 0) e.group.rotation.x = -0.5 * Math.sin((1 - e.atkAnim / ATK_ANIM) * Math.PI);
      else e.group.rotation.x = e.group.rotation.x * (1 - Math.min(1, dt * 10));
      e.group.scale.setScalar((e.hurtFlash > 0 ? 1.14 : 1) * e.baseScale);
    }
    // NPC idle — gentle sway, and turn to face the player when close
    for (const n of npcs) {
      const d = dist2D(n.pos.x, n.pos.z, player.position.x, player.position.z);
      if (d > 60 * WS) { n.group.visible = false; continue; }   // PERF: hide far-away NPCs
      if (!n.group.visible) n.group.visible = true;
      const target = d < 7 ? Math.atan2(player.position.x - n.pos.x, player.position.z - n.pos.z) : n.baseRot;
      let dy = target - n.group.rotation.y; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU;
      n.group.rotation.y += dy * Math.min(1, dt * 6);
      n.group.rotation.z = Math.sin(T * 1.4 + n.phase) * 0.03;
      const a = n.group.userData.anim;   // gentle idle arm sway + head life so they feel alive
      if (a) {
        const s = Math.sin(T * 1.3 + n.phase) * 0.09;
        a.armL.rotation.x = s; a.armR.rotation.x = -s;
        if (a.head) { a.head.rotation.y = Math.sin(T * 0.5 + n.phase) * 0.16; a.head.rotation.x = Math.sin(T * 1.4 + n.phase) * 0.05; }   // look around + breathe
        n.group.position.y = world.height(n.pos.x, n.pos.z) + Math.sin(T * 1.6 + n.phase) * 0.012;   // breathing bob (overrides the static terrain snap)
      }
    }
    // ambient mobs — squads patrol a loop in formation, wanderers stroll near home; all walk-cycle
    const isNight = (typeof G.tod === 'number') && (G.tod < 0.22 || G.tod > 0.8);   // routine: the town winds down after dusk
    for (const m of mobs) {
      const md = dist2D(m.pos.x, m.pos.z, player.position.x, player.position.z);
      if (md > 70 * WS) { m.group.visible = false; continue; }   // PERF: hide + freeze when far (just past the fog line)
      if (!m.group.visible) m.group.visible = true;
      if (md * md > LOD2 && (lf & 1)) continue;   // LOD: distant ambient mobs amble at half-rate

      const spd = isNight ? m.speed * (m.squad ? 0.78 : 0.55) : m.speed;   // slower at night (wanderers also keep close to home, below)
      let tx, tz, stop = 1.2;
      if (m.squad) {
        if (m.idx === 0) {
          const wp = m.squad.loop[m.loopI]; tx = wp.x; tz = wp.z;
          if (dist2D(m.pos.x, m.pos.z, tx, tz) < 2.2) m.loopI = (m.loopI + 1) % m.squad.loop.length;
        } else {
          const L = m.squad.members[0], lh = L.heading;
          const back = m.prisoner ? 2.2 : 2.2 * Math.ceil(m.idx / 2), side = m.prisoner ? 0 : (m.idx % 2 ? 1.4 : -1.4);   // the prisoner walks centred, hemmed in by the guards
          tx = L.pos.x - Math.sin(lh) * back + Math.cos(lh) * side;
          tz = L.pos.z - Math.cos(lh) * back - Math.sin(lh) * side;
          stop = 0.7;
        }
      } else {
        if (!m.target || dist2D(m.pos.x, m.pos.z, m.target.x, m.target.z) < 1.4) {
          m.pauseT -= dt;
          if (m.pauseT <= 0) { const ang = Math.random() * TAU, r = Math.random() * (isNight ? m.radius * 0.32 : m.radius); m.target = { x: m.home.x + Math.cos(ang) * r, z: m.home.z + Math.sin(ang) * r }; m.pauseT = (isNight ? 3.5 : 1.5) + Math.random() * 3; }   // hug home + dawdle at night
        }
        tx = m.target ? m.target.x : m.pos.x; tz = m.target ? m.target.z : m.pos.z;
      }
      const dx = tx - m.pos.x, dz = tz - m.pos.z, dd = Math.hypot(dx, dz);
      let moving = false;
      if (dd > stop) {
        const desired = Math.atan2(dx, dz);
        const used = seekStep(m.group, m.pos.x, m.pos.z, desired, spd, dt);   // route around fences/walls rather than pressing into them
        if (used != null) { moving = true; m.heading = used; m.stuckT = 0; }
        else {
          m.heading = desired; m.stuckT = (m.stuckT || 0) + dt;              // fully boxed in
          if (m.stuckT > 2.2) {   // give up on an unreachable goal so the squad never pins to a fence forever
            m.stuckT = 0;
            if (m.squad && m.idx === 0) m.loopI = (m.loopI + 1) % m.squad.loop.length;   // leader: skip to the next patrol waypoint
            else if (!m.squad) { m.target = null; m.pauseT = 0; }                          // wanderer: pick a fresh spot
          }
        }
      }
      m.group.position.y = world.height(m.pos.x, m.pos.z);
      m.group.rotation.y = m.heading;
      if (moving) m.walkPhase += dt * 9;
      const a = m.group.userData.anim;
      if (a) {
        const gait = moving ? Math.sin(m.walkPhase) * 0.5 : 0, k = Math.min(1, dt * 10);
        a.legL.rotation.x += (gait - a.legL.rotation.x) * k; a.legR.rotation.x += (-gait - a.legR.rotation.x) * k;
        if (a.bound) { a.armL.rotation.x = -1.2; a.armR.rotation.x = -1.2; }   // prisoner: wrists bound forward (no arm-swing)
        else { a.armL.rotation.x += (-gait - a.armL.rotation.x) * k; a.armR.rotation.x += (gait - a.armR.rotation.x) * k; }
      }
    }
    // ambient animals — wander then pause to graze; wild prey bolt from the player; hens/ducks lay eggs
    for (const a of animals) {
      const D = a.def, anim = a.group.userData.anim;
      const pdx = a.pos.x - player.position.x, pdz = a.pos.z - player.position.z, pd2 = pdx * pdx + pdz * pdz;
      const far = pd2 > ANIMAL_FREEZE2; a.group.visible = !far; if (far) continue;   // freeze + hide far away (perf)
      if (pd2 > LOD2 && (lf & 1)) continue;   // LOD: distant grazers update at half-rate (imperceptible through fog)
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
    updateSpeech(dt, player);
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
  // When unhiding, the per-frame distance cull will immediately re-hide far entities.
  function setHidden(flag) {
    for (const n of npcs) n.group.visible = !flag;
    for (const m of mobs) m.group.visible = !flag;
    for (const a of animals) a.group.visible = !flag;
    for (const eg of eggs) eg.mesh.visible = !flag;
    if (pet) pet.group.visible = !flag;
    for (const e of enemies) e.group.visible = flag ? false : e.alive;
  }
  // PERF: optimised animal-step uses world.obstacles (pre-filtered to r>=1.2) instead of full solids
  // and skips the O(animals²) inter-collision when > 20 animals are active (herd density is cosmetic)

  return { npcs, mobs, animals, eggs, enemies, chats, update, damageEnemy, spawnEnemy, setHidden, setPet, getPet: () => (pet ? pet.kind : null) };
}
