import * as THREE from 'three';
import { NPCS, ENEMIES, ENEMY_SPAWNS } from './content.js';
import { TAU, dist2D } from './util.js';

const DEATH_DUR = 0.55;   // topple/shrink/sink before the corpse vanishes
const ATK_ANIM = 0.3;     // forward-lean bite when an enemy strikes

function makeNpc(def, world) {
  const g = new THREE.Group();
  const robe = new THREE.MeshLambertMaterial({ color: def.color, flatShading: true });
  const skin = new THREE.MeshLambertMaterial({ color: 0xf2c79a, flatShading: true });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 7), robe); body.position.y = 0.8; g.add(body);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), skin); head.position.y = 1.85; g.add(head);
  g.position.set(def.pos.x, world.height(def.pos.x, def.pos.z), def.pos.z);
  let nv = world.villages[0], best = Infinity;
  for (const v of world.villages) { const d = (v.x - def.pos.x) ** 2 + (v.z - def.pos.z) ** 2; if (d < best) { best = d; nv = v; } }
  g.rotation.y = Math.atan2(nv.x - def.pos.x, nv.z - def.pos.z);
  return g;
}

function makeBeast(def) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: def.color, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x3a2a20, flatShading: true });
  const part = (geo, m, x, y, z) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); g.add(mesh); };
  part(new THREE.BoxGeometry(1.5, 0.9, 0.9), mat, 0, 0.75, 0);    // body
  part(new THREE.BoxGeometry(0.7, 0.7, 0.75), mat, 0.9, 0.6, 0);  // head
  part(new THREE.BoxGeometry(0.35, 0.3, 0.55), dark, 1.3, 0.45, 0); // snout
  [[-0.5, 0.35], [0.5, 0.35], [-0.5, -0.35], [0.5, -0.35]].forEach(([x, z]) => part(new THREE.BoxGeometry(0.2, 0.7, 0.2), dark, x, 0.35, z));
  g.scale.setScalar(def.scale || 1);
  return g;
}

function makeHumanoid(def) {
  const g = new THREE.Group();
  const robe = new THREE.MeshLambertMaterial({ color: def.color, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x2a2330, flatShading: true });
  const skin = new THREE.MeshLambertMaterial({ color: 0xd9a273, flatShading: true });
  const steel = new THREE.MeshLambertMaterial({ color: 0xb9c2cc, flatShading: true });
  const part = (geo, m, x, y, z) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); g.add(mesh); };
  part(new THREE.BoxGeometry(0.24, 0.7, 0.24), dark, -0.17, 0.35, 0);
  part(new THREE.BoxGeometry(0.24, 0.7, 0.24), dark, 0.17, 0.35, 0);
  part(new THREE.BoxGeometry(0.74, 0.82, 0.42), robe, 0, 1.15, 0);
  part(new THREE.IcosahedronGeometry(0.3, 0), skin, 0, 1.8, 0);
  part(new THREE.BoxGeometry(0.12, 0.95, 0.12), steel, 0.52, 1.2, 0.18); // blade
  g.scale.setScalar(def.scale || 1);
  return g;
}

const makeEnemyMesh = (def) => (def.shape === 'humanoid' ? makeHumanoid(def) : makeBeast(def));

export function createEntities(scene, world, G) {
  let T = 0;
  const npcs = NPCS.map((def) => {
    const group = makeNpc(def, world);
    scene.add(group);
    return { def, group, kind: 'npc', baseRot: group.rotation.y, phase: Math.random() * TAU, get pos() { return group.position; } };
  });

  const enemies = [];
  function spawnEnemy(key, x, z) {
    const def = ENEMIES[key];
    const group = makeEnemyMesh(def);
    group.position.set(x, world.height(x, z), z);
    scene.add(group);
    const e = {
      def, group, kind: 'enemy', enemyKey: key,
      hp: def.hp, maxHp: def.hp, alive: true, state: 'wander',
      home: { x, z }, heading: Math.random() * TAU, wanderT: 0, moving: false,
      attackCd: 0, hurtFlash: 0, respawn: 0, baseScale: def.scale || 1, leash: def.boss ? 26 : 16,
      dying: 0, deathY: 0, atkAnim: 0, walkPhase: Math.random() * TAU,
      get pos() { return group.position; },
    };
    enemies.push(e);
    return e;
  }
  ENEMY_SPAWNS.forEach((s) => spawnEnemy(s.enemy, s.x, s.z));

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
          e.hp = e.maxHp; e.alive = true; e.state = 'wander'; e.group.visible = true;
          e.hurtFlash = 0; e.atkAnim = 0; e.group.rotation.x = 0; e.group.rotation.z = 0; e.group.scale.setScalar(e.baseScale);
          e.group.position.set(e.home.x, world.height(e.home.x, e.home.z), e.home.z);
        }
        continue;
      }
      if (e.hurtFlash > 0) e.hurtFlash -= dt;
      if (e.atkAnim > 0) e.atkAnim -= dt;
      const d = dist2D(e.pos.x, e.pos.z, player.position.x, player.position.z);
      if (d > 70) { e.group.rotation.z = 0; continue; }   // cull far-away AI — perf with 50+ spawns
      if (player.state.hp > 0 && d < e.def.aggro) e.state = 'chase';
      else if (d > e.def.aggro * 1.7) e.state = 'wander';

      let moving = false;
      if (e.state === 'chase') {
        e.heading = Math.atan2(player.position.x - e.pos.x, player.position.z - e.pos.z);
        if (d > 1.7) {
          const nx = e.pos.x + Math.sin(e.heading) * e.def.speed * dt;
          const nz = e.pos.z + Math.cos(e.heading) * e.def.speed * dt;
          if (world.isWalkable(nx, nz)) { e.group.position.x = nx; e.group.position.z = nz; moving = true; }
        } else {
          e.attackCd -= dt;
          if (e.attackCd <= 0) { e.attackCd = 1.3; e.atkAnim = ATK_ANIM; G.damagePlayer(e.def.dmg, e); }
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
      // walk waddle + attack lean
      if (moving) { e.walkPhase += dt * 9; e.group.rotation.z = Math.sin(e.walkPhase) * 0.12; }
      else e.group.rotation.z *= (1 - Math.min(1, dt * 8));
      e.group.rotation.x = e.atkAnim > 0 ? -0.5 * Math.sin((1 - e.atkAnim / ATK_ANIM) * Math.PI) : e.group.rotation.x * (1 - Math.min(1, dt * 10));
      e.group.scale.setScalar((e.hurtFlash > 0 ? 1.14 : 1) * e.baseScale);
    }
    // NPC idle — gentle sway, and turn to face the player when close
    for (const n of npcs) {
      const d = dist2D(n.pos.x, n.pos.z, player.position.x, player.position.z);
      const target = d < 7 ? Math.atan2(player.position.x - n.pos.x, player.position.z - n.pos.z) : n.baseRot;
      let dy = target - n.group.rotation.y; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU;
      n.group.rotation.y += dy * Math.min(1, dt * 6);
      n.group.rotation.z = Math.sin(T * 1.4 + n.phase) * 0.035;
    }
  }

  function damageEnemy(e, amount) {
    if (!e.alive) return false;
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
    for (const e of enemies) e.group.visible = flag ? false : e.alive;
  }

  return { npcs, enemies, update, damageEnemy, spawnEnemy, setHidden };
}
