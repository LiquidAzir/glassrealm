import { WORLD_SCALE } from './scale.js';

// A north-up atlas of the rendered surface, not a second world generator.
// Terrain/paving are painted only after travelling 60m; live markers stay cheap.
const SIZE = 116, CENTER = SIZE / 2, RADIUS = 75 * WORLD_SCALE;
const SCALE = 51 / RADIUS, PLATE = 192, SAMPLES = 96, REBUILD_DISTANCE = 60;
const TAU = Math.PI * 2;
const LAND = {
  grass: [111, 134, 96], forest: [80, 108, 83], desert: [180, 157, 109],
  snow: [174, 189, 183], volcanic: [123, 101, 83], swamp: [105, 118, 83],
  jungle: [87, 121, 87], badlands: [157, 122, 91], highland: [134, 144, 129],
  fae: [125, 120, 151], coast: [125, 150, 122], autumn: [156, 136, 88],
  crystal: [136, 158, 172], spore: [138, 121, 139], lagoon: [117, 160, 143],
  sky: [163, 177, 179], cinder: [139, 108, 89], twilight: [100, 128, 131],
  aurora: [153, 178, 178], obsidian: [108, 105, 121], umbral: [113, 111, 135],
  saltmarsh: [158, 144, 133], royal: [132, 146, 109], necro: [123, 128, 116],
  basalt: [124, 125, 116], nocturne: [111, 133, 131], arcane: [140, 131, 155], fen: [119, 133, 107],
};

export function createMinimap(G, canvas) {
  canvas.width = canvas.height = SIZE * 2;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Local map, north up. Gold diamonds mark quests; red dots mark foes.');
  const ctx = canvas.getContext('2d');
  const plate = document.createElement('canvas'); plate.width = plate.height = PLATE;
  const pc = plate.getContext('2d');
  const raster = document.createElement('canvas'); raster.width = raster.height = SAMPLES;
  const rc = raster.getContext('2d');
  let world = null, centerX = NaN, centerZ = NaN, paving = [], visible = true;
  const stats = { terrainBuilds: 0, surfaceSamples: 0, markers: 0 };

  function prepareWorld() {
    if (world === G.world) return;
    world = G.world; centerX = centerZ = NaN; paving = [];
    // These are the exact generated paving triangles. Reading them consumes no
    // random numbers and never calls the legacy quantized height() cache.
    world.group?.traverse(mesh => {
      if (mesh.name !== 'Village paving') return;
      const a = mesh.geometry?.attributes.position;
      if (!a) return;
      const points = []; let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i), z = a.getZ(i); points.push(x, z);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
      }
      paving.push({ points, minX, maxX, minZ, maxZ });
    });
  }

  function terrainColor(x, z) {
    let nearest = null, distance = Infinity;
    for (const region of world.regions) {
      const d = Math.hypot(x - region.x, z - region.z) - region.r;
      if (d < distance) { distance = d; nearest = region; }
    }
    return LAND[nearest?.biome] || LAND.grass;
  }

  function buildTerrain(px, pz) {
    centerX = px; centerZ = pz;
    const step = PLATE / SAMPLES / SCALE, half = PLATE / 2 / SCALE;
    const left = px - half, top = pz - half;
    const heights = new Float32Array(SAMPLES * SAMPLES), pixels = rc.createImageData(SAMPLES, SAMPLES);
    const sea = world.WATER_Y || 0;
    for (let z = 0; z < SAMPLES; z++) for (let x = 0; x < SAMPLES; x++) {
      heights[z * SAMPLES + x] = world.surfaceHeight(left + (x + .5) * step, top + (z + .5) * step);
    }
    for (let z = 0; z < SAMPLES; z++) for (let x = 0; x < SAMPLES; x++) {
      const i = z * SAMPLES + x, h = heights[i], west = heights[z * SAMPLES + Math.max(0, x - 1)], north = heights[Math.max(0, z - 1) * SAMPLES + x];
      let color;
      if (h <= sea) {
        const coast = [west, north, heights[z * SAMPLES + Math.min(SAMPLES - 1, x + 1)], heights[Math.min(SAMPLES - 1, z + 1) * SAMPLES + x]].some(v => v > sea);
        color = coast ? [78, 125, 136] : h > sea - .8 ? [56, 100, 114] : [35, 70, 86];
      } else if (h < sea + 1) color = [184, 174, 133];
      else {
        color = terrainColor(left + (x + .5) * step, top + (z + .5) * step).slice();
        const rock = Math.min(.58, Math.max(0, (h - 4) * .065));
        const light = Math.max(.76, Math.min(1.18, 1 + ((west - h) + (north - h)) * .028));
        for (let c = 0; c < 3; c++) color[c] = (color[c] * (1 - rock) + [180, 181, 162][c] * rock) * light;
        // Sparse elevation contours, derived from the sampled surface itself.
        if (h > 3 && (Math.floor(h / 4) !== Math.floor(west / 4) || Math.floor(h / 4) !== Math.floor(north / 4))) color = color.map(v => v * .88);
      }
      const j = i * 4; pixels.data[j] = color[0]; pixels.data[j + 1] = color[1]; pixels.data[j + 2] = color[2]; pixels.data[j + 3] = 255;
    }
    rc.putImageData(pixels, 0, 0);
    pc.clearRect(0, 0, PLATE, PLATE); pc.imageSmoothingEnabled = true; pc.drawImage(raster, 0, 0, PLATE, PLATE);
    const to = (x, z) => [(x - px) * SCALE + PLATE / 2, (z - pz) * SCALE + PLATE / 2];
    const near = (x, z, extra = 0) => Math.abs(x - px) < half + extra && Math.abs(z - pz) < half + extra;
    pc.fillStyle = '#385b46'; pc.globalAlpha = .33;
    for (const tree of world.trees || []) {
      if (!near(tree.x, tree.z)) continue;
      const [x, y] = to(tree.x, tree.z); pc.beginPath(); pc.arc(x, y, 1.1, 0, TAU); pc.fill();
    }
    pc.globalAlpha = 1;
    pc.fillStyle = '#c4b68d';
    for (const path of paving) {
      if (path.maxX < left || path.minX > px + half || path.maxZ < top || path.minZ > pz + half) continue;
      pc.beginPath();
      for (let i = 0; i < path.points.length; i += 6) {
        const a = to(path.points[i], path.points[i + 1]), b = to(path.points[i + 2], path.points[i + 3]), c = to(path.points[i + 4], path.points[i + 5]);
        pc.moveTo(...a); pc.lineTo(...b); pc.lineTo(...c); pc.closePath();
      }
      pc.fill();
    }
    pc.lineCap = 'round';
    for (const bridge of world.navigation?.crossings || []) {
      const a = to(bridge.ax, bridge.az), b = to(bridge.bx, bridge.bz);
      pc.strokeStyle = '#4d5145'; pc.lineWidth = Math.max(2.4, bridge.halfWidth * 2 * SCALE + 1.2);
      pc.beginPath(); pc.moveTo(...a); pc.lineTo(...b); pc.stroke();
      pc.strokeStyle = '#d0bd8b'; pc.lineWidth = Math.max(1.2, bridge.halfWidth * 2 * SCALE); pc.stroke();
    }
    // Water travel is a dashed route, never painted as walkable land.
    pc.setLineDash([2, 3]); pc.strokeStyle = '#7eacb8'; pc.lineWidth = 1;
    for (const route of world.bridges || []) if (route.type === 'ferry') {
      pc.beginPath(); pc.moveTo(...to(route.ax, route.az)); pc.lineTo(...to(route.bx, route.bz)); pc.stroke();
    }
    pc.setLineDash([]);
    for (const building of world.visualBuildings || []) {
      if (!near(building.x, building.z)) continue;
      const [x, y] = to(building.x, building.z), w = Math.max(2.8, Math.min(8, building.r * 2 * SCALE));
      pc.save(); pc.translate(x, y); pc.rotate(-(building.mesh?.rotation.y || 0));
      pc.fillStyle = '#37473d'; pc.fillRect(-w / 2 - .5, -w / 2 + .5, w + 1, w + 1);
      pc.fillStyle = '#d2bc91'; pc.fillRect(-w / 2, -w / 2, w, w);
      pc.strokeStyle = '#8e7554'; pc.lineWidth = .7; pc.beginPath(); pc.moveTo(-w / 2, 0); pc.lineTo(w / 2, 0); pc.stroke(); pc.restore();
    }
    stats.terrainBuilds++; stats.surfaceSamples += heights.length;
  }

  function update() {
    if (!visible || !G.player || !G.world) return;
    const px = G.player.position.x, pz = G.player.position.z;
    if (!Number.isFinite(px) || !Number.isFinite(pz)) return;
    prepareWorld();
    if (!Number.isFinite(centerX) || Math.abs(px - centerX) > REBUILD_DISTANCE || Math.abs(pz - centerZ) > REBUILD_DISTANCE) buildTerrain(px, pz);
    ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#172b31'; ctx.beginPath(); ctx.arc(CENTER, CENTER, 57, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(CENTER, CENTER, 51, 0, TAU); ctx.clip();
    ctx.drawImage(plate, CENTER - PLATE / 2 + (centerX - px) * SCALE, CENTER - PLATE / 2 + (centerZ - pz) * SCALE);
    const to = (x, z) => [CENTER + (x - px) * SCALE, CENTER + (z - pz) * SCALE];
    const candidates = [];
    const add = (x, z, kind, priority, color, size) => {
      const dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
      if (!Number.isFinite(d) || d > RADIUS * .91 || d * SCALE < 8 + size) return;
      candidates.push({ x: CENTER + dx * SCALE, y: CENTER + dz * SCALE, d, kind, priority, color, size });
    };
    for (const stone of world.waystones || []) add(stone.x, stone.z, 'diamond', 3, G.waystonesAttuned?.has(stone.key) ? '#b9e0df' : '#88a5a2', 3);
    for (const mine of world.mines || []) add(mine.x, mine.z, 'arch', 4, '#e2cb92', 3);
    for (const dungeon of world.dungeons || []) add(dungeon.x, dungeon.z, 'arch', 4, '#c4abd0', 3);
    for (const cave of [world.cave, world.cave2]) if (cave) add(cave.x, cave.z, 'arch', 4, '#c4abd0', 3);
    const givers = new Set(G.quests.all().filter(q => q.status === 'available').map(q => q.def.giver));
    for (const n of G.entities.npcs) add(n.pos.x, n.pos.z, givers.has(n.def.key) ? 'diamond' : 'dot', givers.has(n.def.key) ? 1 : 5, givers.has(n.def.key) ? '#f2d185' : '#b5d9d4', givers.has(n.def.key) ? 2.7 : 1.6);
    for (const e of G.entities.enemies) if (e.alive) add(e.pos.x, e.pos.z, e.def.boss ? 'diamond' : 'dot', e.def.boss ? 2 : 6, '#ec8d78', e.def.boss ? 3 : 1.6);
    candidates.sort((a, b) => a.priority - b.priority || a.d - b.d);
    const placed = [];
    function mark(m) {
      ctx.save(); ctx.translate(m.x, m.y); ctx.fillStyle = m.color; ctx.strokeStyle = '#162b31'; ctx.lineWidth = 1.2; ctx.beginPath();
      if (m.kind === 'diamond') { ctx.moveTo(0, -m.size); ctx.lineTo(m.size, 0); ctx.lineTo(0, m.size); ctx.lineTo(-m.size, 0); ctx.closePath(); }
      else if (m.kind === 'arch') { ctx.arc(0, 0, m.size, Math.PI, 0); ctx.lineTo(m.size, m.size); ctx.lineTo(-m.size, m.size); ctx.closePath(); }
      else ctx.arc(0, 0, m.size, 0, TAU);
      ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (G.questGuide && Number.isFinite(G.questGuide.x) && Number.isFinite(G.questGuide.z)) {
      let [x, y] = to(G.questGuide.x, G.questGuide.z), dx = x - CENTER, dy = y - CENTER, d = Math.hypot(dx, dy);
      if (d > 44) { x = CENTER + dx / d * 44; y = CENTER + dy / d * 44; }
      if (d > 12) { const m = { x, y, size: 4, kind: 'diamond', color: '#ffe3a0' }; mark(m); placed.push(m); }
    }
    for (const m of candidates) {
      if (placed.length >= 15 || placed.some(p => Math.hypot(p.x - m.x, p.y - m.y) < p.size + m.size + 2)) continue;
      mark(m); placed.push(m);
    }
    stats.markers = placed.length;
    ctx.restore();
    // Compass bezel is part of this canvas, keeping the existing HUD footprint.
    ctx.strokeStyle = '#ad9769'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(CENTER, CENTER, 55, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#607071'; ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      if (!i) continue;
      const a = i * TAU / 12, r = i % 3 ? 53 : 51.5;
      ctx.beginPath(); ctx.moveTo(CENTER + Math.sin(a) * r, CENTER - Math.cos(a) * r); ctx.lineTo(CENTER + Math.sin(a) * 55, CENTER - Math.cos(a) * 55); ctx.stroke();
    }
    ctx.fillStyle = '#172b31'; ctx.fillRect(51, 0, 14, 15);
    ctx.fillStyle = '#f3d79c'; ctx.font = 'bold 11px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', CENTER, 8);
    ctx.save(); ctx.translate(CENTER, CENTER); ctx.rotate(Math.PI - G.player.state.heading);
    ctx.fillStyle = '#fff4cf'; ctx.strokeStyle = '#203333'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4.5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4.5, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  return { update, setVisible(on) { visible = !!on; canvas.style.display = visible ? '' : 'none'; }, stats };
}
