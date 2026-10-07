/**
 * Synthetic Web Audio & Haptics simulator for React Native Expo
 * Emulates expo-haptics (ImpactFeedbackStyle.Light, Medium, Heavy, Success)
 * without external audio asset downloads.
 */

class NativeFeedbackService {
  private audioCtx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public hapticsEnabled: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Emulates Expo Haptics: Light impact
  public impactLight() {
    this.triggerHaptic(15);
    this.playTone(600, 0.04, 'sine', 0.12);
  }

  // Emulates Expo Haptics: Medium impact
  public impactMedium() {
    this.triggerHaptic(25);
    this.playTone(450, 0.06, 'sine', 0.18);
  }

  // Emulates Expo Haptics: Heavy impact
  public impactHeavy() {
    this.triggerHaptic(40);
    this.playTone(280, 0.09, 'triangle', 0.25);
  }

  // Emulates Expo Haptics: Selection changed
  public selection() {
    this.triggerHaptic(10);
    this.playTone(750, 0.03, 'sine', 0.1);
  }

  // Emulates Expo Haptics: Success notification
  public notificationSuccess() {
    this.triggerHaptic([30, 40, 50]);
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  // Device vibration simulation
  private triggerHaptic(pattern: number | number[]) {
    if (!this.hapticsEnabled || typeof window === 'undefined') return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted yet
    }
  }
}

export const nativeFeedback = new NativeFeedbackService();
