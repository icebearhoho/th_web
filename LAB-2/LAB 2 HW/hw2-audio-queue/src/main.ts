import './style.css'
import { createAudioContextManager } from './audio/audioContextManager'
import { playBuffer } from './audio/playBuffer'
import type { Playback } from './audio/playBuffer'
import { createTestTone } from './audio/testTone'

const manager = createAudioContextManager()
const app = document.querySelector<HTMLDivElement>('#app')!

const heading = document.createElement('h1')
heading.textContent = 'HW2: Audio Visualizer Queue'

const startButton = document.createElement('button')
startButton.type = 'button'
startButton.textContent = 'Start audio'

const toneButton = document.createElement('button')
toneButton.type = 'button'
toneButton.textContent = 'Play test tone'

const stopButton = document.createElement('button')
stopButton.type = 'button'
stopButton.textContent = 'Stop audio'

const status = document.createElement('output')
let playback: Playback | null = null

function showState(): void {
  status.textContent = `Audio context: ${manager.getState()}`
}

startButton.addEventListener('click', async () => {
  await manager.ensureRunning()
  showState()
})

toneButton.addEventListener('click', async () => {
  const context = await manager.ensureRunning()
  playback?.stop()
  const current = playBuffer(context, createTestTone(context))
  playback = current
  showState()
  await current.ended
  if (playback === current) playback = null
})

stopButton.addEventListener('click', async () => {
  playback?.stop()
  playback = null
  await manager.close()
  showState()
})

showState()
app.append(heading, startButton, toneButton, stopButton, status)