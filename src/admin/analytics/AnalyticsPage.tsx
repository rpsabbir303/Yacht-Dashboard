import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
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
import { PageLoader } from "@components/feedback/PageLoader";
import { useGetAnalyticsQuery, useListApplicationsQuery } from "@services/adminApi";

import { AnalyticsWidget, KpiRow } from "./components/AnalyticsWidget";

const TEAL = "#14B8A6";
const GOLD = "#C6A75E";
const GREY = "#71717A";
const GRID = "rgba(255,255,255,0.04)";
const AXIS = "#71717A";

const tooltipStyle = {
  backgroundColor: "#171A1F",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 12px 32px -16px rgba(0,0,0,0.6)",
};

export const AnalyticsPage = () => {
  const { data, isLoading, isFetching, refetch } = useGetAnalyticsQuery();
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
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Platform analytics"
        subtitle="A high-level snapshot of users, jobs and applications across the platform."
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Refresh
          </Button>
        }
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
                      fill="#A1A1AA"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsWidget>
        </div>
      </div>

      {/* ---------------- Jobs ---------------- */}
      <div className="mt-10 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Jobs
        </div>
        <AnalyticsWidget title="Job pipeline" hint="Active · filled · expired">
          <KpiRow
            items={[
              { label: "Active", value: data.jobs.active, tone: "teal" },
              { label: "Filled", value: data.jobs.filled, tone: "white" },
              { label: "Expired", value: data.jobs.expired, tone: "danger" },
            ]}
          />
          <div className="mt-6 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
              Average time to fill
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tighter2 text-white">
              {data.jobs.avgTimeToFillDays.toFixed(1)}
              <span className="ml-1 text-sm text-grey-500">days</span>
            </div>
          </div>
        </AnalyticsWidget>
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
                      fill: "#E5E7EB",
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
                    {[GREY, GOLD, "#E5E7EB", TEAL, "#AA2727"].map((c, i) => (
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
                    wrapperStyle={{ fontSize: 12, color: "#A1A1AA" }}
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
    </div>
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
      className={`mt-1 text-2xl font-semibold tracking-tighter2 ${
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
