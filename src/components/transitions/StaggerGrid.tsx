import { Children, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface Props extends HTMLMotionProps<"div"> {
  children: ReactNode;
  /** Delay each child relative to the previous one (seconds). */
  stagger?: number;
  /** Delay the first child by this much after the wrapper mounts. */
  initialDelay?: number;
  /** Per-child enter duration (seconds). */
  duration?: number;
  /** Vertical offset (px) the children translate from. */
  offset?: number;
}

/**
 * Light vertical-stagger container.
 *
 * Each direct child mounts with a small `(opacity: 0, y: offset) → (1, 0)`
 * transition; the wrapper handles staggering via Framer Motion variants. Drop
 * it around a grid/flex row to give the row a perceived sense of arrival.
 *
 * The component is intentionally subtle (offset 8px, ≤200ms per child, stagger
 * 40–60ms) so dashboards never feel "animated". It composes cleanly with
 * `PageTransition` because the page-level fade and the per-tile slide use the
 * same easing curve and roughly the same window.
 */
const EASE = [0.4, 0, 0.2, 1] as const;

export const StaggerGrid = ({
  children,
  stagger = 0.05,
  initialDelay = 0.04,
  duration = 0.22,
  offset = 8,
  ...rest
}: Props) => (
  <motion.div
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
          delayChildren: initialDelay,
        },
      },
    }}
    initial="hidden"
    animate="visible"
    {...rest}
  >
    {Children.map(children, (child, idx) => (
      <motion.div
        key={idx}
        variants={{
          hidden: { opacity: 0, y: offset },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration, ease: EASE }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);
