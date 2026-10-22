import { describe, expect, it } from 'vitest'
import { createAudioContextManager } from './audioContextManager'

class FakeContext {
  state: AudioContextState = 'suspended'
  resumeCalls = 0
  closeCalls = 0

  async resume(): Promise<void> {
    this.resumeCalls++
    this.state = 'running'
  }

  async close(): Promise<void> {
    this.closeCalls++
    this.state = 'closed'
  }
}

function setup() {
  const created: FakeContext[] = []
  const manager = createAudioContextManager(() => {
    const fake = new FakeContext()
    created.push(fake)
    return fake as unknown as AudioContext
  })
  return { manager, created }
}

describe('createAudioContextManager', () => {
  it('does not create a context until ensureRunning is called', () => {
    const { manager, created } = setup()
    expect(created.length).toBe(0)
    expect(manager.getState()).toBe('none')
  })

  it('creates a context and resumes it', async () => {
    const { manager, created } = setup()
    await manager.ensureRunning()
    expect(created.length).toBe(1)
    expect(created[0].resumeCalls).toBe(1)
    expect(manager.getState()).toBe('running')
  })

  it('reuses the same context on later calls', async () => {
    const { manager, created } = setup()
    const first = await manager.ensureRunning()
    const second = await manager.ensureRunning()
    expect(second).toBe(first)
    expect(created.length).toBe(1)
    expect(created[0].resumeCalls).toBe(1)
  })

  it('creates only one context for two quick calls', async () => {
    const { manager, created } = setup()
    await Promise.all([manager.ensureRunning(), manager.ensureRunning()])
    expect(created.length).toBe(1)
  })

  it('resumes a context the browser suspended again', async () => {
    const { manager, created } = setup()
    await manager.ensureRunning()
    created[0].state = 'suspended'
    await manager.ensureRunning()
    expect(created[0].resumeCalls).toBe(2)
  })

  it('closes the context and creates a fresh one afterwards', async () => {
    const { manager, created } = setup()
    await manager.ensureRunning()
    await manager.close()
    expect(created[0].closeCalls).toBe(1)
    expect(manager.getState()).toBe('none')
    await manager.ensureRunning()
    expect(created.length).toBe(2)
  })

  it('closing when nothing was created does nothing', async () => {
    const { manager, created } = setup()
    await manager.close()
    expect(created.length).toBe(0)
  })
})