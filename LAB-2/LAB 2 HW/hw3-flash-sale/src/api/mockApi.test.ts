import { describe, expect, it } from 'vitest'
import { ApiError } from './apiError'
import { createMockApi } from './mockApi'
import type { MockApiOptions } from './mockApi'

const instant = () => Promise.resolve()

function makeApi(totalStock: number, wait: NonNullable<MockApiOptions['wait']> = instant, time = { now: 1_000 }) {
  return createMockApi({ totalStock, holdMs: 5_000, wait, now: () => time.now })
}

describe('createMockApi', () => {
  it('reports the stock', async () => {
    expect(await makeApi(3).getStock()).toBe(3)
  })

  it('reserves and lowers the stock', async () => {
    const api = makeApi(3)
    const reservation = await api.reserve('buyer-1', 2)
    expect(reservation.status).toBe('reserved')
    expect(await api.getStock()).toBe(1)
  })

  it('answers sold-out when there is not enough stock', async () => {
    const api = makeApi(1)
    await api.reserve('buyer-1', 1)
    const error = await api.reserve('buyer-2', 1).catch((e: unknown) => e)
    expect(error instanceof ApiError && error.kind).toBe('sold-out')
  })

  it('fails with a network error on demand, then recovers', async () => {
    const api = makeApi(2)
    api.failNext(1)
    const error = await api.getStock().catch((e: unknown) => e)
    expect(error instanceof ApiError && error.kind).toBe('network')
    expect(await api.getStock()).toBe(2)
  })

  it('gives the stock back after the hold expires', async () => {
    const time = { now: 1_000 }
    const api = makeApi(1, instant, time)
    await api.reserve('buyer-1', 1)
    time.now = 6_000
    expect(await api.getStock()).toBe(1)
  })

  it('two buyers racing for the last item: the one that arrives first wins', async () => {
    const releases: Array<() => void> = []
    const wait = () => new Promise<void>((resolve) => void releases.push(resolve))
    const api = makeApi(1, wait)

    const slow = api.reserve('slow-buyer', 1)
    const fast = api.reserve('fast-buyer', 1)
    // The second call reaches the server first.
    releases[1]()
    const fastResult = await fast
    releases[0]()
    const slowError = await slow.catch((e: unknown) => e)

    expect(fastResult.buyerId).toBe('fast-buyer')
    expect(slowError instanceof ApiError && slowError.kind).toBe('sold-out')
  })

  it('a cancelled request rejects with an AbortError and changes nothing', async () => {
    const controller = new AbortController()
    const wait = (_ms: number, signal?: AbortSignal) =>
      new Promise<void>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('x', 'AbortError')))
      })
    const api = makeApi(1, wait)
    const pending = api.reserve('buyer-1', 1, controller.signal)
    controller.abort()
    const error = await pending.catch((e: unknown) => e)
    expect(error instanceof DOMException && error.name).toBe('AbortError')
  })
})
