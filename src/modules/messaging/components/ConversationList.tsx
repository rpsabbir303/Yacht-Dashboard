import { PushpinFilled, SearchOutlined } from "@ant-design/icons";
import { Avatar, Badge, Input } from "antd";
import { useMemo, useState } from "react";

import { cn } from "@utils/cn";
import { fromNow, initials, truncate } from "@utils/format";
import type { Conversation, ID } from "@/types";

interface Props {
  conversations: Conversation[];
  activeId: ID | null;
  onSelect: (id: ID) => void;
}

export const ConversationList = ({
  conversations,
  activeId,
  onSelect,
}: Props) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = [...conversations].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((c) =>
      c.participants.some((p) => p.name.toLowerCase().includes(q)),
    );
  }, [conversations, query]);

  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-white/10 p-3">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="!rounded-xl"
        />
      </div>

      <ul className="scrollbar-thin flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const main = c.participants[0];
          const isActive = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/[0.04]",
                  isActive && "bg-ocean-500/[0.10]",
                )}
              >
                <Badge
                  dot={!!main?.online}
                  offset={[-4, 36]}
                  color="#34d399"
                  status={main?.online ? "success" : "default"}
                >
                  <Avatar src={main?.avatarUrl} size={44}>
                    {initials(main?.name ?? "U")}
                  </Avatar>
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 truncate text-sm font-medium text-white">
                      {c.pinned && (
                        <PushpinFilled className="text-gold-400 text-[10px]" />
                      )}
                      {main?.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {c.lastMessage && fromNow(c.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-300/80">
                      {c.lastMessage
                        ? truncate(c.lastMessage.text, 50)
                        : "No messages yet"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="rounded-full bg-ocean-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="muted mt-0.5 text-[11px]">{main?.role}</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
