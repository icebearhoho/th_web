import { TaskError, createAbortError } from './errors'
import type { AudioTask, QueueErrorKind, QueueEvent, QueueOptions } from './types'

/** Does the real work for one task (download and decode). It must honour task.controller.signal. */
export type TaskWorker = (task: AudioTask) => Promise<AudioBuffer>

type QueueListener = (event: QueueEvent) => void

interface QueueEntry {
  readonly task: AudioTask
  readonly resolve: (buffer: AudioBuffer) => void
  readonly reject: (reason: unknown) => void
  /** Settles once the task enqueued right before this one is fully handled (delivered, failed or cancelled). */
  readonly previousSettled: Promise<void>
  /** Marks this task as handled, which lets the next task in line deliver its result. */
  readonly markSettled: () => void
}

export class AudioTaskQueue {
  private readonly concurrency: number
  private readonly worker: TaskWorker
  private readonly pending: QueueEntry[] = []
  private readonly active = new Map<string, QueueEntry>()
  private readonly listeners = new Set<QueueListener>()
  private nextId = 1
  private lastSettled: Promise<void> = Promise.resolve()

  constructor(options: Pick<QueueOptions, 'concurrency'>, worker: TaskWorker) {
    if (!Number.isInteger(options.concurrency) || options.concurrency < 1) {
      throw new RangeError('concurrency must be an integer of at least 1')
    }
    this.concurrency = options.concurrency
    this.worker = worker
  }

  /** Subscribe to queue events. Returns an unsubscribe function. */
  subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Add a track. Tasks start in arrival order, at most `concurrency` at a time. */
  enqueue(trackUrl: string): { id: string; result: Promise<AudioBuffer> } {
    const id = `task-${this.nextId++}`
    const task: AudioTask = { id, trackUrl, controller: new AbortController() }
    const previousSettled = this.lastSettled
    let markSettled: () => void = () => {}
    this.lastSettled = new Promise<void>((resolve) => {
      markSettled = resolve
    })
    const result = new Promise<AudioBuffer>((resolve, reject) => {
      this.pending.push({ task, resolve, reject, previousSettled, markSettled })
    })
    this.emit({ type: 'task-queued', id })
    this.pump()
    return { id, result }
  }

  /** Cancel a waiting or running task. Its promise rejects with an AbortError. */
  cancel(id: string): void {
    const waitingIndex = this.pending.findIndex((entry) => entry.task.id === id)
    if (waitingIndex !== -1) {
      const [entry] = this.pending.splice(waitingIndex, 1)
      entry.task.controller.abort()
      this.emit({ type: 'task-cancelled', id })
      this.rejectEntry(entry, createAbortError())
      return
    }
    // A running task is aborted here and settled in run(), once the worker stops.
    this.active.get(id)?.task.controller.abort()
  }

  private pump(): void {
    while (this.active.size < this.concurrency && this.pending.length > 0) {
      const entry = this.pending.shift()
      if (entry) this.run(entry)
    }
  }

  private run(entry: QueueEntry): void {
    const { task } = entry
    this.active.set(task.id, entry)
    this.emit({ type: 'task-status', id: task.id, status: 'downloading' })

    this.worker(task).then(
      (buffer) => {
        if (task.controller.signal.aborted) return this.settleCancelled(entry)
        this.active.delete(task.id)
        this.pump()
        // Results are delivered in arrival order: wait until every earlier task is handled.
        void entry.previousSettled.then(() => {
          this.emit({ type: 'task-ready', id: task.id })
          entry.resolve(buffer)
          entry.markSettled()
        })
      },
      (error: unknown) => {
        if (task.controller.signal.aborted) return this.settleCancelled(entry)
        this.active.delete(task.id)
        const kind: QueueErrorKind = error instanceof TaskError ? error.kind : 'unknown'
        this.emit({ type: 'task-failed', id: task.id, error: kind })
        this.rejectEntry(entry, error)
        this.pump()
      },
    )
  }

  private settleCancelled(entry: QueueEntry): void {
    this.active.delete(entry.task.id)
    this.emit({ type: 'task-cancelled', id: entry.task.id })
    this.rejectEntry(entry, createAbortError())
    this.pump()
  }

  /** Errors are reported at once, but the task only counts as handled after the ones before it. */
  private rejectEntry(entry: QueueEntry, reason: unknown): void {
    entry.reject(reason)
    void entry.previousSettled.then(entry.markSettled)
  }

  private emit(event: QueueEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}