import { describe, expect, it } from 'vitest'
import { AudioTaskQueue } from './AudioTaskQueue'
import type { TaskWorker } from './AudioTaskQueue'
import { TaskError } from './errors'
import type { AudioTask, QueueEvent } from './types'

interface Job {
  readonly task: AudioTask
  readonly finish: (buffer: AudioBuffer) => void
  readonly fail: (error: unknown) => void
}

/** A worker whose tasks stay open until the test finishes or fails them. */
function createControlledWorker() {
  const started: Job[] = []
  let running = 0
  let maxRunning = 0
  const worker: TaskWorker = (task) =>
    new Promise<AudioBuffer>((resolve, reject) => {
      running++
      maxRunning = Math.max(maxRunning, running)
      const job: Job = {
        task,
        finish: (buffer) => {
          running--
          resolve(buffer)
        },
        fail: (error) => {
          running--
          reject(error)
        },
      }
      task.controller.signal.addEventListener('abort', () => job.fail(new Error('worker aborted')))
      started.push(job)
    })
  return { worker, started, maxRunning: () => maxRunning }
}

const fakeBuffer = (label: string) => ({ label }) as unknown as AudioBuffer
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

async function errorOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  return undefined
}

describe('AudioTaskQueue', () => {
  it('rejects an invalid concurrency', () => {
    const { worker } = createControlledWorker()
    expect(() => new AudioTaskQueue({ concurrency: 0 }, worker)).toThrow()
    expect(() => new AudioTaskQueue({ concurrency: 1.5 }, worker)).toThrow()
  })

  it('starts tasks in arrival order and respects the concurrency limit', async () => {
    const { worker, started, maxRunning } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 2 }, worker)
    const first = queue.enqueue('a.mp3')
    queue.enqueue('b.mp3')
    queue.enqueue('c.mp3')
    queue.enqueue('d.mp3')
    expect(started.map((job) => job.task.trackUrl)).toEqual(['a.mp3', 'b.mp3'])

    started[0].finish(fakeBuffer('a'))
    await first.result
    await tick()
    expect(started.map((job) => job.task.trackUrl)).toEqual(['a.mp3', 'b.mp3', 'c.mp3'])

    started[1].finish(fakeBuffer('b'))
    await tick()
    expect(started.map((job) => job.task.trackUrl)).toEqual(['a.mp3', 'b.mp3', 'c.mp3', 'd.mp3'])
    expect(maxRunning()).toBe(2)
  })

  it('resolves each promise with its own buffer', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 2 }, worker)
    const a = queue.enqueue('a.mp3')
    const b = queue.enqueue('b.mp3')
    const bufferA = fakeBuffer('a')
    const bufferB = fakeBuffer('b')
    started[1].finish(bufferB)
    started[0].finish(bufferA)
    expect(await a.result).toBe(bufferA)
    expect(await b.result).toBe(bufferB)
  })

  it('cancelling a waiting task rejects it and never starts it', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 1 }, worker)
    queue.enqueue('a.mp3')
    const waiting = queue.enqueue('b.mp3')
    const last = queue.enqueue('c.mp3')
    queue.cancel(waiting.id)
    const error = await errorOf(waiting.result)
    expect((error as DOMException).name).toBe('AbortError')

    started[0].finish(fakeBuffer('a'))
    await tick()
    expect(started.map((job) => job.task.trackUrl)).toEqual(['a.mp3', 'c.mp3'])
    started[1].finish(fakeBuffer('c'))
    await last.result
  })

  it('cancelling a running task aborts its signal, rejects it and frees the slot', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 1 }, worker)
    const running = queue.enqueue('a.mp3')
    queue.enqueue('b.mp3')
    queue.cancel(running.id)
    expect(started[0].task.controller.signal.aborted).toBe(true)
    const error = await errorOf(running.result)
    expect((error as DOMException).name).toBe('AbortError')
    await tick()
    expect(started.map((job) => job.task.trackUrl)).toEqual(['a.mp3', 'b.mp3'])
  })

  it('reports a failed task by kind and keeps processing the rest', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 1 }, worker)
    const events: QueueEvent[] = []
    queue.subscribe((event) => events.push(event))
    const bad = queue.enqueue('bad.mp3')
    queue.enqueue('next.mp3')
    started[0].fail(new TaskError('http', 'HTTP 404'))
    const error = await errorOf(bad.result)
    expect((error as TaskError).kind).toBe('http')
    await tick()
    expect(started.length).toBe(2)
    expect(events.some((event) => event.type === 'task-failed' && event.error === 'http')).toBe(true)
  })

  it('maps an unknown error to the "unknown" kind', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 1 }, worker)
    const events: QueueEvent[] = []
    queue.subscribe((event) => events.push(event))
    const task = queue.enqueue('x.mp3')
    started[0].fail(new Error('boom'))
    await errorOf(task.result)
    expect(events.some((event) => event.type === 'task-failed' && event.error === 'unknown')).toBe(true)
  })

  it('emits events in lifecycle order and stops after unsubscribe', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 1 }, worker)
    const types: string[] = []
    const unsubscribe = queue.subscribe((event) => types.push(event.type))
    const task = queue.enqueue('a.mp3')
    started[0].finish(fakeBuffer('a'))
    await task.result
    expect(types).toEqual(['task-queued', 'task-status', 'task-ready'])
    unsubscribe()
    queue.enqueue('b.mp3')
    expect(types.length).toBe(3)
  })
})