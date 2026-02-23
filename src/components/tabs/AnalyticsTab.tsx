"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { AnalysisResult } from "@/types/analysis";

const calmEase = [0.22, 1, 0.36, 1] as const;
const COLORS = ["#4d19e6", "#7c4dff", "#00e676", "#ffd740", "#ff4081"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-[#8888a0] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

interface AnalyticsTabProps {
  data: AnalysisResult;
  onHoverSegment?: (segment: number, intensity: number) => void;
}

export default function AnalyticsTab({ data, onHoverSegment }: AnalyticsTabProps) {
  return (
    <div className="space-y-4">
      {/* Sentiment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: calmEase }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
              Sentiment Distribution
            </h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              data.sentiment.overall === "positive"
                ? "text-[#00e676] bg-[rgba(0,230,118,0.1)]"
                : data.sentiment.overall === "negative"
                ? "text-[#ff4081] bg-[rgba(255,64,129,0.1)]"
                : "text-[#ffd740] bg-[rgba(255,215,64,0.1)]"
            }`}>
              {data.sentiment.overall.toUpperCase()}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.sentiment.breakdown}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.sentiment.breakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {data.sentiment.breakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-[#8888a0]">{item.label}: {item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: calmEase }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
              Trend Analysis
            </h4>
            <span className="text-[10px] text-[#00e676] tracking-wider">LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data.chartData.timeSeries}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onMouseMove={(e: any) => {
                if (onHoverSegment && typeof e?.activeTooltipIndex === "number") {
                  onHoverSegment(e.activeTooltipIndex, 0.3 + (e.activeTooltipIndex / 6) * 0.7);
                }
              }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d19e6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4d19e6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#555570" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#555570" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#4d19e6" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: calmEase }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            Category Distribution
          </h4>
          <span className="text-[10px] text-[#555570] tracking-wider">AI CLASSIFIED</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.chartData.categories}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#555570" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#555570" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#4d19e6" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
