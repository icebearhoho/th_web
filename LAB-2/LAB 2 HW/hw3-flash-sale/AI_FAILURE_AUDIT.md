# AI_FAILURE_AUDIT.md — HW3: Flash-Sale E-Commerce Engine

Required by the spec: at least 3 AI flaws. Fill in only bugs you actually hit and verified. Each entry needs real proof (screenshot, DevTools output, git diff).

## Entry template (copy per finding)

## Vulnerability NN: <short title>
- AI Prompt: '<exact prompt you gave>'
- AI Generated Code: <the faulty snippet>
- Risk: <what breaks and for whom>
- Detection Method: <DevTools Profiler, unit test, git diff, manual test>
- Engineering Refactor: <your manual fix>
- Evidence: <file or screenshot path>

## Failure modes to watch for in this homework
- `setInterval` countdown that drifts or keeps running after unmount.
- Timer stored in `useState` and ticked at 60fps, re-rendering the whole page.
- Reservation logic that allows invalid transitions (e.g. checkout after EXPIRED) or double reservation of the last item.
- Missing handling of stale responses, so a slow request overwrites newer state.
- Raw `innerHTML` for product names or descriptions.
- `key={index}` or `key={Math.random()}` on product lists.
- Price formatting with string concatenation instead of `Intl.NumberFormat`.

## Findings
(none logged yet)
