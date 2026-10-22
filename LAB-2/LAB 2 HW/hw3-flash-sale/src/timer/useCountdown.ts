import { useEffect, useState } from 'react'
import { createCountdown, getRemainingMs } from './countdown'

/** Remaining milliseconds until `endsAt`, updated about once per displayed second. */
export function useCountdown(endsAt: number): number {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(endsAt, Date.now()))

  useEffect(() => {
    const countdown = createCountdown(endsAt, setRemainingMs, () => {})
    countdown.start()
    return () => countdown.stop()
  }, [endsAt])

  return remainingMs
}