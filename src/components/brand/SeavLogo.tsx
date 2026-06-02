import { cn } from "@utils/cn";

export type SeavLogoVariant = "full" | "compact";

interface SeavLogoProps {
  /** Full wordmark or compact monogram for narrow shells (e.g. collapsed sidebar). */
  variant?: SeavLogoVariant;
  /** Rendered height in pixels; width scales from the SVG aspect ratio. */
  height?: number;
  className?: string;
  /** Accessible label for screen readers. */
  label?: string;
}

const FULL_VIEWBOX_WIDTH = 168;
const FULL_VIEWBOX_HEIGHT = 44;
const COMPACT_VIEWBOX_SIZE = 40;

/**
 * SEAV brand mark.
 * - `full`: wordmark (SEA + teal V + accent bar) for expanded layouts.
 * - `compact`: SV monogram for collapsed sidebar — never clips at 76px width.
 */
export const SeavLogo = ({
  variant = "full",
  height = 28,
  className,
  label = "SEAV",
}: SeavLogoProps) => {
  if (variant === "compact") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${COMPACT_VIEWBOX_SIZE} ${COMPACT_VIEWBOX_SIZE}`}
        width={height}
        height={height}
        fill="none"
        role="img"
        aria-label={label}
        className={cn("shrink-0", className)}
      >
        <title>{label}</title>
        <text
          x="50%"
          y="26"
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontSize="22"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          <tspan fill="#FFFFFF">S</tspan>
          <tspan fill="#22C7B8">V</tspan>
        </text>
        <rect
          x="14"
          y="30"
          width="12"
          height="2.5"
          rx="1.25"
          fill="#22C7B8"
        />
      </svg>
    );
  }

  const width = Math.round((height / FULL_VIEWBOX_HEIGHT) * FULL_VIEWBOX_WIDTH);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${FULL_VIEWBOX_WIDTH} ${FULL_VIEWBOX_HEIGHT}`}
      width={width}
      height={height}
      fill="none"
      role="img"
      aria-label={label}
      className={cn("shrink-0", className)}
    >
      <title>{label}</title>
      <text
        x="0"
        y="32"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="36"
        fontWeight="600"
        letterSpacing="0.2em"
      >
        <tspan fill="#FFFFFF">SEA</tspan>
        <tspan fill="#22C7B8">V</tspan>
      </text>
      <rect x="54" y="36" width="16" height="2.5" rx="1.25" fill="#22C7B8" />
    </svg>
  );
};

export default SeavLogo;
