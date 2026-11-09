import { useCallback, useEffect, useRef, useState } from 'react';
import { PIANO_KEYS, midiToFreq } from './pianoKeys.js';
import { PolyphonicSynth } from './PolyphonicSynth.js';
import { PianoKey } from './PianoKey.jsx';
import styles from './GrandPiano88.module.css';

const MAX_VOICES = 8;

// Return the SAME Set when nothing changes, so React can skip the render
function addTo(set, value) {
  if (set.has(value)) return set;
  const next = new Set(set);
  next.add(value);
  return next;
}
function removeFrom(set, value) {
  if (!set.has(value)) return set;
  const next = new Set(set);
  next.delete(value);
  return next;
}

export function GrandPiano88() {
  const synthRef = useRef(null);   // audio engine is not UI data
  const scrollerRef = useRef(null);

  const [pressed, setPressed] = useState(() => new Set());
  const [voiceCount, setVoiceCount] = useState(0);

  // Start the view centred on middle C (C4): set scrollLeft on the scroll box only
  useEffect(() => {
    const scroller = scrollerRef.current;
    const c4 = scroller?.querySelector('[data-midi="60"]');
    if (!scroller || !c4) return;
    scroller.scrollLeft = c4.offsetLeft + c4.offsetWidth / 2 - scroller.clientWidth / 2;
  }, []);

  // Release audio on unmount
  useEffect(() => {
    return () => {
      synthRef.current?.close();
      synthRef.current = null;
    };
  }, []);

  const noteOn = useCallback((midi) => {
    synthRef.current ??= new PolyphonicSynth(MAX_VOICES);
    const synth = synthRef.current;
    const stolen = synth.noteOn(midi, midiToFreq(midi));
    setPressed((prev) => {
      const next = addTo(prev, midi);
      return stolen === null ? next : removeFrom(next, stolen);
    });
    setVoiceCount(synth.activeVoices);
  }, []);

  const noteOff = useCallback((midi) => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.noteOff(midi);
    setPressed((prev) => removeFrom(prev, midi));
    setVoiceCount(synth.activeVoices);
  }, []);

  return (
    <section className={styles.piano} aria-labelledby="piano-title">
      <header className={styles.header}>
        <h2 id="piano-title">88-Key Grand Piano</h2>
        <p>
          A0 – C8 · {PIANO_KEYS.length} keys · up to {MAX_VOICES} voices
        </p>
      </header>

      <p className={styles.status}>
        Active voices: <strong>{voiceCount}</strong> / {MAX_VOICES}
      </p>

      <section
        ref={scrollerRef}
        className={styles.scroller}
        tabIndex={0}
        aria-label="Piano keyboard, scroll horizontally"
      >
        <ul className={styles.keyboard} aria-label="Piano keys A0 to C8">
          {PIANO_KEYS.map((k) => (
            <PianoKey
              key={k.midi}
              midi={k.midi}
              noteName={k.noteName}
              ariaLabel={k.ariaLabel}
              isBlack={k.isBlack}
              whiteIndex={k.whiteIndex}
              isPressed={pressed.has(k.midi)}
              onNoteOn={noteOn}
              onNoteOff={noteOff}
            />
          ))}
        </ul>
      </section>
    </section>
  );
}