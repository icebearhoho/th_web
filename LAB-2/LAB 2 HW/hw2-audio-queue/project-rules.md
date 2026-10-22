# project-rules.md — HW2: Concurrent FIFO Audio Visualizer Queue Engine

Rules are derived from the Lab 2 deck (Manifesto, Deprecation Audit, 4-Stage Decomposition, HW2 spec).
Give this file to the AI at the start of every session.

## Stack
- Vite + TypeScript (strict). Vanilla TS for the engine and visualizer. Add a UI framework only for the control panel if needed.
- Web Audio API (`AudioContext`, `AnalyserNode`, `AudioBufferSourceNode`), `fetch` with `AbortController`, Canvas 2D.

## Workflow (Anti-Monolithic Vibe Coding)
1. Functional slice: queue, fetch, decode, analyse, draw are separate modules.
2. Contract first: write the TypeScript interfaces before any implementation.
3. Atomic generation: prompt the AI for exactly ONE task from TASK_DECOMPOSITION.md at a time.
4. Independent verification: unit tests, DevTools Performance and Memory panels, `git diff`. Never accept unverified AI output.
- Never prompt the AI with more than one sub-task at once.
- One finished task = one atomic commit.

## Banned patterns
- `var` and implicit globals: use `const` / `let`.
- `keypress` and `e.keyCode`: use `keydown` with `e.key` / `e.code`.
- Raw `innerHTML` with dynamic data (track titles, URLs).
- Inline `onclick="..."` strings.
- Listeners or nodes created without a matching cleanup path.

## HW2 specifics
- AnalyserNode with FFT size 256 or 512 (frequencyBinCount 128 or 256).
- FIFO queue: tasks start in arrival order, with an explicit concurrency limit for downloads and decodes. Decode results are delivered in order.
- Cancellation: every task owns an `AbortController`. Cancelling aborts the fetch and rejects the promise.
- `AudioContext` starts or resumes only after a user gesture.
- Memory safety: on stop or end, call `source.stop()`, `source.disconnect()`, drop references to buffers, cancel `requestAnimationFrame`, close the context when done.
- Visualizer: driven by `requestAnimationFrame`, reads `getByteFrequencyData` into one reused `Uint8Array`, no per-frame allocation, no per-frame framework state updates.
- Verify no leak with the DevTools Memory panel (heap snapshots before and after N queue cycles).

## Commits
- Conventional Commits, e.g. `feat(queue): add AbortController cancellation`.
- Types used: feat, fix, test, docs, refactor, chore.

## AI log
- When AI output has a bug, a security hole or a hallucination, log it in AI_FAILURE_AUDIT.md immediately, with proof.
