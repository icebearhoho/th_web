import { useEffect } from 'react';

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingTarget(target) {
  return TYPING_TAGS.has(target.tagName) || target.isContentEditable;
}

/**
 * Listens on window for drum keys.
 * padMap: Map<e.code, pad>. Must be stable (module-level constant).
 * onTriggerPad: (pad) => void. Must be stable (useCallback).
 */
export function useDrumKeyboard(padMap, onTriggerPad, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return undefined;

    const onKeyDown = (e) => {
      if (e.repeat) return;                              // OS auto-repeat flood
      if (e.ctrlKey || e.metaKey || e.altKey) return;    // keep Ctrl+S, Alt+Tab... working
      if (isTypingTarget(e.target)) return;              // user is typing in a field
      const pad = padMap.get(e.code);                    // physical key, never keyCode
      if (!pad) return;
      e.preventDefault();
      onTriggerPad(pad);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [padMap, onTriggerPad, isEnabled]);
}