import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { GlassPanel } from "@components/common/GlassPanel";
import { cn } from "@utils/cn";
import type { AnalyticsSnapshot, ApplicationSummary } from "@/types";

const TEAL = "#22C7B8";
const GOLD = "#D4B25F";
const DANGER = "#AA2727";

const tooltipStyle = {
  backgroundColor: "#151E2D",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#FFFFFF",
  fontSize: 12,
  padding: "6px 10px",
} as const;

/**
 * Common shell for the compact analytics cards on the admin overview.
 *
 * Each card is intentionally small — a label, a KPI, an optional delta, and a
 * mini chart that fits in ~110px of vertical space.
 */
const CardShell = ({
  eyebrow,
  kpi,
  delta,
  tone,
  children,
}: {
  eyebrow: string;
  kpi: string;
  delta?: string;
  tone: "teal" | "gold" | "white";
  children: React.ReactNode;
}) => (
  <GlassPanel padding="lg" className="flex flex-col gap-4">
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {eyebrow}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tighter2 text-white">
          {kpi}
        </div>
        {delta && (
          <div
            className={cn(
              "text-[11.5px]",
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
    <div className="h-[110px]">{children}</div>
  </GlassPanel>
);

/* ============================================================ */
/*  User growth                                                 */
/* ============================================================ */

interface UserGrowthProps {
  growth: AnalyticsSnapshot["users"]["growth"];
  total: number;
  newThisWeek: number;
}

export const UserGrowthMiniCard = ({ growth, total, newThisWeek }: UserGrowthProps) => (
  <CardShell
    eyebrow="User growth"
    kpi={total.toLocaleString()}
    delta={`+${newThisWeek.toLocaleString()} this week`}
    tone="teal"
  >
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={growth} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="ug-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity={0.32} />
            <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
        <Area
          type="monotone"
          dataKey="users"
          stroke={TEAL}
          fill="url(#ug-fill)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </CardShell>
);

/* ============================================================ */
/*  Daily activity                                              */
/* ============================================================ */

interface DailyActivityProps {
  data: AnalyticsSnapshot["engagement"]["dailyActivity"];
}

export const DailyActivityMiniCard = ({ data }: DailyActivityProps) => {
  const today = data.at(-1)?.sessions ?? 0;
  const yesterday = data.at(-2)?.sessions ?? 0;
  const delta =
    yesterday > 0
      ? `${today >= yesterday ? "+" : ""}${Math.round(
          ((today - yesterday) / yesterday) * 100,
        )}% vs yesterday`
      : "live";

  return (
    <CardShell
      eyebrow="Daily activity"
      kpi={today.toLocaleString()}
      delta={delta}
      tone="white"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="da-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#FFFFFF"
            fill="url(#da-fill)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardShell>
  );
};

/* ============================================================ */
/*  Applications pipeline                                       */
/* ============================================================ */

interface ApplicationsPipelineProps {
  applications: ApplicationSummary[];
}

export const ApplicationsPipelineMiniCard = ({
  applications,
}: ApplicationsPipelineProps) => {
  const byStatus = applications.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {
      pending: 0,
      shortlisted: 0,
      interviewing: 0,
      accepted: 0,
      rejected: 0,
    } as Record<string, number>,
  );

  const data = [
    { label: "Pending", count: byStatus.pending, fill: "#4B5563" },
    { label: "Shortlist", count: byStatus.shortlisted, fill: GOLD },
    { label: "Interview", count: byStatus.interviewing, fill: "#FFFFFF" },
    { label: "Accepted", count: byStatus.accepted, fill: TEAL },
    { label: "Rejected", count: byStatus.rejected, fill: DANGER },
  ];

  return (
    <CardShell
      eyebrow="Applications pipeline"
      kpi={applications.length.toLocaleString()}
      delta={`${byStatus.accepted} accepted · ${byStatus.pending} pending`}
      tone="gold"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((row) => (
              <Cell key={row.label} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardShell>
  );
};

export { CardShell as MiniChartShell };
