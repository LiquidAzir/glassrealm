import * as THREE from 'three';
import { TAU, damp } from './util.js';
import { weaponOf } from './content.js';

const SPEED = 8.0;          // units/sec
const TURN = 2.4;           // rad/sec
const COAST_FWD = 0.42;
const COAST_TURN = 0.26;
const CAM_DIST = 9.5, CAM_HEIGHT = 5.2, CAM_LOOK = 3.0, HEAD_Y = 1.5;
const ATTACK_DUR = 0.34;
const GATHER_DUR = 0.6;

// Per-item held models: [shape, tint]. Shape drives the mesh, tint the colour, so
// every weapon shows a distinct, type-appropriate model in the hand.
const WEAPON_MODEL = {
  bronze_sword: ['sword', 0xb87333], iron_sword: ['sword', 0xc2ccd6], steel_sword: ['greatsword', 0xeaf2ff], bronze_dagger: ['dagger', 0xb87333],
  sun_blade: ['greatsword', 0xffd45f], wraithblade: ['greatsword', 0xcfc8b0], ashbringer: ['greatsword', 0xff5a2a],
  cinderforge_axe: ['axe', 0xff7a3a], coilfang_spear: ['spear', 0x4fd06a], tidecaller_trident: ['trident', 0x2bd6cf],
  corsair_cutlass: ['sword', 0xe0c060], barrow_blade: ['greatsword', 0x9bb0c0], mithril_sword: ['sword', 0x8fb8d8],
  oak_bow: ['bow', 0x8a5a2e], yew_bow: ['bow', 0x6e4a2b], stormstring_bow: ['longbow', 0x9bdcff], tempest_bow: ['longbow', 0xbfe6ff],
  apprentice_staff: ['staff', 0x9b6bff], ember_staff: ['staff', 0xff7a33], frost_staff: ['staff', 0x9bd0ff], prism_staff: ['staff', 0xc6a8ff], faewild_staff: ['staff', 0xff7af0],
  // frontier-region weapons (were falling back to generic models)
  brinecaller: ['trident', 0x35c8d6], reef_harpoon: ['spear', 0x2f9a8a], hyphae_lash: ['flail', 0x7ad06a], chord_staff: ['staff', 0xd0a8ff],
  skywarden_bow: ['longbow', 0x9bdcff], cinderveil_staff: ['staff', 0xff5a2a], obsidian_maul: ['warhammer', 0x2a2230],
  // big gear round
  bronze_mace: ['mace', 0xb87333], bronze_scimitar: ['scimitar', 0xb87333], oak_crossbow: ['crossbow', 0x8a5a2e], novice_wand: ['wand', 0x7cc0ff],
  iron_warhammer: ['warhammer', 0xc2ccd6], iron_halberd: ['halberd', 0xc2ccd6], steel_rapier: ['rapier', 0xeaf2ff], hunters_crossbow: ['crossbow', 0x9aa0a8], acolyte_grimoire: ['grimoire', 0x6a8aff],
  gravewarden_scythe: ['scythe', 0x9bb0c0], warlord_flail: ['flail', 0xc04040], shadow_claws: ['claw', 0x6a4a9a], dragoon_halberd: ['halberd', 0xff7a3a], seraph_blade: ['greatsword', 0xfff0c0],
  moonscythe: ['scythe', 0xc6a8ff], windpierce_crossbow: ['crossbow', 0x9bdcff], archon_scepter: ['scepter', 0xffe066],
  valkyr_glaive: ['halberd', 0xfff0c0], stormweaver_scepter: ['scepter', 0x6fd0ff],
};
// Per-armor body looks: chest colour + optional shoulders / helm / hood.
const ARMOR_MODEL = {
  leather_armor: { color: 0x8a5a2e }, iron_armor: { color: 0x9aa0a8, shoulders: true }, steel_armor: { color: 0xeaf2ff, shoulders: true, helm: true },
  guardian_armor: { color: 0xd8c070, shoulders: true, helm: true }, ranger_armor: { color: 0x4f8f5a, hood: true }, sorcerer_robes: { color: 0x8a6abf, hood: true },
  mithril_armor: { color: 0x8fb8d8, shoulders: true, helm: true }, mariner_plate: { color: 0x8aa6b6, shoulders: true }, grave_plate: { color: 0x9a8a6a, shoulders: true, helm: true },
  // frontier-region armour (were falling back to plain grey chest)
  coral_armor: { color: 0x2f8a8a, shoulders: true }, prism_carapace: { color: 0x9bd0ff, shoulders: true, helm: true }, sporeweave_robes: { color: 0x7a4a8a, hood: true, robe: true }, emberward_plate: { color: 0x201826, shoulders: true, helm: true, spikes: true, trim: 0xff5a2a },
  // big gear round
  studded_leather: { color: 0x8a5a2e, trim: 0x6e4a2b }, bronze_platebody: { color: 0xb87333, shoulders: true }, scout_leather: { color: 0x4f8f5a, hood: true }, chain_hauberk: { color: 0x9aa0a8, shoulders: true, trim: 0x6a6f78 },
  dread_plate: { color: 0x2a2230, shoulders: true, helm: true, spikes: true, trim: 0x9a2a2a }, warlord_plate: { color: 0x6a2a22, shoulders: true, helm: true, spikes: true },
  royal_cuirass: { color: 0xdfe6ef, shoulders: true, helm: true, cape: true, plume: true, trim: 0xffd45f }, archmage_robes: { color: 0x3a2a6a, hood: true, robe: true, trim: 0x9b6bff },
  valkyr_plate: { color: 0xeef2ff, shoulders: true, helm: true, plume: true, cape: true, trim: 0xffd45f }, stormweaver_robes: { color: 0x2a4a8a, hood: true, robe: true, trim: 0x6fd0ff },
};
const SHIELD_COL = { wooden_shield: 0x8a5a2e, iron_shield: 0x9aa0a8, steel_shield: 0xeaf2ff, barnacle_shield: 0x3a8a8a, mithril_shield: 0x8fb8d8, bronze_kiteshield: 0xb87333, tower_shield: 0x9aa0a8, aegis_bulwark: 0xffd45f, valkyr_shield: 0xfff0c0 };
// styles that don't produce a melee swing arc — the swoosh trail stays hidden for these
const MELEE_TRAIL_SKIP = new Set(['ranged', 'magic', 'chop', 'mine', 'fish', 'cook', 'forage']);

export function createPlayer(scene, world) {
  const group = new THREE.Group();
  const body = new THREE.Group();      // bobs while walking; keeps ground calc clean
  group.add(body);

  const tunic = new THREE.MeshLambertMaterial({ color: 0x36d1c4, flatShading: true });
  const skin = new THREE.MeshLambertMaterial({ color: 0xf2c79a, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x2a3340, flatShading: true });
  const steel = new THREE.MeshLambertMaterial({ color: 0xcdd6e0, flatShading: true });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x6e4a2b, flatShading: true });
  const orbMat = new THREE.MeshBasicMaterial({ color: 0x9b6bff });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x9bf2ff });

  const mkBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
  // legs hang from hip pivots so they can swing in a walk cycle
  const legL = new THREE.Group(); legL.position.set(-0.17, 0.7, 0); legL.add(mkBox(0.24, 0.7, 0.24, dark, 0, -0.35, 0)); body.add(legL);
  const legR = new THREE.Group(); legR.position.set(0.17, 0.7, 0); legR.add(mkBox(0.24, 0.7, 0.24, dark, 0, -0.35, 0)); body.add(legR);
  body.add(mkBox(0.74, 0.82, 0.46, tunic, 0, 1.15, 0));      // torso
  const armL = new THREE.Group(); armL.position.set(-0.5, 1.5, 0); armL.add(mkBox(0.2, 0.62, 0.22, tunic, 0, -0.31, 0)); body.add(armL);   // left arm (swings)
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), skin);
  head.position.set(0, 1.86, 0); body.add(head);
  body.add(mkBox(0.4, 0.12, 0.06, visorMat, 0, 1.9, 0.3));   // facing visor (+z)

  // armor overlay group — rebuilt to match the equipped armor (chest/shoulders/helm/hood)
  const armorGroup = new THREE.Group(); body.add(armorGroup);
  const shieldGroup = new THREE.Group(); body.add(shieldGroup);   // shield on the left arm
  const capeGroup = new THREE.Group(); body.add(capeGroup);       // cosmetic skill cape on the back (independent of armor)
  function setCape(colorHex) {
    while (capeGroup.children.length) capeGroup.remove(capeGroup.children[0]);
    if (colorHex == null) return;
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.25, 0.07), new THREE.MeshLambertMaterial({ color: colorHex, flatShading: true }));
    cape.position.set(0, 1.0, -0.36); cape.rotation.x = 0.16; capeGroup.add(cape);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 0.08), new THREE.MeshLambertMaterial({ color: 0xffd45f, flatShading: true }));
    trim.position.set(0, 1.6, -0.34); capeGroup.add(trim);   // gold collar trim
  }

  // right arm: pivots at the shoulder so it can swing; holds the weapon
  const rightArm = new THREE.Group(); rightArm.position.set(0.5, 1.5, 0); body.add(rightArm);
  rightArm.add(mkBox(0.2, 0.62, 0.22, tunic, 0, -0.31, 0));  // upper arm
  const hand = new THREE.Group(); hand.position.set(0, -0.62, 0); rightArm.add(hand);
  hand.rotation.x = 0.22;   // weapon carried at a slight forward "ready" tilt rather than dead-vertical
  hand.add(mkBox(0.18, 0.18, 0.18, skin, 0, 0, 0));          // fist
  const weaponHolder = new THREE.Group(); hand.add(weaponHolder);
  weaponHolder.rotation.z = Math.PI;   // weapons are modelled extending -Y; flip so they're held UPRIGHT (blade/orb up), still forward-facing
  const bladeTip = new THREE.Object3D(); bladeTip.position.set(0, -1.0, 0); weaponHolder.add(bladeTip);   // approx blade tip — sampled for the swing trail
  const toolHolder = new THREE.Group(); hand.add(toolHolder); toolHolder.visible = false;   // axe/pick/rod shown while gathering
  const weaponGlows = [];   // orb / magic-glow meshes that shimmer each frame

  function clearHolder() { for (let i = weaponHolder.children.length - 1; i >= 0; i--) { if (weaponHolder.children[i] !== bladeTip) weaponHolder.remove(weaponHolder.children[i]); } weaponGlows.length = 0; }
  let cosmetic = null;   // { weapon, armor, shield, dyes:{...} } transmog/dye overrides, set by main via setCosmetic()
  function buildWeaponModel(model, tint) {
    const m = new THREE.MeshLambertMaterial({ color: tint, flatShading: true });
    const glow = new THREE.MeshBasicMaterial({ color: tint });
    if (model === 'sword') { weaponHolder.add(mkBox(0.08, 1.0, 0.16, m, 0, -0.55, 0)); weaponHolder.add(mkBox(0.34, 0.1, 0.2, dark, 0, -0.04, 0)); }
    else if (model === 'dagger') { weaponHolder.add(mkBox(0.07, 0.55, 0.14, m, 0, -0.35, 0)); weaponHolder.add(mkBox(0.22, 0.08, 0.16, dark, 0, -0.05, 0)); }
    else if (model === 'greatsword') { weaponHolder.add(mkBox(0.13, 1.5, 0.22, m, 0, -0.8, 0)); weaponHolder.add(mkBox(0.5, 0.12, 0.24, dark, 0, -0.04, 0)); }
    else if (model === 'axe') { weaponHolder.add(mkBox(0.07, 1.25, 0.07, woodMat, 0, -0.62, 0)); weaponHolder.add(mkBox(0.5, 0.5, 0.14, m, 0.24, -1.05, 0)); }
    else if (model === 'spear') { weaponHolder.add(mkBox(0.06, 1.8, 0.06, woodMat, 0, -0.85, 0)); const t = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 6), m); t.position.set(0, -1.78, 0); t.rotation.x = Math.PI; weaponHolder.add(t); }
    else if (model === 'trident') { weaponHolder.add(mkBox(0.06, 1.7, 0.06, woodMat, 0, -0.8, 0)); weaponHolder.add(mkBox(0.5, 0.08, 0.08, m, 0, -1.5, 0)); for (const dx of [-0.2, 0, 0.2]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 5), m); p.position.set(dx, -1.7, 0); p.rotation.x = Math.PI; weaponHolder.add(p); } }
    else if (model === 'bow' || model === 'longbow') { const r = model === 'longbow' ? 0.62 : 0.46; const bow = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 6, 10, Math.PI * 1.2), m); bow.rotation.z = Math.PI / 2; bow.position.set(0, -0.1, 0.1); weaponHolder.add(bow); }
    else if (model === 'staff') { weaponHolder.add(mkBox(0.07, 1.3, 0.07, woodMat, 0, -0.55, 0)); const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), glow); orb.position.set(0, -1.2, 0); weaponHolder.add(orb); weaponGlows.push(orb); }
    else if (model === 'wand') { weaponHolder.add(mkBox(0.06, 0.85, 0.06, woodMat, 0, -0.45, 0)); const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), glow); orb.position.set(0, -0.9, 0); weaponHolder.add(orb); weaponGlows.push(orb); }
    else if (model === 'mace') { weaponHolder.add(mkBox(0.08, 0.95, 0.08, woodMat, 0, -0.5, 0)); weaponHolder.add(mkBox(0.3, 0.32, 0.3, m, 0, -1.02, 0)); for (const d of [[0.22, 0], [-0.22, 0], [0, 0.22], [0, -0.22]]) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 4), m); sp.position.set(d[0], -1.02, d[1]); sp.rotation.z = d[0] ? (d[0] > 0 ? -Math.PI / 2 : Math.PI / 2) : 0; sp.rotation.x = d[1] ? (d[1] > 0 ? Math.PI / 2 : -Math.PI / 2) : 0; weaponHolder.add(sp); } }
    else if (model === 'warhammer') { weaponHolder.add(mkBox(0.09, 1.2, 0.09, woodMat, 0, -0.62, 0)); weaponHolder.add(mkBox(0.5, 0.42, 0.42, m, 0, -1.12, 0)); weaponHolder.add(mkBox(0.16, 0.3, 0.3, dark, 0.33, -1.12, 0)); }
    else if (model === 'scythe') { weaponHolder.add(mkBox(0.07, 1.7, 0.07, woodMat, 0, -0.85, 0)); const bl = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 5, 8, Math.PI * 0.7), m); bl.position.set(-0.2, -1.6, 0); bl.rotation.z = 0.6; weaponHolder.add(bl); }
    else if (model === 'halberd') { weaponHolder.add(mkBox(0.07, 1.85, 0.07, woodMat, 0, -0.9, 0)); weaponHolder.add(mkBox(0.42, 0.5, 0.1, m, 0.24, -1.5, 0)); const t = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 5), m); t.position.set(0, -1.95, 0); t.rotation.x = Math.PI; weaponHolder.add(t); }
    else if (model === 'scimitar') { const bl = mkBox(0.1, 1.0, 0.18, m, 0.12, -0.6, 0); bl.rotation.z = 0.32; weaponHolder.add(bl); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), m); tip.position.set(0.42, -1.05, 0); tip.rotation.z = -0.6; weaponHolder.add(tip); weaponHolder.add(mkBox(0.36, 0.1, 0.2, dark, 0, -0.04, 0)); }
    else if (model === 'rapier') { weaponHolder.add(mkBox(0.045, 1.25, 0.045, m, 0, -0.68, 0)); const g = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 5, 10), dark); g.rotation.x = Math.PI / 2; g.position.set(0, -0.08, 0); weaponHolder.add(g); }
    else if (model === 'flail') { weaponHolder.add(mkBox(0.07, 0.6, 0.07, woodMat, 0, -0.32, 0)); for (let i = 0; i < 3; i++) weaponHolder.add(mkBox(0.05, 0.05, 0.05, dark, 0, -0.66 - i * 0.12, 0)); const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), m); ball.position.set(0, -1.12, 0); weaponHolder.add(ball); }
    else if (model === 'claw') { weaponHolder.add(mkBox(0.26, 0.18, 0.26, dark, 0, -0.05, 0)); for (const dx of [-0.1, 0, 0.1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 4), m); c.position.set(dx, -0.45, 0.12); c.rotation.x = -0.2; weaponHolder.add(c); } }
    else if (model === 'crossbow') { weaponHolder.add(mkBox(0.12, 0.7, 0.12, woodMat, 0, -0.3, 0.05)); const limb = mkBox(0.9, 0.06, 0.08, m, 0, -0.05, 0.18); weaponHolder.add(limb); weaponHolder.add(mkBox(0.06, 0.06, 0.4, dark, 0, -0.05, -0.05)); }
    else if (model === 'grimoire') { weaponHolder.add(mkBox(0.5, 0.62, 0.12, m, 0, -0.3, 0.1)); weaponHolder.add(mkBox(0.44, 0.54, 0.13, new THREE.MeshLambertMaterial({ color: 0xf4ecd0, flatShading: true }), 0, -0.3, 0.11)); const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), glow); orb.position.set(0, -0.05, 0.2); weaponHolder.add(orb); weaponGlows.push(orb); }
    else if (model === 'scepter') { weaponHolder.add(mkBox(0.06, 1.0, 0.06, m, 0, -0.5, 0)); const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glow); head.position.set(0, -1.05, 0); weaponHolder.add(head); weaponGlows.push(head); for (const a of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), glow); p.position.set(Math.cos(a) * 0.18, -1.05, Math.sin(a) * 0.18); p.rotation.z = -Math.PI / 2; p.rotation.y = a; weaponHolder.add(p); } }
  }
  function setWeaponMesh(key) {
    clearHolder();
    const dispKey = key ? ((cosmetic && cosmetic.weapon) || key) : null;   // transmog only reskins a weapon you actually wield
    if (!dispKey) { weaponTint = 0xdfe6ef; return; }   // unarmed → just fists; a soft pale swoosh for punches (not stale colour / pure white)
    const it = weaponOf(dispKey);
    const md = WEAPON_MODEL[dispKey] || [it.style === 'ranged' ? 'bow' : it.style === 'magic' ? 'staff' : 'sword', 0xcdd6e0];
    const dye = cosmetic && cosmetic.dyes ? cosmetic.dyes.weapon : null;
    const tint = (dye != null) ? dye : md[1];
    weaponTint = tint;   // swing trail tints to match the displayed blade
    buildWeaponModel(md[0], tint);
  }
  function buildArmor(key) {
    while (armorGroup.children.length) armorGroup.remove(armorGroup.children[0]);
    const dispKey = key ? ((cosmetic && cosmetic.armor) || key) : null;
    if (!dispKey) return;
    const a = ARMOR_MODEL[dispKey] || { color: 0xb9c2cc };
    const dye = cosmetic && cosmetic.dyes ? cosmetic.dyes.armor : null;
    const m = new THREE.MeshLambertMaterial({ color: (dye != null) ? dye : a.color, flatShading: true });
    armorGroup.add(mkBox(0.86, 0.92, 0.58, m, 0, 1.15, 0));                         // chest plate over the tunic
    if (a.shoulders) { armorGroup.add(mkBox(0.34, 0.26, 0.52, m, -0.52, 1.5, 0)); armorGroup.add(mkBox(0.34, 0.26, 0.52, m, 0.52, 1.5, 0)); }
    if (a.helm) armorGroup.add(mkBox(0.44, 0.34, 0.44, m, 0, 2.0, 0));
    if (a.hood) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.55, 6), m); h.position.set(0, 2.05, 0); armorGroup.add(h); }
    const trimMat = a.trim ? new THREE.MeshLambertMaterial({ color: a.trim, flatShading: true }) : null;
    if (a.robe) armorGroup.add(mkBox(0.82, 0.72, 0.52, m, 0, 0.5, 0));                                    // long skirt/robe
    if (a.cape) { const cape = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.05, 0.07), trimMat || m); cape.position.set(0, 1.05, -0.34); cape.rotation.x = 0.1; armorGroup.add(cape); }
    if (a.plume) { const pl = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 5), trimMat || new THREE.MeshLambertMaterial({ color: 0xc04040, flatShading: true })); pl.position.set(0, 2.34, 0); armorGroup.add(pl); }   // crest on the helm
    if (a.spikes) for (const sx of [-0.52, 0.52]) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), m); sp.position.set(sx, 1.74, 0); armorGroup.add(sp); }   // shoulder spikes
    if (trimMat) armorGroup.add(mkBox(0.9, 0.13, 0.6, trimMat, 0, 0.78, 0));                              // belt/trim accent
  }
  function buildShield(key) {
    while (shieldGroup.children.length) shieldGroup.remove(shieldGroup.children[0]);
    const dispKey = key ? ((cosmetic && cosmetic.shield) || key) : null;
    if (!dispKey) return;
    const dye = cosmetic && cosmetic.dyes ? cosmetic.dyes.shield : null;
    const m = new THREE.MeshLambertMaterial({ color: (dye != null) ? dye : (SHIELD_COL[dispKey] || 0x9aa0a8), flatShading: true });
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.56), m); sh.position.set(-0.62, 1.2, 0.08); shieldGroup.add(sh);
    const boss = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), steel); boss.position.set(-0.7, 1.2, 0.08); shieldGroup.add(boss);
  }
  function setToolMesh(kind) {
    while (toolHolder.children.length) toolHolder.remove(toolHolder.children[0]);
    toolHolder.rotation.z = (kind === 'fish' || kind === 'cook') ? 0 : Math.PI;   // pick/axe head UP so you strike head-first; rod & ladle hang as before
    if (kind === 'mine') {                                                    // pickaxe
      toolHolder.add(mkBox(0.06, 0.95, 0.06, woodMat, 0, -0.5, 0));
      toolHolder.add(mkBox(0.55, 0.09, 0.09, steel, 0, -0.92, 0));
    } else if (kind === 'fish') {                                             // fishing rod
      toolHolder.add(mkBox(0.05, 1.3, 0.05, woodMat, 0, -0.64, 0));
    } else if (kind === 'cook') {                                             // ladle
      toolHolder.add(mkBox(0.05, 0.75, 0.05, woodMat, 0, -0.38, 0));
      toolHolder.add(mkBox(0.2, 0.12, 0.2, steel, 0, -0.76, 0));
    } else {                                                                  // axe (chop / forage)
      toolHolder.add(mkBox(0.06, 0.9, 0.06, woodMat, 0, -0.46, 0));
      toolHolder.add(mkBox(0.3, 0.16, 0.1, steel, 0.12, -0.86, 0));
    }
  }

  // Stand on the plaza south of the village (clear of the hut ring), facing in.
  const sx = world.village.x, sz = world.village.z + 12;
  group.position.set(sx, world.height(sx, sz), sz);
  scene.add(group);

  // melee swing trail — a short fading after-image that traces the blade tip through the air
  const TRAIL_N = 7;
  const trailSeg = [], trailMat = [], trailPts = [];
  for (let i = 0; i < TRAIL_N; i++) {
    const tm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
    const sg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1), tm);   // streak along local +Z; oriented + length-scaled per frame
    sg.visible = false; sg.frustumCulled = false; scene.add(sg); trailSeg.push(sg); trailMat.push(tm);
  }
  for (let i = 0; i <= TRAIL_N; i++) trailPts.push(new THREE.Vector3());
  let trailFill = 0, weaponTint = 0xffffff, trailColor = 0xffffff;
  const _tipW = new THREE.Vector3();
  function updateTrail(active) {
    if (active) {
      if (trailFill === 0) trailColor = weaponTint;   // lock the tint at swing start so a mid-swing weapon swap won't recolour the live arc
      bladeTip.getWorldPosition(_tipW);
      for (let i = TRAIL_N; i > 0; i--) trailPts[i].copy(trailPts[i - 1]);   // age the ring buffer
      trailPts[0].copy(_tipW);
      trailFill = Math.min(TRAIL_N + 1, trailFill + 1);
      const inten = Math.sin((1 - state.attackAnim / state.animDur) * Math.PI);   // brightest at mid-swing
      for (let i = 0; i < TRAIL_N; i++) {
        const sg = trailSeg[i];
        if (i + 1 >= trailFill) { sg.visible = false; continue; }
        const a = trailPts[i], b = trailPts[i + 1];
        const len = a.distanceTo(b);
        if (len < 0.001) { sg.visible = false; continue; }
        sg.visible = true;
        sg.position.copy(a).add(b).multiplyScalar(0.5);   // segment spans a→b
        sg.lookAt(b); sg.scale.set(1, 1, len);
        trailMat[i].color.setHex(trailColor);
        trailMat[i].opacity = inten * (1 - i / TRAIL_N) * 0.7;   // older = fainter; bright enough to read on the additive display
      }
    } else if (trailFill > 0) {                                  // swing ended → clear the trail once
      trailFill = 0;
      for (let i = 0; i < TRAIL_N; i++) { trailSeg[i].visible = false; trailMat[i].opacity = 0; }
    }
  }

  const state = {
    heading: Math.PI,
    hp: 100, maxHp: 100,
    coastFwd: 0, coastBack: 0, coastTurn: 0, coastTurnDir: 0,
    moving: false, bob: 0,
    attackCd: 0, attackAnim: 0, attackStyle: 'unarmed', animDur: ATTACK_DUR, toolActive: false,
    equipment: { weapon: null, armor: null, amulet: null, ring: null, shield: null },
    prayer: 30, maxPrayer: 30, activePrayer: null,
    combatStance: 'accurate',   // attack stance (accurate/aggressive/defensive/controlled)
    bounds: null,   // set while inside a building → clamp movement to the room
    solids: null,   // circular obstacles (buildings outdoors, furniture/NPCs indoors)
  };

  function weapon() { return weaponOf(state.equipment.weapon); }
  function refreshEquipment() {
    setWeaponMesh(state.equipment.weapon);
    buildArmor(state.equipment.armor);
    buildShield(state.equipment.shield);
  }
  refreshEquipment();

  const forwardVec = () => ({ x: Math.sin(state.heading), z: Math.cos(state.heading) });
  const impulseForward = () => { state.coastFwd = COAST_FWD; };
  const impulseBack = () => { state.coastBack = COAST_FWD; };
  const impulseTurn = (dir) => { state.coastTurnDir = dir; state.coastTurn = COAST_TURN; };
  function showTool(on) { toolHolder.visible = on; weaponHolder.visible = !on; state.toolActive = on; }
  function playAttack(style) { if (state.toolActive) showTool(false); state.attackStyle = style || weapon().style; state.attackAnim = ATTACK_DUR; state.animDur = ATTACK_DUR; }
  function playGather(kind) { setToolMesh(kind); showTool(true); state.attackStyle = kind; state.attackAnim = GATHER_DUR; state.animDur = GATHER_DUR; }

  const inB = (b, x, z) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
  function clear(x, z) {
    if (state.bounds) { if (!inB(state.bounds, x, z)) return false; }
    else if (!world.isWalkable(x, z)) return false;
    const s = state.solids;                                  // circular obstacle collision (buildings / props / fences / furniture / NPCs)
    if (s) for (let i = 0; i < s.length; i++) { const o = s[i]; if (o.ref && !o.ref.alive) continue; const dx = x - o.x, dz = z - o.z; if (dx * dx + dz * dz < o.r * o.r) return false; }   // o.ref = chopped tree / depleted ore → no longer blocks
    return true;
  }
  function tryMove(dt, dir) {
    const f = forwardVec();
    const step = SPEED * dt * dir;
    const x = group.position.x, z = group.position.z;
    const nx = x + f.x * step, nz = z + f.z * step;
    if (clear(nx, nz)) { group.position.x = nx; group.position.z = nz; }      // full move
    else if (clear(nx, z)) { group.position.x = nx; }                          // slide along X
    else if (clear(x, nz)) { group.position.z = nz; }                          // slide along Z
  }

  function update(dt, input) {
    let turn = 0;
    if (input.keys.has('left')) turn -= 1;
    if (input.keys.has('right')) turn += 1;
    if (turn === 0 && state.coastTurn > 0) turn = state.coastTurnDir;
    state.coastTurn = Math.max(0, state.coastTurn - dt);
    state.heading -= turn * TURN * dt;   // swipe-left turns left (mirrors on-device feel)
    if (state.heading > Math.PI) state.heading -= TAU;
    if (state.heading < -Math.PI) state.heading += TAU;

    const walking = input.keys.has('up') || state.coastFwd > 0;
    state.coastFwd = Math.max(0, state.coastFwd - dt);
    const backing = !walking && (input.keys.has('down') || state.coastBack > 0);
    state.coastBack = Math.max(0, state.coastBack - dt);
    state.moving = walking || backing;
    if (walking) tryMove(dt, 1);
    else if (backing) tryMove(dt, -0.55);   // slower back-pedal

    group.position.y = state.bounds ? state.bounds.y : world.height(group.position.x, group.position.z);
    group.rotation.y = state.heading;
    state.t = (state.t || 0) + dt;
    if (state.moving) state.bob += dt * 11;
    const idleBreath = 0.02 + Math.sin(state.t * 1.6) * 0.018;   // gentle breathing so standing still still feels alive
    body.position.y = state.moving ? Math.abs(Math.sin(state.bob)) * 0.08 : idleBreath;

    // magic weapons shimmer: a gentle orb pulse + slow spin
    if (weaponGlows.length) { const pul = 1 + Math.sin(state.t * 5) * 0.16; for (let i = 0; i < weaponGlows.length; i++) { weaponGlows[i].scale.setScalar(pul); weaponGlows[i].rotation.y += dt * 1.4; } }

    // walk cycle — legs swing at the hips, arms counter-swing (the right arm yields to an attack)
    const gait = state.moving ? Math.sin(state.bob) * 0.5 : 0;
    const gk = Math.min(1, dt * 12);
    legL.rotation.x += (gait - legL.rotation.x) * gk;
    legR.rotation.x += (-gait - legR.rotation.x) * gk;
    armL.rotation.x += (-gait - armL.rotation.x) * gk;

    // attack animation (right arm)
    if (state.attackAnim > 0) {
      state.attackAnim = Math.max(0, state.attackAnim - dt);
      const t = 1 - state.attackAnim / state.animDur;
      const s = Math.sin(t * Math.PI);
      switch (state.attackStyle) {
        case 'ranged': rightArm.rotation.x = -1.2 - 0.5 * s; break;
        case 'magic':  rightArm.rotation.x = -1.5 - 0.4 * s; break;
        case 'chop':   rightArm.rotation.x = -2.0 * Math.abs(Math.sin(t * Math.PI * 2)); break;   // two overhead chops
        case 'mine':   rightArm.rotation.x = -1.8 * Math.abs(Math.sin(t * Math.PI * 2)); break;   // two pick swings
        case 'fish':   rightArm.rotation.x = -1.5 + 0.6 * s; break;                               // cast & settle
        case 'cook':   rightArm.rotation.x = -0.9 + 0.3 * Math.sin(t * Math.PI * 3); break;       // stir the pot
        case 'forage': rightArm.rotation.x = -1.0 * s; break;                                     // reach down
        default: {   // melee / unarmed: quick overhead wind-up, then a fast slash down & through (no dwell behind the head)
          if (t < 0.3) { const u = t / 0.3; rightArm.rotation.x = -1.7 * u * u; }
          else { const u = (t - 0.3) / 0.7; rightArm.rotation.x = -1.7 + 2.3 * u * (2 - u); }
          break;
        }
      }
      if (state.attackAnim === 0 && state.toolActive) showTool(false);
    } else {
      rightArm.rotation.x += (gait - rightArm.rotation.x) * gk;   // counter-swing with the gait
      if (!state.moving && Math.abs(rightArm.rotation.x) < 0.01) rightArm.rotation.x = 0;
    }

    // swoosh trail follows the blade during a melee swing only (not casts, shots or tool gathering)
    updateTrail(state.attackAnim > 0 && !state.toolActive && !MELEE_TRAIL_SKIP.has(state.attackStyle));

    if (state.attackCd > 0) state.attackCd = Math.max(0, state.attackCd - dt);
  }

  let camReady = false;
  const tmpTarget = new THREE.Vector3();
  function updateCamera(camera, dt) {
    const f = forwardVec();
    const px = group.position.x, py = group.position.y, pz = group.position.z;
    const dist = state.bounds ? 5.2 : CAM_DIST, ht = state.bounds ? 7.0 : CAM_HEIGHT, look = state.bounds ? 1.5 : CAM_LOOK;
    const dX = px - f.x * dist, dZ = pz - f.z * dist, dY = py + ht;
    if (!camReady) { camera.position.set(dX, dY, dZ); camReady = true; }
    else { const k = damp(6, dt); camera.position.x += (dX - camera.position.x) * k; camera.position.y += (dY - camera.position.y) * k; camera.position.z += (dZ - camera.position.z) * k; }
    tmpTarget.set(px + f.x * look, py + HEAD_Y, pz + f.z * look);
    camera.lookAt(tmpTarget);
  }

  // world position of the right hand (where projectiles launch from)
  const handWorld = new THREE.Vector3();
  function handPosition() { hand.getWorldPosition(handWorld); return handWorld; }

  return {
    group, state, update, updateCamera, impulseForward, impulseBack, impulseTurn, forwardVec,
    playAttack, playGather, refreshEquipment, weapon, handPosition,
    setBounds(b) { state.bounds = b; }, setSolids(s) { state.solids = s; }, snapCamera() { camReady = false; }, setCape,
    setCosmetic(c) { cosmetic = c; refreshEquipment(); },
    get position() { return group.position; },
  };
}
