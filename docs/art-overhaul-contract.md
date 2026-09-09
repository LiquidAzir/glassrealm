# Glass Realm visual overhaul

Request: major RuneScape-inspired fantasy graphics overhaul, with some Warcraft warmth and exaggerated silhouettes, using Blender. Playable on Meta Display glasses and ordinary screens. Latest GitHub main checked: a9f729af1438b4b0ca0159c4fc5b33da1d879379.

## Direction and references
- Reference towns: Old School RuneScape's Lumbridge; Warcraft Classic's Elwynn Forest. Original assets only; compare architectural rhythm, tactile materials, foliage silhouettes, warm/cool separation, and readable characters rather than copying content.
- Keep Three.js r160 and the existing game systems. Blender supplies real 3D geometry. No Unity runtime migration, new backend, or controller changes.
- Warm plaster, dark exposed timber, individually articulated roof courses, worn stone foundations, oversized readable doors, forest canopies, ground paths and vegetation. Calm brass/ink/linen interface with strong focus states.

## Ownership
- Integrator (root): src/world.js, src/engine.js, src/player.js, src/entities.js, src/main.js, src/shaders.js, new runtime art integration module; lighting, terrain, character appearance, integration and project state.
- Asset builder: scripts/build-realm-art.py, assets/realm-kit.json, assets/source/realm-kit.blend and asset documentation only. No runtime source edits.
- Interface builder: styles.css, index.html, optional assets/ui/* only. Preserve IDs, module/import paths, focus semantics and 600x600 fitting. Report changes needed in src/ui.js to the integrator.
- Verification/critic: .visual-review/realm/* only. Own isolated baseline/comparison, gameplay tests, performance evidence and independent quality review. Do not modify game runtime.

## Asset interface
Single JSON: {version:1, models:{key:{position:[...], normal:[...], color:[...], index:[...] optional}}, metadata:{...}}. Coordinates already transformed to Three.js: +Y up, +Z front, ground at Y=0; CCW triangles and linear RGB vertex colors. Each asset one merged geometry, one Lambert material and one draw call. Geometry includes its material/paint detail; no external textures required. Round exported floats to 4–5 decimals.
Building keys: home, store, bank, workshop, tavern, forge. Bodies fit x/z ±2.6; front door centered on +Z at 2.6; decorations must leave the door approach at Z=3.8 clear. Height 5.5–8.5, distinct silhouettes. Existing circular collisions stay radius 2.9; avoid large ground-level extensions outside that radius. Additional keys: oak, pine, rock, barrel, crate, lantern (ground origin; documented bounds). Optional further variants only after main assets are strong.
Trees: oak and pine complete trunk + canopy, about 5–6 units high and radius 1.8. Runtime will instance models and preserve tree IDs/removal, including biome tint. No change to resource placement, RNG sequence, collision or save identifiers.

## Verification and gates
- Capture real baseline and updated game at matching player/camera locations; include starting village, wooded area, at least two other biomes, character close-up, menu, dialogue and interior.
- Test real input: start/class picker, movement/turn, interact/dialogue, menu/back, resource gathering, combat, interior entry/exit, equipment and isolated save/reload. Block all remote/cloud requests in test contexts.
- No JS errors, WebGL shader errors, missing assets, hidden targets, broken saves or blocked doors. Main world stays runnable while work is integrated.
- Glasses render buffer stays 600x600, no dynamic shadow maps, no postprocessing, no additional per-frame CPU geometry generation. Initial goal: assets <6 MiB transferred uncompressed; representative scenes <100k visible triangles and draw calls no more than 25% above baseline. Measure actual baseline before enforcing tighter CPU targets; desktop/software GPU timings are not glasses certification.
- Independent review: score silhouette/material/depth, environment cohesion, character readability, UI clarity each 1–10 against references; 7 = clear substantial improvement with known limitations, 5 = still primitive/flat. Require every dimension >=7, no critical/high issues and objective tests passing. Do not claim AAA or hardware certification.
- At most four review rounds before reconsidering architecture/scope; retain failed rounds, ranked issues, metrics and next work queue in .visual-review/realm/state.json.
- The initial art pass produced a working local review. On 2026-09-08, the user approved publishing that reviewed build to the existing production site.
