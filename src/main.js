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
import { ITEMS, QUESTS, SMELT, COOK, WEAPONS, SHOP } from './content.js';
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
      player.state.weaponTier = saved.player.weaponTier || 0;
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
      const next = WEAPONS[player.state.weaponTier + 1];
      if (!next) { G.ui.toast('Your blade is already the finest', '', 1800); return; }
      if (Object.keys(next.cost).every((k) => G.inventory.has(k, next.cost[k]))) {
        for (const k in next.cost) G.inventory.remove(k, next.cost[k]);
        player.state.weaponTier = next.tier;
        G.gainXp('smithing', next.xp);
        G.ui.toast(`Forged a ${next.name}!`, 'good', 3200);
      } else {
        const need = Object.keys(next.cost).map((k) => `${next.cost[k]} ${ITEMS[k].name}`).join(', ');
        G.ui.toast(`${next.name} needs ${need}`, '', 2600);
      }
    }
    G.save.save();
  };

  G.weaponName = () => (WEAPONS[player.state.weaponTier] || WEAPONS[0]).name;
  G.attackEnemy = (e) => {
    if (player.state.attackCd > 0 || !e.alive) return;
    player.state.attackCd = 0.5;
    const wb = (WEAPONS[player.state.weaponTier] || WEAPONS[0]).bonus;
    const dmg = Math.round(5 + G.skills.level('combat') * 1.2 + wb);
    G.ui.hitsplat(e.pos.x, e.pos.y + 1.5 * (e.baseScale || 1), e.pos.z, dmg, 'enemy');
    G.entities.damageEnemy(e, dmg);
  };
  function quickAttack() {
    const t = G.currentTarget;
    if (t && t.kind === 'enemy') { G.attackEnemy(t.ref); return; }
    // otherwise hit the nearest living enemy within reach
    let near = null, nd = G.interact.RANGE.enemy;
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
  G.openShop = () => { setMode('shop'); G.ui.openShop(); };
  G.closeShop = () => { G.ui.closeShop(); setMode('world'); };

  let hurtFlash = 0;
  G.damagePlayer = (amount) => {
    if (player.state.hp <= 0) return;
    player.state.hp -= amount;
    hurtFlash = 0.25;
    G.ui.hitsplat(player.position.x, player.position.y + 1.9, player.position.z, amount, 'player');
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
    G.gainXp('combat', def.xp);
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
    } else if (mode === 'shop') {
      if (a === 'up') G.ui.shopMove(-1);
      else if (a === 'down') G.ui.shopMove(1);
      else if (a === 'tap') G.ui.shopSelect();
      else if (a === 'doubletap') G.closeShop();
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
    step(n = 1) { for (let i = 0; i < n; i++) { if (mode === 'world') { player.update(0.016, input); G.entities.update(0.016, player); G.currentTarget = G.interact.best(); } player.updateCamera(engine.camera, 0.016); G.ui.setCompass(player.state.heading); updateMarkers(); engine.renderer.render(engine.scene, engine.camera); } },
  };
} catch (err) {
  bootSub.textContent = 'Error: ' + (err && err.message ? err.message : err);
  console.error(err);
  throw err;
}
