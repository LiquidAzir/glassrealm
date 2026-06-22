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
};

// Smelting recipes (furnace) and weapon forge tiers (anvil).
export const SMELT = [
  { in: { copper_ore: 1 }, out: 'bronze_bar', xp: 18 },
  { in: { iron_ore: 1, coal: 1 }, out: 'iron_bar', xp: 26 },
];
export const COOK = { raw_shrimp: 'cooked_shrimp', raw_trout: 'cooked_trout', crop: 'cooked_greens' };
// Herblore brewing (cauldron) and Prayer buffs.
export const BREW = [{ in: { herb: 1 }, out: 'strong_potion', xp: 32 }];
export const PRAYERS = [
  { key: 'stoneskin', name: 'Stone Skin', level: 1,  drain: 0.5, dmgTaken: 0.7, desc: 'Take 30% less damage.' },
  { key: 'keenedge',  name: 'Keen Edge',  level: 8,  drain: 0.6, dmgDealt: 1.2, desc: 'Deal 20% more damage.' },
  { key: 'rapidheal', name: 'Rapid Heal', level: 15, drain: 0.4, regen: 1.2,    desc: 'Slowly regenerate health.' },
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
  { key: 'eira',   name: 'Skald Eira',      color: 0xbfe0ff, pos: { x: 90, z: -78 },  dialogue: 'saga_eira' },
  { key: 'sefu',   name: 'Chronicler Sefu', color: 0xe3c277, pos: { x: 30, z: 108 },  dialogue: 'saga_sefu' },
  { key: 'itzel',  name: 'Wayfarer Itzel',  color: 0x4fd06a, pos: { x: 180, z: 32 },  dialogue: 'saga_itzel' },
  { key: 'ardith', name: 'Seer Ardith',     color: 0xc6a8ff, pos: { x: -29, z: -104 }, dialogue: 'saga_ardith' },
];

export const ENEMIES = {
  boar:   { name: 'Wild Boar',    hp: 24,  dmg: 6,  speed: 3.4, xp: 55,  color: 0x9a5a38, aggro: 10, shape: 'beast',    loot: { meat: 1, pelt: 1, bones: 1 } },
  wolf:   { name: 'Grey Wolf',    hp: 36,  dmg: 9,  speed: 4.6, xp: 85,  color: 0x9aa0a8, aggro: 13, shape: 'beast',    loot: { pelt: 1, meat: 1, bones: 1 } },
  bandit: { name: 'Ashen Bandit', hp: 52,  dmg: 13, speed: 3.9, xp: 130, color: 0x8a6f9a, aggro: 12, shape: 'humanoid', loot: { gold: 18, coal: 1, bones: 1 } },
  frost_wolf: { name: 'Frost Wolf',  hp: 60, dmg: 15, speed: 4.8, xp: 165, color: 0xcfe0f2, aggro: 14, shape: 'beast', loot: { pelt: 1, bones: 1, coal: 1 } },
  scorpion:   { name: 'Sand Scorpion', hp: 46, dmg: 12, speed: 3.6, xp: 120, color: 0xd8a85a, aggro: 11, shape: 'beast', loot: { bones: 1, iron_ore: 1 } },
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
  serpent:        { name: 'Coil Serpent',   hp: 64,  dmg: 16, speed: 4.0, xp: 165, color: 0x3f9a4a, aggro: 12, shape: 'beast', scale: 0.8, loot: { vine_coil: 1, bones: 1 } },
  glimmer_bat:    { name: 'Glimmer Bat',    hp: 56,  dmg: 14, speed: 5.0, xp: 150, color: 0x9bd0ff, aggro: 13, shape: 'beast', scale: 0.7, loot: { crystal_shard: 1 } },
  jorath:         { name: 'Jorath the Coiled', hp: 330, dmg: 30, speed: 4.0, xp: 880, color: 0x2f8a3e, aggro: 18, shape: 'beast', scale: 2.3, boss: true, loot: { gold: 280, coilfang_spear: 1, vine_coil: 4, emerald: 2 }, rare: { item: 'serpent_eye', chance: 0.3 } },
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
    name: 'The Ember Beast', giver: 'smith', requires: 'q_supply',
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
  q_jorath: { name: 'Jorath the Coiled', giver: 'pathfinder', requires: 'q_zigg', desc: 'Slay the great serpent Jorath atop the ziggurat.', objectives: [{ id: 'boss', type: 'kill', enemy: 'jorath', count: 1 }], rewards: { xp: { combat: 950, slayer: 240 }, items: { gold: 360 } } },
  // --- Scorched Wastes / The Ashpit ---
  q_ashpit: { name: 'Into the Ashes', giver: 'cinderwarden', startsAvailable: true, desc: 'Put down the ash hounds prowling the Scorched Wastes.', objectives: [{ id: 'k', type: 'kill', enemy: 'ash_hound', count: 3 }], rewards: { xp: { combat: 320 }, items: { gold: 130 } } },
  q_vurak: { name: 'Ashlord Vurak', giver: 'cinderwarden', requires: 'q_ashpit', desc: 'Destroy Ashlord Vurak in the Ashpit.', objectives: [{ id: 'boss', type: 'kill', enemy: 'vurak', count: 1 }], rewards: { xp: { combat: 1050, slayer: 280 }, items: { gold: 400 } } },
  // --- Stormhold Highlands / Thunderpeak Hold ---
  q_thunder: { name: 'Storm Riders', giver: 'stormcaller', startsAvailable: true, desc: 'Drive the storm harpies from the Stormhold Highlands.', objectives: [{ id: 'k', type: 'kill', enemy: 'storm_harpy', count: 4 }], rewards: { xp: { combat: 340, defence: 120 }, items: { gold: 140 } } },
  q_thruun: { name: 'Stormcaller Thruun', giver: 'stormcaller', requires: 'q_thunder', desc: 'Defeat the storm titan Thruun in Thunderpeak Hold.', objectives: [{ id: 'boss', type: 'kill', enemy: 'thruun', count: 1 }], rewards: { xp: { combat: 1100, ranged: 220 }, items: { gold: 420 } } },
  // --- Moonlit Glade / Feywild Hollow ---
  q_fey: { name: 'Tangled Thorns', giver: 'faewarden', startsAvailable: true, desc: 'Clear the thornlings creeping out of the Feywild Hollow.', objectives: [{ id: 'k', type: 'kill', enemy: 'thornling', count: 3 }], rewards: { xp: { combat: 360, herblore: 150 }, items: { gold: 150 } } },
  q_hollow: { name: 'The Hollow King', giver: 'faewarden', requires: 'q_fey', desc: 'Banish the Hollow King in the heart of the Feywild.', objectives: [{ id: 'boss', type: 'kill', enemy: 'hollow_king', count: 1 }], rewards: { xp: { combat: 1200, magic: 240 }, items: { gold: 460 } } },

  // ===== Sagas — long, multi-objective, multi-stage questlines =====
  q_saga_v1: { name: 'The Verdant Pact', saga: true, giver: 'vael', startsAvailable: true, desc: 'Loremaster Vael’s first trial: gather Verdant driftwood and copper, and cull the boars.', objectives: [{ id: 'wood', type: 'have', item: 'wood', count: 6 }, { id: 'cu', type: 'have', item: 'copper_ore', count: 4 }, { id: 'boar', type: 'kill', enemy: 'boar', count: 3 }], rewards: { xp: { woodcutting: 200, mining: 150, combat: 200 }, items: { gold: 120 } } },
  q_saga_v2: { name: 'The Verdant Pact — Emberfall', saga: true, giver: 'vael', requires: 'q_saga_v1', desc: 'End Emberfang at the peak, and break the bandits who serve the flame.', objectives: [{ id: 'boss', type: 'kill', enemy: 'ember_boss', count: 1 }, { id: 'bandit', type: 'kill', enemy: 'bandit', count: 3 }], rewards: { xp: { combat: 700, defence: 150 }, items: { gold: 300, vigor_amulet: 1 } } },

  q_saga_f1: { name: 'Trials of Frost', saga: true, giver: 'eira', startsAvailable: true, desc: 'Skald Eira tests you against the long cold: frost wolves, coal, and trout.', objectives: [{ id: 'fw', type: 'kill', enemy: 'frost_wolf', count: 4 }, { id: 'coal', type: 'have', item: 'coal', count: 6 }, { id: 'trout', type: 'have', item: 'raw_trout', count: 3 }], rewards: { xp: { combat: 240, fishing: 160, mining: 120 }, items: { gold: 140 } } },
  q_saga_f2: { name: 'Trials of Frost — Warden’s End', saga: true, giver: 'eira', requires: 'q_saga_f1', desc: 'Face the Frost Warden and scatter the last of the pack.', objectives: [{ id: 'boss', type: 'kill', enemy: 'frost_warden', count: 1 }, { id: 'fw', type: 'kill', enemy: 'frost_wolf', count: 3 }], rewards: { xp: { combat: 780, defence: 200 }, items: { gold: 320 } } },

  q_saga_d1: { name: 'The Buried Wyrm', saga: true, giver: 'sefu', startsAvailable: true, desc: 'Chronicler Sefu seeks the truth beneath the dunes: scorpions and iron ore.', objectives: [{ id: 'scorp', type: 'kill', enemy: 'scorpion', count: 5 }, { id: 'iron', type: 'have', item: 'iron_ore', count: 6 }], rewards: { xp: { combat: 240, mining: 180 }, items: { gold: 140 } } },
  q_saga_d2: { name: 'The Buried Wyrm — Wyrmfall', saga: true, giver: 'sefu', requires: 'q_saga_d1', desc: 'Slay the Sandwyrm that sleeps in the deep desert.', objectives: [{ id: 'boss', type: 'kill', enemy: 'sandwyrm', count: 1 }, { id: 'scorp', type: 'kill', enemy: 'scorpion', count: 4 }], rewards: { xp: { combat: 820, slayer: 200 }, items: { gold: 340 } } },

  q_saga_j1: { name: 'The Coiled Throne', saga: true, giver: 'itzel', startsAvailable: true, desc: 'Wayfarer Itzel guides you into the deep jungle: serpents and panthers.', objectives: [{ id: 'serp', type: 'kill', enemy: 'serpent', count: 5 }, { id: 'panther', type: 'kill', enemy: 'jungle_panther', count: 3 }], rewards: { xp: { combat: 300, woodcutting: 160 }, items: { gold: 170 } } },
  q_saga_j2: { name: 'The Coiled Throne — Jorath', saga: true, giver: 'itzel', requires: 'q_saga_j1', desc: 'Ascend the ziggurat and end Jorath the Coiled.', objectives: [{ id: 'boss', type: 'kill', enemy: 'jorath', count: 1 }, { id: 'bat', type: 'kill', enemy: 'glimmer_bat', count: 4 }], rewards: { xp: { combat: 1000, slayer: 220 }, items: { gold: 400 } } },

  q_saga_g1: { name: 'The Hollow Crown', saga: true, giver: 'ardith', startsAvailable: true, desc: 'Seer Ardith reads a dark omen: wisps, thornlings, and moonlit herbs.', objectives: [{ id: 'wisp', type: 'kill', enemy: 'wisp', count: 4 }, { id: 'thorn', type: 'kill', enemy: 'thornling', count: 3 }, { id: 'herb', type: 'have', item: 'herb', count: 4 }], rewards: { xp: { combat: 340, herblore: 180 }, items: { gold: 180 } } },
  q_saga_g2: { name: 'The Hollow Crown — King of Thorns', saga: true, giver: 'ardith', requires: 'q_saga_g1', desc: 'Banish the Hollow King and ground the storm harpies that herald him.', objectives: [{ id: 'boss', type: 'kill', enemy: 'hollow_king', count: 1 }, { id: 'harpy', type: 'kill', enemy: 'storm_harpy', count: 4 }], rewards: { xp: { combat: 1200, magic: 240 }, items: { gold: 460 } } },
};

export function objectiveText(obj, n) {
  if (obj.type === 'have') return `Gather ${ITEMS[obj.item].name} (${n}/${obj.count})`;
  if (obj.type === 'kill') return `Defeat ${ENEMIES[obj.enemy].name}${obj.count > 1 ? 's' : ''} (${n}/${obj.count})`;
  return `(${n}/${obj.count})`;
}

const node = (speaker, text, choices) => ({ speaker, text, choices });
const end = (label) => ({ label, to: null });

// Factory for a two-quest dungeon NPC: a trash-cull quest (objective id 'k'),
// then a boss quest (objective id 'boss'). cfg supplies all the flavour text.
function dungeonChain(name, cfg) {
  return {
    root: (G) => {
      const s1 = G.quests.status(cfg.q1);
      if (s1 === 'available') return node(name, cfg.intro1, [{ label: cfg.accept1, action: (g) => g.quests.accept(cfg.q1), to: 'a1' }, end('Not now.')]);
      if (s1 === 'active') {
        const k = G.quests.progress(cfg.q1, 'k');
        if (k >= cfg.n1) return node(name, cfg.done1, [{ label: 'Claim reward.', action: (g) => g.quests.complete(cfg.q1), to: 't1' }]);
        return node(name, `${cfg.n1 - k} ${cfg.foe1} still ${cfg.verb1}. ${cfg.where1}`, [end('On it.')]);
      }
      const s2 = G.quests.status(cfg.q2);
      if (s2 === 'available') return node(name, cfg.intro2, [{ label: cfg.accept2, action: (g) => g.quests.accept(cfg.q2), to: 'a2' }, end('Not yet.')]);
      if (s2 === 'active') {
        if (G.quests.progress(cfg.q2, 'boss') >= 1) return node(name, cfg.done2, [{ label: 'Claim reward.', action: (g) => g.quests.complete(cfg.q2), to: 't2' }]);
        return node(name, cfg.hint2, [end('On the hunt.')]);
      }
      if (s2 === 'complete') return node(name, cfg.outro, [end('Farewell.')]);
      return node(name, cfg.idle, [end('Aye.')]);
    },
    a1: node(name, cfg.a1, [end('Understood.')]),
    t1: node(name, cfg.t1, [end('Thanks.')]),
    a2: node(name, cfg.a2, [end('Understood.')]),
    t2: node(name, cfg.t2, [end('Ha!')]),
  };
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
  }),

  saga_vael: sagaDialogue('Loremaster Vael', [
    { id: 'q_saga_v1', intro: 'Sit, traveler. Every isle needs a hero, and heroes are forged in deeds, not boasts. Bring me Verdant driftwood and copper, and cull the boars that trouble the wood. So begins the Verdant Pact.', accept: 'I accept the Pact.', active: 'The Pact endures, friend.', done: 'Wood, copper, and the boars scattered — you have the makings of a legend.' },
    { id: 'q_saga_v2', intro: 'Now the true test of the Pact: Emberfang, the beast of the peak, and the bandits who serve the flame. End them both and the Verdant will be safe.', accept: 'It will be done.', active: 'Emberfang still smoulders on the peak.', done: 'Emberfang fallen and the bandits broken — the Verdant Pact is fulfilled. Wear this amulet with pride.' },
  ], 'The Verdant Pact is the first of your legends. Walk tall.'),
  saga_eira: sagaDialogue('Skald Eira', [
    { id: 'q_saga_f1', intro: 'The cold tests all who linger. Thin the frost wolves, dig coal against the dark, and land trout from the ice — and I will sing the Trials of Frost.', accept: 'I’ll brave the cold.', active: 'The cold has not beaten you yet.', done: 'Wolves, coal, and a fine catch — you endure where others freeze.' },
    { id: 'q_saga_f2', intro: 'One trial remains: the Frost Warden in the cavern, and the last of his pack. Break them and winter loosens its grip.', accept: 'I’ll end the Warden.', active: 'The Warden still broods in the ice.', done: 'The Warden is undone — the snows will sing of you, frostwalker.' },
  ], 'The Trials of Frost are passed. The cold knows your name now.'),
  saga_sefu: sagaDialogue('Chronicler Sefu', [
    { id: 'q_saga_d1', intro: 'The dunes hide an old truth, and a buried wyrm. First, clear the scorpions and bring me iron from the red rock — proof you can survive the deep desert.', accept: 'I’ll dig in.', active: 'The desert is patient. Are you?', done: 'Scorpions cleared and iron in hand — you’re ready for what sleeps below.' },
    { id: 'q_saga_d2', intro: 'Now: the Sandwyrm itself, and the swarm that guards its rest. Lay the wyrm low and the Buried Wyrm saga is yours.', accept: 'I’ll wake and end it.', active: 'The Sandwyrm still slumbers in the deep south.', done: 'The Sandwyrm falls! The dunes will whisper your name on the wind.' },
  ], 'The Buried Wyrm is unearthed and ended. A true desert tale.'),
  saga_itzel: sagaDialogue('Wayfarer Itzel', [
    { id: 'q_saga_j1', intro: 'The Kytari jungle guards its throne jealously. Cut through the serpents and panthers that haunt the ziggurat’s approach — then we speak of the Coiled Throne.', accept: 'Lead the way.', active: 'The green is thick with fang and claw still.', done: 'You cut a clean path through the green. The throne lies open.' },
    { id: 'q_saga_j2', intro: 'Atop the ziggurat coils Jorath, and his glimmer-bats wheel in the dark. End the great serpent to claim the Coiled Throne.', accept: 'I’ll take the throne.', active: 'Jorath still coils at the summit.', done: 'Jorath slain — the Coiled Throne is yours, and the Kytari are in your debt.' },
  ], 'The Coiled Throne is taken. The jungle bows to you.'),
  saga_ardith: sagaDialogue('Seer Ardith', [
    { id: 'q_saga_g1', intro: 'I have read a dark omen in the moonlight, hero. Wisps and thornlings stir, and I need moonlit herbs to scry true. Tend the glade and gather for me.', accept: 'I’ll tend the glade.', active: 'The omen darkens. Hurry, hero.', done: 'The glade quiets and the herbs glow true — now I see the heart of it.' },
    { id: 'q_saga_g2', intro: 'The omen is the Hollow King, and the storm harpies that herald his waking. Banish him, ground them, and lift the Hollow Crown from this land.', accept: 'I’ll end the omen.', active: 'The Hollow King still holds his court.', done: 'The Hollow King is banished! The moonlight is clean again — the Hollow Crown saga is complete.' },
  ], 'The Hollow Crown is broken. The Fae will sing of you in moonlight.'),
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
    wood: 3, berry: 2, herb: 6, pelt: 8, meat: 5, copper_ore: 6, iron_ore: 11, coal: 5,
    raw_shrimp: 3, raw_trout: 6, cooked_shrimp: 5, cooked_trout: 9, bronze_bar: 14, iron_bar: 28, relic: 600,
    bronze_sword: 20, iron_sword: 45, steel_sword: 80, oak_bow: 30, yew_bow: 70,
    apprentice_staff: 35, ember_staff: 80, leather_armor: 20, iron_armor: 55, steel_armor: 95,
    bones: 2, seeds: 2, crop: 4, cooked_greens: 10, strong_potion: 20,
    bone_shard: 10, goblin_tooth: 8, crystal_shard: 14, magma_core: 16, pearl: 22,
    wraithblade: 130, stormstring_bow: 110, prism_staff: 135, cinderforge_axe: 150, tidecaller_trident: 180,
    vine_coil: 12, demon_ash: 16, storm_shard: 18, fae_dust: 20,
    coilfang_spear: 150, ashbringer: 200, tempest_bow: 140, faewild_staff: 170,
  },
};

// Achievements — re-evaluated on events; cond reads live game state (G).
export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood',      desc: 'Defeat any enemy.',            cond: (G) => G.stats.kills >= 1 },
  { id: 'hunter',      name: 'Hunter',           desc: 'Defeat 25 enemies.',           cond: (G) => G.stats.kills >= 25 },
  { id: 'emberfang',   name: 'Emberbane',        desc: 'Defeat Emberfang.',            cond: (G) => G.stats.bosses.has('ember_boss') },
  { id: 'wyrmslayer',  name: 'Wyrmslayer',       desc: 'Defeat the Sandwyrm.',         cond: (G) => G.stats.bosses.has('sandwyrm') },
  { id: 'thaw',        name: 'Thaw the Warden',  desc: 'Defeat the Frost Warden.',     cond: (G) => G.stats.bosses.has('frost_warden') },
  { id: 'globetrotter',name: 'Globetrotter',     desc: 'Set foot in every region.',    cond: (G) => G.stats.regions.size >= 11 },
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
