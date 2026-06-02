import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Progress,
  Select,
  Tooltip,
  message,
} from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import { useConfirm } from "@hooks/useConfirm";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import {
  useDecideCrewVerificationMutation,
  useListCrewQuery,
  useUpdateCrewStatusMutation,
} from "@services/adminApi";
import { fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  AdminAccountStatus,
  CrewAvailability,
  CrewPosition,
  CrewProfile,
} from "@/types";

const POSITION_OPTIONS: { value: CrewPosition | "all"; label: string }[] = [
  { value: "all", label: "All positions" },
  { value: "captain", label: "Captain" },
  { value: "chief-officer", label: "Chief Officer" },
  { value: "second-officer", label: "Second Officer" },
  { value: "engineer", label: "Engineer" },
  { value: "chief-stewardess", label: "Chief Stewardess" },
  { value: "stewardess", label: "Stewardess" },
  { value: "chef", label: "Chef" },
  { value: "sous-chef", label: "Sous Chef" },
  { value: "deckhand", label: "Deckhand" },
  { value: "bosun", label: "Bosun" },
];

const AVAILABILITY_OPTIONS: { value: CrewAvailability | "all"; label: string }[] = [
  { value: "all", label: "Any availability" },
  { value: "available", label: "Available" },
  { value: "on-contract", label: "On contract" },
  { value: "unavailable", label: "Unavailable" },
];

export const CrewManagementPage = () => {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<CrewPosition | "all">("all");
  const [nationality, setNationality] = useState("");
  const [certification, setCertification] = useState("");
  const [availability, setAvailability] = useState<CrewAvailability | "all">(
    "all",
  );

  const debouncedSearch = useDebouncedValue(search, 200);
  const debouncedNationality = useDebouncedValue(nationality, 200);
  const debouncedCertification = useDebouncedValue(certification, 200);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      position,
      nationality: debouncedNationality || undefined,
      certification: debouncedCertification || undefined,
      availability,
    }),
    [
      debouncedSearch,
      position,
      debouncedNationality,
      debouncedCertification,
      availability,
    ],
  );

  const { data: crew = [], isLoading, refetch, isFetching } = useListCrewQuery(
    params,
  );
  const [decide] = useDecideCrewVerificationMutation();
  const [updateStatus] = useUpdateCrewStatusMutation();
  const confirm = useConfirm();

  /* ----- summary chips ----- */
  const summary = useMemo(() => {
    const pending = crew.filter(
      (c) =>
        c.verificationStatus === "pending" ||
        c.verificationStatus === "in-review",
    ).length;
    const available = crew.filter((c) => c.availability === "available").length;
    const suspended = crew.filter((c) => c.status === "suspended").length;
    return { total: crew.length, pending, available, suspended };
  }, [crew]);

  /* ----- action handlers ----- */
  const onApprove = async (row: CrewProfile) => {
    try {
      await decide({ id: row.id, decision: "approved" }).unwrap();
      message.success(`${row.fullName} approved`);
    } catch {
      message.error("Failed to approve crew");
    }
  };

  const onReject = async (row: CrewProfile) => {
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

  const onSuspend = async (row: CrewProfile) => {
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
      message.error("Failed to suspend account");
    }
  };

  const hasFilters =
    !!debouncedSearch ||
    position !== "all" ||
    !!debouncedNationality ||
    !!debouncedCertification ||
    availability !== "all";

  const resetFilters = () => {
    setSearch("");
    setPosition("all");
    setNationality("");
    setCertification("");
    setAvailability("all");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Crew Management"
        subtitle="Review crew profiles, verify documents and manage account standing."
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
        <SummaryTile label="Total crew" value={summary.total} tone="white" />
        <SummaryTile label="Pending review" value={summary.pending} tone="gold" />
        <SummaryTile label="Available" value={summary.available} tone="teal" />
        <SummaryTile
          label="Suspended"
          value={summary.suspended}
          tone={summary.suspended > 0 ? "danger" : "white"}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <Input
          allowClear
          placeholder="Search crew, email, country…"
          prefix={<SearchOutlined className="text-grey-500" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={position}
          onChange={setPosition}
          options={POSITION_OPTIONS}
          className="!w-full"
        />
        <Input
          allowClear
          placeholder="Nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        />
        <Input
          allowClear
          placeholder="Certification"
          value={certification}
          onChange={(e) => setCertification(e.target.value)}
        />
        <Select
          value={availability}
          onChange={setAvailability}
          options={AVAILABILITY_OPTIONS}
          className="!w-full"
        />
      </div>

      {/* Table */}
      <div className="mt-5">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : crew.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<TeamOutlined />}
              title={hasFilters ? "No crew matches those filters" : "No crew yet"}
              description={
                hasFilters
                  ? "Try widening the search or clearing some filters."
                  : "Crew members will appear here as they join the platform."
              }
              action={
                hasFilters && (
                  <Button onClick={resetFilters}>Clear filters</Button>
                )
              }
            />
          </div>
        ) : (
          <DataTable<CrewProfile>
            dataSource={crew}
            rowKey="id"
            scroll={{ x: 1100 }}
            columns={[
              {
                title: "Crew member",
                dataIndex: "fullName",
                width: 280,
                render: (_: unknown, row) => (
                  <Link
                    to={`/admin/crew/${row.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      src={row.avatarUrl}
                      size={36}
                      className="!bg-white/[0.05] !text-grey-400"
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
                  </Link>
                ),
              },
              {
                title: "Position",
                dataIndex: "position",
                width: 160,
                render: (v: CrewPosition) => (
                  <span className="text-[12.5px] text-white">
                    {titleCase(v)}
                  </span>
                ),
              },
              {
                title: "Nationality",
                dataIndex: "nationality",
                width: 130,
                responsive: ["lg"],
                render: (_: unknown, row) => (
                  <span className="text-[12.5px] text-grey-300">
                    {row.nationality}
                  </span>
                ),
              },
              {
                title: "Experience",
                dataIndex: "yearsExperience",
                width: 110,
                responsive: ["xl"],
                render: (v: number) => (
                  <span className="text-[12.5px] text-grey-300">{v}y</span>
                ),
              },
              {
                title: "Verification",
                dataIndex: "verificationStatus",
                width: 150,
                render: (_: unknown, row) => (
                  <StatusBadge
                    kind="verification"
                    value={row.verificationStatus}
                    variant="chip"
                  />
                ),
              },
              {
                title: "Availability",
                dataIndex: "availability",
                width: 140,
                responsive: ["md"],
                render: (_: unknown, row) => (
                  <StatusBadge
                    kind="availability"
                    value={row.availability}
                    variant="dot"
                  />
                ),
              },
              {
                title: "Profile",
                dataIndex: "profileCompletion",
                width: 130,
                responsive: ["xl"],
                render: (v: number) => (
                  <div className="flex items-center gap-2">
                    <Progress
                      percent={v}
                      size="small"
                      showInfo={false}
                      strokeColor={v >= 80 ? "#22C7B8" : v >= 60 ? "#D4B25F" : "#64748B"}
                      trailColor="rgba(255,255,255,0.08)"
                      className="!m-0 !w-[60px]"
                    />
                    <span className="text-[11.5px] text-grey-400">{v}%</span>
                  </div>
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
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip title="View profile">
                      <Link
                        to={`/admin/crew/${row.id}`}
                        className="icon-btn icon-btn-sm h-7 w-7"
                        aria-label="View"
                      >
                        <EyeOutlined />
                      </Link>
                    </Tooltip>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "approve",
                            icon: <CheckCircleOutlined />,
                            label: "Approve verification",
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
                        className="icon-btn icon-btn-sm h-7 w-7"
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

/* ============================================================ */
/*  Summary tile                                                */
/* ============================================================ */

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
    <SafetyCertificateOutlined className="text-[18px] text-grey-600" />
  </div>
);

export default CrewManagementPage;
