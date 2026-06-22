import * as THREE from 'three';

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
    els.menuBody.innerHTML = `<div class="section-head">Skills &nbsp;·&nbsp; Total Lv ${G.skills.total()}</div>` + html;
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
    const R = 58, S = 300, c = S / 2, sc = (S * 0.46) / R;
    const to = (x, z) => [c + x * sc, c + z * sc];
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = '#0a2b30'; ctx.beginPath(); ctx.arc(c, c, R * sc + 8, 0, 7); ctx.fill();
    ctx.fillStyle = '#2f7d4a'; ctx.beginPath(); ctx.arc(c, c, R * sc, 0, 7); ctx.fill();
    let [px, pz] = to(0, -34); ctx.fillStyle = '#9aa6b2'; ctx.beginPath(); ctx.arc(px, pz, 15, 0, 7); ctx.fill();
    let [vx, vz] = to(G.world.village.x, G.world.village.z); ctx.fillStyle = '#ffd45f'; ctx.fillRect(vx - 5, vz - 5, 10, 10);
    ctx.fillStyle = '#5fe3ff'; G.entities.npcs.forEach((n) => { const [x, y] = to(n.pos.x, n.pos.z); ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#ff6b6b'; G.entities.enemies.forEach((e) => { if (!e.alive) return; const [x, y] = to(e.pos.x, e.pos.z); ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); });
    const [hx, hy] = to(G.player.position.x, G.player.position.z);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.PI - G.player.state.heading);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

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
    openMenu, closeMenu, menuTab, menuMove, menuSelect,
    showDialogue, hideDialogue, renderDialogue,
  };
  return api;
}
