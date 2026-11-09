// 8-voice synth with FIFO voice stealing.
// A Map remembers insertion order, so its first key is always the OLDEST note.
export class PolyphonicSynth {
  constructor(maxVoices = 8) {
    this.maxVoices = maxVoices;
    this.ctx = null;      // created lazily on the first note (user gesture)
    this.master = null;
    this.voices = new Map(); // midi -> { osc, gain }
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5; // 8 voices x 0.25 x 0.5 = 1.0, no clipping
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  get activeVoices() {
    return this.voices.size;
  }

  /** Starts a note. Returns the MIDI number of a stolen voice, or null. */
  noteOn(midi, freqHz) {
    const ctx = this.ensureContext();
    let stolen = null;

    if (this.voices.has(midi)) this.noteOff(midi); // re-trigger same key
    if (this.voices.size >= this.maxVoices) {
      stolen = this.voices.keys().next().value;   // oldest = first in Map
      this.noteOff(stolen);
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqHz, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01); // 10 ms attack
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    this.voices.set(midi, { osc, gain });
    return stolen;
  }

  noteOff(midi) {
    const voice = this.voices.get(midi);
    if (!voice || !this.ctx) return;
    this.voices.delete(midi);

    const now = this.ctx.currentTime;
    const g = voice.gain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.exponentialRampToValueAtTime(0.0001, now + 0.04); // 40 ms release: no click
    voice.osc.stop(now + 0.05);
  }

  allNotesOff() {
    for (const midi of [...this.voices.keys()]) this.noteOff(midi);
  }

  close() {
    this.allNotesOff();
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
}