import { useCallback, useRef } from "react";

import { useSocket } from "@socket/SocketProvider";

/**
 * Emits a typing event throttled so we don't spam the socket every keystroke.
 * Also automatically emits `isTyping=false` after `idleMs` of silence.
 */
export const useTypingIndicator = (conversationId: string | null, idleMs = 1500) => {
  const { emitTyping } = useSocket();
  const lastEmitRef = useRef<number>(0);
  const idleTimerRef = useRef<number | null>(null);
  const typingRef = useRef<boolean>(false);

  const onType = useCallback(() => {
    if (!conversationId) return;
    const now = Date.now();

    if (!typingRef.current || now - lastEmitRef.current > 2_000) {
      emitTyping(conversationId, true);
      typingRef.current = true;
      lastEmitRef.current = now;
    }

    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      emitTyping(conversationId, false);
      typingRef.current = false;
    }, idleMs);
  }, [conversationId, emitTyping, idleMs]);

  return { onType };
};
