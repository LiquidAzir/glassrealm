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
import { ITEMS, QUESTS, SMELT, COOK, FORGE, SHOP } from './content.js';
import { createProjectiles } from './projectiles.js';
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
  G.skills = createSkills(saved && saved.skills);
  G.inventory = createInventory(saved && saved.inventory);
  G.ui = createUI(G);
  G.quests = createQuests(G, saved && saved.quests);
  G.entities = createEntities(engine.scene, world, G);
  G.interact = createInteraction(G);
  G.dialogue = createDialogue(G);
  G.projectiles = createProjectiles(engine.scene);
  G.bankItems = (saved && saved.bank) || {};
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
      if (saved.player.equipment) player.state.equipment = { weapon: saved.player.equipment.weapon || null, armor: saved.player.equipment.armor || null };
      player.refreshEquipment();
    }
  }

  const skillName = (key) => (G.skills.DEFS.find((d) => d.key === key) || { name: key }).name;
  const npcName = (key) => { const n = G.entities.npcs.find((x) => x.def.key === key); return n ? n.def.name : key; };

  // ---------- gameplay verbs ----------
  G.gainXp = (key, amt) => {
    const r = G.skills.addXp(key, amt);
    G.ui.xpDrop(`+${amt} ${skillName(key)}`);
    if (r.leveled) G.ui.levelBanner(`${skillName(key)} Level ${r.level}!`);
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
    G.ui.toast('Chopped Driftwood', 'gold', 1400);
    G.gainXp('woodcutting', 14);
    checkQuestReady(); G.save.save();
  };
  G.forageBush = (b) => {
    world.harvestBush(b.idx);
    G.inventory.add('berry', 1);
    G.ui.toast('Foraged Sunberries', 'gold', 1400);
    G.gainXp('foraging', 10);
    checkQuestReady(); G.save.save();
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
    G.ui.toast('Mined ' + ITEMS[item].name, 'gold', 1400);
    G.gainXp('mining', 18);
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
    } else if (s.kind === 'chest') {
      if (s.looted) { G.ui.toast('The chest is empty.', '', 1500); return; }
      s.looted = true;
      G.inventory.add('gold', 120); G.inventory.add('iron_bar', 3); G.inventory.add('coal', 4);
      G.ui.toast('You loot the cave chest! +120g, iron, coal', 'gold', 3200); G.save.save(); return;
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
    const dmg = Math.round(4 + G.skills.level(w.skill) * 1.2 + w.bonus);
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
    else if (r.kind === 'weapon') eq.weapon = r.key;
    else if (r.kind === 'armor') eq.armor = r.key;
    player.refreshEquipment();
    G.ui.toast(r.key ? `Equipped ${ITEMS[r.key].name}` : 'Unequipped', 'good', 1200); G.save.save();
  };
  G.bankDeposit = (key) => { const n = G.inventory.count(key); if (n <= 0) return; G.inventory.remove(key, n); G.bankItems[key] = (G.bankItems[key] || 0) + n; G.save.save(); };
  G.bankWithdraw = (key) => { const n = G.bankItems[key] || 0; if (n <= 0) return; G.bankItems[key] = 0; G.inventory.add(key, n); G.save.save(); };

  let hurtFlash = 0;
  G.damagePlayer = (amount) => {
    if (player.state.hp <= 0) return;
    const eq = player.state.equipment;
    const defv = eq.armor ? (ITEMS[eq.armor].defense || 0) : 0;
    const taken = Math.max(1, Math.round(amount - defv * 0.6));
    player.state.hp -= taken;
    hurtFlash = 0.25;
    G.ui.hitsplat(player.position.x, player.position.y + 1.9, player.position.z, taken, 'player');
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
    G.gainXp(e._lastSkill || 'combat', def.xp);
    G.ui.toast(`Defeated ${def.name} · +${names.join(', ')}`, 'gold', 2200);
    G.quests.notifyKill(e.enemyKey);
    checkQuestReady(); G.save.save();
  };
  G.onQuestAccepted = (id, def) => { G.ui.toast(`Quest accepted: ${def.name}`, 'good', 2600); G.save.save(); };
  G.onQuestComplete = (id, def) => { G.ui.toast(`Quest complete: ${def.name}!`, 'good', 3400); readyToasted.delete(id); G.save.save(); };

  // ---------- mode state machine ----------
  let mode = 'world';
  function setMode(m) { mode = m; if (m !== 'world') G.ui.hidePrompt(); }
  function openMenu() { setMode('menu'); G.ui.openMenu(); }
  function closeMenu() { G.ui.closeMenu(); setMode('world'); }

  input.on((a) => {
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
  let running = true;
  function frame() {
    if (!running) return;
    const dt = Math.min(engine.clock.getDelta(), 0.05);
    if (mode === 'world') {
      player.update(dt, input);
      G.entities.update(dt, player);
      world.tick(dt);
      G.projectiles.update(dt);
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
  G.ui.setHealth(player.state.hp, player.state.maxHp);
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
