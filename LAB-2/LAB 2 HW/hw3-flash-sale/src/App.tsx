import { Profiler, useCallback, useState } from 'react'
import './App.css'
import { describeError } from './api/apiError'
import { createMockApi } from './api/mockApi'
import { logRender } from './profiler'
import { useLoader } from './state/useLoader'
import { formatCountdown } from './timer/countdown'
import { useCountdown } from './timer/useCountdown'

const SALE_LENGTH_MS = 5 * 60_000
const HOLD_MS = 15_000

const api = createMockApi({ totalStock: 3, holdMs: HOLD_MS, latencyMs: () => 600 })
const loadStock = (signal: AbortSignal) => api.getStock(signal)

/** Owns the once-per-second updates, so only this small piece re-renders while the sale runs. */
function SaleTimer({ endsAt, onEnd }: { endsAt: number; onEnd: () => void }) {
  const remainingMs = useCountdown(endsAt, onEnd)
  return (
    <p>
      Sale ends in <time>{formatCountdown(remainingMs)}</time>
    </p>
  )
}

export default function App() {
  const [endsAt, setEndsAt] = useState(() => Date.now() + SALE_LENGTH_MS)
  const [saleOver, setSaleOver] = useState(false)
  const { view, run } = useLoader(loadStock)
  const [reserveMessage, setReserveMessage] = useState('')
  const [reserving, setReserving] = useState(false)
  const handleSaleEnd = useCallback(() => setSaleOver(true), [])

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

  function handleRestart() {
    setSaleOver(false)
    setEndsAt(Date.now() + SALE_LENGTH_MS)
  }

  return (
    <main aria-busy={view.status === 'loading'}>
      <h1>HW3: Flash Sale</h1>
      <Profiler id="timer" onRender={logRender}>
        <SaleTimer endsAt={endsAt} onEnd={handleSaleEnd} />
      </Profiler>

      <Profiler id="stock" onRender={logRender}>
        <section aria-label="Stock">
          {view.status === 'loading' && <p className="skeleton" aria-hidden="true" />}
          {view.status === 'success' && <p>{view.data > 0 ? `${view.data} left in stock` : 'Sold out'}</p>}
          {view.status === 'error' && (
            <p role="alert" className="error">
              {view.message}
            </p>
          )}
        </section>
      </Profiler>

      <div>
        <button
          type="button"
          onClick={handleReserve}
          disabled={reserving || saleOver || view.status !== 'success' || view.data === 0}
        >
          Reserve 1
        </button>
        <button type="button" onClick={run}>
          {view.status === 'error' ? 'Retry' : 'Refresh'}
        </button>
        <button type="button" onClick={() => api.failNext(1)}>
          Fail next request
        </button>
        <button type="button" onClick={handleRestart}>
          Restart sale
        </button>
      </div>
      <output>{reserveMessage}</output>
    </main>
  )
}
