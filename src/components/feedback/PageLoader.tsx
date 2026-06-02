import { motion } from "framer-motion";

export const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
        <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-teal-500" />
      </div>
      <span className="text-[10px] uppercase tracking-[0.28em] text-grey-500">
        Loading
      </span>
    </motion.div>
  </div>
);
