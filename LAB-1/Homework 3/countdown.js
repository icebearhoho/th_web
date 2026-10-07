// countdown.js
class CountdownEngine {
  constructor(targetIsoUtc, onTick, onComplete) {
    this.targetTime = new Date(targetIsoUtc).getTime();
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.timerId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick(); // Run immediately to avoid 1-second initial blank state
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  tick() {
    // Delta against true system clock eliminates background tab drift
    const now = Date.now();
    const distance = this.targetTime - now;

    if (distance <= 0) {
      this.stop();
      if (this.onComplete) this.onComplete();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (this.onTick) {
      this.onTick({ days, hours, minutes, seconds });
    }
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

window.CountdownEngine = CountdownEngine;