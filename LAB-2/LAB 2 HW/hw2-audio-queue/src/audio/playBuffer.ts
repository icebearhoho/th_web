export type FftSize = 256 | 512

export interface Playback {
  /** Read frequency data from this node (frequencyBinCount is 128 for 256, 256 for 512). */
  readonly analyser: AnalyserNode
  /** Resolves when playback ends, whether it finished or was stopped. */
  readonly ended: Promise<void>
  /** Stop the sound and disconnect both nodes. Safe to call more than once. */
  stop(): void
}

/** Plays a decoded buffer through: source -> AnalyserNode -> destination. */
export function playBuffer(context: AudioContext, buffer: AudioBuffer, fftSize: FftSize = 256): Playback {
  if (fftSize !== 256 && fftSize !== 512) {
    throw new RangeError('fftSize must be 256 or 512')
  }

  const source = context.createBufferSource()
  source.buffer = buffer

  const analyser = context.createAnalyser()
  analyser.fftSize = fftSize

  source.connect(analyser)
  analyser.connect(context.destination)

  let finished = false
  let markEnded: () => void = () => {}
  const ended = new Promise<void>((resolve) => {
    markEnded = resolve
  })

  function finish(): void {
    if (finished) return
    finished = true
    source.onended = null
    source.disconnect()
    analyser.disconnect()
    markEnded()
  }

  source.onended = finish
  source.start()

  return {
    analyser,
    ended,
    stop() {
      if (finished) return
      try {
        source.stop()
      } finally {
        finish()
      }
    },
  }
}