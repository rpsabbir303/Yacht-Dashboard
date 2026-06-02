import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Page-level transition for routed content inside `AdminLayout`.
 *
 * - Uses `AnimatePresence` in `wait` mode so the outgoing page fades out fully
 *   before the new one fades in — that way the layout never shows two pages
 *   stacked, which would shift scroll position and cause flicker.
 * - The motion key is the pathname, so React re-mounts the wrapper on every
 *   route change. The first paint after mount intentionally skips the enter
 *   animation (`initial={false}`) — only navigations animate.
 * - Timing is held inside the 0.2–0.35s window the design system uses for
 *   route-level motion (≈0.30s total: 0.12 exit + 0.18 enter).
 *
 * Subtle by design — fade + 6px translate, nothing more — so it composes with
 * per-section `StaggerGrid` motion without feeling animated-on-top-of-animated.
 */
const EASE = [0.4, 0, 0.2, 1] as const;

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          opacity: { duration: 0.22, ease: EASE },
          y: { duration: 0.22, ease: EASE },
          exit: { duration: 0.12 },
        }}
        className="min-h-full w-full min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
