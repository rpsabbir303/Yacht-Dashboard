import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Modal, Progress, Tag, message } from "antd";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageLoader } from "@components/feedback/PageLoader";
import { EmptyState } from "@components/feedback/EmptyState";
import { StatusBadge } from "@components/admin/StatusBadge";
import { useConfirm } from "@hooks/useConfirm";
import {
  useDecideCrewVerificationMutation,
  useGetCrewProfileQuery,
  useUpdateCrewStatusMutation,
} from "@services/adminApi";
import { formatDate, fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { AdminAccountStatus, VerificationDocument } from "@/types";

export const CrewProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const confirm = useConfirm();

  const { data: crew, isLoading } = useGetCrewProfileQuery(id ?? "", {
    skip: !id,
  });
  const [decide, { isLoading: deciding }] = useDecideCrewVerificationMutation();
  const [updateStatus] = useUpdateCrewStatusMutation();
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  if (!id) return null;
  if (isLoading) return <PageLoader />;
  if (!crew) {
    return (
      <div>
        <PageHeader eyebrow="Crew" title="Crew member not found" />
        <div className="surface-card">
          <EmptyState
            title="We couldn't find this profile"
            description="The crew member may have been removed."
            action={<Link to="/admin/crew">Back to Crew Management</Link>}
          />
        </div>
      </div>
    );
  }

  const onApprove = async () => {
    try {
      await decide({ id: crew.id, decision: "approved" }).unwrap();
      message.success("Crew verification approved");
    } catch {
      message.error("Failed to approve");
    }
  };

  const onReject = async () => {
    const ok = await confirm({
      title: "Reject verification?",
      description: `${crew.fullName} will need to resubmit valid documents.`,
      confirmText: "Reject",
      danger: true,
    });
    if (!ok) return;
    try {
      await decide({ id: crew.id, decision: "rejected" }).unwrap();
      message.success("Verification rejected");
    } catch {
      message.error("Failed to reject");
    }
  };

  const onRequestInfo = async () => {
    try {
      await decide({ id: crew.id, decision: "additional-info" }).unwrap();
      message.success("Additional information requested");
    } catch {
      message.error("Failed to update");
    }
  };

  const onSuspend = async () => {
    const ok = await confirm({
      title: "Suspend account?",
      description: `${crew.fullName} will lose platform access until reinstated.`,
      confirmText: "Suspend",
      danger: true,
    });
    if (!ok) return;
    await updateStatus({
      id: crew.id,
      status: "suspended" as AdminAccountStatus,
    }).unwrap();
    message.success("Account suspended");
  };

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link
            to="/admin/crew"
            className="inline-flex items-center gap-1.5 text-grey-400 hover:text-white"
          >
            <ArrowLeftOutlined /> Crew Management
          </Link>
        }
        title={crew.fullName}
        subtitle={`${titleCase(crew.position)} · ${crew.nationality} · joined ${formatDate(
          crew.joinedAt,
        )}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={<CheckCircleOutlined />}
              type="primary"
              loading={deciding}
              disabled={crew.verificationStatus === "approved"}
              onClick={onApprove}
            >
              Approve crew
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={onRequestInfo}
              disabled={crew.verificationStatus === "additional-info"}
            >
              Request info
            </Button>
            <Button icon={<CloseCircleOutlined />} danger onClick={onReject}>
              Reject
            </Button>
            <Button
              icon={<StopOutlined />}
              danger
              type="text"
              onClick={onSuspend}
              disabled={crew.status === "suspended"}
            >
              Suspend
            </Button>
          </div>
        }
      />

      {/* ---- header card ---- */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <GlassPanel padding="lg">
          <div className="flex flex-wrap items-start gap-5">
            <Avatar
              src={crew.avatarUrl}
              size={96}
              className="!bg-white/[0.05] !text-grey-300"
            >
              {initials(crew.fullName)}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[20px] font-semibold text-white">
                  {crew.fullName}
                </h2>
                <StatusBadge
                  kind="verification"
                  value={crew.verificationStatus}
                  variant="chip"
                />
                <StatusBadge
                  kind="account"
                  value={crew.status}
                  variant="chip"
                />
                <StatusBadge
                  kind="availability"
                  value={crew.availability}
                  variant="chip"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-grey-400">
                <InfoLine icon={<MailOutlined />}>{crew.email}</InfoLine>
                <InfoLine icon={<EnvironmentOutlined />}>
                  {crew.location ?? `${crew.nationality}`}
                </InfoLine>
                <InfoLine icon={<GlobalOutlined />}>
                  Speaks {crew.languages.join(", ")}
                </InfoLine>
                {crew.rating !== undefined && (
                  <InfoLine icon={<SafetyCertificateOutlined />}>
                    Rating {crew.rating.toFixed(2)} / 5
                  </InfoLine>
                )}
              </div>

              {crew.bio && (
                <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-grey-300">
                  {crew.bio}
                </p>
              )}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel padding="lg" className="flex flex-col gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
              Profile completion
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-bold tracking-tighter2 text-white">
                {crew.profileCompletion}
                <span className="text-base text-grey-500">%</span>
              </div>
            </div>
            <Progress
              percent={crew.profileCompletion}
              showInfo={false}
              strokeColor={
                crew.profileCompletion >= 80
                  ? "#22C7B8"
                  : crew.profileCompletion >= 60
                    ? "#D4B25F"
                    : "#6B7280"
              }
              trailColor="rgba(255,255,255,0.08)"
              className="!m-0 mt-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Years" value={`${crew.yearsExperience}y`} />
            <Stat label="Applied" value={crew.applicationsCount} />
            <Stat label="Hired" value={crew.hiresCount} />
          </div>
        </GlassPanel>
      </div>

      {/* ---- two-col grid ---- */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Personal info */}
          <GlassPanel title="Personal information">
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <KV label="Full name" value={crew.fullName} />
              <KV label="Email" value={crew.email} />
              <KV label="Nationality" value={crew.nationality} />
              <KV label="Location" value={crew.location ?? "—"} />
              <KV
                label="Passport"
                value={`${crew.passport.number} · expires ${formatDate(
                  crew.passport.expiresAt,
                )}`}
              />
              <KV label="Languages" value={crew.languages.join(", ")} />
              <KV
                label="Joined"
                value={`${formatDate(crew.joinedAt)} (${fromNow(crew.joinedAt)})`}
              />
              <KV
                label="Last active"
                value={
                  crew.lastActiveAt
                    ? `${fromNow(crew.lastActiveAt)}`
                    : "Never"
                }
              />
            </div>
          </GlassPanel>

          {/* Experience */}
          <GlassPanel title="Yacht experience">
            {crew.experience.length === 0 ? (
              <Empty>No experience recorded.</Empty>
            ) : (
              <ul className="divide-y divide-white/[0.08]">
                {crew.experience.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 py-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-[14px] text-grey-300">
                      <UserOutlined />
                    </span>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-white">
                        {e.role} — {e.yacht}
                      </div>
                      <div className="text-[11.5px] text-grey-500">
                        {titleCase(e.yachtType)} · {e.length}m ·{" "}
                        {formatDate(e.from)} →{" "}
                        {e.to ? formatDate(e.to) : "Present"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          {/* Certifications */}
          <GlassPanel title="Certifications">
            {crew.certifications.length === 0 ? (
              <Empty>No certifications uploaded.</Empty>
            ) : (
              <ul className="space-y-2">
                {crew.certifications.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.08] px-3 py-2.5"
                  >
                    <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-white/[0.05] text-[13px] text-grey-300">
                      <SafetyCertificateOutlined />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-white">
                        {c.name}
                      </div>
                      <div className="text-[11.5px] text-grey-500">
                        {c.issuer}
                        {c.validUntil && ` · valid until ${formatDate(c.validUntil)}`}
                      </div>
                    </div>
                    <Tag
                      color={c.verified ? "cyan" : "default"}
                      bordered={false}
                      className={c.verified ? "" : "!bg-white/[0.05] !text-grey-400"}
                    >
                      {c.verified ? "Verified" : "Pending"}
                    </Tag>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Documents */}
          <GlassPanel title="Uploaded documents">
            {crew.documents.length === 0 ? (
              <Empty>No documents uploaded.</Empty>
            ) : (
              <ul className="space-y-2">
                {crew.documents.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(d)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-teal-500/35"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-[13px] text-grey-300">
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
                            : "!bg-white/[0.05] !text-grey-400"
                        }
                      >
                        {titleCase(d.status)}
                      </Tag>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          {/* Visas */}
          <GlassPanel title="Visas">
            {crew.visas.length === 0 ? (
              <Empty>No visas on file.</Empty>
            ) : (
              <ul className="divide-y divide-white/[0.08]">
                {crew.visas.map((v, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[13px] font-medium text-white">
                        {v.country}
                      </div>
                      <div className="text-[11.5px] text-grey-500">
                        {v.type}
                      </div>
                    </div>
                    <div className="text-[11.5px] text-grey-400">
                      Expires {formatDate(v.expiresAt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          {/* References */}
          <GlassPanel title="References">
            {crew.references.length === 0 ? (
              <Empty>No references provided.</Empty>
            ) : (
              <ul className="divide-y divide-white/[0.08]">
                {crew.references.map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium text-white">
                        {r.name}
                      </div>
                      <Tag
                        color={r.verified ? "cyan" : "default"}
                        bordered={false}
                        className={r.verified ? "" : "!bg-white/[0.05] !text-grey-400"}
                      >
                        {r.verified ? "Verified" : "Pending"}
                      </Tag>
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-grey-500">
                      {r.role} · {r.vessel}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-grey-400">
                      <PhoneOutlined /> {r.contact}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          {/* Availability summary */}
          <GlassPanel title="Availability">
            <div className="flex items-center justify-between">
              <StatusBadge
                kind="availability"
                value={crew.availability}
                variant="chip"
              />
              {crew.availableFrom && (
                <div className="text-[12px] text-grey-400">
                  From {formatDate(crew.availableFrom)}
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* document preview */}
      <Modal
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        footer={null}
        width={760}
        centered
        title={previewDoc?.name}
      >
        {previewDoc && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <img
              src={previewDoc.url}
              alt={previewDoc.name}
              className="h-auto w-full object-contain"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ============================================================ */

const InfoLine = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="text-grey-500">{icon}</span>
    <span>{children}</span>
  </span>
);

const KV = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div className="mt-0.5 text-[13px] text-white">{value}</div>
  </div>
);

const Stat = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-2.5">
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div className="mt-1 text-[15px] font-bold text-white">{value}</div>
  </div>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <div
    className={cn(
      "rounded-xl border border-dashed border-white/[0.08] px-3 py-4 text-center text-[12.5px] text-grey-500",
    )}
  >
    {children}
  </div>
);

export default CrewProfilePage;
