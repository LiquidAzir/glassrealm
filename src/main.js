import * as THREE from 'three';
import { createEngine } from './engine.js';
import { createInput } from './input.js';
import { createControls } from './controls.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createEntities } from './entities.js';
import { createInteraction } from './interact.js';
import { createUI } from './ui.js';
import { createSkills } from './skills.js';
import { createInventory } from './inventory.js';
import { createQuests } from './quests.js';
import { createDialogue } from './dialogue.js';
import { loadSave, createSave, mergeRemoteSave } from './save.js';
import { createEconomy } from './economy.js';
import { createFarm } from './farm.js';
import { createCloud } from './cloud.js';
import { ITEMS, QUESTS, SMELT, COOK, FORGE, FLETCH, RUNECRAFT, ENCHANT, CONSTRUCT, SHOP, BREW, PRAYERS, CRAFT, SETS, ACHIEVEMENTS, ENEMIES, TAVERN, PATRON_LINES, CLASSES, BUSINESSES, JOBS, CLUE_SPOTS, LIVESTOCK, FARM, DIARIES, TRIANGLE, WEAKNESS, ATK_STYLE, ATTACK_STYLES, SLAYER_REWARDS } from './content.js';
import { createProjectiles } from './projectiles.js';
import { WORLD_SCALE } from './scale.js';
import { createFx } from './fx.js';
import { createInteriors } from './interiors.js';
import { createAudio } from './audio.js';
import { dist2D } from './util.js';

const boot = document.getElementById('boot');
const bootSub = document.getElementById('bootSub');
const G = {};

try {
  const canvas = document.getElementById('game');
  const engine = createEngine(canvas);
  // cloud save sync (if configured): pull the latest before loading so any device shares one save
  const cloud = createCloud(); G.cloud = cloud;
  // a Restart sets this flag so we DON'T re-pull the just-wiped save from the cloud (which would skip the class picker)
  let freshStart = false; try { freshStart = !!sessionStorage.getItem('glassrealm.fresh'); if (freshStart) sessionStorage.removeItem('glassrealm.fresh'); } catch (e) {}
  if (cloud.enabled && !freshStart) { try { const remote = await cloud.pull(); if (remote) mergeRemoteSave(remote); } catch (e) {} }
  const saved = loadSave();

  const world = createWorld(engine.scene);
  const player = createPlayer(engine.scene, world);
  const input = createInput();
  createControls({ app: document.getElementById('app'), canvas, input });

  G.engine = engine; G.world = world; G.player = player; G.input = input;
  G.skills = createSkills(saved && saved.skills, saved && saved.prestige);
  G.inventory = createInventory(saved && saved.inventory);
  // Collection Log — record every unique gear piece ever obtained (a completion meta-goal).
  const LOGGABLE = (key) => { const d = ITEMS[key]; return !!d && (d.type === 'weapon' || d.type === 'armor' || d.type === 'amulet' || d.type === 'ring' || d.type === 'shield'); };
  G.collection = new Set((saved && saved.collection) || []);
  { const _add = G.inventory.add.bind(G.inventory); G.inventory.add = (key, n) => { const r = _add(key, n); if (LOGGABLE(key) && !G.collection.has(key)) { G.collection.add(key); if (G.ui) G.ui.toast(`✦ Collection Log: ${ITEMS[key].name}`, 'gold', 2200); } return r; }; }
  G.inventory.list().forEach((it) => { if (LOGGABLE(it.key)) G.collection.add(it.key); });   // seed from already-held items
  if (saved && saved.player && saved.player.equipment) for (const k of Object.values(saved.player.equipment)) if (k && LOGGABLE(k)) G.collection.add(k);
  if (saved && saved.clue) G.activeClue = saved.clue;
  G.ui = createUI(G);
  G.quests = createQuests(G, saved && saved.quests);
  G.entities = createEntities(engine.scene, world, G);
  G.interact = createInteraction(G);
  G.dialogue = createDialogue(G);
  G.projectiles = createProjectiles(engine.scene);
  G.fx = createFx(engine.scene);
  G.interiors = createInteriors(engine.scene);
  G.inInterior = false; G.interiorStations = [];
  player.setSolids(world.solids);   // collide with buildings/wells outdoors
  G.bankItems = (saved && saved.bank) || {};
  G.audio = createAudio(saved && saved.audioMuted);
  G.save = createSave(G);
  G.economy = createEconomy(saved && saved.economy);
  G.economy.tick();   // offline catch-up from the last saved tick
  G.farm = createFarm(saved && saved.farm);
  G.farm.tick();      // offline catch-up: grow livestock + accrue produce/earnings
  G.market = { mult: (saved && saved.market && saved.market.mult) || {}, event: null, nextIn: 80, _d: 0 };   // dynamic prices + world events
  const EVENT_NAME = { caravan: 'Merchant Caravan', shortage: 'Goods Shortage', invasion: 'Town Invasion' };

  // restore saved world edits + player
  if (saved) {
    (saved.world && saved.world.choppedTrees || []).forEach((i) => world.removeTree(i));
    (saved.world && saved.world.harvestedBushes || []).forEach((i) => world.harvestBush(i));
    (saved.world && saved.world.lootedChests || []).forEach((label) => { const st = world.stations.find((s) => s.kind === 'chest' && s.label === label); if (st) st.looted = true; });
    (saved.world && saved.world.foundDiscoveries || []).forEach((key) => { const d = world.discoveries.find((x) => x.key === key); if (d) { d.found = true; if (d.mesh) d.mesh.visible = false; } });
    (saved.world && saved.world.builtFurniture || []).forEach((key) => { const f = world.houseFurniture[key]; if (f && !f.built) { f.built = true; f.mesh.visible = true; world.stations.push(f.station); } });
    if (saved.player) {
      const sRatio = WORLD_SCALE / (saved.worldScale || 1);   // migrate old positions onto the (re)scaled map
      player.group.position.x = saved.player.x * sRatio;
      player.group.position.z = saved.player.z * sRatio;
      player.state.heading = saved.player.heading;
      player.state.hp = Math.max(1, saved.player.hp || player.state.maxHp);
      if (saved.player.prayer != null) player.state.prayer = saved.player.prayer;
      if (saved.player.combatStance && ATTACK_STYLES[saved.player.combatStance]) player.state.combatStance = saved.player.combatStance;
      if (saved.player.equipment) { const e = saved.player.equipment; player.state.equipment = { weapon: e.weapon || null, armor: e.armor || null, amulet: e.amulet || null, ring: e.ring || null, shield: e.shield || null }; }
      player.refreshEquipment();
    }
    if (saved.grave && saved.grave.items) {   // re-raise the gravestone where you fell last session
      const gr = WORLD_SCALE / (saved.worldScale || 1), gx = saved.grave.x * gr, gz = saved.grave.z * gr;
      G.grave = { x: gx, z: gz, items: saved.grave.items, t: saved.grave.t || 240, mesh: makeGraveMesh(gx, gz) };
    }
  }

  const skillName = (key) => (G.skills.DEFS.find((d) => d.key === key) || { name: key }).name;
  const npcName = (key) => { const n = G.entities.npcs.find((x) => x.def.key === key); return n ? n.def.name : key; };
  const maxPrayer = () => 20 + G.skills.level('prayer') * 2;

  // ---- gear stats, set bonuses, run stats, achievements ----
  function fullSet() {
    const eq = player.state.equipment;
    const a = eq.armor && ITEMS[eq.armor].set, m = eq.amulet && ITEMS[eq.amulet].set, r = eq.ring && ITEMS[eq.ring].set;
    return (a && a === m && a === r) ? a : null;
  }
  G.fullSet = fullSet;
  function gearBonus() {
    const eq = player.state.equipment, b = { def: 0, melee: 0, ranged: 0, magic: 0, maxhp: 0 };
    for (const slot of ['armor', 'amulet', 'ring', 'shield']) { const it = eq[slot] ? ITEMS[eq[slot]] : null; if (!it) continue; if (it.defense) b.def += it.defense; if (it.bonus) for (const k in it.bonus) b[k] += it.bonus[k]; }
    const s = fullSet(); if (s && SETS[s]) for (const k in SETS[s]) if (k !== 'name') b[k] += SETS[s][k];
    return b;
  }
  G.gearBonus = gearBonus;
  function applyMaxHp() { const mh = 100 + gearBonus().maxhp + (G.diaryBonus ? G.diaryBonus() : 0); player.state.maxHp = mh; if (player.state.hp > mh) player.state.hp = mh; G.ui.setHealth(player.state.hp, mh); }

  G.stats = { kills: 0, crafted: 0, regions: new Set(), bosses: new Set(), killsByType: {} };
  if (saved && saved.stats) { G.stats.kills = saved.stats.kills || 0; G.stats.crafted = saved.stats.crafted || 0; G.stats.deaths = saved.stats.deaths || 0; (saved.stats.regions || []).forEach((r) => G.stats.regions.add(r)); (saved.stats.bosses || []).forEach((b) => G.stats.bosses.add(b)); Object.assign(G.stats.killsByType, saved.stats.killsByType || {}); }
  G.diaries = new Set((saved && saved.diaries) || []);   // claimed region-diary tiers ("region:tierIdx")
  G.deathMode = (saved && saved.deathMode) || 'standard'; // 'standard' = gravestone, 'safe' = no loss
  G.grave = null;                                          // active gravestone {x,z,items,t,mesh}
  G.slayer = (saved && saved.slayer) ? { ...saved.slayer } : { active: false, enemy: null, count: 0, progress: 0 };
  G.trackedQuest = (saved && saved.tracked) || null;   // quest pinned in the Quests menu
  const SLAYER_POOL = ['boar', 'wolf', 'bandit', 'scorpion', 'frost_wolf', 'skeleton', 'goblin', 'crystal_sprite', 'magma_imp', 'deep_lurker'];
  G.slayerPoints = (saved && saved.slayerPoints) || 0;
  G.slayerPerks = new Set((saved && saved.slayerPerks) || []);
  G.slayerAssign = () => { const enemy = SLAYER_POOL[Math.floor(Math.random() * SLAYER_POOL.length)]; const count = 6 + Math.floor(Math.random() * 7); G.slayer = { active: true, enemy, count, progress: 0 }; G.ui.toast(`Slayer task: ${count} ${ENEMIES[enemy].name}s`, 'good', 2600); G.save.save(); };
  G.slayerClaim = () => {
    const s = G.slayer; if (!s.active || s.progress < s.count) return;
    const reward = s.count * 8; G.inventory.add('gold', reward);
    G.gainXp('slayer', Math.round(s.count * 15 * (G.slayerPerks.has('slayerXp') ? 1.2 : 1)));
    const pts = 3 + Math.floor(s.count / 3); G.slayerPoints += pts; s.active = false;
    G.ui.toast(`Slayer contract complete! +${reward}g · +${pts} Slayer points`, 'good', 3000);
    G.ach.evaluate(); G.save.save();
  };
  G.slayerBuy = (key) => {
    const r = SLAYER_REWARDS.find((x) => x.key === key); if (!r) return;
    if (r.perk && G.slayerPerks.has(r.perk)) { G.ui.toast('Already unlocked.', '', 1500); return; }
    if (r.once && r.grant) { const k0 = Object.keys(r.grant)[0]; if (G.collection.has(k0) || G.inventory.count(k0) > 0) { G.ui.toast('Already owned.', '', 1500); return; } }
    if (r.cancel && (!G.slayer || !G.slayer.active)) { G.ui.toast('No active contract.', '', 1500); return; }
    if (G.slayerPoints < r.cost) { G.ui.toast(`Need ${r.cost} Slayer points`, 'bad', 1800); return; }
    G.slayerPoints -= r.cost;
    if (r.cancel) { G.slayer.active = false; G.ui.toast('Contract cancelled.', 'good', 1600); }
    if (r.grant) for (const k in r.grant) G.inventory.add(k, r.grant[k]);
    if (r.lampXp) G.gainXp('slayer', r.lampXp);
    if (r.perk) G.slayerPerks.add(r.perk);
    if (!r.cancel) { G.audio.sfx('ach'); G.ui.toast(`✦ ${r.name} purchased`, 'gold', 2400); }
    G.save.save();
  };
  const slayerShopCfg = {
    title: 'Slayer Rewards', hint: '↑ ↓ select · tap to buy · ↑↓↑↓ leave',
    rows: () => SLAYER_REWARDS.map((r) => {
      const owned = (r.perk && G.slayerPerks.has(r.perk)) || (r.once && r.grant && (G.collection.has(Object.keys(r.grant)[0]) || G.inventory.count(Object.keys(r.grant)[0]) > 0));
      const can = !owned && G.slayerPoints >= r.cost && !(r.cancel && (!G.slayer || !G.slayer.active));
      return { section: r.perk ? 'Perks' : r.cancel ? 'Service' : 'Rewards', icon: r.icon, title: r.name, sub: `${r.desc} · ${G.slayerPoints} pts`, right: owned ? 'owned' : `${r.cost} pts${can ? '' : ' 🔒'}`, data: { key: r.key } };
    }),
    onSelect: (r) => G.slayerBuy(r.data.key),
  };
  G.openSlayerShop = () => { setMode('picker'); G.ui.openPicker(slayerShopCfg); };
  G.prestigeSkill = (key) => { if (!G.skills.canPrestige(key)) { G.ui.toast('Reach level 20 to prestige', 'bad', 1800); return; } if (G.skills.doPrestige(key)) { G.ui.toast(`⭐ Prestiged ${skillName(key)}!`, 'good', 3000); G.ui.levelBanner(`Prestige — ${skillName(key)}`); G.audio.sfx('ach'); if (G.fx) G.fx.burst(player.position.x, player.position.y + 2, player.position.z, 0xffd45f, { n: 20, spread: 3.6, up: 4.6, life: 0.9 }); G.ach.evaluate(); G.save.save(); } };
  G.trackQuest = (id) => { G.trackedQuest = (G.trackedQuest === id) ? null : id; G.ui.toast(G.trackedQuest ? `Tracking: ${QUESTS[id].name}` : 'Tracking cleared', 'good', 1600); G.save.save(); };
  G.ach = {
    unlocked: new Set((saved && saved.achievements) || []),
    evaluate() {
      for (const a of ACHIEVEMENTS) {
        if (this.unlocked.has(a.id)) continue;
        let ok = false; try { ok = a.cond(G); } catch (e) { ok = false; }
        if (ok) { this.unlocked.add(a.id); G.ui.toast(`🏆 ${a.name}`, 'good', 3000); G.ui.levelBanner(`Achievement: ${a.name}`); if (G.audio) G.audio.sfx('ach'); }
      }
    },
  };

  // ---------- gameplay verbs ----------
  G.gainXp = (key, amt) => {
    const r = G.skills.addXp(key, amt);
    G.ui.xpDrop(`+${r.amount} ${skillName(key)}`);   // show the prestige-boosted amount actually granted
    if (r.leveled) { G.ui.levelBanner(`${skillName(key)} Level ${r.level}!`); if (G.audio) G.audio.sfx('level'); if (G.fx) G.fx.burst(player.position.x, player.position.y + 2, player.position.z, 0xffd45f, { n: 14, spread: 3.2, up: 4.2, life: 0.8 }); if (G.ach) G.ach.evaluate(); }
  };

  const readyToasted = new Set();
  function checkQuestReady() {
    G.quests.activeList().forEach((id) => {
      if (G.quests.isReady(id) && !readyToasted.has(id)) {
        readyToasted.add(id);
        G.ui.toast(`Objective met — return to ${npcName(QUESTS[id].giver)}`, 'good', 2800);
      }
    });
  }

  G.chopTree = (t) => {
    world.removeTree(t.idx);
    player.playGather('chop');
    G.fx.burst(t.x, t.y + 1.6, t.z, 0x9a6a3a, { n: 9, up: 2.6 });
    G.inventory.add('wood', 1);
    G.ui.toast('Chopped Driftwood', 'gold', 1400); G.audio.sfx('pickup');
    G.gainXp('woodcutting', 14);
    checkQuestReady(); G.save.save();
  };
  G.forageBush = (b) => {
    world.harvestBush(b.idx);
    player.playGather('forage');
    G.fx.burst(b.x, b.y + 0.8, b.z, 0x4f9a40, { n: 7, up: 2.0 });
    const herb = Math.random() < 0.3;
    G.inventory.add(herb ? 'herb' : 'berry', 1);
    if (Math.random() < 0.5) G.inventory.add('feather', Math.random() < 0.35 ? 2 : 1);   // feathers for fletching
    G.ui.toast(herb ? 'Foraged Glimmerleaf' : 'Foraged Sunberries', 'gold', 1400);
    G.gainXp('foraging', 10);
    checkQuestReady(); G.save.save();
  };
  G.plotAction = (p) => {
    if (p.state === 'grown') {
      player.playGather('forage');
      const n = 1 + Math.floor(Math.random() * 2);
      G.inventory.add('crop', n); world.harvestPlot(p); G.gainXp('farming', 24);
      G.ui.toast(`Harvested ${n} Isle Greens`, 'gold', 1500); checkQuestReady(); G.save.save();
    } else if (p.state === 'growing') {
      G.ui.toast('Still growing…', '', 1200);
    } else if (G.inventory.has('seeds', 1)) {
      player.playGather('forage');
      G.inventory.remove('seeds', 1); world.plantPlot(p); G.gainXp('farming', 8); G.ui.toast('Planted seeds', 'good', 1300); G.save.save();
    } else G.ui.toast('No seeds — buy some from Trader Pell', 'bad', 1800);
  };
  G.thieveStall = (s) => {
    if (s.cooldown > 0) { G.ui.toast('The trader is watching…', '', 1200); return; }
    s.cooldown = 4;
    const lvl = G.skills.level('thieving');
    if (Math.random() < Math.min(0.92, 0.55 + lvl * 0.03)) {
      const gold = 5 + Math.floor(Math.random() * 12) + lvl;
      G.inventory.add('gold', gold); G.gainXp('thieving', 18);
      if (Math.random() < 0.3) G.inventory.add(Math.random() < 0.5 ? 'herb' : 'seeds', 1);
      G.ui.toast(`Pilfered ${gold} gold`, 'gold', 1500);
    } else { G.ui.toast('Caught! You take a cuff round the ear.', 'bad', 1800); G.damagePlayer(6); }
    G.save.save();
  };
  G.togglePrayer = (key) => {
    const pr = PRAYERS.find((p) => p.key === key); if (!pr) return;
    if (G.skills.level('prayer') < pr.level) { G.ui.toast(`Needs Prayer level ${pr.level}`, 'bad', 1600); return; }
    if (player.state.activePrayer === key) { player.state.activePrayer = null; G.ui.toast(`${pr.name} off`, '', 1200); }
    else if (player.state.prayer <= 0) { G.ui.toast('No prayer points — bury bones at an altar', 'bad', 2000); }
    else { player.state.activePrayer = key; G.ui.toast(`${pr.name} active`, 'good', 1300); }
  };
  G.combatStances = ATTACK_STYLES;
  G.setCombatStance = (key) => { if (!ATTACK_STYLES[key]) return; player.state.combatStance = key; G.ui.toast(`${ATTACK_STYLES[key].icon} ${ATTACK_STYLES[key].name} stance`, 'good', 1300); G.save.save(); };
  G.talkTo = (n) => {
    setMode('dialogue'); G.ui.hidePrompt();
    G.quests.notifyTalk(n.def.key); checkQuestReady();   // 'talk' objectives complete on conversation
    G.dialogue.open(n.def.dialogue, () => { if (G.pendingShop) { G.pendingShop = false; G.openShop(); } else if (G.pendingSlayerShop) { G.pendingSlayerShop = false; G.openSlayerShop(); } else setMode(G.inInterior ? 'interior' : 'world'); });
  };

  const ORE_ITEM = { copper: 'copper_ore', iron: 'iron_ore', coal: 'coal', mithril: 'mithril_ore', essence: 'rune_essence' };
  const ORE_XP = { copper: 18, iron: 26, coal: 16, mithril: 60, gem_rock: 40, essence: 35 };
  const ORE_LEVEL = { copper: 1, coal: 1, iron: 10, gem_rock: 20, mithril: 30, essence: 1 };
  const ORE_FX = { mithril: 0x6fa8d8, gem_rock: 0x6fe0ff, essence: 0xb98fff };
  G.mineOre = (o) => {
    world.depleteOre(o);
    player.playGather('mine');
    G.fx.burst(o.x, o.y + 0.6, o.z, ORE_FX[o.type] || 0x9aa0a8, { n: 9, up: 2.4 });
    if (o.type === 'gem_rock') {
      const gr = Math.random(); const gem = gr < 0.2 ? 'ruby' : gr < 0.5 ? 'emerald' : 'sapphire';
      G.inventory.add(gem, 1); G.ui.toast('Mined a ' + ITEMS[gem].name + '!', 'gold', 1700);
    } else {
      const item = ORE_ITEM[o.type] || 'copper_ore';
      G.inventory.add(item, 1); G.ui.toast('Mined ' + ITEMS[item].name, 'gold', 1400);
      const gr = Math.random(); const gem = gr < 0.03 ? 'ruby' : gr < 0.07 ? 'emerald' : gr < 0.13 ? 'sapphire' : null;   // bonus gem
      if (gem) { G.inventory.add(gem, 1); G.ui.toast('Found a ' + ITEMS[gem].name + '!', 'gold', 1900); }
    }
    G.audio.sfx('pickup');
    G.gainXp('mining', ORE_XP[o.type] || 18);
    checkQuestReady(); G.save.save();
  };
  G.fishSpot = (f) => {
    player.playGather('fish');
    if (f) G.fx.burst(f.x, (f.y || 0) + 0.3, f.z, 0x9bf2ff, { n: 8, up: 2.2 });
    const item = Math.random() < 0.55 ? 'raw_shrimp' : 'raw_trout';
    G.inventory.add(item, 1);
    G.ui.toast('Caught ' + ITEMS[item].name, 'gold', 1400);
    G.gainXp('fishing', 16);
    checkQuestReady(); G.save.save();
  };
  G.useStation = (s) => {
    if (s.kind === 'cook') { G.openCook(); return;
    } else if (s.kind === 'furnace') {
      G.openSmelt(); return;
    } else if (s.kind === 'anvil') {
      G.openForge(); return;
    } else if (s.kind === 'bank') {
      G.openBank(); return;
    } else if (s.kind === 'craft') {
      G.openCraft(); return;
    } else if (s.kind === 'fletch') {
      G.openFletch(); return;
    } else if (s.kind === 'rune') {
      G.openRune(); return;
    } else if (s.kind === 'sawmill') {
      G.openSawmill(); return;
    } else if (s.kind === 'workbench') {
      G.openConstruct(); return;
    } else if (s.kind === 'farmdeed' || s.kind === 'foreman') {
      G.openFarm(); return;
    } else if (s.kind === 'bed') {
      player.state.hp = player.state.maxHp; player.state.prayer = player.state.maxPrayer;
      G.ui.setHealth(player.state.hp, player.state.maxHp); G.ui.setPrayer(player.state.prayer, player.state.maxPrayer);
      G.ui.toast('You rest. Health and prayer restored.', 'good', 2000); G.save.save(); return;
    } else if (s.kind === 'altar') {
      const b = G.inventory.count('bones');
      if (b > 0) { G.inventory.remove('bones', b); G.gainXp('prayer', 20 * b); }
      player.state.maxPrayer = maxPrayer();
      player.state.prayer = player.state.maxPrayer;
      G.ui.setPrayer(player.state.prayer, player.state.maxPrayer);
      G.ui.toast(b > 0 ? `Buried ${b} bones · prayer restored` : 'Prayer restored', 'good', 2000);
      G.save.save(); return;
    } else if (s.kind === 'cauldron') {
      G.openBrew(); return;
    } else if (s.kind === 'chest') {
      if (s.looted) { G.ui.toast('The chest is empty.', '', 1500); return; }
      s.looted = true;
      const parts = [];
      if (s.gold) { G.inventory.add('gold', s.gold); parts.push('+' + s.gold + 'g'); }
      for (const k in (s.loot || {})) { G.inventory.add(k, s.loot[k]); parts.push(`${ITEMS[k].name}×${s.loot[k]}`); }
      G.audio.sfx('pickup');
      G.fx.burst(s.x, s.y + 1, s.z, 0xffd45f, { n: 12, spread: 3, up: 3.5, life: 0.8 });
      G.ui.toast(`Looted ${s.label}: ${parts.join(', ')}`, 'gold', 3400); G.save.save(); return;
    } else if (s.kind === 'door') { G.enterBuilding(s); return;
    } else if (s.kind === 'exit') { G.exitInterior(); return;
    } else if (s.kind === 'shop') { G.openShop(); return;
    } else if (s.kind === 'tavern') { G.openTavern(); return;
    } else if (s.kind === 'patron') { G.ui.toast(PATRON_LINES[Math.floor(Math.random() * PATRON_LINES.length)], '', 3400); G.audio.sfx('ui'); return;
    } else if (s.kind === 'ledger') { G.openBusiness(); return;
    } else if (s.kind === 'jobboard') { G.openJobs(); return;
    }
    G.save.save();
  };

  G.weaponName = () => player.weapon().name;
  G.attackEnemy = (e) => {
    if (player.state.attackCd > 0 || !e.alive) return;
    const w = player.weapon();
    const dd = dist2D(player.position.x, player.position.z, e.pos.x, e.pos.z);
    if (dd > w.range + 0.6) return;            // out of range for this weapon
    player.state.attackCd = w.speed;
    player.playAttack(w.style);
    G.audio.sfx(w.style === 'magic' || w.style === 'ranged' ? 'cast' : 'hit');
    const gb = gearBonus(); const sk = w.style === 'ranged' ? 'ranged' : w.style === 'magic' ? 'magic' : 'melee';
    let dmg = Math.round(4 + G.skills.level(w.skill) * 1.2 + w.bonus + (gb[sk] || 0));
    if (w.style === 'ranged') { let arrow = null; for (const it of G.inventory.list()) { const d = it.def; if (d && d.type === 'ammo' && (!arrow || d.bonus > arrow.def.bonus)) arrow = it; } if (arrow) { G.inventory.remove(arrow.key, 1); dmg += arrow.def.bonus; } }   // fire your best arrows for bonus damage
    if (w.style === 'magic') { let rune = null; for (const it of G.inventory.list()) { const d = it.def; if (d && d.type === 'rune' && (!rune || d.bonus > rune.def.bonus)) rune = it; } if (rune) { G.inventory.remove(rune.key, 1); dmg += rune.def.bonus; } }   // channel your strongest runes
    const bf = player.state.buffs;   // combat potions multiply your damage
    if (bf) { if (w.style === 'ranged' && bf.ranging) dmg = Math.round(dmg * bf.ranging.mult); else if (w.style === 'magic' && bf.magic) dmg = Math.round(dmg * bf.magic.mult); else if (bf.strength && w.style !== 'ranged' && w.style !== 'magic') dmg = Math.round(dmg * bf.strength.mult); }
    const stance = ATTACK_STYLES[player.state.combatStance] || ATTACK_STYLES.accurate;   // attack stance: damage trade-off
    if (stance.dmgMult !== 1) dmg = Math.round(dmg * stance.dmgMult);
    const wk = WEAKNESS[e.enemyKey];   // COMBAT TRIANGLE: exploit the foe's weakness, suffer with the wrong style
    if (wk) { const tri = wk === sk ? TRIANGLE.strong : (TRIANGLE.pen[wk] === sk ? TRIANGLE.weak : 1); if (tri !== 1) dmg = Math.max(1, Math.round(dmg * tri)); }
    e._xpStance = player.state.combatStance;
    // status: magic hits may burn; a Venom Flask makes melee/ranged hits poison the foe (DoT ticked in entities.js)
    if (w.style === 'magic' && Math.random() < 0.3) e.dot = { kind: 'burn', dmg: Math.max(2, Math.round(dmg * 0.25)), t: 6, tick: 1.5 };
    else if (bf && bf.venom && w.style !== 'magic') e.dot = { kind: 'poison', dmg: 4, t: 8, tick: 1.5 };
    const apD = PRAYERS.find((pp) => pp.key === player.state.activePrayer);
    if (apD && apD.dmgDealt) dmg = Math.round(dmg * apD.dmgDealt);
    // special attack: a spec bar charges per hit and auto-unleashes when full (×2.4 + AoE splash)
    let special = false;
    if ((player.state.spec || 0) >= 100) { special = true; player.state.spec = 0; dmg = Math.round(dmg * 2.4); }
    else player.state.spec = Math.min(100, (player.state.spec || 0) + 6);
    G.ui.setSpec(player.state.spec || 0);
    const hitY = e.pos.y + 1.5 * (e.baseScale || 1);
    e._lastSkill = w.skill;
    if (w.style === 'ranged' || w.style === 'magic') {
      const from = player.handPosition().clone();
      const to = new THREE.Vector3(e.pos.x, hitY, e.pos.z);
      G.projectiles.spawn(w.style, from, to, () => { if (e.alive) { G.ui.hitsplat(e.pos.x, hitY, e.pos.z, dmg, 'enemy'); G.entities.damageEnemy(e, dmg); } });
    } else {
      G.ui.hitsplat(e.pos.x, hitY, e.pos.z, dmg, 'enemy');
      G.entities.damageEnemy(e, dmg);
    }
    if (special) {
      G.audio.sfx('ach'); G.ui.toast('✦ Special attack!', 'gold', 1300);
      if (G.fx) G.fx.burst(e.pos.x, hitY, e.pos.z, 0xffd24a, { n: 24, spread: 4, up: 4, life: 1.1 });
      for (const o of G.entities.enemies) { if (o.alive && o !== e && dist2D(o.pos.x, o.pos.z, e.pos.x, e.pos.z) < 4.5) { const sd = Math.round(dmg * 0.5); G.ui.hitsplat(o.pos.x, o.pos.y + 1.5, o.pos.z, sd, 'enemy'); G.entities.damageEnemy(o, sd); } }
    }
  };
  function quickAttack() {
    const t = G.currentTarget;
    if (t && t.kind === 'enemy') { G.combatTarget = t.ref; G.attackEnemy(t.ref); return; }
    const range = player.weapon().range + 0.6;
    let near = null, nd = range;
    for (const e of G.entities.enemies) {
      if (!e.alive) continue;
      const d = dist2D(player.position.x, player.position.z, e.pos.x, e.pos.z);
      if (d < nd) { nd = d; near = e; }
    }
    if (near) { G.combatTarget = near; G.attackEnemy(near); }
  }

  G.useItem = (key) => {
    const def = ITEMS[key]; if (!def) return;
    if (def.type === 'potion') { G.drinkPotion(key, def); return; }
    if (def.type === 'clue') { G.readClue(); return; }
    if (def.type !== 'consumable') return;
    if (player.state.hp >= player.state.maxHp) { G.ui.toast('Already at full health'); return; }
    player.state.hp = Math.min(player.state.maxHp, player.state.hp + def.heal);
    G.inventory.remove(key, 1);
    G.ui.setHealth(player.state.hp, player.state.maxHp);
    G.ui.toast(`Used ${def.name} (+${def.heal} HP)`, 'good', 1600);
    G.fx.burst(player.position.x, player.position.y + 1.5, player.position.z, 0x7CFFB0, { n: 9, up: 2.6 });
    G.save.save();
  };
  G.drinkPotion = (key, def) => {
    const st = player.state, b = st.buffs || (st.buffs = {});
    if (def.buff) b[def.buff] = { mult: def.mult, t: def.dur };
    if (def.cure === 'poison') { st.poison = null; b.antipoison = { t: def.dur || 120 }; }
    if (def.restorePrayer) { st.prayer = Math.min(st.maxPrayer, st.prayer + def.restorePrayer); G.ui.setPrayer(st.prayer, st.maxPrayer); }
    if (def.heal) { st.hp = Math.min(st.maxHp, st.hp + def.heal); G.ui.setHealth(st.hp, st.maxHp); }
    G.inventory.remove(key, 1);
    if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.7, player.position.z, def.col || 0x7cffb0, { n: 10, up: 2.6 });
    G.ui.toast(`Drank ${def.name}`, 'good', 1700); G.audio.sfx('pickup'); G.save.save();
  };
  // ---------- clue scrolls / treasure trails: read a clue → cryptic hint → dig the spot → casket ----------
  G.readClue = () => {
    if (G.activeClue) { G.ui.toast('Finish your current treasure trail first.', '', 1800); return; }
    if (!G.inventory.has('clue_scroll', 1)) return;
    G.inventory.remove('clue_scroll', 1);
    const spot = CLUE_SPOTS[Math.floor(Math.random() * CLUE_SPOTS.length)];
    G.activeClue = { x: spot.x, z: spot.z, hint: spot.hint };
    G.ui.toast(`📜 ${spot.hint}`, 'gold', 6000); G.audio.sfx('ui'); G.save.save();
  };
  G.digClue = () => {
    if (!G.activeClue) return;
    const gold = 200 + Math.floor(Math.random() * 400); G.inventory.add('gold', gold);
    const pool = ['sapphire', 'emerald', 'ruby', 'pearl', 'iron_bar', 'mithril_bar', 'potion'];
    const gearPool = ['guardian_amulet', 'ranger_amulet', 'sorcerer_amulet', 'rune_ring', 'serpent_eye', 'wight_crown'];
    const parts = [`${gold}g`], n = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) { const k = pool[Math.floor(Math.random() * pool.length)], q = 1 + Math.floor(Math.random() * 2); G.inventory.add(k, q); parts.push(`${ITEMS[k].name}×${q}`); }
    if (Math.random() < 0.55) { const g = gearPool[Math.floor(Math.random() * gearPool.length)]; G.inventory.add(g, 1); parts.push('✨ ' + ITEMS[g].name); }
    if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.2, player.position.z, 0xffe066, { n: 24, spread: 3, up: 4, life: 1.2 });
    G.ui.levelBanner('✦ Treasure!'); G.ui.toast(`Dug up a casket — ${parts.join(', ')}`, 'gold', 4400); G.audio.sfx('ach');
    G.activeClue = null; if (G.ach) G.ach.evaluate(); G.save.save();
  };

  // Dynamic market: a per-item price multiplier drifts over time; buy & sell share it (no same-item
  // arbitrage), plus a transient event modifier (caravan = cheap buys, shortage = rich sells).
  G.buyPrice = (key, base) => Math.max(1, Math.round(base * (G.market.mult[key] || 1) * (G.market.event && G.market.event.kind === 'caravan' ? 0.75 : 1)));
  G.sellPrice = (key, base) => Math.max(1, Math.round(base * (G.market.mult[key] || 1) * (G.market.event && G.market.event.kind === 'shortage' ? 1.3 : 1)));
  G.buyItem = (key) => {
    const s = SHOP.stock.find((x) => x.key === key); if (!s) return;
    const price = G.buyPrice(key, s.price);
    if (G.inventory.count('gold') >= price) { G.inventory.remove('gold', price); G.inventory.add(key, 1); G.ui.toast(`Bought ${ITEMS[key].name} (${price}g)`, 'gold', 1300); G.save.save(); }
    else G.ui.toast('Not enough gold', 'bad', 1400);
  };
  G.sellItem = (key) => {
    const base = SHOP.sell[key]; if (!base || !G.inventory.has(key, 1)) return;
    const p = G.sellPrice(key, base);
    G.inventory.remove(key, 1); G.inventory.add('gold', p);
    G.ui.toast(`Sold ${ITEMS[key].name}  +${p}g`, 'gold', 1300); G.save.save();
  };
  const priceArrow = (p, base) => (p > base ? ' ↑' : p < base ? ' ↓' : '');
  const shopCfg = {
    title: 'Trader Pell', hint: '↑ ↓ select · tap buy/sell · ↑↓↑↓ leave',
    rows: () => {
      const ev = G.market.event ? `📣 ${EVENT_NAME[G.market.event.kind]}!` : 'prices drift with supply & demand';
      const rows = SHOP.stock.map((s) => { const p = G.buyPrice(s.key, s.price); return { section: `Buy · ${ev}`, icon: ITEMS[s.key].icon, title: ITEMS[s.key].name, sub: ITEMS[s.key].desc, right: `🪙 ${p}${priceArrow(p, s.price)}`, data: { t: 'buy', key: s.key } }; });
      G.inventory.list().filter((it) => SHOP.sell[it.key]).forEach((it) => { const p = G.sellPrice(it.key, SHOP.sell[it.key]); rows.push({ section: 'Sell (one)', icon: it.def.icon, title: it.def.name, sub: 'tap to sell', right: `🪙 ${p}${priceArrow(p, SHOP.sell[it.key])} · ×${it.count}`, data: { t: 'sell', key: it.key } }); });
      return rows;
    },
    onSelect: (r) => { if (r.data.t === 'buy') G.buyItem(r.data.key); else G.sellItem(r.data.key); },
  };
  const forgeCfg = {
    title: 'Anvil — Forge', hint: '↑ ↓ select · tap forge · ↑↓↑↓ leave', empty: 'Smelt bars at the furnace first.',
    rows: () => FORGE.map((rec) => {
      const cost = Object.keys(rec.cost).map((k) => `${rec.cost[k]} ${ITEMS[k].name}`).join(', ');
      const can = Object.keys(rec.cost).every((k) => G.inventory.has(k, rec.cost[k]));
      const ty = ITEMS[rec.out].type; const section = ty === 'armor' ? 'Armor' : ty === 'tool' ? 'Tools' : 'Weapons';
      return { section, icon: ITEMS[rec.out].icon, title: ITEMS[rec.out].name, sub: cost, right: can ? 'forge' : '—', data: { out: rec.out } };
    }),
    onSelect: (r) => G.forgeItem(r.data.out),
  };
  const bankCfg = {
    title: 'Bank', hint: '↑ ↓ select · tap deposit/withdraw all · ↑↓↑↓ leave', empty: 'Your pack and bank are empty.',
    rows: () => {
      const eq = player.state.equipment;
      const equipped = new Set([eq.weapon, eq.armor, eq.amulet, eq.ring, eq.shield].filter(Boolean));   // don't let equipped gear be banked away (would vanish from the Gear list)
      const rows = G.inventory.list().filter((it) => !equipped.has(it.key)).map((it) => ({ section: 'Deposit (all)', icon: it.def.icon, title: it.def.name, sub: 'tap to bank', right: `×${it.count}`, data: { op: 'dep', key: it.key } }));
      Object.keys(G.bankItems).filter((k) => G.bankItems[k] > 0).forEach((k) => rows.push({ section: 'Withdraw (all)', icon: ITEMS[k].icon, title: ITEMS[k].name, sub: 'tap to take', right: `×${G.bankItems[k]}`, data: { op: 'wd', key: k } }));
      return rows;
    },
    onSelect: (r) => { if (r.data.op === 'dep') G.bankDeposit(r.data.key); else G.bankWithdraw(r.data.key); },
  };
  G.openShop = () => { setMode('picker'); G.ui.openPicker(shopCfg); };
  G.openForge = () => { setMode('picker'); G.ui.openPicker(forgeCfg); };
  G.openBank = () => { setMode('picker'); G.ui.openPicker(bankCfg); };
  G.closePicker = () => { G.ui.closePicker(); setMode(G.inInterior ? 'interior' : 'world'); };

  // ---------- economy: ventures (Merchants' Guild) + work shifts (Job Board) ----------
  const businessCfg = {
    title: 'Merchants’ Guild', empty: 'No ventures yet.',
    rows: () => {
      const rows = [];
      for (const def of BUSINESSES) {
        if (!G.economy.owned(def.key)) {
          rows.push({ section: 'Found a venture (earns coin while you adventure)', icon: def.icon, title: def.name, sub: def.desc, right: `${def.foundCost}g`, data: { op: 'found', key: def.key } });
        } else {
          const lvl = G.economy.levelOf(def.key), emp = G.economy.empOf(def.key), acc = G.economy.accruedOf(def.key), net = Math.round(G.economy.netPerMin(def.key));
          const sect = `${def.icon} ${def.name} · Lv ${lvl} · ${net}g/min`;
          rows.push({ section: sect, icon: '💰', title: 'Collect earnings', sub: `${emp}/${def.maxEmp} ${def.empName}${emp === 1 ? '' : 's'} on staff`, right: `${acc}g`, data: { op: 'collect', key: def.key } });
          rows.push({ section: sect, icon: '⬆️', title: `Upgrade to Lv ${lvl + 1}`, sub: 'raises output', right: `${G.economy.upgradeCost(def.key)}g`, data: { op: 'upgrade', key: def.key } });
          if (G.economy.canHire(def.key)) rows.push({ section: sect, icon: def.empIcon, title: `Hire ${def.empName}`, sub: `+${def.empBoost}g/min (−${def.wage}g/min wage)`, right: `${G.economy.hireCost(def.key)}g`, data: { op: 'hire', key: def.key } });
        }
      }
      return rows;
    },
    onSelect: (r) => G.bizAction(r.data.op, r.data.key),
  };
  const jobsCfg = {
    title: 'Job Board', hint: '↑ ↓ select · tap to work a shift · ↑↓↑↓ leave',
    rows: () => JOBS.map((j) => ({ icon: j.icon, title: j.name, sub: `${j.dur}s shift · +${j.xp} ${j.skill} xp`, right: `${j.pay}g`, data: { key: j.key } })),
    onSelect: (r) => { const j = JOBS.find((x) => x.key === r.data.key); G.closePicker(); G.workJob(j); },
  };
  G.openBusiness = () => { setMode('picker'); G.ui.openPicker(businessCfg); };
  G.openJobs = () => { setMode('picker'); G.ui.openPicker(jobsCfg); };
  G.bizAction = (op, key) => {
    const def = BUSINESSES.find((b) => b.key === key); if (!def) return;
    const gold = () => G.inventory.count('gold');
    if (op === 'found') { if (gold() < def.foundCost) return G.ui.toast('Not enough gold', 'bad', 1600); G.inventory.remove('gold', def.foundCost); G.economy.found(key); G.ui.toast(`Founded your ${def.name}!`, 'gold', 2600); G.audio.sfx('level'); if (G.ach) G.ach.evaluate(); }
    else if (op === 'collect') { const g = G.economy.collect(key); if (g <= 0) return G.ui.toast('No earnings to collect yet', '', 1500); G.inventory.add('gold', g); G.ui.toast(`Collected ${g}g from your ${def.name}`, 'gold', 2400); G.audio.sfx('pickup'); }
    else if (op === 'upgrade') { const c = G.economy.upgradeCost(key); if (gold() < c) return G.ui.toast('Not enough gold', 'bad', 1600); G.inventory.remove('gold', c); G.economy.upgrade(key); G.ui.toast(`${def.name} upgraded!`, 'gold', 2000); G.audio.sfx('ui'); }
    else if (op === 'hire') { const c = G.economy.hireCost(key); if (gold() < c) return G.ui.toast('Not enough gold', 'bad', 1600); G.inventory.remove('gold', c); G.economy.hire(key); G.ui.toast(`Hired a ${def.empName}!`, 'gold', 2000); G.audio.sfx('ui'); }
    G.save.save();
  };
  G.workJob = (j) => { if (!j || G.channel) return; startChannel(j.dur, j.anim, 'Working: ' + j.name, () => { G.inventory.add('gold', j.pay); G.ui.toast(`Shift done · +${j.pay}g`, 'gold', 2200); G.gainXp(j.skill, j.xp); G.audio.sfx('pickup'); checkQuestReady(); G.save.save(); }); };

  // ---------- your farmstead: buy the land, raise + sell livestock, collect produce, hire hands ----------
  const farmCfg = {
    title: 'Farm Foreman', hint: '↑ ↓ select · tap · ↑↓↑↓ leave',
    rows: () => {
      if (!G.farm.owned()) return [{ section: 'For sale', icon: '🚜', title: 'Buy Meadowbrook Farmstead', sub: 'Own the land — raise livestock & hire hands', right: `${FARM.cost}g`, data: { op: 'buy' } }];
      const rows = [];
      for (const def of LIVESTOCK) {
        const c = G.farm.countOf(def.key), m = G.farm.matureOf(def.key);
        const sect = `${def.icon} ${def.name}: ${c} owned · ${m} grown${def.produce ? ` · ${ITEMS[def.produce].name.toLowerCase()}` : ''}`;
        rows.push({ section: sect, icon: def.icon, title: `Buy a young ${def.name.toLowerCase()}`, sub: `matures in ~${def.growMin} min`, right: `${def.cost}g`, data: { op: 'buyAnimal', key: def.key } });
        if (m > 0) rows.push({ section: sect, icon: '🪙', title: `Sell a grown ${def.name.toLowerCase()}`, sub: `${m} ready to sell`, right: `+${def.sell}g`, data: { op: 'sellAnimal', key: def.key } });
      }
      const prod = G.farm.produceAccrued(), pk = Object.keys(prod);
      if (pk.length) rows.push({ section: 'Harvest', icon: '🧺', title: 'Collect produce', sub: pk.map((k) => `${prod[k]}× ${ITEMS[k].name}`).join(', '), right: 'take', data: { op: 'collectProduce' } });
      rows.push({ section: 'Farmhands', icon: '🧑‍🌾', title: G.farm.canHire() ? `Hire a farmhand (${G.farm.workerCount()}/${FARM.maxWorkers})` : `Farmhands ${G.farm.workerCount()}/${FARM.maxWorkers} — full`, sub: `they run the farm: +${FARM.workerOutput - FARM.workerWage}g/min each`, right: G.farm.canHire() ? `${G.farm.hireCost()}g` : '—', data: { op: 'hire' } });
      rows.push({ section: 'Farmhands', icon: '💰', title: 'Collect earnings', sub: `${Math.round(G.farm.netGoldPerMin())}g/min from your hands`, right: `${G.farm.goldAccrued()}g`, data: { op: 'collectGold' } });
      for (const def of LIVESTOCK) if (def.produce && G.inventory.count(def.produce) > 0) rows.push({ section: 'Sell produce', icon: ITEMS[def.produce].icon, title: `Sell ${ITEMS[def.produce].name}`, sub: `${G.inventory.count(def.produce)} in your pack`, right: `+${def.sellPrice}g ea`, data: { op: 'sellProduce', key: def.produce, price: def.sellPrice } });
      return rows;
    },
    onSelect: (r) => G.farmAction(r.data),
  };
  G.openFarm = () => { setMode('picker'); G.ui.openPicker(farmCfg); };
  G.farmAction = (d) => {
    const gold = () => G.inventory.count('gold');
    if (d.op === 'buy') { if (gold() < FARM.cost) return G.ui.toast('Not enough gold', 'bad', 1600); G.inventory.remove('gold', FARM.cost); G.farm.buyFarm(); G.ui.toast('🚜 You bought the farmstead!', 'gold', 2800); G.audio.sfx('level'); if (G.ach) G.ach.evaluate(); }
    else if (d.op === 'buyAnimal') { const def = LIVESTOCK.find((l) => l.key === d.key); if (gold() < def.cost) return G.ui.toast('Not enough gold', 'bad', 1600); G.inventory.remove('gold', def.cost); G.farm.buyAnimal(d.key); G.ui.toast(`Bought a young ${def.name.toLowerCase()}`, 'gold', 2000); G.audio.sfx('pickup'); }
    else if (d.op === 'sellAnimal') { const g = G.farm.sellMature(d.key); if (g <= 0) return G.ui.toast('None grown yet', '', 1500); G.inventory.add('gold', g); G.ui.toast(`Sold a grown ${LIVESTOCK.find((l) => l.key === d.key).name.toLowerCase()} · +${g}g`, 'gold', 2200); G.audio.sfx('pickup'); }
    else if (d.op === 'collectProduce') { const o = G.farm.collectProduce(); const parts = []; for (const k in o) { G.inventory.add(k, o[k]); parts.push(`${o[k]}× ${ITEMS[k].name}`); } G.ui.toast(parts.length ? `Collected ${parts.join(', ')}` : 'Nothing to collect', parts.length ? 'gold' : '', 2200); if (parts.length) G.audio.sfx('pickup'); }
    else if (d.op === 'hire') { if (!G.farm.canHire()) return; const c = G.farm.hireCost(); if (gold() < c) return G.ui.toast('Not enough gold', 'bad', 1600); G.inventory.remove('gold', c); G.farm.hireWorker(); G.ui.toast('Hired a farmhand!', 'gold', 2000); G.audio.sfx('ui'); }
    else if (d.op === 'collectGold') { const g = G.farm.collectGold(); if (g <= 0) return G.ui.toast('No earnings yet', '', 1500); G.inventory.add('gold', g); G.ui.toast(`Collected ${g}g from the farm`, 'gold', 2200); G.audio.sfx('pickup'); }
    else if (d.op === 'sellProduce') { const n = G.inventory.count(d.key); if (n <= 0) return; G.inventory.remove(d.key, n); G.inventory.add('gold', n * d.price); G.ui.toast(`Sold ${n}× ${ITEMS[d.key].name} · +${n * d.price}g`, 'gold', 2200); G.audio.sfx('pickup'); }
    G.save.save();
  };

  // ---------- interactive cooking: pick a raw food at the stove, watch it cook (progress bar + stir) ----------
  const cookCfg = {
    title: 'Cooking Pot', hint: '↑ ↓ select · tap to cook · ↑↓↑↓ leave', empty: 'No raw food to cook — catch some fish or harvest a crop first.',
    rows: () => Object.keys(COOK).filter((raw) => G.inventory.count(raw) > 0).map((raw) => ({ icon: ITEMS[raw].icon, title: `Cook ${ITEMS[raw].name}`, sub: `→ ${ITEMS[COOK[raw]].name}`, right: `×${G.inventory.count(raw)}`, data: { raw } })),
    onSelect: (r) => { G.closePicker(); G.cookItem(r.data.raw); },
  };
  G.openCook = () => { setMode('picker'); G.ui.openPicker(cookCfg); };
  G.cookItem = (raw) => {
    if (G.channel || !COOK[raw]) return;
    const n = G.inventory.count(raw); if (!n) return;
    const cooked = COOK[raw], dur = Math.max(1.6, Math.min(6, n * 0.9));
    startChannel(dur, 'cook', `Cooking ${ITEMS[raw].name}…`, () => {
      const have = G.inventory.count(raw); if (!have) return;
      G.inventory.remove(raw, have); G.inventory.add(cooked, have);
      G.gainXp('cooking', 12 * have);
      if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.3, player.position.z, 0xffe2b0, { n: 12, spread: 2.4, up: 3, life: 0.9 });
      G.ui.toast(`Cooked ${have} × ${ITEMS[cooked].name}`, 'good', 2600);
      G.audio.sfx('pickup'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save();
    });
  };

  // ---------- interactive smelting: pick an ore→bar recipe, watch it smelt (progress bar) ----------
  const maxSmelt = (r) => { let m = Infinity; for (const k in r.in) m = Math.min(m, Math.floor(G.inventory.count(k) / r.in[k])); return m; };
  const smeltCfg = {
    title: 'Furnace', hint: '↑ ↓ select · tap to smelt · ↑↓↑↓ leave', empty: 'No ore to smelt — mine some at a quarry first.',
    rows: () => SMELT.filter((r) => maxSmelt(r) >= 1).map((r) => ({ icon: ITEMS[r.out].icon, title: `Smelt ${ITEMS[r.out].name}`, sub: Object.keys(r.in).map((k) => `${r.in[k]}× ${ITEMS[k].name}`).join(' + '), right: `×${maxSmelt(r)}`, data: { out: r.out } })),
    onSelect: (r) => { G.closePicker(); G.smeltItem(r.data.out); },
  };
  G.openSmelt = () => { setMode('picker'); G.ui.openPicker(smeltCfg); };
  G.smeltItem = (out) => {
    if (G.channel) return;
    const r = SMELT.find((x) => x.out === out); if (!r || maxSmelt(r) < 1) return;
    const dur = Math.max(1.6, Math.min(6, maxSmelt(r) * 0.9));
    startChannel(dur, 'mine', `Smelting ${ITEMS[out].name}…`, () => {
      let made = 0;
      while (Object.keys(r.in).every((k) => G.inventory.has(k, r.in[k]))) { for (const k in r.in) G.inventory.remove(k, r.in[k]); G.inventory.add(out, 1); G.gainXp('smithing', r.xp); made++; }
      if (made) { if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.2, player.position.z, 0xff7a33, { n: 12, spread: 2.2, up: 3, life: 0.8 }); G.ui.toast(`Smelted ${made} × ${ITEMS[out].name}`, 'good', 2400); G.audio.sfx('pickup'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save(); }
    });
  };

  // ---------- interactive herblore: brew potions at a cauldron (level-gated, herb + secondary) ----------
  const maxBrew = (r) => { let m = Infinity; for (const k in r.in) m = Math.min(m, Math.floor(G.inventory.count(k) / r.in[k])); return m; };
  const brewCfg = {
    title: 'Cauldron — Herblore', hint: '↑ ↓ select · tap to brew · ↑↓↑↓ leave', empty: 'Forage Glimmerleaf (herbs) + a secondary to brew.',
    rows: () => BREW.map((r) => {
      const locked = G.skills.level('herblore') < (r.level || 1), n = maxBrew(r);
      if (n < 1 && !locked) return null;
      return { section: 'Brew potions', icon: ITEMS[r.out].icon, title: ITEMS[r.out].name, sub: Object.keys(r.in).map((k) => `${r.in[k]}× ${ITEMS[k].name}`).join(' + ') + (locked ? ` · needs Herblore ${r.level}` : ''), right: locked ? '🔒' : `×${n}`, data: { out: r.out } };
    }).filter(Boolean),
    onSelect: (r) => { G.closePicker(); G.brewItem(r.data.out); },
  };
  G.openBrew = () => { setMode('picker'); G.ui.openPicker(brewCfg); };
  G.brewItem = (out) => {
    if (G.channel) return;
    const r = BREW.find((x) => x.out === out); if (!r) return;
    if (G.skills.level('herblore') < (r.level || 1)) { G.ui.toast(`Needs Herblore level ${r.level}`, 'bad', 2000); return; }
    if (maxBrew(r) < 1) return;
    const dur = Math.max(1.6, Math.min(6, maxBrew(r) * 0.9));
    startChannel(dur, 'forage', `Brewing ${ITEMS[out].name}…`, () => {
      let made = 0;
      while (Object.keys(r.in).every((k) => G.inventory.has(k, r.in[k])) && made < 40) { for (const k in r.in) G.inventory.remove(k, r.in[k]); G.inventory.add(out, 1); G.gainXp('herblore', r.xp); made++; }
      if (made) { if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.3, player.position.z, 0x7cffb0, { n: 12, spread: 2.2, up: 3, life: 0.9 }); G.ui.toast(`Brewed ${made} × ${ITEMS[out].name}`, 'good', 2400); G.audio.sfx('pickup'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save(); }
    });
  };

  // ---------- interactive fletching: carve bows + arrows at the bench (Woodcutting → Ranged) ----------
  const maxFletch = (r) => { let m = Infinity; for (const k in r.cost) m = Math.min(m, Math.floor(G.inventory.count(k) / r.cost[k])); return m; };
  const fletchCfg = {
    title: 'Fletching Bench', hint: '↑ ↓ select · tap to fletch · ↑↓↑↓ leave', empty: 'Chop logs and forage feathers to fletch bows & arrows.',
    rows: () => FLETCH.map((r) => {
      const locked = G.skills.level('fletching') < (r.level || 1), n = maxFletch(r);
      if (n < 1 && !locked) return null;
      return { section: ITEMS[r.out].type === 'weapon' ? 'Bows' : 'Arrows & parts', icon: ITEMS[r.out].icon, title: ITEMS[r.out].name + (r.qty > 1 ? ` ×${r.qty}` : ''), sub: Object.keys(r.cost).map((k) => `${r.cost[k]}× ${ITEMS[k].name}`).join(' + ') + (locked ? ` · needs Fletching ${r.level}` : ''), right: locked ? '🔒' : `×${n}`, data: { out: r.out } };
    }).filter(Boolean),
    onSelect: (r) => { G.closePicker(); G.fletchItem(r.data.out); },
  };
  G.openFletch = () => { setMode('picker'); G.ui.openPicker(fletchCfg); };
  G.fletchItem = (out) => {
    if (G.channel) return;
    const r = FLETCH.find((x) => x.out === out); if (!r) return;
    if (G.skills.level('fletching') < (r.level || 1)) { G.ui.toast(`Needs Fletching level ${r.level}`, 'bad', 2000); return; }
    if (maxFletch(r) < 1) return;
    const dur = Math.max(1.4, Math.min(5, maxFletch(r) * 0.5));
    startChannel(dur, 'forage', `Fletching ${ITEMS[out].name}…`, () => {
      let made = 0;
      while (Object.keys(r.cost).every((k) => G.inventory.has(k, r.cost[k])) && made < 40) { for (const k in r.cost) G.inventory.remove(k, r.cost[k]); G.inventory.add(out, r.qty || 1); G.gainXp('fletching', r.xp); made++; }
      if (made) { if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.2, player.position.z, 0xd8c08a, { n: 10, spread: 2, up: 2.6, life: 0.8 }); G.ui.toast(`Fletched ${made * (r.qty || 1)} × ${ITEMS[out].name}`, 'good', 2400); G.audio.sfx('pickup'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save(); }
    });
  };

  // ---------- rune altar: bind essence into runes (Runecrafting) + enchant jewelry (Magic) ----------
  const maxMake = (cost) => { let m = Infinity; for (const k in cost) m = Math.min(m, Math.floor(G.inventory.count(k) / cost[k])); return m; };
  const runeCfg = {
    title: 'Rune Altar', hint: '↑ ↓ select · tap · ↑↓↑↓ leave', empty: 'Mine rune essence in the fae glade, then bind it here.',
    rows: () => {
      const rows = [];
      for (const r of RUNECRAFT) { const locked = G.skills.level('runecraft') < (r.level || 1), n = maxMake(r.cost); if (n < 1 && !locked) continue; rows.push({ section: 'Bind runes (Runecrafting)', icon: ITEMS[r.out].icon, title: ITEMS[r.out].name + (r.qty > 1 ? ` ×${r.qty}` : ''), sub: Object.keys(r.cost).map((k) => `${r.cost[k]}× ${ITEMS[k].name}`).join(' + ') + (locked ? ` · needs Runecrafting ${r.level}` : ''), right: locked ? '🔒' : `×${n}`, data: { kind: 'rc', out: r.out } }); }
      for (const r of ENCHANT) { const locked = G.skills.level('magic') < (r.level || 1), n = maxMake(r.cost); if (n < 1 && !locked) continue; rows.push({ section: 'Enchant jewelry (Magic)', icon: ITEMS[r.out].icon, title: ITEMS[r.out].name, sub: Object.keys(r.cost).map((k) => `${r.cost[k]}× ${ITEMS[k].name}`).join(' + ') + (locked ? ` · needs Magic ${r.level}` : ''), right: locked ? '🔒' : `×${n}`, data: { kind: 'en', out: r.out } }); }
      return rows;
    },
    onSelect: (r) => { G.closePicker(); if (r.data.kind === 'rc') G.runecraftItem(r.data.out); else G.enchantItem(r.data.out); },
  };
  G.openRune = () => { setMode('picker'); G.ui.openPicker(runeCfg); };
  G.runecraftItem = (out) => {
    if (G.channel) return;
    const r = RUNECRAFT.find((x) => x.out === out); if (!r) return;
    if (G.skills.level('runecraft') < (r.level || 1)) { G.ui.toast(`Needs Runecrafting level ${r.level}`, 'bad', 2000); return; }
    if (maxMake(r.cost) < 1) return;
    const dur = Math.max(1.4, Math.min(5, maxMake(r.cost) * 0.5));
    startChannel(dur, 'forage', `Binding ${ITEMS[out].name}…`, () => {
      let made = 0;
      while (Object.keys(r.cost).every((k) => G.inventory.has(k, r.cost[k])) && made < 60) { for (const k in r.cost) G.inventory.remove(k, r.cost[k]); G.inventory.add(out, r.qty || 1); G.gainXp('runecraft', r.xp); made++; }
      if (made) { if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.3, player.position.z, 0xb98fff, { n: 14, spread: 2.4, up: 3.2, life: 1 }); G.ui.toast(`Bound ${made * (r.qty || 1)} × ${ITEMS[out].name}`, 'good', 2400); G.audio.sfx('cast'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save(); }
    });
  };
  G.enchantItem = (out) => {
    if (G.channel) return;
    const r = ENCHANT.find((x) => x.out === out); if (!r) return;
    if (G.skills.level('magic') < (r.level || 1)) { G.ui.toast(`Needs Magic level ${r.level}`, 'bad', 2000); return; }
    if (maxMake(r.cost) < 1) return;
    startChannel(2.4, 'forage', `Enchanting ${ITEMS[out].name}…`, () => {
      if (maxMake(r.cost) < 1) return;
      for (const k in r.cost) G.inventory.remove(k, r.cost[k]); G.inventory.add(out, 1); G.gainXp('magic', r.xp);
      if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.3, player.position.z, 0x8af0ff, { n: 16, spread: 2.4, up: 3.4, life: 1.1 });
      G.ui.toast(`Enchanted ${ITEMS[out].name}!`, 'gold', 2600); G.audio.sfx('level'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save();
    });
  };

  // ---------- Construction: saw logs into planks (sawmill) + build home furniture (workbench) ----------
  G.sawPlanks = () => {
    if (G.channel) return; const n = G.inventory.count('wood'); if (!n) return;
    const dur = Math.max(1.4, Math.min(5, n * 0.4));
    startChannel(dur, 'chop', 'Sawing planks…', () => {
      const have = G.inventory.count('wood'); if (!have) return;
      G.inventory.remove('wood', have); G.inventory.add('plank', have); G.gainXp('construction', 6 * have);
      if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.2, player.position.z, 0xc8a86a, { n: 10, spread: 2, up: 2.6, life: 0.8 });
      G.ui.toast(`Sawed ${have} × Plank`, 'good', 2400); G.audio.sfx('pickup'); if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save();
    });
  };
  const sawCfg = {
    title: 'Sawmill', hint: '↑ ↓ select · tap to saw · ↑↓↑↓ leave', empty: 'Chop some logs first.',
    rows: () => { const n = G.inventory.count('wood'); return n > 0 ? [{ icon: '🪵', title: 'Saw logs into Planks', sub: `${n}× Logs → ${n}× Plank`, right: `×${n}`, data: {} }] : []; },
    onSelect: () => { G.closePicker(); G.sawPlanks(); },
  };
  G.openSawmill = () => { setMode('picker'); G.ui.openPicker(sawCfg); };
  G.buildFurniture = (key) => {
    const r = CONSTRUCT.find((x) => x.key === key); if (!r) return;
    const f = world.houseFurniture[key]; if (!f) return;
    if (f.built) { G.ui.toast('Already built.', '', 1500); return; }
    if (G.skills.level('construction') < (r.level || 1)) { G.ui.toast(`Needs Construction level ${r.level}`, 'bad', 2000); return; }
    if (!Object.keys(r.cost).every((k) => G.inventory.has(k, r.cost[k]))) { G.ui.toast('Not enough planks.', 'bad', 1800); return; }
    for (const k in r.cost) G.inventory.remove(k, r.cost[k]);
    f.built = true; f.mesh.visible = true; world.stations.push(f.station);
    G.gainXp('construction', r.xp);
    if (G.fx) G.fx.burst(f.station.x, f.station.y + 1, f.station.z, 0xd8c08a, { n: 16, spread: 2.2, up: 3, life: 1 });
    G.ui.toast(`Built ${r.name} at your house!`, 'gold', 2800); G.audio.sfx('level'); if (G.ach) G.ach.evaluate(); G.save.save();
  };
  const constructCfg = {
    title: 'Carpenter’s Workbench', hint: '↑ ↓ select · tap to build · ↑↓↑↓ leave', empty: 'Saw planks at a sawmill, then build here.',
    rows: () => CONSTRUCT.map((r) => {
      const f = world.houseFurniture[r.key], built = f && f.built, locked = G.skills.level('construction') < (r.level || 1);
      const can = Object.keys(r.cost).every((k) => G.inventory.has(k, r.cost[k]));
      return { section: 'Home furniture (built at your house)', icon: '🪚', title: r.name + (built ? ' ✓' : ''), sub: built ? 'already built' : (Object.keys(r.cost).map((k) => `${r.cost[k]}× ${ITEMS[k].name}`).join(' + ') + (locked ? ` · needs Construction ${r.level}` : '')), right: built ? '—' : (locked ? '🔒' : (can ? 'build' : '—')), data: { key: r.key } };
    }),
    onSelect: (r) => { G.closePicker(); G.buildFurniture(r.data.key); },
  };
  G.openConstruct = () => { setMode('picker'); G.ui.openPicker(constructCfg); };

  // ---------- hidden discoveries: one-time reward + headline banner when you stumble on one ----------
  G.findDiscovery = (d) => {
    if (!d || d.found) return;
    d.found = true;
    if (d.mesh) d.mesh.visible = false;
    if (G.fx) G.fx.burst(d.x, d.y + 1, d.z, 0xffe066, { n: 20, spread: 2.8, up: 3.6, life: 1.1 });
    const parts = [];
    if (d.gold) { G.inventory.add('gold', d.gold); parts.push(`+${d.gold}g`); }
    for (const k in (d.loot || {})) { G.inventory.add(k, d.loot[k]); parts.push(`${ITEMS[k].name}×${d.loot[k]}`); }
    for (const sk in (d.xp || {})) G.gainXp(sk, d.xp[sk]);
    G.ui.levelBanner('✦ ' + d.name);
    G.ui.toast(`${d.msg}${parts.length ? '  ' + parts.join(', ') : ''}`, 'gold', 4400);
    G.audio.sfx('ach');
    if (G.ach) G.ach.evaluate(); checkQuestReady(); G.save.save();
  };

  const tavernCfg = {
    title: 'Tavern Keeper', hint: '↑ ↓ select · tap to order · ↑↓↑↓ leave',
    rows: () => TAVERN.map((d) => ({ icon: ITEMS[d.key].icon, title: ITEMS[d.key].name, sub: ITEMS[d.key].desc, right: `🪙 ${d.price}`, data: { key: d.key, price: d.price } })),
    onSelect: (r) => G.buyDrink(r.data.key, r.data.price),
  };
  G.openTavern = () => { setMode('picker'); G.ui.openPicker(tavernCfg); };
  G.buyDrink = (key, price) => {
    if (G.inventory.count('gold') >= price) { G.inventory.remove('gold', price); G.inventory.add(key, 1); G.audio.sfx('pickup'); G.ui.toast(`Ordered ${ITEMS[key].name}`, 'gold', 1500); G.save.save(); }
    else G.ui.toast('Not enough gold', 'bad', 1400);
  };

  // ---------- starter classes + restart ----------
  G.startClass = (key) => {
    const c = CLASSES.find((x) => x.key === key) || CLASSES[0];
    const g = c.grant;
    player.state.equipment = { weapon: g.weapon || null, armor: g.armor || null, amulet: null, ring: null, shield: g.shield || null };
    for (const k in (g.items || {})) G.inventory.add(k, g.items[k]);
    player.refreshEquipment(); applyMaxHp();
    player.state.hp = player.state.maxHp; G.ui.setHealth(player.state.hp, player.state.maxHp);
    G.ui.toast(`You begin as a ${c.name}!`, 'good', 3200); G.audio.sfx('level'); G.save.save();
  };
  const classCfg = {
    title: 'Choose your class', hint: '↑ ↓ select · tap to begin',
    rows: () => CLASSES.map((c) => ({ icon: c.icon, title: c.name, sub: c.desc, data: { key: c.key } })),
    onSelect: (r) => { G.startClass(r.data.key); G.closePicker(); },
  };
  G.openClassPicker = () => { setMode('picker'); G.ui.openPicker(classCfg); };
  let restartArmed = 0, wiping = false;   // wiping guards the unload/interval autosave so Restart & Import can't be clobbered
  G.requestRestart = () => {
    const now = performance.now();
    if (restartArmed && now - restartArmed < 5000) { wiping = true; try { sessionStorage.setItem('glassrealm.fresh', '1'); } catch (e) {} G.save.clear(); location.reload(); }
    else { restartArmed = now; G.ui.toast('Tap Restart again to confirm — this wipes your save!', 'bad', 4500); }
  };

  // ---------- portable cross-device saves (copy a code between glasses / phone / PC) ----------
  G.exportSave = () => {
    G.save.save();
    const code = G.save.exportCode();
    if (!code) { G.ui.toast('Could not export save.', 'bad', 2200); return; }
    const ok = () => G.ui.toast('Save code copied! Paste it via Import on another device.', 'good', 5000);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, () => window.prompt('Copy your save code:', code));
    else window.prompt('Copy your save code:', code);
  };
  G.importSave = () => {
    const code = window.prompt('Paste a GlassRealm save code from another device:');
    if (!code) return;
    if (G.save.importCode(code)) { wiping = true; G.ui.toast('Save loaded — reloading…', 'good', 1500); setTimeout(() => location.reload(), 700); }
    else G.ui.toast('That save code was invalid.', 'bad', 3200);
  };
  G.copySyncLink = () => {
    if (!G.cloud || !G.cloud.enabled) { G.ui.toast('Cloud sync is off — set cloudUrl in config.js (see /worker).', '', 4200); return; }
    const link = G.cloud.link();
    G.ui.showSync(link);   // show it on-screen (big text + QR) — readable + scannable on the glasses
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).catch(() => {});
  };

  // ---------- enter / exit buildings ----------
  const BUILDING_NAME = { home: 'Home', store: 'General Store', bank: 'Bank', workshop: 'Workshop', tavern: 'Tavern', forge: 'Forge' };
  G.enterBuilding = (door) => {
    cancelChannel(); clearCombat();
    G.returnPos = { x: door.x, z: door.z, heading: player.state.heading };
    const info = G.interiors.enter(door.building);
    G.interiorStations = info.stations;
    G.inInterior = true;
    world.group.visible = false;   // stop drawing the whole overworld while indoors
    G.entities.setHidden(true);
    player.setBounds(info.bounds);
    player.setSolids(info.solids);   // collide with furniture / indoor NPCs
    player.group.position.set(info.entry.x, info.bounds.y, info.entry.z);
    player.state.heading = Math.PI;
    player.snapCamera();
    setMode('interior');
    G.audio.sfx('ui');
    G.ui.setLocation(BUILDING_NAME[door.building] || 'Building');
    G.ui.toast(`Entered the ${BUILDING_NAME[door.building] || 'building'}`, '', 1600);
  };
  G.exitInterior = () => {
    G.interiors.leave();
    G.inInterior = false; G.interiorStations = [];
    world.group.visible = true;
    G.entities.setHidden(false);
    player.setBounds(null);
    player.setSolids(world.solids);
    const r = G.returnPos || { x: world.village.x, z: world.village.z + 12, heading: Math.PI };
    player.group.position.set(r.x, world.height(r.x, r.z), r.z);
    player.state.heading = r.heading;
    player.snapCamera();
    setMode('world');
    curLoc = '';   // force the HUD to re-show the outdoor location (was stuck on the building name)
    G.audio.sfx('ui');
  };

  G.forgeItem = (out) => {
    const rec = FORGE.find((r) => r.out === out); if (!rec) return;
    if (Object.keys(rec.cost).every((k) => G.inventory.has(k, rec.cost[k]))) {
      for (const k in rec.cost) G.inventory.remove(k, rec.cost[k]);
      G.inventory.add(out, 1); G.gainXp('smithing', rec.xp);
      G.ui.toast(`Forged ${ITEMS[out].name}`, 'good', 2200); G.save.save();
    } else {
      G.ui.toast(`Needs ${Object.keys(rec.cost).map((k) => `${rec.cost[k]} ${ITEMS[k].name}`).join(', ')}`, 'bad', 2400);
    }
  };
  // Gear is gated by skill level, derived from its power so it scales to all gear (starters,
  // power <=6, stay free). Weapons need their combat style's skill; armour/shields need Defence.
  function equipReq(def) {
    if (!def) return 0;
    if (def.type === 'weapon') return Math.max(1, Math.round(((def.bonus || 0) - 6) * 2.3));
    if (def.type === 'armor' || def.type === 'shield') return Math.max(1, Math.round(((def.defense || 0) - 6) * 2.4));
    return 0;
  }
  G.equipReq = (key) => equipReq(ITEMS[key]);
  G.equipReqSkill = (key) => { const d = ITEMS[key]; return d && d.type === 'weapon' ? (d.skill || 'combat') : 'defence'; };
  G.equipChoice = (r) => {
    const eq = player.state.equipment;
    if (r.key) {
      const def = ITEMS[r.key], req = equipReq(def);
      if (req > 1) { const sk = G.equipReqSkill(r.key); if (G.skills.level(sk) < req) { G.ui.toast(`Requires ${sk[0].toUpperCase() + sk.slice(1)} ${req} to wield ${def.name}`, 'bad', 2400); return; } }
    }
    if (r.kind === 'unequipW') eq.weapon = null;
    else if (r.kind === 'unequipA') eq.armor = null;
    else if (r.kind === 'unequipAm') eq.amulet = null;
    else if (r.kind === 'unequipR') eq.ring = null;
    else if (r.kind === 'unequipS') eq.shield = null;
    else if (r.kind === 'weapon') eq.weapon = r.key;
    else if (r.kind === 'armor') eq.armor = r.key;
    else if (r.kind === 'amulet') eq.amulet = r.key;
    else if (r.kind === 'ring') eq.ring = r.key;
    else if (r.kind === 'shield') eq.shield = r.key;
    player.refreshEquipment(); applyMaxHp();
    G.ui.toast(r.key ? `Equipped ${ITEMS[r.key].name}` : 'Unequipped', 'good', 1200); G.ach.evaluate(); G.save.save();
  };
  G.bankDeposit = (key) => { const n = G.inventory.count(key); if (n <= 0) return; G.inventory.remove(key, n); G.bankItems[key] = (G.bankItems[key] || 0) + n; G.save.save(); };
  G.bankWithdraw = (key) => { const n = G.bankItems[key] || 0; if (n <= 0) return; G.bankItems[key] = 0; G.inventory.add(key, n); G.save.save(); };

  // ---------- region Achievement Diaries: tiered task lists evaluated from live state ----------
  const diaryTaskDone = (t) => {
    switch (t.type) {
      case 'visit': return G.stats.regions.has(t.region);
      case 'level': return G.skills.level(t.skill) >= t.level;
      case 'kill': return (G.stats.killsByType[t.enemy] || 0) >= t.count;
      case 'kills': return G.stats.kills >= t.count;
      case 'boss': return G.stats.bosses.has(t.boss);
      case 'quest': return G.quests.status(t.quest) === 'complete';
      case 'crafted': return G.stats.crafted >= t.count;
      case 'have': return (G.collection && G.collection.has(t.item)) || G.inventory.count(t.item) >= (t.count || 1);
      default: return false;
    }
  };
  G.diaryBonus = () => (G.diaries ? G.diaries.size * 3 : 0);
  G.diaryRows = () => {
    const rows = [];
    DIARIES.forEach((dia) => dia.tiers.forEach((tier, ti) => {
      const tasks = tier.tasks.map((t) => ({ desc: t.desc, done: diaryTaskDone(t) }));
      const allDone = tasks.every((t) => t.done), claimed = G.diaries.has(`${dia.region}:${ti}`);
      rows.push({ region: dia.region, regionName: dia.name, tierIdx: ti, tierName: tier.name, tasks, claimed, ready: allDone && !claimed, reward: tier.reward });
    }));
    return rows;
  };
  G.diaryClaim = (region, ti) => {
    const dia = DIARIES.find((d) => d.region === region); if (!dia) return;
    const tier = dia.tiers[ti], key = `${region}:${ti}`;
    if (!tier || G.diaries.has(key)) return;
    if (!tier.tasks.every(diaryTaskDone)) { G.ui.toast('Not all tasks done yet', '', 1600); return; }
    G.diaries.add(key);
    if (tier.reward.gold) G.inventory.add('gold', tier.reward.gold);
    if (tier.reward.item) G.inventory.add(tier.reward.item, 1);
    if (tier.reward.xp) for (const sk in tier.reward.xp) G.gainXp(sk, tier.reward.xp[sk]);
    applyMaxHp();
    G.ui.levelBanner(`✦ ${dia.name} ${tier.name} Diary!`);
    G.ui.toast(`Diary reward: ${tier.reward.gold || 0}g${tier.reward.item ? ' + ' + ITEMS[tier.reward.item].name : ''} · +3 max HP`, 'gold', 3400);
    G.audio.sfx('ach'); if (G.ach) G.ach.evaluate(); G.save.save();
  };

  const craftCfg = {
    title: 'Crafting Bench', hint: '↑ ↓ select · tap craft · ↑↓↑↓ leave', empty: 'Mine gems first (sapphire/emerald/ruby).',
    rows: () => CRAFT.map((rec) => {
      const cost = Object.keys(rec.cost).map((k) => `${rec.cost[k]} ${ITEMS[k].name}`).join(', ');
      const can = Object.keys(rec.cost).every((k) => G.inventory.has(k, rec.cost[k]));
      const it = ITEMS[rec.out];
      return { section: it.set ? `${SETS[it.set].name} set` : 'Trinkets', icon: it.icon, title: it.name, sub: cost, right: can ? 'craft' : '—', data: { out: rec.out } };
    }),
    onSelect: (r) => G.craftItem(r.data.out),
  };
  G.openCraft = () => { setMode('picker'); G.ui.openPicker(craftCfg); };
  G.craftItem = (out) => {
    const rec = CRAFT.find((r) => r.out === out); if (!rec) return;
    if (Object.keys(rec.cost).every((k) => G.inventory.has(k, rec.cost[k]))) {
      for (const k in rec.cost) G.inventory.remove(k, rec.cost[k]);
      G.inventory.add(out, 1); G.gainXp('crafting', rec.xp); G.stats.crafted++;
      G.ui.toast(`Crafted ${ITEMS[out].name}`, 'good', 2200); G.ach.evaluate(); G.save.save();
    } else G.ui.toast(`Needs ${Object.keys(rec.cost).map((k) => `${rec.cost[k]} ${ITEMS[k].name}`).join(', ')}`, 'bad', 2400);
  };
  G.useShortcut = (s) => {
    if (s.cooldown > 0) return;
    if (G.skills.level('agility') < s.level) { G.ui.toast(`Needs Agility level ${s.level}`, 'bad', 1800); return; }
    s.cooldown = 1.5;
    player.group.position.set(s.toX, world.height(s.toX, s.toZ), s.toZ);
    G.gainXp('agility', 16); G.ui.toast(s.name, 'good', 1200);
  };
  G.useFerry = (f) => {   // sail across a sea-lane to the paired dock (a ferry link is travel, not free fast-travel)
    const d = world.snapLand(f.toX, f.toZ);
    cancelChannel(); clearCombat();
    player.group.position.set(d.x, world.height(d.x, d.z), d.z); player.snapCamera();
    G.audio.sfx('ui'); G.ui.toast('You sail across.', 'good', 1600); G.gainXp('agility', 8); G.save.save();
  };

  let hurtFlash = 0;
  // ---------- Death stakes: a gravestone holds your dropped goods; run back to reclaim them ----------
  const GRAVE_TIME = 240;   // seconds of play to return before the grave crumbles
  function makeGraveMesh(x, z) {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.0, 0.16), new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 1 }));
    slab.position.y = 0.55; g.add(slab);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }));
    g.add(mound);
    g.position.set(x, world.height(x, z), z);
    world.group.add(g);
    return g;
  }
  function clearGrave() { if (G.grave && G.grave.mesh) world.group.remove(G.grave.mesh); G.grave = null; }
  function onDeath() {
    G.stats.deaths = (G.stats.deaths || 0) + 1;
    player.state.activePrayer = null; player.state.poison = null;
    if (G.deathMode === 'safe') { G.ui.toast('You fell — and woke safely by the village hearth.', 'bad', 3000); return; }
    player.state.buffs = {};   // standard mode: lose your prayer & potion buffs
    if (G.grave) { clearGrave(); G.ui.toast('Your older grave crumbles to dust.', 'bad', 2200); }
    const dx = player.position.x, dz = player.position.z;
    const drop = {};
    for (const it of G.inventory.list()) drop[it.key] = it.count;   // carried items...
    const g = G.inventory.count('gold'); if (g > 0) drop.gold = g;  // ...plus gold (tracked separately)
    if (!Object.keys(drop).length) { G.ui.toast('You fell — and woke by the village hearth.', 'bad', 3000); return; }
    for (const k in drop) G.inventory.remove(k, drop[k]);
    G.grave = { x: dx, z: dz, items: drop, t: GRAVE_TIME, mesh: makeGraveMesh(dx, dz) };
    G.audio.sfx('hurt');
    G.ui.toast(`⚰️ You fell! Your belongings rest at your grave — return within ${GRAVE_TIME}s to reclaim them.`, 'bad', 4200);
  }
  function updateGrave(dt) {
    if (!G.grave) return;
    G.grave.t -= dt;
    const dx = player.position.x - G.grave.x, dz = player.position.z - G.grave.z;
    if (dx * dx + dz * dz < 12.25) {   // within ~3.5: reclaim everything
      for (const k in G.grave.items) G.inventory.add(k, G.grave.items[k]);
      clearGrave(); G.audio.sfx('ach'); G.ui.toast('⚰️ You reclaim your belongings from the grave.', 'good', 2600); G.save.save();
    } else if (G.grave.t <= 0) {
      clearGrave(); G.ui.toast('⚰️ Your grave has crumbled — its contents are lost to the earth.', 'bad', 3400); G.save.save();
    }
  }
  G.updateGrave = updateGrave;
  G.cycleDeathMode = () => { G.deathMode = G.deathMode === 'safe' ? 'standard' : 'safe'; G.ui.toast(`Death: ${G.deathMode === 'safe' ? 'Safe (no loss)' : 'Standard (gravestone)'}`, 'good', 1800); G.save.save(); };

  // ---------- Dynamic market drift + random world events ----------
  function updateMarket(dt) {
    const M = G.market;
    M._d += dt;
    if (M._d >= 12) { M._d = 0; for (const k in SHOP.sell) { const m = M.mult[k] == null ? 1 : M.mult[k]; const nm = m + (Math.random() - 0.5) * 0.12 + (1 - m) * 0.12; M.mult[k] = Math.max(0.75, Math.min(1.3, +nm.toFixed(3))); } }
    if (M.event) { M.event.t -= dt; if (M.event.t <= 0) { G.ui.toast(`The ${EVENT_NAME[M.event.kind]} has passed.`, '', 2400); M.event = null; M.nextIn = 120 + Math.random() * 120; } }
    else { M.nextIn -= dt; if (M.nextIn <= 0) startEvent(); }
  }
  function startEvent(force) {
    const kinds = ['caravan', 'shortage', 'invasion'];
    const kind = force || kinds[Math.floor(Math.random() * kinds.length)];
    G.market.event = { kind, t: 90 };
    if (kind === 'caravan') G.ui.levelBanner('🐫 Merchant Caravan — buy prices slashed!');
    else if (kind === 'shortage') G.ui.levelBanner('📈 Goods Shortage — sell prices soar!');
    else { G.ui.levelBanner('⚔️ Town Invasion — defend the village!'); spawnInvasion(); }
    G.audio.sfx('ach');
  }
  function spawnInvasion() {
    const v = world.village, foes = ['bandit', 'wolf', 'goblin', 'skeleton'];
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2, x = v.x + Math.cos(a) * 13, z = v.z + Math.sin(a) * 13; if (G.entities.spawnEnemy) G.entities.spawnEnemy(foes[i % foes.length], x, z); }
  }
  G.startEvent = startEvent;   // test hook

  G.damagePlayer = (amount, src) => {
    if (player.state.hp <= 0) return;
    const stanceDef = (ATTACK_STYLES[player.state.combatStance] || {}).defBonus || 0;
    const defv = gearBonus().def + stanceDef;
    let taken = amount - defv * 0.6;            // flat armour soak first
    let mit = 1;                                 // then fold every multiplier into one, and CAP it
    const apT = PRAYERS.find((pp) => pp.key === player.state.activePrayer);
    if (apT && apT.dmgTaken) mit *= apT.dmgTaken;
    const eStyle = ATK_STYLE[src && src.enemyKey] || 'melee';   // protection prayer cuts the matching style (slams = melee)
    if (apT && apT.protect === eStyle) mit *= apT.protectMult;
    const bf = player.state.buffs;
    if (bf && bf.defence) mit *= bf.defence.mult;   // defence potion soaks damage
    if (player.state.combatStance === 'aggressive') mit *= 1.12;   // aggressive: you guard less
    mit = Math.max(0.25, mit);                   // never below 25% of post-armour damage (no invincibility stack)
    taken = Math.max(1, Math.round(taken * mit));
    player.state.hp -= taken;
    hurtFlash = 0.25;
    G.ui.hitsplat(player.position.x, player.position.y + 1.9, player.position.z, taken, 'player');
    G.audio.sfx('hurt');
    if (src && src.def && src.def.poison && !(bf && bf.antipoison) && !player.state.poison) { player.state.poison = { dmg: src.def.poison, t: 12, tick: 2 }; G.ui.toast('You are poisoned!', 'bad', 1600); }
    G.gainXp('defence', Math.max(1, Math.round(taken * 0.6)));
    G.ui.setHealth(player.state.hp, player.state.maxHp);
    if (player.state.hp <= 0) {
      cancelChannel(); clearCombat();
      onDeath();   // drop goods to a gravestone at the death spot (unless Safe mode)
      player.state.hp = player.state.maxHp;
      const sx = world.village.x, sz = world.village.z + 12;
      player.group.position.set(sx, world.height(sx, sz), sz);
      player.state.heading = Math.PI;
      G.ui.setHealth(player.state.hp, player.state.maxHp);
      G.save.save();
    }
  };

  G.onEnemyKilled = (e) => {
    const def = e.def;
    const names = [];
    for (const k in def.loot) { G.inventory.add(k, def.loot[k]); names.push(ITEMS[k].name); }
    if (def.rare && Math.random() < def.rare.chance * (G.slayerPerks.has('luck') ? 1.5 : 1)) { G.inventory.add(def.rare.item, 1); G.ui.toast(`✨ Rare drop: ${ITEMS[def.rare.item].name}!`, 'gold', 3400); }
    const ksk = e._lastSkill || 'combat';   // attack stance can route part of the kill XP into Defence
    const kstance = ATTACK_STYLES[e._xpStance || 'accurate'] || {};
    if (kstance.defShare) { G.gainXp('defence', Math.round(def.xp * kstance.defShare)); G.gainXp(ksk, Math.round(def.xp * (1 - kstance.defShare))); }
    else G.gainXp(ksk, def.xp);
    G.stats.kills++; G.stats.killsByType[e.enemyKey] = (G.stats.killsByType[e.enemyKey] || 0) + 1;
    if (def.boss) { G.stats.bosses.add(e.enemyKey); world.showTrophy(e.enemyKey); }
    if (G.slayer.active && G.slayer.enemy === e.enemyKey && G.slayer.progress < G.slayer.count) { G.slayer.progress++; if (G.slayer.progress >= G.slayer.count) G.ui.toast('Slayer task complete — see the Slayer Master', 'good', 2600); }
    G.audio.sfx('kill');
    G.ui.toast(`Defeated ${def.name} · +${names.join(', ')}`, 'gold', 2200);
    G.quests.notifyKill(e.enemyKey);
    if (!G.activeClue && Math.random() < 0.04) { G.inventory.add('clue_scroll', 1); G.ui.toast('📜 A clue scroll dropped!', 'gold', 2800); }
    G.ach.evaluate(); checkQuestReady(); G.save.save();
  };
  G.onQuestAccepted = (id, def) => { G.ui.toast(`Quest accepted: ${def.name}`, 'good', 2600); G.save.save(); };
  G.onQuestComplete = (id, def) => { G.ui.toast(`Quest complete: ${def.name}!`, 'good', 3400); readyToasted.delete(id); G.save.save(); };

  // ---------- mode state machine ----------
  let mode = 'world';
  let backSeq = [];                                    // ↑↓↑↓ open/close gesture buffer
  function setMode(m) { mode = m; backSeq = []; if (m !== 'world') G.ui.hidePrompt(); }   // reset gesture history across overlays
  function openMenu() { cancelChannel(); clearCombat(); setMode('menu'); G.ui.openMenu(); G.audio.sfx('ui'); }
  function closeMenu() { G.ui.closeMenu(); setMode(G.inInterior ? 'interior' : 'world'); }

  // Universal open/close — a deliberate fast ↑↓↑↓ swipe "shake" (double-tap doesn't
  // register on-device). The tight 1.1s window keeps it distinct from paced list
  // navigation (which has read-pauses between swipes), so it won't steal menu nav.
  function backGesture(a) {
    const now = performance.now();
    backSeq = backSeq.filter((e) => now - e.t < 1100);
    backSeq.push({ a, t: now });
    if (backSeq.length > 4) backSeq = backSeq.slice(-4);
    return backSeq.length === 4 && backSeq.map((e) => e.a).join() === 'up,down,up,down';
  }
  function exitOverlay() { backSeq = []; if (mode === 'menu') closeMenu(); else if (mode === 'dialogue') G.dialogue.close(); else if (mode === 'picker') G.closePicker(); }

  input.on((a) => {
    G.audio.resume();
    if (G.ui.syncOpen()) { G.ui.hideSync(); return; }   // the cloud-sync link panel: any input dismisses it
    // direct menu toggle (touch ☰ button / future bindings) — no wiggle needed
    if (a === 'menu') { if (mode === 'world' || mode === 'interior') openMenu(); else exitOverlay(); return; }
    // ↑↓↑↓ wiggle: opens the menu in the world (so a stray swipe-down never opens it) and closes any overlay
    if ((a === 'up' || a === 'down') && backGesture(a)) {
      backSeq = [];
      if (mode === 'world' || mode === 'interior') openMenu();
      else exitOverlay();
      return;
    }
    if (mode === 'world' || mode === 'interior') {
      if (G.channel && a !== 'tap') cancelChannel();   // any move stops gathering
      if (a === 'up') player.impulseForward();
      else if (a === 'left') player.impulseTurn(-1);
      else if (a === 'right') player.impulseTurn(1);
      else if (a === 'down') player.impulseBack();
      else if (a === 'tap') doInteract();
      else if (a === 'doubletap') quickAttack();
    } else if (mode === 'menu') {
      if (a === 'left') G.ui.menuTab(-1);
      else if (a === 'right') G.ui.menuTab(1);
      else if (a === 'up') G.ui.menuMove(-1);
      else if (a === 'down') G.ui.menuMove(1);
      else if (a === 'tap') G.ui.menuSelect();
      else if (a === 'doubletap') closeMenu();
    } else if (mode === 'dialogue') {
      if (a === 'left' || a === 'up') G.dialogue.move(-1);
      else if (a === 'right' || a === 'down') G.dialogue.move(1);
      else if (a === 'tap') G.dialogue.select();
      else if (a === 'doubletap') G.dialogue.close();
    } else if (mode === 'picker') {
      if (a === 'up') G.ui.pickerMove(-1);
      else if (a === 'down') G.ui.pickerMove(1);
      else if (a === 'tap') G.ui.pickerSelect();
      else if (a === 'doubletap') G.closePicker();
    }
  });

  function doInteract() {
    if (G.channel) { cancelChannel(); return; }   // tapping again stops gathering
    const t = G.currentTarget;
    if (!t) return;
    if (t.kind !== 'enemy') clearCombat();   // tapping anything else breaks off the fight
    const lvl = (k) => G.skills.level(k);
    // best gathering tool you own for a skill auto-speeds the channel (Toolsmithing payoff)
    const toolSpeed = (skill) => { let f = 1; for (const it of G.inventory.list()) { const d = it.def; if (d && d.type === 'tool' && d.tool === skill && d.speed < f) f = d.speed; } return f; };
    if (t.kind === 'tree') startChannel(Math.max(1.8, (4 - lvl('woodcutting') * 0.03) * toolSpeed('woodcutting')), 'chop', 'Chopping…', () => G.chopTree(t.ref));
    else if (t.kind === 'bush') startChannel(Math.max(1.6, 2.5 - lvl('foraging') * 0.02), 'forage', 'Foraging…', () => G.forageBush(t.ref));
    else if (t.kind === 'ore') { const req = ORE_LEVEL[t.ref.type] || 1; if (lvl('mining') < req) G.ui.toast(`Needs Mining level ${req} to mine that`, 'bad', 2000); else startChannel(Math.max(3, (7 - lvl('mining') * 0.04) * toolSpeed('mining')), 'mine', 'Mining…', () => G.mineOre(t.ref)); }
    else if (t.kind === 'fish') startChannel(Math.max(3, (7 - lvl('fishing') * 0.04) * toolSpeed('fishing')), 'fish', 'Fishing…', () => G.fishSpot(t.ref));
    else if (t.kind === 'station') G.useStation(t.ref);
    else if (t.kind === 'plot') G.plotAction(t.ref);
    else if (t.kind === 'stall') G.thieveStall(t.ref);
    else if (t.kind === 'shortcut') G.useShortcut(t.ref);
    else if (t.kind === 'ferry') G.useFerry(t.ref);
    else if (t.kind === 'npc') G.talkTo(t.ref);
    else if (t.kind === 'discovery') G.findDiscovery(t.ref);
    else if (t.kind === 'dig') G.digClue();
    else if (t.kind === 'enemy') { G.combatTarget = t.ref; G.attackEnemy(t.ref); }   // lock on + auto-attack
  }

  // ---------- channelled gathering (timed action: progress bar + looping tool animation) ----------
  let channelAnimT = 0;
  function startChannel(dur, anim, label, onDone) {
    G.channel = { t: 0, dur, anim, label, onDone };
    channelAnimT = 0;
    player.playGather(anim);
    G.audio.sfx(anim === 'fish' ? 'cast' : 'hit');
    G.ui.setChannel(0, label);
  }
  function cancelChannel() { if (G.channel) { G.channel = null; G.ui.hideChannel(); } }
  function updateStatus(dt) {   // tick combat-potion buffs + poison damage-over-time on the player
    const st = player.state, b = st.buffs;
    if (b) for (const k in b) { b[k].t -= dt; if (b[k].t <= 0) delete b[k]; }
    if ((st.spec || 0) < 100) { st.spec = Math.min(100, (st.spec || 0) + 2 * dt); G.ui.setSpec(st.spec); }   // spec energy slowly recharges
    if (st.poison) {
      if (b && b.antipoison) { st.poison = null; return; }
      st.poison.t -= dt; st.poison.tick -= dt;
      if (st.poison.tick <= 0) {
        st.poison.tick = 2; st.hp = Math.max(1, st.hp - st.poison.dmg);
        G.ui.hitsplat(player.position.x, player.position.y + 1.9, player.position.z, st.poison.dmg, 'player');
        G.ui.setHealth(st.hp, st.maxHp);
        if (G.fx) G.fx.burst(player.position.x, player.position.y + 1.3, player.position.z, 0x6ad06a, { n: 5, up: 1.6 });
      }
      if (st.poison.t <= 0) st.poison = null;
    }
  }
  function updateChannel(dt) {
    const c = G.channel; if (!c) return;
    if (player.state.moving) { cancelChannel(); return; }   // any motion (incl. a held touch d-pad) stops gathering
    c.t += dt; channelAnimT += dt;
    if (channelAnimT >= 0.55) { channelAnimT = 0; player.playGather(c.anim); G.audio.sfx(c.anim === 'fish' ? 'cast' : 'hit'); }   // keep the tool swinging
    G.ui.setChannel(Math.min(1, c.t / c.dur), c.label);
    if (c.t >= c.dur) { const done = c.onDone; G.channel = null; G.ui.hideChannel(); done(); }
  }

  // ---------- auto-attack: lock a foe and keep hitting it at the weapon's cadence ----------
  function clearCombat() { G.combatTarget = null; }
  function updateCombat() {
    const e = G.combatTarget;
    if (!e) return;
    if (!e.alive) { G.combatTarget = null; return; }                 // foe down → stop
    const d = dist2D(player.position.x, player.position.z, e.pos.x, e.pos.z);
    if (d > player.weapon().range + 8) { G.combatTarget = null; return; }   // walked off → disengage
    G.attackEnemy(e);   // only actually strikes when off cooldown + in range
  }

  // ---------- HUD helpers ----------
  let curLoc = '';
  function updateLocation() {
    let name = 'Verdant Isle', best = 16 * WORLD_SCALE;
    for (const l of world.locations) {
      const d = dist2D(player.position.x, player.position.z, l.x, l.z);
      if (d < best) { best = d; name = l.name; }
    }
    if (name !== curLoc) { curLoc = name; G.ui.setLocation(name); }
    let rk = null, rb = Infinity;
    for (const rg of world.regions) { const d = Math.hypot(player.position.x - rg.x, player.position.z - rg.z); if (d < rg.r && d < rb) { rb = d; rk = rg.key; } }
    if (rk && !G.stats.regions.has(rk)) { G.stats.regions.add(rk); if (G.ach) G.ach.evaluate(); }
    if (G.quests.notifyVisit(player.position.x, player.position.z)) { checkQuestReady(); G.save.save(); }
  }

  function updatePrompt() {
    if (mode !== 'world' && mode !== 'interior') return;
    if (G.channel) { G.ui.hidePrompt(); return; }   // channel bar shows instead
    const t = G.currentTarget;
    if (t) G.ui.showPrompt(t.label); else G.ui.hidePrompt();
  }

  // ---------- quest guidance ----------
  function npcByKey(key) { return G.entities.npcs.find((n) => n.def.key === key); }
  function nearestEnemyOf(type) { let best = null, bd = Infinity; for (const e of G.entities.enemies) { if (!e.alive || e.enemyKey !== type) continue; const d = dist2D(player.position.x, player.position.z, e.pos.x, e.pos.z); if (d < bd) { bd = d; best = e; } } return best; }
  function nearestNode(arr, alive) { let best = null, bd = Infinity; for (const o of arr) { if (alive && !o.alive) continue; const d = dist2D(player.position.x, player.position.z, o.x, o.z); if (d < bd) { bd = d; best = o; } } return best; }
  function itemSource(item) {
    if (item === 'wood') return nearestNode(world.trees, true);
    if (item === 'berry' || item === 'herb') return nearestNode(world.bushes, true);
    if (item === 'copper_ore' || item === 'iron_ore' || item === 'coal') { const tp = { copper_ore: 'copper', iron_ore: 'iron', coal: 'coal' }[item]; return nearestNode(world.oreNodes.filter((o) => o.type === tp), true); }
    if (item === 'raw_trout' || item === 'raw_shrimp') return nearestNode(world.fishingSpots, false);
    if (item === 'crop') return world.plots[0];
    if (item === 'bronze_bar' || item === 'iron_bar' || item === 'mithril_bar') return world.stations.find((s) => s.kind === 'furnace');
    if (item === 'relic') { const e = nearestEnemyOf('ember_boss'); return e ? { x: e.pos.x, z: e.pos.z, y: e.pos.y } : null; }
    return null;
  }
  function targetForQuest(id) {
    const def = QUESTS[id];
    if (G.quests.isReady(id)) { const n = npcByKey(def.giver); return n ? { x: n.pos.x, z: n.pos.z, y: n.pos.y + 2.9, label: 'Return to ' + n.def.name } : null; }
    const objs = G.quests.objectives(id);
    for (let i = 0; i < def.objectives.length; i++) {
      if (objs[i].done) continue;
      const o = def.objectives[i];
      if (o.type === 'kill') { const e = nearestEnemyOf(o.enemy); if (e) return { x: e.pos.x, z: e.pos.z, y: e.pos.y + 2.6, label: 'Defeat ' + ENEMIES[o.enemy].name }; }
      else if (o.type === 'have') { const s = itemSource(o.item); if (s) return { x: s.x, z: s.z, y: (s.y || 0) + 2.2, label: 'Gather ' + ITEMS[o.item].name }; }
      else if (o.type === 'visit') return { x: o.x, z: o.z, y: 2.6, label: o.name };
      else if (o.type === 'talk') { const n = npcByKey(o.npc); if (n) return { x: n.pos.x, z: n.pos.z, y: n.pos.y + 2.9, label: 'Speak with ' + o.name }; }
    }
    return null;
  }
  function questTarget() {
    // a quest pinned in the Quests menu takes priority
    if (G.trackedQuest && G.quests.status(G.trackedQuest) === 'active') { const t = targetForQuest(G.trackedQuest); if (t) return t; }
    for (const id of G.quests.activeList()) { const t = targetForQuest(id); if (t) return t; }
    let best = null, bd = Infinity;
    for (const q of G.quests.all()) { if (q.status !== 'available') continue; const n = npcByKey(q.def.giver); if (!n) continue; const d = dist2D(player.position.x, player.position.z, n.pos.x, n.pos.z); if (d < bd) { bd = d; best = { x: n.pos.x, z: n.pos.z, y: n.pos.y + 2.9, label: 'New quest: ' + n.def.name }; } }
    return best;
  }

  const STATION_PIP = { cook: '🍳', bank: '🏦', anvil: '⚒️', furnace: '🔥', craft: '💍', cauldron: '⚗️', bed: '🛏️', shop: '🛒', exit: '🚪', ledger: '🏛️', jobboard: '📋' };
  function updateMarkers() {
    if (mode === 'interior') {
      const il = [];
      for (const s of (G.interiorStations || [])) il.push({ id: 'is_' + s.kind + Math.round(s.x) + Math.round(s.z), x: s.x, y: s.y + 2.2, z: s.z, kind: s.kind === 'exit' ? 'quest' : 'item', pip: STATION_PIP[s.kind] || '◆', label: s.label });
      G.ui.setQuestArrow(null);
      G.questGuide = null;
      G.ui.updateMarkers(il);
      return;
    }
    const list = [];
    const p = player.position;
    const guide = mode === 'world' ? questTarget() : null;
    G.questGuide = guide;   // shared with the minimap
    if (guide) {
      list.push({ id: 'questguide', x: guide.x, y: guide.y, z: guide.z, kind: 'questguide', pip: '◈', label: guide.label });
      let rel = Math.atan2(guide.x - p.x, guide.z - p.z) - player.state.heading;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      G.ui.setQuestArrow(rel, guide.label, Math.round(dist2D(p.x, p.z, guide.x, guide.z)));
    } else G.ui.setQuestArrow(null);
    for (const n of G.entities.npcs) {
      const d = dist2D(p.x, p.z, n.pos.x, n.pos.z);
      if (d < 36) list.push({ id: 'npc_' + n.def.key, x: n.pos.x, y: n.pos.y + 2.6, z: n.pos.z, kind: 'npc', pip: '◆', label: n.def.name, far: d > 20 });
    }
    G.entities.enemies.forEach((e, i) => {
      if (!e.alive) return;
      const d = dist2D(p.x, p.z, e.pos.x, e.pos.z);
      if (d < 28 && (e.state === 'chase' || e.hp < e.maxHp)) list.push({ id: 'enemy_' + i, x: e.pos.x, y: e.pos.y + 2.2, z: e.pos.z, kind: 'enemy', pip: '♥ ' + Math.max(0, Math.ceil(e.hp)) });
    });
    const t = G.currentTarget;
    if (t && mode === 'world') {
      const gy = (t.kind === 'npc' || t.kind === 'enemy') ? t.ref.pos.y : t.ref.y;
      const yOff = t.kind === 'npc' ? 3.1 : t.kind === 'enemy' ? 2.7 : 1.9;
      list.push({ id: 'target', x: t.x, y: gy + yOff, z: t.z, kind: t.kind === 'enemy' ? 'enemy' : t.kind === 'npc' ? 'quest' : 'item', pip: '▾' });
    }
    G.ui.updateMarkers(list);
  }

  // ---------- loop ----------
  let running = true, tod = 0.32, mmTick = 0, econTick = 0;
  function frame() {
    if (!running) return;
    const dt = Math.min(engine.clock.getDelta(), 0.05);
    if (++econTick % 90 === 0) { G.economy.tick(); G.farm.tick(); }   // accrue passive business + farm income (~1.5s)
    // day/night cycle (~180s) — kept bright enough to stay readable on the display
    tod = (tod + dt / 180) % 1;
    const day = (Math.sin(tod * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    engine.hemi.intensity = 0.48 + 0.26 * day;
    engine.sun.intensity = 0.42 + 0.55 * day;
    engine.fill.intensity = 0.18 + 0.10 * day;
    const ang = tod * Math.PI * 2;
    engine.sun.position.set(Math.cos(ang) * 60, 25 + 75 * day, Math.sin(ang) * 40);
    engine.sun.color.setHSL(0.09, 0.55, 0.38 + 0.18 * day);
    if (mode === 'world') {
      player.update(dt, input);
      G.entities.update(dt, player);
      world.tick(dt);
      G.projectiles.update(dt);
      G.fx.update(dt);
      updateChannel(dt);
      updateCombat();
      updateStatus(dt);
      updateGrave(dt);
      updateMarket(dt);
      if (player.state.activePrayer) {
        const ap = PRAYERS.find((pp) => pp.key === player.state.activePrayer);
        if (ap) {
          player.state.prayer -= ap.drain * dt;
          if (ap.regen && player.state.hp < player.state.maxHp) { player.state.hp = Math.min(player.state.maxHp, player.state.hp + ap.regen * dt); G.ui.setHealth(player.state.hp, player.state.maxHp); }
          if (player.state.prayer <= 0) { player.state.prayer = 0; player.state.activePrayer = null; G.ui.toast('Prayer depleted', 'bad', 1500); }
        }
        G.ui.setPrayer(player.state.prayer, player.state.maxPrayer);
      }
      G.currentTarget = G.interact.best();
      updatePrompt();
      updateLocation();
    } else if (mode === 'interior') {
      player.update(dt, input);
      G.fx.update(dt);
      updateChannel(dt);
      updateCombat();
      updateStatus(dt);
      G.currentTarget = G.interact.best();
      updatePrompt();
    }
    if (hurtFlash > 0) { hurtFlash -= dt; document.body.style.boxShadow = `inset 0 0 ${Math.round(120 * (hurtFlash / 0.25))}px rgba(255,40,40,0.6)`; }
    else { const r = player.state.hp / player.state.maxHp; if (r > 0 && r < 0.3) document.body.style.boxShadow = `inset 0 0 80px rgba(255,40,40,${((0.3 - r) * 0.9 + 0.1).toFixed(2)})`; else if (document.body.style.boxShadow) document.body.style.boxShadow = ''; }
    player.updateCamera(engine.camera, dt);
    G.ui.setCompass(player.state.heading);
    if (mode === 'world' || mode === 'interior') updateMarkers();   // markers are hidden behind overlays
    if (mode === 'interior') G.ui.setMinimapVisible(false);
    else { G.ui.setMinimapVisible(true); if (mode === 'world') { mmTick++; if (mmTick % 3 === 0) G.ui.updateMinimap(); } }
    engine.renderer.render(engine.scene, engine.camera);
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; input.clearHeld(); if (!wiping) G.save.save(); }
    else if (!running) { running = true; engine.clock.getDelta(); requestAnimationFrame(frame); }
  });
  setInterval(() => { if (!wiping) G.save.save(); }, 15000);

  // initial HUD + reveal
  applyMaxHp();
  player.state.maxPrayer = maxPrayer();
  if (player.state.prayer == null || player.state.prayer > player.state.maxPrayer) player.state.prayer = player.state.maxPrayer;
  G.ui.setHealth(player.state.hp, player.state.maxHp);
  G.ui.setPrayer(player.state.prayer, player.state.maxPrayer);
  G.ach.evaluate();
  G.stats.bosses.forEach((b) => world.showTrophy(b));
  updateLocation();
  boot.classList.add('out');
  setTimeout(() => boot.classList.add('hidden'), 700);
  requestAnimationFrame(frame);

  if (!saved) {
    setTimeout(() => G.openClassPicker(), 900);
    setTimeout(() => G.ui.toast('↑ walk · ↓ back · ←/→ turn · tap to act · ↑↓↑↓ for menu', '', 7000), 3400);
  }

  // ---------- test hooks ----------
  window.__gr = {
    G, engine, world, player,
    get mode() { return mode; },
    get pos() { const p = player.position; return { x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2) }; },
    get heading() { return player.state.heading; },
    forward(n = 1) { for (let i = 0; i < n; i++) player.impulseForward(); },
    turn(dir, n = 1) { for (let i = 0; i < n; i++) player.impulseTurn(dir); },
    act(a) { input.emit(a); },
    setMode, openMenu, closeMenu,
    teleport(x, z) { player.group.position.set(x, world.height(x, z), z); },
    give(key, n = 1) { G.inventory.add(key, n); },
    target() { return G.currentTarget ? { kind: G.currentTarget.kind, label: G.currentTarget.label, dist: +G.currentTarget.dist.toFixed(2) } : null; },
    pause() { running = false; },
    resume() { if (!running) { running = true; engine.clock.getDelta(); requestAnimationFrame(frame); } },
    step(n = 1) { for (let i = 0; i < n; i++) { if (mode === 'world') { player.update(0.016, input); G.entities.update(0.016, player); world.tick(0.016); G.projectiles.update(0.016); G.fx.update(0.016); updateChannel(0.016); updateCombat(); updateStatus(0.016); updateGrave(0.016); updateMarket(0.016); G.currentTarget = G.interact.best(); } else if (mode === 'interior') { player.update(0.016, input); G.fx.update(0.016); updateChannel(0.016); updateCombat(); updateStatus(0.016); G.currentTarget = G.interact.best(); } player.updateCamera(engine.camera, 0.016); G.ui.setCompass(player.state.heading); updateMarkers(); engine.renderer.render(engine.scene, engine.camera); } },
  };
} catch (err) {
  bootSub.textContent = 'Error: ' + (err && err.message ? err.message : err);
  console.error(err);
  throw err;
}
