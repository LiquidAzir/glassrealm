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
    accept(id) {
      if (state[id] && state[id].status === 'available') {
        state[id].status = 'active';
        if (G.onQuestAccepted) G.onQuestAccepted(id, QUESTS[id]);
      }
    },
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
    objectives(id) {
      const def = QUESTS[id];
      return def.objectives.map((o) => {
        const n = o.type === 'have' ? Math.min(o.count, G.inventory.count(o.item)) : (state[id].progress[o.id] || 0);
        return { text: objectiveText(o, n), done: n >= o.count };
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
