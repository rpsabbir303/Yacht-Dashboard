import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "@utils/cn";

interface Props {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
}

/**
 * Six-box OTP input with auto-advance, backspace navigation, paste support, and
 * `onComplete` callback when the user fills the final box. Visually styled to
 * match the dark admin theme — teal focus ring, danger ring when invalid.
 *
 * The component is fully controlled: callers own the string and re-render on
 * every keystroke. This keeps the input safe to embed inside react-hook-form.
 */
export const OtpInput = ({
  value,
  onChange,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  onComplete,
}: Props) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const writeAt = (idx: number, digit: string) => {
    const chars = value.split("");
    while (chars.length < length) chars.push("");
    chars[idx] = digit;
    const next = chars.join("").slice(0, length);
    onChange(next);
    if (next.length === length && next.replace(/\s/g, "").length === length) {
      onComplete?.(next);
    }
    return next;
  };

  const handleChange = (idx: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      const chars = value.split("");
      chars[idx] = "";
      onChange(chars.join(""));
      return;
    }
    writeAt(idx, digit);
    const nextIdx = Math.min(idx + 1, length - 1);
    inputsRef.current[nextIdx]?.focus();
    inputsRef.current[nextIdx]?.select();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    const current = value[idx] ?? "";
    if (e.key === "Backspace") {
      e.preventDefault();
      if (current) {
        writeAt(idx, "");
      } else if (idx > 0) {
        writeAt(idx - 1, "");
        inputsRef.current[idx - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputsRef.current[idx - 1]?.focus();
      return;
    }
    if (e.key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = text.slice(0, length).padEnd(value.length, "");
    onChange(next.slice(0, length));
    const focusIdx = Math.min(next.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
    if (next.length >= length) onComplete?.(next.slice(0, length));
  };

  return (
    <div className="flex w-full justify-between gap-2 sm:gap-3">
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] ?? "";
        return (
          <input
            key={idx}
            ref={(node) => {
              inputsRef.current[idx] = node;
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={char}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={`Digit ${idx + 1}`}
            className={cn(
              "h-14 w-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-center text-[22px] font-semibold tracking-tight text-white outline-none transition",
              "focus:border-teal-500/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-teal-500/20",
              "sm:h-[60px] sm:w-[54px] sm:text-[24px]",
              invalid &&
                "border-[#AA2727]/60 ring-2 ring-[#AA2727]/15 focus:ring-[#AA2727]/20",
              disabled && "cursor-not-allowed opacity-60",
            )}
          />
        );
      })}
    </div>
  );
};
