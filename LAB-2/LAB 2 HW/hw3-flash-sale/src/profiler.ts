import type { ProfilerOnRenderCallback } from 'react'

const renderCounts = new Map<string, number>()

/** Logs every commit of a <Profiler> in development, so render counts can be compared before and after a fix. */
export const logRender: ProfilerOnRenderCallback = (id, _phase, actualDuration) => {
  if (!import.meta.env.DEV) return
  const count = (renderCounts.get(id) ?? 0) + 1
  renderCounts.set(id, count)
  console.debug(`[profiler] ${id} render #${count} ${actualDuration.toFixed(2)}ms`)
}
