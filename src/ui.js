import * as THREE from 'three';
import { ITEMS, SHOP, PRAYERS, ACHIEVEMENTS, ENEMIES } from './content.js';

const TABS = ['Inventory', 'Gear', 'Skills', 'Prayer', 'Quests', 'Diary', 'Bestiary', 'Map'];

export function createUI(G) {
  const $ = (id) => document.getElementById(id);
  const els = {
    health: $('healthFill'), healthLabel: $('healthLabel'), loc: $('locLabel'),
    prompt: $('prompt'), promptText: $('promptText'), toasts: $('toasts'),
    markers: $('markers'), compass: $('compassTrack'),
    menu: $('menu'), menuTabs: $('menuTabs'), menuBody: $('menuBody'),
    dialogue: $('dialogue'), dlgSpeaker: $('dlgSpeaker'), dlgText: $('dlgText'),
    dlgChoices: $('dlgChoices'), dlgHint: $('dlgHint'),
  };

  // ---- compass ----
  const DIRS = ['N', '30', '60', 'E', '120', '150', 'S', '210', '240', 'W', '300', '330'];
  els.compass.innerHTML = DIRS.concat(DIRS, DIRS)
    .map((d) => `<span class="tick ${['N', 'E', 'S', 'W'].includes(d) ? 'card' : ''}">${d}</span>`).join('');
  function setCompass(heading) {
    const deg = ((heading * 180 / Math.PI) % 360 + 360) % 360;
    els.compass.style.transform = `translateX(${110 - 20 - (12 * 40 + deg * (40 / 30))}px)`;
  }

  // ---- vitals / prompt / toasts ----
  function setHealth(hp, max) {
    els.health.style.width = Math.max(0, Math.min(100, (hp / max) * 100)) + '%';
    els.healthLabel.textContent = `${Math.max(0, Math.ceil(hp))} / ${max}`;
  }
  function setLocation(name) { els.loc.textContent = name; }
  const prayerBar = document.createElement('div'); prayerBar.className = 'bar prayer-bar';
  prayerBar.innerHTML = '<span class="bar-fill prayer" id="prayerFill"></span><span class="bar-label" id="prayerLabel">✨</span>';
  document.getElementById('vitals').insertBefore(prayerBar, els.loc);
  const prayerFill = prayerBar.querySelector('#prayerFill');
  const prayerLabel = prayerBar.querySelector('#prayerLabel');
  function setPrayer(cur, mx) { prayerFill.style.width = Math.max(0, Math.min(100, (cur / mx) * 100)) + '%'; prayerLabel.textContent = `✨ ${Math.ceil(cur)}/${mx}`; }

  // quest guidance arrow (points toward current objective, relative to facing)
  const questGuide = document.createElement('div'); questGuide.id = 'questGuide'; questGuide.className = 'hidden';
  questGuide.innerHTML = '<span class="qg-arrow">▲</span><span class="qg-label"></span>';
  document.getElementById('hud').appendChild(questGuide);
  const qgArrow = questGuide.querySelector('.qg-arrow'), qgLabel = questGuide.querySelector('.qg-label');
  function setQuestArrow(rad, label, dist) {
    if (rad == null) { questGuide.classList.add('hidden'); return; }
    questGuide.classList.remove('hidden');
    qgArrow.style.transform = `rotate(${rad}rad)`;
    qgLabel.textContent = label + (dist != null ? `  ·  ${dist}m` : '');
  }

  // minimap (top-right) — a live local map centred on the player
  const minimap = document.createElement('canvas'); minimap.id = 'minimap'; minimap.width = 116; minimap.height = 116;
  document.getElementById('hud').appendChild(minimap);
  const mmCtx = minimap.getContext('2d');
  function setMinimapVisible(on) { minimap.style.display = on ? '' : 'none'; }
  function showPrompt(t) { els.promptText.textContent = t; els.prompt.classList.remove('hidden'); }
  function hidePrompt() { els.prompt.classList.add('hidden'); }
  function toast(text, type = '', ms = 2400) {
    const d = document.createElement('div');
    d.className = 'toast ' + type; d.textContent = text;
    els.toasts.appendChild(d);
    while (els.toasts.children.length > 4) els.toasts.firstChild.remove();
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, ms);
  }

  // ---- 3D-projected markers ----
  const markerPool = new Map();
  const v = new THREE.Vector3();
  function updateMarkers(list) {
    const cam = G.engine.camera;
    const seen = new Set();
    for (const m of list) {
      let el = markerPool.get(m.id);
      if (!el) { el = document.createElement('div'); els.markers.appendChild(el); markerPool.set(m.id, el); }
      seen.add(m.id);
      v.set(m.x, m.y, m.z).project(cam);
      if (v.z > 1 || v.x < -1.3 || v.x > 1.3) { el.style.display = 'none'; continue; }
      el.style.display = '';
      const cls = 'marker ' + m.kind + (m.far ? ' far' : '');
      if (el._cls !== cls) { el.className = cls; el._cls = cls; }   // only touch the DOM when content changes
      const html = (m.pip ? `<span class="pip">${m.pip}</span>` : '') + (m.label ? `<span class="label">${m.label}</span>` : '');
      if (el._html !== html) { el.innerHTML = html; el._html = html; }
      el.style.left = ((v.x * 0.5 + 0.5) * 600) + 'px';
      el.style.top = ((-v.y * 0.5 + 0.5) * 600) + 'px';
    }
    for (const [id, el] of markerPool) if (!seen.has(id)) el.style.display = 'none';
  }

  // ---- floating text: hitsplats, xp drops, level-up banner ----
  const app = document.getElementById('app');
  const fxLayer = document.createElement('div'); fxLayer.id = 'fx'; app.appendChild(fxLayer);
  const xpLayer = document.createElement('div'); xpLayer.id = 'xpdrops'; app.appendChild(xpLayer);
  const banner = document.createElement('div'); banner.id = 'levelBanner'; banner.className = 'hidden'; app.appendChild(banner);
  let bannerT = null;
  const projv = new THREE.Vector3();
  function project(x, y, z) {
    projv.set(x, y, z).project(G.engine.camera);
    if (projv.z > 1) return null;
    return { x: (projv.x * 0.5 + 0.5) * 600, y: (-projv.y * 0.5 + 0.5) * 600 };
  }
  function hitsplat(x, y, z, amount, kind) {
    const s = project(x, y, z); if (!s) return;
    const d = document.createElement('div');
    d.className = 'hitsplat ' + (kind || 'enemy');
    d.textContent = amount; d.style.left = s.x + 'px'; d.style.top = s.y + 'px';
    fxLayer.appendChild(d); setTimeout(() => d.remove(), 860);
  }
  function xpDrop(text) {
    const d = document.createElement('div'); d.className = 'xpdrop'; d.textContent = text;
    xpLayer.appendChild(d); setTimeout(() => d.remove(), 1500);
    while (xpLayer.children.length > 6) xpLayer.firstChild.remove();
  }
  function levelBanner(text) {
    banner.textContent = text; banner.classList.remove('hidden', 'show'); void banner.offsetWidth; banner.classList.add('show');
    clearTimeout(bannerT); bannerT = setTimeout(() => banner.classList.add('hidden'), 2800);
  }

  // ---- menu ----
  let tab = 0, row = 0;
  function renderMenu() {
    els.menuTabs.innerHTML = TABS.map((t, i) => `<div class="tab ${i === tab ? 'sel' : ''}">${t}</div>`).join('');
    ({ Inventory: renderInventory, Gear: renderGear, Skills: renderSkills, Prayer: renderPrayer, Quests: renderQuests, Diary: renderDiary, Bestiary: renderBestiary, Map: renderMap })[TABS[tab]]();
  }
  function rowCount() {
    if (TABS[tab] === 'Inventory') return G.inventory.list().length;
    if (TABS[tab] === 'Gear') return gearRows().length;
    if (TABS[tab] === 'Prayer') return PRAYERS.length;
    if (TABS[tab] === 'Skills') return G.skills.DEFS.length;
    if (TABS[tab] === 'Quests') return G.quests.all().filter((q) => q.status === 'active').length;
    if (TABS[tab] === 'Diary') return 1;
    return 0;
  }
  function openMenu() { api.menuOpen = true; els.menu.classList.remove('hidden'); row = 0; renderMenu(); }
  function closeMenu() { api.menuOpen = false; els.menu.classList.add('hidden'); }
  function menuTab(dir) { tab = (tab + dir + TABS.length) % TABS.length; row = 0; renderMenu(); }
  function menuMove(dir) {
    const n = rowCount();
    if (n > 0) { row = (row + dir + n) % n; renderMenu(); const s = els.menuBody.querySelector('.row.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }
    else els.menuBody.scrollBy(0, dir * 70);
  }
  function menuSelect() {
    if (TABS[tab] === 'Inventory') {
      const it = G.inventory.list()[row];
      if (it && it.def.type === 'consumable') { G.useItem(it.key); renderMenu(); }
    } else if (TABS[tab] === 'Gear') {
      const r = gearRows()[row]; if (r) { G.equipChoice(r); renderMenu(); }
    } else if (TABS[tab] === 'Prayer') {
      const pr = PRAYERS[row]; if (pr) { G.togglePrayer(pr.key); renderMenu(); }
    } else if (TABS[tab] === 'Skills') {
      const d = G.skills.DEFS[row]; if (d && G.skills.canPrestige(d.key)) { G.prestigeSkill(d.key); renderMenu(); }
    } else if (TABS[tab] === 'Quests') {
      const act = G.quests.all().filter((q) => q.status === 'active'); const q = act[row];
      if (q) { G.trackQuest(q.id); renderMenu(); }
    } else if (TABS[tab] === 'Diary') {
      if (row === 0 && G.audio) { G.audio.toggleMuted(); G.save.save(); renderMenu(); }
    }
  }
  function gearRows() {
    const rows = [{ kind: 'unequipW', label: 'Unarmed (fists)' }];
    G.inventory.list().filter((it) => it.def.type === 'weapon').forEach((it) => rows.push({ kind: 'weapon', key: it.key }));
    rows.push({ kind: 'unequipA', label: 'No armor' });
    G.inventory.list().filter((it) => it.def.type === 'armor').forEach((it) => rows.push({ kind: 'armor', key: it.key }));
    rows.push({ kind: 'unequipAm', label: 'No amulet' });
    G.inventory.list().filter((it) => it.def.type === 'amulet').forEach((it) => rows.push({ kind: 'amulet', key: it.key }));
    rows.push({ kind: 'unequipR', label: 'No ring' });
    G.inventory.list().filter((it) => it.def.type === 'ring').forEach((it) => rows.push({ kind: 'ring', key: it.key }));
    return rows;
  }
  function renderGear() {
    const eq = G.player.state.equipment;
    const gb = G.gearBonus ? G.gearBonus() : { def: 0, melee: 0, ranged: 0, magic: 0, maxhp: 0 };
    const set = G.fullSet && G.fullSet();
    const rows = gearRows();
    let html = `<div class="section-head">⚔️${gb.melee} 🏹${gb.ranged} 🪄${gb.magic} 🛡️${gb.def} ❤️+${gb.maxhp}${set ? ` &nbsp;·&nbsp; <span style="color:var(--gold)">${set} set!</span>` : ''}</div>`;
    rows.forEach((r, i) => {
      const d = r.key ? ITEMS[r.key] : null;
      const equipped = (r.kind === 'weapon' && eq.weapon === r.key) || (r.kind === 'armor' && eq.armor === r.key) || (r.kind === 'amulet' && eq.amulet === r.key) || (r.kind === 'ring' && eq.ring === r.key) || (r.kind === 'unequipW' && !eq.weapon) || (r.kind === 'unequipA' && !eq.armor) || (r.kind === 'unequipAm' && !eq.amulet) || (r.kind === 'unequipR' && !eq.ring);
      const icon = d ? d.icon : (r.kind === 'unequipW' ? '✊' : '🚫');
      const title = d ? d.name : r.label;
      let sub;
      if (!d) sub = 'tap to unequip';
      else if (d.type === 'weapon') sub = `${d.style} · +${d.bonus} dmg`;
      else if (d.type === 'armor') sub = `armor · -${d.defense} dmg${d.set ? ' · ' + d.set : ''}`;
      else sub = Object.keys(d.bonus || {}).map((k) => `+${d.bonus[k]} ${k}`).join(', ') + (d.set ? ' · ' + d.set : '');
      html += `<div class="row ${i === row ? 'sel' : ''}"><span class="row-icon">${icon}</span><div class="row-main"><div class="row-title">${title}${equipped ? ' <span style="color:var(--gold)">✓</span>' : ''}</div><div class="row-sub">${sub}</div></div></div>`;
    });
    els.menuBody.innerHTML = html;
  }
  function renderDiary() {
    const done = G.ach.unlocked;
    const sound = G.audio && !G.audio.muted;
    let html = `<div class="row ${row === 0 ? 'sel' : ''}"><span class="row-icon">${sound ? '🔊' : '🔇'}</span><div class="row-main"><div class="row-title">Sound: ${sound ? 'ON' : 'OFF'}</div><div class="row-sub">tap to toggle</div></div></div>`;
    html += `<div class="section-head">Achievements · ${done.size}/${ACHIEVEMENTS.length}</div>`;
    html += ACHIEVEMENTS.map((a) => { const u = done.has(a.id); return `<div class="row" style="${u ? '' : 'opacity:.55'}"><span class="row-icon">${u ? '🏆' : '🔒'}</span><div class="row-main"><div class="row-title">${a.name}</div><div class="row-sub">${a.desc}</div></div></div>`; }).join('');
    els.menuBody.innerHTML = html;
  }
  function renderBestiary() {
    const kt = G.stats.killsByType || {};
    let html = '<div class="section-head">Bestiary</div>';
    html += Object.keys(ENEMIES).map((k) => {
      const e = ENEMIES[k], n = kt[k] || 0, seen = n > 0;
      const sub = seen ? `HP ${e.hp} · dmg ${e.dmg} · ${e.xp} xp${e.boss ? ' · BOSS' : ''}` : '??? — defeat one to learn its ways';
      return `<div class="row" style="${seen ? '' : 'opacity:.5'}"><span class="row-icon">${e.boss ? '👑' : '☠️'}</span><div class="row-main"><div class="row-title">${seen ? e.name : '???'}${seen ? ` <span style="color:var(--text-mut)">×${n}</span>` : ''}</div><div class="row-sub">${sub}</div></div></div>`;
    }).join('');
    els.menuBody.innerHTML = html;
  }

  function renderInventory() {
    const gold = G.inventory.count('gold');
    const items = G.inventory.list();
    let html = `<div class="section-head">Pouch &nbsp;·&nbsp; 🪙 ${gold} Gold</div>`;
    if (!items.length) html += `<div class="empty-note">Your pack is empty. Chop trees, forage bushes, and defeat boars to gather loot.</div>`;
    else html += items.map((it, i) => `<div class="row ${i === row ? 'sel' : ''}"><span class="row-icon">${it.def.icon}</span><div class="row-main"><div class="row-title">${it.def.name}</div><div class="row-sub">${it.def.desc}${it.def.type === 'consumable' ? ' · tap to use' : ''}</div></div><div class="row-trail">×${it.count}</div></div>`).join('');
    els.menuBody.innerHTML = html;
  }
  function renderSkills() {
    const html = G.skills.DEFS.map((d, i) => {
      const lv = G.skills.level(d.key), pr = Math.round(G.skills.progress(d.key) * 100), tn = G.skills.toNext(d.key);
      const pst = G.skills.prestigeOf(d.key), can = G.skills.canPrestige(d.key);
      const stars = pst ? ` <span style="color:var(--gold)">${'⭐'.repeat(Math.min(pst, 5))}</span>` : '';
      const sub = can ? '<span style="color:var(--gold)">tap to prestige ⭐</span>' : `${tn} xp to next`;
      return `<div class="row ${i === row ? 'sel' : ''}"><span class="row-icon">${d.icon}</span><div class="row-main"><div class="row-title">${d.name} <span style="color:var(--gold)">Lv ${lv}</span>${stars}</div><div class="skillbar"><span style="width:${pr}%"></span></div><div class="row-sub">${sub}</div></div></div>`;
    }).join('');
    const L = (k) => G.skills.level(k);
    els.menuBody.innerHTML = `<div class="section-head">Total ${G.skills.total()} &nbsp;·&nbsp; ⚔️${L('combat')} 🏹${L('ranged')} 🪄${L('magic')} 🛡️${L('defence')} ☠️${L('slayer')} &nbsp;·&nbsp; 🗡️ ${G.weaponName ? G.weaponName() : ''}</div>` + html;
  }
  function renderPrayer() {
    const lvl = G.skills.level('prayer');
    const cur = Math.ceil(G.player.state.prayer), mx = G.player.state.maxPrayer;
    let html = `<div class="section-head">Prayer ${cur}/${mx} &nbsp;·&nbsp; Lv ${lvl} &nbsp;·&nbsp; bury bones at an altar to restore</div>`;
    html += PRAYERS.map((pr, i) => {
      const locked = lvl < pr.level, active = G.player.state.activePrayer === pr.key;
      return `<div class="row ${i === row ? 'sel' : ''}"><span class="row-icon">${active ? '🔆' : '✨'}</span><div class="row-main"><div class="row-title">${pr.name}${active ? ' <span style="color:var(--gold)">active</span>' : ''}${locked ? ` <span style="color:var(--text-mut)">Lv ${pr.level}</span>` : ''}</div><div class="row-sub">${pr.desc} · drains ${pr.drain}/s</div></div></div>`;
    }).join('');
    els.menuBody.innerHTML = html;
  }
  function npcName(key) { const n = G.entities.npcs.find((x) => x.def.key === key); return n ? n.def.name : key; }
  function renderQuests() {
    const all = G.quests.all();
    const sect = (label, arr, fn) => arr.length ? `<div class="section-head">${label}</div>` + arr.map(fn).join('') : '';
    const active = (q, i) => {
      const objs = G.quests.objectives(q.id).map((o) => `<div class="obj ${o.done ? 'done' : ''}"><span class="box">${o.done ? '☑' : '☐'}</span>${o.text}</div>`).join('');
      const tracked = G.trackedQuest === q.id;
      return `<div class="row ${i === row ? 'sel' : ''}"><div class="row-main"><div class="row-title">${tracked ? '📍 ' : ''}${q.def.name}${tracked ? ' <span style="color:var(--gold)">tracking</span>' : ''}</div><div class="row-sub">${q.def.desc} &nbsp;·&nbsp; tap to ${tracked ? 'untrack' : 'track'}</div>${objs}</div></div>`;
    };
    let html = sect('Active', all.filter((q) => q.status === 'active'), active);
    html += sect('Available', all.filter((q) => q.status === 'available'), (q) => `<div class="row"><div class="row-main"><div class="row-title">${q.def.name}</div><div class="row-sub">See ${npcName(q.def.giver)} &nbsp;·&nbsp; ${q.def.desc}</div></div></div>`);
    html += sect('Completed', all.filter((q) => q.status === 'complete'), (q) => `<div class="row" style="opacity:.55"><div class="row-main"><div class="row-title">✓ ${q.def.name}</div></div></div>`);
    els.menuBody.innerHTML = html || `<div class="empty-note">No quests yet. Speak with the villagers around the hearth.</div>`;
  }
  function renderMap() {
    els.menuBody.innerHTML = `<div class="section-head">World Map</div><canvas id="mapCanvas" width="300" height="300"></canvas>`;
    drawMap(document.getElementById('mapCanvas').getContext('2d'));
  }
  const BIOME_MAP_COL = { grass: '#2f7d4a', forest: '#1f5a36', desert: '#d6bd72', snow: '#dbe6f2', volcanic: '#9c5a34', swamp: '#3a5a3e', jungle: '#2faa4a', badlands: '#b5622e', highland: '#7a8290', fae: '#8a3a9a' };
  function drawMap(ctx) {
    const S = 300, pad = 12, R = G.world.regions;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const r of R) { minX = Math.min(minX, r.x - r.r); maxX = Math.max(maxX, r.x + r.r); minZ = Math.min(minZ, r.z - r.r); maxZ = Math.max(maxZ, r.z + r.r); }
    const ox = (minX + maxX) / 2, oz = (minZ + maxZ) / 2, sc = (S - 2 * pad) / Math.max(maxX - minX, maxZ - minZ);
    const to = (x, z) => [S / 2 + (x - ox) * sc, S / 2 + (z - oz) * sc];
    ctx.clearRect(0, 0, S, S); ctx.fillStyle = '#08222a'; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#cdb98a'; ctx.lineCap = 'round';
    for (const b of G.world.bridges) { const [x1, y1] = to(b.ax, b.az), [x2, y2] = to(b.bx, b.bz); ctx.lineWidth = Math.max(2, b.halfW * 2 * sc); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    for (const r of R) { const [x, y] = to(r.x, r.z); ctx.fillStyle = BIOME_MAP_COL[r.biome] || '#2f7d4a'; ctx.beginPath(); ctx.arc(x, y, r.r * sc, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#aab2bd'; G.world.peaks.forEach((pk) => { const [x, y] = to(pk.x, pk.z); ctx.beginPath(); ctx.arc(x, y, Math.max(3, pk.r * sc * 0.5), 0, 7); ctx.fill(); });
    const cv = G.world.cave; const [cvx, cvy] = to(cv.x, cv.z); ctx.fillStyle = '#5a5550'; ctx.beginPath(); ctx.arc(cvx, cvy, Math.max(3, cv.r * sc), 0, 7); ctx.fill();
    if (G.world.cave2) { const c2 = G.world.cave2; const [c2x, c2y] = to(c2.x, c2.z); ctx.fillStyle = '#5a6a80'; ctx.beginPath(); ctx.arc(c2x, c2y, Math.max(3, c2.r * sc), 0, 7); ctx.fill(); }
    if (G.world.dungeons) { ctx.fillStyle = '#7a4a8a'; G.world.dungeons.forEach((d) => { const [dx, dy] = to(d.x, d.z); ctx.beginPath(); ctx.arc(dx, dy, Math.max(3, d.r * sc), 0, 7); ctx.fill(); }); }
    ctx.fillStyle = '#ffd45f'; G.world.villages.forEach((v) => { const [x, y] = to(v.x, v.z); ctx.fillRect(x - 3, y - 3, 6, 6); });
    ctx.fillStyle = '#5fe3ff'; G.entities.npcs.forEach((n) => { const [x, y] = to(n.pos.x, n.pos.z); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); });
    G.entities.enemies.forEach((e) => { if (!e.alive) return; const [x, y] = to(e.pos.x, e.pos.z); ctx.fillStyle = e.def.boss ? '#ff3a2a' : '#ff6b6b'; ctx.beginPath(); ctx.arc(x, y, e.def.boss ? 5 : 2, 0, 7); ctx.fill(); });
    const [hx, hy] = to(G.player.position.x, G.player.position.z);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.PI - G.player.state.heading);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function updateMinimap() {
    const ctx = mmCtx, S = 116, R = 75;                       // 116px canvas shows ~75 world units around the player
    const px = G.player.position.x, pz = G.player.position.z, sc = (S / 2) / R;
    const to = (x, z) => [S / 2 + (x - px) * sc, S / 2 + (z - pz) * sc];
    ctx.clearRect(0, 0, S, S);
    ctx.save(); ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 1, 0, 7); ctx.clip();
    ctx.fillStyle = '#08222a'; ctx.fillRect(0, 0, S, S);
    for (const r of G.world.regions) { const [x, y] = to(r.x, r.z); ctx.fillStyle = BIOME_MAP_COL[r.biome] || '#2f7d4a'; ctx.beginPath(); ctx.arc(x, y, r.r * sc, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#cdb98a'; ctx.lineCap = 'round';
    for (const b of G.world.bridges) { const [x1, y1] = to(b.ax, b.az), [x2, y2] = to(b.bx, b.bz); ctx.lineWidth = Math.max(2, b.halfW * 2 * sc); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    if (G.world.dungeons) { ctx.fillStyle = '#7a4a8a'; for (const d of G.world.dungeons) { const [x, y] = to(d.x, d.z); ctx.beginPath(); ctx.arc(x, y, Math.max(2, d.r * sc), 0, 7); ctx.fill(); } }
    { const cv = G.world.cave; const [x, y] = to(cv.x, cv.z); ctx.fillStyle = '#5a5550'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, cv.r * sc), 0, 7); ctx.fill(); }
    if (G.world.cave2) { const c2 = G.world.cave2; const [x, y] = to(c2.x, c2.z); ctx.fillStyle = '#5a6a80'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, c2.r * sc), 0, 7); ctx.fill(); }
    ctx.fillStyle = '#ffd45f'; for (const v of G.world.villages) { const [x, y] = to(v.x, v.z); ctx.fillRect(x - 2, y - 2, 4, 4); }
    ctx.fillStyle = '#5fe3ff'; for (const n of G.entities.npcs) { const dx = n.pos.x - px, dz = n.pos.z - pz; if (dx * dx + dz * dz > R * R) continue; const [x, y] = to(n.pos.x, n.pos.z); ctx.beginPath(); ctx.arc(x, y, 1.7, 0, 7); ctx.fill(); }
    for (const e of G.entities.enemies) { if (!e.alive) continue; const dx = e.pos.x - px, dz = e.pos.z - pz; if (dx * dx + dz * dz > R * R) continue; const [x, y] = to(e.pos.x, e.pos.z); ctx.fillStyle = e.def.boss ? '#ff3a2a' : '#ff6b6b'; ctx.beginPath(); ctx.arc(x, y, e.def.boss ? 3 : 1.7, 0, 7); ctx.fill(); }
    if (G.questGuide) { const [x, y] = to(G.questGuide.x, G.questGuide.z); ctx.fillStyle = '#6db3ff'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#ffffff'; ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#243240'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 1, 0, 7); ctx.stroke();
    ctx.save(); ctx.translate(S / 2, S / 2); ctx.rotate(Math.PI - G.player.state.heading);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(4, 4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#5fe3ff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('N', S / 2, 11);
  }

  // ---- picker (shop / forge / bank) — generic list overlay ----
  const pickerEl = document.createElement('div'); pickerEl.id = 'shop'; pickerEl.className = 'overlay hidden';
  pickerEl.innerHTML = '<div class="panel"><div class="tabs"><div class="tab sel" style="flex:2" id="pickerTitle">Shop</div><div class="tab" id="pickerGold">🪙 0</div></div><div class="menu-body" id="pickerBody"></div><div class="hint" id="pickerHint">↑ ↓ select &nbsp;·&nbsp; tap &nbsp;·&nbsp; ↑↓↑↓ leave</div></div>';
  app.appendChild(pickerEl);
  const pickerTitleEl = pickerEl.querySelector('#pickerTitle');
  const pickerGoldEl = pickerEl.querySelector('#pickerGold');
  const pickerBodyEl = pickerEl.querySelector('#pickerBody');
  const pickerHintEl = pickerEl.querySelector('#pickerHint');
  let pickerCfg = null, pickerRow = 0, pickerRows = [];
  function renderPicker() {
    if (!pickerCfg) return;
    pickerTitleEl.textContent = pickerCfg.title;
    pickerGoldEl.textContent = '🪙 ' + G.inventory.count('gold');
    pickerRows = pickerCfg.rows();
    if (pickerRow >= pickerRows.length) pickerRow = Math.max(0, pickerRows.length - 1);
    let html = '', lastSection = null;
    pickerRows.forEach((r, i) => {
      if (r.section && r.section !== lastSection) { html += `<div class="section-head">${r.section}</div>`; lastSection = r.section; }
      html += `<div class="row ${i === pickerRow ? 'sel' : ''}"><span class="row-icon">${r.icon || ''}</span><div class="row-main"><div class="row-title">${r.title}</div><div class="row-sub">${r.sub || ''}</div></div><div class="row-trail">${r.right || ''}</div></div>`;
    });
    pickerBodyEl.innerHTML = pickerRows.length ? html : `<div class="empty-note">${pickerCfg.empty || 'Nothing here.'}</div>`;
  }
  function openPicker(cfg) { pickerCfg = cfg; pickerRow = 0; pickerHintEl.textContent = cfg.hint || '↑ ↓ select · tap · ↑↓↑↓ leave'; pickerEl.classList.remove('hidden'); renderPicker(); }
  function closePicker() { pickerEl.classList.add('hidden'); pickerCfg = null; }
  function pickerMove(dir) { if (!pickerRows.length) return; pickerRow = (pickerRow + dir + pickerRows.length) % pickerRows.length; renderPicker(); const s = pickerBodyEl.querySelector('.row.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }
  function pickerSelect() { const r = pickerRows[pickerRow]; if (r && pickerCfg) pickerCfg.onSelect(r); renderPicker(); }

  // ---- dialogue ----
  function showDialogue() { els.dialogue.classList.remove('hidden'); }
  function hideDialogue() { els.dialogue.classList.add('hidden'); }
  function renderDialogue(speaker, text, choices, idx) {
    els.dlgSpeaker.textContent = speaker;
    els.dlgText.textContent = text;
    els.dlgChoices.innerHTML = choices.map((c, i) => {
      const label = typeof c.label === 'function' ? c.label(G) : c.label;
      const tag = c.tag ? `<span class="tag">${c.tag}</span>` : '';
      return `<div class="choice ${i === idx ? 'sel' : ''}">${tag}${label}</div>`;
    }).join('');
    els.dlgHint.textContent = choices.length > 1 ? 'tap select  ·  ◂ ▸ choose  ·  ↑↓↑↓ end' : 'tap continue  ·  ↑↓↑↓ end';
  }

  const api = {
    menuOpen: false,
    setCompass, setHealth, setLocation, setPrayer, setQuestArrow, showPrompt, hidePrompt, toast, updateMarkers, updateMinimap, setMinimapVisible,
    hitsplat, xpDrop, levelBanner,
    openMenu, closeMenu, menuTab, menuMove, menuSelect,
    openPicker, closePicker, pickerMove, pickerSelect,
    showDialogue, hideDialogue, renderDialogue,
  };
  return api;
}
