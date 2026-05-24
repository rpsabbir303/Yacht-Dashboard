import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Input,
  Select,
  message,
} from "antd";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import {
  useListApplicationsQuery,
  useSetApplicationStatusMutation,
} from "@services/adminApi";
import { formatDate, fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { ApplicationStatus, ApplicationSummary } from "@/types";

const STATUS_OPTIONS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export const ApplicationsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const debouncedSearch = useDebouncedValue(search, 200);

  const { data: apps = [], isLoading, refetch, isFetching } =
    useListApplicationsQuery({
      search: debouncedSearch || undefined,
      status,
    });
  const [setStatusMut] = useSetApplicationStatusMutation();

  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewApp = useMemo(
    () => apps.find((a) => a.id === previewId) ?? null,
    [previewId, apps],
  );

  const summary = useMemo(() => {
    const counts = apps.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      },
      {
        pending: 0,
        shortlisted: 0,
        interviewing: 0,
        accepted: 0,
        rejected: 0,
      } as Record<ApplicationStatus, number>,
    );
    return { total: apps.length, ...counts };
  }, [apps]);

  const onChangeStatus = async (id: string, next: ApplicationStatus) => {
    try {
      await setStatusMut({ id, status: next }).unwrap();
      message.success(`Marked as ${titleCase(next)}`);
    } catch {
      message.error("Failed to update");
    }
  };

  const hasFilters = !!debouncedSearch || status !== "all";

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Application Management"
        subtitle="Monitor every application across the platform and track the full hiring pipeline."
        actions={
          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />

      {/* Pipeline tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <PipelineTile label="Total" value={summary.total} tone="white" />
        <PipelineTile label="Pending" value={summary.pending} tone="white" />
        <PipelineTile label="Shortlisted" value={summary.shortlisted} tone="gold" />
        <PipelineTile label="Interviewing" value={summary.interviewing} tone="white" />
        <PipelineTile label="Accepted" value={summary.accepted} tone="teal" />
        <PipelineTile label="Rejected" value={summary.rejected} tone="danger" />
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[1.8fr_1fr]">
        <Input
          allowClear
          placeholder="Search candidate, job, yacht…"
          prefix={<SearchOutlined className="text-grey-500" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          className="!w-full"
        />
      </div>

      {/* Table */}
      <div className="mt-5">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : apps.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<SolutionOutlined />}
              title={
                hasFilters
                  ? "No applications match those filters"
                  : "No applications yet"
              }
              description={
                hasFilters
                  ? "Try clearing the search or status filter."
                  : "Applications submitted by crew will appear here."
              }
              action={
                hasFilters && (
                  <Button
                    onClick={() => {
                      setSearch("");
                      setStatus("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <DataTable<ApplicationSummary>
            dataSource={apps}
            rowKey="id"
            scroll={{ x: 1100 }}
            onRow={(row) => ({
              onClick: () => setPreviewId(row.id),
              className: "cursor-pointer",
            })}
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
                title: "Job",
                dataIndex: "job",
                width: 280,
                render: (_: unknown, row) => (
                  <div className="min-w-0">
                    <div className="truncate text-[13px] text-white">
                      {row.job.title}
                    </div>
                    <div className="truncate text-[11.5px] text-grey-500">
                      {row.job.yacht} · {row.job.location}
                    </div>
                  </div>
                ),
              },
              {
                title: "Owner",
                dataIndex: "owner",
                width: 180,
                responsive: ["lg"],
                render: (_: unknown, row) => (
                  <span className="text-[12.5px] text-grey-300">
                    {row.owner.name}
                  </span>
                ),
              },
              {
                title: "Match",
                dataIndex: "matchScore",
                width: 80,
                responsive: ["xl"],
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
                width: 110,
                responsive: ["lg"],
                render: (v: string) => (
                  <span className="text-[11.5px] text-grey-500">
                    {fromNow(v)}
                  </span>
                ),
              },
              {
                title: "",
                width: 100,
                align: "right",
                render: (_: unknown, row) => (
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setPreviewId(row.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
                      aria-label="View"
                    >
                      <EyeOutlined />
                    </button>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "shortlist",
                            icon: <CheckCircleOutlined />,
                            label: "Move to shortlist",
                            disabled: row.status === "shortlisted",
                            onClick: () =>
                              onChangeStatus(row.id, "shortlisted"),
                          },
                          {
                            key: "interview",
                            label: "Mark as interviewing",
                            disabled: row.status === "interviewing",
                            onClick: () =>
                              onChangeStatus(row.id, "interviewing"),
                          },
                          { type: "divider" },
                          {
                            key: "accept",
                            icon: <CheckCircleOutlined />,
                            label: "Accept",
                            disabled: row.status === "accepted",
                            onClick: () => onChangeStatus(row.id, "accepted"),
                          },
                          {
                            key: "reject",
                            icon: <CloseCircleOutlined />,
                            label: "Reject",
                            danger: true,
                            disabled: row.status === "rejected",
                            onClick: () => onChangeStatus(row.id, "rejected"),
                          },
                        ],
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <button
                        className="grid h-7 w-7 place-items-center rounded-lg text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
                        aria-label="More"
                      >
                        <MoreOutlined />
                      </button>
                    </Dropdown>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      {/* Candidate preview drawer */}
      <Drawer
        open={!!previewApp}
        onClose={() => setPreviewId(null)}
        width={Math.min(560, window.innerWidth - 24)}
        destroyOnClose
        title={null}
        closable={false}
        headerStyle={{ display: "none" }}
        bodyStyle={{ padding: 0 }}
      >
        {previewApp && (
          <div>
            <div className="border-b border-white/[0.05] px-6 py-5">
              <div className="flex items-start gap-4">
                <Avatar
                  src={previewApp.candidate.avatarUrl}
                  size={52}
                  className="!bg-white/[0.04] !text-grey-300"
                >
                  {initials(previewApp.candidate.fullName)}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[17px] font-semibold text-white">
                    {previewApp.candidate.fullName}
                  </h2>
                  <div className="mt-0.5 text-[12.5px] text-grey-400">
                    {titleCase(previewApp.candidate.position)} ·{" "}
                    {previewApp.candidate.yearsExperience}y exp ·{" "}
                    {previewApp.candidate.nationality}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge
                      kind="application"
                      value={previewApp.status}
                      variant="chip"
                    />
                    {previewApp.matchScore !== undefined && (
                      <span className="rounded-md bg-teal-500/[0.08] px-1.5 py-0.5 text-[11px] font-medium text-teal-300 ring-1 ring-teal-500/20">
                        Match {previewApp.matchScore}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <Section title="Applied to">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                  <Link
                    to={`/admin/jobs/${previewApp.job.id}`}
                    className="text-[13px] font-medium text-white hover:text-teal-300"
                  >
                    {previewApp.job.title}
                  </Link>
                  <div className="text-[11.5px] text-grey-500">
                    {previewApp.job.yacht} · {previewApp.job.location}
                  </div>
                  <div className="mt-1 text-[11.5px] text-grey-500">
                    Owner: {previewApp.owner.name}
                  </div>
                </div>
              </Section>

              {previewApp.coverLetter && (
                <Section title="Cover letter">
                  <p className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 text-[13px] leading-relaxed text-grey-200">
                    {previewApp.coverLetter}
                  </p>
                </Section>
              )}

              <Section title="Timeline">
                <div className="grid grid-cols-2 gap-3">
                  <KV
                    label="Applied"
                    value={`${formatDate(previewApp.appliedAt)} (${fromNow(previewApp.appliedAt)})`}
                  />
                  <KV
                    label="Updated"
                    value={fromNow(previewApp.updatedAt)}
                  />
                </div>
              </Section>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  disabled={previewApp.status === "accepted"}
                  onClick={() => onChangeStatus(previewApp.id, "accepted")}
                >
                  Accept
                </Button>
                <Button
                  disabled={previewApp.status === "shortlisted"}
                  onClick={() => onChangeStatus(previewApp.id, "shortlisted")}
                >
                  Shortlist
                </Button>
                <Button
                  disabled={previewApp.status === "interviewing"}
                  onClick={() => onChangeStatus(previewApp.id, "interviewing")}
                >
                  Interviewing
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  disabled={previewApp.status === "rejected"}
                  onClick={() => onChangeStatus(previewApp.id, "rejected")}
                >
                  Reject
                </Button>
                <Link
                  to={`/admin/crew/${previewApp.candidate.id}`}
                  className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-grey-400 hover:text-white"
                >
                  Open profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

/* ============================================================ */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <GlassPanel padding="md">
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {title}
    </div>
    <div className="mt-2">{children}</div>
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

export default ApplicationsPage;
