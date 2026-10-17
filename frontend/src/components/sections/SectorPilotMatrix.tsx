"use client";

import React from "react";
import Link from "next/link";
import { Target, CheckCircle2, ArrowRight } from "lucide-react";

export function SectorPilotMatrix() {
  const highlights = [
    { id: "01", title: "Commodity Optical Rig", metric: "< $500", desc: "Dual-lens 5.7K optical rigs replacing $300k multi-beam LiDAR fleets." },
    { id: "02", title: "Metric Loop Closure", metric: "500m Loop", desc: "Zero odometry drift and sub-5cm metric scale across commercial plazas." },
    { id: "03", title: "Automated Segmentation", metric: "Real-Time", desc: "Extracting walkable sidewalks, curb profiles, and retail entrance portals." },
  ];

  return (
    <div className="w-full max-w-2xl py-4 space-y-6">
      {/* Minimal Header with Frosted Contrast Shield */}
      <div className="text-center space-y-2.5 mb-8 max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <span className="font-mono text-[0.64rem] sm:text-[0.66rem] text-cyan-400 tracking-widest uppercase font-semibold">
          Level 05 · Sector 17 Proving Ground
        </span>

        <h2 className="font-serif text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium leading-[1.15] text-white">
          Chandigarh Field Benchmark
        </h2>

        <p className="text-muted text-[0.82rem] sm:text-[0.88rem] leading-relaxed">
          30.7333° N / 76.7794° E · 500-meter loop closure stress-testing Le Corbusier&apos;s pedestrian grid.
        </p>
      </div>

      {/* 3 High-Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {highlights.map((h) => (
          <div
            key={h.id}
            className="void-glass p-4 sm:p-5 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-[0.68rem]">
                <span className="text-cyan-400 font-bold">PILLAR 0{h.id}</span>
                <span className="text-white/60 bg-white/5 px-2 py-0.5 rounded">{h.metric}</span>
              </div>
              <h3 className="font-serif text-[1.05rem] sm:text-[1.1rem] font-medium text-white pt-1">
                {h.title}
              </h3>
            </div>
            <p className="text-muted text-[0.76rem] sm:text-[0.78rem] leading-relaxed pt-2 border-t border-white/5">
              {h.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Prominent Link to Full Thesis */}
      <div className="mt-6 text-center">
        <Link
          href="/thesis#proving-ground"
          className="inline-flex items-center justify-center gap-2 font-mono text-[0.70rem] sm:text-[0.74rem] text-cyan-400 hover:text-cyan-300 transition-colors bg-white/5 hover:bg-white/10 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full border border-white/10 max-w-full text-center"
        >
          <span>Review All 5 Field Hypotheses & Sector Pilot Results in Thesis</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
