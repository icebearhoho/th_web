# LAB 3 HOMEWORKS — TASK DECOMPOSITION (WBS)

Branch: `LAB-3-HW` (homework only). Project: `LAB-3/HW` (React 19 + Vite).

## H0 — Setup
- [x] Vite React 19 project, createRoot + StrictMode, design tokens
- [x] project-rules.md, TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md
  - Commit `fc21a30` docs(hw): add rules, task breakdown and HW1 audit

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

- [x] H2.1 pianoKeys.js: generate MIDI 21–108 (52 white, 36 black) with
      f = 440 * 2^((midi - 69) / 12); PolyphonicSynth: 8 voices, FIFO stealing
      via Map insertion order, attack/release ramps, close()
- [x] H2.2 PianoKey (React.memo) + GrandPiano88 with stable noteOn/noteOff
      (useCallback), pointer + Enter/Space play, scrollable keyboard centred on C4;
      Profiler proves only 1 of 88 keys re-renders per note
  - Commit `47e41c2` feat(hw2): generate 88 keys and add 8-voice FIFO synth
    (contains H2.1 and the H2.2 components)
- [x] H2.3 Record FIFO queue { midi, freqHz, durationMs, deltaMs } in a ref,
      replay at 0.5x / 1x / 2x, Stop aborts via AbortController
  - Commit `a983584` feat(hw2): render memoized 88-key piano with pointer and keyboard play
    (contains App wiring for H2.2 and the H2.3 sequencer)
- [x] H2.4 Computer-keyboard chords (e.code, Z/X octave shift); window-level
      release on pointerup / pointercancel / blur / visibilitychange (stuck-note fix)
  - Commit `d6d0a5c` feat(hw2): keyboard chords with octave shift and release stuck notes
  - Commit `11441be` fix(hw1): skip keys already handled by another widget
    (drum hook ignores keys the piano already used: e.defaultPrevented)

Note: commits 47e41c2 and a983584 were staged one step late, so their messages
describe less than they contain. The mapping above is the accurate one.

## HW3 — KRAFTON x PUBG Vietnam Arena
Reuses: Lab 2 HW3 flash-sale (countdown, saleReducer, mockApi, requestId guard),
Lab 3 Ex2 (derived filter/sort), Lab 3 Ex3 (AbortController).

- [x] H3.1 countdown.js (getRemainingMs from Date.now() + server offset,
      formatCountdown rounds up); usePubgAirdropTimer(targetEpochMs, serverOffsetMs)
      with visibilitychange resync, state updated only when the shown second changes;
      arenaData.js (4 drops covering every phase, VND formatter, squad standings)
  - Commit `0242b1f` feat(hw3): add zero-drift airdrop timer hook and arena data
- [x] H3.2 arenaApi.js mock server (latency, abort, rivals, 409 / 425 / 410 / 503);
      arenaReducer.js optimistic claim with claimId lock and rollback
  - Commit `fa9af91` feat(hw3): add mock arena API and optimistic claim reducer with rollback
- [x] H3.3 AirdropCard with derived DropPhase (WARMUP | AIRDROP_LIVE | LOOTED_OUT |
      EXPIRED), role="timer", aria-live result; KraftonPubgVnArena with ref lock
      against double clicks, pending requests aborted on unmount, test tools
  - Commit `e3609e6` feat(hw3): render airdrop cards with optimistic claim and 409 rollback
- [x] H3.4 Leaderboard: search, min WWCD (valueAsNumber), sort by total / WWCD /
      placement / kills via toSorted, derived total points, semantic <table>
      with caption, scope and aria-sort
  - Commit `6c9070d` feat(hw3): add PVS leaderboard with derived filter and sort

## Audit
- [x] AI_FAILURE_AUDIT.md: 3 AI failures per homework, DevTools proof, fix commits
