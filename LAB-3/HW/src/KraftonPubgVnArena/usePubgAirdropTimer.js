import { useEffect, useState } from 'react';
import { getRemainingMs } from './countdown.js';

const TICK_MS = 250;
const shownSecond = (ms) => Math.ceil(ms / 1000);

/**
 * Evolved from Lab 2 HW3 createAntiDriftTimer / useCountdown.
 * - Recomputes target - (Date.now() + serverOffset) every tick: zero drift.
 * - Resyncs immediately when the tab becomes visible again.
 * - Only updates state when the DISPLAYED second changes (fewer renders).
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(targetEpochMs, serverOffsetMs)
  );

  useEffect(() => {
    let timerId = null;

    // Defined INSIDE the effect, so it always uses the current target/offset
    // (the slide's version used an outer calcRemaining -> stale closure)
    const sync = () => {
      const next = getRemainingMs(targetEpochMs, serverOffsetMs);
      setRemainingMs((prev) =>
        next === 0 || shownSecond(prev) !== shownSecond(next) ? next : prev
      );
      if (next === 0 && timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };

    sync();
    if (getRemainingMs(targetEpochMs, serverOffsetMs) > 0) {
      timerId = window.setInterval(sync, TICK_MS);
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timerId !== null) window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetEpochMs, serverOffsetMs]);

  return { remainingMs, isLive: remainingMs === 0 };
}