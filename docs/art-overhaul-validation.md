# Glass Realm artwork validation — 2026-09-08

GitHub main and both clean local checkouts were verified at `a9f729af1438b4b0ca0159c4fc5b33da1d879379` before work. Both `glassrealm` and `Glass Realm` contain the same verified artwork changes. The user approved production deployment on 2026-09-08; GitHub deployment statuses record the release outcome at https://glassrealm.onrender.com.

## Result

Twenty original Blender models replace the ordinary town buildings, major tree silhouettes, humanoid parts and selected furnishings. Terrain textures, paths, sparse grass and contact shadows add depth. The journal/HUD use a cohesive brass, linen and forest palette. The existing Three.js engine and gameplay systems remain in place; no Unity runtime or new controller support was introduced.

The editable scene is `assets/source/realm-kit.blend`; `scripts/build-realm-art.py` reproduces the exported kit and contact sheets. The runtime kit is 2,399,547 bytes uncompressed. Initial decoded resource bodies measured approximately 4.82 MB. The rendering buffer remains 600×600 with no dynamic shadow maps or postprocessing. World drawing is capped at 30Hz while simulation/input retain their existing timing.

## Independent verification

- Ten gameplay scenarios pass: class selection, real keyboard movement/turn, menu/back, four-swipe menu gesture, gathering and resource disappearance, dialogue/back, store entry/exit, equipment, enemy damage/defeat, isolated save/reload.
- Twenty-two UI checks pass, including all 14 journal tabs, initial selection visibility, long dialogue, touch-control clearance and phone/desktop layout.
- All ten building types accept entry and return to the correct exterior door.
- Explicit screen and glasses modes both render at 600×600. `?display=glasses` retains black surroundings for additive displays.
- No runtime, shader or missing-resource errors in normal operation. Deliberately blocking the art kit verifies the procedural fallback still starts and accepts movement.
- Exact SHA-256 comparisons match baseline x/y/z, identifiers and types for 1,047 trees, 350 bushes, 202 ore nodes, 193 fishing spots, 10 hives, 75 crop plots and 124 doors.
- Level-up banners remain behind dialogue choices. Blender furnishings are present in actual store/tavern scenes.

| Scene | Baseline calls | Final calls | Baseline triangles | Final triangles |
| --- | ---: | ---: | ---: | ---: |
| Starting village | 243 | 220 | 148,743 | 84,897 |
| Forest | 120 | 133 | 138,082 | 65,199 |
| Desert | 130 | 135 | 145,174 | 68,104 |
| Snow | 185 | 184 | 142,181 | 73,933 |
| Alternate village at night | 239 | 232 | — | 89,009 |

All representative world views are below 100,000 submitted triangles and within the draw-call budget (no more than 25% above the matched baseline). NPC animation/visibility can cause small run-to-run count differences. The furnished store entry uses 51 calls and 5,117 triangles, compared with 53 calls and 676 triangles previously.

Measurements use isolated Chromium/SwiftShader contexts with cloud requests blocked. CPU submission timing is not a measure of glasses GPU performance. Physical glasses brightness, comfort and sustained performance still require a device check.

## Review history and limitations

Independent screenshot scores are 7/10 for silhouette/material depth, environment cohesion and character readability, and 8/10 for UI clarity. Seven means a substantial improvement with known limits, not parity with RuneScape or Warcraft. No critical/high issues remain. Weapons, some characters and special landmarks retain simple low-poly shapes.

Earlier reviews caught and resolved foreground roofs hiding the hero, near interior walls hiding rooms, excessive roof-color contrast, a busy village exceeding rendering budgets, level-up banners covering dialogue, low night contrast and a tiny gameplay-height-cache side effect from decorative grass. Failed rounds and evidence remain in the workspace rather than being discarded.

Evidence and reusable browser harnesses are retained at workspace `.visual-review/realm/`: `state.json`, `review-2-final/`, `review-2-gameplay/`, `review-2-ui/`, `review-2-extra/`, `review-2-audit/`, `review-2-skill/`, `client-final-stable/`, `baseline.cjs`, `verify.cjs`, `extras.cjs` and `ui/verify.cjs`.

## Local review

With the workspace server on port 8097, open `http://127.0.0.1:8097/.visual-review/realm/review.html`. Its embedded game uses a separate browser save namespace and blocks cloud requests; its screenshots show the actual renderer, separately labeled from Blender asset studies. Review-page checks cover all comparison tabs, image loading, embedded class selection, save-slot isolation, display switching and 390px layout.

The initial local review was followed by explicit production approval on 2026-09-08. The existing Render static site deploys from this repository's `main` branch; the cloud save worker is a separate service and is not part of this artwork release.
