import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@components/common/PageHeader";
import { PageLoader } from "@components/feedback/PageLoader";
import { useGetAnalyticsQuery } from "@services/adminApi";

import { AnalyticsWidget, KpiRow } from "./components/AnalyticsWidget";

const TEAL = "#14B8A6";
const GOLD = "#C6A75E";
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

  if (isLoading || !data) return <PageLoader />;

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Platform analytics"
        subtitle="A high-level snapshot of users, jobs and engagement across the platform."
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

      {/* USER ANALYTICS */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Users
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <AnalyticsWidget title="User overview" hint="Snapshot">
            <KpiRow
              items={[
                {
                  label: "Total users",
                  value: data.users.total.toLocaleString(),
                },
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
            <div className="mt-5 h-[180px]">
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

          <AnalyticsWidget title="Verification rate" hint="Last 30 days">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  data={[
                    {
                      name: "verified",
                      value: Math.round(data.users.verificationRate * 100),
                      fill: TEAL,
                    },
                  ]}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar background={{ fill: "rgba(255,255,255,0.04)" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="-mt-[170px] text-center">
                <div className="text-4xl font-semibold tracking-tighter2 text-white">
                  {Math.round(data.users.verificationRate * 100)}
                  <span className="text-lg text-grey-500">%</span>
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-grey-500">
                  Of accounts verified
                </div>
              </div>
            </div>
          </AnalyticsWidget>

          <AnalyticsWidget title="Users by role" hint="Distribution">
            <div className="h-[280px]">
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
                    width={70}
                  />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                    {data.users.byRole.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? TEAL : i === 1 ? "#5fe5c8" : i === 2 ? GOLD : "#71717A"} />
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

      {/* JOB ANALYTICS */}
      <div className="mt-10 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Jobs
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1.4fr]">
          <AnalyticsWidget title="Job pipeline" hint="Active / filled / expired">
            <KpiRow
              items={[
                { label: "Active", value: data.jobs.active, tone: "teal" },
                { label: "Filled", value: data.jobs.filled, tone: "white" },
                { label: "Expired", value: data.jobs.expired, tone: "danger" },
              ]}
            />
            <div className="mt-6 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
                Avg time to fill
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tighter2 text-white">
                {data.jobs.avgTimeToFillDays.toFixed(1)}
                <span className="ml-1 text-sm text-grey-500">days</span>
              </div>
            </div>
          </AnalyticsWidget>

          <AnalyticsWidget title="Hiring funnel" hint="Posted → Hired">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Funnel
                    dataKey="value"
                    data={data.jobs.funnel}
                    isAnimationActive
                  >
                    <LabelList
                      dataKey="stage"
                      position="right"
                      fill="#FFFFFF"
                      stroke="none"
                      fontSize={12}
                    />
                    {data.jobs.funnel.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? TEAL : "#0d9488"} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsWidget>
        </div>
      </div>

      {/* ENGAGEMENT */}
      <div className="mt-10 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Engagement
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <AnalyticsWidget title="Applications submitted" hint="7-day total">
            <div className="text-4xl font-semibold tracking-tighter2 text-white">
              {data.engagement.applicationsSubmitted.toLocaleString()}
            </div>
            <div className="mt-1 text-[12px] text-grey-500">
              Across all listings · last 7 days
            </div>
          </AnalyticsWidget>

          <AnalyticsWidget title="Messages sent" hint="7-day total">
            <div className="text-4xl font-semibold tracking-tighter2 text-white">
              {data.engagement.messagesSent.toLocaleString()}
            </div>
            <div className="mt-1 text-[12px] text-grey-500">
              Between candidates and hirers
            </div>
          </AnalyticsWidget>

          <AnalyticsWidget title="Verification rate trend" hint="Pacing">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-semibold tracking-tighter2 text-white">
                {Math.round(data.users.verificationRate * 100)}%
              </div>
              <div className="text-[12px] text-teal-300">+4.2% vs prior period</div>
            </div>
            <div className="mt-1 text-[12px] text-grey-500">
              Verified accounts over total
            </div>
          </AnalyticsWidget>
        </div>

        <AnalyticsWidget title="Daily activity" hint="Sessions vs messages">
          <div className="h-[260px]">
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
                  dataKey="messages"
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
  );
};

export default AnalyticsPage;
