import { QUESTS, objectiveText } from './content.js';

// Quest state machine. 'have' objectives read live from inventory so progress
// updates as you gather; 'kill' objectives are counted via notifyKill().
export function createQuests(G, saved) {
  const state = Object.create(null);
  for (const id in QUESTS) {
    const def = QUESTS[id];
    state[id] = { status: def.startsAvailable ? 'available' : 'locked', progress: {} };
    def.objectives.forEach((o) => (state[id].progress[o.id] = 0));
  }
  if (saved && typeof saved === 'object') {
    for (const id in saved) {
      const record = saved[id];
      if (!state[id] || !record || typeof record !== 'object') continue;
      if (['locked', 'available', 'active', 'complete'].includes(record.status)) state[id].status = record.status;
      for (const o of QUESTS[id].objectives) {
        const n = Number(record.progress && record.progress[o.id]);
        state[id].progress[o.id] = Number.isFinite(n) ? Math.max(0, Math.min(o.count || 1, Math.floor(n))) : 0;
      }
    }
  }

  function refreshLocks() {
    for (const id in QUESTS) {
      const def = QUESTS[id];
      if (state[id].status === 'active' || state[id].status === 'complete') continue;
      const unlocked = def.requires ? state[def.requires] && state[def.requires].status === 'complete' : def.startsAvailable;
      state[id].status = unlocked ? 'available' : 'locked';
    }
  }
  refreshLocks();

  const api = {
    status(id) { return state[id] ? state[id].status : 'unknown'; },
    progress(id, objId) { return state[id] ? (state[id].progress[objId] || 0) : 0; },
    canAccept(id) {
      const def = Object.hasOwn(QUESTS, id) ? QUESTS[id] : null; if (!def || state[id].status !== 'available') return false;
      if (!def.reqSkills) return true;
      for (const sk in def.reqSkills) if (G.skills.level(sk) < def.reqSkills[sk]) return false;
      return true;
    },
    reqText(id) {
      const def = QUESTS[id]; if (!def || !def.reqSkills) return '';
      return Object.keys(def.reqSkills).map((sk) => `${sk} ${def.reqSkills[sk]}`).join(', ');
    },
    accept(id) {
      if (state[id] && state[id].status === 'available') {
        if (!this.canAccept(id)) { if (G.ui) G.ui.toast(`Requires ${this.reqText(id)} to start this quest`, 'bad', 2600); return false; }
        if (this.activeList().length > 0) { if (G.ui) G.ui.toast('Finish your current quest first — one quest at a time', 'bad', 2800); return false; }
        state[id].status = 'active';
        if (G.onQuestAccepted) G.onQuestAccepted(id, QUESTS[id]);
        return true;
      }
      return false;
    },
    points() { let p = 0; for (const id in QUESTS) if (state[id].status === 'complete') p += QUESTS[id].saga ? 2 : 1; return p; },
    maxPoints() { let p = 0; for (const id in QUESTS) p += QUESTS[id].saga ? 2 : 1; return p; },
    notifyKill(enemyKey) {
      let changed = false;
      for (const id in QUESTS) {
        if (state[id].status !== 'active') continue;
        QUESTS[id].objectives.forEach((o) => {
          if (o.type === 'kill' && o.enemy === enemyKey) {
            const before = state[id].progress[o.id];
            state[id].progress[o.id] = Math.min(o.count, before + 1);
            if (state[id].progress[o.id] !== before) changed = true;
          }
        });
      }
      return changed;
    },
    // reaching a place satisfies 'visit' objectives; returns true if something changed
    notifyVisit(x, z) {
      let changed = false;
      for (const id in QUESTS) {
        if (state[id].status !== 'active') continue;
        QUESTS[id].objectives.forEach((o) => {
          if (o.type === 'visit' && !state[id].progress[o.id]) {
            const r = o.r || 9;
            if ((x - o.x) ** 2 + (z - o.z) ** 2 <= r * r) { state[id].progress[o.id] = 1; changed = true; }
          }
        });
      }
      return changed;
    },
    // talking to an NPC satisfies 'talk' objectives that name them
    notifyTalk(npcKey) {
      let changed = false;
      for (const id in QUESTS) {
        if (state[id].status !== 'active') continue;
        QUESTS[id].objectives.forEach((o) => { if (o.type === 'talk' && o.npc === npcKey && !state[id].progress[o.id]) { state[id].progress[o.id] = 1; changed = true; } });
      }
      return changed;
    },
    objectives(id) {
      const def = Object.hasOwn(QUESTS, id) ? QUESTS[id] : null;
      if (!def) return [];
      return def.objectives.map((o) => {
        const cnt = o.count || 1;
        const n = state[id].status === 'complete' ? cnt : o.type === 'have' ? Math.min(cnt, G.inventory.count(o.item)) : Math.min(cnt, state[id].progress[o.id] || 0);
        return { text: objectiveText(o, n), done: n >= cnt };
      });
    },
    isReady(id) { return state[id] && state[id].status === 'active' && this.objectives(id).every((o) => o.done); },
    complete(id) {
      const def = QUESTS[id];
      if (!this.isReady(id)) return false;
      // Commit before callbacks: XP/achievement/reward hooks may synchronously
      // re-enter quest code, but the same turn-in must never pay twice.
      state[id].status = 'complete';
      refreshLocks();
      def.objectives.forEach((o) => { if (o.type === 'have') G.inventory.remove(o.item, o.count); });
      if (def.rewards.items) for (const k in def.rewards.items) G.inventory.add(k, def.rewards.items[k]);
      if (def.rewards.xp) for (const k in def.rewards.xp) {
        if (G.gainXp) G.gainXp(k, def.rewards.xp[k]);
        else G.skills.addXp(k, def.rewards.xp[k]);
      }
      if (G.onQuestComplete) G.onQuestComplete(id, def);
      return true;
    },
    activeList() { return Object.keys(QUESTS).filter((id) => state[id].status === 'active'); },
    all() { return Object.keys(QUESTS).map((id) => ({ id, def: QUESTS[id], status: state[id].status })); },
    serialize() {
      const o = {};
      for (const id in state) o[id] = { status: state[id].status, progress: { ...state[id].progress } };
      return o;
    },
  };
  return api;
}
