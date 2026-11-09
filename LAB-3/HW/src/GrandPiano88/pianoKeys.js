const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Equal temperament: A4 (MIDI 69) = 440 Hz
export const midiToFreq = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Generated, never hardcoded: MIDI 21 (A0) .. 108 (C8) = 88 keys
function buildKeys() {
  const keys = [];
  let whiteCount = 0;
  for (let midi = 21; midi <= 108; midi += 1) {
    const name = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    const isBlack = name.includes('#');
    keys.push({
      midi,
      noteName: `${name}${octave}`,
      ariaLabel: isBlack ? `${name[0]} sharp ${octave}` : `${name}${octave}`,
      isBlack,
      // white key: its own position; black key: number of white keys before it
      whiteIndex: whiteCount,
      freqHz: midiToFreq(midi),
    });
    if (!isBlack) whiteCount += 1;
  }
  return keys;
}

export const PIANO_KEYS = buildKeys();
export const WHITE_KEY_COUNT = PIANO_KEYS.filter((k) => !k.isBlack).length;
export const BLACK_KEY_COUNT = PIANO_KEYS.length - WHITE_KEY_COUNT;