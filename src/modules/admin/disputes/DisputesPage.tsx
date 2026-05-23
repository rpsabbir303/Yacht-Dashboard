import { EyeOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Segmented } from "antd";
import { useMemo, useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useListDisputesQuery } from "@services/adminApi";
import { initials, formatCurrency, fromNow, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { Dispute, DisputeStatus } from "@/types";

import { DisputeDetailsDrawer } from "./components/DisputeDetailsDrawer";

const FILTERS: { label: string; value: DisputeStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Under review", value: "under-review" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

export const DisputesPage = () => {
  const [filter, setFilter] = useState<DisputeStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 200);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading } = useListDisputesQuery(
    filter === "all" ? undefined : filter,
  );

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = debounced.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.reference.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        (d.jobTitle ?? "").toLowerCase().includes(q) ||
        d.openedBy.name.toLowerCase().includes(q) ||
        d.against.name.toLowerCase().includes(q),
    );
  }, [data, debounced]);

  const active = useMemo(
    () => rows.find((d) => d.id === activeId) ?? null,
    [rows, activeId],
  );

  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      open: all.filter((d) => d.status === "open").length,
      review: all.filter((d) => d.status === "under-review").length,
      resolved: all.filter((d) => d.status === "resolved").length,
    };
  }, [data]);

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Disputes"
        subtitle="Manage complaints between owners, crew and agents through a structured resolution workflow."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile label="Open" value={counts.open} tone="white" />
        <KpiTile label="Under review" value={counts.review} tone="gold" />
        <KpiTile label="Resolved (this period)" value={counts.resolved} tone="teal" />
      </div>

      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-4">
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as DisputeStatus | "all")}
            options={FILTERS}
          />
          <Input.Search
            allowClear
            placeholder="Search by reference, party or job…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[300px]"
          />
        </div>

        <DataTable<Dispute>
          loading={isLoading}
          dataSource={rows}
          locale={{
            emptyText: (
              <EmptyState
                title="No disputes match"
                description="When complaints are filed they'll appear here."
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => setActiveId(record.id),
            className: "cursor-pointer",
          })}
          columns={[
            {
              title: "Reference",
              dataIndex: "reference",
              width: 200,
              render: (v: string, d: Dispute) => (
                <div className="min-w-0">
                  <div className="font-mono text-[12px] text-grey-400">{v}</div>
                  <div className="mt-0.5 truncate text-[13px] font-medium text-white">
                    {d.jobTitle ?? titleCase(d.kind)}
                  </div>
                </div>
              ),
            },
            {
              title: "Parties",
              width: 280,
              render: (_: unknown, d: Dispute) => (
                <div className="flex items-center gap-2">
                  <Party person={d.openedBy} />
                  <span className="text-grey-500">vs</span>
                  <Party person={d.against} />
                </div>
              ),
            },
            {
              title: "Kind",
              dataIndex: "kind",
              width: 140,
              render: (v: string) => (
                <span className="text-[12.5px] text-white">
                  {titleCase(v)}
                </span>
              ),
            },
            {
              title: "Amount",
              dataIndex: "amount",
              width: 120,
              render: (v: Dispute["amount"]) =>
                v ? (
                  <span className="text-[12.5px] text-white">
                    {formatCurrency(v.value, v.currency)}
                  </span>
                ) : (
                  <span className="text-[12.5px] text-grey-500">—</span>
                ),
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 160,
              render: (v: DisputeStatus) => (
                <StatusBadge kind="dispute" value={v} variant="chip" />
              ),
            },
            {
              title: "Opened",
              dataIndex: "openedAt",
              width: 140,
              render: (v: string) => (
                <span className="text-[12.5px] text-grey-400">
                  {fromNow(v)}
                </span>
              ),
            },
            {
              title: "",
              width: 60,
              align: "right",
              render: (_: unknown, d: Dispute) => (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(d.id);
                  }}
                />
              ),
            },
          ]}
        />
      </GlassPanel>

      <DisputeDetailsDrawer dispute={active} onClose={() => setActiveId(null)} />
    </div>
  );
};

const Party = ({
  person,
}: {
  person: { name: string; avatarUrl?: string };
}) => (
  <div className="flex items-center gap-1.5">
    <Avatar
      size={22}
      src={person.avatarUrl}
      className="!bg-white/[0.04] !text-grey-400"
    >
      {initials(person.name)}
    </Avatar>
    <span className="truncate text-[12px] text-grey-400">{person.name}</span>
  </div>
);

const KpiTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "gold" | "teal";
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
        tone === "white" && "bg-white",
        tone === "gold" && "bg-gold-500",
        tone === "teal" && "bg-teal-400",
      )}
    />
  </div>
);

export default DisputesPage;
