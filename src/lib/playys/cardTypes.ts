import { PlayyConfiguration } from './types';

export interface CharacterStats {
  power: number;
  speed: number;
  intelligence: number;
  energy: number;
  courage: number;
}

export interface PersonalityArchetype {
  id: string;
  title: string;
  subTitle: string;
  element: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  specialAbility1: { name: string; description: string; damage: number };
  specialAbility2: { name: string; description: string; damage: number };
  quote: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    icon: string;
    description: string;
    statBoost: Partial<CharacterStats>;
  }[];
}

export interface GeneratedCard {
  id: string;
  config: PlayyConfiguration;
  stats: CharacterStats;
  archetype: PersonalityArchetype;
  createdAt: string;
}

export const BASE_STATS: CharacterStats = {
  power: 50,
  speed: 50,
  intelligence: 50,
  energy: 50,
  courage: 50,
};
