// src/utils/useFocusTrap.js
// Reusable focus-trap hook for modals and slide-over panels.
//
// Responsibilities:
//   1. On open: saves the element that had focus before the panel opened,
//      then moves focus into the panel (first focusable child, or the container).
//   2. While open: intercepts Tab and Shift+Tab to cycle focus only within the panel.
//   3. On Escape: calls onClose() so the panel can close.
//   4. On close: restores focus to the element that was active before the panel opened.
//
// Usage:
//   const panelRef = useRef(null);
//   useFocusTrap(panelRef, isOpen, onClose);
//   // Then: <div ref={panelRef} role="dialog" aria-modal="true"> ... </div>

import { useEffect, useRef } from 'react';

/** CSS selector for all naturally focusable elements. */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Returns all focusable descendant elements of a container in DOM order.
 *
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[inert]') && el.offsetParent !== null
  );
}

/**
 * Traps keyboard focus inside `containerRef` while `isOpen` is true.
 * Calls `onClose` when the Escape key is pressed.
 * Restores focus to the previously focused element when `isOpen` becomes false.
 *
 * @param {React.RefObject<HTMLElement>} containerRef  — ref attached to the dialog/panel root
 * @param {boolean} isOpen                            — whether the panel is visible
 * @param {() => void} onClose                        — called when Escape is pressed
 */
export function useFocusTrap(containerRef, isOpen, onClose) {
  // Stores the element that was focused before the panel opened.
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // --- On open: save current focus, then move focus into the panel ---
    previouslyFocusedRef.current = document.activeElement;

    const container = containerRef.current;
    if (container) {
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        // Small timeout ensures the panel has finished its CSS transition
        // and is fully visible before we steal focus.
        const timerId = setTimeout(() => {
          focusable[0].focus();
        }, 50);
        // Store timerId for cleanup in case the component unmounts quickly.
        container._focusTrapTimer = timerId;
      } else {
        // If no focusable children, focus the container itself.
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
        }
        container.focus();
      }
    }

    // --- Keydown handler: trap Tab and handle Escape ---
    function handleKeyDown(event) {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = getFocusableElements(currentContainer);
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: if focus is on (or before) the first element, wrap to last.
          if (document.activeElement === firstEl || !currentContainer.contains(document.activeElement)) {
            event.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab: if focus is on (or after) the last element, wrap to first.
          if (document.activeElement === lastEl || !currentContainer.contains(document.activeElement)) {
            event.preventDefault();
            firstEl.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // --- Cleanup: remove listener and restore focus ---
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Clear the focus timer if it hasn't fired yet.
      const currentContainer = containerRef.current;
      if (currentContainer && currentContainer._focusTrapTimer !== undefined) {
        clearTimeout(currentContainer._focusTrapTimer);
        delete currentContainer._focusTrapTimer;
      }

      // Restore focus to where it was before the panel opened.
      const target = previouslyFocusedRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [isOpen, containerRef, onClose]);
}
