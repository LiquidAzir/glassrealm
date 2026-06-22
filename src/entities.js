import * as THREE from 'three';
import { NPCS, ENEMIES, ENEMY_SPAWNS } from './content.js';
import { TAU, dist2D } from './util.js';

function makeNpc(def, world) {
  const g = new THREE.Group();
  const robe = new THREE.MeshLambertMaterial({ color: def.color, flatShading: true });
  const skin = new THREE.MeshLambertMaterial({ color: 0xf2c79a, flatShading: true });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 7), robe); body.position.y = 0.8; g.add(body);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), skin); head.position.y = 1.85; g.add(head);
  g.position.set(def.pos.x, world.height(def.pos.x, def.pos.z), def.pos.z);
  g.rotation.y = Math.atan2(world.village.x - def.pos.x, world.village.z - def.pos.z);
  return g;
}

function makeBoar(def) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: def.color, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x3a2a20, flatShading: true });
  const part = (geo, m, x, y, z) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); g.add(mesh); };
  part(new THREE.BoxGeometry(1.5, 0.9, 0.9), mat, 0, 0.75, 0);    // body
  part(new THREE.BoxGeometry(0.7, 0.7, 0.75), mat, 0.9, 0.6, 0);  // head
  part(new THREE.BoxGeometry(0.35, 0.3, 0.55), dark, 1.3, 0.45, 0); // snout
  [[-0.5, 0.35], [0.5, 0.35], [-0.5, -0.35], [0.5, -0.35]].forEach(([x, z]) => part(new THREE.BoxGeometry(0.2, 0.7, 0.2), dark, x, 0.35, z));
  return g;
}

export function createEntities(scene, world, G) {
  const npcs = NPCS.map((def) => {
    const group = makeNpc(def, world);
    scene.add(group);
    return { def, group, kind: 'npc', get pos() { return group.position; } };
  });

  const enemies = [];
  function spawnBoar(x, z) {
    const def = ENEMIES.boar;
    const group = makeBoar(def);
    group.position.set(x, world.height(x, z), z);
    scene.add(group);
    const e = {
      def, group, kind: 'enemy', enemyKey: 'boar',
      hp: def.hp, maxHp: def.hp, alive: true, state: 'wander',
      home: { x, z }, heading: Math.random() * TAU, wanderT: 0, moving: false,
      attackCd: 0, hurtFlash: 0, respawn: 0,
      get pos() { return group.position; },
    };
    enemies.push(e);
    return e;
  }
  ENEMY_SPAWNS.forEach((s) => spawnBoar(s.x, s.z));

  function update(dt, player) {
    for (const e of enemies) {
      if (!e.alive) {
        e.respawn -= dt;
        if (e.respawn <= 0) {
          e.hp = e.maxHp; e.alive = true; e.state = 'wander'; e.group.visible = true;
          e.hurtFlash = 0; e.group.scale.setScalar(1);
          e.group.position.set(e.home.x, world.height(e.home.x, e.home.z), e.home.z);
        }
        continue;
      }
      if (e.hurtFlash > 0) e.hurtFlash -= dt;
      const d = dist2D(e.pos.x, e.pos.z, player.position.x, player.position.z);
      if (player.state.hp > 0 && d < e.def.aggro) e.state = 'chase';
      else if (d > e.def.aggro * 1.7) e.state = 'wander';

      if (e.state === 'chase') {
        e.heading = Math.atan2(player.position.x - e.pos.x, player.position.z - e.pos.z);
        if (d > 1.7) {
          const nx = e.pos.x + Math.sin(e.heading) * e.def.speed * dt;
          const nz = e.pos.z + Math.cos(e.heading) * e.def.speed * dt;
          if (world.isWalkable(nx, nz)) { e.group.position.x = nx; e.group.position.z = nz; }
        } else {
          e.attackCd -= dt;
          if (e.attackCd <= 0) { e.attackCd = 1.3; G.damagePlayer(e.def.dmg, e); }
        }
      } else {
        e.wanderT -= dt;
        if (e.wanderT <= 0) { e.wanderT = 1 + Math.random() * 2.5; e.heading = Math.random() * TAU; e.moving = Math.random() > 0.45; }
        if (e.moving) {
          const sp = e.def.speed * 0.4;
          const nx = e.pos.x + Math.sin(e.heading) * sp * dt;
          const nz = e.pos.z + Math.cos(e.heading) * sp * dt;
          if (world.isWalkable(nx, nz) && dist2D(nx, nz, e.home.x, e.home.z) < 16) { e.group.position.x = nx; e.group.position.z = nz; }
          else e.wanderT = 0;
        }
      }
      e.group.position.y = world.height(e.pos.x, e.pos.z);
      e.group.rotation.y = e.heading;
      e.group.scale.setScalar(e.hurtFlash > 0 ? 1.14 : 1);
    }
  }

  function damageEnemy(e, amount) {
    if (!e.alive) return false;
    e.hp -= amount; e.hurtFlash = 0.2;
    if (e.hp <= 0) {
      e.alive = false; e.group.visible = false; e.respawn = 18;
      if (G.onEnemyKilled) G.onEnemyKilled(e);
      return true;
    }
    return false;
  }

  return { npcs, enemies, update, damageEnemy, spawnBoar };
}
