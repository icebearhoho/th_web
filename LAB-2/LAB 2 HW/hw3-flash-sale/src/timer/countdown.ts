/** Milliseconds left until `endsAt`. Never negative. Always computed from the real clock, so it cannot drift. */
export function getRemainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now)
}

/** "HH:MM:SS". Rounds UP, so the display shows 00:00:01 until the sale really ends. */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

interface CountdownDeps {
  readonly now: () => number
  readonly raf: (callback: FrameRequestCallback) => number
  readonly caf: (handle: number) => void
}

export interface Countdown {
  start(): void
  stop(): void
}

/**
 * Calls onTick(remainingMs) each animation frame, but only when the displayed second changes.
 * Each tick is recalculated from `endsAt - now()`, never by adding up frame times,
 * so a throttled or hidden tab shows the right time as soon as it wakes up.
 */
export function createCountdown(
  endsAt: number,
  onTick: (remainingMs: number) => void,
  onEnd: () => void,
  deps: CountdownDeps = {
    now: () => Date.now(),
    raf: (callback) => requestAnimationFrame(callback),
    caf: (handle) => cancelAnimationFrame(handle),
  },
): Countdown {
  let handle: number | null = null
  let lastShownSecond = -1

  function frame(): void {
    const remaining = getRemainingMs(endsAt, deps.now())
    const shownSecond = Math.ceil(remaining / 1000)
    if (shownSecond !== lastShownSecond) {
      lastShownSecond = shownSecond
      onTick(remaining)
    }
    if (remaining === 0) {
      handle = null
      onEnd()
      return
    }
    handle = deps.raf(frame)
  }

  return {
    start() {
      if (handle !== null) return
      lastShownSecond = -1
      frame()
    },
    stop() {
      if (handle === null) return
      deps.caf(handle)
      handle = null
    },
  }
}