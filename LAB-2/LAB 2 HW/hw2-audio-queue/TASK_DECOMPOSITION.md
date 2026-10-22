# Work Breakdown Structure (WBS) — HW2: Audio Visualizer Queue Engine

- [ ] Task 2.1: Define contracts: AudioTask, QueueOptions (concurrency), TaskStatus, QueueEvent (Contract)
- [ ] Task 2.2: Scaffold Vite + TS project, strict tsconfig, test runner
- [ ] Task 2.3: Implement AudioTaskQueue with FIFO ordering and concurrency limit, with unit tests
- [ ] Task 2.4: Implement fetch with AbortController cancellation and error mapping
- [ ] Task 2.5: Implement decodeAudioData step with ordered result delivery
- [ ] Task 2.6: Implement AudioContext lifecycle (create and resume on user gesture)
- [ ] Task 2.7: Implement playback chain: source -> AnalyserNode (FFT 256/512) -> destination
- [ ] Task 2.8: Implement requestAnimationFrame canvas visualizer with a reused Uint8Array
- [ ] Task 2.9: Implement cleanup: stop and disconnect nodes, cancel rAF, release buffers, close context
- [ ] Task 2.10: Verify 60fps (Performance panel) and no leaks (Memory heap snapshots), save evidence
- [ ] Task 2.11: Log AI failures found while building in AI_FAILURE_AUDIT.md
- [ ] Task 2.12: Atomic Git Commit per completed task (Conventional Commits)

* RULE: Never prompt AI with >1 sub-task simultaneously.
