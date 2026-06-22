import * as THREE from 'three';
import { createEngine } from './engine.js';
import { createInput } from './input.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createEntities } from './entities.js';
import { createInteraction } from './interact.js';
import { createUI } from './ui.js';
import { createSkills } from './skills.js';
import { createInventory } from './inventory.js';
import { createQuests } from './quests.js';
import { createDialogue } from './dialogue.js';
import { loadSave, createSave } from './save.js';
import { ITEMS, QUESTS, SMELT, COOK, FORGE, SHOP, BREW, PRAYERS, CRAFT, SETS, ACHIEVEMENTS, ENEMIES } from './content.js';
import { createProjectiles } from './projectiles.js';
import { createAudio } from './audio.js';
import { dist2D } from './util.js';

const boot = document.getElementById('boot');
const bootSub = document.getElementById('bootSub');
const G = {};

try {
  const canvas = document.getElementById('game');
  const engine = createEngine(canvas);
  const saved = loadSave();

  const world = createWorld(engine.scene);
  const player = createPlayer(engine.scene, world);
  const input = createInput();

  G.engine = engine; G.world = world; G.player = player; G.input = input;
  G.skills = createSkills(saved && saved.skills, saved && saved.prestige);
  G.inventory = createInventory(saved && saved.inventory);
  G.ui = createUI(G);
  G.quests = createQuests(G, saved && saved.quests);
  G.entities = createEntities(engine.scene, world, G);
  G.interact = createInteraction(G);
  G.dialogue = createDialogue(G);
  G.projectiles = createProjectiles(engine.scene);
  G.bankItems = (saved && saved.bank) || {};
  G.audio = createAudio(saved && saved.audioMuted);
  G.save = createSave(G);

  // restore saved world edits + player
  if (saved) {
    (saved.world && saved.world.choppedTrees || []).forEach((i) => world.removeTree(i));
    (saved.world && saved.world.harvestedBushes || []).forEach((i) => world.harvestBush(i));
    if (saved.player) {
      player.group.position.x = saved.player.x;
      player.group.position.z = saved.player.z;
      player.state.heading = saved.player.heading;
      player.state.hp = Math.max(1, saved.player.hp || player.state.maxHp);
      if (saved.player.equipment) { const e = saved.player.equipment; player.state.equipment = { weapon: e.weapon || null, armor: e.armor || null, amulet: e.amulet || null, ring: e.ring || null }; }
      player.refreshEquipment();
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
    for (const slot of ['armor', 'amulet', 'ring']) { const it = eq[slot] ? ITEMS[eq[slot]] : null; if (!it) continue; if (it.defense) b.def += it.defense; if (it.bonus) for (const k in it.bonus) b[k] += it.bonus[k]; }
    const s = fullSet(); if (s && SETS[s]) for (const k in SETS[s]) if (k !== 'name') b[k] += SETS[s][k];
    return b;
  }
  G.gearBonus = gearBonus;
  function applyMaxHp() { const mh = 100 + gearBonus().maxhp; player.state.maxHp = mh; if (player.state.hp > mh) player.state.hp = mh; G.ui.setHealth(player.state.hp, mh); }

  G.stats = { kills: 0, crafted: 0, regions: new Set(), bosses: new Set(), killsByType: {} };
  if (saved && saved.stats) { G.stats.kills = saved.stats.kills || 0; G.stats.crafted = saved.stats.crafted || 0; (saved.stats.regions || []).forEach((r) => G.stats.regions.add(r)); (saved.stats.bosses || []).forEach((b) => G.stats.bosses.add(b)); Object.assign(G.stats.killsByType, saved.stats.killsByType || {}); }
  G.slayer = (saved && saved.slayer) ? { ...saved.slayer } : { active: false, enemy: null, count: 0, progress: 0 };
  const SLAYER_POOL = ['boar', 'wolf', 'bandit', 'scorpion', 'frost_wolf'];
  G.slayerAssign = () => { const enemy = SLAYER_POOL[Math.floor(Math.random() * SLAYER_POOL.length)]; const count = 6 + Math.floor(Math.random() * 7); G.slayer = { active: true, enemy, count, progress: 0 }; G.ui.toast(`Slayer task: ${count} ${ENEMIES[enemy].name}s`, 'good', 2600); G.save.save(); };
  G.slayerClaim = () => { const s = G.slayer; if (!s.active || s.progress < s.count) return; const reward = s.count * 8; G.inventory.add('gold', reward); G.gainXp('slayer', s.count * 15); s.active = false; G.ui.toast(`Slayer contract complete! +${reward}g`, 'good', 2800); G.ach.evaluate(); G.save.save(); };
  G.prestigeSkill = (key) => { if (!G.skills.canPrestige(key)) { G.ui.toast('Reach level 20 to prestige', 'bad', 1800); return; } if (G.skills.doPrestige(key)) { G.ui.toast(`⭐ Prestiged ${skillName(key)}!`, 'good', 3000); G.ui.levelBanner(`Prestige — ${skillName(key)}`); G.audio.sfx('ach'); G.ach.evaluate(); G.save.save(); } };
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
    G.ui.xpDrop(`+${amt} ${skillName(key)}`);
    if (r.leveled) { G.ui.levelBanner(`${skillName(key)} Level ${r.level}!`); if (G.audio) G.audio.sfx('level'); if (G.ach) G.ach.evaluate(); }
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
    G.inventory.add('wood', 1);
    G.ui.toast('Chopped Driftwood', 'gold', 1400); G.audio.sfx('pickup');
    G.gainXp('woodcutting', 14);
    checkQuestReady(); G.save.save();
  };
  G.forageBush = (b) => {
    world.harvestBush(b.idx);
    const herb = Math.random() < 0.3;
    G.inventory.add(herb ? 'herb' : 'berry', 1);
    G.ui.toast(herb ? 'Foraged Glimmerleaf' : 'Foraged Sunberries', 'gold', 1400);
    G.gainXp('foraging', 10);
    checkQuestReady(); G.save.save();
  };
  G.plotAction = (p) => {
    if (p.state === 'grown') {
      const n = 1 + Math.floor(Math.random() * 2);
      G.inventory.add('crop', n); world.harvestPlot(p); G.gainXp('farming', 24);
      G.ui.toast(`Harvested ${n} Isle Greens`, 'gold', 1500); checkQuestReady(); G.save.save();
    } else if (p.state === 'growing') {
      G.ui.toast('Still growing…', '', 1200);
    } else if (G.inventory.has('seeds', 1)) {
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
  G.talkTo = (n) => {
    setMode('dialogue'); G.ui.hidePrompt();
    G.dialogue.open(n.def.dialogue, () => { if (G.pendingShop) { G.pendingShop = false; G.openShop(); } else setMode('world'); });
  };

  const ORE_ITEM = { copper: 'copper_ore', iron: 'iron_ore', coal: 'coal' };
  G.mineOre = (o) => {
    world.depleteOre(o);
    const item = ORE_ITEM[o.type];
    G.inventory.add(item, 1);
    G.ui.toast('Mined ' + ITEMS[item].name, 'gold', 1400); G.audio.sfx('pickup');
    G.gainXp('mining', 18);
    const gr = Math.random(); const gem = gr < 0.04 ? 'ruby' : gr < 0.10 ? 'emerald' : gr < 0.20 ? 'sapphire' : null;
    if (gem) { G.inventory.add(gem, 1); G.ui.toast('Found a ' + ITEMS[gem].name + '!', 'gold', 1900); }
    checkQuestReady(); G.save.save();
  };
  G.fishSpot = () => {
    const item = Math.random() < 0.55 ? 'raw_shrimp' : 'raw_trout';
    G.inventory.add(item, 1);
    G.ui.toast('Caught ' + ITEMS[item].name, 'gold', 1400);
    G.gainXp('fishing', 16);
    checkQuestReady(); G.save.save();
  };
  G.useStation = (s) => {
    if (s.kind === 'cook') {
      let n = 0;
      for (const raw in COOK) {
        const c = G.inventory.count(raw);
        if (c > 0) { G.inventory.remove(raw, c); G.inventory.add(COOK[raw], c); n += c; G.gainXp('cooking', 12 * c); }
      }
      G.ui.toast(n ? `Cooked ${n} item${n > 1 ? 's' : ''}` : 'Nothing raw to cook', n ? 'good' : '', 1800);
    } else if (s.kind === 'furnace') {
      let bars = 0, progress = true;
      while (progress) {
        progress = false;
        for (const r of SMELT) {
          if (Object.keys(r.in).every((k) => G.inventory.has(k, r.in[k]))) {
            for (const k in r.in) G.inventory.remove(k, r.in[k]);
            G.inventory.add(r.out, 1); G.gainXp('smithing', r.xp); bars++; progress = true;
          }
        }
      }
      G.ui.toast(bars ? `Smelted ${bars} bar${bars > 1 ? 's' : ''}` : 'Need ore to smelt (mine, then smelt)', bars ? 'good' : '', 2000);
    } else if (s.kind === 'anvil') {
      G.openForge(); return;
    } else if (s.kind === 'bank') {
      G.openBank(); return;
    } else if (s.kind === 'craft') {
      G.openCraft(); return;
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
      let n = 0;
      for (const r of BREW) {
        while (Object.keys(r.in).every((k) => G.inventory.has(k, r.in[k]))) { for (const k in r.in) G.inventory.remove(k, r.in[k]); G.inventory.add(r.out, 1); G.gainXp('herblore', r.xp); n++; }
      }
      G.ui.toast(n ? `Brewed ${n} Strong Salve${n > 1 ? 's' : ''}` : 'Need Glimmerleaf to brew', n ? 'good' : '', 2000);
      G.save.save(); return;
    } else if (s.kind === 'chest') {
      if (s.looted) { G.ui.toast('The chest is empty.', '', 1500); return; }
      s.looted = true;
      G.inventory.add('gold', 120); G.inventory.add('iron_bar', 3); G.inventory.add('coal', 4);
      G.ui.toast('You loot the cave chest! +120g, iron, coal', 'gold', 3200); G.save.save(); return;
    } else if (s.kind === 'chest2') {
      if (s.looted) { G.ui.toast('The chest is empty.', '', 1500); return; }
      s.looted = true;
      G.inventory.add('gold', 160); G.inventory.add('sapphire', 2); G.inventory.add('emerald', 1);
      G.ui.toast('You loot the frozen chest! +160g, gems', 'gold', 3200); G.save.save(); return;
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
    const apD = PRAYERS.find((pp) => pp.key === player.state.activePrayer);
    if (apD && apD.dmgDealt) dmg = Math.round(dmg * apD.dmgDealt);
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
  };
  function quickAttack() {
    const t = G.currentTarget;
    if (t && t.kind === 'enemy') { G.attackEnemy(t.ref); return; }
    const range = player.weapon().range + 0.6;
    let near = null, nd = range;
    for (const e of G.entities.enemies) {
      if (!e.alive) continue;
      const d = dist2D(player.position.x, player.position.z, e.pos.x, e.pos.z);
      if (d < nd) { nd = d; near = e; }
    }
    if (near) G.attackEnemy(near);
  }

  G.useItem = (key) => {
    const def = ITEMS[key];
    if (!def || def.type !== 'consumable') return;
    if (player.state.hp >= player.state.maxHp) { G.ui.toast('Already at full health'); return; }
    player.state.hp = Math.min(player.state.maxHp, player.state.hp + def.heal);
    G.inventory.remove(key, 1);
    G.ui.setHealth(player.state.hp, player.state.maxHp);
    G.ui.toast(`Used ${def.name} (+${def.heal} HP)`, 'good', 1600);
    G.save.save();
  };

  G.buyItem = (key) => {
    const s = SHOP.stock.find((x) => x.key === key); if (!s) return;
    if (G.inventory.count('gold') >= s.price) { G.inventory.remove('gold', s.price); G.inventory.add(key, 1); G.ui.toast(`Bought ${ITEMS[key].name}`, 'gold', 1300); G.save.save(); }
    else G.ui.toast('Not enough gold', 'bad', 1400);
  };
  G.sellItem = (key) => {
    const p = SHOP.sell[key]; if (!p || !G.inventory.has(key, 1)) return;
    G.inventory.remove(key, 1); G.inventory.add('gold', p);
    G.ui.toast(`Sold ${ITEMS[key].name}  +${p}g`, 'gold', 1300); G.save.save();
  };
  const shopCfg = {
    title: 'Trader Pell', hint: '↑ ↓ select · tap buy/sell · double-tap leave',
    rows: () => {
      const rows = SHOP.stock.map((s) => ({ section: 'Buy', icon: ITEMS[s.key].icon, title: ITEMS[s.key].name, sub: ITEMS[s.key].desc, right: `🪙 ${s.price}`, data: { t: 'buy', key: s.key } }));
      G.inventory.list().filter((it) => SHOP.sell[it.key]).forEach((it) => rows.push({ section: 'Sell (one)', icon: it.def.icon, title: it.def.name, sub: 'tap to sell', right: `🪙 ${SHOP.sell[it.key]} · ×${it.count}`, data: { t: 'sell', key: it.key } }));
      return rows;
    },
    onSelect: (r) => { if (r.data.t === 'buy') G.buyItem(r.data.key); else G.sellItem(r.data.key); },
  };
  const forgeCfg = {
    title: 'Anvil — Forge', hint: '↑ ↓ select · tap forge · double-tap leave', empty: 'Smelt bars at the furnace first.',
    rows: () => FORGE.map((rec) => {
      const cost = Object.keys(rec.cost).map((k) => `${rec.cost[k]} ${ITEMS[k].name}`).join(', ');
      const can = Object.keys(rec.cost).every((k) => G.inventory.has(k, rec.cost[k]));
      return { section: ITEMS[rec.out].type === 'armor' ? 'Armor' : 'Weapons', icon: ITEMS[rec.out].icon, title: ITEMS[rec.out].name, sub: cost, right: can ? 'forge' : '—', data: { out: rec.out } };
    }),
    onSelect: (r) => G.forgeItem(r.data.out),
  };
  const bankCfg = {
    title: 'Bank', hint: '↑ ↓ select · tap deposit/withdraw all · double-tap leave', empty: 'Your pack and bank are empty.',
    rows: () => {
      const rows = G.inventory.list().map((it) => ({ section: 'Deposit (all)', icon: it.def.icon, title: it.def.name, sub: 'tap to bank', right: `×${it.count}`, data: { op: 'dep', key: it.key } }));
      Object.keys(G.bankItems).filter((k) => G.bankItems[k] > 0).forEach((k) => rows.push({ section: 'Withdraw (all)', icon: ITEMS[k].icon, title: ITEMS[k].name, sub: 'tap to take', right: `×${G.bankItems[k]}`, data: { op: 'wd', key: k } }));
      return rows;
    },
    onSelect: (r) => { if (r.data.op === 'dep') G.bankDeposit(r.data.key); else G.bankWithdraw(r.data.key); },
  };
  G.openShop = () => { setMode('picker'); G.ui.openPicker(shopCfg); };
  G.openForge = () => { setMode('picker'); G.ui.openPicker(forgeCfg); };
  G.openBank = () => { setMode('picker'); G.ui.openPicker(bankCfg); };
  G.closePicker = () => { G.ui.closePicker(); setMode('world'); };

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
  G.equipChoice = (r) => {
    const eq = player.state.equipment;
    if (r.kind === 'unequipW') eq.weapon = null;
    else if (r.kind === 'unequipA') eq.armor = null;
    else if (r.kind === 'unequipAm') eq.amulet = null;
    else if (r.kind === 'unequipR') eq.ring = null;
    else if (r.kind === 'weapon') eq.weapon = r.key;
    else if (r.kind === 'armor') eq.armor = r.key;
    else if (r.kind === 'amulet') eq.amulet = r.key;
    else if (r.kind === 'ring') eq.ring = r.key;
    player.refreshEquipment(); applyMaxHp();
    G.ui.toast(r.key ? `Equipped ${ITEMS[r.key].name}` : 'Unequipped', 'good', 1200); G.ach.evaluate(); G.save.save();
  };
  G.bankDeposit = (key) => { const n = G.inventory.count(key); if (n <= 0) return; G.inventory.remove(key, n); G.bankItems[key] = (G.bankItems[key] || 0) + n; G.save.save(); };
  G.bankWithdraw = (key) => { const n = G.bankItems[key] || 0; if (n <= 0) return; G.bankItems[key] = 0; G.inventory.add(key, n); G.save.save(); };

  const craftCfg = {
    title: 'Crafting Bench', hint: '↑ ↓ select · tap craft · double-tap leave', empty: 'Mine gems first (sapphire/emerald/ruby).',
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

  let hurtFlash = 0;
  G.damagePlayer = (amount) => {
    if (player.state.hp <= 0) return;
    const defv = gearBonus().def;
    let taken = Math.max(1, Math.round(amount - defv * 0.6));
    const apT = PRAYERS.find((pp) => pp.key === player.state.activePrayer);
    if (apT && apT.dmgTaken) taken = Math.max(1, Math.round(taken * apT.dmgTaken));
    player.state.hp -= taken;
    hurtFlash = 0.25;
    G.ui.hitsplat(player.position.x, player.position.y + 1.9, player.position.z, taken, 'player');
    G.audio.sfx('hurt');
    G.gainXp('defence', Math.max(1, Math.round(taken * 0.6)));
    G.ui.setHealth(player.state.hp, player.state.maxHp);
    if (player.state.hp <= 0) {
      player.state.hp = player.state.maxHp;
      const sx = world.village.x, sz = world.village.z + 12;
      player.group.position.set(sx, world.height(sx, sz), sz);
      player.state.heading = Math.PI;
      G.ui.setHealth(player.state.hp, player.state.maxHp);
      G.ui.toast('You fell — and woke by the village hearth.', 'bad', 3200);
      G.save.save();
    }
  };

  G.onEnemyKilled = (e) => {
    const def = e.def;
    const names = [];
    for (const k in def.loot) { G.inventory.add(k, def.loot[k]); names.push(ITEMS[k].name); }
    if (def.rare && Math.random() < def.rare.chance) { G.inventory.add(def.rare.item, 1); G.ui.toast(`✨ Rare drop: ${ITEMS[def.rare.item].name}!`, 'gold', 3400); }
    G.gainXp(e._lastSkill || 'combat', def.xp);
    G.stats.kills++; G.stats.killsByType[e.enemyKey] = (G.stats.killsByType[e.enemyKey] || 0) + 1;
    if (def.boss) { G.stats.bosses.add(e.enemyKey); world.showTrophy(e.enemyKey); }
    if (G.slayer.active && G.slayer.enemy === e.enemyKey && G.slayer.progress < G.slayer.count) { G.slayer.progress++; if (G.slayer.progress >= G.slayer.count) G.ui.toast('Slayer task complete — see the Slayer Master', 'good', 2600); }
    G.audio.sfx('kill');
    G.ui.toast(`Defeated ${def.name} · +${names.join(', ')}`, 'gold', 2200);
    G.quests.notifyKill(e.enemyKey);
    G.ach.evaluate(); checkQuestReady(); G.save.save();
  };
  G.onQuestAccepted = (id, def) => { G.ui.toast(`Quest accepted: ${def.name}`, 'good', 2600); G.save.save(); };
  G.onQuestComplete = (id, def) => { G.ui.toast(`Quest complete: ${def.name}!`, 'good', 3400); readyToasted.delete(id); G.save.save(); };

  // ---------- mode state machine ----------
  let mode = 'world';
  function setMode(m) { mode = m; if (m !== 'world') G.ui.hidePrompt(); }
  function openMenu() { setMode('menu'); G.ui.openMenu(); G.audio.sfx('ui'); }
  function closeMenu() { G.ui.closeMenu(); setMode('world'); }

  input.on((a) => {
    G.audio.resume();
    if (mode === 'world') {
      if (a === 'up') player.impulseForward();
      else if (a === 'left') player.impulseTurn(-1);
      else if (a === 'right') player.impulseTurn(1);
      else if (a === 'down') openMenu();
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
    const t = G.currentTarget;
    if (!t) return;
    if (t.kind === 'tree') G.chopTree(t.ref);
    else if (t.kind === 'bush') G.forageBush(t.ref);
    else if (t.kind === 'ore') G.mineOre(t.ref);
    else if (t.kind === 'fish') G.fishSpot(t.ref);
    else if (t.kind === 'station') G.useStation(t.ref);
    else if (t.kind === 'plot') G.plotAction(t.ref);
    else if (t.kind === 'stall') G.thieveStall(t.ref);
    else if (t.kind === 'shortcut') G.useShortcut(t.ref);
    else if (t.kind === 'npc') G.talkTo(t.ref);
    else if (t.kind === 'enemy') G.attackEnemy(t.ref);
  }

  // ---------- HUD helpers ----------
  let curLoc = '';
  function updateLocation() {
    let name = 'Verdant Isle', best = 16;
    for (const l of world.locations) {
      const d = dist2D(player.position.x, player.position.z, l.x, l.z);
      if (d < best) { best = d; name = l.name; }
    }
    if (name !== curLoc) { curLoc = name; G.ui.setLocation(name); }
    let rk = null, rb = Infinity;
    for (const rg of world.regions) { const d = Math.hypot(player.position.x - rg.x, player.position.z - rg.z); if (d < rg.r && d < rb) { rb = d; rk = rg.key; } }
    if (rk && !G.stats.regions.has(rk)) { G.stats.regions.add(rk); if (G.ach) G.ach.evaluate(); }
  }

  function updatePrompt() {
    if (mode !== 'world') return;
    const t = G.currentTarget;
    if (t) G.ui.showPrompt(t.label); else G.ui.hidePrompt();
  }

  function updateMarkers() {
    const list = [];
    const p = player.position;
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
  let running = true, tod = 0.32;
  function frame() {
    if (!running) return;
    const dt = Math.min(engine.clock.getDelta(), 0.05);
    // day/night cycle (~180s) — kept bright enough to stay readable on the display
    tod = (tod + dt / 180) % 1;
    const day = (Math.sin(tod * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    engine.hemi.intensity = 0.32 + 0.40 * day;
    engine.sun.intensity = 0.25 + 0.70 * day;
    engine.fill.intensity = 0.10 + 0.15 * day;
    const ang = tod * Math.PI * 2;
    engine.sun.position.set(Math.cos(ang) * 60, 25 + 75 * day, Math.sin(ang) * 40);
    engine.sun.color.setHSL(0.09, 0.55, 0.38 + 0.18 * day);
    if (mode === 'world') {
      player.update(dt, input);
      G.entities.update(dt, player);
      world.tick(dt);
      G.projectiles.update(dt);
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
    }
    if (hurtFlash > 0) { hurtFlash -= dt; document.body.style.boxShadow = `inset 0 0 ${Math.round(120 * (hurtFlash / 0.25))}px rgba(255,40,40,0.6)`; }
    else if (document.body.style.boxShadow) document.body.style.boxShadow = '';
    player.updateCamera(engine.camera, dt);
    G.ui.setCompass(player.state.heading);
    updateMarkers();
    engine.renderer.render(engine.scene, engine.camera);
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; input.clearHeld(); G.save.save(); }
    else if (!running) { running = true; engine.clock.getDelta(); requestAnimationFrame(frame); }
  });
  setInterval(() => G.save.save(), 15000);

  // initial HUD + reveal
  applyMaxHp();
  player.state.maxPrayer = maxPrayer();
  if (!player.state.prayer || player.state.prayer > player.state.maxPrayer) player.state.prayer = player.state.maxPrayer;
  G.ui.setHealth(player.state.hp, player.state.maxHp);
  G.ui.setPrayer(player.state.prayer, player.state.maxPrayer);
  G.ach.evaluate();
  G.stats.bosses.forEach((b) => world.showTrophy(b));
  updateLocation();
  boot.classList.add('out');
  setTimeout(() => boot.classList.add('hidden'), 700);
  requestAnimationFrame(frame);

  if (!saved) {
    setTimeout(() => G.ui.toast('Welcome to the Verdant Isle', 'good', 4200), 1000);
    setTimeout(() => G.ui.toast('Swipe ↑ walk · ←/→ turn · tap to act · swipe ↓ for menu', '', 6000), 2400);
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
    step(n = 1) { for (let i = 0; i < n; i++) { if (mode === 'world') { player.update(0.016, input); G.entities.update(0.016, player); world.tick(0.016); G.projectiles.update(0.016); G.currentTarget = G.interact.best(); } player.updateCamera(engine.camera, 0.016); G.ui.setCompass(player.state.heading); updateMarkers(); engine.renderer.render(engine.scene, engine.camera); } },
  };
} catch (err) {
  bootSub.textContent = 'Error: ' + (err && err.message ? err.message : err);
  console.error(err);
  throw err;
}
