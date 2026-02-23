"use client";

import { motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";

const calmEase = [0.22, 1, 0.36, 1] as const;

const severityColors = {
  low: { bg: "rgba(0,230,118,0.08)", border: "rgba(0,230,118,0.2)", text: "#00e676" },
  medium: { bg: "rgba(255,215,64,0.08)", border: "rgba(255,215,64,0.2)", text: "#ffd740" },
  high: { bg: "rgba(255,64,129,0.08)", border: "rgba(255,64,129,0.2)", text: "#ff4081" },
};

export default function ReportsTab({ data }: { data: AnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: calmEase }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            Generated Intelligence Report
          </h4>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-1.5 text-xs font-medium text-[#7c4dff] rounded-lg border border-[rgba(77,25,230,0.3)] hover:bg-[rgba(77,25,230,0.1)] transition-colors cursor-pointer"
          >
            Export Report
          </motion.button>
        </div>

        {/* Report sections */}
        <div className="space-y-6">
          <div>
            <h5 className="text-xs text-[#555570] tracking-widest uppercase mb-2">Executive Summary</h5>
            <p className="text-sm text-[#c8c8d8] leading-relaxed">{data.summary}</p>
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.04)]" />

          <div>
            <h5 className="text-xs text-[#555570] tracking-widest uppercase mb-3">Detailed Findings</h5>
            <div className="space-y-2">
              {data.keyFindings.map((finding, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-[#4d19e6] font-bold shrink-0 font-[family-name:var(--font-space-grotesk)]">§{i + 1}</span>
                  <span className="text-[#c8c8d8] leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.04)]" />

          <div>
            <h5 className="text-xs text-[#555570] tracking-widest uppercase mb-3">Action Items</h5>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(77,25,230,0.04)] border border-[rgba(77,25,230,0.1)]">
                  <span className="w-5 h-5 rounded-md bg-[rgba(77,25,230,0.2)] flex items-center justify-center text-[10px] text-[#7c4dff] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#c8c8d8]">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Anomaly Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: calmEase }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
          Anomaly Detection Log
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[#555570] tracking-widest uppercase border-b border-[rgba(255,255,255,0.04)]">
                <th className="text-left py-3 pr-4">ID</th>
                <th className="text-left py-3 pr-4">Description</th>
                <th className="text-left py-3 pr-4">Severity</th>
                <th className="text-left py-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.anomalies.map((anomaly, i) => {
                const colors = severityColors[anomaly.severity];
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: calmEase }}
                    className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="py-3 pr-4 text-[#555570] font-[family-name:var(--font-space-grotesk)]">
                      ANM-{String(i + 1).padStart(3, "0")}
                    </td>
                    <td className="py-3 pr-4 text-[#c8c8d8]">{anomaly.description}</td>
                    <td className="py-3 pr-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-[#c8c8d8]">{(anomaly.confidence * 100).toFixed(1)}%</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.anomalies.length === 0 && (
          <p className="text-sm text-[#555570] text-center py-8">No anomalies detected</p>
        )}
      </motion.div>
    </div>
  );
}
