import { PaperClipOutlined, SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Input } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@components/feedback/EmptyState";
import { useTypingIndicator } from "@hooks/useTypingIndicator";
import { useAppSelector } from "@redux/hooks";
import {
  useListMessagesQuery,
  useSendMessageMutation,
} from "@services/baseApi";
import { initials } from "@utils/format";
import type { Conversation } from "@/types";

import { MessageBubble } from "./MessageBubble";
import { TypingDots } from "./TypingDots";

interface Props {
  conversation: Conversation;
}

export const ChatWindow = ({ conversation }: Props) => {
  const me = useAppSelector((s) => s.auth.user);
  const typingMap = useAppSelector((s) => s.chat.typing);
  const optimistic = useAppSelector(
    (s) => s.chat.optimisticMessages[conversation.id] ?? [],
  );

  const { data: messages = [], isFetching } = useListMessagesQuery(
    conversation.id,
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const { onType } = useTypingIndicator(conversation.id);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const main = conversation.participants[0];
  const typingUsers = typingMap[conversation.id] ?? [];
  const otherTyping = typingUsers.filter((u) => u !== me?.id);

  const merged = useMemo(
    () => [...messages, ...optimistic],
    [messages, optimistic],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [merged.length, otherTyping.length]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      await sendMessage({ conversationId: conversation.id, text }).unwrap();
    } catch {
      // Optimistic UI would re-queue here.
    }
  };

  return (
    <section className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Badge
            dot={!!main?.online}
            color="#34d399"
            offset={[-4, 30]}
            status={main?.online ? "success" : "default"}
          >
            <Avatar size={40} src={main?.avatarUrl}>
              {initials(main?.name ?? "U")}
            </Avatar>
          </Badge>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {main?.name}
            </div>
            <div className="muted text-xs">
              {main?.online ? "Online" : "Offline"}
              {main?.role && ` · ${main.role}`}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {isFetching && merged.length === 0 ? (
          <div className="muted text-center text-sm">Loading…</div>
        ) : merged.length === 0 ? (
          <EmptyState
            icon={<SmileOutlined />}
            title="No messages yet"
            description="Break the ice — say hello to start the conversation."
          />
        ) : (
          merged.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              outgoing={m.senderId === me?.id}
            />
          ))
        )}
        {otherTyping.length > 0 && <TypingDots name={main?.name} />}
      </div>

      {/* Composer */}
      <footer className="border-t border-white/10 p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <Button
            shape="circle"
            icon={<PaperClipOutlined />}
            className="!flex-shrink-0"
          />
          <Input.TextArea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onType();
            }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`Message ${main?.name ?? ""}…`}
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="!rounded-2xl"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={submit}
            loading={sending}
            disabled={!draft.trim()}
            className="!flex-shrink-0 !rounded-2xl !shadow-glow"
          >
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </footer>
    </section>
  );
};
