import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Input, Select, Tooltip, message } from "antd";
import { useMemo, useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import { useConfirm } from "@hooks/useConfirm";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import {
  useDecideOwnerVerificationMutation,
  useListOwnersQuery,
  useUpdateOwnerStatusMutation,
} from "@services/adminApi";
import { fromNow, initials } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  AdminAccountStatus,
  OwnerProfile,
  VerificationStatus,
} from "@/types";

import { OwnerDetailsDrawer } from "./components/OwnerDetailsDrawer";

const VERIFICATION_OPTIONS: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in-review", label: "In review" },
  { value: "additional-info", label: "Info requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const OwnerVerificationPage = () => {
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState<VerificationStatus | "all">(
    "all",
  );
  const debouncedSearch = useDebouncedValue(search, 200);

  const { data: owners = [], isLoading, refetch, isFetching } = useListOwnersQuery({
    search: debouncedSearch || undefined,
    verification,
  });

  const [decide] = useDecideOwnerVerificationMutation();
  const [updateStatus] = useUpdateOwnerStatusMutation();
  const confirm = useConfirm();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const drawerOwner = useMemo(
    () => owners.find((o) => o.id === drawerId) ?? null,
    [drawerId, owners],
  );

  const summary = useMemo(() => {
    const pending = owners.filter(
      (o) =>
        o.verificationStatus === "pending" ||
        o.verificationStatus === "in-review",
    ).length;
    const infoRequested = owners.filter(
      (o) => o.verificationStatus === "additional-info",
    ).length;
    const approved = owners.filter(
      (o) => o.verificationStatus === "approved",
    ).length;
    return { total: owners.length, pending, infoRequested, approved };
  }, [owners]);

  const onApprove = async (row: OwnerProfile) => {
    try {
      await decide({ id: row.id, decision: "approved" }).unwrap();
      message.success(`${row.fullName} approved`);
    } catch {
      message.error("Failed to approve");
    }
  };

  const onReject = async (row: OwnerProfile) => {
    const ok = await confirm({
      title: "Reject verification?",
      description: `${row.fullName} will need to resubmit valid documents.`,
      confirmText: "Reject",
      danger: true,
    });
    if (!ok) return;
    try {
      await decide({ id: row.id, decision: "rejected" }).unwrap();
      message.success("Verification rejected");
    } catch {
      message.error("Failed to reject");
    }
  };

  const onSuspend = async (row: OwnerProfile) => {
    const ok = await confirm({
      title: "Suspend account?",
      description: `${row.fullName} will lose platform access until reinstated.`,
      confirmText: "Suspend",
      danger: true,
    });
    if (!ok) return;
    try {
      await updateStatus({
        id: row.id,
        status: "suspended" as AdminAccountStatus,
      }).unwrap();
      message.success("Account suspended");
    } catch {
      message.error("Failed to suspend");
    }
  };

  const hasFilters = !!debouncedSearch || verification !== "all";

  const resetFilters = () => {
    setSearch("");
    setVerification("all");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Owner Verification"
        subtitle="Review vessel owner documents and decide on platform access."
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

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Total owners" value={summary.total} tone="white" />
        <SummaryTile
          label="Pending review"
          value={summary.pending}
          tone="gold"
        />
        <SummaryTile
          label="Info requested"
          value={summary.infoRequested}
          tone={summary.infoRequested > 0 ? "gold" : "white"}
        />
        <SummaryTile
          label="Approved"
          value={summary.approved}
          tone="teal"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[1.8fr_1fr]">
        <Input
          allowClear
          placeholder="Search owner, company, country…"
          prefix={<SearchOutlined className="text-grey-500" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={verification}
          onChange={setVerification}
          options={VERIFICATION_OPTIONS}
          className="!w-full"
        />
      </div>

      {/* Table */}
      <div className="mt-5">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : owners.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<SafetyCertificateOutlined />}
              title={
                hasFilters ? "No owners match those filters" : "No owners yet"
              }
              description={
                hasFilters
                  ? "Try clearing the search or status filter."
                  : "Vessel owners will appear here as they join the platform."
              }
              action={
                hasFilters && (
                  <Button onClick={resetFilters}>Clear filters</Button>
                )
              }
            />
          </div>
        ) : (
          <DataTable<OwnerProfile>
            dataSource={owners}
            rowKey="id"
            scroll={{ x: 1000 }}
            onRow={(row) => ({
              onClick: () => setDrawerId(row.id),
              className: "cursor-pointer",
            })}
            columns={[
              {
                title: "Owner",
                dataIndex: "fullName",
                width: 300,
                render: (_: unknown, row) => (
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={row.avatarUrl}
                      size={36}
                      className="!bg-white/[0.04] !text-grey-400"
                    >
                      {initials(row.fullName)}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-white">
                        {row.fullName}
                      </div>
                      <div className="truncate text-[11.5px] text-grey-500">
                        {row.email}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: "Company",
                dataIndex: "companyName",
                width: 220,
                render: (v: string | undefined, row) => (
                  <div className="min-w-0">
                    <div className="truncate text-[13px] text-white">
                      {v ?? "—"}
                    </div>
                    {row.vatNumber && (
                      <div className="truncate text-[11px] text-grey-500">
                        {row.vatNumber}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Country",
                dataIndex: "country",
                width: 130,
                responsive: ["lg"],
                render: (v: string) => (
                  <span className="text-[12.5px] text-grey-300">{v}</span>
                ),
              },
              {
                title: "Vessels",
                dataIndex: "vessels",
                width: 100,
                responsive: ["md"],
                render: (_: unknown, row) => (
                  <span className="text-[12.5px] text-grey-300">
                    {row.vessels.length}
                  </span>
                ),
              },
              {
                title: "Verification",
                dataIndex: "verificationStatus",
                width: 160,
                render: (_: unknown, row) => (
                  <StatusBadge
                    kind="verification"
                    value={row.verificationStatus}
                    variant="chip"
                  />
                ),
              },
              {
                title: "Account",
                dataIndex: "status",
                width: 150,
                responsive: ["xl"],
                render: (_: unknown, row) => (
                  <StatusBadge
                    kind="account"
                    value={row.status}
                    variant="dot"
                  />
                ),
              },
              {
                title: "Active",
                dataIndex: "lastActiveAt",
                width: 100,
                responsive: ["xxl"],
                render: (_: unknown, row) => (
                  <span className="text-[11.5px] text-grey-500">
                    {fromNow(row.lastActiveAt ?? row.joinedAt)}
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
                    <Tooltip title="View details">
                      <button
                        type="button"
                        onClick={() => setDrawerId(row.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
                        aria-label="View"
                      >
                        <EyeOutlined />
                      </button>
                    </Tooltip>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "approve",
                            icon: <CheckCircleOutlined />,
                            label: "Approve owner",
                            disabled: row.verificationStatus === "approved",
                            onClick: () => onApprove(row),
                          },
                          {
                            key: "reject",
                            icon: <CloseCircleOutlined />,
                            label: "Reject verification",
                            danger: true,
                            disabled: row.verificationStatus === "rejected",
                            onClick: () => onReject(row),
                          },
                          { type: "divider" },
                          {
                            key: "suspend",
                            icon: <StopOutlined />,
                            label: "Suspend account",
                            danger: true,
                            disabled: row.status === "suspended",
                            onClick: () => onSuspend(row),
                          },
                        ],
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <button
                        className="grid h-7 w-7 place-items-center rounded-lg text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
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

      <OwnerDetailsDrawer
        owner={drawerOwner}
        open={!!drawerOwner}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
};

/* ============================================================ */

const SummaryTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "teal" | "gold";
}) => (
  <div className="surface-card flex items-center justify-between px-4 py-3.5">
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-xl font-semibold tracking-tighter2",
          tone === "teal" && "text-teal-300",
          tone === "gold" && "text-gold-400",
          tone === "white" && "text-white",
        )}
      >
        {value}
      </div>
    </div>
    <SafetyCertificateOutlined className="text-[18px] text-grey-600" />
  </div>
);

export default OwnerVerificationPage;
