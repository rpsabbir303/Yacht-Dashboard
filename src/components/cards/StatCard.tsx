import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface Props {
  label: string;
  value: number | string;
  icon: ReactNode;
  /** % change vs previous period. Positive=up, negative=down. */
  delta?: number;
  hint?: string;
  loading?: boolean;
}

/**
 * Minimal stat card.
 * - Flat surface, 24px radius, hairline border.
 * - One subtle icon chip (no gradients, no glow).
 * - Delta is positive/negative coloured only — never decorative.
 */
export const StatCard = ({ label, value, icon, delta, hint, loading }: Props) => {
  const hasDelta = typeof delta === "number";
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-card glass-card-hover p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="eyebrow">{label}</div>
          <div className="mt-3 text-[32px] font-semibold leading-none tracking-tighter2 text-white">
            {loading ? (
              <span className="inline-block h-7 w-20 animate-shimmer rounded bg-white/5" />
            ) : (
              value
            )}
          </div>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-[15px] text-grey-400">
          {icon}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between text-[12px]">
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              positive ? "text-teal-400" : "text-[#C24545]",
            )}
          >
            {positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(delta!)}%
          </span>
        ) : (
          <span />
        )}
        {hint && <span className="text-grey-500">{hint}</span>}
      </div>
    </motion.div>
  );
};
