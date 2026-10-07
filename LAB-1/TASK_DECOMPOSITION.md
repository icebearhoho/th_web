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

## Exercise 3: Resilient Component Architecture

### Sub-Task T-03A: Loading Skeleton
- **Scope**: Pure CSS shimmer gradient skeleton loader.
- **Constraints**: No external libraries; animated CSS linear gradient.
- **Git Commit Target**: `feat(css): skeleton`

### Sub-Task T-03B: Live Data State
- **Scope**: Active data presentation layout with metadata badges.
- **Constraints**: CSS Grid and Flexbox alignment.
- **Git Commit Target**: `feat(css): component live state`

### Sub-Task T-03C: Empty & Error States
- **Scope**: Resilient empty feedback and error state with accessible retry trigger.
- **Constraints**: Accessible interactive retry button, zero unescaped innerHTML.
- **Git Commit Target**: `feat(ui): empty and error states`

## Homework 1: Production Portfolio Hardening

### Milestone M1: WCAG 2.2 AA Audit & Landmarks
- **Task M1.1**: Audit and repair landmark tree; ensure proper `aria-labelledby` bindings for all content sections.
- **Task M1.2**: Fix invalid semantic child nesting (remove `<article>` feedback elements from inside `<ul>`).
- **Task M1.3**: Adjust design tokens to meet WCAG 2.2 AA minimum contrast ratio (>= 4.5:1) in both light and dark themes.
- **Verification Gate**: Inspect Chrome DevTools Accessibility tree and verify zero contrast warnings in Lighthouse.
- **Git Commit Target**: `fix(a11y): contrast & landmarks`

### Milestone M2: Focus Trap & Keyboard Navigation Audit
- **Task M2.1**: Establish universal high-visibility `:focus-visible` ring across all interactive controls (`a`, `button`, `input`).
- **Task M2.2**: Implement accessible contact modal dialog with top-layer native focus containment (`dialog.showModal()`).
- **Task M2.3**: Ensure complete keyboard escape (`Escape` key) and focus restoration back to opener element.
- **Verification Gate**: Full keyboard-only navigation test (`Tab`, `Shift+Tab`, `Enter`, `Escape`) with zero mouse interaction.
- **Git Commit Target**: `fix(nav): keyboard trap prevention`

### Milestone M3: Strict CSP & Inline Handler Elimination
- **Task M3.1**: Inject strict `Content-Security-Policy` meta header to disallow inline scripts and external injection vectors.
- **Task M3.2**: Audit codebase to ensure zero inline DOM handlers (`onclick`, `onchange`, etc.) exist.
- **Verification Gate**: Verify zero CSP violation errors reported in browser console.
- **Git Commit Target**: `fix(security): enforce strict CSP and decouple event handlers`

### Milestone M4: Lighthouse 100 Asset & Performance Optimization
- **Task M4.1**: Eliminate Cumulative Layout Shift (CLS <= 0.1) by setting explicit `width` and `height` on media elements.
- **Task M4.2**: Implement next-generation responsive media via `<picture>` with AVIF and WebP fallback sources, `loading="lazy"`, and `decoding="async"`.
- **Verification Gate**: Run Google Lighthouse Performance audit on Fast 3G throttling to verify 100 audit score and zero CLS.
- **Git Commit Target**: `perf: optimize assets`