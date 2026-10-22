import type { AudioContextManager } from './audioContextManager'
import { playBuffer } from './playBuffer'
import type { FftSize, Playback } from './playBuffer'
import { createVisualizer } from './visualizer'
import type { Visualizer } from './visualizer'

interface SessionDeps {
  readonly playBuffer: typeof playBuffer
  readonly createVisualizer: typeof createVisualizer
}

export interface AudioSession {
  /** Stop whatever is playing, then play this buffer and draw its spectrum. */
  play(context: AudioContext, buffer: AudioBuffer): void
  /** Stop the sound, cancel the animation loop and drop every reference. Safe to call twice. */
  stop(): void
  /** Stop everything and close the AudioContext. */
  dispose(): Promise<void>
  isPlaying(): boolean
}

/** Owns one playback plus its visualizer, so that cleanup always happens together. */
export function createAudioSession(
  canvas: HTMLCanvasElement,
  manager: AudioContextManager,
  fftSize: FftSize = 256,
  deps: SessionDeps = { playBuffer, createVisualizer },
): AudioSession {
  let current: { playback: Playback; visualizer: Visualizer } | null = null

  function stop(): void {
    const entry = current
    current = null
    if (entry === null) return
    entry.visualizer.stop()
    entry.playback.stop()
  }

  return {
    play(context, buffer) {
      stop()
      const playback = deps.playBuffer(context, buffer, fftSize)
      const visualizer = deps.createVisualizer(canvas, playback.analyser)
      const entry = { playback, visualizer }
      current = entry
      visualizer.start()
      void playback.ended.then(() => {
        // Natural end of the sound: release everything without waiting for stop().
        if (current === entry) {
          current = null
          visualizer.stop()
        }
      })
    },

    stop,

    async dispose() {
      stop()
      await manager.close()
    },

    isPlaying() {
      return current !== null
    },
  }
}