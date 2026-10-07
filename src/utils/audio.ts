// Web Audio API procedural music box synthesizer
// Provides sparkling "Happy Birthday" music box melody and ambient acoustic chimes without external mp3 dependencies

class BirthdayAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlayingBirthdayTune = false;
  private currentTimeoutIds: number[] = [];
  private isMuted = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isPlayingBirthdayTune) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlayingBirthdayTune;
  }

  // Play a single bell/music box note
  public playMusicBoxNote(freq: number, duration: number = 0.8, volume: number = 0.15) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sine + harmonic overtone for pure celestial music box feel
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Envelope: sharp bell attack, gentle lingering exponential decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Subtle resonant bandpass filter for warm bell resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.setValueAtTime(4, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  // Candle blowing sound effect (soft breeze / whoosh)
  public playCandleBlowSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.7; // 700ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  // Sparkling magic chime when candle relit or wish posted
  public playSparkleChime() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playMusicBoxNote(freq, 0.6, 0.12);
      }, idx * 75);
    });
  }

  // Play "Happy Birthday to You" full music box melody
  public playHappyBirthdaySong(onFinish?: () => void) {
    if (this.isPlayingBirthdayTune) {
      this.stop();
      return;
    }

    this.stop();
    this.isPlayingBirthdayTune = true;

    // Frequencies in Hz for standard Happy Birthday in key of C
    // C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88
    // C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const B4 = 493.88;
    const C5 = 523.25;
    const D5 = 587.33;
    const E5 = 659.25;
    const F5 = 698.46;
    const G5 = 783.99;
    const A5 = 880.00;

    // [note, durationMs]
    const songSequence: [number, number][] = [
      // Hap-py Birth-day to you
      [G4, 250], [G4, 250], [A4, 500], [G4, 500], [C5, 500], [B4, 1000],
      // Hap-py Birth-day to you
      [G4, 250], [G4, 250], [A4, 500], [G4, 500], [D5, 500], [C5, 1000],
      // Hap-py Birth-day dear Cup-cake
      [G4, 250], [G4, 250], [G5, 500], [E5, 500], [C5, 500], [B4, 500], [A4, 900],
      // Hap-py Birth-day to you!
      [F5, 250], [F5, 250], [E5, 500], [C5, 500], [D5, 500], [C5, 1200],
    ];

    let accumulatedTime = 0;

    songSequence.forEach(([freq, duration]) => {
      const tid = window.setTimeout(() => {
        if (!this.isPlayingBirthdayTune) return;
        this.playMusicBoxNote(freq, duration / 800, 0.18);
        // Add subtle harmony bass note on downbeats
        if (duration >= 500) {
          this.playMusicBoxNote(freq / 2, 0.9, 0.08);
        }
      }, accumulatedTime);

      this.currentTimeoutIds.push(tid);
      accumulatedTime += duration + 70; // gap
    });

    const finishTid = window.setTimeout(() => {
      this.isPlayingBirthdayTune = false;
      if (onFinish) onFinish();
    }, accumulatedTime + 500);

    this.currentTimeoutIds.push(finishTid);
  }

  public stop() {
    this.isPlayingBirthdayTune = false;
    this.currentTimeoutIds.forEach((id) => clearTimeout(id));
    this.currentTimeoutIds = [];
  }
}

export const birthdayAudio = new BirthdayAudioPlayer();
