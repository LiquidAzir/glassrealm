import * as THREE from 'three';

// Original Blender geometry is loaded once. Gameplay never depends on the art kit:
// a missing/invalid kit leaves the procedural models available to the caller.
const geometries = new Map();
const materials = new Map();
export const artState = { ready: false, models: 0, bytes: 0, error: null };
export async function loadRealmArt() {
  try {
    const response = await fetch(new URL('../assets/realm-kit.json', import.meta.url));
    if (!response.ok) throw new Error('Art kit HTTP ' + response.status);
    const text = await response.text(), data = JSON.parse(text);
    if (data.version !== 1 || !data.models) throw new Error('Unsupported art kit');
    for (const [key, model] of Object.entries(data.models)) {
      if (!Array.isArray(model.position) || model.position.length % 3 || model.position.length < 9 || !model.position.every(Number.isFinite)) throw new Error('Invalid model: ' + key);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(model.position, 3));
      if (model.normal && model.normal.length === model.position.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(model.normal, 3));
      if (model.color && model.color.length === model.position.length) geo.setAttribute('color', new THREE.Float32BufferAttribute(model.color, 3));
      if (model.index) geo.setIndex(model.index);
      if (!geo.attributes.normal) geo.computeVertexNormals();
      geo.computeBoundingBox(); geo.computeBoundingSphere();
      geometries.set(key, geo);
    }
    artState.ready = true; artState.models = geometries.size; artState.bytes = text.length;
  } catch (error) {
    for (const geo of geometries.values()) geo.dispose();
    geometries.clear(); artState.error = error.message;
    console.warn('Glass Realm artwork unavailable; using the procedural fallback:', error.message);
  }
}
export function artGeometry(key) { return geometries.get(key) || null; }
export function artMaterial(tint = 0xffffff) {
  if (!materials.has(tint)) materials.set(tint, new THREE.MeshLambertMaterial({ vertexColors: true, color: tint }));
  return materials.get(tint);
}
export function artModel(key, tint = 0xffffff) {
  const geo = artGeometry(key);
  if (!geo) return null;
  const mesh = new THREE.Mesh(geo, artMaterial(tint)); mesh.name = 'Blender ' + key;
  return mesh;
}

// Batch spatially instead of placing a whole continent into one instance buffer.
// Every source row retains its own mesh/index handle for gathering and regrowth.
export function instanceChunks(parent, geometry, material, rows, transform, size = 42) {
  const bins = new Map(), dummy = new THREE.Object3D();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i], key = Math.floor(row.x / size) + ':' + Math.floor(row.z / size);
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push({ row, source: i });
  }
  const handles = [], meshes = [];
  for (const items of bins.values()) {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    items.forEach(({row, source}, idx) => {
      dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
      const color = transform(dummy, row, source); dummy.updateMatrix(); mesh.setMatrixAt(idx, dummy.matrix);
      if (color != null) mesh.setColorAt(idx, new THREE.Color(color));
      handles[source] = { mesh, index: idx };
    });
    mesh.computeBoundingSphere(); mesh.computeBoundingBox();
    mesh.name = 'Scenery chunk'; parent.add(mesh); meshes.push(mesh);
  }
  return {
    handles, meshes,
    setMatrixAt(index, matrix) { const h = handles[index]; if (h) { h.mesh.setMatrixAt(h.index, matrix); h.mesh.instanceMatrix.needsUpdate = true; } },
    // Compatibility with existing resource mutation code; each setter marks its chunk.
    instanceMatrix: { set needsUpdate(value) {} },
  };
}

// A terrain chunk shares its material with every other chunk, but has a tight
// bounding volume. Distant triangles can then be rejected by the GPU frustum.
export function chunkTerrain(parent, geo, material, size = 48) {
  const bins = new Map(), attrs = Object.keys(geo.attributes), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 3) {
    const key = Math.floor((pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / (3 * size)) + ':' + Math.floor((pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / (3 * size));
    if (!bins.has(key)) bins.set(key, Object.fromEntries(attrs.map(a => [a, []])));
    const bin = bins.get(key);
    for (const name of attrs) {
      const a = geo.attributes[name];
      for (let k = i * a.itemSize; k < (i + 3) * a.itemSize; k++) bin[name].push(a.array[k]);
    }
  }
  for (const bin of bins.values()) {
    const part = new THREE.BufferGeometry();
    for (const name of attrs) part.setAttribute(name, new THREE.Float32BufferAttribute(bin[name], geo.attributes[name].itemSize));
    part.computeBoundingSphere(); const mesh = new THREE.Mesh(part, material); mesh.name = 'Terrain chunk'; parent.add(mesh);
  }
  geo.dispose();
}

const textureCache = new Map();
export function groundTexture(kind) {
  if (textureCache.has(kind)) return textureCache.get(kind);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d'); let seed = 71;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = kind === 'paving' ? '#afac9d' : '#b8b9a6'; ctx.fillRect(0, 0, 256, 256);
  if (kind === 'paving' || kind === 'planks') {
    for (let y = -32; y < 288; y += 32) for (let x = -48; x < 304; x += 48) {
      const px = x + ((y / 32) % 2) * 24, shade = 175 + Math.floor(rnd() * 30);
      ctx.fillStyle = `rgb(${shade},${shade-3},${shade-12})`; ctx.fillRect(px+1,y+1,45,29);
      ctx.fillStyle = 'rgba(255,247,209,.17)'; ctx.fillRect(px+2,y+2,42,2);
      ctx.fillStyle = 'rgba(46,44,31,.2)'; ctx.fillRect(px+2,y+28,43,2);
      if(kind==='planks'){ctx.strokeStyle='rgba(63,42,21,.13)';ctx.lineWidth=.6;for(let grain=0;grain<5;grain++){ctx.beginPath();ctx.moveTo(px+3,y+5+grain*4);ctx.bezierCurveTo(px+12,y+4+grain*4,px+27,y+8+grain*4,px+44,y+5+grain*4);ctx.stroke();}}
    }
  } else {
    for (let i = 0; i < 360; i++) {
      const shade = rnd() > .5 ? 'rgba(229,222,174,.065)' : 'rgba(45,69,42,.06)';
      ctx.fillStyle = shade; ctx.beginPath();ctx.ellipse(rnd()*256,rnd()*256,8+rnd()*24,5+rnd()*15,rnd()*6.3,0,6.3);ctx.fill();
    }
    for (let i = 0; i < 4200; i++) {
      ctx.fillStyle = i % 3 ? 'rgba(55,65,37,.09)' : 'rgba(235,230,186,.14)';
      ctx.fillRect(rnd()*256,rnd()*256,.5+rnd()*1.3,1+rnd()*2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2; textureCache.set(kind, tex); return tex;
}

export function contactShadowGeometry(){
  const positions=[],colors=[];
  for(let n=0;n<12;n++){
    const a=n/12*Math.PI*2,b=(n+1)/12*Math.PI*2;
    positions.push(0,0,0,Math.cos(b),0,Math.sin(b),Math.cos(a),0,Math.sin(a));
    colors.push(.025,.03,.02,.42,.025,.03,.02,0,.025,.03,.02,0);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));return geo;
}

export function meadowGeometry(){
  const pos=[],colors=[];
  for(let n=0;n<3;n++){
    const a=n*Math.PI/3,dx=Math.cos(a)*.13,dz=Math.sin(a)*.13,h=.26+n*.05;
    pos.push(-dx,0,-dz,dx,0,dz,dx*.3,h,dz*.3);
    colors.push(.28,.4,.16,.4,.54,.22,.76,.8,.42);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();return geo;
}

export function makeGroundPath(points, height, width = 1.8, color = 0xe6cfaa) {
  const pos = [], uv = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i-1], b = points[i], dx = b.x-a.x, dz = b.z-a.z, len = Math.hypot(dx,dz), n = Math.max(1,Math.ceil(len/1.4));
    if (!len) continue;
    const sx = -dz/len*width*.5, sz = dx/len*width*.5;
    for (let s = 0; s < n; s++) {
      const x = a.x+dx*s/n, z = a.z+dz*s/n, ex = a.x+dx*(s+1)/n, ez = a.z+dz*(s+1)/n;
      const p = [[x+sx,z+sz],[ex+sx,ez+sz],[x-sx,z-sz],[ex-sx,ez-sz]];
      for (const j of [0,1,2,2,1,3]) { const v=p[j];pos.push(v[0],height(v[0],v[1])+.045,v[1]);uv.push(v[0]/3.2,v[1]/3.2); }
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const key = 'path:'+color;
  if (!materials.has(key)) materials.set(key,new THREE.MeshLambertMaterial({color,map:groundTexture('paving'),side:THREE.DoubleSide}));
  const mesh = new THREE.Mesh(geo,materials.get(key));mesh.name='Village paving';return mesh;
}
