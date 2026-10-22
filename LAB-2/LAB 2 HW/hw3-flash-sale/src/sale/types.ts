/** The four screen states for anything that loads data. */
export type LoadState = 'idle' | 'loading' | 'success' | 'error'

/** One inventory lock: a buyer holds stock for a limited time before it returns to the pool. */
export type ReservationStatus = 'reserved' | 'expired' | 'checked-out'

export interface Reservation {
  readonly id: string
  readonly buyerId: string
  readonly quantity: number
  /** Timestamp in ms (Date.now) after which the hold ends. */
  readonly expiresAt: number
  readonly status: ReservationStatus
}

export interface SaleState {
  readonly totalStock: number
  readonly reservations: readonly Reservation[]
}

export type SaleAction =
  | { type: 'reserve'; id: string; buyerId: string; quantity: number; now: number; holdMs: number }
  | { type: 'expire'; now: number }
  | { type: 'checkout'; id: string }

export type ApiErrorKind = 'network' | 'sold-out' | 'unknown'