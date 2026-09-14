// Run against a local server with PLAYWRIGHT_PATH pointing at an installed Playwright package.
// Uses an isolated profile; every non-local request is blocked, including cloud saves.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.REALM_URL || 'http://127.0.0.1:8097/glassrealm/';
const out = path.resolve(process.env.REALM_EVIDENCE || '.visual-review/realm-systems/quests/browser');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 600, height: 600 }, serviceWorkers: 'block' });
  const local = new URL(url).origin, errors = [], checks = [];
  await context.route('**/*', r => new URL(r.request().url()).origin === local ? r.continue() : r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  const shot = name => page.screenshot({ path: path.join(out, name + '.png') });
  async function installQuest(id, ready = false) {
    await page.evaluate(async ({ id, ready }) => {
      const { QUESTS } = await import('/glassrealm/src/content.js'), { createQuests } = await import('/glassrealm/src/quests.js');
      const G = __gr.G, saved = {};
      for (const [key, q] of Object.entries(QUESTS)) saved[key] = { status: key === id ? 'active' : 'complete', progress: Object.fromEntries(q.objectives.map(o => [o.id, key === id && ready ? o.count || 1 : 0])) };
      G.quests = createQuests(G, saved); G.trackedQuest = id;
      if (ready) for (const o of QUESTS[id].objectives) if (o.type === 'have') G.inventory.add(o.item, o.count);
    }, { id, ready });
  }
  try {
    await page.goto(url); await page.waitForFunction(() => window.__gr?.mode === 'picker');
    await page.locator('#pickerBody .row').nth(2).click();
    check('pointer selects the clicked starting class', await page.evaluate(() => __gr.mode === 'world' && __gr.player.state.equipment.weapon === 'apprentice_staff'));
    await page.evaluate(() => __gr.pause()); await page.waitForTimeout(120);
    const bearings = await page.evaluate(() => {
      const G = __gr.G, results = [];
      for (const [heading, cardinal] of [[Math.PI, 'N'], [Math.PI / 2, 'E'], [0, 'S'], [-Math.PI / 2, 'W']]) {
        G.ui.setCompass(heading); const rect = document.getElementById('compass').getBoundingClientRect(), center = rect.x + rect.width / 2;
        const closest = [...document.querySelectorAll('#compassTrack .tick')].sort((a, b) => { const x = el => { const r = el.getBoundingClientRect(); return Math.abs(r.x + r.width / 2 - center); }; return x(a) - x(b); })[0];
        results.push({ heading, expected: cardinal, actual: closest.textContent });
      }
      G.ui.setQuestArrow(Math.PI / 2, 'Left-side test', 10); const left = document.querySelector('.qg-arrow').style.transform;
      G.ui.setQuestArrow(-Math.PI / 2, 'Right-side test', 10); const right = document.querySelector('.qg-arrow').style.transform;
      G.ui.setQuestArrow(null); G.ui.setCompass(__gr.player.state.heading); return { results, left, right };
    });
    check('compass matches actual north/east/south/west movement headings', bearings.results.every(r => r.expected === r.actual));
    check('relative quest arrow points to the correct side', bearings.left.startsWith('rotate(-') && !bearings.right.startsWith('rotate(-'));
    await page.evaluate(() => __gr.G.talkTo(__gr.G.entities.npcs.find(n => n.def.key === 'elder')));
    await page.locator('#dlgChoices .choice').first().click();
    check('pointer accepts Elder quest', await page.evaluate(() => __gr.G.quests.status('q_wood') === 'active'));
    await page.keyboard.press('Escape');
    await page.evaluate(() => __gr.G.talkTo(__gr.G.entities.npcs.find(n => n.def.key === 'merchant')));
    const offer = await page.locator('#dlgText').textContent(); await page.locator('#dlgChoices .choice').first().click();
    check('blocked second quest retains its offer and original active quest', await page.evaluate(offer => __gr.G.quests.status('q_berry') === 'available' && __gr.G.quests.activeList().join() === 'q_wood' && document.getElementById('dlgText').textContent === offer, offer));
    await shot('blocked-accept'); await page.keyboard.press('Escape');
    await page.evaluate(() => { __gr.G.inventory.add('wood', 3); __gr.G.talkTo(__gr.G.entities.npcs.find(n => n.def.key === 'elder')); });
    await page.locator('#dlgChoices .choice').first().click();
    check('pointer turn-in consumes materials and grants normal XP feedback', await page.evaluate(() => __gr.G.quests.status('q_wood') === 'complete' && __gr.G.inventory.count('wood') === 0 && !!document.querySelector('#xpdrops .xpdrop')));
    await shot('starter-turnin'); await page.keyboard.press('Escape');
    await page.evaluate(() => { const n = __gr.G.entities.npcs.find(n => n.def.key === 'elder'); __gr.G.currentTarget = { kind: 'npc', ref: n }; });
    await page.keyboard.press('Enter');
    await page.evaluate(() => __gr.G.dialogue.move([...document.querySelectorAll('#dlgChoices .choice')].findIndex(e => e.textContent.includes('Chat'))));
    await page.keyboard.press('Enter');
    check('rapid keyboard confirm keeps a dialogue open', await page.evaluate(() => __gr.mode === 'dialogue' && __gr.G.dialogue.active));
    await page.keyboard.press('Escape'); await page.evaluate(() => __gr.openMenu());
    const tabNames = await page.locator('#menuTabs .tab').allTextContents();
    for (let i = 0; i < tabNames.length; i++) {
      await page.locator('#menuTabs .tab').nth(i).click();
      check('pointer opens tab ' + tabNames[i], await page.locator('#menuTabs .tab.sel').textContent() === tabNames[i]);
    }
    await page.locator('#menuTabs .tab').nth(2).click(); await page.locator('#menuBody .row').nth(2).click();
    check('pointer selects exact combat stance row', await page.evaluate(() => __gr.player.state.combatStance === 'defensive'));
    await page.locator('#menuTabs .tab').first().click();
    await page.evaluate(() => { const G = __gr.G; for (const it of G.inventory.list()) G.inventory.remove(it.key, it.count); G.inventory.add('berry', 1); G.player.state.hp = Math.max(1, G.player.state.maxHp - 10); G.ui.menuTab(0); });
    await page.locator('#menuBody .row').last().click();
    check('consuming the final inventory row clears selection safely', await page.evaluate(() => __gr.G.inventory.count('berry') === 0 && !document.querySelector('#menuBody .row.sel')));
    await page.evaluate(() => __gr.G.inventory.add('gold', 5000)); await page.keyboard.press('Escape');
    await page.evaluate(() => { const G = __gr.G; G.economy.found('shop'); G.economy.found('farm'); G.openBusiness(); G.ui.pickerMove(4); });
    const selected = await page.locator('#pickerBody .row.sel').textContent();
    const live = await page.evaluate(() => { const G = __gr.G, state = G.economy.serialize(); return state; });
    await page.evaluate(() => { const G = __gr.G; const old = G.economy.accruedOf; G.economy.accruedOf = key => key === 'shop' ? 12 : old(key); G.ui.refreshPicker(); });
    check('live picker refresh updates earnings', (await page.locator('#pickerBody').textContent()).includes('12g'));
    check('live picker refresh retains the selected venture action', await page.locator('#pickerBody .row.sel').textContent() === selected);
    await shot('live-picker'); await page.keyboard.press('Escape');
    await installQuest('q_spire2');
    await page.evaluate(() => __gr.G.talkTo(__gr.G.entities.npcs.find(n => n.def.key === 'kestrel')));
    check('talk objective is persisted immediately', await page.evaluate(() => JSON.parse(localStorage.getItem('glassrealm.save.v1')).quests.q_spire2.progress.kestrel === 1));
    await page.keyboard.press('Escape'); await page.reload(); await page.waitForFunction(() => window.__gr?.mode === 'world'); await page.evaluate(() => __gr.pause());
    check('talk objective survives actual reload', await page.evaluate(() => __gr.G.quests.progress('q_spire2', 'kestrel') === 1));
    await installQuest('q_spire3', true);
    await page.evaluate(() => { const G = __gr.G; G.skills.xp.magic = Math.round(8 * Math.pow(98, 2.3)) - 10; G.capesEarned.delete('magic'); G.talkTo(G.entities.npcs.find(n => n.def.key === 'perenna')); });
    check('saga has distinct finale choices', await page.locator('#dlgChoices .choice').count() >= 2);
    await shot('saga-finale'); await page.locator('#dlgChoices .choice').nth(1).click();
    check('saga choice grants quest XP through level/cape pipeline and saves outcome', await page.evaluate(() => { const G = __gr.G, s = JSON.parse(localStorage.getItem('glassrealm.save.v1')); return G.quests.status('q_spire3') === 'complete' && G.capesEarned.has('magic') && !!G.sagaChoices.q_spire3 && s.sagaChoices.q_spire3 === G.sagaChoices.q_spire3; }));
    await installQuest('q_crown1', true); await page.evaluate(() => __gr.step(2));
    check('ready indoor quest guides to castle door', await page.evaluate(() => __gr.G.questGuide?.kind === 'door' && __gr.G.questGuide.ref.building === 'castle'));
    await page.evaluate(() => { const G = __gr.G; G.enterBuilding(G.world.stations.find(s => s.kind === 'door' && s.building === 'castle')); __gr.step(2); });
    check('inside the castle, guide points to the actual King station', await page.evaluate(() => __gr.G.questGuide?.ref.npcKey === 'king' && !document.getElementById('questGuide').classList.contains('hidden')));
    await shot('indoor-king-guide');
    await page.evaluate(() => { const G = __gr.G; G.talkToStation(G.interiorStations.find(s => s.npcKey === 'king')); });
    await page.locator('#dlgChoices .choice').first().click(); await page.keyboard.press('Escape');
    check('indoor quest turn-in restores the room after dialogue', await page.evaluate(() => __gr.mode === 'interior' && __gr.G.inInterior && __gr.G.quests.status('q_crown1') === 'complete'));
    await page.evaluate(() => __gr.G.exitInterior());
    const coverage = await page.evaluate(async () => {
      const { QUESTS, SMELT, BREW, FLETCH, RUNECRAFT, CRAFT, FORGE, ENCHANT, MEALS, COOK, FISH, LOGS } = await import('/glassrealm/src/content.js'), { createQuestGuidance } = await import('/glassrealm/src/quest-guidance.js');
      const G = __gr.G, guide = createQuestGuidance(G), items = [...new Set(Object.values(QUESTS).flatMap(q => q.objectives.filter(o => o.type === 'have').map(o => o.item)))];
      const costs = new Map([...SMELT, ...BREW, ...FLETCH, ...RUNECRAFT, ...CRAFT, ...FORGE, ...ENCHANT, ...MEALS].map(r => [r.out, r.cost || r.in]));
      for (const [input, output] of Object.entries(COOK)) costs.set(output, { [input]: 1 }); costs.set('plank', { wood: 1 });
      const lineage = (item, found = new Set()) => { if (found.has(item)) return found; found.add(item); for (const k of Object.keys(costs.get(item) || {})) lineage(k, found); return found; };
      const oreItems = { copper: 'copper_ore', iron: 'iron_ore', coal: 'coal', gold: 'gold_ore', silver: 'silver_ore', mithril: 'mithril_ore', adamant: 'adamant_ore', runite: 'runite_ore', essence: 'rune_essence' };
      const sources = items.map(item => {
        const s = guide.itemTarget(item); if (!s) return { item, source: null, valid: false };
        const produced = s.kind === 'enemy' ? Object.keys(s.ref.def.loot || {}) : s.kind === 'tree' ? LOGS.map(x => x.log) : s.kind === 'bush' ? ['berry', 'herb', 'mushroom', 'nectar'] : s.kind === 'ore' ? [oreItems[s.ref.type]] : s.kind === 'fish' ? FISH.map(x => x.raw).concat('pearl') : s.kind === 'plot' ? ['crop'] : costs.has(item) ? [item] : [];
        const physical = s.kind === 'enemy' ? G.entities.enemies.includes(s.ref) && s.ref.alive : ({ tree: G.world.trees, bush: G.world.bushes, ore: G.world.oreNodes, fish: G.world.fishingSpots, plot: G.world.plots, station: G.world.stations, door: G.world.stations }[s.kind] || []).includes(s.ref);
        return { item, source: s.label, kind: s.kind, produced, valid: physical && produced.some(k => lineage(item).has(k)) };
      });
      const visits = Object.entries(QUESTS).flatMap(([id, q]) => q.objectives.filter(o => o.type === 'visit').map(o => { const land = G.world.findClear(o.x, o.z, G.player.collisionRadius, (x,z) => !G.player.canOccupy(x,z)); return { id, objective: o.id, radius: o.r || 9, distance: land ? Math.hypot(land.x-o.x,land.z-o.z) : null }; }));
      return { sources, visits };
    });
    check('all 39 material objectives point to physical producers of the item or a recipe ingredient', coverage.sources.every(x => x.source && x.valid));
    check('all visit objectives have safe land within their trigger radius', coverage.visits.every(x => x.distance != null && x.distance <= x.radius));
    for (const viewport of [{ width: 390, height: 844 }, { width: 1200, height: 800 }]) {
      await page.setViewportSize(viewport); await page.evaluate(() => { __gr.G.talkTo(__gr.G.entities.npcs.find(n => n.def.key === 'elder')); });
      await page.locator('#dlgChoices .choice').last().click();
      check('pointer dialogue remains usable at ' + viewport.width, await page.evaluate(() => __gr.mode === 'dialogue'));
      await shot('dialogue-' + viewport.width); await page.keyboard.press('Escape');
    }
    check('no uncaught browser errors', errors.length === 0);
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ checks, coverage, errors, live }, null, 2)); console.log(JSON.stringify({ passed: checks.length, visits: coverage.visits.length, sources: coverage.sources.length, errors }));
  } catch (error) { await shot('failure'); fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ checks, errors, failure: error.message }, null, 2)); throw error; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
