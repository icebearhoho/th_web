import { describe, expect, it } from 'vitest'
import { initialLoadView, loadReducer } from './loadReducer'
import type { LoadView } from './loadReducer'

const start = (view: LoadView<number>, requestId: number) => loadReducer(view, { type: 'start', requestId })

describe('loadReducer', () => {
  it('starts idle', () => {
    expect(initialLoadView<number>().status).toBe('idle')
  })

  it('idle -> loading -> success', () => {
    const loading = start(initialLoadView<number>(), 1)
    expect(loading.status).toBe('loading')
    const done = loadReducer(loading, { type: 'resolve', requestId: 1, data: 7 })
    expect(done).toEqual({ status: 'success', requestId: 1, data: 7 })
  })

  it('loading -> error with a message', () => {
    const loading = start(initialLoadView<number>(), 1)
    const failed = loadReducer(loading, { type: 'reject', requestId: 1, message: 'boom' })
    expect(failed).toEqual({ status: 'error', requestId: 1, message: 'boom' })
  })

  it('retry: error -> loading -> success', () => {
    let view = start(initialLoadView<number>(), 1)
    view = loadReducer(view, { type: 'reject', requestId: 1, message: 'boom' })
    view = start(view, 2)
    expect(view.status).toBe('loading')
    view = loadReducer(view, { type: 'resolve', requestId: 2, data: 3 })
    expect(view.status).toBe('success')
  })

  it('ignores a stale success that arrives after a newer request started', () => {
    let view = start(initialLoadView<number>(), 1)
    view = start(view, 2)
    const afterStale = loadReducer(view, { type: 'resolve', requestId: 1, data: 999 })
    expect(afterStale).toBe(view)
  })

  it('ignores a stale success that arrives after the newer one finished', () => {
    let view = start(initialLoadView<number>(), 1)
    view = start(view, 2)
    view = loadReducer(view, { type: 'resolve', requestId: 2, data: 5 })
    const afterStale = loadReducer(view, { type: 'resolve', requestId: 1, data: 999 })
    expect(afterStale).toBe(view)
  })

  it('ignores a stale error so it cannot replace fresh data', () => {
    let view = start(initialLoadView<number>(), 1)
    view = start(view, 2)
    view = loadReducer(view, { type: 'resolve', requestId: 2, data: 5 })
    const afterStale = loadReducer(view, { type: 'reject', requestId: 1, message: 'late failure' })
    expect(afterStale).toBe(view)
  })
})
