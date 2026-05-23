import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Segmented } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CardSkeleton } from "@components/feedback/LoadingSkeleton";
import { EmptyState } from "@components/feedback/EmptyState";
import { JobCard } from "@components/cards/JobCard";
import { PageHeader } from "@components/common/PageHeader";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useListJobsQuery } from "@services/baseApi";
import type { JobStatus } from "@/types";

type StatusFilter = "all" | JobStatus;

const JobsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isFetching } = useListJobsQuery({
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  });

  const jobs = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hiring pipeline"
        title="Jobs"
        subtitle={`${total} positions across your fleet`}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/jobs/new")}
            className="!rounded-xl !shadow-glow"
          >
            Post a new job
          </Button>
        }
      />

      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search by title, yacht or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!max-w-md !rounded-xl"
        />
        <Segmented
          value={status}
          onChange={(v) => setStatus(v as StatusFilter)}
          size="large"
          options={[
            { label: "All", value: "all" },
            { label: "Open", value: "open" },
            { label: "Paused", value: "paused" },
            { label: "Closed", value: "closed" },
          ]}
          className="self-start sm:self-auto"
        />
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={<SearchOutlined />}
            title="No matching jobs"
            description="Try a different search term or post your first job."
            actionLabel="Post a new job"
            onAction={() => navigate("/jobs/new")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsListPage;
