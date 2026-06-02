import { Link } from "react-router-dom";

import { cn } from "@utils/cn";

interface Props {
  collapsed?: boolean;
  className?: string;
}

/**
 * Admin console wordmark — same minimal style as the consumer brandmark but
 * with an "Admin" eyebrow to make the surface unmistakable.
 */
export const AdminBrandMark = ({ collapsed, className }: Props) => (
  <Link
    to="/admin"
    aria-label="Admin console home"
    className={cn(
      "group inline-flex items-center gap-3 outline-none focus-visible:ring-1 focus-visible:ring-teal-500/40",
      className,
    )}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className="shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="20"
        height="20"
        rx="6"
        stroke="rgba(255,255,255,0.08)"
      />
      <path
        d="M6 14l4-8 1.5 4 1.5-3 3 7"
        stroke="#22C7B8"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
    {!collapsed && (
      <div className="leading-none">
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">
          Admin
        </div>
        <div className="mt-1 text-[13.5px] font-semibold tracking-tight text-white">
          Meridian Console
        </div>
      </div>
    )}
  </Link>
);
