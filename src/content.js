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
  clue_scroll:     { name: 'Clue Scroll',      icon: '📜', type: 'clue', desc: 'Tap to read — a treasure trail to a hidden reward casket.' },
  // Farm produce — collected from your livestock, sold at the Farm Foreman.
  egg:  { name: 'Egg',  icon: '🥚', type: 'material', desc: 'Fresh from your hens. Sell at the farm.' },
  milk: { name: 'Milk', icon: '🥛', type: 'material', desc: 'From your dairy cows. Sell at the farm.' },
  wool: { name: 'Wool', icon: '🧶', type: 'material', desc: 'Shorn from your sheep. Sell at the farm.' },

  raw_shrimp:    { name: 'Raw Shrimp', icon: '🦐', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  raw_trout:     { name: 'Raw Trout',  icon: '🐟', type: 'material',   desc: 'Cook it at a fire to make it edible.' },
  cooked_shrimp: { name: 'Shrimp',     icon: '🍤', type: 'consumable', heal: 14, desc: 'Cooked. Restores 14 HP.' },
  cooked_trout:  { name: 'Trout',      icon: '🍤', type: 'consumable', heal: 26, desc: 'Cooked. Restores 26 HP.' },

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
};

// Smelting recipes (furnace) and weapon forge tiers (anvil).
export const SMELT = [
  { in: { copper_ore: 1 }, out: 'bronze_bar', xp: 18 },
  { in: { iron_ore: 1, coal: 1 }, out: 'iron_bar', xp: 26 },
  { in: { mithril_ore: 1, coal: 2 }, out: 'mithril_bar', xp: 50 },
];
export const COOK = { raw_shrimp: 'cooked_shrimp', raw_trout: 'cooked_trout', crop: 'cooked_greens' };
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
];
export const SETS = {
  guardian: { name: 'Guardian', def: 10, melee: 8, maxhp: 20 },
  ranger:   { name: 'Ranger', ranged: 12, def: 4, maxhp: 10 },
  sorcerer: { name: 'Sorcerer', magic: 14, maxhp: 10 },
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
];

// Fletching bench recipes (Woodcutting -> Ranged). qty = how many you get per craft; level gates the tier.
export const FLETCH = [
  { out: 'shortbow',      cost: { wood: 1 }, xp: 20, qty: 1, level: 1 },
  { out: 'longbow',       cost: { wood: 2 }, xp: 48, qty: 1, level: 10 },
  { out: 'arrow_shaft',   cost: { wood: 1 }, xp: 8,  qty: 8, level: 1 },
  { out: 'bronze_arrow',  cost: { arrow_shaft: 8, feather: 4, bronze_bar: 1 }, xp: 24, qty: 8, level: 1 },
  { out: 'iron_arrow',    cost: { arrow_shaft: 8, feather: 4, iron_bar: 1 },   xp: 42, qty: 8, level: 15 },
  { out: 'mithril_arrow', cost: { arrow_shaft: 8, feather: 4, mithril_bar: 1 }, xp: 80, qty: 8, level: 35 },
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
];

// Ambient mobile NPCs (not quest-givers): patrolling guard squads + lone wanderers
// that walk around to make the world feel alive. Spawned + driven in entities.js.
export const WANDERERS = [
  { kind: 'squad',  name: 'Hearth Watch', color: 0x8a93ad, helm: 0xc2ccd6, count: 4, speed: 2.3, loop: [{ x: -16, z: -8 }, { x: -16, z: -30 }, { x: 20, z: -30 }, { x: 20, z: -8 }] },
  { kind: 'squad',  name: 'Harbor Guard', color: 0x3a6a8a, helm: 0x2a4a5a, count: 3, speed: 2.2, loop: [{ x: 66, z: 178 }, { x: 66, z: 196 }, { x: 94, z: 196 }, { x: 94, z: 178 }] },
  { kind: 'wander', name: 'Villager',  color: 0x9a6a3a, home: { x: 12, z: -22 }, radius: 12, speed: 1.5 },
  { kind: 'wander', name: 'Monk',      color: 0x6a6a78, home: { x: -2, z: -6 },  radius: 9,  speed: 1.2 },
  { kind: 'wander', name: 'Merchant',  color: 0xc8a23a, home: { x: 32, z: 100 }, radius: 11, speed: 1.4 },
  { kind: 'wander', name: 'Dockhand',  color: 0x4a8f7a, home: { x: 88, z: 180 }, radius: 9,  speed: 1.5 },
];

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
  wisp:      { name: 'Fae Wisp',  hp: 62,  dmg: 18, speed: 5.0, xp: 185, color: 0xc6a8ff, aggro: 13, shape: 'beast', scale: 0.6, loot: { fae_dust: 1 } },
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
};
// The style a foe ATTACKS with (drives Protection prayers). Default melee; only casters/archers are tagged.
export const ATK_STYLE = {
  wraith: 'magic', tide_priest: 'magic', wisp: 'magic', frost_warden: 'magic', bonelord: 'magic',
  prism_tyrant: 'magic', hollow_king: 'magic', drowned_king: 'magic', drowned_captain: 'magic',
  storm_harpy: 'ranged', thruun: 'ranged', warchief: 'ranged',
};

// ---------- Attack stances ----------  (combat risk/reward toggle; defShare routes kill-xp into Defence)
export const ATTACK_STYLES = {
  accurate:   { name: 'Accurate',   icon: '🎯', dmgMult: 1.00, desc: 'Balanced. Full skill XP.' },
  aggressive: { name: 'Aggressive', icon: '💢', dmgMult: 1.18, desc: '+18% damage, but you guard less (take ~12% more).' },
  defensive:  { name: 'Defensive',  icon: '🛡️', dmgMult: 0.90, defShare: 0.5, defBonus: 6, desc: '−10% damage, +6 armour, half XP into Defence.' },
  controlled: { name: 'Controlled', icon: '⚖️', dmgMult: 1.00, defShare: 0.33, desc: 'Balanced; a third of XP into Defence.' },
};

export const ENEMY_SPAWNS = [
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
  q_vurak: { name: 'Ashlord Vurak', giver: 'cinderwarden', requires: 'q_ashpit', desc: 'Destroy Ashlord Vurak in the Ashpit.', objectives: [{ id: 'boss', type: 'kill', enemy: 'vurak', count: 1 }], rewards: { xp: { combat: 1050, slayer: 280 }, items: { gold: 400 } } },
  // --- Stormhold Highlands / Thunderpeak Hold ---
  q_thunder: { name: 'Storm Riders', giver: 'stormcaller', startsAvailable: true, desc: 'Drive the storm harpies from the Stormhold Highlands.', objectives: [{ id: 'k', type: 'kill', enemy: 'storm_harpy', count: 4 }], rewards: { xp: { combat: 340, defence: 120 }, items: { gold: 140 } } },
  q_thruun: { name: 'Stormcaller Thruun', giver: 'stormcaller', requires: 'q_thunder', desc: 'Defeat the storm titan Thruun in Thunderpeak Hold.', objectives: [{ id: 'boss', type: 'kill', enemy: 'thruun', count: 1 }], rewards: { xp: { combat: 1100, ranged: 220 }, items: { gold: 420 } } },
  // --- Moonlit Glade / Feywild Hollow ---
  q_fey: { name: 'Tangled Thorns', giver: 'faewarden', startsAvailable: true, desc: 'Clear the thornlings creeping out of the Feywild Hollow.', objectives: [{ id: 'k', type: 'kill', enemy: 'thornling', count: 3 }], rewards: { xp: { combat: 360, herblore: 150 }, items: { gold: 150 } } },
  q_hollow: { name: 'The Hollow King', giver: 'faewarden', requires: 'q_fey', desc: 'Banish the Hollow King in the heart of the Feywild.', objectives: [{ id: 'boss', type: 'kill', enemy: 'hollow_king', count: 1 }], rewards: { xp: { combat: 1200, magic: 240 }, items: { gold: 460 } } },

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
  q_galleon: { name: 'The Drowned Galleon', giver: 'harbormaster', requires: 'q_harbor', desc: 'Board the low-tide wreck and end Captain Mordrake.', objectives: [{ id: 'boss', type: 'kill', enemy: 'drowned_captain', count: 1 }], rewards: { xp: { combat: 1040, slayer: 240 }, items: { gold: 420 } } },
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
function sagaDialogue(name, stages, outro) {
  return {
    root: (G) => {
      for (const s of stages) {
        const st = G.quests.status(s.id);
        if (st === 'complete') continue;
        if (st === 'available') return node(name, s.intro, [{ label: s.accept, action: (g) => g.quests.accept(s.id), to: null }, end('Not yet.')]);
        if (st === 'active') {
          if (G.quests.isReady(s.id)) return node(name, s.done, [{ label: 'Claim reward.', action: (g) => g.quests.complete(s.id), to: null }]);
          const rem = G.quests.objectives(s.id).filter((o) => !o.done).map((o) => '• ' + o.text).join('   ');
          return node(name, s.active + '  Remaining:  ' + rem, [end('On it.')]);
        }
        return node(name, 'Finish the earlier trial first.', [end('Right.')]);
      }
      return node(name, outro || 'The saga is told. You are its hero.', [end('Farewell.')]);
    },
  };
}

export const DIALOGUE = {
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
      if (!s || !s.active) return node('Slayer Master Krael', 'Looking for a contract? I’ll mark a beast for you to cull — good Slayer training.',
        [{ label: 'Assign me a task.', action: (g) => g.slayerAssign(), to: 'assigned' }, end('Not now.')]);
      if (s.progress >= s.count) return node('Slayer Master Krael', `${s.count} ${ENEMIES[s.enemy].name}s slain — contract complete.`,
        [{ label: 'Claim reward.', action: (g) => g.slayerClaim(), to: 'claimed' }]);
      return node('Slayer Master Krael', `Your contract: slay ${s.count} ${ENEMIES[s.enemy].name}s (${s.progress}/${s.count}).`, [end('On it.')]);
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
    { key: 'herb', price: 9 },
    { key: 'bronze_bar', price: 16 },
    { key: 'iron_bar', price: 34 },
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
