"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const calmEase = [0.22, 1, 0.36, 1] as const;

const stats = [
  { label: "LATENCY", value: "<1ms" },
  { label: "ACTIVE NODES", value: "8.4M" },
  { label: "GRID DENSITY", value: "4096u" },
  { label: "SYSTEM STATUS", value: "ONLINE", accent: true },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "40% top",
        scrub: 1.2,
      },
    });

    // Text exits in first 40% of hero scroll
    if (badgeRef.current) {
      tl.to(badgeRef.current, { y: -80, opacity: 0, duration: 0.3 }, 0);
    }
    if (headlineRef.current) {
      tl.to(headlineRef.current, { y: -60, opacity: 0, duration: 0.35 }, 0.02);
    }
    if (subtitleRef.current) {
      tl.to(subtitleRef.current, { y: -40, opacity: 0, duration: 0.3 }, 0.05);
    }
    if (ctaRef.current) {
      tl.to(ctaRef.current, { y: -30, opacity: 0, duration: 0.3 }, 0.08);
    }
    if (statsRef.current) {
      tl.to(statsRef.current, { y: 40, opacity: 0, duration: 0.3 }, 0.1);
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[250vh]"
    >
      {/* Sticky content layer (text only — particles are now global) */}
      <div className="sticky top-0 w-full h-screen z-10">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07070d_75%)] pointer-events-none" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          {/* Badge */}
          <motion.div
            ref={badgeRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: calmEase }}
            className="mb-6 px-4 py-1.5 rounded-full border border-[rgba(77,25,230,0.3)] bg-[rgba(77,25,230,0.08)] text-[#7c4dff] text-xs font-medium tracking-widest uppercase"
          >
            Intelligence Workspace
          </motion.div>

          {/* Headline */}
          <motion.h1
            ref={headlineRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: calmEase }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-center leading-[0.95] tracking-tight max-w-5xl font-[family-name:var(--font-space-grotesk)]"
          >
            <span className="text-white">Raw Data to</span>
            <br />
            <span className="gradient-text">Actionable Insight</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            ref={subtitleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: calmEase }}
            className="mt-6 text-lg md:text-xl text-[#8888a0] text-center max-w-2xl leading-relaxed"
          >
            Transform unstructured information into structured intelligence.
            Our neural engine evolves with your data, synthesizing millions of
            points into clear strategic directives.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            ref={ctaRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: calmEase }}
            className="mt-10 flex gap-4"
          >
            <motion.a
              href="#dashboard"
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 30px rgba(77,25,230,0.5)",
              }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-[#4d19e6] to-[#7c4dff] transition-shadow duration-300 cursor-pointer"
            >
              Upload Data Source
            </motion.a>
            <motion.a
              href="#insight-flow"
              whileHover={{
                scale: 1.04,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 text-sm font-semibold text-[#8888a0] rounded-lg border border-[rgba(255,255,255,0.08)] transition-all duration-300 cursor-pointer"
            >
              View Demo
            </motion.a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-4 text-xs text-[#555570]"
          >
            PDF, CSV, JSON supported up to 500MB
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6, ease: calmEase }}
            className="mt-16 flex gap-8 md:gap-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 1.7 + i * 0.1,
                  ease: calmEase,
                }}
                className="text-center"
              >
                <div className="text-[10px] tracking-[0.2em] text-[#555570] uppercase mb-1">
                  {stat.label}
                </div>
                <div
                  className={`text-lg font-bold font-[family-name:var(--font-space-grotesk)] ${
                    stat.accent ? "text-[#00e676]" : "text-white"
                  }`}
                >
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
