import { useCallback, useEffect, useReducer, useRef } from 'react'
import { describeError } from '../api/apiError'
import { initialLoadView, loadReducer } from './loadReducer'
import type { LoadView } from './loadReducer'

/** Runs `load` on mount and on demand. Each run cancels the previous one and has its own request id. */
export function useLoader<T>(load: (signal: AbortSignal) => Promise<T>): { view: LoadView<T>; run: () => void } {
  const [view, dispatch] = useReducer(loadReducer<T>, initialLoadView<T>())
  const lastRequestId = useRef(0)
  const controllerRef = useRef<AbortController | null>(null)

  // Always call the newest `load`, but keep `run` the same function between renders.
  // Otherwise an inline arrow function would change `run` on every render and restart the request forever.
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  const run = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    lastRequestId.current += 1
    const requestId = lastRequestId.current

    dispatch({ type: 'start', requestId })
    loadRef.current(controller.signal).then(
      (data) => dispatch({ type: 'resolve', requestId, data }),
      (error: unknown) => {
        if (controller.signal.aborted) return
        dispatch({ type: 'reject', requestId, message: describeError(error) })
      },
    )
  }, [])

  useEffect(() => {
    run()
    return () => controllerRef.current?.abort()
  }, [run])

  return { view, run }
}
