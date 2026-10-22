import { useState } from 'react'
import { formatCountdown } from './timer/countdown'
import { useCountdown } from './timer/useCountdown'

const SALE_LENGTH_MS = 30_000

export default function App() {
  const [endsAt, setEndsAt] = useState(() => Date.now() + SALE_LENGTH_MS)
  const remainingMs = useCountdown(endsAt)

  return (
    <main>
      <h1>HW3: Flash Sale</h1>
      <p>
        Sale ends in <time>{formatCountdown(remainingMs)}</time>
      </p>
      <output>{remainingMs === 0 ? 'Sale ended' : 'Sale is live'}</output>
      <button type="button" onClick={() => setEndsAt(Date.now() + SALE_LENGTH_MS)}>
        Restart 30s sale
      </button>
    </main>
  )
}