"use client";

import React, { useState, useEffect } from "react";
import { Compass, Sparkles, Navigation2 } from "lucide-react";

interface Waypoint {
  id: string;
  num: string;
  name: string;
  distM: number;
  targetId: string;
  scrollFraction: number;
}

const WAYPOINTS: Waypoint[] = [
  { id: "top", num: "00", name: "ORIGIN", distM: 5, targetId: "top", scrollFraction: 0.0 },
  { id: "gap", num: "02", name: "THE GAP", distM: 185, targetId: "gap", scrollFraction: 0.18 },
  { id: "pipeline", num: "03", name: "PIPELINE", distM: 300, targetId: "pipeline", scrollFraction: 0.36 },
  { id: "streams", num: "04", name: "DUAL AI", distM: 430, targetId: "streams", scrollFraction: 0.54 },
  { id: "proving", num: "05", name: "BENCHMARK", distM: 540, targetId: "proving", scrollFraction: 0.70 },
  { id: "capital", num: "06", name: "CAPITAL", distM: 590, targetId: "capital", scrollFraction: 0.80 },
  { id: "founder", num: "07", name: "SUMMIT", distM: 615, targetId: "founder", scrollFraction: 0.88 },
  { id: "earthos-footer", num: "08", name: "EARTHOS LAB", distM: 710, targetId: "earthos-footer", scrollFraction: 1.0 },
];

interface SpatialKineticRailProps {
  onJumpToSection?: (targetId: string) => void;
  speedKmh?: number;
  depthM?: number;
}

export function SpatialKineticRail({
  onJumpToSection,
  speedKmh = 0,
  depthM = 5,
}: SpatialKineticRailProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const p = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
          setScrollProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine active waypoint (synchronized with 3D depthM)
  const currentDepth = Math.round(depthM ?? (5 + scrollProgress * (710 - 5)));
  const activeWp = WAYPOINTS.reduce((prev, curr) => {
    return Math.abs(curr.distM - currentDepth) < Math.abs(prev.distM - currentDepth) ? curr : prev;
  });

  return (
    <div
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2 select-none pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Real-Time Kinetic Velocity & Depth Tape */}
      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/12 shadow-[0_4px_20px_rgba(0,0,0,0.6)] font-mono text-[0.66rem]">
        <Compass className={`w-3.5 h-3.5 transition-colors ${speedKmh > 12 ? "text-cyan-400 animate-spin" : "text-white/40"}`} />
        <span className="text-white font-semibold">{currentDepth}M</span>
        <span className="text-white/20">/</span>
        <span className={speedKmh > 12 ? "text-cyan-400 font-bold" : "text-white/50"}>
          {speedKmh} KM/H
        </span>
      </div>

      {/* Vertical Calibrated Kinetic Flight Rail */}
      <div className="relative p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col items-center">
        {/* Background Vertical Rail Spine */}
        <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[2px] bg-white/10 rounded-full" />

        {/* Dynamic Progress Fill Line */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-cyan-400 to-teal-300 rounded-full shadow-[0_0_8px_rgba(0,200,232,0.6)] transition-all duration-75"
          style={{ height: `${Math.min(100, Math.max(0, scrollProgress * 100))}%`, maxHeight: "calc(100% - 32px)" }}
        />

        {/* Waypoint Magnetic Nodes */}
        <div className="relative z-10 flex flex-col items-center gap-4 py-2">
          {WAYPOINTS.map((wp) => {
            const isActive = activeWp.id === wp.id;
            return (
              <button
                key={wp.id}
                onClick={() => onJumpToSection?.(wp.targetId)}
                className="group relative flex items-center justify-center cursor-pointer p-1"
                title={`${wp.num} ${wp.name} · ${wp.distM}m`}
              >
                {/* Node Dot */}
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border ${
                    isActive
                      ? "bg-cyan-400 border-white scale-125 shadow-[0_0_12px_rgba(0,200,232,0.9)]"
                      : "bg-black/80 border-white/30 group-hover:border-cyan-400 group-hover:scale-110"
                  }`}
                />

                {/* Floating Waypoint Tag on Hover or when Active */}
                {(isHovered || isActive) && (
                  <span
                    className={`absolute right-6 px-2.5 py-1 rounded-md text-[0.62rem] font-mono tracking-wider uppercase whitespace-nowrap transition-all shadow-lg border ${
                      isActive
                        ? "bg-cyan-950/90 text-cyan-200 border-cyan-400/40 font-bold"
                        : "bg-black/90 text-white/70 border-white/10 group-hover:text-white"
                    }`}
                  >
                    <span className="text-cyan-400 mr-1.5">{wp.num}</span>
                    <span>{wp.name}</span>
                    <span className="text-white/40 ml-1.5">{wp.distM}M</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
