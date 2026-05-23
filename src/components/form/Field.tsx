import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface Props {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export const Field = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: Props) => (
  <label
    htmlFor={htmlFor}
    className={cn("block space-y-1.5", className)}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-300/80">
        {label}
        {required && <span className="ml-0.5 text-ocean-300">*</span>}
      </span>
      {hint && !error && (
        <span className="text-[11px] text-slate-400">{hint}</span>
      )}
    </div>
    {children}
    {error && <p className="text-xs text-rose-400">{error}</p>}
  </label>
);
