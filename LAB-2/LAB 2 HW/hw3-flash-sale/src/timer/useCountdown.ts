import { useEffect, useRef, useState } from 'react'
import { createCountdown, getRemainingMs } from './countdown'

/** Remaining milliseconds until `endsAt`, updated about once per displayed second. `onEnd` runs once at zero. */
export function useCountdown(endsAt: number, onEnd?: () => void): number {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(endsAt, Date.now()))
  const onEndRef = useRef(onEnd)
  useEffect(() => {
    onEndRef.current = onEnd
  })

  useEffect(() => {
    const countdown = createCountdown(endsAt, setRemainingMs, () => onEndRef.current?.())
    countdown.start()
    return () => countdown.stop()
  }, [endsAt])

  return remainingMs
}
