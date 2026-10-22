import { TaskError, createAbortError } from './errors'
import { fetchTrack } from './fetchTrack'
import type { TaskWorker } from './AudioTaskQueue'
import type { QueueOptions } from './types'

type TrackWorkerOptions = Pick<QueueOptions, 'fetchImpl'> & {
  /** Usually `(data) => audioContext.decodeAudioData(data)`. Required here. */
  readonly decodeImpl: (data: ArrayBuffer) => Promise<AudioBuffer>
}

/** Builds the worker the queue runs for each task: download the bytes, then decode them. */
export function createTrackWorker({ fetchImpl, decodeImpl }: TrackWorkerOptions): TaskWorker {
  return async (task) => {
    const { signal } = task.controller
    const data = await fetchTrack(task.trackUrl, signal, fetchImpl)
    if (signal.aborted) throw createAbortError()

    try {
      return await decodeImpl(data)
    } catch {
      if (signal.aborted) throw createAbortError()
      throw new TaskError('decode', `Could not decode ${task.trackUrl}`)
    }
  }
}