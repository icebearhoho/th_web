# WBS: Homework 3 - Resilient Event Hub & AI Failure Audit

## Slice 1: Drift-Free Countdown Engine
- [ ] T-01: ISO 8601 UTC target timestamp configuration.
- [ ] T-02: Self-correcting time delta calculation against system clock.
- [ ] Target Commit: `feat(countdown): drift-free utc timer engine`

## Slice 2: State-Machine Event Registration Form
- [ ] T-03: Explicit Finite State Machine (IDLE -> SUBMITTING -> SUCCESS / ERROR).
- [ ] T-04: Interactive input locking and ARIA live region feedback.
- [ ] Target Commit: `feat(form): finite state machine submission lifecycle`

## Slice 3: Double-Submit Prevention & XSS Sanitization
- [ ] T-05: Strict debouncing, in-flight AbortController, and button throttling.
- [ ] T-06: DOM textNode/textContent escaping to prevent stored and reflected XSS.
- [ ] Target Commit: `fix(security): double-submit prevention and xss sanitization`

## Slice 4: AI Failure Audit Report & Defensive Polish
- [ ] T-07: Document 3 AI-induced anti-patterns, diagnostics, and refactored solutions.
- [ ] Target Commit: `docs(audit): document ai failure modes and refactoring rationale`
- [ ] Target Commit: `chore(release): final resilient landing page delivery`