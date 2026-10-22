/** A rising sweep made in memory, so playback and the visualizer work without any network or audio file. */
export function createTestTone(context: AudioContext, seconds = 3, startHz = 200, endHz = 4000): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    const t = i / context.sampleRate
    const phase = 2 * Math.PI * (startHz * t + ((endHz - startHz) * t * t) / (2 * seconds))
    samples[i] = 0.2 * Math.sin(phase)
  }
  return buffer
}