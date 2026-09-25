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

