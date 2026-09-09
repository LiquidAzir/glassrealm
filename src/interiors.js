import * as THREE from 'three';
import { rimLight } from './shaders.js';
import { artModel, groundTexture } from './realm-art.js';

// Building interiors. Rooms are built on a far-away "interior plot" (IX,IZ); the
// overworld fogs to black around it, so we just teleport the player in/out and
// clamp their movement to the room bounds. Each building TYPE has a furnished
// template with interactable stations, indoor NPCs (keepers/patrons), and a list
// of solid obstacles for collision. Rooms are built once and cached.

const IX = 1500, IZ = 1500, FY = 0;
const RW = 16, RD = 14, HW = RW / 2, HD = RD / 2, WALL_H = 5;

const mat = (c) => rimLight(new THREE.MeshLambertMaterial({ color: c, flatShading: true }));   // indoor keepers/patrons + furniture get the same silhouette rim as the outdoor world
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
const M = {
  floor: mat(0x7a5a38), wall: mat(0xc2ad86), beam: mat(0x5a4026), wood: mat(0x6e4a2b),
  dark: mat(0x40342a), stone: mat(0x8a8a92), metal: mat(0x55585f), cloth: mat(0x9a4f3a),
  rug: mat(0x3a5a7a), gold: mat(0xffd45f), skin: mat(0xf2c79a),
  fire: glow(0xff7a33), win: glow(0xffd47a), cyan: glow(0x9bf2ff), green: glow(0x7cffb0), white: glow(0xf0f0f0),
};
const GOODS = [0xff6b6b, 0x7cffb0, 0x9bf2ff, 0xffd45f, 0xb48cff, 0xff9d6b].map(mat);

// per-biome interior palette: floor/wall/beam/rug tints + lamp colour, so a Home
// in the snow reads differently from one in the jungle. (furniture stays wood-tone
// everywhere — only the shell, rug, and light shift to match the region.)
const INT_PAL = {
  grass:    { floor: 0x7a5a38, wall: 0xc2ad86, beam: 0x5a4026, rug: 0x3a5a7a, lamp: 0xffe2b0 },
  forest:   { floor: 0x6a5230, wall: 0xa89568, beam: 0x4a3520, rug: 0x2f5a3a, lamp: 0xd6e08a },
  desert:   { floor: 0xb09866, wall: 0xe8c89a, beam: 0x7a5a2e, rug: 0xc06a3a, lamp: 0xffce6a },
  snow:     { floor: 0x8a8a92, wall: 0xdce8f6, beam: 0x6a7a88, rug: 0x4f6ed8, lamp: 0xcfe0ff },
  volcanic: { floor: 0x5a4a3a, wall: 0x9a6a48, beam: 0x4a3a2a, rug: 0x9a3a2a, lamp: 0xff9a4a },
  swamp:    { floor: 0x5a5238, wall: 0x8a8a5a, beam: 0x3a3a26, rug: 0x4a5a3a, lamp: 0xc8e07a },
  jungle:   { floor: 0x6a5a2e, wall: 0xb59a4a, beam: 0x4a3a1a, rug: 0x3f8f3f, lamp: 0xffd24a },
  badlands: { floor: 0x8a5a3a, wall: 0xd98a4a, beam: 0x5a3a26, rug: 0x9a4a2a, lamp: 0xffb04a },
  highland: { floor: 0x6a707a, wall: 0x9faebe, beam: 0x4a4e58, rug: 0x3a4a58, lamp: 0xffd060 },
  fae:      { floor: 0x5a4a8a, wall: 0x9a7ad0, beam: 0x3a2a6a, rug: 0x3a8aff, lamp: 0xb08aff },
  coast:    { floor: 0x6a7a8a, wall: 0xcfe0e8, beam: 0x4a5a68, rug: 0x2fb0c8, lamp: 0xffe08a },
  autumn:   { floor: 0x6a4a2a, wall: 0xc8954a, beam: 0x4a2a16, rug: 0xd85a26, lamp: 0xffb84a },
  crystal:  { floor: 0x5a6a8a, wall: 0xbcd0e6, beam: 0x3a4a6a, rug: 0x5a7aa6, lamp: 0x9ad8ff },
  lagoon:   { floor: 0x4a8a80, wall: 0xb0e0d8, beam: 0x2a5a52, rug: 0x6fe6d0, lamp: 0x9ff2e6 },
  sky:      { floor: 0x6a7a8a, wall: 0xdfe8f6, beam: 0x4a5668, rug: 0xc8d6e8, lamp: 0xcfe0ff },
  twilight: { floor: 0x3a4a5a, wall: 0x5a7080, beam: 0x2a3a48, rug: 0x2f8ca6, lamp: 0x4fd6dc },
  aurora:   { floor: 0x5a6a7a, wall: 0xcdd8ec, beam: 0x3a4a5a, rug: 0x4f7ad8, lamp: 0x9bf2ff },
  obsidian: { floor: 0x3a2a2a, wall: 0x4a3a3a, beam: 0x2a1a1a, rug: 0x7a2a2a, lamp: 0xff6a3a },
  umbral:   { floor: 0x3a3248, wall: 0x5a4a6a, beam: 0x282038, rug: 0x4a3a6a, lamp: 0xb08adf },
  saltmarsh:{ floor: 0x8a6a6a, wall: 0xe8c0c8, beam: 0x5a4a4a, rug: 0xd07a8a, lamp: 0xf08fb8 },
  royal:    { floor: 0x8a7048, wall: 0xcdc2a4, beam: 0x5a4632, rug: 0x8a2438, lamp: 0xffdf9a },
  necro:    { floor: 0x3a3a42, wall: 0x565662, beam: 0x2a2a30, rug: 0x2f4a3a, lamp: 0x7cffb0 },
  basalt:   { floor: 0x2e2422, wall: 0x4a3a34, beam: 0x241a16, rug: 0x6a2a1a, lamp: 0xff8a3a },
  nocturne: { floor: 0x1e2436, wall: 0x2a3040, beam: 0x14202e, rug: 0x3a2f4a, lamp: 0xffce6a },
};
const PAL = (b) => INT_PAL[b] || INT_PAL.grass;

// Inward-facing room walls give an architectural cutaway when the follow camera
// is outside a room. The far walls remain visible; the near wall cannot hide play.
function roomBox(g,w,h,d,m,x,y,z,isWall){
  let geometry,rotation=0;
  if(isWall && d<=.55 && Math.abs(z)>=6.8){geometry=new THREE.PlaneGeometry(w,h);rotation=z>0?Math.PI:0;}
  else if(isWall && w<=.55 && Math.abs(x)>=7.8){geometry=new THREE.PlaneGeometry(d,h);rotation=x>0?-Math.PI/2:Math.PI/2;}
  else geometry=new THREE.BoxGeometry(w,h,d);
  let material=m;
  if(h<=.35&&w>=8&&d>=8){
    material=m.clone();material.color.multiplyScalar(1.45);material.map=groundTexture(m.userData.flooring||'planks');
    // Large halls use the same physical tile scale as the small rooms.
    if(w>20||d>20){material.map=material.map.clone();material.map.repeat.set(w/16,d/14);material.map.needsUpdate=true;}
  }
  const mesh=new THREE.Mesh(geometry,material);mesh.rotation.y=rotation;mesh.position.set(IX+x,FY+y,IZ+z);
  // The follow camera views roofless rooms from above. Ceiling ties belong to
  // that removed roof, otherwise they draw opaque bars over NPCs and furniture.
  if(y>4&&h<.6&&((w>7&&d<.6)||(d>7&&w<.6)))mesh.visible=false;
  g.add(mesh);return mesh;
}

// Grounded Blender furniture and the same articulated character kit used outside.
// These helpers only build visuals; each room keeps its original collision records.
function roomModel(g,key,x,z,sx=1,sy=1,sz=1,angle=0,y=.15,tint=0xffffff){
  let mesh=artModel(key,tint);
  if(!mesh){
    mesh=new THREE.Group();mesh.name='Fallback '+key;
    const add=(geo,m,px,py,pz)=>{const part=new THREE.Mesh(geo,m);part.position.set(px,py,pz);mesh.add(part);};
    const box=(w,h,d,m,px,py,pz)=>add(new THREE.BoxGeometry(w,h,d),m,px,py,pz);
    if(key==='table'||key==='counter'){
      const w=key==='table'?2.6:3;box(w,.18,1.5,M.wood,0,1.01,0);
      for(const dx of [-w/2+.22,w/2-.22])box(.2,.94,1.15,M.dark,dx,.47,0);
      if(key==='counter')box(2.6,.8,.12,M.wood,0,.5,.6);
    }else if(key==='stocked_shelf'){
      for(const dx of [-1.4,1.4])box(.16,3.2,.5,M.wood,dx,1.6,0);
      for(const py of [.12,1.12,2.12,3.1])box(3,.16,.5,M.wood,0,py,0);
      for(let i=0;i<6;i++)box(.34,.55,.28,GOODS[i],(i%3-1)*.75,.47+Math.floor(i/3),0);
    }else if(key==='furnace'){
      box(2,1.8,1.8,M.stone,0,.9,0);box(.9,.8,.06,M.dark,0,.6,.92);box(.65,.25,.07,M.fire,0,.34,.96);box(.55,1,.55,M.stone,.6,2.2,-.5);
    }else if(key==='anvil'){
      add(new THREE.CylinderGeometry(.4,.48,.7,8),M.wood,0,.35,0);box(1.3,.25,.45,M.metal,.12,.93,0);box(.5,.18,.45,M.metal,0,.75,0);
    }else if(key==='cauldron'){
      add(new THREE.CylinderGeometry(.68,.5,.9,8),M.metal,0,.67,0);add(new THREE.CylinderGeometry(.58,.58,.025,8),M.dark,0,1.13,0);
    }else if(key==='lantern'){
      box(.16,2,.16,M.wood,0,1,0);box(.64,.1,.15,M.dark,.24,2,0);box(.34,.4,.32,M.dark,.46,1.69,0);box(.24,.28,.34,M.win,.46,1.7,0);
    }else if(key==='barrel'){
      add(new THREE.CylinderGeometry(.47,.47,1.2,8),M.wood,0,.6,0);
    }else if(key==='hero_shield')box(.6,.82,.12,mat(tint),0,0,0);
    else box(1.25,1.25,1.25,M.wood,0,.625,0);
  }
  mesh.position.set(IX+x,FY+y,IZ+z);mesh.scale.set(sx,sy,sz);mesh.rotation.y=angle;g.add(mesh);return mesh;
}

function roomPerson(g,x,z,color,{ground=.15,height=1,width=1,cap,beard,armor=false,angle=0}={}){
  const person=new THREE.Group();person.name='Room inhabitant';person.position.set(IX+x,FY+ground,IZ+z);person.scale.set(width,height,width);person.rotation.y=angle;g.add(person);
  const add=(geometry,material,px,py,pz)=>{const m=new THREE.Mesh(geometry,material);m.position.set(px,py,pz);person.add(m);return m;};
  const part=(key,tint,px,py,pz,w,h,d)=>{
    let mesh=artModel(key,tint);
    if(!mesh){const geo=key==='hero_head'?new THREE.IcosahedronGeometry(.3,0):new THREE.BoxGeometry(w,h,d);if(key==='hero_boot'||key==='hero_upper_arm'||key==='hero_forearm')geo.translate(0,-h/2,0);mesh=new THREE.Mesh(geo,key==='hero_head'?M.skin:mat(tint));mesh.name='Blender '+key;}
    mesh.position.set(px,py,pz);person.add(mesh);return mesh;
  };
  for(const side of [-1,1]){
    part('hero_boot',0x746451,side*.16,.7,0,.2,.7,.24);
    part('hero_upper_arm',color,side*.44,1.46,0,.2,.31,.22);
    part('hero_forearm',0x746451,side*.44,1.15,0,.18,.31,.22);
    add(new THREE.IcosahedronGeometry(.105,0),M.skin,side*.44,.79,.02);
    if(armor)part('hero_shoulder',color,side*.43,1.46,0,.34,.26,.52);
  }
  part(armor?'hero_cuirass':'hero_torso',color,0,1.1,0,.74,.82,.46);
  part('hero_head',0xffffff,0,1.75,0,.54,.55,.48);
  const belt=add(new THREE.CylinderGeometry(.315,.315,.095,8),M.dark,0,.77,0);belt.scale.z=.76;
  add(new THREE.BoxGeometry(.12,.1,.05),M.gold,0,.77,.255);
  if(cap)add(new THREE.SphereGeometry(.335,8,3,0,Math.PI*2,0,1.17),mat(cap),0,1.77,0);
  if(beard){const mesh=add(new THREE.ConeGeometry(.21,.43,6),mat(beard),0,1.43,.225);mesh.rotation.z=Math.PI;mesh.scale.z=.7;}
  return person;
}

function candleStand(g,x,z,color=0xffc679,height=1.6){
  const add=(geo,m,y)=>{const mesh=new THREE.Mesh(geo,m);mesh.position.set(IX+x,FY+y,IZ+z);g.add(mesh);return mesh;};
  add(new THREE.CylinderGeometry(.18,.25,.12,8),M.metal,.21);
  add(new THREE.CylinderGeometry(.055,.085,height-.4,6),M.metal,.27+(height-.4)/2);
  add(new THREE.CylinderGeometry(.17,.10,.12,8),M.gold,height-.09);
  add(new THREE.CylinderGeometry(.07,.075,.22,6),mat(0xe8d6b4),height+.03);
  add(new THREE.ConeGeometry(.055,.16,5),glow(color),height+.22);
}

function roomVault(g,box,x,z,color=0x697582){
  box(1.7,1.9,1.1,mat(color),x,1.1,z);
  box(1.4,1.6,.08,M.dark,x,1.1,z+.56);
  box(1.17,1.36,.1,M.metal,x,1.1,z+.615);
  for(const dx of [-.66,.66])box(.08,1.68,.12,M.gold,x+dx,1.1,z+.62);
  for(const dy of [-.78,.78])box(1.38,.08,.12,M.gold,x,1.1+dy,z+.62);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,4,8),M.gold);wheel.position.set(IX+x,FY+1.1,IZ+z+.72);g.add(wheel);
  box(.045,.36,.05,M.gold,x,1.1,z+.72);box(.36,.045,.05,M.gold,x,1.1,z+.72);
}

function carvedBench(g,box,x,z,color){
  roomModel(g,'table',x,z,1.1,.51,.68);
  for(const dx of [-1.25,1.25])box(.14,1.08,.14,M.wood,x+dx,.69,z-.38);
  box(2.62,.4,.12,color,x,1.01,z-.38);
  box(2.78,.09,.18,M.wood,x,1.26,z-.38);
}

// furniture pieces — each registers a solid obstacle so the player can't walk through it
function furniture(box, solid, P, g) {
  const model=(key,x,z,sx=1,sy=1,sz=1,angle=0)=>{
    const mesh=artModel(key);if(!mesh)return false;
    mesh.position.set(IX+x,FY+.15,IZ+z);mesh.scale.set(sx,sy,sz);mesh.rotation.y=angle;g.add(mesh);return true;
  };
  return {
    rug: (x, z) => box(5.5, 0.05, 4.5, P.rug, x, 0.18, z),
    stove: (x, z) => { box(2.4, 1.6, 1.7, M.metal, x, 0.8, z); box(1.2, 0.7, 0.12, M.fire, x, 0.7, z + 0.86); box(0.5, 1.9, 0.5, M.stone, x + 0.95, 2.4, z); box(0.6, 0.25, 0.6, M.dark, x - 0.4, 1.75, z); box(0.6, 0.25, 0.6, M.dark, x + 0.5, 1.75, z); solid(x, z, 1.6); },
    bed: (x, z) => { box(2.2, 0.5, 3.4, M.wood, x, 0.4, z); box(2.0, 0.3, 3.2, M.cloth, x, 0.75, z); box(1.9, 0.45, 0.8, M.white, x, 0.85, z - 1.2); solid(x, z, 1.7); },
    table: (x, z) => { if(!model('table',x,z)){box(2.6, 0.2, 1.5, M.wood, x, 1.0, z); for (const lx of [-1.1, 1.1]) for (const lz of [-0.55, 0.55]) box(0.16, 1.0, 0.16, M.wood, x + lx, 0.5, z + lz);} solid(x, z, 1.4); },
    counter: (x, z, w = 8) => { if(!model('counter',x,z,w/3)){box(w, 1.1, 1.3, M.wood, x, 0.55, z); box(w, 0.18, 1.5, M.dark, x, 1.18, z);} for (let dx = -w / 2 + 1.3; dx <= w / 2 - 1.3 + 0.01; dx += (w - 2.6) / 2) solid(x + dx, z, 1.5); },
    shelf: (x, z, vertical) => { const w = vertical ? 0.5 : 3, d = vertical ? 3 : 0.5; box(w, 3.2, d, M.wood, x, 1.6, z); for (let i = 0; i < 3; i++) box(w * 0.92, 0.12, d * 0.92, M.dark, x, 0.8 + i * 0.9, z); solid(x, z, vertical ? 1.4 : 1.6); },
    goods: (x, z, vertical) => { if(!model('stocked_shelf',x,z,1,1,1,vertical?(x<0?Math.PI/2:-Math.PI/2):0)){const w = vertical ? 0.5 : 3, d = vertical ? 3 : 0.5; box(w, 3.2, d, M.wood, x, 1.6, z); for (let i = 0; i < 6; i++) { const off = (i % 3 - 1) * 0.85, lvl = 0.95 + Math.floor(i / 3) * 0.95; box(0.45, 0.45, 0.45, GOODS[i], x + (vertical ? 0 : off), lvl, z + (vertical ? off : 0)); }} solid(x, z, vertical ? 1.4 : 1.6); },
    vault: (x, z) => { box(1.7, 1.9, 1.1, M.metal, x, 0.95, z); box(0.6, 0.6, 0.12, M.gold, x, 0.95, z + 0.56); solid(x, z, 1.1); },
    furnace: (x, z) => { if(!model('furnace',x,z)){box(2.6, 2.8, 2.4, M.stone, x, 1.4, z); box(1.3, 1.3, 0.2, M.fire, x, 1.0, z + 1.21); box(0.7, 2.2, 0.7, M.stone, x + 1.2, 3.6, z);} solid(x, z, 1.7); },
    anvil: (x, z) => { if(!model('anvil',x,z)){box(1.2, 1.0, 1.2, M.wood, x, 0.5, z); box(0.8, 0.6, 1.5, M.metal, x, 1.3, z); box(1.6, 0.4, 0.5, M.metal, x, 1.75, z);} solid(x, z, 1.0); },
    cauldron: (x, z) => { if(!model('cauldron',x,z)){box(1.5, 1.2, 1.5, M.metal, x, 0.7, z); box(1.3, 0.2, 1.3, M.green, x, 1.25, z); box(0.2, 1.3, 0.2, M.dark, x - 0.95, 0.65, z); box(0.2, 1.3, 0.2, M.dark, x + 0.95, 0.65, z);} solid(x, z, 1.1); },
    craft: (x, z) => { box(2.8, 0.25, 1.5, M.wood, x, 1.0, z); for (const lx of [-1.2, 1.2]) for (const lz of [-0.6, 0.6]) box(0.16, 1.0, 0.16, M.wood, x + lx, 0.5, z + lz); box(0.35, 0.35, 0.35, M.cyan, x, 1.3, z); solid(x, z, 1.5); },
    barrel: (x, z) => { if(!model('barrel',x,z,.95,1,.95))box(0.95, 1.3, 0.95, M.wood, x, 0.65, z); solid(x, z, 0.7); },
    lamp: (x, z) => { box(0.16, 2.6, 0.16, M.dark, x, 1.3, z); box(0.5, 0.5, 0.5, M.win, x, 2.7, z); },
  };
}

// TEMPLATES(f, st, keeper, patron) — furniture in the north half, service stations
// and NPCs placed on the open (south) side so the solids never block interaction.
const TEMPLATES = {
  home(f, st) { f.rug(-1, 1); f.stove(-5.5, -4); st('cook', 'Stove', -5.5, -2); f.bed(5, -3.6); st('bed', 'Bed (rest)', 5, -1.4); f.table(-1, 3); f.shelf(-7.2, -1, true); f.lamp(6.6, 4.6); },
  tavern(f, st, keeper, patron) { f.counter(0, -4.5, 9); keeper(0, -5.5, 0xffd45f, 'Tavern Keeper'); st('tavern', 'Order drinks', 0, -2.6); f.stove(6.4, -4.5); st('cook', 'Stove', 6.4, -2.6); f.table(-4.5, 2); f.table(4, 2); patron(-4.5, 3.4, 0x9bd0ff); patron(4, 3.4, 0xff9d6b); f.barrel(-7.2, -2); f.barrel(-7.2, -0.6); f.lamp(-6.6, 5.4); f.lamp(6.6, 5.4); },
  bank(f, st, keeper) { f.counter(0, -4, 9); keeper(0, -5, 0x9bb0ff, 'Banker'); st('bank', 'Bank vault', 0, -2); f.vault(-6.2, -5); f.vault(6.2, -5); f.lamp(-6.6, 4.8); f.lamp(6.6, 4.8); },
  store(f, st, keeper) { f.counter(0, -4, 9); keeper(0, -5, 0x9bf2ff, 'Shopkeeper'); st('shop', 'Shop counter', 0, -2); f.goods(-7.2, -1, true); f.goods(7.2, -1, true); f.goods(0, -6, false); f.lamp(-6, 5.4); },
  forge(f, st, keeper) { f.furnace(-5, -4.5); st('furnace', 'Furnace', -5, -2.5); f.anvil(3.5, -4); keeper(5.6, -5, 0xff9a5a, 'Blacksmith'); st('anvil', 'Anvil', 3.5, -2); f.shelf(-7.2, 2.5, true); f.barrel(6.8, 2.5); f.lamp(6.6, 5.2); },
  workshop(f, st, keeper) { f.craft(-3.5, -4); keeper(-3.5, -5, 0x9bf2ff, 'Artisan'); st('craft', 'Crafting bench', -3.5, -2); f.cauldron(4.5, -4); st('cauldron', 'Cauldron', 4.5, -2); f.shelf(-7.2, 3, true); f.shelf(7.2, 3, true); f.lamp(6.6, 5.2); },
};

export function createInteriors(scene) {
  const root = new THREE.Group(); scene.add(root); root.visible = false;
  const lamp = new THREE.PointLight(0xffe2b0, 0.85, 38); lamp.position.set(IX, 4.4, IZ); root.add(lamp);   // cozy warmth, only lit while a room is shown
  const cache = {};

  // biome accent: 1-2 small props that say "this room belongs to <biome>" on top of
  // the tinted shell. Each is placed in a corner that the templates leave empty.
  function buildAccent(biome, box, solid, g) {
    const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
    const ico = (geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    switch (biome) {
      case 'snow': case 'aurora': case 'sky':                                     // a wall banner + a fur-topped chest by the wall
        box(0.1, 2.4, 1.6, mat(0x3a4a6a), -HW + 0.25, 1.2, -1.5); box(1.6, 0.3, 1.6, M.white, 5.6, 0.5, 3.6); break;
      case 'volcanic': case 'obsidian': case 'cinder': {                           // a corner brazier with a glowing ember
        box(0.9, 0.7, 0.9, M.metal, -6.4, 0.55, 5.4); ico(new THREE.IcosahedronGeometry(0.3, 0), glow(0xff7a33), -6.4, 1.1, 5.4); solid(-6.4, 5.4, 0.7); break; }
      case 'fae': case 'crystal': {                                               // a glowing crystal on a stand
        box(0.5, 0.8, 0.5, M.stone, -6.4, 0.4, 5.4); ico(new THREE.OctahedronGeometry(0.34, 0), glow(0x8af0ff), -6.4, 1.5, 5.4); solid(-6.4, 5.4, 0.6); break; }
      case 'jungle': case 'swamp': case 'saltmarsh': case 'lagoon':               // hanging vines down the side wall
        for (let i = 0; i < 3; i++) box(0.18, 2.0 - i * 0.3, 0.12, mat(0x3f8f3f), HW - 0.2, 3.6 - i * 0.6, 2 + i * 1.4); break;
      case 'desert': case 'badlands':                                             // a pottery jar + a woven wall hanging
        box(0.8, 1.0, 0.8, mat(0xc07a3a), -6.4, 0.5, 5.4); solid(-6.4, 5.4, 0.6); box(0.1, 1.6, 1.2, mat(0xb06a3a), HW - 0.2, 3.0, 0); break;
      case 'autumn': case 'forest':                                               // a basket of gourds + a woodpile
        box(0.9, 0.5, 0.9, mat(0x8a5a2e), -6.4, 0.25, 5.4); ico(new THREE.IcosahedronGeometry(0.28, 0), mat(0xd85a26), -6.4, 0.7, 5.4); for (let i = 0; i < 2; i++) box(0.7, 0.3, 0.7, mat(0x6e4a2b), 5.8, 0.18 + i * 0.3, 5.0); break;
      case 'highland':                                                            // a mounted shield on the wall
        box(0.1, 1.2, 1.2, M.metal, -HW + 0.2, 2.6, 2); ico(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 8), mat(0x9a3a2a), -HW + 0.25, 2.6, 2).rotation.x = Math.PI / 2; break;
      case 'twilight':                                                            // an extra hanging lantern
        box(0.1, 0.4, 0.1, M.dark, -6.4, 3.4, 5.4); ico(new THREE.IcosahedronGeometry(0.2, 0), glow(0x4fd6dc), -6.4, 2.9, 5.4); break;
      case 'umbral':                                                              // a dark candle stand
        box(0.12, 1.8, 0.12, M.dark, -6.4, 0.9, 5.4); ico(new THREE.IcosahedronGeometry(0.16, 0), glow(0xb08adf), -6.4, 2.0, 5.4); break;
      default: break;                                                             // grass + unknown: no extra prop
    }
  }

  function buildType(type, biome) {
    const g = new THREE.Group(); root.add(g); g.visible = false;
    const stations = [], solids = [];
    const pal = PAL(biome), P = { floor: mat(pal.floor), wall: mat(pal.wall), beam: mat(pal.beam), rug: mat(pal.rug) };
    const box = (w,h,d,m,x,y,z) => roomBox(g,w,h,d,m,x,y,z,m===P.wall);
    const st = (kind, label, x, z) => stations.push({ kind, label, x: IX + x, z: IZ + z, y: FY });
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const person = (x, z, color) => { roomPerson(g,x,z,color); solid(x, z, 0.8); };
    const keeper = (x, z, color) => person(x, z, color);                                   // stands behind the counter; template adds the service station in front
    const patron = (x, z, color) => { person(x, z, color); st('patron', 'Chat with a patron', x, z + 1.2); };
    // shell: floor, walls (south wall split for a doorway), beams, windows, door mat — tinted to the biome
    box(RW, 0.3, RD, P.floor, 0, 0, 0);
    box(RW, WALL_H, 0.4, P.wall, 0, WALL_H / 2, -HD);
    box(0.4, WALL_H, RD, P.wall, -HW, WALL_H / 2, 0);
    box(0.4, WALL_H, RD, P.wall, HW, WALL_H / 2, 0);
    const seg = (RW - 3.2) / 2;
    box(seg, WALL_H, 0.4, P.wall, -(1.6 + seg / 2), WALL_H / 2, HD);
    box(seg, WALL_H, 0.4, P.wall, (1.6 + seg / 2), WALL_H / 2, HD);
    box(3.4, 1.3, 0.4, P.wall, 0, WALL_H - 0.65, HD);
    for (let i = -1; i <= 1; i++) box(RW, 0.28, 0.28, P.beam, 0, WALL_H - 0.18, i * RD / 3);   // exposed ceiling beams in the biome's wood tone
    box(2.4, 1.8, 0.12, M.win, -4, 3, -HD + 0.3);
    box(2.4, 1.8, 0.12, M.win, 4, 3, -HD + 0.3);
    for(const x of [-4,4]){
      for(const dx of [-1.26,0,1.26])box(.1,2,.18,P.beam,x+dx,3,-HD+.42);
      for(const y of [2.03,3,3.97])box(2.6,.1,.18,P.beam,x,y,-HD+.42);
    }
    box(3, 0.06, 1.4, M.cloth, 0, 0.2, HD - 1.5);
    st('exit', 'Exit to town', 0, HD - 1.5);
    const f = furniture(box, solid, P, g);
    (TEMPLATES[type] || TEMPLATES.home)(f, st, keeper, patron);
    buildAccent(biome, box, solid, g);
    cache[type + '|' + biome] = { group: g, stations, solids, lamp: pal.lamp };
  }

  // The capital's grand castle interior — one large multi-room hall: a throne room with
  // the crowned King (north), a great feast hall (centre), a barracks/armoury (west wing),
  // a library with the court mage (east wing), and the royal treasury (behind). Internal
  // partition walls + wide doorways connect the rooms; the player roams one big bounds.
  function buildCastle(biome) {
    const g = new THREE.Group(); root.add(g); g.visible = false;
    const stations = [], solids = [];
    const P = { floor: mat(0x8a7048), wall: mat(0xcdc2a4), beam: mat(0x5a4632), rug: mat(0x8a2438), stone: mat(0x9aa0b0), robe: mat(0x6a2f9a) };
    const box = (w,h,d,m,x,y,z) => roomBox(g,w,h,d,m,x,y,z,m===P.wall||(m===P.stone&&h>3&&(w<=.55||d<=.55)));
    const cyl = (rt, rb, h, m, x, y, z, s = 8) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const ico = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const wallSolids = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 2)); for (let i = 0; i <= n; i++) { const t = i / n; solid(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 1.2); } };
    const st = (o) => stations.push(Object.assign({ y: FY }, o, { x: IX + o.x, z: IZ + o.z }));
    const person = (x, z, color) => { roomPerson(g,x,z,color,{armor:color===0x8a93ad,ground:z===-12.4?.4:.15}); solid(x, z, 0.8); };
    const banner = (x, z) => { box(1.35,.1,.14,M.gold,x,4.75,z); box(1.1,2.6,.08,P.robe,x,3.4,z+.06); box(.09,2.4,.09,M.gold,x-.48,3.4,z+.11); box(.09,2.4,.09,M.gold,x+.48,3.4,z+.11); roomModel(g,'hero_shield',x,z+.14,.75,.75,.75,0,3.65,0xe8bf66); };
    const brazier = (x, z) => { roomModel(g,'cauldron',x,z,.47,.65,.47); solid(x, z, 0.5); };
    const HX = 22, HZ = 18, WH = 6.5;
    // shell (south wall split for the entry)
    box(HX * 2, 0.3, HZ * 2, P.floor, 0, 0, 0);
    box(HX * 2, WH, 0.5, P.wall, 0, WH / 2, -HZ); box(0.5, WH, HZ * 2, P.wall, -HX, WH / 2, 0); box(0.5, WH, HZ * 2, P.wall, HX, WH / 2, 0);
    const dg = 4, sseg = (HX * 2 - dg) / 2;
    box(sseg, WH, 0.5, P.wall, -(dg / 2 + sseg / 2), WH / 2, HZ); box(sseg, WH, 0.5, P.wall, (dg / 2 + sseg / 2), WH / 2, HZ); box(dg + 1.4, 1.5, 0.5, P.wall, 0, WH - 0.75, HZ);
    for (let i = -3; i <= 3; i++) box(HX * 2, 0.32, 0.32, P.beam, 0, WH - 0.2, i * HZ / 3.5);
    const glass=(color)=>{const material=mat(color);material.emissive.setHex(color);material.emissiveIntensity=.18;return material;};
    const amberGlass=glass(0xd4b46f),blueGlass=glass(0x8aaebc);
    for(const wx of [-4,0,4]){
      box(2.6,3,.12,wx===0?amberGlass:blueGlass,wx,3.6,-HZ+.32);
      for(const dx of [-1.36,0,1.36])box(.12,3.2,.2,P.beam,wx+dx,3.6,-HZ+.44);
      for(const y of [2.05,3.6,5.15])box(2.8,.12,.2,P.beam,wx,y,-HZ+.44);
    }
    for(const wz of [-8,0,8])for(const side of [-1,1]){
      const wx=side*(HX-.3);box(.12,2.2,2,blueGlass,wx,3.4,wz);
      for(const dz of [-1.06,0,1.06])box(.2,2.4,.1,P.beam,wx-side*.1,3.4,wz+dz);
      for(const y of [2.25,4.55])box(.2,.1,2.2,P.beam,wx-side*.1,y,wz);
    }
    box(5, 0.05, HZ * 2 - 3, P.rug, 0, 0.18, 0);   // crimson runner
    box(3.2, 0.06, 1.4, P.rug, 0, 0.2, HZ - 2);
    st({ kind: 'exit', label: 'Exit to Crownhaven', x: 0, z: HZ - 2 });
    // internal partitions → west/east wings (wide central doorway into each)
    for (const sx of [-1, 1]) { const wx = sx * 8; box(0.5, WH, 9, P.stone, wx, WH / 2, -9.5); box(0.5, WH, 6, P.stone, wx, WH / 2, 12); wallSolids(wx, -14, wx, -5); wallSolids(wx, 9, wx, 15); }
    wallSolids(-HX, -HZ, HX, -HZ); wallSolids(-HX, -HZ, -HX, HZ); wallSolids(HX, -HZ, HX, HZ); wallSolids(-HX, HZ, -(dg / 2), HZ); wallSolids(dg / 2, HZ, HX, HZ);
    // THRONE ROOM
    box(9, 0.4, 5, P.stone, 0, 0.2, -14); box(7, 0.4, 3.5, P.stone, 0, 0.5, -14);   // dais steps
    box(1.8,2.6,.25,P.robe,0,1.9,-15.1); box(2.2,.22,.85,P.robe,0,.88,-14.85);
    for(const x of [-1,1]){box(.17,2.9,.2,M.gold,x,2,-15.1);box(.15,.5,.6,M.wood,x,1.32,-14.9);}
    box(2.2,.17,.27,M.gold,0,3.42,-15.1); roomModel(g,'hero_shield',0,-14.94,.75,.75,.75,0,2.95,0xe8bf66);
    for (const dx of [-3.4, 0, 3.4]) solid(dx, -13.6, 1.7);   // the dais halts you right before the King (in earshot of the throne)
    roomPerson(g,0,-14.2,0x936bb1,{ground:.7});
    cyl(.29,.27,.15,M.gold,0,2.77,-14.2,8);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const tip=new THREE.Mesh(new THREE.ConeGeometry(.055,.22,4),M.gold);tip.position.set(IX+Math.sin(a)*.25,FY+2.94,IZ-14.2+Math.cos(a)*.25);g.add(tip);}
    st({ kind: 'talk', label: 'Address the King', x: 0, z: -11.4, dialogue: 'king', npcKey: 'king' });
    banner(-7, -HZ + 0.7); banner(7, -HZ + 0.7); brazier(-6.5, -13); brazier(6.5, -13);
    for (const s of [-1, 1]) { person(s * 3.6, -12.4, 0x8a93ad, 0x2a2018); box(0.1, 3.0, 0.1, M.stone, s * 3.6 + 0.5, 1.5, -12.4); ico(0.16, M.metal, s * 3.6 + 0.5, 3.05, -12.4); }
    // GREAT HALL — feast tables FLANK the central carpet so the aisle to the throne stays clear
    for (const tx of [-6, 6]) {
      roomModel(g,'table',tx,1,2.5,1,2.6/1.5,Math.PI/2); solid(tx, -0.6, 1.6); solid(tx, 2.6, 1.6);
      for(const tz of [-1.1,1,3.1]){cyl(.28,.3,.045,M.stone,tx,1.28,tz);cyl(.095,.08,.24,M.gold,tx+.55,1.38,tz);}
    }
    person(4, 6, 0xffd45f, 0x5a4326); st({ kind: 'talk', label: 'Speak with the Steward', x: 4, z: 7, dialogue: 'steward', npcKey: 'steward' });
    // WEST WING — barracks / armoury
    box(0.4, 3.2, 6, M.wood, -HX + 1, 1.6, -1); for (let i = 0; i < 3; i++) box(0.36, 0.12, 5.4, M.dark, -HX + 1.1, 0.9 + i * 0.9, -1);
    for (let s = 0; s < 4; s++) box(0.1, 1.7, 0.1, M.stone, -HX + 1.5, 1.35, -3 + s * 1.3);   // racked spears
    roomModel(g,'anvil',-16,4); solid(-16, 4, 1.0); st({ kind: 'anvil', label: 'Armoury Anvil', x: -16, z: 5.4 });
    roomModel(g,'counter',-14.5,9,4/3,1,.8); solid(-14.5, 9, 1.6); person(-14.5, 10, 0xff9a5a, 0x2a2018); st({ kind: 'shop', label: 'Quartermaster', x: -14.5, z: 7.6 });
    person(-18, -3, 0x8a93ad, 0x2a2018); person(-13, -5, 0x8a93ad, 0x3a2a20); brazier(-HX + 2.4, -13);
    // EAST WING — library / court mage
    for (const sz of [-6, 0, 6]) roomModel(g,'stocked_shelf',HX-1,sz,3.2/3,3.4/3.2,1,-Math.PI/2);
    cyl(2,2,.035,mat(0x6d5687),15,.18,4,16);cyl(.48,.6,.7,P.stone,15,.53,4);cyl(.65,.48,.12,M.gold,15,.94,4);ico(.22,mat(0xb5a4d4),15,1.17,4); st({ kind: 'rune', label: 'Court Enchanter’s Circle', x: 15, z: 5.8 });
    person(13, 9, 0x9b6bff, 0x6a5a8a); st({ kind: 'talk', label: 'Consult the Court Mage', x: 13, z: 7.6, dialogue: 'courtmage', npcKey: 'courtmage' });
    roomModel(g,'table',16.5,-8,2.4/2.6,1,1.4/1.5);box(.65,.09,.42,M.dark,16.5,1.3,-8);box(.6,.04,.38,M.stone,16.5,1.365,-8);cyl(.12,.09,.26,M.gold,17.15,1.4,-8);
    // TREASURY (NE)
    roomVault(g,box,18,-14); solid(18, -14, 1.1); st({ kind: 'bank', label: 'Royal Treasury', x: 18, z: -12.4 });
    for (const gx of [15.5, 19.5]) { box(0.8, 0.5, 0.8, M.gold, gx, 0.25, -11.5); ico(0.2, M.gold, gx, 0.6, -11.5); }
    // Roof fixtures disappear with the cutaway roof; low lantern holders frame the walls.
    for(const x of [-HX+.7,HX-.7])for(const z of [-11,11])roomModel(g,'lantern',x,z,.65,.8,.65,x<0?Math.PI/2:-Math.PI/2);
    cache['castle|' + biome] = { group: g, stations, solids, lamp: 0xffdf9a, bounds: { minX: IX - HX + 1.2, maxX: IX + HX - 1.2, minZ: IZ - HZ + 1.2, maxZ: IZ + HZ - 1.2, y: FY }, entry: { x: IX, z: IZ + HZ - 3.5 } };
  }

  // The Necropolis cathedral interior — a haunted nave: a spectral consecration altar and the
  // High Priest at the head, pews/tombs down a green aisle, a tomb-vault, and will-o'-wisp light.
  function buildCathedral(biome) {
    const g = new THREE.Group(); root.add(g); g.visible = false;
    const stations = [], solids = [];
    const P = { floor: mat(0x84918f), wall: mat(0x97a4a2), beam: mat(0x475451), stone: mat(0x8c9696), rug: mat(0x456c5b) };
    const box = (w,h,d,m,x,y,z) => roomBox(g,w,h,d,m,x,y,z,m===P.wall);
    const ico = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const wallSolids = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 2)); for (let i = 0; i <= n; i++) { const t = i / n; solid(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 1.2); } };
    const st = (o) => stations.push(Object.assign({ y: FY }, o, { x: IX + o.x, z: IZ + o.z }));
    const ghost = (x, z, color) => { roomPerson(g,x,z,color,{cap:0x769283}); solid(x, z, 0.8); };
    const candle = (x, z) => roomModel(g,'lantern',x,z,.6,.75,.6,x<0?0:Math.PI);
    P.floor.userData.flooring='paving';
    const HX = 11, HZ = 20, WH = 8;
    box(HX * 2, 0.3, HZ * 2, P.floor, 0, 0, 0);
    box(HX * 2, WH, 0.5, P.wall, 0, WH / 2, -HZ); box(0.5, WH, HZ * 2, P.wall, -HX, WH / 2, 0); box(0.5, WH, HZ * 2, P.wall, HX, WH / 2, 0);
    const dg = 4, sseg = (HX * 2 - dg) / 2; box(sseg, WH, 0.5, P.wall, -(dg / 2 + sseg / 2), WH / 2, HZ); box(sseg, WH, 0.5, P.wall, (dg / 2 + sseg / 2), WH / 2, HZ); box(dg + 1.4, 2, 0.5, P.wall, 0, WH - 1, HZ);
    for (let i = -4; i <= 4; i++) box(HX * 2, 0.3, 0.3, P.beam, 0, WH - 0.2, i * HZ / 4.5);
    for(const wz of [-12,-4,4,12])for(const side of [-1,1]){
      const wx=side*(HX-.3);box(.12,3.6,1.6,mat(0x73aa99),wx,4.2,wz);
      for(const dz of [-.86,0,.86])box(.22,3.8,.1,P.stone,wx-side*.08,4.2,wz+dz);
      for(const y of [2.35,4.2,6.05])box(.22,.12,1.82,P.stone,wx-side*.08,y,wz);
    }
    const rose=new THREE.Mesh(new THREE.CircleGeometry(1.7,12),mat(0x90b7a6));rose.position.set(IX,FY+5,IZ-HZ+.32);g.add(rose);
    const frame=new THREE.Mesh(new THREE.TorusGeometry(1.7,.14,4,12),P.stone);frame.position.copy(rose.position);frame.position.z+=.08;g.add(frame);
    for(let i=0;i<4;i++){const bar=box(.12,3.25,.16,P.stone,0,5,-HZ+.44);bar.rotation.z=i*Math.PI/4;}
    box(4, 0.05, HZ * 2 - 3, P.rug, 0, 0.18, 0);
    st({ kind: 'exit', label: 'Exit to Gravehallow', x: 0, z: HZ - 2 });
    wallSolids(-HX, -HZ, HX, -HZ); wallSolids(-HX, -HZ, -HX, HZ); wallSolids(HX, -HZ, HX, HZ); wallSolids(-HX, HZ, -(dg / 2), HZ); wallSolids(dg / 2, HZ, HX, HZ);
    box(6,.5,3,P.stone,0,.25,-16);
    box(2.2,.16,1.4,M.stone,0,.65,-16);box(2.2,.18,1.4,M.stone,0,1.51,-16);
    for(const x of [-.85,.85]){box(.26,.75,1.12,P.stone,x,1.08,-16);roomModel(g,'hero_shield',x,-15.41,.48,.48,.48,0,1.1,0x86b29b);}
    box(1.2,.06,.84,mat(0x467964),0,1.63,-16);box(.7,.08,.52,M.dark,0,1.7,-16);box(.64,.035,.46,M.stone,0,1.76,-16);
    candleStand(g,-.82,-16,0xa5e5ba,1.84);candleStand(g,.82,-16,0xa5e5ba,1.84);
    for (const dx of [-2.8, 0, 2.8]) solid(dx, -14.6, 1.5);
    st({ kind: 'altar', label: 'Consecration Altar', x: 0, z: -13 });
    ghost(3, -13, 0xbfe0d0); st({ kind: 'talk', label: 'Speak with the High Priest', x: 3, z: -11.6, dialogue: 'highpriest', npcKey: 'highpriest' });
    candle(-4.5, -16); candle(4.5, -16);
    for (const tz of [-6, 2, 10]) for (const tx of [-6, 6]) { carvedBench(g,box,tx,tz,P.beam); solid(tx, tz, 1.4); }
    for (const cz of [-10, 0, 10]) { candle(-9, cz); candle(9, cz); }
    roomVault(g,box,-8.5,-16,0x697f79); solid(-8.5, -16, 1.1); st({ kind: 'bank', label: 'Tomb Vault', x: -8.5, z: -14.4 });
    cache['cathedral|' + biome] = { group: g, stations, solids, lamp: 0x7cffb0, bounds: { minX: IX - HX + 1.2, maxX: IX + HX - 1.2, minZ: IZ - HZ + 1.2, maxZ: IZ + HZ - 1.2, y: FY }, entry: { x: IX, z: IZ + HZ - 3.5 } };
  }

  // Karak-Vol's forge-hall — a molten dwarven smithy: the Forge-Master at a great anvil, rows of
  // furnaces + master anvils, glowing lava channels, a magma-vault, and forge-glow light.
  function buildForgeHall(biome) {
    const g = new THREE.Group(); root.add(g); g.visible = false;
    const stations = [], solids = [];
    const P = { floor: mat(0x60534b), wall: mat(0x78695e), beam: mat(0x362b24), stone: mat(0x6b5b50) };
    P.floor.userData.flooring='paving';
    const box = (w,h,d,m,x,y,z) => roomBox(g,w,h,d,m,x,y,z,m===P.wall);
    const ico = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const wallSolids = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 2)); for (let i = 0; i <= n; i++) { const t = i / n; solid(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 1.2); } };
    const st = (o) => stations.push(Object.assign({ y: FY }, o, { x: IX + o.x, z: IZ + o.z }));
    const dwarf = (x, z, color) => { roomPerson(g,x,z,color,{height:.79,width:1.13,beard:0x9b7044,cap:0x4f4541}); solid(x, z, 0.8); };
    const furnace = (x, z) => { roomModel(g,'furnace',x,z,1.1,1.08,1.1); solid(x, z, 1.6); };
    const anvil = (x, z) => { roomModel(g,'anvil',x,z,1,1,1,0,z===-13?.4:.15); solid(x, z, 1.0); };
    const HX = 14, HZ = 16, WH = 7;
    box(HX * 2, 0.3, HZ * 2, P.floor, 0, 0, 0);
    box(HX * 2, WH, 0.5, P.wall, 0, WH / 2, -HZ); box(0.5, WH, HZ * 2, P.wall, -HX, WH / 2, 0); box(0.5, WH, HZ * 2, P.wall, HX, WH / 2, 0);
    const dg = 4, sseg = (HX * 2 - dg) / 2; box(sseg, WH, 0.5, P.wall, -(dg / 2 + sseg / 2), WH / 2, HZ); box(sseg, WH, 0.5, P.wall, (dg / 2 + sseg / 2), WH / 2, HZ); box(dg + 1.4, 1.6, 0.5, P.wall, 0, WH - 0.8, HZ);
    for (let i = -3; i <= 3; i++) box(HX * 2, 0.32, 0.32, P.beam, 0, WH - 0.2, i * HZ / 3.5);
    // Low iron grates make the forge channels visibly walkable at the existing floor height.
    const grateOffsets=[];
    for(const x of [-9,9]){
      box(1.6,.025,HZ*2-3,mat(0x9a4625),x,.174,0);
      for(const dx of [-.76,.76])box(.085,.055,HZ*2-3,M.metal,x+dx,.195,0);
      for(let z=-14;z<=14.001;z+=.7)grateOffsets.push([x,z]);
    }
    const grates=new THREE.InstancedMesh(new THREE.BoxGeometry(1.48,.045,.09),M.metal,grateOffsets.length),grateMatrix=new THREE.Matrix4();
    grateOffsets.forEach(([x,z],i)=>{grateMatrix.makeTranslation(IX+x,FY+.205,IZ+z);grates.setMatrixAt(i,grateMatrix);});grates.instanceMatrix.needsUpdate=true;g.add(grates);
    st({ kind: 'exit', label: 'Exit to Karak-Vol', x: 0, z: HZ - 2 });
    wallSolids(-HX, -HZ, HX, -HZ); wallSolids(-HX, -HZ, -HX, HZ); wallSolids(HX, -HZ, HX, HZ); wallSolids(-HX, HZ, -(dg / 2), HZ); wallSolids(dg / 2, HZ, HX, HZ);
    box(3.5, 0.4, 4, P.stone, 0, 0.2, -13); anvil(0, -13); dwarf(2.2, -12, 0xff9a5a);   // leave the Forge-Master's boots clear of the raised anvil plinth
    for (const dx of [-2.6, 2.6]) solid(dx, -13, 1.4);
    st({ kind: 'talk', label: 'Speak with the Forge-Master', x: 0, z: -10.5, dialogue: 'forgemaster', npcKey: 'forgemaster' });
    furnace(-11, -6); st({ kind: 'furnace', label: 'Great Furnace', x: -11, z: -4 }); furnace(11, -6); st({ kind: 'furnace', label: 'Great Furnace', x: 11, z: -4 });
    anvil(-11, 4); st({ kind: 'anvil', label: 'Master Anvil', x: -11, z: 6 }); anvil(11, 4); st({ kind: 'anvil', label: 'Master Anvil', x: 11, z: 6 });
    for (const [sx, sz] of [[-6, -13], [6, -13]]) { roomModel(g,'crate',sx,sz,1.1,.65,1.1);for(const dx of [-.3,.3])box(.42,.18,.8,M.metal,sx+dx,.98,sz); }
    roomVault(g,box,-12,12,0x726053); solid(-12, 12,1.1); st({ kind: 'bank', label: 'Magma Vault', x: -12, z: 10.4 });
    for(const x of [-HX+.6,HX-.6])for(const z of [-12,0,9])roomModel(g,'lantern',x,z,.6,.9,.6,x<0?Math.PI/2:-Math.PI/2);
    cache['forgehall|' + biome] = { group: g, stations, solids, lamp: 0xff8a3a, bounds: { minX: IX - HX + 1.2, maxX: IX + HX - 1.2, minZ: IZ - HZ + 1.2, maxZ: IZ + HZ - 1.2, y: FY }, entry: { x: IX, z: IZ + HZ - 3.5 } };
  }

  // Duskport's thieves' den — a lantern-lit black-market hall: the Fence's counter, the Guildmaster
  // at the back, a stash-vault, a gambling table with shady patrons, and violet guild-glow.
  function buildGuildhall(biome) {
    const g = new THREE.Group(); root.add(g); g.visible = false;
    const stations = [], solids = [];
    const P = { floor: mat(0x665b5e), wall: mat(0x777181), beam: mat(0x433b45), stone: mat(0x53515f), rug: mat(0x51415f) };
    const box = (w,h,d,m,x,y,z) => roomBox(g,w,h,d,m,x,y,z,m===P.wall);
    const ico = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const wallSolids = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 2)); for (let i = 0; i <= n; i++) { const t = i / n; solid(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 1.2); } };
    const st = (o) => stations.push(Object.assign({ y: FY }, o, { x: IX + o.x, z: IZ + o.z }));
    const person = (x, z, color, hat) => { roomPerson(g,x,z,color,{cap:hat||0x423e4c,angle:x===6.4?Math.PI/2:0}); solid(x, z, 0.8); };
    const lantern = (x, z) => roomModel(g,'lantern',x,z,.65,.8,.65,x<0?Math.PI/2:-Math.PI/2);
    const HX = 13, HZ = 15, WH = 6;
    box(HX * 2, 0.3, HZ * 2, P.floor, 0, 0, 0);
    box(HX * 2, WH, 0.5, P.wall, 0, WH / 2, -HZ); box(0.5, WH, HZ * 2, P.wall, -HX, WH / 2, 0); box(0.5, WH, HZ * 2, P.wall, HX, WH / 2, 0);
    const dg = 4, sseg = (HX * 2 - dg) / 2; box(sseg, WH, 0.5, P.wall, -(dg / 2 + sseg / 2), WH / 2, HZ); box(sseg, WH, 0.5, P.wall, (dg / 2 + sseg / 2), WH / 2, HZ); box(dg + 1.4, 1.4, 0.5, P.wall, 0, WH - 0.7, HZ);
    for (let i = -3; i <= 3; i++) box(HX * 2, 0.3, 0.3, P.beam, 0, WH - 0.2, i * HZ / 3.5);
    box(4, 0.05, HZ * 2 - 3, P.rug, 0, 0.18, 0);
    box(2.3,2.5,.12,P.beam,0,3.75,-HZ+.32);roomModel(g,'hero_shield',0,-HZ+.43,2.2,2.2,2.2,0,3.75,0x9783b2);
    st({ kind: 'exit', label: 'Exit to Duskport', x: 0, z: HZ - 2 });
    wallSolids(-HX, -HZ, HX, -HZ); wallSolids(-HX, -HZ, -HX, HZ); wallSolids(HX, -HZ, HX, HZ); wallSolids(-HX, HZ, -(dg / 2), HZ); wallSolids(dg / 2, HZ, HX, HZ);
    roomModel(g,'counter',0,-12,8/3,1,.8); for (let dx = -3; dx <= 3; dx += 3) solid(dx, -12, 1.5); person(0, -13.4, 0x8a6ad6, 0x14202e);
    st({ kind: 'talk', label: 'Speak with the Guildmaster', x: 0, z: -10.4, dialogue: 'vessa', npcKey: 'vessa' });
    roomModel(g,'counter',-9,4,2,1,.8); solid(-9, 4, 1.6); person(-9, 5, 0x6a2f3a, 0x3a2f4a); st({ kind: 'shop', label: 'The Fence (black market)', x: -9, z: 2.6 });
    roomVault(g,box,9,-12,0x606779); solid(9, -12, 1.1); st({ kind: 'bank', label: 'Stash Vault', x: 9, z: -10.4 });
    roomModel(g,'table',8,6,.85,1,1.35); solid(8, 6, 1.6);
    box(1.5,.035,1.2,mat(0x455e52),8,1.27,6);
    for(const [dx,dz] of [[-.3,-.2],[.12,.25]]){box(.13,.13,.13,M.stone,8+dx,1.35,6+dz);box(.035,.005,.035,M.dark,8+dx,1.418,6+dz);}
    person(6.4, 6, 0x3a5a7a, 0x14202e); st({ kind: 'patron', label: 'Sit in on the game', x: 6.4, z: 7.2 });
    person(-4, 8, 0x2e3650, 0x14202e); person(4, -4, 0x3a2f4a, 0x14202e);   // lurking patrons
    for(const x of [-HX+.6,HX-.6])for(const z of [-8,0,10])lantern(x,z);
    cache['guildhall|' + biome] = { group: g, stations, solids, lamp: 0xffce6a, bounds: { minX: IX - HX + 1.2, maxX: IX + HX - 1.2, minZ: IZ - HZ + 1.2, maxZ: IZ + HZ - 1.2, y: FY }, entry: { x: IX, z: IZ + HZ - 3.5 } };
  }

  function enter(type, biome) {
    const key = type + '|' + biome;
    if (!cache[key]) { if (type === 'castle') buildCastle(biome); else if (type === 'cathedral') buildCathedral(biome); else if (type === 'forgehall') buildForgeHall(biome); else if (type === 'guildhall') buildGuildhall(biome); else buildType(type, biome); }
    for (const k in cache) cache[k].group.visible = (k === key);
    lamp.color.setHex(cache[key].lamp);   // warm/cold/ember light to match the region
    root.visible = true;
    const c = cache[key];
    return {
      bounds: c.bounds || { minX: IX - HW + 1.2, maxX: IX + HW - 1.2, minZ: IZ - HD + 1.2, maxZ: IZ + HD - 1.2, y: FY },
      entry: c.entry || { x: IX, z: IZ + HD - 3 },
      stations: c.stations,
      solids: c.solids,
    };
  }
  function leave() { root.visible = false; }
  return { enter, leave };
}
