import { useState } from 'react'
import './App.css'
import { describeError } from './api/apiError'
import { createMockApi } from './api/mockApi'
import { useLoader } from './state/useLoader'
import { formatCountdown } from './timer/countdown'
import { useCountdown } from './timer/useCountdown'

const SALE_LENGTH_MS = 5 * 60_000
const HOLD_MS = 15_000

const api = createMockApi({ totalStock: 3, holdMs: HOLD_MS, latencyMs: () => 600 })
const loadStock = (signal: AbortSignal) => api.getStock(signal)

export default function App() {
  const [endsAt, setEndsAt] = useState(() => Date.now() + SALE_LENGTH_MS)
  const remainingMs = useCountdown(endsAt)
  const { view, run } = useLoader(loadStock)
  const [reserveMessage, setReserveMessage] = useState('')
  const [reserving, setReserving] = useState(false)

  async function handleReserve() {
    setReserving(true)
    setReserveMessage('Reserving...')
    try {
      const reservation = await api.reserve('demo-buyer', 1)
      setReserveMessage(`Reserved (${reservation.id}). Held for ${HOLD_MS / 1000} seconds.`)
      run()
    } catch (error) {
      setReserveMessage(describeError(error))
    } finally {
      setReserving(false)
    }
  }

  const saleOver = remainingMs === 0

  return (
    <main aria-busy={view.status === 'loading'}>
      <h1>HW3: Flash Sale</h1>
      <p>
        Sale ends in <time>{formatCountdown(remainingMs)}</time>
      </p>

      <section aria-label="Stock">
        {view.status === 'loading' && <p className="skeleton" aria-hidden="true" />}
        {view.status === 'success' && (
          <p>{view.data > 0 ? `${view.data} left in stock` : 'Sold out'}</p>
        )}
        {view.status === 'error' && (
          <p role="alert" className="error">
            {view.message}
          </p>
        )}
      </section>

      <div>
        <button type="button" onClick={handleReserve} disabled={reserving || saleOver || view.status !== 'success' || view.data === 0}>
          Reserve 1
        </button>
        <button type="button" onClick={run}>
          {view.status === 'error' ? 'Retry' : 'Refresh'}
        </button>
        <button type="button" onClick={() => api.failNext(1)}>
          Fail next request
        </button>
        <button type="button" onClick={() => setEndsAt(Date.now() + SALE_LENGTH_MS)}>
          Restart sale
        </button>
      </div>
      <output>{reserveMessage}</output>
    </main>
  )
}
