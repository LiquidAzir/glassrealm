import * as THREE from 'three';
import { rimLight } from './shaders.js';

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
};
const PAL = (b) => INT_PAL[b] || INT_PAL.grass;

// furniture pieces — each registers a solid obstacle so the player can't walk through it
function furniture(box, solid, P) {
  return {
    rug: (x, z) => box(5.5, 0.05, 4.5, P.rug, x, 0.18, z),
    stove: (x, z) => { box(2.4, 1.6, 1.7, M.metal, x, 0.8, z); box(1.2, 0.7, 0.12, M.fire, x, 0.7, z + 0.86); box(0.5, 1.9, 0.5, M.stone, x + 0.95, 2.4, z); box(0.6, 0.25, 0.6, M.dark, x - 0.4, 1.75, z); box(0.6, 0.25, 0.6, M.dark, x + 0.5, 1.75, z); solid(x, z, 1.6); },
    bed: (x, z) => { box(2.2, 0.5, 3.4, M.wood, x, 0.4, z); box(2.0, 0.3, 3.2, M.cloth, x, 0.75, z); box(1.9, 0.45, 0.8, M.white, x, 0.85, z - 1.2); solid(x, z, 1.7); },
    table: (x, z) => { box(2.6, 0.2, 1.5, M.wood, x, 1.0, z); for (const lx of [-1.1, 1.1]) for (const lz of [-0.55, 0.55]) box(0.16, 1.0, 0.16, M.wood, x + lx, 0.5, z + lz); solid(x, z, 1.4); },
    counter: (x, z, w = 8) => { box(w, 1.1, 1.3, M.wood, x, 0.55, z); box(w, 0.18, 1.5, M.dark, x, 1.18, z); for (let dx = -w / 2 + 1.3; dx <= w / 2 - 1.3 + 0.01; dx += (w - 2.6) / 2) solid(x + dx, z, 1.5); },
    shelf: (x, z, vertical) => { const w = vertical ? 0.5 : 3, d = vertical ? 3 : 0.5; box(w, 3.2, d, M.wood, x, 1.6, z); for (let i = 0; i < 3; i++) box(w * 0.92, 0.12, d * 0.92, M.dark, x, 0.8 + i * 0.9, z); solid(x, z, vertical ? 1.4 : 1.6); },
    goods: (x, z, vertical) => { const w = vertical ? 0.5 : 3, d = vertical ? 3 : 0.5; box(w, 3.2, d, M.wood, x, 1.6, z); for (let i = 0; i < 6; i++) { const off = (i % 3 - 1) * 0.85, lvl = 0.95 + Math.floor(i / 3) * 0.95; box(0.45, 0.45, 0.45, GOODS[i], x + (vertical ? 0 : off), lvl, z + (vertical ? off : 0)); } solid(x, z, vertical ? 1.4 : 1.6); },
    vault: (x, z) => { box(1.7, 1.9, 1.1, M.metal, x, 0.95, z); box(0.6, 0.6, 0.12, M.gold, x, 0.95, z + 0.56); solid(x, z, 1.1); },
    furnace: (x, z) => { box(2.6, 2.8, 2.4, M.stone, x, 1.4, z); box(1.3, 1.3, 0.2, M.fire, x, 1.0, z + 1.21); box(0.7, 2.2, 0.7, M.stone, x + 1.2, 3.6, z); solid(x, z, 1.7); },
    anvil: (x, z) => { box(1.2, 1.0, 1.2, M.wood, x, 0.5, z); box(0.8, 0.6, 1.5, M.metal, x, 1.3, z); box(1.6, 0.4, 0.5, M.metal, x, 1.75, z); solid(x, z, 1.0); },
    cauldron: (x, z) => { box(1.5, 1.2, 1.5, M.metal, x, 0.7, z); box(1.3, 0.2, 1.3, M.green, x, 1.25, z); box(0.2, 1.3, 0.2, M.dark, x - 0.95, 0.65, z); box(0.2, 1.3, 0.2, M.dark, x + 0.95, 0.65, z); solid(x, z, 1.1); },
    craft: (x, z) => { box(2.8, 0.25, 1.5, M.wood, x, 1.0, z); for (const lx of [-1.2, 1.2]) for (const lz of [-0.6, 0.6]) box(0.16, 1.0, 0.16, M.wood, x + lx, 0.5, z + lz); box(0.35, 0.35, 0.35, M.cyan, x, 1.3, z); solid(x, z, 1.5); },
    barrel: (x, z) => { box(0.95, 1.3, 0.95, M.wood, x, 0.65, z); solid(x, z, 0.7); },
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
    const box = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const st = (kind, label, x, z) => stations.push({ kind, label, x: IX + x, z: IZ + z, y: FY });
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const person = (x, z, color) => {   // a proper standing person (legs, clothed torso, distinct arms + hands, head, hair)
      const cloth = mat(color), dark = mat(0x2a2330);
      box(0.2, 0.7, 0.2, dark, x - 0.16, 0.35, z); box(0.2, 0.7, 0.2, dark, x + 0.16, 0.35, z);                       // legs
      box(0.64, 0.78, 0.4, cloth, x, 1.1, z);                                                                         // torso (clothes)
      box(0.18, 0.56, 0.2, cloth, x - 0.44, 1.18, z); box(0.16, 0.16, 0.16, M.skin, x - 0.44, 0.84, z);              // left arm + hand
      box(0.18, 0.56, 0.2, cloth, x + 0.44, 1.18, z); box(0.16, 0.16, 0.16, M.skin, x + 0.44, 0.84, z);              // right arm + hand
      const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), M.skin); h.position.set(IX + x, FY + 1.75, IZ + z); g.add(h);   // head
      box(0.42, 0.18, 0.42, mat(0x3a2a20), x, 1.95, z);                                                               // hair
      solid(x, z, 0.8);
    };
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
    box(3, 0.06, 1.4, M.cloth, 0, 0.2, HD - 1.5);
    st('exit', 'Exit to town', 0, HD - 1.5);
    const f = furniture(box, solid, P);
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
    const box = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const cyl = (rt, rb, h, m, x, y, z, s = 8) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const ico = (r, m, x, y, z) => { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); me.position.set(IX + x, FY + y, IZ + z); g.add(me); return me; };
    const solid = (x, z, r) => solids.push({ x: IX + x, z: IZ + z, r });
    const wallSolids = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 2)); for (let i = 0; i <= n; i++) { const t = i / n; solid(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 1.2); } };
    const st = (o) => stations.push(Object.assign({ y: FY }, o, { x: IX + o.x, z: IZ + o.z }));
    const person = (x, z, color, hair = 0x3a2a20) => { const cl = mat(color); box(0.2, 0.7, 0.2, M.dark, x - 0.16, 0.35, z); box(0.2, 0.7, 0.2, M.dark, x + 0.16, 0.35, z); box(0.64, 0.78, 0.4, cl, x, 1.1, z); box(0.18, 0.56, 0.2, cl, x - 0.44, 1.18, z); box(0.16, 0.16, 0.16, M.skin, x - 0.44, 0.84, z); box(0.18, 0.56, 0.2, cl, x + 0.44, 1.18, z); box(0.16, 0.16, 0.16, M.skin, x + 0.44, 0.84, z); ico(0.3, M.skin, x, 1.75, z); box(0.42, 0.18, 0.42, mat(hair), x, 1.95, z); solid(x, z, 0.8); };
    const banner = (x, z) => { box(0.14, 3.2, 0.02, P.stone, x, 4.4, z); box(1.1, 2.6, 0.08, P.robe, x, 3.4, z + 0.06); ico(0.22, M.gold, x, 4.7, z); };
    const brazier = (x, z) => { cyl(0.4, 0.5, 0.9, M.metal, x, 0.45, z); ico(0.35, M.fire, x, 1.1, z); solid(x, z, 0.5); };
    const HX = 22, HZ = 18, WH = 6.5;
    // shell (south wall split for the entry)
    box(HX * 2, 0.3, HZ * 2, P.floor, 0, 0, 0);
    box(HX * 2, WH, 0.5, P.wall, 0, WH / 2, -HZ); box(0.5, WH, HZ * 2, P.wall, -HX, WH / 2, 0); box(0.5, WH, HZ * 2, P.wall, HX, WH / 2, 0);
    const dg = 4, sseg = (HX * 2 - dg) / 2;
    box(sseg, WH, 0.5, P.wall, -(dg / 2 + sseg / 2), WH / 2, HZ); box(sseg, WH, 0.5, P.wall, (dg / 2 + sseg / 2), WH / 2, HZ); box(dg + 1.4, 1.5, 0.5, P.wall, 0, WH - 0.75, HZ);
    for (let i = -3; i <= 3; i++) box(HX * 2, 0.32, 0.32, P.beam, 0, WH - 0.2, i * HZ / 3.5);
    for (const wx of [-4, 0, 4]) box(2.6, 3.0, 0.14, glow(wx === 0 ? 0xffd47a : 0x9bd0ff), wx, 3.6, -HZ + 0.32);   // stained glass behind the throne
    for (const wz of [-8, 0, 8]) { box(0.14, 2.2, 2.0, glow(0x9bd0ff), -HX + 0.3, 3.4, wz); box(0.14, 2.2, 2.0, glow(0x9bd0ff), HX - 0.3, 3.4, wz); }
    box(5, 0.05, HZ * 2 - 3, P.rug, 0, 0.18, 0);   // crimson runner
    box(3.2, 0.06, 1.4, P.rug, 0, 0.2, HZ - 2);
    st({ kind: 'exit', label: 'Exit to Crownhaven', x: 0, z: HZ - 2 });
    // internal partitions → west/east wings (wide central doorway into each)
    for (const sx of [-1, 1]) { const wx = sx * 8; box(0.5, WH, 9, P.stone, wx, WH / 2, -9.5); box(0.5, WH, 6, P.stone, wx, WH / 2, 12); wallSolids(wx, -14, wx, -5); wallSolids(wx, 9, wx, 15); }
    wallSolids(-HX, -HZ, HX, -HZ); wallSolids(-HX, -HZ, -HX, HZ); wallSolids(HX, -HZ, HX, HZ); wallSolids(-HX, HZ, -(dg / 2), HZ); wallSolids(dg / 2, HZ, HX, HZ);
    // THRONE ROOM
    box(9, 0.4, 5, P.stone, 0, 0.2, -14); box(7, 0.4, 3.5, P.stone, 0, 0.5, -14);   // dais steps
    box(1.8, 2.6, 1.6, mat(0x6a2f7a), 0, 1.9, -15); box(2.2, 0.5, 1.8, mat(0x7a3f8a), 0, 1.2, -14.4); ico(0.3, M.gold, 0, 3.3, -15);   // throne
    for (const dx of [-3.4, 0, 3.4]) solid(dx, -13.6, 1.7);   // the dais halts you right before the King (in earshot of the throne)
    (function king() { const x = 0, z = -14.2, robe = P.robe; box(0.72, 0.95, 0.5, robe, x, 1.4, z); box(0.2, 0.6, 0.2, robe, x - 0.46, 1.45, z); box(0.16, 0.16, 0.16, M.skin, x - 0.46, 1.15, z); box(0.2, 0.6, 0.2, robe, x + 0.46, 1.45, z); box(0.16, 0.16, 0.16, M.skin, x + 0.46, 1.15, z); ico(0.32, M.skin, x, 2.15, z); box(0.55, 0.2, 0.28, mat(0xececef), x, 1.15, z + 0.22); box(0.42, 0.16, 0.42, M.gold, x, 2.34, z); for (let i = -2; i <= 2; i++) box(0.08, 0.24, 0.08, M.gold, x + i * 0.14, 2.55, z); })();
    st({ kind: 'talk', label: 'Address the King', x: 0, z: -11.4, dialogue: 'king', npcKey: 'king' });
    banner(-4.5, -HZ + 0.7); banner(4.5, -HZ + 0.7); brazier(-6.5, -13); brazier(6.5, -13);
    for (const s of [-1, 1]) { person(s * 3.6, -12.4, 0x8a93ad, 0x2a2018); box(0.1, 3.0, 0.1, M.stone, s * 3.6 + 0.5, 1.5, -12.4); ico(0.16, M.metal, s * 3.6 + 0.5, 3.05, -12.4); }
    // GREAT HALL — feast tables FLANK the central carpet so the aisle to the throne stays clear
    for (const tx of [-6, 6]) { box(2.6, 0.2, 6.5, M.wood, tx, 1.0, 1); for (const lz of [-2.2, 2.2]) box(0.24, 1.0, 0.24, M.wood, tx, 0.5, 1 + lz); solid(tx, -0.6, 1.6); solid(tx, 2.6, 1.6); box(0.5, 0.5, 0.5, M.gold, tx, 1.3, 1); ico(0.2, M.fire, tx, 1.35, -1.8); }
    person(4, 6, 0xffd45f, 0x5a4326); st({ kind: 'talk', label: 'Speak with the Steward', x: 4, z: 7, dialogue: 'steward', npcKey: 'steward' });
    // WEST WING — barracks / armoury
    box(0.4, 3.2, 6, M.wood, -HX + 1, 1.6, -1); for (let i = 0; i < 3; i++) box(0.36, 0.12, 5.4, M.dark, -HX + 1.1, 0.9 + i * 0.9, -1);
    for (let s = 0; s < 4; s++) box(0.1, 1.7, 0.1, M.stone, -HX + 1.5, 1.35, -3 + s * 1.3);   // racked spears
    box(1.2, 1.0, 1.2, M.wood, -16, 0.5, 4); box(1.6, 0.4, 0.5, M.metal, -16, 1.35, 4); solid(-16, 4, 1.0); st({ kind: 'anvil', label: 'Armoury Anvil', x: -16, z: 5.4 });
    box(4, 1.1, 1.3, M.wood, -14.5, 0.55, 9); solid(-14.5, 9, 1.6); person(-14.5, 10, 0xff9a5a, 0x2a2018); st({ kind: 'shop', label: 'Quartermaster', x: -14.5, z: 7.6 });
    person(-18, -3, 0x8a93ad, 0x2a2018); person(-13, -5, 0x8a93ad, 0x3a2a20); brazier(-HX + 2.4, -13);
    // EAST WING — library / court mage
    for (const sz of [-6, 0, 6]) { box(0.5, 3.4, 3.2, M.wood, HX - 1, 1.7, sz); for (let i = 0; i < 3; i++) box(0.46, 0.12, 3, M.dark, HX - 1.1, 0.9 + i * 0.95, sz); }
    cyl(2, 2, 0.1, glow(0x9b6bff), 15, 0.16, 4, 16); ico(0.4, glow(0xc6a8ff), 15, 1.4, 4); st({ kind: 'rune', label: 'Court Enchanter’s Circle', x: 15, z: 5.8 });
    person(13, 9, 0x9b6bff, 0x6a5a8a); st({ kind: 'talk', label: 'Consult the Court Mage', x: 13, z: 7.6, dialogue: 'courtmage', npcKey: 'courtmage' });
    box(2.4, 0.2, 1.4, M.wood, 16.5, 1.0, -8); ico(0.3, glow(0x8af0ff), 16.5, 1.4, -8);
    // TREASURY (NE)
    box(1.7, 1.9, 1.1, M.metal, 18, 0.95, -14); box(0.6, 0.6, 0.12, M.gold, 18, 0.95, -13.4); solid(18, -14, 1.1); st({ kind: 'bank', label: 'Royal Treasury', x: 18, z: -12.4 });
    for (const gx of [15.5, 19.5]) { box(0.8, 0.5, 0.8, M.gold, gx, 0.25, -11.5); ico(0.2, M.gold, gx, 0.6, -11.5); }
    // chandeliers
    for (const [lx, lz] of [[0, -6], [0, 6], [-14, 4], [14, 4]]) { box(0.1, 0.6, 0.1, M.dark, lx, WH - 0.6, lz); ico(0.4, M.win, lx, WH - 1.2, lz); }
    cache['castle|' + biome] = { group: g, stations, solids, lamp: 0xffdf9a, bounds: { minX: IX - HX + 1.2, maxX: IX + HX - 1.2, minZ: IZ - HZ + 1.2, maxZ: IZ + HZ - 1.2, y: FY }, entry: { x: IX, z: IZ + HZ - 3.5 } };
  }

  function enter(type, biome) {
    const key = type + '|' + biome;
    if (!cache[key]) { if (type === 'castle') buildCastle(biome); else buildType(type, biome); }
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
