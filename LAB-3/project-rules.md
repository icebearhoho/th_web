# LAB 3 — AI GOVERNANCE RULES

1. STACK: React 19 + Vite + plain JSX (ES2024). Builds on Lab 2.
2. NO LEGACY APIS: never use class components, ReactDOM.render,
   defaultProps, import * as React, keyCode, window.alert.
3. ZERO DIV-SOUP: use main, section, article, header, hgroup,
   dl/dt/dd, ul/li, figure, output, Fragment.
4. A11Y FORMS: every input/select has <label htmlFor={id}> using useId().
5. STATE HYGIENE: immutable updates only (spread, filter, toSorted).
   Never store filtered/sorted lists in state or sync them in useEffect.
6. EFFECT CLEANUP: every timer, listener or fetch inside useEffect
   returns a cleanup (clearTimeout / removeEventListener / abort()).
7. KEYS: stable entity ids only. Never use the array index or the display text as a key.
8. SECURITY: HTTPS media only, no dangerouslySetInnerHTML.
9. BUTTONS: always type="button" unless it submits a form.