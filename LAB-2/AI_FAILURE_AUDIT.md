# AI Failure Mode Audit Report

## Vulnerability 01: Raw innerHTML Ingestion (Cross-Site Scripting)
- **AI Prompt:** 'Generate a rich text renderer for comment items.'
- **AI Generated Code:** `container.innerHTML = comment.text;`
- **Risk:** Stored XSS via `<img src=x onerror=stealToken()>`
- **Detection Method:** DevTools Security Panel & Git Diff inspection
- **Engineering Refactor:**
  ```javascript
  const textNode = document.createTextNode(comment.text);
  container.replaceChildren(textNode);
  ```

---

## Vulnerability 02: Memory Leaks via Undelegated Inline Handlers
- **AI Prompt:** 'Attach event handlers to buttons in the reactive TaskApp.'
- **AI Generated Code:**
  ```javascript
  if (name.startsWith('on')) {
    dom.addEventListener(name.toLowerCase().substring(2), vNode.props[name]);
  }
  ```
- **Risk:** High memory footprint and GC thrashing. Every re-render allocates new closure instances without unbinding old ones, leaving orphaned event listeners on destroyed DOM nodes.
- **Detection Method:** Chrome DevTools Elements Panel (Event Listeners tab on `<button>` elements) and Heap Snapshots across multiple re-renders.
- **Engineering Refactor:**
  ```javascript
  dom.__vnode = vNode;

  export function setupEventDelegation(rootContainer) {
    ['click', 'input', 'keydown'].forEach((eventType) => {
      rootContainer.addEventListener(eventType, (nativeEvent) => {
        let target = nativeEvent.target;
        const handlerProp = `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;

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
  ```

---

## Vulnerability 03: Phantom Keys Triggering DOM Reconstruction
- **AI Prompt:** 'Render a dynamic task list mapped from state array.'
- **AI Generated Code:**
  ```javascript
  tasks.map((task) => createElement('li', { key: Math.random() }, task))
  ```
- **Risk:** Using non-deterministic keys forces tree diffing to invalidate every element identity on every render pass, triggering complete DOM subtree teardown and rebuilding, input focus loss, and severe layout thrashing.
- **Detection Method:** Chrome DevTools Rendering tab with Paint Flashing enabled (the entire list flashes on every state change instead of only added items).
- **Engineering Refactor:**
  ```javascript
  tasks.map((task) => createElement('li', { key: task.id }, task.text))
  ```