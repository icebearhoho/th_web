/**
 * Milliseconds until targetEpochMs on the SERVER clock. Never negative.
 * Always computed from Date.now(), never by subtracting 1 per tick, so it can't drift.
 */
export function getRemainingMs(targetEpochMs, serverOffsetMs = 0, now = Date.now()) {
  return Math.max(0, targetEpochMs - (now + serverOffsetMs));
}

/** "HH:MM:SS". Rounds UP, so it shows 00:00:01 until the drop really lands. */
export function formatCountdown(remainingMs) {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}