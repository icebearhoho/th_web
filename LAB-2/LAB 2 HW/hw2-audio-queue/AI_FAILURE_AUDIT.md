# AI_FAILURE_AUDIT.md — HW2: Audio Visualizer Queue Engine

Fill in only bugs you actually hit and verified. Each entry needs real proof (screenshot, DevTools output, git diff).

## Entry template (copy per finding)

## Vulnerability NN: <short title>
- AI Prompt: '<exact prompt you gave>'
- AI Generated Code: <the faulty snippet>
- Risk: <what breaks and for whom>
- Detection Method: <DevTools Memory/Performance, unit test, git diff>
- Engineering Refactor: <your manual fix>
- Evidence: <file or screenshot path>

## Failure modes to watch for in this homework
- `AbortController` created but its signal never passed to `fetch`.
- `AudioBufferSourceNode` never stopped or disconnected, so nodes and buffers leak.
- `new Uint8Array` allocated inside the rAF loop (GC churn, dropped frames).
- `requestAnimationFrame` loop that is never cancelled after the component or player stops.
- `AudioContext` created on page load, so the browser blocks it (needs a user gesture).
- A "FIFO queue" that actually runs every task in parallel, or one that serializes everything.

## Findings
(none logged yet)
