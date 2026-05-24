import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  GlobalOutlined,
  IdcardOutlined,
  RocketOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { PageLoader } from "@components/feedback/PageLoader";
import { EmptyState } from "@components/feedback/EmptyState";
import { useGetAdminJobQuery } from "@services/adminApi";
import { formatCurrency, formatDate, fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { ApplicationStatus, ApplicationSummary } from "@/types";

export const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetAdminJobQuery(id ?? "", { skip: !id });

  if (!id) return null;
  if (isLoading) return <PageLoader />;
  if (!data) {
    return (
      <div>
        <PageHeader eyebrow="Job" title="Job not found" />
        <div className="surface-card">
          <EmptyState
            title="We couldn't find this job"
            description="The job may have been closed or removed."
            action={<Link to="/admin/jobs">Back to Job Management</Link>}
          />
        </div>
      </div>
    );
  }

  const { job, owner, stats, applications } = data;

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link
            to="/admin/jobs"
            className="inline-flex items-center gap-1.5 text-grey-400 hover:text-white"
          >
            <ArrowLeftOutlined /> Job Management
          </Link>
        }
        title={job.title}
        subtitle={`${job.yacht.name} · ${job.location} · posted ${formatDate(
          job.createdAt,
        )}`}
        actions={<StatusBadge kind="job" value={job.status} variant="chip" />}
      />

      {/* ---- pipeline summary ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <PipelineTile label="Total" value={stats.total} tone="white" />
        <PipelineTile label="Pending" value={stats.pending} tone="white" />
        <PipelineTile label="Shortlisted" value={stats.shortlisted} tone="gold" />
        <PipelineTile label="Interviewing" value={stats.interviewing} tone="white" />
        <PipelineTile label="Accepted" value={stats.accepted} tone="teal" />
        <PipelineTile label="Rejected" value={stats.rejected} tone="danger" />
      </div>

      {/* ---- main grid ---- */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* Left: description + applications */}
        <div className="space-y-5">
          <GlassPanel title="Job description" padding="lg">
            <p className="text-[13.5px] leading-relaxed text-grey-200">
              {job.description}
            </p>

            <Section title="Responsibilities">
              <BulletList items={job.responsibilities} />
            </Section>
            <Section title="Requirements">
              <BulletList items={job.requirements} />
            </Section>
            <Section title="Certifications">
              <Chips items={job.certifications} />
            </Section>
            <Section title="Languages">
              <Chips items={job.languages} />
            </Section>
          </GlassPanel>

          <GlassPanel title="Applications" padding="none">
            {applications.length === 0 ? (
              <div className="px-6 py-10">
                <EmptyState
                  title="No applications yet"
                  description="Candidates who apply to this job will appear here."
                />
              </div>
            ) : (
              <DataTable<ApplicationSummary>
                dataSource={applications}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "Candidate",
                    dataIndex: "candidate",
                    width: 260,
                    render: (_: unknown, row) => (
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={row.candidate.avatarUrl}
                          size={32}
                          className="!bg-white/[0.04] !text-grey-400"
                        >
                          {initials(row.candidate.fullName)}
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-white">
                            {row.candidate.fullName}
                          </div>
                          <div className="truncate text-[11.5px] text-grey-500">
                            {titleCase(row.candidate.position)} ·{" "}
                            {row.candidate.nationality}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Exp.",
                    dataIndex: "yearsExperience",
                    width: 80,
                    responsive: ["md"],
                    render: (_: unknown, row) => (
                      <span className="text-[12.5px] text-grey-300">
                        {row.candidate.yearsExperience}y
                      </span>
                    ),
                  },
                  {
                    title: "Match",
                    dataIndex: "matchScore",
                    width: 90,
                    responsive: ["lg"],
                    render: (v: number | undefined) =>
                      v === undefined ? (
                        "—"
                      ) : (
                        <span
                          className={cn(
                            "text-[12.5px] font-medium",
                            v >= 80
                              ? "text-teal-300"
                              : v >= 60
                                ? "text-gold-400"
                                : "text-grey-400",
                          )}
                        >
                          {v}
                        </span>
                      ),
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    width: 140,
                    render: (v: ApplicationStatus) => (
                      <StatusBadge kind="application" value={v} variant="chip" />
                    ),
                  },
                  {
                    title: "Applied",
                    dataIndex: "appliedAt",
                    width: 100,
                    responsive: ["lg"],
                    render: (v: string) => (
                      <span className="text-[11.5px] text-grey-500">
                        {fromNow(v)}
                      </span>
                    ),
                  },
                  {
                    title: "",
                    width: 48,
                    align: "right",
                    render: (_: unknown, row) => (
                      <Tooltip title="Open candidate">
                        <Link
                          to={`/admin/crew/${row.candidate.id}`}
                          className="grid h-7 w-7 place-items-center rounded-lg text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
                          aria-label="Open"
                        >
                          <EyeOutlined />
                        </Link>
                      </Tooltip>
                    ),
                  },
                ]}
              />
            )}
          </GlassPanel>
        </div>

        {/* Right: yacht + owner + meta */}
        <div className="space-y-5">
          <GlassPanel padding="none" className="overflow-hidden">
            {job.yacht.imageUrl && (
              <div className="aspect-[16/9] w-full bg-white/[0.02]">
                <img
                  src={job.yacht.imageUrl}
                  alt={job.yacht.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="px-5 py-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
                Yacht
              </div>
              <h3 className="mt-1 text-[15px] font-semibold text-white">
                {job.yacht.name}
              </h3>
              <div className="mt-1 text-[12px] text-grey-400">
                {titleCase(job.yacht.type)} · {job.yacht.length}m
                {job.yacht.flag && ` · ${job.yacht.flag}`}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel title="Owner" padding="md">
            <div className="flex items-center gap-3">
              <Avatar
                src={owner.avatarUrl}
                size={44}
                className="!bg-white/[0.04] !text-grey-300"
              >
                {initials(owner.fullName)}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-white">
                  {owner.fullName}
                </div>
                <div className="truncate text-[11.5px] text-grey-500">
                  {owner.companyName ?? owner.email}
                </div>
              </div>
              <Tag
                color={
                  owner.verificationStatus === "approved" ? "cyan" : "default"
                }
                bordered={false}
                className={
                  owner.verificationStatus === "approved"
                    ? ""
                    : "!bg-white/[0.04] !text-grey-400"
                }
              >
                {titleCase(owner.verificationStatus)}
              </Tag>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <Stat label="Jobs posted" value={owner.jobsPostedCount} />
              <Stat label="Hires made" value={owner.hiresMadeCount} />
            </div>
          </GlassPanel>

          <GlassPanel title="Job details" padding="md">
            <div className="grid grid-cols-1 gap-y-3">
              <KV
                label="Position"
                value={titleCase(job.position)}
                icon={<TeamOutlined />}
              />
              <KV
                label="Contract"
                value={titleCase(job.contractType)}
                icon={<IdcardOutlined />}
              />
              <KV
                label="Salary"
                value={`${formatCurrency(job.salary.min, job.salary.currency)} – ${formatCurrency(
                  job.salary.max,
                  job.salary.currency,
                )} / ${job.salary.period}`}
                icon={<RocketOutlined />}
              />
              <KV
                label="Location"
                value={job.location}
                icon={<EnvironmentOutlined />}
              />
              <KV
                label="Start"
                value={`${formatDate(job.startDate)}${
                  job.endDate ? ` → ${formatDate(job.endDate)}` : ""
                }`}
                icon={<GlobalOutlined />}
              />
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mt-5">
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {title}
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const BulletList = ({ items }: { items: string[] }) =>
  items.length === 0 ? (
    <div className="text-[12.5px] text-grey-500">—</div>
  ) : (
    <ul className="space-y-1.5 text-[13px] text-grey-200">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500" />
          {it}
        </li>
      ))}
    </ul>
  );

const Chips = ({ items }: { items: string[] }) =>
  items.length === 0 ? (
    <div className="text-[12.5px] text-grey-500">—</div>
  ) : (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <Tag key={it} bordered={false} className="!bg-white/[0.04] !text-grey-300">
          {it}
        </Tag>
      ))}
    </div>
  );

const KV = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="flex items-start gap-3">
    {icon && (
      <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] text-[13px] text-grey-300">
        {icon}
      </span>
    )}
    <div className="min-w-0 flex-1">
      <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] text-white">{value}</div>
    </div>
  </div>
);

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] px-2 py-2.5">
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
    <div className="mt-1 text-[15px] font-semibold text-white">{value}</div>
  </div>
);

const PipelineTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "teal" | "gold" | "danger";
}) => (
  <div className="surface-card px-4 py-3.5">
    <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
      {label}
    </div>
    <div
      className={cn(
        "mt-1 text-xl font-semibold tracking-tighter2",
        tone === "teal" && "text-teal-300",
        tone === "gold" && "text-gold-400",
        tone === "danger" && "text-[#C24545]",
        tone === "white" && "text-white",
      )}
    >
      {value.toLocaleString()}
    </div>
  </div>
);

export default JobDetailsPage;
