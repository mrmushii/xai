"use client";

import { motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";

const calmEase = [0.22, 1, 0.36, 1] as const;

export default function OverviewTab({ data }: { data: AnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: calmEase }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#4d19e6] animate-pulse" />
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            AI Executive Summary
          </h4>
        </div>
        <p className="text-[#c8c8d8] leading-relaxed">{data.summary}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(77,25,230,0.1)] border border-[rgba(77,25,230,0.2)]">
            <span className="text-xs text-[#7c4dff] font-medium">
              Confidence: {(data.modelInfo.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,230,118,0.08)] border border-[rgba(0,230,118,0.2)]">
            <span className="text-xs text-[#00e676] font-medium capitalize">
              Sentiment: {data.sentiment.overall} ({(data.sentiment.score * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key Findings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: calmEase }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
          Key Findings
        </h4>
        <div className="space-y-3">
          {data.keyFindings.map((finding, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: calmEase }}
              className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(77,25,230,0.06)] transition-colors"
            >
              <span className="text-[#4d19e6] text-xs font-bold mt-0.5 font-[family-name:var(--font-space-grotesk)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-[#c8c8d8] leading-relaxed">{finding}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: calmEase }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
          Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.08, ease: calmEase }}
              className="p-4 rounded-lg border border-[rgba(77,25,230,0.15)] bg-[rgba(77,25,230,0.04)] hover:border-[rgba(77,25,230,0.3)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(77,25,230,0.15)] flex items-center justify-center text-[#7c4dff] text-xs font-bold mb-3">
                {i + 1}
              </div>
              <p className="text-sm text-[#c8c8d8] leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
