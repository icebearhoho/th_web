export interface Visualizer {
  /** Start the requestAnimationFrame loop. Calling it twice does not start a second loop. */
  start(): void
  /** Cancel the pending frame and clear the canvas. Safe to call more than once. */
  stop(): void
}

interface FrameScheduler {
  readonly raf: (callback: FrameRequestCallback) => number
  readonly caf: (handle: number) => void
}

const BACKGROUND = '#111827'
const BAR_COLOR = '#93c5fd'

export function createVisualizer(
  canvas: HTMLCanvasElement,
  analyser: AnalyserNode,
  scheduler: FrameScheduler = {
    raf: (callback) => requestAnimationFrame(callback),
    caf: (handle) => cancelAnimationFrame(handle),
  },
): Visualizer {
  const context = canvas.getContext('2d')
  if (context === null) {
    throw new Error('2D canvas is not available')
  }

  // Allocated once. Every frame reads into this same array, so no garbage is created per frame.
  const data = new Uint8Array(analyser.frequencyBinCount)
  const barWidth = canvas.width / data.length

  let frameHandle: number | null = null

  function drawFrame(): void {
    frameHandle = scheduler.raf(drawFrame)
    analyser.getByteFrequencyData(data)

    context!.fillStyle = BACKGROUND
    context!.fillRect(0, 0, canvas.width, canvas.height)
    context!.fillStyle = BAR_COLOR
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * canvas.height
      context!.fillRect(i * barWidth, canvas.height - barHeight, Math.max(barWidth - 1, 1), barHeight)
    }
  }

  return {
    start() {
      if (frameHandle !== null) return
      frameHandle = scheduler.raf(drawFrame)
    },

    stop() {
      if (frameHandle === null) return
      scheduler.caf(frameHandle)
      frameHandle = null
      context.fillStyle = BACKGROUND
      context.fillRect(0, 0, canvas.width, canvas.height)
    },
  }
}