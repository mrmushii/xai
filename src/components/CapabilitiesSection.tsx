"use client";

import { motion } from "framer-motion";

const calmEase = [0.22, 1, 0.36, 1] as const;

const capabilities = [
  {
    icon: "◈",
    title: "Adaptive Learning",
    description:
      "Evolving algorithms that adapt to user behavior patterns, creating a bespoke intelligence layer for your data.",
  },
  {
    icon: "⬡",
    title: "Real-time Synthesis",
    description:
      "Instantaneous data processing and visualization, transforming raw inputs into actionable geometric insights.",
  },
  {
    icon: "◇",
    title: "Geometric Intelligence",
    description:
      "Structured data analysis through spatial reasoning, allowing for multi-dimensional problem solving.",
  },
  {
    icon: "▣",
    title: "Pattern Recognition",
    description:
      "Automatically identifies recurring structures in unstructured datasets with >98% accuracy.",
  },
  {
    icon: "△",
    title: "Semantic Ingestion",
    description:
      "Extracts meaning beyond keywords, understanding context and nuance across 40+ languages.",
  },
  {
    icon: "○",
    title: "Neural Sync",
    description:
      "Synchronization at peak efficiency. Neural pathways optimized for deep learning tasks in real-time.",
  },
];

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="py-32 md:py-48">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: calmEase }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
            Core Capabilities
          </h2>
          <p className="text-lg text-[#8888a0] max-w-2xl mx-auto">
            Advanced neural processing meets geometric precision. Our systems
            adapt to your workflow patterns in real-time.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: calmEase,
              }}
              whileHover={{
                y: -4,
                borderColor: "rgba(77,25,230,0.3)",
                transition: { duration: 0.25 },
              }}
              className="glass-card p-6 group cursor-default"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[rgba(77,25,230,0.1)] border border-[rgba(77,25,230,0.15)] flex items-center justify-center text-xl text-[#7c4dff] mb-4 group-hover:bg-[rgba(77,25,230,0.2)] transition-colors duration-300">
                {cap.icon}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-space-grotesk)]">
                {cap.title}
              </h3>
              <p className="text-sm text-[#8888a0] leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: calmEase }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
            Seamless Integration into your cognitive workflow.
          </h3>
          <p className="text-[#8888a0] max-w-xl mx-auto mb-8">
            The Xai engine doesn&apos;t just process; it understands. Connect
            your data streams and watch the neural network build context
            automatically.
          </p>
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 30px rgba(77,25,230,0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-[#4d19e6] to-[#7c4dff] cursor-pointer"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
