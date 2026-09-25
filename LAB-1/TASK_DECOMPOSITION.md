# Work Breakdown Structure (WBS)

## Task T-01: Semantic DOM Architecture & A11y Contract
- **Objective**: Build the initial document skeleton using pure semantic HTML5.
- **Constraints**:
  - Exactly 0 `<div>` elements allowed.
  - Exactly one `<h1>` primary heading.
  - Implement an accessible skip-link to `#main-content`.
  - Proper ARIA landmarks (`role="banner"`, `role="navigation"`, `role="main"`).
  - No CSS styles or JavaScript in this milestone.
- **Verification**: Chrome DevTools Accessibility tree inspection.

### Sub-Task T-02A: Tokens & Reset
- **Scope**: CSS Custom Properties (:root), box-sizing border-box reset, and theme variable pairing.
- **Constraints**:
  - Global reset on `*, *::before, *::after` with `box-sizing: border-box`.
  - Zero hardcoded hex codes inside component styling rules; use `var(--...)`.
  - WCAG 2.2 AA compliant contrast ratio (>= 4.5:1).
  - Clean display at 375px mobile viewport with zero horizontal overflow.
- **Git Commit Target**: `feat(css): tokens & reset`

### Sub-Task T-02B: 2D Grid Layout
- **Scope**: Responsive project card grid using pure semantic HTML and 2D CSS Grid.
- **Constraints**:
  - Zero `<div>` tags; structure cards with `<article>`, `<header>`, `<h3>`, `<p>`, `<footer>`.
  - Grid rule: `repeat(auto-fit, minmax(280px, 1fr))` with `gap: 1.5rem`.
  - Fluid responsiveness without media queries.
- **Git Commit Target**: `feat(css): responsive grid`

### Sub-Task T-02C: Theme Engine
- **Scope**: Client-side theme switching logic with localStorage persistence.
- **Constraints**:
  - Accessible toggle button with dynamic `aria-pressed` attribute.
  - State persisted under key `'theme'` in `localStorage`.
  - Zero console errors during dynamic theme toggling.
  - Full keyboard accessibility (Tab and Enter/Space support).
- **Git Commit Target**: `feat(js): dark mode engine`