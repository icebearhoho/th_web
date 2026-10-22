# AI_FAILURE_AUDIT.md — HW3: Flash Sale Engine

Only problems that were reproduced and measured are listed here.

## Vulnerability 01: Checkout allowed after the hold had ended
- AI Prompt: 'Define the sale types and the inventory actions: reserve, expire and checkout.'
- AI Generated Code: `{ type: 'checkout'; id: string }`. The action had no timestamp, so the reducer could not tell if the hold was already over. It only trusted `status === 'reserved'`.
- Risk: a buyer could pay for an item after the 15-second hold ended, as long as the `expire` action had not run yet. That item may already have been offered to someone else, so it could be sold twice.
- Detection Method: unit test "is refused after the hold has ended, even if expire has not run yet". With the time check removed from the reducer the test fails; with it restored all 15 reducer tests pass.
- Engineering Refactor: `checkout` now carries `now`, and the reducer refuses it when `now >= expiresAt`.
- Evidence: `src/sale/saleReducer.test.ts`, `src/sale/types.ts`.

## Vulnerability 02: The countdown re-rendered the whole page every second
- AI Prompt: 'Show the live countdown in the app using the useCountdown hook.'
- AI Generated Code: `const remainingMs = useCountdown(endsAt)` called inside `App`, which also owns the stock view, buttons and messages.
- Risk: every tick re-rendered everything, including the stock section whose data had not changed. This is wasted work that grows as the page grows.
- Detection Method: React `<Profiler>` around the stock section (`src/profiler.ts`). Result: 6 stock renders during 5 seconds of idle countdown.
- Engineering Refactor: the countdown moved into a small `SaleTimer` component. `App` only learns when the sale ends, through an `onEnd` callback. Result after the fix: 0 stock renders in the same 5 seconds, and the timer alone renders 6 times.
- Evidence: Profiler console output `[profiler] stock render #n` before and after; `src/App.tsx`.

## Vulnerability 03: useLoader restarted its request forever when given an inline function
- AI Prompt: 'Write a useLoader hook that runs a load function on mount and on demand, cancelling the previous request.'
- AI Generated Code: `const run = useCallback(() => { ... load(signal) ... }, [load])` and `useEffect(() => { run() ... }, [run])`.
- Risk: `run` changed whenever `load` changed, so passing a normal inline arrow function made the effect fire after every render. The app avoided it only because `loadStock` happened to be defined outside the component.
- Detection Method: a throwaway page with `useLoader((signal) => fetchSomething(signal))` written inline, counting calls in Chromium. Result: 27,397 load calls in 1.5 seconds.
- Engineering Refactor: the newest `load` is kept in a ref, so `run` keeps one identity (`useCallback(..., [])`). Same page afterwards: 1 call.
- Evidence: `src/state/useLoader.ts` and the call counts above.

## Failure modes checked and not found
- Stale response overwriting newer data: `loadReducer.test.ts` (3 stale cases) and a rapid triple Refresh in the browser ends in one clean success.
- Timer drift: every tick is `endsAt - Date.now()`; test "does not drift after a long pause".
- Two buyers for the last item: `mockApi.test.ts` race test, first to arrive wins.
