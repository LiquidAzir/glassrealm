import * as THREE from 'three';

// Lightweight projectiles for ranged (arrow) and magic (bolt) attacks. Each flies
// from origin to target over a short duration, then fires its onHit callback.
export function createProjectiles(scene) {
  const list = [];
  const arrowGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 5);
  const boltGeo = new THREE.IcosahedronGeometry(0.22, 0);
  const arrowMat = new THREE.MeshLambertMaterial({ color: 0xddc070, flatShading: true });
  const boltMat = new THREE.MeshBasicMaterial({ color: 0x9b6bff });
  const tmp = new THREE.Vector3();

  function spawn(style, from, to, onHit) {
    const mesh = style === 'magic' ? new THREE.Mesh(boltGeo, boltMat) : new THREE.Mesh(arrowGeo, arrowMat);
    mesh.position.copy(from);
    scene.add(mesh);
    const dur = Math.min(0.5, Math.max(0.12, from.distanceTo(to) / 45));
    list.push({ mesh, from: from.clone(), to: to.clone(), t: 0, dur, onHit, style });
  }

  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.t += dt / p.dur;
      tmp.copy(p.from).lerp(p.to, Math.min(1, p.t));
      p.mesh.position.copy(tmp);
      if (p.style === 'magic') p.mesh.rotation.y += dt * 8;
      else { p.mesh.lookAt(p.to); p.mesh.rotateX(Math.PI / 2); }
      if (p.t >= 1) { scene.remove(p.mesh); if (p.onHit) p.onHit(); list.splice(i, 1); }
    }
  }

  return { spawn, update };
}
