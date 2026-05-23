import {
  DeleteOutlined,
  StopOutlined,
  WarningOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Input, Segmented, message } from "antd";
import { useMemo, useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { EmptyState } from "@components/feedback/EmptyState";
import { useConfirm } from "@hooks/useConfirm";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import {
  useDecideJobReportMutation,
  useListJobReportsQuery,
} from "@services/adminApi";
import { initials, fromNow, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { JobReport, ReportStatus } from "@/types";

const FILTERS: { label: string; value: ReportStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
];

export const ReportedJobsPage = () => {
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 200);
  const confirm = useConfirm();

  const { data, isLoading } = useListJobReportsQuery(
    filter === "all" ? undefined : filter,
  );
  const [decide] = useDecideJobReportMutation();

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = debounced.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.job.title.toLowerCase().includes(q) ||
        r.job.yacht.name.toLowerCase().includes(q) ||
        r.job.postedByName.toLowerCase().includes(q),
    );
  }, [data, debounced]);

  const act = async (
    id: string,
    action: "remove" | "suspend" | "warn" | "dismiss",
    confirmCopy: { title: string; danger: boolean },
  ) => {
    const ok = await confirm({
      ...confirmCopy,
      description:
        "This action will be recorded in the audit trail. The poster will be notified.",
      confirmText: titleCase(action),
    });
    if (!ok) return;
    try {
      await decide({ id, action }).unwrap();
      message.success("Action recorded");
    } catch {
      message.error("Action failed. Please try again.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Moderation"
        title="Reported jobs"
        subtitle="Triage flagged listings — remove, suspend or dismiss based on the evidence."
      />

      <GlassPanel padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-4">
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as ReportStatus | "all")}
            options={FILTERS}
          />
          <Input.Search
            allowClear
            placeholder="Search by job, yacht or poster…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[300px]"
          />
        </div>

        <DataTable<JobReport>
          loading={isLoading}
          dataSource={rows}
          locale={{
            emptyText: (
              <EmptyState
                title="No reports here"
                description="When users flag listings they'll appear in this queue."
              />
            ),
          }}
          columns={[
            {
              title: "Job",
              dataIndex: ["job", "title"],
              render: (_: unknown, r: JobReport) => (
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium text-white">
                    {r.job.title}
                  </div>
                  <div className="truncate text-[12px] text-grey-500">
                    {r.job.yacht.name} · {r.job.yacht.length}m
                  </div>
                </div>
              ),
            },
            {
              title: "Posted by",
              dataIndex: ["job", "postedByName"],
              width: 200,
              render: (_: unknown, r: JobReport) => (
                <div className="flex items-center gap-2">
                  <Avatar
                    size={28}
                    className="!bg-white/[0.04] !text-grey-400"
                  >
                    {initials(r.job.postedByName)}
                  </Avatar>
                  <span className="truncate text-[12.5px] text-grey-400">
                    {r.job.postedByName}
                  </span>
                </div>
              ),
            },
            {
              title: "Reason",
              dataIndex: "reason",
              width: 140,
              render: (v: string) => (
                <span className="text-[12.5px] text-white">
                  {titleCase(v)}
                </span>
              ),
            },
            {
              title: "Severity",
              dataIndex: "severity",
              width: 130,
              render: (v: JobReport["severity"]) => (
                <StatusBadge kind="report-severity" value={v} variant="chip" />
              ),
            },
            {
              title: "Reports",
              dataIndex: "reportsCount",
              width: 90,
              render: (v: number) => (
                <span
                  className={cn(
                    "text-[12.5px]",
                    v >= 5 ? "text-[#C24545]" : v >= 2 ? "text-gold-400" : "text-grey-400",
                  )}
                >
                  ×{v}
                </span>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 140,
              render: (v: ReportStatus) => (
                <StatusBadge kind="report-status" value={v} variant="chip" />
              ),
            },
            {
              title: "Filed",
              dataIndex: "createdAt",
              width: 130,
              render: (v: string) => (
                <span className="text-[12.5px] text-grey-400">
                  {fromNow(v)}
                </span>
              ),
            },
            {
              title: "Action",
              width: 180,
              align: "right",
              render: (_: unknown, r: JobReport) =>
                r.status === "resolved" || r.status === "dismissed" ? (
                  <span className="text-[12.5px] text-grey-500">Closed</span>
                ) : (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "remove",
                          label: (
                            <span className="text-[#C24545]">
                              Remove listing
                            </span>
                          ),
                          icon: <DeleteOutlined />,
                          onClick: () =>
                            act(r.id, "remove", {
                              title: "Remove this listing?",
                              danger: true,
                            }),
                        },
                        {
                          key: "suspend",
                          label: "Suspend listing",
                          icon: <StopOutlined />,
                          onClick: () =>
                            act(r.id, "suspend", {
                              title: "Suspend this listing?",
                              danger: true,
                            }),
                        },
                        {
                          key: "warn",
                          label: "Issue warning",
                          icon: <WarningOutlined />,
                          onClick: () =>
                            act(r.id, "warn", {
                              title: "Issue a warning?",
                              danger: false,
                            }),
                        },
                        { type: "divider" },
                        {
                          key: "dismiss",
                          label: "Dismiss report",
                          icon: <CloseOutlined />,
                          onClick: () =>
                            act(r.id, "dismiss", {
                              title: "Dismiss this report?",
                              danger: false,
                            }),
                        },
                      ],
                    }}
                  >
                    <Button size="small" type="primary">
                      Take action
                    </Button>
                  </Dropdown>
                ),
            },
          ]}
          expandable={{
            rowExpandable: () => true,
            expandedRowRender: (r: JobReport) => (
              <div className="py-2 text-[13px] leading-relaxed text-grey-400">
                <div className="mb-2 flex items-center gap-3">
                  <Avatar
                    size={24}
                    src={r.reportedBy.avatarUrl}
                    className="!bg-white/[0.04] !text-grey-400"
                  >
                    {initials(r.reportedBy.name)}
                  </Avatar>
                  <span className="text-[12px] text-grey-400">
                    Reported by {r.reportedBy.name}
                  </span>
                </div>
                <p className="text-white/90">{r.description}</p>
              </div>
            ),
          }}
        />
      </GlassPanel>
    </div>
  );
};

export default ReportedJobsPage;
