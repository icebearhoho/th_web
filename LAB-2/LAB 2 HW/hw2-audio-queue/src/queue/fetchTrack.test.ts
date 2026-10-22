import { describe, expect, it } from 'vitest'
import { fetchTrack } from './fetchTrack'
import { TaskError } from './errors'

async function errorOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  return undefined
}

/** A fetch that never answers on its own, but rejects like the real one when aborted. */
const hangingFetch: typeof fetch = (_input, init) =>
  new Promise<Response>((_resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'))
    if (init?.signal?.aborted) return abort() // the real fetch rejects at once for an aborted signal
    init?.signal?.addEventListener('abort', abort)
  })

describe('fetchTrack', () => {
  it('returns the response bytes', async () => {
    const fakeFetch: typeof fetch = async () => new Response(new Uint8Array([1, 2, 3]))
    const data = await fetchTrack('a.mp3', new AbortController().signal, fakeFetch)
    expect(Array.from(new Uint8Array(data))).toEqual([1, 2, 3])
  })

  it('passes the abort signal to fetch', async () => {
    const controller = new AbortController()
    let received: AbortSignal | null | undefined
    const fakeFetch: typeof fetch = async (_input, init) => {
      received = init?.signal
      return new Response(new Uint8Array([1]))
    }
    await fetchTrack('a.mp3', controller.signal, fakeFetch)
    expect(received).toBe(controller.signal)
  })

  it('maps a 404 to a TaskError of kind "http"', async () => {
    const fakeFetch: typeof fetch = async () => new Response('missing', { status: 404 })
    const error = await errorOf(fetchTrack('a.mp3', new AbortController().signal, fakeFetch))
    expect(error instanceof TaskError).toBe(true)
    expect((error as TaskError).kind).toBe('http')
  })

  it('maps a failed connection to a TaskError of kind "network"', async () => {
    const fakeFetch: typeof fetch = async () => {
      throw new TypeError('Failed to fetch')
    }
    const error = await errorOf(fetchTrack('a.mp3', new AbortController().signal, fakeFetch))
    expect((error as TaskError).kind).toBe('network')
  })

  it('maps a broken body to a TaskError of kind "network"', async () => {
    const brokenResponse = {
      ok: true,
      status: 200,
      arrayBuffer: async () => {
        throw new TypeError('terminated')
      },
    } as unknown as Response
    const error = await errorOf(fetchTrack('a.mp3', new AbortController().signal, async () => brokenResponse))
    expect((error as TaskError).kind).toBe('network')
  })

  it('throws an AbortError when cancelled while the request is in flight', async () => {
    const controller = new AbortController()
    const pending = errorOf(fetchTrack('a.mp3', controller.signal, hangingFetch))
    controller.abort()
    const error = await pending
    expect((error as DOMException).name).toBe('AbortError')
  })

  it('throws an AbortError when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    const error = await errorOf(fetchTrack('a.mp3', controller.signal, hangingFetch))
    expect((error as DOMException).name).toBe('AbortError')
  })
})