# project-rules.md — HW1: Accessible Enterprise Data-Grid (WCAG 2.2 AA)

Rules are derived from the Lab 2 deck (Manifesto, Deprecation Audit, 4-Stage Decomposition, HW1 spec).
Give this file to the AI at the start of every session.

## Stack
- Vite + TypeScript (strict). React 19 with the automatic JSX transform (`jsx: react-jsx`).
- No Babel standalone. No `import React` boilerplate.

## Workflow (Anti-Monolithic Vibe Coding)
1. Functional slice: break the requirement into isolated sub-problems.
2. Contract first: write the TypeScript interfaces before any implementation.
3. Atomic generation: prompt the AI for exactly ONE task from TASK_DECOMPOSITION.md at a time.
4. Independent verification: DevTools, unit tests, Lighthouse, `git diff`. Never accept unverified AI output.
- Never prompt the AI with more than one sub-task at once.
- One finished task = one atomic commit.

## Banned patterns
- `var` and implicit globals: use `const` / `let`.
- `keypress` and `e.keyCode`: use `keydown` with `e.key` / `e.code`.
- Raw `innerHTML` with dynamic data: use JSX text, DOM APIs or text nodes.
- Inline `onclick="..."` strings.
- Div-soup: use `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, `<td>`, `<button>`.
- Array index or `Math.random()` as `key`: use a stable row id.

## HW1 specifics
- Features: sorting, filtering, pagination.
- WCAG 2.2 Level AA, 4.5:1 text contrast, visible focus, target size of at least 24x24 CSS px.
- Keyboard: arrow keys move between cells, Enter selects, Space toggles.
- Sort state is exposed with `aria-sort` on the active `<th>`. Sort controls are real `<button>`s.
- Result and page changes are announced through an `aria-live="polite"` region.
- Required public contract: `ColumnDef<T>`, `DataGridProps<T>` (see data-grid-contract in the deck).
- Lighthouse must show 100/100 on Accessibility and Best Practices. Keep a screenshot or JSON as evidence.
- Lighthouse is not a full WCAG audit: also test with the keyboard only and with a screen reader.

## Commits
- Conventional Commits, e.g. `feat(grid): add sortable column headers`.
- Types used: feat, fix, test, docs, refactor, chore.

## AI log
- When AI output has a bug, a security hole or a hallucination, log it in AI_FAILURE_AUDIT.md immediately, with proof.
