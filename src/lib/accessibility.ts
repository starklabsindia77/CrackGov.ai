/**
 * Accessibility utilities
 */

/**
 * Generate ARIA label for interactive elements
 */
export function getAriaLabel(
  action: string,
  item?: string,
  context?: string
): string {
  let label = action;
  if (item) {
    label += ` ${item}`;
  }
  if (context) {
    label += ` ${context}`;
  }
  return label;
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute("tabindex");
  const role = element.getAttribute("role");
  const isButton = element.tagName === "BUTTON";
  const isLink = element.tagName === "A";
  const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);

  return (
    isButton ||
    isLink ||
    isInput ||
    tabIndex !== null ||
    role === "button" ||
    role === "link"
  );
}

/**
 * Focus management utilities
 */
export class FocusManager {
  /**
   * Trap focus within an element
   */
  static trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => {
      element.removeEventListener("keydown", handleTab);
    };
  }

  /**
   * Restore focus to previous element
   */
  static restoreFocus(previousElement: HTMLElement | null) {
    if (previousElement && typeof previousElement.focus === "function") {
      previousElement.focus();
    }
  }
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

