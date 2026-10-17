"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Cpu, ArrowRight, CheckCircle2 } from "lucide-react";

export function PhysicalAiLayers() {
  return (
    <div className="w-full max-w-2xl py-4 space-y-6">
      {/* Minimal Header with Frosted Contrast Shield */}
      <div className="text-center space-y-2.5 mb-8 max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <span className="font-mono text-[0.64rem] sm:text-[0.66rem] text-cyan-400 tracking-widest uppercase font-semibold">
          Level 04 · Dual Value Streams
        </span>

        <h2 className="font-serif text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium leading-[1.15] text-white">
          One 3D Model. Two Massive Markets.
        </h2>

        <p className="text-muted text-[0.82rem] sm:text-[0.88rem] leading-relaxed">
          The same optical digital twin simultaneously guides humans and trains autonomous physical AI.
        </p>
      </div>

      {/* Two Clean Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        <div className="void-glass p-4 sm:p-6 rounded-2xl border border-cyan-400/30 bg-black/80 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-[0.65rem] text-cyan-400 uppercase font-semibold">STREAM 01</span>
                <h3 className="font-serif text-[1.15rem] sm:text-[1.2rem] font-medium text-white">Human Visual Navigation</h3>
              </div>
            </div>

            <p className="text-muted text-[0.80rem] sm:text-[0.82rem] leading-relaxed">
              Immersive 360° turn-by-turn arrival previews for couriers, shoppers, and campus visitors.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-1.5 font-mono text-[0.70rem] sm:text-[0.72rem] text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Zero delivery failure in unnumbered plazas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Embeddable lightweight WebGL storefront widget</span>
            </div>
          </div>
        </div>

        <div className="void-glass p-4 sm:p-6 rounded-2xl border border-amber-400/30 bg-black/80 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-mono text-[0.65rem] text-amber-400 uppercase font-semibold">STREAM 02</span>
                <h3 className="font-serif text-[1.15rem] sm:text-[1.2rem] font-medium text-white">Physical AI & Robotics Priors</h3>
              </div>
            </div>

            <p className="text-muted text-[0.80rem] sm:text-[0.82rem] leading-relaxed">
              Metric ground truth, curb heights, and obstacle boundaries for sidewalk delivery rovers and AVs.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-1.5 font-mono text-[0.70rem] sm:text-[0.72rem] text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Centimeter curb elevations & traversability meshes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Real-time ROS 2 API & simulation synthetic priors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Link to Full Thesis */}
      <div className="mt-6 text-center">
        <Link
          href="/thesis#dual-streams"
          className="inline-flex items-center justify-center gap-2 font-mono text-[0.70rem] sm:text-[0.74rem] text-cyan-400 hover:text-cyan-300 transition-colors bg-white/5 hover:bg-white/10 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full border border-white/10 max-w-full text-center"
        >
          <span>Inspect 7-Layer Physical AI Strata & Commercial Thesis</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
