"use client";

import React from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { ArrowRight, Sparkles, Flame, Layers, FileText } from "lucide-react";
import { motion } from "motion/react";
import type { ColorMode } from "@/components/void/VoidCanvas";

interface HeroVoidProps {
  onOpenContact: (mode?: string) => void;
  isRevealed?: boolean;
  colorMode?: ColorMode;
  onSetColorMode?: (mode: ColorMode) => void;
}

export function HeroVoid({
  onOpenContact,
  isRevealed = true,
  colorMode = "lidar",
  onSetColorMode,
}: HeroVoidProps) {
  return (
    <div className="flex flex-col items-start justify-center text-left relative pt-10 pb-6 max-w-xl">
      {/* Soft diffuse contrast shield for razor-sharp text legibility */}
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_left_center,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.60)_65%,transparent_95%)] pointer-events-none -z-10" />

      <div className="space-y-4 sm:space-y-5">
        {/* Glowing Cybernetic Digital Twin Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/35 backdrop-blur-md shadow-[0_0_20px_rgba(0,200,232,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <p className="font-mono text-[0.66rem] tracking-[0.20em] text-cyan-200 uppercase font-bold">
              SPATIAL DIGITAL TWIN · SECTOR 17 BENCHMARK
            </p>
          </div>
        </motion.div>

        {/* Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[clamp(2.1rem,4.0vw,3.4rem)] leading-[1.10] tracking-[-0.025em] font-medium text-white max-w-[19ch] text-balance"
        >
          The physical world is becoming the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-200 drop-shadow-[0_0_24px_rgba(0,200,232,0.4)]">
            next data layer.
          </span>
        </motion.h1>

        {/* Punchy 1-line Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif italic text-[clamp(1.05rem,1.8vw,1.3rem)] text-[#e8e4dc] leading-[1.35] max-w-[32ch]"
        >
          The internet mapped the digital world. We are reconstructing the physical one.
        </motion.p>

        {/* Action Triggers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
        >
          <a
            href="#gap"
            className="inline-flex items-center justify-center gap-2 font-medium text-[0.84rem] py-3 px-6 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_24px_rgba(0,200,232,0.45)] font-bold transition-all cursor-pointer group"
          >
            <span>Explore Spatial Platform</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>

          <Link
            href="/thesis"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-[0.84rem] py-3 px-5 rounded-full transition-all cursor-pointer backdrop-blur-md"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Read Full Thesis</span>
          </Link>

          <button
            onClick={() => onOpenContact("FUND_PROTOTYPE")}
            className="inline-flex items-center justify-center gap-1.5 text-white/70 hover:text-white font-mono text-[0.76rem] px-3 py-2 cursor-pointer transition-colors"
          >
            <span>Data Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* High-Impact Stat Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[0.70rem]"
        >
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-center">
            <span className="text-cyan-300 font-bold block text-[0.95rem]">&lt; $500</span>
            <span className="text-muted text-[0.62rem] uppercase">Rig Cost</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-center">
            <span className="text-cyan-300 font-bold block text-[0.95rem]">&lt; 0.05m</span>
            <span className="text-muted text-[0.62rem] uppercase">Accuracy</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-center">
            <span className="text-cyan-300 font-bold block text-[0.95rem]">500m</span>
            <span className="text-muted text-[0.62rem] uppercase">Loop Closure</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-center">
            <span className="text-cyan-300 font-bold block text-[0.95rem]">3D Splats</span>
            <span className="text-muted text-[0.62rem] uppercase">Neural Prior</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
