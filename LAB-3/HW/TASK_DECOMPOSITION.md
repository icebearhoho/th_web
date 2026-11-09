# LAB 3 HOMEWORKS — TASK DECOMPOSITION (WBS)

Branch: `LAB-3-HW` (homework only). Project: `LAB-3/HW` (React 19 + Vite).

## H0 — Setup
- [x] Vite React 19 project, createRoot + StrictMode, design tokens
- [ ] project-rules.md, TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md
- Commit: `docs(hw): add rules, task breakdown and audit`

## HW1 — Production Studio Drum Kit
Reuses: Lab 1 Homework2 (`audio-engine.js` synth voices, e.repeat guard),
Lab 2 HW1 data-grid (WCAG 2.2 AA focus, contrast, aria-live, target size).

- [x] H1.1 Pad contract { id, code, key, name } for 7 pads (W A S D J K L),
      PAD_BY_CODE at module level; DrumEngine with lazy AudioContext,
      7 synthesized voices, node disconnect on end, close()
  - Commit `660be51` feat(hw1): add drum pad map and Web Audio engine
- [x] H1.2 useDrumKeyboard(padMap, onTriggerPad, isEnabled): e.code lookup,
      e.repeat guard, typing-target guard, modifier guard, listener cleanup
  - Commit `204099c` feat(hw1): add useDrumKeyboard hook with e.code and repeat guard
- [x] H1.3 Pads as <button type="button" aria-pressed aria-keyshortcuts>,
      pointer + Enter/Space trigger, stable triggerPad (useCallback),
      flash timers + AudioContext released on unmount
  - Commit `6ae0a56` feat(hw1): render accessible drum pads
- [x] H1.4 <output aria-live="polite"> last hit, <ol> hit log (newest first,
      max 8, stable ids), <meter> level with dB readout and decay
  - Commit `9ddffee` feat(hw1): add visual hit log and level meter
- [x] H1.5 CSS Module: tokens, 4.5:1 contrast, :focus-visible, >= 24px targets,
      3 columns at 375px, prefers-reduced-motion; Lighthouse Accessibility 100
  - Commit `5b50daf` style(hw1): responsive WCAG 2.2 AA studio layout

## HW2 — 88-Key Polyphonic Piano & FIFO Sequencer
Reuses: Lab 2 HW2 (`AudioTaskQueue` FIFO, `audioSession` stop-all),
Lab 1 Homework2 (`recorder.js`), Lab 2 custom memo/shallowEqual -> React.memo.

- [ ] H2.1 pianoKeys.js: generate MIDI 21–108 (52 white, 36 black) with
      f = 440 * 2^((midi - 69) / 12); PolyphonicSynth: 8 voices, FIFO stealing,
      attack/release ramps, close()
  - Commit: `feat(hw2): generate 88 keys and add 8-voice FIFO synth`
- [ ] H2.2 PianoKey (React.memo) + GrandPiano88 with stable noteOn/noteOff,
      pointer + keyboard play, scrollable keyboard; Profiler proves 1 key renders
  - Commit: `feat(hw2): render memoized 88-key piano with pointer and keyboard play`
- [ ] H2.3 Record FIFO queue { midi, freqHz, durationMs, deltaMs }, replay at
      0.5x / 1x / 2x, Stop aborts via AbortController
  - Commit: `feat(hw2): record FIFO sequence and replay at 0.5x/1x/2x with AbortController`

## HW3 — KRAFTON x PUBG Vietnam Arena
Reuses: Lab 2 HW3 flash-sale (countdown, saleReducer, mockApi, loadReducer),
Lab 3 Ex2 (derived filter/sort), Lab 3 Ex3 (AbortController).
- [ ] (tasks added when HW3 starts)

## Audit
- [ ] AI_FAILURE_AUDIT.md: >= 3 verified AI bugs per homework, DevTools proof, fix commits