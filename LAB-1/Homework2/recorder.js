// recorder.js
class BeatRecorder {
  constructor() {
    this.isRecording = false;
    this.isLooping = false;
    this.startTime = 0;
    this.eventQueue = []; // FIFO Event Queue
    this.activeTimeouts = [];
  }

  start() {
    this.isRecording = true;
    this.isLooping = false;
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

  play(playCallback, onComplete, speedFactor = 1.0) {
    if (this.eventQueue.length === 0) return;
    this.stopPlayback();

    this.eventQueue.forEach((event, index) => {
      const timer = setTimeout(() => {
        playCallback(event.soundType);
        if (index === this.eventQueue.length - 1 && onComplete) {
          onComplete();
        }
      }, event.timeOffset / speedFactor);
      this.activeTimeouts.push(timer);
    });
  }

  playLoop(playCallback, speedFactor = 1.0) {
    if (this.eventQueue.length === 0) return;
    this.isLooping = true;

    const runSequence = () => {
      if (!this.isLooping) return;
      this.play(
        playCallback,
        () => {
          if (this.isLooping) {
            const loopTimer = setTimeout(runSequence, 200);
            this.activeTimeouts.push(loopTimer);
          }
        },
        speedFactor
      );
    };

    runSequence();
  }

  stopPlayback() {
    this.isLooping = false;
    this.activeTimeouts.forEach((timer) => clearTimeout(timer));
    this.activeTimeouts = [];
  }

  clear() {
    this.stopPlayback();
    this.eventQueue = [];
    this.isRecording = false;
  }

  hasEvents() {
    return this.eventQueue.length > 0;
  }
}

window.BeatRecorder = BeatRecorder;