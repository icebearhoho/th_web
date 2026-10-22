/** A short sine tone made in memory, so playback can be tried without any network or audio file. */
export function createTestTone(context: AudioContext, seconds = 2, frequency = 440): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    samples[i] = 0.2 * Math.sin((2 * Math.PI * frequency * i) / context.sampleRate)
  }
  return buffer
}