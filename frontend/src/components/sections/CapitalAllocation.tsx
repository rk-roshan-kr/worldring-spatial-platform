"use client";

import React from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { CheckCircle, ArrowRight } from "lucide-react";

interface CapitalAllocationProps {
  onOpenContact: (mode?: string) => void;
}

export function CapitalAllocation({ onOpenContact }: CapitalAllocationProps) {
  return (
    <div className="w-full max-w-2xl py-4 space-y-6">
      {/* Minimal Header with Frosted Contrast Shield */}
      <div className="text-center space-y-2.5 mb-8 max-w-2xl mx-auto p-6 sm:p-7 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <span className="font-mono text-[0.66rem] text-cyan-400 tracking-widest uppercase font-semibold">
          Level 06 · Prototype Round
        </span>

        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-[1.15] text-white">
          Capital Allocation &amp; Milestone
        </h2>

        <p className="text-muted text-[0.88rem] leading-relaxed">
          {SITE.capital.milestoneBought}
        </p>
      </div>

      <div className="void-glass p-5 sm:p-6 rounded-2xl border border-white/12 bg-black/80 backdrop-blur-xl space-y-5">
        {/* 4 Allocation Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          {SITE.capital.allocation.map((a) => (
            <div
              key={a.area}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-center"
            >
              <div className="text-cyan-400 text-[1.4rem] font-bold">{a.pct}</div>
              <div className="text-white text-[0.78rem] font-medium">{a.area}</div>
              <div className="text-muted text-[0.66rem] leading-tight pt-1 border-t border-white/5">{a.desc}</div>
            </div>
          ))}
        </div>

        {/* Action Triggers */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
          <button
            onClick={() => onOpenContact("FUND_PROTOTYPE")}
            className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-[0.84rem] py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(0,200,232,0.3)] w-full sm:w-auto justify-center"
          >
            <span>Review Data Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/thesis#capital"
            className="inline-flex items-center gap-1.5 font-mono text-[0.74rem] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Read Complete Financial &amp; Hiring Breakdown in Thesis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
