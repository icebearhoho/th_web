import { describe, expect, it } from 'vitest'
import { AudioTaskQueue } from './AudioTaskQueue'
import type { TaskWorker } from './AudioTaskQueue'
import type { AudioTask } from './types'

interface Job {
  readonly task: AudioTask
  readonly finish: (buffer: AudioBuffer) => void
  readonly fail: (error: unknown) => void
}

function createControlledWorker() {
  const started: Job[] = []
  const worker: TaskWorker = (task) =>
    new Promise<AudioBuffer>((resolve, reject) => {
      started.push({ task, finish: resolve, fail: reject })
    })
  return { worker, started }
}

const fakeBuffer = (label: string) => ({ label }) as unknown as AudioBuffer
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

describe('AudioTaskQueue ordered delivery', () => {
  it('delivers results in arrival order even when a later track finishes first', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 2 }, worker)
    const delivered: string[] = []
    const a = queue.enqueue('a.mp3')
    const b = queue.enqueue('b.mp3')
    void a.result.then(() => delivered.push('a'))
    void b.result.then(() => delivered.push('b'))

    started[1].finish(fakeBuffer('b'))
    await tick()
    expect(delivered).toEqual([])

    started[0].finish(fakeBuffer('a'))
    await tick()
    expect(delivered).toEqual(['a', 'b'])
  })

  it('frees the download slot as soon as a task finishes, even if its delivery waits', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 2 }, worker)
    queue.enqueue('a.mp3')
    queue.enqueue('b.mp3')
    queue.enqueue('c.mp3')
    started[1].finish(fakeBuffer('b'))
    await tick()
    expect(started.map((job) => job.task.trackUrl)).toEqual(['a.mp3', 'b.mp3', 'c.mp3'])
  })

  it('does not let an earlier failure block later tracks', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 2 }, worker)
    const a = queue.enqueue('a.mp3')
    const b = queue.enqueue('b.mp3')
    const failure = a.result.catch(() => 'failed')
    started[1].finish(fakeBuffer('b'))
    started[0].fail(new Error('boom'))
    expect(await failure).toBe('failed')
    expect(((await b.result) as unknown as { label: string }).label).toBe('b')
  })

  it('keeps a track waiting for a slower earlier one when a middle track fails', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 3 }, worker)
    const delivered: string[] = []
    const a = queue.enqueue('a.mp3')
    const b = queue.enqueue('b.mp3')
    const c = queue.enqueue('c.mp3')
    void a.result.then(() => delivered.push('a'))
    void b.result.catch(() => delivered.push('b-failed'))
    void c.result.then(() => delivered.push('c'))

    started[1].fail(new Error('boom'))
    started[2].finish(fakeBuffer('c'))
    await tick()
    expect(delivered).toEqual(['b-failed'])

    started[0].finish(fakeBuffer('a'))
    await tick()
    expect(delivered).toEqual(['b-failed', 'a', 'c'])
  })

  it('does not wait for a cancelled earlier track', async () => {
    const { worker, started } = createControlledWorker()
    const queue = new AudioTaskQueue({ concurrency: 1 }, worker)
    const a = queue.enqueue('a.mp3')
    const b = queue.enqueue('b.mp3')
    const cancelled = b.result.catch(() => 'cancelled')
    queue.cancel(b.id)
    expect(await cancelled).toBe('cancelled')
    started[0].finish(fakeBuffer('a'))
    await a.result
    const c = queue.enqueue('c.mp3')
    await tick()
    started[1].finish(fakeBuffer('c'))
    expect(((await c.result) as unknown as { label: string }).label).toBe('c')
  })
})