import { MessageOutlined } from "@ant-design/icons";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "@components/feedback/EmptyState";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setActiveConversation } from "@redux/slices/chatSlice";
import { useListConversationsQuery } from "@services/baseApi";

import { ChatWindow } from "./components/ChatWindow";
import { ConversationList } from "./components/ConversationList";

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.chat.activeConversationId);

  const { data: conversations = [], isLoading } = useListConversationsQuery();

  // Pick a default active conversation when none is in the URL.
  useEffect(() => {
    if (!conversationId && conversations.length > 0 && !activeId) {
      dispatch(setActiveConversation(conversations[0].id));
    }
    if (conversationId && conversationId !== activeId) {
      dispatch(setActiveConversation(conversationId));
    }
  }, [conversationId, conversations, activeId, dispatch]);

  const active = useMemo(
    () =>
      conversations.find(
        (c) => c.id === (conversationId ?? activeId ?? conversations[0]?.id),
      ),
    [conversations, conversationId, activeId],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Messages"
        title="Crew chatter"
        subtitle="Real-time conversations with applicants and current crew."
      />

      <GlassPanel padding="none" className="overflow-hidden">
        <div className="grid h-[calc(100vh-260px)] min-h-[480px] grid-cols-1 md:grid-cols-[320px_1fr]">
          <div className="hidden border-r border-white/10 md:flex">
            <ConversationList
              conversations={conversations}
              activeId={active?.id ?? null}
              onSelect={(id) => {
                dispatch(setActiveConversation(id));
                navigate(`/messages/${id}`);
              }}
            />
          </div>

          {isLoading ? (
            <div className="muted grid place-items-center text-sm">
              Loading conversations…
            </div>
          ) : active ? (
            <ChatWindow conversation={active} />
          ) : (
            <EmptyState
              icon={<MessageOutlined />}
              title="No conversations yet"
              description="Reach out from a crew profile to start a conversation."
            />
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default MessagesPage;
