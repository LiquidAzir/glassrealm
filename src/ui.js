import * as THREE from 'three';
import { ITEMS, SHOP, PRAYERS, SPELLS, ACHIEVEMENTS, ENEMIES, WEAKNESS, ATK_STYLE, AUTO_MODES } from './content.js';
import { createMinimap } from './minimap.js';
import { questNpcName } from './quest-guidance.js';

const TABS = ['Inventory', 'Gear', 'Skills', 'Prayer', 'Spells', 'Quests', 'Auto', 'Pets', 'Mastery', 'Diary', 'Bestiary', 'Log', 'Tasks', 'Map'];

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
    // World heading zero faces +Z (south); the compass is clockwise from north.
    const deg = ((180 - heading * 180 / Math.PI) % 360 + 360) % 360;
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
  const specBar = document.createElement('div'); specBar.className = 'bar spec-bar';
  specBar.innerHTML = '<span class="bar-fill" id="specFill"></span><span class="bar-label" id="specLabel">⚡</span>';
  document.getElementById('vitals').insertBefore(specBar, els.loc);
  const specFill = specBar.querySelector('#specFill'); specFill.style.background = 'linear-gradient(90deg,#ffb02e,#ffe066)';
  const specLabel = specBar.querySelector('#specLabel');
  function setSpec(cur) { const v = Math.max(0, Math.min(100, cur)); specFill.style.width = v + '%'; specLabel.textContent = v >= 100 ? '⚡ SPEC!' : `⚡ ${Math.round(v)}`; }

  // quest guidance arrow (points toward current objective, relative to facing)
  const questGuide = document.createElement('div'); questGuide.id = 'questGuide'; questGuide.className = 'hidden';
  questGuide.innerHTML = '<svg class="qg-arrow" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 2.5 L12 21.5 M12 2.5 L5 10 M12 2.5 L19 10" fill="none" stroke="#8fd0ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="qg-label"></span><span class="qg-distance"></span>';
  document.getElementById('hud').appendChild(questGuide);
  const qgArrow = questGuide.querySelector('.qg-arrow'), qgLabel = questGuide.querySelector('.qg-label'), qgDistance = questGuide.querySelector('.qg-distance');
  function setQuestArrow(rad, label, dist) {
    if (rad == null) { questGuide.classList.add('hidden'); return; }
    questGuide.classList.remove('hidden');
    // World bearings increase counterclockwise from the player's view, whereas
    // CSS rotation is clockwise. A target to the left must point left.
    qgArrow.style.transform = `rotate(${-rad}rad)`;
    qgLabel.textContent = label; qgLabel.title = label;
    qgDistance.textContent = dist != null ? `${dist}m` : '';
  }

  // minimap (top-right) — a live local map centred on the player
  const minimap = document.createElement('canvas'); minimap.id = 'minimap'; minimap.width = 116; minimap.height = 116;
  document.getElementById('hud').appendChild(minimap);
  const localMap = createMinimap(G, minimap);
  function setMinimapVisible(on) { localMap.setVisible(on); }

  // gathering channel progress bar (bottom-centre)
  const channelEl = document.createElement('div'); channelEl.id = 'channelBar'; channelEl.className = 'hidden';
  channelEl.innerHTML = '<span class="ch-label"></span><span class="ch-track"><span class="ch-fill"></span></span>';
  document.getElementById('hud').appendChild(channelEl);
  const chLabel = channelEl.querySelector('.ch-label'), chFill = channelEl.querySelector('.ch-fill');
  function setChannel(frac, label) { const changed = channelEl.classList.contains('hidden') || chLabel.textContent !== label; channelEl.classList.remove('hidden'); chLabel.textContent = label; chFill.style.width = Math.round(frac * 100) + '%'; if (changed && latestMarkers.length) updateMarkers(latestMarkers); }
  function hideChannel() { channelEl.classList.add('hidden'); }
  function showPrompt(t) { const text = t.replace(/^Use Enter /, 'Enter '); if (els.promptText.textContent !== text) els.promptText.textContent = text; els.prompt.classList.remove('hidden'); }
  function hidePrompt() { els.prompt.classList.add('hidden'); }
  // One readable notification at a time; bursts queue instead of covering the
  // village with four overlapping cards. This changes presentation only.
  const toastQueue = [];
  let activeToast = null, toastTimer = 0;
  function nextToast() {
    if (activeToast && activeToast.el.isConnected) return;
    activeToast = null;
    const item = toastQueue.shift(); if (!item) return;
    const d = document.createElement('div');
    d.className = 'toast ' + item.type; d.textContent = item.text;
    els.toasts.replaceChildren(d); activeToast = { ...item, el: d };
    if (latestMarkers.length) updateMarkers(latestMarkers);
    toastTimer = setTimeout(() => {
      d.classList.add('out');
      toastTimer = setTimeout(() => { d.remove(); activeToast = null; nextToast(); }, 200);
    }, item.ms);
  }
  function toast(text, type = '', ms = 2400) {
    if (activeToast && !activeToast.el.isConnected) { clearTimeout(toastTimer); activeToast = null; }
    if ((activeToast && activeToast.text === text) || toastQueue.some(t => t.text === text)) return;
    if (type === 'bad' && activeToast && activeToast.type !== 'bad') { clearTimeout(toastTimer); activeToast.el.remove(); activeToast = null; }
    const item = { text, type, ms: Math.max(1200, Math.min(ms, 7000)) };
    if (type === 'bad') toastQueue.unshift(item); else toastQueue.push(item);
    if (toastQueue.length > 6) toastQueue.splice(type === 'bad' ? 6 : 0, 1);
    nextToast();
  }

  // ---- 3D-projected markers ----
  const markerPool = new Map();
  const measure = document.createElement('canvas').getContext('2d');
  const previousLabels = new Map();
  let latestMarkers = [];
  const actorHeads = new WeakMap(), headCenter = new THREE.Vector3(), headEdge = new THREE.Vector3();
  let indoorHeadStamp = null, indoorHeads = [];
  let labelInfo = { visible: [], hidden: [], reserved: [] };
  const overlaps = (a, b) => a.x < b.x + b.w + 4 && a.x + a.w + 4 > b.x && a.y < b.y + b.h + 4 && a.y + a.h + 4 > b.y;
  const uiBlocks = ['vitals', 'compass', 'minimap', 'questGuide', 'tcToggle', 'channelBar', 'prompt', 'toasts', 'autoTag', 'levelBanner', 'xpdrops'];
  function worldOverlayOpen() { return ['menu', 'shop', 'dialogue', 'syncPanel'].some(id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); }); }
  function hideWorldLabels() { els.markers.classList.add('hidden'); bubbleLayer.classList.add('hidden'); els.prompt.classList.remove('target-labeled'); }
  function reservedLabelRects() {
    const appRect = document.getElementById('app').getBoundingClientRect(), scale = appRect.width / 600;
    const blocked = [];
    const add = e => {
      if (!e || e.classList.contains('hidden') || !e.getClientRects().length) return;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
      blocked.push({ x: (r.x - appRect.x) / scale - 5, y: (r.y - appRect.y) / scale - 5, w: r.width / scale + 10, h: r.height / scale + 10 });
    };
    uiBlocks.forEach(id => add(document.getElementById(id)));
    if (document.body.classList.contains('controls-on')) document.querySelectorAll('#touchPad .tcbtn').forEach(add);
    // Keep the hero silhouette clear even when the scene is crowded.
    const p = G.player.position, head = project(p.x, p.y + 2.45, p.z), feet = project(p.x, p.y, p.z);
    if (head && feet) blocked.push({ x: Math.min(head.x, feet.x) - 20, y: Math.min(head.y, feet.y) - 6, w: Math.abs(head.x - feet.x) + 40, h: Math.abs(head.y - feet.y) + 12 });
    const reserveHead = mesh => {
      for (let n = mesh; n; n = n.parent) if (!n.visible) return;
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      mesh.updateWorldMatrix(true, false);
      headCenter.copy(mesh.geometry.boundingSphere.center).applyMatrix4(mesh.matrixWorld);
      const s = project(headCenter.x, headCenter.y, headCenter.z);
      if (!s || s.x < 0 || s.x > 600 || s.y < 0 || s.y > 600) return;
      if (!G.inInterior && G.world.isLabelOccluded && G.world.isLabelOccluded(G.engine.camera.position, headCenter)) return;
      const e = mesh.matrixWorld.elements, radius = mesh.geometry.boundingSphere.radius * Math.max(Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10]));
      const cam = G.engine.camera.matrixWorld.elements;
      headEdge.set(cam[0], cam[1], cam[2]).multiplyScalar(radius).add(headCenter);
      const right = project(headEdge.x, headEdge.y, headEdge.z);
      headEdge.set(cam[4], cam[5], cam[6]).multiplyScalar(radius).add(headCenter);
      const up = project(headEdge.x, headEdge.y, headEdge.z);
      if (!right || !up) return;
      const rx = Math.max(7, Math.abs(right.x - s.x)) + 3, ry = Math.max(7, Math.abs(up.y - s.y)) + 3;
      blocked.push({ x: s.x - rx, y: s.y - ry, w: rx * 2, h: ry * 2 });
    };
    if (G.inInterior) {
      if (indoorHeadStamp !== G.interiorStations) {
        indoorHeadStamp = G.interiorStations; indoorHeads = [];
        G.engine.scene.traverseVisible(mesh => { if (mesh.isMesh && mesh.name === 'Blender hero_head') indoorHeads.push(mesh); });
      }
      indoorHeads.forEach(reserveHead);
    } else {
      indoorHeadStamp = null;
      for (const actor of [...(G.entities.npcs || []), ...(G.entities.mobs || [])]) {
        if (!actor.group || Math.abs(actor.pos.x - p.x) > 32 || Math.abs(actor.pos.z - p.z) > 32) continue;
        let heads = actorHeads.get(actor.group);
        if (!heads) { heads = []; actor.group.traverse(mesh => { if (mesh.isMesh && mesh.name === 'Blender hero_head') heads.push(mesh); }); actorHeads.set(actor.group, heads); }
        heads.forEach(reserveHead);
      }
    }
    return blocked;
  }
  function markerSize(m) {
    measure.font = m.target ? '700 12px "Segoe UI",sans-serif' : '600 11px "Segoe UI",sans-serif';
    const labelWidth = measure.measureText(m.label || '').width;
    measure.font = '700 10px "Segoe UI",sans-serif';
    const healthWidth = m.health == null ? 0 : measure.measureText(m.health + ' HP').width + 5;
    measure.font = '600 10px "Segoe UI",sans-serif';
    const pipWidth = m.action ? 32 : m.pip ? Math.max(16, measure.measureText(m.pip).width) : 0;
    return { w: Math.min(m.target ? 238 : 176, Math.ceil(Math.max(24, labelWidth + (pipWidth ? pipWidth + 5 : 0) + healthWidth + 20))), h: m.target ? 28 : 22 };
  }
  function updateMarkers(list) {
    latestMarkers = list;
    if (worldOverlayOpen()) { hideWorldLabels(); labelInfo = { visible: [], hidden: [], reserved: [], overlay: true }; return; }
    els.markers.classList.remove('hidden'); bubbleLayer.classList.remove('hidden');
    const blocked = reservedLabelRects(), occupied = blocked.slice(), candidates = [], visible = [], hidden = [];
    for (const el of markerPool.values()) el.style.display = 'none';
    for (const b of bubbles) b.el.style.display = 'none';
    const target = list.find(m => m.target);
    for (const m of list) {
      const s = project(m.x, m.y, m.z);
      if (!s || s.x < 8 || s.x > 592 || s.y < 8 || s.y > 592) { hidden.push({ id: m.id, reason: 'offscreen' }); continue; }
      if (!G.inInterior && G.world.isLabelOccluded && G.world.isLabelOccluded(G.engine.camera.position, m)) { hidden.push({ id: m.id, reason: 'occluded' }); continue; }
      if (m.kind === 'questguide' && target && Math.hypot(m.x - target.x, m.z - target.z) < 2.6) continue;
      const sz = markerSize(m), recent = previousLabels.get(m.id);
      candidates.push({ ...m, ...sz, sx: s.x, sy: s.y - 8, priority: (m.priority || 0) + (recent ? 7 : 0), previous: recent });
    }
    for (const b of bubbles) {
      if (target && b.owner === target.sourceId) continue;
      const s = project(b.anchor.x, b.anchor.y + b.yOff, b.anchor.z);
      if (!s || s.x < 8 || s.x > 592 || s.y < 8 || s.y > 592) continue;
      const point = { x: b.anchor.x, y: b.anchor.y + b.yOff, z: b.anchor.z };
      if (!G.inInterior && G.world.isLabelOccluded && G.world.isLabelOccluded(G.engine.camera.position, point)) continue;
      candidates.push({ id: 'bubble_' + b.owner, kind: 'bubble', bubble: b, w: b.w, h: b.h, sx: s.x, sy: s.y - 8, priority: 340 - Math.hypot(b.anchor.x - G.player.position.x, b.anchor.z - G.player.position.z), previous: previousLabels.get('bubble_' + b.owner) });
    }
    candidates.sort((a, b) => b.priority - a.priority || String(a.id).localeCompare(String(b.id)));
    let bubbleCount = 0, targetPlaced = false;
    const acceptedOwners = new Set(), nextPositions = new Map();
    for (const c of candidates) {
      if (visible.length >= 5 || (c.bubble && bubbleCount >= 1) || (c.sourceId && acceptedOwners.has(c.sourceId))) { hidden.push({ id: c.id, reason: 'budget' }); continue; }
      const offsets = c.target ? [[0, 0], [0, 14], [0, -30], [0, -60], [-36, -24], [36, -24]] : [[0, 0], [0, -26]];
      // Ordinary names keep their last safe offset. The selected action returns
      // to its natural anchor as soon as it is clear, so orbiting the camera
      // cannot leave an old shifted plate floating over a shopkeeper's face.
      if (c.previous) { if (c.target) offsets.splice(1, 0, c.previous); else offsets.unshift(c.previous); }
      let rect = null, chosen = null;
      for (const [dx, dy] of offsets) {
        const r = { x: c.sx + dx - c.w / 2, y: c.sy + dy - c.h, w: c.w, h: c.h };
        if (r.x < 8 || r.y < 8 || r.x + r.w > 592 || r.y + r.h > 592 || occupied.some(b => overlaps(r, b))) continue;
        rect = r; chosen = [dx, dy]; break;
      }
      if (!rect) { hidden.push({ id: c.id, reason: 'collision' }); continue; }
      let el;
      if (c.bubble) { el = c.bubble.el; bubbleCount++; acceptedOwners.add(c.bubble.owner); }
      else {
        el = markerPool.get(c.id);
        if (!el) { el = document.createElement('div'); el.innerHTML = '<span class="pip"></span><span class="label"></span><span class="health"></span>'; els.markers.appendChild(el); markerPool.set(c.id, el); }
        const cls = 'marker ' + c.kind + (c.target ? ' target' : '') + (c.far ? ' far' : '');
        if (el.className !== cls) el.className = cls;
        const pip = c.action ? 'TAP' : c.pip || '';
        if (el._pip !== pip) { el.firstChild.textContent = pip; el.firstChild.classList.toggle('hidden', !pip); el._pip = pip; }
        if (el._label !== c.label) { el.children[1].textContent = c.label || ''; el._label = c.label; }
        const hpText = c.health == null ? '' : c.health + ' HP';
        if (el._health !== hpText) { el.lastChild.textContent = hpText; el.lastChild.classList.toggle('hidden', !hpText); el._health = hpText; }
        if (c.target && c.action) targetPlaced = true;
        if (c.sourceId) acceptedOwners.add(c.sourceId);
      }
      el.dataset.labelId = c.id; el.style.display = ''; el.style.left = rect.x + 'px'; el.style.top = rect.y + 'px'; el.style.width = rect.w + 'px'; el.style.height = rect.h + 'px';
      if (c.bubble) el.style.opacity = String(Math.min(1, c.bubble.t / .2, (c.bubble.dur - c.bubble.t) / .5));
      occupied.push(rect); visible.push({ id: c.id, kind: c.kind, target: !!c.target, ...rect }); nextPositions.set(c.id, chosen);
    }
    previousLabels.clear(); nextPositions.forEach((p, id) => previousLabels.set(id, p));
    els.prompt.classList.toggle('target-labeled', targetPlaced);
    labelInfo = { visible, hidden, reserved: blocked, limit: 5 };
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
    if (!Number.isFinite(projv.x) || projv.z > 1 || projv.z < -1) return null;
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
    while (xpLayer.children.length > 3) xpLayer.firstChild.remove();
    if (latestMarkers.length) updateMarkers(latestMarkers);
  }
  function levelBanner(text) {
    banner.textContent = text; banner.classList.remove('hidden', 'show'); void banner.offsetWidth; banner.classList.add('show');
    clearTimeout(bannerT); bannerT = setTimeout(() => banner.classList.add('hidden'), 2800);
    if (latestMarkers.length) updateMarkers(latestMarkers);
  }

  // ---- NPC speech bubbles: ambient barks + overheard conversations, projected above heads ----
  const bubbleLayer = document.createElement('div'); bubbleLayer.id = 'bubbles'; app.appendChild(bubbleLayer);
  if (!document.getElementById('bubbleCSS')) {
    const st = document.createElement('style'); st.id = 'bubbleCSS';
    st.textContent = '#bubbles{position:absolute;inset:0;pointer-events:none;z-index:6}'
      + '.bubble{position:absolute;transform:translate(-50%,-100%);max-width:190px;padding:3px 8px;'
      + 'font:600 12px/1.25 system-ui,sans-serif;color:#eafaff;background:rgba(8,16,24,.62);'
      + 'border:1px solid rgba(155,242,255,.45);border-radius:9px;text-align:center;'
      + 'text-shadow:0 1px 2px #000;box-shadow:0 0 10px rgba(0,0,0,.5)}'
      + '.bubble.chat{border-color:rgba(255,212,95,.55);color:#fff3d6}'
      + '.bubble::after{content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);'
      + 'border:5px solid transparent;border-top-color:rgba(8,16,24,.62)}';
    document.head.appendChild(st);
  }
  const bubbles = [];
  // anchor is a live {x,y,z} (e.g. an NPC's group.position) so the bubble follows a mover; owner de-dupes (one bubble per speaker)
  function sayAt(anchor, text, dur = 3.2, opts = {}) {
    if (!anchor) return;
    let b = opts.owner != null ? bubbles.find((x) => x.owner === opts.owner) : null;
    if (!b) {
      if (bubbles.length >= 4) { const old = bubbles.shift(); old.el.remove(); }
      const el = document.createElement('div'); bubbleLayer.appendChild(el);
      b = { el, owner: opts.owner }; bubbles.push(b);
    }
    b.anchor = anchor; b.yOff = opts.yOff != null ? opts.yOff : 2.7; b.t = 0; b.dur = dur;
    b.el.className = 'bubble' + (opts.chat ? ' chat' : ''); b.el.textContent = text; b.el.style.opacity = '0';
    measure.font = '600 12px "Segoe UI",sans-serif';
    let lines = 1, line = '';
    for (const word of text.split(/\s+/)) { const next = line ? line + ' ' + word : word; if (measure.measureText(next).width > 164 && line) { lines++; line = word; } else line = next; }
    b.w = 180; b.h = Math.min(3, lines) * 16 + 12;
  }
  function updateBubbles(dt) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]; b.t += dt;
      if (b.t >= b.dur) { b.el.remove(); bubbles.splice(i, 1); continue; }
      // Projection and placement share the nameplate collision pass (~30Hz).
    }
  }
  function clearBubbles() { for (const b of bubbles) b.el.remove(); bubbles.length = 0; }

  // ---- menu ----
  let tab = 0, row = 0;
  function syncTabs() {   // keep the tab strip built once, then just move the highlight + scroll it to centre (so it doesn't reset scroll every render)
    if (els.menuTabs.children.length !== TABS.length) els.menuTabs.innerHTML = TABS.map((t) => `<div class="tab">${t}</div>`).join('');
    const kids = els.menuTabs.children;
    for (let i = 0; i < kids.length; i++) kids[i].classList.toggle('sel', i === tab);
    const sel = kids[tab];
    if (sel) els.menuTabs.scrollLeft = sel.offsetLeft - (els.menuTabs.clientWidth - sel.offsetWidth) / 2;   // CSS scroll-behavior:smooth animates the shift so the active tab glides to centre
  }
  function renderMenu() {
    row = Math.max(0, Math.min(row, rowCount() - 1));
    syncTabs();
    ({ Inventory: renderInventory, Gear: renderGear, Skills: renderSkills, Prayer: renderPrayer, Spells: renderSpells, Quests: renderQuests, Auto: renderAuto, Pets: renderPets, Mastery: renderMastery, Diary: renderDiary, Bestiary: renderBestiary, Log: renderLog, Tasks: renderTasks, Map: renderMap })[TABS[tab]]();
  }
  function rowCount() {
    if (TABS[tab] === 'Inventory') return G.inventory.list().length;
    if (TABS[tab] === 'Gear') return gearRows().length;
    if (TABS[tab] === 'Prayer') return PRAYERS.length;
    if (TABS[tab] === 'Spells') return SPELLS.length;
    if (TABS[tab] === 'Skills') return 4 + G.skills.DEFS.length;
    if (TABS[tab] === 'Quests') return G.quests.all().filter((q) => q.status !== 'locked').length;   // active + available + completed — all scrollable (select only acts on actives)
    if (TABS[tab] === 'Bestiary') return Object.keys(ENEMIES).length;
    if (TABS[tab] === 'Log') return Object.keys(ITEMS).filter((k) => ({ weapon: 1, armor: 1, amulet: 1, ring: 1, shield: 1 })[ITEMS[k].type]).length;
    if (TABS[tab] === 'Auto') return AUTO_MODES.length;
    if (TABS[tab] === 'Pets') return G.petRows().length;
    if (TABS[tab] === 'Mastery') return G.masteryRows().length + G.perkRows().length;
    if (TABS[tab] === 'Diary') return (G.controls && G.controls.touchUIAvailable) ? 8 : 7;
    if (TABS[tab] === 'Tasks') return G.diaryRows().length;
    return 0;
  }
  function openMenu() { api.menuOpen = true; els.menu.classList.remove('hidden'); hideWorldLabels(); clearBubbles(); row = 0; renderMenu(); els.menuBody.scrollTop=0; }
  function closeMenu() { api.menuOpen = false; els.menu.classList.add('hidden'); }
  function menuTab(dir) { tab = (tab + dir + TABS.length) % TABS.length; row = 0; renderMenu(); els.menuBody.scrollTop=0; }
  function menuMove(dir) {
    const n = rowCount();
    if (n > 0) { row = (row + dir + n) % n; renderMenu(); const s = els.menuBody.querySelector('.row.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }
    else els.menuBody.scrollBy(0, dir * 70);
  }
  function menuSelect() {
    if (TABS[tab] === 'Inventory') {
      const it = G.inventory.list()[row];
      if (it && (it.def.type === 'consumable' || it.def.type === 'potion' || it.def.type === 'clue')) { G.useItem(it.key); renderMenu(); }
      else if (it && G.canLightFire && G.canLightFire(it.key)) { G.lightFire(it.key); }   // logs → Firemaking (lightFire closes the menu itself)
    } else if (TABS[tab] === 'Gear') {
      const r = gearRows()[row]; if (r) { G.equipChoice(r); renderMenu(); }
    } else if (TABS[tab] === 'Prayer') {
      const pr = PRAYERS[row]; if (pr) { G.togglePrayer(pr.key); renderMenu(); }
    } else if (TABS[tab] === 'Spells') {
      const s = SPELLS[row]; if (s) G.castSpell(s.key);
    } else if (TABS[tab] === 'Skills') {
      if (row < 4) { G.setCombatStance(STANCE_KEYS[row]); renderMenu(); }
      else { const d = G.skills.DEFS[row - 4]; if (d && G.skills.canPrestige(d.key)) { G.prestigeSkill(d.key); renderMenu(); } }
    } else if (TABS[tab] === 'Quests') {
      const act = G.quests.all().filter((q) => q.status === 'active'); const q = act[row];
      if (q) { G.trackQuest(q.id); renderMenu(); }
    } else if (TABS[tab] === 'Auto') {
      const m = AUTO_MODES[row]; if (m && G.setAutoplay) { G.setAutoplay(m.key); renderMenu(); }
    } else if (TABS[tab] === 'Pets') {
      const r = G.petRows()[row]; if (r) { G.setActivePet(r.kind); renderMenu(); }
    } else if (TABS[tab] === 'Mastery') {
      const mr = G.masteryRows();
      if (row < mr.length) { const r = mr[row]; if (r && r.hasCape) { G.wearCape(r.key); renderMenu(); } }
      else { const r = G.perkRows()[row - mr.length]; if (r) { G.buyPerk(r.key); renderMenu(); } }
    } else if (TABS[tab] === 'Diary') {
      if (row === 0 && G.audio) { G.audio.toggleMuted(); G.save.save(); renderMenu(); }
      else if (row === 1 && G.requestRestart) G.requestRestart();
      else if (row === 2 && G.exportSave) G.exportSave();
      else if (row === 3 && G.importSave) G.importSave();
      else if (row === 4 && G.copySyncLink) G.copySyncLink();
      else if (row === 5 && G.cycleDeathMode) { G.cycleDeathMode(); renderMenu(); }
      else if (row === 6 && G.unstuck) { G.unstuck(); }
      else if (row === 7 && G.controls && G.controls.touchUIAvailable) { G.controls.toggleTouchUI(); renderMenu(); }
    } else if (TABS[tab] === 'Tasks') {
      const r = G.diaryRows()[row]; if (r && r.ready) { G.diaryClaim(r.region, r.tierIdx); renderMenu(); }
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
    rows.push({ kind: 'unequipS', label: 'No shield' });
    G.inventory.list().filter((it) => it.def.type === 'shield').forEach((it) => rows.push({ kind: 'shield', key: it.key }));
    return rows;
  }
  function renderGear() {
    const eq = G.player.state.equipment;
    const gb = G.gearBonus ? G.gearBonus() : { def: 0, melee: 0, ranged: 0, magic: 0, maxhp: 0 };
    const ws = G.wornSet && G.wornSet();
    const setTxt = ws ? (ws.count >= ws.size ? `<span style="color:var(--gold)">✦ ${ws.name} set! (${ws.count}/${ws.size})</span>` : `<span style="color:var(--text-mut)">${ws.name} set ${ws.count}/${ws.size}</span>`) : '';
    const rows = gearRows();
    let html = `<div class="section-head">⚔️${gb.melee} 🏹${gb.ranged} 🪄${gb.magic} 🛡️${gb.def} ❤️+${gb.maxhp}${setTxt ? ` &nbsp;·&nbsp; ${setTxt}` : ''}</div>`;
    rows.forEach((r, i) => {
      const d = r.key ? ITEMS[r.key] : null;
      const equipped = (r.kind === 'weapon' && eq.weapon === r.key) || (r.kind === 'armor' && eq.armor === r.key) || (r.kind === 'amulet' && eq.amulet === r.key) || (r.kind === 'ring' && eq.ring === r.key) || (r.kind === 'shield' && eq.shield === r.key) || (r.kind === 'unequipW' && !eq.weapon) || (r.kind === 'unequipA' && !eq.armor) || (r.kind === 'unequipAm' && !eq.amulet) || (r.kind === 'unequipR' && !eq.ring) || (r.kind === 'unequipS' && !eq.shield);
      const icon = d ? d.icon : (r.kind === 'unequipW' ? '✊' : '🚫');
      const title = d ? d.name : r.label;
      let sub;
      if (!d) sub = 'tap to unequip';
      else if (d.type === 'weapon') sub = `${d.style} · +${d.bonus} dmg`;
      else if (d.type === 'armor') sub = `armor · -${d.defense} dmg${d.set ? ' · ' + d.set : ''}`;
      else if (d.type === 'shield') sub = `shield · -${d.defense} dmg`;
      else sub = Object.keys(d.bonus || {}).map((k) => `+${d.bonus[k]} ${k}`).join(', ') + (d.set ? ' · ' + d.set : '');
      const req = d && G.equipReq ? G.equipReq(r.key) : 0;
      const locked = req > 1 && G.skills.level(G.equipReqSkill(r.key)) < req;
      if (req > 1) sub += ` · ${locked ? '🔒 ' : ''}lvl ${req} ${G.equipReqSkill(r.key)}`;
      html += `<div class="row ${i === row ? 'sel' : ''}" style="${locked ? 'opacity:.5' : ''}"><span class="row-icon">${icon}</span><div class="row-main"><div class="row-title">${title}${equipped ? ' <span style="color:var(--gold)">✓</span>' : ''}</div><div class="row-sub">${sub}</div></div></div>`;
    });
    els.menuBody.innerHTML = html;
  }
  function renderAuto() {
    const ap = G.autoplay || { on: false, mode: null };
    let html = '<div class="section-head">Auto-Play · hands-free</div>';
    html += AUTO_MODES.map((m, i) => {
      const active = ap.on && ap.mode === m.key;
      return `<div class="row ${row === i ? 'sel' : ''}" style="${active ? 'box-shadow:inset 0 0 0 2px #5ad07a;background:rgba(90,208,122,.10)' : ''}"><span class="row-icon">${m.icon}</span><div class="row-main"><div class="row-title">${m.name}${active ? ' · <span style="color:#7ce0a0">RUNNING</span>' : ''}</div><div class="row-sub">${m.sub}</div></div></div>`;
    }).join('');
    html += `<div class="section-head" style="opacity:.7">Tap a job to start. Tap it again (or pick another) to stop — it keeps running through swipes, menus, and respawns until you stop it here. The glasses handle the walking and the work.</div>`;
    els.menuBody.innerHTML = html;
  }
  let autoTag = null;
  function setAutoIndicator(text) {   // persistent status pill so you always know auto-play is running
    if (!autoTag) {
      autoTag = document.createElement('div');
      autoTag.id = 'autoTag';
      autoTag.style.cssText = 'position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:40;background:rgba(18,36,24,.86);border:1px solid #5ad07a;color:#cdeed6;font:600 12px/1 system-ui,sans-serif;padding:5px 11px;border-radius:999px;pointer-events:none;display:none;white-space:nowrap;box-shadow:0 0 12px rgba(90,208,122,.45)';
      (document.getElementById('app') || document.body).appendChild(autoTag);
    }
    if (text) { autoTag.textContent = 'AUTO · ' + text; autoTag.style.display = 'block'; }
    else autoTag.style.display = 'none';
  }
  function renderDiary() {
    const done = G.ach.unlocked;
    const sound = G.audio && !G.audio.muted;
    let html = `<div class="row ${row === 0 ? 'sel' : ''}"><span class="row-icon">${sound ? '🔊' : '🔇'}</span><div class="row-main"><div class="row-title">Sound: ${sound ? 'ON' : 'OFF'}</div><div class="row-sub">tap to toggle</div></div></div>`;
    html += `<div class="row ${row === 1 ? 'sel' : ''}"><span class="row-icon">🔄</span><div class="row-main"><div class="row-title">Restart game</div><div class="row-sub">choose a new class · wipes your save</div></div></div>`;
    html += `<div class="row ${row === 2 ? 'sel' : ''}"><span class="row-icon">📤</span><div class="row-main"><div class="row-title">Export save</div><div class="row-sub">copy a code to carry this save to another device</div></div></div>`;
    html += `<div class="row ${row === 3 ? 'sel' : ''}"><span class="row-icon">📥</span><div class="row-main"><div class="row-title">Import save</div><div class="row-sub">paste a code from glasses · phone · PC</div></div></div>`;
    const cloudOn = G.cloud && G.cloud.enabled;
    html += `<div class="row ${row === 4 ? 'sel' : ''}"><span class="row-icon">☁️</span><div class="row-main"><div class="row-title">Cloud sync: ${cloudOn ? 'ON' : 'off'}</div><div class="row-sub">${cloudOn ? 'tap to copy your sync link for other devices' : 'enable in config.js (see /worker)'}</div></div></div>`;
    const safe = G.deathMode === 'safe';
    html += `<div class="row ${row === 5 ? 'sel' : ''}"><span class="row-icon">⚰️</span><div class="row-main"><div class="row-title">Death: ${safe ? 'Safe' : 'Standard'}</div><div class="row-sub">${safe ? 'no penalty on death' : 'drop your goods to a gravestone — run back to reclaim'} · tap to toggle</div></div></div>`;
    html += `<div class="row ${row === 6 ? 'sel' : ''}"><span class="row-icon">🧭</span><div class="row-main"><div class="row-title">Unstuck</div><div class="row-sub">whisk back to the nearest town if you ever get stuck</div></div></div>`;
    if (G.controls && G.controls.touchUIAvailable) {   // hide the on-screen d-pad/buttons when playing on keyboard / controller / glasses
      const ton = G.controls.isTouchUIOn();
      html += `<div class="row ${row === 7 ? 'sel' : ''}"><span class="row-icon">🎮</span><div class="row-main"><div class="row-title">Touch controls: ${ton ? 'ON' : 'OFF'}</div><div class="row-sub">on-screen d-pad &amp; buttons · tap to toggle</div></div></div>`;
    }
    html += `<div class="section-head">Achievements · ${done.size}/${ACHIEVEMENTS.length}</div>`;
    html += ACHIEVEMENTS.map((a) => { const u = done.has(a.id); return `<div class="row" style="${u ? '' : 'opacity:.55'}"><span class="row-icon">${u ? '🏆' : '🔒'}</span><div class="row-main"><div class="row-title">${a.name}</div><div class="row-sub">${a.desc}</div></div></div>`; }).join('');
    els.menuBody.innerHTML = html;
  }
  function renderBestiary() {
    const kt = G.stats.killsByType || {};
    let html = '<div class="section-head">Bestiary</div>';
    html += Object.keys(ENEMIES).map((k, i) => {
      const e = ENEMIES[k], n = kt[k] || 0, seen = n > 0;
      const GLY = { melee: '⚔️', ranged: '🏹', magic: '🪄' };
      const wk = WEAKNESS[k], atk = ATK_STYLE[k] || 'melee';
      const sub = seen ? `HP ${e.hp} · dmg ${e.dmg} · ${e.xp} xp${e.boss ? ' · BOSS' : ''}${wk ? ` · weak ${GLY[wk]}` : ''} · hits ${GLY[atk]}` : '??? — defeat one to learn its ways';
      return `<div class="row ${i === row ? 'sel' : ''}" style="${seen ? '' : 'opacity:.5'}"><span class="row-icon">${e.boss ? '👑' : '☠️'}</span><div class="row-main"><div class="row-title">${seen ? e.name : '???'}${seen ? ` <span style="color:var(--text-mut)">×${n}</span>` : ''}</div><div class="row-sub">${sub}</div></div></div>`;
    }).join('');
    els.menuBody.innerHTML = html;
  }

  function renderInventory() {
    const gold = G.inventory.count('gold');
    const items = G.inventory.list();
    let html = `<div class="section-head">Pouch &nbsp;·&nbsp; 🪙 ${gold} Gold</div>`;
    if (!items.length) html += `<div class="empty-note">Your pack is empty. Chop trees, forage bushes, and defeat boars to gather loot.</div>`;
    else html += items.map((it, i) => { const useHint = (it.def.type === 'consumable' || it.def.type === 'potion' || it.def.type === 'clue') ? ' · tap to use' : (G.canLightFire && G.canLightFire(it.key)) ? ' · tap to light a fire' : ''; return `<div class="row ${i === row ? 'sel' : ''}"><span class="row-icon">${it.def.icon}</span><div class="row-main"><div class="row-title">${it.def.name}</div><div class="row-sub">${it.def.desc}${useHint}</div></div><div class="row-trail">×${it.count}</div></div>`; }).join('');
    els.menuBody.innerHTML = html;
  }
  const STANCE_KEYS = ['accurate', 'aggressive', 'defensive', 'controlled'];
  function renderSkills() {
    const cur = G.player.state.combatStance || 'accurate';
    const stanceHtml = STANCE_KEYS.map((k, i) => {
      const s = G.combatStances[k], on = k === cur;
      return `<div class="row ${i === row ? 'sel' : ''}" style="${on ? '' : 'opacity:.65'}"><span class="row-icon">${s.icon}</span><div class="row-main"><div class="row-title">${s.name}${on ? ' <span style="color:var(--gold)">active</span>' : ''}</div><div class="row-sub">${s.desc}${on ? '' : ' · tap to use'}</div></div></div>`;
    }).join('');
    const skillHtml = G.skills.DEFS.map((d, i) => {
      const ri = i + 4;
      const lv = G.skills.level(d.key), pr = Math.round(G.skills.progress(d.key) * 100), tn = G.skills.toNext(d.key);
      const pst = G.skills.prestigeOf(d.key), can = G.skills.canPrestige(d.key);
      const stars = pst ? ` <span style="color:var(--gold)">${'⭐'.repeat(Math.min(pst, 5))}</span>` : '';
      const sub = can ? '<span style="color:var(--gold)">tap to prestige ⭐</span>' : `${tn} xp to next`;
      return `<div class="row ${ri === row ? 'sel' : ''}"><span class="row-icon">${d.icon}</span><div class="row-main"><div class="row-title">${d.name} <span style="color:var(--gold)">Lv ${lv}</span>${stars}</div><div class="skillbar"><span style="width:${pr}%"></span></div><div class="row-sub">${sub}</div></div></div>`;
    }).join('');
    const L = (k) => G.skills.level(k);
    els.menuBody.innerHTML = `<div class="section-head">Total ${G.skills.total()} &nbsp;·&nbsp; ⚔️${L('combat')} 🏹${L('ranged')} 🪄${L('magic')} 🛡️${L('defence')} ☠️${L('slayer')} (${G.slayerPoints || 0}pts)</div><div class="section-head">⚔️ Attack stance</div>${stanceHtml}<div class="section-head">Skills</div>${skillHtml}`;
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
  function npcName(key) { return questNpcName(key); }
  function renderQuests() {
    const all = G.quests.all();
    const sect = (label, arr, fn) => arr.length ? `<div class="section-head">${label}</div>` + arr.map(fn).join('') : '';
    const active = (q, i) => {
      const objs = G.quests.objectives(q.id).map((o) => `<div class="obj ${o.done ? 'done' : ''}"><span class="box">${o.done ? '☑' : '☐'}</span>${o.text}</div>`).join('');
      const tracked = G.trackedQuest === q.id;
      return `<div class="row ${i === row ? 'sel' : ''}"><div class="row-main"><div class="row-title">${tracked ? '📍 ' : ''}${q.def.saga ? '📜 ' : ''}${q.def.name}${tracked ? ' <span style="color:var(--gold)">tracking</span>' : ''}</div><div class="row-sub">${q.def.desc} &nbsp;·&nbsp; tap to ${tracked ? 'untrack' : 'track'}</div>${objs}</div></div>`;
    };
    // Global row indexing across the three sections, so ↑/↓ scrolls the WHOLE quest log
    // (long Available/Completed lists were unreachable before). Select still only acts on actives.
    const actives = all.filter((q) => q.status === 'active'), avails = all.filter((q) => q.status === 'available'), comps = all.filter((q) => q.status === 'complete');
    let html = `<div class="section-head">⭐ Quest points: ${G.quests.points()}/${G.quests.maxPoints()}</div>`;
    html += sect('Active', actives, active);
    html += sect('Available', avails, (q, j) => { const i = actives.length + j; const req = G.quests.reqText(q.id), can = G.quests.canAccept(q.id); return `<div class="row ${i === row ? 'sel' : ''}" style="${can ? '' : 'opacity:.5'}"><div class="row-main"><div class="row-title">${q.def.saga ? '📜 ' : ''}${q.def.name}</div><div class="row-sub">See ${npcName(q.def.giver)}${req ? ` &nbsp;·&nbsp; ${can ? '' : '🔒 '}needs ${req}` : ''} &nbsp;·&nbsp; ${q.def.desc}</div></div></div>`; });
    html += sect('Completed', comps, (q, k) => { const i = actives.length + avails.length + k; return `<div class="row ${i === row ? 'sel' : ''}" style="opacity:.55"><div class="row-main"><div class="row-title">✓ ${q.def.name}</div></div></div>`; });
    els.menuBody.innerHTML = html || `<div class="empty-note">No quests yet. Speak with the villagers around the hearth.</div>`;
  }
  function renderLog() {
    const TYPES = { weapon: 1, armor: 1, amulet: 1, ring: 1, shield: 1 };
    const keys = Object.keys(ITEMS).filter((k) => TYPES[ITEMS[k].type]);
    const have = G.collection || new Set();
    const got = keys.filter((k) => have.has(k)).length;
    let html = `<div class="section-head">Collection Log — ${got}/${keys.length} gear</div>`;
    html += keys.map((k, i) => { const it = ITEMS[k], owned = have.has(k); return `<div class="row ${i === row ? 'sel' : ''}" style="${owned ? '' : 'opacity:.4'}"><span class="row-icon">${it.icon}</span><div class="row-main"><div class="row-title">${owned ? it.name : '???'}</div><div class="row-sub">${owned ? it.desc : 'Not yet collected'}</div></div>${owned ? '<div class="row-trail">✓</div>' : ''}</div>`; }).join('');
    els.menuBody.innerHTML = html;
  }
  function renderSpells() {
    const lvl = G.skills.level('magic');
    let html = `<div class="section-head">Spellbook — Magic ${lvl}</div>`;
    html += SPELLS.map((s, i) => {
      const locked = lvl < s.level;
      return `<div class="row ${i === row ? 'sel' : ''}" style="${locked ? 'opacity:.5' : ''}"><span class="row-icon">${s.icon}</span><div class="row-main"><div class="row-title">${s.name}${locked ? ` <span style="color:var(--text-mut)">Lv ${s.level}</span>` : ''}</div><div class="row-sub">${s.desc}</div></div></div>`;
    }).join('');
    els.menuBody.innerHTML = html;
  }
  function renderMastery() {
    const rows = G.masteryRows(), total = G.skills.total(), capes = [...G.capesEarned].filter((k) => k !== 'max').length;
    const totalXp = G.skills.DEFS.reduce((s, d) => s + (G.skills.xp[d.key] || 0), 0);
    let html = `<div class="section-head">${G.titleFor(total)} · Total ${total}/${G.skills.DEFS.length * 99} · ${capes} cape${capes === 1 ? '' : 's'}${G.capesEarned.has('max') ? ' + 🏆 Max' : ''}</div>`;
    html += `<div class="row" style="opacity:.8"><div class="row-main"><div class="row-sub">Total XP ${Math.round(totalXp).toLocaleString()} · earn a cape at level 99, then tap to wear it</div></div></div>`;
    rows.forEach((r, i) => {
      html += `<div class="row ${i === row ? 'sel' : ''}" style="${r.hasCape ? '' : 'opacity:.7'}"><span class="row-icon">${r.icon}</span><div class="row-main"><div class="row-title">${r.hasCape ? '✓ ' : ''}${r.name} <span style="color:var(--text-mut)">Lv ${r.level}</span>${r.worn ? ' <span style="color:var(--gold)">· cape worn</span>' : ''}</div><div class="row-sub">${r.hasCape ? 'tap to ' + (r.worn ? 'remove' : 'wear') + ' the cape' : 'reach 99 to earn the cape'}</div></div></div>`;
    });
    const perks = G.perkRows(), avail = Math.max(0, G.perkPointsAvail()), earned = G.perkPointsEarned();   // perks merged into this tab
    html += `<div class="section-head">Perks — ${G.perksOwned.size}/${perks.length} · ${avail}/${earned} points free</div>`;
    perks.forEach((r, i) => {
      const idx = rows.length + i;
      html += `<div class="row ${idx === row ? 'sel' : ''}" style="${r.locked ? 'opacity:.5' : ''}"><span class="row-icon">${r.icon}</span><div class="row-main"><div class="row-title">${r.name}${r.owned ? ' <span style="color:var(--gold)">✓</span>' : ''}</div><div class="row-sub">${r.desc}${r.reqText ? ` · <span style="color:var(--text-mut)">${r.reqText}</span>` : ''}</div></div><div class="row-trail">${r.owned ? 'owned' : r.cost + ' pt'}</div></div>`;
    });
    els.menuBody.innerHTML = html;
  }
  function renderPets() {
    const rows = G.petRows();
    let html = `<div class="section-head">Pets — ${rows.length} tamed · Beastmastery ${G.skills.level('beastmastery')}</div>`;
    if (!rows.length) html += '<div class="row"><div class="row-main"><div class="row-title">No pets yet</div><div class="row-sub">Walk up to a wild animal and tap “Tame”. Higher Beastmastery charms rarer beasts; bosses rarely drop a trophy pet.</div></div></div>';
    rows.forEach((r, i) => {
      html += `<div class="row ${i === row ? 'sel' : ''}"><span class="row-icon">${r.icon}</span><div class="row-main"><div class="row-title">${r.name}${r.active ? ' <span style="color:var(--gold)">· following</span>' : ''}</div><div class="row-sub">${r.perk || 'companion'} · tap to ${r.active ? 'dismiss' : 'summon'}</div></div></div>`;
    });
    els.menuBody.innerHTML = html;
  }
  function renderTasks() {
    const rows = G.diaryRows();
    const claimed = rows.filter((r) => r.claimed).length;
    let html = `<div class="section-head">Region Diaries — ${claimed}/${rows.length} tiers · +${G.diaryBonus()} max HP</div>`;
    rows.forEach((r, i) => {
      const tasks = r.tasks.map((t) => `<div class="obj ${t.done ? 'done' : ''}"><span class="box">${t.done ? '☑' : '☐'}</span>${t.desc}</div>`).join('');
      const status = r.claimed ? '<span style="color:var(--gold)">✓ claimed</span>' : r.ready ? '<span style="color:var(--gold)">tap to claim!</span>' : `(${r.tasks.filter((t) => t.done).length}/${r.tasks.length})`;
      html += `<div class="row ${i === row ? 'sel' : ''}" style="${r.claimed ? 'opacity:.55' : ''}"><div class="row-main"><div class="row-title">${r.regionName} — ${r.tierName} &nbsp; ${status}</div>${tasks}</div></div>`;
    });
    els.menuBody.innerHTML = html;
  }
  function renderMap() {
    els.menuBody.innerHTML = `<div class="section-head">World Map</div><canvas id="mapCanvas" width="300" height="300"></canvas>` +
      `<div class="map-legend"><b style="color:#caa878">H</b>ome &nbsp;<b style="color:#ffd45f">S</b>tore &nbsp;<b style="color:#6fa0ff">B</b>ank &nbsp;<b style="color:#9bf2ff">W</b>orkshop &nbsp;<b style="color:#e0a050">T</b>avern &nbsp;<b style="color:#ff7a33">F</b>orge &nbsp;·&nbsp; <span style="color:#b07adf">●</span> dungeon &nbsp; <span style="color:#ff6b6b">●</span> foe</div>`;
    drawMap(document.getElementById('mapCanvas').getContext('2d'));
  }
  const BIOME_MAP_COL = { grass: '#2f7d4a', forest: '#1f5a36', desert: '#d6bd72', snow: '#dbe6f2', volcanic: '#9c5a34', swamp: '#3a5a3e', jungle: '#2faa4a', badlands: '#b5622e', highland: '#7a8290', fae: '#8a3a9a', coast: '#3aa6b0', autumn: '#cf7a2e', crystal: '#7c9bff', spore: '#a05fb0', lagoon: '#3ad0c0', sky: '#aec6e6', cinder: '#b5482a', twilight: '#3a6a7a', aurora: '#9bd0e6', obsidian: '#4a3a52', umbral: '#5a4a7a', saltmarsh: '#d6a0b0' };
  // building-type letters/colours so each building reads distinctly on the map + minimap
  const BUILD_ICON = { home: 'H', store: 'S', bank: 'B', workshop: 'W', tavern: 'T', forge: 'F' };
  const BUILD_COL = { home: '#caa878', store: '#ffd45f', bank: '#6fa0ff', workshop: '#9bf2ff', tavern: '#e0a050', forge: '#ff7a33' };
  function drawMap(ctx) {
    const S = 300, pad = 12, R = G.world.regions;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const r of R) { minX = Math.min(minX, r.x - r.r); maxX = Math.max(maxX, r.x + r.r); minZ = Math.min(minZ, r.z - r.r); maxZ = Math.max(maxZ, r.z + r.r); }
    const ox = (minX + maxX) / 2, oz = (minZ + maxZ) / 2, sc = (S - 2 * pad) / Math.max(maxX - minX, maxZ - minZ);
    const to = (x, z) => [S / 2 + (x - ox) * sc, S / 2 + (z - oz) * sc];
    ctx.clearRect(0, 0, S, S); ctx.fillStyle = '#08222a'; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#cdb98a'; ctx.lineCap = 'round';
    for (const b of G.world.bridges) { const [x1, y1] = to(b.ax, b.az), [x2, y2] = to(b.bx, b.bz); const ferry = b.type === 'ferry'; ctx.strokeStyle = ferry ? '#5fd6e6' : '#cdb98a'; ctx.setLineDash(ferry ? [6, 5] : []); ctx.lineWidth = Math.max(2, b.halfW * 2 * sc); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const r of R) { const [x, y] = to(r.x, r.z); ctx.fillStyle = BIOME_MAP_COL[r.biome] || '#2f7d4a'; ctx.beginPath(); ctx.arc(x, y, r.r * sc, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#aab2bd'; G.world.peaks.forEach((pk) => { const [x, y] = to(pk.x, pk.z); ctx.beginPath(); ctx.arc(x, y, Math.max(3, pk.r * sc * 0.5), 0, 7); ctx.fill(); });
    const cv = G.world.cave; const [cvx, cvy] = to(cv.x, cv.z); ctx.fillStyle = '#5a5550'; ctx.beginPath(); ctx.arc(cvx, cvy, Math.max(3, cv.r * sc), 0, 7); ctx.fill();
    if (G.world.cave2) { const c2 = G.world.cave2; const [c2x, c2y] = to(c2.x, c2.z); ctx.fillStyle = '#5a6a80'; ctx.beginPath(); ctx.arc(c2x, c2y, Math.max(3, c2.r * sc), 0, 7); ctx.fill(); }
    if (G.world.dungeons) { ctx.fillStyle = '#7a4a8a'; G.world.dungeons.forEach((d) => { const [dx, dy] = to(d.x, d.z); ctx.beginPath(); ctx.arc(dx, dy, Math.max(3, d.r * sc), 0, 7); ctx.fill(); }); }
    for (const s of G.world.stations) { if (s.kind !== 'door') continue; const [x, y] = to(s.x, s.z); ctx.fillStyle = BUILD_COL[s.building] || '#caa878'; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }
    ctx.textAlign = 'center'; ctx.font = 'bold 9px sans-serif';
    G.world.villages.forEach((v) => { const [x, y] = to(v.x, v.z); ctx.fillStyle = '#ffd45f'; ctx.fillRect(x - 3, y - 3, 6, 6); ctx.fillStyle = '#ffe9a8'; ctx.fillText(v.name, x, y - 7); });
    for (const wp of (G.world.waystones || [])) { const [x, y] = to(wp.x, wp.z); const on = G.waystonesAttuned && G.waystonesAttuned.has(wp.key); ctx.fillStyle = on ? '#9bf2ff' : '#3a5a66'; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-2.4, -2.4, 4.8, 4.8); ctx.restore(); }
    (G.world.mines || []).forEach((m) => { const [x, y] = to(m.x, m.z); ctx.fillStyle = '#caa050'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill(); ctx.fillStyle = '#1a1208'; ctx.fillText('⛏', x, y + 3.2); });
    const mGivers = new Set(G.quests.all().filter((q) => q.status === 'available').map((q) => q.def.giver));   // gold = has a quest to offer
    G.entities.npcs.forEach((n) => { const gv = mGivers.has(n.def.key); const [x, y] = to(n.pos.x, n.pos.z); ctx.fillStyle = gv ? '#ffd24a' : '#5fe3ff'; ctx.beginPath(); ctx.arc(x, y, gv ? 3.2 : 2.2, 0, 7); ctx.fill(); });
    G.entities.enemies.forEach((e) => { if (!e.alive) return; const [x, y] = to(e.pos.x, e.pos.z); ctx.fillStyle = e.def.boss ? '#ff3a2a' : '#ff6b6b'; ctx.beginPath(); ctx.arc(x, y, e.def.boss ? 5 : 2, 0, 7); ctx.fill(); });
    const [hx, hy] = to(G.player.position.x, G.player.position.z);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.PI - G.player.state.heading);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function updateMinimap() {
    localMap.update();
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
  const pickerKey = r => r && (pickerCfg.rowKey ? pickerCfg.rowKey(r) : JSON.stringify(r.data || { title: r.title }));
  function renderPicker(selectedKey) {
    if (!pickerCfg) return;
    pickerTitleEl.textContent = pickerCfg.title;
    pickerGoldEl.textContent = '🪙 ' + G.inventory.count('gold');
    pickerRows = pickerCfg.rows();
    if (selectedKey != null) { const index = pickerRows.findIndex(r => pickerKey(r) === selectedKey); if (index >= 0) pickerRow = index; }
    if (pickerRow >= pickerRows.length) pickerRow = Math.max(0, pickerRows.length - 1);
    let html = '', lastSection = null;
    pickerRows.forEach((r, i) => {
      if (r.section && r.section !== lastSection) { html += `<div class="section-head">${r.section}</div>`; lastSection = r.section; }
      html += `<div class="row ${i === pickerRow ? 'sel' : ''}"><span class="row-icon">${r.icon || ''}</span><div class="row-main"><div class="row-title">${r.title}</div><div class="row-sub">${r.sub || ''}</div></div><div class="row-trail">${r.right || ''}</div></div>`;
    });
    pickerBodyEl.innerHTML = pickerRows.length ? html : `<div class="empty-note">${pickerCfg.empty || 'Nothing here.'}</div>`;
  }
  function openPicker(cfg) { pickerCfg = cfg; pickerRow = 0; pickerHintEl.textContent = cfg.hint || '↑ ↓ select · tap · ↑↓↑↓ leave'; pickerEl.classList.remove('hidden'); hideWorldLabels(); clearBubbles(); renderPicker(); pickerBodyEl.scrollTop=0; }
  function closePicker() { pickerEl.classList.add('hidden'); pickerCfg = null; }
  function pickerMove(dir) { if (!pickerRows.length) return; pickerRow = (pickerRow + dir + pickerRows.length) % pickerRows.length; renderPicker(); const s = pickerBodyEl.querySelector('.row.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }
  function pickerSelect() { const r = pickerRows[pickerRow]; if (r && pickerCfg) pickerCfg.onSelect(r); renderPicker(); }
  function refreshPicker() {
    if (!pickerCfg?.live || pickerEl.classList.contains('hidden')) return;
    const key = pickerKey(pickerRows[pickerRow]), scroll = pickerBodyEl.scrollTop;
    renderPicker(key); pickerBodyEl.scrollTop = scroll;
  }

  // Pointing at a visible choice selects that choice on phones and desktops;
  // the directional input path remains available for the glasses and keyboard.
  const clickedIndex = (event, container, selector) => {
    const item = event.target.closest(selector);
    return item && container.contains(item) ? [...container.querySelectorAll(selector)].indexOf(item) : -1;
  };
  els.menuTabs.addEventListener('click', event => {
    if (!api.menuOpen) return;
    const index = clickedIndex(event, els.menuTabs, '.tab');
    if (index < 0) return;
    if (G.audio) G.audio.resume();
    menuTab(index - tab);
  });
  els.menuBody.addEventListener('click', event => {
    if (!api.menuOpen) return;
    const index = clickedIndex(event, els.menuBody, '.row');
    if (index < 0 || index >= rowCount()) return;
    if (G.audio) G.audio.resume();
    row = index; menuSelect();
    if (api.menuOpen) renderMenu();
  });
  pickerBodyEl.addEventListener('click', event => {
    if (!pickerCfg || pickerEl.classList.contains('hidden')) return;
    const index = clickedIndex(event, pickerBodyEl, '.row');
    if (index < 0 || index >= pickerRows.length) return;
    if (G.audio) G.audio.resume();
    pickerRow = index; pickerSelect();
  });
  els.dlgChoices.addEventListener('click', event => {
    if (els.dialogue.classList.contains('hidden') || !G.dialogue.active) return;
    const index = clickedIndex(event, els.dlgChoices, '.choice');
    if (index >= 0) { if (G.audio) G.audio.resume(); G.dialogue.select(index); }
  });

  // ---- cloud sync link panel (so the keyboard-less glasses can SEE + scan the link) ----
  const syncEl = document.createElement('div'); syncEl.id = 'syncPanel'; syncEl.className = 'overlay hidden';
  syncEl.innerHTML = '<div class="sync-box"><div class="sync-title">☁️ Your Cloud Sync Link</div><div class="sync-qr"><img id="syncQr" alt="sync QR" /></div><div class="sync-link" id="syncLink"></div><div class="sync-foot">Open or scan this link on your phone &amp; PC to share this save.<br/>Any tap / swipe closes.</div></div>';
  app.appendChild(syncEl);
  const syncLinkEl = syncEl.querySelector('#syncLink');
  const syncQrEl = syncEl.querySelector('#syncQr');
  function showSync(link) {
    syncLinkEl.textContent = link;
    syncQrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=' + encodeURIComponent(link);
    syncEl.classList.remove('hidden');
  }
  function hideSync() { syncEl.classList.add('hidden'); }
  function syncOpen() { return !syncEl.classList.contains('hidden'); }

  // ---- dialogue ----
  function showDialogue() { els.dialogue.classList.remove('hidden'); hideWorldLabels(); clearBubbles(); }
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
    const selectedChoice=els.dlgChoices.querySelector('.choice.sel');
    if(selectedChoice)selectedChoice.scrollIntoView({block:'nearest'});
  }

  const api = {
    menuOpen: false,
    setCompass, setHealth, setLocation, setPrayer, setSpec, setQuestArrow, showPrompt, hidePrompt, toast, updateMarkers, updateMinimap, setMinimapVisible, setChannel, hideChannel, setAutoIndicator,
    hitsplat, xpDrop, levelBanner, sayAt, updateBubbles, clearBubbles,
    labelLayoutInfo: () => labelInfo,
    openMenu, closeMenu, menuTab, menuMove, menuSelect,
    openPicker, closePicker, pickerMove, pickerSelect, refreshPicker,
    showSync, hideSync, syncOpen,
    showDialogue, hideDialogue, renderDialogue,
  };
  return api;
}
