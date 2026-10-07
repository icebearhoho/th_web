// app.js
document.addEventListener('DOMContentLoaded', () => {
  const daysEl = document.querySelector('#days');
  const hoursEl = document.querySelector('#hours');
  const minutesEl = document.querySelector('#minutes');
  const secondsEl = document.querySelector('#seconds');
  const finishedEl = document.querySelector('#countdown-finished-msg');
  const countdownGrid = document.querySelector('#countdown-display');

  // Hard ISO 8601 UTC timestamp prevents timezone skew across different user regions
  const TARGET_UTC = '2026-12-31T23:59:59Z';

  const timer = new window.CountdownEngine(
    TARGET_UTC,
    ({ days, hours, minutes, seconds }) => {
      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    },
    () => {
      countdownGrid.hidden = true;
      finishedEl.hidden = false;
    }
  );

  timer.start();
});