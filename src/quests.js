import { QUESTS, objectiveText } from './content.js';

// Quest state machine. 'have' objectives read live from inventory so progress
// updates as you gather; 'kill' objectives are counted via notifyKill().
export function createQuests(G, saved) {
  const state = {};
  for (const id in QUESTS) {
    const def = QUESTS[id];
    state[id] = { status: def.startsAvailable ? 'available' : 'locked', progress: {} };
    def.objectives.forEach((o) => (state[id].progress[o.id] = 0));
  }
  if (saved) {
    for (const id in saved) {
      if (state[id]) { state[id].status = saved[id].status; Object.assign(state[id].progress, saved[id].progress || {}); }
    }
  }

  function refreshLocks() {
    for (const id in QUESTS) {
      const def = QUESTS[id];
      if (def.requires && state[id].status === 'locked' && state[def.requires] && state[def.requires].status === 'complete') {
        state[id].status = 'available';
      }
    }
  }
  refreshLocks();

  const api = {
    status(id) { return state[id] ? state[id].status : 'unknown'; },
    progress(id, objId) { return state[id] ? (state[id].progress[objId] || 0) : 0; },
    canAccept(id) {
      const def = QUESTS[id]; if (!def || !def.reqSkills) return true;
      for (const sk in def.reqSkills) if (G.skills.level(sk) < def.reqSkills[sk]) return false;
      return true;
    },
    reqText(id) {
      const def = QUESTS[id]; if (!def || !def.reqSkills) return '';
      return Object.keys(def.reqSkills).map((sk) => `${sk} ${def.reqSkills[sk]}`).join(', ');
    },
    accept(id) {
      if (state[id] && state[id].status === 'available') {
        if (!this.canAccept(id)) { if (G.ui) G.ui.toast(`Requires ${this.reqText(id)} to start this quest`, 'bad', 2600); return; }
        state[id].status = 'active';
        if (G.onQuestAccepted) G.onQuestAccepted(id, QUESTS[id]);
      }
    },
    points() { let p = 0; for (const id in QUESTS) if (state[id].status === 'complete') p += QUESTS[id].saga ? 2 : 1; return p; },
    maxPoints() { let p = 0; for (const id in QUESTS) p += QUESTS[id].saga ? 2 : 1; return p; },
    notifyKill(enemyKey) {
      for (const id in QUESTS) {
        if (state[id].status !== 'active') continue;
        QUESTS[id].objectives.forEach((o) => {
          if (o.type === 'kill' && o.enemy === enemyKey) {
            state[id].progress[o.id] = Math.min(o.count, (state[id].progress[o.id] || 0) + 1);
          }
        });
      }
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
      for (const id in QUESTS) {
        if (state[id].status !== 'active') continue;
        QUESTS[id].objectives.forEach((o) => { if (o.type === 'talk' && o.npc === npcKey) state[id].progress[o.id] = 1; });
      }
    },
    objectives(id) {
      const def = QUESTS[id];
      return def.objectives.map((o) => {
        const cnt = o.count || 1;
        const n = o.type === 'have' ? Math.min(cnt, G.inventory.count(o.item)) : Math.min(cnt, state[id].progress[o.id] || 0);
        return { text: objectiveText(o, n), done: n >= cnt };
      });
    },
    isReady(id) { return state[id] && state[id].status === 'active' && this.objectives(id).every((o) => o.done); },
    complete(id) {
      const def = QUESTS[id];
      if (!this.isReady(id)) return false;
      def.objectives.forEach((o) => { if (o.type === 'have') G.inventory.remove(o.item, o.count); });
      if (def.rewards.items) for (const k in def.rewards.items) G.inventory.add(k, def.rewards.items[k]);
      if (def.rewards.xp) for (const k in def.rewards.xp) G.skills.addXp(k, def.rewards.xp[k]);
      state[id].status = 'complete';
      refreshLocks();
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
