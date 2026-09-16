import * as THREE from 'three';

// Original, texture-free tools. Grip is local origin; the haft rises along +Y
// and the working edge reaches +Z. Each cached rig is for one holder at a time.
// All geometry is authored numerically: no terrain/game RNG or animation state.
const METALS = [0, 0xdbac68, 0xa4adb7, 0xdbe5e7, 0x74a5e0, 0x79ba8e, 0x7ddedf];
const SPECS = {
  hatchet: { contact: [0, .84, .41] },
  pickaxe: { contact: [0, .56, .59] },
  rod: { contact: [0, .40, .69], lineTip: [0, 1.19, .22] },
  harpoon: { contact: [0, 1.55, .25] },
  ladle: { contact: [0, .995, .25] },
  hammer: { contact: [0, .85, .255] },
};
const INFO = Object.fromEntries(Object.entries(SPECS).map(([kind, spec]) => [kind, {
  kind, grip: [0, 0, 0], offhandGrip: [0, .22, 0], lowerGrip: [0, -.16, 0], ...spec,
}]));
const WOOD = 0xa36d37, WRAP = 0x594534, LIGHT_WOOD = 0xc18b4b;
const linear = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;

// Append directly into two triangle batches. Surface facets carry gentle baked
// shading; the existing scene's Lambert light supplies the remaining depth.
function batch() {
  const position = [], color = [];
  function tri(a, b, c, hex, gain = 1) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);
    if (length < 1e-10) return;
    const shade = gain * (.80 + .20 * Math.max(0, (nx * -.36 + ny * .82 + nz * .44) / length));
    const rgb = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map(v => linear(v / 255) * shade);
    for (const p of [a, b, c]) { position.push(...p); color.push(...rgb); }
  }
  const quad = (a, b, c, d, hex, gain) => { tri(a, b, c, hex, gain); tri(a, c, d, hex, gain); };
  function geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
    g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }
  return { tri, quad, geometry };
}

function connectRings(out, rings, hex, cap = true, gain = 1) {
  const sides = rings[0].length;
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    out.quad(rings[r][i], rings[r][j], rings[r + 1][j], rings[r + 1][i], hex, gain);
  }
  if (cap) {
    for (let i = 1; i < sides - 1; i++) {
      out.tri(rings[0][0], rings[0][i + 1], rings[0][i], hex, gain);
      const end = rings[rings.length - 1]; out.tri(end[0], end[i], end[i + 1], hex, gain);
    }
  }
}

// Cross sections are perpendicular to a path in Y/Z. Tapered zero-radius ends
// form actual points; degenerate faces are discarded by the triangle writer.
function tube(out, points, hex, sides = 6, cap = true) {
  const rings = points.map((p, i) => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const ty = (b[0] - a[0]) / length, tz = (b[1] - a[1]) / length;
    return Array.from({ length: sides }, (_, k) => {
      const angle = k / sides * Math.PI * 2;
      return [Math.cos(angle) * p[2], p[0] + Math.sin(angle) * p[3] * tz, p[1] - Math.sin(angle) * p[3] * ty];
    });
  });
  connectRings(out, rings, hex, cap);
}

function handle(wood, height = .88) {
  tube(wood, [[-.28, .018, .048, .051], [-.22, .012, .066, .064], [.09, 0, .052, .050], [.50, -.015, .046, .047], [height, 0, .045, .043]], WOOD, 8);
  // Leather grip is a single six-sided sleeve with two raised welt edges.
  tube(wood, [[-.25, .012, .068, .066], [-.23, .012, .071, .069], [.025, 0, .060, .058], [.045, 0, .061, .059]], WRAP, 6, false);
}

function collar(metal, y, height = .13, radius = .073) {
  tube(metal, [[y, 0, radius, radius], [y + height, 0, radius * .92, radius * .92]], 0xc8d2d6, 6);
}

// Bevelled plate in the Y/Z plane, with a genuinely narrowing cutting edge.
function axeHead(out) {
  const profile = [[.70, -.07], [.97, -.07], [1.025, .14], [1.04, .35], [.84, .41], [.635, .335], [.715, .11]];
  const center = [.84, .16];
  const rings = [-1, -1, 1, 1].map((side, layer) => profile.map(([y, z]) => {
    const face = layer === 0 || layer === 3, width = .092 - Math.max(0, z) * .17;
    return [side * (face ? width : width * .67), face ? center[0] + (y - center[0]) * .86 : y, face ? center[1] + (z - center[1]) * .86 : z];
  }));
  for (let r = 0; r < 3; r++) for (let i = 0; i < profile.length; i++) {
    const j = (i + 1) % profile.length;
    // Broad side bevels catch the light independently of the subdued face.
    // This gives bronze a readable golden edge without an emissive material.
    out.quad(rings[r][i], rings[r][j], rings[r + 1][j], rings[r + 1][i], r === 1 ? 0xf2f5f2 : 0xfff3d8, r === 1 ? 1.22 : 1.65);
  }
  const triangles = THREE.ShapeUtils.triangulateShape(profile.map(p => new THREE.Vector2(...p)), []);
  for (const [a, b, c] of triangles) {
    out.tri(rings[0][a], rings[0][c], rings[0][b], 0xd4dce0);
    out.tri(rings[3][a], rings[3][b], rings[3][c], 0xd4dce0);
  }
}

function rod(wood, metal) {
  handle(wood, .45);
  tube(wood, [[.37, 0, .040, .04], [.73, .045, .031, .029], [1.02, .13, .023, .021], [1.19, .22, .010, .010]], LIGHT_WOOD, 6);
  collar(metal, .30, .085, .049);
  // Reel silhouette, perpendicular to the forward casting plane.
  const ring = (x, radius) => Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return [x, .18 + Math.cos(a) * radius, .07 + Math.sin(a) * radius]; });
  connectRings(metal, [ring(-.08, .07), ring(-.065, .09), ring(.065, .09), ring(.08, .07)], 0xc8d5da);
  // Fixed slack line: tiny triangular prisms remain visible from both cameras.
  tube(wood, [[1.19, .22, .006, .006], [.91, .39, .006, .006], [.62, .57, .006, .006], [.45, .65, .006, .006]], 0xe5ded0, 3);
  const bobber = (y, radius) => Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return [Math.sin(a) * radius, y, .65 + Math.cos(a) * radius]; });
  connectRings(wood, [bobber(.34, 0), bobber(.40, .04)], 0xe4e5d2, false);
  connectRings(wood, [bobber(.40, .04), bobber(.45, .025), bobber(.48, 0)], 0xd05837, false);
}

function ladle(wood, metal) {
  handle(wood, .62); collar(metal, .56, .11, .054);
  tube(metal, [[.62, 0, .033, .033], [.74, .035, .030, .030], [.79, .105, .034, .031]], 0xd5dde1, 6);
  const rim = (z, radius) => Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return [-Math.sin(a) * radius, .85 + Math.cos(a) * radius, z]; });
  // An open bowl, not a solid sphere: outer shell, rolled rim, dark concavity.
  connectRings(metal, [rim(.08, 0), rim(.105, .090), rim(.18, .145), rim(.25, .145)], 0xd8e1e3, false);
  connectRings(metal, [rim(.25, .145), rim(.25, .116)], 0xf5f7f5, false, 1.12);
  connectRings(metal, [rim(.25, .116), rim(.17, .094), rim(.135, 0)], 0x9aa8b0, false);
}

function harpoon(wood, metal) {
  handle(wood, 1.23); collar(metal, 1.14, .12, .052);
  // Diamond-section spear and a returning barb. The head leans forward in Z
  // so the same rig contact convention works for a downward fishing thrust.
  tube(metal, [[1.20, 0, .028, .028], [1.34, .072, .058, .046], [1.55, .25, 0, 0]], 0xe4ebdf, 4);
  tube(metal, [[1.34, .072, .042, .034], [1.29, .15, .025, .024], [1.235, .18, 0, 0]], 0xe4ebdf, 4);
}

function hammer(wood, metal) {
  handle(wood, .87); collar(metal, .71, .12, .066);
  const ring = (z, w, h) => [[-w * .7, -h], [w * .7, -h], [w, -h * .7], [w, h * .7], [w * .7, h], [-w * .7, h], [-w, h * .7], [-w, -h * .7]].map(([x, y]) => [x, .85 + y, z]);
  connectRings(metal, [ring(-.24, .052, .065), ring(-.15, .082, .10), ring(.13, .13, .125), ring(.22, .13, .125), ring(.255, .105, .10)], 0xdbe4e7, true);
}

function build(kind) {
  const wood = batch(), metal = batch();
  if (kind === 'hatchet') { handle(wood, .96); collar(metal, .73, .21, .077); axeHead(metal); }
  if (kind === 'pickaxe') {
    handle(wood, .95); collar(metal, .78, .17, .075);
    tube(metal, [[.72, -.46, 0, 0], [.84, -.29, .055, .042], [.93, -.035, .080, .065], [.89, .18, .067, .065], [.76, .39, .038, .043], [.56, .59, 0, 0]], 0xd5dfe4, 6);
  }
  if (kind === 'rod') rod(wood, metal);
  if (kind === 'harpoon') harpoon(wood, metal);
  if (kind === 'ladle') ladle(wood, metal);
  if (kind === 'hammer') hammer(wood, metal);
  return [wood.geometry(), metal.geometry()];
}

export function createGatherTools() {
  const geometries = new Map(), rigs = new Map(), materials = new Map();
  const natural = new THREE.MeshLambertMaterial({ vertexColors: true });
  function info(kind) {
    return Object.hasOwn(INFO, kind) ? INFO[kind] : null;
  }
  function get(kind, tier = 1) {
    if (!Object.hasOwn(SPECS, kind)) return null; // Foraging intentionally keeps both hands empty.
    tier = Math.max(1, Math.min(6, Math.floor(Number(tier) || 1)));
    if (!rigs.has(kind)) rigs.set(kind, []);
    const versions = rigs.get(kind); if (versions[tier]) return versions[tier];
    if (!geometries.has(kind)) geometries.set(kind, build(kind));
    if (!materials.has(tier)) materials.set(tier, new THREE.MeshLambertMaterial({ vertexColors: true, color: METALS[tier] }));
    const rig = new THREE.Group(); rig.name = 'Gather ' + kind;
    rig.userData.gather = { ...info(kind), tier };
    geometries.get(kind).forEach((geometry, part) => {
      const mesh = new THREE.Mesh(geometry, part === 0 ? natural : materials.get(tier));
      mesh.name = rig.name + (part ? ' metal' : ' handle'); rig.add(mesh);
    });
    versions[tier] = rig; return rig;
  }
  function dispose() {
    for (const parts of geometries.values()) for (const geo of parts) geo.dispose();
    for (const material of materials.values()) material.dispose(); natural.dispose();
    geometries.clear(); materials.clear(); rigs.clear();
  }
  return { get, info, dispose };
}
