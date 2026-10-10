import { PersonalityArchetype, CharacterStats } from './cardTypes';

export const ARCHETYPES: PersonalityArchetype[] = [
  {
    id: 'cosmic-explorer',
    title: 'Cosmic Explorer',
    subTitle: 'Starlight Sentinel',
    element: '✨ Astral',
    rarity: 'Legendary',
    description: 'A fearless cosmic traveler powered by stardust, capable of soaring across galaxies to discover unknown worlds.',
    specialAbility1: {
      name: 'Supernova Blast',
      description: 'Unleashes a blinding burst of celestial energy.',
      damage: 95,
    },
    specialAbility2: {
      name: 'Star Barrier',
      description: 'Forms an impenetrable shield of glittering starlight.',
      damage: 75,
    },
    quote: 'Beyond the stars lies our next big adventure!',
  },
  {
    id: 'storm-guardian',
    title: 'Storm Guardian',
    subTitle: 'Thunder Lord',
    element: '⚡ Electric',
    rarity: 'Epic',
    description: 'Master of lightning and thunder. Charges into battle with high speed and electric enthusiasm.',
    specialAbility1: {
      name: 'Thunderbolt Strike',
      description: 'Hurls a high-voltage lightning bolt that stuns targets.',
      damage: 90,
    },
    specialAbility2: {
      name: 'Volt Dash',
      description: 'Moves at the speed of sound, dodging incoming strikes.',
      damage: 82,
    },
    quote: 'Feel the thunder, embrace the spark!',
  },
  {
    id: 'mystic-dreamer',
    title: 'Mystic Dreamer',
    subTitle: 'Cloud Realm Weaver',
    element: '☁️ Aero',
    rarity: 'Rare',
    description: 'A gentle spirit with endless imagination, turning dreams into reality and protecting peaceful realms.',
    specialAbility1: {
      name: 'Dream Beam',
      description: 'Projects a peaceful wave of light that restores energy.',
      damage: 70,
    },
    specialAbility2: {
      name: 'Cloud Armor',
      description: 'Wraps in soft fluffy clouds to absorb incoming damage.',
      damage: 78,
    },
    quote: 'Anything is possible if you dream big enough.',
  },
  {
    id: 'flame-champion',
    title: 'Flame Champion',
    subTitle: 'Blaze Fighter',
    element: '🔥 Pyro',
    rarity: 'Epic',
    description: 'Passionate and bold warrior with a heart of fire that never gives up in tough challenges.',
    specialAbility1: {
      name: 'Blaze Inferno',
      description: 'Surrounds opponents in a ring of burning fire.',
      damage: 88,
    },
    specialAbility2: {
      name: 'Dragon Roar',
      description: 'Boosts team attack power by 50%.',
      damage: 80,
    },
    quote: 'My inner fire shines brighter than any shadow!',
  },
  {
    id: 'nature-guardian',
    title: 'Forest Protector',
    subTitle: 'Jungle Sage',
    element: '🌿 Flora',
    rarity: 'Common',
    description: 'Friend to all animals and trees, using nature magic to heal and protect the green realm.',
    specialAbility1: {
      name: 'Vine Shield',
      description: 'Summons thick emerald vines to entangle opponents.',
      damage: 65,
    },
    specialAbility2: {
      name: 'Leaf Cyclone',
      description: 'Spins razor-sharp leaves in a swirl around battle.',
      damage: 72,
    },
    quote: 'Listen to the whisper of the ancient trees.',
  }
];

export function calculateArchetype(stats: CharacterStats): PersonalityArchetype {
  const highest = Object.entries(stats).reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['power', 0]);
  switch (highest[0]) {
    case 'energy': return ARCHETYPES[0];
    case 'speed': return ARCHETYPES[1];
    case 'intelligence': return ARCHETYPES[2];
    case 'power': return ARCHETYPES[3];
    case 'courage': default: return ARCHETYPES[4];
  }
}