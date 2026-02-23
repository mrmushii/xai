"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ParticleField = dynamic<{ scrollProgress?: number }>(
  () => import("@/components/three/ParticleField"),
  { ssr: false }
);
const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-[#07070d]" />,
});
const InsightFlow = dynamic(() => import("@/components/InsightFlow"), {
  ssr: false,
});
const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
});
const CapabilitiesSection = dynamic(
  () => import("@/components/CapabilitiesSection"),
  { ssr: false }
);

/* ---------- Brain Hotspot Data ---------- */
const brainHotspots = [
  {
    id: "nlp",
    label: "NLP",
    x: 35,
    y: 25,
    title: "Natural Language Processing",
    description:
      "Groq-powered Llama 3.3 70B model processes natural language queries, extracts entities, and classifies intent in under 1ms latency.",
    stat: "128K context window",
    icon: "💬",
  },
  {
    id: "cv",
    label: "Computer Vision",
    x: 65,
    y: 25,
    title: "Visual Intelligence",
    description:
      "Identifies anomalies, correlations, and hidden patterns across millions of data points using geometric synthesis algorithms.",
    stat: "98.4% accuracy",
    icon: "👁️",
  },
  {
    id: "ml",
    label: "Machine Learning",
    x: 25,
    y: 45,
    title: "Core ML Engine",
    description:
      "Adaptive learning pipelines that evolve with your data. Supports supervised, unsupervised, and semi-supervised approaches.",
    stat: "14.2 TB/s throughput",
    icon: "⚙️",
  },
  {
    id: "genai",
    label: "Generative AI",
    x: 50,
    y: 20,
    title: "Content Synthesis",
    description:
      "State-of-the-art generative models that transform raw analysis into structured reports, summaries, and actionable workflows.",
    stat: "12 output formats",
    icon: "✨",
  },
  {
    id: "core",
    label: "Neural Core",
    x: 50,
    y: 65,
    title: "Central Processing Trunk",
    description:
      "Orchestrates all AI subsystems — routing queries, managing context, and coordinating parallel inference across 8.4M active nodes.",
    stat: "< 0.8ms end-to-end",
    icon: "🌳",
  },
];

/* ---------- Hotspot Component ---------- */
function BrainHotspot({
  hotspot,
}: {
  hotspot: (typeof brainHotspots)[0];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="absolute group"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulsing dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="relative cursor-pointer"
      >
        {/* Outer pulse ring */}
        <div className="absolute inset-0 w-5 h-5 -m-[2px] rounded-full border border-[rgba(77,25,230,0.4)] animate-ping" />
        {/* Inner dot */}
        <div className="w-4 h-4 rounded-full bg-[#4d19e6] border-2 border-[rgba(255,255,255,0.3)] shadow-[0_0_12px_rgba(77,25,230,0.6)] hover:bg-[#7c4dff] transition-colors duration-200" />
        {/* Label */}
        <div className="absolute left-1/2 -translate-x-1/2 top-6 whitespace-nowrap text-[10px] text-[#7c4dff] tracking-wider font-medium opacity-70">
          {hotspot.label}
        </div>
      </motion.div>

      {/* Tooltip popup */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-50 w-72 pointer-events-none"
            style={{
              left: hotspot.x > 50 ? "auto" : "50%",
              right: hotspot.x > 50 ? "50%" : "auto",
              top: hotspot.y > 50 ? "auto" : "calc(100% + 16px)",
              bottom: hotspot.y > 50 ? "calc(100% + 16px)" : "auto",
              transform: `translateX(${hotspot.x > 50 ? "50%" : "-50%"})`,
            }}
          >
            <div className="glass-card p-4 shadow-2xl shadow-[rgba(77,25,230,0.15)] border border-[rgba(77,25,230,0.25)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{hotspot.icon}</span>
                <h4 className="text-sm font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                  {hotspot.title}
                </h4>
              </div>
              <p className="text-xs text-[#8888a0] leading-relaxed mb-3">
                {hotspot.description}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
                <span className="text-[10px] text-[#00e676] font-bold tracking-widest font-[family-name:var(--font-space-grotesk)]">
                  {hotspot.stat}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function ClientPage() {
  const [particleProgress, setParticleProgress] = useState(0);
  const [particleVisible, setParticleVisible] = useState(true);
  const [gridInteractive, setGridInteractive] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const heroHeight = heroRef.current.offsetHeight;
      const scrolled = -rect.top;
      const total = heroHeight - window.innerHeight;

      if (total <= 0) {
        setParticleProgress(0);
        setParticleVisible(true);
        return;
      }

      const progress = Math.max(0, Math.min(1, scrolled / total));
      setParticleProgress(progress);

      // Enable pointer events when text is gone and brain is formed
      setGridInteractive(progress > 0.25 && progress < 0.7);

      // Show hotspots only when brain is fully formed (narrower range)
      setShowHotspots(progress > 0.38 && progress < 0.62);

      // Particles visible while hero is in view
      const heroBottom = rect.bottom;
      setParticleVisible(heroBottom > -100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#07070d] overflow-x-hidden">
      {/* Fixed particle background */}
      {particleVisible && (
        <div
          className={`fixed inset-0 z-0 transition-opacity duration-300 ${
            gridInteractive ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <ParticleField scrollProgress={particleProgress} />
        </div>
      )}

      {/* Brain hotspot overlay — fixed, only during brain phase */}
      <AnimatePresence>
        {showHotspots && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-10 pointer-events-auto"
          >
            {brainHotspots.map((hotspot) => (
              <BrainHotspot key={hotspot.id} hotspot={hotspot} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      {/* Hero wrapper */}
      <div ref={heroRef}>
        <HeroSection />
      </div>

      <InsightFlow />
      <Dashboard />
      <CapabilitiesSection />
      <Footer />
    </main>
  );
}
