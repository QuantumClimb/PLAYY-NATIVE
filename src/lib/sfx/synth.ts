/**
 * Cartoon sound effects made in the browser with the Web Audio API. There are no audio files, so nothing
 * to license or download, and they work offline. Each one is a short recipe of oscillators and noise.
 */
export interface SynthDef {
  id: string;
  label: string;
  play: (ctx: AudioContext, out: AudioNode, t: number) => void;
}

type Wave = OscillatorType;

/** One oscillator with a pitch glide and a quick attack / exponential decay. */
function tone(
  ctx: AudioContext,
  out: AudioNode,
  t: number,
  o: { type?: Wave; from: number; to?: number; dur: number; gain?: number; attack?: number; vib?: number },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.from, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
  const peak = o.gain ?? 0.5;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + (o.attack ?? 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  if (o.vib) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = o.vib;
    depth.gain.value = o.from * 0.04;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + o.dur + 0.05);
  }
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + o.dur + 0.05);
}

let noiseBuf: AudioBuffer | null = null;
function noise(
  ctx: AudioContext,
  out: AudioNode,
  t: number,
  o: { dur: number; from: number; to?: number; q?: number; gain?: number; type?: BiquadFilterType },
) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.Q.value = o.q ?? 1.2;
  f.frequency.setValueAtTime(o.from, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.4, t + Math.min(0.03, o.dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(f).connect(g).connect(out);
  src.start(t);
  src.stop(t + o.dur + 0.05);
}

export const SYNTHS: SynthDef[] = [
  {
    id: 'pop',
    label: 'Pop',
    play: (c, o, t) => {
      tone(c, o, t, { from: 900, to: 220, dur: 0.1, gain: 0.7 });
      noise(c, o, t, { dur: 0.03, from: 2500, gain: 0.15 });
    },
  },
  {
    id: 'boing',
    label: 'Boing',
    play: (c, o, t) => {
      tone(c, o, t, { type: 'triangle', from: 170, to: 620, dur: 0.12, gain: 0.55 });
      tone(c, o, t + 0.1, { type: 'triangle', from: 620, to: 190, dur: 0.38, gain: 0.5, vib: 16 });
    },
  },
  {
    id: 'bubble',
    label: 'Bubble',
    play: (c, o, t) => {
      tone(c, o, t, { from: 320, to: 1000, dur: 0.11, gain: 0.5 });
      tone(c, o, t + 0.07, { from: 500, to: 1300, dur: 0.09, gain: 0.3 });
    },
  },
  {
    id: 'whoosh',
    label: 'Whoosh',
    play: (c, o, t) => {
      noise(c, o, t, { dur: 0.26, from: 350, to: 3200, q: 1.1, gain: 0.5 });
    },
  },
  {
    id: 'sparkle',
    label: 'Sparkle',
    play: (c, o, t) => {
      [1319, 1568, 1976, 2637].forEach((f, i) =>
        tone(c, o, t + i * 0.055, { type: 'sine', from: f, dur: 0.28, gain: 0.3 }),
      );
    },
  },
  {
    id: 'ding',
    label: 'Ding',
    play: (c, o, t) => {
      tone(c, o, t, { from: 880, dur: 0.6, gain: 0.45 });
      tone(c, o, t, { from: 2217, dur: 0.3, gain: 0.15 });
      tone(c, o, t, { from: 1320, dur: 0.45, gain: 0.2 });
    },
  },
  {
    id: 'slide-up',
    label: 'Slide up',
    play: (c, o, t) => {
      tone(c, o, t, { from: 320, to: 1250, dur: 0.22, gain: 0.45, vib: 9 });
    },
  },
  {
    id: 'slide-down',
    label: 'Slide down',
    play: (c, o, t) => {
      tone(c, o, t, { from: 1100, to: 330, dur: 0.2, gain: 0.45, vib: 9 });
    },
  },
  {
    id: 'tada',
    label: 'Ta-da!',
    play: (c, o, t) => {
      [523, 659, 784].forEach((f, i) => tone(c, o, t + i * 0.09, { type: 'triangle', from: f, dur: 0.18, gain: 0.35 }));
      [1047, 784, 659].forEach((f) => tone(c, o, t + 0.3, { type: 'triangle', from: f, dur: 0.7, gain: 0.3 }));
    },
  },
  {
    id: 'woodblock',
    label: 'Woodblock',
    play: (c, o, t) => {
      tone(c, o, t, { from: 1100, to: 700, dur: 0.07, gain: 0.55 });
      noise(c, o, t, { dur: 0.05, from: 1800, q: 4, gain: 0.25 });
    },
  },
  {
    id: 'squeak',
    label: 'Squeak',
    play: (c, o, t) => {
      tone(c, o, t, { type: 'triangle', from: 1300, to: 2300, dur: 0.11, gain: 0.35, vib: 30 });
    },
  },
  {
    id: 'zip',
    label: 'Zip',
    play: (c, o, t) => {
      noise(c, o, t, { dur: 0.14, from: 800, to: 6000, q: 0.8, gain: 0.4, type: 'highpass' });
    },
  },
  {
    id: 'tick',
    label: 'Soft tick',
    play: (c, o, t) => {
      tone(c, o, t, { from: 1100, to: 800, dur: 0.035, gain: 0.3 });
    },
  },
  {
    id: 'chime',
    label: 'Chime',
    play: (c, o, t) => {
      [1047, 1319, 1568, 1760].forEach((f, i) => tone(c, o, t + i * 0.07, { from: f, dur: 0.55, gain: 0.22 }));
    },
  },
  {
    id: 'confirm',
    label: 'Ding-dong',
    play: (c, o, t) => {
      tone(c, o, t, { from: 784, dur: 0.35, gain: 0.4 });
      tone(c, o, t + 0.16, { from: 988, dur: 0.5, gain: 0.4 });
    },
  },
];

export const synthById = (id: string) => SYNTHS.find((s) => s.id === id);
