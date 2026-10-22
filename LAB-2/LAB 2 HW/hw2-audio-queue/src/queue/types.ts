export type TaskStatus = 'queued' | 'downloading' | 'decoding' | 'ready' | 'cancelled' | 'failed'

/** Why a task failed. Keeps fetch, HTTP and decode problems apart for the UI. */
export type QueueErrorKind = 'network' | 'http' | 'decode' | 'aborted' | 'unknown'

export interface AudioTask {
  readonly id: string
  readonly trackUrl: string
  /** Every task owns its own controller; cancelling aborts the fetch and rejects the promise. */
  readonly controller: AbortController
}

export interface QueueOptions {
  /** How many tasks may download or decode at the same time. Must be at least 1. */
  readonly concurrency: number
  /** Injectable so unit tests do not need the network. Defaults to the global fetch. */
  readonly fetchImpl?: typeof fetch
  /** Injectable so unit tests do not need a real AudioContext. */
  readonly decodeImpl?: (data: ArrayBuffer) => Promise<AudioBuffer>
}

export type QueueEvent =
  | { readonly type: 'task-queued'; readonly id: string }
  | { readonly type: 'task-status'; readonly id: string; readonly status: TaskStatus }
  | { readonly type: 'task-ready'; readonly id: string }
  | { readonly type: 'task-cancelled'; readonly id: string }
  | { readonly type: 'task-failed'; readonly id: string; readonly error: QueueErrorKind }