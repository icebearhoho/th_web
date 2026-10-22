import { describe, expect, it } from 'vitest'
import { TaskError } from './errors'
import { createTrackWorker } from './trackWorker'
import type { AudioTask } from './types'

const fakeBuffer = { duration: 1 } as unknown as AudioBuffer

function makeTask(url = 'a.mp3'): AudioTask {
  return { id: 'task-1', trackUrl: url, controller: new AbortController() }
}

const okFetch: typeof fetch = async () => new Response(new Uint8Array([9, 8, 7]))

async function errorOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  return undefined
}

describe('createTrackWorker', () => {
  it('downloads the bytes and returns the decoded buffer', async () => {
    let received: number[] = []
    const worker = createTrackWorker({
      fetchImpl: okFetch,
      decodeImpl: async (data) => {
        received = Array.from(new Uint8Array(data))
        return fakeBuffer
      },
    })
    expect(await worker(makeTask())).toBe(fakeBuffer)
    expect(received).toEqual([9, 8, 7])
  })

  it('maps a decode failure to a TaskError of kind "decode"', async () => {
    const worker = createTrackWorker({
      fetchImpl: okFetch,
      decodeImpl: async () => {
        throw new Error('bad audio')
      },
    })
    const error = await errorOf(worker(makeTask()))
    expect(error instanceof TaskError).toBe(true)
    expect((error as TaskError).kind).toBe('decode')
  })

  it('lets download errors through unchanged', async () => {
    const worker = createTrackWorker({
      fetchImpl: async () => new Response('missing', { status: 404 }),
      decodeImpl: async () => fakeBuffer,
    })
    const error = await errorOf(worker(makeTask()))
    expect((error as TaskError).kind).toBe('http')
  })

  it('does not decode when the task was cancelled during the download', async () => {
    const task = makeTask()
    let decodeCalls = 0
    const worker = createTrackWorker({
      fetchImpl: async () => {
        task.controller.abort()
        return new Response(new Uint8Array([1]))
      },
      decodeImpl: async () => {
        decodeCalls++
        return fakeBuffer
      },
    })
    const error = await errorOf(worker(task))
    expect((error as DOMException).name).toBe('AbortError')
    expect(decodeCalls).toBe(0)
  })

  it('reports an AbortError, not a decode error, when cancelled during decoding', async () => {
    const task = makeTask()
    const worker = createTrackWorker({
      fetchImpl: okFetch,
      decodeImpl: async () => {
        task.controller.abort()
        throw new Error('decode interrupted')
      },
    })
    const error = await errorOf(worker(task))
    expect((error as DOMException).name).toBe('AbortError')
  })
})