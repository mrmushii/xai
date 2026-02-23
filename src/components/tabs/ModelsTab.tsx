"use client";

import { motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";

const calmEase = [0.22, 1, 0.36, 1] as const;

export default function ModelsTab({ data }: { data: AnalysisResult }) {
  const info = data.modelInfo;

  return (
    <div className="space-y-4">
      {/* Active Model */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: calmEase }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
            Active Model Configuration
          </h4>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-[10px] text-[#00e676] tracking-wider">DEPLOYED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Card */}
          <div className="p-5 rounded-xl border border-[rgba(77,25,230,0.2)] bg-[rgba(77,25,230,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4d19e6] to-[#7c4dff] flex items-center justify-center text-white font-bold text-sm">
                Lm
              </div>
              <div>
                <p className="text-white font-semibold font-[family-name:var(--font-space-grotesk)]">
                  {info.model}
                </p>
                <p className="text-xs text-[#8888a0]">Groq Cloud Inference</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                <p className="text-[10px] text-[#555570] tracking-widest uppercase mb-1">Context Window</p>
                <p className="text-sm text-white font-semibold">128K tokens</p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                <p className="text-[10px] text-[#555570] tracking-widest uppercase mb-1">Architecture</p>
                <p className="text-sm text-white font-semibold">Llama 3.3</p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                <p className="text-[10px] text-[#555570] tracking-widest uppercase mb-1">Parameters</p>
                <p className="text-sm text-white font-semibold">70B</p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                <p className="text-[10px] text-[#555570] tracking-widest uppercase mb-1">Provider</p>
                <p className="text-sm text-white font-semibold">Groq</p>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="space-y-3">
            <h5 className="text-xs text-[#555570] tracking-widest uppercase">Last Analysis Metrics</h5>
            {[
              { label: "Total Tokens Used", value: info.tokensUsed.toLocaleString(), icon: "◈" },
              { label: "Inference Latency", value: `${info.latencyMs}ms`, icon: "◇" },
              { label: "Confidence Score", value: `${(info.confidence * 100).toFixed(1)}%`, icon: "▣" },
              { label: "Temperature", value: "0.3", icon: "⬡" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: calmEase }}
                className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(77,25,230,0.05)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#7c4dff] text-sm">{stat.icon}</span>
                  <span className="text-sm text-[#8888a0]">{stat.label}</span>
                </div>
                <span className="text-sm text-white font-semibold font-[family-name:var(--font-space-grotesk)]">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Model Capabilities */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: calmEase }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
          Model Capabilities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Text Analysis", level: 98 },
            { name: "Pattern Recognition", level: 95 },
            { name: "Anomaly Detection", level: 92 },
            { name: "Sentiment Analysis", level: 96 },
            { name: "Data Synthesis", level: 90 },
            { name: "Trend Forecasting", level: 88 },
          ].map((cap, i) => (
            <div key={cap.name} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#c8c8d8]">{cap.name}</span>
                <span className="text-[10px] text-[#7c4dff] font-bold">{cap.level}%</span>
              </div>
              <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#4d19e6] to-[#7c4dff]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${cap.level}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: calmEase }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
