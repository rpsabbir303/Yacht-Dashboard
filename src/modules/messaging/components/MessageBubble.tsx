import { CheckOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

import { cn } from "@utils/cn";
import { formatDateTime } from "@utils/format";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
  outgoing: boolean;
}

export const MessageBubble = ({ message, outgoing }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "flex w-full",
        outgoing ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5",
          outgoing
            ? "rounded-br-sm bg-teal-500 text-[#06241f]"
            : "rounded-bl-sm border border-white/[0.05] bg-white/[0.03] text-white",
        )}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.text}
        </div>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            outgoing ? "text-[#06241f]/70" : "text-grey-500",
          )}
        >
          {formatDateTime(message.createdAt)}
          {outgoing && (
            <span className="flex items-center">
              <CheckOutlined />
              {(message.status === "delivered" ||
                message.status === "seen") && <CheckOutlined />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
