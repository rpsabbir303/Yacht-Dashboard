import { useEffect, useState } from "react";

interface Options {
  /** ISO timestamp of when the OTP was issued. */
  startedAt: string | null;
  /** Lifetime of the OTP, in seconds. */
  expiresInSec: number | null;
}

interface Result {
  /** Seconds remaining (>= 0). */
  remaining: number;
  /** Formatted MM:SS. */
  formatted: string;
  /** True once the timer has finished. */
  expired: boolean;
  /** True while the timer is actively counting down. */
  running: boolean;
}

/**
 * Countdown hook for the OTP screen. Re-renders every 250ms while running so
 * the display ticks smoothly, then settles into the expired state.
 *
 * Pure read-side hook — the underlying flow state lives in Redux and is not
 * mutated here. `startedAt`/`expiresInSec` may be null while the flow is being
 * hydrated, in which case the hook returns a stable "not started" reading.
 */
export const useOtpCountdown = ({
  startedAt,
  expiresInSec,
}: Options): Result => {
  const endTs =
    startedAt && expiresInSec
      ? new Date(startedAt).getTime() + expiresInSec * 1000
      : null;

  const compute = () => {
    if (!endTs) return 0;
    return Math.max(0, Math.ceil((endTs - Date.now()) / 1000));
  };

  const [remaining, setRemaining] = useState<number>(compute);

  useEffect(() => {
    setRemaining(compute());
    if (!endTs) return undefined;
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((endTs - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTs]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return {
    remaining,
    formatted,
    expired: !!endTs && remaining === 0,
    running: !!endTs && remaining > 0,
  };
};
