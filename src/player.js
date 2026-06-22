import * as THREE from 'three';
import { TAU, damp } from './util.js';
import { weaponOf } from './content.js';

const SPEED = 8.0;          // units/sec
const TURN = 2.4;           // rad/sec
const COAST_FWD = 0.42;
const COAST_TURN = 0.26;
const CAM_DIST = 9.5, CAM_HEIGHT = 5.2, CAM_LOOK = 3.0, HEAD_Y = 1.5;
const ATTACK_DUR = 0.34;

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
  body.add(mkBox(0.24, 0.7, 0.24, dark, -0.17, 0.35, 0));   // legs
  body.add(mkBox(0.24, 0.7, 0.24, dark, 0.17, 0.35, 0));
  body.add(mkBox(0.74, 0.82, 0.46, tunic, 0, 1.15, 0));      // torso
  body.add(mkBox(0.2, 0.62, 0.22, tunic, -0.5, 1.2, 0));     // left arm (static)
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), skin);
  head.position.set(0, 1.86, 0); body.add(head);
  body.add(mkBox(0.4, 0.12, 0.06, visorMat, 0, 1.9, 0.3));   // facing visor (+z)

  // armor overlay (shown when armor equipped)
  const armorMesh = mkBox(0.84, 0.9, 0.56, steel, 0, 1.15, 0); armorMesh.visible = false; body.add(armorMesh);

  // right arm: pivots at the shoulder so it can swing; holds the weapon
  const rightArm = new THREE.Group(); rightArm.position.set(0.5, 1.5, 0); body.add(rightArm);
  rightArm.add(mkBox(0.2, 0.62, 0.22, tunic, 0, -0.31, 0));  // upper arm
  const hand = new THREE.Group(); hand.position.set(0, -0.62, 0); rightArm.add(hand);
  hand.add(mkBox(0.18, 0.18, 0.18, skin, 0, 0, 0));          // fist
  const weaponHolder = new THREE.Group(); hand.add(weaponHolder);

  function clearHolder() { while (weaponHolder.children.length) weaponHolder.remove(weaponHolder.children[0]); }
  function setWeaponMesh(style) {
    clearHolder();
    if (style === 'melee') {
      weaponHolder.add(mkBox(0.09, 1.05, 0.14, steel, 0, -0.55, 0));   // blade hangs down from hand
      weaponHolder.add(mkBox(0.32, 0.1, 0.18, dark, 0, -0.02, 0));     // guard
    } else if (style === 'ranged') {
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 6, 10, Math.PI * 1.2), woodMat);
      bow.rotation.z = Math.PI / 2; bow.position.set(0, -0.1, 0.1); weaponHolder.add(bow);
    } else if (style === 'magic') {
      weaponHolder.add(mkBox(0.07, 1.2, 0.07, woodMat, 0, -0.5, 0));   // rod
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), orbMat); orb.position.set(0, -1.05, 0); weaponHolder.add(orb);
    }
    // unarmed: nothing — just the fist
  }

  // Stand on the plaza south of the village (clear of the hut ring), facing in.
  const sx = world.village.x, sz = world.village.z + 12;
  group.position.set(sx, world.height(sx, sz), sz);
  scene.add(group);

  const state = {
    heading: Math.PI,
    hp: 100, maxHp: 100,
    coastFwd: 0, coastTurn: 0, coastTurnDir: 0,
    moving: false, bob: 0,
    attackCd: 0, attackAnim: 0, attackStyle: 'unarmed',
    equipment: { weapon: null, armor: null },
    prayer: 30, maxPrayer: 30, activePrayer: null,
  };

  function weapon() { return weaponOf(state.equipment.weapon); }
  function refreshEquipment() {
    setWeaponMesh(weapon().style);
    armorMesh.visible = !!state.equipment.armor;
  }
  refreshEquipment();

  const forwardVec = () => ({ x: Math.sin(state.heading), z: Math.cos(state.heading) });
  const impulseForward = () => { state.coastFwd = COAST_FWD; };
  const impulseTurn = (dir) => { state.coastTurnDir = dir; state.coastTurn = COAST_TURN; };
  function playAttack(style) { state.attackStyle = style || weapon().style; state.attackAnim = ATTACK_DUR; }

  function tryMove(dt) {
    const f = forwardVec();
    const step = SPEED * dt;
    const x = group.position.x, z = group.position.z;
    const nx = x + f.x * step, nz = z + f.z * step;
    if (world.isWalkable(nx, nz)) { group.position.x = nx; group.position.z = nz; }
    else if (world.isWalkable(nx, z)) { group.position.x = nx; }
    else if (world.isWalkable(x, nz)) { group.position.z = nz; }
  }

  function update(dt, input) {
    let turn = 0;
    if (input.keys.has('left')) turn -= 1;
    if (input.keys.has('right')) turn += 1;
    if (turn === 0 && state.coastTurn > 0) turn = state.coastTurnDir;
    state.coastTurn = Math.max(0, state.coastTurn - dt);
    state.heading += turn * TURN * dt;
    if (state.heading > Math.PI) state.heading -= TAU;
    if (state.heading < -Math.PI) state.heading += TAU;

    const walking = input.keys.has('up') || state.coastFwd > 0;
    state.coastFwd = Math.max(0, state.coastFwd - dt);
    state.moving = walking;
    if (walking) tryMove(dt);

    group.position.y = world.height(group.position.x, group.position.z);
    group.rotation.y = state.heading;
    if (walking) { state.bob += dt * 11; body.position.y = Math.abs(Math.sin(state.bob)) * 0.08; }
    else { body.position.y *= (1 - damp(8, dt)); }

    // attack animation
    if (state.attackAnim > 0) {
      state.attackAnim = Math.max(0, state.attackAnim - dt);
      const t = 1 - state.attackAnim / ATTACK_DUR;
      const s = Math.sin(t * Math.PI);
      if (state.attackStyle === 'ranged') rightArm.rotation.x = -1.2 - 0.5 * s;
      else if (state.attackStyle === 'magic') rightArm.rotation.x = -1.5 - 0.4 * s;
      else rightArm.rotation.x = -2.3 * s;   // melee / unarmed swing
    } else if (rightArm.rotation.x !== 0) {
      rightArm.rotation.x *= (1 - damp(12, dt));
      if (Math.abs(rightArm.rotation.x) < 0.01) rightArm.rotation.x = 0;
    }

    if (state.attackCd > 0) state.attackCd = Math.max(0, state.attackCd - dt);
  }

  let camReady = false;
  const tmpTarget = new THREE.Vector3();
  function updateCamera(camera, dt) {
    const f = forwardVec();
    const px = group.position.x, py = group.position.y, pz = group.position.z;
    const dX = px - f.x * CAM_DIST, dZ = pz - f.z * CAM_DIST, dY = py + CAM_HEIGHT;
    if (!camReady) { camera.position.set(dX, dY, dZ); camReady = true; }
    else { const k = damp(6, dt); camera.position.x += (dX - camera.position.x) * k; camera.position.y += (dY - camera.position.y) * k; camera.position.z += (dZ - camera.position.z) * k; }
    tmpTarget.set(px + f.x * CAM_LOOK, py + HEAD_Y, pz + f.z * CAM_LOOK);
    camera.lookAt(tmpTarget);
  }

  // world position of the right hand (where projectiles launch from)
  const handWorld = new THREE.Vector3();
  function handPosition() { hand.getWorldPosition(handWorld); return handWorld; }

  return {
    group, state, update, updateCamera, impulseForward, impulseTurn, forwardVec,
    playAttack, refreshEquipment, weapon, handPosition,
    get position() { return group.position; },
  };
}
