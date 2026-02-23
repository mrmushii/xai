"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState, useRef } from "react";

const ParticleField = dynamic(
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

export default function ClientPage() {
  const [particleProgress, setParticleProgress] = useState(0);
  const [particleVisible, setParticleVisible] = useState(true);
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

      // Particles visible while hero is in view, fade after hero ends
      const heroBottom = rect.bottom;
      setParticleVisible(heroBottom > -100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#07070d] overflow-x-hidden">
      {/* Fixed particle background — follows scroll across sections */}
      {particleVisible && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleField scrollProgress={particleProgress} />
        </div>
      )}

      <Navbar />

      {/* Hero wrapper — provides scroll height for particle phases */}
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
