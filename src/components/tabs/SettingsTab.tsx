"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const calmEase = [0.22, 1, 0.36, 1] as const;

export default function SettingsTab() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* API Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: calmEase }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-6">
          API Configuration
        </h4>

        <div className="space-y-5">
          <div>
            <label className="block text-xs text-[#8888a0] mb-2">Groq API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg text-white placeholder-[#555570] outline-none focus:border-[rgba(77,25,230,0.4)] transition-colors font-mono"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowKey(!showKey)}
                className="px-4 py-2.5 text-xs text-[#8888a0] rounded-lg border border-[rgba(255,255,255,0.06)] hover:text-white transition-colors cursor-pointer"
              >
                {showKey ? "Hide" : "Show"}
              </motion.button>
            </div>
            <p className="text-[10px] text-[#555570] mt-1.5">
              API key is stored server-side in .env.local. This field is for session override only.
            </p>
          </div>

          <div>
            <label className="block text-xs text-[#8888a0] mb-2">Model</label>
            <select className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg text-white outline-none focus:border-[rgba(77,25,230,0.4)] transition-colors cursor-pointer">
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              <option value="gemma2-9b-it">Gemma 2 9B</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Analysis Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: calmEase }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)] mb-6">
          Analysis Parameters
        </h4>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#8888a0]">Temperature</label>
              <span className="text-xs text-white font-[family-name:var(--font-space-grotesk)]">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#4d19e6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#555570] mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#8888a0]">Max Tokens</label>
              <span className="text-xs text-white font-[family-name:var(--font-space-grotesk)]">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="500"
              max="4000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-[#4d19e6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#555570] mt-1">
              <span>500</span>
              <span>4000</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: calmEase }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(77,25,230,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="px-6 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#4d19e6] to-[#7c4dff] cursor-pointer"
        >
          {saved ? "✓ Saved" : "Save Settings"}
        </motion.button>
      </motion.div>
    </div>
  );
}
