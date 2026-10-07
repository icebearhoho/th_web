// app.js
document.addEventListener('DOMContentLoaded', () => {
  // 1. Khoi tao Drift-Free Countdown Engine (Slice 1)
  const daysEl = document.querySelector('#days');
  const hoursEl = document.querySelector('#hours');
  const minutesEl = document.querySelector('#minutes');
  const secondsEl = document.querySelector('#seconds');
  const finishedEl = document.querySelector('#countdown-finished-msg');
  const countdownGrid = document.querySelector('#countdown-display');

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

  // 2. State-Machine Form & Resilient Submission (Slice 2 & 3)
  const form = document.querySelector('#event-form');
  const submitBtn = document.querySelector('#submit-btn');
  const feedbackEl = document.querySelector('#form-feedback');
  const nameInput = document.querySelector('#attendee-name');
  const emailInput = document.querySelector('#attendee-email');
  const formInputs = form.querySelectorAll('input, button');

  // Bien kiem soat tien trinh mang va chong gui trung lap (Slice 3)
  let activeAbortController = null;

  // Ham xu ly chen thong bao an toan tuyet doi, triet tieu nguy co XSS
  function renderSafeFeedback(type, message, attendeeName = null) {
    feedbackEl.className = `feedback-area ${type}`;
    feedbackEl.replaceChildren(); // Xoa sach cay con cu ma khong dung innerHTML

    if (type === 'success' && attendeeName) {
      const strongEl = document.createElement('strong');
      strongEl.textContent = 'Registration Confirmed: ';

      const userText = document.createTextNode(
        `Pass issued for ${attendeeName}. Confirmation transmitted.`
      );

      feedbackEl.appendChild(strongEl);
      feedbackEl.appendChild(userText);
    } else {
      feedbackEl.textContent = message;
    }
  }

  const formMachine = new window.FormStateMachine({
    onStateChange: (state, payload) => {
      switch (state) {
        case 'SUBMITTING':
          formInputs.forEach((input) => (input.disabled = true));
          submitBtn.textContent = 'Transmitting...';
          renderSafeFeedback('info', 'Secure handshake in progress. Please wait...');
          break;

        case 'SUCCESS':
          formInputs.forEach((input) => (input.disabled = true));
          submitBtn.textContent = 'Registered';
          renderSafeFeedback('success', null, payload.name);
          break;

        case 'ERROR':
          formInputs.forEach((input) => (input.disabled = false));
          submitBtn.textContent = 'Retry Registration';
          renderSafeFeedback('error', payload?.message || 'Transmission failed. Verify fields.');
          break;

        case 'IDLE':
        default:
          formInputs.forEach((input) => (input.disabled = false));
          submitBtn.textContent = 'Register Now';
          feedbackEl.textContent = '';
          feedbackEl.className = 'feedback-area';
          break;
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Chan tuyet doi double-submit neu dang o trang thai gui
    if (formMachine.getState() === 'SUBMITTING') {
      return;
    }

    if (!form.checkValidity()) {
      formMachine.transition('ERROR', {
        message: 'Please complete all required fields with valid parameters.'
      });
      return;
    }

    // Lay du lieu tho tu form de kiem tra tinh loc sach
    const rawData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim()
    };

    // Huy bo request cu neu dang ton tai
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();
    const currentSignal = activeAbortController.signal;

    formMachine.transition('SUBMITTING');

    try {
      // Mo phong cuoc goi mang co ho tro AbortController Signal
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (rawData.email.includes('@')) {
            resolve(rawData);
          } else {
            reject(new Error('Invalid email domain received by upstream validator.'));
          }
        }, 1200);

        currentSignal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new DOMException('Request aborted by client', 'AbortError'));
        });
      });

      formMachine.transition('SUCCESS', rawData);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.info('Submission superseded by another event.');
      } else {
        formMachine.transition('ERROR', { message: err.message });
      }
    } finally {
      activeAbortController = null;
    }
  });
});