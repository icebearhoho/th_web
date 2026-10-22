import { describe, expect, it } from 'vitest'
import { createCountdown, formatCountdown, getRemainingMs } from './countdown'

describe('getRemainingMs', () => {
  it('returns the difference from the real clock', () => {
    expect(getRemainingMs(10_000, 4_000)).toBe(6_000)
  })
  it('never goes below zero', () => {
    expect(getRemainingMs(10_000, 12_000)).toBe(0)
  })
})

describe('formatCountdown', () => {
  it('formats hours, minutes and seconds with leading zeros', () => {
    expect(formatCountdown(3_661_000)).toBe('01:01:01')
  })
  it('rounds up so 1 ms left still shows one second', () => {
    expect(formatCountdown(1)).toBe('00:00:01')
  })
  it('shows zero at the end and for negative input', () => {
    expect(formatCountdown(0)).toBe('00:00:00')
    expect(formatCountdown(-500)).toBe('00:00:00')
  })
})

function setup(endsAt: number) {
  let time = 0
  let next = 1
  const pending = new Map<number, FrameRequestCallback>()
  const cancelled: number[] = []
  const ticks: number[] = []
  let ended = 0
  const countdown = createCountdown(endsAt, (ms) => ticks.push(ms), () => void ended++, {
    now: () => time,
    raf: (callback) => {
      const handle = next++
      pending.set(handle, callback)
      return handle
    },
    caf: (handle) => {
      cancelled.push(handle)
      pending.delete(handle)
    },
  })
  const frameAt = (t: number) => {
    time = t
    const [handle, callback] = [...pending.entries()][0]
    pending.delete(handle)
    callback(t)
  }
  return { countdown, frameAt, pending, cancelled, ticks, ended: () => ended, setTime: (t: number) => void (time = t) }
}

describe('createCountdown', () => {
  it('ticks right away on start', () => {
    const t = setup(5_000)
    t.countdown.start()
    expect(t.ticks).toEqual([5_000])
  })

  it('only ticks when the displayed second changes', () => {
    const t = setup(5_000)
    t.countdown.start()
    t.frameAt(16)
    t.frameAt(32)
    t.frameAt(500)
    expect(t.ticks.length).toBe(1)
    t.frameAt(1_001)
    expect(t.ticks.length).toBe(2)
    expect(t.ticks[1]).toBe(3_999)
  })

  it('does not drift after a long pause (hidden tab)', () => {
    const t = setup(60_000)
    t.countdown.start()
    t.frameAt(45_000)
    expect(t.ticks[t.ticks.length - 1]).toBe(15_000)
  })

  it('ends exactly once and schedules no more frames', () => {
    const t = setup(2_000)
    t.countdown.start()
    t.frameAt(2_500)
    expect(t.ended()).toBe(1)
    expect(t.pending.size).toBe(0)
    expect(t.ticks[t.ticks.length - 1]).toBe(0)
  })

  it('ends immediately when the sale is already over', () => {
    const t = setup(-1)
    t.countdown.start()
    expect(t.ended()).toBe(1)
    expect(t.pending.size).toBe(0)
  })

  it('stop() cancels the pending frame and is safe twice', () => {
    const t = setup(5_000)
    t.countdown.start()
    t.countdown.stop()
    t.countdown.stop()
    expect(t.cancelled.length).toBe(1)
    expect(t.pending.size).toBe(0)
  })

  it('start() twice does not start a second loop', () => {
    const t = setup(5_000)
    t.countdown.start()
    t.countdown.start()
    expect(t.pending.size).toBe(1)
  })
})
