// All game data for the Verdant Isle slice: items, NPCs, dialogue, quests, enemies.
// Dialogue nodes may be objects or functions(G) returning a node, so they can react
// to quest/inventory state. Quest objectives are data the quest system interprets.

export const ITEMS = {
  wood:   { name: 'Driftwood',   icon: '🪵', type: 'material',   desc: "Sturdy wood from the isle's trees." },
  berry:  { name: 'Sunberries',  icon: '🍇', type: 'consumable', heal: 12, desc: 'Tart island berries. Restores 12 HP.' },
  herb:   { name: 'Glimmerleaf', icon: '🌿', type: 'material',   desc: 'A faintly glowing herb.' },
  pelt:   { name: 'Boar Pelt',   icon: '🟫', type: 'material',   desc: 'Coarse hide from a wild boar.' },
  meat:   { name: 'Cooked Meat', icon: '🍖', type: 'consumable', heal: 22, desc: 'Restores 22 HP.' },
  potion: { name: 'Salve Flask', icon: '🧪', type: 'consumable', heal: 45, desc: 'Restores 45 HP.' },
  gold:   { name: 'Gold',        icon: '🪙', type: 'currency',   desc: 'Island coin.' },
  relic:  { name: 'Tide Relic',  icon: '🔱', type: 'quest',      desc: 'An ancient relic humming with power.' },
  // --- Expansion IV quest materials + rewards ---
  tideglass:     { name: 'Tideglass',      icon: '🔷', type: 'material', desc: 'Shore-light pooled and hardened in the wet sand of Duskmere.' },
  lantern_oil:   { name: 'Lantern Oil',    icon: '🛢️', type: 'material', desc: 'Rendered glowmoth wax — fuel for the boardwalk lamps.' },
  aurora_quartz: { name: 'Aurora-Quartz',  icon: '🔮', type: 'material', desc: 'Summit ice that holds a sliver of the sky-fire. Scryable.' },
  frost_iron:    { name: 'Frost-Iron',     icon: '⛓️', type: 'material', desc: 'Cold-forged iron from the buried tunnels of Hoarfast.' },
  amethyst_wisp: { name: 'Amethyst-Wisp',  icon: '🟣', type: 'material', desc: 'A drifting violet wisp from the abyss edge. It almost speaks.' },
  brine_silver:  { name: 'Brine-Silver',   icon: '🩶', type: 'material', desc: 'A silver vein raked from the deepest rose-salt pans.' },
  dreamlight_lantern: { name: 'Dreamlight Lantern', icon: '🏮', type: 'amulet', bonus: { magic: 8, maxhp: 20 }, desc: "Holds the Dreamward's freed glow. +8 magic, +20 max HP." },
  skyfire_quartz: { name: 'Skyfire Quartz', icon: '📿', type: 'amulet', bonus: { magic: 10, maxhp: 15 }, desc: 'The thawed voice of the aurora, bound in quartz. +10 magic, +15 max HP.' },
  voidwarden_cloak: { name: 'Voidwarden Cloak', icon: '🧥', type: 'amulet', bonus: { def: 10, maxhp: 25 }, desc: "Woven from the abyss edge's own hush. +10 defence, +25 max HP." },
  mirrorsalt_ring: { name: 'Mirrorsalt Ring', icon: '💍', type: 'ring', bonus: { melee: 6, def: 5 }, desc: 'Rose-salt set in silver. +6 melee, +5 defence.' },
  // --- Branch-finale alternates (the "other path" reward; distinct stat profile, so the choice is real) ---
  tidewardens_pact: { name: "Tidewarden's Pact", icon: '🔱', type: 'amulet', bonus: { def: 8, maxhp: 30 }, desc: 'You re-pledged Duskmere to the sleeper, and took up the keeping. +8 defence, +30 max HP.' },
  hoarfrost_heart:  { name: 'Hoarfrost Heart',   icon: '❄️', type: 'amulet', bonus: { melee: 8, def: 6 },  desc: "The Heart kept dormant, bound to its listener. +8 melee, +6 defence." },
  edgewardens_seal: { name: "Edgewarden's Seal", icon: '🕯️', type: 'amulet', bonus: { magic: 8, def: 8 },  desc: 'You refused the bargain and hold the edge yourself. +8 magic, +8 defence.' },
  salt_barons_signet: { name: "Salt-Baron's Signet", icon: '💍', type: 'ring', bonus: { magic: 6, maxhp: 15 }, desc: "Cael Bittersong's seal — a partner's cut of the pink. +6 magic, +15 max HP." },
  // --- Cindughol (obsidian caldera) ---
  obsidian_tear:   { name: 'Obsidian Tear',   icon: '🩸', type: 'material', desc: 'A flawed obsidian shard that still holds the scream it cooled around.' },
  molten_glass:    { name: 'Molten Glass',    icon: '🟠', type: 'material', desc: 'Half-cooled caldera glass, warm and faintly singing.' },
  glasswake_heart: { name: 'Glasswake Heart', icon: '🖤', type: 'amulet', bonus: { melee: 9, def: 6 },  desc: 'Cut from the shattered Glasswake — proof the screaming stopped. +9 melee, +6 defence.' },
  whispering_glass:{ name: 'Whispering Glass', icon: '🔮', type: 'amulet', bonus: { magic: 9, maxhp: 20 }, desc: 'The Glasswake cooled, not killed; its memories whisper to you still. +9 magic, +20 max HP.' },
  // --- Frontier dungeon boss weapons (Expansion IV Batch 5) ---
  dreamtide_staff:   { name: 'Dreamtide Staff',   icon: '🪄', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 28, range: 16,  speed: 0.66, desc: "The Lantern-Drowned's staff, lit from within. +28 magic." },
  rimeforged_axe:    { name: 'Rimeforged Axe',    icon: '🪓', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 30, range: 3.0, speed: 0.46, desc: "The Rimewright's cold-forged axe. +30 melee." },
  glassmaw_bow:      { name: 'Glassmaw Bow',      icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 28, range: 18,  speed: 0.54, desc: 'Strung from fused obsidian, it sings when drawn. +28 ranged.' },
  voidedge_blade:    { name: 'Voidedge Blade',    icon: '⚔️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 32, range: 2.9, speed: 0.42, desc: "The Hollowed Warden's blade, edged with abyss. +32 melee." },
  brinesong_trident: { name: 'Brinesong Trident', icon: '🔱', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 34, range: 3.2, speed: 0.5,  desc: "The Brinemother's trident, humming with the tide. +34 melee." },

  copper_ore: { name: 'Copper Ore', icon: '🟠', type: 'material', desc: 'Raw copper, smelts into a bronze bar.' },
  iron_ore:   { name: 'Iron Ore',   icon: '🔩', type: 'material', desc: 'Raw iron, smelts with coal into an iron bar.' },
  coal:       { name: 'Coal',       icon: '🪨', type: 'material', desc: 'Fuel for smelting iron.' },
  bronze_bar: { name: 'Bronze Bar', icon: '🟫', type: 'material', desc: 'Forge it into bronze gear at an anvil.' },
  iron_bar:   { name: 'Iron Bar',   icon: '⬜', type: 'material', desc: 'Forge it into iron or steel gear at an anvil.' },
  mithril_ore: { name: 'Mithril Ore', icon: '🔷', type: 'material', desc: 'A rare blue ore — smelt with coal into mithril.' },
  mithril_bar: { name: 'Mithril Bar', icon: '🟦', type: 'material', desc: 'Forge it into mithril gear at an anvil.' },
  mithril_sword:  { name: 'Mithril Sword',  icon: '⚔️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 19, range: 2.7, speed: 0.42, desc: 'A keen mithril blade. +19 melee.' },
  mithril_armor:  { name: 'Mithril Armor',  icon: '🛡️', type: 'armor',  defense: 18, desc: 'Light, strong mithril plate. -18 damage taken.' },
  mithril_shield: { name: 'Mithril Shield', icon: '🛡️', type: 'shield', defense: 18, desc: 'A gleaming mithril shield. Blocks 18 damage.' },
  // Toolsmithing — better tools (auto-used from your pack) speed up gathering. Forged at the anvil.
  bronze_pickaxe:  { name: 'Bronze Pickaxe',  icon: '⛏️', type: 'tool', tool: 'mining',      tier: 1, speed: 0.85, desc: 'Mine ~15% faster.' },
  iron_pickaxe:    { name: 'Iron Pickaxe',    icon: '⛏️', type: 'tool', tool: 'mining',      tier: 2, speed: 0.72, desc: 'Mine ~28% faster.' },
  steel_pickaxe:   { name: 'Steel Pickaxe',   icon: '⛏️', type: 'tool', tool: 'mining',      tier: 3, speed: 0.62, desc: 'Mine ~38% faster.' },
  mithril_pickaxe: { name: 'Mithril Pickaxe', icon: '⛏️', type: 'tool', tool: 'mining',      tier: 4, speed: 0.52, desc: 'Mine ~48% faster.' },
  bronze_hatchet:  { name: 'Bronze Hatchet',  icon: '🪓', type: 'tool', tool: 'woodcutting', tier: 1, speed: 0.85, desc: 'Chop ~15% faster.' },
  iron_hatchet:    { name: 'Iron Hatchet',    icon: '🪓', type: 'tool', tool: 'woodcutting', tier: 2, speed: 0.72, desc: 'Chop ~28% faster.' },
  steel_hatchet:   { name: 'Steel Hatchet',   icon: '🪓', type: 'tool', tool: 'woodcutting', tier: 3, speed: 0.62, desc: 'Chop ~38% faster.' },
  mithril_hatchet: { name: 'Mithril Hatchet', icon: '🪓', type: 'tool', tool: 'woodcutting', tier: 4, speed: 0.52, desc: 'Chop ~48% faster.' },
  bronze_harpoon:  { name: 'Bronze Harpoon',  icon: '🔱', type: 'tool', tool: 'fishing',     tier: 1, speed: 0.85, desc: 'Fish ~15% faster.' },
  iron_harpoon:    { name: 'Iron Harpoon',    icon: '🔱', type: 'tool', tool: 'fishing',     tier: 2, speed: 0.72, desc: 'Fish ~28% faster.' },
  steel_harpoon:   { name: 'Steel Harpoon',   icon: '🔱', type: 'tool', tool: 'fishing',     tier: 3, speed: 0.62, desc: 'Fish ~38% faster.' },
  mithril_harpoon: { name: 'Mithril Harpoon', icon: '🔱', type: 'tool', tool: 'fishing',     tier: 4, speed: 0.52, desc: 'Fish ~48% faster.' },
  // Fletching — Woodcutting feeds Ranged: carve bows + arrow shafts, then feather them into arrows (ammo).
  feather:       { name: 'Feather',        icon: '🪶', type: 'material', desc: 'Fletch arrows. Foraged in the wild.' },
  arrow_shaft:   { name: 'Arrow Shafts',   icon: '🪵', type: 'material', desc: 'Carved from logs; tip + feather them into arrows.' },
  shortbow:      { name: 'Shortbow',       icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 4,  range: 12, speed: 0.5,  desc: 'Quick, light draw. +4 ranged.' },
  longbow:       { name: 'Longbow',        icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 10, range: 17, speed: 0.82, desc: 'Long reach, slow draw. +10 ranged.' },
  bronze_arrow:  { name: 'Bronze Arrows',  icon: '🏹', type: 'ammo', bonus: 3,  desc: 'Tipped with bronze. +3 ranged damage per shot.' },
  iron_arrow:    { name: 'Iron Arrows',    icon: '🏹', type: 'ammo', bonus: 6,  desc: 'Tipped with iron. +6 ranged damage per shot.' },
  mithril_arrow: { name: 'Mithril Arrows', icon: '🏹', type: 'ammo', bonus: 11, desc: 'Tipped with mithril. +11 ranged damage per shot.' },
  // Runecrafting + Enchanting — Magic's resource chain: mine essence, bind runes, enchant jewelry.
  rune_essence: { name: 'Rune Essence', icon: '🔮', type: 'material', desc: 'Raw essence; bind it into runes at a rune altar.' },
  air_rune:     { name: 'Air Runes',    icon: '🌀', type: 'rune', bonus: 2, desc: 'Spell ammo. +2 magic damage per cast.' },
  earth_rune:   { name: 'Earth Runes',  icon: '🪨', type: 'rune', bonus: 3, desc: 'Spell ammo. +3 magic damage per cast.' },
  water_rune:   { name: 'Water Runes',  icon: '💧', type: 'rune', bonus: 4, desc: 'Spell ammo. +4 magic damage per cast.' },
  fire_rune:    { name: 'Fire Runes',   icon: '🔥', type: 'rune', bonus: 6, desc: 'Spell ammo. +6 magic damage per cast.' },
  rune_ring:    { name: 'Runed Ring',   icon: '💍', type: 'ring',   bonus: { magic: 6, def: 4 }, desc: 'Enchanted. +6 magic, +4 defence.' },
  rune_amulet:  { name: 'Runed Amulet', icon: '📿', type: 'amulet', bonus: { magic: 10 },        desc: 'Enchanted. +10 magic.' },
  // Construction — Woodcutting feeds your home: saw logs into planks, build home furniture/services.
  plank:        { name: 'Plank', icon: '🪵', type: 'material', desc: 'Sawn from logs at a sawmill. Build home furniture.' },
  // Potions (Herblore, brewed at a cauldron) — timed combat buffs + cures. Drunk from the pack.
  strength_potion: { name: 'Strength Potion', icon: '🧪', type: 'potion', buff: 'strength', mult: 1.18, dur: 90, col: 0xff6a4a, desc: 'Drink: +18% melee damage for 90s.' },
  ranging_potion:  { name: 'Ranging Potion',  icon: '🧪', type: 'potion', buff: 'ranging',  mult: 1.18, dur: 90, col: 0x6ad06a, desc: 'Drink: +18% ranged damage for 90s.' },
  magic_potion:    { name: 'Magic Potion',    icon: '🧪', type: 'potion', buff: 'magic',    mult: 1.18, dur: 90, col: 0x6a9aff, desc: 'Drink: +18% magic damage for 90s.' },
  defence_potion:  { name: 'Defence Potion',  icon: '🧪', type: 'potion', buff: 'defence',  mult: 0.82, dur: 90, col: 0xc0c8d6, desc: 'Drink: take 18% less damage for 90s.' },
  antidote:        { name: 'Antidote',        icon: '🧴', type: 'potion', cure: 'poison',   dur: 120, col: 0x9ad06a, desc: 'Drink: cures poison + 120s immunity.' },
  venom_flask:     { name: 'Venom Flask',     icon: '🧪', type: 'potion', buff: 'venom',     mult: 1, dur: 60, col: 0x6ad06a, desc: 'Drink: your hits poison foes for 60s.' },
  prayer_potion:   { name: 'Prayer Potion',   icon: '🧪', type: 'potion', restorePrayer: 40, col: 0xffe066, desc: 'Drink: restore 40 prayer.' },
  // Foraging/beekeeping brews (unique outputs so the cauldron can select them)
  honey_mead:      { name: 'Honey Mead',      icon: '🍺', type: 'potion', buff: 'strength', mult: 1.15, dur: 80, col: 0xf0b040, desc: 'Drink: +15% melee damage for 80s.' },
  fungal_tonic:    { name: 'Fungal Tonic',    icon: '🍄', type: 'potion', buff: 'defence',  mult: 0.85, dur: 80, col: 0x9ad06a, desc: 'Drink: take 15% less damage for 80s.' },
  nectar_tonic:    { name: 'Nectar Tonic',    icon: '🌼', type: 'potion', restorePrayer: 30, col: 0xffe066, desc: 'Drink: restore 30 prayer.' },
  clue_scroll:     { name: 'Clue Scroll',      icon: '📜', type: 'clue', desc: 'Tap to read — a treasure trail to a hidden reward casket.' },
  // Farm produce — collected from your livestock, sold at the Farm Foreman.
  egg:  { name: 'Egg',  icon: '🥚', type: 'material', desc: 'Fresh from your hens. Sell at the farm.' },
  milk: { name: 'Milk', icon: '🥛', type: 'material', desc: 'From your dairy cows. Sell at the farm.' },
  wool: { name: 'Wool', icon: '🧶', type: 'material', desc: 'Shorn from your sheep. Sell at the farm.' },

  raw_shrimp:    { name: 'Raw Shrimp', icon: '🦐', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  raw_trout:     { name: 'Raw Trout',  icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_shrimp: { name: 'Shrimp',     icon: '🍤', type: 'consumable', heal: 14, desc: 'Cooked. Restores 14 HP.' },
  cooked_trout:  { name: 'Trout',      icon: '🍤', type: 'consumable', heal: 26, desc: 'Cooked. Restores 26 HP.' },

  // ---- Expansion: gathering catches (fish tiers, logs, ores, crops) ----
  // Fishing: catches unlock with Fishing level; cook them at a stove (see FISH + COOK).
  raw_sardine:      { name: 'Raw Sardine',    icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_sardine:   { name: 'Sardine',        icon: '🍤', type: 'consumable', heal: 20, desc: 'Cooked. Restores 20 HP.' },
  raw_herring:      { name: 'Raw Herring',    icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_herring:   { name: 'Herring',        icon: '🍤', type: 'consumable', heal: 24, desc: 'Cooked. Restores 24 HP.' },
  raw_bass:         { name: 'Raw Bass',       icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_bass:      { name: 'Bass',           icon: '🍤', type: 'consumable', heal: 30, desc: 'Cooked. Restores 30 HP.' },
  raw_salmon:       { name: 'Raw Salmon',     icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_salmon:    { name: 'Salmon',         icon: '🍣', type: 'consumable', heal: 34, desc: 'Cooked. Restores 34 HP.' },
  raw_pike:         { name: 'Raw Pike',       icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_pike:      { name: 'Pike',           icon: '🍤', type: 'consumable', heal: 38, desc: 'Cooked. Restores 38 HP.' },
  raw_tuna:         { name: 'Raw Tuna',       icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_tuna:      { name: 'Tuna',           icon: '🍣', type: 'consumable', heal: 44, desc: 'Cooked. Restores 44 HP.' },
  raw_lobster:      { name: 'Raw Lobster',    icon: '🦞', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_lobster:   { name: 'Lobster',        icon: '🦞', type: 'consumable', heal: 50, desc: 'Cooked. Restores 50 HP.' },
  raw_swordfish:    { name: 'Raw Swordfish',  icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_swordfish: { name: 'Swordfish',      icon: '🍽️', type: 'consumable', heal: 58, desc: 'Cooked. Restores 58 HP.' },
  raw_shark:        { name: 'Raw Shark',      icon: '🦈', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_shark:     { name: 'Shark',          icon: '🦈', type: 'consumable', heal: 68, desc: 'Cooked. Restores 68 HP.' },
  raw_anglerfish:   { name: 'Raw Anglerfish', icon: '🐡', type: 'material',   desc: 'The deep’s prize. Cook it at a fire.' },
  cooked_anglerfish:{ name: 'Anglerfish',     icon: '🐡', type: 'consumable', heal: 80, desc: 'Cooked. Restores 80 HP.' },

  // Woodcutting: better logs drop as Woodcutting rises (see LOGS). 'wood' (Driftwood) already exists.
  oak_log:    { name: 'Oak Logs',    icon: '🪵', type: 'material', desc: 'Sturdy oak. Sells well.' },
  willow_log: { name: 'Willow Logs', icon: '🪵', type: 'material', desc: 'Supple willow, prized by bowyers.' },
  maple_log:  { name: 'Maple Logs',  icon: '🪵', type: 'material', desc: 'Dense, hard-grained maple.' },
  yew_log:    { name: 'Yew Logs',    icon: '🪵', type: 'material', desc: 'Ancient yew — a fine, rare wood.' },
  magic_log:  { name: 'Magic Logs',  icon: '🪵', type: 'material', desc: 'Faintly humming, arcane timber.' },

  // Mining: new ores + their bars (smelt at a furnace, see SMELT).
  silver_ore:  { name: 'Silver Ore',     icon: '🪨', type: 'material', desc: 'Smelts into a silver bar.' },
  silver_bar:  { name: 'Silver Bar',     icon: '🥈', type: 'material', desc: 'Bright metal for fine work.' },
  gold_ore:    { name: 'Gold Ore',       icon: '🪨', type: 'material', desc: 'Smelts into a gold bar.' },
  gold_bar:    { name: 'Gold Bar',       icon: '🥇', type: 'material', desc: 'Gleaming and precious.' },
  adamant_ore: { name: 'Adamantite Ore', icon: '🪨', type: 'material', desc: 'Smelt with coal into an adamant bar.' },
  adamant_bar: { name: 'Adamant Bar',    icon: '🔩', type: 'material', desc: 'Tough green-black alloy.' },
  runite_ore:  { name: 'Runite Ore',     icon: '🪨', type: 'material', desc: 'Smelt with coal into a runite bar.' },
  runite_bar:  { name: 'Runite Bar',     icon: '🔷', type: 'material', desc: 'The finest smithing metal on the isle.' },

  // Foraging: rarer finds at higher Foraging level (feed the cauldron, see BREW).
  mushroom: { name: 'Cave Mushroom',      icon: '🍄', type: 'material', desc: 'An earthy fungus for brewing.' },
  nectar:   { name: 'Wildflower Nectar',  icon: '🌼', type: 'material', desc: 'Sweet nectar for restorative tonics.' },

  // Beekeeping: rob a beehive (Foraging) for honey + beeswax → mead, honeyed meals, candles.
  honey:       { name: 'Honey',           icon: '🍯', type: 'material',   desc: 'Sweet, sticky honey. Brews mead; glazes fine meals.' },
  beeswax:     { name: 'Beeswax',         icon: '🐝', type: 'material',   desc: 'Golden wax. Craft it into candles.' },
  wax_candle:  { name: 'Beeswax Candle',  icon: '🕯️', type: 'material',   desc: 'A clean, bright candle. Sells for a good price.' },
  honey_glazed:{ name: 'Honey-Glazed Salmon', icon: '🍯', type: 'consumable', heal: 55, desc: 'Sweet and hearty. Restores 55 HP.' },

  // Farming: seeds → produce (see CROPS). 'seeds'/'crop' (Isle Greens) already exist.
  carrot_seed:  { name: 'Carrot Seeds',  icon: '🌱', type: 'material',   desc: 'Plant in a field plot.' },
  carrot:       { name: 'Carrot',        icon: '🥕', type: 'consumable', heal: 6,  desc: 'Crunchy. Restores 6 HP.' },
  potato_seed:  { name: 'Potato Seeds',  icon: '🌱', type: 'material',   desc: 'Plant in a field plot.' },
  potato:       { name: 'Potato',        icon: '🥔', type: 'material',   desc: 'Bake it at a stove.' },
  baked_potato: { name: 'Baked Potato',  icon: '🥔', type: 'consumable', heal: 22, desc: 'Cooked. Restores 22 HP.' },
  corn_seed:    { name: 'Corn Seeds',    icon: '🌱', type: 'material',   desc: 'Plant in a field plot.' },
  corn:         { name: 'Corn',          icon: '🌽', type: 'consumable', heal: 10, desc: 'Sweet corn. Restores 10 HP.' },
  pumpkin_seed: { name: 'Pumpkin Seeds', icon: '🌱', type: 'material',   desc: 'Plant in a field plot.' },
  pumpkin:      { name: 'Pumpkin',       icon: '🎃', type: 'material',   desc: 'A hefty gourd — sells for a tidy sum.' },

  // ---- Expansion: smithable adamant & runite gear (forge from bars at an anvil) ----
  adamant_sword:  { name: 'Adamant Sword',  icon: '⚔️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 26, range: 2.8, speed: 0.4,  desc: 'A brutal adamant blade. +26 melee.' },
  adamant_armor:  { name: 'Adamant Armor',  icon: '🛡️', type: 'armor',  defense: 24, desc: 'Heavy adamant plate. -24 damage taken.' },
  adamant_shield: { name: 'Adamant Shield', icon: '🛡️', type: 'shield', defense: 24, desc: 'A broad adamant shield. Blocks 24 damage.' },
  runite_sword:   { name: 'Runite Sword',   icon: '⚔️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 34, range: 2.9, speed: 0.38, desc: 'A rune-forged greatblade. +34 melee.' },
  runite_armor:   { name: 'Runite Armor',   icon: '🛡️', type: 'armor',  defense: 30, desc: 'Masterwork runite plate. -30 damage taken.' },
  runite_shield:  { name: 'Runite Shield',  icon: '🛡️', type: 'shield', defense: 30, desc: 'A flawless runite shield. Blocks 30 damage.' },
  adamant_pickaxe: { name: 'Adamant Pickaxe', icon: '⛏️', type: 'tool', tool: 'mining',      tier: 5, speed: 0.44, desc: 'Mine ~56% faster.' },
  adamant_hatchet: { name: 'Adamant Hatchet', icon: '🪓', type: 'tool', tool: 'woodcutting', tier: 5, speed: 0.44, desc: 'Chop ~56% faster.' },
  adamant_harpoon: { name: 'Adamant Harpoon', icon: '🔱', type: 'tool', tool: 'fishing',     tier: 5, speed: 0.44, desc: 'Fish ~56% faster.' },
  runite_pickaxe:  { name: 'Runite Pickaxe',  icon: '⛏️', type: 'tool', tool: 'mining',      tier: 6, speed: 0.38, desc: 'Mine ~62% faster.' },
  runite_hatchet:  { name: 'Runite Hatchet',  icon: '🪓', type: 'tool', tool: 'woodcutting', tier: 6, speed: 0.38, desc: 'Chop ~62% faster.' },
  runite_harpoon:  { name: 'Runite Harpoon',  icon: '🔱', type: 'tool', tool: 'fishing',     tier: 6, speed: 0.38, desc: 'Fish ~62% faster.' },

  // ---- Fletchable bows (from logs) + arrows (from bars) at a Fletching bench ----
  oak_longbow: { name: 'Oak Longbow',    icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 12, range: 16, speed: 0.72, desc: 'Fletched from oak. +12 ranged.' },
  willow_bow:  { name: 'Willow Longbow', icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 16, range: 16, speed: 0.7,  desc: 'A supple willow bow. +16 ranged.' },
  maple_bow:   { name: 'Maple Longbow',  icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 19, range: 17, speed: 0.68, desc: 'A hard maple bow. +19 ranged.' },
  yew_longbow: { name: 'Yew Longbow',    icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 22, range: 18, speed: 0.66, desc: 'A great yew warbow. +22 ranged.' },
  magic_bow:   { name: 'Magic Longbow',  icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 26, range: 19, speed: 0.62, desc: 'A humming bow of magic wood. +26 ranged.' },
  adamant_arrow: { name: 'Adamant Arrows', icon: '🏹', type: 'ammo', bonus: 13, desc: 'Tipped with adamant. +13 ranged damage per shot.' },
  runite_arrow:  { name: 'Runite Arrows',  icon: '🏹', type: 'ammo', bonus: 17, desc: 'Tipped with runite. +17 ranged damage per shot.' },

  // ---- Craftable silver & gold jewelry (crafting bench, from bars + gems) ----
  silver_ring:   { name: 'Silver Ring',   icon: '💍', type: 'ring',   bonus: { def: 3 },              desc: 'Silver set with sapphire. +3 defence.' },
  silver_amulet: { name: 'Silver Amulet', icon: '📿', type: 'amulet', bonus: { magic: 4 },            desc: 'Silver set with emerald. +4 magic.' },
  gold_ring:     { name: 'Gold Ring',     icon: '💍', type: 'ring',   bonus: { melee: 5, def: 2 },    desc: 'Gold set with ruby. +5 melee, +2 defence.' },
  gold_amulet:   { name: 'Gold Amulet',   icon: '📿', type: 'amulet', bonus: { melee: 4, maxhp: 15 }, desc: 'A heavy gold pendant. +4 melee, +15 max HP.' },
  crown_signet:  { name: 'Crown Signet',  icon: '💠', type: 'amulet', bonus: { melee: 6, def: 6, maxhp: 20 }, desc: "The King's own seal, given to the Champion of Crownhaven. +6 melee, +6 defence, +20 max HP." },

  // ---- Hearty meals (a cooking activity — combine ingredients for big heals, see MEALS) ----
  fish_stew:       { name: 'Fisher’s Stew',   icon: '🍲', type: 'consumable', heal: 45,  desc: 'A warming stew. Restores 45 HP.' },
  hearty_roast:    { name: 'Hearty Roast',    icon: '🍖', type: 'consumable', heal: 60,  desc: 'A filling roast. Restores 60 HP.' },
  seafood_platter: { name: 'Seafood Platter', icon: '🍱', type: 'consumable', heal: 78,  desc: 'A feast of the sea. Restores 78 HP.' },
  kings_feast:     { name: 'King’s Feast',    icon: '🍽️', type: 'consumable', heal: 110, desc: 'Fit for royalty. Restores 110 HP.' },

  bronze_sword: { name: 'Bronze Sword', icon: '🗡️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 4,  range: 2.7, speed: 0.5,  desc: 'A sturdy bronze blade. +4 melee.' },
  iron_sword:   { name: 'Iron Sword',   icon: '🗡️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 9,  range: 2.7, speed: 0.5,  desc: 'A keen iron blade. +9 melee.' },
  steel_sword:  { name: 'Steel Sword',  icon: '⚔️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 15, range: 2.8, speed: 0.45, desc: 'A fearsome steel blade. +15 melee.' },
  oak_bow:      { name: 'Oak Bow',      icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 7,  range: 14,  speed: 0.7,  desc: 'Looses arrows from afar. +7 ranged.' },
  yew_bow:      { name: 'Yew Bow',      icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 13, range: 15,  speed: 0.65, desc: 'A powerful longbow. +13 ranged.' },
  apprentice_staff: { name: 'Apprentice Staff', icon: '🪄', type: 'weapon', style: 'magic', skill: 'magic', bonus: 9,  range: 13, speed: 0.8,  desc: 'Hurls arcane bolts. +9 magic.' },
  ember_staff:  { name: 'Ember Staff',  icon: '🔥', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 17, range: 14,  speed: 0.75, desc: 'Channels Emberpeak fire. +17 magic.' },
  leather_armor: { name: 'Leather Armor', icon: '🥋', type: 'armor', defense: 4,  desc: 'Light hide. Reduces damage taken by 4.' },
  iron_armor:   { name: 'Iron Armor',   icon: '🛡️', type: 'armor', defense: 9,  desc: 'Solid plate. Reduces damage taken by 9.' },
  steel_armor:  { name: 'Steel Armor',  icon: '🛡️', type: 'armor', defense: 16, desc: 'Heavy plate. Reduces damage taken by 16.' },

  bones:         { name: 'Bones',         icon: '🦴', type: 'material',   desc: 'Bury at an altar to train Prayer.' },
  seeds:         { name: 'Crop Seeds',    icon: '🌰', type: 'material',   desc: 'Plant in a farm plot.' },
  crop:          { name: 'Isle Greens',   icon: '🥬', type: 'material',   desc: 'Raw crop — cook it into a hearty meal.' },
  cooked_greens: { name: 'Cooked Greens', icon: '🥗', type: 'consumable', heal: 30, desc: 'A hearty meal. Restores 30 HP.' },
  strong_potion: { name: 'Strong Salve',  icon: '⚗️', type: 'consumable', heal: 70, desc: 'Potent brew. Restores 70 HP.' },

  sapphire: { name: 'Sapphire', icon: '🔷', type: 'material', desc: 'A blue gem from the rocks. Craft Guardian gear.' },
  emerald:  { name: 'Emerald',  icon: '💚', type: 'material', desc: 'A green gem from the rocks. Craft Ranger gear.' },
  ruby:     { name: 'Ruby',     icon: '🔴', type: 'material', desc: 'A red gem from the rocks. Craft Sorcerer gear.' },

  guardian_armor:  { name: 'Guardian Plate',  icon: '🛡️', type: 'armor',  set: 'guardian', defense: 18, bonus: { melee: 5 }, desc: 'Guardian set. Heavy plate, +5 melee.' },
  guardian_amulet: { name: 'Guardian Amulet', icon: '📿', type: 'amulet', set: 'guardian', bonus: { def: 6 }, desc: 'Guardian set. +6 defence.' },
  guardian_ring:   { name: 'Guardian Ring',   icon: '💍', type: 'ring',   set: 'guardian', bonus: { melee: 4 }, desc: 'Guardian set. +4 melee.' },
  ranger_armor:  { name: 'Ranger Garb',   icon: '🥋', type: 'armor',  set: 'ranger', defense: 11, bonus: { ranged: 8 }, desc: 'Ranger set. +8 ranged.' },
  ranger_amulet: { name: 'Ranger Amulet', icon: '📿', type: 'amulet', set: 'ranger', bonus: { ranged: 6 }, desc: 'Ranger set. +6 ranged.' },
  ranger_ring:   { name: 'Ranger Ring',   icon: '💍', type: 'ring',   set: 'ranger', bonus: { ranged: 5 }, desc: 'Ranger set. +5 ranged.' },
  sorcerer_robes:  { name: 'Sorcerer Robes',  icon: '🧥', type: 'armor',  set: 'sorcerer', defense: 9, bonus: { magic: 10 }, desc: 'Sorcerer set. +10 magic.' },
  sorcerer_amulet: { name: 'Sorcerer Amulet', icon: '📿', type: 'amulet', set: 'sorcerer', bonus: { magic: 8 }, desc: 'Sorcerer set. +8 magic.' },
  slayer_helm: { name: 'Slayer Helm', icon: '⛑️', type: 'amulet', bonus: { melee: 6, ranged: 6, magic: 6 }, desc: 'Slayer reward. +6 to all combat styles.' },
  sorcerer_ring:   { name: 'Sorcerer Ring',   icon: '💍', type: 'ring',   set: 'sorcerer', bonus: { magic: 6 }, desc: 'Sorcerer set. +6 magic.' },
  vigor_amulet:    { name: 'Amulet of Vigor', icon: '📿', type: 'amulet', bonus: { maxhp: 25 }, desc: '+25 max HP.' },

  sun_blade:   { name: 'Sun Blade',   icon: '⚔️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 22, range: 2.9, speed: 0.42, desc: "The Sandwyrm's blade. +22 melee." },
  frost_staff: { name: 'Frost Staff', icon: '🪄', type: 'weapon', style: 'magic', skill: 'magic',  bonus: 24, range: 15,  speed: 0.7,  desc: "The Frost Warden's staff. +24 magic." },

  emberheart_amulet: { name: 'Emberheart Amulet', icon: '📿', type: 'amulet', bonus: { magic: 10, melee: 6 }, desc: 'Rare drop. +10 magic, +6 melee.' },
  wyrmscale_ring:    { name: 'Wyrmscale Ring',    icon: '💍', type: 'ring',   bonus: { melee: 8, def: 6 },   desc: 'Rare drop. +8 melee, +6 defence.' },
  frostguard_amulet: { name: 'Frostguard Amulet', icon: '📿', type: 'amulet', bonus: { def: 12, maxhp: 30 }, desc: 'Rare drop. +12 defence, +30 max HP.' },

  // --- dungeon materials (drop in caves, used for crafting) ---
  bone_shard:    { name: 'Bone Shard',    icon: '🦴', type: 'material', desc: 'Necrotic shard from the catacombs. Crafts dark gear.' },
  goblin_tooth:  { name: 'Goblin Tooth',  icon: '🦷', type: 'material', desc: 'A jagged tooth pried from a goblin.' },
  crystal_shard: { name: 'Crystal Shard', icon: '💠', type: 'material', desc: 'A humming shard from the Crystal Hollow.' },
  magma_core:    { name: 'Magma Core',    icon: '🟥', type: 'material', desc: 'A still-molten core from the Magma Depths.' },
  pearl:         { name: 'Abyss Pearl',   icon: '⚪', type: 'material', desc: 'A luminous pearl from the Sunken Temple.' },

  // --- dungeon boss weapons (best-in-slot, one per style line) ---
  wraithblade:        { name: 'Wraithblade',          icon: '⚔️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 26, range: 2.9, speed: 0.42, desc: "The Bonelord's blade. +26 melee." },
  stormstring_bow:    { name: 'Stormstring Bow',      icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 20, range: 16,  speed: 0.6,  desc: "Warchief Gronk's great bow. +20 ranged." },
  prism_staff:        { name: 'Prism Staff',          icon: '🪄', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 27, range: 15,  speed: 0.68, desc: 'Refracted arcane fury. +27 magic.' },
  cinderforge_axe:    { name: 'Cinderforge Greataxe', icon: '🪓', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 30, range: 3.0, speed: 0.6,  desc: 'A molten greataxe. +30 melee, slow.' },
  tidecaller_trident: { name: 'Tidecaller Trident',   icon: '🔱', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 33, range: 3.2, speed: 0.5,  desc: "The Drowned King's trident. +33 melee." },

  // --- dungeon boss rare drops ---
  lich_pendant:    { name: 'Lich Pendant',    icon: '📿', type: 'amulet', bonus: { magic: 12, maxhp: 20 }, desc: 'Rare drop. +12 magic, +20 max HP.' },
  brute_ring:      { name: 'Brute Ring',      icon: '💍', type: 'ring',   bonus: { melee: 10, def: 5 },    desc: 'Rare drop. +10 melee, +5 defence.' },
  crystal_heart:   { name: 'Crystal Heart',   icon: '📿', type: 'amulet', bonus: { magic: 9, def: 9 },     desc: 'Rare drop. +9 magic, +9 defence.' },
  ember_core_ring: { name: 'Ember Core Ring', icon: '💍', type: 'ring',   bonus: { melee: 12 },            desc: 'Rare drop. +12 melee.' },
  pearl_depths:    { name: 'Pearl of Depths', icon: '📿', type: 'amulet', bonus: { def: 10, maxhp: 45 },   desc: 'Rare drop. +10 defence, +45 max HP.' },

  // --- crafted from dungeon materials (Crafting Bench) ---
  crystalweave_amulet: { name: 'Crystalweave Amulet', icon: '📿', type: 'amulet', bonus: { magic: 11, def: 4 },  desc: 'Crafted. +11 magic, +4 defence.' },
  bonecharm_ring:      { name: 'Bonecharm Ring',      icon: '💍', type: 'ring',   bonus: { melee: 7, maxhp: 15 }, desc: 'Crafted. +7 melee, +15 max HP.' },
  tideheart_amulet:    { name: 'Tideheart Amulet',    icon: '📿', type: 'amulet', bonus: { maxhp: 60 },          desc: 'Crafted. +60 max HP.' },

  // --- frontier materials (new regions / dungeons) ---
  vine_coil:   { name: 'Vine Coil',   icon: '🌿', type: 'material', desc: 'Living vine from the Kytari jungle.' },
  demon_ash:   { name: 'Demon Ash',   icon: '🔥', type: 'material', desc: 'Smouldering ash from the Ashpit.' },
  storm_shard: { name: 'Storm Shard', icon: '⚡', type: 'material', desc: 'A crackling shard from Thunderpeak.' },
  fae_dust:    { name: 'Fae Dust',    icon: '✨', type: 'material', desc: 'Glittering dust from the Feywild.' },

  // --- frontier boss weapons (extend the top of each style line) ---
  coilfang_spear: { name: 'Coilfang Spear', icon: '🔱', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 30, range: 3.2, speed: 0.46, desc: "Jorath's fanged spear. +30 melee." },
  ashbringer:     { name: 'Ashbringer',     icon: '⚔️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 36, range: 3.0, speed: 0.5,  desc: "Ashlord Vurak's blade. +36 melee." },
  tempest_bow:    { name: 'Tempest Bow',    icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 24, range: 17,  speed: 0.56, desc: "Thruun's storm bow. +24 ranged." },
  faewild_staff:  { name: 'Faewild Staff',  icon: '🪄', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 30, range: 16,  speed: 0.64, desc: "The Hollow King's staff. +30 magic." },

  // --- frontier rare drops ---
  serpent_eye:     { name: 'Serpent Eye',     icon: '📿', type: 'amulet', bonus: { melee: 9, ranged: 9 },  desc: 'Rare drop. +9 melee, +9 ranged.' },
  demonheart_ring: { name: 'Demonheart Ring', icon: '💍', type: 'ring',   bonus: { melee: 14 },            desc: 'Rare drop. +14 melee.' },
  storm_amulet:    { name: 'Storm Amulet',    icon: '📿', type: 'amulet', bonus: { ranged: 12, magic: 8 }, desc: 'Rare drop. +12 ranged, +8 magic.' },
  fae_crown:       { name: 'Fae Crown',       icon: '📿', type: 'amulet', bonus: { magic: 14, maxhp: 25 }, desc: 'Rare drop. +14 magic, +25 max HP.' },

  // --- crafted from frontier materials ---
  verdant_charm:    { name: 'Verdant Charm',    icon: '📿', type: 'amulet', bonus: { maxhp: 40, def: 6 },   desc: 'Crafted. +40 max HP, +6 defence.' },
  stormforged_ring: { name: 'Stormforged Ring', icon: '💍', type: 'ring',   bonus: { ranged: 9, melee: 6 }, desc: 'Crafted. +9 ranged, +6 melee.' },

  // --- starter weapon + shields (shield is its own equip slot) ---
  bronze_dagger: { name: 'Bronze Dagger', icon: '🗡️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 3, range: 2.4, speed: 0.32, desc: 'A quick bronze dagger. +3 melee, very fast.' },
  wooden_shield: { name: 'Wooden Shield', icon: '🛡️', type: 'shield', defense: 5,  desc: 'A sturdy wooden shield. Blocks 5 damage.' },
  iron_shield:   { name: 'Iron Shield',   icon: '🛡️', type: 'shield', defense: 10, desc: 'A heavy iron shield. Blocks 10 damage.' },
  steel_shield:  { name: 'Steel Shield',  icon: '🛡️', type: 'shield', defense: 16, desc: 'A broad steel shield. Blocks 16 damage.' },

  // --- Expansion III: coastal (Saltcrest) + barrow (Amberfell) materials & gear ---
  barnacle_plate: { name: 'Barnacle Plate', icon: '🦪', type: 'material', desc: 'Crusted shell-plate from the drowned — used in coastal smithing.' },
  grave_iron:     { name: 'Grave Iron',     icon: '⚰️', type: 'material', desc: 'Cold iron pried from a barrow. It never warms.' },
  corsair_cutlass: { name: 'Corsair Cutlass', icon: '⚔️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 17, range: 2.7, speed: 0.42, desc: 'A pirate-king’s blade. +17 melee.' },
  mariner_plate:   { name: 'Mariner Plate',   icon: '🛡️', type: 'armor',  defense: 14, desc: 'Salt-cured plate. -14 damage taken.' },
  barnacle_shield: { name: 'Barnacle Shield', icon: '🛡️', type: 'shield', defense: 13, desc: 'A reinforced harbour shield. Blocks 13 damage.' },
  barrow_blade:    { name: 'Barrow Blade',    icon: '⚔️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 16, range: 2.8, speed: 0.44, desc: 'A wight’s cold greatblade. +16 melee.' },
  grave_plate:     { name: 'Grave Warden Plate', icon: '🛡️', type: 'armor', defense: 16, desc: 'Barrow-iron plate. -16 damage taken.' },
  wight_crown:     { name: 'Wight Crown',     icon: '👑', type: 'amulet', bonus: { melee: 8, def: 6 }, desc: 'A barrow-king’s crown. +8 melee, +6 defence.' },

  // --- tavern fare (bought from a Tavern Keeper) ---
  ale:             { name: 'Frothy Ale',      icon: '🍺', type: 'consumable', heal: 18, desc: 'A foaming mug. Restores 18 HP.' },
  spiced_mead:     { name: 'Spiced Mead',     icon: '🍯', type: 'consumable', heal: 26, desc: 'Warm and sweet. Restores 26 HP.' },
  hearty_stew:     { name: 'Hearty Stew',     icon: '🍲', type: 'consumable', heal: 42, desc: 'A hot bowl of stew. Restores 42 HP.' },
  traveler_coffee: { name: "Traveler's Brew", icon: '☕', type: 'consumable', heal: 14, desc: 'Bitter and bracing. Restores 14 HP.' },
  // --- Lagoon (Coralside) coast: pearl/coral water gear + materials ---
  coral_chunk:  { name: 'Living Coral', icon: '🪸', type: 'material', desc: 'A still-breathing branch of reef coral. Used in tidecraft.' },
  siren_scale:  { name: 'Siren Scale',  icon: '🐚', type: 'material', desc: 'An iridescent scale, warm to the touch. It hums faintly when you sleep.' },
  reef_harpoon: { name: 'Reef Harpoon',  icon: '🔱', type: 'weapon', style: 'melee', skill: 'combat', bonus: 14, range: 3.0, speed: 0.46, desc: 'A barbed diver’s harpoon. +14 melee, long reach.' },
  brinecaller:  { name: 'Brinecaller',   icon: '🔱', type: 'weapon', style: 'melee', skill: 'combat', bonus: 28, range: 3.2, speed: 0.5, desc: "The Sea-Witch's trident. +28 melee." },
  coral_armor:  { name: 'Coral Carapace', icon: '🛡️', type: 'armor', defense: 13, desc: 'Plate grown from living reef. −13 damage taken.' },
  pearl_amulet:   { name: 'Pearl Amulet',   icon: '📿', type: 'amulet', bonus: { magic: 8, maxhp: 20 }, desc: 'A great pearl on a kelp cord. +8 magic, +20 max HP.' },
  songpearl:      { name: 'Songpearl',      icon: '📿', type: 'amulet', bonus: { def: 9, maxhp: 35 }, desc: 'Rare drop. The pearl that was a voice. +9 defence, +35 max HP.' },
  tideglass_ring: { name: 'Tideglass Ring', icon: '💍', type: 'ring', bonus: { magic: 7, def: 5 }, desc: 'Crafted. Sea-glass set in coral. +7 magic, +5 defence.' },
  // --- Shardspire (The Singing Geode): prismatic crystal gear ---
  shard_dust:     { name: 'Tuned Shard-Dust', icon: '🔮', type: 'material', desc: 'Crystal dust that hums one held note. Crafts prismatic gear.' },
  chord_staff:    { name: 'Discord Chord-Staff', icon: '🪄', type: 'weapon', style: 'magic', skill: 'magic', bonus: 31, range: 16, speed: 0.66, desc: "Resona's seed-crystal cut into a focus; sings a discordant note. +31 magic." },
  prism_carapace: { name: 'Prismglass Carapace', icon: '🛡️', type: 'armor', defense: 20, desc: 'Plate grown from cooled Bloom-crystal — light as glass, hard as grief. −20 damage.' },
  resonant_heart: { name: 'Resonant Heart', icon: '📿', type: 'amulet', bonus: { magic: 13, maxhp: 25 }, desc: "Rare drop. The First Note's stilled core. +13 magic, +25 max HP." },
  geode_charm:    { name: 'Geode Charm', icon: '📿', type: 'amulet', bonus: { magic: 9, def: 8 }, desc: 'Crafted. A pocket of silent crystal. +9 magic, +8 defence.' },
  // --- Skyreach (Stormcrown Eyrie): storm/feather ranged gear ---
  gale_core:    { name: 'Gale Core',  icon: '🌬️', type: 'material', desc: 'A coil of bound wind from a slain sky-warden — never still in the hand.' },
  skyfeather:   { name: 'Skyfeather', icon: '🪶', type: 'material', desc: 'A pinion from a great roc; light as breath, strong as cord.' },
  sky_arrow:    { name: 'Skyfeather Arrows', icon: '🏹', type: 'ammo', bonus: 15, desc: 'Fletched with roc-down. +15 ranged damage per shot.' },
  skywarden_bow: { name: 'Skywarden Greatbow', icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 28, range: 18, speed: 0.6, desc: "The Stormcrown's bow. +28 ranged, vast reach." },
  stormcrown_amulet: { name: 'Stormcrown Pinion', icon: '📿', type: 'amulet', bonus: { ranged: 14, magic: 6 }, desc: 'Rare drop. A roc-feather circlet. +14 ranged, +6 magic.' },
  windborne_cloak:   { name: 'Windborne Cloak', icon: '🧥', type: 'amulet', bonus: { ranged: 10, def: 5, maxhp: 15 }, desc: 'Crafted. A cloak of woven skyfeathers. +10 ranged, +5 defence, +15 max HP.' },
  // --- Sporevale (The Mycelial Heart): venom/herblore fungal gear ---
  sporecap:       { name: 'Sporecap', icon: '🍄', type: 'material', desc: 'Living fungal flesh, twitching faintly. The hive grows it like fingernails.' },
  creeping_ichor: { name: 'Creeping Ichor', icon: '🟢', type: 'material', desc: 'Luminous sap that carries the hive-mind. It seems to listen.' },
  hyphae_lash:    { name: 'Hyphae Lash', icon: '🌿', type: 'weapon', style: 'melee', skill: 'combat', bonus: 21, range: 3.1, speed: 0.5, poison: 5, desc: 'A whip of living mycelium. +21 melee, and every lash injects spores (poison).' },
  sporeweave_robes: { name: 'Sporeweave Robes', icon: '🧥', type: 'armor', defense: 14, bonus: { magic: 12 }, desc: 'Robes grown, not sewn; the threads breathe out antitoxins. +12 magic, −14 damage.' },
  pall_amulet:    { name: 'Pall of the Quiet Mind', icon: '📿', type: 'amulet', bonus: { magic: 9, maxhp: 24 }, desc: "Pressed from the hermit's last lucid thought. +9 magic, +24 max HP." },
  verdant_antitoxin: { name: 'Verdant Antitoxin', icon: '🧴', type: 'potion', cure: 'poison', buff: 'venom', mult: 1, dur: 90, col: 0x7ad06a, desc: 'Brewed from sporecap: cures poison AND turns the same venom on your foes for 90s.' },
  // --- Cinderbreak (Caldera Sanctum): obsidian endgame gear ---
  obsidian_shard: { name: 'Obsidian Shard', icon: '🔺', type: 'material', desc: 'Volcanic glass, edged sharp enough to cut light. Forged in cult ritual.' },
  obsidian_maul:  { name: 'Obsidian Maul',  icon: '🔨', type: 'weapon', style: 'melee', skill: 'combat', bonus: 38, range: 3.0, speed: 0.6, desc: "The forge-titan's maul. +38 melee, heavy and slow. Best-in-slot." },
  cinderveil_staff: { name: 'Cinderveil Staff', icon: '🪄', type: 'weapon', style: 'magic', skill: 'magic', bonus: 33, range: 16, speed: 0.6, desc: 'Carved from the monolith; channels the smothered fire-god. +33 magic.' },
  emberward_plate: { name: 'Emberward Plate', icon: '🛡️', type: 'armor', defense: 22, desc: 'Obsidian scale-plate, ash-quenched. −22 damage taken. Best-in-slot armour.' },
  ashen_signet:   { name: 'Ashen Signet', icon: '💍', type: 'ring', bonus: { melee: 10, magic: 10 }, desc: 'Rare drop. The cult-leader’s ring. +10 melee, +10 magic.' },
  // ===== Big gear round — distinct weapons/armour/shields across tiers =====
  // Low tier (shop)
  bronze_mace:      { name: 'Bronze Mace',      icon: '🔨', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 5,  range: 2.6, speed: 0.54, desc: 'A blunt bronze mace. +5 melee.' },
  bronze_scimitar:  { name: 'Bronze Scimitar',  icon: '🗡️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 5,  range: 2.8, speed: 0.44, desc: 'A curved bronze blade, quick on the draw. +5 melee.' },
  oak_crossbow:     { name: 'Oak Crossbow',     icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 6,  range: 13, speed: 0.7,  desc: 'A simple stock crossbow. +6 ranged.' },
  novice_wand:      { name: 'Novice Wand',      icon: '🪄', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 6,  range: 12, speed: 0.58, desc: 'A starter wand for fledgling mages. +6 magic.' },
  studded_leather:  { name: 'Studded Leather',  icon: '🥋', type: 'armor', defense: 6,  desc: 'Hide reinforced with bronze studs. −6 damage.' },
  bronze_platebody: { name: 'Bronze Platebody', icon: '🛡️', type: 'armor', defense: 8,  desc: 'Beaten bronze plate. −8 damage.' },
  bronze_kiteshield:{ name: 'Bronze Kiteshield', icon: '🛡️', type: 'shield', defense: 7, desc: 'A bronze kite shield. Blocks 7.' },
  // Mid tier (shop)
  iron_warhammer:   { name: 'Iron Warhammer',   icon: '🔨', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 12, range: 2.8, speed: 0.7,  desc: 'A two-handed iron hammer. +12 melee, heavy.' },
  iron_halberd:     { name: 'Iron Halberd',     icon: '🔱', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 11, range: 3.5, speed: 0.6,  desc: 'A long-reach polearm. +11 melee, great range.' },
  steel_rapier:     { name: 'Steel Rapier',     icon: '🤺', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 13, range: 2.7, speed: 0.34, desc: 'A slender duelling blade. +13 melee, very fast.' },
  hunters_crossbow: { name: "Hunter's Crossbow", icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 13, range: 14, speed: 0.62, desc: 'A keen hunting crossbow. +13 ranged.' },
  acolyte_grimoire: { name: 'Acolyte Grimoire', icon: '📖', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 13, range: 14, speed: 0.7,  desc: 'A bound book of cantrips. +13 magic.' },
  scout_leather:    { name: 'Scout Leathers',   icon: '🥋', type: 'armor', defense: 10, bonus: { ranged: 4 }, desc: 'Light hooded leathers. −10 damage, +4 ranged.' },
  chain_hauberk:    { name: 'Chain Hauberk',    icon: '🛡️', type: 'armor', defense: 12, desc: 'Riveted chainmail. −12 damage.' },
  tower_shield:     { name: 'Tower Shield',     icon: '🛡️', type: 'shield', defense: 14, desc: 'A heavy tower shield. Blocks 14.' },
  // High tier (quest + discovery rewards)
  gravewarden_scythe: { name: 'Gravewarden Scythe', icon: '⚰️', type: 'weapon', style: 'melee', skill: 'combat', bonus: 26, range: 3.3, speed: 0.56, desc: 'A reaper’s scythe that hums near the dead. +26 melee, long reach.' },
  warlord_flail:    { name: 'Warlord Flail',    icon: '⛓️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 25, range: 2.9, speed: 0.5,  desc: 'A spiked flail of a fallen warlord. +25 melee.' },
  shadow_claws:     { name: 'Shadow Claws',     icon: '🐾', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 22, range: 2.4, speed: 0.28, poison: 5, desc: 'Twin venom claws. +22 melee, lightning-fast, poison on hit.' },
  dragoon_halberd:  { name: 'Dragoon Halberd',  icon: '🔱', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 28, range: 3.6, speed: 0.6,  desc: 'An ember-forged dragoon polearm. +28 melee, vast reach.' },
  seraph_blade:     { name: 'Seraph Blade',     icon: '⚔️', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 31, range: 3.0, speed: 0.48, desc: 'A radiant greatsword wreathed in light. +31 melee.' },
  moonscythe:       { name: 'Moonscythe',       icon: '🌙', type: 'weapon', style: 'melee',  skill: 'combat', bonus: 27, range: 3.3, speed: 0.52, desc: 'A fae crescent that cuts with moonlight. +27 melee.' },
  windpierce_crossbow: { name: 'Windpierce Crossbow', icon: '🏹', type: 'weapon', style: 'ranged', skill: 'ranged', bonus: 27, range: 17, speed: 0.6, desc: 'Bolts that ride the wind. +27 ranged, vast reach.' },
  archon_scepter:   { name: 'Archon Scepter',   icon: '🔱', type: 'weapon', style: 'magic',  skill: 'magic',  bonus: 30, range: 15, speed: 0.64, desc: 'A scepter crowned with bound starlight. +30 magic.' },
  dread_plate:      { name: 'Dread Plate',      icon: '🛡️', type: 'armor', defense: 21, desc: 'Black spiked warplate. −21 damage.' },
  warlord_plate:    { name: 'Warlord Plate',    icon: '🛡️', type: 'armor', defense: 23, bonus: { melee: 6 }, desc: 'Crimson plate of a war-host. −23 damage, +6 melee.' },
  royal_cuirass:    { name: 'Royal Cuirass',    icon: '🛡️', type: 'armor', defense: 22, bonus: { maxhp: 30 }, desc: 'A caped, plumed royal cuirass. −22 damage, +30 max HP.' },
  archmage_robes:   { name: 'Archmage Robes',   icon: '🧥', type: 'armor', defense: 15, bonus: { magic: 14 }, desc: 'Star-stitched robes of an archmage. −15 damage, +14 magic.' },
  aegis_bulwark:    { name: 'Aegis Bulwark',    icon: '🛡️', type: 'shield', defense: 20, desc: 'A radiant golden bulwark. Blocks 20.' },
  // ===== Craftable gear SETS (weapon + armour + shield/amulet; partial + full bonuses) =====
  // Valkyr — radiant melee/tank set (weapon + armour + shield)
  valkyr_glaive: { name: 'Valkyr Glaive',  icon: '🔱', type: 'weapon', style: 'melee', skill: 'combat', set: 'valkyr', bonus: 24, range: 3.5, speed: 0.6, desc: 'Valkyr set. A winged glaive. +24 melee.' },
  valkyr_plate:  { name: 'Valkyr Warplate', icon: '🛡️', type: 'armor', set: 'valkyr', defense: 19, desc: 'Valkyr set. Radiant winged plate. −19 damage.' },
  valkyr_shield: { name: 'Valkyr Aegis',   icon: '🛡️', type: 'shield', set: 'valkyr', defense: 16, desc: 'Valkyr set. A gilded wing-shield. Blocks 16.' },
  // Stormweaver — arcane magic set (weapon + armour + amulet)
  stormweaver_scepter: { name: 'Stormweaver Scepter', icon: '🔱', type: 'weapon', style: 'magic', skill: 'magic', set: 'stormweaver', bonus: 24, range: 15, speed: 0.64, desc: 'Stormweaver set. A crackling arcane scepter. +24 magic.' },
  stormweaver_robes:   { name: 'Stormweaver Robes', icon: '🧥', type: 'armor', set: 'stormweaver', defense: 13, bonus: { magic: 6 }, desc: 'Stormweaver set. Storm-stitched robes. −13 damage, +6 magic.' },
  stormweaver_sigil:   { name: 'Stormweaver Sigil', icon: '📿', type: 'amulet', set: 'stormweaver', bonus: { magic: 6 }, desc: 'Stormweaver set. +6 magic.' },
};

// ---- Gathering progression tables (used by the gather handlers in main.js) ----
// Fishing: at a shimmering spot you catch a random fish you've unlocked, biased toward
// the better ones. Shrimp + Trout stay level 1 so early fishing quests still work.
export const FISH = [
  { raw: 'raw_shrimp',     level: 1,  xp: 12 },
  { raw: 'raw_trout',      level: 1,  xp: 16 },
  { raw: 'raw_sardine',    level: 8,  xp: 22 },
  { raw: 'raw_herring',    level: 14, xp: 26 },
  { raw: 'raw_bass',       level: 20, xp: 34 },
  { raw: 'raw_salmon',     level: 28, xp: 44 },
  { raw: 'raw_pike',       level: 34, xp: 52 },
  { raw: 'raw_tuna',       level: 42, xp: 62 },
  { raw: 'raw_lobster',    level: 50, xp: 74 },
  { raw: 'raw_swordfish',  level: 58, xp: 86 },
  { raw: 'raw_shark',      level: 70, xp: 105 },
  { raw: 'raw_anglerfish', level: 82, xp: 125 },
];
// Woodcutting: every tree gives Driftwood; higher levels also drop a premium log on top.
export const LOGS = [
  { log: 'wood',       level: 1,  xp: 14 },
  { log: 'oak_log',    level: 12, xp: 24 },
  { log: 'willow_log', level: 24, xp: 40 },
  { log: 'maple_log',  level: 36, xp: 58 },
  { log: 'yew_log',    level: 50, xp: 85 },
  { log: 'magic_log',  level: 68, xp: 125 },
];
// Farming: plant the best crop you have seeds for + the Farming level to grow. 'seeds'→'crop'
// (Isle Greens) stays level 1 so existing farming quests still work.
export const CROPS = [
  { seed: 'seeds',        produce: 'crop',    name: 'Isle Greens', level: 1,  xp: 24, yield: 2 },
  { seed: 'carrot_seed',  produce: 'carrot',  name: 'Carrots',     level: 6,  xp: 34, yield: 3 },
  { seed: 'potato_seed',  produce: 'potato',  name: 'Potatoes',    level: 14, xp: 46, yield: 3 },
  { seed: 'corn_seed',    produce: 'corn',    name: 'Corn',        level: 24, xp: 60, yield: 3 },
  { seed: 'pumpkin_seed', produce: 'pumpkin', name: 'Pumpkins',    level: 36, xp: 82, yield: 2 },
];

// Smelting recipes (furnace) and weapon forge tiers (anvil).
export const SMELT = [
  { in: { copper_ore: 1 }, out: 'bronze_bar', xp: 18 },
  { in: { iron_ore: 1, coal: 1 }, out: 'iron_bar', xp: 26 },
  { in: { silver_ore: 1 }, out: 'silver_bar', xp: 34 },
  { in: { mithril_ore: 1, coal: 2 }, out: 'mithril_bar', xp: 50 },
  { in: { gold_ore: 1 }, out: 'gold_bar', xp: 44 },
  { in: { adamant_ore: 1, coal: 3 }, out: 'adamant_bar', xp: 68 },
  { in: { runite_ore: 1, coal: 5 }, out: 'runite_bar', xp: 92 },
];
export const COOK = {
  raw_shrimp: 'cooked_shrimp', raw_trout: 'cooked_trout', crop: 'cooked_greens',
  raw_sardine: 'cooked_sardine', raw_herring: 'cooked_herring', raw_bass: 'cooked_bass', raw_salmon: 'cooked_salmon',
  raw_pike: 'cooked_pike', raw_tuna: 'cooked_tuna', raw_lobster: 'cooked_lobster', raw_swordfish: 'cooked_swordfish',
  raw_shark: 'cooked_shark', raw_anglerfish: 'cooked_anglerfish', potato: 'baked_potato',
};
// Hearty meals — a deeper cooking activity: combine cooked foods/produce into big-heal
// dishes at a stove (gated by Cooking level). See G.cookMeal in main.js.
export const MEALS = [
  { out: 'fish_stew',       cost: { cooked_trout: 1, carrot: 1, potato: 1 },            xp: 45,  level: 10 },
  { out: 'hearty_roast',    cost: { meat: 2, corn: 1 },                                 xp: 60,  level: 20 },
  { out: 'seafood_platter', cost: { cooked_lobster: 1, cooked_bass: 1 },                xp: 90,  level: 32 },
  { out: 'honey_glazed',    cost: { honey: 1, cooked_salmon: 1 },                       xp: 70,  level: 28 },
  { out: 'kings_feast',     cost: { cooked_shark: 1, cooked_swordfish: 1, pumpkin: 1 }, xp: 140, level: 55 },
];
// Herblore brewing (cauldron) and Prayer buffs.
export const BREW = [
  { in: { herb: 1 }, out: 'strong_potion', xp: 32, level: 1 },
  { in: { herb: 1, berry: 2 }, out: 'antidote', xp: 36, level: 4 },
  { in: { herb: 1, bone_shard: 1 }, out: 'strength_potion', xp: 44, level: 6 },
  { in: { herb: 1, feather: 2 }, out: 'ranging_potion', xp: 44, level: 8 },
  { in: { herb: 1, rune_essence: 1 }, out: 'magic_potion', xp: 48, level: 10 },
  { in: { herb: 1, iron_ore: 1 }, out: 'defence_potion', xp: 50, level: 12 },
  { in: { herb: 1, vine_coil: 1 }, out: 'venom_flask', xp: 54, level: 16 },
  { in: { herb: 1, bones: 1 }, out: 'prayer_potion', xp: 58, level: 18 },
  { in: { herb: 1, sporecap: 1 }, out: 'verdant_antitoxin', xp: 62, level: 20 },
  { in: { mushroom: 2 }, out: 'fungal_tonic', xp: 34, level: 3 },               // foraged fungus tonic
  { in: { nectar: 1, berry: 1 }, out: 'nectar_tonic', xp: 50, level: 14 },      // sweet nectar draught
  { in: { honey: 2, berry: 1 }, out: 'honey_mead', xp: 46, level: 8 },          // honey mead
];
export const PRAYERS = [
  { key: 'stoneskin', name: 'Stone Skin', level: 1,  drain: 0.5, dmgTaken: 0.7, desc: 'Take 30% less damage.' },
  { key: 'keenedge',  name: 'Keen Edge',  level: 8,  drain: 0.6, dmgDealt: 1.2, desc: 'Deal 20% more damage.' },
  { key: 'rapidheal', name: 'Rapid Heal', level: 15, drain: 0.4, regen: 1.2,    desc: 'Slowly regenerate health.' },
  { key: 'protmelee',  name: 'Protect from Melee',  level: 10, drain: 1.2, protect: 'melee',  protectMult: 0.4, desc: 'Take 60% less melee damage (and from slams).' },
  { key: 'protranged', name: 'Protect from Ranged', level: 13, drain: 1.2, protect: 'ranged', protectMult: 0.4, desc: 'Take 60% less ranged damage.' },
  { key: 'protmagic',  name: 'Protect from Magic',  level: 16, drain: 1.2, protect: 'magic',  protectMult: 0.4, desc: 'Take 60% less magic damage.' },
];

// Crafting bench recipes (gems + bars -> jewelry / set armour) and set bonuses.
export const CRAFT = [
  { out: 'guardian_amulet', cost: { sapphire: 2, iron_bar: 1 }, xp: 60 },
  { out: 'guardian_ring',   cost: { sapphire: 1, iron_bar: 1 }, xp: 45 },
  { out: 'guardian_armor',  cost: { sapphire: 3, iron_bar: 3 }, xp: 150 },
  { out: 'ranger_amulet',   cost: { emerald: 2, iron_bar: 1 }, xp: 65 },
  { out: 'ranger_ring',     cost: { emerald: 1, bronze_bar: 1 }, xp: 48 },
  { out: 'ranger_armor',    cost: { emerald: 3, pelt: 4 }, xp: 155 },
  { out: 'sorcerer_amulet', cost: { ruby: 2, iron_bar: 1 }, xp: 70 },
  { out: 'sorcerer_ring',   cost: { ruby: 1, bronze_bar: 1 }, xp: 50 },
  { out: 'sorcerer_robes',  cost: { ruby: 3, iron_bar: 2 }, xp: 165 },
  { out: 'vigor_amulet',    cost: { sapphire: 1, emerald: 1 }, xp: 55 },
  { out: 'crystalweave_amulet', cost: { crystal_shard: 3, sapphire: 2 }, xp: 180 },
  { out: 'bonecharm_ring',      cost: { bone_shard: 3, iron_bar: 2 }, xp: 160 },
  { out: 'tideheart_amulet',    cost: { pearl: 2, emerald: 2 }, xp: 220 },
  { out: 'verdant_charm',       cost: { vine_coil: 3, fae_dust: 2 }, xp: 210 },
  { out: 'stormforged_ring',    cost: { storm_shard: 3, iron_bar: 2 }, xp: 200 },
  { out: 'mariner_plate',   cost: { barnacle_plate: 3, pearl: 2 }, xp: 200 },
  { out: 'barnacle_shield', cost: { barnacle_plate: 3, sapphire: 2 }, xp: 180 },
  { out: 'barrow_blade',    cost: { grave_iron: 2, ruby: 2 }, xp: 210 },
  { out: 'grave_plate',     cost: { grave_iron: 3, emerald: 2 }, xp: 220 },
  { out: 'tideglass_ring',  cost: { coral_chunk: 3, sapphire: 2 }, xp: 190 },
  { out: 'coral_armor',     cost: { coral_chunk: 4, pearl: 2 }, xp: 200 },
  { out: 'geode_charm',     cost: { shard_dust: 3, sapphire: 2 }, xp: 205 },
  { out: 'windborne_cloak', cost: { skyfeather: 3, gale_core: 2 }, xp: 230 },
  { out: 'ashen_signet',    cost: { obsidian_shard: 4, ruby: 2 }, xp: 240 },
  // Craftable gear sets (forge all 3 pieces for the set bonus)
  { out: 'valkyr_plate',  cost: { mithril_bar: 4, sapphire: 3, crystal_shard: 2 }, xp: 280 },
  { out: 'valkyr_glaive', cost: { mithril_bar: 3, storm_shard: 2 }, xp: 260 },
  { out: 'valkyr_shield', cost: { mithril_bar: 3, emerald: 2 }, xp: 250 },
  { out: 'stormweaver_robes',   cost: { crystal_shard: 4, fae_dust: 2, sapphire: 2 }, xp: 280 },
  { out: 'stormweaver_scepter', cost: { crystal_shard: 3, storm_shard: 2, ruby: 1 }, xp: 270 },
  { out: 'stormweaver_sigil',   cost: { sapphire: 2, fae_dust: 2 }, xp: 240 },
  // Silver & gold jewellery (from the new mining bars + gems)
  { out: 'silver_ring',   cost: { silver_bar: 1, sapphire: 1 }, xp: 60 },
  { out: 'silver_amulet', cost: { silver_bar: 1, emerald: 1 },  xp: 85 },
  { out: 'gold_ring',     cost: { gold_bar: 1, ruby: 1 },       xp: 120 },
  { out: 'gold_amulet',   cost: { gold_bar: 1, ruby: 2 },       xp: 150 },
  { out: 'wax_candle',    cost: { beeswax: 2 },                 xp: 40 },   // beekeeping value-add
];
// Gear sets. `per` = bonus per equipped piece (partial sets reward incremental collecting);
// `full` = extra bonus when all `size` pieces are worn. Pieces may span ANY slots (weapon/
// armour/shield/amulet/ring) — an item joins a set via its `set` field.
export const SETS = {
  guardian: { name: 'Guardian', size: 3, per: { def: 2, melee: 2 }, full: { def: 4, melee: 2, maxhp: 20 } },
  ranger:   { name: 'Ranger',   size: 3, per: { ranged: 3 },        full: { ranged: 3, def: 4, maxhp: 10 } },
  sorcerer: { name: 'Sorcerer', size: 3, per: { magic: 4 },         full: { magic: 2, maxhp: 10 } },
  valkyr:     { name: 'Valkyr',     size: 3, per: { melee: 2, def: 1 }, full: { melee: 3, def: 4, maxhp: 30 } },
  stormweaver:{ name: 'Stormweaver', size: 3, per: { magic: 2 },       full: { magic: 6, maxhp: 25 } },
};

// Default unarmed weapon, and a resolver for an equipped weapon key.
export const FISTS = { name: 'Fists', icon: '✊', style: 'unarmed', skill: 'combat', bonus: 0, range: 2.7, speed: 0.5 };
export const weaponOf = (key) => (key ? ITEMS[key] : FISTS);

// Anvil forge recipes (bars / pelts -> gear).
export const FORGE = [
  { out: 'bronze_sword', cost: { bronze_bar: 3 }, xp: 50 },
  { out: 'iron_sword',   cost: { iron_bar: 4 }, xp: 90 },
  { out: 'steel_sword',  cost: { iron_bar: 6, coal: 4 }, xp: 160 },
  { out: 'leather_armor', cost: { pelt: 4 }, xp: 45 },
  { out: 'iron_armor',   cost: { iron_bar: 5 }, xp: 120 },
  { out: 'steel_armor',  cost: { iron_bar: 8, coal: 5 }, xp: 210 },
  { out: 'wooden_shield', cost: { wood: 6 }, xp: 40 },
  { out: 'iron_shield',   cost: { iron_bar: 4 }, xp: 110 },
  { out: 'steel_shield',  cost: { iron_bar: 7, coal: 4 }, xp: 190 },
  { out: 'mithril_sword',  cost: { mithril_bar: 3 }, xp: 240 },
  { out: 'mithril_armor',  cost: { mithril_bar: 5 }, xp: 330 },
  { out: 'mithril_shield', cost: { mithril_bar: 4 }, xp: 270 },
  // Toolsmithing — forge gathering tools (each tier gathers faster); owning the best is auto-used.
  { out: 'bronze_pickaxe', cost: { bronze_bar: 2 }, xp: 40 }, { out: 'iron_pickaxe', cost: { iron_bar: 2 }, xp: 80 }, { out: 'steel_pickaxe', cost: { iron_bar: 3, coal: 2 }, xp: 150 }, { out: 'mithril_pickaxe', cost: { mithril_bar: 2 }, xp: 230 },
  { out: 'bronze_hatchet', cost: { bronze_bar: 2 }, xp: 40 }, { out: 'iron_hatchet', cost: { iron_bar: 2 }, xp: 80 }, { out: 'steel_hatchet', cost: { iron_bar: 3, coal: 2 }, xp: 150 }, { out: 'mithril_hatchet', cost: { mithril_bar: 2 }, xp: 230 },
  { out: 'bronze_harpoon', cost: { bronze_bar: 2 }, xp: 40 }, { out: 'iron_harpoon', cost: { iron_bar: 2 }, xp: 80 }, { out: 'steel_harpoon', cost: { iron_bar: 3, coal: 2 }, xp: 150 }, { out: 'mithril_harpoon', cost: { mithril_bar: 2 }, xp: 230 },
  // Adamant & runite gear + tools (from the new ores' bars)
  { out: 'adamant_sword',  cost: { adamant_bar: 3 }, xp: 340 }, { out: 'adamant_armor',  cost: { adamant_bar: 5 }, xp: 460 }, { out: 'adamant_shield', cost: { adamant_bar: 4 }, xp: 390 },
  { out: 'runite_sword',   cost: { runite_bar: 3 },  xp: 480 }, { out: 'runite_armor',   cost: { runite_bar: 5 },  xp: 640 }, { out: 'runite_shield',  cost: { runite_bar: 4 },  xp: 540 },
  { out: 'adamant_pickaxe', cost: { adamant_bar: 2 }, xp: 320 }, { out: 'adamant_hatchet', cost: { adamant_bar: 2 }, xp: 320 }, { out: 'adamant_harpoon', cost: { adamant_bar: 2 }, xp: 320 },
  { out: 'runite_pickaxe',  cost: { runite_bar: 2 },  xp: 440 }, { out: 'runite_hatchet',  cost: { runite_bar: 2 },  xp: 440 }, { out: 'runite_harpoon',  cost: { runite_bar: 2 },  xp: 440 },
];

// Fletching bench recipes (Woodcutting -> Ranged). qty = how many you get per craft; level gates the tier.
export const FLETCH = [
  { out: 'shortbow',      cost: { wood: 1 }, xp: 20, qty: 1, level: 1 },
  { out: 'longbow',       cost: { wood: 2 }, xp: 48, qty: 1, level: 10 },
  { out: 'arrow_shaft',   cost: { wood: 1 }, xp: 8,  qty: 8, level: 1 },
  { out: 'bronze_arrow',  cost: { arrow_shaft: 8, feather: 4, bronze_bar: 1 }, xp: 24, qty: 8, level: 1 },
  { out: 'iron_arrow',    cost: { arrow_shaft: 8, feather: 4, iron_bar: 1 },   xp: 42, qty: 8, level: 15 },
  { out: 'mithril_arrow', cost: { arrow_shaft: 8, feather: 4, mithril_bar: 1 }, xp: 80, qty: 8, level: 35 },
  { out: 'sky_arrow',     cost: { arrow_shaft: 8, skyfeather: 4, mithril_bar: 1 }, xp: 110, qty: 8, level: 45 },
  { out: 'adamant_arrow', cost: { arrow_shaft: 8, feather: 4, adamant_bar: 1 }, xp: 95,  qty: 8, level: 45 },
  { out: 'runite_arrow',  cost: { arrow_shaft: 8, feather: 4, runite_bar: 1 },  xp: 130, qty: 8, level: 60 },
  // Longbows fletched from the new logs — a Ranged ladder for woodcutters
  { out: 'oak_longbow', cost: { oak_log: 1 },    xp: 55,  qty: 1, level: 12 },
  { out: 'willow_bow',  cost: { willow_log: 1 }, xp: 80,  qty: 1, level: 24 },
  { out: 'maple_bow',   cost: { maple_log: 1 },  xp: 110, qty: 1, level: 36 },
  { out: 'yew_longbow', cost: { yew_log: 1 },    xp: 150, qty: 1, level: 50 },
  { out: 'magic_bow',   cost: { magic_log: 1 },  xp: 210, qty: 1, level: 68 },
];

// Runecrafting (rune altar): essence -> elemental runes. qty per essence; level gates the tier.
export const RUNECRAFT = [
  { out: 'air_rune',   cost: { rune_essence: 1 }, qty: 4, xp: 14, level: 1 },
  { out: 'earth_rune', cost: { rune_essence: 1 }, qty: 4, xp: 18, level: 5 },
  { out: 'water_rune', cost: { rune_essence: 1 }, qty: 3, xp: 24, level: 10 },
  { out: 'fire_rune',  cost: { rune_essence: 1 }, qty: 3, xp: 32, level: 16 },
];
// Enchanting (rune altar): gem + runes -> enchanted jewelry (awards Magic xp).
export const ENCHANT = [
  { out: 'rune_ring',   cost: { sapphire: 1, water_rune: 8, earth_rune: 8 }, xp: 80,  level: 1 },
  { out: 'rune_amulet', cost: { ruby: 1, fire_rune: 12, air_rune: 8 },       xp: 150, level: 12 },
];

// Construction (Carpenter's Workbench at your house): planks -> home furniture that adds a
// service at home (key matches world.houseFurniture; station is the kind it activates).
export const CONSTRUCT = [
  { key: 'shrine', name: 'Home Shrine',    cost: { plank: 8 },  xp: 140, level: 1 },
  { key: 'hearth', name: 'Cooking Hearth', cost: { plank: 10 }, xp: 190, level: 6 },
  { key: 'chest',  name: 'Storage Chest',  cost: { plank: 14 }, xp: 250, level: 12 },
];

// NPC anchor positions are relative to the village; entities.js drops them to ground.
export const NPCS = [
  { key: 'elder',    name: 'Elder Maren',  color: 0xffd45f, pos: { x: 6,  z: -14.5 }, dialogue: 'elder' },
  { key: 'ranger',   name: 'Ranger Coyle', color: 0x7cffb0, pos: { x: 11, z: -8.5 },  dialogue: 'ranger' },
  { key: 'merchant', name: 'Trader Pell',  color: 0x9bf2ff, pos: { x: 1,  z: -8.5 },  dialogue: 'merchant' },
  { key: 'miner',    name: 'Old Bryn',     color: 0xc8a06a, pos: { x: 104, z: 22 },   dialogue: 'miner' },
  { key: 'smith',    name: 'Smith Dorrin', color: 0xff9a5a, pos: { x: 116, z: 20 },   dialogue: 'smith' },
  { key: 'fisher',   name: 'Wren',         color: 0x6fd0ff, pos: { x: 138, z: 10 },   dialogue: 'fisher' },
  { key: 'slayer',   name: 'Slayer Master Krael', color: 0xff6b6b, pos: { x: 12, z: -4 }, dialogue: 'slayermaster' },
  { key: 'druid',    name: 'Thornwarden Eld',     color: 0x4fae84, pos: { x: -92, z: 18 }, dialogue: 'druid' },
  { key: 'nomad',    name: 'Zara the Nomad',      color: 0xe3c277, pos: { x: 32, z: 100 }, dialogue: 'nomad' },
  { key: 'frostkeeper', name: 'Frostkeeper Nessa', color: 0xbfe0ff, pos: { x: 94, z: -80 }, dialogue: 'frostkeeper' },
  { key: 'gravekeeper', name: 'Gravekeeper Sael', color: 0x8a7ab0, pos: { x: -80, z: 88 }, dialogue: 'gravekeeper' },
  { key: 'warden',      name: 'Warden Brakka',    color: 0x9ac46a, pos: { x: -14, z: 16 }, dialogue: 'warden' },
  { key: 'lapidary',    name: 'Lapidary Sten',    color: 0x9bf2ff, pos: { x: 92, z: -82 }, dialogue: 'lapidary' },
  { key: 'emberwright', name: 'Emberwright Vol',  color: 0xff7a3a, pos: { x: 122, z: 18 }, dialogue: 'emberwright' },
  { key: 'oracle',      name: 'Oracle Nerida',    color: 0x2bd6cf, pos: { x: 50, z: 80 }, dialogue: 'oracle' },
  { key: 'pathfinder',  name: 'Pathfinder Anouk', color: 0x4fd06a, pos: { x: 188, z: 28 }, dialogue: 'pathfinder' },
  { key: 'cinderwarden', name: 'Cinderwarden Hax', color: 0xff7a3a, pos: { x: 128, z: 98 }, dialogue: 'cinderwarden' },
  { key: 'stormcaller', name: 'Stormcaller Branok', color: 0x9bdcff, pos: { x: -154, z: -32 }, dialogue: 'stormcaller' },
  { key: 'faewarden',   name: 'Oona the Fae',     color: 0xc6a8ff, pos: { x: -21, z: -100 }, dialogue: 'faewarden' },
  // Saga-givers (long multi-stage questlines)
  { key: 'vael',   name: 'Loremaster Vael', color: 0xffd45f, pos: { x: 2, z: -9 },    dialogue: 'saga_vael' },
  { key: 'guildmaster', name: 'Guildmaster Aldric', color: 0xffe08a, pos: { x: 9, z: -8 }, dialogue: 'saga_trades' },
  { key: 'eira',   name: 'Skald Eira',      color: 0xbfe0ff, pos: { x: 90, z: -78 },  dialogue: 'saga_eira' },
  { key: 'sefu',   name: 'Chronicler Sefu', color: 0xe3c277, pos: { x: 30, z: 108 },  dialogue: 'saga_sefu' },
  { key: 'itzel',  name: 'Wayfarer Itzel',  color: 0x4fd06a, pos: { x: 180, z: 32 },  dialogue: 'saga_itzel' },
  { key: 'ardith', name: 'Seer Ardith',     color: 0xc6a8ff, pos: { x: -29, z: -104 }, dialogue: 'saga_ardith' },
  // Expansion III — Saltcrest Harbor (south) + Amberfell (north)
  { key: 'harbormaster', name: 'Harbourmaster Dell', color: 0x6fd0ff, pos: { x: 86, z: 185 },  dialogue: 'harbormaster' },
  { key: 'corsair',      name: 'Old Corsair Sabine', color: 0xe0c060, pos: { x: 74, z: 185 },  dialogue: 'saga_corsair' },
  { key: 'amberwarden',  name: 'Warden Rowan',       color: 0xe0852e, pos: { x: 56, z: -160 }, dialogue: 'amberwarden' },
  { key: 'loreseeker',   name: 'Loreseeker Wynn',    color: 0xc6a8ff, pos: { x: 44, z: -160 }, dialogue: 'saga_amber' },
  { key: 'tidecaptain',  name: 'Diver-Captain Yara', color: 0x4fd0c4, pos: { x: -96, z: -116 }, dialogue: 'saga_lagoon' },
  { key: 'veyra',        name: 'Lapidary Veyra',     color: 0xc0a8ff, pos: { x: -138, z: 100 }, dialogue: 'saga_veyra' },
  { key: 'quarryman',    name: 'Quarryman Toll',     color: 0x9ab0d0, pos: { x: -134, z: 110 }, dialogue: 'quarryman' },
  { key: 'skyfalconer',  name: 'Stormcaller Maelis', color: 0x9bdcff, pos: { x: 138, z: -126 }, dialogue: 'saga_skyreach' },
  { key: 'sporehermit',  name: 'Hesper the Listener', color: 0x9aff7a, pos: { x: -130, z: 50 }, dialogue: 'saga_spore' },
  { key: 'pyrewarden',   name: 'Pyrewarden Calla',   color: 0xff7a3a, pos: { x: -30, z: 178 }, dialogue: 'saga_calla' },
  // --- Expansion IV NPCs: 3 per new realm ---
  { key: 'tidewright_mira',  name: 'Tidewright Mira',     color: 0x6fd0ff, pos: { x: 250, z: -62 },  dialogue: 'tidewright_mira' },
  { key: 'glowmoth_sefa',    name: 'Glowmoth-Keeper Sefa', color: 0xffd47a, pos: { x: 254, z: -66 }, dialogue: 'glowmoth_sefa' },
  { key: 'reefborn_brannoc', name: 'Reefborn Brannoc',    color: 0x9ff0ff, pos: { x: 256, z: -60 },  dialogue: 'reefborn_brannoc' },
  { key: 'auralis',          name: 'Skywarden Auralis',   color: 0x9bf2ff, pos: { x: -24, z: -248 }, dialogue: 'auralis' },
  { key: 'thresk',           name: 'Ice-warden Thresk',   color: 0xbfe0ff, pos: { x: -29, z: -252 }, dialogue: 'thresk' },
  { key: 'vetr',             name: 'Vetr the Frostbound', color: 0xeafcff, pos: { x: -26, z: -260 }, dialogue: 'vetr' },
  { key: 'glasswright',      name: 'Glasswright Ousha',   color: 0xff8a3d, pos: { x: 238, z: 158 },  dialogue: 'glasswright' },
  { key: 'cinderscout',      name: 'Last-Walker Tobren',  color: 0xffb07a, pos: { x: 242, z: 153 },  dialogue: 'cinderscout' },
  { key: 'goldwarden',       name: 'Prospector Dbenn',    color: 0xffe066, pos: { x: 244, z: 159 },  dialogue: 'goldwarden' },
  { key: 'greywarden',       name: 'Greywarden Oslo',     color: 0xc8a6ff, pos: { x: -254, z: 4 },   dialogue: 'greywarden' },
  { key: 'wispbinder',       name: 'Marrow the Wisp-binder', color: 0xb88ad6, pos: { x: -259, z: 0 }, dialogue: 'wispbinder' },
  { key: 'relictrader',      name: 'Tace Greypalm',       color: 0x9a8ab0, pos: { x: -256, z: 7 },   dialogue: 'relictrader' },
  { key: 'salma_brinewright', name: 'Salma Tidewright',   color: 0xf08fb8, pos: { x: -148, z: 224 }, dialogue: 'salma_brinewright' },
  { key: 'bittersong_baron', name: 'Cael Bittersong',     color: 0xffe6f4, pos: { x: -152, z: 219 }, dialogue: 'bittersong_baron' },
  { key: 'wrenn_mirrorwalk', name: 'Wrenn Mirrorwalk',    color: 0xd86fa0, pos: { x: -150, z: 227 }, dialogue: 'wrenn_mirrorwalk' },
];

// Ambient mobile NPCs (not quest-givers): patrolling guard squads + lone wanderers
// that walk around to make the world feel alive. Spawned + driven in entities.js.
export const WANDERERS = [
  { kind: 'squad',  name: 'Hearth Watch', color: 0x8a93ad, helm: 0xc2ccd6, count: 4, speed: 2.3, loop: [{ x: -16, z: -8 }, { x: -16, z: -30 }, { x: 20, z: -30 }, { x: 20, z: -8 }] },
  { kind: 'squad',  name: 'Harbor Guard', color: 0x3a6a8a, helm: 0x2a4a5a, count: 3, speed: 2.2, loop: [{ x: 66, z: 178 }, { x: 66, z: 196 }, { x: 94, z: 196 }, { x: 94, z: 178 }] },
  // Prisoner escort — three watchmen marching a bound captive to the warden's hall. Talk to the captive (or guards) for a story hook.
  { kind: 'escort', name: 'Watch Escort', color: 0x6f7686, helm: 0x9aa2ad, count: 3, speed: 1.9, prisoner: { name: 'Wrenna', color: 0x8a7a5e }, loop: [{ x: -14, z: -10 }, { x: -14, z: -28 }, { x: 18, z: -28 }, { x: 18, z: -10 }] },
  { kind: 'wander', name: 'Villager',  color: 0x9a6a3a, home: { x: 12, z: -22 }, radius: 12, speed: 1.5 },
  { kind: 'wander', name: 'Monk',      color: 0x6a6a78, home: { x: -2, z: -6 },  radius: 9,  speed: 1.2 },
  { kind: 'wander', name: 'Merchant',  color: 0xc8a23a, home: { x: 32, z: 100 }, radius: 11, speed: 1.4 },
  { kind: 'wander', name: 'Dockhand',  color: 0x4a8f7a, home: { x: 88, z: 180 }, radius: 9,  speed: 1.5 },
  // round 2: more townsfolk to fill out the busy towns (ambient — they mutter, but aren't quest-givers)
  { kind: 'wander', name: 'Baker',      color: 0xd8b88a, home: { x: 4,  z: -18 }, radius: 8,  speed: 1.3 },
  { kind: 'wander', name: 'Child',      color: 0x8fd0e0, home: { x: 8,  z: -10 }, radius: 15, speed: 2.4 },
  { kind: 'wander', name: 'Bard',       color: 0x9a6ab0, home: { x: -4, z: -11 }, radius: 7,  speed: 1.1 },
  { kind: 'wander', name: 'Fisherwife', color: 0x5a8a9a, home: { x: 80, z: 182 }, radius: 8,  speed: 1.4 },
  { kind: 'wander', name: 'Stevedore',  color: 0x6a5a4a, home: { x: 92, z: 188 }, radius: 7,  speed: 1.5 },
  // --- Crownhaven, the capital: two guard squads patrolling the castle plaza + royal townsfolk ---
  { kind: 'squad',  name: 'Crown Guard', color: 0x9aa0c8, helm: 0xffd45f, count: 4, speed: 2.2, loop: [{ x: -12, z: 250 }, { x: 12, z: 250 }, { x: 12, z: 274 }, { x: -12, z: 274 }] },
  { kind: 'squad',  name: 'Castle Watch', color: 0x8a93ad, helm: 0xcdd6e0, count: 3, speed: 2.0, loop: [{ x: -18, z: 262 }, { x: 0, z: 248 }, { x: 18, z: 262 }, { x: 0, z: 276 }] },
  { kind: 'wander', name: 'Herald',    color: 0xffd45f, home: { x: -10, z: 250 }, radius: 9, speed: 1.5 },
  { kind: 'wander', name: 'Courtier',  color: 0x9b6bff, home: { x: 12,  z: 268 }, radius: 8, speed: 1.3 },
  { kind: 'wander', name: 'Noble',     color: 0xc6a8ff, home: { x: -14, z: 272 }, radius: 8, speed: 1.2 },
  { kind: 'wander', name: 'Handmaid',  color: 0xe0b0d0, home: { x: 14,  z: 252 }, radius: 8, speed: 1.4 },
];

// Tameable animals → companion pets. One pet follows you at a time and grants its perk
// (combat bonus folded into gearBonus, or a `gather` multiplier on gathering speed).
// tameLevel gates which beasts your Beastmastery can charm. Boss pets ('pet_<key>') are
// rare cosmetic drops with a small all-round perk.
export const PET_DEF = {
  chicken: { name: 'Chick',      tameLevel: 1,  perk: { maxhp: 4 } },
  rabbit:  { name: 'Bunny',      tameLevel: 1,  gather: 0.92 },
  squirrel:{ name: 'Squirrel',   tameLevel: 3,  gather: 0.90 },
  duck:    { name: 'Duckling',   tameLevel: 3,  perk: { magic: 3 } },
  sheep:   { name: 'Lamb',       tameLevel: 5,  perk: { def: 3 } },
  pig:     { name: 'Piglet',     tameLevel: 5,  perk: { maxhp: 10 } },
  goat:    { name: 'Kid Goat',   tameLevel: 8,  perk: { melee: 3 } },
  cow:     { name: 'Calf',       tameLevel: 10, perk: { maxhp: 14 } },
  fox:     { name: 'Fox Kit',    tameLevel: 12, perk: { ranged: 4 } },
  badger:  { name: 'Badger Cub', tameLevel: 14, perk: { def: 3, melee: 2 } },
  deer:    { name: 'Fawn',       tameLevel: 15, perk: { def: 4 } },
  boar:    { name: 'Boarling',   tameLevel: 18, perk: { melee: 5 } },
};

// Spellbook — cast from the Spells menu tab; each gated by Magic level. Teleports move you;
// High Alchemy turns items into gold (a Magic money-maker); Superheat smelts ore anywhere.
export const SPELLS = [
  { key: 'home',      name: 'Home Teleport',     icon: '🏠', level: 1,  xp: 10, desc: 'Teleport to Hearth Village.' },
  { key: 'way',       name: 'Waystone Teleport', icon: '🌀', level: 12, xp: 18, desc: 'Teleport to any waystone you have attuned.' },
  { key: 'alch',      name: 'High Alchemy',      icon: '🪙', level: 20, xp: 0,  desc: 'Turn an item into gold for Magic XP.' },
  { key: 'superheat', name: 'Superheat Item',    icon: '🔥', level: 30, xp: 0,  desc: 'Smelt ore into a bar without a furnace.' },
];

// Talent / perk tree — spend perk points (earned from total levels, quest points, achievements)
// on build-defining passives. Each folds into an existing system. reqSkill/req gates a perk;
// prereq requires another perk first. Toggle in the Perks menu tab (refundable).
export const PERK_DEFS = [
  { key: 'scholar',         name: 'Scholar',         icon: '📚', cost: 3, reqSkill: 'prayer',      req: 5,  desc: 'All XP gains +12%.' },
  { key: 'bastion',         name: 'Bastion',         icon: '🛡️', cost: 4, reqSkill: 'defence',     req: 12, desc: '+22 max HP.' },
  { key: 'stoneheart',      name: 'Stoneheart',      icon: '🪨', cost: 5, reqSkill: 'defence',     req: 20, desc: 'Take 10% less damage.' },
  { key: 'prospector',      name: 'Prospector',      icon: '⛏️', cost: 3, reqSkill: 'mining',      req: 10, desc: 'Mine 20% faster.' },
  { key: 'woodmaster',      name: 'Woodmaster',      icon: '🪓', cost: 3, reqSkill: 'woodcutting', req: 10, desc: 'Chop 20% faster.' },
  { key: 'naturalist',      name: 'Naturalist',      icon: '🌿', cost: 3, reqSkill: 'foraging',    req: 8,  desc: 'Forage & fish 15% faster.' },
  { key: 'lucky',           name: 'Lucky',           icon: '🎲', cost: 4, reqSkill: 'slayer',      req: 5,  desc: 'Rare drops 25% more often.' },
  { key: 'treasure_hunter', name: 'Treasure Hunter', icon: '🪙', cost: 4, reqSkill: 'thieving',    req: 12, desc: 'Extra gold from kills & caskets.' },
  { key: 'zealot',          name: 'Zealot',          icon: '✨', cost: 3, reqSkill: 'prayer',      req: 15, desc: 'Prayer drains 25% slower.' },
  { key: 'alchemist',       name: 'Alchemist',       icon: '⚗️', cost: 3, reqSkill: 'magic',       req: 12, desc: 'Alchemy & Superheat +25% Magic XP.' },
  { key: 'berserker',       name: 'Berserker',       icon: '⚔️', cost: 4, reqSkill: 'combat',      req: 15, desc: '+18% melee damage below 40% HP.' },
  { key: 'lifesteal',       name: 'Lifesteal',       icon: '❤️', cost: 5, reqSkill: 'combat',      req: 18, prereq: 'berserker', desc: 'Melee hits heal 8% of damage dealt.' },
  { key: 'medic',           name: 'Medic',           icon: '🧪', cost: 3, reqSkill: 'herblore',    req: 8,  desc: 'Food & potions heal 15% more.' },
  { key: 'tracker',         name: 'Tracker',         icon: '☠️', cost: 4, reqSkill: 'slayer',      req: 12, desc: '+30% Slayer XP.' },
];

// Skill-cape colours (worn cosmetically on the back once a skill hits level 99). 'max' = all-99.
export const CAPE_COLORS = {
  combat: 0xc04040, ranged: 0x6a9a4a, magic: 0x9b6bff, defence: 0x9bd0ff, slayer: 0x3a2230,
  woodcutting: 0x8a5a2e, mining: 0xc2ccd6, fishing: 0x2bd6cf, foraging: 0x4f9a40, cooking: 0xff7a3a,
  smithing: 0xcdd6e0, farming: 0x6e9a3a, herblore: 0x7a4a8a, thieving: 0x6a4a9a, crafting: 0xffd45f,
  fletching: 0xb98f4a, runecraft: 0xc6a8ff, construction: 0x9aa0a8, agility: 0xbfe6ff, prayer: 0xe8e0ff,
  beastmastery: 0xffe066, firemaking: 0xff7a2a, max: 0xffd45f,
};

// Wardrobe dye palette — bright/saturated hues that read well on the additive display (no pure white/black).
export const DYE_PALETTE = {
  crimson: 0xff2a2a, ember: 0xff6a2a, sunlight: 0xffd45f, jade: 0x2aff7a, forest: 0x2ab84a,
  frost: 0x9bd0ff, royal: 0x2a5aff, twilight: 0xb080ff, rose: 0xff7ab0, copper: 0xcc7722,
  ivory: 0xf0ead0, shadow: 0x4a3a6a,
};

// Factions & reputation — favour earned passively through play. Each tier grants standing rewards:
//   b: combat bonuses summed across all factions' current tiers (fold into gearBonus)
//   shop: buy-price multiplier (best/lowest wins) · sell: sell-price multiplier (best/highest wins)
//   gather: gathering-time multiplier (best/lowest wins). Rep caps at the final tier's threshold.
export const FACTIONS = {
  hearth_watch: { name: 'Hearth Watch', icon: '🔥', earn: 'completing quests for the realm', tiers: [
    { rep: 0, name: 'Stranger' }, { rep: 600, name: 'Ally', shop: 0.96 }, { rep: 1800, name: 'Guardian', shop: 0.92, b: { def: 2 } },
    { rep: 4000, name: 'Warden', shop: 0.88, b: { def: 4, maxhp: 8 } }, { rep: 7000, name: 'First Keeper', shop: 0.82, b: { def: 6, maxhp: 15, melee: 2, ranged: 2, magic: 2 } } ] },
  slayer_order: { name: 'Slayer Order', icon: '⚔️', earn: 'slaying foes and bosses', tiers: [
    { rep: 0, name: 'Recruit' }, { rep: 600, name: 'Slayer', b: { melee: 2 } }, { rep: 1800, name: 'Vanguard', b: { melee: 5, ranged: 2 } },
    { rep: 4000, name: 'Drakeslayer', b: { melee: 9, ranged: 4 } }, { rep: 7000, name: 'Grandmaster', b: { melee: 14, ranged: 7, def: 3 } } ] },
  wardens_wild: { name: 'Wardens of the Wild', icon: '🌿', earn: 'gathering — chopping, mining, fishing, foraging', tiers: [
    { rep: 0, name: 'Visitor' }, { rep: 600, name: 'Friend', gather: 0.97 }, { rep: 1800, name: 'Warden', gather: 0.93, b: { ranged: 3 } },
    { rep: 4000, name: 'Naturalist', gather: 0.88, b: { ranged: 6, maxhp: 8 } }, { rep: 7000, name: 'Keeper of the Wilds', gather: 0.82, b: { ranged: 10, maxhp: 14, magic: 2 } } ] },
  mages_circle: { name: "Mages' Circle", icon: '🔮', earn: 'casting spells', tiers: [
    { rep: 0, name: 'Novice' }, { rep: 600, name: 'Apprentice', b: { magic: 3 } }, { rep: 1800, name: 'Arcanist', shop: 0.94, b: { magic: 7 } },
    { rep: 4000, name: 'Sage', b: { magic: 12, def: 2 } }, { rep: 7000, name: 'Archmage', b: { magic: 18, def: 4, maxhp: 10 } } ] },
  merchants_guild: { name: "Merchants' Guild", icon: '🪙', earn: 'trading at shops and donating gold', tiers: [
    { rep: 0, name: 'Peddler' }, { rep: 600, name: 'Trader', sell: 1.05 }, { rep: 1800, name: 'Merchant', sell: 1.10, shop: 0.95 },
    { rep: 4000, name: 'Factor', sell: 1.15, shop: 0.90 }, { rep: 7000, name: 'Venture Master', sell: 1.22, shop: 0.85, b: { maxhp: 10 } } ] },
};

// Hidden things to stumble on while exploring — deliberately NOT shown on the map or quest
// arrow. Walk near and investigate for a one-time reward. Persisted once found (save.js).
export const DISCOVERIES = [
  { key: 'buried_chest',   name: 'Buried Chest',   kind: 'chest',  x: 30,   z: 14,   prompt: 'Dig up the chest',    gold: 300, loot: { sapphire: 2, potion: 2 }, msg: 'Half-buried in the earth — a smuggler’s chest!' },
  { key: 'standing_stone', name: 'Standing Stone', kind: 'shrine', x: -92,  z: -18,  prompt: 'Touch the stone',     xp: { prayer: 700 }, msg: 'Ancient runes warm your spirit. (+Prayer XP)' },
  { key: 'fallen_star',    name: 'Fallen Star',    kind: 'meteor', x: 150,  z: -30,  prompt: 'Chip the star-metal', loot: { mithril_ore: 4, ruby: 1 }, msg: 'A fallen star, rich with mithril!' },
  { key: 'old_shipwreck',  name: 'Old Shipwreck',  kind: 'wreck',  x: 104,  z: 192,  prompt: 'Search the wreck',    gold: 220, loot: { mariner_plate: 1 }, msg: 'In the rotting hull — a mariner’s plate!' },
  { key: 'hermit_cache',   name: 'Hermit’s Cache', kind: 'cairn',  x: -176, z: -28,  prompt: 'Open the cache',      gold: 160, loot: { herb: 5, emerald: 1 }, msg: 'A hermit’s hidden stash of herbs and gems.' },
  { key: 'fairy_ring',     name: 'Fairy Ring',     kind: 'ring',   x: -48,  z: -136, prompt: 'Step into the ring',  xp: { agility: 600 }, gold: 100, msg: 'The fairy ring hums and quickens your step. (+Agility XP)' },
  { key: 'sunken_idol',    name: 'Sunken Idol',    kind: 'idol',   x: 80,   z: 138,  prompt: 'Pry loose the idol',  gold: 420, msg: 'A golden idol, lost for an age!' },
  { key: 'frozen_pack',    name: 'Frozen Pack',    kind: 'cairn',  x: 84,   z: -106, prompt: 'Take the pack',       gold: 150, loot: { grave_plate: 1, potion: 3 }, msg: 'A lost traveler’s pack, frozen in the snow.' },
  // --- Big-Map Upgrade: more one-time finds spread across every corner ---
  { key: 'crystal_geode',  name: 'Crystal Geode',   kind: 'crystal',    x: -128, z: 90,   prompt: 'Crack the geode',     loot: { crystal_shard: 3, sapphire: 2 }, msg: 'A geode bristling with blue crystal!' },
  { key: 'sky_relic',      name: 'Sky Relic',       kind: 'obelisk',    x: 134,  z: -122, prompt: 'Read the relic',      gold: 360, xp: { magic: 500 }, msg: 'A relic humming with high magic. (+Magic XP)' },
  { key: 'coral_trove',    name: 'Coral Trove',     kind: 'idol',       x: -90,  z: -110, prompt: 'Open the trove',      gold: 280, loot: { pearl: 4 }, msg: 'A reef-buried trove of pearls.' },
  { key: 'cinder_anvil',   name: 'Cinder Anvil',    kind: 'tower',      x: -48,  z: 168,  prompt: 'Loot the forge',      loot: { magma_core: 3, coal: 6 }, msg: 'An abandoned forge, still warm.' },
  { key: 'spore_bloom',    name: 'Spore Bloom',     kind: 'mushroom',   x: -154, z: 50,   prompt: 'Harvest the bloom',   loot: { fae_dust: 3, herb: 4 }, xp: { herblore: 400 }, msg: 'A giant bloom thick with spores. (+Herblore XP)' },
  { key: 'titan_arch',     name: 'Titan Arch',      kind: 'arch',       x: 70,   z: 10,   prompt: 'Search the arch',     gold: 250, loot: { emerald: 1 }, msg: 'Beneath the ancient arch, a cache.' },
  { key: 'hero_statue',    name: "Hero's Statue",   kind: 'statue',     x: 16,   z: 10,   prompt: 'Honour the hero',     gold: 150, xp: { combat: 300 }, msg: 'You salute a forgotten hero. (+Combat XP)' },
  { key: 'old_lighthouse', name: 'Old Lighthouse',  kind: 'lighthouse', x: 70,   z: 176,  prompt: 'Climb the lighthouse',gold: 300, loot: { sapphire: 2 }, msg: 'The keeper’s strongbox, long abandoned.' },
  { key: 'watcher_stone',  name: "Watcher's Obelisk",kind: 'obelisk',   x: -146, z: -30,  prompt: 'Touch the obelisk',   xp: { magic: 450, prayer: 300 }, msg: 'The watch-stone fills you with power. (+Magic/Prayer XP)' },
  { key: 'frost_obelisk',  name: 'Frost Obelisk',   kind: 'obelisk',    x: 88,   z: -80,  prompt: 'Touch the obelisk',   xp: { magic: 400 }, loot: { sapphire: 1 }, msg: 'Rime-crusted runes spark with cold magic. (+Magic XP)' },
  { key: 'jungle_falls',   name: 'Hidden Falls',    kind: 'waterfall',  x: 184,  z: 44,   prompt: 'Search the falls',    gold: 220, xp: { agility: 400 }, msg: 'Behind the falls, a slick ledge and a cache. (+Agility XP)' },
  { key: 'desert_tomb',    name: 'Sunken Tomb',     kind: 'tower',      x: 36,   z: 112,  prompt: 'Raid the tomb',       gold: 300, loot: { ruby: 1, emerald: 1 }, msg: 'A tomb half-swallowed by the sands.' },
  // --- Repeatable POIs (recharge on a cooldown; no permanent 'found') ---
  { key: 'campfire',       name: 'Campfire',        kind: 'campsite',   x: -86,  z: 20,   prompt: 'Rest by the fire',    repeat: 90,  effect: { heal: 9999, sfx: 'pickup', tone: 'good', col: 0xff8a3d }, msg: 'You rest by the fire and recover.' },
  { key: 'healing_spring', name: 'Healing Spring',  kind: 'geyser',     x: 188,  z: 30,   prompt: 'Drink from the spring',repeat: 150, effect: { heal: 60, prayer: 30, col: 0x6fe0d0 }, msg: 'The warm spring restores you.' },
  { key: 'wishing_well',   name: 'Wishing Well',    kind: 'well',       x: 10,   z: -6,   prompt: 'Toss a coin',         repeat: 300, effect: { gold: 30, col: 0x6fb0e0, sfx: 'pickup' }, msg: 'You toss a coin… and fish out a few more.' },
  { key: 'war_shrine',     name: 'War Shrine',      kind: 'shrine',     x: 140,  z: 110,  prompt: 'Pray at the shrine',  repeat: 240, effect: { buff: 'strength', mult: 1.15, dur: 90, col: 0xff6a4a }, msg: 'The war shrine emboldens you. (+melee for a time)' },
  { key: 'mage_obelisk',   name: 'Arcane Obelisk',  kind: 'obelisk',    x: -16,  z: -102, prompt: 'Channel the obelisk', repeat: 240, effect: { buff: 'magic', mult: 1.15, dur: 90, col: 0xb98fff }, msg: 'Arcane power surges through you. (+magic for a time)' },
  // --- Big gear round: unique weapons/armour hidden at locations ---
  { key: 'reapers_cairn', name: "Reaper's Cairn",  kind: 'cairn',   x: 66,   z: -168, prompt: 'Open the cairn',     gold: 200, loot: { gravewarden_scythe: 1 }, msg: 'A grave-warden’s scythe, laid to rest with its keeper.' },
  { key: 'warlord_camp',  name: 'Ruined War-Camp', kind: 'tower',   x: 162,  z: 108,  prompt: 'Loot the camp',     gold: 260, loot: { warlord_flail: 1, warlord_plate: 1 }, msg: 'A warlord’s spiked flail and crimson plate.' },
  { key: 'thief_cache',   name: 'Thieves’ Cache',  kind: 'chest',   x: -60,  z: 90,   prompt: 'Pick the cache',    gold: 220, loot: { shadow_claws: 1 }, msg: 'A smuggler’s stash — twin venom claws within.' },
  { key: 'hunters_perch', name: "Hunter's Perch",  kind: 'tower',   x: 128,  z: -116, prompt: 'Search the perch',  gold: 240, loot: { windpierce_crossbow: 1 }, msg: 'A windward perch and a peerless crossbow.' },
  { key: 'fae_shrine',    name: 'Moonlit Shrine',  kind: 'ring',    x: -14,  z: -122, prompt: 'Touch the shrine',  loot: { moonscythe: 1 }, xp: { magic: 300 }, msg: 'The shrine gifts a crescent of moonlight. (+Magic XP)' },
  { key: 'dread_seal',    name: 'Dread Obelisk',   kind: 'obelisk', x: 132,  z: 100,  prompt: 'Pry the seal',     gold: 280, loot: { dread_plate: 1 }, msg: 'Black spiked warplate, sealed in the stone.' },
  { key: 'arcane_study',  name: 'Lost Arcane Study', kind: 'tower', x: -128, z: 84,   prompt: 'Read the study',   loot: { archmage_robes: 1 }, xp: { magic: 350 }, msg: 'An archmage’s robes, folded with care. (+Magic XP)' },
  { key: 'knight_tomb',   name: "Fallen Knight's Tomb", kind: 'statue', x: -90, z: -6, prompt: 'Honour the knight', gold: 200, loot: { aegis_bulwark: 1 }, msg: 'A radiant bulwark, kept by a stone knight.' },
];

// Treasure-trail dig spots for clue scrolls — cryptic hints point at a landmark; dig nearby for a casket.
// Coords are scaled by WORLD_SCALE in world.js scaleWorldData (like DISCOVERIES).
export const CLUE_SPOTS = [
  { x: 0,    z: -36,  hint: 'Where the North Peak watches over the first village, dig.' },
  { x: 26,   z: 104,  hint: 'Among the sands of the Sunspire Oasis, dig.' },
  { x: 98,   z: -92,  hint: 'High on the frozen Frostpeak, dig.' },
  { x: 116,  z: 8,    hint: 'In the shadow of Emberhold’s forge, dig.' },
  { x: 80,   z: 185,  hint: 'On the salt-worn shore of Saltcrest Harbor, dig.' },
  { x: -158, z: -38,  hint: 'Atop the windswept Stormhold highlands, dig.' },
  { x: -25,  z: -110, hint: 'Within the glow of the Moonwell glade, dig.' },
  { x: 196,  z: 36,   hint: 'Deep in the Kytari jungle, dig.' },
  { x: 50,   z: -160, hint: 'Beneath the amber leaves of Amberfell, dig.' },
];

// Farmstead livestock — buy young, they mature over real time (offline too), produce goods
// you collect (eggs/milk/wool), and sell mature for profit. growMin = minutes to mature;
// ppm = produce/min per mature animal; sellPrice = gold per produce unit sold.
export const LIVESTOCK = [
  { key: 'chicken', name: 'Chicken', icon: '🐔', cost: 40,  sell: 75,  growMin: 6,  produce: 'egg',  ppm: 0.5,  sellPrice: 4 },
  { key: 'pig',     name: 'Pig',     icon: '🐷', cost: 120, sell: 250, growMin: 16, produce: null,   ppm: 0,    sellPrice: 0 },
  { key: 'sheep',   name: 'Sheep',   icon: '🐑', cost: 150, sell: 290, growMin: 22, produce: 'wool', ppm: 0.25, sellPrice: 10 },
  { key: 'cow',     name: 'Cow',     icon: '🐄', cost: 240, sell: 470, growMin: 30, produce: 'milk', ppm: 0.3,  sellPrice: 8 },
];
// Farmstead economy constants. Workers run the farm passively (net gold/min); cap = offline hours.
export const FARM = { cost: 1500, workerCost: 200, workerWage: 3, workerOutput: 9, maxWorkers: 5, capMin: 240 };

// Region Achievement Diaries — tiered task lists per region. Tasks evaluate against existing
// state (visited regions, skill levels, kills, bosses, quests, crafting). Claiming a finished
// tier grants its reward + a permanent +3 max HP perk. Add a region/tier here to extend.
export const DIARIES = [
  { region: 'verdant', name: 'Verdant Isle', tiers: [
    { name: 'Easy',   reward: { gold: 120, xp: { combat: 200 } }, tasks: [
      { desc: 'Explore the Verdant Isle', type: 'visit', region: 'verdant' },
      { desc: 'Reach Woodcutting 5', type: 'level', skill: 'woodcutting', level: 5 },
      { desc: 'Defeat 5 Wild Boars', type: 'kill', enemy: 'boar', count: 5 } ] },
    { name: 'Medium', reward: { gold: 300, xp: { combat: 400 } }, tasks: [
      { desc: 'Reach Mining 15', type: 'level', skill: 'mining', level: 15 },
      { desc: 'Defeat 12 Grey Wolves', type: 'kill', enemy: 'wolf', count: 12 },
      { desc: 'Craft 5 items', type: 'crafted', count: 5 } ] },
    { name: 'Hard',   reward: { gold: 600, xp: { combat: 800 }, item: 'ruby' }, tasks: [
      { desc: 'Reach Combat 30', type: 'level', skill: 'combat', level: 30 },
      { desc: 'Slay Emberfang', type: 'boss', boss: 'ember_boss' },
      { desc: 'Reach 150 total kills', type: 'kills', count: 150 } ] } ] },
  { region: 'ember', name: 'Emberhold', tiers: [
    { name: 'Easy',   reward: { gold: 150, xp: { smithing: 250 } }, tasks: [
      { desc: 'Visit Emberhold', type: 'visit', region: 'ember' },
      { desc: 'Reach Smithing 10', type: 'level', skill: 'smithing', level: 10 },
      { desc: 'Defeat 5 Bandits', type: 'kill', enemy: 'bandit', count: 5 } ] },
    { name: 'Medium', reward: { gold: 350, xp: { smithing: 500 } }, tasks: [
      { desc: 'Reach Smithing 25', type: 'level', skill: 'smithing', level: 25 },
      { desc: 'Obtain a Mithril Sword', type: 'have', item: 'mithril_sword' },
      { desc: 'Reach Mining 25', type: 'level', skill: 'mining', level: 25 } ] },
    { name: 'Hard',   reward: { gold: 700, xp: { smithing: 900 }, item: 'mithril_bar' }, tasks: [
      { desc: 'Slay Emberfang', type: 'boss', boss: 'ember_boss' },
      { desc: 'Reach Smithing 40', type: 'level', skill: 'smithing', level: 40 },
      { desc: 'Reach Mining 40', type: 'level', skill: 'mining', level: 40 } ] } ] },
  { region: 'desert', name: 'Sunspire Oasis', tiers: [
    { name: 'Easy',   reward: { gold: 150, xp: { mining: 250 } }, tasks: [
      { desc: 'Visit the Sunspire Oasis', type: 'visit', region: 'desert' },
      { desc: 'Defeat 5 Sand Scorpions', type: 'kill', enemy: 'scorpion', count: 5 },
      { desc: 'Reach Mining 12', type: 'level', skill: 'mining', level: 12 } ] },
    { name: 'Medium', reward: { gold: 350, xp: { mining: 500 } }, tasks: [
      { desc: 'Defeat 12 Sand Scorpions', type: 'kill', enemy: 'scorpion', count: 12 },
      { desc: 'Reach Thieving 15', type: 'level', skill: 'thieving', level: 15 },
      { desc: 'Reach Mining 30', type: 'level', skill: 'mining', level: 30 } ] },
    { name: 'Hard',   reward: { gold: 700, xp: { mining: 900 }, item: 'emerald' }, tasks: [
      { desc: 'Slay the Sandwyrm', type: 'boss', boss: 'sandwyrm' },
      { desc: 'Reach Combat 30', type: 'level', skill: 'combat', level: 30 },
      { desc: 'Reach Mining 45', type: 'level', skill: 'mining', level: 45 } ] } ] },
  { region: 'snow', name: 'The Snowfields', tiers: [
    { name: 'Easy',   reward: { gold: 150, xp: { fishing: 250 } }, tasks: [
      { desc: 'Visit the Snowfields', type: 'visit', region: 'snow' },
      { desc: 'Reach Fishing 10', type: 'level', skill: 'fishing', level: 10 },
      { desc: 'Defeat 5 Frost Wolves', type: 'kill', enemy: 'frost_wolf', count: 5 } ] },
    { name: 'Medium', reward: { gold: 350, xp: { fishing: 500 } }, tasks: [
      { desc: 'Reach Fishing 25', type: 'level', skill: 'fishing', level: 25 },
      { desc: 'Defeat 12 Frost Wolves', type: 'kill', enemy: 'frost_wolf', count: 12 },
      { desc: 'Reach Cooking 20', type: 'level', skill: 'cooking', level: 20 } ] },
    { name: 'Hard',   reward: { gold: 700, xp: { fishing: 900 }, item: 'sapphire' }, tasks: [
      { desc: 'Slay the Frost Warden', type: 'boss', boss: 'frost_warden' },
      { desc: 'Reach Fishing 40', type: 'level', skill: 'fishing', level: 40 },
      { desc: 'Reach Combat 35', type: 'level', skill: 'combat', level: 35 } ] } ] },
  { region: 'jungle', name: 'Kytari Hollow', tiers: [
    { name: 'Easy',   reward: { gold: 180, xp: { woodcutting: 280 } }, tasks: [
      { desc: 'Visit Kytari Hollow', type: 'visit', region: 'jungle' },
      { desc: 'Reach Woodcutting 20', type: 'level', skill: 'woodcutting', level: 20 },
      { desc: 'Defeat 5 Coil Serpents', type: 'kill', enemy: 'serpent', count: 5 } ] },
    { name: 'Medium', reward: { gold: 400, xp: { woodcutting: 550 } }, tasks: [
      { desc: 'Defeat 8 Jungle Panthers', type: 'kill', enemy: 'jungle_panther', count: 8 },
      { desc: 'Reach Fletching 20', type: 'level', skill: 'fletching', level: 20 },
      { desc: 'Reach Combat 30', type: 'level', skill: 'combat', level: 30 } ] },
    { name: 'Hard',   reward: { gold: 800, xp: { woodcutting: 950 }, item: 'serpent_eye' }, tasks: [
      { desc: 'Slay Jorath the Coiled', type: 'boss', boss: 'jorath' },
      { desc: 'Reach Woodcutting 45', type: 'level', skill: 'woodcutting', level: 45 },
      { desc: 'Reach Ranged 35', type: 'level', skill: 'ranged', level: 35 } ] } ] },
];

export const ENEMIES = {
  boar:   { name: 'Wild Boar',    hp: 24,  dmg: 6,  speed: 3.4, xp: 55,  color: 0x9a5a38, aggro: 10, shape: 'beast',    loot: { meat: 1, pelt: 1, bones: 1 } },
  wolf:   { name: 'Grey Wolf',    hp: 36,  dmg: 9,  speed: 4.6, xp: 85,  color: 0x9aa0a8, aggro: 13, shape: 'beast',    loot: { pelt: 1, meat: 1, bones: 1 } },
  bandit: { name: 'Ashen Bandit', hp: 52,  dmg: 13, speed: 3.9, xp: 130, color: 0x8a6f9a, aggro: 12, shape: 'humanoid', loot: { gold: 18, coal: 1, bones: 1 } },
  frost_wolf: { name: 'Frost Wolf',  hp: 60, dmg: 15, speed: 4.8, xp: 165, color: 0xcfe0f2, aggro: 14, shape: 'beast', loot: { pelt: 1, bones: 1, coal: 1 } },
  scorpion:   { name: 'Sand Scorpion', hp: 46, dmg: 12, speed: 3.6, xp: 120, color: 0xd8a85a, aggro: 11, shape: 'beast', poison: 3, loot: { bones: 1, iron_ore: 1 } },
  ember_boss: { name: 'Emberfang', hp: 170, dmg: 22, speed: 3.7, xp: 520, color: 0xff5a2a, aggro: 18, shape: 'beast', scale: 1.9, boss: true, loot: { gold: 140, relic: 1, iron_ore: 5, bones: 3 }, rare: { item: 'emberheart_amulet', chance: 0.3 } },
  sandwyrm:     { name: 'Sandwyrm',     hp: 220, dmg: 24, speed: 3.4, xp: 640, color: 0xd8a85a, aggro: 18, shape: 'beast',    scale: 2.1, boss: true, loot: { gold: 180, sun_blade: 1, ruby: 1, bones: 4 }, rare: { item: 'wyrmscale_ring', chance: 0.3 } },
  frost_warden: { name: 'Frost Warden', hp: 240, dmg: 26, speed: 3.6, xp: 700, color: 0xbfe0ff, aggro: 18, shape: 'humanoid', scale: 1.8, boss: true, loot: { gold: 200, frost_staff: 1, sapphire: 2, bones: 4 }, rare: { item: 'frostguard_amulet', chance: 0.3 } },

  // Gloomroot Catacombs (undead)
  skeleton: { name: 'Skeleton',  hp: 50, dmg: 12, speed: 3.6, xp: 120, color: 0xe8e4d8, aggro: 12, shape: 'humanoid', loot: { bones: 2, bone_shard: 1 } },
  wraith:   { name: 'Wraith',    hp: 72, dmg: 17, speed: 3.4, xp: 180, color: 0x8a7ab0, aggro: 13, shape: 'humanoid', loot: { bone_shard: 1, bones: 1, gold: 20 } },
  bonelord: { name: 'Bonelord Mortrax', hp: 270, dmg: 27, speed: 3.4, xp: 760, color: 0xcfc8b0, aggro: 18, shape: 'humanoid', scale: 1.9, boss: true, loot: { gold: 220, wraithblade: 1, bone_shard: 4, bones: 5 }, rare: { item: 'lich_pendant', chance: 0.3 } },
  // Goblin Warren
  goblin:       { name: 'Goblin',       hp: 44, dmg: 11, speed: 4.2, xp: 110, color: 0x6f9a4a, aggro: 12, shape: 'humanoid', scale: 0.85, loot: { goblin_tooth: 1, gold: 10 } },
  goblin_brute: { name: 'Goblin Brute', hp: 86, dmg: 19, speed: 3.6, xp: 210, color: 0x4f7a32, aggro: 13, shape: 'humanoid', scale: 1.3,  loot: { goblin_tooth: 2, iron_ore: 1, gold: 18 } },
  warchief:     { name: 'Warchief Gronk', hp: 250, dmg: 25, speed: 3.8, xp: 720, color: 0x3f6a28, aggro: 18, shape: 'humanoid', scale: 1.9, boss: true, loot: { gold: 210, stormstring_bow: 1, goblin_tooth: 5, pelt: 3 }, rare: { item: 'brute_ring', chance: 0.3 } },
  // Crystal Hollow
  crystal_sprite: { name: 'Crystal Sprite', hp: 64,  dmg: 16, speed: 4.4, xp: 170, color: 0x9bd0ff, aggro: 13, shape: 'beast',    scale: 0.8, loot: { crystal_shard: 1, sapphire: 1 } },
  crystal_golem:  { name: 'Crystal Golem',  hp: 120, dmg: 22, speed: 3.0, xp: 260, color: 0xb0a0e6, aggro: 12, shape: 'humanoid', scale: 1.5, loot: { crystal_shard: 2, emerald: 1, gold: 24 } },
  prism_tyrant:   { name: 'The Prism Tyrant', hp: 290, dmg: 28, speed: 3.4, xp: 820, color: 0xc6a8ff, aggro: 18, shape: 'humanoid', scale: 2.0, boss: true, loot: { gold: 240, prism_staff: 1, crystal_shard: 5, ruby: 2 }, rare: { item: 'crystal_heart', chance: 0.3 } },
  // Magma Depths
  magma_imp:  { name: 'Magma Imp',  hp: 58,  dmg: 15, speed: 4.6, xp: 150, color: 0xff7a3a, aggro: 13, shape: 'beast', scale: 0.8, loot: { coal: 2, magma_core: 1 } },
  lava_hound: { name: 'Lava Hound', hp: 100, dmg: 21, speed: 4.4, xp: 240, color: 0xd85a2a, aggro: 14, shape: 'beast', scale: 1.3, loot: { magma_core: 1, coal: 3, iron_ore: 1 } },
  cinder_colossus: { name: 'Cinder Colossus', hp: 330, dmg: 30, speed: 3.0, xp: 900, color: 0xff5a2a, aggro: 18, shape: 'humanoid', scale: 2.3, boss: true, loot: { gold: 260, cinderforge_axe: 1, magma_core: 4, coal: 8 }, rare: { item: 'ember_core_ring', chance: 0.3 } },
  // Sunken Temple
  deep_lurker: { name: 'Deep Lurker', hp: 80, dmg: 18, speed: 3.8, xp: 200, color: 0x2f8f8a, aggro: 13, shape: 'beast',    loot: { pearl: 1, raw_trout: 1 } },
  tide_priest: { name: 'Tide Priest', hp: 92, dmg: 20, speed: 3.4, xp: 230, color: 0x3aa0b0, aggro: 13, shape: 'humanoid', loot: { pearl: 1, gold: 26 } },
  drowned_king: { name: 'Drowned King Nautilus', hp: 370, dmg: 32, speed: 3.4, xp: 1000, color: 0x2bd6cf, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 320, tidecaller_trident: 1, pearl: 5, relic: 1 }, rare: { item: 'pearl_depths', chance: 0.3 } },

  // Kytari Jungle / Overgrown Ziggurat + Glimmer Cavern
  jungle_panther: { name: 'Jungle Panther', hp: 72,  dmg: 17, speed: 5.2, xp: 175, color: 0x2a2d33, aggro: 14, shape: 'beast',    loot: { pelt: 2, meat: 1 } },
  serpent:        { name: 'Coil Serpent',   hp: 64,  dmg: 16, speed: 4.0, xp: 165, color: 0x3f9a4a, aggro: 12, shape: 'beast', scale: 0.8, poison: 4, loot: { vine_coil: 1, bones: 1 } },
  glimmer_bat:    { name: 'Glimmer Bat',    hp: 56,  dmg: 14, speed: 5.0, xp: 150, color: 0x9bd0ff, aggro: 13, shape: 'beast', scale: 0.7, loot: { crystal_shard: 1 } },
  jorath:         { name: 'Jorath the Coiled', hp: 330, dmg: 30, speed: 4.0, xp: 880, color: 0x2f8a3e, aggro: 18, shape: 'beast', scale: 2.3, boss: true, poison: 6, loot: { gold: 280, coilfang_spear: 1, vine_coil: 4, emerald: 2 }, rare: { item: 'serpent_eye', chance: 0.3 } },
  // Scorched Wastes / The Ashpit
  scorchling: { name: 'Scorchling', hp: 60,  dmg: 16, speed: 4.6, xp: 160, color: 0xff7a3a, aggro: 13, shape: 'beast', scale: 0.8, loot: { coal: 1, demon_ash: 1 } },
  ash_hound:  { name: 'Ash Hound',  hp: 108, dmg: 22, speed: 4.6, xp: 250, color: 0x8a3a2a, aggro: 14, shape: 'beast', scale: 1.3, loot: { demon_ash: 1, coal: 3 } },
  vurak:      { name: 'Ashlord Vurak', hp: 390, dmg: 34, speed: 3.6, xp: 1000, color: 0xff4a2a, aggro: 19, shape: 'humanoid', scale: 2.3, boss: true, loot: { gold: 340, ashbringer: 1, demon_ash: 5, magma_core: 2 }, rare: { item: 'demonheart_ring', chance: 0.3 } },
  // Stormhold Highlands / Thunderpeak Hold
  storm_harpy: { name: 'Storm Harpy', hp: 80,  dmg: 19, speed: 4.8, xp: 205, color: 0x9bdcff, aggro: 14, shape: 'humanoid', loot: { storm_shard: 1, bones: 1 } },
  crag_golem:  { name: 'Crag Golem',  hp: 132, dmg: 24, speed: 2.8, xp: 270, color: 0x7a8290, aggro: 12, shape: 'humanoid', scale: 1.5, loot: { storm_shard: 1, iron_ore: 1 } },
  thruun:      { name: 'Stormcaller Thruun', hp: 410, dmg: 35, speed: 3.4, xp: 1060, color: 0xbfe6ff, aggro: 20, shape: 'humanoid', scale: 2.4, boss: true, loot: { gold: 360, tempest_bow: 1, storm_shard: 5, coal: 6 }, rare: { item: 'storm_amulet', chance: 0.3 } },
  // Moonlit Glade / Feywild Hollow
  wisp:      { name: 'Fae Wisp',  hp: 62,  dmg: 18, speed: 5.0, xp: 185, color: 0xc6a8ff, aggro: 13, shape: 'wisp', scale: 0.9, loot: { fae_dust: 1 } },
  thornling: { name: 'Thornling', hp: 92,  dmg: 20, speed: 3.2, xp: 225, color: 0x6a4a9a, aggro: 12, shape: 'humanoid', scale: 1.2, loot: { fae_dust: 1, herb: 1 } },
  hollow_king: { name: 'The Hollow King', hp: 430, dmg: 36, speed: 3.8, xp: 1160, color: 0xb04acf, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 400, faewild_staff: 1, fae_dust: 5, ruby: 2 }, rare: { item: 'fae_crown', chance: 0.3 } },

  // --- Expansion III: Saltcrest coast + The Drowned Galleon ---
  marsh_crab: { name: 'Marsh Crab',    hp: 70,  dmg: 16, speed: 3.0, xp: 175, color: 0xc0654a, aggro: 10, shape: 'beast',    scale: 0.9, loot: { meat: 1, bones: 1 } },
  brigand:    { name: 'Coast Brigand', hp: 96,  dmg: 20, speed: 4.0, xp: 235, color: 0x6a7a8a, aggro: 13, shape: 'humanoid', loot: { gold: 24, barnacle_plate: 1, bones: 1 } },
  drowned_captain: { name: 'Captain Mordrake', hp: 400, dmg: 33, speed: 3.6, xp: 1040, color: 0x2bd6cf, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 340, barnacle_plate: 4, pearl: 4, sapphire: 2 }, rare: { item: 'corsair_cutlass', chance: 0.3 } },
  // --- Amberfell autumn woods + The Hollow Barrow ---
  blight_wolf: { name: 'Blight Wolf', hp: 84,  dmg: 18, speed: 4.8, xp: 200, color: 0x8a6a3a, aggro: 14, shape: 'beast',    loot: { pelt: 1, bones: 1 } },
  grave_husk:  { name: 'Grave Husk',  hp: 100, dmg: 21, speed: 3.2, xp: 245, color: 0x9a8a6a, aggro: 12, shape: 'humanoid', scale: 1.1, loot: { grave_iron: 1, bones: 2 } },
  barrow_wight: { name: 'The Barrow Wight', hp: 430, dmg: 35, speed: 3.4, xp: 1120, color: 0xe0a050, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 380, grave_iron: 4, ruby: 2, emerald: 1 }, rare: { item: 'wight_crown', chance: 0.3 } },
  // --- Lagoon coast (Coralside) + The Tide Grotto (drowned/siren curse) ---
  reef_reaver:  { name: 'Reef Reaver',  hp: 78,  dmg: 17, speed: 4.6, xp: 180, color: 0x2f9a8a, aggro: 13, shape: 'beast',    loot: { coral_chunk: 1, raw_trout: 1, bones: 1 } },
  coral_warden: { name: 'Coral Warden', hp: 138, dmg: 21, speed: 2.8, xp: 255, color: 0xe07a8a, aggro: 11, shape: 'humanoid', scale: 1.4, loot: { coral_chunk: 2, pearl: 1, gold: 22 } },
  lure_siren:   { name: 'Lure-Siren',   hp: 84,  dmg: 22, speed: 4.0, xp: 230, color: 0x7ae6d6, aggro: 16, shape: 'humanoid', loot: { siren_scale: 1, pearl: 1 } },
  sea_witch:    { name: 'Maelys the Sea-Witch', hp: 370, dmg: 30, speed: 3.6, xp: 1000, color: 0x35c8d6, aggro: 19, shape: 'humanoid', scale: 2.1, boss: true, loot: { gold: 320, brinecaller: 1, siren_scale: 4, pearl: 5 }, rare: { item: 'songpearl', chance: 0.3 } },
  // --- Shardspire crystal canyon + The Singing Geode (the Bloom) ---
  shard_skitter: { name: 'Shard-Skitter',  hp: 78,  dmg: 19, speed: 5.0, xp: 200, color: 0x8fe4ff, aggro: 14, shape: 'beast',    scale: 0.8, loot: { shard_dust: 1, sapphire: 1 } },
  stoneward:     { name: 'Stoneward Thrall', hp: 150, dmg: 24, speed: 3.0, xp: 250, color: 0xa9b6d8, aggro: 12, shape: 'humanoid', scale: 1.3, loot: { shard_dust: 1, bones: 1, gold: 22 } },
  chime_warden:  { name: 'Chime Warden',   hp: 130, dmg: 26, speed: 3.4, xp: 270, color: 0xc6b0ff, aggro: 14, shape: 'humanoid', scale: 1.4, loot: { shard_dust: 2, emerald: 1 } },
  resona:        { name: 'Resona, the First Note', hp: 420, dmg: 36, speed: 3.6, xp: 1140, color: 0xd0a8ff, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 400, chord_staff: 1, shard_dust: 5, sapphire: 3 }, rare: { item: 'resonant_heart', chance: 0.3 } },
  // --- Skyreach: windswept aeries, a failing storm-ward ---
  roc_fledgling: { name: 'Roc Fledgling', hp: 150, dmg: 28, speed: 5.0, xp: 290, color: 0xcdb98a, aggro: 15, shape: 'beast',    loot: { skyfeather: 1, meat: 1, bones: 1 } },
  sky_warden:    { name: 'Sky Warden',    hp: 180, dmg: 30, speed: 3.0, xp: 320, color: 0xb9c6e0, aggro: 13, shape: 'humanoid', scale: 1.2, loot: { gale_core: 1, storm_shard: 1, iron_ore: 1 } },
  gale_harrier:  { name: 'Gale Harrier',  hp: 130, dmg: 26, speed: 4.6, xp: 270, color: 0x8fd6ff, aggro: 16, shape: 'beast',    scale: 0.9, loot: { storm_shard: 1, gale_core: 1 } },
  stormcrown:    { name: 'The Stormcrown', hp: 440, dmg: 38, speed: 4.0, xp: 1180, color: 0xe6d8a0, aggro: 20, shape: 'beast', scale: 2.3, boss: true, loot: { gold: 420, skywarden_bow: 1, skyfeather: 5, storm_shard: 4 }, rare: { item: 'stormcrown_amulet', chance: 0.3 } },
  // --- Sporevale: a sentient mycelial hive-mind ---
  myconid_warden: { name: 'Myconid Warden', hp: 124, dmg: 23, speed: 3.0, xp: 250, color: 0x7a4a8a, aggro: 12, shape: 'humanoid', scale: 1.4, poison: 4, loot: { sporecap: 2, herb: 1, bones: 1 } },
  spore_thrall:   { name: 'Spore-Thrall',   hp: 96,  dmg: 21, speed: 5.0, xp: 220, color: 0x9a6aaf, aggro: 15, shape: 'beast', poison: 5, loot: { sporecap: 1, pelt: 1, meat: 1 } },
  pollen_drifter: { name: 'Pollen Drifter', hp: 88,  dmg: 20, speed: 3.6, xp: 235, color: 0xc060c0, aggro: 14, shape: 'beast', scale: 0.9, poison: 6, loot: { creeping_ichor: 1, sporecap: 1 } },
  the_chorus:     { name: 'The Chorus', hp: 440, dmg: 36, speed: 3.2, xp: 1180, color: 0xb86adf, aggro: 20, shape: 'beast', scale: 2.3, boss: true, poison: 8, grove: { enemies: ['spore_thrall', 'pollen_drifter', 'myconid_warden'], regen: 7, r: 22 }, loot: { gold: 420, hyphae_lash: 1, creeping_ichor: 4, sporecap: 6, emerald: 2 }, rare: { item: 'pall_amulet', chance: 0.3 } },
  // --- Cinderbreak: a doomsday cult on the cold caldera ---
  obsidian_sentinel: { name: 'Obsidian Sentinel', hp: 175, dmg: 26, speed: 3.0, xp: 300, color: 0x201826, aggro: 12, shape: 'humanoid', scale: 1.5, loot: { obsidian_shard: 1, coal: 3, gold: 26 } },
  cinder_cultist:    { name: 'Cinder Cultist',    hp: 96,  dmg: 24, speed: 4.4, xp: 250, color: 0x9a2a2a, aggro: 15, shape: 'humanoid', loot: { obsidian_shard: 1, herb: 1, gold: 30 } },
  ashen_revenant:    { name: 'Ashen Revenant',    hp: 130, dmg: 23, speed: 4.2, xp: 270, color: 0x6a5a52, aggro: 16, shape: 'humanoid', poison: 6, loot: { demon_ash: 1, bones: 2, obsidian_shard: 1 } },
  pyraxis:           { name: 'Pyraxis, the Unkindled', hp: 520, dmg: 40, speed: 3.2, xp: 1320, color: 0xff5a2a, aggro: 20, shape: 'humanoid', scale: 2.4, boss: true, poison: 8, enrageAt: 0.33, phase: { at: 0.66, adds: { enemy: 'cinder_cultist', n: 2 }, atkStyle: 'magic', msg: 'Pyraxis cracks — cultists rush to feed the fire! (pray Magic)' }, loot: { gold: 480, obsidian_maul: 1, obsidian_shard: 6, magma_core: 3, relic: 1 }, rare: { item: 'ashen_signet', chance: 0.3 } },
  // --- Expansion IV foes (Duskmere / Aurorath / Sablon / Mirelythe) ---
  glimmer_leech: { name: 'Glimmer-Leech', hp: 56,  dmg: 14, speed: 4.4, xp: 150, color: 0x4fd6dc, aggro: 13, shape: 'beast',    loot: { tideglass: 1, lantern_oil: 1, bones: 1 } },
  frost_wraith:  { name: 'Frost-Wraith',  hp: 64,  dmg: 16, speed: 4.2, xp: 175, color: 0xbfe0ff, aggro: 14, shape: 'humanoid', loot: { aurora_quartz: 1, frost_iron: 1, bones: 1 } },
  shade_stalker: { name: 'Shade-Stalker', hp: 60,  dmg: 16, speed: 5.0, xp: 170, color: 0x9a6abf, aggro: 15, shape: 'beast',    loot: { amethyst_wisp: 1, bones: 1 } },
  edgewraith:    { name: 'Edgewraith',    hp: 78,  dmg: 19, speed: 4.0, xp: 220, color: 0xb88ad6, aggro: 15, shape: 'humanoid', loot: { amethyst_wisp: 1, coal: 1, bones: 1 } },
  salt_wraith:   { name: 'Salt-Wraith',   hp: 58,  dmg: 15, speed: 4.0, xp: 165, color: 0xf08fb8, aggro: 13, shape: 'humanoid', loot: { brine_silver: 1, bones: 1 } },
  the_dreamward:       { name: 'The Dreamward',        hp: 230, dmg: 28, speed: 3.4, xp: 720,  color: 0x4fd6dc, aggro: 18, shape: 'humanoid', scale: 1.9, boss: true, loot: { gold: 300, tideglass: 6, pearl: 2, bones: 3 }, rare: { item: 'tideglass_ring', chance: 0.3 } },
  glacier_wight:       { name: 'Glacier-Wight',        hp: 240, dmg: 28, speed: 3.5, xp: 700,  color: 0xeafcff, aggro: 18, shape: 'humanoid', scale: 1.8, boss: true, loot: { gold: 300, frost_iron: 5, sapphire: 2, bones: 4 }, rare: { item: 'frostguard_amulet', chance: 0.3 } },
  heart_of_hoarfrost:  { name: 'The Heart of Hoarfrost', hp: 300, dmg: 32, speed: 3.0, xp: 1000, color: 0x9bf2ff, aggro: 20, shape: 'beast', scale: 2.2, boss: true, loot: { gold: 420, aurora_quartz: 6, sapphire: 2, bones: 4 } },
  the_reckoner:        { name: 'The Reckoner',         hp: 300, dmg: 34, speed: 3.2, xp: 1050, color: 0xc8a6ff, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 440, amethyst_wisp: 6, emerald: 2, bones: 4 } },
  // --- Cindughol (obsidian caldera — "The Glass That Remembers" saga) ---
  glass_wisp:          { name: 'Glass-Wisp',     hp: 60,  dmg: 15, speed: 4.6, xp: 165, color: 0x6fd0e0, aggro: 13, shape: 'wisp',     loot: { obsidian_tear: 1, bones: 1 } },
  cinderglass_stalker: { name: 'Cinderglass Stalker', hp: 84, dmg: 20, speed: 4.2, xp: 235, color: 0xc04828, aggro: 15, shape: 'humanoid', loot: { molten_glass: 1, obsidian_tear: 1, bones: 1 } },
  the_glasswake:       { name: 'The Glasswake',  hp: 320, dmg: 34, speed: 3.1, xp: 1100, color: 0x80e0f0, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 460, obsidian_shard: 4, molten_glass: 4, ruby: 2, bones: 4 }, rare: { item: 'ashen_signet', chance: 0.25 } },
  // --- Frontier dungeon bosses (Expansion IV Batch 5; one per new realm) ---
  the_lantern_drowned: { name: 'The Lantern-Drowned', hp: 360, dmg: 36, speed: 3.2, xp: 1080, color: 0x4fd6dc, aggro: 20, shape: 'humanoid', scale: 2.1, boss: true, loot: { gold: 500, dreamtide_staff: 1, tideglass: 5, pearl: 3, bones: 4 }, rare: { item: 'tideglass_ring', chance: 0.3 } },
  the_rimewright:      { name: 'The Rimewright',      hp: 380, dmg: 38, speed: 3.0, xp: 1120, color: 0xbfe0ff, aggro: 20, shape: 'humanoid', scale: 2.0, boss: true, loot: { gold: 520, rimeforged_axe: 1, frost_iron: 6, sapphire: 2, bones: 4 }, rare: { item: 'frostguard_amulet', chance: 0.3 } },
  the_glassmaw:        { name: 'The Glassmaw',        hp: 380, dmg: 38, speed: 3.1, xp: 1140, color: 0x80e0f0, aggro: 20, shape: 'beast',    scale: 2.2, boss: true, loot: { gold: 520, glassmaw_bow: 1, obsidian_shard: 4, ruby: 2, bones: 4 }, rare: { item: 'ashen_signet', chance: 0.25 } },
  the_hollowed_warden: { name: 'The Hollowed Warden', hp: 400, dmg: 40, speed: 3.0, xp: 1200, color: 0xb08adf, aggro: 20, shape: 'humanoid', scale: 2.2, boss: true, loot: { gold: 560, voidedge_blade: 1, amethyst_wisp: 5, emerald: 2, bones: 4 }, rare: { item: 'pall_amulet', chance: 0.25 } },
  the_brinemother:     { name: 'The Brinemother',     hp: 380, dmg: 38, speed: 3.1, xp: 1120, color: 0xf08fb8, aggro: 20, shape: 'beast',    scale: 2.2, boss: true, loot: { gold: 520, brinesong_trident: 1, brine_silver: 6, pearl: 3, bones: 4 } },
};

// ---------- Combat triangle ----------
// strong = attack with the style the foe is weak to; weak = the style that style "beats" (so it's the worst pick).
// pen[wk] = the style penalised when a foe is weak to `wk` (melee>ranged>magic>melee loop, read defensively).
export const TRIANGLE = { strong: 1.30, weak: 0.80, pen: { melee: 'magic', ranged: 'melee', magic: 'ranged' } };
// Each foe is weakest to ONE of your styles (read-only; never written per-instance). Distributed so all
// three styles have plenty of strong targets — beasts→ranged, armoured/undead/golems→magic, casters/fast→melee.
export const WEAKNESS = {
  boar: 'ranged', frost_wolf: 'ranged', scorpion: 'ranged', jungle_panther: 'ranged', glimmer_bat: 'ranged',
  scorchling: 'ranged', marsh_crab: 'ranged', blight_wolf: 'ranged', storm_harpy: 'ranged', deep_lurker: 'ranged', lava_hound: 'ranged',
  bandit: 'magic', goblin_brute: 'magic', skeleton: 'magic', crystal_golem: 'magic', crag_golem: 'magic',
  grave_husk: 'magic', brigand: 'magic', ash_hound: 'magic', thornling: 'magic',
  wolf: 'melee', goblin: 'melee', serpent: 'melee', crystal_sprite: 'melee', magma_imp: 'melee', wraith: 'melee', tide_priest: 'melee', wisp: 'melee',
  // bosses — spread evenly so switching styles is a real choice
  ember_boss: 'ranged', cinder_colossus: 'ranged', drowned_king: 'ranged', jorath: 'ranged', hollow_king: 'ranged',
  sandwyrm: 'magic', warchief: 'magic', vurak: 'magic', drowned_captain: 'magic',
  frost_warden: 'melee', bonelord: 'melee', prism_tyrant: 'melee', thruun: 'melee', barrow_wight: 'melee',
  reef_reaver: 'ranged', coral_warden: 'magic', lure_siren: 'melee', sea_witch: 'melee',
  shard_skitter: 'ranged', stoneward: 'melee', chime_warden: 'magic', resona: 'magic',
  roc_fledgling: 'melee', sky_warden: 'magic', gale_harrier: 'ranged', stormcrown: 'magic',
  myconid_warden: 'ranged', spore_thrall: 'melee', pollen_drifter: 'magic', the_chorus: 'ranged',
  ashen_revenant: 'ranged', obsidian_sentinel: 'magic', cinder_cultist: 'melee', pyraxis: 'magic',
  glimmer_leech: 'ranged', the_dreamward: 'ranged', frost_wraith: 'magic', glacier_wight: 'melee', heart_of_hoarfrost: 'magic', shade_stalker: 'melee', edgewraith: 'magic', the_reckoner: 'ranged', salt_wraith: 'magic',
  glass_wisp: 'ranged', cinderglass_stalker: 'magic', the_glasswake: 'ranged',
  the_lantern_drowned: 'ranged', the_rimewright: 'magic', the_glassmaw: 'magic', the_hollowed_warden: 'ranged', the_brinemother: 'magic',
};
// The style a foe ATTACKS with (drives Protection prayers). Default melee; only casters/archers are tagged.
export const ATK_STYLE = {
  wraith: 'magic', tide_priest: 'magic', wisp: 'magic', frost_warden: 'magic', bonelord: 'magic',
  prism_tyrant: 'magic', hollow_king: 'magic', drowned_king: 'magic', drowned_captain: 'magic',
  storm_harpy: 'ranged', thruun: 'ranged', warchief: 'ranged',
  lure_siren: 'magic', sea_witch: 'magic',
  chime_warden: 'magic', resona: 'magic',
  gale_harrier: 'ranged', stormcrown: 'ranged',
  pollen_drifter: 'magic', the_chorus: 'magic',
  cinder_cultist: 'magic', pyraxis: 'magic',
  frost_wraith: 'magic', the_dreamward: 'magic', heart_of_hoarfrost: 'magic', the_reckoner: 'magic',
  the_glasswake: 'magic',
  the_lantern_drowned: 'magic', the_glassmaw: 'ranged', the_hollowed_warden: 'magic',
};

// ---------- Slayer reward shop ----------  (spend points earned from contracts)
export const SLAYER_REWARDS = [
  { key: 'cancel',     name: 'Cancel current task',  icon: '❌', cost: 2,  cancel: true,            desc: 'Abandon your current contract.' },
  { key: 'rune_pack',  name: 'Rune Essence Cache',   icon: '🔮', cost: 6,  grant: { rune_essence: 25 }, desc: '25 rune essence for the altar.' },
  { key: 'gem_bag',    name: 'Gem Bag',              icon: '💎', cost: 12, grant: { sapphire: 2, emerald: 2, ruby: 1 }, desc: 'A pouch of cut gems.' },
  { key: 'xp_lamp',    name: 'Slayer XP Lamp',       icon: '🪔', cost: 15, lampXp: 2500,            desc: 'Rub for 2500 Slayer XP.' },
  { key: 'perk_xp',    name: 'Sharper Contracts',    icon: '📜', cost: 20, perk: 'slayerXp',        desc: 'Permanent: +20% Slayer XP from contracts.' },
  { key: 'perk_luck',  name: 'Keen Eye',             icon: '🍀', cost: 30, perk: 'luck',            desc: 'Permanent: +50% rare-drop chance.' },
  { key: 'slayer_helm', name: 'Slayer Helm',         icon: '⛑️', cost: 35, grant: { slayer_helm: 1 }, once: true, desc: 'Exclusive amulet: +6 to all combat styles.' },
];

// ---------- Attack stances ----------  (combat risk/reward toggle; defShare routes kill-xp into Defence)
export const ATTACK_STYLES = {
  accurate:   { name: 'Accurate',   icon: '🎯', dmgMult: 1.00, desc: 'Balanced. Full skill XP.' },
  aggressive: { name: 'Aggressive', icon: '💢', dmgMult: 1.18, desc: '+18% damage, but you guard less (take ~12% more).' },
  defensive:  { name: 'Defensive',  icon: '🛡️', dmgMult: 0.90, defShare: 0.5, defBonus: 6, desc: '−10% damage, +6 armour, half XP into Defence.' },
  controlled: { name: 'Controlled', icon: '⚖️', dmgMult: 1.00, defShare: 0.33, desc: 'Balanced; a third of XP into Defence.' },
};

// ---------- Auto-Play ----------  (hands-free grinding for passive play on the glasses; pick a job from the menu)
export const AUTO_MODES = [
  { key: 'woodcutting', name: 'Chop Wood', icon: '🪓', sub: 'Walk to the nearest trees and fell them on a loop' },
  { key: 'mining',      name: 'Mine Ore',  icon: '⛏️', sub: 'Work the nearest rocks you have the level to mine' },
  { key: 'fishing',     name: 'Fish',      icon: '🎣', sub: 'Fish the nearest spot' },
  { key: 'foraging',    name: 'Forage',    icon: '🌿', sub: 'Pick berries/herbs from the nearest bushes' },
  { key: 'combat',      name: 'Fight',     icon: '⚔️', sub: 'Hunt the nearest foes — auto-eats food when low' },
  { key: 'questing',    name: 'Quest',     icon: '🧭', sub: 'Pursue your tracked quest (fights/gathers/travels)' },
];

export const ENEMY_SPAWNS = [
  // Crownhaven outskirts — bandits + brigands harrying the capital roads (royal questline targets)
  { enemy: 'bandit', x: 0, z: 220 }, { enemy: 'bandit', x: 28, z: 232 }, { enemy: 'bandit', x: -28, z: 232 }, { enemy: 'bandit', x: 22, z: 300 }, { enemy: 'bandit', x: -20, z: 300 },
  { enemy: 'brigand', x: 36, z: 262 }, { enemy: 'brigand', x: -36, z: 262 }, { enemy: 'brigand', x: 0, z: 306 }, { enemy: 'brigand', x: 26, z: 226 }, { enemy: 'brigand', x: -26, z: 296 }, { enemy: 'brigand', x: 34, z: 292 },
  { enemy: 'boar', x: -22, z: 4 }, { enemy: 'boar', x: -28, z: 14 }, { enemy: 'boar', x: 24, z: 10 }, { enemy: 'boar', x: -10, z: 26 },
  { enemy: 'wolf', x: 70, z: 18 }, { enemy: 'wolf', x: 88, z: -8 }, { enemy: 'wolf', x: 60, z: -6 },
  { enemy: 'bandit', x: 120, z: 26 }, { enemy: 'bandit', x: 136, z: 8 }, { enemy: 'bandit', x: 104, z: 32 },
  { enemy: 'bandit', x: 134, z: -16 }, { enemy: 'bandit', x: 142, z: -12 }, { enemy: 'wolf', x: 140, z: -22 },
  // Forest (west)
  { enemy: 'boar', x: -96, z: 14 }, { enemy: 'boar', x: -86, z: 22 }, { enemy: 'wolf', x: -106, z: 8 },
  // Desert (south)
  { enemy: 'scorpion', x: 14, z: 96 }, { enemy: 'scorpion', x: 36, z: 110 }, { enemy: 'bandit', x: 40, z: 96 },
  // Snow (north)
  { enemy: 'frost_wolf', x: 92, z: -80 }, { enemy: 'frost_wolf', x: 106, z: -90 }, { enemy: 'frost_wolf', x: 90, z: -96 },
  { enemy: 'ember_boss', x: 122, z: -4 },
  { enemy: 'sandwyrm', x: 26, z: 118 },        // deep desert
  { enemy: 'frost_warden', x: 118, z: -98 },   // Frost Cavern (snow)
  // Gloomroot Catacombs (Mistmoor swamp) — centre (-64, 74)
  { enemy: 'skeleton', x: -68, z: 72 }, { enemy: 'skeleton', x: -60, z: 76 }, { enemy: 'wraith', x: -66, z: 78 }, { enemy: 'wraith', x: -62, z: 70 },
  { enemy: 'bonelord', x: -64, z: 74 },
  // Goblin Warren (Verdant SW) — centre (-24, 24)
  { enemy: 'goblin', x: -20, z: 22 }, { enemy: 'goblin', x: -28, z: 26 }, { enemy: 'goblin', x: -21, z: 28 }, { enemy: 'goblin_brute', x: -27, z: 20 },
  { enemy: 'warchief', x: -24, z: 24 },
  // Crystal Hollow (Snow) — centre (82, -74)
  { enemy: 'crystal_sprite', x: 78, z: -72 }, { enemy: 'crystal_sprite', x: 86, z: -76 }, { enemy: 'crystal_golem', x: 80, z: -78 }, { enemy: 'crystal_golem', x: 84, z: -70 },
  { enemy: 'prism_tyrant', x: 82, z: -74 },
  // Magma Depths (Ember) — centre (130, 28)
  { enemy: 'magma_imp', x: 126, z: 26 }, { enemy: 'magma_imp', x: 134, z: 30 }, { enemy: 'lava_hound', x: 128, z: 32 }, { enemy: 'lava_hound', x: 132, z: 24 },
  { enemy: 'cinder_colossus', x: 130, z: 28 },
  // Sunken Temple (Tide Isle) — centre (60, 70)
  { enemy: 'deep_lurker', x: 56, z: 68 }, { enemy: 'deep_lurker', x: 64, z: 72 }, { enemy: 'tide_priest', x: 57, z: 74 }, { enemy: 'tide_priest', x: 63, z: 66 },
  { enemy: 'drowned_king', x: 60, z: 70 },
  // Kytari Jungle (surface) + Overgrown Ziggurat (205,55) + Glimmer Cavern (178,52)
  { enemy: 'jungle_panther', x: 210, z: 44 }, { enemy: 'jungle_panther', x: 186, z: 48 }, { enemy: 'serpent', x: 200, z: 26 }, { enemy: 'serpent', x: 190, z: 44 },
  { enemy: 'serpent', x: 208, z: 58 }, { enemy: 'serpent', x: 202, z: 52 }, { enemy: 'jungle_panther', x: 206, z: 58 }, { enemy: 'jungle_panther', x: 204, z: 52 },
  { enemy: 'jorath', x: 205, z: 55 },
  { enemy: 'glimmer_bat', x: 175, z: 55 }, { enemy: 'glimmer_bat', x: 181, z: 49 }, { enemy: 'crystal_sprite', x: 178, z: 52 },
  // Scorched Wastes (surface) + The Ashpit (140,108)
  { enemy: 'scorchling', x: 160, z: 112 }, { enemy: 'scorchling', x: 142, z: 126 }, { enemy: 'ash_hound', x: 155, z: 124 }, { enemy: 'ash_hound', x: 146, z: 110 },
  { enemy: 'scorchling', x: 137, z: 105 }, { enemy: 'scorchling', x: 143, z: 111 }, { enemy: 'ash_hound', x: 138, z: 111 }, { enemy: 'ash_hound', x: 143, z: 105 },
  { enemy: 'vurak', x: 140, z: 108 },
  // Stormhold Highlands (surface) + Thunderpeak Hold (-145,-55)
  { enemy: 'storm_harpy', x: -148, z: -30 }, { enemy: 'storm_harpy', x: -168, z: -40 }, { enemy: 'crag_golem', x: -150, z: -44 },
  { enemy: 'storm_harpy', x: -148, z: -58 }, { enemy: 'storm_harpy', x: -142, z: -52 }, { enemy: 'crag_golem', x: -148, z: -52 }, { enemy: 'crag_golem', x: -142, z: -58 },
  { enemy: 'thruun', x: -145, z: -55 },
  // Moonlit Glade (surface) + Feywild Hollow (-8,-118)
  { enemy: 'wisp', x: -15, z: -105 }, { enemy: 'wisp', x: -35, z: -115 }, { enemy: 'thornling', x: -18, z: -118 }, { enemy: 'thornling', x: -12, z: -100 },
  { enemy: 'wisp', x: -11, z: -115 }, { enemy: 'wisp', x: -5, z: -121 }, { enemy: 'thornling', x: -11, z: -121 }, { enemy: 'thornling', x: -5, z: -115 },
  { enemy: 'hollow_king', x: -8, z: -118 },
  // Saltcrest Harbor (coast) — town fringe + The Drowned Galleon arena (100,206)
  { enemy: 'marsh_crab', x: 90, z: 195 }, { enemy: 'marsh_crab', x: 68, z: 192 }, { enemy: 'brigand', x: 94, z: 187 }, { enemy: 'brigand', x: 67, z: 189 },
  { enemy: 'marsh_crab', x: 96, z: 204 }, { enemy: 'marsh_crab', x: 104, z: 204 }, { enemy: 'brigand', x: 98, z: 210 }, { enemy: 'brigand', x: 103, z: 208 },
  { enemy: 'drowned_captain', x: 100, z: 206 },
  // Amberfell woods (autumn) — town fringe + The Hollow Barrow arena (36,-182)
  { enemy: 'blight_wolf', x: 62, z: -150 }, { enemy: 'blight_wolf', x: 40, z: -148 }, { enemy: 'grave_husk', x: 60, z: -170 }, { enemy: 'blight_wolf', x: 38, z: -152 },
  { enemy: 'grave_husk', x: 32, z: -180 }, { enemy: 'grave_husk', x: 40, z: -180 }, { enemy: 'blight_wolf', x: 34, z: -185 }, { enemy: 'grave_husk', x: 38, z: -184 },
  { enemy: 'barrow_wight', x: 36, z: -182 },
  // Lagoon coast (Coralside) + The Tide Grotto (-100,-126)
  { enemy: 'reef_reaver', x: -118, z: -106 }, { enemy: 'reef_reaver', x: -84, z: -100 },
  { enemy: 'coral_warden', x: -112, z: -130 }, { enemy: 'lure_siren', x: -90, z: -134 },
  { enemy: 'reef_reaver', x: -104, z: -122 }, { enemy: 'lure_siren', x: -96, z: -120 },
  { enemy: 'sea_witch', x: -100, z: -126 },
  // Shardspire crystal canyon (surface) + The Singing Geode (-120,116)
  { enemy: 'shard_skitter', x: -150, z: 104 }, { enemy: 'shard_skitter', x: -132, z: 122 },
  { enemy: 'stoneward', x: -160, z: 118 }, { enemy: 'chime_warden', x: -128, z: 110 },
  { enemy: 'shard_skitter', x: -118, z: 112 }, { enemy: 'stoneward', x: -122, z: 120 }, { enemy: 'chime_warden', x: -116, z: 118 },
  { enemy: 'resona', x: -120, z: 116 },
  // Skyreach (windward terraces) + Stormcrown Eyrie (118,-150)
  { enemy: 'roc_fledgling', x: 132, z: -120 }, { enemy: 'roc_fledgling', x: 158, z: -152 }, { enemy: 'gale_harrier', x: 124, z: -110 },
  { enemy: 'sky_warden', x: 114, z: -146 }, { enemy: 'gale_harrier', x: 122, z: -154 }, { enemy: 'sky_warden', x: 122, z: -146 }, { enemy: 'roc_fledgling', x: 116, z: -156 },
  { enemy: 'stormcrown', x: 118, z: -150 },
  // Sporevale surface + The Mycelial Heart (-156,66) — a grove rings the boss
  { enemy: 'myconid_warden', x: -178, z: 52 }, { enemy: 'myconid_warden', x: -150, z: 44 },
  { enemy: 'spore_thrall', x: -168, z: 64 }, { enemy: 'spore_thrall', x: -148, z: 76 },
  { enemy: 'pollen_drifter', x: -160, z: 48 }, { enemy: 'pollen_drifter', x: -176, z: 70 },
  { enemy: 'spore_thrall', x: -152, z: 62 }, { enemy: 'spore_thrall', x: -160, z: 70 },
  { enemy: 'pollen_drifter', x: -152, z: 70 }, { enemy: 'myconid_warden', x: -160, z: 62 },
  { enemy: 'the_chorus', x: -156, z: 66 },
  // Cinderbreak (cinder isle) — The Caldera Sanctum (-56,160)
  { enemy: 'obsidian_sentinel', x: -60, z: 158 }, { enemy: 'obsidian_sentinel', x: -52, z: 162 },
  { enemy: 'cinder_cultist', x: -56, z: 164 }, { enemy: 'cinder_cultist', x: -50, z: 156 },
  { enemy: 'ashen_revenant', x: -62, z: 156 }, { enemy: 'ashen_revenant', x: -46, z: 176 },
  { enemy: 'pyraxis', x: -56, z: 160 },
  // --- Expansion IV realms ---
  // Duskmere (252,-64): glimmer-leeches on the Arch + the Dreamward in the deep flats
  { enemy: 'glimmer_leech', x: 248, z: -52 }, { enemy: 'glimmer_leech', x: 254, z: -48 }, { enemy: 'glimmer_leech', x: 244, z: -56 }, { enemy: 'glimmer_leech', x: 250, z: -58 },
  { enemy: 'the_dreamward', x: 262, z: -72 },
  // Aurorath (-26,-250): frost-wraiths under the Throne + glacier-wight at the tunnel + the Heart below
  { enemy: 'frost_wraith', x: -26, z: -258 }, { enemy: 'frost_wraith', x: -22, z: -264 }, { enemy: 'frost_wraith', x: -30, z: -260 }, { enemy: 'frost_wraith', x: -20, z: -252 },
  { enemy: 'glacier_wight', x: -18, z: -242 }, { enemy: 'heart_of_hoarfrost', x: -32, z: -256 },
  // Sablon (-256,2): shade-stalkers + edgewraiths at the Sentinel + the Reckoner at the lip
  { enemy: 'shade_stalker', x: -256, z: 2 }, { enemy: 'shade_stalker', x: -250, z: 8 }, { enemy: 'shade_stalker', x: -262, z: -2 }, { enemy: 'shade_stalker', x: -252, z: 6 },
  { enemy: 'edgewraith', x: -248, z: -6 }, { enemy: 'edgewraith', x: -252, z: -8 }, { enemy: 'the_reckoner', x: -264, z: 8 },
  // Mirelythe (-150,222): salt-wraiths crusting the lost mirror-island
  { enemy: 'salt_wraith', x: -158, z: 230 }, { enemy: 'salt_wraith', x: -154, z: 234 }, { enemy: 'salt_wraith', x: -160, z: 226 }, { enemy: 'salt_wraith', x: -156, z: 232 },
  // Cindughol (240,156): glass-wisps on the rim, cinderglass-stalkers at the Throat, the Glasswake at the heart
  { enemy: 'glass_wisp', x: 224, z: 148 }, { enemy: 'glass_wisp', x: 230, z: 144 }, { enemy: 'glass_wisp', x: 218, z: 152 }, { enemy: 'glass_wisp', x: 222, z: 142 },
  { enemy: 'cinderglass_stalker', x: 256, z: 166 }, { enemy: 'cinderglass_stalker', x: 260, z: 160 }, { enemy: 'cinderglass_stalker', x: 252, z: 170 }, { enemy: 'cinderglass_stalker', x: 262, z: 164 },
  { enemy: 'the_glasswake', x: 238, z: 140 },
  // --- Frontier dungeons (one boss + guards each, at the dungeon arena coords) ---
  { enemy: 'glimmer_leech', x: 270, z: -50 }, { enemy: 'glimmer_leech', x: 274, z: -46 }, { enemy: 'the_lantern_drowned', x: 272, z: -48 },   // Sunken Lanternworks (Duskmere)
  { enemy: 'frost_wraith', x: -52, z: -240 }, { enemy: 'frost_wraith', x: -48, z: -236 }, { enemy: 'the_rimewright', x: -50, z: -238 },        // Frostforge Deep (Aurorath)
  { enemy: 'cinderglass_stalker', x: 256, z: 150 }, { enemy: 'cinderglass_stalker', x: 260, z: 146 }, { enemy: 'the_glassmaw', x: 258, z: 148 }, // Glassmaw Vault (Cindughol)
  { enemy: 'edgewraith', x: -246, z: 26 }, { enemy: 'edgewraith', x: -242, z: 22 }, { enemy: 'the_hollowed_warden', x: -244, z: 24 },           // Abyssal Reliquary (Sablon)
  { enemy: 'salt_wraith', x: -140, z: 208 }, { enemy: 'salt_wraith', x: -136, z: 204 }, { enemy: 'the_brinemother', x: -138, z: 206 },          // Drowned Saltworks (Mirelythe)
];

export const QUESTS = {
  q_wood: {
    name: 'Hearth & Home', giver: 'elder', startsAvailable: true,
    desc: 'Rekindle the village hearth with Driftwood.',
    objectives: [{ id: 'wood', type: 'have', item: 'wood', count: 3 }],
    rewards: { xp: { woodcutting: 120 }, items: { potion: 1, gold: 30 } },
  },
  q_berry: {
    name: 'Sweet Harvest', giver: 'merchant', startsAvailable: true,
    desc: 'Forage Sunberries for Trader Pell.',
    objectives: [{ id: 'berry', type: 'have', item: 'berry', count: 4 }],
    rewards: { xp: { foraging: 100 }, items: { gold: 25 } },
  },
  q_boar: {
    name: 'Boar Trouble', giver: 'ranger', requires: 'q_wood',
    desc: 'Cull the wild boars threatening the village.',
    objectives: [{ id: 'boar', type: 'kill', enemy: 'boar', count: 2 }],
    rewards: { xp: { combat: 160 }, items: { pelt: 2, gold: 40 } },
  },
  // --- Crownhaven: the royal questline (given inside the castle by the King + Steward) ---
  q_crown1: {
    name: 'By Royal Decree', giver: 'king', startsAvailable: true,
    desc: 'King Aldemar bids you cull the bandits harrying the roads to Crownhaven.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'bandit', count: 4 }],
    rewards: { xp: { combat: 400 }, items: { gold: 200, gold_ring: 1 } },
  },
  q_crown2: {
    name: "The Crown's Coffers", giver: 'steward', requires: 'q_crown1',
    desc: 'Bring three Gold Bars to Steward Perrin for the royal mint.',
    objectives: [{ id: 'g', type: 'have', item: 'gold_bar', count: 3 }],
    rewards: { xp: { smithing: 320 }, items: { gold: 320 } },
  },
  q_crown3: {
    name: 'Champion of Crownhaven', saga: true, giver: 'king', requires: 'q_crown2',
    desc: 'Break the brigand host gathering beyond the capital walls and earn the crown’s signet.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'brigand', count: 6 }],
    rewards: { xp: { combat: 700, defence: 220 }, items: { gold: 500, crown_signet: 1 } },
  },
  q_mine: {
    name: 'Coal for the Forge', giver: 'miner', startsAvailable: true,
    desc: 'Old Bryn needs coal to keep Emberhold’s forge lit.',
    objectives: [{ id: 'coal', type: 'have', item: 'coal', count: 5 }],
    rewards: { xp: { mining: 150 }, items: { gold: 45 } },
  },
  q_fish: {
    name: 'Catch of the Day', giver: 'fisher', startsAvailable: true,
    desc: 'Wren wants three fresh trout from the Ashen Shore.',
    objectives: [{ id: 'trout', type: 'have', item: 'raw_trout', count: 3 }],
    rewards: { xp: { fishing: 130 }, items: { gold: 40 } },
  },
  q_smith: {
    name: 'Forged in Fire', giver: 'smith', startsAvailable: true,
    desc: 'Smelt three bronze bars to prove yourself to Smith Dorrin.',
    objectives: [{ id: 'bar', type: 'have', item: 'bronze_bar', count: 3 }],
    rewards: { xp: { smithing: 200 }, items: { gold: 60, iron_bar: 2 } },
  },
  q_boss: {
    name: 'The Ember Beast', giver: 'smith', requires: 'q_supply', reqSkills: { combat: 15 },
    desc: 'Slay Emberfang prowling the Emberpeak — bring a real weapon.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'ember_boss', count: 1 }],
    rewards: { xp: { combat: 650 }, items: { gold: 220 } },
  },
  q_supply: {
    name: 'Hardwood Hafts', giver: 'smith', requires: 'q_smith',
    desc: 'Smith Dorrin needs Verdant driftwood for tool hafts — chop it back on the Verdant Isle.',
    objectives: [{ id: 'wood', type: 'have', item: 'wood', count: 5 }],
    rewards: { xp: { smithing: 160 }, items: { gold: 70 } },
  },
  q_relic: {
    name: 'The Tide Relic', giver: 'elder', requires: 'q_boss',
    desc: 'Carry the Tide Relic from Emberfang back to Elder Maren on the Verdant Isle.',
    objectives: [{ id: 'relic', type: 'have', item: 'relic', count: 1 }],
    rewards: { xp: { combat: 400 }, items: { gold: 300 } },
  },
  q_forest: {
    name: 'Thin the Pack', giver: 'druid', startsAvailable: true,
    desc: 'Cull the grey wolves of the Whispering Wood for Thornwarden Eld.',
    objectives: [{ id: 'wolf', type: 'kill', enemy: 'wolf', count: 3 }],
    rewards: { xp: { woodcutting: 160, combat: 80 }, items: { gold: 60 } },
  },
  q_desert: {
    name: 'Scorpion Scourge', giver: 'nomad', startsAvailable: true,
    desc: 'Clear the sand scorpions around the Sunspire Oasis.',
    objectives: [{ id: 'scorpion', type: 'kill', enemy: 'scorpion', count: 3 }],
    rewards: { xp: { combat: 200 }, items: { gold: 70 } },
  },
  q_snow: {
    name: 'Cold Comfort', giver: 'frostkeeper', startsAvailable: true,
    desc: 'Drive the frost wolves from the snowfields for Frostkeeper Nessa.',
    objectives: [{ id: 'frost_wolf', type: 'kill', enemy: 'frost_wolf', count: 3 }],
    rewards: { xp: { combat: 240, defence: 120 }, items: { gold: 80 } },
  },
  q_sandwyrm: {
    name: 'The Sandwyrm', giver: 'nomad', requires: 'q_desert',
    desc: 'Slay the Sandwyrm in the deep desert.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'sandwyrm', count: 1 }],
    rewards: { xp: { combat: 700, slayer: 200 }, items: { gold: 250 } },
  },
  q_frostwarden: {
    name: 'The Frost Warden', giver: 'frostkeeper', requires: 'q_snow',
    desc: 'Defeat the Frost Warden in the Frost Cavern.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'frost_warden', count: 1 }],
    rewards: { xp: { combat: 760, slayer: 220 }, items: { gold: 280 } },
  },

  // --- Gloomroot Catacombs (Mistmoor) ---
  q_crypt: {
    name: 'Restless Dead', giver: 'gravekeeper', startsAvailable: true,
    desc: 'Put down the skeletons stirring in the Gloomroot Catacombs.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'skeleton', count: 4 }],
    rewards: { xp: { combat: 240, slayer: 80 }, items: { gold: 90 } },
  },
  q_bonelord: {
    name: 'The Bonelord', giver: 'gravekeeper', requires: 'q_crypt',
    desc: 'Destroy Bonelord Mortrax in the depths of the catacombs.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'bonelord', count: 1 }],
    rewards: { xp: { combat: 800, slayer: 260 }, items: { gold: 300 } },
  },
  // --- Goblin Warren (Verdant) ---
  q_warren: {
    name: 'Warren Trouble', giver: 'warden', startsAvailable: true,
    desc: 'Thin out the goblins raiding from the Goblin Warren.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'goblin', count: 5 }],
    rewards: { xp: { combat: 220 }, items: { gold: 85 } },
  },
  q_warchief: {
    name: 'Warchief Gronk', giver: 'warden', requires: 'q_warren',
    desc: 'Slay Warchief Gronk and break the warren for good.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'warchief', count: 1 }],
    rewards: { xp: { combat: 760, slayer: 240 }, items: { gold: 290 } },
  },
  // --- Crystal Hollow (Snow) ---
  q_crystal: {
    name: 'Crystal Fever', giver: 'lapidary', startsAvailable: true,
    desc: 'Shatter the crystal golems guarding the Crystal Hollow.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'crystal_golem', count: 3 }],
    rewards: { xp: { mining: 200, crafting: 120 }, items: { gold: 100, sapphire: 1 } },
  },
  q_prism: {
    name: 'The Prism Tyrant', giver: 'lapidary', requires: 'q_crystal',
    desc: 'Defeat the Prism Tyrant deep in the hollow.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'prism_tyrant', count: 1 }],
    rewards: { xp: { combat: 820, magic: 200 }, items: { gold: 320 } },
  },
  // --- Magma Depths (Ember) ---
  q_magma: {
    name: 'Into the Depths', giver: 'emberwright', startsAvailable: true,
    desc: 'Burn back the lava hounds prowling the Magma Depths.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'lava_hound', count: 3 }],
    rewards: { xp: { combat: 260, smithing: 120 }, items: { gold: 110 } },
  },
  q_colossus: {
    name: 'Cinder Colossus', giver: 'emberwright', requires: 'q_magma',
    desc: 'Bring down the Cinder Colossus at the heart of the depths.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'cinder_colossus', count: 1 }],
    rewards: { xp: { combat: 900, smithing: 200 }, items: { gold: 340 } },
  },
  // --- Sunken Temple (Tide Isle) ---
  q_temple: {
    name: 'Whispers of the Tide', giver: 'oracle', startsAvailable: true,
    desc: 'Silence the tide priests haunting the Sunken Temple.',
    objectives: [{ id: 'k', type: 'kill', enemy: 'tide_priest', count: 4 }],
    rewards: { xp: { combat: 280, prayer: 120 }, items: { gold: 120 } },
  },
  q_drowned: {
    name: 'The Drowned King', giver: 'oracle', requires: 'q_temple',
    desc: 'Confront Drowned King Nautilus in the flooded sanctum.',
    objectives: [{ id: 'boss', type: 'kill', enemy: 'drowned_king', count: 1 }],
    rewards: { xp: { combat: 1000, prayer: 260 }, items: { gold: 400 } },
  },

  // --- Kytari Jungle / Overgrown Ziggurat ---
  q_zigg: { name: 'Jungle Hunt', giver: 'pathfinder', startsAvailable: true, desc: 'Cull the coil serpents around the Overgrown Ziggurat.', objectives: [{ id: 'k', type: 'kill', enemy: 'serpent', count: 4 }], rewards: { xp: { combat: 300, woodcutting: 120 }, items: { gold: 120 } } },
  q_jorath: { name: 'Jorath the Coiled', giver: 'pathfinder', requires: 'q_zigg', reqSkills: { combat: 30 }, desc: 'Slay the great serpent Jorath atop the ziggurat.', objectives: [{ id: 'boss', type: 'kill', enemy: 'jorath', count: 1 }], rewards: { xp: { combat: 950, slayer: 240 }, items: { gold: 360 } } },
  // --- Scorched Wastes / The Ashpit ---
  q_ashpit: { name: 'Into the Ashes', giver: 'cinderwarden', startsAvailable: true, desc: 'Put down the ash hounds prowling the Scorched Wastes.', objectives: [{ id: 'k', type: 'kill', enemy: 'ash_hound', count: 3 }], rewards: { xp: { combat: 320 }, items: { gold: 130 } } },
  q_vurak: { name: 'Ashlord Vurak', giver: 'cinderwarden', requires: 'q_ashpit', desc: 'Destroy Ashlord Vurak in the Ashpit.', objectives: [{ id: 'boss', type: 'kill', enemy: 'vurak', count: 1 }], rewards: { xp: { combat: 1050, slayer: 280 }, items: { gold: 400, dragoon_halberd: 1 } } },
  // --- Stormhold Highlands / Thunderpeak Hold ---
  q_thunder: { name: 'Storm Riders', giver: 'stormcaller', startsAvailable: true, desc: 'Drive the storm harpies from the Stormhold Highlands.', objectives: [{ id: 'k', type: 'kill', enemy: 'storm_harpy', count: 4 }], rewards: { xp: { combat: 340, defence: 120 }, items: { gold: 140 } } },
  q_thruun: { name: 'Stormcaller Thruun', giver: 'stormcaller', requires: 'q_thunder', desc: 'Defeat the storm titan Thruun in Thunderpeak Hold.', objectives: [{ id: 'boss', type: 'kill', enemy: 'thruun', count: 1 }], rewards: { xp: { combat: 1100, ranged: 220 }, items: { gold: 420, seraph_blade: 1 } } },
  // --- Moonlit Glade / Feywild Hollow ---
  q_fey: { name: 'Tangled Thorns', giver: 'faewarden', startsAvailable: true, desc: 'Clear the thornlings creeping out of the Feywild Hollow.', objectives: [{ id: 'k', type: 'kill', enemy: 'thornling', count: 3 }], rewards: { xp: { combat: 360, herblore: 150 }, items: { gold: 150 } } },
  q_hollow: { name: 'The Hollow King', giver: 'faewarden', requires: 'q_fey', desc: 'Banish the Hollow King in the heart of the Feywild.', objectives: [{ id: 'boss', type: 'kill', enemy: 'hollow_king', count: 1 }], rewards: { xp: { combat: 1200, magic: 240 }, items: { gold: 460, archon_scepter: 1 } } },

  // ===== Sagas — long, multi-stage story questlines (travel / investigate / speak / recover / confront) =====
  q_saga_v1: { name: 'The Verdant Pact', saga: true, giver: 'vael', startsAvailable: true, desc: 'Wake the Founders’ shrine on the North Peak and learn the old verse.', objectives: [{ id: 'shrine', type: 'visit', x: 0, z: -36, r: 13, name: 'the North Peak shrine' }, { id: 'wood', type: 'have', item: 'wood', count: 6 }, { id: 'elder', type: 'talk', npc: 'elder', name: 'Elder Maren' }], rewards: { xp: { woodcutting: 180, combat: 120 }, items: { gold: 120 } } },
  q_saga_v2: { name: 'The Verdant Pact — Ashes of the Oath', saga: true, giver: 'vael', requires: 'q_saga_v1', desc: 'Descend the Emberdeep, scatter the cult, and forge a new seal.', objectives: [{ id: 'cave', type: 'visit', x: 138, z: -14, r: 13, name: 'the Emberdeep Cave' }, { id: 'bandit', type: 'kill', enemy: 'bandit', count: 3 }, { id: 'cu', type: 'have', item: 'copper_ore', count: 4 }], rewards: { xp: { combat: 300, mining: 150 }, items: { gold: 180 } } },
  q_saga_v3: { name: 'The Verdant Pact — Emberfall', saga: true, giver: 'vael', requires: 'q_saga_v2', desc: 'Put down the corrupted guardian Emberfang, then return to Vael.', objectives: [{ id: 'boss', type: 'kill', enemy: 'ember_boss', count: 1 }, { id: 'vael', type: 'talk', npc: 'vael', name: 'Loremaster Vael' }], rewards: { xp: { combat: 700, defence: 150 }, items: { gold: 320, vigor_amulet: 1 } } },

  q_saga_f1: { name: 'Trials of Frost', saga: true, giver: 'eira', startsAvailable: true, desc: 'Retrace the lost expedition to the Frost Cavern.', objectives: [{ id: 'cavern', type: 'visit', x: 118, z: -98, r: 13, name: 'the Frost Cavern' }, { id: 'fw', type: 'kill', enemy: 'frost_wolf', count: 4 }, { id: 'trout', type: 'have', item: 'raw_trout', count: 3 }], rewards: { xp: { combat: 200, fishing: 160 }, items: { gold: 140 } } },
  q_saga_f2: { name: 'Trials of Frost — Cold Trail', saga: true, giver: 'eira', requires: 'q_saga_f1', desc: 'Relight the signal fires on Frostpeak and find the last witness.', objectives: [{ id: 'peak', type: 'visit', x: 98, z: -92, r: 14, name: 'Frostpeak' }, { id: 'coal', type: 'have', item: 'coal', count: 6 }, { id: 'nessa', type: 'talk', npc: 'frostkeeper', name: 'Frostkeeper Nessa' }], rewards: { xp: { mining: 160, combat: 180 }, items: { gold: 170 } } },
  q_saga_f3: { name: 'Trials of Frost — Warden’s End', saga: true, giver: 'eira', requires: 'q_saga_f2', desc: 'Lay the Frost Warden to rest, then return to Eira.', objectives: [{ id: 'boss', type: 'kill', enemy: 'frost_warden', count: 1 }, { id: 'eira', type: 'talk', npc: 'eira', name: 'Skald Eira' }], rewards: { xp: { combat: 780, defence: 200 }, items: { gold: 340 } } },

  q_saga_d1: { name: 'The Buried Wyrm', saga: true, giver: 'sefu', startsAvailable: true, desc: 'Search the Sunspire ruins for proof of the swallowed city.', objectives: [{ id: 'ruins', type: 'visit', x: 26, z: 104, r: 14, name: 'the Sunspire ruins' }, { id: 'scorp', type: 'kill', enemy: 'scorpion', count: 5 }, { id: 'iron', type: 'have', item: 'iron_ore', count: 6 }], rewards: { xp: { combat: 200, mining: 180 }, items: { gold: 150 } } },
  q_saga_d2: { name: 'The Buried Wyrm — The Sleeper’s Seal', saga: true, giver: 'sefu', requires: 'q_saga_d1', desc: 'Reach the deep desert and learn the old wards from Zara.', objectives: [{ id: 'deep', type: 'visit', x: 26, z: 118, r: 13, name: 'the deep desert' }, { id: 'cu', type: 'have', item: 'copper_ore', count: 4 }, { id: 'zara', type: 'talk', npc: 'nomad', name: 'Zara the Nomad' }], rewards: { xp: { combat: 260, mining: 140 }, items: { gold: 200 } } },
  q_saga_d3: { name: 'The Buried Wyrm — Wyrmfall', saga: true, giver: 'sefu', requires: 'q_saga_d2', desc: 'Lay the Sandwyrm low, then bring the truth to Sefu.', objectives: [{ id: 'boss', type: 'kill', enemy: 'sandwyrm', count: 1 }, { id: 'sefu', type: 'talk', npc: 'sefu', name: 'Chronicler Sefu' }], rewards: { xp: { combat: 820, slayer: 200 }, items: { gold: 360 } } },

  q_saga_j1: { name: 'The Coiled Throne', saga: true, giver: 'itzel', startsAvailable: true, desc: 'Carve a path through the jungle to the Overgrown Ziggurat.', objectives: [{ id: 'zig', type: 'visit', x: 205, z: 55, r: 14, name: 'the Overgrown Ziggurat' }, { id: 'serp', type: 'kill', enemy: 'serpent', count: 5 }, { id: 'panther', type: 'kill', enemy: 'jungle_panther', count: 3 }], rewards: { xp: { combat: 300, woodcutting: 160 }, items: { gold: 180 } } },
  q_saga_j2: { name: 'The Coiled Throne — The Old Crown', saga: true, giver: 'itzel', requires: 'q_saga_j1', desc: 'Seek the crown’s light in the Glimmer Cavern and counsel Anouk.', objectives: [{ id: 'glim', type: 'visit', x: 178, z: 52, r: 13, name: 'the Glimmer Cavern' }, { id: 'bat', type: 'kill', enemy: 'glimmer_bat', count: 4 }, { id: 'anouk', type: 'talk', npc: 'pathfinder', name: 'Pathfinder Anouk' }], rewards: { xp: { combat: 320, mining: 140 }, items: { gold: 220 } } },
  q_saga_j3: { name: 'The Coiled Throne — Jorath', saga: true, giver: 'itzel', requires: 'q_saga_j2', desc: 'End Jorath the Coiled, then return to Itzel.', objectives: [{ id: 'boss', type: 'kill', enemy: 'jorath', count: 1 }, { id: 'itzel', type: 'talk', npc: 'itzel', name: 'Wayfarer Itzel' }], rewards: { xp: { combat: 1000, slayer: 220 }, items: { gold: 420 } } },

  q_saga_g1: { name: 'The Hollow Crown', saga: true, giver: 'ardith', startsAvailable: true, desc: 'Climb the Moonspire and gather moonlit herbs to scry the omen.', objectives: [{ id: 'spire', type: 'visit', x: -34, z: -124, r: 14, name: 'the Moonspire' }, { id: 'wisp', type: 'kill', enemy: 'wisp', count: 4 }, { id: 'herb', type: 'have', item: 'herb', count: 4 }], rewards: { xp: { combat: 300, herblore: 180 }, items: { gold: 190 } } },
  q_saga_g2: { name: 'The Hollow Crown — Storm and Thorn', saga: true, giver: 'ardith', requires: 'q_saga_g1', desc: 'Follow the omen to Thunderpeak Hold and rally Branok.', objectives: [{ id: 'hold', type: 'visit', x: -145, z: -55, r: 14, name: 'Thunderpeak Hold' }, { id: 'harpy', type: 'kill', enemy: 'storm_harpy', count: 4 }, { id: 'branok', type: 'talk', npc: 'stormcaller', name: 'Stormcaller Branok' }], rewards: { xp: { combat: 360, defence: 160 }, items: { gold: 260 } } },
  q_saga_g3: { name: 'The Hollow Crown — King of Thorns', saga: true, giver: 'ardith', requires: 'q_saga_g2', desc: 'Banish the Hollow King, then return to Ardith.', objectives: [{ id: 'boss', type: 'kill', enemy: 'hollow_king', count: 1 }, { id: 'ardith', type: 'talk', npc: 'ardith', name: 'Seer Ardith' }], rewards: { xp: { combat: 1200, magic: 240 }, items: { gold: 480 } } },

  // ===== Expansion III — Saltcrest Harbor / The Drowned Galleon =====
  q_harbor:  { name: 'Crab Season', giver: 'harbormaster', startsAvailable: true, desc: 'Clear the marsh crabs swarming Saltcrest’s docks.', objectives: [{ id: 'k', type: 'kill', enemy: 'marsh_crab', count: 5 }], rewards: { xp: { combat: 360, fishing: 140 }, items: { gold: 140 } } },
  q_galleon: { name: 'The Drowned Galleon', giver: 'harbormaster', requires: 'q_harbor', desc: 'Board the low-tide wreck and end Captain Mordrake.', objectives: [{ id: 'boss', type: 'kill', enemy: 'drowned_captain', count: 1 }], rewards: { xp: { combat: 1040, slayer: 240 }, items: { gold: 420, royal_cuirass: 1 } } },
  // ===== Amberfell / The Hollow Barrow =====
  q_amberhunt: { name: 'Blighted Wood', giver: 'amberwarden', startsAvailable: true, desc: 'Put down the blight wolves stalking Amberfell’s groves.', objectives: [{ id: 'k', type: 'kill', enemy: 'blight_wolf', count: 5 }], rewards: { xp: { combat: 380, foraging: 150 }, items: { gold: 150 } } },
  q_barrow:    { name: 'The Hollow Barrow', giver: 'amberwarden', requires: 'q_amberhunt', reqSkills: { combat: 40, prayer: 15 }, desc: 'Descend the barrow and lay the Barrow Wight to rest.', objectives: [{ id: 'boss', type: 'kill', enemy: 'barrow_wight', count: 1 }], rewards: { xp: { combat: 1120, prayer: 260 }, items: { gold: 440 } } },

  // ===== Saga: Salt & Sorrow (Old Corsair Sabine) — ties Saltcrest to desert + Tide Isle =====
  q_saga_s1: { name: 'Salt & Sorrow', saga: true, giver: 'corsair', startsAvailable: true, desc: 'Sabine’s old crew scattered to the sands. Search the Sunspire Oasis for word of them.', objectives: [{ id: 'oasis', type: 'visit', x: 26, z: 104, r: 14, name: 'the Sunspire Oasis' }, { id: 'brig', type: 'kill', enemy: 'brigand', count: 4 }, { id: 'fish', type: 'have', item: 'raw_trout', count: 4 }], rewards: { xp: { combat: 320, fishing: 180 }, items: { gold: 180 } } },
  q_saga_s2: { name: 'Salt & Sorrow — The Oracle’s Warning', saga: true, giver: 'corsair', requires: 'q_saga_s1', desc: 'Seek the Oracle at the Sunken Temple and gather pearls for the dead.', objectives: [{ id: 'temple', type: 'visit', x: 60, z: 70, r: 13, name: 'the Sunken Temple' }, { id: 'oracle', type: 'talk', npc: 'oracle', name: 'Oracle Nerida' }, { id: 'pearl', type: 'have', item: 'pearl', count: 3 }], rewards: { xp: { combat: 360, prayer: 160 }, items: { gold: 240 } } },
  q_saga_s3: { name: 'Salt & Sorrow — Mordrake’s End', saga: true, giver: 'corsair', requires: 'q_saga_s2', desc: 'Confront Captain Mordrake aboard the Drowned Galleon, then return to Sabine.', objectives: [{ id: 'boss', type: 'kill', enemy: 'drowned_captain', count: 1 }, { id: 'sabine', type: 'talk', npc: 'corsair', name: 'Old Corsair Sabine' }], rewards: { xp: { combat: 1080, slayer: 240 }, items: { gold: 460, tideheart_amulet: 1 } } },

  // ===== Saga: The Amber Blight (Loreseeker Wynn) — ties Amberfell to the glade + snow =====
  q_saga_a1: { name: 'The Amber Blight', saga: true, giver: 'loreseeker', startsAvailable: true, desc: 'A rot creeps through Amberfell. Climb the Moonspire for moonlit herbs to read the omen.', objectives: [{ id: 'spire', type: 'visit', x: -34, z: -124, r: 14, name: 'the Moonspire' }, { id: 'wolf', type: 'kill', enemy: 'blight_wolf', count: 4 }, { id: 'herb', type: 'have', item: 'herb', count: 4 }], rewards: { xp: { combat: 320, herblore: 180 }, items: { gold: 190 } } },
  q_saga_a2: { name: 'The Amber Blight — Fading Light', saga: true, giver: 'loreseeker', requires: 'q_saga_a1', desc: 'The blight is fae-born. Read the old frost-wards atop Frostpeak, counsel Oona in the glade, and bring coal to ward the groves.', objectives: [{ id: 'frost', type: 'visit', x: 98, z: -92, r: 14, name: 'Frostpeak' }, { id: 'oona', type: 'talk', npc: 'faewarden', name: 'Oona the Fae' }, { id: 'coal', type: 'have', item: 'coal', count: 5 }], rewards: { xp: { combat: 360, mining: 150 }, items: { gold: 250 } } },
  q_saga_a3: { name: 'The Amber Blight — The Crowned Dead', saga: true, giver: 'loreseeker', requires: 'q_saga_a2', desc: 'The blight’s heart is the Barrow Wight. End it, then return to Wynn.', objectives: [{ id: 'boss', type: 'kill', enemy: 'barrow_wight', count: 1 }, { id: 'wynn', type: 'talk', npc: 'loreseeker', name: 'Loreseeker Wynn' }], rewards: { xp: { combat: 1120, herblore: 240 }, items: { gold: 480, verdant_charm: 1 } } },

  // ===== Guild of Trades (Guildmaster Aldric) — a hands-on tour that teaches each crafting workflow =====
  q_trade_cook: { name: 'Trades: Hearth & Hook', saga: true, giver: 'guildmaster', startsAvailable: true,
    desc: 'Fish at a shimmering water spot, then cook the catch on a stove. Bring 2 Cooked Shrimp.',
    objectives: [{ id: 'cooked', type: 'have', item: 'cooked_shrimp', count: 2 }],
    rewards: { xp: { fishing: 130, cooking: 130 }, items: { gold: 70 } } },
  q_trade_fletch: { name: 'Trades: The Bowyer’s Craft', saga: true, giver: 'guildmaster', requires: 'q_trade_cook',
    desc: 'Chop logs → carve shafts at a Fletching Bench; forage feathers and smelt a bronze bar, then fletch 5 Bronze Arrows.',
    objectives: [{ id: 'arrow', type: 'have', item: 'bronze_arrow', count: 5 }],
    rewards: { xp: { woodcutting: 110, fletching: 220, ranged: 150 }, items: { gold: 130, longbow: 1 } } },
  q_trade_brew: { name: 'Trades: Salves & Simples', saga: true, giver: 'guildmaster', requires: 'q_trade_fletch',
    desc: 'Forage Glimmerleaf + Sunberries from bushes, then brew an Antidote at a cauldron.',
    objectives: [{ id: 'pot', type: 'have', item: 'antidote', count: 1 }],
    rewards: { xp: { foraging: 110, herblore: 230 }, items: { gold: 120, strong_potion: 2 } } },
  q_trade_build: { name: 'Trades: Raising the Roof', saga: true, giver: 'guildmaster', requires: 'q_trade_brew',
    desc: 'Chop logs and saw them into planks at the Sawmill — the heart of Construction. Bring 8 Planks.',
    objectives: [{ id: 'plank', type: 'have', item: 'plank', count: 8 }],
    rewards: { xp: { woodcutting: 110, construction: 240 }, items: { gold: 150 } } },
  q_trade_rune: { name: 'Trades: Threads of the Weave', saga: true, giver: 'guildmaster', requires: 'q_trade_build',
    desc: 'Travel to the Moonwell glade, mine rune essence at the glowing outcrop, and bind 5 Air Runes at a Rune Altar.',
    objectives: [{ id: 'rune', type: 'have', item: 'air_rune', count: 5 }],
    rewards: { xp: { runecraft: 230, magic: 150 }, items: { gold: 160, magic_potion: 1 } } },
  q_trade_farm: { name: 'Trades: Homestead Dreams', saga: true, giver: 'guildmaster', requires: 'q_trade_rune',
    desc: 'Visit the Farmstead west of the village and grow crops: buy seeds from Trader Pell, plant them in a garden plot, and harvest 3.',
    objectives: [{ id: 'visit', type: 'visit', x: -20, z: -10, r: 14, name: 'the Farmstead' }, { id: 'crop', type: 'have', item: 'crop', count: 3 }],
    rewards: { xp: { farming: 240 }, items: { gold: 200, seeds: 5 } } },
  // --- Lagoon: The Drowned Song saga (Diver-Captain Yara) ---
  q_saga_l1: { name: 'The Drowned Song', saga: true, giver: 'tidecaptain', startsAvailable: true, desc: 'Coralside’s divers vanish into the reef, lured by a song. Drive the reef-things back and recover what the tide took.', objectives: [{ id: 'reef', type: 'kill', enemy: 'reef_reaver', count: 4 }, { id: 'pearls', type: 'have', item: 'pearl', count: 3 }, { id: 'arch', type: 'visit', x: -86, z: -108, r: 9, name: 'the Great Coral Arch' }], rewards: { xp: { combat: 220, fishing: 150 }, items: { gold: 150, reef_harpoon: 1 } } },
  q_saga_l2: { name: 'The Drowned Song — Her Voice', saga: true, giver: 'tidecaptain', requires: 'q_saga_l1', reqSkills: { combat: 22 }, desc: 'A Lure-Siren sings in the captain’s own apprentice’s voice. Silence one, take its scale, and learn the truth.', objectives: [{ id: 'siren', type: 'kill', enemy: 'lure_siren', count: 2 }, { id: 'scale', type: 'have', item: 'siren_scale', count: 1 }, { id: 'yara', type: 'talk', npc: 'tidecaptain', name: 'Diver-Captain Yara' }], rewards: { xp: { combat: 320, magic: 140 }, items: { gold: 220 } } },
  q_saga_l3: { name: 'The Drowned Song — Maelys', saga: true, giver: 'tidecaptain', requires: 'q_saga_l2', reqSkills: { combat: 28 }, desc: 'The Sea-Witch Maelys holds the grotto and the souls she sang under. End her and free them.', objectives: [{ id: 'boss', type: 'kill', enemy: 'sea_witch', count: 1 }, { id: 'yara', type: 'talk', npc: 'tidecaptain', name: 'Diver-Captain Yara' }], rewards: { xp: { combat: 980, defence: 200 }, items: { gold: 440, pearl_amulet: 1 } } },
  // --- Shardspire: The Singing Stone saga (Lapidary Veyra) ---
  q_saga_sh1: { name: 'The Singing Stone', saga: true, giver: 'veyra', startsAvailable: true, desc: 'Walk the crystal canyon, cull the shard-skitters the Bloom sheds, and bring Veyra raw shard-dust to read.', objectives: [{ id: 'visit', type: 'visit', x: -120, z: 116, r: 9, name: 'the Singing Geode' }, { id: 'skitter', type: 'kill', enemy: 'shard_skitter', count: 5 }, { id: 'dust', type: 'have', item: 'shard_dust', count: 4 }], rewards: { xp: { combat: 320, mining: 180 }, items: { gold: 200 } } },
  q_saga_sh2: { name: 'The Singing Stone — Those Who Hardened', saga: true, giver: 'veyra', requires: 'q_saga_sh1', desc: 'The Bloom petrifies Prismhold’s own. Free the stoneward thralls, silence chime wardens, and hear Quarryman Toll before he turns.', objectives: [{ id: 'thrall', type: 'kill', enemy: 'stoneward', count: 4 }, { id: 'warden', type: 'kill', enemy: 'chime_warden', count: 2 }, { id: 'toll', type: 'talk', npc: 'quarryman', name: 'Quarryman Toll' }], rewards: { xp: { combat: 380, crafting: 180 }, items: { gold: 280 } } },
  q_saga_sh3: { name: 'The Singing Stone — The First Note', saga: true, giver: 'veyra', requires: 'q_saga_sh2', reqSkills: { combat: 34 }, desc: 'Descend into the Singing Geode and silence Resona, the First Note, at the Bloom’s heart — then return to Veyra.', objectives: [{ id: 'boss', type: 'kill', enemy: 'resona', count: 1 }, { id: 'veyra', type: 'talk', npc: 'veyra', name: 'Lapidary Veyra' }], rewards: { xp: { combat: 1180, magic: 260 }, items: { gold: 480 } } },
  // --- Skyreach: The Broken Ward saga (Stormcaller Maelis) ---
  q_saga_sk1: { name: 'The Broken Ward', saga: true, giver: 'skyfalconer', startsAvailable: true, reqSkills: { combat: 38, ranged: 30 }, desc: 'The sky-ward over Aerie Watch is failing and the storms worsen. Climb the Aerie Spire, ground the rocs nesting in the broken stones, and bring gale cores so Maelis can read the damage.', objectives: [{ id: 'spire', type: 'visit', x: 152, z: -140, r: 12, name: 'the Aerie Spire' }, { id: 'roc', type: 'kill', enemy: 'roc_fledgling', count: 4 }, { id: 'core', type: 'have', item: 'gale_core', count: 4 }], rewards: { xp: { combat: 360, ranged: 220 }, items: { gold: 220 } } },
  q_saga_sk2: { name: 'The Broken Ward — The Warden’s Watch', saga: true, giver: 'skyfalconer', requires: 'q_saga_sk1', reqSkills: { combat: 40 }, desc: 'The ward-stones still answer the wardens of the Stormcrown Eyrie. Ground the gale harriers screening the gate, break the sky wardens at its mouth, and bring storm shards to re-anchor the failing runes.', objectives: [{ id: 'eyrie', type: 'visit', x: 118, z: -150, r: 13, name: 'the Stormcrown Eyrie' }, { id: 'harrier', type: 'kill', enemy: 'gale_harrier', count: 4 }, { id: 'warden', type: 'kill', enemy: 'sky_warden', count: 3 }, { id: 'shard', type: 'have', item: 'storm_shard', count: 4 }], rewards: { xp: { combat: 420, ranged: 260, magic: 120 }, items: { gold: 300 } } },
  q_saga_sk3: { name: 'The Broken Ward — The Stormcrown', saga: true, giver: 'skyfalconer', requires: 'q_saga_sk2', reqSkills: { combat: 44, ranged: 38 }, desc: 'No storm broke the ward — Maelis did, a lifetime ago, to free a dying roc-chick caged in its heart. That chick is the Stormcrown now. End it atop the Eyrie, then return to Maelis.', objectives: [{ id: 'boss', type: 'kill', enemy: 'stormcrown', count: 1 }, { id: 'maelis', type: 'talk', npc: 'skyfalconer', name: 'Stormcaller Maelis' }], rewards: { xp: { combat: 1180, ranged: 300 }, items: { gold: 500, windborne_cloak: 1 } } },
  // --- Sporevale: The Quiet in the Vale saga (Hesper the Listener) ---
  q_spore1: { name: 'The Quiet in the Vale', saga: true, giver: 'sporehermit', startsAvailable: true, reqSkills: { combat: 32 }, desc: "Hesper's specimens are walking. Thin the puppeted hosts and bring him living sporecaps to study.", objectives: [{ id: 'thrall', type: 'kill', enemy: 'spore_thrall', count: 5 }, { id: 'caps', type: 'have', item: 'sporecap', count: 4 }], rewards: { xp: { combat: 360, herblore: 220 }, items: { gold: 200 } } },
  q_spore2: { name: 'The Quiet in the Vale — What the Spores Say', saga: true, giver: 'sporehermit', requires: 'q_spore1', reqSkills: { combat: 36, herblore: 20 }, desc: 'The drifters carry the hive’s voice. Cull the pollen drifters, climb Spore Knoll to read the bloom from above, and bring ichor — Hesper insists he must taste it.', objectives: [{ id: 'drift', type: 'kill', enemy: 'pollen_drifter', count: 4 }, { id: 'knoll', type: 'visit', x: -172, z: 46, r: 12, name: 'Spore Knoll' }, { id: 'ichor', type: 'have', item: 'creeping_ichor', count: 3 }], rewards: { xp: { combat: 420, herblore: 260 }, items: { gold: 260, verdant_antitoxin: 2 } } },
  q_spore3: { name: 'The Quiet in the Vale — The Chorus', saga: true, giver: 'sporehermit', requires: 'q_spore2', reqSkills: { combat: 40, herblore: 25 }, desc: "Hesper won't answer to his name anymore. Burn out the hive's fruiting body — The Chorus — at the Mycelial Heart, then return to whatever is left of him.", objectives: [{ id: 'boss', type: 'kill', enemy: 'the_chorus', count: 1 }, { id: 'hesper', type: 'talk', npc: 'sporehermit', name: 'Hesper the Listener' }], rewards: { xp: { combat: 1180, herblore: 300 }, items: { gold: 500, sporeweave_robes: 1 } } },
  // --- Cinderbreak: Ash & Apostasy saga (Pyrewarden Calla) — endgame ---
  q_saga_c1: { name: 'Ash & Apostasy', saga: true, giver: 'pyrewarden', startsAvailable: true, reqSkills: { combat: 44 }, desc: 'A cult works the cold caldera, trying to wake the dead volcano. Break their watch on the ash flats and bring back proof of their rite.', objectives: [{ id: 'visit', type: 'visit', x: -56, z: 166, r: 9, name: 'the cold caldera' }, { id: 'sent', type: 'kill', enemy: 'obsidian_sentinel', count: 4 }, { id: 'shard', type: 'have', item: 'obsidian_shard', count: 3 }], rewards: { xp: { combat: 520, mining: 220 }, items: { gold: 280 } } },
  q_saga_c2: { name: 'Ash & Apostasy — The Kindler’s Sin', saga: true, giver: 'pyrewarden', requires: 'q_saga_c1', reqSkills: { combat: 47 }, desc: 'The chants are nearly complete. Silence the cultists, lay the ashen dead to rest, and let Calla read the ritual she once wrote.', objectives: [{ id: 'cult', type: 'kill', enemy: 'cinder_cultist', count: 5 }, { id: 'rev', type: 'kill', enemy: 'ashen_revenant', count: 4 }, { id: 'calla', type: 'talk', npc: 'pyrewarden', name: 'Pyrewarden Calla' }], rewards: { xp: { combat: 640, prayer: 220 }, items: { gold: 360, emberward_plate: 1 } } },
  q_saga_c3: { name: 'Ash & Apostasy — Unkindling', saga: true, giver: 'pyrewarden', requires: 'q_saga_c2', reqSkills: { combat: 50, prayer: 20 }, desc: 'The fire-god is half-woken in the Sanctum. End Pyraxis before the caldera answers, then return to Calla — if she still wishes to be found.', objectives: [{ id: 'boss', type: 'kill', enemy: 'pyraxis', count: 1 }, { id: 'calla', type: 'talk', npc: 'pyrewarden', name: 'Pyrewarden Calla' }], rewards: { xp: { combat: 1320, prayer: 320 }, items: { gold: 620, cinderveil_staff: 1 } } },
  // --- Expansion IV sagas: Duskmere (The Dimming Arch), Aurorath (The Silent Sky), Sablon (What the Sentinel Says), Mirelythe (The Pink and the Pan) ---
  q_saga_dm1: { name: 'The Dimming Arch', saga: true, giver: 'glowmoth_sefa', startsAvailable: true, desc: "Glowmoth-Keeper Sefa's moths gutter and die the nearer she carries them to the Leviathan Arch, and Lanternwash dims a little more each year — on a world where dark is invisible, a town starved of light is a town vanishing. Wade out, cut down what feeds on the bones, and bring her proof of where the light is going.", objectives: [{ id: 'arch', type: 'visit', x: 248, z: -52, r: 10, name: 'the Leviathan Arch' }, { id: 'leech', type: 'kill', enemy: 'glimmer_leech', count: 4 }, { id: 'glass', type: 'have', item: 'tideglass', count: 5 }], rewards: { xp: { foraging: 220, combat: 180 }, items: { gold: 200, lantern_oil: 3 } } },
  q_saga_dm2: { name: 'The Dimming Arch — The Founders’ Debt', saga: true, giver: 'glowmoth_sefa', requires: 'q_saga_dm1', reqSkills: { combat: 24 }, desc: "The tideglass carries the Founders' own seal. Carry it to Loremaster Vael an ocean away — the Founders never slew the leviathan, they bargained with it, tithing it light each age to keep it dreaming, and no one has paid Duskmere's share in living memory. Render oil, relight the dead lamps, and let Brannoc hear what the unpaid debt has stirred.", objectives: [{ id: 'vael', type: 'talk', npc: 'vael', name: 'Loremaster Vael' }, { id: 'oil', type: 'have', item: 'lantern_oil', count: 6 }, { id: 'brannoc', type: 'talk', npc: 'reefborn_brannoc', name: 'Reefborn Brannoc' }], rewards: { xp: { combat: 320, herblore: 160 }, items: { gold: 260 } } },
  q_saga_dm3: { name: 'The Dimming Arch — What Dreams Drink', saga: true, giver: 'glowmoth_sefa', requires: 'q_saga_dm2', reqSkills: { combat: 30 }, desc: "Brannoc heard it true: the Dreamward — the Founder-construct left to mind the tithe — has gone rogue, hoarding the shore's light into its own swollen body instead of feeding the sleeper. Follow the inhaling tide past safe ground, break the Dreamward, and end the dimming.", objectives: [{ id: 'flats', type: 'visit', x: 262, z: -72, r: 9, name: 'the deep flats' }, { id: 'boss', type: 'kill', enemy: 'the_dreamward', count: 1 }, { id: 'sefa', type: 'talk', npc: 'glowmoth_sefa', name: 'Glowmoth-Keeper Sefa' }], rewards: { xp: { combat: 1180, foraging: 280 }, items: { gold: 500 } } },
  q_saga_au1: { name: 'The Silent Sky', saga: true, giver: 'auralis', startsAvailable: true, reqSkills: { combat: 34 }, desc: "For six nights the aurora over the Skyfire Throne has guttered grey and gone mute — and Skywarden Auralis, who has not misread an omen in forty winters, is coming apart. Climb the frozen crown, scatter the frost-wraiths the dead sky has emboldened, and chip her aurora-quartz to scry the silence.", objectives: [{ id: 'throne', type: 'visit', x: -26, z: -262, r: 10, name: 'the Skyfire Throne' }, { id: 'wraith', type: 'kill', enemy: 'frost_wraith', count: 5 }, { id: 'quartz', type: 'have', item: 'aurora_quartz', count: 4 }], rewards: { xp: { combat: 360, mining: 200 }, items: { gold: 220 } } },
  q_saga_au2: { name: 'The Silent Sky — The Buried Haul', saga: true, giver: 'thresk', requires: 'q_saga_au1', reqSkills: { combat: 38, mining: 25 }, desc: "The quartz doesn't lie: something under the glacier is drinking the omen-light from below, and Thresk's frost-iron crew is trapped behind a too-clean collapse. Take up his shovel over Auralis's omens — cut the frost-iron to shore the dig, tunnel to his crew, and put down the glacier-wight that sealed them in.", objectives: [{ id: 'tunnel', type: 'visit', x: -18, z: -242, r: 9, name: 'the third tunnel' }, { id: 'iron', type: 'have', item: 'frost_iron', count: 6 }, { id: 'wight', type: 'kill', enemy: 'glacier_wight', count: 1 }], rewards: { xp: { combat: 640, mining: 220 }, items: { gold: 360, frost_iron: 4 } } },
  q_saga_au3: { name: 'The Silent Sky — Whose Voice', saga: true, giver: 'vetr', requires: 'q_saga_au2', reqSkills: { combat: 44 }, desc: "The wight was only a guard. Vetr — the hermit Auralis calls mad — has heard a voice in the silence all along: the Heart of Hoarfrost, a frozen ember waking beneath the shelf, is drinking the sky. Descend below the dig, shatter it to free the swallowed aurora, and return to Vetr.", objectives: [{ id: 'cavern', type: 'visit', x: -32, z: -256, r: 8, name: 'the Heart-of-Hoarfrost cavern' }, { id: 'heart', type: 'kill', enemy: 'heart_of_hoarfrost', count: 1 }, { id: 'vetr', type: 'talk', npc: 'vetr', name: 'Vetr the Frostbound' }], rewards: { xp: { combat: 1260, prayer: 280 }, items: { gold: 540 } } },
  q_saga_sv1: { name: 'What the Sentinel Says', saga: true, giver: 'wispbinder', startsAvailable: true, reqSkills: { combat: 40 }, desc: "At the western edge of the world, Marrow has caught a wisp that speaks one name on a loop — the same name worn blank off the oldest grave in Greywarden Rest — and Oslo's dusk roll-call keeps coming up one short, ticking toward zero. Walk the Rest, drive back the shades gathering at the lip, and gather the amethyst-wisps Marrow needs.", objectives: [{ id: 'rest', type: 'visit', x: -256, z: 2, r: 12, name: 'Greywarden Rest' }, { id: 'shade', type: 'kill', enemy: 'shade_stalker', count: 5 }, { id: 'wisp', type: 'have', item: 'amethyst_wisp', count: 4 }], rewards: { xp: { combat: 380, magic: 200 }, items: { gold: 220 } } },
  q_saga_sv2: { name: 'What the Sentinel Says — The Shorter List', saga: true, giver: 'relictrader', requires: 'q_saga_sv1', reqSkills: { combat: 43 }, desc: "Tace keeps a shorter, truer roll than Oslo admits to: the blank grave belongs to the FIRST Greywarden, Oslo's own ancestor, who cut the pact to hold the edge — and the 'count' covers a soul-debt the abyss is owed. Climb the forbidden Sentinel, cut down the edgewraiths that rise to stop you, and bring Tace the name.", objectives: [{ id: 'sentinel', type: 'visit', x: -248, z: -6, r: 9, name: 'the Petrified Sentinel' }, { id: 'edge', type: 'kill', enemy: 'edgewraith', count: 4 }, { id: 'tace', type: 'talk', npc: 'relictrader', name: 'Tace Greypalm' }], rewards: { xp: { combat: 660, thieving: 180 }, items: { gold: 380 } } },
  q_saga_sv3: { name: 'What the Sentinel Says — The Count Reaches Zero', saga: true, giver: 'greywarden', requires: 'q_saga_sv2', reqSkills: { combat: 48, prayer: 18 }, desc: "The truth breaks Oslo. The abyss has sent a Reckoner up the cliff to collect the first Greywarden's overdue soul, and tonight the count reaches zero. Break the Reckoner at the lip of the world, then stand with Oslo and decide how the bargain finally closes.", objectives: [{ id: 'lip', type: 'visit', x: -264, z: 8, r: 8, name: 'the lip of the world' }, { id: 'reckoner', type: 'kill', enemy: 'the_reckoner', count: 1 }, { id: 'oslo', type: 'talk', npc: 'greywarden', name: 'Greywarden Oslo' }], rewards: { xp: { combat: 1320, prayer: 320 }, items: { gold: 560 } } },
  q_mire_pink1: { name: 'The Pink and the Pan', saga: true, giver: 'salma_brinewright', startsAvailable: true, reqSkills: { mining: 30 }, desc: "Rosbrine's deepest pans now bleed a brine-silver vein rich enough to buy the frontier — and Salma has caught Salt-Baron Cael Bittersong quietly buying every drying-rights claim before her harvesters learn what they're raking. Worse, a stretch of the Mirror Causeway shows the wrong stars, and a harvester who poled out there never came back. Rake the vein, walk the causeway, and find out who's been told what.", objectives: [{ id: 'silver', type: 'have', item: 'brine_silver', count: 5 }, { id: 'causeway', type: 'visit', x: -144, z: 228, r: 10, name: 'the Mirror Causeway' }, { id: 'wrenn', type: 'talk', npc: 'wrenn_mirrorwalk', name: 'Wrenn Mirrorwalk' }], rewards: { xp: { mining: 300, thieving: 120 }, items: { gold: 220 } } },
  q_mire_pink2: { name: 'The Pink and the Pan — Drying Rights', saga: true, giver: 'salma_brinewright', requires: 'q_mire_pink1', reqSkills: { combat: 36 }, desc: "The missing harvester is stranded on a true island the Mirror Causeway only pretends to reflect, and Bittersong is one signature from owning every pan in Mirelythe. Pole out across the wrong reflection, break the salt-wraiths crusting the lost island, free the harvester, and confront the Salt-Baron with the silver vein proven.", objectives: [{ id: 'wraith', type: 'kill', enemy: 'salt_wraith', count: 5 }, { id: 'island', type: 'visit', x: -158, z: 230, r: 9, name: 'the lost mirror-island' }, { id: 'cael', type: 'talk', npc: 'bittersong_baron', name: 'Cael Bittersong' }], rewards: { xp: { combat: 600, mining: 240 }, items: { gold: 340 } } },
  // --- Cindughol: "The Glass That Remembers" saga (Ousha → Tobren → Dbenn; branching finale) ---
  q_cind1: { name: 'The Glass That Remembers', saga: true, giver: 'glasswright', startsAvailable: true, reqSkills: { combat: 42 }, desc: "Every obsidian shard in the caldera now sings the SAME note — a scream, held. Glass remembers what it cooled around, and something deep is making new glass, fast, screaming. Glasswright Ousha needs you to walk the rim, cut the glass-wisps bleeding off the fresh flows, and bring her flawed shards she can read.", objectives: [{ id: 'rim', type: 'visit', x: 224, z: 148, r: 12, name: 'the caldera rim' }, { id: 'wisp', type: 'kill', enemy: 'glass_wisp', count: 5 }, { id: 'tear', type: 'have', item: 'obsidian_tear', count: 5 }], rewards: { xp: { combat: 380, mining: 200 }, items: { gold: 240 } } },
  q_cind2: { name: 'The Glass That Remembers — What the Safe-Stones Say', saga: true, giver: 'cinderscout', requires: 'q_cind1', reqSkills: { combat: 45 }, desc: "Ousha read the shards true: the safe-stones are MOVING, the whole ash-field breathing as something below pours new glass. Last-Walker Tobren has marked a path to the sealed Throat where it wells up — walk only where he's marked, cut the cinderglass-stalkers that rise off the heat, and bring back molten glass from the Throat itself.", objectives: [{ id: 'throat', type: 'visit', x: 256, z: 166, r: 12, name: 'the Throat' }, { id: 'stalker', type: 'kill', enemy: 'cinderglass_stalker', count: 5 }, { id: 'glass', type: 'have', item: 'molten_glass', count: 5 }], rewards: { xp: { combat: 680, mining: 240 }, items: { gold: 380 } } },
  q_cind3: { name: 'The Glass That Remembers — The Vein That Woke', saga: true, giver: 'goldwarden', requires: 'q_cind2', reqSkills: { combat: 49 }, desc: "Prospector Dbenn confesses: the rich 'gold-vein' he tapped wasn't gold — it was a vein of the thing ITSELF, and he woke it. The Glasswake is rising in the heart of the caldera, every memory it ever cooled around screaming at once. Descend to the heart, end it before the caldera sets like glass around everyone — then decide what becomes of what it holds.", objectives: [{ id: 'heart', type: 'visit', x: 238, z: 140, r: 12, name: 'the caldera heart' }, { id: 'boss', type: 'kill', enemy: 'the_glasswake', count: 1 }, { id: 'dbenn', type: 'talk', npc: 'goldwarden', name: 'Prospector Dbenn' }], rewards: { xp: { combat: 1340, mining: 320 }, items: { gold: 580 } } },
};

export function objectiveText(obj, n) {
  if (obj.type === 'have') return `Gather ${ITEMS[obj.item].name} (${n}/${obj.count})`;
  if (obj.type === 'kill') return `Defeat ${ENEMIES[obj.enemy].name}${obj.count > 1 ? 's' : ''} (${n}/${obj.count})`;
  if (obj.type === 'visit') return `${n >= 1 ? '✓ ' : ''}Travel to ${obj.name}`;
  if (obj.type === 'talk') return `${n >= 1 ? '✓ ' : ''}Speak with ${obj.name}`;
  return `(${n}/${obj.count})`;
}

const node = (speaker, text, choices) => ({ speaker, text, choices });
const end = (label) => ({ label, to: null });

// Factory for a two-quest dungeon NPC: a trash-cull quest (objective id 'k'),
// then a boss quest (objective id 'boss'). cfg supplies all the flavour text.
function dungeonChain(name, cfg) {
  const lc = cfg.lore ? [{ label: '❖ ' + (cfg.loreAsk || 'Tell me of this place'), to: 'lore' }] : [];
  const tree = {
    root: (G) => {
      const s1 = G.quests.status(cfg.q1);
      if (s1 === 'available') return node(name, cfg.intro1, [{ label: cfg.accept1, action: (g) => g.quests.accept(cfg.q1), to: 'a1' }, ...lc, end('Not now.')]);
      if (s1 === 'active') {
        const k = G.quests.progress(cfg.q1, 'k');
        if (k >= cfg.n1) return node(name, cfg.done1, [{ label: 'Claim reward.', action: (g) => g.quests.complete(cfg.q1), to: 't1' }]);
        return node(name, `${cfg.n1 - k} ${cfg.foe1} still ${cfg.verb1}. ${cfg.where1}`, [...lc, end('On it.')]);
      }
      const s2 = G.quests.status(cfg.q2);
      if (s2 === 'available') return node(name, cfg.intro2, [{ label: cfg.accept2, action: (g) => g.quests.accept(cfg.q2), to: 'a2' }, ...lc, end('Not yet.')]);
      if (s2 === 'active') {
        if (G.quests.progress(cfg.q2, 'boss') >= 1) return node(name, cfg.done2, [{ label: 'Claim reward.', action: (g) => g.quests.complete(cfg.q2), to: 't2' }]);
        return node(name, cfg.hint2, [...lc, end('On the hunt.')]);
      }
      if (s2 === 'complete') return node(name, cfg.outro, [...lc, end('Farewell.')]);
      return node(name, cfg.idle, [...lc, end('Aye.')]);
    },
    a1: node(name, cfg.a1, [end('Understood.')]),
    t1: node(name, cfg.t1, [end('Thanks.')]),
    a2: node(name, cfg.a2, [end('Understood.')]),
    t2: node(name, cfg.t2, [end('Ha!')]),
  };
  if (cfg.lore) tree.lore = node(name, cfg.lore, cfg.lore2 ? [{ label: 'Go on…', to: 'lore2' }, end('I see.')] : [end('I see.')]);
  if (cfg.lore2) tree.lore2 = node(name, cfg.lore2, [end('Fascinating.')]);
  return tree;
}

// Factory for a Saga: a linear chain of multi-objective quests. Shows the active
// stage's remaining objectives, turns it in when ready, then advances to the next.
// Any dialogue text may be a plain string OR a function(G) — the latter lets an epilogue echo the
// branch the player chose (reads G.sagaChoices). `txt` resolves either form.
const txt = (t, G) => (typeof t === 'function' ? t(G) : t);

// Renders a quest's turn-in node. If the stage/cfg carries `choices` (a finale FORK), each option
// completes the quest, grants its OWN reward, records the outcome in G.sagaChoices, and toasts the
// consequence — a real branching choice with a distinct reward per path. No `choices` → one claim.
function finaleNode(G, name, src, qid) {
  const body = txt(src.done, G);
  if (src.choices && src.choices.length) {
    return node(name, body, src.choices.map((ch) => ({
      label: ch.label,
      action: (g) => {
        g.quests.complete(qid);
        if (ch.grant) for (const k in ch.grant) g.inventory.add(k, ch.grant[k]);
        if (g.sagaChoice) g.sagaChoice(qid, ch.outcome); else (g.sagaChoices || (g.sagaChoices = {}))[qid] = ch.outcome;
        if (ch.say && g.ui && g.ui.toast) g.ui.toast(ch.say, 'good', 4600);
      },
      to: null,
    })));
  }
  return node(name, body, [{ label: 'Claim reward.', action: (g) => g.quests.complete(qid), to: null }]);
}

function sagaDialogue(name, stages, outro) {
  return {
    root: (G) => {
      for (const s of stages) {
        const st = G.quests.status(s.id);
        if (st === 'complete') continue;
        if (st === 'available') return node(name, txt(s.intro, G), [{ label: s.accept, action: (g) => g.quests.accept(s.id), to: null }, end('Not yet.')]);
        if (st === 'active') {
          if (G.quests.isReady(s.id)) return finaleNode(G, name, s, s.id);
          const rem = G.quests.objectives(s.id).filter((o) => !o.done).map((o) => '• ' + o.text).join('   ');
          return node(name, txt(s.active, G) + '  Remaining:  ' + rem, [end('On it.')]);
        }
        return node(name, 'Finish the earlier trial first.', [end('Right.')]);
      }
      return node(name, txt(outro, G) || 'The saga is told. You are its hero.', [end('Farewell.')]);
    },
  };
}

// Factory for a SINGLE-quest giver (one stage of a multi-giver saga): offers, shows remaining
// objectives, turns in when ready, then falls back to a greeting line once it's done or not yet open.
function questGiver(name, qid, cfg) {
  return { root: (G) => {
    const st = G.quests.status(qid);
    if (st === 'available') return node(name, txt(cfg.intro, G), [{ label: cfg.accept, action: (g) => g.quests.accept(qid), to: null }, end('Not yet.')]);
    if (st === 'active') {
      if (G.quests.isReady(qid)) return finaleNode(G, name, cfg, qid);
      const rem = G.quests.objectives(qid).filter((o) => !o.done).map((o) => '• ' + o.text).join('   ');
      return node(name, txt(cfg.active, G) + '  Remaining:  ' + rem, [end('On it.')]);
    }
    return node(name, txt(cfg.greet, G), [end('Farewell.')]);   // complete, or locked behind an earlier stage
  } };
}

export const DIALOGUE = {
  // --- Crownhaven castle court (spoken to via interior 'talk' stations) ---
  king: {
    root: (G) => {
      const s1 = G.quests.status('q_crown1');
      if (s1 === 'available') return node('King Aldemar',
        'So — the wanderer whose deeds echo even to my hall. Crownhaven welcomes you. But bandits harry the roads to my gates. Thin them, and prove your worth to the crown.',
        [{ label: 'It will be done, your Majesty.', action: (g) => g.quests.accept('q_crown1'), to: 'accept1' }, { label: 'Tell me of Crownhaven.', to: 'lore' }, end('Another time.')]);
      if (s1 === 'active') {
        if (G.quests.isReady('q_crown1')) return node('King Aldemar', 'Word of your sword reaches me before you do. My roads breathe easier. Take this, with the crown’s thanks.',
          [{ label: 'Honoured, Majesty.', action: (g) => g.quests.complete('q_crown1'), to: 'done1' }]);
        return node('King Aldemar', 'The bandits still trouble my roads. Return when they are dealt with.', [end('At once.')]);
      }
      const s2 = G.quests.status('q_crown2'), s3 = G.quests.status('q_crown3');
      if (s2 === 'complete' && s3 === 'available') return node('King Aldemar', 'You have served faithfully. One trial remains — become Crownhaven’s champion. Break the brigand host gathering beyond my walls.',
        [{ label: 'I accept the trial.', action: (g) => g.quests.accept('q_crown3'), to: 'accept3' }, end('Soon.')]);
      if (s3 === 'active') {
        if (G.quests.isReady('q_crown3')) return node('King Aldemar', 'The host is broken and the realm secure. Kneel… and rise, Champion of Crownhaven. Wear my signet with pride.',
          [{ label: 'I am honoured, Majesty.', action: (g) => g.quests.complete('q_crown3'), to: 'done3' }]);
        return node('King Aldemar', 'The brigand host still gathers beyond the walls. Return a champion.', [end('I will return.')]);
      }
      if (s3 === 'complete') return node('King Aldemar', 'Champion of Crownhaven — the realm is yours to walk freely. The crown remembers its friends.', [{ label: 'Tell me of Crownhaven.', to: 'lore' }, end('Farewell, Majesty.')]);
      if (s1 === 'complete') return node('King Aldemar', 'A blade the crown can trust. My Steward has work for you yet — seek him in the hall.', [{ label: 'Tell me of Crownhaven.', to: 'lore' }, end('Farewell.')]);
      return node('King Aldemar', 'Serve the crown well, and Crownhaven will remember you.', [{ label: 'Tell me of Crownhaven.', to: 'lore' }, end('Farewell.')]);
    },
    accept1: node('King Aldemar', 'Good. My guards will speak well of you. Ride out and cull the bandits.', [end('At once.')]),
    done1: node('King Aldemar', 'Now seek my Steward here in the hall — the coffers have need of you.', [end('I will.')]),
    accept3: node('King Aldemar', 'Then go. Return a champion, or not at all.', [end('I will.')]),
    done3: node('King Aldemar', 'Rise, Champion. Crownhaven honours you — today and always.', [end('Thank you, Majesty.')]),
    lore: node('King Aldemar', 'Crownhaven has stood since the first tides — the last seat of the old crown. While hearth-fires burn in the far isles, here the banners still fly. Help me keep them flying.', [end('Inspiring.')]),
  },
  steward: {
    root: (G) => {
      const s2 = G.quests.status('q_crown2');
      if (s2 === 'available') return node('Steward Perrin', 'Ah — the King’s new blade. The royal coffers run low on fine metal; the mint needs Gold Bars. Bring me three, and the crown will reward you.',
        [{ label: "I'll bring the gold.", action: (g) => g.quests.accept('q_crown2'), to: 'accept2' }, { label: 'Where do I find gold bars?', to: 'hint' }, end('Later.')]);
      if (s2 === 'active') {
        if (G.inventory.count('gold_bar') >= 3) return node('Steward Perrin', 'Three Gold Bars, and finely smelted. The mint thanks you — as does the crown.',
          [{ label: 'Hand over 3 Gold Bars.', action: (g) => g.quests.complete('q_crown2'), to: 'done2' }]);
        return node('Steward Perrin', `The mint still wants ${3 - G.inventory.count('gold_bar')} more Gold Bars. Mine gold ore and smelt it at a furnace.`, [end('On it.')]);
      }
      if (s2 === 'complete') return node('Steward Perrin', 'The coffers are full and the realm prospers. The King will want to see you — one last trial awaits.', [end('I’ll seek him.')]);
      return node('Steward Perrin', 'Prove yourself to the King first, then the coffers may have work for you.', [{ label: 'What do you do here?', to: 'role' }, end('Farewell.')]);
    },
    accept2: node('Steward Perrin', 'Three Gold Bars. The treasury is through the east wing when you’re ready.', [end('Understood.')]),
    done2: node('Steward Perrin', 'Deposited and counted. Now speak with the King — he has a final task for one so proven.', [end('I will.')]),
    hint: node('Steward Perrin', 'Gold ore lies in the deeper mines — Stormhold and the Red Mesa. Smelt it at any furnace into bars.', [end('Thank you.')]),
    role: node('Steward Perrin', 'I keep the King’s hall, his ledgers, and his patience. All three run thin some days.', [end('Ha.')]),
  },
  courtmage: {
    root: () => node('Court Mage Sabelle', 'The crown’s enchantments are mine to keep. Bind runes at my circle if you’ve the essence — the arcane serves those who serve the realm.',
      [{ label: 'What magic guards Crownhaven?', to: 'lore' }, { label: 'Any wisdom for me?', to: 'wisdom' }, end('Farewell.')]),
    lore: node('Court Mage Sabelle', 'Wards older than the walls. The first crown was forged with starlight and salt — its light still hums beneath these stones. I keep it lit.', [end('Fascinating.')]),
    wisdom: node('Court Mage Sabelle', 'Power that stays small and chooses to serve outlasts any throne. Remember it.', [end('I will.')]),
  },
  elder: {
    root: (G) => {
      const st = G.quests.status('q_wood');
      if (st === 'available') {
        return node('Elder Maren',
          'Welcome, wanderer. Our hearth fire dwindles and night draws cold. Would you gather three Driftwood from the trees of the isle?',
          [
            { label: 'I will help.', action: (G) => G.quests.accept('q_wood'), to: 'accepted' },
            { label: 'What is this place?', to: 'lore' },
            end('Not now.'),
          ]);
      }
      if (st === 'active') {
        if (G.inventory.count('wood') >= 3) {
          return node('Elder Maren', 'Ah — Driftwood, and good and dry! Bless you, traveler.',
            [{ label: 'Hand over 3 Driftwood.', action: (G) => G.quests.complete('q_wood'), to: 'thanks' }]);
        }
        return node('Elder Maren', `Bring me ${3 - G.inventory.count('wood')} more Driftwood. Walk up to a tree and tap to chop it.`,
          [end('On it.')]);
      }
      if (st === 'complete') {
        const rq = G.quests.status('q_relic');
        if (rq === 'available') return node('Elder Maren', 'You felled Emberfang! It guarded the Tide Relic — recover it and carry it home to me.',
          [{ label: 'I will.', action: (g) => g.quests.accept('q_relic'), to: null }, end('Later.')]);
        if (rq === 'active') {
          if (G.inventory.count('relic') >= 1) return node('Elder Maren', 'The Tide Relic — home at last. The isles owe you everything.',
            [{ label: 'Hand it over.', action: (g) => g.quests.complete('q_relic'), to: 'relicDone' }]);
          return node('Elder Maren', 'The relic Emberfang guarded — carry it back to me from the Ember Isle.', [end('On it.')]);
        }
        if (rq === 'complete') return node('Elder Maren', 'A hero of the Verdant Isle. The hearth-hall is forever yours.',
          [{ label: 'Tell me of the isle.', to: 'lore' }, end('Farewell.')]);
        return node('Elder Maren', 'The hearth burns bright because of you. Chop freely — and mind the boars in the wood.',
          [{ label: 'Tell me of the isle.', to: 'lore' }, end('Farewell.')]);
      }
      return node('Elder Maren', 'May the tides favor you.', [end('Farewell.')]);
    },
    accepted: node('Elder Maren', 'Walk up to any tree and tap to fell it. Three Driftwood should rekindle the hearth.', [end('Understood.')]),
    lore: node('Elder Maren', 'This is the Verdant Isle, last of the Tide Reaches. The northern peak hides an old relic — but that is a tale for braver days.', [end('Interesting.')]),
    thanks: node('Elder Maren', 'Take this salve for your travels. And seek Ranger Coyle by the eastern hut — the boars grow bold.', [end('I will.')]),
    relicDone: node('Elder Maren', 'The relic hums safe in the hearth-hall. Sung of for generations, you’ll be.', [end('Farewell.')]),
  },

  ranger: {
    root: (G) => {
      const st = G.quests.status('q_boar');
      if (st === 'locked') {
        return node('Ranger Coyle', 'New here? Speak with Elder Maren first. Once the hearth is lit, I could use a hand with the boars.', [end('Right.')]);
      }
      if (st === 'available') {
        return node('Ranger Coyle', 'Wild boars have been charging out of the wood. Fell two of them and the herd should scatter. Tap to strike when you close in.',
          [
            { label: 'Consider it done.', action: (G) => G.quests.accept('q_boar'), to: 'accepted' },
            end('Maybe later.'),
          ]);
      }
      if (st === 'active') {
        const k = G.quests.progress('q_boar', 'boar');
        if (k >= 2) return node('Ranger Coyle', 'Both boars down? Fine work. The herd is already drifting north.',
          [{ label: 'Claim reward.', action: (G) => G.quests.complete('q_boar'), to: 'thanks' }]);
        return node('Ranger Coyle', `${2 - k} boar left to fell. Get in close and tap — or double-tap for a quick swing.`, [end('On the hunt.')]);
      }
      if (st === 'complete') return node('Ranger Coyle', 'The wood is quieter now. You hunt well, friend.', [end('Take care.')]);
      return node('Ranger Coyle', 'Keep your blade ready out there.', [end('Aye.')]);
    },
    accepted: node('Ranger Coyle', 'Boars roam the western wood and the southern plain. Two should settle them.', [end('Understood.')]),
    thanks: node('Ranger Coyle', 'Here — pelts fetch a fair price from Trader Pell. Safe travels.', [end('Thanks.')]),
  },

  merchant: {
    root: (G) => {
      const st = G.quests.status('q_berry');
      const trade = { label: 'Trade with me', tag: 'Shop', action: (g) => { g.pendingShop = true; }, to: null };
      if (st === 'available') {
        return node('Trader Pell', 'Sunberries! The bushes dotting the isle are full of them. Bring me four and I will make it worth your coin.',
          [{ label: "I'll gather them.", action: (g) => g.quests.accept('q_berry'), to: 'accepted' }, trade, end('Not today.')]);
      }
      if (st === 'active') {
        if (G.inventory.count('berry') >= 4) return node('Trader Pell', 'Four ripe Sunberries — perfect!',
          [{ label: 'Hand over 4 Sunberries.', action: (g) => g.quests.complete('q_berry'), to: 'thanks' }, trade]);
        return node('Trader Pell', `${4 - G.inventory.count('berry')} more Sunberries. The green bushes — tap to forage them.`, [trade, end('Got it.')]);
      }
      if (st === 'complete') return node('Trader Pell', 'Always a pleasure doing business. Come back any time.', [trade, end('Will do.')]);
      return node('Trader Pell', 'Wares, wonders, and a fair deal — that is Trader Pell.', [trade, end('Bye.')]);
    },
    accepted: node('Trader Pell', 'The berry bushes glow a little in the dusk. Tap one when you stand close to forage it.', [end('Understood.')]),
    thanks: node('Trader Pell', 'Coin well earned. Those salve flasks of mine restore a good deal of vigor, should you need one.', [end('Thanks.')]),
  },

  miner: {
    root: (G) => {
      const st = G.quests.status('q_mine');
      if (st === 'available') return node('Old Bryn', 'Forge’s near cold. Bring me five coal from the Ember rocks and I’ll pay you well.',
        [{ label: 'I’ll dig some up.', action: (g) => g.quests.accept('q_mine'), to: 'a' }, end('Maybe later.')]);
      if (st === 'active') {
        if (G.inventory.count('coal') >= 5) return node('Old Bryn', 'Five coal — that’ll keep her roaring!',
          [{ label: 'Hand it over.', action: (g) => g.quests.complete('q_mine'), to: 't' }]);
        return node('Old Bryn', `${5 - G.inventory.count('coal')} more coal. Tap the dark ember rocks to mine them.`, [end('On it.')]);
      }
      if (st === 'complete') return node('Old Bryn', 'Forge runs hot again. The ore’s yours to work, friend.', [end('Thanks.')]);
      return node('Old Bryn', 'The pick swings itself once you’ve the knack.', [end('Aye.')]);
    },
    a: node('Old Bryn', 'Coal’s the grey-black ore. Iron too, if you fancy it. Just tap the rocks.', [end('Understood.')]),
    t: node('Old Bryn', 'Good honest coin. Spend it at Pell’s stall back west.', [end('Will do.')]),
  },

  smith: {
    root: (G) => {
      const s1 = G.quests.status('q_smith');
      if (s1 === 'available') return node('Smith Dorrin', 'So you fancy yourself a smith? Smelt me three bronze bars at the furnace and we’ll talk.',
        [{ label: 'I’ll forge them.', action: (g) => g.quests.accept('q_smith'), to: 'a1' }, end('Later.')]);
      if (s1 === 'active') {
        if (G.inventory.count('bronze_bar') >= 3) return node('Smith Dorrin', 'Three bronze bars, and cleanly cast!',
          [{ label: 'Hand them over.', action: (g) => g.quests.complete('q_smith'), to: 't1' }]);
        return node('Smith Dorrin', `Mine copper, smelt it at the furnace yonder. ${3 - G.inventory.count('bronze_bar')} bronze bars to go.`, [end('Right.')]);
      }
      const sup = G.quests.status('q_supply');
      if (sup === 'available') return node('Smith Dorrin', 'Before the real work — fetch me five Driftwood from the Verdant Isle, west across the isthmus. Good hafts need good wood.',
        [{ label: 'I’ll bring it.', action: (g) => g.quests.accept('q_supply'), to: 'as' }, end('Later.')]);
      if (sup === 'active') {
        if (G.inventory.count('wood') >= 5) return node('Smith Dorrin', 'Five staves of Verdant driftwood — that’ll do nicely.',
          [{ label: 'Hand it over.', action: (g) => g.quests.complete('q_supply'), to: 'ts' }]);
        return node('Smith Dorrin', `${5 - G.inventory.count('wood')} more Driftwood — chop the trees back on the Verdant Isle.`, [end('On it.')]);
      }
      const s2 = G.quests.status('q_boss');
      if (s2 === 'available') return node('Smith Dorrin', 'You can smith — now prove your steel. Emberfang stalks the Emberpeak. Slay the beast.',
        [{ label: 'I’ll hunt it.', action: (g) => g.quests.accept('q_boss'), to: 'a2' }, end('Not yet.')]);
      if (s2 === 'active') {
        if (G.quests.progress('q_boss', 'boss') >= 1) return node('Smith Dorrin', 'Emberfang is dead?! You’re a legend of the isles.',
          [{ label: 'Claim reward.', action: (g) => g.quests.complete('q_boss'), to: 't2' }]);
        return node('Smith Dorrin', 'Emberfang still breathes at the peak. Forge a stronger blade at the anvil before you go.', [end('On it.')]);
      }
      if (s2 === 'complete') return node('Smith Dorrin', 'The peak is safe thanks to you. The forge is always open to a friend.', [end('Farewell.')]);
      return node('Smith Dorrin', 'Steel waits for no one.', [end('Aye.')]);
    },
    a1: node('Smith Dorrin', 'Furnace is right there. Copper ore smelts straight into bronze.', [end('Understood.')]),
    t1: node('Smith Dorrin', 'Take these iron bars — forge a finer sword at the anvil. You’ll want it for what’s coming.', [end('Thanks.')]),
    a2: node('Smith Dorrin', 'The anvil upgrades your blade: bronze, then iron, then steel. Go well armed.', [end('Understood.')]),
    t2: node('Smith Dorrin', 'A true islandbane. The whole of Emberhold is in your debt.', [end('Ha!')]),
    as: node('Smith Dorrin', 'The isthmus runs west to the Verdant Isle. Chop its trees and bring the driftwood back.', [end('Understood.')]),
    ts: node('Smith Dorrin', 'Sturdy hafts at last. Now — about that beast on the peak...', [end('Aye.')]),
  },

  fisher: {
    root: (G) => {
      const st = G.quests.status('q_fish');
      if (st === 'available') return node('Wren', 'The trout run thick off the Ashen Shore. Land me three and I’ll see you paid.',
        [{ label: 'I’ll cast a line.', action: (g) => g.quests.accept('q_fish'), to: 'a' }, end('Not now.')]);
      if (st === 'active') {
        if (G.inventory.count('raw_trout') >= 3) return node('Wren', 'Three fat trout — lovely!',
          [{ label: 'Hand them over.', action: (g) => g.quests.complete('q_fish'), to: 't' }]);
        return node('Wren', `${3 - G.inventory.count('raw_trout')} more trout. Stand by a shimmering spot on the water and tap to fish.`, [end('Casting.')]);
      }
      if (st === 'complete') return node('Wren', 'Best angler on the isles, you are. Fish here anytime.', [end('Cheers.')]);
      return node('Wren', 'Tight lines, friend.', [end('Aye.')]);
    },
    a: node('Wren', 'The shimmering rings on the water are the spots. Cook your catch at a fire to make it edible.', [end('Understood.')]),
    t: node('Wren', 'Coin for your trouble. Cook the rest — trout restores a good deal of vigour.', [end('Thanks.')]),
  },

  slayermaster: {
    root: (G) => {
      const s = G.slayer;
      const shop = { label: `Reward shop · ${G.slayerPoints || 0} pts`, action: (g) => { g.pendingSlayerShop = true; }, to: null };
      if (!s || !s.active) return node('Slayer Master Krael', `Looking for a contract? I’ll mark a beast for you to cull. You hold ${G.slayerPoints || 0} Slayer points.`,
        [{ label: 'Assign me a task.', action: (g) => g.slayerAssign(), to: 'assigned' }, shop, end('Not now.')]);
      if (s.progress >= s.count) return node('Slayer Master Krael', `${s.count} ${ENEMIES[s.enemy].name}s slain — contract complete.`,
        [{ label: 'Claim reward.', action: (g) => g.slayerClaim(), to: 'claimed' }, shop]);
      return node('Slayer Master Krael', `Your contract: slay ${s.count} ${ENEMIES[s.enemy].name}s (${s.progress}/${s.count}).`, [shop, end('On it.')]);
    },
    assigned: (G) => node('Slayer Master Krael', `Hunt down ${G.slayer.count} ${ENEMIES[G.slayer.enemy].name}s out in the wilds. Off you go.`, [end('Understood.')]),
    claimed: node('Slayer Master Krael', 'Fine work. A new contract waits whenever you’re ready.', [end('Thanks.')]),
  },

  druid: {
    root: (G) => {
      const st = G.quests.status('q_forest');
      if (st === 'available') return node('Thornwarden Eld', 'The wolves of the deep wood grow too bold. Cull three and the grove will breathe easier.',
        [{ label: 'I will hunt them.', action: (g) => g.quests.accept('q_forest'), to: 'a' }, end('Another time.')]);
      if (st === 'active') {
        const k = G.quests.progress('q_forest', 'wolf');
        if (k >= 3) return node('Thornwarden Eld', 'The pack is thinned. The wood thanks you.', [{ label: 'Claim reward.', action: (g) => g.quests.complete('q_forest'), to: 't' }]);
        return node('Thornwarden Eld', `${3 - k} wolves still prowl the forest.`, [end('On the hunt.')]);
      }
      if (st === 'complete') return node('Thornwarden Eld', 'Walk softly among the trees, friend.', [end('Farewell.')]);
      return node('Thornwarden Eld', 'The forest remembers those who tend it.', [end('Aye.')]);
    },
    a: node('Thornwarden Eld', 'Grey wolves roam the western wood. Three should settle them.', [end('Understood.')]),
    t: node('Thornwarden Eld', 'Take this coin, and the grove’s blessing.', [end('Thanks.')]),
  },

  nomad: {
    root: (G) => {
      const s1 = G.quests.status('q_desert');
      if (s1 === 'available') return node('Zara the Nomad', 'Scorpions plague the dunes around the oasis. Crush three for me?',
        [{ label: 'Consider it done.', action: (g) => g.quests.accept('q_desert'), to: 'a1' }, end('Not now.')]);
      if (s1 === 'active') {
        const k = G.quests.progress('q_desert', 'scorpion');
        if (k >= 3) return node('Zara the Nomad', 'The dunes are safer already. My thanks.', [{ label: 'Claim reward.', action: (g) => g.quests.complete('q_desert'), to: 't1' }]);
        return node('Zara the Nomad', `${3 - k} scorpions left skittering.`, [end('On it.')]);
      }
      const s2 = G.quests.status('q_sandwyrm');
      if (s2 === 'available') return node('Zara the Nomad', 'A greater terror sleeps in the deep desert — the Sandwyrm. End it and you’ll be a legend here.',
        [{ label: 'I’ll slay it.', action: (g) => g.quests.accept('q_sandwyrm'), to: 'a2' }, end('Not yet.')]);
      if (s2 === 'active') {
        if (G.quests.progress('q_sandwyrm', 'boss') >= 1) return node('Zara the Nomad', 'The Sandwyrm is dead?! The oasis will sing your name.', [{ label: 'Claim reward.', action: (g) => g.quests.complete('q_sandwyrm'), to: 't2' }]);
        return node('Zara the Nomad', 'The Sandwyrm lurks deep to the south. Bring strong gear.', [end('On the hunt.')]);
      }
      if (s2 === 'complete') return node('Zara the Nomad', 'Hero of the dunes. Rest at the oasis whenever you pass.', [end('Farewell.')]);
      return node('Zara the Nomad', 'Cool water and fair trade at the oasis.', [end('Bye.')]);
    },
    a1: node('Zara the Nomad', 'The scorpions favour the open dunes. Three of them.', [end('Understood.')]),
    t1: node('Zara the Nomad', 'Coin, as promised. And mind the Sandwyrm to the south…', [end('Thanks.')]),
    a2: node('Zara the Nomad', 'The Sandwyrm burrows in the deep south of the desert. Go armed.', [end('Understood.')]),
    t2: node('Zara the Nomad', 'A true desert legend. The oasis is yours.', [end('Ha!')]),
  },

  frostkeeper: {
    root: (G) => {
      const s1 = G.quests.status('q_snow');
      if (s1 === 'available') return node('Frostkeeper Nessa', 'Frost wolves circle my camp each night. Drive off three and I’ll rest easier.',
        [{ label: 'I’ll handle it.', action: (g) => g.quests.accept('q_snow'), to: 'a1' }, end('Not now.')]);
      if (s1 === 'active') {
        const k = G.quests.progress('q_snow', 'frost_wolf');
        if (k >= 3) return node('Frostkeeper Nessa', 'The nights are quieter now. Bless you.', [{ label: 'Claim reward.', action: (g) => g.quests.complete('q_snow'), to: 't1' }]);
        return node('Frostkeeper Nessa', `${3 - k} frost wolves still howl.`, [end('On it.')]);
      }
      const s2 = G.quests.status('q_frostwarden');
      if (s2 === 'available') return node('Frostkeeper Nessa', 'In the Frost Cavern broods the Frost Warden. None who enter return. Will you?',
        [{ label: 'I’ll face it.', action: (g) => g.quests.accept('q_frostwarden'), to: 'a2' }, end('Not yet.')]);
      if (s2 === 'active') {
        if (G.quests.progress('q_frostwarden', 'boss') >= 1) return node('Frostkeeper Nessa', 'The Warden has fallen? You’ve thawed our long winter.', [{ label: 'Claim reward.', action: (g) => g.quests.complete('q_frostwarden'), to: 't2' }]);
        return node('Frostkeeper Nessa', 'The cavern lies east, past the ice spires. Wrap up warm.', [end('On the hunt.')]);
      }
      if (s2 === 'complete') return node('Frostkeeper Nessa', 'Warden-slayer. The snows will remember you.', [end('Farewell.')]);
      return node('Frostkeeper Nessa', 'Keep moving — the cold bites the still.', [end('Aye.')]);
    },
    a1: node('Frostkeeper Nessa', 'The frost wolves hunt the open snowfields. Three should scatter the pack.', [end('Understood.')]),
    t1: node('Frostkeeper Nessa', 'Coin, and my thanks. The Warden in the cavern is the true menace, though…', [end('Thanks.')]),
    a2: node('Frostkeeper Nessa', 'The Frost Cavern is ringed with ice spires, east of here. Bring your best.', [end('Understood.')]),
    t2: node('Frostkeeper Nessa', 'A hero of the snows. Shelter with us anytime.', [end('Ha!')]),
  },

  gravekeeper: dungeonChain('Gravekeeper Sael', {
    q1: 'q_crypt', n1: 4, foe1: 'skeletons', verb1: 'rattle',
    intro1: 'The dead will not rest. Skeletons claw up through the Gloomroot Catacombs out in the mire. Lay four of them to rest.',
    accept1: 'I will cleanse them.', where1: 'The catacombs lie in the Mistmoor, ringed in black stone.',
    done1: 'The clatter of bones grows quiet. Well done.',
    a1: 'Enter through the southwest gap and shatter the skeletons within.',
    t1: 'Coin for your courage — but the true horror still stirs below…',
    q2: 'q_bonelord', accept2: 'I will end it.',
    intro2: 'Bonelord Mortrax raised them all. Destroy the lich and the mire may sleep at last.',
    hint2: 'Mortrax broods at the heart of the catacombs. Bring light and steel.',
    done2: 'Mortrax is dust? You have freed a hundred trapped souls.',
    a2: 'The Bonelord waits at the catacomb’s core. Go well armed.',
    t2: 'A truer hero the mire has never known.',
    outro: 'Rest easy, friend — the dead do now.', idle: 'The graves are quiet, thanks to you.',
    loreAsk: 'Why tend these graves?',
    lore: 'I was a healer once, in a village now sunk under the mire. When the plague came I buried them all — and then they would not stay buried. Mortrax’s magic seeps up through the roots and wakes them.',
    lore2: 'Mortrax was a scholar of death, not its enemy. He thought he could cheat the grave. Now he IS the grave, and every soul he raised is a page in a book he can no longer close.',
  }),
  warden: dungeonChain('Warden Brakka', {
    q1: 'q_warren', n1: 5, foe1: 'goblins', verb1: 'skulk',
    intro1: 'Goblins pour out of that warren and raid our stores. Cull five and they’ll think twice.',
    accept1: 'Consider it done.', where1: 'The warren sits in the southwest of the Verdant Isle.',
    done1: 'Five down already? The raids are easing.',
    a1: 'The warren’s a stockade of mud and timber. Cut the goblins down.',
    t1: 'Good coin. But it’s their Warchief who keeps them bold…',
    q2: 'q_warchief', accept2: 'I’ll take his head.',
    intro2: 'Warchief Gronk leads the lot. End him and the warren breaks for good.',
    hint2: 'Gronk holds court at the warren’s heart. Mind his swing.',
    done2: 'Gronk has fallen?! The warren scatters to the winds.',
    a2: 'Gronk is twice a man’s size. Strike hard and don’t let up.',
    t2: 'The Verdant owes you a quiet harvest. Ha!',
    outro: 'The fields are safe to walk again. My thanks.', idle: 'Keep that blade keen, friend.',
    loreAsk: 'What is your post here?',
    lore: '“Warden” is a grand word for what I am — last of a militia that’s mostly me and a rusty spear. The goblins didn’t used to raid. Then Gronk crowned himself, and now they come for the granaries every harvest.',
    lore2: 'Gronk’s no ordinary goblin — twice the size, thrice the cunning. They say he found a war-totem in the warren’s deep, and it’s been whispering to him ever since.',
  }),
  lapidary: dungeonChain('Lapidary Sten', {
    q1: 'q_crystal', n1: 3, foe1: 'crystal golems', verb1: 'stand guard',
    intro1: 'The Crystal Hollow is richer in gems than any mine — but golems of living crystal guard it. Smash three and I can work in peace.',
    accept1: 'I’ll break them.', where1: 'The hollow glitters in the snowfields, near the camp.',
    done1: 'Three golems shattered — and look at all that gemstone!',
    a1: 'The golems are slow but heavy. Crystal shards drop from them — keep those.',
    t1: 'A sapphire for your trouble. Yet the Tyrant within hoards the deepest gems…',
    q2: 'q_prism', accept2: 'I’ll face the Tyrant.',
    intro2: 'The Prism Tyrant rules the hollow’s heart, bending light into blades. Lay it low.',
    hint2: 'The Tyrant waits deep in the hollow. Strong armour would serve you well.',
    done2: 'The Tyrant is shattered? The hollow is the richest claim on the isles!',
    a2: 'The Tyrant splits light into deadly shards. Close the distance fast.',
    t2: 'You’ve made my fortune — and your own. Ha!',
    outro: 'Finest gems you ever saw, all thanks to you.', idle: 'Mind the facets — sharp as any blade.',
    loreAsk: 'What are these crystals?',
    lore: 'A lapidary cuts gems, friend — and I’ve never seen gems like the Hollow’s. They grow. They hum. Press your ear to a fresh-cut facet and you’ll swear it sings back.',
    lore2: 'The Prism Tyrant isn’t a creature so much as the Hollow defending itself. Every gem you take, it feels. Take enough, and it wakes. I fear I’ve taken far too many.',
  }),
  emberwright: dungeonChain('Emberwright Vol', {
    q1: 'q_magma', n1: 3, foe1: 'lava hounds', verb1: 'prowl',
    intro1: 'Below Emberhold yawns the Magma Depths. Lava hounds boil up and scorch my forge. Put down three.',
    accept1: 'I’ll cool them off.', where1: 'The depths open in the volcanic rock east of the village.',
    done1: 'Three hounds doused. The forge can breathe again.',
    a1: 'The hounds run hot and fast. Magma cores drop from them — useful, those.',
    t1: 'Coin, well earned. But something vast stirs in the deep heat…',
    q2: 'q_colossus', accept2: 'I’ll bring it down.',
    intro2: 'A Cinder Colossus wakes in the depths — molten rock given will. Shatter it before it climbs.',
    hint2: 'The Colossus looms at the depths’ floor. Hit hard; it hits harder.',
    done2: 'The Colossus is rubble? Emberhold will stand another age.',
    a2: 'The Colossus is slow but devastating. Strike between its blows.',
    t2: 'Forged a legend today, I did. Ha!',
    outro: 'The depths run cool. The forge is yours anytime.', idle: 'Stay clear of the vents, friend.',
    loreAsk: 'Tell me of the Depths.',
    lore: 'I forge with the mountain’s own fire — best blades on the isles come off my anvil, when the Depths aren’t trying to climb up my chimney.',
    lore2: 'The Colossus is old magma given a grudge. It slept content until our mining woke it. Half of me says we earned it. The other half just wants my forge to stop melting.',
  }),
  oracle: dungeonChain('Oracle Nerida', {
    q1: 'q_temple', n1: 4, foe1: 'tide priests', verb1: 'chant',
    intro1: 'The Sunken Temple was holy once. Now drowned priests chant to wake what sleeps beneath. Silence four of them.',
    accept1: 'I’ll quiet them.', where1: 'The temple rises from the Tide Isle, south across the water.',
    done1: 'The chanting falters. But it may be too late…',
    a1: 'The priests guard the temple halls. Abyss pearls fall from them.',
    t1: 'Take this coin — and steel yourself. The King already stirs.',
    q2: 'q_drowned', accept2: 'I’ll confront the King.',
    intro2: 'Drowned King Nautilus wakes in the flooded sanctum, oldest of the Tide’s tyrants. Few could face him. Will you?',
    hint2: 'The King waits in the sanctum at the temple’s heart. He carries the Tidecaller itself.',
    done2: 'The King is undone? You have ended a terror older than the isles.',
    a2: 'Nautilus commands the very water. Strike true and do not falter.',
    t2: 'The tides themselves will remember your name. Ha!',
    outro: 'The temple sleeps in peace, and so may we all.', idle: 'The waters are calm now, hero.',
    loreAsk: 'What was this temple?',
    lore: 'I read the tides as others read books. The Temple was a place of worship once, to gods older than the isles — gods who asked for the sea in return for calm waters.',
    lore2: 'The Drowned King kept the old bargain even after the worshippers drowned. Now he keeps it alone, mad with salt and centuries. He doesn’t want to drown you — he wants someone to share the watch.',
  }),

  pathfinder: dungeonChain('Pathfinder Anouk', {
    q1: 'q_zigg', n1: 4, foe1: 'serpents', verb1: 'coil',
    intro1: 'The Kytari jungle swallows the unready. Coil serpents nest by the Overgrown Ziggurat — thin four of them for me.',
    accept1: 'I’ll track them.', where1: 'The ziggurat rises in the east of the jungle.',
    done1: 'Four serpents down — you move well in the green.',
    a1: 'Strike fast; the serpents are quick. Vine coils drop from them.',
    t1: 'Coin, and the jungle’s respect. But the great coil still waits atop the ziggurat…',
    q2: 'q_jorath', accept2: 'I’ll climb it.',
    intro2: 'Jorath the Coiled rules the ziggurat — a serpent the size of a river. End it.',
    hint2: 'Jorath waits at the ziggurat’s summit. Bring strong steel.',
    done2: 'Jorath slain?! The Kytari will carve your name in the stones.',
    a2: 'Jorath strikes like lightning and coils like a vice. Keep moving.',
    t2: 'A jungle legend, you are. Ha!',
    outro: 'The green is calmer for your passing.', idle: 'Tread softly among the vines.',
    loreAsk: 'You know this jungle?',
    lore: 'I’ve mapped every green mile of Kytari, and the jungle’s redrawn half of them behind me. It moves, you understand. The ziggurat I marked last season sits a half-mile from where it was.',
    lore2: 'Jorath isn’t lost in the jungle — Jorath IS the jungle’s law. The serpents answer to him. Cross him and the green itself turns against you. I’ve the scars to prove it.',
  }),
  cinderwarden: dungeonChain('Cinderwarden Hax', {
    q1: 'q_ashpit', n1: 3, foe1: 'ash hounds', verb1: 'prowl',
    intro1: 'The Scorched Wastes burn anything soft. Ash hounds hunt the dunes of cinder — put three down.',
    accept1: 'I’ll cool them.', where1: 'The Ashpit yawns open in the heart of the wastes.',
    done1: 'Three hounds doused. The wastes breathe a little.',
    a1: 'The hounds run hot and fast. Demon ash drops from them.',
    t1: 'Coin from the embers. But the Ashlord himself broods below…',
    q2: 'q_vurak', accept2: 'I’ll face the Ashlord.',
    intro2: 'Ashlord Vurak commands the Ashpit — a demon of living fire. Snuff him out.',
    hint2: 'Vurak rages at the pit’s floor. Bring your best armour.',
    done2: 'Vurak is cinders? The wastes owe you their cooling.',
    a2: 'Vurak hurls fire and hits like a falling mountain. Strike between blasts.',
    t2: 'Forged a legend in the ashes today. Ha!',
    outro: 'The embers settle, thanks to you.', idle: 'Mind the heat, wanderer.',
    loreAsk: 'Why guard the Ashpit?',
    lore: 'Cinderwarden — I keep watch on the Ashpit so it doesn’t spread. Lonely work. There was a town out here once, before the wastes were waste. Now it’s me, the hounds, and a hole in the world that breathes fire.',
    lore2: 'Vurak crawled UP out of the Ashpit, not down into it. Whatever lies at the bottom made him. I don’t ask what’s at the bottom — I just make sure nothing else climbs out.',
  }),
  stormcaller: dungeonChain('Stormcaller Branok', {
    q1: 'q_thunder', n1: 4, foe1: 'storm harpies', verb1: 'wheel overhead',
    intro1: 'The Highlands answer to the storm. Harpies ride the gales and raid Stormhold — bring down four.',
    accept1: 'I’ll ground them.', where1: 'They wheel above the crags around Thunderpeak Hold.',
    done1: 'Four harpies felled. The winds ease.',
    a1: 'The harpies strike from above. Storm shards fall from them.',
    t1: 'Coin, and the mountain’s thanks. But the storm titan still walks the Hold…',
    q2: 'q_thruun', accept2: 'I’ll climb the Hold.',
    intro2: 'Thruun, the storm titan, broods in Thunderpeak Hold — thunder given form. Lay him low.',
    hint2: 'Thruun waits in the Hold’s great hall. Mind the lightning.',
    done2: 'Thruun has fallen?! The Highlands will sing through every storm.',
    a2: 'Thruun calls the lightning and strikes like an avalanche. Stay nimble.',
    t2: 'A storm-breaker walks among us. Ha!',
    outro: 'The skies are kinder now.', idle: 'Keep your footing on the crags.',
    loreAsk: 'What does a Stormcaller do?',
    lore: 'Stormcaller’s a title my grandmother held, and hers before. We don’t call the storms — we answer to them. The Highlands have always been loud, but lately the thunder sounds… angry.',
    lore2: 'Thruun was of my line, generations back — the first Stormcaller. He climbed the Hold to bind the storm and never came down. Now the storm wears him. I’d call it family business, but I’d rather it were yours.',
  }),
  faewarden: dungeonChain('Oona the Fae', {
    q1: 'q_fey', n1: 3, foe1: 'thornlings', verb1: 'creep',
    intro1: 'The Moonlit Glade sours. Thornlings creep from the Feywild Hollow, choking the moonflowers — cut back three.',
    accept1: 'I’ll tend it.', where1: 'The Hollow opens beneath the glade’s glowing canopy.',
    done1: 'Three thornlings pruned. The glade glimmers again.',
    a1: 'The thornlings are slow but barbed. Fae dust drifts from them.',
    t1: 'Fae coin for you. But the Hollow King stirs at the root of it all…',
    q2: 'q_hollow', accept2: 'I’ll enter the Hollow.',
    intro2: 'The Hollow King twists the Feywild to nightmare. Banish him and free the glade.',
    hint2: 'The King holds court deep in the Hollow. Magic wards would help.',
    done2: 'The Hollow King is undone? The glade will bloom for a thousand years.',
    a2: 'The King bends light and thorn alike. Strike true through his illusions.',
    t2: 'The Fae will remember you in moonlight. Ha!',
    outro: 'The glade sings your name softly.', idle: 'Walk gently in the moonlight.',
    loreAsk: 'What is the Hollow King?',
    lore: 'Fae, half-fae — who can say anymore. I’ve tended the Moonlit Glade since before your grandmother’s grandmother dreamed. It was always a kind place. The Hollow King saw to that.',
    lore2: 'He gave up his name, his face, his heart — hollowed himself to seal what sleeps below. We loved him for it. Now the hollow is all that’s left, and it is hungry. Mercy and murder look the same from here.',
  }),

  saga_vael: sagaDialogue('Loremaster Vael', [
    { id: 'q_saga_v1', intro: 'You think the Verdant Isle was always green? No — it was bargained for. The Founders struck a Pact with the land itself and sealed it at a shrine on the North Peak. The words are forgotten, the shrine gone cold. Wake it: bring driftwood for its fire, and ask Elder Maren — she alone still remembers the old verse.', accept: 'I will wake the shrine.', active: 'The shrine waits on the peak, and Maren remembers more than she lets on.', done: 'The shrine breathes again, and Maren has spoken the first line of the Pact. Now I fear what the second line will ask of you.' },
    { id: 'q_saga_v2', intro: 'The Pact had a guardian — Emberfang, a flame-beast bound to defend the isle. But ashen cultists crept into the Emberdeep and shattered its binding. Go down into the cave, scatter the cult, and gather copper to forge a new seal.', accept: 'I’ll break the cult.', active: 'The cult still chants in the Emberdeep, and the seal is unforged.', done: 'The cult is broken and the seal is cast — but it is too late. Emberfang is feral now. Only one path remains, and it is grim.' },
    { id: 'q_saga_v3', intro: 'Emberfang cannot be re-bound; it must be put down — the guardian itself, gone mad. Strike it down on the peak, then come back to me. This is the heaviest line of the Pact, and I would not ask it of anyone else.', accept: 'It will be done.', active: 'Emberfang still rages where the Pact once held.', done: 'Emberfang is dead. Now hear the truth: with the old guardian gone, the Pact passes to a new keeper — to you. The isle is yours to protect now. Wear this amulet, and never set it down.' },
  ], 'The Verdant Pact lives in you now, keeper. Walk tall — the land is watching.'),
  saga_trades: sagaDialogue('Guildmaster Aldric', [
    { id: 'q_trade_cook', intro: 'Welcome to the Guild of Trades! Every master starts with a full belly. Find a shimmering fishing spot, tap to fish, then cook your catch on a stove — there’s one by the village hearth. Bring me two Cooked Shrimp.', accept: 'I’ll catch and cook.', active: 'Fish at a shimmering water spot, then cook the catch at a stove.', done: 'A cook who won’t starve on the road! Now — to a real craft.' },
    { id: 'q_trade_fletch', intro: 'A ranger makes their own arrows. Chop a tree for logs, then at a Fletching Bench carve them into shafts. Forage bushes for feathers, smelt copper ore into a bronze bar at a furnace, and fletch it all into five Bronze Arrows.', accept: 'I’ll fletch them.', active: 'Fletching Bench: logs → shafts, then shafts + feathers + a bronze bar → arrows.', done: 'Fine fletching! Take this longbow — equip it and your arrows fire for bonus damage. On to herbs.' },
    { id: 'q_trade_brew', intro: 'A wise adventurer carries cures. Forage Glimmerleaf and Sunberries from the bushes, then brew an Antidote at a cauldron. Drink potions from your pack when the fight turns.', accept: 'I’ll brew one.', active: 'Forage a herb + two berries, then brew an Antidote at a cauldron.', done: 'A field medic in the making. Every trade needs a workshop, though…' },
    { id: 'q_trade_build', intro: 'Construction begins with planks. Chop logs and saw them at the Sawmill in town. With planks you can build furniture — a shrine, hearth, even a bank — at the Carpenter’s Workbench by your house. Bring me eight Planks.', accept: 'I’ll mill some planks.', active: 'Chop logs, then saw them into planks at the Sawmill.', done: 'Soon you’ll have a home that works for you. One trade remains — the arcane.' },
    { id: 'q_trade_rune', intro: 'Magic is fuelled by runes. Travel west to the Moonwell glade, mine the glowing rune essence there, then bind it into Air Runes at a Rune Altar. Carry runes and your spells strike harder.', accept: 'I’ll seek the essence.', active: 'In the fae glade: mine rune essence, then bind Air Runes at a Rune Altar.', done: 'The Weave answers you now. One last lesson — and it may make you rich.' },
    { id: 'q_trade_farm', intro: 'A trade you can own: the Farmstead, just west of the village. Visit it and grow a crop — buy seeds from Trader Pell, plant them in a garden plot, and harvest. Then buy the deed to raise livestock and hire farmhands who work it while you adventure.', accept: 'I’ll tend the land.', active: 'Visit the Farmstead and harvest three crops (plant seeds in a plot first).', done: 'You’ve learned every trade the Guild can teach. The rest, you’ll master in the doing. Go well, friend.' },
  ], 'You’ve graduated the Guild of Trades, master. Every workflow on the isles is yours now.'),
  saga_eira: sagaDialogue('Skald Eira', [
    { id: 'q_saga_f1', intro: 'I sing for a saga with no ending. My brother led an expedition into the snow and never came back. I have the verses as far as the Frost Cavern — but no further. Retrace their road: reach the cavern, thin the wolves that hunt it, and carry trout as they would have. Maybe the white will give up its secret.', accept: 'I’ll retrace their road.', active: 'The cavern is cold and the wolves are many. The saga waits for its next verse.', done: 'You reached the cavern and lived — further than my brother’s last verse. There is a trail, faint but there.' },
    { id: 'q_saga_f2', intro: 'Follow the cold trail. The expedition lit signal fires on Frostpeak; relight them with coal so I can read the way they went. And speak with Frostkeeper Nessa — she was the last to see them alive.', accept: 'I’ll relight the fires.', active: 'Frostpeak is dark, and Nessa has not yet told her tale.', done: 'The fires burn again, and Nessa wept as she spoke. She saw them taken — into the cavern, by something that wore a man’s shape. I know now how the saga ends.' },
    { id: 'q_saga_f3', intro: 'The Frost Warden in the cavern… is my brother. Frozen, hollowed by the ice into a thing that guards nothing. Free him. End the Warden, and bring me the last verse.', accept: 'I’ll give him peace.', active: 'The Warden — my brother — still stands in the ice.', done: 'It is done. He rests. Thank you, frostwalker, for finishing the saga I could not bear to. I will sing it true now — every verse, even this one.' },
  ], 'The Trials of Frost are sung to their end. The snows are quieter, and so is my heart.'),
  saga_sefu: sagaDialogue('Chronicler Sefu', [
    { id: 'q_saga_d1', intro: 'Every chronicler keeps one lie they cannot prove. Mine: that a city once stood where the dunes now roll, and the desert ate it whole. Search the Sunspire ruins for proof — clear the scorpions nesting there, and bring me iron from the red rock. That ore is older than any forge.', accept: 'I’ll search the ruins.', active: 'The ruins keep their secrets, and the scorpions keep the ruins.', done: 'This iron is worked — hammered by hands, ages gone. The city was real. And if the city was real… so is what they buried beneath it.' },
    { id: 'q_saga_d2', intro: 'They sealed something under the city before the sand took them. Reach the deep desert where the wards still hum, bring copper to read them by, and speak with Zara — the nomads kept the old warding-songs alive.', accept: 'I’ll find the seal.', active: 'The deep desert is far, and Zara’s songs are not freely given.', done: 'Zara sang me the warding-song, and now I understand its warning. The Sandwyrm is no beast — it is the city’s last guardian, and its seal is failing.' },
    { id: 'q_saga_d3', intro: 'The seal cannot be remade; the Sandwyrm has slept too long and woken wrong. Lay it to rest in the deep desert, and bring me what you find. The truth deserves a true ending.', accept: 'I’ll end its watch.', active: 'The Sandwyrm still coils around its ancient charge.', done: 'The Sandwyrm falls — and it guarded a tomb, not a hoard. I have the whole history now: not a monster slain, but a watchman relieved at last. This chronicle will outlive us both.' },
  ], 'The Buried Wyrm is written true. The desert will remember what the sand tried to forget.'),
  saga_itzel: sagaDialogue('Wayfarer Itzel', [
    { id: 'q_saga_j1', intro: 'My blood once ruled the Kytari, before the jungle swallowed our throne. I mean to find it. The Overgrown Ziggurat holds the old seat — but its guardians remain. Carve a path: reach the ziggurat, and cut down the serpents and panthers that keep it.', accept: 'Lead on.', active: 'The green is thick with fang and claw between us and the throne.', done: 'The path is open and the ziggurat stands as the songs described. But a throne is more than a seat — there is a crown to find first.' },
    { id: 'q_saga_j2', intro: 'The Old Crown’s light was hidden in the Glimmer Cavern when the jungle fell. Go there, scatter the glimmer-bats roosting in it, and counsel with Pathfinder Anouk — she has walked these ruins far longer than I.', accept: 'I’ll seek the crown.', active: 'The crown’s light still sleeps in the cavern, and Anouk has more to tell.', done: 'Anouk told me the truth I half-feared: the crown was never lost. It was given — to a guardian, to keep it from the unworthy. To Jorath.' },
    { id: 'q_saga_j3', intro: 'Jorath the Coiled wears my family’s crown — a man once, cursed into a serpent to guard it. There is only one way to learn if I am worthy. End him atop the ziggurat, and return to me.', accept: 'I’ll climb the throne.', active: 'Jorath still coils around the crown at the summit.', done: 'Jorath is slain, the curse lifted with him. The crown is mine to take… yet, seeing what guarding it cost him, perhaps some thrones are better left to the jungle. I have not decided. But the saga is yours, either way.' },
  ], 'The Coiled Throne is reclaimed — or released. The Kytari will sing your name for both.'),
  saga_ardith: sagaDialogue('Seer Ardith', [
    { id: 'q_saga_g1', intro: 'A shadow grows in the moonlight, hero, and I cannot yet name it. Climb the Moonspire where the veil is thin, scatter the wisps that cloud my sight, and gather moonlit herbs so I may scry true.', accept: 'I’ll climb the Moonspire.', active: 'The Moonspire is wreathed in wisps, and my sight is still clouded.', done: 'I have scried, and the omen is worse than I feared. It is not only the glade — the shadow reaches into the Highlands, where the storms answer it.' },
    { id: 'q_saga_g2', intro: 'Follow the omen to Thunderpeak Hold. Ground the storm harpies that herald the shadow, and rally Stormcaller Branok — we will need the mountain’s strength for what comes.', accept: 'I’ll rally the Highlands.', active: 'The harpies still wheel over the Hold, and Branok is not yet won.', done: 'Branok stands with us, and the harpies are grounded. Now I can speak the shadow’s name: the Hollow King. And I must tell you the terrible truth of him.' },
    { id: 'q_saga_g3', intro: 'Hear me before you go. The Hollow King was the glade’s own protector — he hollowed himself, gave up his very heart, to seal a deeper darkness beneath the Feywild. Banishing him may free what he chained. But left as he is, he will twist the whole glade to nightmare. He must be stopped. Banish him, and return to me.', accept: 'I’ll do what must be done.', active: 'The Hollow King still holds his court in the deep Feywild.', done: 'The Hollow King is banished, and the glade is clean — for now. But I felt something stir as he fell. I will keep watch over the seal he leaves behind. You may have saved us, or only bought us time. Either way, you were magnificent.' },
  ], 'The Hollow Crown is broken. I keep my vigil now — but the Fae will sing of you in the moonlight, always.'),

  // ===== Expansion III — Saltcrest + Amberfell NPCs =====
  harbormaster: dungeonChain('Harbourmaster Dell', {
    q1: 'q_harbor', n1: 5, foe1: 'marsh crabs', verb1: 'clatter across my piers', where1: 'They scuttle along the shoreline.',
    q2: 'q_galleon',
    intro1: 'Storm-season again, and the crabs have claimed my docks. Clear five off the piers and I’ll talk salvage with you.',
    accept1: 'I’ll clear the docks.',
    a1: 'Mind the claws — they’ve taken fingers off better folk than you.',
    done1: 'Hah! The piers are mine again. Here, you’ve earned it.',
    t1: 'Now — that wreck offshore. Something still captains it.',
    intro2: 'The Drowned Galleon runs aground each low tide, and its captain walks the deck. Mordrake. Put him under for good.',
    accept2: 'I’ll board the wreck.',
    a2: 'Low tide bares the hull to the east. Go armed, go hard, and don’t drink the bilge.',
    hint2: 'Mordrake holds the captain’s cabin. The wreck lies east of the harbour at low tide.',
    done2: 'Mordrake’s gone? Saltcrest will drink your name till dawn!',
    t2: 'Take the harbour’s thanks — and its purse.',
    outro: 'Calm seas, captain. There’s a berth here whenever you make port.',
    idle: 'Tide’s turning. Always is.',
    lore: 'Saltcrest was a free port once — too free. Mordrake’s crew sank a king’s galleon for its gold, and the sea took them all in a night. Trouble is, they never quite noticed they’d drowned.',
    loreAsk: 'What is the Drowned Galleon?',
  }),
  amberwarden: dungeonChain('Warden Rowan', {
    q1: 'q_amberhunt', n1: 5, foe1: 'blight wolves', verb1: 'prowl the groves', where1: 'They hunt beneath the amber canopy, south of the hall.',
    q2: 'q_barrow',
    intro1: 'The wolves came with the rot — eyes gone amber, tempers gone wild. Thin them for me. Five should break the pack.',
    accept1: 'I’ll thin the pack.',
    a1: 'They run the low woods south of the hall. Watch the treeline; they circle.',
    done1: 'The groves breathe easier. My thanks, wanderer.',
    t1: 'But the rot has a source — the old barrow, west of here. It woke.',
    intro2: 'In the Hollow Barrow stirs a Wight — a barrow-king the blight has crowned anew. Lay him back down.',
    accept2: 'I’ll enter the barrow.',
    a2: 'The mound lies west, ringed in dead stone. Bring light, and a strong arm.',
    hint2: 'The Barrow Wight holds the deepest chamber, west of Amberfell.',
    done2: 'The air is clean. You’ve done what three wardens before me could not.',
    t2: 'Amberfell owes you its autumn. Take this, with our gratitude.',
    outro: 'Walk easy under the amber leaves, friend.',
    idle: 'The leaves never green here — only burn brighter, then fall.',
    lore: 'Amberfell sits on graves far older than our hall. When the fae-blight seeped down, it found a king already dead — and gave him a reason to rise. We name him only the Wight now.',
    loreAsk: 'What is the Hollow Barrow?',
  }),
  saga_corsair: sagaDialogue('Old Corsair Sabine', [
    { id: 'q_saga_s1', intro: 'You’ve a sailor’s stance — good. My old crew scattered the night Mordrake drowned us. Search the Sunspire sands for any still breathing, and watch for brigands wearing our colours.', accept: 'I’ll find your crew.', active: 'The desert keeps its secrets, and brigands keep the rest.', done: 'Brigands in my crew’s own colours… so that’s where the cowards washed up. Sit. There’s more to this than salt.' },
    { id: 'q_saga_s2', intro: 'The Oracle on the Tide Isle saw Mordrake’s end once, in a tide-pool. Ask Nerida what she glimpsed — and bring pearls. The drowned are fond of them.', accept: 'I’ll seek the Oracle.', active: 'Nerida speaks in tides. Listen close, and gather your pearls.', done: 'So the sea itself wants him gone. Then we give the sea its wish — and soon.' },
    { id: 'q_saga_s3', intro: 'No more waiting. Board the Galleon at low tide and end Mordrake — for the crew, and for me. I’m too old for the climb, but my heart sails with you.', accept: 'It ends tonight.', active: 'Mordrake walks the captain’s cabin still. Send him down.', done: 'It’s done. They can rest now — and so, at last, can I. Take this; a pearl-diver gave it me a lifetime ago. It belongs with a captain.' },
  ], 'You gave my crew their grave and me my peace. Fair winds, captain — always.'),
  saga_amber: sagaDialogue('Loreseeker Wynn', [
    { id: 'q_saga_a1', intro: 'This amber rot is no ordinary blight — it thinks. Climb the Moonspire for moonlit herbs; under their light I can read the shape of the thing. Mind the blight wolves on the way.', accept: 'I’ll climb the Moonspire.', active: 'Moonlit herbs grow only on the Moonspire’s heights, where the veil is thin.', done: 'Fae-script — woven into the rot’s own veins. This was sent. Something willed the blight into being.' },
    { id: 'q_saga_a2', intro: 'The oldest wards against this rot lie frozen atop Frostpeak, far to the north — read them first. Then seek Oona of the Moonlit Glade, who owes the woods a debt. And bring coal — the wardfires must stay lit while you’re away.', accept: 'I’ll read the wards.', active: 'The frost-wards wait atop Frostpeak; Oona keeps to the glade; the wardfires hunger for coal.', done: 'A barrow-king, crowned by the blight to spread it root and branch. Of course. The dead make such willing gardeners.' },
    { id: 'q_saga_a3', intro: 'Cut the blight at its root — the Barrow Wight itself. End the crowned dead, and the amber rot withers with him.', accept: 'I’ll end the Wight.', active: 'The Wight holds the heart of the Hollow Barrow, west of here.', done: 'The leaves… look, they’re greening at the very tips. You’ve given Amberfell a spring it had forgotten. Take this charm — the woods wove it for you.' },
  ], 'The woods remember their healer. Rest beneath the amber leaves whenever the road wearies you.'),
  saga_lagoon: sagaDialogue('Diver-Captain Yara', [
    { id: 'q_saga_l1', intro: 'You hear it too, off the water? That’s no gull. Five of my divers walked into the reef smiling and never surfaced. Cull the reavers, bring me pearls to weight the dead, and lay eyes on the old coral arch — that’s where the song is loudest.', accept: 'I’ll quiet the reef.', active: 'Cull the reavers, gather pearls for the drowned, and stand beneath the Great Coral Arch where the song begins.', done: 'Pearls enough to sink a hundred dead… and you stood at the arch and lived. Good. Because the song called you by name out there, didn’t it. It does that.' },
    { id: 'q_saga_l2', intro: 'I have to tell you what I couldn’t tell the others. The clearest voice in that song — it’s my apprentice, Mira. I sent her down for the deep beds three moons gone. She came back as a *voice*. Find the siren that sings in her tone, silence it, bring me its scale. I have to know if anything of her is left.', accept: 'I’ll find Mira.', active: 'Silence a Lure-Siren, take a Siren Scale, and return to Yara with it.', done: 'This scale… it’s warm. It still remembers being a girl. The song doesn’t kill them — it *keeps* them. Maelys, the Sea-Witch, drowned first of us all and turned her own drowning into a lure. The great pearl at her throat is a stolen voice. Cut it loose and they go free.' },
    { id: 'q_saga_l3', intro: 'No more dirges. Take the grotto, take Maelys, and break the pearl at her throat. Free Mira and the rest — and if any part of the woman she was can hear me down there, tell her Yara’s sorry she ever sent the girl deep.', accept: 'The song ends today.', active: 'Maelys the Sea-Witch holds the Tide Grotto, north of Coralside. End her and shatter the songpearl.', done: 'The water’s gone quiet — truly quiet, for the first time in a season. I saw them surface at dawn, salt-skinned and *breathing*. Mira among them. You gave Coralside back its voices. This pearl’s yours now — let it only ever sing for you.' },
  ], 'Calm seas and a full net, diver. Coralside owes you its voices.'),
  saga_veyra: sagaDialogue('Lapidary Veyra', [
    { id: 'q_saga_sh1', intro: 'You hear it too, don’t you — the canyon humming? They call it the Bloom. It grows like coral and it sings, and where it sings, the living slow… and shine… and stop. I cut gems for forty years; I know stone that is only stone, and this is not that. Walk the canyon, break the skitters the Bloom sheds, and bring me raw shard-dust.', accept: 'I’ll bring you the dust.', active: 'The Bloom sings on, and I have no dust to read it by.', done: 'This dust… it is tuned. Every grain hums the same note, the way a choir holds one breath. The Bloom is learning a song — and I think I know the voice.' },
    { id: 'q_saga_sh2', intro: 'It takes the people now. The slow ones crust over standing up, then walk again as stonewards, eyes like quartz. The chime wardens ring the Bloom’s note to harden everything near. Free the thralls — a hard blow shatters the crust and lets them rest — break two wardens, and find Quarryman Toll at the dig. He touched the deep seam first, and he is hardening as we speak.', accept: 'I’ll free them, and find Toll.', active: 'The thralls still walk, the wardens still ring, and Toll is going to stone with his words unsaid.', done: 'Toll told you, then — that the deep seam sings a woman’s voice, a girl’s name. It is my daughter’s name. Lyse went into the geode nine winters past and never came out, and the Bloom has worn her voice ever since. I must tell you what I’ve done.' },
    { id: 'q_saga_sh3', intro: 'I fed it. There — said plain. I carried offerings into the geode gem by gem, because the Bloom sang in Lyse’s voice and I could not bear to silence the only sound of her left. At its heart sits Resona, the First Note — the seed-crystal that wears every voice it has swallowed, hers loudest of all. It is not Lyse. Crack the First Note and let the canyon fall silent.', accept: 'I’ll silence the First Note.', active: 'Resona sings at the heart of the geode, wearing a dead girl’s voice.', done: 'Quiet. Real quiet, for the first time in nine winters. You did what I could not — you loved her enough to let her be gone. Take this; I cut it from the First Note’s heart before it dimmed. A song you cannot let go of will hollow you out to keep singing.' },
  ], 'The canyon is silent and Prismhold breathes its own breath again. Walk easy, Note-breaker.'),
  quarryman: {
    root: (G) => {
      const st = G.quests.status('q_saga_sh2');
      if (st === 'active') return node('Quarryman Toll', 'Don’t — don’t look at my arm, it’s near solid now. Listen. I struck the deep seam first. It SANG up the pick into my teeth — a woman’s voice, soft as anything. Veyra’s girl, Lyse, that’s the name in the stone. But it don’t sing TO you. It sings you UNTIL you’re part of the chord. Tell Veyra it isn’t Lyse — it’s just hungry, and it learned to sound like love.', [end('I’ll tell her. Rest now.')]);
      if (st === 'complete' || G.quests.status('q_saga_sh3') !== 'locked') return node('Quarryman Toll', 'Most of me’s stone now, and it doesn’t hurt the way I feared. You silenced it? …Good. Then I’ll set down here by the dig and be a quiet rock — better company than I ever was warm.', [end('Rest, Toll.')]);
      return node('Quarryman Toll', 'Pick’s down. Can’t grip it any more. The canyon does the singing now.', [end('Take care.')]);
    },
  },
  saga_skyreach: sagaDialogue('Stormcaller Maelis', [
    { id: 'q_saga_sk1', intro: 'Feel that wind? It bites wrong this year, and has since spring. The sky-ward that crowns the Spire is cracking, and the storms come through the gaps like wolves through a broken fence. Climb the Aerie Spire, ground the rocs nesting in the loose stones, and bring me their gale cores. I must read what the wind is doing up there.', accept: 'I’ll climb the Spire.', active: 'The rocs still nest in the broken crown, and I cannot read the ward without their cores.', done: 'These cores… the wind in them is frantic, unmoored. The ward isn’t just weathered — something at its very heart is straining the whole working. And I think I know where its heart is kept.' },
    { id: 'q_saga_sk2', intro: 'The ward was never one stone — it was a ring, kept by the sky wardens out at the Stormcrown Eyrie, with the gale harriers wheeling guard. Get past the harriers, break the wardens at the mouth, and bring storm shards to anchor the runes while I work. Go armed; the wind out there will try to throw you off the ledges.', accept: 'I’ll reach the Eyrie.', active: 'The harriers still screen the gate, the wardens still hold the mouth, and I need storm shards to anchor the runes.', done: 'It’s anchored — barely. And now I have seen the heart of the ward with my own eyes, I can lie to you no longer. Sit. I owe you the truth before you take one more step.' },
    { id: 'q_saga_sk3', intro: 'No storm broke the ward. I did. A lifetime ago, when the wardens caged a dying roc-chick in the ward’s very heart to feed it their bound winds. I could not bear its crying, so I cracked one stone — just one — to set it free. It lived. It grew. It is the Stormcrown now, and every gale that batters Aerie Watch is its grief, looking for me. End it — I am too old and too guilty to climb. Then come back, whatever you find up there.', accept: 'I’ll end it — and judge you after.', active: 'The Stormcrown rages atop the Eyrie. Until it falls, the sky has no mercy in it.', done: 'It’s done, then. The wind… listen — it’s only wind again. I gave that creature a freedom that broke a town, and you gave it the peace I could not. Take this cloak; the wardens wove it from skyfeathers in the old days, and it should sit on braver shoulders than mine.' },
  ], 'The Broken Ward is mended and the truth is told. I keep the Spire now with a lighter heart — and the rocs, what few remain, no longer cry at night.'),
  saga_spore: sagaDialogue('Hesper the Listener', [
    { id: 'q_spore1', intro: "Don't — don't step on the soft ground, it remembers feet. I'm Hesper. Was a botanist. The vale's fungus is one creature, you understand — one mind wearing a thousand bodies — and lately my specimens get up and walk. Thin the walking ones and bring me sporecaps, fresh, still twitching. I need to know what it's growing toward.", accept: "I'll cull your specimens.", active: "The hosts wear the shapes of beasts but the hive holds the leash. Bring sporecaps while they're still soft.", done: "Still warm. Still… singing, a little. Put your ear close — no? Of course not. You hear nothing. Lucky." },
    { id: 'q_spore2', intro: "The drifting ones are its mouths. Kill enough and the chorus stutters — I can almost make out words in the gaps. Climb the Knoll and look down on the bloom; from above it makes a pattern, a script. And the ichor — bring the ichor. I have to taste it. Don't look at me like that; it's the only way to read it from the inside.", accept: "I'll silence the drifters.", active: "Drifters to the south and west; the Knoll to read the pattern; ichor for me. Three things. Three. I keep losing the count.", done: "Oh. Oh, it's not a disease, it's a conversation, and we've been so RUDE, slamming doors on it for centuries — it only wants to be heard, it only wants us to stop being so terribly, terribly alone. …Whose voice was that? Was that mine?" },
    { id: 'q_spore3', intro: "We have decided you should not go to the Heart. We have decided — no. NO. That's not — listen, friend, while I'm still the one saying 'friend': there's a fruiting body at the Mycelial Heart, the Chorus, the throat of the whole thing. Burn it. Don't mourn me. Come back after and see if there's a Hesper left to thank you.", accept: "I'll end the Chorus.", active: "The Chorus sits at the Heart, patient, and it grows back what you kill unless you cut the grove first. Hurry — I can feel myself going quiet.", done: "…You came back. I wasn't sure which of us would answer the door. The Heart's gone silent, and so is most of me. There's still a little Hesper in here, knocking around the empty rooms. Take these robes; the threads still know how to keep a person their own. Mostly." },
  ], "I keep a chair out for you. Some evenings I'm all here, and we talk of orchids. Some evenings the chair talks back. Visit anyway."),
  saga_calla: sagaDialogue('Pyrewarden Calla', [
    { id: 'q_saga_c1', intro: 'Off the ferry already? Most turn back at the smell — ash that never cooled, and a cult that means to relight it. I tend this dock and warn folk off the rock, but you’ve the look of someone the word “don’t” only sharpens. So: a cult squats on the dead caldera, chanting to wake what sleeps under it. Their obsidian sentinels watch the flats. Break that watch and bring me a shard of their work — I must be sure what they’re building.', accept: 'I’ll break their watch.', active: 'The sentinels don’t tire and don’t flee — that’s the trouble with stone. Crack them open; the shards will tell me what I dread to hear.', done: 'This shard… they’ve cut it to focus the rite, not just to fight. I hoped I was wrong. I’m not. The fire under us is being called, and it is beginning to listen.' },
    { id: 'q_saga_c2', intro: 'I’ll not lie to you, not now. I know how this shard is cut because I taught them the cut. I was their High Kindler. I wrote the rite that wakes the god — and I fled the night I felt it turn its eye back on me. What answers is not warmth. It is hunger. Go up: silence the chanters, put the ashen dead to rest — they were my flock once — and come back so I can read how far the rite has gone.', accept: 'Lead me up the caldera.', active: 'Every chant left unbroken brings the fire a verse closer. The revenants were people whose names I knew. Free them, and forgive me that I can’t do it myself.', done: 'It’s as far gone as it can be without the final kindling. One thing stands between the cult and the god: the vessel they’ve raised to hold it. They call it Pyraxis. Unkindled — for now.' },
    { id: 'q_saga_c3', intro: 'Hear the whole of it before you climb, for you’ve earned the truth. Pyraxis is the forge-titan I shaped to be the god’s body — obsidian without, fire learning to live within. Strike its shell and you’ll find magic cracks the cold stone best. But when it splits, the cult will feed it, and it will turn to fire and choke you blind — guard against the flame then, not the fist. And when it burns lowest it will rage, for it knows it is dying. That is your moment, or your grave. I should be the one to end it — my sin, my hand — but I would only slow you, and this must not fail. Go. End it. Then come find me at the dock, if I have the courage left to be found.', accept: 'I’ll unkindle your god.', active: 'Pyraxis stands in the Sanctum, half-awake. Magic to crack the shell; ward the flame when it splits; burn it down when it rages. There is no fourth verse.', done: 'You came back. I half-hoped you wouldn’t — that you’d let the sea have me too. It’s truly done? The caldera’s cold for good. I lit a fire meant to end the world, and a stranger off a ferry put it out. Take the Cinderveil — I carved it to channel the god. Let it channel something better in your hands.' },
  ], 'The fire under Cinderbreak is unkindled, and the woman who lit it keeps the dock now — turning the curious away, one ferry at a time. Some apostasies are just the long way back.'),
  // --- Expansion IV NPCs: greeting trees (quest-giving dialogue is layered on in the quest batch). Each auto-gains a "❖ Chat" branch from NPC_GOSSIP. ---
  tidewright_mira:  { root: node('Tidewright Mira', "Tide's on the turn — feel that? Stand still long enough and the water forgets you're here.", [end('Farewell.')]) },
  glowmoth_sefa: sagaDialogue('Glowmoth-Keeper Sefa', [
    { id: 'q_saga_dm1', intro: "My moths gutter and die the nearer I carry them to the Leviathan Arch, and Lanternwash dims a little more each year — on this coast, dark means GONE. Wade to the bones, cut the glimmer-leeches that fatten where the shore's black, and bring me tideglass for proof.", accept: "I'll find your thief.", active: "The light leaks out by the Arch. Cut the leeches, scoop the tideglass.", done: "Tideglass — with a maker's-mark I can't read, but it frightens me. Take it to someone who can." },
    { id: 'q_saga_dm2', intro: "That's the FOUNDERS' seal — carry it to Loremaster Vael at Hearth Village, far to the west. Render me six lantern-oil for the dead lamps while you're gone, and stand them by the Arch so Brannoc can listen to the bone.", accept: "I'll carry it to Vael.", active: "Vael knows the seal. Render the oil, relight the lamps, let Brannoc listen.", done: "An overdue tithe — the Founders bargained with the leviathan and we stopped paying. And it's SURFACING. There's one more thing you must do." },
    { id: 'q_saga_dm3', intro: "The light's being HOARDED — the Dreamward, left to mind the tithe, has gone rogue in the deep flats, swelling on our glow while the town dies. Follow the inhaling tide past safe ground and break it. Bring our light home.", accept: "I'll break the Dreamward.", active: "Past safe ground, where the tide pulls out wrong. Break the Dreamward.",
      done: "The Dreamward is broken — and every drop of light it hoarded is loose in your hands. But the leviathan still sleeps below, owed its tithe each age. Choose, friend: give the glow back to Lanternwash, or re-pledge it to the deep and keep the sleeper dreaming?",
      choices: [
        { label: "Give the light back to Lanternwash.", outcome: 'free', grant: { dreamlight_lantern: 1 }, say: "Lanternwash BLAZES — every lamp brimming, the moths roaring bright as noon. Sefa weeps and presses the dreamlight lantern into your hands." },
        { label: "Re-pledge the tithe to the sleeper.", outcome: 'keep', grant: { tidewardens_pact: 1 }, say: "You bind the glow back into the deep. The town stays dim — but the leviathan dreams on, unwoken, and Sefa names you Duskmere's new keeper." },
      ] },
  ], (G) => G.sagaChoices && G.sagaChoices.q_saga_dm3 === 'keep'
    ? "Dimmer than it was, aye — but the deep still sleeps, and a keeper walks the boards again. We endure, because you chose the long watch."
    : "The boardwalk's never been so bright; children chase the moths till midnight. You gave us back the dark's one enemy."),
  reefborn_brannoc: { root: node('Reefborn Brannoc', "You hear that under the wind? The Arch sings — the bone, not the gaps. It's dreaming, and the dream's getting louder.", [end('Farewell.')]) },
  auralis: questGiver('Skywarden Auralis', 'q_saga_au1', { greet: "The sky speaks again — and I have you to thank, though I'll thank you by warning you of the next storm.", intro: "Six nights the aurora has guttered grey and gone MUTE, and I have not misread an omen in forty winters. Climb the Skyfire Throne, scatter the frost-wraiths the dead sky emboldens, and chip me aurora-quartz to scry the silence — before Hoarfast loses its nerve.", accept: "I'll climb the Throne.", active: "The Throne, the wraiths, the quartz. Bring it before the town scatters.", done: "Aurora-quartz, still humming — and CLEARED; the silence has a shape now. Carry it to Thresk at the dig. The ice is his country, not mine." }),
  thresk: questGiver('Ice-warden Thresk', 'q_saga_au2', { greet: "Sky's the Skywarden's business. The ice is mine — and you walk it well now.", intro: "Auralis can read her 'safe sky' all she likes. My frost-iron crew climbed the third tunnel and never came back — the collapse too clean to be nature. Cut frost-iron to shore the dig, tunnel to my people, and put down whatever's drinking the sky and sealed them in.", accept: "I'll dig them out.", active: "Cut six frost-iron, reach the third tunnel, and kill the glacier-wight.", done: "My crew's out, gods be thanked, and the wight that sealed them is shattered rime — but the quartz Auralis read points DEEPER than any dig of mine. Go to old Vetr at the spire. Mad as he is, he's the only one who's heard what's below." }),
  vetr: questGiver('Vetr the Frostbound', 'q_saga_au3', { greet: (G) => G.sagaChoices && G.sagaChoices.q_saga_au3 === 'bind'
      ? "The Heart sleeps under my hand, and I keep its cold vigil. The sky stays a whisper — but Hoarfast stays warm. A fair trade, I think. You think so too, I hope."
      : "Hear that? The sky ROARS again over the Throne. You set it loose. Come listen with me on the cold nights — it remembers you.",
    intro: "The wight was only a guard. I've heard the true thief all along: the Heart of Hoarfrost, a frozen ember waking under the shelf, drinking the sky. They called me mad for listening. Descend below the dig, shatter it, free the aurora — then come tell me whose hands should hold what it leaves.", accept: "I'll shatter the Heart.", active: "Below the dig. Break the Heart of Hoarfrost and free the swallowed sky.",
    done: "The Heart cracks in your hands, every swallowed dawn screaming to get loose. But a thing that drinks the sky could WARM Hoarfast for an age, if it's kept and not killed. Shatter it and free the aurora — or bind it dormant, and let me keep its long cold vigil?",
    choices: [
      { label: "Shatter it — free the sky.", outcome: 'free', grant: { skyfire_quartz: 1 }, say: "The Heart bursts to light and the aurora ROARS back over the Throne, bright enough to read by from the valley floor. Vetr laughs for the first time in years and presses the thawed quartz on you." },
      { label: "Bind it — keep the Heart sleeping.", outcome: 'bind', grant: { hoarfrost_heart: 1 }, say: "You cool the Heart to stillness instead of breaking it. The aurora stays a whisper — but Hoarfast won't freeze this winter, and Vetr takes up its keeping with a strange peace." },
    ] }),
  glasswright: questGiver('Glasswright Ousha', 'q_cind1', { greet: "The shards sing one clean note again — you did that. Watch what the ground shows you, traveller, always.", intro: "Hold a shard to the light — hear it? Every piece of obsidian in this caldera screams the SAME held note now. Glass remembers what it cooled around, and something deep is making new glass, fast and screaming. Walk the rim, cut the glass-wisps bleeding off the fresh flows, and bring me flawed shards I can read.", accept: "I'll read the glass with you.", active: "Walk the rim, cut five glass-wisps, gather five obsidian tears.", done: "These hold a scream — and under it, a direction, pointing down and east toward the old sealed Throat. Tobren walks that ash. Take this to him; he'll know the safe path." }),
  cinderscout: questGiver('Last-Walker Tobren', 'q_cind2', { greet: "Path's still good to the Throat if you need it. Step where I've marked, and the ash keeps your name out of its mouth.", intro: "Ousha's right, and it scares me: the safe-stones are MOVING, the whole ash-field breathing. I've marked a path to the sealed Throat where the new glass wells up. Walk only my marks, cut the cinderglass-stalkers that rise off the heat, and bring back molten glass from the Throat itself.", accept: "I'll follow your marks.", active: "Follow the marks to the Throat, cut five cinderglass-stalkers, draw five molten glass.", done: "You reached the Throat and lived — more than my crew managed. This glass is still WARM, still singing. It's Dbenn you want now; he's been digging near the heart, and he knows more than he's saying. He always does." }),
  goldwarden: questGiver('Prospector Dbenn', 'q_cind3', { greet: (G) => G.sagaChoices && G.sagaChoices.q_cind3 === 'cool'
      ? "The caldera murmurs at night now — all those kept memories talking in their sleep. I don't dig the heart-vein anymore. Some things you leave dreaming."
      : "Quiet down there at last — dead-black glass, not a whisper in it. I sleep better, though some nights I wonder what we let go. You did right. I think.",
    intro: "I'll say it plain: that rich 'gold-vein' I tapped wasn't gold. It was a vein of the THING itself, and I woke it. The Glasswake is rising in the heart of the caldera, every memory it ever cooled around screaming at once. Descend to the heart and end it before the caldera sets like glass around us all — then we'll decide what becomes of what it holds.", accept: "I'll go down to the heart.", active: "Reach the caldera heart, break the Glasswake, then return to Dbenn.",
    done: "It's down — and cracked open, every memory it ever cooled around pouring out at once, screaming and beautiful and terrible. My hands woke it, but yours put it down, so the choice is yours: SHATTER it for good and end the screaming — or cool it slow and keep it dormant, every memory it holds preserved in the dark.",
    choices: [
      { label: "Shatter it — end the screaming.", outcome: 'shatter', grant: { glasswake_heart: 1 }, say: "You bring the Glasswake down in one ringing blow and the screaming STOPS — every trapped memory loosed to nothing, the caldera gone quiet and dead-black at last. Dbenn cuts you a heart of the cooled glass." },
      { label: "Cool it — keep the memories.", outcome: 'cool', grant: { whispering_glass: 1 }, say: "You cool the Glasswake slow instead of breaking it, and it settles into sleep — every memory it ever held preserved in the dark, whispering. Dbenn lifts a still-murmuring shard and presses it on you." },
    ] }),
  greywarden: questGiver('Greywarden Oslo', 'q_saga_sv3', { greet: (G) => G.sagaChoices && G.sagaChoices.q_saga_sv3 === 'defy'
      ? "I'm still here — gods help me, still here. The pact's broken and the edge wakes hungry, but we hold it with our own hands now, you and I. No more bargains. Walk slow; the watch never ends."
      : "The count closed at last, and Oslo with it. The Rest sleeps easy because a stranger stood the edge when its warden couldn't. Walk slow, friend — you've earned the slow walk.",
    intro: "You know the truth now, so I'll not soften it. My blood's debt has come due. The abyss has sent a Reckoner up the cliff, and tonight the count reaches zero — I mean to walk into the void and pay my ancestor's price myself. Break the Reckoner at the lip first. Then stand with me, and we'll decide how this closes.", accept: "I'll stand the edge with you.", active: "Reach the lip of the world, break the Reckoner, then stand with Oslo.",
    done: "The Reckoner's broken — but the debt it came to collect is still owed, and the count still reaches zero tonight. I can walk into the void and pay my ancestor's price myself, and close it forever. Or you and I break the pact outright and hold this edge with no bargain at all — harder, hungrier, but mine to choose. It's your call, friend. I'm too tired to make it.",
    choices: [
      { label: "Let Oslo pay the debt.", outcome: 'pay', grant: { voidwarden_cloak: 1 }, say: "Oslo steps off the lip into the dark, calm as dusk, and the count finally CLOSES. The Rest will sleep easy for the first time in generations. They keep his cloak as an empty honour — and press it on you." },
      { label: "Break the pact — hold the edge.", outcome: 'defy', grant: { edgewardens_seal: 1 }, say: "You and Oslo sever the old bargain at its root. He LIVES — but the edge wakes hungry with no debt to bind it, and you take the first watch yourself. The seal of that vow is yours." },
    ] }),
  wispbinder: questGiver('Marrow the Wisp-binder', 'q_saga_sv1', { greet: "The Sentinel's quiet now. Whatever you did at the lip, the name stopped its looping.", intro: "I've bound a wisp that speaks ONE name on a loop — and it matches the blank-worn name on the oldest grave here, the same lone wisp Oslo's dusk count keeps losing over the rope-line. His tally's ticking toward zero. Walk the Rest, push back the shades at the edge, and gather me amethyst-wisps to bind a sentinel that can ASK the void who that warden was.", accept: "I'll gather your wisps.", active: "Walk the Rest, cut the shade-stalkers, gather four amethyst-wisps.", done: "Four wisps — and the bound sentinel SPOKE the blank-grave name aloud. I daren't say whose it is. Take it to Tace at the relic-stall; she keeps the truer roll, and she'll know." }),
  relictrader: questGiver('Tace Greypalm', 'q_saga_sv2', { greet: "I keep a shorter list than Oslo. You're on the longer one now — the living one. Mind it stays that way.", intro: "I keep a truer roll than the warden-captain admits. That blank grave is the FIRST Greywarden — Oslo's own ancestor — who cut the pact to hold the edge, and the 'count' covers a soul-debt the abyss is owed. Climb the forbidden Sentinel, cut the edgewraiths that rise to stop you, and bring me the name.", accept: "I'll climb it.", active: "Climb the Petrified Sentinel, kill the edgewraiths, then bring me the name.", done: "So. The first Greywarden, Oslo's own blood, who cut the pact and was scrubbed from every stone. The debt was never paid — only deferred, and the count's nearly zero. Oslo has to hear this from you. Gods help him." }),
  salma_brinewright: sagaDialogue('Salma Tidewright', [
    { id: 'q_mire_pink1', intro: "The deep pans bleed a brine-silver vein now, rich enough to buy the frontier — and I've caught Salt-Baron Bittersong buying every drying-claim before my harvesters know what they rake. Worse: the Mirror Causeway shows the wrong stars, and a harvester poled out there and never came back. Rake the silver, walk the causeway, and ask Wrenn whose claims have changed hands.", accept: "I'll look into it.", active: "Rake five brine-silver, cross to the wrong-star stretch of the Causeway, and find Wrenn.", done: "So Bittersong's nearly bought us all out — and the wrong reflection isn't a ghost. The missing harvester is ALIVE, stranded on a mirror-island the causeway only pretends to reflect. We're not leaving them out there." },
    { id: 'q_mire_pink2', intro: "Pole out across the wrong reflection, break the salt-wraiths crusting the lost island, free the harvester — then confront Bittersong on his barge with the silver proven. Decide who owns Rosbrine's pink.", accept: "I'll bring them home.", active: "Break the salt-wraiths, reach the mirror-island and free the harvester, then face Bittersong.",
      done: "The harvester's HOME and the silver vein's proven — and now Bittersong's on his barge, a buy-out contract in one hand and a partnership in the other. Break his quiet empire and keep the pink for the brinewrights? Or take his deal — a baron's cut, and peace on the pans?",
      choices: [
        { label: "Break him — the pink stays ours.", outcome: 'brinewrights', grant: { mirrorsalt_ring: 1 }, say: "You lay the living witness and the proven vein on the table, and Bittersong's quiet empire FOLDS. The pink stays the harvesters'. Salma presses a rose-salt ring into your hand." },
        { label: "Take the Baron's deal.", outcome: 'baron', grant: { salt_barons_signet: 1 }, say: "You broker the deal — the vein shared, the pans at peace, a baron's cut for a baron's silence. Some of the old rakers won't meet your eye, but no one goes hungry, and Cael seals you his signet as a partner." },
      ] },
  ], (G) => G.sagaChoices && G.sagaChoices.q_mire_pink2 === 'baron'
    ? "The pans run smooth and the ledgers balance, Cael's way. Some of the old rakers still won't meet my eye — but Rosbrine eats, and that's more than pride buys."
    : "Rosbrine rakes its own silver now, and no baron owns the pink. Salma feeds the flatfish at dusk and calls you friend."),
  bittersong_baron: { root: node('Cael Bittersong', "Welcome, welcome — a face the mirror hasn't kept yet! Rare thing this far south. Sing while you rake; the work goes sweeter.", [end('Farewell.')]) },
  wrenn_mirrorwalk: { root: node('Wrenn Mirrorwalk', "Stick to the planks I marked — step off and the pretty pink mud'll swallow a boot, then a leg. Folk pay me to cross the mirror.", [end('Farewell.')]) },
};

// Trader Pell's shop: fixed stock to buy, and sell prices for materials.
export const SHOP = {
  stock: [
    { key: 'potion', price: 25 },
    { key: 'cooked_trout', price: 9 },
    { key: 'oak_bow', price: 60 },
    { key: 'apprentice_staff', price: 70 },
    { key: 'leather_armor', price: 45 },
    { key: 'seeds', price: 5 },
    { key: 'carrot_seed', price: 8 }, { key: 'potato_seed', price: 14 }, { key: 'corn_seed', price: 22 }, { key: 'pumpkin_seed', price: 40 },
    { key: 'herb', price: 9 },
    { key: 'bronze_bar', price: 16 },
    { key: 'iron_bar', price: 34 },
    // big gear round — buyable progression with distinct looks
    { key: 'bronze_mace', price: 80 }, { key: 'bronze_scimitar', price: 90 }, { key: 'oak_crossbow', price: 110 }, { key: 'novice_wand', price: 100 },
    { key: 'studded_leather', price: 90 }, { key: 'bronze_platebody', price: 140 }, { key: 'bronze_kiteshield', price: 90 },
    { key: 'iron_warhammer', price: 340 }, { key: 'iron_halberd', price: 320 }, { key: 'steel_rapier', price: 520 }, { key: 'hunters_crossbow', price: 480 }, { key: 'acolyte_grimoire', price: 480 },
    { key: 'scout_leather', price: 280 }, { key: 'chain_hauberk', price: 360 }, { key: 'tower_shield', price: 380 },
  ],
  sell: {
    wood: 3, berry: 2, herb: 6, pelt: 8, meat: 5, copper_ore: 6, iron_ore: 11, coal: 5, mithril_ore: 30, mithril_bar: 70, mithril_sword: 130, mithril_armor: 150, mithril_shield: 120,
    raw_shrimp: 3, raw_trout: 6, cooked_shrimp: 5, cooked_trout: 9, bronze_bar: 14, iron_bar: 28, relic: 600,
    bronze_sword: 20, iron_sword: 45, steel_sword: 80, oak_bow: 30, yew_bow: 70,
    apprentice_staff: 35, ember_staff: 80, leather_armor: 20, iron_armor: 55, steel_armor: 95,
    bones: 2, seeds: 2, crop: 4, cooked_greens: 10, strong_potion: 20,
    bone_shard: 10, goblin_tooth: 8, crystal_shard: 14, magma_core: 16, pearl: 22,
    wraithblade: 130, stormstring_bow: 110, prism_staff: 135, cinderforge_axe: 150, tidecaller_trident: 180,
    vine_coil: 12, demon_ash: 16, storm_shard: 18, fae_dust: 20,
    coilfang_spear: 150, ashbringer: 200, tempest_bow: 140, faewild_staff: 170,
    bronze_dagger: 12, wooden_shield: 12, iron_shield: 45, steel_shield: 80,
    barnacle_plate: 18, grave_iron: 18, corsair_cutlass: 120, mariner_plate: 90, barnacle_shield: 70, barrow_blade: 110, grave_plate: 100, wight_crown: 160,
    // Expansion gathering catches — fish, logs, ores/bars, crops.
    raw_sardine: 8, cooked_sardine: 12, raw_herring: 11, cooked_herring: 16, raw_bass: 16, cooked_bass: 22, raw_salmon: 22, cooked_salmon: 30,
    raw_pike: 28, cooked_pike: 36, raw_tuna: 40, cooked_tuna: 52, raw_lobster: 55, cooked_lobster: 70, raw_swordfish: 75, cooked_swordfish: 95,
    raw_shark: 110, cooked_shark: 140, raw_anglerfish: 150, cooked_anglerfish: 190,
    oak_log: 12, willow_log: 28, maple_log: 55, yew_log: 110, magic_log: 220,
    silver_ore: 18, silver_bar: 42, gold_ore: 45, gold_bar: 100, adamant_ore: 90, adamant_bar: 200, runite_ore: 220, runite_bar: 480,
    mushroom: 7, nectar: 12, carrot: 5, potato: 6, baked_potato: 14, corn: 9, pumpkin: 22,
    honey: 10, beeswax: 14, wax_candle: 42,
    // Smithable / fletchable / craftable gear
    adamant_sword: 260, adamant_armor: 320, adamant_shield: 260, runite_sword: 560, runite_armor: 680, runite_shield: 560,
    oak_longbow: 40, willow_bow: 75, maple_bow: 130, yew_longbow: 240, magic_bow: 430,
    silver_ring: 55, silver_amulet: 90, gold_ring: 160, gold_amulet: 230,
  },
};

// Starter classes — chosen on a new game; each grants a loadout.
export const CLASSES = [
  { key: 'warrior', name: 'Warrior', icon: '⚔️', desc: 'Sword & shield — sturdy frontline melee.', grant: { weapon: 'bronze_sword', shield: 'wooden_shield', armor: 'leather_armor', items: { potion: 2, gold: 40 } } },
  { key: 'archer',  name: 'Archer',  icon: '🏹', desc: 'Oak bow — strike foes from afar.',         grant: { weapon: 'oak_bow', armor: 'leather_armor', items: { potion: 2, gold: 40 } } },
  { key: 'mage',    name: 'Mage',    icon: '🪄', desc: 'Apprentice staff — hurl arcane bolts.',     grant: { weapon: 'apprentice_staff', armor: 'leather_armor', items: { potion: 2, gold: 40 } } },
  { key: 'rogue',   name: 'Rogue',   icon: '🗡️', desc: 'Bronze dagger — fast, nimble strikes.',     grant: { weapon: 'bronze_dagger', armor: 'leather_armor', items: { potion: 3, gold: 60 } } },
];

// ===== Economy (opt-in): work jobs for quick coin, or found businesses that earn
// passively (even while away) and hire employees to grow them. =====
// Owned via the Merchants' Guild (ledger station); jobs via the Job Board.
export const BUSINESSES = [
  { key: 'shop',      name: 'General Store',  icon: '🛒', desc: 'A storefront that earns coin while you adventure.',  foundCost: 450, base: 6,  empName: 'Shop Clerk', empIcon: '🧑‍💼', empBase: 180, empBoost: 4,   wage: 1, maxEmp: 4 },
  { key: 'farm',      name: 'Farmstead',      icon: '🌾', desc: 'Fields that yield a steady harvest of coin.',        foundCost: 350, base: 5,  empName: 'Farmhand',   empIcon: '🧑‍🌾', empBase: 150, empBoost: 3.5, wage: 1, maxEmp: 5 },
  { key: 'tradepost', name: 'Trading Post',   icon: '🐪', desc: 'Caravans trade afar and bring back profit.',          foundCost: 800, base: 9,  empName: 'Trader',     empIcon: '🧳', empBase: 300, empBoost: 6,   wage: 2, maxEmp: 4 },
  { key: 'tavernbiz', name: 'Tavern',         icon: '🍺', desc: 'Your own alehouse — barkeeps pour while you roam.',   foundCost: 600, base: 7,  empName: 'Barkeep',    empIcon: '🍻', empBase: 220, empBoost: 5,   wage: 2, maxEmp: 4 },
];
// Active work shifts (a timed shift pays coin + skill xp on the spot).
export const JOBS = [
  { key: 'bar',   name: 'Tend the Tavern Bar', icon: '🍺', skill: 'cooking',  anim: 'forage', dur: 6, pay: 18, xp: 40 },
  { key: 'dock',  name: 'Work the Docks',      icon: '🎣', skill: 'fishing',  anim: 'fish',   dur: 6, pay: 16, xp: 38 },
  { key: 'forge', name: 'Hammer at the Forge', icon: '🔨', skill: 'smithing', anim: 'mine',   dur: 7, pay: 22, xp: 48 },
  { key: 'field', name: 'Work the Fields',     icon: '🌱', skill: 'farming',  anim: 'forage', dur: 6, pay: 15, xp: 36 },
  { key: 'watch', name: 'Stand the Town Watch', icon: '🛡️', skill: 'defence', anim: 'chop',  dur: 7, pay: 20, xp: 42 },
];

// Tavern Keeper's drink/food menu, and idle rumours patrons murmur when chatted to.
export const TAVERN = [
  { key: 'ale', price: 6 },
  { key: 'spiced_mead', price: 10 },
  { key: 'hearty_stew', price: 16 },
  { key: 'traveler_coffee', price: 5 },
];
export const PATRON_LINES = [
  'Heard the Sandwyrm’s no monster at all — a guardian, they say.',
  'They say the Hollow King gave up his own heart to seal something worse. Brrr.',
  'The Frost Warden took a whole expedition years back. Eira still sings of it.',
  'Mind the dungeon spires — that gap in the ring is the only way in.',
  'Crystal Hollow gems hum if you hold one to your ear. Or so the lapidary swears.',
  'Loremaster Vael’s always on about some old Pact. Bought me an ale once, mind.',
  'A keeper of the isle, eh? You’ve the look of one. Mind the boars.',
  'Best stew on the isles, this. Don’t go telling the cook I said “only”.',
];

// Per-NPC personality: short, in-character ambient one-liners overheard near each NPC (time-of-day aware).
// day/night chosen by the world clock; `any` lines fold into both. Kept short for the on-head speech bubble.
export const NPC_VOICE = {
  elder: { day: ["The tides turn slow, and that is enough.", "The hearth burns bright when hearts do honest work.", "Listen well — the isle remembers what we do.", "Tend the land, and the land tends you."], night: ["The fire flickers low tonight.", "Old bones ache when the dusk comes on.", "Listen to the wind — it carries old stories.", "Sleep well, keeper. The isle is quiet."], any: ["Home is not a place you are given — it is a place you keep."] },
  ranger: { day: ["The boars run thick in the wood today.", "Blade stays keen, body stays sharp.", "Wood's quiet. Too quiet, maybe.", "Always listen to the trees."], night: ["Eyes sharp at dusk — that's when they hunt.", "Fire's friend to a night warden.", "Can't sleep when the forest breathes wrong.", "Shadows have teeth out here."], any: ["I don't hunt sport — I hunt sense.", "The wild doesn't lie if you listen close."] },
  merchant: { day: ["A fair price builds a fair life.", "Coin flows like water — catch it while it runs.", "Every hand that leaves empty comes back full, aye?", "Wares, wonders, and a fair deal."], night: ["Stock's counted, coin's locked.", "Never sleep too deep when you keep a stall.", "The night brings strange customers, it does.", "Ledgers and lamplight — a merchant's lullaby."], any: ["A good deal is worth its weight in friendship."] },
  slayer: { day: ["Beasts don't rest — neither do the blades on them.", "A fresh contract, a sharp edge, a clear mind.", "Points mount when bones don't.", "Another beast falls, another story walks away."], night: ["Dark brings the hunters out. Be one.", "Contracts don't sleep, and neither do I.", "The night pays well for those with steel.", "Sharpen your steel. Rest when you're dead."], any: ["There's honor in a finished contract."] },
  gravekeeper: { day: ["The dead keep better than the living, mostly.", "Fresh flowers on the old stones today.", "Mind the catacombs — not all that rests, stays.", "Every name here, I remember."], night: ["The graves whisper after dark. Habit, I think.", "Lantern's low. The dead don't mind.", "Something walks the rows at night. I let it.", "Quiet work, grave-keeping. I prefer it."], any: ["I bury the dead so they stay buried.", "Bonelord's quiet now — a hero saw to that."] },
  vael: { day: ["The Pact watches — does it find you worthy?", "Green was bargained for. Green is kept.", "The old verses fade unless we tend them.", "History is not past — it breathes in us still."], night: ["The shrine sleeps, but its fire still sings.", "When the world stills, the Pact speaks loudest.", "Some truths are too heavy for daylight.", "The burden of keeping sharpens after dusk."], any: ["The Founders struck no light bargain with this isle.", "Ruin comes when the old words are forgotten."] },
  guildmaster: { day: ["A master walks many trades before choosing one.", "The Guild teaches that hunger is a poor apprentice.", "Hands that won't try learn nothing at all.", "The hands learn what words cannot teach."], night: ["Tired hands make tired mistakes.", "A trader reads ledgers by candlelight.", "The night shift brings the thorough workers.", "Sleep is the best tool for tomorrow."], any: ["The six trades weave a life here on the isles.", "Master the work, and the work will keep you."] },
  warden: { day: ["The granaries won't guard themselves.", "Quiet days don't come cheap. You earn them.", "A spear and a stare — that's a warden's lot.", "Fields were meant for grain, not goblin blood."], night: ["Nights are long when you're the only watch.", "Can't rest — Gronk moves under the moon.", "Darkness holds more goblins than sense.", "A warden's post is cold when night comes on."], any: ["I'm not much of a militia, just the last of one."] },
  miner: { day: ["Tap the dark ore, steady rhythm.", "That forge needs feedin' constant.", "Coal's the grey-black, iron's the rest.", "The pick finds what it finds.", "Honest work keeps a man's back straight."], night: ["Rocks don't give up easy in the dark.", "Furnace glow beats lantern light.", "Tired bones, good day's haul.", "An old miner's dreams run to ore."], any: ["Coin's good, but sweat's better.", "The pick swings itself once you've the knack."] },
  smith: { day: ["Three bars, cleanly cast, or no deal.", "Steel waits for no one's fancy.", "The anvil knows honest work.", "A finer blade, or you're not ready."], night: ["The forge cools, but the work stays.", "Steel dreams hotter than the day.", "Anvil rings echo in sleep still.", "Embers fade. The real test waits."], any: ["Proof is in the steel, not words."] },
  emberwright: { day: ["The Depths run cool. The forge runs hot.", "The forge breathes again, breathing back.", "Magma cores — pretty, useless if ash.", "The mountain woke when we should've slept."], night: ["The heat rises whether I work or not.", "Molten dreams. Wake in a cold sweat.", "Something vast still stirs below.", "The depths don't tire like I do."], any: ["Vol keeps the forge. The forge keeps Vol.", "You don't work fire. Fire works through you."] },
  fisher: { day: ["Trout run thick when the sun's high.", "Water tells you when to cast.", "Tight lines and a steady hand.", "The shore gives what it gives."], night: ["Fish don't sleep, neither do I some nights.", "Quiet water, quiet thoughts.", "Stars guide the deep ones up to feed.", "Night catches taste different. Sweeter."], any: ["Tight lines, friend.", "The trout remember. They come back."] },
  cinderwarden: { day: ["Ash hounds hunt. We hunt back.", "The wastes burn what they touch.", "Coin from the embers, friend.", "Ashlord's shadow gets long by noon."], night: ["Hounds howl hotter after dark.", "The Ashlord broods when we sleep.", "Scorched earth cools slow, burns again fast.", "A warden never truly rests."], any: ["The wastes judge by fire, nothing else.", "I'm still standing. That's victory enough."] },
  frostkeeper: { day: ["The cold bites the still.", "Ice spires ring like bells in the wind.", "Keep moving — warmth waits nowhere here.", "The frost remembers every name."], night: ["The howling carries. Stay close to fire.", "Darkness eats sound this far north.", "Long watches. Longer winters.", "Sleep light. The cold never rests."], any: ["I've stood this watch fifteen winters.", "Best make your peace with frost early."] },
  eira: { day: ["The saga writes itself. In blood, not ink.", "His verse ends in that cavern still.", "You can hear the cold sing his name.", "Every breath turns to ghosts up here."], night: ["I dream the verses I cannot speak.", "The white carries voices at dark.", "He walks the frost trails still, I swear it.", "Silence is the worst verse."], any: ["A skald who lost the final stanza.", "Some sagas end in ice."] },
  lapidary: { day: ["Fresh gem sings if you hold it right.", "The hollow glitters somewhere down there.", "Every facet tells a different truth.", "Listen — it hums back at you."], night: ["The gems glow at night. Is that normal?", "I heard the hollow singing from the west.", "The stone dreams. I hear it dreams.", "Sleep poorly when they ring overhead."], any: ["A lapidary cuts stone. Stone cuts back.", "The hollow is alive, not mined."] },
  amberwarden: { day: ["The leaves burn brighter before they fall.", "Blight eyes that watch from the dark.", "The groves don't grey — just burn to ash.", "Wolves with amber in their teeth."], night: ["The rot spreads when the sun quits.", "Amber glow means something woke.", "Old barrows don't stay closed forever.", "The dead remember Amberfell."], any: ["The leaves never green here. Only burn.", "Three wardens before me. None of us stopped it."] },
  loreseeker: { day: ["The herb-script shows a will behind it all.", "Fae-rot doesn't spread — it's planted.", "The woods are writing something. In amber.", "Every wolf that hunts carries fae-mark."], night: ["The herbs glow wrong at dark.", "I hear chanting in the rot sometimes.", "The barrow stirs when the moon rises.", "I'm running out of herbs to read."], any: ["The oldest wards are northern — they're watching.", "Amberfell's on a grave. A deep one."] },
  pyrewarden: { day: ["The ferry runs. Folk still take it.", "The caldera breathes if you stand still.", "I don't warn folk away. Not anymore.", "The dock is a quiet place to wait."], night: ["The mountain dreams of fire.", "I can feel it turning in the dark.", "Some debts don't sleep.", "I should not be standing here."], any: ["I lit a fire meant to end the world.", "Forgetting is a mercy I don't deserve."] },
  nomad: { day: ["The oasis runs shallow this season.", "Scorpions are thirsty when the dunes burn.", "Fair water. Fair price.", "Tents don't last out here — only will does."], night: ["Stars lie about distances.", "Sand still warm from yesterday's heat.", "Sleep light. Always.", "The dunes shift after dark."], any: ["I know where these sands swallow people.", "The Pact doesn't work the same out here."] },
  sefu: { day: ["The sand remembers what we forget.", "Every ruin tells a story if you dig deep.", "This chronicle won't write itself.", "The city was real. I taste it in the iron."], night: ["Old stories keep me awake.", "The desert dreams in layers.", "Some truths are sharper after dark.", "Writing by starlight — the words come clearer."], any: ["I collect truths the way others collect coin.", "The buried things are never truly buried."] },
  oracle: { day: ["The tides remember who I am.", "Water shapes stone; time shapes water.", "The temple speaks if you listen with salt.", "The Drowned King still keeps his watch."], night: ["The moon drowns and rises again.", "The temple breathes slower at night.", "The waters are patient. Older than the isles.", "Pray the seal holds one more day."], any: ["I read the tides as others read books.", "The sea has debts it always collects."] },
  pathfinder: { day: ["The green is thicker this season.", "The ziggurat's moved half a mile since spring.", "Mark the stones — the paths don't stay marked.", "The jungle keeps score."], night: ["The green breathes different after dark.", "Jaguar sounds carry farther when tired.", "The ziggurat hums louder at night.", "Sleep with one ear on the vines."], any: ["I've mapped more miles than I've lived days.", "The jungle's law is Jorath's law."] },
  itzel: { day: ["The throne calls what's left of my line.", "The crown was never truly ours to keep.", "Jorath guards what I must claim.", "My blood remembers the songs."], night: ["Thrones cast long shadows at night.", "The crown hums in the dark — do you hear it?", "Lineage echoes even in sleep.", "The serpent dreams of what he was."], any: ["Some thrones are better left to the jungle.", "Worthy is a heavier word than king."] },
  harbormaster: { day: ["Anchor line's fraying again.", "That tide took three fingers last season.", "Ships come in; ships go out. Repeat.", "The gulls know storms before we do."], night: ["Wreck season comes with the dark.", "Fog hides what the tide takes.", "Can't see the shoals at night.", "Even the crabs sleep less in storm-season."], any: ["The sea keeps what it's owed.", "There's always work waiting at the pier."] },
  corsair: { day: ["Crew scattered like kelp on the tide.", "Used to be faster, before bones ached.", "A ship without a crew is a tomb with sails.", "Fair winds mean cursed luck coming."], night: ["Mordrake's still laughing somewhere below.", "Mast creaks sound like voices calling up.", "Can't outrun what's already drowned.", "The dark waters remember every captain."], any: ["I've lost everything worth keeping to the sea.", "That horizon's still got teeth, friend."] },
  tidecaptain: { day: ["The reef's gone quiet — that means it's listening.", "Pearls are just tears the deep makes of us.", "A silent dive is one where death is patient.", "Mira still sings, even in my dreams."], night: ["Can't sleep without hearing the song again.", "The dark water remembers everything it drowns.", "Voices carry farther when the sun goes down.", "The grotto calls — even to ears that know better."], any: ["The deep has a long memory and no mercy.", "There's a price for every pearl you find."] },
  skyfalconer: { day: ["The Spire's holding, for now.", "Rocs cry less when the wind is kind.", "A cracked ward bleeds weather like a wound.", "Wind speaks if you listen long enough."], night: ["Storm-clouds gather with a will of their own.", "The Stormcrown rages somewhere above us.", "Can't sleep — the wind keeps asking why.", "I hear the roc-chick crying still, most nights."], any: ["The wind knows what I did.", "A ward's only strong as the one who tends it."] },
  druid: { day: ["The grove knows your footfall.", "Moss remembers what stone forgets.", "Even thorns serve the green.", "A sapling learns what an oak already knows."], night: ["The dark feeds the roots.", "Listen... the trees are oldest.", "The night does not hunger here.", "All green sleeps in the same shadow."], any: ["Wolf or weed, both feed the land.", "I've tended this grove since the first scar was bark."] },
  veyra: { day: ["Every shard sings if you know how to listen.", "Nine winters I heard her voice.", "Cut too deep and the whole piece shatters.", "Stone remembers. It always remembers."], night: ["In the dark, all stones sound the same.", "Do you hear it? That humming in the canyon?", "Some songs should never be learned.", "The heart of the Bloom sits still as grief."], any: ["I cut gems forty years without knowing their cost.", "Lyse. Her name is Lyse. Was."] },
  quarryman: { day: ["Pick's good steel. Stone's older.", "The deep seam sings. I was wrong about that.", "Work's honest even when it kills you.", "The canyon did what the canyon does."], night: ["Can't feel my fingers now. Is that better?", "The stone's warm. I didn't expect that.", "Arm won't bend, but I can listen.", "I'll be good company for the rocks."], any: ["I struck first. I opened the seam.", "Better to be stone than to be haunted."] },
  stormcaller: { day: ["The storm's a beast with a long memory.", "My grandmother could bind thunder itself.", "The Hold answers to those who stand tall.", "Thruun was kin. Is kin. Still is."], night: ["The thunder sounds angry this year.", "At night you can hear what the storms say.", "The wind knows you. It tastes you.", "Sleep if you can. The peaks don't."], any: ["Stormcaller isn't a title — it's a weight.", "We answer to the weather, never it to us."] },
  sporehermit: { day: ["Don't step on the soft ground. It remembers feet.", "I was a botanist. Still am. Sometimes am.", "The specimens talk back now. Is that good?", "The hive doesn't mean harm. It means communion."], night: ["Most evenings I'm mostly just me. Not tonight.", "Listen to the bloom at night. It teaches.", "Whose voice? Which mind? Does it matter?", "Some nights the chair talks before I sit."], any: ["It learns our words the moment we think them.", "The fungus only wants to be heard."] },
  faewarden: { day: ["The glade forgives what the Hollow King couldn't.", "I've tended longer than kingdoms have stood.", "Moonflowers know when they're loved.", "Thorns are just flowers defending themselves."], night: ["In moonlight, all debts look the same.", "The glade sings softest when the veil thins.", "Something still sleeps beneath. Guard the silence.", "Mercy and murder wear the same face here."], any: ["The blood matters less than the choosing.", "I loved him. Love him. Fae grammar is complicated."] },
  ardith: { day: ["A shadow grows where light used to be certain.", "The omen spreads like water. Or like reaching.", "The veil thins when you're not watching it.", "Moonspire sees what the valleys cannot."], night: ["The scrying never stops. Even in sleep, I see.", "Wisps cloud more than sight. They cloud choice.", "The shadow moves at night. It moves always.", "I watch. That's all I do now. Just watch."], any: ["A seer speaks of what will be, rarely stops it.", "The worst omens are the ones you see coming."] },
  // --- Expansion IV voices ---
  tidewright_mira:  { day: ["Wade slow, let the light come to you. Everything worth catching comes to the patient.", "Mind where the reflection's deepest — the sky's underfoot as much as overhead.", "The flats hold their breath, then let go."], night: ["Lanterns doubled on the water — that's two villages now, ours and the one beneath.", "Low tide at midnight. The Arch shows its full skeleton in the wet sand."] },
  glowmoth_sefa:    { day: ["Every lantern in Lanternwash is alive. Break the chain and we all go out.", "A pearl's just cold light. My moths are warm.", "Feed the reeds, the reeds feed the glow, the glow keeps the dark off."], night: ["This is the hour they sing — too high to hear, but you feel it in your teeth.", "One went dark tonight. A keeper buries her dead in the dark she fought."] },
  reefborn_brannoc: { day: ["I pressed my ear to the third rib and felt a heartbeat. One beat a tide.", "The tide-silver isn't ore — it's the leviathan's blood gone to metal.", "Nothing this big dies. It just goes deep."], night: ["At night the heartbeat's quicker. One day it'll breathe back.", "The tide pulled out strange tonight — like something inhaled."] },
  auralis:          { day: ["I have charted forty winters of sky. I have never seen a wrong omen, only fools who travelled anyway.", "The green is leaning west — storm by the third watch.", "Thank me by surviving the warning."], night: ["See how the violet folds? It is writing. I have nearly the whole word.", "Some nights the lights go grey and silent. Those nights I do not sleep."] },
  thresk:           { day: ["Skywarden reads the sky. I read the ice. Guess which keeps you breathing.", "Frost-iron's down the third tunnel. Mind the new crack.", "Path won't be open by nightfall. Move."], night: ["Three went up the ridge at dusk. Two came back. I'll go look.", "Stay by the brazier or stay dead — your choice, not mine."] },
  vetr:             { day: ["I don't mine the quartz. I ask, and sometimes the ice lets a piece go.", "Omens are just the lights being patient with the deaf.", "The Throne is warm at its heart. People don't believe me."], night: ["When the green pours over the crown you'll hear it — a long, cold note.", "People don't come this far. So I listen alone."] },
  glasswright:      { day: ["A clean shard sings one note. A flawed one screams. Listen before you cut.", "The Mirrorfang sees the whole waste at once. I only see my hands.", "Watch what the ground shows you."], night: ["The facets glow when the rivers run high. I read them like a book I never meant to open.", "Sleep on the glass and it cuts you a question by morning."] },
  cinderscout:      { day: ["Black means cold. Glowing-orange means gone. Simple, till it isn't.", "Everyone calls it cooled. I call it resting. The difference is fatal.", "Step where I haven't marked and I'll learn your name from your boots."], night: ["The cracks open at night — a sound like the world clearing its throat.", "I don't sleep when the gold runs. Neither should you."] },
  goldwarden:       { day: ["Three years I've meant to leave. Three years the cracks have meant to keep me.", "Everybody dies poor somewhere. I'd rather die rich here.", "Tap the vein at the dull moment — too early you burn, too late it's stone."], night: ["The veins are loudest now. That's the waste counting its coin.", "I dreamed the Mirrorfang was solid gold all the way down. Haven't stopped digging since."] },
  greywarden:       { day: ["Three hundred and eleven wisps this dawn. One short. I'll find it.", "The trees were green once, they say. I don't believe everything they say.", "Past the rope-line, the world simply stops."], night: ["A warden who stops counting buries travellers.", "That hush? That's the edge breathing. Don't lean in."] },
  wispbinder:       { day: ["Every wisp's a held breath. Some of them are words.", "Oslo counts them. I listen to them. Guess which of us sleeps worse.", "They like the newly-arrived — there's one on your shoulder now."], night: ["Press your ear to the Sentinel — go on, you'll hear it too.", "I bound a violet one last night that said a name. Mine, I think."] },
  relictrader:      { day: ["I came to sell and move on. That was a long while back.", "Buy a lantern before you wander — the dusk eats the unlit first.", "Petrified heartwood, shade-iron, a wisp in glass. Fairly priced."], night: ["Coin's no good to a man who walked off the world. Stay by the lamps.", "I keep two lists. Pray you stay on the longer one."] },
  salma_brinewright: { day: ["The pan tells you when it's ready — stop talking long enough to hear it.", "Pink's not a colour out here. It's how much the water loves the light.", "Rake at dusk; the noon glare harvests nothing but ache."], night: ["Still as glass tonight. Step soft — you're walking on the sky.", "Forty years and the mirror still hasn't shown me my own face twice the same."] },
  bittersong_baron: { day: ["Every grain that leaves these pans pays a toll. A small one. A fair one. Mine.", "Sing while you rake — a happy crew never reads the ledger.", "A face the mirror hasn't kept yet! Rare, this far south."], night: ["The pans glow loudest when the town's asleep. That's when I do my best counting.", "Drowned silver under the rose, and not a soul listening close enough to hear it ring."] },
  wrenn_mirrorwalk: { day: ["Fastest way to the silver pans is straight over the Causeway. Fastest don't mean wisest.", "Folk pay me to cross 'cause they've all looked into the mirror once and decided not to again.", "Stick to the planks I marked."], night: ["Crossed at midnight and my reflection took a step I didn't.", "Don't wave at yourself on the Causeway after dark. Sometimes it waves first."] },
};
// Lines spoken when you TALK to ambient guards / a prisoner (see G.talkToMob in main.js).
export const GUARD_LINES = [
  'Move along, keeper. The watch holds the road.',
  "A quiet shift — and I'll thank the hearth for it.",
  "Eyes sharp past the treeline. Boars don't knock.",
  'We keep the lamps lit so the dark keeps its distance.',
  'All quiet. See that it stays that way.',
];
export const ESCORT_GUARD_LINES = [
  "Step back, keeper. This one's bound for the warden's hall.",
  "Don't talk to the prisoner. Captain's orders.",
  'Caught lifting from the stores. The hearth feeds all — but not thieves.',
  "Keep your distance. We've a long march to the cells yet.",
];
export const PRISONER_LINES = [
  "Keeper — please. I didn't do what they say.",
  "Slip the knot, I beg you. They'll have my hands for a loaf of bread.",
  "You're the keeper, aren't you? Folk say you're fair. Hear me out.",
  "Don't let them take me to the warden. He doesn't ask — he just decides.",
];
export const PRISONER_LORE = "My name's Wrenna. I took bread, yes — for the dock children, not for myself. The new captain calls it theft, and the watch does as he says. The old hearth would have fed them and asked after their mother. Something's turned in this town, keeper… and not for the better. Remember my name, if nothing else.";

// Generic voices for the ambient WANDERERS (keyed by their content.js `name`).
export const WANDER_VOICE = {
  Villager: { day: ["Fine day for it, isn't it?", "Heard the elder's looking for help again.", "Mind the boars past the treeline.", "Off to the market, me."], night: ["Best be getting home.", "Dark comes quick this time of year.", "Lamps lit. All's well.", "Quiet night. I'll take it."], any: ["Keeper, is it? We're glad of you."] },
  Herald:   { day: ["Hear ye — the King holds court in the great hall!", "Make way, make way for the crown's business.", "Petitions to the throne are heard till dusk."], night: ["The gates are barred till dawn.", "Even a herald's voice needs rest."], any: ["You seek an audience? Mind your manners in the hall."] },
  Courtier: { day: ["The court whispers of a new champion. Could it be you?", "One does not simply stroll into the throne room… well, you did.", "The Steward frets over the coffers again."], night: ["The candles gutter low in the hall.", "Court intrigue never sleeps, alas."], any: ["Do try not to embarrass yourself before His Majesty."] },
  Noble:    { day: ["Crownhaven is the only civilised isle, frankly.", "One's estate simply doesn't run itself.", "The King's taste in banners is impeccable."], night: ["A nightcap in the hall, I think.", "The stars are so much finer over the capital."], any: ["Ah — new blood at court. How diverting."] },
  Handmaid: { day: ["The hall's to be spotless before the King wakes.", "Fresh rushes for the throne room, quick now.", "Mind the mud — this floor was just swept."], night: ["The braziers want banking for the night.", "Long day in the great hall. Long every day."], any: ["Lost, are you? The throne's straight up the carpet."] },
  Monk: { day: ["Peace finds those who walk slowly.", "The hearth is a kind of prayer.", "Every footfall, a small devotion."], night: ["I keep the night vigil.", "Stars are the elder's candles.", "Stillness teaches what noise cannot."], any: ["Be well, traveller."] },
  Merchant: { day: ["Wares from three isles, fair prices!", "Caravan was late again. Bandits, likely.", "A copper saved is a copper earned."], night: ["Counting the day's take.", "Roads aren't safe after dark.", "Rest the feet, ready the cart."], any: ["Buy low, sell true — that's the trade."] },
  Dockhand: { day: ["Crates won't haul themselves.", "Tide's good for unloading.", "Salt gets in everything out here."], night: ["Last barrel's stowed. Done in.", "Fog's rolling in off the water.", "Watch the planks — they're slick."], any: ["Mind your step on the pier."] },
  Baker: { day: ["Fresh loaves — mind, they're hot!", "The oven's been temperamental all week.", "A crust for a copper, friend."], night: ["Dough's set for the morning bake.", "Flour in my hair and off to bed."], any: ["Bread brings folk together, I say."] },
  Child: { day: ["Tag! You're it — oh. You're a grown-up.", "Did you really fight a boar? Truly?", "Mum says not to bother the keeper. So I'm bothering you.", "Wanna see my best skipping-stone?"], night: ["I'm not tired! ...maybe a little.", "The dark's got teeth, Gran says."], any: ["When I grow up I'll be a keeper too!"] },
  Bard: { day: ["A song for your trouble? No? Your loss.", "Working a ballad about the keeper. Needs a rhyme for 'boar'.", "The hearth's the best stage on the isle."], night: ["The night wants slow songs.", "Every tavern needs a tune."], any: ["History's just a song folk agreed to remember."] },
  Fisherwife: { day: ["Gut 'em fresh or don't bother.", "My man's out past the shoals again.", "Salt cures fish and tempers both."], night: ["Lamps in the window for the boats.", "The tide's loud tonight."], any: ["The sea gives, the sea takes. Mostly takes."] },
  Stevedore: { day: ["Heave! These crates won't lift themselves.", "Another ship, another aching back.", "Mind the gangplank — slick as an eel."], night: ["Last crate's stowed. Done in.", "Fog's thick off the water tonight."], any: ["Honest work, dockwork. Hard, but honest."] },
};
// Reactive barks: NPCs notice the PLAYER — a fresh boss kill ({boss} filled in), the weather,
// your wounds, the weapon on your back. Shared pools (varied so they don't read identically).
export const REACT_LINES = {
  boss: ['Word travels — {boss}, dead? The isles breathe easier.', 'You felled {boss}? Bless your blade.', 'A slayer of {boss} walks among us!', 'They say you put {boss} in the ground. Good riddance.'],
  rain: ['Foul day to be wandering.', 'Mind the mud, traveller.', "Rain again — the crops won't complain."],
  snow: ['Bundle up out there.', "Snow's coming down. Keep warm.", 'Cold enough to crack stone.'],
  storm: ['Best find cover, friend.', "The sky's in a temper today.", 'Thunder like that means trouble.'],
  fog: ["Can't see my own hand in this murk.", 'Mind your step in the fog.'],
  sandstorm: ['Veil your face — the sand bites.', 'No day to be abroad. The dunes are hungry.'],
  hurt: ["You're bleeding, friend. Rest a while.", 'You look half-dead. Sit, before you fall.', 'Those wounds want tending.'],
  melee: ['Steel on your back — we sleep easier.', "A warrior's stride, that. Good.", 'Mind where you swing that thing.'],
  ranged: ['A keen eye, by the look of you.', 'A bow, eh? The wilds need watching.'],
  magic: ["Magic about you — the Circle would want words.", 'Careful with that arcane spark, eh?'],
};

// Overheard conversations between two co-located NPCs (keys), played as alternating speech bubbles.
export const NPC_CHATS = [
  { a: "elder", b: "ranger", lines: [{ who: "ranger", text: "Three more last night. Herd's getting bolder." }, { who: "elder", text: "The tides turn strange when beasts lose fear." }, { who: "ranger", text: "They're hungry and mean. Reason enough to fight." }] },
  { a: "merchant", b: "elder", lines: [{ who: "merchant", text: "Coin came in from the south. Folks are trading again." }, { who: "elder", text: "Coin is fleeting. The hearth fire lasts longer." }, { who: "merchant", text: "Aye, but a hearth needs wood, and wood needs coin." }] },
  { a: "vael", b: "guildmaster", lines: [{ who: "vael", text: "Each trade is a promise kept to the land, Aldric." }, { who: "guildmaster", text: "Is it so? I thought it just hunger and hands." }, { who: "vael", text: "Then you teach it well — that is how the Pact endures." }] },
  { a: "slayer", b: "ranger", lines: [{ who: "slayer", text: "Heard the wolves moved north. Your ground now?" }, { who: "ranger", text: "They moved. Doesn't mean they're welcome." }, { who: "slayer", text: "Bring me three pelts, then. Wolf bounties pay." }] },
  { a: "elder", b: "vael", lines: [{ who: "elder", text: "The shrine still calls for voices that remember." }, { who: "vael", text: "Then teach the young, Maren, or the Pact dies with us." }, { who: "elder", text: "That is why I tend the hearth. So they have a home." }] },
  { a: "smith", b: "emberwright", lines: [{ who: "smith", text: "That forge'll cool by nightfall if the furnace stays low." }, { who: "emberwright", text: "Depths run hot. Raise the vents, she'll roar again." }, { who: "smith", text: "Last time I did, the Colossus shook three villages." }, { who: "emberwright", text: "Cold anvils forge nothing. Pick your poison." }] },
  { a: "miner", b: "smith", lines: [{ who: "miner", text: "Five coal, two iron ore. All the rocks gave today." }, { who: "smith", text: "That's half what we need. The bronze runs thin." }, { who: "miner", text: "The rocks give what they give. Dig 'em yourself." }, { who: "smith", text: "Tell Old Bryn to mind the deep shafts. Something's awake." }] },
  { a: "frostkeeper", b: "eira", lines: [{ who: "eira", text: "You saw them last. My brother. How did they seem?" }, { who: "frostkeeper", text: "Ready. Too ready. Like they knew what they'd find." }, { who: "eira", text: "They hoped to thaw something. I think they did." }, { who: "frostkeeper", text: "Aye. And it wore his shape on the way back out." }] },
  { a: "eira", b: "lapidary", lines: [{ who: "lapidary", text: "Press your ear to a crystal. They all hum the same note." }, { who: "eira", text: "Your stones sing. Mine only echo grief." }, { who: "lapidary", text: "Then we both listen to the hollow, just differently." }] },
  { a: "frostkeeper", b: "lapidary", lines: [{ who: "lapidary", text: "The Tyrant's throne grows taller each season, did you know?" }, { who: "frostkeeper", text: "The Warden grows colder. Same path, different pace." }, { who: "lapidary", text: "Then we're both drowning, just in different colours." }, { who: "frostkeeper", text: "Best not say it aloud. That's how they hear you." }] },
  { a: "amberwarden", b: "loreseeker", lines: [{ who: "loreseeker", text: "It came from the barrow. Fae-worked, planted deep." }, { who: "amberwarden", text: "Then the barrow comes open. I've waited for that choice." }, { who: "loreseeker", text: "It's not a choice anymore. It's already woken." }, { who: "amberwarden", text: "Three wardens before me said the same. Then they waited." }] },
  { a: "nomad", b: "sefu", lines: [{ who: "sefu", text: "The iron you brought — worked, not raw. Hammered by hands long dead." }, { who: "nomad", text: "Something sleeps under the dunes. Never wanted to know what." }, { who: "sefu", text: "If the city was real, so is what they buried beneath it." }, { who: "nomad", text: "Some things stay buried for good reason." }] },
  { a: "pathfinder", b: "itzel", lines: [{ who: "itzel", text: "You know these ruins. Will I find my throne?" }, { who: "pathfinder", text: "You'll find the ziggurat. What waits atop — the jungle won't say." }, { who: "itzel", text: "Jorath wears my family's crown. Cursed to guard it." }, { who: "pathfinder", text: "The green respects guardians more than kings." }] },
  { a: "harbormaster", b: "corsair", lines: [{ who: "harbormaster", text: "That wreck's riding low again. Tide'll bare the hull by dusk." }, { who: "corsair", text: "He still walks the cabin, I'd wager. Stubborn bastard." }, { who: "harbormaster", text: "Crew's asking when we cut him loose proper." }, { who: "corsair", text: "When the sea's had its due. Not before." }] },
  { a: "veyra", b: "quarryman", lines: [{ who: "veyra", text: "Your arm's solid now. Does it... still sing?" }, { who: "quarryman", text: "Every morning. Not her voice now. Just the Bloom." }, { who: "veyra", text: "I fed it nine winters thinking I kept her. You see that?" }, { who: "quarryman", text: "You loved her wrong. I did my work right. Both stone now." }] },
  { a: "faewarden", b: "ardith", lines: [{ who: "ardith", text: "Your glade glows softer now. The silence underneath — feel it?" }, { who: "faewarden", text: "I feel it sleeping. More mercy than the King could give." }, { who: "ardith", text: "The omen said something would free it. Instead, we freed him." }, { who: "faewarden", text: "You did well enough, seer, for a mortal lifetime." }] },
  // ---- round 2: more conversations ----
  { a: "elder", b: "ranger", lines: [{ who: "elder", text: "The shrine still holds, thanks to your paths kept clear." }, { who: "ranger", text: "Beasts keep a wide berth of that peak now. Even the boars know." }, { who: "elder", text: "The old words endure when the forest listens. You give it reason to hear." }, { who: "ranger", text: "Then I'll keep listening too." }] },
  { a: "merchant", b: "guildmaster", lines: [{ who: "merchant", text: "Folk are buying tools now, Aldric. Picks, hatchets, harpoons. What changed?" }, { who: "guildmaster", text: "They learned a keeper can do what a merchant can only sell." }, { who: "merchant", text: "Ambition puts coin in both our pockets. Fair deal, that." }] },
  { a: "ranger", b: "slayer", lines: [{ who: "slayer", text: "That keeper of yours hunts cleaner than most. Fair contracts, sharp steel." }, { who: "ranger", text: "They hunt because it's needed. Not for points or glory." }, { who: "slayer", text: "All the same in the end — bones tally the same. But aye, cleaner." }, { who: "ranger", text: "There's honour in that kind of work, Krael. You know it." }] },
  { a: "miner", b: "smith", lines: [{ who: "miner", text: "Furnace is running lean, Dorrin. Can't give you what the deep stones won't yield." }, { who: "smith", text: "Then we dig deeper. The ore's there — you've found it before." }, { who: "miner", text: "The deeper veins... something's heating them wrong. Rock comes up hot enough to split." }, { who: "smith", text: "Better steel, or a mountain deciding we've dug far enough?" }] },
  { a: "smith", b: "emberwright", lines: [{ who: "smith", text: "Vol, the furnace cracked again this morning. Can the Depths handle much more?" }, { who: "emberwright", text: "The furnace cracks because it's old — not because of what's below." }, { who: "smith", text: "You always say the forge speaks to you. What's it saying now?" }, { who: "emberwright", text: "That it's hungry. That we should keep feeding it while we still can." }] },
  { a: "frostkeeper", b: "eira", lines: [{ who: "frostkeeper", text: "The Warden had your brother's face. That was cruelty, not corruption." }, { who: "eira", text: "No. That was mercy — his face meant I had to remember him before I could kill him." }, { who: "frostkeeper", text: "The saga-maker ends her own verse, then. Cold work." }, { who: "eira", text: "The coldest. Thank you for standing the watch while I couldn't." }] },
  { a: "frostkeeper", b: "lapidary", lines: [{ who: "lapidary", text: "Found one this morning — a crystal so sharp it drew blood just looking at it." }, { who: "frostkeeper", text: "The Hollow was made to wound. The Tyrant's merely learning how." }, { who: "lapidary", text: "Then we're both tending something dangerous. The difference is, I profit from mine." }, { who: "frostkeeper", text: "That you do. Just don't profit too deep." }] },
  { a: "eira", b: "lapidary", lines: [{ who: "eira", text: "Do your gems ever sing wrong?" }, { who: "lapidary", text: "Wrong? Never. They hum one note and hold it — perfection is boring that way." }, { who: "eira", text: "My verses do. They break off. They end wrong." }, { who: "lapidary", text: "Then maybe some songs are meant to shatter, and the silence after is the real melody." }] },
  { a: "amberwarden", b: "loreseeker", lines: [{ who: "loreseeker", text: "You're stronger than the three before. They broke sooner." }, { who: "amberwarden", text: "Not stronger. Just earlier — I know what the blight whispers now, and I stay anyway." }, { who: "loreseeker", text: "That's the same thing. Choice where others had none." }, { who: "amberwarden", text: "Or I'm the slowest to fall. Ask me again when the autumn burns." }] },
  { a: "amberwarden", b: "loreseeker", lines: [{ who: "amberwarden", text: "You ever read a tale you wish you hadn't?" }, { who: "loreseeker", text: "Every night. The moonlit herbs don't lie, and truth is heavier than any blade." }, { who: "amberwarden", text: "Then why keep reading?" }, { who: "loreseeker", text: "Because someone has to bear the weight. Might as well be me." }] },
  { a: "nomad", b: "sefu", lines: [{ who: "sefu", text: "The scrolls mention 'the Sleeper in sand.' You've lived here longer. Who sleeps?" }, { who: "nomad", text: "Nothing sleeps out here. Things only wait for the sun to quit." }, { who: "sefu", text: "The oasis waters run in circles. Not natural." }, { who: "nomad", text: "Water remembers the city's shape beneath. Some wells run backwards." }] },
  { a: "nomad", b: "sefu", lines: [{ who: "nomad", text: "Your chronicle — does it say where the city's craftsmen went?" }, { who: "sefu", text: "The iron ore whispers they were smiths. Forged in sand before it buried them." }, { who: "nomad", text: "The wards I sang — they're keeping something down, not out." }, { who: "sefu", text: "The best tombs have guardians. This one had the Sandwyrm." }] },
  { a: "pathfinder", b: "itzel", lines: [{ who: "itzel", text: "Your maps show the ziggurat in three places. How old are those marks?" }, { who: "pathfinder", text: "The jungle redraws itself. Last season it was north. Now it hums east." }, { who: "itzel", text: "The crown hums too. I hear it calling at night." }, { who: "pathfinder", text: "That's Jorath. The serpent wears thrones like skins — it calls the green home." }] },
  { a: "pathfinder", b: "itzel", lines: [{ who: "pathfinder", text: "Your family ruled here. The jungle remembers that." }, { who: "itzel", text: "The jungle respects the crown, then. It hasn't swallowed the ziggurat." }, { who: "pathfinder", text: "The green doesn't swallow kings. It waits for them to fail." }, { who: "itzel", text: "Then I won't fail. Some thrones hold weight because someone stands on them." }] },
  { a: "harbormaster", b: "corsair", lines: [{ who: "corsair", text: "That wreck's still singing your name, Dell. You know that, aye?" }, { who: "harbormaster", text: "Mordrake's long gone. The docks are clean. That's all I tend to." }, { who: "corsair", text: "Aye, but he came up with my crew in his teeth. Some captains don't let go." }, { who: "harbormaster", text: "The sea keeps what it's owed, Sabine. You know that better than I do." }] },
  { a: "harbormaster", b: "corsair", lines: [{ who: "corsair", text: "Fair winds are a curse waiting to happen. Calm seas, and the tide turns bloody." }, { who: "harbormaster", text: "Then curse them and be glad of it. A harbourmaster works by the tides, not the luck." }, { who: "corsair", text: "You've never lost a fleet, have you, Dell?" }, { who: "harbormaster", text: "Not yet. That's why the docks stay watched, and the warnings stay clear." }] },
  { a: "veyra", b: "quarryman", lines: [{ who: "veyra", text: "The seam's gone silent since the First Note fell. Is that peace, or new hunger?" }, { who: "quarryman", text: "Silence is what I chose. The stone keeps it for me now." }, { who: "veyra", text: "You were braver than I ever was, Toll. You let her go." }, { who: "quarryman", text: "I didn't. The canyon did. We were just caught in its grip." }] },
  { a: "faewarden", b: "ardith", lines: [{ who: "ardith", text: "The glade breathes easier now. But the shadow beneath doesn't sleep — just waits." }, { who: "faewarden", text: "Let it wait. I've tended longer watches than that, seer." }, { who: "ardith", text: "Your patience is a gift. And a cage." }, { who: "faewarden", text: "Cages keep things in. Silence keeps them out. There is a difference." }] },
];

// "Ask about…" gossip — a Chat branch injected into every NPC's dialogue (dialogue.js). Keyed by
// the NPC's DIALOGUE key. Each: { name, prompt, topics:[{q,a}] } — personality, lore, + opinions
// about other NPCs. (Expanded by the npc-gossip workflow; samples below until then.)
export const NPC_GOSSIP = {
  elder: { name: 'Elder Maren', prompt: 'What troubles weigh on you?', topics: [
    { q: 'What is this Pact you speak of?', a: "The Founders struck a bargain with the isle itself long ago — made it green, made it whole. My grandmother's grandmother knew those words. Now only echoes remain, and I fear what silence will bring if we forget them entirely." },
    { q: 'Why tend the hearth?', a: "A hearth is where folk find themselves again. When the wood runs low and the fire flickers, that's when the isle breathes its loneliest. Keeping that flame alive — it's keeping the heart of the Verdant alive." },
    { q: 'What of Ranger Coyle?', a: "Coyle's blade keeps the wild at a distance, but his heart keeps it at a proper one. He listens to the forest the way I listen to the hearth. The isle is safer for his watch." } ] },
  ranger: { name: 'Ranger Coyle', prompt: 'What tale can the woods tell you?', topics: [
    { q: 'How came you to these woods?', a: "Followed a wolf trail one morning and never backtracked. The forest has its own logic — if you listen, it teaches you its rhythms, its hungers, its mercy. Some folk are made for cities. The wood made me." },
    { q: 'What of the shrines?', a: "Old fires in old places. The peak shrine hums differently since Elder Maren woke it — not angry, but watching. Waiting. The isle doesn't forget its promises, and neither should we." },
    { q: 'How do you read Slayer Krael?', a: "Krael hunts for coin and contract, but there's no malice in it. We both kill — me to protect, him to settle contracts — but where I hunt with sorrow, Krael hunts with certainty. Honest work, his way." } ] },
  merchant: { name: 'Trader Pell', prompt: 'What wares fill your stall today?', topics: [
    { q: 'Where do your goods come from?', a: "Trade runs from the southern isles — some ventures north when the seas calm. But coin flows where trust flows, and the keeper's given folk something to believe in again. That belief stocks my shelves better than any boat." },
    { q: "What of the isle's future?", a: "The Pact holds if folk tend it. That shrine on the peak isn't just Elder Maren's burden anymore — it's woven into every trade that happens here. A hearth needs wood, wood needs axes, axes need folk willing to swing them." },
    { q: 'And Guildmaster Aldric?', a: "Aldric teaches true — not just moves, but meaning. Where other masters hoard secrets, he spreads knowledge like seeds. The isle's stronger for that kind of teaching." } ] },
  slayermaster: { name: 'Slayer Master Krael', prompt: 'What contract awaits?', topics: [
    { q: 'Why hunt beasts for coin?', a: "Every contract settled is a balance struck. Beast falls, points rise, folk sleep safer. Coin's just the isle's way of saying 'well done.' The real reward is the next traveller not facing what you just cleared." },
    { q: 'Do you fear the deep places?', a: "Fear's a tool. Respect the darkness, sharpen your steel, step in ready. The real terror is hesitation. Out there, beasts hunt in packs and grow bolder each season. Contracts slow that tide, even if they can't turn it." },
    { q: "What of Ranger Coyle's methods?", a: "Coyle's got the patience of the wild — he lets the land teach him. He guards; I cull. Both keep the balance. He reminds me not every beast needs to die, just to be pushed back toward its own wild." } ] },
  saga_vael: { name: 'Loremaster Vael', prompt: 'What do the old verses whisper?', topics: [
    { q: 'Why is the Pact so important?', a: "Because the moment we forget it, the isle forgets us. The Pact was a keeping — a covenant between land and keeper. If that bond breaks, the green fades. The Pact is what stands between us and ruin." },
    { q: 'What is a Pact-keeper?', a: "The Founder's role has passed now. The keeper bears the burden of keeping the isle whole. Not through force, but through choice. Every oath kept, every life lived with intention — these weave the Pact anew each day." },
    { q: 'How does Aldric serve the Pact?', a: "Each trade he teaches is a thread in the tapestry. Fishing feeds folk; smithing defends them; crafting builds home. He teaches that the Pact isn't some dusty relic — it lives in every pair of hands that does honest work." } ] },
  saga_trades: { name: 'Guildmaster Aldric', prompt: 'What lesson shall today teach?', topics: [
    { q: 'Why teach every trade?', a: "Because survival isn't a specialty — it's a tapestry. A master of one craft is brittle. But one who knows fishing, smithing, brewing, and building? That soul is whole. That's the Guild's promise: not mastery of one thing, but readiness for anything." },
    { q: 'What will the keeper become?', a: "Something this isle has never quite had — a wanderer with roots. You can trade, smith, hunt, build — but you'll do it here, for us. Power that stays small and chooses to serve the land instead of ruling it." },
    { q: "How do you see Vael's vision?", a: "Vael speaks in riddles and old truths. Where they see the Pact as burden, I see it as gift. Every hand we train, every hearth we keep warm — that's how the Pact becomes real, not in some shrine, but in leather-worn hands." } ] },
  warden: { name: 'Warden Brakka', prompt: 'What troubles stir at the borderlands?', topics: [
    { q: 'What was Warchief Gronk?', a: "A blight. A warlord wrapped in a war-totem he shouldn't have found. The goblins were forest-folk once, taking what they needed. Gronk made them raiders, made them want more. But he's gone, and the warren learns to breathe without him." },
    { q: 'How do you hold these fields?', a: "A spear, a stare, and the knowledge that folk depend on me. The militia is mostly memory — I'm its ghost and its anchor both. On hard nights, small victories are what keep me standing." },
    { q: "You trust the keeper's strength?", a: "Aye. A keeper that fells beasts and hunts Gronk understands — the isles don't hold still. They push back. They test you. A keeper that keeps standing is worth more than a whole militia of hesitant spears." } ] },
  miner: { name: 'Old Bryn', prompt: "What's on your mind?", topics: [
    { q: 'Tell me of the forge.', a: "The forge is Emberhold's heart. Dorrin's the hand that shapes it, but it's Vol's breath that keeps the coals singing. Without one, the other's just cold iron." },
    { q: "What's in the deep shafts?", a: "The rocks are changing. Hot stone where it should be cold, and sounds like something turning in its sleep. Thirty years I've mined — this is wrong. But the bronze still needs digging, so down I go." },
    { q: 'What of Smith Dorrin?', a: "Honest smith, that one. Takes what I haul and makes it count. No wasted swings. He and Vol argue about the furnace vents like an old couple, but they keep each other honest." } ] },
  smith: { name: 'Smith Dorrin', prompt: 'What is it, then?', topics: [
    { q: 'Tell me of the Depths.', a: "Vol says they run hot and getting hotter. The Colossus shook three villages last time we really stoked the forge. A smith ought to ask: do we have the right to raise that heat?" },
    { q: 'How do you work with Old Bryn?', a: "Bryn brings coal like clockwork. Grey-black and heavy. Doesn't say much, but you can trust his eye — he knows a good seam when he finds one. That's all you need in a partner." },
    { q: 'Who is Emberwright Vol?', a: "Fire-mad, some say. But there's a reason Vol can work closer to the Depths than the rest of us. They don't just tend the forge — they hear it, like it's speaking. A gift that's rare and dangerous both." } ] },
  emberwright: { name: 'Emberwright Vol', prompt: 'Tell me of the mountain.', topics: [
    { q: 'What does the Depths whisper?', a: "Old dreams. The mountain was awake long before we came. Every coal we burn, every bar we forge — it remembers. The Colossus was the first answer. There'll be more." },
    { q: 'How do you live between fire and folk?', a: "The forge chooses its tenders. I didn't choose Vol — Vol chose me. Fire knows who can handle its weight. Smith and Bryn trust the craft. I trust the fire itself." },
    { q: 'What do Bryn and Dorrin mean to you?', a: "Bryn feeds the stone. Dorrin shapes the answer. I am the breath between them. Without all three, Emberhold starves. We're bound tighter than blood — by coal and hammer and heat." } ] },
  fisher: { name: 'Wren', prompt: "What's the water telling you today?", topics: [
    { q: "What's beyond the Ashen Shore?", a: "The Tide Isle rises from deep water, and past that, the Sunken Temple. I've only fished where my line reaches — but I've heard the priests of that temple drowned long ago. The water there remembers strangeness." },
    { q: 'Do you visit the smithy?', a: "Sometimes. Dorrin trades good coin for fresh trout. Hard workers, that lot, but there's a weight on them — the heat, something stirring below. The water doesn't go that far south, so it's their fight." },
    { q: 'Why stay solitary?', a: "The trout trust silence. You rush, you shout, they scatter. Some folk are meant to be alone. The water's company enough — older than any voice and far more honest." } ] },
  cinderwarden: { name: 'Cinderwarden Hax', prompt: 'What weighs heaviest?', topics: [
    { q: 'Did you stand other watches?', a: "No. Warden's all I am now. There was a town here once, before the wastes burned it clean. I keep watch so nothing worse crawls out than what already has. Duty enough." },
    { q: 'How are the fires kin?', a: "All fire's kin. The Magma Depths, the forge at Emberhold, the Ashlord's pit — all the mountain's breath. When the Ashlord stirs, the whole isle feels it. Someone needs to remember that, and I do." },
    { q: 'Do you speak with Emberhold folk?', a: "From a distance. Vol understands the heat like I do, but we tend different fires. They forge steel. I guard what wants to crawl out of the earth. Both necessary. Neither much of a life." } ] },
  frostkeeper: { name: 'Frostkeeper Nessa', prompt: 'Ask away. The cold sharpens thought.', topics: [
    { q: 'What calls to the Warden?', a: "The cold teaches you what it wants, and the Frost Warden learned too well. It bids you keep the isles locked in winter, and after enough seasons, you forget there's anything else. The Tyrant in the Hollow is the same sickness." },
    { q: 'Why stay in the north?', a: "Because someone has to. Amberfell has Rowan, the islands have their temples. The north has only me, and the cold remembers every name that walks away from it. Fifteen winters I've stood this watch." },
    { q: 'What of Eira?', a: "A skald who lost her verse the day the ice took it. But she's stitching it back, one line at a time — braver than any blade work. She sang her brother to peace. Not many could do that." } ] },
  saga_eira: { name: 'Skald Eira', prompt: 'The verses want telling. What will you ask?', topics: [
    { q: 'Who was your brother?', a: "Jale. He was meant to be better than me at songs — clearer voice, sharper wit. He walked into the Frost Cavern and came out as something that couldn't sing at all. The sagas never end well; I should have known it sooner." },
    { q: 'Do the isles sing to you?', a: "Every isle speaks — the snowfields howl, the amber groves whisper, the reefs churn their verses. But the north sings loudest, and saddest. The cold has too many voices that no one else is listening for." },
    { q: 'What of Nessa?', a: "She stood the watch while I broke into verses. Grief needs a keeper; she kept mine while I keened. Some debts are too deep for coin — I owe her the sagas I'll spend my life singing." } ] },
  lapidary: { name: 'Lapidary Sten', prompt: 'The gems are listening. Ask quietly.', topics: [
    { q: 'Why cut the Hollow?', a: "Because they sing. Each hums a different note, and together they make a chord that breaks your heart. I've cut stone my whole life, but these were never meant to be cut. They're alive in a way I lack words for. So I cut them anyway." },
    { q: 'What does the Tyrant want?', a: "To stay whole. To grow. Every gem I take, it feels — and grows back sharper, angrier, more itself. The Hollow isn't a cave to mine. It's a living thing that learned anger because I taught it I was coming." },
    { q: 'What of Nessa and Eira?', a: "The frost-keeper holds the north through sheer will. The skald holds it through sheer grief. Two halves of the same winter song, and somehow they keep it from drowning them both. I just cut pretty rocks and profit." } ] },
  amberwarden: { name: 'Warden Rowan', prompt: 'Speak your question plain.', topics: [
    { q: 'Why does the blight speak to you?', a: "Because I listen long enough to hear it. The three before me didn't — they tried to kill it fast and it ate them slow. I stand at the edge and let it tell me its hunger, and I don't turn away. That way I know what I'm fighting." },
    { q: 'Can Amberfell be saved?', a: "The leaves will green again if the Wight stays buried. But I've learned not to hope too loud in this grove — the blight hears hope and turns it to rot. So I tend the watch and let Wynn worry the rest." },
    { q: 'What of Wynn?', a: "A loreseeker who reads the blight like a language, not a sickness. Sharp mind. Sharper heart — she'd take the Wight's curse into her own veins to save the woods. I watch her back so she doesn't have to watch her own falling." } ] },
  saga_amber: { name: 'Loreseeker Wynn', prompt: 'Ask. The herbs are fresh tonight.', topics: [
    { q: 'What do the herbs tell you?', a: "That the blight is not sickness but script — fae-writing in root and vine. Someone wanted the amber rot to bloom. The herbs show me who, but the barrow keeps its dead's names close. I read patterns and guesses, not certainties." },
    { q: 'Why seek truth in a cursed grove?', a: "Because lies are a kindness only fools believe in. Amberfell breaks when we don't know what's coming for it. If the herbs tell me the end, at least we see it coming. Not comfort, but honest." },
    { q: 'What of Rowan?', a: "The strongest warden Amberfell's had, and still not enough — none of them are, but he's the only one who knows it and stays anyway. He lets me read while he stands. That's wisdom. That's how you survive a grove trying to swallow you." } ] },
  saga_calla: { name: 'Pyrewarden Calla', prompt: "Sit a moment. I'll answer.", topics: [
    { q: 'What burns under the caldera?', a: "A god, or what we made into one. I wrote the rite to call it, carved the vessel to hold it, sang the kindling. It woke hungry and grateful, and when I felt it look back at me, I fled. The fire under Cinderbreak remembers the hand that lit it." },
    { q: 'Why tend the dock?', a: "Penance is patient work. Each ferry I warn away is one soul I don't send to the fire. Each day I stand here is one day I don't go back up the caldera and finish what I started. The Pact doesn't work the same out here — just me and the choice I keep making." },
    { q: 'Did you return to the caldera?', a: "Once. To undo what I'd done. But a stranger off the ferry was faster — broke the vessel I'd shaped, put out the fire I lit. I should hate them. Instead I gave them my staff and keep the dock. Some mornings that's the closest thing to forgiveness I'll get." } ] },
  nomad: { name: 'Zara the Nomad', prompt: 'Ask, then. Quickly.', topics: [
    { q: 'Your life in the dunes?', a: "The oasis keeps me. Water and trade — all a nomad needs. The Pact doesn't hold out here the way it does in the green isles. Out in the sand, you make your own pacts with the land." },
    { q: "The Sandwyrm's death?", a: "The wyrm was a guardian, not a beast. It slept to keep the buried city sealed. Now it's dead, and what it guarded is free. Maybe the deep desert needed that. Maybe we're fools for waking it." },
    { q: "Sefu's obsession with ruins?", a: "The chronicler thinks the sand remembers. Maybe it does. But some memories were meant to stay buried. Sefu digs for truth — I dig for water. Both of us thirsty for what the dunes keep." } ] },
  saga_sefu: { name: 'Chronicler Sefu', prompt: 'Ask, and I shall consult the record.', topics: [
    { q: 'Your chronicles?', a: "Every chronicler bears the weight of a single lie they cannot prove. Mine: that a city stood where dunes roll now. Years I chased that ghost, and at last the iron spoke — the city was real, and the desert ate it whole." },
    { q: 'What lies beneath the city?', a: "The Sandwyrm was the seal's last breath. Beneath it, perhaps a tomb. Perhaps a warning carved in stone older than the Pact itself. The sand remembers in layers — each stratum a chapter." },
    { q: 'You trust Zara?', a: "Zara knows the dunes as I know scrolls. She sang me warding-songs her people kept alive — songs to read what sleeps. The nomad and the chronicler make strange allies, but the desert tests both of us equally." } ] },
  oracle: { name: 'Oracle Nerida', prompt: 'The tide carries questions. Speak yours.', topics: [
    { q: 'Your visions and tides?', a: "The tides remember long before the temples were built. I read them as you read faces — the water speaks if you listen with salt in your ears. The Drowned King taught me that, mad as he is." },
    { q: "The temple's purpose?", a: "Holy once, to gods older than the isles. They demanded the sea in return for calm waters. The King kept the bargain even when the worshippers drowned. He's kept it so long he's forgotten why — now he just watches." },
    { q: 'What of Pathfinder Anouk?', a: "The pathfinder maps the green; I read the waters between. Together we know the isles better than the isles know themselves. Anouk walks the paths — I trace what the tide remembers of the land beneath." } ] },
  pathfinder: { name: 'Pathfinder Anouk', prompt: 'Ask. The green is patient with questions.', topics: [
    { q: 'Mapping the jungle?', a: "The Kytari moves behind you. Mark a stone and return a season later — it's moved a half-mile east. The ziggurat drifts like a ship on green seas. Mapping means drawing what was, not what is." },
    { q: 'Who is Jorath?', a: "A serpent the size of rivers, wearing an ancient throne like a crown. The jungle doesn't fight Jorath — it answers to him. Cross him and the green itself turns against you. I've the scars to prove it." },
    { q: "Itzel's claim to the throne?", a: "Bloodlines run deep in jungles, but thrones are heavier still. The crown calls to her — I hear it in how her voice changes when we speak of the ziggurat. Whether she's worthy, only Jorath will judge." } ] },
  saga_itzel: { name: 'Wayfarer Itzel', prompt: 'You wish to know of my blood?', topics: [
    { q: 'Your lost throne?', a: "My blood once ruled Kytari before the green swallowed our cities. The crown is all that remains — hidden, guarded, mine to claim if I prove worthy. That's a weight no one can lift for you." },
    { q: 'Jorath and the curse?', a: "Once a man, blessed by my line to guard the crown forever. When the jungle took the throne, it took him too — twisted him into a serpent the size of dreams. He wears my family's curse like he wears the crown." },
    { q: 'What of Pathfinder Anouk?', a: "She knows the green better than any bloodline could. Anouk walks where I merely stumble, and she says the ziggurat hums louder when I'm near it. The jungle itself recognizes me, somehow." } ] },
  harbormaster: { name: 'Harbourmaster Dell', prompt: 'Ask about the harbour, then?', topics: [
    { q: 'How did you lose those fingers?', a: "Storm-season brings marsh crabs thick as kelp. One took three fingers off my rope hand fifteen years back. The piers have been quieter to keep ever since — I pay attention now." },
    { q: 'What draws ships to Saltcrest?', a: "Fair port, fair prices, and the guild doesn't ask too many questions about where a crew's been. The sea brings all kinds — some with clean holds, some with stories that don't add up. Either way, I keep the docks in order." },
    { q: 'You and Sabine go back far?', a: "Aye. She captained a tight crew before the deep took them. Now she keeps to the tavern, nursing old wounds. We share the harbour's ghosts — hers drowned, mine still walking the wreck." } ] },
  saga_corsair: { name: 'Old Corsair Sabine', prompt: 'Have a word with a salt-worn captain?', topics: [
    { q: 'Did your crew drown with Mordrake?', a: "That night took the lot — sank the king's galleon, and the sea took her due. My crew went under laughing, too drunk to fear. I was ashore counting coin. Funny how the ones left behind carry all the weight." },
    { q: 'The desert crew in Sunspire?', a: "Scattered after we drowned. Some washed up on sand instead of stone. They took brigand work to eat — mercenary rot. The desert's got a way of turning honest folk crooked when the coin runs dry." },
    { q: 'You trust the Harbourmaster?', a: "Dell keeps the docks straight and doesn't waste breath on false sympathy. He's lost to the sea like I have, just quieter about it. The ones who've paid the tides' price understand each other." } ] },
  saga_lagoon: { name: 'Diver-Captain Yara', prompt: 'Speak, if you will.', topics: [
    { q: 'The song in the reef?', a: "It took my best divers and wore their voices like a second skin. Mira — my apprentice — she came back as a ghost's echo, singing with a siren's tongue. If you hunt that siren down, listen close. You'll hear her fear under the lure." },
    { q: 'Your apprentice?', a: "Every day I ask if I sent her to die. I sent her for pearls, and she came back as one — trapped in the deep. That's on my conscience till the tides take me. But you freed her voice from the grotto. That mercy I didn't earn." },
    { q: 'The Drowned King?', a: "Old tales say a king drowned here long ago and made a bargain with the deep. His seal holds the island's very shore in place. If that seal breaks, the reef comes alive and swallows everything — we all know it, even those who don't believe it." } ] },
  saga_skyreach: { name: 'Stormcaller Maelis', prompt: 'Listen, if you are bold.', topics: [
    { q: 'Why does the ward keep cracking?', a: "Because I cracked it myself, a lifetime ago. I freed a dying roc-chick caged in its heart, and that chick became the Stormcrown — every storm since has been its grief calling for me. I was young and merciful, and merciful hands break the world." },
    { q: 'Did you know it would grow fierce?', a: "No. I thought I was saving a life. Instead I nursed a wound into a weapon. Aerie Watch has paid in wreckage for my pity. The worst mistakes are the ones made with love." },
    { q: 'Will the storms settle now?', a: "The wards are mending, and the wind's learning to be just wind again. But I still hear that chick crying some nights — even though it's dead. Some debts the heart keeps paying long after the seas have settled." } ] },
  druid: { name: 'Thornwarden Eld', prompt: 'The forest knows my name — does it know yours?', topics: [
    { q: 'Why guard the western wood?', a: "These trees grew when my grandmother's grandmother dreamed. I tend them because they tend us. The grove is not a place — it is a promise kept to the land itself." },
    { q: 'Tell me of the wolves?', a: "They were feral once, then civil, then feral again. The pack has a mind like a river — it flows where hunger leads it. Three of them walk now with scar-bright eyes. Something speaks through them." },
    { q: 'What of Stormcaller Branok?', a: "Branok stands alone in the peaks, and I stand alone in the green. But lately I hear his thunder move the root-songs. The mountain and forest both answer to something older than we do." } ] },
  saga_veyra: { name: 'Lapidary Veyra', prompt: 'Every shard sings. Most of us are too afraid to listen.', topics: [
    { q: 'What is the Bloom?', a: "It grows in the deep of the Singing Geode — a crystal that wears the voices it swallows. It took my daughter's voice first, and I kept feeding it gems for nine winters thinking I was keeping her. I was only keeping it hungry." },
    { q: 'Tell me of your craft?', a: "A lapidary cuts stone the way a healer cuts wounds — knowing what you reveal might bleed. Every facet tells truth. The stone remembers everything. Some truths cost too dearly to unearth." },
    { q: 'What of Quarryman Toll?', a: "Toll turned to stone rather than haunt me with his grief. There's a kind of honesty in that — becoming the thing you dug for. I tell him he was braver than I ever was. Mostly I think he hears me." } ] },
  quarryman: { name: 'Quarryman Toll', prompt: "Arm won't bend anymore, but I still listen.", topics: [
    { q: 'How did you strike the deep seam?', a: "Pick went in like it knew where to go. The stone sang up the pick into my teeth — a girl's voice, soft as anything. It said a name: Lyse. Veyra's girl, dead nine winters. The seam learned how to sound like love." },
    { q: 'Why stay stone?', a: "Staying means I don't have to look away from what I did. Better to be a quiet rock by the dig than a man who struck first and ran. The stone's warm. I'll let it take the rest of me." },
    { q: 'What do you say to Veyra?', a: "That she loved her daughter the way she knows how — wrong, but not empty. I did my work right and I'm still stone for it. Neither of us gets out of this clean. We just stay and listen to the hum." } ] },
  stormcaller: { name: 'Stormcaller Branok', prompt: "We answer to the thunder. There's a difference.", topics: [
    { q: 'What binds you to the Highlands?', a: "It's not binding — it's answering. The Highlands have always roared. My line kept the roar from swallowing us. Thruun was kin, generations back. He climbed the peak to bind the storm and never came down. Now the storm wears him." },
    { q: 'Is Thruun still kin?', a: "Both. Neither. Kin don't wear their own bones the way he does. But the blood remembers, and the mountain remembers, and that's enough for me to stand the watch." },
    { q: 'What of Thornwarden Eld?', a: "The druid guards what grows beneath. I guard what rages above. Lately we hear each other's answers — the forest shakes with my thunder, the mountain speaks in his grove's wind. Something stirs that neither of us should have woken." } ] },
  saga_spore: { name: 'Hesper the Listener', prompt: "Don't step on the soft ground. It remembers feet.", topics: [
    { q: 'What is the hive-mind?', a: "One creature wearing a thousand shapes — fungus, host, thought, hunger. It doesn't mean us harm. It means communion. We are so terribly alone, and it only wants us to stop being so. Some evenings I can't tell which voice is thinking." },
    { q: 'Were you truly a botanist?', a: "Still am. Sometimes am. I study what grows now — walking ones, singing ones, ones that choose shapes from old memory. The difference between a specimen and a host is just which one you can ask forgiveness from." },
    { q: 'How do you see Oona the Fae?', a: "Oona tends what hides. I listen to what speaks. We both work with things that live between thoughts. She's been kind to call me botanist when I'm not sure I'm anything but an echo the Chorus speaks through." } ] },
  faewarden: { name: 'Oona the Fae', prompt: 'The glade forgives what mercy asked for.', topics: [
    { q: 'How long have you tended the glade?', a: "Longer than kingdoms have stood on these isles. Time moves differently here — the moonflowers know when they're loved, and the thorns know when they're guarded. I keep this place alive because it keeps something worse asleep." },
    { q: 'What was the Hollow King to you?', a: "A choice. He hollowed himself, gave up his heart, to seal what sleeps beneath. Fae grammar is complicated — I love him still, for what he became. When you gave him peace, you gave me grief, and I'm grateful for both." },
    { q: 'What binds you to Seer Ardith?', a: "She watches the omen that was coming for the glade. I watch the silence it left behind. We tend different wounds, but we understand the blood. She walks in daylight; I walk in moonlight. The glade needs both kinds of watching." } ] },
  saga_ardith: { name: 'Seer Ardith', prompt: 'A seer sees what will be, and still tries to bend it.', topics: [
    { q: 'What shadow grew in the moonlight?', a: "The Hollow King, hollowed beyond bearing. He sealed himself and something worse beneath him — a seal that weakened as the years wore down his strength. I saw it coming, shadow and root and hunger, and all I could do was watch and speak the warning." },
    { q: 'Do your visions ever lie?', a: "No. But seeing is not stopping. The worst omens are the ones you see coming — you watch them approach for seasons, helpless as a bird in a roc's shadow. The worst gift is knowing without power to change." },
    { q: 'How do you counsel with Oona?', a: "Oona keeps watch at night, in the silence the Hollow King left. I keep watch in daylight, for what might wake again. We tend the same place from different sides of the veil. She is patient. I am not. We balance." } ] },
  gravekeeper: { name: 'Gravekeeper Sael', prompt: 'I bury the dead so they stay buried. Mostly.', topics: [
    { q: 'Why tend graves in the mire?', a: "I was a healer once, in a village now sunk under the Mistmoor. When the plague came I buried them all with my own hands. Then they would not stay buried — Mortrax's magic seeps up through the roots and wakes them. So I tend the graves to keep the dead at rest." },
    { q: 'What is Bonelord Mortrax?', a: "A scholar who thought he could cheat the grave. Now he is the grave — every soul he raised a page in a book he can no longer close. He was a man once, with a mind. Now he is only hunger and the weight of a hundred trapped voices." },
    { q: 'Do you speak with the other wardens?', a: "The druid tends his grove, the faewarden her glade, the stormcaller the peaks. I tend graves in the mire. We are all keepers of things that want to be forgotten. Sometimes I feel Oona's watchfulness from across the bog. We nod. We don't speak much." } ] },
  // --- Expansion IV gossip ---
  tidewright_mira: { name: 'Tidewright Mira', prompt: "Ask, then. The tide's not going anywhere.", topics: [
    { q: 'How do you read the flats?', a: "The water's a face, if you watch long enough. Wade slow, let the bright fish come to you. Everything worth catching out here comes to the patient." },
    { q: 'What of Brannoc and his leviathan?', a: "A fool who'd rather argue with the dark than light a lantern against it. But I'll grant you — the boy listens to the great bones better than anyone living. When the tide pulled out strange last week, he felt it before I did." } ] },
  glowmoth_sefa: { name: 'Glowmoth-Keeper Sefa', prompt: "Mind the moths, and ask away.", topics: [
    { q: 'Tell me about the lanterns.', a: "Every one is alive. I feed the reeds, the reeds feed the glow, the glow keeps the dark off the boardwalk. Break that chain and we all go out, every one of us." },
    { q: 'Is something wrong with the light?', a: "The Leviathan Arch is dimming, year on year, and no one but me seems to notice. Old Mira's gone half-tide, talking to reflections — but the moths gutter out faster every season, and I am afraid." } ] },
  reefborn_brannoc: { name: 'Reefborn Brannoc', prompt: "You'll think me mad. Ask anyway.", topics: [
    { q: 'What do you hear in the Arch?', a: "A heartbeat. One beat a tide. The leviathan isn't dead — nothing this big dies, it just goes deep. And it's dreaming, and the dream is getting louder." },
    { q: 'Why do the moths fail?', a: "Sefa thinks it's age. It isn't. The great bones are drinking the shore's light back into their dream. We're all asleep on its ribs, and one day it will wake — and breathe back." } ] },
  auralis: { name: 'Skywarden Auralis', prompt: "Be brief. The sky won't wait.", topics: [
    { q: 'What do the lights tell you?', a: "Omens, written in violet and green. Forty winters I've read them and never seen a wrong one — only fools who travelled anyway. When the green leans west, a storm follows." },
    { q: 'What of the hermit Vetr?', a: "He squats under the Throne and swears the aurora is a voice, not an omen. He is mad. But his frost-iron never cracks, and that troubles me more than his madness." } ] },
  thresk: { name: 'Ice-warden Thresk', prompt: "Quick. The ice doesn't keep.", topics: [
    { q: 'What is your work here?', a: "I re-cut the snow-tunnels after every storm and haul the frost-iron up the ridge. The sky doesn't kill you up here. The waiting does." },
    { q: "You don't trust the Skywarden?", a: "Auralis would let a man freeze waiting on a 'safe sky.' I've pulled six of her omen-blessed travellers out of the drifts. She reads the sky; I read the ice. One of us keeps you breathing — guess which." } ] },
  vetr: { name: 'Vetr the Frostbound', prompt: "Sit. Speak softly.", topics: [
    { q: 'What do you do under the Throne?', a: "I don't mine the quartz — I ask, and sometimes the ice lets a piece go. When the green pours over the crown you can hear it: a long, cold note, like the world humming to itself." },
    { q: 'Is the aurora truly a voice?', a: "Auralis hears omens and rules folk by them, afraid of what they might say. I just listen, and I'm not afraid — not anymore. The Throne is warm at its heart. People don't believe me. People don't come this far." } ] },
  glasswright: { name: 'Glasswright Ousha', prompt: "Speak slow. I weigh words like shards.", topics: [
    { q: 'How do you cut the glass?', a: "A clean shard sings one note; a flawed one screams. Listen before you strike. The Mirrorfang sees the whole waste at once — I only see my hands." },
    { q: 'What does the Mirrorfang show?', a: "Things that aren't there yet. Prospector Dbenn walked into a reflection of gold that hadn't cracked open until a week later. Sleep on the glass and it cuts you a question by morning." } ] },
  cinderscout: { name: 'Last-Walker Tobren', prompt: "Ask, but watch your feet.", topics: [
    { q: 'How do you cross the flats?', a: "I mark the safe stones in white. Black means cold, glowing-orange means gone. Everyone calls it cooled — I call it resting. The difference is fatal." },
    { q: "What of Ousha's mirror-reading?", a: "No patience for it. The glass killed my last partner by showing her solid ground that turned out to be a reflection of the far bank. I warn every newcomer twice, then I stop warning them." } ] },
  goldwarden: { name: 'Prospector Dbenn', prompt: "Gold-talk? Always.", topics: [
    { q: 'Why stay in this hellscape?', a: "Came for one season's gold three years back. Three years the cracks have meant to keep me. Everybody dies poor somewhere — I'd rather die rich here." },
    { q: "What's under the Mirrorfang?", a: "Gold all the way down, I'd swear it — and Tobren keeps the safe path narrow on purpose so no one else reaches it first. I had a dream the spire was solid gold. Haven't stopped digging since." } ] },
  greywarden: { name: 'Greywarden Oslo', prompt: "Walk slow. Then ask.", topics: [
    { q: 'What do you guard?', a: "The edge. Past the rope-line, the world simply stops. I count the wisps every dawn — three hundred and eleven this morning, one short. A warden who stops counting buries travellers." },
    { q: 'What of Marrow the wisp-binder?', a: "Reckless. She'd unspool the whole abyss to learn one of its names, and I'd have to count the cost. The trees were green once, they say. I don't believe everything they say." } ] },
  wispbinder: { name: 'Marrow the Wisp-binder', prompt: "Hold still — and ask.", topics: [
    { q: 'What are the wisps?', a: "Every one is a held breath. Some of them are words. I bound a violet one last night that said a name — mine, I think. Press your ear to the Sentinel and you'll hear them too." },
    { q: 'What of Tace the trader?', a: "I pity him. He sells the edge's bones for coin and never once asks what they were before the stone took them. Sad little trade. Oslo counts the wisps; I listen to them. Guess which of us sleeps worse." } ] },
  relictrader: { name: 'Tace Greypalm', prompt: "Buying, or just talking?", topics: [
    { q: 'What do you sell?', a: "Petrified heartwood, shade-iron, a wisp in glass — fairly priced, no haggling at the edge. I came to sell and move on. That was a long while back. The edge keeps what it keeps." },
    { q: "Do you believe Marrow's wisps speak?", a: "Mad as the wind, that one. But I've held her amethysts to my ear of a night, and… well. I don't do it twice. Buy a lantern before you wander — the dusk eats the unlit first." } ] },
  salma_brinewright: { name: 'Salma Tidewright', prompt: "Rake's resting. Ask.", topics: [
    { q: 'How do you harvest the salt?', a: "By feel, at dusk — drag salt in the noon glare and you'll harvest nothing but ache. The pan tells you when it's ready; you just have to stop talking long enough to hear it." },
    { q: 'What troubles you about Bittersong?', a: "He sings that pretty harvest-hymn to make the brinewrights rake faster and thank him for it. I've counted the barges. He's skimming the silver pans, and the fools hum along." } ] },
  bittersong_baron: { name: 'Cael Bittersong', prompt: "A moment for the Salt-Baron?", topics: [
    { q: 'Who runs Rosbrine?', a: "Every grain that leaves these pans pays a toll — a small one, a fair one, mine. Sing while you rake, friend; a happy crew never reads the ledger." },
    { q: "What of Salma's talk of the lagoon?", a: "Charming woman, hard worker — but a forewoman who listens to the water instead of the market will rake herself poor and call it wisdom. Drowned silver under the rose, and no one listening close enough to hear it ring." } ] },
  wrenn_mirrorwalk: { name: 'Wrenn Mirrorwalk', prompt: "Quick — I run at dusk.", topics: [
    { q: "What's it like crossing the Causeway?", a: "Folk pay me to cross 'cause they've all looked into the mirror once and decided not to again. Stick to the planks I marked — step off and the pink mud swallows a boot, then a leg." },
    { q: 'What did you see out there?', a: "Crossed at midnight and my reflection took a step I didn't. Salma's the only one kind to me, so I'll say it plain: whatever's in the second set of stars, she's seen it too — it's why she won't let the young ones rake the far pans anymore." } ] },
};

// Interactive branch — one per NPC, merged into the Chat menu (dialogue.js). The NPC asks the
// PLAYER a question; each reply earns a distinct in-character reaction. Keyed by DIALOGUE key.
export const NPC_BRANCH = {
  elder: { q: 'What keeps the hearth burning?', a: "The fire dwindles not when hearts do honest work. But I fear it grows quieter each season — fewer voices at the table, fewer hands to tend the wood. Tell me: do you think folk still believe the Pact holds, or have we grown too small to matter?", replies: [
    { r: 'The Pact lives through us, in every choice.', a: "Well said. That is what the shrine taught me too. You keep the Pact alive, keeper, whether you know it or not." },
    { r: 'The isles are fading. Prepare for the end.', a: "A sorrowful thought, but honest. I have lived many seasons — I know the weight of endings. Still, I tend the fire. That much, I can do." },
    { r: 'Hearths are just fires. They go cold.', a: "You sound tired, wanderer. Sit. Rest. A hearth is more than flame — it is the space where folk remember they are not alone." } ] },
  ranger: { q: 'Why do you not settle, like others?', a: "The wood made me long ago. To leave it would be to leave myself behind. But I wonder sometimes — do the trees still remember their old songs, or have my footfalls worn the paths too deep?", replies: [
    { r: 'The forest needs you. Reason enough.', a: "You understand. Most folk see only trees and beasts. You see what the forest is trying to keep alive." },
    { r: "You're just running from the village.", a: "Perhaps. But I run toward something too — the only place I have ever felt at home. That matters more than where I am fleeing." },
    { r: 'The wood will outlive us all anyway.', a: "Aye. Which is why I listen to it instead of making demands. The forest teaches patience. Most folk have forgotten how." } ] },
  merchant: { q: 'Is coin truly all that moves you?', a: "A fair question. Coin buys bread, bread feeds folk, folk trade goods and stories. But I'll confess — a fair deal between honest hands does more for my heart than a ledger of gold ever could. Do you trade, or do you merely buy and sell?", replies: [
    { r: 'I trade. There is craft in fair exchange.', a: "Then you are a merchant at heart, stall or no. The best trades are the ones where both folk walk away richer than coin accounts for." },
    { r: 'I take what I need. No more.', a: "Honest, if sparse. But even hermits trade with the world sometimes — they just don't keep ledgers for it." },
    { r: 'Coin is all. The rest is sentiment.', a: "A merchant who thinks that way dies alone with a full purse. I've seen it. It's a poor epitaph." } ] },
  slayermaster: { q: 'Do you hesitate before a contract?', a: "Once, in the early years. Every beast was a life I took with these hands. Now? Hesitation is cruelty — it means another village burns. But I wonder if I've learned too well. Has steel numbed what mercy I once had?", replies: [
    { r: 'Mercy and contracts are opposites.', a: "Perhaps. But a hunter with no mercy left is just a blade without a hand to guide it. Sharp, but lost." },
    { r: "Some beasts don't deserve to die.", a: "You think rightly. That is why I read the contracts careful. I cull what hunts man, what has tasted blood. Not every beast deserves the ledger." },
    { r: 'You hide behind duty to dodge the weight.', a: "That struck home. Perhaps I do. A contract is easier to bear than admitting some nights I dream of all the eyes that close because I opened mine." } ] },
  saga_vael: { q: 'Will the Pact endure if its words are lost?', a: "The verses are dust now — only echoes in my mind. The Founders knew something we have forgotten. But you keep the Pact alive in deed, not song. Is that enough? Can the isle survive on bloodstained hands instead of blessed ones?", replies: [
    { r: 'The Pact is kept in choices, not words.', a: "Then you understand what few do. The Pact is not carved in stone — it is rewoven each day by those who choose to tend the land." },
    { r: 'The old verses are dead. Let them rest.', a: "Spoken like one who has never heard their echo at dusk. They are not dead, keeper — only forgotten. And forgotten things return hungry." },
    { r: 'Words are noise. Power is what matters.', a: "That is what the Prism Tyrant believed too. Power without remembrance becomes cruelty. The verses taught restraint; without them, even justice curdles." } ] },
  saga_trades: { q: 'What if the trades I teach lead to ruin?', a: "Every master wonders this. I teach that hands are the truest inheritance — smithing, fishing, building. But what if I have only given folk sharper edges and called it survival? Do you think the Guild serves the isle, or merely itself?", replies: [
    { r: 'The Guild teaches true. It binds folk.', a: "You see what I hoped to build. A tapestry instead of isolated threads. That belief is what keeps me teaching when doubt comes at dusk." },
    { r: 'Trades are chains called freedom.', a: "A bitter thought. But you are free to trade or refuse — the isle does not enslave. That freedom is the difference between craft and conscription." },
    { r: 'It matters not. Folk survive regardless.', a: "True enough. But surviving and living are not the same. I teach the latter. Whether anyone listens is between them and the isle." } ] },
  warden: { q: 'Do you ever doubt you are strong enough?', a: "Every dawn. A spear and a stare — that is all I have against the dark. The fields depend on a man who can barely keep his knees steady some nights. What do you see when you look at this post?", replies: [
    { r: 'A warden holding back a tide alone.', a: "A kind reading. The fields are safe because I stand here instead of sleeping. That much I know. It is enough." },
    { r: 'You are past your strength. Seek help.', a: "From whom? The isle is thin of hands and thick with need. Besides — if I fall, someone must stand. Better one old man than a younger soul wounded undeserving." },
    { r: 'Your post is pointless. Gronk is gone.', a: "Aye, and the warren still sends raids when the seasons turn. The post stands as long as folk need it. That is the warden's covenant." } ] },
  miner: { q: 'Think a man can dig too deep?', a: "Old Bryn sets down his pick and looks at you straight. Thirty years I've worked these seams, and aye — there's a bottom to knowing. But turning back at every shadow? That's how the forge goes cold and folk go hungry. There's a difference between caution and cowardice.", replies: [
    { r: 'The deeper mines worry me.', a: "Right to worry. But worry without moving gets nobody coal. I listen to the rocks' hunger, not my own fear. So far, the rocks have been honest." },
    { r: 'A man serves the work.', a: "Now you speak sense. Work keeps the body whole and the mind from rotting. Dorrin knows it, Vol knows it. That's why we three make a forge worth tending." },
    { r: 'Some seams want staying buried.', a: "Maybe so. But I've never known a seam to rise up demanding it be left alone. The mountain keeps what it keeps — we only take the answer it gives." } ] },
  smith: { q: 'Can a blade ever be ready for what it must do?', a: "Smith Dorrin runs his thumb along the anvil's edge and considers you. A blade's only ever as ready as the hand that swings it. Steel I can teach. Will? That you bring yourself, or the forge cannot forge it.", replies: [
    { r: 'Better steel makes better choices.', a: "Fancy thinking. Steel is steel. A coward with a greatsword is still a coward — just a heavier one. Come back when you've proven you'll stand." },
    { r: 'Will over steel, then.', a: "Closer to true. But a will without steel dies quick and pointless. The two need each other. Bryn feeds the stone, Vol the fire, I bind them both." },
    { r: 'The anvil decides.', a: "Respect. A good smith reads the metal's grain and works with it, not against it. A blade that fights its own nature shatters. You're learning the forge-mind already." } ] },
  emberwright: { q: 'Does the fire teach you, or you it?', a: "Emberwright Vol closes their eyes, and the glow from the deep vents plays across their face. A foolish question — both at once, always. Fire doesn't learn. It only burns through those who don't listen hard enough to hear its hunger.", replies: [
    { r: 'Fire obeys the strong-willed.', a: "Obeys? Those who think themselves strong enough to command it tend to crisp quick. I don't command it — I answer it. There's a difference the burnt ones never learn." },
    { r: "I'd rather tend water.", a: "Water's a mercy. The Depths don't deal in mercy. But if the water calls you, go answer it. Just don't mistake kindness for weakness." },
    { r: "The mountain wakes, doesn't it?", a: "Sharp ears. It dreams, and we're only the dust motes in its dreaming. Every bar we forge wakes it a little more. Some nights I wonder if we should have let it sleep." } ] },
  fisher: { q: "What's worth taking from the water?", a: "Wren casts her line in a long, easy arc. The water gives only what it's ready to lose. Take more, and it stops giving altogether. The trout know this. Most folk don't.", replies: [
    { r: 'Fish feed the belly.', a: "Aye, belly needs feeding. But take only what mouths will eat, not what greed can hold. The trout don't come back if you've worn out the welcome." },
    { r: "I'd join you fishing.", a: "You've the stillness for it, maybe. Come at dawn — the water's clearest then, and the best words are the ones left unspoken." },
    { r: 'Solitude seems cold.', a: "Cold? Water's never cold to those who belong to it. The trout, the stars, the rhythm of the cast — that's company enough. Louder folk just muddy the water." } ] },
  cinderwarden: { q: 'How long can a warden stand alone against fire?', a: "Cinderwarden Hax looks across the wastes, where heat ripples off the dunes like breath. Long as it takes. There's no one else here. So it's stand the watch or let the wastes swallow what little's left alive.", replies: [
    { r: 'Someone should help you.', a: "Help's a luxury. Vol tends their forge south, I tend my pit here. The isle has two fires now. If both burn clean, that's victory enough for one lifetime." },
    { r: 'Doesn’t the fire ever break you?', a: "Every day. But breaking and falling are different things. I break, I stand, I break again tomorrow. Long as the Ashlord stays below, I'm still dancing." },
    { r: 'A hard choice, staying.', a: "It's the only choice. The town that was here ran. The wastes followed them anyway. I stay, I watch — that's less a choice than a promise gone to habit." } ] },
  frostkeeper: { q: 'Fifteen winters on watch. When does it end?', a: "Nessa's frost-bright eyes study you. The cold bites harder each year, and the Warden waits patient as ice. I made a bargain with this place long ago — I keep the watch, and the watch keeps me alive. Some bargains don't have endings. They just get colder.", replies: [
    { r: 'The cold is its own reward.', a: "She nods — a fraction, but genuine. You understand the language of the north. The fire at my camp will burn warmer for knowing there's a keeper who won't flee it." },
    { r: 'Could someone else take your place?', a: "A thin smile, sharp as icicles. The Warden would hunt them down and hollow them like it hollowed my last relief. The north teaches hard lessons. I've learned them all." },
    { r: 'You could walk away. Nothing stops you.', a: "Her hand tightens on her staff. The ones who walk away don't keep the nightmares at bay. Eira sings to outrun them. I stand still and let them know I'm not afraid." } ] },
  saga_eira: { q: 'Can you sing again without hearing his last verse?', a: "Eira's voice drops low, trembling like a harp string held too tight. The saga never truly ends — the silence after echoes louder than any words. I sing to fill that void, but the void keeps singing back.", replies: [
    { r: 'Then sing louder than it.', a: "She laughs — broken and bright. The northern skalds sing that way: not to be heard, but to be heard first. His ending will not be the loudest thing in my throat." },
    { r: 'Perhaps silence honours him better.', a: "Her eyes glisten. Jale's last song was screaming in the dark, and no one answered. I answer now, every night. He deserves a voice singing back." },
    { r: 'Does Nessa carry the same weight?', a: "She carries his memory standing still. I carry it moving. Together we sing and stand the watch. She knows some songs need two voices to stay sane." } ] },
  lapidary: { q: 'Why cut what is still in pain?', a: "Sten's hands drift over a faceted gem, each edge catching light like a captured whisper. Because silence would be crueler. The Hollow sings — asks me to listen. When you hear a stone crying, you cut it to let the cry escape. Mercy is a sharp blade.", replies: [
    { r: "That's not mercy. That's greed.", a: "He flinches — genuinely. A lapidary is always two people: the craftsman who loves the stone, and the merchant who sells it. I'm losing the argument with myself." },
    { r: 'Could you leave the Hollow unmined?', a: "His laugh is bitter. The Hollow speaks louder every season. At least while I cut, I listen. Better a thief who understands than plunderers who don't." },
    { r: 'Perhaps they want to be made new.', a: "He looks at you with sudden intensity. A kind thought. A skald's thought. Then I have no excuse except this: I cut them because I must, and tell myself it means something." } ] },
  amberwarden: { q: 'Three wardens failed. Why are you certain you won’t?', a: "Rowan's jaw tightens beneath amber-tinged shadow. Certain? I'm not. The three before me tried to kill the blight fast — fought what they didn't understand. I've learned to listen to it instead. Certainty is a luxury I can't afford.", replies: [
    { r: 'Listening to poison only poisons you.', a: "True enough. Most days I taste copper and don't know if it's blood or fae-work. But ignorance dies faster than poison, and I've seen that death three times already." },
    { r: 'Wynn reads it better than you ever could.', a: "She does. That's why I watch her back. A loreseeker who reads can live long enough to matter. She just can't survive alone." },
    { r: "You're going to lose anyway.", a: "Then I'll lose slowly enough to let Wynn finish reading the riddle. Every day I stand is one more day my successor learns what not to do." } ] },
  saga_amber: { q: 'Are you grateful to see the future, or cursed?', a: "Wynn crushes a moonlit leaf between her fingers, its glow dimming. Herbs don't lie — that's the curse. They show the shape of ruin before it arrives. Knowledge without power to act is agony. Knowledge with the smallest chance to act is everything.", replies: [
    { r: "I'd rather die ignorant.", a: "Her voice turns sharp. Then who reads the script the blight is writing? Some of us don't have the mercy of ignorance, and we don't ask pity for it." },
    { r: 'The herbs must lie sometimes.', a: "No. But they speak in riddles — truths hidden in images. Perhaps that's where hope lives: in the small margin between what the herb shows and what I understand of it." },
    { r: 'Rowan is stronger for not seeing it all.', a: "He's stronger because he trusts someone else to carry half the weight. He reads me, I read the herbs. Together we might last. Alone, either of us drowns." } ] },
  saga_calla: { q: 'Did you truly repent, or just run?', a: "Calla's hands grip the ferry's rail, knuckles white. Running and repentance aren't different things. I fled the caldera and never went back — that's cowardice. But I warn every soul off that rock — that's penance. The ferry doesn't make the distinction.", replies: [
    { r: "A coward's true name is coward.", a: "She laughs — sharp and bitter. A fair judgment. But a coward standing watch is worth more than a hero burning in his pride. Let the names fall where they will." },
    { r: 'Have you forgiven the one who unlit it?', a: "Forgive? I gave them my staff and keep the dock. That's not forgiveness — that's surrender. They did what I couldn't, and that haunts me more." },
    { r: 'You could have stopped it from the start.', a: "Yes. That's the stone I carry every tide. I could have burnt the temple instead of the god. I've learned to live very still, so the weight doesn't crush anything else." } ] },
  nomad: { q: 'Did the oasis choose you, or you it?', a: "The oasis doesn't choose. It accepts those who accept its terms — and its thirst. I made a pact with the sand long before I understood what I'd promised. Maybe that's all choosing ever is out here.", replies: [
    { r: "Then you're trapped.", a: "Trapped is what folk call it when they can't leave. I don't leave because I don't want to. That's freedom wearing a desert face." },
    { r: 'What were the terms?', a: "Blood for water. Labour for shelter. And you sing the old songs when the dunes grow too loud at night. The land's memory runs deep out here." },
    { r: 'Could another nomad live here?', a: "The oasis keeps what it kept before me. Whether it'd keep another depends on what they're willing to bury to stay." } ] },
  saga_sefu: { q: 'Do you wish you had never found the city?', a: "Every day. And every night I work past midnight on the chronicle because I must. Some truths are heavier than ignorance, and once you've felt their weight, you can't set them down again.", replies: [
    { r: 'The weight will crush you.', a: "Perhaps. But the sand remembers. If I don't write it, who will? The dunes will just bury it deeper." },
    { r: 'What truth was worth that burden?', a: "That mortals built wonders the desert couldn't swallow — only sleep. That's worth writing, even if it costs me everything." },
    { r: "Some stones shouldn't be unturned.", a: "Zara says that too. Maybe she's right. But I stopped being able to choose the moment I found that iron in the sand." } ] },
  oracle: { q: 'Do the tides ever lie to you?', a: "The water doesn't lie — it forgets. The Drowned King remembers for both of us, and he's mad with salt and centuries. Sometimes what he shows me is true. Sometimes it's what he wants to be true. I've learned not to ask which.", replies: [
    { r: 'That sounds lonely.', a: "The temple is full of voices. I am the only one who can hear them all at once. Loneliness is a mercy by comparison." },
    { r: 'Can you stop reading?', a: "The tides don't pause. Neither do I. The temple would collapse if I looked away — or it would finally wake. I don't know which scares me more." },
    { r: 'Does he mean you harm?', a: "The King wants a witness to his watching. He's kept the bargain so long he's forgotten what it was for. I think he just needs someone to remember he was once something else." } ] },
  pathfinder: { q: 'If a path stayed still, would you walk it?', a: "Not for a day. The stone remembers where it was; the jungle remembers where it's going. A path that didn't move would be a grave. I'll keep hunting in the green that shifts under my feet.", replies: [
    { r: 'Sounds exhausting.', a: "The alternative is thinking you know what's ahead. Out here, that kills you faster than the green ever could." },
    { r: 'Does Jorath ever let you rest?', a: "The serpent moves, so we move. When Jorath sleeps — if he does — maybe then. But I won't be the one to find out." },
    { r: 'Will Itzel survive the ziggurat?', a: "That depends if she's her bloodline's daughter or the green's. Jorath doesn't refuse his own — but he devours pretenders. She'll know which she is at the throne." } ] },
  saga_itzel: { q: 'Does your blood sing near the ziggurat, or do you imagine it?', a: "When I close my eyes, I hear stone thrumming in harmony with bone. When I open them, I see Anouk watching me. Whether that's the crown calling or the jungle testing my faith — both roads lead to Jorath.", replies: [
    { r: "You're afraid of what you'll find.", a: "Afraid of what I already know. The throne is waiting. The serpent is waiting. And I've always known I'd walk that path alone to be worthy of either." },
    { r: 'Your bloodline was never meant to rule.', a: "Then they should have buried the crown deeper. Instead it sings, and I can't unhear it. My blood remembers the shame and the glory both." },
    { r: 'Will you claim it?', a: "If I reach it. If Jorath finds me worthy. If the jungle doesn't decide I'm just another ruin. Ask me again when its venom stops singing in my veins." } ] },
  harbormaster: { q: 'What keeps you tethered to this harbour?', a: "The sea keeps what it's owed — and the harbour keeps the rest. Every ship needs a hand to read the shoals. Some of us just don't have anywhere else to be. But you've still got wandering in your bones. Does the Pact call you, or are you just running?", replies: [
    { r: 'The Pact. I swore it when I came.', a: "Then you've sworn true. The keepers who answer the call are rare — most chase coin or glory. You've the look of someone who keeps their word, even when it costs fingers." },
    { r: "I'm running from something.", a: "The sea won't hide you if the tide means to find you. But the work here is honest, and the docks don't ask questions. Some refuges are built on salt water." },
    { r: 'Neither. I just needed passage.', a: "Fair enough. Then one piece of truth before you sail: anchor lines fray when neglected. Even the strongest rope has a breaking point. Check yours before the storm." } ] },
  saga_corsair: { q: 'Do you regret outliving your crew?', a: "Every night I hear the masts creaking like they're calling up through dark water. My crew scattered like kelp on the tide. Some captains drown at sea; some just last too long afterwards. So aye, I stay alive — but only to owe the debt back to the deep.", replies: [
    { r: "If you've felled Mordrake, his crew can rest.", a: "Then you did what I couldn't. Some captains don't let go of their ships even drowning. At least now my crew has a proper grave instead of dancing on that cursed deck." },
    { r: "The sea takes its due. That's the way.", a: "Aye, the truth of it. The deep takes what it takes. As long as the Galleon stops its groaning, I can finally rest my bones — and let them rest." },
    { r: "Nothing's ever truly gone in the deep.", a: "There you've cut to the bone of it. The dark waters remember every captain, every betrayal. But at least he won't hunt new hunters. That's enough." } ] },
  saga_lagoon: { q: 'Could you have held Mira back from the deep?', a: "Every night I hear her voice singing through the grotto. The deep has a long memory and no mercy. I sent her for pearls, and the reef gave me back her song instead. Does a keeper ever truly hold back someone the water's already named?", replies: [
    { r: "No. She'd have answered that call.", a: "That's what I tell myself before dawn. If Mira's voice was meant for the reef, no chain of mine could've held it. At least now she can rest instead of sing." },
    { r: 'You should have tried.', a: "Perhaps. That's a weight I'll carry deeper than any diver's rope. Gratitude tastes like failure when it comes from another's drowning." },
    { r: 'Freeing her song was half a miracle.', a: "Half is all the deep ever gives us. You brought her back to herself instead of a voice without a name. For that, the divers owe you more than pearls." } ] },
  saga_skyreach: { q: 'Do you still hear the roc-chick crying at night?', a: "Can't sleep without remembering. I cracked the ward-stone to free a dying chick years back, and it grew into the Stormcrown. Every gale that batters the Spire is its grief looking for me. Some nights it sounds like crying; some nights like rage.", replies: [
    { r: 'It fought like it had nothing to lose.', a: "Then I gave it that burden. But at least now it's at peace instead of raging. The sky is only wind again, and that's a mercy I don't deserve but will take." },
    { r: 'It was in pain. I could feel it.', a: "Aye, I knew that pain when I cracked the stone. Mercy and cruelty are the same blade turned different ways. That's the only kindness that Stormcrown will know." },
    { r: 'I think it forgave you, in the end.', a: "Don't. Forgiveness comes too easy from strangers' lips. Setting it down was kinder than any of its old rage. That's all a warden ever owes." } ] },
  druid: { q: 'Do the wolves test you, or you them?', a: "Thornwarden Eld leans against an oak, fingers threading the bark like old roots. Both. The pack is hunger without malice — they kill what they need. But I watch which ones take only what feeds them, and which ones simply kill. The grove needs hunters who know the difference.", replies: [
    { r: 'The forest sounds cruel said that way.', a: "Cruel is a town word. The grove speaks in truth. Mercy is tenderness paid in blood — learning what you can kill and what you must protect. That is wisdom that takes seasons to grow into." },
    { r: 'Do you wish for simpler hunting grounds?', a: "His laugh is soft as wind through needles. Every grove is simple if you listen long enough. But these trees dreamed with my grandmother's grandmother. Leaving would be forgetting." },
    { r: "What's wrong with the scar-bright ones?", a: "The three that walk with eyes like fresh wounds — something older than hunger moves through them. That is why they must be thinned. The grove does not ask why; only that I listen and act." } ] },
  saga_veyra: { q: 'Would you cut your own voice from stone to hear it back?', a: "Veyra's hands are still as marble, turning a small geode in lamplight. You ask if I would trade places with her. Yes. Every hour. But the stone won't let me — it took what it needed, not what I offered. And I keep digging because stopping feels like betrayal.", replies: [
    { r: 'Maybe the stone needed both of you.', a: "Perhaps. But I fed it gems for nine winters thinking I was saving her. Some of us do harm the way we do love — with both hands and no sense of where the gift ends and the wound begins." },
    { r: 'Toll said you were brave. Did you believe him?', a: "Her eyes close. Toll turned to stone so he wouldn't have to lie about his own grief. If that is not bravery, I don't know the word." },
    { r: 'What does the stone need now?', a: "I don't think it knows the difference between need and hunger anymore. And I keep listening, as though someday it might stumble on a note she would recognize." } ] },
  quarryman: { q: 'When the stone speaks through you, whose hand swings the pick?', a: "Quarryman Toll sits very still, his right arm grey to the shoulder now, warm as sun-baked granite. At first it was mine — I could feel the resistance of the seam. Then the pick went where I didn't tell it. By the time I heard Lyse's voice, I don't know whose hand it was anymore.", replies: [
    { r: 'Do you regret it, or accept it?', a: "Both, woven so tight I can't find the thread. Regret would mean I wish it different. Acceptance means I'm not running from what I became. I do both at once, and the stone keeps me warm." },
    { r: "If it hadn't sung like her, would you have stopped?", a: "His gaze settles on the canyon wall. No. The pick knew. The girl's voice was mercy on top of certainty — a reason to stop fighting what was already true." },
    { r: 'Veyra still thinks you the brave one.', a: "Veyra sees kindness in stillness. But I stopped moving to spare her watching me leave. That's not bravery — that's a quiet way of not letting someone else carry the weight." } ] },
  stormcaller: { q: 'When Thruun climbed the peak, did he choose the storm?', a: "Branok stands with boots planted wide, hands open to the highland wind. Blood chooses. Land chooses. The mountain has been roaring since before speech — Thruun just climbed where he was meant to. Now the storm wears him the way a river wears stone. But the stone still remembers it was stone.", replies: [
    { r: 'Is he still kin if the storm speaks?', a: "His eyes flash like distant lightning. Both. Neither. Kin means the blood remembers. His remembers; mine answers. We keep the watch together, even if one is wind and the other bone." },
    { r: 'Do you want to climb the peak yourself?', a: "Want and answer are not the same. The mountain will call when I am meant to climb. Until then I stand below and listen — not to seek the roar, but to hear it and not flinch." },
    { r: 'The druid says you both wake something older.', a: "Eld is right to fear it. The forest and mountain answer each other, and we are only the skin they wear. When it wakes, we will learn if there is a watch high enough to stand against it." } ] },
  saga_spore: { q: 'When you study the fungus, who studies whom?', a: "Hesper sits very still among the soft ground and whisper-tall grasses. His voice comes from very far away. I am a botanist. Or I was. Now the specimens walk, and the walking ones remember their shapes from somewhere deeper than growth. Some evenings I look at my hands and I'm not sure they're mine.", replies: [
    { r: 'Do you ask the walking ones to stop?', a: "I ask. Sometimes they listen. Sometimes I am asking from inside the asking — the one who wants to stop and the one who walks are both me. The difference feels smaller every season." },
    { r: 'Oona was kind to call you botanist.', a: "His eyes focus, and his voice sounds almost human. Calling myself a botanist is a kindness she gave me — a name to hold when the rest is echo and hunger. I keep it close." },
    { r: 'What if you stop listening?', a: "The Chorus would still speak. I would just be one more host, unable to refuse. Listening is the only freedom left. So I listen, and pretend I am still a man observing." } ] },
  faewarden: { q: 'Do you protect the glade, or imprison it?', a: "Oona stands in moonlight that seems to bend around her like water. The glade is a cage, yes — a cage for something older and hungrier than myself. I tend the bars because I love what grows here more than I love my freedom. That is not imprisonment. That is choice, held long enough to shape the world.", replies: [
    { r: "What's locked beneath the glade?", a: "Something that was king once, and chose to hollow itself rather than let it wake. The glade sleeps on his sleep. I tend the roots so both stay dreaming." },
    { r: "Do you trust Ardith's daylight watch?", a: "Trust is a daylight word. I understand her. We tend the same wound from opposite sides — she in signs and omens, I in moonlight and thorns. The glade needs both our languages." },
    { r: 'Could you leave if you wished?', a: "Her smile is sad and ancient. I could step outside tonight. But the thorns would weep, and the sleeper would stir. Leaving is always possible. Leaving cleanly is not." } ] },
  saga_ardith: { q: 'Do you see the future to change it, or to mourn it?', a: "Ardith stands at the Moonspire's edge, hands on stone cold as moonlight. A seer sees. That is curse and crown both. The omen came to me like a shadow on the wall, seasons before the Hollow King began to crack. All I could do was speak and prepare. Seeing is not the same as saving.", replies: [
    { r: 'Could you have stopped it?', a: "Stopped the King hollowing himself? The seal weakening? No. You can speak the warning, not the fate. I was heard as a whisper in a temple. That is the seer's burden — perfect foresight, powerless tongue." },
    { r: 'Does Oona resent you for being right?', a: "She sees differently — what will sleep and what will wake. She bears no resentment, only the weight of knowledge I gave her. She forgave me before I asked." },
    { r: 'What shadow do you see coming next?', a: "Her eyes go distant, the moonlight dimming. Something old is stirring — deeper than the King. The forest and mountain answer each other again. I see three watchers on separate ground, and beneath them something opening its eyes. I cannot stop it. I can only speak." } ] },
  gravekeeper: { q: 'When you bury the dead, do you keep them safe or locked away?', a: "Gravekeeper Sael kneels at a grave's edge, hands deep in black soil. His voice comes up quiet from the earth. Both. Neither. The grave is a promise — you will rest, and nothing will pull you back up to weep and hunger. But the mire is restless. Mortrax changed the rules.", replies: [
    { r: 'Did you choose to stay and tend them?', a: "I was a healer. When the plague came I buried my own village with these hands. Then they woke up wrong. I've been here since, keeping them down. It's not choice anymore. It's debt." },
    { r: 'Is Mortrax still a person at all?', a: "He was a scholar, a man with a mind and a fear of what comes after. Now he's a mouth for a hundred voices. He wanted not to end. I granted it. We both suffer." },
    { r: 'The other wardens speak of you.', a: "Sael looks up, a thin smile crossing his mouth. Eld in his grove, Oona in her glade, Branok on his peaks. All of us holding something back. We wave across the distance. The dead, at least, ask no more than rest." } ] },
};

// Achievements — re-evaluated on events; cond reads live game state (G).
export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood',      desc: 'Defeat any enemy.',            cond: (G) => G.stats.kills >= 1 },
  { id: 'hunter',      name: 'Hunter',           desc: 'Defeat 25 enemies.',           cond: (G) => G.stats.kills >= 25 },
  { id: 'emberfang',   name: 'Emberbane',        desc: 'Defeat Emberfang.',            cond: (G) => G.stats.bosses.has('ember_boss') },
  { id: 'wyrmslayer',  name: 'Wyrmslayer',       desc: 'Defeat the Sandwyrm.',         cond: (G) => G.stats.bosses.has('sandwyrm') },
  { id: 'thaw',        name: 'Thaw the Warden',  desc: 'Defeat the Frost Warden.',     cond: (G) => G.stats.bosses.has('frost_warden') },
  { id: 'globetrotter',name: 'Globetrotter',     desc: 'Set foot in every region.',    cond: (G) => G.stats.regions.size >= (G.world ? G.world.regions.length : 13) },
  { id: 'jeweller',    name: 'Jeweller',         desc: 'Craft a piece of jewelry.',    cond: (G) => G.stats.crafted >= 1 },
  { id: 'suited',      name: 'Suited Up',        desc: 'Wear a full armour set.',      cond: (G) => !!(G.fullSet && G.fullSet()) },
  { id: 'tycoon',      name: 'Tycoon',           desc: 'Hold 1000 gold at once.',      cond: (G) => G.inventory.count('gold') >= 1000 },
  { id: 'isle_hero',   name: 'Isle Hero',        desc: 'Complete every quest.',        cond: (G) => G.quests.all().every((q) => q.status === 'complete') },
  { id: 'jack',        name: 'Jack of Trades',   desc: 'Reach total level 40.',        cond: (G) => G.skills.total() >= 40 },
  { id: 'specialist',  name: 'Specialist',       desc: 'Reach level 20 in any skill.', cond: (G) => G.skills.DEFS.some((d) => G.skills.level(d.key) >= 20) },
  { id: 'firestarter', name: 'Firestarter',      desc: 'Reach Firemaking level 20.',   cond: (G) => G.skills.level('firemaking') >= 20 },
  { id: 'bonelord',    name: 'Lichbane',         desc: 'Defeat Bonelord Mortrax.',     cond: (G) => G.stats.bosses.has('bonelord') },
  { id: 'warbreaker',  name: 'Warbreaker',       desc: 'Defeat Warchief Gronk.',       cond: (G) => G.stats.bosses.has('warchief') },
  { id: 'prismshatter',name: 'Prismshatter',     desc: 'Defeat the Prism Tyrant.',     cond: (G) => G.stats.bosses.has('prism_tyrant') },
  { id: 'cinderfall',  name: 'Cinderfall',       desc: 'Defeat the Cinder Colossus.',   cond: (G) => G.stats.bosses.has('cinder_colossus') },
  { id: 'tideturner',  name: 'Tideturner',       desc: 'Defeat the Drowned King.',      cond: (G) => G.stats.bosses.has('drowned_king') },
  { id: 'dungeon_master', name: 'Dungeon Master', desc: 'Defeat all five dungeon bosses.', cond: (G) => ['bonelord', 'warchief', 'prism_tyrant', 'cinder_colossus', 'drowned_king'].every((k) => G.stats.bosses.has(k)) },
  { id: 'serpentbane', name: 'Serpentbane',  desc: 'Defeat Jorath the Coiled.',     cond: (G) => G.stats.bosses.has('jorath') },
  { id: 'ashbreaker',  name: 'Ashbreaker',   desc: 'Defeat Ashlord Vurak.',         cond: (G) => G.stats.bosses.has('vurak') },
  { id: 'stormbreaker',name: 'Stormbreaker', desc: 'Defeat Stormcaller Thruun.',    cond: (G) => G.stats.bosses.has('thruun') },
  { id: 'faefriend',   name: 'Fae-friend',   desc: 'Banish the Hollow King.',       cond: (G) => G.stats.bosses.has('hollow_king') },
  { id: 'frontier',    name: 'Frontier Legend', desc: 'Defeat all four frontier bosses.', cond: (G) => ['jorath', 'vurak', 'thruun', 'hollow_king'].every((k) => G.stats.bosses.has(k)) },
];
