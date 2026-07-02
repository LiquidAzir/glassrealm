// Tiny CDP client: launch headless Chrome, load the game, collect page console
// messages + uncaught exceptions while the rAF loop renders (exercising shaders),
// then print anything that looks like a JS/WebGL error. No image inspection.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const URL = 'http://localhost:8137/index.html';
const TMP = await import('node:os').then(m => m.tmpdir()) + `\\gr-cdp-${process.pid}`;

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  '--headless=new',
  `--user-data-dir=${TMP}`,
  '--disable-gpu',
  '--use-gl=swiftshader',
  '--enable-webgl',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--window-size=600,600',
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

const chromeLog = [];
chrome.stderr.on('data', d => chromeLog.push(String(d)));

let ver;
for (let i = 0; i < 40; i++) {
  try {
    ver = await fetch(`http://localhost:${PORT}/json/version`);
    if (ver.ok) break;
  } catch {}
  await sleep(250);
}
if (!ver || !ver.ok) { console.error('CDP endpoint never came up'); chrome.kill(); process.exit(2); }

// Create a tab with our URL. /json/new expects a PUT (or GET on some builds).
let tab = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(URL)}`, { method: 'PUT' });
if (!tab.ok) tab = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(URL)}`);
const info = await tab.json();
const wsUrl = info.webSocketDebuggerUrl;
if (!wsUrl) { console.error('No webSocketDebuggerUrl'); chrome.kill(); process.exit(2); }

const ws = new WebSocket(wsUrl);
const events = [];
let id = 0;
const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));

ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.method === 'Runtime.consoleAPICalled') {
    const { type, args, stackTrace } = msg.params;
    const text = args.map(a => a.value ?? a.description ?? '').join(' ');
    events.push(`[console.${type}] ${text}${stackTrace?.callFrames?.length ? ' @ ' + stackTrace.callFrames[0].url + ':' + stackTrace.callFrames[0].lineNumber : ''}`);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    const txt = d.exception?.description || d.text || JSON.stringify(d);
    events.push(`[exception] ${txt}`);
  } else if (msg.method === 'Log.entryAdded') {
    const en = msg.params.entry;
    events.push(`[log.${en.level}] ${en.text}`);
  }
});

ws.addEventListener('open', () => {
  send('Runtime.enable');
  send('Log.enable');
  send('Runtime.setLogVerbosity', { level: 'verbose' });
});

// Let the rAF loop run ~7s of wall time so frames actually render + shaders compile.
await sleep(7000);

// Confirm the page actually booted + rendered frames (exercises the new shaders),
// and surface any errors caught by a page-side handler.
const evalReq = (expr) => new Promise((res) => {
  const myId = ++id;
  const h = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id === myId) { ws.removeEventListener('message', h); res(msg.result?.result?.value); }
  };
  ws.addEventListener('message', h);
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
});
const boot = await evalReq(`JSON.stringify({
  booted: !!window.__gr,
  hasEngine: !!(window.__gr && window.__gr.engine),
  hasWorld: !!(window.__gr && window.__gr.world),
  inGame: !!(window.__gr && window.__gr.G),
  renderCalls: window.__gr && window.__gr.engine && window.__gr.engine.renderer && window.__gr.engine.renderer.info && window.__gr.engine.renderer.info.render && window.__gr.engine.renderer.info.render.calls,
  programs: window.__gr && window.__gr.engine && window.__gr.engine.renderer && window.__gr.engine.renderer.info && window.__gr.engine.renderer.info.programs,
  pageErrors: (window.__grErrs || []),
  title: document.title,
})`);
console.log('--- boot state ---');
console.log(boot || 'EVAL FAILED (page may not have loaded)');

chrome.kill();
ws.close();

const errs = events.filter(s => /\b(error|exception|Uncaught|TypeError|ReferenceError|SyntaxError|RangeError|Shader|GL_|compile|undefined is not|cannot read)\b/i.test(s));
console.log(`--- ${events.length} console/log events, ${errs.length} flagged ---`);
for (const s of errs) console.log(s);
if (!errs.length) console.log('NO JS/SHADER ERRORS DETECTED');
// show a short tail of all events for context
console.log('--- last 15 events ---');
for (const s of events.slice(-15)) console.log(s);