import type { QueueErrorKind } from './types'

/** Error thrown by a task worker so the queue can report why the task failed. */
export class TaskError extends Error {
  readonly kind: QueueErrorKind

  constructor(kind: QueueErrorKind, message: string) {
    super(message)
    this.name = 'TaskError'
    this.kind = kind
  }
}

export function createAbortError(): DOMException {
  return new DOMException('The task was cancelled.', 'AbortError')
}