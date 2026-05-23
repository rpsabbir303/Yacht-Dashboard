import { Link } from "react-router-dom";

import { cn } from "@utils/cn";

interface Props {
  collapsed?: boolean;
  className?: string;
  /** Smaller variant for embedded headers (login, 404). */
  size?: "default" | "lg";
}

/**
 * Minimal wordmark — a single line glyph + name. No gradients.
 * The mark is rendered in white with a 1px teal accent stroke at the base
 * to signal the brand without shouting.
 */
export const BrandMark = ({
  collapsed = false,
  className,
  size = "default",
}: Props) => {
  const dim = size === "lg" ? "h-10 w-10" : "h-9 w-9";

  return (
    <Link
      to="/dashboard"
      className={cn(
        "group inline-flex select-none items-center gap-3",
        className,
      )}
    >
      <span
        className={cn(
          dim,
          "relative grid place-items-center rounded-xl border border-white/[0.06] bg-surface",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] text-white"
          aria-hidden
        >
          <path
            d="M12 4 L12 15 L6 15 Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M13 5 L18 15 L13 15 Z"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M4 18 H20"
            stroke="#14B8A6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-semibold tracking-tight text-white",
              size === "lg" ? "text-lg" : "text-[15px]",
            )}
          >
            Helm
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-grey-500">
            Yacht Crew
          </span>
        </span>
      )}
    </Link>
  );
};
