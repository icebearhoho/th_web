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

  // Bổ sung vào bên trong sự kiện DOMContentLoaded của app.js
  const form = document.querySelector('#event-form');
  const submitBtn = document.querySelector('#submit-btn');
  const feedbackEl = document.querySelector('#form-feedback');
  const nameInput = document.querySelector('#attendee-name');
  const emailInput = document.querySelector('#attendee-email');
  const formInputs = form.querySelectorAll('input, button');

  const formMachine = new window.FormStateMachine({
    onStateChange: (state, payload) => {
      switch (state) {
        case 'SUBMITTING':
          formInputs.forEach((input) => (input.disabled = true));
          submitBtn.textContent = 'Processing...';
          feedbackEl.className = 'feedback-area info';
          feedbackEl.textContent = 'Submitting registration payload...';
          break;

        case 'SUCCESS':
          formInputs.forEach((input) => (input.disabled = true));
          submitBtn.textContent = 'Registered';
          feedbackEl.className = 'feedback-area success';
          feedbackEl.textContent = `Success! Confirmed pass for ${payload.name}.`;
          break;

        case 'ERROR':
          formInputs.forEach((input) => (input.disabled = false));
          submitBtn.textContent = 'Retry Registration';
          feedbackEl.className = 'feedback-area error';
          feedbackEl.textContent = payload?.message || 'Submission failed. Please verify fields.';
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Xác thực ràng buộc cơ bản
    if (!form.checkValidity()) {
      formMachine.transition('ERROR', { message: 'Please complete all required fields correctly.' });
      return;
    }

    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim()
    };

    formMachine.transition('SUBMITTING');

    // Mô phỏng gọi API mạng (Network Latency)
    setTimeout(() => {
      // Giả lập tỉ lệ thành công
      if (formData.email.includes('@')) {
        formMachine.transition('SUCCESS', formData);
      } else {
        formMachine.transition('ERROR', { message: 'Invalid domain registration detected.' });
      }
    }, 1500);
  });


  timer.start();
});