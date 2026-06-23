import * as THREE from 'three';
import { TAU, damp } from './util.js';
import { weaponOf } from './content.js';

const SPEED = 8.0;          // units/sec
const TURN = 2.4;           // rad/sec
const COAST_FWD = 0.42;
const COAST_TURN = 0.26;
const CAM_DIST = 9.5, CAM_HEIGHT = 5.2, CAM_LOOK = 3.0, HEAD_Y = 1.5;
const ATTACK_DUR = 0.34;
const GATHER_DUR = 0.6;

// Per-item held models: [shape, tint]. Shape drives the mesh, tint the colour, so
// every weapon shows a distinct, type-appropriate model in the hand.
const WEAPON_MODEL = {
  bronze_sword: ['sword', 0xb87333], iron_sword: ['sword', 0xc2ccd6], steel_sword: ['greatsword', 0xeaf2ff], bronze_dagger: ['dagger', 0xb87333],
  sun_blade: ['greatsword', 0xffd45f], wraithblade: ['greatsword', 0xcfc8b0], ashbringer: ['greatsword', 0xff5a2a],
  cinderforge_axe: ['axe', 0xff7a3a], coilfang_spear: ['spear', 0x4fd06a], tidecaller_trident: ['trident', 0x2bd6cf],
  corsair_cutlass: ['sword', 0xe0c060], barrow_blade: ['greatsword', 0x9bb0c0], mithril_sword: ['sword', 0x8fb8d8],
  oak_bow: ['bow', 0x8a5a2e], yew_bow: ['bow', 0x6e4a2b], stormstring_bow: ['longbow', 0x9bdcff], tempest_bow: ['longbow', 0xbfe6ff],
  apprentice_staff: ['staff', 0x9b6bff], ember_staff: ['staff', 0xff7a33], frost_staff: ['staff', 0x9bd0ff], prism_staff: ['staff', 0xc6a8ff], faewild_staff: ['staff', 0xff7af0],
};
// Per-armor body looks: chest colour + optional shoulders / helm / hood.
const ARMOR_MODEL = {
  leather_armor: { color: 0x8a5a2e }, iron_armor: { color: 0x9aa0a8, shoulders: true }, steel_armor: { color: 0xeaf2ff, shoulders: true, helm: true },
  guardian_armor: { color: 0xd8c070, shoulders: true, helm: true }, ranger_armor: { color: 0x4f8f5a, hood: true }, sorcerer_robes: { color: 0x8a6abf, hood: true },
  mithril_armor: { color: 0x8fb8d8, shoulders: true, helm: true }, mariner_plate: { color: 0x8aa6b6, shoulders: true }, grave_plate: { color: 0x9a8a6a, shoulders: true, helm: true },
};
const SHIELD_COL = { wooden_shield: 0x8a5a2e, iron_shield: 0x9aa0a8, steel_shield: 0xeaf2ff, barnacle_shield: 0x3a8a8a, mithril_shield: 0x8fb8d8 };

export function createPlayer(scene, world) {
  const group = new THREE.Group();
  const body = new THREE.Group();      // bobs while walking; keeps ground calc clean
  group.add(body);

  const tunic = new THREE.MeshLambertMaterial({ color: 0x36d1c4, flatShading: true });
  const skin = new THREE.MeshLambertMaterial({ color: 0xf2c79a, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x2a3340, flatShading: true });
  const steel = new THREE.MeshLambertMaterial({ color: 0xcdd6e0, flatShading: true });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x6e4a2b, flatShading: true });
  const orbMat = new THREE.MeshBasicMaterial({ color: 0x9b6bff });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x9bf2ff });

  const mkBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
  // legs hang from hip pivots so they can swing in a walk cycle
  const legL = new THREE.Group(); legL.position.set(-0.17, 0.7, 0); legL.add(mkBox(0.24, 0.7, 0.24, dark, 0, -0.35, 0)); body.add(legL);
  const legR = new THREE.Group(); legR.position.set(0.17, 0.7, 0); legR.add(mkBox(0.24, 0.7, 0.24, dark, 0, -0.35, 0)); body.add(legR);
  body.add(mkBox(0.74, 0.82, 0.46, tunic, 0, 1.15, 0));      // torso
  const armL = new THREE.Group(); armL.position.set(-0.5, 1.5, 0); armL.add(mkBox(0.2, 0.62, 0.22, tunic, 0, -0.31, 0)); body.add(armL);   // left arm (swings)
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), skin);
  head.position.set(0, 1.86, 0); body.add(head);
  body.add(mkBox(0.4, 0.12, 0.06, visorMat, 0, 1.9, 0.3));   // facing visor (+z)

  // armor overlay group — rebuilt to match the equipped armor (chest/shoulders/helm/hood)
  const armorGroup = new THREE.Group(); body.add(armorGroup);
  const shieldGroup = new THREE.Group(); body.add(shieldGroup);   // shield on the left arm

  // right arm: pivots at the shoulder so it can swing; holds the weapon
  const rightArm = new THREE.Group(); rightArm.position.set(0.5, 1.5, 0); body.add(rightArm);
  rightArm.add(mkBox(0.2, 0.62, 0.22, tunic, 0, -0.31, 0));  // upper arm
  const hand = new THREE.Group(); hand.position.set(0, -0.62, 0); rightArm.add(hand);
  hand.add(mkBox(0.18, 0.18, 0.18, skin, 0, 0, 0));          // fist
  const weaponHolder = new THREE.Group(); hand.add(weaponHolder);
  const toolHolder = new THREE.Group(); hand.add(toolHolder); toolHolder.visible = false;   // axe/pick/rod shown while gathering

  function clearHolder() { while (weaponHolder.children.length) weaponHolder.remove(weaponHolder.children[0]); }
  function buildWeaponModel(model, tint) {
    const m = new THREE.MeshLambertMaterial({ color: tint, flatShading: true });
    const glow = new THREE.MeshBasicMaterial({ color: tint });
    if (model === 'sword') { weaponHolder.add(mkBox(0.08, 1.0, 0.16, m, 0, -0.55, 0)); weaponHolder.add(mkBox(0.34, 0.1, 0.2, dark, 0, -0.04, 0)); }
    else if (model === 'dagger') { weaponHolder.add(mkBox(0.07, 0.55, 0.14, m, 0, -0.35, 0)); weaponHolder.add(mkBox(0.22, 0.08, 0.16, dark, 0, -0.05, 0)); }
    else if (model === 'greatsword') { weaponHolder.add(mkBox(0.13, 1.5, 0.22, m, 0, -0.8, 0)); weaponHolder.add(mkBox(0.5, 0.12, 0.24, dark, 0, -0.04, 0)); }
    else if (model === 'axe') { weaponHolder.add(mkBox(0.07, 1.25, 0.07, woodMat, 0, -0.62, 0)); weaponHolder.add(mkBox(0.5, 0.5, 0.14, m, 0.24, -1.05, 0)); }
    else if (model === 'spear') { weaponHolder.add(mkBox(0.06, 1.8, 0.06, woodMat, 0, -0.85, 0)); const t = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 6), m); t.position.set(0, -1.78, 0); t.rotation.x = Math.PI; weaponHolder.add(t); }
    else if (model === 'trident') { weaponHolder.add(mkBox(0.06, 1.7, 0.06, woodMat, 0, -0.8, 0)); weaponHolder.add(mkBox(0.5, 0.08, 0.08, m, 0, -1.5, 0)); for (const dx of [-0.2, 0, 0.2]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 5), m); p.position.set(dx, -1.7, 0); p.rotation.x = Math.PI; weaponHolder.add(p); } }
    else if (model === 'bow' || model === 'longbow') { const r = model === 'longbow' ? 0.62 : 0.46; const bow = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 6, 10, Math.PI * 1.2), m); bow.rotation.z = Math.PI / 2; bow.position.set(0, -0.1, 0.1); weaponHolder.add(bow); }
    else if (model === 'staff') { weaponHolder.add(mkBox(0.07, 1.3, 0.07, woodMat, 0, -0.55, 0)); const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), glow); orb.position.set(0, -1.2, 0); weaponHolder.add(orb); }
    else if (model === 'wand') { weaponHolder.add(mkBox(0.06, 0.85, 0.06, woodMat, 0, -0.45, 0)); const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), glow); orb.position.set(0, -0.9, 0); weaponHolder.add(orb); }
  }
  function setWeaponMesh(key) {
    clearHolder();
    if (!key) return;   // unarmed → just fists
    const it = weaponOf(key);
    const md = WEAPON_MODEL[key] || [it.style === 'ranged' ? 'bow' : it.style === 'magic' ? 'staff' : 'sword', 0xcdd6e0];
    buildWeaponModel(md[0], md[1]);
  }
  function buildArmor(key) {
    while (armorGroup.children.length) armorGroup.remove(armorGroup.children[0]);
    if (!key) return;
    const a = ARMOR_MODEL[key] || { color: 0xb9c2cc };
    const m = new THREE.MeshLambertMaterial({ color: a.color, flatShading: true });
    armorGroup.add(mkBox(0.86, 0.92, 0.58, m, 0, 1.15, 0));                         // chest plate over the tunic
    if (a.shoulders) { armorGroup.add(mkBox(0.34, 0.26, 0.52, m, -0.52, 1.5, 0)); armorGroup.add(mkBox(0.34, 0.26, 0.52, m, 0.52, 1.5, 0)); }
    if (a.helm) armorGroup.add(mkBox(0.44, 0.34, 0.44, m, 0, 2.0, 0));
    if (a.hood) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.55, 6), m); h.position.set(0, 2.05, 0); armorGroup.add(h); }
  }
  function buildShield(key) {
    while (shieldGroup.children.length) shieldGroup.remove(shieldGroup.children[0]);
    if (!key) return;
    const m = new THREE.MeshLambertMaterial({ color: SHIELD_COL[key] || 0x9aa0a8, flatShading: true });
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.56), m); sh.position.set(-0.62, 1.2, 0.08); shieldGroup.add(sh);
    const boss = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), steel); boss.position.set(-0.7, 1.2, 0.08); shieldGroup.add(boss);
  }
  function setToolMesh(kind) {
    while (toolHolder.children.length) toolHolder.remove(toolHolder.children[0]);
    if (kind === 'mine') {                                                    // pickaxe
      toolHolder.add(mkBox(0.06, 0.95, 0.06, woodMat, 0, -0.5, 0));
      toolHolder.add(mkBox(0.55, 0.09, 0.09, steel, 0, -0.92, 0));
    } else if (kind === 'fish') {                                             // fishing rod
      toolHolder.add(mkBox(0.05, 1.3, 0.05, woodMat, 0, -0.64, 0));
    } else if (kind === 'cook') {                                             // ladle
      toolHolder.add(mkBox(0.05, 0.75, 0.05, woodMat, 0, -0.38, 0));
      toolHolder.add(mkBox(0.2, 0.12, 0.2, steel, 0, -0.76, 0));
    } else {                                                                  // axe (chop / forage)
      toolHolder.add(mkBox(0.06, 0.9, 0.06, woodMat, 0, -0.46, 0));
      toolHolder.add(mkBox(0.3, 0.16, 0.1, steel, 0.12, -0.86, 0));
    }
  }

  // Stand on the plaza south of the village (clear of the hut ring), facing in.
  const sx = world.village.x, sz = world.village.z + 12;
  group.position.set(sx, world.height(sx, sz), sz);
  scene.add(group);

  const state = {
    heading: Math.PI,
    hp: 100, maxHp: 100,
    coastFwd: 0, coastBack: 0, coastTurn: 0, coastTurnDir: 0,
    moving: false, bob: 0,
    attackCd: 0, attackAnim: 0, attackStyle: 'unarmed', animDur: ATTACK_DUR, toolActive: false,
    equipment: { weapon: null, armor: null, amulet: null, ring: null, shield: null },
    prayer: 30, maxPrayer: 30, activePrayer: null,
    combatStance: 'accurate',   // attack stance (accurate/aggressive/defensive/controlled)
    bounds: null,   // set while inside a building → clamp movement to the room
    solids: null,   // circular obstacles (buildings outdoors, furniture/NPCs indoors)
  };

  function weapon() { return weaponOf(state.equipment.weapon); }
  function refreshEquipment() {
    setWeaponMesh(state.equipment.weapon);
    buildArmor(state.equipment.armor);
    buildShield(state.equipment.shield);
  }
  refreshEquipment();

  const forwardVec = () => ({ x: Math.sin(state.heading), z: Math.cos(state.heading) });
  const impulseForward = () => { state.coastFwd = COAST_FWD; };
  const impulseBack = () => { state.coastBack = COAST_FWD; };
  const impulseTurn = (dir) => { state.coastTurnDir = dir; state.coastTurn = COAST_TURN; };
  function showTool(on) { toolHolder.visible = on; weaponHolder.visible = !on; state.toolActive = on; }
  function playAttack(style) { if (state.toolActive) showTool(false); state.attackStyle = style || weapon().style; state.attackAnim = ATTACK_DUR; state.animDur = ATTACK_DUR; }
  function playGather(kind) { setToolMesh(kind); showTool(true); state.attackStyle = kind; state.attackAnim = GATHER_DUR; state.animDur = GATHER_DUR; }

  const inB = (b, x, z) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
  function clear(x, z) {
    if (state.bounds) { if (!inB(state.bounds, x, z)) return false; }
    else if (!world.isWalkable(x, z)) return false;
    const s = state.solids;                                  // circular obstacle collision (buildings / furniture / NPCs)
    if (s) for (let i = 0; i < s.length; i++) { const o = s[i], dx = x - o.x, dz = z - o.z; if (dx * dx + dz * dz < o.r * o.r) return false; }
    return true;
  }
  function tryMove(dt, dir) {
    const f = forwardVec();
    const step = SPEED * dt * dir;
    const x = group.position.x, z = group.position.z;
    const nx = x + f.x * step, nz = z + f.z * step;
    if (clear(nx, nz)) { group.position.x = nx; group.position.z = nz; }      // full move
    else if (clear(nx, z)) { group.position.x = nx; }                          // slide along X
    else if (clear(x, nz)) { group.position.z = nz; }                          // slide along Z
  }

  function update(dt, input) {
    let turn = 0;
    if (input.keys.has('left')) turn -= 1;
    if (input.keys.has('right')) turn += 1;
    if (turn === 0 && state.coastTurn > 0) turn = state.coastTurnDir;
    state.coastTurn = Math.max(0, state.coastTurn - dt);
    state.heading -= turn * TURN * dt;   // swipe-left turns left (mirrors on-device feel)
    if (state.heading > Math.PI) state.heading -= TAU;
    if (state.heading < -Math.PI) state.heading += TAU;

    const walking = input.keys.has('up') || state.coastFwd > 0;
    state.coastFwd = Math.max(0, state.coastFwd - dt);
    const backing = !walking && (input.keys.has('down') || state.coastBack > 0);
    state.coastBack = Math.max(0, state.coastBack - dt);
    state.moving = walking || backing;
    if (walking) tryMove(dt, 1);
    else if (backing) tryMove(dt, -0.55);   // slower back-pedal

    group.position.y = state.bounds ? state.bounds.y : world.height(group.position.x, group.position.z);
    group.rotation.y = state.heading;
    if (state.moving) state.bob += dt * 11;
    body.position.y = state.moving ? Math.abs(Math.sin(state.bob)) * 0.08 : body.position.y * (1 - damp(8, dt));

    // walk cycle — legs swing at the hips, arms counter-swing (the right arm yields to an attack)
    const gait = state.moving ? Math.sin(state.bob) * 0.5 : 0;
    const gk = Math.min(1, dt * 12);
    legL.rotation.x += (gait - legL.rotation.x) * gk;
    legR.rotation.x += (-gait - legR.rotation.x) * gk;
    armL.rotation.x += (-gait - armL.rotation.x) * gk;

    // attack animation (right arm)
    if (state.attackAnim > 0) {
      state.attackAnim = Math.max(0, state.attackAnim - dt);
      const t = 1 - state.attackAnim / state.animDur;
      const s = Math.sin(t * Math.PI);
      switch (state.attackStyle) {
        case 'ranged': rightArm.rotation.x = -1.2 - 0.5 * s; break;
        case 'magic':  rightArm.rotation.x = -1.5 - 0.4 * s; break;
        case 'chop':   rightArm.rotation.x = -2.4 * Math.abs(Math.sin(t * Math.PI * 2)); break;   // two overhead chops
        case 'mine':   rightArm.rotation.x = -2.1 * Math.abs(Math.sin(t * Math.PI * 2)); break;   // two pick swings
        case 'fish':   rightArm.rotation.x = -1.5 + 0.6 * s; break;                               // cast & settle
        case 'cook':   rightArm.rotation.x = -0.9 + 0.3 * Math.sin(t * Math.PI * 3); break;       // stir the pot
        case 'forage': rightArm.rotation.x = -1.0 * s; break;                                     // reach down
        default:       rightArm.rotation.x = -2.3 * s;   // melee / unarmed swing
      }
      if (state.attackAnim === 0 && state.toolActive) showTool(false);
    } else {
      rightArm.rotation.x += (gait - rightArm.rotation.x) * gk;   // counter-swing with the gait
      if (!state.moving && Math.abs(rightArm.rotation.x) < 0.01) rightArm.rotation.x = 0;
    }

    if (state.attackCd > 0) state.attackCd = Math.max(0, state.attackCd - dt);
  }

  let camReady = false;
  const tmpTarget = new THREE.Vector3();
  function updateCamera(camera, dt) {
    const f = forwardVec();
    const px = group.position.x, py = group.position.y, pz = group.position.z;
    const dist = state.bounds ? 5.2 : CAM_DIST, ht = state.bounds ? 7.0 : CAM_HEIGHT, look = state.bounds ? 1.5 : CAM_LOOK;
    const dX = px - f.x * dist, dZ = pz - f.z * dist, dY = py + ht;
    if (!camReady) { camera.position.set(dX, dY, dZ); camReady = true; }
    else { const k = damp(6, dt); camera.position.x += (dX - camera.position.x) * k; camera.position.y += (dY - camera.position.y) * k; camera.position.z += (dZ - camera.position.z) * k; }
    tmpTarget.set(px + f.x * look, py + HEAD_Y, pz + f.z * look);
    camera.lookAt(tmpTarget);
  }

  // world position of the right hand (where projectiles launch from)
  const handWorld = new THREE.Vector3();
  function handPosition() { hand.getWorldPosition(handWorld); return handWorld; }

  return {
    group, state, update, updateCamera, impulseForward, impulseBack, impulseTurn, forwardVec,
    playAttack, playGather, refreshEquipment, weapon, handPosition,
    setBounds(b) { state.bounds = b; }, setSolids(s) { state.solids = s; }, snapCamera() { camReady = false; },
    get position() { return group.position; },
  };
}
