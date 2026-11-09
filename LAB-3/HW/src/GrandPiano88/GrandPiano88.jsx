import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { PIANO_KEYS, midiToFreq } from './pianoKeys.js';
import { PolyphonicSynth } from './PolyphonicSynth.js';
import { PianoKey } from './PianoKey.jsx';
import { buildSequence, playSequence } from './sequencer.js';
import styles from './GrandPiano88.module.css';

const MAX_VOICES = 8;
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 7;

// Computer keyboard laid out like a piano (physical keys, e.code):
// A-row = white keys, row above = black keys. Offset in semitones from C.
const KEY_OFFSETS = {
  KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7,
  KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14,
};
const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

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
  const speedId = useId();

  const synthRef = useRef(null);            // audio engine is not UI data
  const scrollerRef = useRef(null);
  const recordingRef = useRef(null);        // { startedAt, open: Map, notes: [] } while recording
  const playbackRef = useRef(null);         // AbortController while playing
  const pointerHeldRef = useRef(new Set()); // notes held by mouse / touch
  const keyHeldRef = useRef(new Map());     // e.code -> midi held by computer keyboard

  const [pressed, setPressed] = useState(() => new Set());
  const [voiceCount, setVoiceCount] = useState(0);
  const [mode, setMode] = useState('IDLE'); // 'IDLE' | 'RECORDING' | 'PLAYING'
  const [sequence, setSequence] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [octave, setOctave] = useState(4);  // A key = C4 (MIDI 60)

  // Start the view centred on middle C (C4): set scrollLeft on the scroll box only
  useEffect(() => {
    const scroller = scrollerRef.current;
    const c4 = scroller?.querySelector('[data-midi="60"]');
    if (!scroller || !c4) return;
    scroller.scrollLeft = c4.offsetLeft + c4.offsetWidth / 2 - scroller.clientWidth / 2;
  }, []);

  // Unmount: stop playback first, then release audio
  useEffect(() => {
    return () => {
      playbackRef.current?.abort();
      synthRef.current?.close();
      synthRef.current = null;
    };
  }, []);

  const noteOn = useCallback((midi, source) => {
    synthRef.current ??= new PolyphonicSynth(MAX_VOICES);
    const synth = synthRef.current;
    const stolen = synth.noteOn(midi, midiToFreq(midi));
    if (source === 'pointer') pointerHeldRef.current.add(midi);
    setPressed((prev) => {
      const next = addTo(prev, midi);
      return stolen === null ? next : removeFrom(next, stolen);
    });
    setVoiceCount(synth.activeVoices);

    const rec = recordingRef.current;
    if (rec) rec.open.set(midi, performance.now());
  }, []);

  const noteOff = useCallback((midi) => {
    pointerHeldRef.current.delete(midi);
    const synth = synthRef.current;
    if (!synth) return;
    synth.noteOff(midi);
    setPressed((prev) => removeFrom(prev, midi));
    setVoiceCount(synth.activeVoices);

    const rec = recordingRef.current;
    if (rec?.open.has(midi)) {
      const start = rec.open.get(midi);
      rec.open.delete(midi);
      rec.notes.push({
        id: crypto.randomUUID(),
        midi,
        freqHz: midiToFreq(midi),
        startMs: start - rec.startedAt,
        durationMs: performance.now() - start,
      });
    }
  }, []);

  // Safety net against stuck notes: release when the pointer is let go ANYWHERE,
  // when the window loses focus, or when the tab is hidden.
  useEffect(() => {
    const releasePointerNotes = () => {
      [...pointerHeldRef.current].forEach((midi) => noteOff(midi));
    };
    const releaseAll = () => {
      releasePointerNotes();
      keyHeldRef.current.forEach((midi) => noteOff(midi));
      keyHeldRef.current.clear();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') releaseAll();
    };

    window.addEventListener('pointerup', releasePointerNotes);
    window.addEventListener('pointercancel', releasePointerNotes);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pointerup', releasePointerNotes);
      window.removeEventListener('pointercancel', releasePointerNotes);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [noteOff]);

  // Computer keyboard: only while focus is inside the piano section
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (TYPING_TAGS.has(e.target.tagName)) return;

    if (e.code === 'KeyZ' || e.code === 'KeyX') {
      e.preventDefault();
      if (!e.repeat) {
        const step = e.code === 'KeyX' ? 1 : -1;
        setOctave((o) => Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, o + step)));
      }
      return;
    }

    const offset = KEY_OFFSETS[e.code];
    if (offset === undefined) return;
    e.preventDefault(); // tells the drum kit's window listener to ignore this key
    if (e.repeat || keyHeldRef.current.has(e.code)) return;

    const midi = 12 * (octave + 1) + offset;
    if (midi < 21 || midi > 108) return;
    keyHeldRef.current.set(e.code, midi); // remember the note, even if the octave changes
    noteOn(midi);
  };

  const handleKeyUp = (e) => {
    const midi = keyHeldRef.current.get(e.code);
    if (midi === undefined) return;
    e.preventDefault();
    keyHeldRef.current.delete(e.code);
    noteOff(midi);
  };

  const startRecording = () => {
    recordingRef.current = { startedAt: performance.now(), open: new Map(), notes: [] };
    setMode('RECORDING');
  };

  const stopRecording = () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    setMode('IDLE');
    if (!rec) return;
    const now = performance.now();
    // close notes still held when recording stopped
    rec.open.forEach((start, midi) => {
      rec.notes.push({
        id: crypto.randomUUID(),
        midi,
        freqHz: midiToFreq(midi),
        startMs: start - rec.startedAt,
        durationMs: now - start,
      });
    });
    setSequence(buildSequence(rec.notes));
  };

  const play = async () => {
    if (sequence.length === 0) return;
    const controller = new AbortController();
    playbackRef.current = controller;
    setMode('PLAYING');
    try {
      await playSequence(sequence, {
        speed,
        signal: controller.signal,
        noteOn,
        noteOff,
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      if (playbackRef.current === controller) {
        playbackRef.current = null;
        setMode('IDLE');
      }
    }
  };

  const stop = () => playbackRef.current?.abort();

  // Derived status text (not separate state)
  const statusText =
    mode === 'RECORDING'
      ? 'Recording… play some notes'
      : mode === 'PLAYING'
        ? `Playing ${sequence.length} notes at ${speed}×`
        : sequence.length > 0
          ? `${sequence.length} notes recorded`
          : 'Ready';

  return (
    <section
      className={styles.piano}
      aria-labelledby="piano-title"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <header className={styles.header}>
        <h2 id="piano-title">88-Key Grand Piano</h2>
        <p>
          A0 – C8 · {PIANO_KEYS.length} keys · up to {MAX_VOICES} voices
        </p>
        <p>
          Click the keyboard, then play chords with A W S E D F T G Y H U J K O L ·
          Z / X = octave down / up (A = C{octave})
        </p>
      </header>

      <form className={styles.controls} onSubmit={(e) => e.preventDefault()}>
        <button
          type="button"
          aria-pressed={mode === 'RECORDING'}
          disabled={mode === 'PLAYING'}
          onClick={mode === 'RECORDING' ? stopRecording : startRecording}
        >
          {mode === 'RECORDING' ? '■ Stop recording' : '● Record'}
        </button>
        <button
          type="button"
          disabled={mode !== 'IDLE' || sequence.length === 0}
          onClick={play}
        >
          ▶ Play
        </button>
        <button type="button" disabled={mode !== 'PLAYING'} onClick={stop}>
          ■ Stop
        </button>
        <button
          type="button"
          disabled={mode !== 'IDLE' || sequence.length === 0}
          onClick={() => setSequence([])}
        >
          Clear
        </button>

        <label htmlFor={speedId}>Speed</label>
        <select
          id={speedId}
          value={speed}
          disabled={mode === 'PLAYING'}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
        </select>
      </form>

      <p className={styles.status}>
        <output aria-live="polite">{statusText}</output>
        {' · '}Active voices: <strong>{voiceCount}</strong> / {MAX_VOICES}
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