# AI_FAILURE_AUDIT.md — HW1: Accessible Data-Grid

Fill in only bugs you actually hit and verified. Each entry needs real proof (screenshot, DevTools output, git diff).

## Entry template (copy per finding)

## Vulnerability NN: <short title>
- AI Prompt: '<exact prompt you gave>'
- AI Generated Code: <the faulty snippet>
- Risk: <what breaks and for whom>
- Detection Method: <DevTools panel, Lighthouse, unit test, git diff, screen reader>
- Engineering Refactor: <your manual fix>
- Evidence: <file or screenshot path>

## Failure modes to watch for in this homework
- Raw `innerHTML` for cell content (stored XSS).
- `key={index}` on rows, which corrupts selection state after sorting or filtering.
- Redundant or wrong ARIA (`role="grid"` plus invalid child roles, `aria-label` on non-interactive elements).
- Event listeners bound inside render instead of delegated.
- Sort buttons that are `<div onClick>` and not keyboard reachable.

## Findings
(none logged yet)
