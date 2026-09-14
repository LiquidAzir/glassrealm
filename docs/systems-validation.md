# Gameplay systems audit — September 2026

This pass builds on the local terrain/collision fixes. It is validated locally and has not been deployed. Production remains the earlier visual release.

## Corrected behavior

- **Quests and dialogue:** rejected acceptance stays on the offer; unsuccessful turn-ins cannot grant finale items or change the ending; a completed quest cannot pay twice through callbacks. Completed objectives stay checked after materials are handed over. Quest XP uses the ordinary boosts, level-up, cape and faction pipeline. Talk progress saves immediately. Invalid/missing dialogue destinations close safely, and changing/replaced conversations cannot execute stale choices.
- **Quest guidance:** all 39 required material types resolve to a gathering node, enemy, missing ingredient or working service. All 113 ready quest givers resolve, including the six indoor figures. Guides lead to the correct exterior doorway and the relevant station inside. Autoplay keeps a stable gathering target while allowing crafting objectives to advance to their next ingredient or service.
- **Controls and menus:** visible tabs, rows and dialogue choices accept mouse/touch selection. Rapid confirmations no longer close an overlay or produce a trailing attack after leaving dialogue. Compass directions agree with movement, and quest arrows point to the correct side. Keyboard, touch controls and directional gestures remain available. Open business/farm ledgers refresh earnings while retaining the selected action and scroll position.
- **Saving and death:** crop identity, growth time and ready crops survive reloads. Saved graves remain reachable and return their contents exactly once. Worn equipment is a reference to a carried item; removing the final copy clears its bonuses and appearance. Banks can store duplicate equipment while retaining the worn copy. Invalid imports cannot overwrite valid local progress. Optional damaged save fields recover independently. Explicit imports become the newest local choice and skip one cloud pull so an older remote save cannot immediately replace them.
- **Starter equipment:** new classes receive their loadout as real inventory items, so unequipping does not lose them. A one-time legacy migration materializes known starter items that were worn but absent from the pack, bank and grave. New snapshots mark `equipmentOwnership: 1`, preventing repeated compensation. A pre-fix sold starter item is indistinguishable from a missing original kit; this limited migration can compensate that ambiguous case by one item.
- **Economy and farming:** frequent collection retains fractional earnings; new animals mature concurrently and only produce after adulthood. Later purchases start young, growth survives reloads, and clock rollback cannot pay an interval twice. Ownership and employee limits are checked before charging. Prices come from canonical definitions. Immediate vendor purchase/resale or alchemy loops cannot generate gold, including event and faction discounts.
- **Combat and progression:** projectiles apply damage, status and special splash on impact. Skill and stance credit follows the actual hit, including splash and damage over time. Enemy status is cleared on death/respawn; overkill cannot inflate lifesteal. Prayer drains and regenerates consistently in the world and interiors; menus pause it. Deterministic test stepping uses the same prayer update. Prestige removes effects whose skill requirements are no longer met while keeping the owned items. Level 99 no longer advertises a nonexistent next level.
- **Crafting and travel:** smelting processes large stacks as a single batch rather than an unbounded per-item UI/XP loop. Cancelled and already-here teleports give no XP or reputation. Explicit travel out of the Colosseum cleans up the run without pulling the player back to the arena. Travel clears pending projectiles and movement.

## Repeatable checks

Final gates pass: **61 Node tests**, **37 quest/UI browser checks**, **73 systems browser checks**, **52 existing navigation regressions**, and **9 economy browser checks**. A further 10 ordinary gameplay smoke checks and 5,400 live price combinations pass. Browser runs report no page errors. Six representative render captures stay below 100,000 triangles (maximum 95,500) at the existing 600×600 buffer.

Run the model, save, input, content and guidance suites from the repository root:

```sh
node --test tests/*.test.mjs
```

Browser tests use Playwright in fresh browser contexts and block non-local requests, including all cloud-save traffic. Serve the workspace with the repository at `/glassrealm/`, or set `REALM_URL` to your local game URL. Set `PLAYWRIGHT_PATH` to an installed Playwright package if it is not on the normal Node module path. Set `REALM_EVIDENCE` to choose an output directory.

```sh
node tests/dialogue.browser.cjs
node tests/systems.browser.cjs
```

The content checks traverse all 113 quests, their prerequisite chains, 65 dialogue trees and 207 authored nodes. They validate actual reward/item/skill/enemy/NPC references and exercise branches, refusal, re-entrancy and save round trips. Independent browser evidence includes genuine gathering and combat in the starter quest chain, mixed-objective saga dialogue, grave recovery over repeated reloads, planted crops, purchases, crafting cancellation/completion, prayer and prestige. Targeted combat cases set up controlled enemy HP and skill states to isolate impact timing and credit.

Full baseline/current reports, source hashes, screenshots and the isolated playable review are kept in the parent workspace under `.visual-review/realm-systems/`. The baseline is an immutable copy of the collision build, not the older production release.

## Limits

Validation uses desktop Chromium, software WebGL and a 600×600 game buffer. It does not certify physical display-glasses performance or neural-band hardware behavior. The cloud service and its protocol were not modified; network writes were blocked in all tests. This pass adds no visual assets, postprocessing or engine dependencies. Existing collision regression tests remain required.
