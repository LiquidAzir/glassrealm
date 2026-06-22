import { DIALOGUE } from './content.js';

// Runs a dialogue tree, driving the DOM via G.ui. Nodes may be plain objects or
// functions(G) returning a node so they react to quest/inventory state.
// All handlers are inner functions so goto/select can call close().
export function createDialogue(G) {
  let treeId = null, current = null, choiceIdx = 0, onClose = null;

  const resolve = (id) => { const raw = DIALOGUE[treeId][id]; return typeof raw === 'function' ? raw(G) : raw; };
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
