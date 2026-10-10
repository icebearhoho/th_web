export { createElement, createTextElement } from './mini-react.js';

let stateStore = [];
let cursor = 0;
let triggerRender = () => {};

export function setRenderer(rerenderFn) {
  triggerRender = rerenderFn;
}

export function resetCursor() {
  cursor = 0;
}


export function useState(initialValue) {
  const currentCursor = cursor;

  // Initialize slot if undefined
  stateStore[currentCursor] = stateStore[currentCursor] ?? initialValue;

  const setState = (nextValue) => {
    // Support functional updater: setState(prev => prev + 1)
    const resolvedValue =
      typeof nextValue === 'function'
        ? nextValue(stateStore[currentCursor])
        : nextValue;

    // Guard: Only re-render if the value actually changed
    if (!Object.is(stateStore[currentCursor], resolvedValue)) {
      stateStore[currentCursor] = resolvedValue;
      triggerRender();
    }
  };
  cursor++;
  return [stateStore[currentCursor], setState];
}