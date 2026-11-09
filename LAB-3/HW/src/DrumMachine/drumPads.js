// 7 pads mapped by PHYSICAL key (e.code), so UniKey/Telex can't break them.
export const DRUM_PADS = [
  { id: 'clap',  code: 'KeyW', key: 'W', name: 'Clap'   },
  { id: 'hihat', code: 'KeyA', key: 'A', name: 'Hi-hat' },
  { id: 'kick',  code: 'KeyS', key: 'S', name: 'Kick'   },
  { id: 'snare', code: 'KeyD', key: 'D', name: 'Snare'  },
  { id: 'tom',   code: 'KeyJ', key: 'J', name: 'Tom'    },
  { id: 'ride',  code: 'KeyK', key: 'K', name: 'Ride'   },
  { id: 'crash', code: 'KeyL', key: 'L', name: 'Crash'  },
];

// Built once, so it's the same object every render (stable hook dependency).
export const PAD_BY_CODE = new Map(DRUM_PADS.map((p) => [p.code, p]));