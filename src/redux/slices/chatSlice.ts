import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  ChatMessage,
  ID,
  PresencePayload,
  TypingPayload,
} from "@/types";

interface ChatState {
  activeConversationId: ID | null;
  typing: Record<ID, ID[]>; // conversationId -> userIds currently typing
  presence: Record<ID, { online: boolean; lastSeenAt?: string }>;
  optimisticMessages: Record<ID, ChatMessage[]>; // conversationId -> queued messages
}

const initialState: ChatState = {
  activeConversationId: null,
  typing: {},
  presence: {},
  optimisticMessages: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<ID | null>) => {
      state.activeConversationId = action.payload;
    },
    setTyping: (state, action: PayloadAction<TypingPayload>) => {
      const { conversationId, userId, isTyping } = action.payload;
      const list = state.typing[conversationId] ?? [];
      if (isTyping && !list.includes(userId)) {
        state.typing[conversationId] = [...list, userId];
      } else if (!isTyping) {
        state.typing[conversationId] = list.filter((u) => u !== userId);
      }
    },
    setPresence: (state, action: PayloadAction<PresencePayload>) => {
      state.presence[action.payload.userId] = {
        online: action.payload.online,
        lastSeenAt: action.payload.lastSeenAt,
      };
    },
    enqueueOptimistic: (
      state,
      action: PayloadAction<{ conversationId: ID; message: ChatMessage }>,
    ) => {
      const { conversationId, message } = action.payload;
      state.optimisticMessages[conversationId] = [
        ...(state.optimisticMessages[conversationId] ?? []),
        message,
      ];
    },
    clearOptimistic: (state, action: PayloadAction<ID>) => {
      delete state.optimisticMessages[action.payload];
    },
  },
});

export const {
  setActiveConversation,
  setTyping,
  setPresence,
  enqueueOptimistic,
  clearOptimistic,
} = chatSlice.actions;

export default chatSlice.reducer;
