# project-rules.md — HW3: High-Concurrency Flash-Sale E-Commerce Engine

Rules are derived from the Lab 2 deck (Manifesto, Deprecation Audit, 4-Stage Decomposition, Exercise 3, HW3 spec).
Give this file to the AI at the start of every session.

## Stack
- Vite + TypeScript (strict). React 19 with the automatic JSX transform (`jsx: react-jsx`).
- No real backend: use a mock API module with simulated latency, failures and stock.

## Workflow (Anti-Monolithic Vibe Coding)
1. Functional slice: timer, inventory machine, mock API, UI are separate modules.
2. Contract first: write the TypeScript types and events before any implementation.
3. Atomic generation: prompt the AI for exactly ONE task from TASK_DECOMPOSITION.md at a time.
4. Independent verification: unit tests, DevTools Profiler, `git diff`. Never accept unverified AI output.
- Never prompt the AI with more than one sub-task at once.
- One finished task = one atomic commit.

## Banned patterns
- `var` and implicit globals: use `const` / `let`.
- `keypress` and `e.keyCode`: use `keydown` with `e.key` / `e.code`.
- Raw `innerHTML` with dynamic data.
- Inline `onclick="..."` strings.
- `setInterval` as the source of truth for the countdown.
- Array index or `Math.random()` as `key`: use stable product ids.
- Div-soup: use semantic tags (`<main>`, `<section>`, `<article>`, `<button>`, `<time>`).

## HW3 specifics
- Domain: Vietnam mega-sale (11.11 / midnight flash sale). Prices in VND via `Intl.NumberFormat('vi-VN')`, UI copy in Vietnamese or English (pick one and stay consistent).
- Zero-drift timer: compute `remaining = targetTime - now` on every tick (see anti-drift-timer in the deck). Clean up with `cancelAnimationFrame`.
- Clock source: do not trust the device clock alone. Keep a server-time offset (mocked) and apply it to `now`.
- The timer must not re-render the whole page every frame. Isolate it in its own component or update its own text node.
- Inventory state machine: explicit states and events, e.g. IDLE -> RESERVED -> CHECKED_OUT, with EXPIRED and SOLD_OUT. Invalid transitions are rejected, never silently applied.
- Optimistic lock: a reservation has an expiry. The expiry is verified against the server before checkout.
- Async calls use the 4-state ViewState (IDLE | LOADING | SUCCESS | ERROR) with a skeleton and a Retry button. Stale responses are ignored (request id or `AbortController`).
- AI_FAILURE_AUDIT.md must document at least 3 AI flaws.
- Minimum 8 discrete commits, Conventional Commits.

## Commits
- e.g. `feat(timer): add anti-drift countdown`, `feat(inventory): add reservation state machine`.
- Types used: feat, fix, test, docs, refactor, chore.

## AI log
- When AI output has a bug, a security hole or a hallucination, log it in AI_FAILURE_AUDIT.md immediately, with proof.
