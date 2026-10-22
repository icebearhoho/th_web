import { describe, expect, it } from 'vitest'
import { playBuffer } from './playBuffer'

class FakeNode {
  readonly connections: unknown[] = []
  disconnectCalls = 0
  connect(target: unknown): void {
    this.connections.push(target)
  }
  disconnect(): void {
    this.disconnectCalls++
  }
}

class FakeSource extends FakeNode {
  buffer: unknown = null
  started = 0
  stopped = 0
  onended: (() => void) | null = null
  start(): void {
    this.started++
  }
  stop(): void {
    this.stopped++
  }
}

class FakeAnalyser extends FakeNode {
  fftSize = 2048
}

function setup() {
  const source = new FakeSource()
  const analyser = new FakeAnalyser()
  const destination = { name: 'destination' }
  const context = {
    destination,
    createBufferSource: () => source,
    createAnalyser: () => analyser,
  } as unknown as AudioContext
  const buffer = { name: 'buffer' } as unknown as AudioBuffer
  return { source, analyser, destination, context, buffer }
}

describe('playBuffer', () => {
  it('connects source -> analyser -> destination and starts the source', () => {
    const { source, analyser, destination, context, buffer } = setup()
    playBuffer(context, buffer)
    expect(source.buffer).toBe(buffer)
    expect(source.connections).toEqual([analyser])
    expect(analyser.connections).toEqual([destination])
    expect(source.started).toBe(1)
  })

  it('uses FFT size 256 by default and accepts 512', () => {
    const first = setup()
    playBuffer(first.context, first.buffer)
    expect(first.analyser.fftSize).toBe(256)

    const second = setup()
    playBuffer(second.context, second.buffer, 512)
    expect(second.analyser.fftSize).toBe(512)
  })

  it('rejects any other FFT size', () => {
    const { context, buffer } = setup()
    expect(() => playBuffer(context, buffer, 1024 as 256)).toThrow()
  })

  it('stop() stops the source and disconnects both nodes, once', async () => {
    const { source, analyser, context, buffer } = setup()
    const playback = playBuffer(context, buffer)
    playback.stop()
    playback.stop()
    expect(source.stopped).toBe(1)
    expect(source.disconnectCalls).toBe(1)
    expect(analyser.disconnectCalls).toBe(1)
    await playback.ended
  })

  it('cleans up and resolves ended when the sound finishes on its own', async () => {
    const { source, analyser, context, buffer } = setup()
    const playback = playBuffer(context, buffer)
    source.onended?.()
    await playback.ended
    expect(source.disconnectCalls).toBe(1)
    expect(analyser.disconnectCalls).toBe(1)
    playback.stop()
    expect(source.stopped).toBe(0)
  })
})