export type AudioContextFactory = () => AudioContext

export interface AudioContextManager {
  /** Create the context if needed and resume it. Call this only from a user gesture such as a click. */
  ensureRunning(): Promise<AudioContext>
  /** Close the context and drop the reference. A later ensureRunning() creates a fresh one. */
  close(): Promise<void>
  getState(): AudioContextState | 'none'
}

export function createAudioContextManager(
  factory: AudioContextFactory = () => new AudioContext(),
): AudioContextManager {
  let context: AudioContext | null = null
  let starting: Promise<AudioContext> | null = null

  async function start(): Promise<AudioContext> {
    if (context === null || context.state === 'closed') {
      context = factory()
    }
    if (context.state === 'suspended') {
      await context.resume()
    }
    return context
  }

  return {
    ensureRunning() {
      // Share one in-flight start so two quick clicks never create two contexts.
      starting ??= start().finally(() => {
        starting = null
      })
      return starting
    },

    async close() {
      const current = context
      context = null
      if (current !== null && current.state !== 'closed') {
        await current.close()
      }
    },

    getState() {
      return context === null ? 'none' : context.state
    },
  }
}