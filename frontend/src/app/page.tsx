"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { VoidCanvas, type ColorMode } from "@/components/void/VoidCanvas";
import { AntigravityNav } from "@/components/nav/AntigravityNav";
import { SpatialKineticRail } from "@/components/ui/SpatialKineticRail";
import { HeroVoid } from "@/components/sections/HeroVoid";
import { TheGapWorkbench } from "@/components/sections/TheGapWorkbench";
import { PipelineFlow } from "@/components/sections/PipelineFlow";
import { PhysicalAiLayers } from "@/components/sections/PhysicalAiLayers";
import { SectorPilotMatrix } from "@/components/sections/SectorPilotMatrix";
import { CapitalAllocation } from "@/components/sections/CapitalAllocation";
import { FounderClimax } from "@/components/sections/FounderClimax";
import { ContactModal } from "@/components/ui/ContactModal";
import { Sparkles, Flame, Layers, Volume2, VolumeX, ArrowDown } from "lucide-react";
import {
  playSonarPing,
  playModeSwitch,
  updateEngineHum,
  setAudioEnabled as setAudioEnabledHelper,
} from "@/lib/soundFx";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState("FUND_PROTOTYPE");
  const [colorMode, setColorMode] = useState<ColorMode>("lidar");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [liveStats, setLiveStats] = useState({ speedKmh: 0, depthM: 5, macroProgress: 0 });

  const lenisRef = useRef<Lenis | null>(null);

  // ── SPATIAL KINETIC SCROLL ENGINE (LENIS KINETIC DAMPING) ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      wheelMultiplier: 0.95,
      touchMultiplier: 1.30,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleOpenContact = (mode: string = "FUND_PROTOTYPE") => {
    setContactMode(mode);
    setIsContactOpen(true);
  };

  const handleColorModeChange = (mode: ColorMode) => {
    setColorMode(mode);
    playModeSwitch();
  };

  const handleToggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev;
      setAudioEnabledHelper(next);
      if (next) playSonarPing();
      return next;
    });
  };

  const handleJumpToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -40, duration: 1.3 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* ── Level 00: The 3D Procedural Metropolis Canvas (Sector 17, Chandigarh) ── */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        <VoidCanvas
          className="w-full h-full"
          colorMode={colorMode}
          cameraMode="cinematic"
          onStats={(stats) => {
            setLiveStats({
              speedKmh: stats.speedKmh,
              depthM: stats.depthM,
              macroProgress: stats.macroProgress ?? 0,
            });
          }}
        />
      </div>

      {/* ── Level 01: Floating Glass Navigation ── */}
      <AntigravityNav onOpenContact={handleOpenContact} />

      {/* ── Level 01.5: Spatial Kinetic Flight Rail & Velocity Tape ── */}
      <SpatialKineticRail
        onJumpToSection={handleJumpToSection}
        speedKmh={liveStats.speedKmh}
        depthM={liveStats.depthM}
      />

      {/* ── TOP-RIGHT DISCREET SENSOR PALETTE CONTROLLER ── */}
      <div className="fixed top-20 right-4 sm:right-6 z-40 pointer-events-auto hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-black/80 backdrop-blur-md border border-white/12 shadow-[0_4px_20px_rgba(0,0,0,0.6)] font-mono text-[0.66rem]">
        <span className="text-[0.60rem] text-muted uppercase px-2 font-semibold select-none">
          SENSOR:
        </span>
        <button
          onClick={() => handleColorModeChange("lidar")}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
            colorMode === "lidar"
              ? "bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(0,200,232,0.6)]"
              : "text-white/60 hover:text-white"
          }`}
          title="LiDAR Mode"
        >
          <Sparkles className="w-3 h-3" />
          <span>LiDAR</span>
        </button>
        <button
          onClick={() => handleColorModeChange("heatmap")}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
            colorMode === "heatmap"
              ? "bg-gradient-to-r from-amber-400 to-red-500 text-black font-bold shadow-[0_0_12px_rgba(255,100,50,0.6)]"
              : "text-white/60 hover:text-white"
          }`}
          title="Thermal Heatmap Mode"
        >
          <Flame className="w-3 h-3" />
          <span>HEATMAP</span>
        </button>
        <button
          onClick={() => handleColorModeChange("semantic")}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
            colorMode === "semantic"
              ? "bg-emerald-400 text-black font-bold shadow-[0_0_12px_rgba(0,230,120,0.6)]"
              : "text-white/60 hover:text-white"
          }`}
          title="AI Semantic Strata Mode"
        >
          <Layers className="w-3 h-3" />
          <span>SEMANTIC</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`p-1.5 rounded-full transition-all cursor-pointer ml-1 ${
            audioEnabled
              ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,200,232,0.5)]"
              : "text-white/40 hover:text-white hover:bg-white/10"
          }`}
          title={audioEnabled ? "Sound FX: Active" : "Sound FX: Muted"}
        >
          {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Level 02: Fluid Scrollable Content Stream (User-Driven Web UX) ── */}
      <main className="relative z-10 w-full overflow-x-hidden">
        {/* ── 01: HERO SECTION ── */}
        <section id="top" className="min-h-screen flex flex-col justify-center items-start px-6 sm:px-12 lg:px-20 xl:px-24 pt-28 pb-16">
          <div className="w-full max-w-xl lg:max-w-2xl">
            <HeroVoid
              onOpenContact={handleOpenContact}
              isRevealed={true}
              colorMode={colorMode}
              onSetColorMode={handleColorModeChange}
            />
          </div>

          {/* Gentle Scroll Prompt */}
          <div className="pt-12 flex items-center gap-2 text-muted font-mono text-[0.68rem] tracking-wider uppercase">
            <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Scroll to explore the spatial corridor</span>
          </div>
        </section>

        {/* ── 02: THE SPATIAL GAP CHECKPOINT ── */}
        <section id="gap" className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 xl:px-24 py-20">
          <TheGapWorkbench />
        </section>

        {/* ── 03: THE CONTINUOUS PIPELINE ── */}
        <section id="pipeline" className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 xl:px-24 py-20">
          <PipelineFlow />
        </section>

        {/* ── 04: DUAL VALUE STREAMS & PHYSICAL AI ── */}
        <section id="streams" className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 xl:px-24 py-20">
          <PhysicalAiLayers />
        </section>

        {/* ── 05: SECTOR 17 CHANDIGARH PROVING GROUND ── */}
        <section id="proving" className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 xl:px-24 py-20">
          <SectorPilotMatrix />
        </section>

        {/* ── 06: CAPITAL ALLOCATION MATRIX ── */}
        <section id="capital" className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 xl:px-24 py-20">
          <CapitalAllocation onOpenContact={handleOpenContact} />
        </section>

        {/* ── 07: FOUNDER VISION & CLIMAX ── */}
        <section id="founder" className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 xl:px-24 py-20">
          <FounderClimax onOpenContact={handleOpenContact} />
        </section>

        {/* ── 08: SATELLITE MACRO OVERLOOK · EARTHOS LAB FOOTER ── */}
        <footer id="earthos-footer" className="min-h-[240vh] relative pointer-events-none">
          {/* Sticky 100% Screen Cinematic Viewport */}
          <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-8 pointer-events-none z-10">
            {/* Top Satellite Orbital Status Header */}
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between border border-white/12 bg-black/75 backdrop-blur-xl px-5 py-3 rounded-2xl pointer-events-auto shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-[0.72rem] text-cyan-300 font-bold tracking-[0.25em] uppercase">
                  ORBITAL SATELLITE OVERLOOK · ALTITUDE: 220M
                </span>
              </div>
              <div className="font-mono text-[0.68rem] text-muted hidden sm:flex items-center gap-4">
                <span>000° NORTH</span>
                <span>·</span>
                <span className="text-cyan-400 font-bold">NETWORK: EARTHOSLAB CIRCUIT [100% RESOLVED]</span>
              </div>
            </div>

            {/* Center: 100% Unobstructed Window for the Glowing "earthoslab" Highway Circuit */}
            <div className="flex-1 pointer-events-none" />

            {/* Bottom Terminal Command Dock */}
            <div className="w-full max-w-5xl mx-auto space-y-4 pointer-events-auto">
              {/* Main Footer Console Grid */}
              <div className="void-glass p-6 sm:p-8 rounded-2xl border border-white/12 bg-black/85 backdrop-blur-xl grid grid-cols-1 md:grid-cols-4 gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-serif text-[1.4rem] font-medium text-white tracking-tight">EarthOS Lab</span>
                  </div>
                  <p className="text-muted text-[0.80rem] leading-relaxed max-w-md">
                    Building open, sub-5cm spatial neural digital twin infrastructure. Reconstructing physical reality for autonomous robotics and spatial computing.
                  </p>
                  <div className="pt-1 font-mono text-[0.68rem] text-cyan-400/80">
                    Sector 17 Proving Ground · Chandigarh, India
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[0.66rem] text-muted uppercase font-bold tracking-wider">Research &amp; Specs</span>
                  <ul className="space-y-1.5 font-mono text-[0.74rem]">
                    <li>
                      <Link href="/thesis" className="text-white/80 hover:text-cyan-400 transition-colors">Technical Thesis</Link>
                    </li>
                    <li>
                      <Link href="/thesis#pipeline" className="text-white/80 hover:text-cyan-400 transition-colors">Continuous Pipeline</Link>
                    </li>
                    <li>
                      <Link href="/thesis#proving-ground" className="text-white/80 hover:text-cyan-400 transition-colors">Sector 17 Data Room</Link>
                    </li>
                    <li>
                      <Link href="/thesis#faq" className="text-white/80 hover:text-cyan-400 transition-colors">Engineering FAQ</Link>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[0.66rem] text-muted uppercase font-bold tracking-wider">Connect &amp; Fund</span>
                  <ul className="space-y-1.5 font-mono text-[0.74rem]">
                    <li>
                      <button onClick={() => handleOpenContact("FUND_PROTOTYPE")} className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer text-left">
                        Fund Prototype Round
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleOpenContact("DEPLOY_SECTOR")} className="text-white/80 hover:text-cyan-400 transition-colors cursor-pointer text-left">
                        Deploy Campus Digital Twin
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleJumpToSection("top")} className="text-white/60 hover:text-white transition-colors cursor-pointer text-left">
                        Back to Top ↑
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Credits Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 font-mono text-[0.68rem] text-muted">
                <div>© 2026 EarthOS Lab · WorldRing Spatial Platform. All rights reserved.</div>
                <div className="flex items-center gap-4 text-white/50">
                  <span>Autonomous Visual Intelligence</span>
                  <span>·</span>
                  <button onClick={() => handleJumpToSection("top")} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                    Return to Origin ↑
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Institutional Contact Inquiries Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialMode={contactMode}
      />
    </>
  );
}
