import {
  AppstoreOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button } from "antd";
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { StatusBadge } from "@components/admin/StatusBadge";
import { CardSkeleton } from "@components/feedback/LoadingSkeleton";
import { EmptyState } from "@components/feedback/EmptyState";
import { StaggerGrid } from "@components/transitions/StaggerGrid";
import { useAuth } from "@hooks/useAuth";
import {
  useGetAnalyticsQuery,
  useListApplicationsQuery,
  useListCrewQuery,
  useListOwnersQuery,
} from "@services/adminApi";
import { useListJobsQuery } from "@services/baseApi";
import { fromNow, initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  ApplicationSummary,
  CrewProfile,
  OwnerProfile,
} from "@/types";

import {
  ApplicationsPipelineMiniCard,
  DailyActivityMiniCard,
  UserGrowthMiniCard,
} from "./components/MiniChartCard";

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
        "surface-card group flex items-center justify-between gap-4 px-5 py-5",
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
    .slice(0, 6)
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
    .slice(0, 6)
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
    .slice(0, 6)
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

  return rows
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);
};

/* ============================================================ */
/*  Page                                                        */
/* ============================================================ */

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading: aLoading,
    refetch: refetchAnalytics,
    isFetching: aFetching,
  } = useGetAnalyticsQuery();
  const { data: crew = [] } = useListCrewQuery();
  const { data: owners = [] } = useListOwnersQuery();
  const { data: applications = [] } = useListApplicationsQuery();
  const { data: jobsPage } = useListJobsQuery();

  /* ---- derived ---- */

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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title={`${greeting}${user ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        subtitle="A focused snapshot of pending verifications, the latest platform activity and engagement."
        actions={
          <Button
            icon={<ReloadOutlined />}
            loading={aFetching}
            onClick={() => refetchAnalytics()}
          >
            Refresh
          </Button>
        }
      />

      {/* ---------------- Stat cards (4) ---------------- */}
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

      {/* ---------------- Recent Activity + Verification Queue ---------------- */}
      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <RecentActivityPanel rows={activity} />
        <VerificationQueuePanel
          crew={pendingCrewVerifications}
          owners={pendingOwnerVerifications}
          recentApplications={applications}
        />
      </div>

      {/* ---------------- Platform Analytics (3 charts) ---------------- */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {aLoading || !analytics ? (
          <>
            <CardSkeleton lines={3} />
            <CardSkeleton lines={3} />
            <CardSkeleton lines={3} />
          </>
        ) : (
          <>
            <UserGrowthMiniCard
              growth={analytics.users.growth}
              total={analytics.users.total}
              newThisWeek={analytics.users.newThisWeek}
            />
            <DailyActivityMiniCard data={analytics.engagement.dailyActivity} />
            <ApplicationsPipelineMiniCard applications={applications} />
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================ */
/*  Recent activity panel                                       */
/* ============================================================ */

const RecentActivityPanel = ({ rows }: { rows: ActivityRow[] }) => (
  <GlassPanel padding="none" className="overflow-hidden">
    <div className="flex items-end justify-between border-b border-white/[0.08] px-6 pt-6 pb-4">
      <div>
        <h3 className="text-[15px] font-semibold text-white">Recent activity</h3>
        <div className="text-[11.5px] text-grey-500">
          Verifications · applications · platform activity
        </div>
      </div>
    </div>

    {rows.length === 0 ? (
      <div className="px-6 py-10">
        <EmptyState
          title="No recent activity"
          description="Once crew, owners and applications come in, you'll see them here."
        />
      </div>
    ) : (
      <DataTable<ActivityRow>
        dataSource={rows}
        rowKey={(r) => r.id}
        pagination={false}
        columns={[
          {
            title: "Type",
            dataIndex: "kind",
            width: 130,
            render: (kind: ActivityKind) => {
              const meta = ACTIVITY_META[kind];
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ring-1",
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
            render: (_: unknown, row: ActivityRow) => (
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={row.actor.avatarUrl}
                  size={28}
                  className="!bg-white/[0.05] !text-grey-400"
                >
                  {initials(row.actor.name)}
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-white">
                    {row.actor.name}
                  </div>
                  <div className="truncate text-[11px] text-grey-500">
                    {row.summary}
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Detail",
            dataIndex: "meta",
            width: 160,
            responsive: ["lg"],
            render: (v: string) => (
              <span className="text-[12px] text-grey-400">{v}</span>
            ),
          },
          {
            title: "When",
            dataIndex: "at",
            width: 90,
            render: (v: string) => (
              <span className="text-[11.5px] text-grey-500">{fromNow(v)}</span>
            ),
          },
          {
            title: "",
            width: 36,
            align: "right",
            render: (_: unknown, row: ActivityRow) => (
              <Link
                to={row.href}
                className="icon-btn icon-btn-sm h-7 w-7"
                aria-label="Open"
              >
                <ArrowRightOutlined />
              </Link>
            ),
          },
        ]}
      />
    )}
  </GlassPanel>
);

/* ============================================================ */
/*  Verification queue (compact)                                */
/* ============================================================ */

const VerificationQueuePanel = ({
  crew,
  owners,
  recentApplications,
}: {
  crew: CrewProfile[];
  owners: OwnerProfile[];
  recentApplications: ApplicationSummary[];
}) => {
  const crewTop = crew.slice(0, 3);
  const ownerTop = owners.slice(0, 3);
  const appTop = recentApplications
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <GlassPanel padding="none" className="overflow-hidden">
      <div className="flex items-end justify-between border-b border-white/[0.08] px-6 pt-6 pb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-white">
            Verification queue
          </h3>
          <div className="text-[11.5px] text-grey-500">
            What's waiting on a decision right now
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/[0.08]">
        <QueueSection
          icon={<TeamOutlined />}
          label="Pending crew"
          count={crew.length}
          href="/admin/crew"
          tone="teal"
        >
          {crewTop.length === 0 ? (
            <Empty />
          ) : (
            crewTop.map((c) => (
              <QueueItem
                key={c.id}
                primary={c.fullName}
                secondary={titleCase(c.position)}
                trailing={
                  <StatusBadge
                    kind="verification"
                    value={c.verificationStatus}
                    variant="dot"
                  />
                }
                time={fromNow(c.lastActiveAt ?? c.joinedAt)}
                href={`/admin/crew/${c.id}`}
              />
            ))
          )}
        </QueueSection>

        <QueueSection
          icon={<SafetyCertificateOutlined />}
          label="Pending owners"
          count={owners.length}
          href="/admin/owners"
          tone="gold"
        >
          {ownerTop.length === 0 ? (
            <Empty />
          ) : (
            ownerTop.map((o) => (
              <QueueItem
                key={o.id}
                primary={o.fullName}
                secondary={o.companyName ?? o.country}
                trailing={
                  <StatusBadge
                    kind="verification"
                    value={o.verificationStatus}
                    variant="dot"
                  />
                }
                time={fromNow(o.lastActiveAt ?? o.joinedAt)}
                href="/admin/owners"
              />
            ))
          )}
        </QueueSection>

        <QueueSection
          icon={<AppstoreOutlined />}
          label="Recent applications"
          count={recentApplications.length}
          href="/admin/applications"
          tone="white"
        >
          {appTop.length === 0 ? (
            <Empty />
          ) : (
            appTop.map((a) => (
              <QueueItem
                key={a.id}
                primary={a.candidate.fullName}
                secondary={a.job.title}
                trailing={
                  <StatusBadge
                    kind="application"
                    value={a.status}
                    variant="dot"
                  />
                }
                time={fromNow(a.updatedAt)}
                href="/admin/applications"
              />
            ))
          )}
        </QueueSection>
      </div>
    </GlassPanel>
  );
};

const QueueSection = ({
  icon,
  label,
  count,
  href,
  tone,
  children,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  href: string;
  tone: "gold" | "teal" | "white";
  children: ReactNode;
}) => (
  <section className="px-6 py-4">
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2 text-[12.5px] font-medium text-white">
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg ring-1",
            tone === "gold" && "bg-gold-500/[0.08] text-gold-400 ring-gold-500/20",
            tone === "teal" && "bg-teal-500/[0.08] text-teal-300 ring-teal-500/20",
            tone === "white" && "bg-white/[0.05] text-white ring-white/[0.08]",
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
        <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] text-grey-300">
          {count}
        </span>
      </div>
      <Link
        to={href}
        className="inline-flex items-center gap-1 text-[11.5px] text-grey-500 transition hover:text-white"
      >
        View
        <ArrowRightOutlined className="text-[10px]" />
      </Link>
    </div>
    <ul className="space-y-1.5">{children}</ul>
  </section>
);

const QueueItem = ({
  primary,
  secondary,
  trailing,
  time,
  href,
}: {
  primary: string;
  secondary: string;
  trailing?: ReactNode;
  time: string;
  href: string;
}) => (
  <li>
    <Link
      to={href}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.05]"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] text-white">{primary}</div>
        <div className="text-[10.5px] uppercase tracking-wider text-grey-500">
          {secondary} · {time}
        </div>
      </div>
      {trailing}
    </Link>
  </li>
);

const Empty = () => (
  <li className="px-2 py-2 text-[11.5px] text-grey-500">All caught up.</li>
);

export default AdminDashboardPage;
