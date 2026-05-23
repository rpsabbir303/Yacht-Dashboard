import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  PlusOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { StatCard } from "@components/cards/StatCard";
import { ApplicationsTable } from "@components/tables/ApplicationsTable";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import {
  useListApplicationsQuery,
  useListJobsQuery,
  useListScheduleQuery,
  useUpdateApplicationStatusMutation,
} from "@services/baseApi";
import { useAuth } from "@hooks/useAuth";
import { formatDateTime, titleCase } from "@utils/format";
import { ApplicationsTrendChart } from "./components/ApplicationsTrendChart";
import { QuickActionTile } from "./components/QuickActionTile";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: jobsRes, isLoading: loadingJobs } = useListJobsQuery();
  const { data: applications = [], isLoading: loadingApps } =
    useListApplicationsQuery();
  const { data: schedule = [] } = useListScheduleQuery();
  const [updateApplication] = useUpdateApplicationStatusMutation();

  const stats = useMemo(() => {
    const activeJobs = (jobsRes?.data ?? []).filter(
      (j) => j.status === "open" || j.status === "paused",
    ).length;
    const shortlisted = applications.filter(
      (a) => a.status === "shortlisted" || a.status === "interview",
    ).length;
    const interviews = schedule.filter((e) => e.type === "interview").length;
    return {
      activeJobs,
      applications: applications.length,
      shortlisted,
      interviews,
    };
  }, [jobsRes, applications, schedule]);

  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
        )
        .slice(0, 6),
    [applications],
  );

  const nextInterviews = useMemo(
    () =>
      [...schedule]
        .filter((s) => s.type === "interview")
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        )
        .slice(0, 3),
    [schedule],
  );

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={`${user?.companyName ?? "Workspace"}`}
        title={`Welcome, ${user?.fullName?.split(" ")[0] ?? "Captain"}`}
        subtitle="A calm overview of your hiring pipeline — jobs, applicants, interviews and crew chatter."
        actions={
          <>
            <Button
              size="large"
              icon={<TeamOutlined />}
              onClick={() => navigate("/crew")}
            >
              Discover crew
            </Button>
            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/jobs/new")}
            >
              Post a job
            </Button>
          </>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active jobs"
          value={stats.activeJobs}
          icon={<FileSearchOutlined />}
          delta={12}
          hint="vs last month"
          loading={loadingJobs}
        />
        <StatCard
          label="Applications"
          value={stats.applications}
          icon={<TeamOutlined />}
          delta={32}
          hint="last 30 days"
          loading={loadingApps}
        />
        <StatCard
          label="Shortlisted"
          value={stats.shortlisted}
          icon={<CheckCircleOutlined />}
          delta={8}
          hint="ready to interview"
        />
        <StatCard
          label="Interviews"
          value={stats.interviews}
          icon={<CalendarOutlined />}
          delta={-3}
          hint="this week"
        />
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <GlassPanel
            title="Application trend"
            subtitle="Inbound applications across all open positions"
            action={
              <Link
                to="/applications"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-300 hover:text-teal-200"
              >
                View all <ArrowRightOutlined className="text-[10px]" />
              </Link>
            }
          >
            <ApplicationsTrendChart />
          </GlassPanel>

          <GlassPanel
            title="Recent applications"
            subtitle="Newest candidates across all jobs"
            padding="sm"
            action={
              <Link
                to="/applications"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-300 hover:text-teal-200"
              >
                Manage <ArrowRightOutlined className="text-[10px]" />
              </Link>
            }
          >
            {loadingApps ? (
              <TableSkeleton rows={5} />
            ) : (
              <ApplicationsTable
                data={recentApplications}
                onView={(app) => navigate(`/crew/${app.crew.id}`)}
                onShortlist={(app) =>
                  updateApplication({ id: app.id, status: "shortlisted" })
                }
                onAccept={(app) =>
                  updateApplication({ id: app.id, status: "accepted" })
                }
                onReject={(app) =>
                  updateApplication({ id: app.id, status: "rejected" })
                }
                onSchedule={() => navigate("/applications")}
                pageSize={6}
              />
            )}
          </GlassPanel>
        </div>

        <div className="space-y-6">
          <GlassPanel title="Quick actions" subtitle="Speed up your workflow">
            <div className="grid grid-cols-1 gap-2">
              <QuickActionTile
                icon={<PlusOutlined />}
                label="Post a new job"
                hint="Multi-step wizard"
                onClick={() => navigate("/jobs/new")}
              />
              <QuickActionTile
                icon={<ThunderboltOutlined />}
                label="Smart match"
                hint="AI-suggested crew"
                onClick={() => navigate("/crew")}
              />
              <QuickActionTile
                icon={<CalendarOutlined />}
                label="Schedule interview"
                hint="Pick a slot"
                onClick={() => navigate("/schedule")}
              />
              <QuickActionTile
                icon={<TeamOutlined />}
                label="Saved crew"
                hint="Favourites"
                onClick={() => navigate("/crew?saved=1")}
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title="Upcoming interviews"
            subtitle={`${nextInterviews.length} scheduled`}
            action={
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-300 hover:text-teal-200"
              >
                Calendar <ArrowRightOutlined className="text-[10px]" />
              </Link>
            }
          >
            {nextInterviews.length === 0 ? (
              <div className="muted text-[13px]">
                No interviews scheduled.
              </div>
            ) : (
              <ul className="space-y-2">
                {nextInterviews.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-grey-400">
                      <VideoCameraOutlined />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-white">
                        {ev.title}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-grey-500">
                        {formatDateTime(ev.startAt)}
                      </div>
                    </div>
                    {ev.meetingUrl && (
                      <Button
                        size="small"
                        type="primary"
                        href={ev.meetingUrl}
                        target="_blank"
                      >
                        Join
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          <GlassPanel
            title="Active jobs"
            subtitle="Pipeline at a glance"
            action={
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-300 hover:text-teal-200"
              >
                All jobs <ArrowRightOutlined className="text-[10px]" />
              </Link>
            }
          >
            <ul className="-mx-2 space-y-0.5">
              {(jobsRes?.data ?? []).slice(0, 4).map((job) => (
                <li key={job.id}>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-white/[0.025]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-white">
                        {job.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-grey-500">
                        {titleCase(job.status)} · {job.applicationsCount} applicants
                      </div>
                    </div>
                    <ArrowRightOutlined className="text-[11px] text-grey-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
