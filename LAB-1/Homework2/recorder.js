// recorder.js
class BeatRecorder {
  constructor() {
    this.isRecording = false;
    this.startTime = 0;
    this.eventQueue = []; // FIFO Event Queue
  }

  start() {
    this.isRecording = true;
    this.eventQueue = [];
    this.startTime = performance.now();
  }

  stop() {
    this.isRecording = false;
  }

  record(soundType) {
    if (!this.isRecording) return;
    const timeOffset = performance.now() - this.startTime;
    this.eventQueue.push({ soundType, timeOffset });
  }

  play(playCallback, onComplete) {
    if (this.eventQueue.length === 0) return;

    this.eventQueue.forEach((event, index) => {
      setTimeout(() => {
        playCallback(event.soundType);
        if (index === this.eventQueue.length - 1 && onComplete) {
          onComplete();
        }
      }, event.timeOffset);
    });
  }

  clear() {
    this.eventQueue = [];
    this.isRecording = false;
  }

  hasEvents() {
    return this.eventQueue.length > 0;
  }
}

window.BeatRecorder = BeatRecorder;