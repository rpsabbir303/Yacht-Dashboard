import { EyeOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Segmented, Select } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useListAdminUsersQuery } from "@services/adminApi";
import { initials, formatDate, fromNow } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  AdminAccountStatus,
  AdminUserSummary,
  UserRole,
} from "@/types";

type RoleFilter = "all" | "owner" | "captain" | "agent";

const STATUS_FILTERS: { label: string; value: AdminAccountStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending-verification" },
  { label: "Warned", value: "warned" },
  { label: "Suspended", value: "suspended" },
  { label: "Banned", value: "banned" },
];

export const UsersListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 220);
  const [status, setStatus] = useState<AdminAccountStatus | "all">("all");
  const [role, setRole] = useState<RoleFilter>("all");

  const { data, isLoading } = useListAdminUsersQuery({
    search: debounced || undefined,
    status: status === "all" ? undefined : status,
    role: role === "all" ? undefined : role,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        subtitle="Monitor accounts, manage verification and take action on bad actors."
      />

      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-4">
          <Segmented
            value={status}
            onChange={(v) => setStatus(v as AdminAccountStatus | "all")}
            options={STATUS_FILTERS}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select<RoleFilter>
              value={role}
              onChange={setRole}
              options={[
                { label: "All roles", value: "all" },
                { label: "Owner", value: "owner" },
                { label: "Captain / Crew", value: "captain" },
                { label: "Agent", value: "agent" },
              ]}
              style={{ width: 160 }}
            />
            <Input.Search
              allowClear
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[280px]"
            />
          </div>
        </div>

        <DataTable<AdminUserSummary>
          loading={isLoading}
          dataSource={data ?? []}
          locale={{
            emptyText: (
              <EmptyState
                title="No users match those filters"
                description="Try widening your search or clearing filters."
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/users/${record.id}`),
            className: "cursor-pointer",
          })}
          columns={[
            {
              title: "User",
              dataIndex: "fullName",
              render: (_: unknown, u: AdminUserSummary) => (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={u.avatarUrl}
                    className="!bg-white/[0.04] !text-grey-400"
                  >
                    {initials(u.fullName)}
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-medium text-white">
                        {u.fullName}
                      </span>
                      {u.verified && (
                        <span className="rounded-md bg-teal-500/10 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/20">
                          Verified
                        </span>
                      )}
                      {u.adminRole && (
                        <span className="rounded-md bg-gold-500/10 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-gold-400 ring-1 ring-gold-500/20">
                          {u.adminRole === "super-admin" ? "Super" : u.adminRole === "moderator" ? "Mod" : "Support"}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[12px] text-grey-500">
                      {u.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Role",
              dataIndex: "role",
              width: 120,
              render: (v: UserRole) => (
                <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-grey-400">
                  {v}
                </span>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 180,
              render: (v: AdminAccountStatus) => (
                <StatusBadge kind="account" value={v} variant="chip" />
              ),
            },
            {
              title: "Reports",
              dataIndex: "reportsAgainst",
              width: 90,
              render: (v?: number) => (
                <span
                  className={cn(
                    "text-[12.5px]",
                    (v ?? 0) === 0
                      ? "text-grey-500"
                      : (v ?? 0) >= 5
                        ? "text-[#C24545]"
                        : "text-gold-400",
                  )}
                >
                  {v ?? 0}
                </span>
              ),
            },
            {
              title: "Last active",
              dataIndex: "lastActiveAt",
              width: 160,
              render: (v?: string) =>
                v ? (
                  <span className="text-[12.5px] text-grey-400">
                    {fromNow(v)}
                  </span>
                ) : (
                  <span className="text-[12.5px] text-grey-500">—</span>
                ),
            },
            {
              title: "Joined",
              dataIndex: "joinedAt",
              width: 130,
              render: (v: string) => (
                <span className="text-[12.5px] text-grey-400">
                  {formatDate(v)}
                </span>
              ),
            },
            {
              title: "",
              width: 60,
              align: "right",
              render: (_: unknown, u: AdminUserSummary) => (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/users/${u.id}`);
                  }}
                />
              ),
            },
          ]}
        />
      </GlassPanel>
    </div>
  );
};

export default UsersListPage;
