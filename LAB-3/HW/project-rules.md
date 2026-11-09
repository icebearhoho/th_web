# LAB 3 HOMEWORKS — AI GOVERNANCE RULES

Feed this file to the AI assistant before every prompt.
One small prompt per sub-task. Never paste a whole homework prompt (one-shot ban).

## General (all homeworks)
1. STACK: React 19 + Vite + plain JSX (ES2024). No UI or audio libraries.
2. NO LEGACY APIS: no class components, ReactDOM.render, defaultProps,
   import * as React, window.alert, e.keyCode / e.which / keypress.
3. ZERO DIV-SOUP: main, section, article, header, ul/li, ol/li, dl/dt/dd,
   output, meter, figure.
4. A11Y (WCAG 2.2 AA): every input/select has <label htmlFor> via useId();
   buttons are type="button"; visible :focus-visible; targets >= 24x24 px;
   text contrast >= 4.5:1.
5. STATE HYGIENE: immutable updates only (spread, new Set/Map, filter, toSorted).
   Never sync derived data in useEffect.
6. EFFECT CLEANUP: every listener, timer, fetch and AudioContext created in an
   effect is removed / cleared / aborted / closed in its cleanup.
7. STABLE IDENTITY: maps and callbacks passed to hooks or memo components are
   module-level constants or wrapped in useCallback / useMemo.
8. NON-UI OBJECTS (audio engines, timers, AbortControllers) live in useRef, not state.
9. KEYS: stable ids only, never the array index.
10. LAYOUT: no horizontal page scroll at 375px; respect prefers-reduced-motion.

## HW1 — Production Studio Drum Kit
- Read the physical key with e.code ('KeyW'...'KeyL'), never e.key
  (Vietnamese IME UniKey/Telex changes e.key).
- `if (e.repeat) return;` and ignore keys typed in INPUT / TEXTAREA / SELECT /
  contenteditable, and keys pressed with Ctrl / Alt / Meta.
- Create the AudioContext on the first user gesture; disconnect nodes when they end.
- Every hit is also shown visually (aria-live output, hit log, level meter).

## HW2 — 88-Key Polyphonic Piano
- Generate keys from MIDI 21–108 with f = 440 * 2^((midi - 69) / 12); never hardcode.
- Max 8 voices; FIFO voice stealing via Map insertion order.
- Attack/release gain ramps (no clicks); stop oscillators after the release.
- PianoKey is React.memo; pressing one key re-renders only that key.
- Recording is a FIFO queue { midi, freqHz, durationMs, deltaMs }; replay at
  0.5x / 1x / 2x, cancellable with AbortController.

## HW3 — KRAFTON PUBG VN Arena
- Countdowns compute target - Date.now(); never decrement a counter.
  Resync on visibilitychange.
- Optimistic claims roll back on 409; an in-flight lock blocks double clicks.
- Prices use Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).