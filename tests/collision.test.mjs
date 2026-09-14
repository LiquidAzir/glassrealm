import test from 'node:test';
import assert from 'node:assert/strict';
import { moveAndSlide, segmentCircleBlocked } from '../src/collision.js';

const near = (a, b, tolerance = .005) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);
const wall = (nx, nz, limit) => {
  const stand = (x, z) => x * nx + z * nz <= limit;
  return [stand, (ax, az, bx, bz) => stand(ax, az) && stand(bx, bz)];
};

test('open-ground distance is preserved in every heading, including negative coordinates', () => {
  for (let i = 0; i < 72; i++) {
    const dx = Math.sin(i) * .4, dz = Math.cos(i) * .4;
    const p = moveAndSlide(-12, -19, dx, dz, () => true, () => true);
    near(p.x, -12 + dx); near(p.z, -19 + dz); near(p.distance, .4);
    assert.equal(p.blocked, false);
  }
});

test('holding directly into a wall stops without backward or sideways escapes', () => {
  const checks = wall(1, 0, 1);
  let p = { x: 0, z: 0 };
  for (let i = 0; i < 200; i++) {
    const next = moveAndSlide(p.x, p.z, .4, 0, ...checks);
    assert.ok(next.x >= p.x - 1e-9);
    assert.ok(next.x <= 1); near(next.z, 0, 1e-9);
    p = next;
  }
  near(p.x, 1);
});

test('oblique input follows a wall without exceeding requested speed', () => {
  for (const angle of [0, Math.PI / 4, Math.PI / 2, 2.1]) {
    const nx = Math.cos(angle), nz = Math.sin(angle), tx = -nz, tz = nx;
    const checks = wall(nx, nz, 1);
    let p = { x: 0, z: 0 };
    for (let i = 0; i < 100; i++) {
      const dx = nx * .1 + tx * .1, dz = nz * .1 + tz * .1;
      const next = moveAndSlide(p.x, p.z, dx, dz, ...checks);
      assert.ok(checks[0](next.x, next.z));
      assert.ok((next.x - p.x) * dx + (next.z - p.z) * dz >= -1e-8);
      assert.ok(next.distance <= Math.hypot(dx, dz) + 1e-8);
      p = next;
    }
    assert.ok(p.x * tx + p.z * tz > 8, `wall slide stalled at angle ${angle}`);
  }
});

test('corners stay stable and releasing or reversing input works immediately', () => {
  const stand = (x, z) => x <= 1 && z <= 1;
  const sweep = (ax, az, bx, bz) => stand(ax, az) && stand(bx, bz);
  let p = { x: 0, z: 0 };
  for (let i = 0; i < 100; i++) p = moveAndSlide(p.x, p.z, .2, .2, stand, sweep);
  near(p.x, 1); near(p.z, 1);
  const idle = moveAndSlide(p.x, p.z, 0, 0, stand, sweep);
  near(idle.x, p.x); near(idle.z, p.z);
  const reverse = moveAndSlide(p.x, p.z, -.2, -.2, stand, sweep);
  near(reverse.x, p.x - .2); near(reverse.z, p.z - .2);
});

test('sweeps catch thin and grazing obstacles even when both endpoints are clear', () => {
  assert.equal(segmentCircleBlocked(-1, 0, 1, 0, 0, 0, .001), true);
  assert.equal(segmentCircleBlocked(-1, .27999, 1, .27999, 0, 0, .28), true);
  assert.equal(segmentCircleBlocked(-1, .281, 1, .281, 0, 0, .28), false);
  const stand = (x, z) => !segmentCircleBlocked(x, z, x, z, 0, 0, .28);
  const sweep = (ax, az, bx, bz) => !segmentCircleBlocked(ax, az, bx, bz, 0, 0, .28);
  const p = moveAndSlide(-1, 0, 2, 0, stand, sweep);
  assert.ok(p.x <= -.28); near(p.z, 0);
});

test('same route with 16ms and 50ms updates has the same wall destination', () => {
  const checks = wall(1, 0, 1);
  const run = (dt, n) => {
    let p = { x: 0, z: 0 };
    for (let i = 0; i < n; i++) p = moveAndSlide(p.x, p.z, dt * 4, dt * 4, ...checks);
    return p;
  };
  const a = run(.016, 125), b = run(.05, 40);
  near(a.x, b.x, .01); near(a.z, b.z, .08);
});

test('sliding around a free wall end restores forward movement', () => {
  // The wall blocks x > 1 only below its free end at z = 1.
  const stand = (x, z) => x <= 1 || z >= 1;
  const sweep = (ax, az, bx, bz) => {
    for (let i = 0; i <= 64; i++) if (!stand(ax + (bx - ax) * i / 64, az + (bz - az) * i / 64)) return false;
    return true;
  };
  let p = { x: 0, z: 0 };
  for (let i = 0; i < 60; i++) p = moveAndSlide(p.x, p.z, .1, .04, stand, sweep);
  assert.ok(p.x > 3.5 && p.z > 2.2, `stuck at wall end: ${JSON.stringify(p)}`);
});

test('narrow angled passages preserve tangent movement', () => {
  for (const angle of [0, .27, 1.1, 2.8]) {
    const nx = Math.cos(angle), nz = Math.sin(angle), tx = -nz, tz = nx;
    // Clearance after inflating the walls by the player's radius is only 2cm.
    const stand = (x, z) => Math.abs(x * nx + z * nz) <= .01 + 1e-12;
    const sweep = (ax, az, bx, bz) => stand(ax, az) && stand(bx, bz);
    let p = { x: 0, z: 0 };
    for (let i = 0; i < 1000; i++) p = moveAndSlide(p.x, p.z, nx * .04 + tx * .08, nz * .04 + tz * .08, stand, sweep);
    assert.ok(stand(p.x, p.z));
    assert.ok(p.x * tx + p.z * tz > 79, `corridor stalled at angle ${angle}`);
  }
});

test('random round-obstacle trajectories remain clear and never move against intent', () => {
  const obstacles = [{ x: -1, z: 0, r: .7 }, { x: 1, z: 1, r: .9 }, { x: 0, z: -2, r: .4 }];
  const sweep = (ax, az, bx, bz) => !obstacles.some(o => segmentCircleBlocked(ax, az, bx, bz, o.x, o.z, o.r));
  const stand = (x, z) => sweep(x, z, x, z);
  let p = { x: -3, z: -3 }, seed = 8123;
  for (let i = 0; i < 3000; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const a = seed / 2 ** 32 * Math.PI * 2, dx = Math.sin(a) * .4, dz = Math.cos(a) * .4;
    const q = moveAndSlide(p.x, p.z, dx, dz, stand, sweep);
    assert.ok(stand(q.x, q.z));
    assert.ok((q.x - p.x) * dx + (q.z - p.z) * dz >= -1e-8);
    assert.ok(q.distance <= .40000001);
    p = q;
  }
});
