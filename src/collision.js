// Movement is resolved in short swept segments. A blocked step spends its remaining
// distance along the local boundary; it never invents a backward escape movement.
const MAX_STEP = .12;
const EPS = 1e-6;
function contactNormal(x, z, canStand, radius) {
  const blocked = a => !canStand(x + Math.cos(a) * radius, z + Math.sin(a) * radius);
  let previous = blocked(0), start = 0, nx = 0, nz = 0;
  for (let i = 1; i <= 16; i++) {
    const end = i * Math.PI / 8, current = blocked(end);
    if (current !== previous) {
      let lo = end - Math.PI / 8, hi = end;
      for (let j = 0; j < 10; j++) {
        const mid = (lo + hi) / 2;
        if (blocked(mid) === previous) lo = mid; else hi = mid;
      }
      const boundary = (lo + hi) / 2;
      if (previous) { nx += Math.sin(boundary) - Math.sin(start); nz += Math.cos(start) - Math.cos(boundary); }
      start = boundary;
      previous = current;
    }
    if (i === 16 && current) { nx += Math.sin(end) - Math.sin(start); nz += Math.cos(start) - Math.cos(end); }
  }
  const norm = Math.hypot(nx, nz);
  return norm < EPS ? null : { x: nx / norm, z: nz / norm };
}

export function segmentCircleBlocked(ax, az, bx, bz, cx, cz, radius) {
  const dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  const t = len2 ? Math.max(0, Math.min(1, ((cx - ax) * dx + (cz - az) * dz) / len2)) : 0;
  return (ax + dx * t - cx) ** 2 + (az + dz * t - cz) ** 2 < radius * radius;
}

export function moveAndSlide(x, z, dx, dz, canStand, canTraverse) {
  if (![x, z, dx, dz].every(Number.isFinite)) return { x, z, blocked: true, distance: 0 };
  const startX = x, startZ = z, length = Math.hypot(dx, dz);
  if (length < EPS || !canStand(x, z)) return { x, z, blocked: length > EPS, distance: 0 };
  // The caller caps elapsed simulation time. This cap also bounds accidental long
  // debug calls, without increasing step size and tunnelling through obstacles.
  const steps = Math.min(512, Math.ceil(length / MAX_STEP));
  const scale = Math.min(1, 512 * MAX_STEP / length);
  const sx = dx * scale / steps, sz = dz * scale / steps;
  let blocked = false;
  function travel(vx, vz) {
    if (canTraverse(x, z, x + vx, z + vz)) { x += vx; z += vz; return 1; }
    let lo = 0, hi = 1;
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2;
      if (canTraverse(x, z, x + vx * mid, z + vz * mid)) lo = mid; else hi = mid;
    }
    x += vx * lo; z += vz * lo;
    return lo;
  }
  for (let i = 0; i < steps; i++) {
    const fraction = travel(sx, sz);
    if (fraction === 1) continue;
    blocked = true;
    // Refine the boundary directions so oblique walls slide just as smoothly as
    // axis-aligned ones. The tiny clearance below prevents rounding into the wall.
    let tangent = null;
    // A broad probe can see past a free corner or the opposite wall of a narrow
    // corridor. Refine locally if that proposed tangent is itself obstructed.
    for (const radius of [.055, .006, .0003]) {
      const normal = contactNormal(x, z, canStand, radius);
      if (!normal) continue;
      const nx = normal.x, nz = normal.z, into = sx * nx + sz * nz;
      if (into <= 0) continue;
      const tx = (sx - nx * into) * (1 - fraction) - nx * .00004, tz = (sz - nz * into) * (1 - fraction) - nz * .00004;
      // Head-on input should stop, including tiny floating-point tangent residues.
      if (Math.hypot(tx, tz) < .002 || tx * sx + tz * sz <= EPS) continue;
      tangent = { x: tx, z: tz };
      if (canTraverse(x, z, x + tx, z + tz)) break;
    }
    if (tangent) travel(tangent.x, tangent.z);
  }
  return { x, z, blocked, distance: Math.hypot(x - startX, z - startZ) };
}
