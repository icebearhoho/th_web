import './style.css'
import { createAudioContextManager } from './audio/audioContextManager'

const manager = createAudioContextManager()
const app = document.querySelector<HTMLDivElement>('#app')!

const heading = document.createElement('h1')
heading.textContent = 'HW2: Audio Visualizer Queue'

const startButton = document.createElement('button')
startButton.type = 'button'
startButton.textContent = 'Start audio'

const stopButton = document.createElement('button')
stopButton.type = 'button'
stopButton.textContent = 'Stop audio'

const status = document.createElement('output')

function showState(): void {
  status.textContent = `Audio context: ${manager.getState()}`
}

startButton.addEventListener('click', async () => {
  await manager.ensureRunning()
  showState()
})

stopButton.addEventListener('click', async () => {
  await manager.close()
  showState()
})

showState()
app.append(heading, startButton, stopButton, status)