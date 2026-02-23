"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const fileHintRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const elements = [
      { ref: badgeRef, delay: 0.3, y: 20 },
      { ref: headlineRef, delay: 0.5, y: 30 },
      { ref: subtitleRef, delay: 0.8, y: 20 },
      { ref: ctaRef, delay: 1.1, y: 20 },
      { ref: fileHintRef, delay: 1.4, y: 0 },
      { ref: statsRef, delay: 1.6, y: 20 },
    ];

    // Entrance animation (runs once on load)
    elements.forEach(({ ref, delay, y }) => {
      if (ref.current) {
        gsap.set(ref.current, { opacity: 0, y });
        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
        });
      }
    });

    // Stat children stagger
    if (statsRef.current) {
      const statItems = statsRef.current.children;
      gsap.set(statItems, { opacity: 0, y: 10 });
      gsap.to(statItems, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 1.7,
        ease: "power2.out",
      });
    }

    // Scroll-driven exit — uses fromTo so it fully reverses on scroll back up
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "40% top",
        scrub: 1.2,
      },
    });

    if (badgeRef.current) {
      tl.fromTo(
        badgeRef.current,
        { y: 0, opacity: 1 },
        { y: -80, opacity: 0, duration: 0.3 },
        0
      );
    }
    if (headlineRef.current) {
      tl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: -60, opacity: 0, duration: 0.35 },
        0.02
      );
    }
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { y: 0, opacity: 1 },
        { y: -40, opacity: 0, duration: 0.3 },
        0.05
      );
    }
    if (ctaRef.current) {
      tl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: -30, opacity: 0, duration: 0.3 },
        0.08
      );
    }
    if (fileHintRef.current) {
      tl.fromTo(
        fileHintRef.current,
        { y: 0, opacity: 1 },
        { y: -20, opacity: 0, duration: 0.25 },
        0.09
      );
    }
    if (statsRef.current) {
      tl.fromTo(
        statsRef.current,
        { y: 0, opacity: 1 },
        { y: 40, opacity: 0, duration: 0.3 },
        0.1
      );
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
      {/* Sticky content layer */}
      <div className="sticky top-0 w-full h-screen z-10">
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          {/* Badge */}
          <div
            ref={badgeRef}
            className="mb-6 px-4 py-1.5 rounded-full border border-[rgba(77,25,230,0.3)] bg-[rgba(77,25,230,0.08)] text-[#7c4dff] text-xs font-medium tracking-widest uppercase opacity-0"
          >
            Intelligence Workspace
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-center leading-[0.95] tracking-tight max-w-5xl font-[family-name:var(--font-space-grotesk)] opacity-0"
          >
            <span className="text-white">Raw Data to</span>
            <br />
            <span className="gradient-text">Actionable Insight</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="mt-6 text-lg md:text-xl text-[#8888a0] text-center max-w-2xl leading-relaxed opacity-0"
          >
            Transform unstructured information into structured intelligence.
            Our neural engine evolves with your data, synthesizing millions of
            points into clear strategic directives.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="mt-10 flex gap-4 opacity-0"
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
          </div>

          <p
            ref={fileHintRef}
            className="mt-4 text-xs text-[#555570] opacity-0"
          >
            PDF, CSV, JSON supported up to 500MB
          </p>

          {/* Stats Bar */}
          <div
            ref={statsRef}
            className="mt-16 flex gap-8 md:gap-12 opacity-0"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
