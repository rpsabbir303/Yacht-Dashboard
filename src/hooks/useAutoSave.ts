/**
 * Debounced auto-save hook.
 *
 * Fires `onSave(value)` either:
 *   • after the user has stopped changing `value` for `idleDelayMs` ms
 *   • OR every `maxIntervalMs` ms while editing is ongoing
 *
 * The hook reports its own state so the consumer can render a status
 * indicator (e.g. "● Saving…" / "✓ All changes saved").
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface UseAutoSaveOptions<T> {
  /** Source-of-truth value to watch (typically HTML content from the editor). */
  value: T;
  /**
   * Performs the actual persistence. Must return a Promise; rejected promises
   * flip the hook into "error" state without losing the dirty flag.
   */
  onSave: (value: T) => Promise<unknown>;
  /** Disable auto-save entirely (e.g. when not in edit mode). */
  enabled?: boolean;
  /** Debounce window for idle saves. Default: 3 000 ms. */
  idleDelayMs?: number;
  /** Hard cap between two consecutive saves. Default: 30 000 ms. */
  maxIntervalMs?: number;
  /** Equality check — skip saves when value is unchanged. */
  equals?: (a: T, b: T) => boolean;
}

export interface UseAutoSaveResult {
  status: AutoSaveStatus;
  /** Last successful save timestamp (ISO). */
  lastSavedAt: string | null;
  /** Force an immediate save (e.g. from Ctrl+S / Save Draft button). */
  flush: () => Promise<void>;
}

const defaultEquals = <T,>(a: T, b: T) => a === b;

export const useAutoSave = <T,>({
  value,
  onSave,
  enabled = true,
  idleDelayMs = 3000,
  maxIntervalMs = 30000,
  equals = defaultEquals,
}: UseAutoSaveOptions<T>): UseAutoSaveResult => {
  const [status, setStatus] = useState<AutoSaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const valueRef = useRef(value);
  const lastSavedValueRef = useRef(value);
  const idleTimerRef = useRef<number | null>(null);
  const intervalTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  const clearTimers = () => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      window.clearTimeout(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  };

  const runSave = useCallback(async () => {
    if (inFlightRef.current) return;
    const v = valueRef.current;
    if (equals(v, lastSavedValueRef.current)) {
      setStatus("saved");
      return;
    }
    inFlightRef.current = true;
    setStatus("saving");
    try {
      await onSave(v);
      lastSavedValueRef.current = v;
      setLastSavedAt(new Date().toISOString());
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [equals, onSave]);

  /* Track the latest value in a ref so timers always read fresh state. */
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  /* Schedule saves whenever `value` changes. */
  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }
    if (equals(value, lastSavedValueRef.current)) return;

    setStatus("dirty");

    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      void runSave();
    }, idleDelayMs);

    // Cap maximum gap between saves (only set if not already pending).
    if (!intervalTimerRef.current) {
      intervalTimerRef.current = window.setTimeout(() => {
        intervalTimerRef.current = null;
        void runSave();
      }, maxIntervalMs);
    }

    return () => {
      // Cleanup happens on next change — handled lazily by the next effect run.
    };
  }, [value, enabled, equals, idleDelayMs, maxIntervalMs, runSave]);

  /* Cleanup on unmount. */
  useEffect(() => () => clearTimers(), []);

  /* Reset lastSavedValueRef when enabled flips off (so re-enter is "clean"). */
  useEffect(() => {
    if (!enabled) {
      lastSavedValueRef.current = valueRef.current;
      setStatus("saved");
    }
  }, [enabled]);

  const flush = useCallback(async () => {
    clearTimers();
    await runSave();
  }, [runSave]);

  return { status, lastSavedAt, flush };
};
