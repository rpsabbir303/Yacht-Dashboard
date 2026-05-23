import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Minimal area chart — single accent line, very subtle fill.
 * Data is generated locally so the dashboard renders compellingly out of
 * the box; replace with a real `/analytics/applications` endpoint when
 * wiring to the backend.
 */
export const ApplicationsTrendChart = () => {
  const data = useMemo(
    () =>
      [
        { d: "Mon", apps: 14, shortlisted: 4 },
        { d: "Tue", apps: 22, shortlisted: 6 },
        { d: "Wed", apps: 31, shortlisted: 10 },
        { d: "Thu", apps: 28, shortlisted: 8 },
        { d: "Fri", apps: 45, shortlisted: 14 },
        { d: "Sat", apps: 38, shortlisted: 12 },
        { d: "Sun", apps: 50, shortlisted: 18 },
      ],
    [],
  );

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="shortFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="d"
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
            contentStyle={{
              background: "#171A1F",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              color: "#fff",
              fontSize: 12,
              boxShadow: "0 24px 60px -28px rgba(0,0,0,0.8)",
            }}
            labelStyle={{ color: "#A1A1AA", fontSize: 11 }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="shortlisted"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            fill="url(#shortFill)"
            name="Shortlisted"
          />
          <Area
            type="monotone"
            dataKey="apps"
            stroke="#14B8A6"
            strokeWidth={2}
            fill="url(#appsFill)"
            name="Applications"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
