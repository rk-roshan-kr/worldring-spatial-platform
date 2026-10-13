"use client";

import React from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { ArrowRight, Sparkles, FileText } from "lucide-react";

interface FounderClimaxProps {
  onOpenContact: (mode?: string) => void;
}

export function FounderClimax({ onOpenContact }: FounderClimaxProps) {
  return (
    <div className="w-full max-w-2xl py-4 space-y-8">
      {/* 1-Line Founder Quote */}
      <div className="void-glass p-6 sm:p-7 rounded-2xl border border-white/12 bg-black/85 backdrop-blur-xl text-left space-y-2 max-w-xl ml-auto">
        <blockquote className="font-serif text-[clamp(1.1rem,2.0vw,1.35rem)] leading-[1.35] text-white italic">
          &ldquo;{SITE.founder.quote}&rdquo;
        </blockquote>
        <span className="font-mono text-[0.70rem] text-muted block pt-1">
          {SITE.founder.bio.split(".")[0]}.
        </span>
      </div>

      {/* Finale Headline & Actions with Frosted Contrast Shield */}
      <div className="p-7 sm:p-8 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)] space-y-5 text-left max-w-xl ml-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-[0.68rem] text-cyan-300 font-semibold tracking-widest uppercase">
            SUMMIT OVERLOOK · SECTOR 17
          </span>
        </div>

        <h2 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.15] font-medium text-white text-balance">
          The physical world is waiting to be understood.
        </h2>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onOpenContact("FUND_PROTOTYPE")}
            className="inline-flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-[0.88rem] py-3.5 px-7 rounded-full transition-all shadow-[0_0_24px_rgba(0,200,232,0.4)] cursor-pointer group"
          >
            <span>Discuss Prototype Investment</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <Link
            href="/thesis"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-[0.84rem] py-3.5 px-5 rounded-full transition-all border border-white/20"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Read Thesis</span>
          </Link>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[0.70rem] text-muted">
        <div>
          <span>WorldRing Spatial Intelligence Platform</span>
          <span className="mx-2 text-white/20">·</span>
          <span>Chandigarh Sector 17 Benchmark</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/thesis" className="text-cyan-400 hover:underline">Full Technical Thesis</Link>
          <a href="#top" className="hover:text-white transition-colors">Top ↑</a>
          <button onClick={() => onOpenContact("FUND_PROTOTYPE")} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Inquiries
          </button>
        </div>
      </footer>
    </div>
  );
}
