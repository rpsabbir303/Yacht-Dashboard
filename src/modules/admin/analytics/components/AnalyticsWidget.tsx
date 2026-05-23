import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface Props {
  title: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Single chart/widget container — uses the canonical surface-card styling
 * and keeps spacing consistent across the analytics page.
 */
export const AnalyticsWidget = ({ title, hint, className, children }: Props) => (
  <section className={cn("surface-card p-6", className)}>
    <header className="mb-5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {hint ?? "Snapshot"}
      </div>
      <h3 className="mt-1 text-[15px] font-semibold text-white">{title}</h3>
    </header>
    {children}
  </section>
);

export const KpiRow = ({
  items,
}: {
  items: { label: string; value: string | number; tone?: "white" | "teal" | "gold" | "danger" }[];
}) => (
  <div className="grid grid-cols-3 gap-3">
    {items.map((it) => (
      <div
        key={it.label}
        className="rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3"
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
          {it.label}
        </div>
        <div
          className={cn(
            "mt-1 text-xl font-semibold tracking-tighter2",
            it.tone === "teal" && "text-teal-300",
            it.tone === "gold" && "text-gold-400",
            it.tone === "danger" && "text-[#C24545]",
            (!it.tone || it.tone === "white") && "text-white",
          )}
        >
          {it.value}
        </div>
      </div>
    ))}
  </div>
);
