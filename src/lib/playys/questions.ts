import { QuizQuestion } from './cardTypes';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Where does your hero draw their power from?",
    subtitle: "Select your primary element source",
    options: [
      {
        label: "Galaxies & Stars",
        icon: "✨",
        description: "Cosmic stardust energy from space",
        statBoost: { energy: 35, intelligence: 15 }
      },
      {
        label: "Thunder & Lightning",
        icon: "⚡",
        description: "High speed electrical surge",
        statBoost: { speed: 35, power: 15 }
      },
      {
        label: "Mystic Clouds",
        icon: "☁️",
        description: "Creative dreams and ancient wisdom",
        statBoost: { intelligence: 35, courage: 15 }
      },
      {
        label: "Blazing Sun Fire",
        icon: "🔥",
        description: "Raw strength and burning courage",
        statBoost: { power: 35, energy: 15 }
      }
    ]
  },
  {
    id: 2,
    question: "When faced with a giant obstacle, what do you do?",
    subtitle: "Choose your hero strategy",
    options: [
      {
        label: "Outsmart with a secret plan",
        icon: "🧠",
        description: "Use clever logic and tactical thinking",
        statBoost: { intelligence: 30, courage: 15 }
      },
      {
        label: "Dash around with super speed",
        icon: "🏃",
        description: "Dodge obstacles in a flash",
        statBoost: { speed: 30, energy: 15 }
      },
      {
        label: "Charge forward bravely!",
        icon: "🦁",
        description: "Face danger head-on without fear",
        statBoost: { courage: 35, power: 15 }
      },
      {
        label: "Unleash ultimate power move",
        icon: "💥",
        description: "Blast away trouble with force",
        statBoost: { power: 30, energy: 20 }
      }
    ]
  },
  {
    id: 3,
    question: "What is your character virtue?",
    subtitle: "Select your core heart trait",
    options: [
      {
        label: "Loyalty to Friends",
        icon: "💖",
        description: "Always standing by your team",
        statBoost: { courage: 25, energy: 20 }
      },
      {
        label: "Endless Curiosity",
        icon: "🔍",
        description: "Discovering hidden secrets",
        statBoost: { intelligence: 30, speed: 15 }
      },
      {
        label: "Unstoppable Spirit",
        icon: "🏆",
        description: "Never quitting under pressure",
        statBoost: { power: 25, courage: 25 }
      },
      {
        label: "Pure Imagination",
        icon: "🎨",
        description: "Creating magic out of thin air",
        statBoost: { energy: 30, intelligence: 15 }
      }
    ]
  }
];
