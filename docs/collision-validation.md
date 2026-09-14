# Collision and traversal validation

Baseline: production `9a2d85eb0aea3bd9dd5f1a28c38c749551c34d4e`.

## Reproduced problems

- Walking perpendicular to the first stone bridge submerged the hero for 63 frames and moved backward for 39 frames while only Forward was held.
- A shoreline route produced a two-unit recovery jump during a normal 0.128-unit movement update. Nearby height queries could disagree about whether the same point was dry land.
- The Cinder Cone route placed feet over four units away from the visible ground. Some expansion regions had no rendered terrain beneath their characters.
- Home and waystone travel from indoors kept interior bounds and hid the overworld. Recovery could repeatedly choose an occupied NPC position.

## Movement contract

- A 0.28-unit foot radius reserves space at terrain, room and obstacle boundaries.
- Movement is swept in segments no longer than 0.12 units. Circular obstacle sweeps catch grazing collisions even when endpoints are clear.
- A blocked movement follows the boundary tangent when input points along it. Head-on input stops; releasing or reversing input takes effect without a remembered escape direction.
- Runtime support uses rendered ground and explicit crossing surfaces. The old procedural height functions remain available for deterministic resource generation and save compatibility.
- Relocations find a supported, unoccupied destination before changing room state. Failed searches return no destination instead of returning blocked coordinates.
- Dry ground reserves a 0.48-unit margin above nominal water, covering its animated wave envelope. Terrain now covers all expansion regions on the original grid lattice.
- Bridges retain collision for visible trees, rocks and props; rails prevent leaving the sides. The vine deck is 2.8 units wide so its original rock can be passed. Buried ore/boulder bodies do not create invisible obstacles above their actual geometry.
- NPCs and land creatures use the same support surface and swept movement. Waterfowl can still swim. Auto-Play holds its chosen target and stops with guidance after four seconds without progress.

## Repeatable checks

Run `node --test tests/collision.test.mjs` for nine movement tests: speed, walls at different angles, blocked and free corners, narrow corridors, reverse input, thin/grazing obstacles, frame-rate variation and 3,000 deterministic random movement steps.

Browser evidence is retained in the workspace `.visual-review/realm-collision/`. Each browser test uses isolated storage and blocks cloud saves. Screenshots require a healthy WebGL context and positive draw counts. Software-rendered timings do not certify physical display-glasses performance.

## Results

- All 42 land connections have a connected route inside the visible deck where applicable, with player-radius clearance and swept edges checked in both directions. Fourteen actual movement routes cover all seven land crossing types in both directions.
- The seven original shoreline, bridge and landscape routes have zero underwater or backward-motion frames, no movement step above the normal 0.128 units, and matching foot support.
- 1,161 independent raycast/footprint samples match rendered support. Extra synthetic tests include four rotated free-wall corners and 2cm-clearance corridors.
- All 52 travel, indoor, recovery and Auto-Play cases pass. Ten initial-character cases also pass: early input cannot enter a building, and an unchosen character is not automatically saved over the required class selection.
- Every one of the 124 doors has a supported, unoccupied landing within 0.5 units of its authored point. All 60 ferry/tunnel/gate, shortcut and waystone destinations land within interaction range (maximum adjustment 2.5 units).
- All 425 land actors spawn on valid ground; 750 actor update frames have no illegal swept movement. Waterfowl swimming remains available. NPCs and enemies follow the rendered ground.
- Ten ordinary gameplay flows and six deep-interior service dialogues pass. The standard game client screenshot/state and local review were visually inspected. The review works at 390px width with no horizontal overflow.
- Resource and door records exactly match the production baseline, including indices, counts, order and original coordinates/heights: 1,047 trees, 350 bushes, 202 ores, 193 fishing spots, 10 hives, 75 plots and 124 doors.
- Isolated CPU medians without rendering: idle player 0.012ms; free movement 0.066ms; held bridge boundary 0.786ms (p95 0.956ms); all-entity update 0.082ms. These measurements are from the development computer, not display glasses.

Evidence directories: `verification/current-connected-crossings`, `current-support`, `current-properties`, `current-synthetic`, `current-signature`, `current-physics`, and `navigation/`. Ordinary gameplay and preview checks are under `integration/`.

Final sequential rendering captures retain the 600×600 buffer, 30Hz draw cap and 28-model asset payload. Representative scenes stay below 100,000 triangles; maximum draw-call growth against the baseline is 3.1%. Requested locations are the same, but safer placement can adjust the exact landing coordinates.

| Scene | Draw calls | Triangles |
| --- | ---: | ---: |
| Village | 225 | 90,796 |
| Forest | 139 | 65,641 |
| Desert | 133 | 71,455 |
| Snow | 200 | 75,336 |
| Village at night | 246 | 95,104 |

The sequential village step median was 12.7ms versus 11.8ms before. Software rendering has large timing spikes, so the isolated physics numbers above better describe the collision cost. Physical glasses brightness, thermal behavior and sustained frame rate remain unmeasured.

No production deployment is included in this collision pass. The reviewed local changes are prepared for a subsequent release request.
