import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Segmented } from "antd";
import { useMemo, useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useListVerificationsQuery } from "@services/adminApi";
import { initials, formatDate, fromNow } from "@utils/format";
import { cn } from "@utils/cn";
import type { VerificationRequest, VerificationStatus } from "@/types";

import { VerificationDetailsDrawer } from "./components/VerificationDetailsDrawer";

const FILTERS: { label: string; value: VerificationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In review", value: "in-review" },
  { label: "Info requested", value: "additional-info" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const VerificationsPage = () => {
  const [filter, setFilter] = useState<VerificationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 200);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useListVerificationsQuery(
    filter === "all" ? undefined : filter,
  );

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = debounced.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.subject.name.toLowerCase().includes(q) ||
        r.subject.email.toLowerCase().includes(q),
    );
  }, [data, debounced]);

  const active = useMemo(
    () => filtered.find((r) => r.id === activeId) ?? null,
    [filtered, activeId],
  );

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      pending: all.filter((r) => r.status === "pending").length,
      review: all.filter((r) => r.status === "in-review").length,
      info: all.filter((r) => r.status === "additional-info").length,
    };
  }, [data]);

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Verification queue"
        subtitle="Approve, reject and request additional information from crew, owners and agents."
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Refresh
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile label="Pending" value={stats.pending} tone="neutral" />
        <KpiTile label="In review" value={stats.review} tone="white" />
        <KpiTile label="Info requested" value={stats.info} tone="gold" />
      </div>

      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-4">
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as VerificationStatus | "all")}
            options={FILTERS}
          />
          <Input.Search
            allowClear
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[280px]"
          />
        </div>

        <DataTable<VerificationRequest>
          loading={isLoading}
          dataSource={filtered}
          locale={{
            emptyText: (
              <EmptyState
                title="No verifications match"
                description="Try a different filter or refresh the queue."
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => setActiveId(record.id),
            className: "cursor-pointer",
          })}
          columns={[
            {
              title: "Applicant",
              dataIndex: "subject",
              render: (_: unknown, r: VerificationRequest) => (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={r.subject.avatarUrl}
                    className="!bg-white/[0.04] !text-grey-400"
                  >
                    {initials(r.subject.name)}
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-medium text-white">
                      {r.subject.name}
                    </div>
                    <div className="truncate text-[12px] text-grey-500">
                      {r.subject.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Type",
              dataIndex: "subjectType",
              width: 120,
              render: (v: string) => (
                <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-grey-400">
                  {v}
                </span>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 160,
              render: (v: VerificationStatus) => (
                <StatusBadge kind="verification" value={v} variant="chip" />
              ),
            },
            {
              title: "Risk",
              dataIndex: "riskScore",
              width: 110,
              render: (v?: number) => <RiskCell score={v ?? 0} />,
            },
            {
              title: "Submitted",
              dataIndex: "submittedAt",
              width: 180,
              render: (v: string) => (
                <div className="text-[12.5px] text-grey-400">
                  <div>{formatDate(v)}</div>
                  <div className="text-[11px] text-grey-500">{fromNow(v)}</div>
                </div>
              ),
            },
            {
              title: "",
              width: 60,
              align: "right",
              render: (_: unknown, r: VerificationRequest) => (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(r.id);
                  }}
                />
              ),
            },
          ]}
        />
      </GlassPanel>

      <VerificationDetailsDrawer
        request={active}
        onClose={() => setActiveId(null)}
      />
    </div>
  );
};

const KpiTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "white" | "gold";
}) => (
  <div className="surface-card flex items-center justify-between px-5 py-4">
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tighter2 text-white">
        {value}
      </div>
    </div>
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        tone === "gold" && "bg-gold-500",
        tone === "white" && "bg-white",
        tone === "neutral" && "bg-grey-500",
      )}
    />
  </div>
);

const RiskCell = ({ score }: { score: number }) => {
  const tone =
    score >= 70
      ? { bar: "bg-[#AA2727]", text: "text-[#C24545]" }
      : score >= 40
        ? { bar: "bg-gold-500", text: "text-gold-400" }
        : { bar: "bg-teal-400", text: "text-teal-300" };
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={cn("h-full", tone.bar)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("text-[12px]", tone.text)}>{score}</span>
    </div>
  );
};

export default VerificationsPage;
