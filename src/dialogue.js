import { DIALOGUE, NPC_GOSSIP, NPC_BRANCH } from './content.js';

// Runs a dialogue tree, driving the DOM via G.ui. Nodes may be plain objects or
// functions(G) returning a node so they react to quest/inventory state.
// Every NPC with an NPC_GOSSIP entry also gets an injected "Chat" branch → an
// "Ask about…" topic menu (personality / lore / opinions about other NPCs).
export function createDialogue(G) {
  let treeId = null, current = null, choiceIdx = 0, onClose = null;

  const backChoices = [{ label: '(Ask something else)', to: '__chat' }, { label: '(Farewell)', to: null }];
  function gossipNode(id) {
    const g = NPC_GOSSIP[treeId];
    const name = (g && g.name) || '';
    if (!g) return { speaker: name, text: '…', choices: [{ label: 'Farewell.', to: null }] };
    const topics = NPC_BRANCH[treeId] ? g.topics.concat([NPC_BRANCH[treeId]]) : g.topics;   // merge the one interactive branch
    if (id === '__chat') {
      const choices = topics.map((t, i) => ({ label: t.q, to: '__t' + i }));
      choices.push({ label: '(Farewell)', to: null });
      return { speaker: name, text: g.prompt || 'Ask away, then.', choices };
    }
    if (id.indexOf('__r') === 0) {   // the NPC reacts to a player reply: __r<topic>_<reply>
      const parts = id.slice(3).split('_'), t = topics[+parts[0]], rep = t && t.replies && t.replies[+parts[1]];
      return { speaker: name, text: rep ? rep.a : '…', choices: backChoices };
    }
    const ti = parseInt(id.slice(3), 10), t = topics[ti];   // __t<i>
    if (t && t.replies) {   // interactive topic: the NPC asks, the player chooses a reply
      const choices = t.replies.map((rep, j) => ({ label: rep.r, to: '__r' + ti + '_' + j }));
      choices.push({ label: '(Say nothing)', to: '__chat' });
      return { speaker: name, text: t.a, choices };
    }
    return { speaker: name, text: t ? t.a : '…', choices: backChoices };
  }
  const resolve = (id) => {
    if (typeof id === 'string' && id.indexOf('__') === 0) return gossipNode(id);   // synthetic gossip / reply nodes
    const raw = DIALOGUE[treeId][id];
    return typeof raw === 'function' ? raw(G) : raw;
  };
  const visibleChoices = () => ((current && current.choices) || []).filter((c) => !c.show || c.show(G));
  const render = () => G.ui.renderDialogue(current.speaker, current.text, visibleChoices(), choiceIdx);

  function close() {
    treeId = null; current = null;
    G.ui.hideDialogue();
    const cb = onClose; onClose = null;
    if (cb) cb();
  }
  function goto(id) {
    if (id == null) { close(); return; }
    current = resolve(id);
    if (id === 'root' && current && NPC_GOSSIP[treeId]) {   // offer a Chat branch on every NPC with gossip
      current = { ...current, choices: [...((current.choices) || []), { label: '❖ Chat', to: '__chat' }] };
    }
    choiceIdx = 0;
    render();
  }
  function open(tree, cb) { treeId = tree; onClose = cb || null; G.ui.showDialogue(); goto('root'); }
  function move(dir) {
    const c = visibleChoices();
    if (!c.length) return;
    choiceIdx = (choiceIdx + dir + c.length) % c.length;
    render();
  }
  function select() {
    const c = visibleChoices();
    if (!c.length) { close(); return; }
    const ch = c[choiceIdx];
    if (ch.action) ch.action(G);
    goto(ch.to !== undefined ? ch.to : null);
  }

  return { open, move, select, close, get active() { return !!current; } };
}
