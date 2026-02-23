"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const sentimentData = [
  { month: "Jan", positive: 65, negative: 35, neutral: 50 },
  { month: "Feb", positive: 72, negative: 28, neutral: 45 },
  { month: "Mar", positive: 58, negative: 42, neutral: 55 },
  { month: "Apr", positive: 80, negative: 20, neutral: 40 },
  { month: "May", positive: 85, negative: 15, neutral: 38 },
  { month: "Jun", positive: 78, negative: 22, neutral: 42 },
  { month: "Jul", positive: 92, negative: 8, neutral: 35 },
];

const revenueData = [
  { region: "APAC", revenue: 4200, growth: 12 },
  { region: "NA", revenue: 3800, growth: 8 },
  { region: "EU", revenue: 3100, growth: 5 },
  { region: "LATAM", revenue: 1900, growth: 15 },
  { region: "MEA", revenue: 1200, growth: 22 },
];

const throughputData = [
  { time: "00:00", rate: 8.2 },
  { time: "04:00", rate: 6.1 },
  { time: "08:00", rate: 12.4 },
  { time: "12:00", rate: 14.2 },
  { time: "16:00", rate: 11.8 },
  { time: "20:00", rate: 13.1 },
  { time: "24:00", rate: 9.5 },
];

const calmEase = [0.22, 1, 0.36, 1] as const;

const CustomTooltip = ({ active, payload, label }: {active?: boolean; payload?: Array<{value: number; name: string}>; label?: string}) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-[#8888a0] mb-1">{label}</p>
      {payload.map((p: {value: number; name: string}, i: number) => (
        <p key={i} className="text-white font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

interface ChartsProps {
  onHoverSegment?: (segment: number, intensity: number) => void;
}

export default function Charts({ onHoverSegment }: ChartsProps) {
  const [, setActiveChart] = useState(0);

  const handleMouseMove = useCallback(
    (chartIndex: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (e: any) => {
        setActiveChart(chartIndex);
        const idx = typeof e?.activeTooltipIndex === 'number' ? e.activeTooltipIndex : undefined;
        if (onHoverSegment && idx !== undefined) {
          onHoverSegment(idx, 0.3 + (idx / 6) * 0.7);
        }
      };
    },
    [onHoverSegment]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Market Sentiment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: calmEase }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            Market Sentiment Analysis
          </h4>
          <span className="text-[10px] text-[#00e676] tracking-wider">LIVE</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={sentimentData}
            onMouseMove={handleMouseMove(0)}
          >
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4d19e6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4d19e6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#555570" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#555570" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="positive"
              stroke="#4d19e6"
              fill="url(#posGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="neutral"
              stroke="#7c4dff"
              fill="transparent"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-[#8888a0] mt-2">
          Revenue growth exceeded projections by 12% in the APAC region.
        </p>
      </motion.div>

      {/* Revenue by Region */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: calmEase }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            Revenue by Region
          </h4>
          <span className="text-[10px] text-[#555570] tracking-wider">Q4 2024</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData} onMouseMove={handleMouseMove(1)}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="region"
              tick={{ fontSize: 10, fill: "#555570" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#555570" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#4d19e6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Processing Throughput */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: calmEase }}
        className="glass-card p-5 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            Processing Throughput (TB/s)
          </h4>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-[10px] text-[#00e676] tracking-wider">
              ANALYSIS_SPEED
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={throughputData}
            onMouseMove={handleMouseMove(2)}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#555570" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#555570" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#7c4dff"
              strokeWidth={2}
              dot={{ fill: "#4d19e6", r: 3 }}
              activeDot={{ fill: "#7c4dff", r: 5, stroke: "#4d19e6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
