import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Pagination, Select, Slider } from "antd";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CrewCard } from "@components/cards/CrewCard";
import { CardSkeleton } from "@components/feedback/LoadingSkeleton";
import { EmptyState } from "@components/feedback/EmptyState";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useListCrewQuery } from "@services/baseApi";
import {
  CERTIFICATION_OPTIONS,
  CREW_POSITION_OPTIONS,
} from "@utils/constants";
import type {
  AvailabilityStatus,
  CrewFilters,
  CrewPosition,
} from "@/types";

const AVAILABILITY_OPTIONS: { label: string; value: AvailabilityStatus }[] = [
  { label: "Available now", value: "available-now" },
  { label: "Available soon", value: "available-soon" },
  { label: "On-board", value: "on-board" },
  { label: "Not available", value: "not-available" },
];

const CrewListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CrewFilters>({
    page: 1,
    pageSize: 12,
    minExperience: 0,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const queryParams = useMemo<CrewFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  );

  const { data, isFetching } = useListCrewQuery(queryParams);
  const crew = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Find the right crew"
        title="Crew Discovery"
        subtitle="Search and shortlist verified yacht professionals across all positions."
        actions={
          <Button
            size="large"
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => navigate("/crew?saved=1")}
            className="!rounded-xl"
          >
            View saved
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
        <aside>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <h3 className="section-title mb-4 !text-base">Filters</h3>

            <div className="space-y-4">
              <div>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-slate-300/80">
                  Search
                </div>
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Name, headline, location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-slate-300/80">
                  Position
                </div>
                <Select
                  allowClear
                  className="w-full"
                  options={CREW_POSITION_OPTIONS}
                  value={filters.position}
                  onChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      position: value as CrewPosition | undefined,
                      page: 1,
                    }))
                  }
                  placeholder="Any position"
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-slate-300/80">
                  Availability
                </div>
                <Select
                  allowClear
                  className="w-full"
                  options={AVAILABILITY_OPTIONS}
                  value={filters.availability}
                  onChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      availability: value as AvailabilityStatus | undefined,
                      page: 1,
                    }))
                  }
                  placeholder="Any"
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-slate-300/80">
                  Certifications
                </div>
                <Select
                  mode="multiple"
                  className="w-full"
                  options={CERTIFICATION_OPTIONS}
                  maxTagCount="responsive"
                  value={filters.certifications}
                  onChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      certifications: value,
                      page: 1,
                    }))
                  }
                  placeholder="Any certs"
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-slate-300/80">
                  Min experience · {filters.minExperience ?? 0} years
                </div>
                <Slider
                  min={0}
                  max={20}
                  value={filters.minExperience ?? 0}
                  onChange={(v: number) =>
                    setFilters((f) => ({ ...f, minExperience: v, page: 1 }))
                  }
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-slate-300/80">
                  Location
                </div>
                <Input
                  allowClear
                  placeholder="Antibes, Palma, Lauderdale..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      location: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                />
              </div>

              <Button
                block
                onClick={() => {
                  setFilters({ page: 1, pageSize: 12, minExperience: 0 });
                  setSearch("");
                }}
                className="!rounded-xl"
              >
                Reset filters
              </Button>
            </div>
          </motion.div>
        </aside>

        <div className="space-y-5">
          {isFetching ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} lines={3} showAvatar />
              ))}
            </div>
          ) : crew.length === 0 ? (
            <GlassPanel>
              <EmptyState
                icon={<SearchOutlined />}
                title="No crew found"
                description="Try widening your filters to see more candidates."
              />
            </GlassPanel>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {crew.map((c) => (
                  <CrewCard
                    key={c.id}
                    crew={c}
                    onMessage={() => navigate("/messages")}
                  />
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <Pagination
                  current={data?.pagination.page ?? 1}
                  total={data?.pagination.total ?? 0}
                  pageSize={data?.pagination.pageSize ?? 12}
                  showSizeChanger={false}
                  hideOnSinglePage
                  onChange={(page) =>
                    setFilters((f) => ({ ...f, page }))
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrewListPage;
