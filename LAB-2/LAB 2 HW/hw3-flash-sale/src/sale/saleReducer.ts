import type { Reservation, SaleAction, SaleState } from './types'

export function createSaleState(totalStock: number): SaleState {
  return { totalStock, reservations: [] }
}

/** Stock that is neither held by an active reservation nor already sold. */
export function getAvailableStock(state: SaleState): number {
  const taken = state.reservations
    .filter((reservation) => reservation.status !== 'expired')
    .reduce((sum, reservation) => sum + reservation.quantity, 0)
  return state.totalStock - taken
}

export function isSoldOut(state: SaleState): boolean {
  return getAvailableStock(state) <= 0
}

/** Can this reservation be made right now? Used by the API layer to answer "sold out". */
export function canReserve(state: SaleState, quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= getAvailableStock(state)
}

/**
 * Pure state machine:
 *   reserve  -> status "reserved"      (only if enough stock and the id is new)
 *   expire   -> "reserved" becomes "expired" once now >= expiresAt, which frees the stock
 *   checkout -> "reserved" becomes "checked-out" (only before it expires)
 * Anything that is not allowed returns the same state object unchanged.
 */
export function saleReducer(state: SaleState, action: SaleAction): SaleState {
  switch (action.type) {
    case 'reserve': {
      if (state.reservations.some((reservation) => reservation.id === action.id)) return state
      if (!canReserve(state, action.quantity)) return state
      const reservation: Reservation = {
        id: action.id,
        buyerId: action.buyerId,
        quantity: action.quantity,
        expiresAt: action.now + action.holdMs,
        status: 'reserved',
      }
      return { ...state, reservations: [...state.reservations, reservation] }
    }

    case 'expire': {
      let changed = false
      const reservations = state.reservations.map((reservation) => {
        if (reservation.status === 'reserved' && action.now >= reservation.expiresAt) {
          changed = true
          return { ...reservation, status: 'expired' as const }
        }
        return reservation
      })
      return changed ? { ...state, reservations } : state
    }

    case 'checkout': {
      const target = state.reservations.find((reservation) => reservation.id === action.id)
      if (!target || target.status !== 'reserved' || action.now >= target.expiresAt) return state
      return {
        ...state,
        reservations: state.reservations.map((reservation) =>
          reservation.id === action.id ? { ...reservation, status: 'checked-out' as const } : reservation,
        ),
      }
    }
  }
}
