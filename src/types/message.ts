import type { ID, ISODateString } from "./common";

export type MessageStatus = "sending" | "sent" | "delivered" | "seen" | "failed";

export interface ChatParticipant {
  id: ID;
  name: string;
  avatarUrl?: string;
  role: string;
  online?: boolean;
  lastSeenAt?: ISODateString;
}

export interface ChatMessage {
  id: ID;
  conversationId: ID;
  senderId: ID;
  text: string;
  createdAt: ISODateString;
  status: MessageStatus;
  attachments?: { url: string; name: string; size?: number }[];
}

export interface Conversation {
  id: ID;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinned?: boolean;
  jobId?: ID;
  updatedAt: ISODateString;
}

export type TypingPayload = {
  conversationId: ID;
  userId: ID;
  isTyping: boolean;
};

export type PresencePayload = {
  userId: ID;
  online: boolean;
  lastSeenAt?: ISODateString;
};
