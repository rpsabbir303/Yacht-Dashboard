/**
 * Centralised list of socket events used across the app.
 * Keeping them in one place avoids typos and makes it trivial to grep usages.
 */
import type {
  AppNotification,
  ChatMessage,
  PresencePayload,
  TypingPayload,
} from "@/types";

export const SocketEvents = {
  connect: "connect",
  disconnect: "disconnect",
  reconnect_attempt: "reconnect_attempt",

  // chat
  messageNew: "message:new",
  messageSeen: "message:seen",
  typing: "chat:typing",
  presence: "presence:update",
  sendMessage: "message:send",

  // notifications
  notificationNew: "notification:new",
} as const;

export interface ServerToClientEvents {
  [SocketEvents.messageNew]: (message: ChatMessage) => void;
  [SocketEvents.messageSeen]: (payload: {
    conversationId: string;
    messageId: string;
  }) => void;
  [SocketEvents.typing]: (payload: TypingPayload) => void;
  [SocketEvents.presence]: (payload: PresencePayload) => void;
  [SocketEvents.notificationNew]: (notification: AppNotification) => void;
}

export interface ClientToServerEvents {
  [SocketEvents.sendMessage]: (payload: {
    conversationId: string;
    text: string;
  }) => void;
  [SocketEvents.typing]: (payload: TypingPayload) => void;
}
