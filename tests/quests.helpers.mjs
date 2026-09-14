import { createQuests } from '../src/quests.js';
import { createInventory } from '../src/inventory.js';
import { createSkills } from '../src/skills.js';
import { QUESTS } from '../src/content.js';

export function makeGame(saved, level = 99) {
  const skills = createSkills();
  if (level > 1) for (const d of skills.DEFS) skills.addXp(d.key, 1e6);
  const G = { inventory: createInventory(), skills, sagaChoices: {}, toasts: [], renders: [], closes: 0, completed: [], accepted: [], xpAwards: [] };
  G.ui = { toast: (text) => G.toasts.push(text), showDialogue: () => {}, hideDialogue: () => G.closes++, renderDialogue: (speaker, text, choices, selected) => G.renders.push({ speaker, text, choices, selected }) };
  G.slayer = { active: true, enemy: 'boar', count: 3, progress: 3 };
  G.slayerAssign = () => { G.slayer = { active: true, enemy: 'boar', count: 3, progress: 0 }; return true; };
  G.slayerClaim = () => { G.slayer.active = false; return true; };
  G.onQuestAccepted = (id) => G.accepted.push(id);
  G.onQuestComplete = (id) => G.completed.push(id);
  G.gainXp = (key, amount) => { G.xpAwards.push({ key, amount }); return G.skills.addXp(key, amount); };
  G.sagaChoice = (id, outcome) => { G.sagaChoices[id] = outcome; };
  G.quests = createQuests(G, saved);
  return G;
}

export function questSave(id, status = 'available', ready = false) {
  const saved = {};
  for (const [key, def] of Object.entries(QUESTS)) saved[key] = { status: key === id ? status : 'complete', progress: Object.fromEntries(def.objectives.map(o => [o.id, key === id && ready ? (o.count || 1) : 0])) };
  return saved;
}

export function satisfy(G, id) {
  for (const o of QUESTS[id].objectives) {
    if (o.type === 'have') G.inventory.add(o.item, o.count || 1);
    else if (o.type === 'kill') for (let i = 0; i < (o.count || 1); i++) G.quests.notifyKill(o.enemy);
    else if (o.type === 'visit') G.quests.notifyVisit(o.x, o.z);
    else if (o.type === 'talk') G.quests.notifyTalk(o.npc);
  }
}
