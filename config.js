// GlassRealm runtime config (plain <script>, loaded before the game module).
//
// AUTOMATIC CLOUD SAVE SYNC (optional):
//   1. Deploy the Cloudflare Worker in /worker (see worker/README.md).
//   2. Paste its URL below, e.g. cloudUrl: 'https://glassrealm-saves.you.workers.dev'
//   3. Commit + redeploy the site.
// Then every device that opens the game with the same ?u=<id> in the URL shares one
// save automatically (pull on load, push on save). On the keyboard-less glasses you
// just bookmark your personal link once (copy it from the Diary > Cloud sync menu).
//
// Leave cloudUrl blank to keep saves local-only (Export/Import codes still work).
window.GLASSREALM_CONFIG = { cloudUrl: '' };
