/**
 * Lightweight keyboard-shortcut hook for admin editor flows.
 *
 * Usage:
 *   useKeyboardShortcuts({
 *     enabled: editing,
 *     bindings: [
 *       { combo: "mod+s", onTrigger: handleSave, preventDefault: true },
 *       { combo: "mod+p", onTrigger: handlePreview, preventDefault: true },
 *     ],
 *   });
 *
 * "mod" matches Ctrl on Win/Linux and ⌘ on macOS. Combos are case-insensitive,
 * use "+" to join keys, and accept any single key (a-z, "/", "Enter", etc.).
 */
import { useEffect, useRef } from "react";

export interface KeyBinding {
  /** e.g. "mod+s", "shift+/", "Enter". */
  combo: string;
  onTrigger: (event: KeyboardEvent) => void;
  /** When true the browser default is suppressed. Default: false. */
  preventDefault?: boolean;
  /**
   * Skip the binding while focus is in an editable field (input/textarea/
   * contentEditable). Default: false — most editor shortcuts WANT to fire
   * inside the editor.
   */
  skipInEditable?: boolean;
}

interface UseKeyboardShortcutsOptions {
  bindings: KeyBinding[];
  /** Disable all bindings at once (e.g. when not in edit mode). */
  enabled?: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

const isEditableTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
};

const normaliseKey = (key: string): string => {
  if (key === " ") return "space";
  return key.toLowerCase();
};

const matches = (combo: string, event: KeyboardEvent): boolean => {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim());
  let needsMod = false;
  let needsShift = false;
  let needsAlt = false;
  let keyToken = "";

  for (const part of parts) {
    if (part === "mod") needsMod = true;
    else if (part === "ctrl") needsMod = !isMac ? true : needsMod;
    else if (part === "cmd" || part === "meta") needsMod = isMac ? true : needsMod;
    else if (part === "shift") needsShift = true;
    else if (part === "alt" || part === "option") needsAlt = true;
    else keyToken = part;
  }

  const eventKey = normaliseKey(event.key);
  if (eventKey !== keyToken) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;

  if (needsMod) {
    const modPressed = isMac ? event.metaKey : event.ctrlKey;
    if (!modPressed) return false;
  } else {
    // Reject if a modifier WAS pressed but not required (avoids stealing
    // shortcuts like Ctrl+S when binding is plain "s").
    if (event.metaKey || event.ctrlKey) return false;
  }

  return true;
};

export const useKeyboardShortcuts = ({
  bindings,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      const editable = isEditableTarget(event.target);
      for (const binding of bindingsRef.current) {
        if (binding.skipInEditable && editable) continue;
        if (matches(binding.combo, event)) {
          if (binding.preventDefault) event.preventDefault();
          binding.onTrigger(event);
          break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
};
