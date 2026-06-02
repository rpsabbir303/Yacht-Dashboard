import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  NotificationOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Segmented, Tooltip, message } from "antd";
import { useMemo, useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { EmptyState } from "@components/feedback/EmptyState";
import { CardSkeleton } from "@components/feedback/LoadingSkeleton";
import { useConfirm } from "@hooks/useConfirm";
import {
  useDeleteAnnouncementMutation,
  useListAnnouncementsQuery,
} from "@services/adminApi";
import { formatDateTime, fromNow } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  Announcement,
  AnnouncementChannel,
  AnnouncementStatus,
} from "@/types";

import { SendNotificationModal } from "./SendNotificationModal";

const AUDIENCE_LABEL: Record<Announcement["audience"], string> = {
  all: "All users",
  crew: "Crew",
  "owners-captains": "Owners & Captains",
  agents: "Agents",
};

const CHANNEL_ICON: Record<AnnouncementChannel, React.ReactNode> = {
  "in-app": <BellOutlined />,
  email: <MailOutlined />,
  push: <NotificationOutlined />,
};

const CHANNEL_LABEL: Record<AnnouncementChannel, string> = {
  "in-app": "In-app",
  email: "Email",
  push: "Push",
};

type Filter = "all" | AnnouncementStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Drafts", value: "draft" },
];

export const NotificationsPage = () => {
  const { data, isLoading } = useListAnnouncementsQuery();
  const [del] = useDeleteAnnouncementMutation();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const list = data ?? [];
    return filter === "all" ? list : list.filter((a) => a.status === filter);
  }, [data, filter]);

  const handleDelete = async (a: Announcement) => {
    const ok = await confirm({
      title: `Delete "${a.title}"?`,
      description:
        a.status === "sent"
          ? "It will be removed from history. Already-delivered messages won't be recalled."
          : "This notification will be permanently deleted.",
      danger: true,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await del(a.id).unwrap();
      message.success("Notification deleted");
    } catch {
      message.error("Action failed");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Notifications & announcements"
        subtitle="Send platform-wide messages by role and channel. Schedule in advance or send immediately."
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            New notification
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={FILTERS}
        />
        <div className="text-[12px] text-grey-500">
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>
      ) : items.length === 0 ? (
        <GlassPanel padding="lg">
          <EmptyState
            title="No notifications yet"
            description="Send your first announcement to all users or a specific audience."
            action={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpen(true)}
              >
                New notification
              </Button>
            }
          />
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Row key={a.id} a={a} onDelete={() => handleDelete(a)} />
          ))}
        </div>
      )}

      <SendNotificationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

const Row = ({ a, onDelete }: { a: Announcement; onDelete: () => void }) => {
  const statusBadge =
    a.status === "sent" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] text-teal-300 ring-1 ring-teal-500/20">
        <CheckCircleOutlined /> Sent
      </span>
    ) : a.status === "scheduled" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-400 ring-1 ring-gold-500/20">
        <ClockCircleOutlined /> Scheduled
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-grey-400 ring-1 ring-white/[0.08]">
        <EditOutlined /> Draft
      </span>
    );

  return (
    <article className="surface-card flex flex-col gap-3 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-white">{a.title}</h3>
          {statusBadge}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-grey-400">
          {a.body}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-grey-500">
          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-grey-400">
            {AUDIENCE_LABEL[a.audience]}
          </span>
          {a.channels.map((c) => (
            <Tooltip key={c} title={CHANNEL_LABEL[c]}>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.05] text-grey-400">
                {CHANNEL_ICON[c]}
              </span>
            </Tooltip>
          ))}
          {a.deliveredCount != null && (
            <span className="text-grey-500">
              · {a.deliveredCount.toLocaleString()} delivered
            </span>
          )}
          {a.openRate != null && (
            <span className="text-grey-500">
              · {Math.round(a.openRate * 100)}% open rate
            </span>
          )}
          <span className="text-grey-500">
            ·{" "}
            {a.scheduledFor
              ? `Scheduled for ${formatDateTime(a.scheduledFor)}`
              : a.sentAt
                ? `Sent ${fromNow(a.sentAt)}`
                : `Created ${fromNow(a.createdAt)}`}
          </span>
        </div>
      </div>
      <div className={cn("flex shrink-0 gap-1.5")}>
        <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  );
};

export default NotificationsPage;
