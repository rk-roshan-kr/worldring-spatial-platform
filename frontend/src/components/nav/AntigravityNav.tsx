"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, ShieldCheck, Cpu, Layers, Terminal, Sparkles, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AntigravityNavProps {
  onOpenContact: (mode?: string) => void;
}

export function AntigravityNav({ onOpenContact }: AntigravityNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="relative pointer-events-auto">
        {/* Floating Glass Pill */}
        <nav className="flex items-center gap-2 sm:gap-5 px-4 sm:px-6 py-2 rounded-full bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
          {/* Brand Wordmark with glowing cyan optical dot */}
          <a href="#top" className="flex items-center gap-2 group pr-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,200,232,0.8)] animate-pulse" />
            <span className="font-serif text-[1.1rem] font-medium tracking-tight text-white group-hover:text-white/80 transition-colors">
              WorldRing
            </span>
          </a>

          {/* Desktop Navigation Links */}
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

          {/* Primary CTA Button */}
          <button
            onClick={() => onOpenContact("FUND_PROTOTYPE")}
            className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-neutral-100 text-[0.78rem] font-medium py-1.5 px-4 rounded-full transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,255,255,0.15)] ml-1"
          >
            <span>Discuss Investment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      </div>
    </header>
  );
}
