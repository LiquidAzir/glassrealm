import * as THREE from 'three';

// Tiny 3D particle bursts — wood/rock chips, water splashes, heal/level sparkles,
// enemy death poofs. One shared geometry + per-colour cached materials; particles
// shrink out over their life (no per-instance opacity needed), fall under gravity.
// PERF: mesh pool avoids constant new Mesh() + scene.add/remove churn.
export function createFx(scene) {
  const parts = [];
  const geo = new THREE.IcosahedronGeometry(0.14, 0);
  const matCache = {};
  const matFor = (c) => matCache[c] || (matCache[c] = new THREE.MeshBasicMaterial({ color: c }));

  // mesh pool: reuse dead particle meshes instead of creating new ones
  const pool = [];
  const MAX_PARTICLES = 120;   // hard cap — glasses can't handle hundreds of live particles
  function getMesh(mat) {
    if (pool.length > 0) {
      const m = pool.pop();
      m.material = mat;
      m.visible = true;
      return m;
    }
    const m = new THREE.Mesh(geo, mat);
    scene.add(m);
    return m;
  }
  function releaseMesh(m) {
    m.visible = false;
    pool.push(m);
  }

  function burst(x, y, z, color, opts = {}) {
    const n = opts.n || 8, spread = opts.spread || 3.0, up = opts.up || 3.0, life = opts.life || 0.6, size = opts.size || 1;
    const mat = matFor(color);
    // cap total live particles
    const avail = MAX_PARTICLES - parts.length;
    const count = Math.min(n, avail);
    for (let i = 0; i < count; i++) {
      const m = getMesh(mat);
      m.position.set(x, y, z); m.scale.setScalar(size * (0.6 + Math.random() * 0.9));
      const a = Math.random() * Math.PI * 2, r = Math.random() * spread;
      parts.push({ m, vx: Math.cos(a) * r, vy: up * (0.45 + Math.random() * 0.85), vz: Math.sin(a) * r, t: 0, life });
    }
  }

  function update(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt; p.vy -= 13 * dt;
      p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      p.m.scale.multiplyScalar(1 - Math.min(1, dt * 4.5));
      if (p.t >= p.life) { releaseMesh(p.m); parts.splice(i, 1); }
    }
  }

  return { burst, update };
}
