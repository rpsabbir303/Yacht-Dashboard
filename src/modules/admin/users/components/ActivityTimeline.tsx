import {
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  FileAddOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  AlertOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import { EmptyState } from "@components/feedback/EmptyState";
import { fromNow, formatDateTime } from "@utils/format";
import { cn } from "@utils/cn";
import type { ActivityLogEntry, ActivityLogKind } from "@/types";

interface Props {
  entries: ActivityLogEntry[];
}

const ICON: Record<ActivityLogKind, React.ReactNode> = {
  login: <LoginOutlined />,
  logout: <LogoutOutlined />,
  "profile-update": <EditOutlined />,
  "job-post": <FileAddOutlined />,
  "job-update": <FileAddOutlined />,
  application: <UserAddOutlined />,
  message: <MailOutlined />,
  verification: <SafetyCertificateOutlined />,
  "admin-action": <CrownOutlined />,
  security: <AlertOutlined />,
};

const TONE: Record<ActivityLogKind, string> = {
  login: "text-teal-300",
  logout: "text-grey-400",
  "profile-update": "text-white",
  "job-post": "text-white",
  "job-update": "text-white",
  application: "text-teal-300",
  message: "text-grey-400",
  verification: "text-teal-300",
  "admin-action": "text-gold-400",
  security: "text-[#C24545]",
};

export const ActivityTimeline = ({ entries }: Props) => {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="The user hasn't generated any activity events."
      />
    );
  }

  return (
    <ol className="relative space-y-3 pl-1">
      <span
        aria-hidden
        className="absolute left-[18px] top-2 bottom-2 w-px bg-white/[0.05]"
      />
      {entries.map((e) => (
        <li key={e.id} className="relative flex gap-4 pl-2">
          <span
            className={cn(
              "z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-surface",
              TONE[e.kind],
            )}
          >
            {ICON[e.kind]}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <div className="text-[13.5px] font-medium text-white">
                {e.title}
              </div>
              <div className="text-[11px] text-grey-500" title={formatDateTime(e.createdAt)}>
                {fromNow(e.createdAt)}
              </div>
            </div>
            {e.description && (
              <div className="mt-0.5 text-[12.5px] text-grey-400">
                {e.description}
              </div>
            )}
            {(e.ip || e.device) && (
              <div className="mt-1 text-[11px] text-grey-500">
                {[e.device, e.ip].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
