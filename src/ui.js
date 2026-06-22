import * as THREE from 'three';
import { ITEMS, SHOP } from './content.js';

const TABS = ['Inventory', 'Skills', 'Quests', 'Map'];

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
      el.className = 'marker ' + m.kind + (m.far ? ' far' : '');
      el.innerHTML = (m.pip ? `<span class="pip">${m.pip}</span>` : '') + (m.label ? `<span class="label">${m.label}</span>` : '');
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
    ({ Inventory: renderInventory, Skills: renderSkills, Quests: renderQuests, Map: renderMap })[TABS[tab]]();
  }
  function rowCount() { return TABS[tab] === 'Inventory' ? G.inventory.list().length : 0; }
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
    }
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
    const html = G.skills.DEFS.map((d) => {
      const lv = G.skills.level(d.key), pr = Math.round(G.skills.progress(d.key) * 100), tn = G.skills.toNext(d.key);
      return `<div class="row"><span class="row-icon">${d.icon}</span><div class="row-main"><div class="row-title">${d.name} <span style="color:var(--gold)">Lv ${lv}</span></div><div class="skillbar"><span style="width:${pr}%"></span></div><div class="row-sub">${tn} xp to next level</div></div></div>`;
    }).join('');
    const wn = G.weaponName ? G.weaponName() : '';
    els.menuBody.innerHTML = `<div class="section-head">Total Lv ${G.skills.total()} &nbsp;·&nbsp; ⚔️ Combat ${G.skills.level('combat')} &nbsp;·&nbsp; 🗡️ ${wn}</div>` + html;
  }
  function npcName(key) { const n = G.entities.npcs.find((x) => x.def.key === key); return n ? n.def.name : key; }
  function renderQuests() {
    const all = G.quests.all();
    const sect = (label, arr, fn) => arr.length ? `<div class="section-head">${label}</div>` + arr.map(fn).join('') : '';
    const active = (q) => {
      const objs = G.quests.objectives(q.id).map((o) => `<div class="obj ${o.done ? 'done' : ''}"><span class="box">${o.done ? '☑' : '☐'}</span>${o.text}</div>`).join('');
      return `<div class="row"><div class="row-main"><div class="row-title">${q.def.name}</div><div class="row-sub">${q.def.desc}</div>${objs}</div></div>`;
    };
    let html = sect('Active', all.filter((q) => q.status === 'active'), active);
    html += sect('Available', all.filter((q) => q.status === 'available'), (q) => `<div class="row"><div class="row-main"><div class="row-title">${q.def.name}</div><div class="row-sub">See ${npcName(q.def.giver)} &nbsp;·&nbsp; ${q.def.desc}</div></div></div>`);
    html += sect('Completed', all.filter((q) => q.status === 'complete'), (q) => `<div class="row" style="opacity:.55"><div class="row-main"><div class="row-title">✓ ${q.def.name}</div></div></div>`);
    els.menuBody.innerHTML = html || `<div class="empty-note">No quests yet. Speak with the villagers around the hearth.</div>`;
  }
  function renderMap() {
    els.menuBody.innerHTML = `<div class="section-head">Verdant Isle</div><canvas id="mapCanvas" width="300" height="300"></canvas>`;
    drawMap(document.getElementById('mapCanvas').getContext('2d'));
  }
  function drawMap(ctx) {
    const S = 300, cx = 54, cz = 3, sc = (S * 0.46) / 110;
    const to = (x, z) => [S / 2 + (x - cx) * sc, S / 2 + (z - cz) * sc];
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = '#08222a'; ctx.fillRect(0, 0, S, S);
    const b = G.world.bridge; const [bx1, bz1] = to(b.ax, b.az), [bx2, bz2] = to(b.bx, b.bz);
    ctx.strokeStyle = '#cdb98a'; ctx.lineWidth = Math.max(3, b.halfW * 2 * sc); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx1, bz1); ctx.lineTo(bx2, bz2); ctx.stroke();
    G.world.isles.forEach((isle, i) => { const [x, y] = to(isle.x, isle.z); ctx.fillStyle = i === 0 ? '#2f7d4a' : '#9c5a34'; ctx.beginPath(); ctx.arc(x, y, isle.r * sc, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#aab2bd'; G.world.peaks.forEach((pk) => { const [x, y] = to(pk.x, pk.z); ctx.beginPath(); ctx.arc(x, y, Math.max(5, pk.r * sc * 0.5), 0, 7); ctx.fill(); });
    ctx.fillStyle = '#ffd45f'; G.world.villages.forEach((v) => { const [x, y] = to(v.x, v.z); ctx.fillRect(x - 4, y - 4, 8, 8); });
    ctx.fillStyle = '#5fe3ff'; G.entities.npcs.forEach((n) => { const [x, y] = to(n.pos.x, n.pos.z); ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); });
    G.entities.enemies.forEach((e) => { if (!e.alive) return; const [x, y] = to(e.pos.x, e.pos.z); ctx.fillStyle = e.def.boss ? '#ff3a2a' : '#ff6b6b'; ctx.beginPath(); ctx.arc(x, y, e.def.boss ? 5 : 2.2, 0, 7); ctx.fill(); });
    const [hx, hy] = to(G.player.position.x, G.player.position.z);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.PI - G.player.state.heading);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---- shop ----
  const shopEl = document.createElement('div'); shopEl.id = 'shop'; shopEl.className = 'overlay hidden';
  shopEl.innerHTML = '<div class="panel"><div class="tabs"><div class="tab sel" style="flex:2">Trader Pell</div><div class="tab" id="shopGold">🪙 0</div></div><div class="menu-body" id="shopBody"></div><div class="hint">↑ ↓ select &nbsp;·&nbsp; tap buy / sell &nbsp;·&nbsp; double-tap leave</div></div>';
  app.appendChild(shopEl);
  const shopGoldEl = shopEl.querySelector('#shopGold');
  const shopBodyEl = shopEl.querySelector('#shopBody');
  let shopRow = 0, shopRows = [];
  function renderShop() {
    shopGoldEl.textContent = '🪙 ' + G.inventory.count('gold');
    shopRows = SHOP.stock.map((s) => ({ type: 'buy', key: s.key, price: s.price }));
    G.inventory.list().filter((it) => SHOP.sell[it.key]).forEach((it) => shopRows.push({ type: 'sell', key: it.key, price: SHOP.sell[it.key], count: it.count }));
    if (shopRow >= shopRows.length) shopRow = Math.max(0, shopRows.length - 1);
    let html = '<div class="section-head">Buy</div>';
    shopRows.forEach((r, i) => {
      if (r.type === 'sell' && (i === 0 || shopRows[i - 1].type === 'buy')) html += '<div class="section-head">Sell (one)</div>';
      const d = ITEMS[r.key];
      const right = r.type === 'buy' ? `🪙 ${r.price}` : `🪙 ${r.price} · ×${r.count}`;
      html += `<div class="row ${i === shopRow ? 'sel' : ''}"><span class="row-icon">${d.icon}</span><div class="row-main"><div class="row-title">${d.name}</div><div class="row-sub">${r.type === 'buy' ? 'tap to buy' : 'tap to sell'}</div></div><div class="row-trail">${right}</div></div>`;
    });
    shopBodyEl.innerHTML = html;
  }
  function openShop() { shopRow = 0; shopEl.classList.remove('hidden'); renderShop(); }
  function closeShop() { shopEl.classList.add('hidden'); }
  function shopMove(dir) { if (!shopRows.length) return; shopRow = (shopRow + dir + shopRows.length) % shopRows.length; renderShop(); const s = shopBodyEl.querySelector('.row.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }
  function shopSelect() { const r = shopRows[shopRow]; if (!r) return; if (r.type === 'buy') G.buyItem(r.key); else G.sellItem(r.key); renderShop(); }

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
    els.dlgHint.textContent = choices.length > 1 ? 'tap select  ·  ◂ ▸ choose  ·  double-tap end' : 'tap continue  ·  double-tap end';
  }

  const api = {
    menuOpen: false,
    setCompass, setHealth, setLocation, showPrompt, hidePrompt, toast, updateMarkers,
    hitsplat, xpDrop, levelBanner,
    openMenu, closeMenu, menuTab, menuMove, menuSelect,
    openShop, closeShop, shopMove, shopSelect,
    showDialogue, hideDialogue, renderDialogue,
  };
  return api;
}
