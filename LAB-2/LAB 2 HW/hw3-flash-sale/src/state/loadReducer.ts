import type { LoadState } from '../sale/types'

export type LoadView<T> =
  | { readonly status: Extract<LoadState, 'idle'>; readonly requestId: number }
  | { readonly status: Extract<LoadState, 'loading'>; readonly requestId: number }
  | { readonly status: Extract<LoadState, 'success'>; readonly requestId: number; readonly data: T }
  | { readonly status: Extract<LoadState, 'error'>; readonly requestId: number; readonly message: string }

export type LoadAction<T> =
  | { type: 'start'; requestId: number }
  | { type: 'resolve'; requestId: number; data: T }
  | { type: 'reject'; requestId: number; message: string }

export function initialLoadView<T>(): LoadView<T> {
  return { status: 'idle', requestId: 0 }
}

/**
 * The four screen states. Only the newest request may change the screen:
 * a late answer from an older request (stale response) is ignored.
 */
export function loadReducer<T>(view: LoadView<T>, action: LoadAction<T>): LoadView<T> {
  switch (action.type) {
    case 'start':
      return { status: 'loading', requestId: action.requestId }
    case 'resolve':
      if (action.requestId !== view.requestId) return view
      return { status: 'success', requestId: action.requestId, data: action.data }
    case 'reject':
      if (action.requestId !== view.requestId) return view
      return { status: 'error', requestId: action.requestId, message: action.message }
  }
}
