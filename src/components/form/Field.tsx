import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface Props {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Form field wrapper used across the admin UI.
 *
 * Uppercase label + optional hint on the right; error replaces the hint and
 * renders in danger tone underneath. Matches the dark minimal palette so it
 * looks at home inside `AuthCard` and the admin pages.
 */
export const Field = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: Props) => (
  <label htmlFor={htmlFor} className={cn("block space-y-1.5", className)}>
    <div className="flex items-center justify-between">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-grey-400">
        {label}
        {required && <span className="ml-0.5 text-teal-300">*</span>}
      </span>
      {hint && !error && (
        <span className="text-[11px] text-grey-500">{hint}</span>
      )}
    </div>
    {children}
    {error && <p className="text-[11.5px] text-[#C24545]">{error}</p>}
  </label>
);
