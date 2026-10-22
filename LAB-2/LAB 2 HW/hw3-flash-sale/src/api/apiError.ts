import type { ApiErrorKind } from '../sale/types'

export class ApiError extends Error {
  readonly kind: ApiErrorKind

  constructor(kind: ApiErrorKind, message: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
  }
}

export function createAbortError(): DOMException {
  return new DOMException('The request was cancelled', 'AbortError')
}

/** Text that is safe to show to a buyer. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'sold-out') return 'Sold out. Someone else got the last item.'
    if (error.kind === 'network') return 'Network problem. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
