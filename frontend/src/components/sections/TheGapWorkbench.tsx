"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Eye, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export function TheGapWorkbench() {
  return (
    <div className="w-full max-w-2xl py-4 space-y-6">
      {/* Kicker & Minimal Headline with Frosted Contrast Shield */}
      <div className="text-center space-y-2.5 mb-8 max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <span className="font-mono text-[0.64rem] sm:text-[0.66rem] text-cyan-400 tracking-widest uppercase font-semibold">
          Level 02 · The Spatial Gap Checkpoint
        </span>

        <h2 className="font-serif text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium leading-[1.15] text-white">
          Addresses fail in the final 100 meters.
        </h2>

        <p className="text-muted text-[0.82rem] sm:text-[0.88rem] leading-relaxed">
          GPS lands on arterial asphalt. WorldRing routes humans and autonomous machines to the exact door.
        </p>
      </div>

      {/* Two Punchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {/* Left: Formal GPS Pin Failure */}
        <div className="void-glass p-4 sm:p-6 rounded-2xl border border-red-500/30 bg-black/80 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5">
              <div className="flex items-center gap-2 font-mono text-[0.74rem] text-red-400 uppercase font-semibold">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Formal Address</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[0.60rem] font-mono bg-red-500/15 text-red-400 border border-red-500/30 font-bold shrink-0">
                120M ERROR
              </span>
            </div>

            <div className="space-y-2 font-mono text-[0.72rem] sm:text-[0.74rem]">
              <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-1.5">
                <span className="text-muted shrink-0">Target:</span>
                <span className="text-white text-right">SCO 123-124, Sector 17-C</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-1.5">
                <span className="text-muted shrink-0">Pin Drop:</span>
                <span className="text-red-400 flex items-center justify-end gap-1 font-semibold text-right">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Courtyard Rooftop / 120m away
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-1.5">
                <span className="text-muted shrink-0">Courier Delay:</span>
                <span className="text-red-400 font-semibold text-right">14 min lost searching</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-[0.72rem] sm:text-[0.74rem] text-red-300 font-sans">
            Formal coordinates lack multi-level arcade and courtyard access context.
          </div>
        </div>

        {/* Right: 360° Visual Landmark Ground Truth */}
        <div className="void-glass p-4 sm:p-6 rounded-2xl border border-cyan-400/35 bg-black/80 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-400/20 pb-2.5">
              <div className="flex items-center gap-2 font-mono text-[0.74rem] text-cyan-300 uppercase font-semibold">
                <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>360° Visual Landmark</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[0.60rem] font-mono bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 font-bold shrink-0">
                &lt; 0.05M GROUND TRUTH
              </span>
            </div>

            <div className="space-y-2 font-mono text-[0.72rem] sm:text-[0.74rem]">
              <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-1.5">
                <span className="text-muted shrink-0">Waypoint 01:</span>
                <span className="text-white text-right">Turn left at central fountain plaza</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-1.5">
                <span className="text-muted shrink-0">Waypoint 02:</span>
                <span className="text-white text-right">Pass between concrete arcade pillars</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-1.5">
                <span className="text-muted shrink-0">Waypoint 03:</span>
                <span className="text-cyan-300 font-semibold text-right">2nd glass entrance on right</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-400/20 text-[0.72rem] sm:text-[0.74rem] text-cyan-200 font-sans flex items-center justify-between">
            <span>Deterministic visual anchors enable zero-delay human & robot arrival.</span>
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
          </div>
        </div>
      </div>

      {/* Prominent Link to Full Thesis */}
      <div className="mt-6 text-center">
        <Link
          href="/thesis#gap"
          className="inline-flex items-center justify-center gap-2 font-mono text-[0.70rem] sm:text-[0.74rem] text-cyan-400 hover:text-cyan-300 transition-colors bg-white/5 hover:bg-white/10 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full border border-white/10 max-w-full text-center"
        >
          <span>Read Full Spatial Gap Analysis & Sector 17 Data in Thesis</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
