import {
  AppstoreOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useListAdminJobsQuery, type AdminJobRow } from "@services/adminApi";
import { formatCurrency, fromNow, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { JobStatus } from "@/types";

const STATUS_OPTIONS: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "paused", label: "Paused" },
  { value: "closed", label: "Closed" },
  { value: "filled", label: "Filled" },
  { value: "draft", label: "Draft" },
];

const formatSalary = (s: AdminJobRow["salary"]) => {
  const lo = formatCurrency(s.min, s.currency);
  const hi = formatCurrency(s.max, s.currency);
  return `${lo} – ${hi}/${s.period[0]}`;
};

export const JobManagementPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const debouncedSearch = useDebouncedValue(search, 200);

  const { data: jobs = [], isLoading, refetch, isFetching } = useListAdminJobsQuery({
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  });

  const summary = useMemo(() => {
    const totals = jobs.reduce(
      (acc, j) => {
        acc.applications += j.stats.total;
        acc.accepted += j.stats.accepted;
        acc.rejected += j.stats.rejected;
        acc.pending += j.stats.pending;
        acc.shortlisted += j.stats.shortlisted;
        return acc;
      },
      {
        applications: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
        shortlisted: 0,
      },
    );
    return { ...totals, total: jobs.length };
  }, [jobs]);

  const hasFilters = !!debouncedSearch || status !== "all";

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Job Management"
        subtitle="Monitor all live listings, hiring activity and applications across the platform."
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryTile label="Applications" value={summary.applications} tone="white" />
        <SummaryTile label="Pending" value={summary.pending} tone="gold" />
        <SummaryTile label="Shortlisted" value={summary.shortlisted} tone="gold" />
        <SummaryTile label="Accepted" value={summary.accepted} tone="teal" />
        <SummaryTile label="Rejected" value={summary.rejected} tone="danger" />
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[1.8fr_1fr]">
        <Input
          allowClear
          placeholder="Search job, yacht, location…"
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
        ) : jobs.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<AppstoreOutlined />}
              title={hasFilters ? "No jobs match those filters" : "No jobs yet"}
              description={
                hasFilters
                  ? "Try clearing the search or status filter."
                  : "Jobs posted by vessel owners will appear here."
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
          <DataTable<AdminJobRow>
            dataSource={jobs}
            rowKey="id"
            scroll={{ x: 1200 }}
            columns={[
              {
                title: "Job",
                dataIndex: "title",
                width: 260,
                render: (_: unknown, row) => (
                  <Link to={`/admin/jobs/${row.id}`} className="block min-w-0">
                    <div className="truncate text-[13.5px] font-medium text-white">
                      {row.title}
                    </div>
                    <div className="truncate text-[11.5px] text-grey-500">
                      {row.yacht.name} · {titleCase(row.yacht.type)}
                    </div>
                  </Link>
                ),
              },
              {
                title: "Location",
                dataIndex: "location",
                width: 170,
                responsive: ["md"],
                render: (v: string) => (
                  <span className="text-[12.5px] text-grey-300">{v}</span>
                ),
              },
              {
                title: "Salary",
                dataIndex: "salary",
                width: 180,
                responsive: ["lg"],
                render: (_: unknown, row) => (
                  <span className="text-[12.5px] text-grey-300">
                    {formatSalary(row.salary)}
                  </span>
                ),
              },
              {
                title: "Posted",
                dataIndex: "createdAt",
                width: 110,
                responsive: ["xl"],
                render: (v: string) => (
                  <span className="text-[11.5px] text-grey-500">
                    {fromNow(v)}
                  </span>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                width: 110,
                render: (v: JobStatus) => (
                  <StatusBadge kind="job" value={v} variant="chip" />
                ),
              },
              {
                title: "Apps",
                dataIndex: "stats",
                width: 60,
                render: (_: unknown, row) => (
                  <span className="text-[12.5px] font-medium text-white">
                    {row.stats.total}
                  </span>
                ),
              },
              {
                title: "Pipeline",
                dataIndex: "pipeline",
                width: 220,
                responsive: ["xl"],
                render: (_: unknown, row) => (
                  <div className="flex items-center gap-1 text-[11px]">
                    <Pill tone="gold" label={`${row.stats.pending}P`} />
                    <Pill tone="gold" label={`${row.stats.shortlisted}S`} />
                    <Pill tone="white" label={`${row.stats.interviewing}I`} />
                    <Pill tone="teal" label={`${row.stats.accepted}A`} />
                    <Pill tone="danger" label={`${row.stats.rejected}R`} />
                  </div>
                ),
              },
              {
                title: "",
                width: 48,
                align: "right",
                render: (_: unknown, row) => (
                  <Tooltip title="Open job">
                    <Link
                      to={`/admin/jobs/${row.id}`}
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
      </div>
    </div>
  );
};

const Pill = ({
  tone,
  label,
}: {
  tone: "gold" | "white" | "teal" | "danger";
  label: string;
}) => (
  <span
    className={cn(
      "rounded-md px-1.5 py-0.5 ring-1",
      tone === "gold" && "bg-gold-500/[0.08] text-gold-400 ring-gold-500/20",
      tone === "teal" && "bg-teal-500/[0.08] text-teal-300 ring-teal-500/20",
      tone === "white" && "bg-white/[0.04] text-grey-300 ring-white/[0.06]",
      tone === "danger" && "bg-[#AA2727]/[0.10] text-[#C24545] ring-[#AA2727]/20",
    )}
  >
    {label}
  </span>
);

const SummaryTile = ({
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

export default JobManagementPage;
