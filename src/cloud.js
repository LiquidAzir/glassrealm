// Optional automatic cloud save sync. Dormant unless config.js sets cloudUrl.
//
// The account id lives in the URL (?u=...) so a keyboard-less device (the glasses)
// only has to open one bookmarked link to share a save; otherwise we generate +
// persist one locally and expose a sharable link to open on other devices.
// Strategy: pull the cloud save on boot (last-write-wins by timestamp), push a
// debounced copy on every save. Network failures degrade gracefully to local-only.

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
  let pushTimer = 0, lastSent = '';

  async function fetchTimeout(u, opts, ms) {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), ms);
    try { return await fetch(u, { ...opts, signal: c.signal }); }
    finally { clearTimeout(id); }
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
    // push a snapshot object to the cloud (debounced; skips no-op repeats)
    push(obj) {
      if (!enabled || !obj) return;
      const body = JSON.stringify(obj);
      if (body === lastSent) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        lastSent = body;
        try { await fetchTimeout(url(), { method: 'PUT', headers: { 'content-type': 'application/json' }, body }, 6000); } catch (e) {}
      }, 2500);
    },
  };
}
