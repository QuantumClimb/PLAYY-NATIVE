/** Which kiosk action plays which sound. Edited in the command center under Sounds. */

export const SFX_EVENTS = [
  'tap', 'start', 'next', 'back', 'select', 'surprise', 'key', 'backspace', 'flip', 'answer', 'print', 'change', 'done', 'reveal',
] as const;
export type SfxEvent = (typeof SFX_EVENTS)[number];

export const EVENT_DEFS: Record<SfxEvent, { label: string; help: string }> = {
  tap: { label: 'Any other button', help: 'Plays for any button that has no sound of its own.' },
  start: { label: 'Tap to Start', help: 'The big start button, and tapping the intro screen.' },
  next: { label: 'Next', help: 'Next, Start Quiz, Done and Continue buttons.' },
  back: { label: 'Back', help: 'The Back button.' },
  select: { label: 'Choosing a card', help: 'Heads, poses, symbols, backgrounds and colors.' },
  surprise: { label: 'Surprise Me', help: 'The Surprise Me button.' },
  key: { label: 'Keyboard key', help: 'Letters and numbers on the on-screen keyboards.' },
  backspace: { label: 'Backspace', help: 'The delete key on the keyboards.' },
  flip: { label: 'Flip card', help: 'Turning the trump card over.' },
  answer: { label: 'Quiz answer', help: 'Picking an answer in the power quiz.' },
  print: { label: 'Print', help: 'Print My Playy, Print Another.' },
  change: { label: 'Change / start over', help: 'Change Something, Retake, Create Another.' },
  done: { label: 'All done', help: 'All Done, Finish, and when the celebration screen appears.' },
  reveal: { label: 'Trump card appears', help: 'When the finished trump card is revealed.' },
};

/** `none`, `synth:<id>` (built in) or `custom:<id>` (an uploaded file) */
export type SoundRef = string;

export interface CustomSound {
  id: string;
  name: string;
  mediaId: string;
}

export interface SoundSettings {
  enabled: boolean;
  /** Master volume 0 to 1 */
  volume: number;
  events: Record<SfxEvent, { sound: SoundRef; volume: number }>;
  custom: CustomSound[];
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.8,
  custom: [],
  events: {
    tap: { sound: 'synth:pop', volume: 1 },
    start: { sound: 'synth:tada', volume: 1 },
    next: { sound: 'synth:slide-up', volume: 1 },
    back: { sound: 'synth:slide-down', volume: 1 },
    select: { sound: 'synth:bubble', volume: 1 },
    surprise: { sound: 'synth:boing', volume: 1 },
    key: { sound: 'synth:tick', volume: 0.8 },
    backspace: { sound: 'synth:woodblock', volume: 1 },
    flip: { sound: 'synth:whoosh', volume: 1 },
    answer: { sound: 'synth:ding', volume: 1 },
    print: { sound: 'synth:confirm', volume: 1 },
    change: { sound: 'synth:zip', volume: 1 },
    done: { sound: 'synth:sparkle', volume: 1 },
    reveal: { sound: 'synth:chime', volume: 1 },
  },
};

/** Merge whatever the server has over the defaults, dropping anything unknown. */
export function cleanSettings(input: unknown): SoundSettings {
  const d = DEFAULT_SOUND_SETTINGS;
  const s = (input && typeof input === 'object' ? input : {}) as Partial<SoundSettings>;
  const events = { ...d.events };
  SFX_EVENTS.forEach((e) => {
    const v = s.events?.[e];
    if (v && typeof v.sound === 'string') {
      events[e] = { sound: v.sound, volume: typeof v.volume === 'number' ? Math.min(1, Math.max(0, v.volume)) : 1 };
    }
  });
  return {
    enabled: typeof s.enabled === 'boolean' ? s.enabled : d.enabled,
    volume: typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume)) : d.volume,
    events,
    custom: Array.isArray(s.custom)
      ? s.custom.filter((c) => c && typeof c.id === 'string' && typeof c.mediaId === 'string').map((c) => ({ id: c.id, name: String(c.name ?? 'Sound').slice(0, 40), mediaId: c.mediaId }))
      : [],
  };
}
