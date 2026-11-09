import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DRUM_PADS, PAD_BY_CODE } from './drumPads.js';
import { DrumEngine } from './drumEngine.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';
import styles from './DrumMachine.module.css';

const FLASH_MS = 120;
const MAX_LOG = 8;
const toDb = (level) => (level > 0 ? 20 * Math.log10(level) : -Infinity);

export function DrumMachine() {
  const toggleId = useId();
  const notesId = useId();

  const engineRef = useRef(null);       // not UI data -> ref, not state
  const flashTimers = useRef(new Map()); // padId -> timeout id

  const [activePads, setActivePads] = useState(() => new Set());
  const [keysEnabled, setKeysEnabled] = useState(true);
  const meterId = useId();
  const [hits, setHits] = useState([]); // newest first
  const [level, setLevel] = useState(0);
  const lastHit = hits[0];
  // Release audio + timers on unmount (StrictMode runs this once in dev, too)
  useEffect(() => {
    const timers = flashTimers.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      engineRef.current?.close();
      engineRef.current = null;
    };
  }, []);

  // Stable identity: only refs and functional setState inside, so deps = []
  const triggerPad = useCallback((pad) => {
    engineRef.current ??= new DrumEngine(); // created lazily, on a user gesture
    engineRef.current.play(pad.id);

    setActivePads((prev) => new Set(prev).add(pad.id));
    window.clearTimeout(flashTimers.current.get(pad.id));
    const timerId = window.setTimeout(() => {
      setActivePads((prev) => {
        const next = new Set(prev);
        next.delete(pad.id);
        return next;
      });
      flashTimers.current.delete(pad.id);
    }, FLASH_MS);
    flashTimers.current.set(pad.id, timerId);
  }, []);

  useDrumKeyboard(PAD_BY_CODE, triggerPad, keysEnabled);

  return (
    <section className={styles.studio} aria-labelledby="drum-title">
      <header className={styles.header}>
        <h2 id="drum-title">Production Studio Drum Kit</h2>
        <p>Press W A S D J K L, or click / tap a pad.</p>
      </header>

      <form className={styles.controls} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={toggleId} className={styles.toggle}>
          <input
            id={toggleId}
            type="checkbox"
            checked={keysEnabled}
            onChange={(e) => setKeysEnabled(e.target.checked)}
          />
          Keyboard shortcuts
        </label>

        <label htmlFor={notesId}>Session notes</label>
        <input
          id={notesId}
          type="text"
          placeholder="Typing here won't trigger pads"
        />
      </form>

      <ul className={styles.pads} aria-label="Drum pads">
        {DRUM_PADS.map((pad) => {
          const isActive = activePads.has(pad.id);
          return (
            <li key={pad.id}>
              <button
                type="button"
                className={`${styles.pad} ${isActive ? styles.padActive : ''}`}
                aria-pressed={isActive}
                aria-keyshortcuts={pad.key}
                aria-label={`${pad.name}, key ${pad.key}`}
                onPointerDown={(e) => {
                  if (e.button === 0) triggerPad(pad);
                }}
                onKeyDown={(e) => {
                  // Enter/Space on a focused pad (keyboard users without W-L)
                  if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                    e.preventDefault();
                    triggerPad(pad);
                  }
                }}
              >
                <span className={styles.padKey} aria-hidden="true">{pad.key}</span>
                <span className={styles.padName} aria-hidden="true">{pad.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}