import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input, message } from "antd";
import { useState } from "react";

import { Drawer } from "@components/common/Drawer";
import { StatusBadge } from "@components/admin/StatusBadge";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { useDecideVerificationMutation } from "@services/adminApi";
import { initials, formatDate } from "@utils/format";
import { cn } from "@utils/cn";
import type { VerificationRequest, VerificationStatus } from "@/types";

interface Props {
  request: VerificationRequest | null;
  onClose: () => void;
}

const RISK_TONE = (score = 0) => {
  if (score >= 70) return { dot: "bg-[#AA2727]", text: "text-[#C24545]", label: "High risk" };
  if (score >= 40) return { dot: "bg-gold-500", text: "text-gold-400", label: "Medium risk" };
  return { dot: "bg-teal-400", text: "text-teal-300", label: "Low risk" };
};

export const VerificationDetailsDrawer = ({ request, onClose }: Props) => {
  const [note, setNote] = useState("");
  const [docsOpen, setDocsOpen] = useState(false);
  const [decide, { isLoading }] = useDecideVerificationMutation();

  const run = async (decision: VerificationStatus) => {
    if (!request) return;
    try {
      await decide({ id: request.id, decision, note }).unwrap();
      const verb =
        decision === "approved"
          ? "approved"
          : decision === "rejected"
            ? "rejected"
            : "updated";
      message.success(`Verification ${verb}`);
      setNote("");
      onClose();
    } catch {
      message.error("Action failed. Please try again.");
    }
  };

  const risk = request ? RISK_TONE(request.riskScore) : RISK_TONE(0);

  return (
    <>
      <Drawer
        open={!!request}
        onClose={onClose}
        title="Verification review"
        width={560}
      >
        {request && (
          <div className="space-y-7">
            {/* Subject card */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4">
              <Avatar
                src={request.subject.avatarUrl}
                size={56}
                className="!bg-white/[0.04] !text-grey-400"
              >
                {initials(request.subject.name)}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[16px] font-semibold text-white">
                    {request.subject.name}
                  </h3>
                  <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-grey-400">
                    {request.subjectType}
                  </span>
                </div>
                <div className="truncate text-[13px] text-grey-500">
                  {request.subject.email}
                </div>
                {request.subject.location && (
                  <div className="mt-0.5 text-[12px] text-grey-500">
                    {request.subject.location}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StatusBadge
                    kind="verification"
                    value={request.status}
                    variant="chip"
                  />
                  <span className="inline-flex items-center gap-1.5 text-[12px]">
                    <span className={cn("h-1.5 w-1.5 rounded-full", risk.dot)} />
                    <span className={risk.text}>{risk.label}</span>
                    <span className="text-grey-500">
                      {request.riskScore != null ? `· ${request.riskScore}` : ""}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <Meta label="Submitted" value={formatDate(request.submittedAt)} />
              <Meta label="Updated" value={formatDate(request.updatedAt)} />
              {request.reviewedBy && (
                <Meta label="Reviewed by" value={request.reviewedBy.name} />
              )}
              <Meta
                label="Documents"
                value={`${request.documents.length} files`}
              />
            </div>

            {/* Documents */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
                  Uploaded documents
                </div>
                {request.documents.length > 0 && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setDocsOpen(true)}
                  >
                    Preview
                  </Button>
                )}
              </div>
              {request.documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.015] px-4 py-6 text-center text-[12.5px] text-grey-500">
                  No documents uploaded.
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {request.documents.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] text-white">{d.name}</div>
                        <div className="truncate text-[11px] text-grey-500">
                          {d.kind} · {formatDate(d.uploadedAt)}
                        </div>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setDocsOpen(true)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="rounded-xl border border-gold-500/20 bg-gold-500/[0.04] px-4 py-3">
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gold-400">
                  Note from reviewer
                </div>
                <div className="text-[13px] text-white">{request.notes}</div>
              </div>
            )}

            {/* Action note input */}
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-grey-500">
                Reviewer note (optional)
              </div>
              <Input.TextArea
                rows={3}
                placeholder="Add context for this decision…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t border-white/[0.05] pt-5">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={isLoading}
                onClick={() => run("approved")}
              >
                Approve
              </Button>
              <Button
                icon={<InfoCircleOutlined />}
                loading={isLoading}
                onClick={() => run("additional-info")}
              >
                Request info
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={isLoading}
                onClick={() => run("rejected")}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Drawer>
      <DocumentPreviewModal
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        documents={request?.documents ?? []}
      />
    </>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5">
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div className="mt-0.5 truncate text-[13px] text-white">{value}</div>
  </div>
);
