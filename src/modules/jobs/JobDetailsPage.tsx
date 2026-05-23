import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EuroCircleOutlined,
  StopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { App as AntApp, Button, Popconfirm, Tag } from "antd";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { GlassPanel } from "@components/common/GlassPanel";
import { CardSkeleton } from "@components/feedback/LoadingSkeleton";
import { ApplicationsTable } from "@components/tables/ApplicationsTable";
import { PageHeader } from "@components/common/PageHeader";
import {
  useDeleteJobMutation,
  useGetJobQuery,
  useListApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useUpdateJobMutation,
} from "@services/baseApi";
import { formatCurrency, formatDate, titleCase } from "@utils/format";

const JobDetailsPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const { data: job, isLoading } = useGetJobQuery(id);
  const { data: applications = [] } = useListApplicationsQuery();
  const [updateJob, { isLoading: savingStatus }] = useUpdateJobMutation();
  const [deleteJob, { isLoading: deleting }] = useDeleteJobMutation();
  const [updateApplication] = useUpdateApplicationStatusMutation();

  const jobApplications = useMemo(
    () => applications.filter((a) => a.job.id === id),
    [applications, id],
  );

  if (isLoading || !job) {
    return (
      <div className="space-y-4">
        <CardSkeleton lines={4} showAvatar />
        <CardSkeleton lines={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeftOutlined /> Back
        </button>
        <PageHeader
          eyebrow={`${titleCase(job.position)} · ${job.yacht.name}`}
          title={job.title}
          actions={
            <>
              <Button
                icon={<EditOutlined />}
                size="large"
                className="!rounded-xl"
              >
                Edit
              </Button>
              <Button
                icon={<StopOutlined />}
                size="large"
                loading={savingStatus}
                onClick={() =>
                  updateJob({
                    id: job.id,
                    status: job.status === "open" ? "paused" : "open",
                  })
                }
                className="!rounded-xl"
              >
                {job.status === "open" ? "Pause" : "Reopen"}
              </Button>
              <Popconfirm
                title="Delete this job?"
                description="Applicants will keep access to your prior messages."
                onConfirm={async () => {
                  await deleteJob(job.id).unwrap();
                  message.success("Job deleted");
                  navigate("/jobs");
                }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="large"
                  loading={deleting}
                  className="!rounded-xl"
                >
                  Delete
                </Button>
              </Popconfirm>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <GlassPanel padding="none" className="overflow-hidden">
            {job.yacht.imageUrl && (
              <div className="relative aspect-[16/6] w-full overflow-hidden">
                <img
                  src={job.yacht.imageUrl}
                  alt={job.yacht.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
              </div>
            )}
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <EnvironmentOutlined className="text-ocean-300" />{" "}
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <EuroCircleOutlined className="text-gold-400" />
                  {formatCurrency(job.salary.min, job.salary.currency)} —{" "}
                  {formatCurrency(job.salary.max, job.salary.currency)} /{" "}
                  {job.salary.period}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarOutlined className="text-ocean-300" /> Starts{" "}
                  {formatDate(job.startDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <TeamOutlined className="text-ocean-300" />{" "}
                  {job.applicationsCount} applicants · {job.shortlistedCount} shortlisted
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Tag bordered={false} className="!bg-white/[0.05] !text-slate-200">
                  {titleCase(job.contractType)}
                </Tag>
                <Tag bordered={false} className="!bg-white/[0.05] !text-slate-200">
                  {job.yacht.length}m {titleCase(job.yacht.type)}
                </Tag>
                {job.languages.map((l) => (
                  <Tag
                    key={l}
                    bordered={false}
                    className="!bg-ocean-500/15 !text-ocean-200"
                  >
                    {l.toUpperCase()}
                  </Tag>
                ))}
              </div>

              <div>
                <h3 className="section-title mb-2">About the role</h3>
                <p className="whitespace-pre-wrap text-sm text-slate-200/90">
                  {job.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="section-title mb-2">Responsibilities</h3>
                  <ul className="list-disc pl-5 text-sm text-slate-200/90">
                    {job.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="section-title mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 text-sm text-slate-200/90">
                    {job.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel
            title="Applications"
            subtitle={`${jobApplications.length} candidates`}
            padding="sm"
          >
            <ApplicationsTable
              data={jobApplications}
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
            />
          </GlassPanel>
        </div>

        <div className="space-y-6">
          <GlassPanel title="Status" subtitle="Visibility & lifecycle">
            <div className="flex items-center justify-between">
              <span className="muted text-sm">Current</span>
              <Tag className="!rounded-full" color="processing">
                {titleCase(job.status)}
              </Tag>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Posted {formatDate(job.createdAt)} · Updated{" "}
              {formatDate(job.updatedAt)}
            </div>
          </GlassPanel>

          <GlassPanel title="Yacht profile">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="muted">Name</span>
                <span className="text-white">{job.yacht.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Length</span>
                <span className="text-white">{job.yacht.length} m</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Type</span>
                <span className="text-white">
                  {titleCase(job.yacht.type)}
                </span>
              </div>
              {job.yacht.flag && (
                <div className="flex justify-between">
                  <span className="muted">Flag</span>
                  <span className="text-white">{job.yacht.flag}</span>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
