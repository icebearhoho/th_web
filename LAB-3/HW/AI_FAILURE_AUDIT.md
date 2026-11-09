# AI FAILURE AUDIT — LAB 3 HOMEWORKS

**Student:** Ngo Quang Nhiem — 24521269
**Stack:** React 19 + Vite (plain JSX) + Web Audio API
**Method:** Atomic prompts with `project-rules.md` as context. Each bug below was
pasted into the project temporarily, reproduced in Chrome DevTools, then reverted
with `git checkout -- <file>`. Buggy code was never committed.

---

# HW1 — Production Studio Drum Kit

| # | Failure mode | Detected with | Fix commit |
|---|--------------|---------------|------------|
| 01 | e.key lookup breaks under Vietnamese IME | Console log of e.key vs e.code | `204099c` |
| 02 | Inline callback re-subscribes the window listener every render | Console log in effect setup | `6ae0a56` |
| 03 | No e.repeat guard: holding a key floods hits | Hit log / React Profiler | `204099c` |

## Failure #01: e.key lookup breaks under UniKey / Telex
- **Prompt**: "Play a drum sound when the user presses W, A, S, D, J, K or L."
- **AI Code**:
  ```js
  const onKeyDown = (e) => {
    const pad = PADS.find((p) => p.key === e.key.toUpperCase());
    if (pad) triggerPad(pad);
  };
  ```
- **Bug**: `e.key` is the character the IME produces, not the key pressed. With
  UniKey in Telex mode, pressing W can produce `ư`, so the lookup fails and the
  Clap pad never plays for Vietnamese users. My own Lab 1 Homework2 `app.js` had
  the same issue (`keyMap.get(e.key.toLowerCase())`).
- **DevTools Proof**: With UniKey (Telex) on, a temporary
  `console.log(e.key, e.code)` prints `ư KeyW`, and no hit appears in the log
  (Figure H1-A1). After the fix, the same key press plays Clap (Figure H1-A2).
- **Engineering Fix (commit `204099c`)**: Look up the physical key:
  `const pad = padMap.get(e.code);` with `PAD_BY_CODE` keyed by `'KeyW'`...`'KeyL'`.

## Failure #02: Inline callback re-subscribes the listener on every render
- **Prompt**: "Use the useDrumKeyboard hook inside DrumMachine to trigger pads."
- **AI Code**:
  ```jsx
  useDrumKeyboard(PAD_BY_CODE, (pad) => {
    engine.play(pad.id);
    setActivePad(pad.id);
  });
  ```
- **Bug**: The arrow function is a new object on every render. It is a
  dependency of the hook's `useEffect`, so every hit (which re-renders) removes
  and re-adds the `keydown` listener on `window`. That is wasted work on every hit
  and a stale-closure risk. It breaks rule 7 of `project-rules.md`.
- **DevTools Proof**: A temporary `console.log('subscribe')` in the hook's effect
  prints once per hit (Figure H1-B1). After the fix it prints once on mount
  (twice in dev because of StrictMode) and never again while playing (Figure H1-B2).
- **Engineering Fix (commit `6ae0a56`)**: `triggerPad` is wrapped in
  `useCallback(..., [])`. It only uses refs and functional setState, so it needs
  no dependencies and keeps the same identity on every render.

## Failure #03: Missing e.repeat guard floods hits
- **Prompt**: "Trigger the pad on keydown."
- **AI Code**:
  ```js
  const onKeyDown = (e) => {
    const pad = padMap.get(e.code);
    if (pad) onTriggerPad(pad);
  };
  ```
- **Bug**: Holding a key makes the OS fire repeated `keydown` events (about
  30 per second). Each one plays a sound and re-renders, so holding S sounds like
  a machine gun and the hit log fills instantly.
- **DevTools Proof**: Holding S for 1 second fills the 8-row hit log with the
  same timestamp, and the React Profiler records about 30 commits (Figure H1-C1).
  After the fix: one hit and one hit commit (Figure H1-C2).
- **Engineering Fix (commit `204099c`)**: `if (e.repeat) return;` as the first
  line of the handler.

---

# HW2 — 88-Key Polyphonic Piano
(to be completed)

# HW3 — KRAFTON PUBG VN Arena
(to be completed)