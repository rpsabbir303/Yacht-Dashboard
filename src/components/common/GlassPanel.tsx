import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@utils/cn";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Internal padding. */
  padding?: "none" | "sm" | "md" | "lg";
}

const PAD = {
  none: "p-0",
  sm: "p-5",
  md: "p-6",
  lg: "p-7 sm:p-8",
};

/**
 * Minimal surface panel — 24px radius, generous padding, hairline border.
 * Header (title/subtitle/action) is optional and sits above a thin divider.
 */
export const GlassPanel = ({
  title,
  subtitle,
  action,
  padding = "md",
  className,
  children,
  ...rest
}: Props) => (
  <section className={cn("surface-card", PAD[padding], className)} {...rest}>
    {(title || action || subtitle) && (
      <header className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && (
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-[12.5px] text-grey-400">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);
