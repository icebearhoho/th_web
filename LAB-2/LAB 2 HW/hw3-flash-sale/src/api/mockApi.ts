import { createSaleState, getAvailableStock, saleReducer } from '../sale/saleReducer'
import type { Reservation } from '../sale/types'
import { ApiError, createAbortError } from './apiError'

export interface MockApiOptions {
  readonly totalStock: number
  readonly holdMs: number
  /** Latency for the n-th call (1-based). Lets a test or demo make one call slower than another. */
  readonly latencyMs?: (callNumber: number) => number
  readonly now?: () => number
  /** Replaceable so tests do not need real timers. Must reject with an AbortError when the signal aborts. */
  readonly wait?: (ms: number, signal?: AbortSignal) => Promise<void>
}

export interface MockApi {
  getStock(signal?: AbortSignal): Promise<number>
  reserve(buyerId: string, quantity: number, signal?: AbortSignal): Promise<Reservation>
  /** The next `count` calls fail with a network error. */
  failNext(count: number): void
}

function realWait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(createAbortError())
    const onAbort = () => {
      clearTimeout(timer)
      reject(createAbortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * A fake server. The request waits for its latency first and is handled when it "arrives",
 * so when two buyers race for the last item, whoever arrives first wins.
 */
export function createMockApi(options: MockApiOptions): MockApi {
  const now = options.now ?? (() => Date.now())
  const wait = options.wait ?? realWait
  const latencyFor = options.latencyMs ?? (() => 300)

  let state = createSaleState(options.totalStock)
  let calls = 0
  let failures = 0
  let nextReservation = 1

  async function arrive(signal?: AbortSignal): Promise<void> {
    calls += 1
    await wait(latencyFor(calls), signal)
    if (failures > 0) {
      failures -= 1
      throw new ApiError('network', 'Simulated network failure')
    }
    state = saleReducer(state, { type: 'expire', now: now() })
  }

  return {
    async getStock(signal) {
      await arrive(signal)
      return getAvailableStock(state)
    },

    async reserve(buyerId, quantity, signal) {
      await arrive(signal)
      const id = `reservation-${nextReservation}`
      const next = saleReducer(state, {
        type: 'reserve',
        id,
        buyerId,
        quantity,
        now: now(),
        holdMs: options.holdMs,
      })
      if (next === state) throw new ApiError('sold-out', 'Not enough stock')
      nextReservation += 1
      state = next
      const reservation = state.reservations.find((item) => item.id === id)
      if (!reservation) throw new ApiError('unknown', 'Reservation missing')
      return reservation
    },

    failNext(count) {
      failures = Math.max(0, count)
    },
  }
}
