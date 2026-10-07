// form-machine.js
class FormStateMachine {
  constructor(options = {}) {
    this.state = 'IDLE'; // Các trạng thái: IDLE | SUBMITTING | SUCCESS | ERROR
    this.onStateChange = options.onStateChange || (() => {});
  }

  transition(newState, payload = null) {
    const validTransitions = {
      IDLE: ['SUBMITTING'],
      SUBMITTING: ['SUCCESS', 'ERROR'],
      SUCCESS: ['IDLE'],
      ERROR: ['SUBMITTING', 'IDLE']
    };

    if (validTransitions[this.state]?.includes(newState)) {
      this.state = newState;
      this.onStateChange(this.state, payload);
    } else {
      console.warn(`Chuyển đổi trạng thái không hợp lệ: từ ${this.state} sang ${newState}`);
    }
  }

  getState() {
    return this.state;
  }
}

window.FormStateMachine = FormStateMachine;