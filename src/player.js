import * as THREE from 'three';
import { TAU, damp } from './util.js';

const SPEED = 8.0;          // units/sec
const TURN = 2.4;           // rad/sec
const COAST_FWD = 0.42;     // s a single forward swipe keeps you walking
const COAST_TURN = 0.26;    // s a single turn swipe keeps rotating
const CAM_DIST = 9.5, CAM_HEIGHT = 5.2, CAM_LOOK = 3.0, HEAD_Y = 1.5;

export function createPlayer(scene, world) {
  const group = new THREE.Group();
  const body = new THREE.Group();      // bobs while walking; keeps ground calc clean
  group.add(body);

  const tunic = new THREE.MeshLambertMaterial({ color: 0x36d1c4, flatShading: true });
  const skin = new THREE.MeshLambertMaterial({ color: 0xf2c79a, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x2a3340, flatShading: true });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x9bf2ff });

  const mkBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
  body.add(mkBox(0.24, 0.7, 0.24, dark, -0.17, 0.35, 0));   // legs
  body.add(mkBox(0.24, 0.7, 0.24, dark, 0.17, 0.35, 0));
  body.add(mkBox(0.74, 0.82, 0.46, tunic, 0, 1.15, 0));      // torso
  body.add(mkBox(0.2, 0.62, 0.22, tunic, -0.5, 1.2, 0));     // arms
  body.add(mkBox(0.2, 0.62, 0.22, tunic, 0.5, 1.2, 0));
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), skin);
  head.position.set(0, 1.86, 0); body.add(head);
  body.add(mkBox(0.4, 0.12, 0.06, visorMat, 0, 1.9, 0.3));   // facing visor (+z)

  // Stand on the plaza south of the village (clear of the hut ring), facing in.
  const sx = world.village.x, sz = world.village.z + 12;
  group.position.set(sx, world.height(sx, sz), sz);
  scene.add(group);

  const state = {
    heading: Math.PI,        // face toward village (north, -z)
    hp: 100, maxHp: 100,
    coastFwd: 0, coastTurn: 0, coastTurnDir: 0,
    moving: false, bob: 0,
    attackCd: 0,
    weaponTier: 0,
  };

  function forwardVec() { return { x: Math.sin(state.heading), z: Math.cos(state.heading) }; }

  function impulseForward() { state.coastFwd = COAST_FWD; }
  function impulseTurn(dir) { state.coastTurnDir = dir; state.coastTurn = COAST_TURN; }

  function tryMove(dt) {
    const f = forwardVec();
    const step = SPEED * dt;
    const x = group.position.x, z = group.position.z;
    const nx = x + f.x * step, nz = z + f.z * step;
    if (world.isWalkable(nx, nz)) { group.position.x = nx; group.position.z = nz; }
    else if (world.isWalkable(nx, z)) { group.position.x = nx; }      // slide along shore
    else if (world.isWalkable(x, nz)) { group.position.z = nz; }
  }

  function update(dt, input) {
    // turn (held keys or coast from a discrete swipe)
    let turn = 0;
    if (input.keys.has('left')) turn -= 1;
    if (input.keys.has('right')) turn += 1;
    if (turn === 0 && state.coastTurn > 0) turn = state.coastTurnDir;
    state.coastTurn = Math.max(0, state.coastTurn - dt);
    state.heading += turn * TURN * dt;
    if (state.heading > Math.PI) state.heading -= TAU;
    if (state.heading < -Math.PI) state.heading += TAU;

    // walk (held or coast)
    const walking = input.keys.has('up') || state.coastFwd > 0;
    state.coastFwd = Math.max(0, state.coastFwd - dt);
    state.moving = walking;
    if (walking) tryMove(dt);

    // sit on the ground; bob while walking
    group.position.y = world.height(group.position.x, group.position.z);
    group.rotation.y = state.heading;
    if (walking) { state.bob += dt * 11; body.position.y = Math.abs(Math.sin(state.bob)) * 0.08; }
    else { body.position.y *= (1 - damp(8, dt)); }

    if (state.attackCd > 0) state.attackCd = Math.max(0, state.attackCd - dt);
  }

  let camReady = false;
  const tmpTarget = new THREE.Vector3();
  function updateCamera(camera, dt) {
    const f = forwardVec();
    const px = group.position.x, py = group.position.y, pz = group.position.z;
    const desiredX = px - f.x * CAM_DIST;
    const desiredZ = pz - f.z * CAM_DIST;
    const desiredY = py + CAM_HEIGHT;
    if (!camReady) { camera.position.set(desiredX, desiredY, desiredZ); camReady = true; }
    else {
      const k = damp(6, dt);
      camera.position.x += (desiredX - camera.position.x) * k;
      camera.position.y += (desiredY - camera.position.y) * k;
      camera.position.z += (desiredZ - camera.position.z) * k;
    }
    tmpTarget.set(px + f.x * CAM_LOOK, py + HEAD_Y, pz + f.z * CAM_LOOK);
    camera.lookAt(tmpTarget);
  }

  return { group, state, update, updateCamera, impulseForward, impulseTurn, forwardVec,
    get position() { return group.position; } };
}
