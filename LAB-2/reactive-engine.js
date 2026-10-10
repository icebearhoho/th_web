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

export function setupEventDelegation(rootContainer) {
  const supportedEvents = ['click', 'input', 'keydown'];

  supportedEvents.forEach((eventType) => {
    rootContainer.addEventListener(eventType, (nativeEvent) => {
      let target = nativeEvent.target;
      const handlerProp = `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;

      // Bubble up to find the matching virtual handler
      while (target && target !== rootContainer) {
        if (target.__vnode && target.__vnode.props[handlerProp]) {
          target.__vnode.props[handlerProp](nativeEvent);
          break;
        }
        target = target.parentElement;
      }
    });
  });
}

export function renderToDOM(vNode) {
  const dom =
    vNode.type === 'TEXT_ELEMENT'
      ? document.createTextNode(vNode.props.nodeValue)
      : document.createElement(vNode.type);

  // Link VNode for delegation lookup
  dom.__vnode = vNode;

  Object.keys(vNode.props)
    .filter((key) => key !== 'children' && key !== 'nodeValue')
    .forEach((name) => {
      // Skip on* handlers here: the Root Delegation Hub handles them
      if (!name.startsWith('on')) {
        if (name === 'className') {
          dom.className = vNode.props[name];
        } else {
          dom.setAttribute(name, vNode.props[name]);
        }
      }
    });

  vNode.props.children.forEach((child) => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}

let rootContainer = null;
let RootComponent = null;

export function renderApp(Component, container) {
  rootContainer = container;
  RootComponent = Component;

  // Attach root listener only once
  setupEventDelegation(rootContainer);

  const reRender = () => {
    resetCursor(); // Deterministic invariant: reset cursor to 0 before every render pass
    const vApp = RootComponent();
    rootContainer.replaceChildren(renderToDOM(vApp));
  };

  setRenderer(reRender);
  reRender(); // Initial mount
}