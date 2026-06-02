import {
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar } from "antd";
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { AdminPageStack } from "@components/admin/AdminPageStack";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { EmptyState } from "@components/feedback/EmptyState";
import { StaggerGrid } from "@components/transitions/StaggerGrid";
import {
  useGetAnalyticsQuery,
  useListApplicationsQuery,
  useListCrewQuery,
  useListOwnersQuery,
} from "@services/adminApi";
import { useListJobsQuery } from "@services/baseApi";
import { formatTableDateShort, fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  ApplicationSummary,
  CrewProfile,
  OwnerProfile,
} from "@/types";

/* ============================================================ */
/*  Stat card                                                   */
/* ============================================================ */

type Tone = "white" | "teal" | "gold" | "danger";

interface StatProps {
  label: string;
  value: number | string;
  delta?: string;
  icon: ReactNode;
  tone?: Tone;
  href?: string;
}

const StatCard = ({ label, value, delta, icon, tone = "white", href }: StatProps) => {
  const interactive = !!href;
  const body = (
    <div
      className={cn(
        "surface-card group flex items-center justify-between gap-4 px-4 py-4",
        interactive && "surface-card-interactive",
      )}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          {label}
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tighter2 text-white">
            {value}
          </div>
          {delta && (
            <div
              className={cn(
                "text-[11.5px]",
                tone === "danger" && "text-[#C24545]",
                tone === "teal" && "text-teal-300",
                tone === "gold" && "text-gold-400",
                tone === "white" && "text-grey-500",
              )}
            >
              {delta}
            </div>
          )}
        </div>
      </div>
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 transition",
          tone === "teal" && "bg-teal-500/[0.08] text-teal-300 ring-teal-500/20",
          tone === "gold" && "bg-gold-500/[0.08] text-gold-400 ring-gold-500/20",
          tone === "danger" && "bg-[#AA2727]/[0.08] text-[#C24545] ring-[#AA2727]/25",
          tone === "white" && "bg-white/[0.05] text-white ring-white/[0.08]",
        )}
      >
        {icon}
      </span>
    </div>
  );
  return href ? (
    <Link to={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
};

/* ============================================================ */
/*  Recent activity feed                                        */
/* ============================================================ */

type ActivityKind = "crew" | "owner" | "application";

interface ActivityRow {
  id: string;
  kind: ActivityKind;
  actor: { name: string; avatarUrl?: string };
  summary: string;
  meta: string;
  at: string;
  href: string;
}

const ACTIVITY_META: Record<
  ActivityKind,
  { label: string; tone: string; icon: ReactNode }
> = {
  crew: {
    label: "Crew",
    tone: "bg-teal-500/[0.08] text-teal-300 ring-teal-500/20",
    icon: <TeamOutlined />,
  },
  owner: {
    label: "Owner",
    tone: "bg-gold-500/[0.08] text-gold-400 ring-gold-500/20",
    icon: <UserOutlined />,
  },
  application: {
    label: "Application",
    tone: "bg-white/[0.05] text-white ring-white/[0.08]",
    icon: <SolutionOutlined />,
  },
};

const buildActivityFeed = ({
  crew,
  owners,
  applications,
}: {
  crew: CrewProfile[];
  owners: OwnerProfile[];
  applications: ApplicationSummary[];
}): ActivityRow[] => {
  const rows: ActivityRow[] = [];

  crew
    .slice()
    .sort((a, b) => (b.lastActiveAt ?? "").localeCompare(a.lastActiveAt ?? ""))
    .slice(0, 8)
    .forEach((c) => {
      const summary =
        c.verificationStatus === "approved"
          ? "crew profile approved"
          : c.verificationStatus === "rejected"
            ? "verification rejected"
            : c.verificationStatus === "additional-info"
              ? "additional documents requested"
              : "submitted verification documents";
      rows.push({
        id: `crew_${c.id}`,
        kind: "crew",
        actor: { name: c.fullName, avatarUrl: c.avatarUrl },
        summary,
        meta: titleCase(c.position),
        at: c.lastActiveAt ?? c.joinedAt,
        href: `/admin/crew/${c.id}`,
      });
    });

  owners
    .slice()
    .sort((a, b) => (b.lastActiveAt ?? "").localeCompare(a.lastActiveAt ?? ""))
    .slice(0, 8)
    .forEach((o) => {
      const summary =
        o.verificationStatus === "approved"
          ? "owner approved"
          : o.verificationStatus === "rejected"
            ? "owner verification rejected"
            : o.verificationStatus === "additional-info"
              ? "additional documents requested"
              : "submitted owner documents";
      rows.push({
        id: `owner_${o.id}`,
        kind: "owner",
        actor: { name: o.fullName, avatarUrl: o.avatarUrl },
        summary,
        meta: o.companyName ?? o.country,
        at: o.lastActiveAt ?? o.joinedAt,
        href: `/admin/owners`,
      });
    });

  applications
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
    .forEach((a) => {
      rows.push({
        id: `app_${a.id}`,
        kind: "application",
        actor: { name: a.candidate.fullName, avatarUrl: a.candidate.avatarUrl },
        summary: `applied to "${a.job.title}"`,
        meta: titleCase(a.status),
        at: a.updatedAt,
        href: `/admin/applications`,
      });
    });

  return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 15);
};

/* ============================================================ */
/*  Page                                                        */
/* ============================================================ */

export const AdminDashboardPage = () => {
  const { data: analytics } = useGetAnalyticsQuery();
  const { data: crew = [] } = useListCrewQuery();
  const { data: owners = [] } = useListOwnersQuery();
  const { data: applications = [] } = useListApplicationsQuery();
  const { data: jobsPage } = useListJobsQuery();

  const pendingCrewVerifications = useMemo(
    () =>
      crew.filter(
        (c) =>
          c.verificationStatus === "pending" ||
          c.verificationStatus === "in-review",
      ),
    [crew],
  );
  const pendingOwnerVerifications = useMemo(
    () =>
      owners.filter(
        (o) =>
          o.verificationStatus === "pending" ||
          o.verificationStatus === "in-review" ||
          o.verificationStatus === "additional-info",
      ),
    [owners],
  );
  const totalPendingVerifications =
    pendingCrewVerifications.length + pendingOwnerVerifications.length;

  const activeJobListings = useMemo(
    () => (jobsPage?.data ?? []).filter((j) => j.status === "open").length,
    [jobsPage],
  );

  const pendingApplications = useMemo(
    () => applications.filter((a) => a.status === "pending"),
    [applications],
  );

  const activity = useMemo(
    () => buildActivityFeed({ crew, owners, applications }),
    [crew, owners, applications],
  );

  return (
    <AdminPageStack>
      <PageHeader
        section="ADMIN"
        title="Overview"
        description="Platform health, verifications and recent activity at a glance."
      />

      {/* Summary stat cards */}
      <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={analytics?.users.total.toLocaleString() ?? "—"}
          delta={
            analytics
              ? `+${analytics.users.newThisWeek.toLocaleString()} this week`
              : undefined
          }
          icon={<TeamOutlined />}
          tone="white"
        />
        <StatCard
          label="Pending Verifications"
          value={totalPendingVerifications}
          delta={`${pendingCrewVerifications.length} crew · ${pendingOwnerVerifications.length} owners`}
          icon={<SafetyCertificateOutlined />}
          tone="gold"
          href="/admin/owners"
        />
        <StatCard
          label="Active Job Listings"
          value={activeJobListings}
          icon={<ThunderboltOutlined />}
          tone="teal"
          href="/admin/jobs"
        />
        <StatCard
          label="Total Applications"
          value={applications.length}
          delta={`${pendingApplications.length} pending review`}
          icon={<SolutionOutlined />}
          tone="white"
          href="/admin/applications"
        />
      </StaggerGrid>

      {/* Recent Activity — full-width primary focus */}
      <div className="mt-5">
        <RecentActivityPanel rows={activity} />
      </div>
    </AdminPageStack>
  );
};

/* ============================================================ */
/*  Recent activity panel                                       */
/* ============================================================ */

const RecentActivityPanel = ({ rows }: { rows: ActivityRow[] }) => (
  <GlassPanel padding="none" className="overflow-hidden">
    <div className="border-b border-white/[0.08] px-5 py-5">
      <h3 className="text-[16px] font-semibold text-white">Recent activity</h3>
      <p className="mt-1 text-[12.5px] text-grey-500">
        Verifications, applications and platform events — newest first
      </p>
    </div>

    {rows.length === 0 ? (
      <div className="px-5 py-12">
        <EmptyState
          title="No recent activity"
          description="Once crew, owners and applications come in, you'll see them here."
        />
      </div>
    ) : (
      <DataTable<ActivityRow>
        framed={false}
        className="admin-activity-table"
        dataSource={rows}
        rowKey={(r) => r.id}
        tableLayout="fixed"
        pagination={false}
        scroll={{ x: 960 }}
        columns={[
          {
            title: "Type",
            dataIndex: "kind",
            width: 148,
            render: (kind: ActivityKind) => {
              const meta = ACTIVITY_META[kind];
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-medium uppercase tracking-wider ring-1",
                    meta.tone,
                  )}
                >
                  {meta.icon}
                  {meta.label}
                </span>
              );
            },
          },
          {
            title: "Actor",
            dataIndex: "actor",
            ellipsis: { showTitle: false },
            render: (_: unknown, row: ActivityRow) => (
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={row.actor.avatarUrl}
                  size={36}
                  className="!shrink-0 !bg-white/[0.05] !text-grey-400"
                >
                  {initials(row.actor.name)}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-white">
                    {row.actor.name}
                  </div>
                  <div
                    className="truncate text-[12.5px] text-grey-400"
                    title={row.summary}
                  >
                    {row.summary}
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Detail",
            dataIndex: "meta",
            width: 220,
            ellipsis: { showTitle: true },
            render: (v: string) => (
              <span className="block truncate text-[13px] text-grey-300">
                {v}
              </span>
            ),
          },
          {
            title: "When",
            dataIndex: "at",
            width: 120,
            render: (v: string) => (
              <div className="min-w-0">
                <div
                  className="truncate text-[13px] text-grey-400"
                  title={fromNow(v)}
                >
                  {fromNow(v)}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] text-grey-500">
                  {formatTableDateShort(v)}
                </div>
              </div>
            ),
          },
          {
            title: "",
            key: "actions",
            width: 56,
            align: "right",
            render: (_: unknown, row: ActivityRow) => (
              <div className="flex justify-end pr-1">
                <Link
                  to={row.href}
                  className="icon-btn icon-btn-sm h-8 w-8 shrink-0"
                  aria-label="Open"
                >
                  <ArrowRightOutlined />
                </Link>
              </div>
            ),
          },
        ]}
      />
    )}
  </GlassPanel>
);

export default AdminDashboardPage;
