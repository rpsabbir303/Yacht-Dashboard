import {
  AlertOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EuroOutlined,
  ExportOutlined,
  LinkOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Segmented, message } from "antd";
import { useMemo, useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { EmptyState } from "@components/feedback/EmptyState";
import {
  useAcknowledgeFraudSignalMutation,
  useListFraudSignalsQuery,
} from "@services/adminApi";
import { fromNow, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { FraudSignal, FraudSignalKind } from "@/types";

const ICON: Record<FraudSignalKind, React.ReactNode> = {
  "duplicate-listing": <ExportOutlined />,
  "price-anomaly": <EuroOutlined />,
  "suspicious-account": <UserOutlined />,
  "rapid-actions": <ThunderboltOutlined />,
  "blacklisted-keyword": <AlertOutlined />,
  "off-platform-contact": <MessageOutlined />,
  "geo-mismatch": <EnvironmentOutlined />,
};

const TONE = {
  high: {
    icon: "text-[#C24545] bg-[#AA2727]/10 ring-[#AA2727]/30",
    chip: "bg-[#AA2727]/10 text-[#C24545] ring-[#AA2727]/30",
  },
  medium: {
    icon: "text-gold-400 bg-gold-500/10 ring-gold-500/20",
    chip: "bg-gold-500/10 text-gold-400 ring-gold-500/20",
  },
  low: {
    icon: "text-grey-400 bg-white/[0.04] ring-white/[0.06]",
    chip: "bg-white/[0.04] text-grey-400 ring-white/[0.06]",
  },
} as const;

type Filter = "all" | "unacknowledged" | "acknowledged";

export const ModerationPage = () => {
  const { data = [], isLoading } = useListFraudSignalsQuery();
  const [ack] = useAcknowledgeFraudSignalMutation();
  const [filter, setFilter] = useState<Filter>("unacknowledged");

  const stats = useMemo(() => {
    const high = data.filter((s) => s.severity === "high").length;
    const medium = data.filter((s) => s.severity === "medium").length;
    const open = data.filter((s) => !s.acknowledged).length;
    return { high, medium, open };
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter(
      (s) => (filter === "acknowledged") === s.acknowledged,
    );
  }, [data, filter]);

  const onAck = async (id: string) => {
    try {
      await ack(id).unwrap();
      message.success("Signal acknowledged");
    } catch {
      message.error("Action failed");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Moderation"
        title="Fraud monitoring"
        subtitle="Automated signals surfaced by the platform's anomaly detector. Acknowledge once reviewed."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SignalKpi label="Open signals" value={stats.open} tone="white" />
        <SignalKpi label="High severity" value={stats.high} tone="danger" />
        <SignalKpi label="Medium severity" value={stats.medium} tone="gold" />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={[
            { label: "Unacknowledged", value: "unacknowledged" },
            { label: "Acknowledged", value: "acknowledged" },
            { label: "All", value: "all" },
          ]}
        />
        <div className="text-[12px] text-grey-500">
          {filtered.length} signal{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {!isLoading && filtered.length === 0 ? (
        <GlassPanel padding="lg">
          <EmptyState
            title="Nothing to review"
            description="All fraud signals have been triaged."
          />
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((s) => (
            <SignalCard key={s.id} signal={s} onAck={onAck} />
          ))}
        </div>
      )}
    </div>
  );
};

const SignalKpi = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "gold" | "danger";
}) => (
  <div className="surface-card flex items-center justify-between px-5 py-4">
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tighter2 text-white">
        {value}
      </div>
    </div>
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        tone === "white" && "bg-white",
        tone === "gold" && "bg-gold-500",
        tone === "danger" && "bg-[#AA2727]",
      )}
    />
  </div>
);

const SignalCard = ({
  signal,
  onAck,
}: {
  signal: FraudSignal;
  onAck: (id: string) => void;
}) => {
  const tone = TONE[signal.severity];
  return (
    <div
      className={cn(
        "surface-card flex flex-col gap-4 px-5 py-5",
        signal.acknowledged && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1",
            tone.icon,
          )}
        >
          {ICON[signal.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14.5px] font-semibold text-white">
              {signal.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wider ring-1",
                tone.chip,
              )}
            >
              {signal.severity}
            </span>
            {signal.acknowledged && (
              <span className="rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/20">
                Reviewed
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-grey-400">
            {signal.summary}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.05] pt-3.5 text-[12px] text-grey-500">
        <div className="flex items-center gap-2">
          <LinkOutlined />
          <span className="text-grey-400">
            {titleCase(signal.subjectType)}: {signal.subject.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>{fromNow(signal.detectedAt)}</span>
          {!signal.acknowledged && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => onAck(signal.id)}
            >
              Acknowledge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
