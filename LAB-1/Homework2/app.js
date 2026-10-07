// app.js
document.addEventListener('DOMContentLoaded', () => {
  const engine = new window.AudioEngine();
  const recorder = new window.BeatRecorder();

  const recordBtn = document.querySelector('#record-btn');
  const playBtn = document.querySelector('#play-btn');
  const loopBtn = document.querySelector('#loop-btn');
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

    // Kích hoạt hiệu ứng visual
    keyEntry.padElement.classList.add('playing');
    setTimeout(() => {
      keyEntry.padElement.classList.remove('playing');
    }, 100);
  }

  // 1. Bắt sự kiện phím với cờ chặn repeat
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const entry = keyMap.get(e.key.toLowerCase());
    if (entry) {
      triggerPad(entry);
    }
  });

  // 2. Kích hoạt khi click chuột vào pad
  drumPads.forEach((pad) => {
    pad.addEventListener('click', () => {
      const sound = pad.getAttribute('data-sound');
      const entry = { padElement: pad, sound };
      triggerPad(entry);
    });
  });

  // 3. Quản lý trạng thái Record
  recordBtn.addEventListener('click', () => {
    if (!recorder.isRecording) {
      recorder.start();
      recordBtn.textContent = 'Stop Recording';
      statusIndicator.textContent = 'Recording...';
      playBtn.disabled = true;
      loopBtn.disabled = true;
      clearBtn.disabled = true;
    } else {
      recorder.stop();
      recordBtn.textContent = 'Record';
      statusIndicator.textContent = 'Recorded';
      const hasEvents = recorder.hasEvents();
      playBtn.disabled = !hasEvents;
      loopBtn.disabled = !hasEvents;
      clearBtn.disabled = !hasEvents;
    }
  });

  // 4. Phát lại nhịp 1 lần
  playBtn.addEventListener('click', () => {
    statusIndicator.textContent = 'Playing back...';
    playBtn.disabled = true;
    loopBtn.disabled = true;
    recordBtn.disabled = true;

    recorder.play(
      (soundType) => {
        engine.triggerSound(soundType);
        const pad = document.querySelector(`.drum-pad[data-sound="${soundType}"]`);
        if (pad) {
          pad.classList.add('playing');
          setTimeout(() => pad.classList.remove('playing'), 100);
        }
      },
      () => {
        statusIndicator.textContent = 'Idle';
        playBtn.disabled = false;
        loopBtn.disabled = false;
        recordBtn.disabled = false;
      }
    );
  });

  // 5. Phát lại nhịp lặp vô hạn (Loop)
  loopBtn.addEventListener('click', () => {
    if (!recorder.isLooping) {
      statusIndicator.textContent = 'Looping...';
      loopBtn.textContent = 'Stop Loop';
      recordBtn.disabled = true;
      playBtn.disabled = true;

      recorder.playLoop((soundType) => {
        engine.triggerSound(soundType);
        const pad = document.querySelector(`.drum-pad[data-sound="${soundType}"]`);
        if (pad) {
          pad.classList.add('playing');
          setTimeout(() => pad.classList.remove('playing'), 100);
        }
      });
    } else {
      recorder.stopPlayback();
      loopBtn.textContent = 'Loop';
      statusIndicator.textContent = 'Idle';
      recordBtn.disabled = false;
      playBtn.disabled = !recorder.hasEvents();
    }
  });

  // 6. Xóa hàng đợi
  clearBtn.addEventListener('click', () => {
    recorder.clear();
    statusIndicator.textContent = 'Cleared';
    playBtn.disabled = true;
    loopBtn.disabled = true;
    clearBtn.disabled = true;
    loopBtn.textContent = 'Loop';
  });
});