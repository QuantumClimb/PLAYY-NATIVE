import { useServerSetting } from '../../data/useServerSetting';

export interface PowerQuizOption {
  id: string;
  label: string;
  icon?: string;
  symbolWeights: Record<string, number>;
}

export interface PowerQuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: PowerQuizOption[];
}

export const SYMBOL_MAP: Record<string, { name: string; attribute: string; icon: string }> = {
  'shining-star': { name: 'Shining Star', attribute: 'Confidence & Leadership', icon: '⭐' },
  star: { name: 'Shining Star', attribute: 'Confidence & Leadership', icon: '⭐' },
  'puffy-cloud': { name: 'Puffy Cloud', attribute: 'Calmness & Imagination', icon: '☁️' },
  cloud: { name: 'Puffy Cloud', attribute: 'Calmness & Imagination', icon: '☁️' },
  'fire-spark': { name: 'Fire Spark', attribute: 'Energy & Enthusiasm', icon: '🔥' },
  'warm-heart': { name: 'Warm Heart', attribute: 'Kindness & Empathy', icon: '💖' },
  heart: { name: 'Warm Heart', attribute: 'Kindness & Empathy', icon: '💖' },
  'thunder-zap': { name: 'Thunder Zap', attribute: 'Speed & Boldness', icon: '⚡' },
  lightning: { name: 'Thunder Zap', attribute: 'Speed & Boldness', icon: '⚡' },
  'golden-crown': { name: 'Golden Crown', attribute: 'Leadership & Confidence', icon: '👑' },
  crown: { name: 'Golden Crown', attribute: 'Leadership & Confidence', icon: '👑' },
  'crescent-moon': { name: 'Crescent Moon', attribute: 'Creativity & Imagination', icon: '🌙' },
  'puppy-paw': { name: 'Puppy Paw', attribute: 'Friendship & Loyalty', icon: '🐾' },
};

export const DEFAULT_POWER_QUIZ_QUESTIONS: PowerQuizQuestion[] = [
  {
    id: 1,
    question: 'What do you love doing?',
    subtitle: 'Pick the activity that brings you the most joy',
    options: [
      {
        id: 'q1_a',
        label: 'Helping my friends',
        icon: '🤝',
        symbolWeights: { 'puppy-paw': 3, 'warm-heart': 2 },
      },
      {
        id: 'q1_b',
        label: 'Exploring new things',
        icon: '🗺️',
        symbolWeights: { 'crescent-moon': 3, 'thunder-zap': 2 },
      },
      {
        id: 'q1_c',
        label: 'Building and making things',
        icon: '🎨',
        symbolWeights: { 'puffy-cloud': 3, 'fire-spark': 2 },
      },
      {
        id: 'q1_d',
        label: 'Playing and making everyone laugh',
        icon: '😄',
        symbolWeights: { 'fire-spark': 3, 'shining-star': 2 },
      },
    ],
  },
  {
    id: 2,
    question: 'What would you do if a friend needed help?',
    subtitle: 'Choose your hero response',
    options: [
      {
        id: 'q2_a',
        label: 'Give them a big hug',
        icon: '🤗',
        symbolWeights: { 'warm-heart': 3, 'puppy-paw': 2 },
      },
      {
        id: 'q2_b',
        label: 'Find a clever solution',
        icon: '💡',
        symbolWeights: { 'crescent-moon': 3, 'puffy-cloud': 2 },
      },
      {
        id: 'q2_c',
        label: 'Protect them',
        icon: '🛡️',
        symbolWeights: { 'golden-crown': 3, 'thunder-zap': 2 },
      },
      {
        id: 'q2_d',
        label: 'Cheer them up',
        icon: '✨',
        symbolWeights: { 'fire-spark': 3, 'warm-heart': 2 },
      },
    ],
  },
  {
    id: 3,
    question: 'Which magical power sounds the coolest?',
    subtitle: 'Select your dream super power',
    options: [
      {
        id: 'q3_a',
        label: 'Shining like a star',
        icon: '⭐',
        symbolWeights: { 'shining-star': 3, 'golden-crown': 2 },
      },
      {
        id: 'q3_b',
        label: 'Moving like lightning',
        icon: '⚡',
        symbolWeights: { 'thunder-zap': 3, 'fire-spark': 2 },
      },
      {
        id: 'q3_c',
        label: 'Controlling clouds',
        icon: '☁️',
        symbolWeights: { 'puffy-cloud': 3, 'crescent-moon': 2 },
      },
      {
        id: 'q3_d',
        label: 'Having a heart full of magic',
        icon: '💖',
        symbolWeights: { 'warm-heart': 3, 'puppy-paw': 2 },
      },
    ],
  },
  {
    id: 4,
    question: 'What describes you best?',
    subtitle: 'Pick the words that sound like you',
    options: [
      {
        id: 'q4_a',
        label: 'Brave and bold',
        icon: '🦁',
        symbolWeights: { 'thunder-zap': 3, 'golden-crown': 2 },
      },
      {
        id: 'q4_b',
        label: 'Kind and caring',
        icon: '🌸',
        symbolWeights: { 'warm-heart': 3, 'puppy-paw': 2 },
      },
      {
        id: 'q4_c',
        label: 'Curious and clever',
        icon: '🔍',
        symbolWeights: { 'crescent-moon': 3, 'puffy-cloud': 2 },
      },
      {
        id: 'q4_d',
        label: 'Happy and energetic',
        icon: '🌟',
        symbolWeights: { 'fire-spark': 3, 'shining-star': 2 },
      },
    ],
  },
  {
    id: 5,
    question: 'What would you like your PlayPal to be known for?',
    subtitle: 'Choose your hero legacy',
    options: [
      {
        id: 'q5_a',
        label: 'Being a hero',
        icon: '👑',
        symbolWeights: { 'golden-crown': 3, 'shining-star': 2 },
      },
      {
        id: 'q5_b',
        label: 'Spreading love',
        icon: '💗',
        symbolWeights: { 'warm-heart': 3, 'puppy-paw': 2 },
      },
      {
        id: 'q5_c',
        label: 'Having amazing ideas',
        icon: '🌙',
        symbolWeights: { 'crescent-moon': 3, 'puffy-cloud': 2 },
      },
      {
        id: 'q5_d',
        label: 'Bringing happiness everywhere',
        icon: '🎉',
        symbolWeights: { 'fire-spark': 3, 'shining-star': 2 },
      },
    ],
  },
];

export function calculatePowerSymbol(
  questions: PowerQuizQuestion[],
  answers: number[],
  availableSymbolSlugs: string[] = [],
): string {
  const scores: Record<string, number> = {};

  answers.forEach((optIndex, qIndex) => {
    const q = questions[qIndex];
    if (!q || !q.options[optIndex]) return;
    const weights = q.options[optIndex].symbolWeights || {};
    Object.entries(weights).forEach(([symbol, pts]) => {
      scores[symbol] = (scores[symbol] || 0) + pts;
    });
  });

  let bestSymbol = 'warm-heart';
  let maxScore = -1;

  Object.entries(scores).forEach(([symbol, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestSymbol = symbol;
    }
  });

  if (availableSymbolSlugs.length > 0) {
    if (availableSymbolSlugs.includes(bestSymbol)) return bestSymbol;
    const match = availableSymbolSlugs.find((s) => s.includes(bestSymbol) || bestSymbol.includes(s));
    if (match) return match;
    return availableSymbolSlugs[0];
  }

  return bestSymbol;
}

/** The powers an answer can lean toward, in the order the command center lists them. */
export const POWER_SLUGS = [
  'shining-star',
  'puffy-cloud',
  'fire-spark',
  'warm-heart',
  'thunder-zap',
  'golden-crown',
  'crescent-moon',
  'puppy-paw',
] as const;

/** The questions as saved in the command center; the built-in ones until something valid is saved. */
export const cleanQuizQuestions = (raw: unknown): PowerQuizQuestion[] =>
  Array.isArray(raw) && raw.length > 0 ? (raw as PowerQuizQuestion[]) : DEFAULT_POWER_QUIZ_QUESTIONS;

const POWER_QUIZ_SETTING = { url: '/api/power-quiz-questions', key: 'questions', clean: cleanQuizQuestions };

/** The quiz questions, loaded once per page load. */
export const usePowerQuizQuestions = (): PowerQuizQuestion[] =>
  useServerSetting(POWER_QUIZ_SETTING, DEFAULT_POWER_QUIZ_QUESTIONS);
