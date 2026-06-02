import {
  CustomerServiceOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Select, message } from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import {
  useListSupportTicketsQuery,
  useUpdateSupportTicketStatusMutation,
} from "@services/adminApi";
import { formatTableDateShort, fromNow } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketSummary,
  SupportUserRole,
} from "@/types";
import { SUPPORT_CATEGORY_LABEL, SUPPORT_ROLE_LABEL } from "@/types";

const STATUS_TABS: { value: SupportTicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const ROLE_OPTIONS: { value: SupportUserRole | "all"; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "crew", label: "Crew" },
  { value: "owner", label: "Owner" },
];

const PRIORITY_OPTIONS: {
  value: SupportTicketPriority | "all";
  label: string;
}[] = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CATEGORY_OPTIONS: {
  value: SupportTicketCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "All categories" },
  ...(
    Object.entries(SUPPORT_CATEGORY_LABEL) as [
      SupportTicketCategory,
      string,
    ][]
  ).map(([value, label]) => ({ value, label })),
];

export const SupportCenterPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupportTicketStatus | "all">("all");
  const [userRole, setUserRole] = useState<SupportUserRole | "all">("all");
  const [priority, setPriority] = useState<SupportTicketPriority | "all">("all");
  const [category, setCategory] = useState<SupportTicketCategory | "all">("all");

  const debouncedSearch = useDebouncedValue(search, 200);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status,
      userRole,
      priority,
      category,
    }),
    [debouncedSearch, status, userRole, priority, category],
  );

  const { data, isLoading, refetch, isFetching } =
    useListSupportTicketsQuery(params);
  const tickets = data?.tickets ?? [];
  const summary = data?.summary ?? {
    open: 0,
    pending: 0,
    resolvedToday: 0,
    highPriority: 0,
  };

  const [updateStatus] = useUpdateSupportTicketStatusMutation();

  const onStatusChange = async (
    row: SupportTicketSummary,
    next: SupportTicketStatus,
  ) => {
    try {
      await updateStatus({ id: row.id, status: next }).unwrap();
      message.success(`Ticket marked as ${next}`);
    } catch {
      message.error("Failed to update ticket status");
    }
  };

  const actionMenu = (row: SupportTicketSummary): MenuProps["items"] => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View Ticket",
      onClick: () => navigate(`/admin/support/${row.id}`),
    },
    { type: "divider" },
    {
      key: "pending",
      label: "Mark Pending",
      disabled: row.status === "pending",
      onClick: () => onStatusChange(row, "pending"),
    },
    {
      key: "resolved",
      label: "Mark Resolved",
      disabled: row.status === "resolved",
      onClick: () => onStatusChange(row, "resolved"),
    },
    {
      key: "closed",
      label: "Close Ticket",
      danger: true,
      disabled: row.status === "closed",
      onClick: () => onStatusChange(row, "closed"),
    },
  ];

  const hasFilters =
    !!debouncedSearch ||
    status !== "all" ||
    userRole !== "all" ||
    priority !== "all" ||
    category !== "all";

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setUserRole("all");
    setPriority("all");
    setCategory("all");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Support Center"
        subtitle="Manage customer support requests, resolve issues, and communicate with platform users."
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Open tickets" value={summary.open} tone="teal" />
        <SummaryTile label="Pending tickets" value={summary.pending} tone="gold" />
        <SummaryTile
          label="Resolved today"
          value={summary.resolvedToday}
          tone="white"
        />
        <SummaryTile
          label="High priority"
          value={summary.highPriority}
          tone={summary.highPriority > 0 ? "danger" : "white"}
        />
      </div>

      {/* Status tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
              status === tab.value
                ? "bg-teal-500 text-white shadow-[0_8px_24px_-12px_rgba(34,199,184,0.55)]"
                : "border border-white/[0.08] bg-surface text-grey-400 hover:border-teal-500/35 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Additional filters + search */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <Input
          allowClear
          placeholder="Search ticket ID, name, email, subject…"
          prefix={<SearchOutlined className="text-grey-500" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={userRole}
          onChange={setUserRole}
          options={ROLE_OPTIONS}
          className="!w-full"
        />
        <Select
          value={priority}
          onChange={setPriority}
          options={PRIORITY_OPTIONS}
          className="!w-full"
        />
        <Select
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          className="!w-full"
        />
      </div>

      {/* Table */}
      <div className="mt-5">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : tickets.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<CustomerServiceOutlined />}
              title={
                hasFilters
                  ? "No tickets match those filters"
                  : "No support tickets yet"
              }
              description={
                hasFilters
                  ? "Try adjusting your search or clearing some filters."
                  : "Support requests from crew and owners will appear here."
              }
              action={
                hasFilters && (
                  <Button onClick={resetFilters}>Clear filters</Button>
                )
              }
            />
          </div>
        ) : (
          <DataTable<SupportTicketSummary>
            className="support-tickets-table"
            dataSource={tickets}
            rowKey="id"
            tableLayout="fixed"
            scroll={{ x: 1520 }}
            columns={[
              {
                title: "Ticket ID",
                dataIndex: "ticketNumber",
                width: 110,
                fixed: "left",
                render: (v: string, row) => (
                  <Link
                    to={`/admin/support/${row.id}`}
                    className="font-mono text-[12.5px] font-medium text-teal-300 hover:text-teal-200"
                  >
                    {v}
                  </Link>
                ),
              },
              {
                title: "User",
                dataIndex: "userName",
                width: 160,
                render: (v: string) => (
                  <span className="text-[13px] font-medium text-white">{v}</span>
                ),
              },
              {
                title: "Role",
                dataIndex: "userRole",
                width: 90,
                render: (v: SupportUserRole) => (
                  <span className="text-[12.5px] text-grey-300">
                    {SUPPORT_ROLE_LABEL[v]}
                  </span>
                ),
              },
              {
                title: "Email",
                dataIndex: "email",
                width: 200,
                ellipsis: { showTitle: true },
                responsive: ["lg"],
                render: (v: string) => (
                  <CellEllipsis className="text-[12px] text-grey-400">
                    {v}
                  </CellEllipsis>
                ),
              },
              {
                title: "Subject",
                dataIndex: "subject",
                width: 240,
                ellipsis: { showTitle: true },
                render: (v: string) => (
                  <CellEllipsis className="text-[13px] text-white">
                    {v}
                  </CellEllipsis>
                ),
              },
              {
                title: "Category",
                dataIndex: "category",
                width: 160,
                responsive: ["md"],
                render: (v: SupportTicketCategory) => (
                  <span className="text-[12px] text-grey-300">
                    {SUPPORT_CATEGORY_LABEL[v]}
                  </span>
                ),
              },
              {
                title: "Priority",
                dataIndex: "priority",
                width: 110,
                render: (v: SupportTicketPriority) => (
                  <StatusBadge kind="support-priority" value={v} variant="chip" />
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                width: 120,
                align: "left",
                className: "support-tickets-table__status-col",
                render: (v: SupportTicketStatus) => (
                  <div className="flex min-w-0 items-center">
                    <StatusBadge kind="support-status" value={v} variant="chip" />
                  </div>
                ),
              },
              {
                title: "Created",
                dataIndex: "createdAt",
                width: 96,
                align: "left",
                className: "support-tickets-table__date-col",
                responsive: ["lg"],
                render: (v: string) => (
                  <span
                    className="block truncate text-[13px] tabular-nums text-grey-400"
                    title={formatTableDateShort(v)}
                  >
                    {formatTableDateShort(v)}
                  </span>
                ),
              },
              {
                title: "Updated",
                dataIndex: "updatedAt",
                width: 88,
                align: "left",
                className: "support-tickets-table__date-col",
                responsive: ["xl"],
                render: (v: string) => (
                  <span
                    className="block truncate text-[13px] text-grey-400"
                    title={fromNow(v)}
                  >
                    {fromNow(v)}
                  </span>
                ),
              },
              {
                title: "",
                key: "actions",
                width: 132,
                align: "right",
                fixed: "right",
                className: "support-tickets-table__actions-col",
                render: (_: unknown, row) => (
                  <div className="support-tickets-table__actions">
                    <Link
                      to={`/admin/support/${row.id}`}
                      className="icon-btn icon-btn-sm h-8 w-8 shrink-0"
                      aria-label="View ticket"
                    >
                      <EyeOutlined />
                    </Link>
                    <Dropdown
                      menu={{ items: actionMenu(row) }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <button
                        type="button"
                        className="icon-btn icon-btn-sm h-8 w-8 shrink-0"
                        aria-label="More actions"
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
    </div>
  );
};

/** Truncated cell text — prevents overlap into adjacent columns. */
const CellEllipsis = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => (
  <span
    className={cn(
      "block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
      className,
    )}
    title={children}
  >
    {children}
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
  <div className="surface-card flex items-center justify-between px-4 py-3.5">
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-xl font-bold tracking-tighter2",
          tone === "teal" && "text-teal-300",
          tone === "gold" && "text-gold-400",
          tone === "danger" && "text-[#C24545]",
          tone === "white" && "text-white",
        )}
      >
        {value}
      </div>
    </div>
    <CustomerServiceOutlined className="text-[18px] text-grey-600" />
  </div>
);

export default SupportCenterPage;
