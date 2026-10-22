import './style.css'
import { createAudioContextManager } from './audio/audioContextManager'
import { createAudioSession } from './audio/audioSession'
import { createTestTone } from './audio/testTone'

const app = document.querySelector<HTMLDivElement>('#app')!

const heading = document.createElement('h1')
heading.textContent = 'HW2: Audio Visualizer Queue'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 200
canvas.setAttribute('role', 'img')
canvas.setAttribute('aria-label', 'Live frequency spectrum of the playing audio')

const manager = createAudioContextManager()
const session = createAudioSession(canvas, manager)

function makeButton(label: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  return button
}

const startButton = makeButton('Start audio')
const toneButton = makeButton('Play test tone')
const stopButton = makeButton('Stop audio')
const status = document.createElement('output')

function showState(): void {
  status.textContent = `Audio context: ${manager.getState()}`
}

startButton.addEventListener('click', async () => {
  await manager.ensureRunning()
  showState()
})

toneButton.addEventListener('click', async () => {
  const context = await manager.ensureRunning()
  session.play(context, createTestTone(context))
  showState()
})

stopButton.addEventListener('click', async () => {
  await session.dispose()
  showState()
})

// Leaving the page releases the audio hardware and cancels the animation loop.
window.addEventListener('pagehide', () => {
  void session.dispose()
})

showState()
app.append(heading, canvas, startButton, toneButton, stopButton, status)