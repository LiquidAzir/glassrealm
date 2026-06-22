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
];

export const ENEMIES = {
  boar:   { name: 'Wild Boar',    hp: 24,  dmg: 6,  speed: 3.4, xp: 55,  color: 0x9a5a38, aggro: 10, shape: 'beast',    loot: { meat: 1, pelt: 1, bones: 1 } },
  wolf:   { name: 'Grey Wolf',    hp: 36,  dmg: 9,  speed: 4.6, xp: 85,  color: 0x9aa0a8, aggro: 13, shape: 'beast',    loot: { pelt: 1, meat: 1, bones: 1 } },
  bandit: { name: 'Ashen Bandit', hp: 52,  dmg: 13, speed: 3.9, xp: 130, color: 0x8a6f9a, aggro: 12, shape: 'humanoid', loot: { gold: 18, coal: 1, bones: 1 } },
  frost_wolf: { name: 'Frost Wolf',  hp: 60, dmg: 15, speed: 4.8, xp: 165, color: 0xcfe0f2, aggro: 14, shape: 'beast', loot: { pelt: 1, bones: 1, coal: 1 } },
  scorpion:   { name: 'Sand Scorpion', hp: 46, dmg: 12, speed: 3.6, xp: 120, color: 0xd8a85a, aggro: 11, shape: 'beast', loot: { bones: 1, iron_ore: 1 } },
  ember_boss: { name: 'Emberfang', hp: 170, dmg: 22, speed: 3.7, xp: 520, color: 0xff5a2a, aggro: 18, shape: 'beast', scale: 1.9, boss: true, loot: { gold: 140, relic: 1, iron_ore: 5, bones: 3 } },
  sandwyrm:     { name: 'Sandwyrm',     hp: 220, dmg: 24, speed: 3.4, xp: 640, color: 0xd8a85a, aggro: 18, shape: 'beast',    scale: 2.1, boss: true, loot: { gold: 180, sun_blade: 1, ruby: 1, bones: 4 } },
  frost_warden: { name: 'Frost Warden', hp: 240, dmg: 26, speed: 3.6, xp: 700, color: 0xbfe0ff, aggro: 18, shape: 'humanoid', scale: 1.8, boss: true, loot: { gold: 200, frost_staff: 1, sapphire: 2, bones: 4 } },
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
};

export function objectiveText(obj, n) {
  if (obj.type === 'have') return `Gather ${ITEMS[obj.item].name} (${n}/${obj.count})`;
  if (obj.type === 'kill') return `Defeat ${ENEMIES[obj.enemy].name}${obj.count > 1 ? 's' : ''} (${n}/${obj.count})`;
  return `(${n}/${obj.count})`;
}

const node = (speaker, text, choices) => ({ speaker, text, choices });
const end = (label) => ({ label, to: null });

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
  },
};

// Achievements — re-evaluated on events; cond reads live game state (G).
export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood',      desc: 'Defeat any enemy.',            cond: (G) => G.stats.kills >= 1 },
  { id: 'hunter',      name: 'Hunter',           desc: 'Defeat 25 enemies.',           cond: (G) => G.stats.kills >= 25 },
  { id: 'emberfang',   name: 'Emberbane',        desc: 'Defeat Emberfang.',            cond: (G) => G.stats.bosses.has('ember_boss') },
  { id: 'wyrmslayer',  name: 'Wyrmslayer',       desc: 'Defeat the Sandwyrm.',         cond: (G) => G.stats.bosses.has('sandwyrm') },
  { id: 'thaw',        name: 'Thaw the Warden',  desc: 'Defeat the Frost Warden.',     cond: (G) => G.stats.bosses.has('frost_warden') },
  { id: 'globetrotter',name: 'Globetrotter',     desc: 'Set foot in every region.',    cond: (G) => G.stats.regions.size >= 5 },
  { id: 'jeweller',    name: 'Jeweller',         desc: 'Craft a piece of jewelry.',    cond: (G) => G.stats.crafted >= 1 },
  { id: 'suited',      name: 'Suited Up',        desc: 'Wear a full armour set.',      cond: (G) => !!(G.fullSet && G.fullSet()) },
  { id: 'tycoon',      name: 'Tycoon',           desc: 'Hold 1000 gold at once.',      cond: (G) => G.inventory.count('gold') >= 1000 },
  { id: 'isle_hero',   name: 'Isle Hero',        desc: 'Complete every quest.',        cond: (G) => G.quests.all().every((q) => q.status === 'complete') },
  { id: 'jack',        name: 'Jack of Trades',   desc: 'Reach total level 40.',        cond: (G) => G.skills.total() >= 40 },
  { id: 'specialist',  name: 'Specialist',       desc: 'Reach level 20 in any skill.', cond: (G) => G.skills.DEFS.some((d) => G.skills.level(d.key) >= 20) },
];
