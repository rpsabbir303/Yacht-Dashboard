import { CheckOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/**
 * Reusable success screen used by the reset-password completion step. The teal
 * ring uses two stacked layers (a static halo + an animated pop) so it lands
 * with the same restrained, premium feel as the rest of the dashboard.
 */
export const SuccessState = ({ title, description, action }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className="w-full max-w-[440px] text-center"
  >
    <div className="relative mx-auto grid h-20 w-20 place-items-center">
      <span className="absolute inset-0 rounded-full bg-teal-500/[0.08]" />
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-teal-500 text-[26px] text-ink"
      >
        <CheckOutlined />
      </motion.span>
    </div>

    <h1 className="mt-7 text-[26px] font-semibold leading-[1.15] tracking-tighter2 text-white">
      {title}
    </h1>
    {description && (
      <div className="muted mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed">
        {description}
      </div>
    )}
    {action && <div className="mt-8">{action}</div>}
  </motion.div>
);
