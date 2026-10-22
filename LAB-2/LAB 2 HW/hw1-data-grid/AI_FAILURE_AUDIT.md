# AI Failure Mode Audit Report

Scope: HW1, Accessible Enterprise Data-Grid (Vite + React 19 + TypeScript).
Every finding below was reproduced while building this project. Before submitting, add your own screenshot under each **Evidence** line and replace any `<paste ...>` placeholder with your exact prompt.

## Vulnerability 01: Incomplete Scaffold Instructions Leave the Template App Importing a Missing Asset
- **AI Prompt:** '<paste your Step 1 prompt, e.g. "ok now start with the hw1 i need you to give me the code here so i can run on vs code ... we will go step by step">'
- **AI Generated Code:** Step 1 told me to scaffold with Vite and add `types.ts`, but never replaced the template `src/App.tsx`, which still contained:
  ```tsx
  import heroImg from './assets/hero.png'
  import reactLogo from './assets/react.svg'
  import viteLogo from './assets/vite.svg'
  import './App.css'
  ```
- **Risk:** The dev server cannot start the page. The browser shows a full-screen Vite error overlay instead of the app, so the first step cannot be verified at all.
- **Detection Method:** `npm run dev`, then open `http://localhost:5173/`. The overlay reads `[plugin:vite:import-analysis] Failed to resolve import "./assets/hero.png" from "src/App.tsx". Does the file exist?`
- **Engineering Refactor:** Replace `src/App.tsx` with a minimal placeholder, replace `src/index.css`, and delete the unused `App.css`:
  ```tsx
  export default function App() {
    return (
      <main>
        <h1>HW1: Accessible Data-Grid</h1>
      </main>
    )
  }
  ```
- **Evidence:** (add the screenshot of the Vite error overlay and of the page after the fix)

---

## Vulnerability 02: Redundant and Misleading ARIA in the Generated DataGrid
- **AI Prompt:** '<paste your Step 5 prompt for the DataGrid component>'
- **AI Generated Code:**
  ```tsx
  <td role="gridcell" data-row={rowIndex} data-col={colIndex} ...>
  <p id={statusId} role="status" aria-live="polite" className="data-grid__status">
  <p role="status" className="page__picked">
  <table role="grid" aria-labelledby={captionId} ...>
  ```
- **Risk:** `role="gridcell"` on a `td` inside a `role="grid"` table repeats the implicit role. `role="status"` on a `<p>` should use the native `<output>` element, which carries the same role without extra attributes. The project rules ban div-soup, so native elements are preferred over ARIA patches.
- **Detection Method:** `npm run lint` (oxlint with the jsx-a11y plugin) reports 4 warnings: `jsx-a11y(no-redundant-roles)` on the `td`, `jsx-a11y(prefer-tag-over-role)` twice, and `jsx-a11y(no-noninteractive-element-to-interactive-role)` on `role="grid"`.
- **Engineering Refactor:** Removed the redundant `role="gridcell"`; replaced both status paragraphs with `<output>`. Kept `role="grid"` on purpose, because arrow-key navigation and `aria-selected` on rows need the grid pattern, and documented the exception with a comment:
  ```tsx
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- native table needs role="grid" for arrow-key navigation and aria-selected rows
  role="grid"
  ```
  After the fix, `<output>` is inline by default, so `display: block` was added to both status rules in the CSS.
- **Evidence:** (add the `npm run lint` output before and after the fix)

---

## Vulnerability 03: AI Coding Agent Committed an Empty File
- **AI Prompt:** '<paste the prompt you gave the VS Code Copilot agent about committing the tests>'
- **AI Generated Code:**
  ```text
  47deaf7 test(grid): cover sort, filter and paginate rules       (LAB 2 HW/src/grid/gridLogic.test.ts | 0)
  4b3aac9 Revert "test(grid): cover sort, filter and paginate rules"
  686ef9e test(grid): cover sort, filter and paginate rules       (hw1-data-grid/src/grid/gridLogic.test.ts | 98 +)
  ```
- **Risk:** The agent staged and committed a zero-byte test file from a stray outer `src` folder instead of the real 98-line test in `hw1-data-grid`. The history claims tests exist, but the committed file is empty, which would also have passed an unwary review.
- **Detection Method:** `git show --stat 47deaf7` shows `gridLogic.test.ts | 0`. The agent itself asked which folder to use after noticing the outer file was empty.
- **Engineering Refactor:** Reverted the empty commit, re-committed the real test from `hw1-data-grid/src/grid/`, and cleaned the stray outer `src` folder. Lesson recorded: review `git show --stat` after every AI-made commit, and keep one repository root.
- **Evidence:** (add `git log --oneline` and `git show --stat 47deaf7`)

---

## Vulnerability 04: Wrong Working Directory Created a Nested Repository and a Polluted Commit
- **AI Prompt:** '<paste the prompt that asked for the commit commands and the folder setup>'
- **AI Generated Code:** The commit steps ran `git add -A "../src"` and `git add src` assuming the outer `LAB 2 HW\src` had already been removed. It had not been.
  ```text
  [LAB2_HW 44c76a4] refactor(hw1): move app and contract sources into hw1-data-grid
   create mode 100644 LAB-2/LAB 2 HW/src/data/sampleData.ts
   create mode 100644 LAB-2/LAB 2 HW/src/grid/DataGrid.tsx
   ... (6 stray files)
  ```
- **Risk:** Stray files from an old attempt were committed under the wrong path, and a second `.git` inside `LAB 2 HW` (branch `master`, no commits) made `git status` and the GitHub branch disagree.
- **Detection Method:** `git rev-parse --show-toplevel` printed `D:/study/web/th/LAB-2/LAB 2 HW` instead of `D:/study/web/th`; `git show --stat HEAD` listed the stray files.
- **Engineering Refactor:** Renamed the nested `.git` out of the tree, ran `git reset --soft HEAD~1`, removed the stray `src`, then recommitted only the `hw1-data-grid` files. The bad commit was local, so no pushed history was rewritten.
- **Evidence:** (add the `git rev-parse` output and the `git log --oneline` after cleanup)

---

## Checked, No Defect Found
- **Raw `innerHTML` / XSS:** Not present. Cell values render as JSX text (`{String(row[column.accessorKey] ?? '')}`).
- **Index keys:** Rows use `key={getRowId(row)}`, a stable id, so selection survives sorting and filtering.
- **Per-element listeners:** Keyboard handling is one `onKeyDown` on the table, not one handler per cell.
