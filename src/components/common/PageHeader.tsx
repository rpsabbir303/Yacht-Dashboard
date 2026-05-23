import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: Props) => (
  <div
    className={cn(
      "mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
      className,
    )}
  >
    <div className="min-w-0">
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="display-xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-grey-400">
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);
