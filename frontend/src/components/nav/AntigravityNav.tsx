"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, ShieldCheck, Cpu, Layers, Terminal, Sparkles, FileText, Menu, X, Flame, Volume2, VolumeX, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ColorMode } from "@/components/void/VoidCanvas";

interface AntigravityNavProps {
  onOpenContact: (mode?: string) => void;
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export function AntigravityNav({
  onOpenContact,
  colorMode,
  onColorModeChange,
  audioEnabled,
  onToggleAudio,
}: AntigravityNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Platform",
      id: "platform",
      items: [
        { title: "The Spatial Gap Analysis", desc: "Formal address failures vs. 360° visual landmark directions", icon: Layers, href: "#gap" },
        { title: "Commodity Optical Pipeline", desc: "Sub-$500 dual-lens optical rigs replacing $300k LiDAR fleets", icon: Cpu, href: "#pipeline" },
        { title: "Physical AI Navigation Priors", desc: "Continuous metric depth ground truth for robots and AVs", icon: Terminal, href: "#streams" },
      ],
    },
    {
      label: "Sector 17 Pilot",
      id: "pilot",
      href: "#proving",
    },
    {
      label: "Capital Ask",
      id: "capital",
      href: "#capital",
    },
    {
      label: "Technical Thesis",
      id: "thesis",
      href: "/thesis",
      isHighlighted: true,
    },
  ];

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <div className="relative pointer-events-auto w-full max-w-fit">
        {/* Floating Glass Pill */}
        <nav className="flex items-center justify-between gap-2 sm:gap-5 px-3 sm:px-6 py-2 rounded-full bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
          {/* Brand Wordmark with glowing cyan optical dot */}
          <a href="#top" className="flex items-center gap-2 group pr-1 sm:pr-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,200,232,0.8)] animate-pulse" />
            <span className="font-serif text-[1.05rem] sm:text-[1.1rem] font-medium tracking-tight text-white group-hover:text-white/80 transition-colors">
              WorldRing
            </span>
          </a>

          {/* Desktop Navigation Links - 100% UNTOUCHED FOR PC */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.items && setActiveMenu(item.id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                {item.items ? (
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.80rem] font-medium transition-colors cursor-pointer ${
                      activeMenu === item.id ? "text-accent bg-white/10" : "text-white/70 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === item.id ? "rotate-180" : ""}`} />
                  </button>
                ) : item.href.startsWith("/") ? (
                  <Link
                    href={item.href}
                    className={`px-3 py-1.5 rounded-full text-[0.80rem] font-medium transition-all ${
                      item.isHighlighted
                        ? "text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 hover:bg-cyan-900/50 hover:text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="px-3 py-1.5 rounded-full text-[0.80rem] font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                )}

                {/* Dropdown Drawer */}
                <AnimatePresence>
                  {item.items && activeMenu === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 mt-2 w-80 p-3 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/12 shadow-[0_20px_40px_rgba(0,0,0,0.95)] space-y-1"
                    >
                      {item.items.map((sub) => {
                        const Icon = sub.icon;
                        return (
                          <a
                            key={sub.title}
                            href={sub.href}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-accent">
                              <Icon className="w-3.5 h-3.5 text-accent" />
                            </div>
                            <div>
                              <div className="text-[0.82rem] font-medium text-white group-hover:text-accent transition-colors">
                                {sub.title}
                              </div>
                              <div className="text-[0.70rem] text-muted leading-snug mt-0.5">
                                {sub.desc}
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Primary CTA Button (Responsive text on mobile to avoid overflow) */}
          <button
            onClick={() => onOpenContact("FUND_PROTOTYPE")}
            className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-neutral-100 text-[0.74rem] sm:text-[0.78rem] font-medium py-1.5 px-3 sm:px-4 rounded-full transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,255,255,0.15)] shrink-0"
          >
            <span className="hidden sm:inline">Discuss Investment</span>
            <span className="sm:hidden">Invest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Hamburger Toggle Button - ONLY VISIBLE ON MOBILE (< md) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors cursor-pointer shrink-0 ml-0.5"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </nav>

        {/* Mobile Navigation Drawer Overlay - ONLY RENDERED ON MOBILE */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden absolute top-full left-0 right-0 mt-3 p-4 rounded-3xl bg-black/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-4 max-h-[82vh] overflow-y-auto"
            >
              {/* Sensor & Audio Controls on Mobile */}
              {onColorModeChange && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[0.66rem] font-mono text-muted uppercase font-semibold">
                    <span>3D SENSOR SIMULATION</span>
                    {onToggleAudio && (
                      <button
                        onClick={onToggleAudio}
                        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                          audioEnabled
                            ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,200,232,0.5)]"
                            : "text-white/40 hover:text-white bg-white/10"
                        }`}
                        title={audioEnabled ? "Sound FX: Active" : "Sound FX: Muted"}
                      >
                        {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span className="text-[0.60rem] px-1 font-bold">{audioEnabled ? "AUDIO ON" : "MUTED"}</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[0.68rem]">
                    <button
                      onClick={() => onColorModeChange("lidar")}
                      className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        colorMode === "lidar"
                          ? "bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(0,200,232,0.6)]"
                          : "bg-black/60 text-white/70 border border-white/10"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>LiDAR</span>
                    </button>
                    <button
                      onClick={() => onColorModeChange("heatmap")}
                      className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        colorMode === "heatmap"
                          ? "bg-gradient-to-r from-amber-400 to-red-500 text-black font-bold shadow-[0_0_12px_rgba(255,100,50,0.6)]"
                          : "bg-black/60 text-white/70 border border-white/10"
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>HEATMAP</span>
                    </button>
                    <button
                      onClick={() => onColorModeChange("semantic")}
                      className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        colorMode === "semantic"
                          ? "bg-emerald-400 text-black font-bold shadow-[0_0_12px_rgba(0,230,120,0.6)]"
                          : "bg-black/60 text-white/70 border border-white/10"
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>SEMANTIC</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                <div className="font-mono text-[0.62rem] text-muted uppercase tracking-wider px-2 font-bold">
                  PLATFORM STRATA
                </div>
                <a
                  href="#gap"
                  onClick={handleMobileNavClick}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[0.84rem] font-medium text-white">The Spatial Gap Analysis</div>
                    <div className="text-[0.68rem] text-muted">Final 100m coordinate failure</div>
                  </div>
                </a>

                <a
                  href="#pipeline"
                  onClick={handleMobileNavClick}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[0.84rem] font-medium text-white">Commodity Optical Pipeline</div>
                    <div className="text-[0.68rem] text-muted">Sub-$500 dual-lens optical rigs</div>
                  </div>
                </a>

                <a
                  href="#streams"
                  onClick={handleMobileNavClick}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[0.84rem] font-medium text-white">Physical AI Navigation Priors</div>
                    <div className="text-[0.68rem] text-muted">Metric depth ground truth for robots</div>
                  </div>
                </a>
              </div>

              {/* Pilot & Capital Sections */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 font-mono text-[0.74rem]">
                <a
                  href="#proving"
                  onClick={handleMobileNavClick}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-center transition-colors"
                >
                  Sector 17 Pilot
                </a>
                <a
                  href="#capital"
                  onClick={handleMobileNavClick}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-center transition-colors"
                >
                  Capital Ask
                </a>
              </div>

              {/* Technical Thesis Link Button */}
              <Link
                href="/thesis"
                onClick={handleMobileNavClick}
                className="flex items-center justify-between p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 hover:text-white hover:bg-cyan-900/50 transition-all font-mono text-[0.76rem] font-medium shadow-[0_0_16px_rgba(0,200,232,0.15)]"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Full Technical Thesis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Inquiries Action */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenContact("FUND_PROTOTYPE");
                  }}
                  className="w-full btn-pill-primary justify-center py-2.5 text-[0.80rem]"
                >
                  <span>Discuss Investment / Data Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
