"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { AnalysisResult } from "@/types/analysis";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const InsightCrystal = dynamic(
  () => import("@/components/three/InsightCrystal"),
  { ssr: false }
);
const OverviewTab = dynamic(() => import("@/components/tabs/OverviewTab"), { ssr: false });
const AnalyticsTab = dynamic(() => import("@/components/tabs/AnalyticsTab"), { ssr: false });
const ReportsTab = dynamic(() => import("@/components/tabs/ReportsTab"), { ssr: false });
const ModelsTab = dynamic(() => import("@/components/tabs/ModelsTab"), { ssr: false });
const SettingsTab = dynamic(() => import("@/components/tabs/SettingsTab"), { ssr: false });

const calmEase = [0.22, 1, 0.36, 1] as const;

const sidebarItems = [
  { icon: "◈", label: "Overview" },
  { icon: "◇", label: "Analytics" },
  { icon: "▣", label: "Reports" },
  { icon: "⬡", label: "Models" },
  { icon: "⚙", label: "Settings" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeSegment, setActiveSegment] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError("");
    setFileName(file.name);
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStage("Reading file...");

    try {
      // Read file content — handle PDFs specially
      let content: string;
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        // Read PDF as ArrayBuffer, then extract text with pdfjs-dist
        setProcessingStage("Parsing PDF document...");
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
          reader.onerror = () => reject(new Error("Failed to read PDF file"));
          reader.readAsArrayBuffer(file);
        });

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          pages.push(pageText);
        }
        content = pages.join("\n\n--- Page Break ---\n\n");

        if (!content.trim()) {
          throw new Error(
            "Could not extract text from this PDF. It may be a scanned/image-based PDF."
          );
        }
      } else {
        // Text-based files (CSV, JSON, TXT, etc.)
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });
      }

      setProcessingProgress(25);
      setProcessingStage("Uploading to neural engine...");
      await new Promise((r) => setTimeout(r, 500));

      setProcessingProgress(50);
      setProcessingStage("AI analyzing patterns...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          fileName: file.name,
          fileType: file.type || file.name.split(".").pop(),
        }),
      });

      setProcessingProgress(80);
      setProcessingStage("Synthesizing insights...");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data: AnalysisResult = await res.json();

      setProcessingProgress(100);
      setProcessingStage("Complete!");
      await new Promise((r) => setTimeout(r, 500));

      setAnalysisData(data);
      setActiveTab("Overview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleHoverSegment = useCallback(
    (segment: number, intens: number) => {
      setActiveSegment(segment);
      setIntensity(intens);
    },
    []
  );

  const renderActiveTab = () => {
    if (!analysisData) return null;

    switch (activeTab) {
      case "Overview":
        return <OverviewTab data={analysisData} />;
      case "Analytics":
        return <AnalyticsTab data={analysisData} onHoverSegment={handleHoverSegment} />;
      case "Reports":
        return <ReportsTab data={analysisData} />;
      case "Models":
        return <ModelsTab data={analysisData} />;
      case "Settings":
        return <SettingsTab />;
      default:
        return <OverviewTab data={analysisData} />;
    }
  };

  const metrics = analysisData?.metrics || [
    { label: "Data Processed", value: "—", change: "—" },
    { label: "Active Models", value: "—", change: "—" },
    { label: "Accuracy Score", value: "—", change: "—" },
    { label: "Avg Latency", value: "—", change: "—" },
  ];

  return (
    <section id="dashboard" className="py-32 md:py-48">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: calmEase }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
            Intelligence Overview
          </h2>
          <p className="text-lg text-[#8888a0] max-w-2xl mx-auto">
            Upload your data and let our AI engine analyze patterns,
            detect anomalies, and generate actionable insights.
          </p>
        </motion.div>

        {/* Dashboard Layout */}
        <div className="flex gap-4">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: calmEase }}
            className="hidden lg:flex flex-col gap-1 glass-card p-3 w-48 shrink-0 h-fit sticky top-24"
          >
            {sidebarItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.06,
                  ease: calmEase,
                }}
                whileHover={{
                  backgroundColor: "rgba(77,25,230,0.1)",
                  scale: 1.02,
                }}
                onClick={() => {
                  if (analysisData || item.label === "Settings") {
                    setActiveTab(item.label);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer text-left ${
                  activeTab === item.label
                    ? "bg-[rgba(77,25,230,0.15)] text-white"
                    : analysisData || item.label === "Settings"
                    ? "text-[#8888a0] hover:text-white"
                    : "text-[#555570] cursor-not-allowed opacity-50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}

            {/* Upload New button */}
            {analysisData && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setAnalysisData(null);
                  setActiveTab("Overview");
                  setFileName("");
                }}
                className="mt-4 px-3 py-2 text-xs text-[#7c4dff] rounded-lg border border-[rgba(77,25,230,0.2)] hover:bg-[rgba(77,25,230,0.08)] transition-colors cursor-pointer text-center"
              >
                + New Analysis
              </motion.button>
            )}
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: calmEase,
                  }}
                  whileHover={{
                    borderColor: "rgba(77,25,230,0.3)",
                    scale: 1.02,
                  }}
                  className="glass-card p-4 cursor-default"
                >
                  <div className="text-[10px] text-[#555570] tracking-widest uppercase mb-2">
                    {m.label}
                  </div>
                  <div className="text-2xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                    {m.value}
                  </div>
                  <div className="text-xs text-[#00e676] mt-1">{m.change}</div>
                </motion.div>
              ))}
            </div>

            {/* Upload Zone / Processing */}
            {!analysisData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: calmEase }}
                className={`glass-card p-8 text-center transition-colors ${
                  dragActive ? "border-[rgba(77,25,230,0.5)] bg-[rgba(77,25,230,0.06)]" : ""
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.json,.xml,.md,.log,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-[#4d19e6] border-t-transparent animate-spin" />
                    <p className="text-white font-semibold font-[family-name:var(--font-space-grotesk)]">
                      {processingStage}
                    </p>
                    <p className="text-sm text-[#8888a0]">{fileName}</p>
                    <div className="w-80 mx-auto h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#4d19e6] to-[#7c4dff]"
                        animate={{ width: `${processingProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-[#555570]">{processingProgress}%</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`w-20 h-20 mx-auto rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors ${
                        dragActive
                          ? "border-[#4d19e6] bg-[rgba(77,25,230,0.1)]"
                          : "border-[rgba(77,25,230,0.3)]"
                      }`}
                    >
                      <span className="text-3xl text-[#4d19e6]">↑</span>
                    </div>
                    <p className="text-white font-semibold font-[family-name:var(--font-space-grotesk)] text-lg">
                      {dragActive ? "Drop file here" : "Upload Data Source"}
                    </p>
                    <p className="text-sm text-[#8888a0]">
                      Drag & drop or click to upload — CSV, JSON, TXT, XML, LOG, MD
                    </p>
                    <motion.button
                      whileHover={{
                        scale: 1.04,
                        boxShadow: "0 0 30px rgba(77,25,230,0.4)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#4d19e6] to-[#7c4dff] cursor-pointer"
                    >
                      Choose File
                    </motion.button>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-[#ff4081] mt-2"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {analysisData && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: calmEase }}
                >
                  {renderActiveTab()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3D Crystal Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: calmEase }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">
                  3D Insight Hub
                </h4>
                <span className="text-[10px] text-[#555570] tracking-wider">
                  GEOMETRIC SYNTHESIS
                </span>
              </div>
              <div className="h-80">
                <InsightCrystal
                  activeSegment={activeSegment}
                  intensity={intensity}
                />
              </div>
              <p className="text-xs text-[#8888a0] mt-3 text-center">
                {analysisData 
                  ? "Hover over Analytics charts to see the crystal react in real-time"
                  : "Upload data to activate crystal intelligence visualization"
                }
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
