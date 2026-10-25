# LAB 3 — TASK DECOMPOSITION (WBS)

## Block 1 — Setup
- [ ] 0.1 Vite React 19 scaffold, createRoot + StrictMode
- [ ] 0.2 project-rules.md, TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md
- Commit: `chore: init react19 vite & rules`

## Exercise 1 — DeveloperCard (Sprint 1)
- [ ] 1.1 Props contract (fullName, role, avatarUrl, metrics, skills)
- [ ] 1.2 DeveloperCard + SkillBadge, zero <div>, <dl> via Object.entries
- Commit: `feat(ex1): implement semantic DeveloperCard and SkillBadge`
- [ ] 1.3 CSS Module, custom properties, 375px, avatar fallback
- Commit: `style(ex1): add responsive 375px CSS module`

## Exercise 2 — ScientistDirectory (Sprint 2)
- [ ] 2.1 SMART_PEOPLE with stable ids
- Commit: `feat(ex2): normalize smartPeople schema with stable IDs`
- [ ] 2.2 Search + min IQ (valueAsNumber) + sort (toSorted), derived in render
- Commit: `feat(ex2): add search, IQ filter & toSorted`
- [ ] 2.3 Delete / reset + <output role="status">
- Commit: `feat(ex2): add delete/reset & live status`

## Exercise 3 — PubgMatchTelemetry (Sprint 3)
- [ ] 3.1 Mock API (latency, 35% loss, abort signal) + 4-state machine
- Commit: `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`
- [ ] 3.2 Skeleton 220px + role="alert" retry
- Commit: `feat(ex3): add skeleton UI & retry alert`