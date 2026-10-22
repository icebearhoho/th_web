import { describe, expect, it } from 'vitest'
import { createAudioSession } from './audioSession'

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

function setup() {
  const playbacks: Array<{ stopCalls: number; end: () => void }> = []
  const visualizers: Array<{ startCalls: number; stopCalls: number }> = []
  let closeCalls = 0

  const deps = {
    playBuffer: () => {
      let end: () => void = () => {}
      const ended = new Promise<void>((resolve) => {
        end = resolve
      })
      const record = { stopCalls: 0, end }
      playbacks.push(record)
      return { analyser: {}, ended, stop: () => void record.stopCalls++ }
    },
    createVisualizer: () => {
      const record = { startCalls: 0, stopCalls: 0 }
      visualizers.push(record)
      return { start: () => void record.startCalls++, stop: () => void record.stopCalls++ }
    },
  } as unknown as Parameters<typeof createAudioSession>[3]

  const manager = {
    ensureRunning: async () => ({}) as AudioContext,
    close: async () => void closeCalls++,
    getState: () => 'none' as const,
  }
  const session = createAudioSession({} as HTMLCanvasElement, manager, 256, deps)
  const context = {} as AudioContext
  const buffer = {} as AudioBuffer
  return { session, context, buffer, playbacks, visualizers, closeCalls: () => closeCalls }
}

describe('createAudioSession', () => {
  it('starts the playback and the visualizer together', () => {
    const t = setup()
    t.session.play(t.context, t.buffer)
    expect(t.session.isPlaying()).toBe(true)
    expect(t.visualizers[0].startCalls).toBe(1)
  })

  it('stops the previous playback and visualizer before starting a new one', () => {
    const t = setup()
    t.session.play(t.context, t.buffer)
    t.session.play(t.context, t.buffer)
    expect(t.playbacks[0].stopCalls).toBe(1)
    expect(t.visualizers[0].stopCalls).toBe(1)
    expect(t.visualizers[1].startCalls).toBe(1)
  })

  it('stop() stops both and is safe to call twice', () => {
    const t = setup()
    t.session.play(t.context, t.buffer)
    t.session.stop()
    t.session.stop()
    expect(t.playbacks[0].stopCalls).toBe(1)
    expect(t.visualizers[0].stopCalls).toBe(1)
    expect(t.session.isPlaying()).toBe(false)
  })

  it('stops the visualizer when the sound ends on its own', async () => {
    const t = setup()
    t.session.play(t.context, t.buffer)
    t.playbacks[0].end()
    await tick()
    expect(t.visualizers[0].stopCalls).toBe(1)
    expect(t.session.isPlaying()).toBe(false)
  })

  it('does not stop a newer playback when an older one ends late', async () => {
    const t = setup()
    t.session.play(t.context, t.buffer)
    t.session.play(t.context, t.buffer)
    t.playbacks[0].end()
    await tick()
    expect(t.visualizers[1].stopCalls).toBe(0)
    expect(t.session.isPlaying()).toBe(true)
  })

  it('dispose() stops everything and closes the AudioContext', async () => {
    const t = setup()
    t.session.play(t.context, t.buffer)
    await t.session.dispose()
    expect(t.visualizers[0].stopCalls).toBe(1)
    expect(t.closeCalls()).toBe(1)
  })
})
