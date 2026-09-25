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