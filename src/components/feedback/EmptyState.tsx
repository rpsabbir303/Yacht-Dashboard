import { Button } from "antd";
import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Custom action node — used when the simple actionLabel/onAction API isn't enough. */
  action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
}: Props) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    {icon && (
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-[18px] text-grey-500">
        {icon}
      </div>
    )}
    <h3 className="text-[15px] font-semibold text-white">{title}</h3>
    {description && (
      <p className="max-w-sm text-[13px] leading-relaxed text-grey-400">
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <Button type="primary" onClick={onAction} className="mt-3">
        {actionLabel}
      </Button>
    )}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
