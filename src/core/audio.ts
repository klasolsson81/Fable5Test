/**
 * Generative audio engine — everything is synthesized in WebAudio.
 * Zero audio files, zero licensing issues, ~0 bytes of network weight.
 *
 * Layers:
 *  - ambient: two detuned drones through a slowly breathing lowpass filter
 *  - sparkle: sparse pentatonic blips with feedback delay (the "data rain")
 *  - sfx: ui ticks, hover blips, whooshes, glitches, typing
 */

type SfxName = 'hover' | 'click' | 'whoosh' | 'glitch' | 'type' | 'confirm' | 'deny' | 'rabbit';

const PENTATONIC = [0, 3, 5, 7, 10, 12, 15, 17]; // minor pentatonic-ish offsets
const BASE_NOTE = 220; // A3

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private muted = false;
  private musicOn = false;
  /** startMusic() was requested before the context existed (deep link without gesture). */
  private wantMusic = false;
  private sparkleTimer: number | null = null;
  private droneNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;

  /** Must be called from a user gesture (autoplay policy). Safe to call repeatedly. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      if (this.wantMusic && !this.musicOn) this.startMusic();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.0;
    this.musicBus.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(this.master);

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (!this.muted) void this.ctx.resume();
    });

    if (this.wantMusic) this.startMusic();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx && this.master) {
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 1, this.ctx.currentTime + 0.15);
      if (!muted && this.ctx.state === 'suspended') void this.ctx.resume();
    }
  }

  /* ── Ambient music ─────────────────────────────────────────────── */

  startMusic(): void {
    this.wantMusic = true;
    if (!this.ctx || !this.musicBus || this.musicOn) return;
    this.musicOn = true;
    const ctx = this.ctx;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 420;
    this.filter.Q.value = 1.2;
    this.filter.connect(this.musicBus);

    // Slow LFO "breathing" on the filter cutoff
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    this.lfo.connect(lfoGain).connect(this.filter.frequency);
    this.lfo.start();

    const droneSpecs: { freq: number; type: OscillatorType; gain: number }[] = [
      { freq: BASE_NOTE / 4, type: 'sawtooth', gain: 0.16 },
      { freq: (BASE_NOTE / 4) * 1.005, type: 'sawtooth', gain: 0.12 },
      { freq: BASE_NOTE / 2, type: 'triangle', gain: 0.1 },
      { freq: (BASE_NOTE / 2) * 1.498, type: 'sine', gain: 0.05 },
    ];
    for (const spec of droneSpecs) {
      const osc = ctx.createOscillator();
      osc.type = spec.type;
      osc.frequency.value = spec.freq;
      const gain = ctx.createGain();
      gain.gain.value = spec.gain;
      osc.connect(gain).connect(this.filter);
      osc.start();
      this.droneNodes.push({ osc, gain });
    }

    // Fade the whole music bus in
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setValueAtTime(0, ctx.currentTime);
    this.musicBus.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 4);

    this.scheduleSparkle();
  }

  stopMusic(): void {
    this.wantMusic = false;
    if (!this.ctx || !this.musicBus || !this.musicOn) return;
    this.musicOn = false;
    const ctx = this.ctx;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    if (this.sparkleTimer !== null) {
      window.clearTimeout(this.sparkleTimer);
      this.sparkleTimer = null;
    }
    const drones = this.droneNodes;
    const lfo = this.lfo;
    this.droneNodes = [];
    this.lfo = null;
    window.setTimeout(() => {
      for (const { osc } of drones) {
        try { osc.stop(); osc.disconnect(); } catch { /* already stopped */ }
      }
      try { lfo?.stop(); lfo?.disconnect(); } catch { /* already stopped */ }
      this.filter?.disconnect();
      this.filter = null;
    }, 1400);
  }

  private scheduleSparkle(): void {
    if (!this.musicOn || !this.ctx || !this.musicBus) return;
    const delayMs = 350 + Math.random() * 1800;
    this.sparkleTimer = window.setTimeout(() => {
      if (this.musicOn && this.ctx && this.musicBus && !document.hidden) {
        const semitone = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)] ?? 0;
        const freq = BASE_NOTE * 2 * Math.pow(2, semitone / 12);
        this.blip(freq, 0.04 + Math.random() * 0.05, this.musicBus, 0.07, 'sine', 0.9 + Math.random());
      }
      this.scheduleSparkle();
    }, delayMs);
  }

  /* ── SFX ───────────────────────────────────────────────────────── */

  play(name: SfxName): void {
    if (!this.ctx || !this.sfxBus || this.muted) return;
    switch (name) {
      case 'hover':
        this.blip(1320, 0.05, this.sfxBus, 0.1, 'sine');
        break;
      case 'click':
        this.blip(880, 0.07, this.sfxBus, 0.16, 'square');
        this.noise(0.04, 3500, 0.06);
        break;
      case 'type':
        this.blip(1700 + Math.random() * 600, 0.018, this.sfxBus, 0.05, 'square');
        break;
      case 'confirm':
        this.blip(660, 0.09, this.sfxBus, 0.14, 'triangle');
        window.setTimeout(() => this.blip(990, 0.12, this.sfxBus!, 0.12, 'triangle'), 90);
        break;
      case 'deny':
        this.blip(220, 0.16, this.sfxBus, 0.16, 'sawtooth');
        break;
      case 'whoosh':
        this.noise(0.9, 600, 0.32, 2400);
        break;
      case 'glitch':
        this.noise(0.18, 1800, 0.2);
        this.blip(110, 0.12, this.sfxBus, 0.12, 'sawtooth');
        break;
      case 'rabbit':
        for (let i = 0; i < 5; i++) {
          window.setTimeout(() => this.blip(1320 * Math.pow(2, i / 12), 0.08, this.sfxBus!, 0.1, 'sine'), i * 70);
        }
        break;
    }
  }

  private blip(
    freq: number,
    duration: number,
    bus: GainNode,
    peak: number,
    type: OscillatorType,
    decayMult = 1,
  ): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 6 * decayMult);
    osc.connect(gain).connect(bus);
    osc.start(t);
    osc.stop(t + duration * 6 * decayMult + 0.05);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  /** Filtered noise burst — whooshes, glitches, clicks' transient. */
  private noise(duration: number, cutoff: number, peak: number, sweepTo?: number): void {
    if (!this.ctx || !this.sfxBus) return;
    const ctx = this.ctx;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.8;
    const t = ctx.currentTime;
    filter.frequency.setValueAtTime(cutoff, t);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peak, t + duration * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(gain).connect(this.sfxBus);
    src.start(t);
    src.stop(t + duration + 0.05);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
}

export const audio = new AudioEngine();
