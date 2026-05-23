import { MoreOutlined, StarFilled } from "@ant-design/icons";
import { Avatar, Dropdown, Table, type TableProps } from "antd";
import { Link } from "react-router-dom";

import { fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { Application, ApplicationStatus } from "@/types";

/**
 * Minimal status pill — dot + label only. Single-tone backgrounds, no neon.
 */
const STATUS_STYLE: Record<
  ApplicationStatus,
  { dot: string; text: string; label: string }
> = {
  new: { dot: "bg-teal-400", text: "text-teal-300", label: "New" },
  shortlisted: {
    dot: "bg-gold-500",
    text: "text-gold-400",
    label: "Shortlisted",
  },
  interview: {
    dot: "bg-white",
    text: "text-white",
    label: "Interview",
  },
  accepted: {
    dot: "bg-teal-500",
    text: "text-teal-300",
    label: "Accepted",
  },
  rejected: {
    dot: "bg-[#AA2727]",
    text: "text-[#C24545]",
    label: "Rejected",
  },
  withdrawn: {
    dot: "bg-grey-500",
    text: "text-grey-400",
    label: "Withdrawn",
  },
};

interface Props {
  data: Application[];
  loading?: boolean;
  onView?: (app: Application) => void;
  onShortlist?: (app: Application) => void;
  onAccept?: (app: Application) => void;
  onReject?: (app: Application) => void;
  onSchedule?: (app: Application) => void;
  pageSize?: number;
}

export const ApplicationsTable = ({
  data,
  loading,
  onView,
  onShortlist,
  onAccept,
  onReject,
  onSchedule,
  pageSize = 8,
}: Props) => {
  const columns: TableProps<Application>["columns"] = [
    {
      title: "Candidate",
      dataIndex: ["crew", "fullName"],
      render: (_v, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.crew.avatarUrl}
            size={36}
            className="!bg-white/[0.04] !text-grey-400"
          >
            {initials(record.crew.fullName)}
          </Avatar>
          <div className="min-w-0">
            <Link
              to={`/crew/${record.crew.id}`}
              className="block truncate text-[13.5px] font-medium text-white hover:text-teal-300"
            >
              {record.crew.fullName}
            </Link>
            <div className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-grey-500">
              <span>{titleCase(record.crew.position)}</span>
              <span>·</span>
              <StarFilled className="text-gold-500 text-[10px]" />
              <span>{record.crew.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Job",
      dataIndex: ["job", "title"],
      responsive: ["md"],
      render: (_v, record) => (
        <div className="min-w-0">
          <Link
            to={`/jobs/${record.job.id}`}
            className="block max-w-[280px] truncate text-[13px] text-white hover:text-teal-300"
          >
            {record.job.title}
          </Link>
          <div className="mt-0.5 text-[11.5px] text-grey-500">
            {record.job.yacht.name}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      filters: (
        ["new", "shortlisted", "interview", "accepted", "rejected"] as ApplicationStatus[]
      ).map((s) => ({ text: titleCase(s), value: s })),
      onFilter: (value, record) => record.status === value,
      render: (status: ApplicationStatus) => {
        const meta = STATUS_STYLE[status];
        return (
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
            <span className={meta.text}>{meta.label}</span>
          </span>
        );
      },
    },
    {
      title: "Applied",
      dataIndex: "appliedAt",
      width: 140,
      responsive: ["lg"],
      sorter: (a, b) =>
        new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime(),
      render: (iso: string) => (
        <span className="text-[12px] text-grey-400">{fromNow(iso)}</span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      align: "right",
      render: (_v, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "view", label: "View profile", onClick: () => onView?.(record) },
              {
                key: "shortlist",
                label: "Shortlist",
                onClick: () => onShortlist?.(record),
              },
              {
                key: "schedule",
                label: "Schedule interview",
                onClick: () => onSchedule?.(record),
              },
              { type: "divider" },
              {
                key: "accept",
                label: <span className="text-teal-300">Accept</span>,
                onClick: () => onAccept?.(record),
              },
              {
                key: "reject",
                label: <span className="text-[#C24545]">Reject</span>,
                danger: true,
                onClick: () => onReject?.(record),
              },
            ],
          }}
        >
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
            aria-label="More"
          >
            <MoreOutlined />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={data}
      columns={columns}
      pagination={{ pageSize, showSizeChanger: false, hideOnSinglePage: true }}
      locale={{ emptyText: <span className="text-grey-500">No applications</span> }}
    />
  );
};
