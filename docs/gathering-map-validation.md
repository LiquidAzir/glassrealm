# Gathering and minimap polish

Local review against GitHub main `e3a8264ffc5ab745e3813de3ab49d28b54d8d832`.

## Result

Gathering faces the selected resource and uses a cached hatchet, pickaxe, rod, harpoon, ladle, or hammer. Foraging uses empty hands. Eased wind-up, contact, and recovery poses replace restarted arm pumping; reachable wrist targets keep the hands attached. Work hides combat equipment temporarily, and cancellation/completion restores it immediately. Existing gathering duration, speed benefits, rewards, XP, and equipment ownership remain authoritative.

The minimap samples the rendered terrain into a cached atlas. Coastlines, relief, paving, buildings, bridges, a compass bezel, and separated priority markers replace the old region discs. It preserves the 116px HUD footprint, north-up orientation, and indoor hiding. Sampling does not call the legacy gameplay height cache or consume world randomness.

## Verification

- 64 repository Node tests pass, including three new motion checks: continuous loop endpoints, reachable grips through 240 samples per action, and correct action/tool mappings. Run with `node --test tests/*.test.mjs` using a shell that expands the test paths, or pass the individual files to Node.
- 35 gathering lifecycle checks: normal interaction, target facing, cancellation, completion exactly once, upgraded tools, and unchanged reward/XP deltas against the immutable baseline.
- 31 independent map checks: 600×600 glasses view, 390×844 mobile view, all four heading directions, indoor/outdoor transitions, cache reuse, and no legacy height queries.
- 33 pose/cache/equipment checks across seven actions, including exact visible equipment restoration and sword/bow/staff/spear attack transitions.
- Four final owned-harpoon checks and five Journal/pause/return checks pass.
- Standard web-game client ran final chopping and mining sequences. Normal follow-camera and clear close-up wind-up/contact screenshots were inspected. No browser runtime errors were observed.

Tool models use two draw calls and160–280 triangles each. Geometry is shared and meshes are reused between work cycles. Warm map redraw measured0.10ms median/0.20ms p95; a forced terrain rebuild took6.6–10.6ms and occurs only after substantial travel. Representative scenes stayed below100k triangles, maximum90,948, at the unchanged600×600 rendering buffer. These desktop browser measurements do not establish physical glasses performance or comfort.

## Evidence and review

Workspace evidence is in `.visual-review/realm-gather-map/`, outside this repository. `VERIFICATION.md` and `independent-final.json` contain the independent verdict and source hashes; `node-tests.txt`, `current-tests/`, `reward-comparison.json`, `map-tests/`, `pose-tests/`, `final-harpoon/`, `final-scenes/`, and `skill-*-final/` retain results and screenshots. `minimap/` also contains matched before/after views and timing checks.

Comparison: <http://127.0.0.1:5433/>. Playable local preview: <http://127.0.0.1:5432/>. The preview server blanks cloud configuration in its HTTP response and uses a separate local origin; the repository configuration and production saves are unchanged. No deployment has been performed for this pass.
