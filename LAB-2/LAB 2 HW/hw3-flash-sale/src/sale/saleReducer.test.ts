import { describe, expect, it } from 'vitest'
import { canReserve, createSaleState, getAvailableStock, isSoldOut, saleReducer } from './saleReducer'
import type { SaleAction, SaleState } from './types'

const reserve = (id: string, quantity = 1, now = 1_000, holdMs = 5_000): SaleAction => ({
  type: 'reserve',
  id,
  buyerId: `buyer-${id}`,
  quantity,
  now,
  holdMs,
})

describe('reserve', () => {
  it('holds stock for the buyer', () => {
    const state = saleReducer(createSaleState(3), reserve('a', 2))
    expect(getAvailableStock(state)).toBe(1)
    expect(state.reservations[0]).toMatchObject({ id: 'a', status: 'reserved', expiresAt: 6_000 })
  })

  it('refuses a reservation larger than the remaining stock', () => {
    const start = createSaleState(1)
    expect(saleReducer(start, reserve('a', 2))).toBe(start)
  })

  it('ignores a repeated id (double click)', () => {
    const once = saleReducer(createSaleState(5), reserve('a'))
    expect(saleReducer(once, reserve('a'))).toBe(once)
  })

  it('refuses zero, negative and fractional quantities', () => {
    const start = createSaleState(5)
    expect(canReserve(start, 0)).toBe(false)
    expect(canReserve(start, -1)).toBe(false)
    expect(canReserve(start, 1.5)).toBe(false)
  })

  it('two buyers racing for the last item: only the first wins', () => {
    let state = createSaleState(1)
    state = saleReducer(state, reserve('a'))
    const afterSecond = saleReducer(state, reserve('b'))
    expect(afterSecond).toBe(state)
    expect(isSoldOut(afterSecond)).toBe(true)
  })
})

describe('expire', () => {
  it('returns stock to the pool when the hold ends', () => {
    let state = saleReducer(createSaleState(1), reserve('a'))
    expect(isSoldOut(state)).toBe(true)
    state = saleReducer(state, { type: 'expire', now: 6_000 })
    expect(state.reservations[0].status).toBe('expired')
    expect(isSoldOut(state)).toBe(false)
  })

  it('does not expire a hold before its time', () => {
    const state = saleReducer(createSaleState(1), reserve('a'))
    expect(saleReducer(state, { type: 'expire', now: 5_999 })).toBe(state)
  })

  it('never expires a checked-out order', () => {
    let state = saleReducer(createSaleState(1), reserve('a'))
    state = saleReducer(state, { type: 'checkout', id: 'a', now: 2_000 })
    expect(saleReducer(state, { type: 'expire', now: 99_000 })).toBe(state)
  })

  it('lets someone else buy the freed item', () => {
    let state = saleReducer(createSaleState(1), reserve('a'))
    state = saleReducer(state, { type: 'expire', now: 6_000 })
    state = saleReducer(state, reserve('b', 1, 6_000))
    expect(state.reservations.find((r) => r.id === 'b')?.status).toBe('reserved')
  })
})

describe('checkout', () => {
  it('turns a live reservation into a sale and keeps the stock taken', () => {
    let state = saleReducer(createSaleState(2), reserve('a'))
    state = saleReducer(state, { type: 'checkout', id: 'a', now: 2_000 })
    expect(state.reservations[0].status).toBe('checked-out')
    expect(getAvailableStock(state)).toBe(1)
  })

  it('is refused after the hold has ended, even if expire has not run yet', () => {
    const state = saleReducer(createSaleState(1), reserve('a'))
    expect(saleReducer(state, { type: 'checkout', id: 'a', now: 6_000 })).toBe(state)
  })

  it('is refused for an expired or unknown reservation', () => {
    let state: SaleState = saleReducer(createSaleState(1), reserve('a'))
    expect(saleReducer(state, { type: 'checkout', id: 'nope', now: 2_000 })).toBe(state)
    state = saleReducer(state, { type: 'expire', now: 6_000 })
    expect(saleReducer(state, { type: 'checkout', id: 'a', now: 6_001 })).toBe(state)
  })

  it('cannot be paid twice', () => {
    let state = saleReducer(createSaleState(1), reserve('a'))
    state = saleReducer(state, { type: 'checkout', id: 'a', now: 2_000 })
    expect(saleReducer(state, { type: 'checkout', id: 'a', now: 2_001 })).toBe(state)
  })
})

describe('invariants', () => {
  it('available stock never goes below zero or above total', () => {
    let state = createSaleState(3)
    for (let i = 0; i < 10; i++) state = saleReducer(state, reserve(`r${i}`, 1, 1_000 + i))
    expect(getAvailableStock(state)).toBe(0)
    state = saleReducer(state, { type: 'expire', now: 100_000 })
    expect(getAvailableStock(state)).toBe(3)
  })

  it('does not mutate the previous state', () => {
    const before = saleReducer(createSaleState(2), reserve('a'))
    const snapshot = JSON.stringify(before)
    saleReducer(before, reserve('b'))
    saleReducer(before, { type: 'expire', now: 99_000 })
    saleReducer(before, { type: 'checkout', id: 'a', now: 2_000 })
    expect(JSON.stringify(before)).toBe(snapshot)
  })
})
