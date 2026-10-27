/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public setPreferences(sound: boolean, vibration: boolean) {
    this.soundEnabled = sound;
    this.vibrationEnabled = vibration;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Tactile domino tile clack / tap
   */
  public playTap() {
    this.vibrate(15);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Score added sound
   */
  public playScoreAdd() {
    this.vibrate([25, 40, 30]);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.15);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Dramatic Barbook reset gong / chord!
   */
  public playBarbook() {
    this.vibrate([80, 50, 120, 60, 200]);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Low dramatic gong frequencies
      [130.81, 164.81, 196.0, 261.63].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 1.2);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        // Low-pass filter for deep resonant gong
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Victory Fanfare!
   */
  public playVictory() {
    this.vibrate([50, 50, 80, 50, 150, 100, 300]);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.4 },  // C6
      ];

      let t = now;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + n.d + 0.05);

        t += n.d * 0.8;
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Soft undo / cancel sound
   */
  public playUndo() {
    this.vibrate(20);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio fallback silent
    }
  }

  public vibrate(pattern: number | number[]) {
    if (!this.vibrationEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Silent catch
    }
  }
}

export const soundManager = new SoundController();
