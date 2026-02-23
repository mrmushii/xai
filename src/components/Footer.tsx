"use client";

import { motion } from "framer-motion";

const calmEase = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.04)]">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4d19e6] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: calmEase }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4d19e6] to-[#7c4dff] flex items-center justify-center">
                <span className="text-white font-bold text-sm font-[family-name:var(--font-space-grotesk)]">
                  X
                </span>
              </div>
              <span className="text-white font-semibold text-lg font-[family-name:var(--font-space-grotesk)]">
                xai
              </span>
            </div>
            <p className="text-sm text-[#8888a0] max-w-sm leading-relaxed mb-6">
              The next evolution of neural processing. Transform your raw data
              into actionable intelligence with our geometric deep learning
              engine.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg text-white placeholder-[#555570] outline-none focus:border-[rgba(77,25,230,0.4)] transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#4d19e6] to-[#7c4dff] cursor-pointer whitespace-nowrap"
              >
                Join Grid
              </motion.button>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: calmEase }}
          >
            <h4 className="text-xs font-semibold text-[#555570] tracking-widest uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {["Workspace", "Models", "API", "Documentation"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: calmEase }}
          >
            <h4 className="text-xs font-semibold text-[#555570] tracking-widest uppercase mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {["Twitter", "GitHub", "Discord", "Blog"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-[rgba(255,255,255,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-[10px] text-[#555570] tracking-widest uppercase font-[family-name:var(--font-space-grotesk)]">
              Encrypted Transmission // Secure Channel
            </span>
          </div>
          <p className="text-[10px] text-[#555570] tracking-widest uppercase font-[family-name:var(--font-space-grotesk)]">
            © 2024 Xai Intelligence Systems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
