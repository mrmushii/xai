"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const calmEase = [0.22, 1, 0.36, 1] as const;

const stages = [
  {
    id: "ingest",
    number: "01",
    title: "Ingest Data",
    description:
      "Connect to unstructured sources and raw logs. The system automatically normalizes JSON, XML, and raw text streams in real-time with parallel processing pipelines.",
    detail: "STREAM ACTIVE",
    code: `{
  "source": "raw_feed_01",
  "type": "unstructured",
  "format": ["json", "xml", "csv"],
  "status": "ingesting...",
  "throughput": "14.2 TB/s",
  "pipeline": "parallel_v3"
}`,
    stats: [
      { label: "Throughput", value: "14.2 TB/s" },
      { label: "Formats", value: "12+" },
      { label: "Latency", value: "0.3ms" },
    ],
  },
  {
    id: "analyze",
    number: "02",
    title: "Analyze with AI",
    description:
      "Neural processing engine identifies patterns, anomalies, and correlations across disparate datasets using Groq-powered LLM inference with Llama 3.3 70B.",
    detail: "SCANNING",
    code: `model.analyze({
  engine: "groq-llama-3.3-70b",
  depth: "deep",
  patterns: ["anomaly", "correlation"],
  confidence_threshold: 0.94,
  geometric_synthesis: true,
  real_time: true,
  tokens: "128K context"
});`,
    stats: [
      { label: "Accuracy", value: "98.4%" },
      { label: "Patterns", value: "847" },
      { label: "Model", value: "70B" },
    ],
  },
  {
    id: "generate",
    number: "03",
    title: "Generate Insight",
    description:
      "Output clean, structured insights. The system delivers actionable metrics, anomaly reports, and automated workflows ready for immediate deployment to stakeholders.",
    detail: "OPTIMIZATION SCORE",
    metric: "98.4%",
    code: `{
  "insight_id": "xai_0847",
  "confidence": 0.984,
  "recommendations": 12,
  "anomalies_detected": 3,
  "status": "deployed",
  "latency_ms": 0.8,
  "export": ["pdf", "json", "csv"]
}`,
    stats: [
      { label: "Insights", value: "12" },
      { label: "Deployed", value: "100%" },
      { label: "Latency", value: "0.8ms" },
    ],
  },
];

/* ---------- Stage Indicator Dots ---------- */
function StageIndicator({ activeStage }: { activeStage: number }) {
  return (
    <div className="flex items-center gap-3 justify-center mb-8">
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: activeStage === i ? 1.3 : 1,
              backgroundColor:
                activeStage >= i ? "#4d19e6" : "rgba(255,255,255,0.1)",
            }}
            className="w-3 h-3 rounded-full transition-colors"
          />
          {i < stages.length - 1 && (
            <motion.div
              animate={{
                backgroundColor:
                  activeStage > i ? "#4d19e6" : "rgba(255,255,255,0.05)",
              }}
              className="w-12 h-0.5 rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- SVG Progress Line ---------- */
function DataLine({ progress }: { progress: number }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const totalLength = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${totalLength}`;
    pathRef.current.style.strokeDashoffset = `${totalLength * (1 - progress)}`;
  }, [progress]);

  return (
    <svg
      className="absolute left-4 top-0 bottom-0 w-0.5 h-full hidden lg:block pointer-events-none"
      viewBox="0 0 2 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        ref={pathRef}
        d="M1 0 V100"
        stroke="url(#lineGrad2)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
      />
      <defs>
        <linearGradient id="lineGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d19e6" />
          <stop offset="100%" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------- Single Stage Card (shown one at a time) ---------- */
function StageCard({ stage }: { stage: (typeof stages)[0] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
      {/* Text Side */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[#4d19e6] font-bold text-sm font-[family-name:var(--font-space-grotesk)] tracking-widest">
            {stage.number}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-[rgba(77,25,230,0.4)] to-transparent" />
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
          {stage.title}
        </h3>
        <p className="text-[#8888a0] leading-relaxed text-lg">
          {stage.description}
        </p>

        {/* Stats Row */}
        <div className="flex gap-4 mt-4">
          {stage.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.15 + i * 0.08,
                ease: calmEase,
              }}
              className="py-2 px-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
            >
              <div className="text-[9px] text-[#555570] tracking-widest uppercase">
                {stat.label}
              </div>
              <div className="text-sm text-white font-bold font-[family-name:var(--font-space-grotesk)]">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {stage.metric ? (
          <div className="mt-2">
            <div className="text-[10px] tracking-[0.2em] text-[#555570] uppercase mb-1">
              {stage.detail}
            </div>
            <div className="text-5xl font-bold gradient-text font-[family-name:var(--font-space-grotesk)]">
              {stage.metric}
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(77,25,230,0.1)] border border-[rgba(77,25,230,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-xs text-[#7c4dff] font-medium tracking-wider">
              {stage.detail}
            </span>
          </div>
        )}
      </div>

      {/* Code Block Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: calmEase }}
        className="relative glass-card p-6 overflow-hidden"
      >
        {stage.id === "analyze" && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-[rgba(77,25,230,0.15)] to-transparent animate-scan-line" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-auto text-[10px] text-[#555570] tracking-widest font-[family-name:var(--font-space-grotesk)]">
            XAI_ENGINE
          </span>
        </div>
        <pre className="text-sm text-[#8888a0] font-mono leading-relaxed overflow-x-auto">
          <code>{stage.code}</code>
        </pre>
      </motion.div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function InsightFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=250%",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);
        if (p < 0.33) setActiveStage(0);
        else if (p < 0.66) setActiveStage(1);
        else setActiveStage(2);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="insight-flow"
      className="relative h-screen flex flex-col overflow-hidden"
      style={{ paddingTop: "clamp(60px, 8vh, 100px)" }}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 mb-6 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: calmEase }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-3">
            Intelligence Flow
          </h2>
          <p className="text-base text-[#8888a0] max-w-2xl mx-auto">
            From chaotic raw data to structured actionable insights.
            Scroll to observe the transformation pipeline.
          </p>
        </motion.div>
      </div>

      {/* Stage Indicator */}
      <div className="shrink-0">
        <StageIndicator activeStage={activeStage} />
      </div>

      {/* Active Stage Card — only ONE card visible at a time, centered */}
      <div className="flex-1 flex items-center max-w-6xl mx-auto px-6 relative w-full min-h-0">
        <DataLine progress={scrollProgress} />
        <div className="w-full lg:pl-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={stages[activeStage].id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: calmEase }}
            >
              <StageCard stage={stages[activeStage]} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{
          opacity: scrollProgress > 0.9 ? 0 : 0.5,
          y: [0, 8, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 2 },
          opacity: { duration: 0.3 },
        }}
        className="text-center py-4 shrink-0"
      >
        <span className="text-xs text-[#555570] tracking-widest">
          SCROLL TO EXPLORE
        </span>
        <div className="w-px h-6 mx-auto bg-gradient-to-b from-[#4d19e6] to-transparent mt-2" />
      </motion.div>
    </section>
  );
}
