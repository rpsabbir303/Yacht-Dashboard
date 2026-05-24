import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared "card" used by every auth page so spacing, typography and entry
 * animation stay consistent. The wrapping `AuthLayout` controls width/position;
 * this just nails the inner rhythm.
 */
export const AuthCard = ({
  eyebrow,
  title,
  description,
  children,
  footer,
}: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="w-full max-w-[440px]"
  >
    {eyebrow && <div className="eyebrow">{eyebrow}</div>}
    <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tighter2 text-white">
      {title}
    </h1>
    {description && (
      <div className="muted mt-2 text-[13.5px] leading-relaxed">
        {description}
      </div>
    )}

    <div className="mt-8 space-y-5">{children}</div>

    {footer && (
      <div className="mt-8 border-t border-white/[0.05] pt-5 text-[12.5px] text-grey-400">
        {footer}
      </div>
    )}
  </motion.div>
);
