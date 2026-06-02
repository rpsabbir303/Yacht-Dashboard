import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@components/common/PageHeader";
import { AdminPageStack } from "@components/admin/AdminPageStack";
import { PageLoader } from "@components/feedback/PageLoader";
import { useGetAnalyticsQuery, useListApplicationsQuery } from "@services/adminApi";

import { AnalyticsWidget, KpiRow } from "./components/AnalyticsWidget";

const TEAL = "#22C7B8";
const GOLD = "#D4B25F";
const GREY = "#6B7280";
const GRID = "rgba(255,255,255,0.05)";
const AXIS = "#6B7280";

const tooltipStyle = {
  backgroundColor: "#151E2D",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#FFFFFF",
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 12px 32px -16px rgba(0,0,0,0.6)",
};

export const AnalyticsPage = () => {
  const { data, isLoading } = useGetAnalyticsQuery();
  const { data: applications = [] } = useListApplicationsQuery();

  if (isLoading || !data) return <PageLoader />;

  const appsByStatus = applications.reduce(
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

  return (
    <AdminPageStack>
      <PageHeader
        section="INTELLIGENCE"
        title="Platform analytics"
        description="A high-level snapshot of users, jobs and applications across the platform."
      />

      {/* ---------------- Headline KPIs ---------------- */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <KpiCard label="Total Users" value={data.users.total} tone="white" />
        <KpiCard label="Total Crew" value={data.users.crew} tone="teal" />
        <KpiCard label="Total Owners" value={data.users.owners} tone="gold" />
        <KpiCard label="Active Jobs" value={data.jobs.active} tone="teal" />
        <KpiCard
          label="Total Applications"
          value={data.applications.total}
          tone="white"
        />
        <KpiCard
          label="Verified rate"
          value={`${Math.round(data.users.verificationRate * 100)}%`}
          tone="gold"
        />
      </div>

      {/* ---------------- Users ---------------- */}
      <div className="mt-10 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Users
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr]">
          <AnalyticsWidget title="User growth" hint="Last 7 weeks">
            <KpiRow
              items={[
                { label: "Total", value: data.users.total.toLocaleString() },
                {
                  label: "Active 30d",
                  value: data.users.active30d.toLocaleString(),
                  tone: "teal",
                },
                {
                  label: "New this week",
                  value: `+${data.users.newThisWeek.toLocaleString()}`,
                  tone: "white",
                },
              ]}
            />
            <div className="mt-5 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.users.growth}>
                  <defs>
                    <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TEAL} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis
                    dataKey="d"
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke={TEAL}
                    fill="url(#usersFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsWidget>

          <AnalyticsWidget title="Users by role" hint="Distribution">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.users.byRole} layout="vertical">
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="role"
                    type="category"
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                    {data.users.byRole.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === 0
                            ? TEAL
                            : i === 1
                              ? "#5fe5c8"
                              : i === 2
                                ? GOLD
                                : GREY
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="right"
                      fill="#94A3B8"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsWidget>
        </div>
      </div>

      {/* ---------------- Applications ---------------- */}
      <div className="mt-10 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Applications
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1.4fr]">
          <AnalyticsWidget title="Application status" hint="By stage">
            <KpiRow
              items={[
                {
                  label: "Pending",
                  value: appsByStatus.pending,
                  tone: "white",
                },
                {
                  label: "Accepted",
                  value: appsByStatus.accepted,
                  tone: "teal",
                },
                {
                  label: "Rejected",
                  value: appsByStatus.rejected,
                  tone: "danger",
                },
              ]}
            />
            <div className="mt-5 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Pending", count: appsByStatus.pending, fill: GREY },
                    {
                      name: "Shortlist",
                      count: appsByStatus.shortlisted,
                      fill: GOLD,
                    },
                    {
                      name: "Interview",
                      count: appsByStatus.interviewing,
                      fill: "#FFFFFF",
                    },
                    {
                      name: "Accepted",
                      count: appsByStatus.accepted,
                      fill: TEAL,
                    },
                    {
                      name: "Rejected",
                      count: appsByStatus.rejected,
                      fill: "#AA2727",
                    },
                  ]}
                >
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {[GREY, GOLD, "#FFFFFF", TEAL, "#AA2727"].map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsWidget>

          <AnalyticsWidget title="Daily activity" hint="Sessions vs applications">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.engagement.dailyActivity}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis
                    dataKey="d"
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#94A3B8" }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke={TEAL}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke={GOLD}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsWidget>
        </div>
      </div>
    </AdminPageStack>
  );
};

const KpiCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "white" | "teal" | "gold";
}) => (
  <div className="surface-card px-4 py-4">
    <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
      {label}
    </div>
    <div
      className={`mt-1 text-2xl font-bold tracking-tighter2 ${
        tone === "teal"
          ? "text-teal-300"
          : tone === "gold"
            ? "text-gold-400"
            : "text-white"
      }`}
    >
      {typeof value === "number" ? value.toLocaleString() : value}
    </div>
  </div>
);

export default AnalyticsPage;
