import {
  BellOutlined,
  CalendarOutlined,
  CheckOutlined,
  FileSearchOutlined,
  MessageOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Segmented } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "@components/feedback/EmptyState";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { useAppSelector } from "@redux/hooks";
import {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@services/baseApi";
import { fromNow } from "@utils/format";
import { cn } from "@utils/cn";
import type { AppNotification, NotificationCategory } from "@/types";

const CATEGORY_META: Record<
  NotificationCategory,
  { icon: React.ReactNode; color: string; label: string }
> = {
  application: {
    icon: <TeamOutlined />,
    color: "text-ocean-300",
    label: "Applications",
  },
  message: {
    icon: <MessageOutlined />,
    color: "text-emerald-300",
    label: "Messages",
  },
  interview: {
    icon: <CalendarOutlined />,
    color: "text-gold-400",
    label: "Interviews",
  },
  job: {
    icon: <FileSearchOutlined />,
    color: "text-cyan-300",
    label: "Jobs",
  },
  system: {
    icon: <SafetyOutlined />,
    color: "text-slate-300",
    label: "System",
  },
};

type Filter = "all" | NotificationCategory | "unread";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { data: serverItems = [] } = useListNotificationsQuery();
  const realtime = useAppSelector((s) => s.notifications.realtime);
  const [markRead] = useMarkNotificationReadMutation();
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo<AppNotification[]>(
    () =>
      [...realtime, ...serverItems].filter(
        (n, idx, arr) => arr.findIndex((x) => x.id === n.id) === idx,
      ),
    [realtime, serverItems],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.category === filter);
  }, [items, filter]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle={`${unread} unread`}
        actions={
          unread > 0 ? (
            <Button
              icon={<CheckOutlined />}
              onClick={() => markRead()}
              className="!rounded-xl"
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Segmented
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        options={[
          { label: `All (${items.length})`, value: "all" },
          { label: `Unread (${unread})`, value: "unread" },
          { label: "Applications", value: "application" },
          { label: "Messages", value: "message" },
          { label: "Interviews", value: "interview" },
          { label: "Jobs", value: "job" },
          { label: "System", value: "system" },
        ]}
      />

      <GlassPanel padding="sm">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BellOutlined />}
            title="You're all caught up"
            description="New notifications will appear here in real-time."
          />
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((n) => {
              const meta = CATEGORY_META[n.category];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      if (n.actionUrl) navigate(n.actionUrl);
                    }}
                    className={cn(
                      "flex w-full items-start gap-4 px-4 py-4 text-left transition hover:bg-white/[0.03]",
                      !n.read && "bg-ocean-500/[0.05]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10",
                        meta.color,
                      )}
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-ocean-400" />
                        )}
                        <span className="ml-auto text-[11px] text-slate-400">
                          {fromNow(n.createdAt)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="mt-1 text-sm text-slate-300/80">
                          {n.body}
                        </p>
                      )}
                      <span className="mt-1 inline-block text-[11px] uppercase tracking-wider text-slate-400">
                        {meta.label}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
};

export default NotificationsPage;
