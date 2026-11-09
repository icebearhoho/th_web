import { memo } from 'react';
import styles from './GrandPiano88.module.css';

// memo: re-renders ONLY when its own props change (e.g. isPressed flips).
// Works because onNoteOn / onNoteOff are stable (useCallback in the parent).
export const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  ariaLabel,
  isBlack,
  whiteIndex,
  isPressed,
  onNoteOn,
  onNoteOff,
}) {
  const showLabel = !isBlack && noteName.startsWith('C');

  return (
    <li
      className={isBlack ? styles.blackSlot : styles.whiteSlot}
      style={{ '--i': whiteIndex }}
      data-midi={midi}
    >
      <button
        type="button"
        className={`${styles.key} ${isBlack ? styles.black : styles.white} ${
          isPressed ? styles.pressed : ''
        }`}
        aria-label={ariaLabel}
        aria-pressed={isPressed}
        onPointerDown={(e) => {
          if (e.button === 0) onNoteOn(midi);
        }}
        onPointerUp={() => onNoteOff(midi)}
        onPointerLeave={() => onNoteOff(midi)}
        onPointerCancel={() => onNoteOff(midi)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
            e.preventDefault();
            onNoteOn(midi);
          }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNoteOff(midi);
          }
        }}
      >
        {showLabel && <span aria-hidden="true">{noteName}</span>}
      </button>
    </li>
  );
});