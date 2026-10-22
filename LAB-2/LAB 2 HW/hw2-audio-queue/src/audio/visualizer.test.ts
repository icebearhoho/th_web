import { describe, expect, it } from 'vitest'
import { createVisualizer } from './visualizer'

function setup(bins = 4) {
  const fills: Array<{ style: string; x: number; y: number; w: number; h: number }> = []
  const ctx = {
    fillStyle: '',
    fillRect(x: number, y: number, w: number, h: number) {
      fills.push({ style: this.fillStyle, x, y, w, h })
    },
  }
  const canvas = { width: 400, height: 100, getContext: () => ctx } as unknown as HTMLCanvasElement

  const readTargets: Uint8Array[] = []
  const analyser = {
    frequencyBinCount: bins,
    getByteFrequencyData(target: Uint8Array) {
      readTargets.push(target)
      target.fill(255)
    },
  } as unknown as AnalyserNode

  let nextHandle = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  const cancelled: number[] = []
  const scheduler = {
    raf: (callback: FrameRequestCallback) => {
      const handle = nextHandle++
      callbacks.set(handle, callback)
      return handle
    },
    caf: (handle: number) => {
      cancelled.push(handle)
      callbacks.delete(handle)
    },
  }
  /** Run the oldest pending frame, like the browser would. */
  const runFrame = () => {
    const [handle, callback] = [...callbacks.entries()][0]
    callbacks.delete(handle)
    callback(0)
  }
  return { canvas, analyser, scheduler, fills, readTargets, callbacks, cancelled, runFrame }
}

describe('createVisualizer', () => {
  it('draws nothing until start() is called', () => {
    const t = setup()
    createVisualizer(t.canvas, t.analyser, t.scheduler)
    expect(t.callbacks.size).toBe(0)
    expect(t.fills.length).toBe(0)
  })

  it('draws one bar per frequency bin plus the background each frame', () => {
    const t = setup(4)
    createVisualizer(t.canvas, t.analyser, t.scheduler).start()
    t.runFrame()
    expect(t.fills.length).toBe(1 + 4)
    expect(t.fills[1].h).toBe(100)
  })

  it('reuses one Uint8Array for every frame', () => {
    const t = setup()
    createVisualizer(t.canvas, t.analyser, t.scheduler).start()
    t.runFrame()
    t.runFrame()
    t.runFrame()
    expect(t.readTargets.length).toBe(3)
    expect(t.readTargets[1]).toBe(t.readTargets[0])
    expect(t.readTargets[2]).toBe(t.readTargets[0])
  })

  it('sizes the array from frequencyBinCount', () => {
    const t = setup(128)
    createVisualizer(t.canvas, t.analyser, t.scheduler).start()
    t.runFrame()
    expect(t.readTargets[0].length).toBe(128)
  })

  it('keeps exactly one frame scheduled at a time', () => {
    const t = setup()
    createVisualizer(t.canvas, t.analyser, t.scheduler).start()
    t.runFrame()
    t.runFrame()
    expect(t.callbacks.size).toBe(1)
  })

  it('does not start a second loop when start() is called twice', () => {
    const t = setup()
    const visualizer = createVisualizer(t.canvas, t.analyser, t.scheduler)
    visualizer.start()
    visualizer.start()
    expect(t.callbacks.size).toBe(1)
  })

  it('stop() cancels the pending frame, clears the canvas and stops drawing', () => {
    const t = setup()
    const visualizer = createVisualizer(t.canvas, t.analyser, t.scheduler)
    visualizer.start()
    t.runFrame()
    const drawn = t.fills.length
    visualizer.stop()
    expect(t.cancelled.length).toBe(1)
    expect(t.callbacks.size).toBe(0)
    expect(t.fills.length).toBe(drawn + 1)
    visualizer.stop()
    expect(t.cancelled.length).toBe(1)
  })
})
