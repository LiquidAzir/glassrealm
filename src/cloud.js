// Optional automatic cloud save sync. Dormant unless config.js sets cloudUrl.
//
// The account id lives in the URL (?u=...) so a keyboard-less device (the glasses)
// only has to open one bookmarked link to share a save; otherwise we generate +
// persist one locally and expose a sharable link to open on other devices.
// Strategy: pull the cloud save on boot (last-write-wins by timestamp), push a
// debounced copy on save. Network failures degrade gracefully to local-only.
//
/* cloud-write-reduce-v1: push() is now content-deduped on a timestamp-zeroed signature,
   throttled (≥60s between non-flush pushes), and backed off ~60s after a failed write.
   save() no longer calls push — cloud writes are driven by main.js (5-min safety net +
   hide/pagehide flush). This keeps the shared Cloudflare KV namespace under the free-tier
   daily write cap. */

const UIDKEY = 'glassrealm.uid';

function makeId() {
  const a = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 14; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function createCloud() {
  const cfg = (typeof window !== 'undefined' && window.GLASSREALM_CONFIG) || {};
  const base = (cfg.cloudUrl || '').replace(/\/+$/, '');
  const enabled = !!base;

  // resolve account id: an explicit ?u= in the URL wins (sharable link) and is
  // remembered; otherwise reuse the stored one, or mint a fresh one.
  let uid = '';
  try {
    const p = new URLSearchParams(location.search).get('u');
    if (p) { uid = p; localStorage.setItem(UIDKEY, uid); }
    else { uid = localStorage.getItem(UIDKEY) || ''; if (!uid) { uid = makeId(); localStorage.setItem(UIDKEY, uid); } }
  } catch (e) { uid = uid || makeId(); }

  const url = () => `${base}/v1/save?u=${encodeURIComponent(uid)}`;
  let pushTimer = 0, lastSig = '', lastPushAt = 0, backoffUntil = 0;

  async function fetchTimeout(u, opts, ms) {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), ms);
    try { return await fetch(u, { ...opts, signal: c.signal }); }
    finally { clearTimeout(id); }
  }

  // signature = body with the always-changing timestamp `t` zeroed, so unchanged state
  // (and mobile screen-lock visibility storms) don't generate writes.
  function sigOf(obj) {
    try { return JSON.stringify(obj).replace(/"t"\s*:\s*\d+/g, '"t":0'); }
    catch (e) { return ''; }
  }

  return {
    enabled, uid,
    link() { try { return `${location.origin}${location.pathname}?u=${uid}`; } catch (e) { return '?u=' + uid; } },
    // pull the cloud save snapshot (or null on miss/error/timeout)
    async pull() {
      if (!enabled) return null;
      try {
        const r = await fetchTimeout(url(), { cache: 'no-store' }, 4500);
        if (!r.ok) return null;
        const j = await r.json();
        return j && j.data ? j.data : null;
      } catch (e) { return null; }
    },
    // push a snapshot object to the cloud.
    //   flush=true  → bypass throttle + debounce (used on hide/pagehide); still respects dedup.
    //   explicit=true → bypass backoff (manual force-save; still respects dedup).
    // back-compat: push(obj) works as push(obj, false, false).
    push(obj, flush, explicit) {
      if (!enabled || !obj) return;
      const sig = sigOf(obj);
      if (!sig || sig === lastSig) return;          // content-dedup: unchanged state writes nothing
      const now = Date.now();
      // throttle non-flush pushes to ≥60s apart
      if (!flush && now - lastPushAt < 60000) {
        clearTimeout(pushTimer);
        pushTimer = setTimeout(() => { push(obj, false, false); }, 60000 - (now - lastPushAt));
        return;
      }
      // backoff ~60s after a failed write; explicit manual push punches through
      if (!explicit && backoffUntil && now < backoffUntil) {
        clearTimeout(pushTimer);
        pushTimer = setTimeout(() => { push(obj, false, false); }, backoffUntil - now);
        return;
      }
      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        const body = JSON.stringify(obj);
        try {
          const r = await fetchTimeout(url(), { method: 'PUT', headers: { 'content-type': 'application/json' }, body }, 6000);
          if (r && r.ok) { lastSig = sig; lastPushAt = Date.now(); backoffUntil = 0; }
          else { backoffUntil = Date.now() + 60000; }   // failed write → back off, do NOT mark synced
        } catch (e) { backoffUntil = Date.now() + 60000; }
      }, flush ? 0 : 2500);
    },
    // baseline the signature after a successful pull-adopt so we don't immediately echo
    // the just-adopted save back to the cloud as a "new" write.
    markSynced(obj) { if (enabled && obj) { const s = sigOf(obj); if (s) lastSig = s; } },
  };
}