# Glass Realm second visual pass — 2026-09-08

The user requested a further full visual pass and production deployment after verification. Both checkouts and GitHub main started at the previous production release, `cac4ffc311cd063b94c4634c63d11f804a5a315a`. The evidence for this pass is under workspace `.visual-review/realm-round2/`.

## Current changes

- Eight additional original Blender models bring the kit to 28 models and 2,859,819 bytes: detailed well, market stall, furnace, anvil, cauldron, articulated arm parts and shield. The original twenty model arrays remain unchanged by hash.
- Opaque building and station cutaways replace whole-building transparency. Foreground trees have a clear center and a narrow stippled edge around the player sightline. Ceiling ties disappear with cutaway ceilings.
- Path geometry is clipped to the exact terrain triangles: all 1,738 tested path triangles stay approximately 0.024 units above the ground. Decorative sampling never primes gameplay height caches.
- Fitted helmets and open hoods avoid intersecting the hair/face. Sleeves match equipped armor, shields follow the left arm, and swords have tapered blades, guards, grips and pommels. Bows have strings. Contact shading grounds the hero.
- One prioritized action plate replaces duplicate target labels. Labels and speech share a bounded layout that protects HUD, controls, hero and NPC faces. Notifications queue; XP, objectives and progress each have space. Normal station labels are fully readable.
- The castle, cathedral, forge hall and guildhall now use shared detailed people, carved furniture, grounded lantern holders, framed glass and readable floor palettes. Ceiling orbs and platform/boot intersections are removed. The snow arena's compact Frostmaw carving clears the existing trees inside the original collision footprint.

## Verification status

The completed build passes all objective checks. Final release approval is recorded by the independent critic in the workspace evidence before publication.

Completed independent checks: ten gameplay flows; twenty-two UI checks; ten interior types with four headings; screen/glasses 600×600 buffers without dynamic shadows; exact baseline/current resource and door XYZ hashes; procedural fallback with missing art; save/reload; banner layering; and zero runtime/shader errors. The preliminary 48-angle sweep improved from 34 views with label/HUD collisions and 37 prompts covering the hero to zero in both categories. An additional shopkeeper-face overlap found during inspection was corrected and independently rechecked.

The final 48-angle sweep also has zero nameplate/HUD/edge collisions and zero prompts over the player. All six deep-room service dialogues pass; all ten room types preserve exact stations, solids, bounds and entry records with and without the art kit. Five real browser touch checks at 390×844 pass. The final resource/door signature still matches cac4ffc after the Frostmaw correction. The final standard gameplay-client screenshot and state were inspected in `integration/client-release/`.

| World scene | Previous calls | Updated calls | Previous triangles | Updated triangles |
| --- | ---: | ---: | ---: | ---: |
| Village | 220 | 235 | 84,897 | 90,892 |
| Forest | 133 | 148 | 65,199 | 66,089 |
| Desert | 133 | 140 | 68,070 | 71,343 |
| Snow | 178 | 184 | 73,833 | 75,134 |
| Village at night | 243 | 250 | 89,161 | 94,953 |

All five matched **world** representatives remain below 100,000 triangles and within 25% draw-call growth. The expanded direction sweep peaks at 472 calls and 96,319 triangles. Animated NPC visibility causes modest run-to-run variation. The furnished bespoke interiors have a documented relative-cost exception: some exceed 25% growth from their sparse baseline, but the sampled maximum is only 119 calls and 8,488 triangles. Do not generalize the world-relative limit to every interior view.

The rendering buffer and 30Hz world-draw cap remain unchanged. No dynamic shadow maps, postprocessing, engine migration, new dependencies, controller changes, cloud worker or cloud configuration changes. Tests use isolated storage and intercept cloud requests. Physical glasses brightness, comfort and sustained performance have not been measured.

The final independent reports, matched performance counts, live release commit, and production file/browser checks are retained in `.visual-review/realm-round2/verification/` and `.visual-review/realm-round2/production/`. The local review page remains `.visual-review/realm/review.html`, now comparing this pass against cac4ffc and loading current runtime files in an isolated playable frame.

---

# First-release archive — 2026-09-08

The following records the earlier release. Its subjective scores and statements about remaining visual issues were superseded by the user's feedback and the second-pass critique above.

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
