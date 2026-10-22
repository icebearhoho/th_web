import { TaskError, createAbortError } from './errors'

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Download one track as raw bytes.
 * - Cancelling the signal aborts the request and throws an AbortError.
 * - A non-2xx answer throws TaskError('http'); a failed connection or body read throws TaskError('network').
 */
export async function fetchTrack(
  url: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch = fetch,
): Promise<ArrayBuffer> {
  let response: Response
  try {
    response = await fetchImpl(url, { signal })
  } catch (error) {
    if (signal.aborted || isAbortError(error)) throw createAbortError()
    throw new TaskError('network', `Could not reach ${url}`)
  }

  if (!response.ok) {
    throw new TaskError('http', `HTTP ${response.status} for ${url}`)
  }

  try {
    return await response.arrayBuffer()
  } catch (error) {
    if (signal.aborted || isAbortError(error)) throw createAbortError()
    throw new TaskError('network', `Download of ${url} was interrupted`)
  }
}