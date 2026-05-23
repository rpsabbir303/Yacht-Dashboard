import { ArrowRightOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  hint?: string;
  onClick?: () => void;
}

/**
 * Minimal action tile — single neutral surface, single accent on hover.
 */
export const QuickActionTile = ({ icon, label, hint, onClick }: Props) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 text-left transition hover:border-white/[0.12] hover:bg-white/[0.03]"
  >
    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-[15px] text-grey-400 transition group-hover:text-teal-300">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <div className="truncate text-[13px] font-medium text-white">{label}</div>
      {hint && (
        <div className="mt-0.5 truncate text-[11.5px] text-grey-500">
          {hint}
        </div>
      )}
    </div>
    <ArrowRightOutlined className="text-[11px] text-grey-500 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-300" />
  </button>
);
