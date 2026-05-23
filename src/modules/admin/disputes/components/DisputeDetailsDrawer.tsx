import { Avatar, Button, Input, Select, Steps, message } from "antd";
import { useState } from "react";

import { Drawer } from "@components/common/Drawer";
import { StatusBadge } from "@components/admin/StatusBadge";
import {
  useResolveDisputeMutation,
  useSetDisputeStatusMutation,
} from "@services/adminApi";
import { initials, formatCurrency, formatDateTime } from "@utils/format";
import { cn } from "@utils/cn";
import type { Dispute } from "@/types";

interface Props {
  dispute: Dispute | null;
  onClose: () => void;
}

const DECISION_OPTIONS = [
  { value: "refund", label: "Issue full refund" },
  { value: "partial-refund", label: "Partial refund" },
  { value: "warning", label: "Warning to other party" },
  { value: "suspension", label: "Suspend other party" },
  { value: "no-action", label: "No action required" },
] as const;

type Decision = (typeof DECISION_OPTIONS)[number]["value"];

const stepIndex = (status: Dispute["status"]): number =>
  ({ open: 0, "under-review": 1, resolved: 2, rejected: 2 })[status];

export const DisputeDetailsDrawer = ({ dispute, onClose }: Props) => {
  const [decision, setDecision] = useState<Decision>("refund");
  const [note, setNote] = useState("");
  const [setStatus, { isLoading: statusLoading }] = useSetDisputeStatusMutation();
  const [resolve, { isLoading: resolveLoading }] = useResolveDisputeMutation();

  const moveToReview = async () => {
    if (!dispute) return;
    try {
      await setStatus({ id: dispute.id, status: "under-review" }).unwrap();
      message.success("Moved to under review");
    } catch {
      message.error("Action failed");
    }
  };

  const rejectDispute = async () => {
    if (!dispute) return;
    try {
      await setStatus({ id: dispute.id, status: "rejected" }).unwrap();
      message.success("Dispute rejected");
      onClose();
    } catch {
      message.error("Action failed");
    }
  };

  const resolveDispute = async () => {
    if (!dispute) return;
    if (!note.trim()) {
      message.warning("A resolution note is required");
      return;
    }
    try {
      await resolve({ id: dispute.id, decision, note }).unwrap();
      message.success("Dispute resolved");
      setNote("");
      onClose();
    } catch {
      message.error("Action failed");
    }
  };

  return (
    <Drawer
      open={!!dispute}
      onClose={onClose}
      title="Dispute review"
      width={620}
    >
      {dispute && (
        <div className="space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
                {dispute.reference}
              </div>
              <h3 className="mt-1 truncate text-[17px] font-semibold text-white">
                {dispute.jobTitle ?? dispute.kind.replace("-", " ")}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge
                  kind="dispute"
                  value={dispute.status}
                  variant="chip"
                />
                <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-grey-400">
                  {dispute.kind.replace("-", " ")}
                </span>
                {dispute.amount && (
                  <span className="rounded-md bg-gold-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400 ring-1 ring-gold-500/20">
                    {formatCurrency(dispute.amount.value, dispute.amount.currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Workflow */}
          <Steps
            size="small"
            current={stepIndex(dispute.status)}
            status={dispute.status === "rejected" ? "error" : undefined}
            items={[
              { title: "Opened" },
              { title: "Under review" },
              {
                title:
                  dispute.status === "rejected" ? "Rejected" : "Resolved",
              },
            ]}
          />

          {/* Parties */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Party label="Opened by" person={dispute.openedBy} />
            <Party label="Against" person={dispute.against} />
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] px-4 py-3.5">
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-grey-500">
              Complaint
            </div>
            <p className="text-[13.5px] leading-relaxed text-white">
              {dispute.summary}
            </p>
          </div>

          {/* Conversation */}
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-grey-500">
              Conversation preview
            </div>
            {dispute.conversation.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.015] px-4 py-6 text-center text-[12.5px] text-grey-500">
                No messages exchanged on the platform.
              </div>
            ) : (
              <div className="space-y-2.5">
                {dispute.conversation.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-xl border border-white/[0.04] px-3.5 py-2.5",
                      m.authorId === dispute.openedBy.id
                        ? "bg-white/[0.02]"
                        : "bg-teal-500/[0.04] border-teal-500/15",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px] text-grey-500">
                      <span>{m.authorName}</span>
                      <span>{formatDateTime(m.createdAt)}</span>
                    </div>
                    <div className="text-[13px] text-white">{m.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution form / display */}
          {dispute.resolution ? (
            <div className="rounded-2xl border border-teal-500/15 bg-teal-500/[0.04] px-4 py-3.5">
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-teal-300">
                Resolution
              </div>
              <div className="text-[13.5px] text-white">
                {dispute.resolution.note}
              </div>
              <div className="mt-2 text-[11px] text-grey-500">
                {dispute.resolution.decision.replace("-", " ")} · by{" "}
                {dispute.resolution.by.name} ·{" "}
                {formatDateTime(dispute.resolution.at)}
              </div>
            </div>
          ) : (
            <div className="space-y-3 border-t border-white/[0.05] pt-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
                Resolution workflow
              </div>
              <Select<Decision>
                value={decision}
                onChange={setDecision}
                options={DECISION_OPTIONS as never}
                className="w-full"
              />
              <Input.TextArea
                rows={3}
                placeholder="Write a brief resolution note (visible to both parties)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {dispute.status === "open" && (
                  <Button onClick={moveToReview} loading={statusLoading}>
                    Move to review
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={resolveDispute}
                  loading={resolveLoading}
                >
                  Resolve dispute
                </Button>
                <Button danger onClick={rejectDispute} loading={statusLoading}>
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

const Party = ({
  label,
  person,
}: {
  label: string;
  person: { name: string; avatarUrl?: string; role: string };
}) => (
  <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div className="mt-1.5 flex items-center gap-2.5">
      <Avatar
        src={person.avatarUrl}
        size={28}
        className="!bg-white/[0.04] !text-grey-400"
      >
        {initials(person.name)}
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-[13px] text-white">{person.name}</div>
        <div className="truncate text-[11px] uppercase tracking-wider text-grey-500">
          {person.role}
        </div>
      </div>
    </div>
  </div>
);
