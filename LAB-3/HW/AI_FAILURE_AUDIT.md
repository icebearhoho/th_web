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

| # | Failure mode | Detected with | Fix commit |
|---|--------------|---------------|------------|
| 01 | Inline callbacks defeat React.memo: all 88 keys re-render | React Profiler | `47e41c2` |
| 02 | Notes stay stuck when the pointer is released outside the key | Active-voices counter + ears | `d6d0a5c` |
| 03 | Stop does not cancel already-scheduled notes | Listening + active-voices counter | `a983584` |

## Failure #01: Inline callbacks defeat React.memo
- **Prompt**: "Render 88 PianoKey components wrapped in React.memo."
- **AI Code**:
  ```jsx
  {PIANO_KEYS.map((k) => (
    <PianoKey key={k.midi} {...k} isPressed={pressed.has(k.midi)}
      onNoteOn={() => noteOn(k.midi)}
      onNoteOff={() => noteOff(k.midi)} />
  ))}
  ```
- **Bug**: `React.memo` compares props with `Object.is` (the same shallowEqual idea
  as my Lab 2 memo). Each arrow function is a new object on every render, so every
  key's props "change" and all 88 keys re-render on every note. memo does nothing.
- **DevTools Proof**: React Profiler, one key press: 88 PianoKey bars rendered,
  "Why did this render? Props changed: onNoteOn, onNoteOff" (Figure H2-A1).
  After the fix only 1 PianoKey renders and 87 show "Did not render" (Figure H2-A2).
- **Engineering Fix (commit `47e41c2`)**: `noteOn` / `noteOff` are
  `useCallback(..., [])` (they only use refs and functional setState) and are passed
  directly. PianoKey calls `onNoteOn(midi)` with its own `midi` prop, and
  `isPressed` is a plain boolean.

## Failure #02: Stuck notes when the release happens outside the key
- **Prompt**: "Start the note on pointerdown and stop it on pointerup."
- **AI Code**:
  ```jsx
  <button onPointerDown={() => onNoteOn(midi)}
          onPointerUp={() => onNoteOff(midi)}>
  ```
- **Bug**: If the pointer is released somewhere else (outside the key, over
  DevTools, outside the window), or the window loses focus mid-note, the key never
  receives `pointerup`. The oscillator keeps sounding, the key stays highlighted and
  the voice is never freed. I hit this myself while testing: two keys stayed
  orange with "Active voices: 2" while nothing was held.
- **DevTools Proof**: Press a key, drag out over DevTools and release: the key
  stays orange and "Active voices" stays at 1 (Figure H2-B1). After the fix the
  count drops to 0 on release (Figure H2-B2).
- **Engineering Fix (commit `d6d0a5c`)**: Also handle `pointerleave` /
  `pointercancel` on the key, and add window-level `pointerup`, `pointercancel`,
  `blur` and `visibilitychange` listeners that release every note started by the
  pointer or keyboard. All listeners are removed in the effect cleanup.

## Failure #03: Stop does not cancel scheduled notes
- **Prompt**: "Replay the recorded notes at the selected speed."
- **AI Code**:
  ```js
  sequence.forEach((ev) => {
    setTimeout(() => noteOn(ev.midi), ev.startMs / speed);
    setTimeout(() => noteOff(ev.midi), (ev.startMs + ev.durationMs) / speed);
  });
  ```
- **Bug**: Every note is scheduled up front and none of the timer ids are kept, so
  "Stop" (or unmounting) cannot cancel them. The melody keeps playing after Stop,
  and a note that was sounding at Stop may never be released.
- **DevTools Proof**: Record about 10 s, Play, press Stop after 2 s: notes keep
  playing and "Active voices" keeps changing (Figure H2-C1). After the fix, Stop
  gives instant silence and voices drop to 0 (Figure H2-C2).
- **Engineering Fix (commit `a983584`)**: `playSequence` walks the FIFO queue with
  an abortable `wait(deltaMs / speed, signal)`, keeps every note-off timer and every
  sounding note in a Set, and on `abort` clears all timers and releases all notes.
  Stop and unmount call `controller.abort()`.

---

# HW3 — KRAFTON PUBG VN Arena

| # | Failure mode | Detected with | Fix commit |
|---|--------------|---------------|------------|
| 01 | `setSeconds(s => s - 1)` countdown drifts in background tabs | Comparing with the system clock | `0242b1f` |
| 02 | No in-flight lock: a double click sends two claims | `[arena-server]` console log | `fa9af91`, `e3609e6` |
| 03 | Optimistic update without rollback shows wrong stock after 409 | Rival-rush test tool | `fa9af91` |

## Failure #01: Decrementing countdown drifts
- **Prompt**: "Make a countdown hook for the airdrop."
- **AI Code**:
  ```js
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  ```
- **Bug**: It assumes the interval fires exactly every 1000 ms. Chrome throttles
  timers in background tabs (down to about once per minute), so the counter only
  loses 1 per actual tick and falls behind real time. It also never stops at 0.
- **DevTools Proof**: Put the AI hook next to mine, switch to another tab for
  about 1 minute and come back: the AI timer is far behind, mine matches the clock
  immediately (Figure H3-A1).
- **Engineering Fix (commit `0242b1f`)**: `usePubgAirdropTimer` recomputes
  `max(0, target - (Date.now() + serverOffsetMs))` on every tick and on
  `visibilitychange`, so a missed tick can never accumulate error. The interval
  stops at 0 and state only updates when the displayed second changes.

## Failure #02: Double click claims twice
- **Prompt**: "Add a Claim button that calls api.claim and decreases stock."
- **AI Code**:
  ```jsx
  const handleClaim = async () => {
    setStock((s) => s - 1);
    await api.claim(drop.id);
  };
  <button onClick={handleClaim}>Claim</button>
  ```
- **Bug**: Nothing blocks a second click while the first request is pending. A fast
  double click sends two claims, takes two items and deducts stock twice.
  Disabling the button from state alone is not enough, because the second click can
  arrive before React re-renders.
- **DevTools Proof**: Double-click Claim: the console shows two
  `[arena-server] claim request` lines and "Yours" becomes 2 (Figure H3-B1). After
  the fix: one request, one item (Figure H3-B2).
- **Engineering Fix (commits `fa9af91`, `e3609e6`)**: a synchronous `inFlightRef`
  Set blocks the second click immediately; the reducer's `claimStart` returns the
  same state while a `claimId` holds the lock; the button is disabled with
  `aria-busy` while claiming.

## Failure #03: Optimistic update with no rollback
- **Prompt**: "Make the claim feel instant with an optimistic update."
- **AI Code**:
  ```js
  setStock((s) => s - 1);
  try {
    await api.claim(drop.id);
  } catch (err) {
    setError(err.message); // stock stays deducted
  }
  ```
- **Bug**: On 409 (or 503) the error is shown but the optimistic deduction is never
  undone, so the UI shows less stock than really exists and the card can wrongly
  show "Looted out".
- **DevTools Proof**: "Server error (next claim → 503)" then Claim: the AI version
  ends with the stock 1 lower than before even though nothing was claimed
  (Figure H3-C1). After the fix the stock returns to its previous value and the
  message reads "503 — Server busy" (Figure H3-C2).
- **Engineering Fix (commit `fa9af91`)**: `claimRollback` restores the stock (or
  takes the server's real stock on 409), unlocks only that drop, and only if its
  `claimId` still holds the lock, so a late answer from an old claim is ignored.
