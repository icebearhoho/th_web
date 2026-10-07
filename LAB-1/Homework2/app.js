// app.js
document.addEventListener('DOMContentLoaded', () => {
  const engine = new window.AudioEngine();
  const recorder = new window.BeatRecorder();

  const recordBtn = document.querySelector('#record-btn');
  const playBtn = document.querySelector('#play-btn');
  const clearBtn = document.querySelector('#clear-btn');
  const statusIndicator = document.querySelector('#status-indicator');
  const drumPads = document.querySelectorAll('.drum-pad');

  // Bản đồ liên kết phím bấm -> loại âm thanh
  const keyMap = new Map();
  drumPads.forEach((pad) => {
    const key = pad.getAttribute('data-key').toLowerCase();
    const sound = pad.getAttribute('data-sound');
    keyMap.set(key, { padElement: pad, sound });
  });

  function triggerPad(keyEntry) {
    if (!keyEntry) return;
    engine.triggerSound(keyEntry.sound);
    recorder.record(keyEntry.sound);

    // Kích hoạt hiệu ứng giao diện
    keyEntry.padElement.classList.add('playing');
    setTimeout(() => {
      keyEntry.padElement.classList.remove('playing');
    }, 100);
  }

  // 1. Lắng nghe sự kiện bàn phím với kiểm tra event.repeat
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return; // Chặn lặp âm khi đè giữ phím
    const entry = keyMap.get(e.key.toLowerCase());
    if (entry) {
      triggerPad(entry);
    }
  });

  // 2. Kích hoạt bằng nhấp chuột vào pad
  drumPads.forEach((pad) => {
    pad.addEventListener('click', () => {
      const sound = pad.getAttribute('data-sound');
      const entry = { padElement: pad, sound };
      triggerPad(entry);
    });
  });

  // 3. Quản lý Recorder Panel
  recordBtn.addEventListener('click', () => {
    if (!recorder.isRecording) {
      recorder.start();
      recordBtn.textContent = 'Stop Recording';
      statusIndicator.textContent = 'Recording...';
      playBtn.disabled = true;
      clearBtn.disabled = true;
    } else {
      recorder.stop();
      recordBtn.textContent = 'Record';
      statusIndicator.textContent = 'Recorded';
      playBtn.disabled = !recorder.hasEvents();
      clearBtn.disabled = !recorder.hasEvents();
    }
  });

  playBtn.addEventListener('click', () => {
    statusIndicator.textContent = 'Playing back...';
    playBtn.disabled = true;
    recordBtn.disabled = true;

    recorder.play(
      (soundType) => {
        engine.triggerSound(soundType);
        // Kích hoạt hiệu ứng visual trên pad tương ứng
        const pad = document.querySelector(`.drum-pad[data-sound="${soundType}"]`);
        if (pad) {
          pad.classList.add('playing');
          setTimeout(() => pad.classList.remove('playing'), 100);
        }
      },
      () => {
        statusIndicator.textContent = 'Idle';
        playBtn.disabled = false;
        recordBtn.disabled = false;
      }
    );
  });

  clearBtn.addEventListener('click', () => {
    recorder.clear();
    statusIndicator.textContent = 'Cleared';
    playBtn.disabled = true;
    clearBtn.disabled = true;
  });
});