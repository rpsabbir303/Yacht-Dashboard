import {
  CalendarOutlined,
  CarryOutOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Calendar, Tag } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import { EmptyState } from "@components/feedback/EmptyState";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { useListScheduleQuery } from "@services/baseApi";
import { formatDateTime, titleCase } from "@utils/format";
import type { ScheduleEvent, ScheduleEventType } from "@/types";

const TYPE_COLOR: Record<
  ScheduleEventType,
  { dot: string; tag: string; label: string }
> = {
  interview: {
    dot: "bg-ocean-400",
    tag: "!bg-ocean-500/15 !text-ocean-200",
    label: "Interview",
  },
  joining: {
    dot: "bg-emerald-400",
    tag: "!bg-emerald-500/15 !text-emerald-200",
    label: "Joining",
  },
  "contract-start": {
    dot: "bg-violet-400",
    tag: "!bg-violet-500/15 !text-violet-200",
    label: "Contract start",
  },
  "contract-end": {
    dot: "bg-rose-400",
    tag: "!bg-rose-500/15 !text-rose-200",
    label: "Contract end",
  },
  delivery: {
    dot: "bg-gold-400",
    tag: "!bg-gold-500/15 !text-gold-400",
    label: "Delivery",
  },
};

const SchedulePage = () => {
  const { data: events = [] } = useListScheduleQuery();
  const [selected, setSelected] = useState<Dayjs>(dayjs());

  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => dayjs(e.startAt).isSame(selected, "day"))
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        ),
    [events, selected],
  );

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => dayjs(e.startAt).isAfter(dayjs().startOf("day")))
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        )
        .slice(0, 6),
    [events],
  );

  const dateCellRender = (date: Dayjs) => {
    const items = events.filter((e) => dayjs(e.startAt).isSame(date, "day"));
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 3).map((e) => (
          <span
            key={e.id}
            className={`h-1.5 w-1.5 rounded-full ${TYPE_COLOR[e.type].dot}`}
            aria-label={e.title}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title="Schedule"
        subtitle="Interviews, crew joining dates and contract milestones."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GlassPanel padding="sm">
            <Calendar
              fullscreen={false}
              value={selected}
              onSelect={setSelected}
              cellRender={(value, info) =>
                info.type === "date" ? dateCellRender(value) : null
              }
            />
          </GlassPanel>
        </div>

        <div className="space-y-6">
          <GlassPanel
            title={`Events · ${selected.format("MMM D, YYYY")}`}
            subtitle={dayEvents.length > 0 ? `${dayEvents.length} scheduled` : "Free day"}
          >
            {dayEvents.length === 0 ? (
              <EmptyState
                icon={<CalendarOutlined />}
                title="Nothing scheduled"
                description="Pick a different day or schedule something new."
              />
            ) : (
              <ul className="space-y-3">
                {dayEvents.map((e) => (
                  <EventRow key={e.id} ev={e} />
                ))}
              </ul>
            )}
          </GlassPanel>

          <GlassPanel title="Upcoming">
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <EventRow key={e.id} ev={e} compact />
              ))}
            </ul>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

const EventRow = ({
  ev,
  compact,
}: {
  ev: ScheduleEvent;
  compact?: boolean;
}) => {
  const meta = TYPE_COLOR[ev.type];
  return (
    <li className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            <span className="truncate text-sm font-medium text-white">
              {ev.title}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-300/80">
            {formatDateTime(ev.startAt)}
          </div>
          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
              {ev.location && (
                <span className="inline-flex items-center gap-1">
                  <EnvironmentOutlined /> {ev.location}
                </span>
              )}
              {ev.participants.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <TeamOutlined /> {ev.participants.length}
                </span>
              )}
              {ev.meetingUrl && (
                <a
                  href={ev.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-ocean-300 hover:text-ocean-200"
                >
                  <CarryOutOutlined /> Join
                </a>
              )}
            </div>
          )}
        </div>
        <Tag bordered={false} className={meta.tag}>
          {titleCase(meta.label)}
        </Tag>
      </div>
    </li>
  );
};

export default SchedulePage;
