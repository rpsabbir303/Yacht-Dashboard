import { Tabs } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApplicationsTable } from "@components/tables/ApplicationsTable";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { TableSkeleton } from "@components/feedback/LoadingSkeleton";
import {
  useListApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "@services/baseApi";
import type { Application, ApplicationStatus } from "@/types";

import { ScheduleInterviewModal } from "./ScheduleInterviewModal";

type TabKey = "new" | "shortlisted" | "interview" | "accepted" | "rejected";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useListApplicationsQuery();
  const [updateStatus] = useUpdateApplicationStatusMutation();

  const [scheduleFor, setScheduleFor] = useState<Application | null>(null);
  const [tab, setTab] = useState<TabKey>("new");

  const counts = useMemo(() => {
    const acc: Record<TabKey, number> = {
      new: 0,
      shortlisted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };
    for (const a of applications) {
      if (a.status in acc) {
        acc[a.status as TabKey] += 1;
      }
    }
    return acc;
  }, [applications]);

  const filtered = useMemo(
    () => applications.filter((a) => a.status === (tab as ApplicationStatus)),
    [applications, tab],
  );

  const renderTable = (rows: Application[]) =>
    isLoading ? (
      <TableSkeleton rows={6} />
    ) : (
      <ApplicationsTable
        data={rows}
        onView={(app) => navigate(`/crew/${app.crew.id}`)}
        onShortlist={(app) =>
          updateStatus({ id: app.id, status: "shortlisted" })
        }
        onAccept={(app) => updateStatus({ id: app.id, status: "accepted" })}
        onReject={(app) => updateStatus({ id: app.id, status: "rejected" })}
        onSchedule={(app) => setScheduleFor(app)}
      />
    );

  const tabLabel = (label: string, count: number) => (
    <span className="inline-flex items-center gap-2">
      {label}
      <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-300">
        {count}
      </span>
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hiring pipeline"
        title="Applications"
        subtitle="Triage candidates by stage and move them forward in one click."
      />

      <GlassPanel padding="sm">
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={[
            {
              key: "new",
              label: tabLabel("New", counts.new),
              children: renderTable(filtered),
            },
            {
              key: "shortlisted",
              label: tabLabel("Shortlisted", counts.shortlisted),
              children: renderTable(filtered),
            },
            {
              key: "interview",
              label: tabLabel("Interview", counts.interview),
              children: renderTable(filtered),
            },
            {
              key: "accepted",
              label: tabLabel("Accepted", counts.accepted),
              children: renderTable(filtered),
            },
            {
              key: "rejected",
              label: tabLabel("Rejected", counts.rejected),
              children: renderTable(filtered),
            },
          ]}
        />
      </GlassPanel>

      <ScheduleInterviewModal
        open={!!scheduleFor}
        application={scheduleFor}
        onClose={() => setScheduleFor(null)}
      />
    </div>
  );
};

export default ApplicationsPage;
