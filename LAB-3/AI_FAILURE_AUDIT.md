# AI FAILURE AUDIT — LAB 3

**Student:** Ngo Quang Nhiem — 24521269
**Stack:** React 19 + Vite (plain JSX)
**Method:** Each feature was prompted atomically (one small prompt per sub-task, with
`project-rules.md` supplied as context). Every AI output was reviewed before use.
Each bug below was pasted into the project temporarily, reproduced in Chrome DevTools,
then reverted with `git checkout -- <file>`. Buggy code was never committed.

| # | Exercise | Failure mode | Detected with | Fix commit |
|---|----------|--------------|---------------|------------|
| 01 | Ex2 — ScientistDirectory | Redundant `useEffect` for derived state | React Profiler | `bb294a3` |
| 02 | Ex2 — ScientistDirectory | In-place state mutation (`splice`) | Visual check + React Components tab | `2b4ab30` |
| 03 | Ex3 — PubgMatchTelemetry | Missing `AbortController` → stale response race | Rapid squad switching | `aa39626` |

---

## Failure #01: Redundant useEffect for derived filter state

- **Prompt**: "Add a search filter to this React list of scientists."
- **AI Code**:
  ```jsx
  const [filtered, setFiltered] = useState(people);
  useEffect(() => {
    setFiltered(
      people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [people, query]);
  // render: filtered.map(...)
  ```
- **Bug**: Two sources of truth for the same data. On every keystroke React renders
  twice: render #1 commits with the *stale* `filtered` list, then the effect runs,
  calls `setFiltered`, and forces render #2. This is the render cascade from Lab 2,
  and it violates rule 5 of `project-rules.md` (never sync derived state in useEffect).
- **DevTools Proof**: React DevTools → Profiler → record → type **one** character →
  the commit counter shows **2 commits** for a single keystroke (Figure A1).
  After the fix, the same test shows **1 commit** (Figure A2).
- **Engineering Fix (commit `bb294a3`)**: Deleted the `filtered` state and the effect.
  The visible list is now computed during render:
  ```jsx
  const visiblePeople = people
    .filter((p) => p.name.toLowerCase().includes(normalizedQuery))
    .filter((p) => p.iq >= minIq)
    .toSorted(SORTERS[sortBy]);
  ```
  Only raw inputs (`people`, `query`, `minIq`, `sortBy`) live in state.

---

## Failure #02: In-place mutation breaks the Object.is() check

- **Prompt**: "Add a delete button for each scientist in the list."
- **AI Code**:
  ```jsx
  const handleDelete = (id) => {
    const index = people.findIndex((p) => p.id === id);
    people.splice(index, 1); // mutates the existing array
    setPeople(people);       // same reference passed back
  };
  ```
- **Bug**: `splice` mutates the array in place, so `setPeople` receives the **same
  reference**. React compares with `Object.is(prev, next)`, which is the exact guard
  I implemented in Lab 2 `reactive-engine.js`
  (`if (!Object.is(stateStore[cursor], resolvedValue)) triggerRender()`).
  The result is `true`, so **no re-render happens**. The person stays on screen,
  then vanishes later when an unrelated state change (typing in search) forces a
  render, which is an inconsistent UI. It also corrupts `initialData`, so **Reset stops
  working** because the original `SMART_PEOPLE` array has been mutated.
- **DevTools Proof**: Clicking "Delete Albert Einstein" leaves the row visible
  (Figure B1). React DevTools → Components → `ScientistDirectory` → the `people`
  hook already shows 6 items while the UI still lists 7 (Figure B2).
- **Engineering Fix (commit `2b4ab30`)**: Immutable updater that returns a new array:
  ```jsx
  const handleDelete = (id) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };
  ```
  `SMART_PEOPLE` is never mutated, so Reset can always restore it.

---

## Failure #03: Missing AbortController lets a stale response overwrite the UI

- **Prompt**: "Fetch the squad telemetry whenever squadId changes."
- **AI Code**:
  ```jsx
  useEffect(() => {
    setView({ status: 'LOADING', data: null, error: null });
    fetchKraftonPubgTelemetry(squadId)
      .then((data) => setView({ status: 'SUCCESS', data, error: null }))
      .catch((err) => setView({ status: 'ERROR', data: null, error: err.message }));
  }, [squadId]); // no cleanup function
  ```
- **Bug**: No cleanup, so every squad switch leaves the previous request running.
  The mock API has random latency (0.6–1.8 s), so a slow, **older** response can
  arrive **after** the newer one and overwrite it. The selected button says
  "Genius Esports" while the panel shows Cerberus Esports data. A late failure of an
  old request can also flash a false error banner. This violates rule 6 of
  `project-rules.md` (every fetch in useEffect must return a cleanup/abort).
- **DevTools Proof**: Clicking CES → TE → GE rapidly, several times, reproduces a
  mismatch: the GE button is `aria-pressed="true"` but the stats belong to another
  squad (Figure C1). With the fix, a temporary `console.log('aborted', squadId)` in
  the cleanup prints `aborted ces`, `aborted te` and the panel always matches the
  selected squad (Figure C2).
- **Engineering Fix (commit `aa39626`)**:
  ```jsx
  useEffect(() => {
    const controller = new AbortController();
    setView({ status: 'LOADING', data: null, error: null });
    fetchKraftonPubgTelemetry(squadId, { signal: controller.signal })
      .then((data) => setView({ status: 'SUCCESS', data, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return; // intentional cancel, not an error
        setView({ status: 'ERROR', data: null, error: err.message });
      });
    return () => controller.abort();
  }, [squadId, retryTick]);
  ```
  This improves on Lab 2 HW3's `requestId` guard: instead of ignoring a stale
  response when it arrives, the stale request is cancelled as soon as it becomes stale.

---

## Lessons

1. AI defaults to **more state + more effects**. Derived data should be computed, not stored.
2. AI writes **mutating** array code (`push`, `splice`, `sort`). React's `Object.is`
   check, the same one I built in Lab 2, silently ignores it.
3. AI rarely writes **effect cleanup**. Every timer, listener and fetch needs one.
4. Each failure was caught by a concrete check (Profiler commit count, Components
   hook state, rapid-switch test), not by reading the code alone.
