# GlassRealm

A 3D open-world RPG for **Meta Ray-Ban Display** glasses — built with WebGL (Three.js),
designed around the glasses' swipe + tap input and additive (black = transparent) display.

V1 is the **Verdant Isle**: a single low-poly island that runs every RPG system end-to-end —
free-roam movement, skills, quests with branching dialogue, combat, inventory, and save/load.

## Controls (swipe + tap only)

| Input | World | Menu / Dialogue |
|---|---|---|
| Swipe ↑ | Walk forward | Move selection up |
| Swipe ← / → | Turn left / right | Switch tab / choose option |
| Swipe ↓ | **Open menu** (Inventory · Skills · Quests · Map) | Move selection down |
| Tap | Interact (talk / chop / forage / attack / confirm) | Select / advance |
| Double-tap | Quick attack | **Close → back to world** |

Movement uses a short "coast" model so a single momentary swipe still moves you, while a
held swipe (or key-repeat) gives continuous motion — robust to however the EMG band delivers
the gesture. Double-tap is the universal "back" (built on the tap, which registers reliably
on-device). If double-tap proves unreliable on your unit, we can add an on-screen Close item.

## The slice

- **World:** procedural low-poly island — plains, beaches, a northern peak, a wood, and
  Hearth Village. Fog fades the world to black so it floats in your vision on the display.
- **Skills:** Combat, Woodcutting, Foraging — each levels via XP with on-screen feedback.
- **NPCs & dialogue:** Elder Maren, Ranger Coyle, Trader Pell — branching, state-aware dialogue.
- **Quests:** *Hearth & Home* (gather wood), *Sweet Harvest* (forage berries), *Boar Trouble*
  (combat; unlocks after the hearth quest). Live objective tracking + a quest log.
- **Combat:** roaming boars with aggro/chase/attack AI, loot drops, respawns.
- **Save/load:** position, skills, inventory, quests, and world edits (chopped trees /
  harvested bushes) persist to `localStorage`.

## Run locally

A dev server config is in `../.claude/launch.json` (name `glassrealm`). It uses `serve.py`,
a tiny no-store static server (plain `http.server` lets browsers cache ES modules and serve
stale code after edits). Manually:

```bash
cd glassrealm
python serve.py 5191
# open http://localhost:5191  — arrow keys = swipes, Enter/Space = tap, double Enter = double-tap
```

WASD also works for movement during desktop testing.

## Deploy to Render (static site)

The app is pure static files (HTML/CSS/JS + vendored Three.js), so a Render **Static Site**
is all you need — no build step.

1. Push this folder to a Git repo (or use the local-bundle deploy).
2. Render → **New → Static Site**.
3. **Root Directory:** `glassrealm` (if the repo holds multiple apps; otherwise leave blank).
4. **Build Command:** _(leave empty)_
5. **Publish Directory:** `.` (the directory containing `index.html`).
6. Deploy. Render serves over HTTPS with gzip/brotli (the ~1.2 MB Three.js compresses to
   ~330 KB over the wire).

Then add it to the glasses: Meta AI app → **Devices → Display Glasses → App connections →
Web apps → Add a web app**, and enter the Render HTTPS URL. (Or generate a QR deep-link.)

## Structure

```
glassrealm/
  index.html            # 600x600 canvas + HUD/menu/dialogue overlays + importmap
  styles.css            # additive-display palette, HUD, menu, dialogue, focus states
  lib/three.module.js   # vendored Three.js r160 (self-contained)
  src/
    main.js       # bootstrap, mode state machine (world/menu/dialogue), game loop, verbs
    engine.js     # renderer, camera, lights, fog
    input.js      # swipe/tap/double-tap → semantic actions (+ coast-friendly held keys)
    world.js      # procedural island: terrain, water, instanced trees/rocks/bushes, village
    player.js     # character mesh, third-person controller, collision, follow camera
    entities.js   # NPCs + boar AI
    interact.js   # nearest-interactable targeting
    ui.js         # HUD, 3D-projected markers, tabbed menu, minimap, dialogue box
    skills.js / inventory.js / quests.js / dialogue.js / content.js / save.js / util.js
```

## Tuning notes

- `player.js`: `SPEED`, `TURN`, `COAST_FWD`, `COAST_TURN`, camera distance/height.
- `engine.js`: fog near/far and light intensities (kept low so vivid colors don't blow out).
- `content.js`: all items, NPCs, dialogue trees, quests, enemies, and spawn points — the
  place to add content as the world grows beyond the first island.
