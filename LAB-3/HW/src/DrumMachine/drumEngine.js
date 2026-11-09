const VOICES = {
  kick:  { type: 'sine',     from: 150, to: 0.01, peak: 1.0,  dur: 0.5 },
  snare: { type: 'triangle', from: 100, to: 100,  peak: 0.7,  dur: 0.2,  noise: true },
  hihat: { type: 'square',   from: 800, to: 800,  peak: 0.3,  dur: 0.05, noise: true },
  clap:  { type: 'sawtooth', from: 400, to: 400,  peak: 0.6,  dur: 0.15 },
  tom:   { type: 'sine',     from: 220, to: 0.01, peak: 0.8,  dur: 0.3 },
  ride:  { type: 'square',   from: 600, to: 580,  peak: 0.25, dur: 0.6 },
  crash: { type: 'square',   from: 450, to: 450,  peak: 0.5,  dur: 1.0,  noise: true },
};

export class DrumEngine {
  constructor() {
    this.ctx = null; // created on the first hit, not on page load
    this.noiseBuffer = null;
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const length = this.ctx.sampleRate; // 1 second of white noise
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  play(soundId) {
    const voice = VOICES[soundId];
    if (!voice) return 0;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(voice.peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + voice.dur);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = voice.type;
    osc.frequency.setValueAtTime(voice.from, now);
    osc.frequency.exponentialRampToValueAtTime(voice.to, now + voice.dur);
    const sources = [osc];

    if (voice.noise) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      sources.push(noise);
    }

    // Disconnect the shared gain only after every source has finished
    let remaining = sources.length;
    for (const src of sources) {
      src.connect(gain);
      src.onended = () => {
        src.disconnect();
        remaining -= 1;
        if (remaining === 0) gain.disconnect();
      };
      src.start(now);
      src.stop(now + voice.dur);
    }

    return voice.peak; // for the level meter
  }

  close() {
    this.ctx?.close();
    this.ctx = null;
  }
}