"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Platform", href: "#dashboard" },
  { label: "Intelligence Flow", href: "#insight-flow" },
  { label: "Capabilities", href: "#capabilities" },
];

const calmEase = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: calmEase }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#07070d]/80 backdrop-blur-xl border-b border-[rgba(77,25,230,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#hero"
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4d19e6] to-[#7c4dff] flex items-center justify-center">
            <span className="text-white font-bold text-sm font-[family-name:var(--font-space-grotesk)]">
              X
            </span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight font-[family-name:var(--font-space-grotesk)]">
            xai
          </span>
        </motion.a>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.08,
                ease: calmEase,
              }}
              className="relative px-4 py-2 text-sm text-[#8888a0] hover:text-white transition-colors duration-300 rounded-lg group"
            >
              <span className="relative z-10">{item.label}</span>
              <motion.div
                className="absolute inset-0 rounded-lg bg-white/[0.04]"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}
        </div>

        {/* Spacer to keep layout balanced (login button removed) */}
        <div className="w-20" />
      </div>
    </motion.nav>
  );
}
