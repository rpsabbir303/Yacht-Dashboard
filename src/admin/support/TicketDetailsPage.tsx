import {
  ArrowLeftOutlined,
  FileOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { App, Button, Input, Select, Skeleton, Upload } from "antd";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { StatusBadge } from "@components/admin/StatusBadge";
import {
  useGetSupportTicketQuery,
  useReplySupportTicketMutation,
  useUpdateSupportTicketStatusMutation,
} from "@services/adminApi";
import { formatDate, formatFileSize } from "@utils/format";
import { cn } from "@utils/cn";
import type { SupportTicketMessage, SupportTicketStatus } from "@/types";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_PRIORITY_LABEL,
  SUPPORT_ROLE_LABEL,
  SUPPORT_STATUS_LABEL,
} from "@/types";

const { TextArea } = Input;

const STATUS_OPTIONS: { value: SupportTicketStatus; label: string }[] = (
  Object.entries(SUPPORT_STATUS_LABEL) as [SupportTicketStatus, string][]
).map(([value, label]) => ({ value, label }));

export const TicketDetailsPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: ticket, isLoading, isError } = useGetSupportTicketQuery(id, {
    skip: !id,
  });

  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateSupportTicketStatusMutation();
  const [reply, { isLoading: sending }] = useReplySupportTicketMutation();

  const [replyText, setReplyText] = useState("");

  const allAttachments = useMemo(() => {
    if (!ticket) return [];
    const fromMessages =
      ticket.messages.flatMap((m) => m.attachments ?? []) ?? [];
    const combined = [...ticket.attachments, ...fromMessages];
    const seen = new Set<string>();
    return combined.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [ticket]);

  const onStatusChange = async (next: SupportTicketStatus) => {
    if (!ticket) return;
    try {
      await updateStatus({ id: ticket.id, status: next }).unwrap();
      message.success(`Status updated to ${SUPPORT_STATUS_LABEL[next]}`);
    } catch {
      message.error("Failed to update status");
    }
  };

  const onSendReply = async () => {
    const trimmed = replyText.trim();
    if (!ticket || !trimmed) {
      message.warning("Enter a reply before sending");
      return;
    }
    try {
      await reply({
        id: ticket.id,
        message: `<p>${trimmed.replace(/\n/g, "<br />")}</p>`,
      }).unwrap();
      setReplyText("");
      message.success("Reply sent successfully");
    } catch {
      message.error("Failed to send reply");
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="text-grey-400">Ticket not found.</p>
        <Button className="mt-4" onClick={() => navigate("/admin/support")}>
          Back to Support Center
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title={ticket.ticketNumber}
        subtitle={ticket.subject}
        actions={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/support")}
          >
            Back to list
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* ---- Sidebar: user + ticket meta ---- */}
        <div className="flex flex-col gap-4">
          <GlassPanel title="User information" padding="md">
            <MetaRow label="Name" value={ticket.userName} />
            <MetaRow label="Email" value={ticket.email} />
            <MetaRow label="Role" value={SUPPORT_ROLE_LABEL[ticket.userRole]} />
          </GlassPanel>

          <GlassPanel title="Ticket information" padding="md">
            <MetaRow label="Ticket ID" value={ticket.ticketNumber} mono />
            <MetaRow label="Subject" value={ticket.subject} />
            <MetaRow
              label="Category"
              value={SUPPORT_CATEGORY_LABEL[ticket.category]}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                kind="support-priority"
                value={ticket.priority}
                variant="chip"
              />
              <StatusBadge
                kind="support-status"
                value={ticket.status}
                variant="chip"
              />
            </div>
            <MetaRow label="Priority" value={SUPPORT_PRIORITY_LABEL[ticket.priority]} />
            <MetaRow label="Created" value={formatDate(ticket.createdAt)} />
            <MetaRow label="Last updated" value={formatDate(ticket.updatedAt)} />

            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <label
                htmlFor="ticket-status-select"
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-grey-500"
              >
                Update status
              </label>
              <Select
                id="ticket-status-select"
                className="!w-full"
                value={ticket.status}
                options={STATUS_OPTIONS}
                loading={updatingStatus}
                onChange={onStatusChange}
              />
            </div>
          </GlassPanel>

          {allAttachments.length > 0 && (
            <GlassPanel title="Attachments" padding="md">
              <ul className="space-y-2">
                {allAttachments.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.url}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 transition-colors hover:border-teal-500/35 hover:bg-white/[0.04]"
                      onClick={(e) => {
                        if (att.url === "#") e.preventDefault();
                      }}
                    >
                      <PaperClipOutlined className="shrink-0 text-teal-300" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] text-white">
                          {att.fileName}
                        </div>
                        <div className="text-[11px] text-grey-500">
                          {formatFileSize(att.fileSize)}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          )}
        </div>

        {/* ---- Conversation ---- */}
        <GlassPanel padding="none" className="flex min-h-[480px] flex-col overflow-hidden">
          <header className="border-b border-white/[0.08] px-5 py-4 sm:px-6">
            <h3 className="text-[15px] font-semibold text-white">
              Conversation
            </h3>
            <p className="mt-0.5 text-[12px] text-grey-500">
              {ticket.messages.length} message
              {ticket.messages.length === 1 ? "" : "s"}
            </p>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            {ticket.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>

          <footer className="border-t border-white/[0.08] bg-[#0B1320]/80 px-5 py-4 sm:px-6">
            <label
              htmlFor="admin-reply"
              className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-grey-500"
            >
              Admin reply
            </label>
            <TextArea
              id="admin-reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply to the user…"
              autoSize={{ minRows: 3, maxRows: 8 }}
              className="!mb-3"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Upload disabled showUploadList={false}>
                <Button icon={<FileOutlined />} disabled>
                  Attach file
                </Button>
              </Upload>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sending}
                onClick={onSendReply}
              >
                Reply
              </Button>
            </div>
          </footer>
        </GlassPanel>
      </div>
    </div>
  );
};

const MetaRow = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="mt-3 first:mt-0">
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div
      className={cn(
        "mt-0.5 text-[13px] text-grey-300",
        mono && "font-mono text-teal-300/90",
      )}
    >
      {value}
    </div>
  </div>
);

const MessageBubble = ({ message }: { message: SupportTicketMessage }) => {
  const isAdmin = message.authorType === "admin";

  return (
    <div
      className={cn(
        "flex",
        isAdmin ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[75%]",
          isAdmin
            ? "rounded-br-md bg-teal-500/[0.12] ring-1 ring-teal-500/25"
            : "rounded-bl-md bg-surface-high ring-1 ring-white/[0.08]",
        )}
      >
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-white">
            {message.authorName}
          </span>
          <span className="text-[10.5px] text-grey-500">
            {formatDate(message.createdAt)}
          </span>
          {isAdmin && (
            <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-medium text-teal-300">
              Admin
            </span>
          )}
        </div>
        <div
          className="legal-preview text-[13px] leading-relaxed text-grey-300 [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: message.body }}
        />
        {message.attachments && message.attachments.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3">
            {message.attachments.map((att) => (
              <li key={att.id}>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-teal-300">
                  <PaperClipOutlined />
                  {att.fileName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsPage;
