import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  IdcardOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Drawer, Modal, Tag, message } from "antd";
import { useState, type ReactNode } from "react";

import { GlassPanel } from "@components/common/GlassPanel";
import { StatusBadge } from "@components/admin/StatusBadge";
import { useConfirm } from "@hooks/useConfirm";
import {
  useDecideOwnerVerificationMutation,
  useUpdateOwnerStatusMutation,
} from "@services/adminApi";
import { formatDate, fromNow, initials, titleCase } from "@utils/format";
import type {
  AdminAccountStatus,
  OwnerProfile,
  VerificationDocument,
} from "@/types";

interface Props {
  owner: OwnerProfile | null;
  open: boolean;
  onClose: () => void;
}

export const OwnerDetailsDrawer = ({ owner, open, onClose }: Props) => {
  const confirm = useConfirm();
  const [decide, { isLoading: deciding }] = useDecideOwnerVerificationMutation();
  const [updateStatus] = useUpdateOwnerStatusMutation();
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  if (!owner) return null;

  const onApprove = async () => {
    try {
      await decide({ id: owner.id, decision: "approved" }).unwrap();
      message.success("Owner approved");
      onClose();
    } catch {
      message.error("Failed to approve");
    }
  };

  const onReject = async () => {
    const ok = await confirm({
      title: "Reject verification?",
      description: `${owner.fullName} will need to resubmit valid documents.`,
      confirmText: "Reject",
      danger: true,
    });
    if (!ok) return;
    await decide({ id: owner.id, decision: "rejected" }).unwrap();
    message.success("Verification rejected");
    onClose();
  };

  const onRequestInfo = async () => {
    await decide({ id: owner.id, decision: "additional-info" }).unwrap();
    message.success("Additional information requested");
  };

  const onSuspend = async () => {
    const ok = await confirm({
      title: "Suspend account?",
      description: `${owner.fullName} will lose access until reinstated.`,
      confirmText: "Suspend",
      danger: true,
    });
    if (!ok) return;
    await updateStatus({
      id: owner.id,
      status: "suspended" as AdminAccountStatus,
    }).unwrap();
    message.success("Account suspended");
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(720, window.innerWidth - 24)}
      destroyOnClose
      closable={false}
      title={null}
      headerStyle={{ display: "none" }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div className="border-b border-white/[0.05] px-6 py-5">
        <div className="flex items-start gap-4">
          <Avatar
            src={owner.avatarUrl}
            size={56}
            className="!bg-white/[0.04] !text-grey-300"
          >
            {initials(owner.fullName)}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[17px] font-semibold text-white">
                {owner.fullName}
              </h2>
              <StatusBadge
                kind="verification"
                value={owner.verificationStatus}
                variant="chip"
              />
              <StatusBadge kind="account" value={owner.status} variant="chip" />
            </div>
            <div className="mt-0.5 text-[12.5px] text-grey-400">
              {owner.companyName ?? owner.email} · {owner.country}
            </div>
            <div className="mt-0.5 text-[11.5px] text-grey-500">
              Joined {formatDate(owner.joinedAt)}
              {owner.lastActiveAt && ` · Active ${fromNow(owner.lastActiveAt)}`}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={deciding}
            disabled={owner.verificationStatus === "approved"}
            onClick={onApprove}
          >
            Approve owner
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={onRequestInfo}
            disabled={owner.verificationStatus === "additional-info"}
          >
            Request info
          </Button>
          <Button icon={<CloseCircleOutlined />} danger onClick={onReject}>
            Reject
          </Button>
          <Button
            icon={<StopOutlined />}
            type="text"
            danger
            onClick={onSuspend}
            disabled={owner.status === "suspended"}
          >
            Suspend
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-6">
        {owner.notes && (
          <div className="rounded-xl border border-gold-500/20 bg-gold-500/[0.04] px-3.5 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold-400">
              Outstanding request
            </div>
            <p className="mt-0.5 text-[12.5px] text-grey-200">{owner.notes}</p>
          </div>
        )}

        {/* Company info */}
        <Section title="Company information">
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
            <KV label="Full name" value={owner.fullName} />
            <KV label="Email" value={owner.email} />
            <KV label="Company" value={owner.companyName ?? "—"} />
            <KV label="VAT / Tax ID" value={owner.vatNumber ?? "—"} />
            <KV label="Country" value={owner.country} />
            <KV
              label="Profile completion"
              value={`${owner.profileCompletion}%`}
            />
            <KV label="Jobs posted" value={owner.jobsPostedCount} />
            <KV label="Hires made" value={owner.hiresMadeCount} />
          </div>
        </Section>

        {/* Vessels */}
        <Section title="Vessels">
          {owner.vessels.length === 0 ? (
            <Empty>No vessels linked to this owner yet.</Empty>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {owner.vessels.map((v) => (
                <li
                  key={v.id}
                  className="overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.015]"
                >
                  {v.imageUrl && (
                    <div className="aspect-[16/9] w-full bg-white/[0.02]">
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="px-3 py-2.5">
                    <div className="text-[13px] font-medium text-white">
                      {v.name}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-wider text-grey-500">
                      {titleCase(v.type)} · {v.length}m · {v.flag}
                      {v.yearBuilt && ` · ${v.yearBuilt}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Documents */}
        <Section title="Uploaded documents">
          {owner.documents.length === 0 ? (
            <Empty>No documents uploaded.</Empty>
          ) : (
            <ul className="space-y-2">
              {owner.documents.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(d)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 text-left transition hover:border-white/[0.08]"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-[13px] text-grey-300">
                      <IdcardOutlined />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-white">
                        {d.name}
                      </div>
                      <div className="truncate text-[11px] uppercase tracking-wider text-grey-500">
                        {titleCase(d.kind)} · uploaded {fromNow(d.uploadedAt)}
                      </div>
                    </div>
                    <Tag
                      color={d.status === "verified" ? "cyan" : "default"}
                      bordered={false}
                      className={
                        d.status === "verified"
                          ? ""
                          : "!bg-white/[0.04] !text-grey-400"
                      }
                    >
                      {titleCase(d.status)}
                    </Tag>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Modal
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        footer={null}
        width={720}
        centered
        title={previewDoc?.name}
      >
        {previewDoc && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.05]">
            <img
              src={previewDoc.url}
              alt={previewDoc.name}
              className="h-auto w-full object-contain"
            />
          </div>
        )}
      </Modal>
    </Drawer>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <GlassPanel title={title} padding="md">
    {children}
  </GlassPanel>
);

const KV = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div className="mt-0.5 text-[13px] text-white">{value}</div>
  </div>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-white/[0.05] px-3 py-4 text-center text-[12.5px] text-grey-500">
    {children}
  </div>
);
