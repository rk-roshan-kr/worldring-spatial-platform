"use client";

import React, { useState } from "react";
import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaBand({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  return (
    <section className="border-t border-inv-line bg-inv-bg text-inv-text py-16 md:py-28 lg:py-16 relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-radial from-accent/15 via-accent/5 to-transparent pointer-events-none blur-2xl" />

      <div className="mx-auto max-w-[76rem] px-(--gutter) text-center relative z-10" id="contact">
        <Reveal delay={0.08}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-inv-line/80 bg-white/5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#e08a67] mb-6 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Prototype / Ideation Stage</span>
          </div>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.12] tracking-[-0.02em] font-medium max-w-[24ch] mx-auto text-balance m-0 text-inv-text">
            The physical world is already here. We are building the infrastructure to understand it.
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="font-mono text-[0.84rem] tracking-[0.06em] text-inv-muted mt-5 max-w-prose mx-auto">
            {SITE.brandName} · Stage 0 Experimentation · Chandigarh Road Corridor Benchmark
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="cta-actions flex flex-wrap items-center justify-center gap-3.5 mt-10">
            <motion.button
              whileHover={{ scale: 1.04, y: -2, boxShadow: "0 8px 24px rgba(191, 71, 34, 0.35)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
              className="px-7 py-3.5 rounded-full bg-accent hover:bg-accent-deep text-white font-mono text-[0.78rem] uppercase tracking-[0.14em] font-bold shadow-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Fund Prototype Capital</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenContact?.("TECHNICAL_COLLABORATION")}
              className="px-6 py-3.5 rounded-full border border-inv-line hover:border-inv-text text-inv-text font-mono text-[0.78rem] uppercase tracking-[0.14em] transition-colors cursor-pointer"
            >
              Technical Collaboration
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenContact?.("FOLLOW_RESEARCH")}
              className="px-6 py-3.5 rounded-full border border-inv-line/60 text-inv-muted hover:text-inv-text font-mono text-[0.78rem] uppercase tracking-[0.14em] transition-colors cursor-pointer"
            >
              Follow Research Updates
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const [subEmail, setSubEmail] = React.useState("");
  const [subStatus, setSubStatus] = React.useState<"IDLE" | "SENDING" | "DONE">("IDLE");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus("SENDING");
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "newsletter",
          email: subEmail,
        }).toString(),
      });
      setSubStatus("DONE");
    } catch {
      setSubStatus("DONE");
    }
  };

  return (
    <footer className="border-t border-line py-12 lg:py-10 bg-paper">
      <div className="mx-auto max-w-[76rem] px-(--gutter) grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.6fr] gap-8 md:gap-10 items-start">
        <div>
          <p className="font-serif text-[1.2rem] font-semibold m-0 mb-2 text-ink">{SITE.brandName}</p>
          <p className="text-[0.9rem] text-muted m-0 max-w-[38ch] leading-relaxed">
            Exploring the pipeline from low-cost optical observations to structured 3D spatial infrastructure.
          </p>
        </div>
        <nav aria-label="Footer" className="grid gap-2.5 content-start">
          {SITE.nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-mono text-[0.74rem] text-body-text no-underline hover:text-accent-deep transition-colors"
            >
              {n.num} — {n.label}
            </a>
          ))}
        </nav>
        <div className="font-mono text-[0.68rem] leading-[1.7] text-muted space-y-3">
          <div>
            <p className="text-[0.74rem] font-bold text-ink uppercase tracking-wider mb-1">Technical Dispatches</p>
            <p className="m-0 text-muted">Field logs, SfM pipeline benchmarks, &amp; prototype data releases.</p>
          </div>
          {subStatus === "DONE" ? (
            <div className="text-accent font-semibold flex items-center gap-1.5 py-1">
              <span>✓ Subscribed to Earthos Lab dispatches.</span>
            </div>
          ) : (
            <form
              name="newsletter"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleNewsletter}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="form-name" value="newsletter" />
              <p className="hidden">
                <label>
                  Don’t fill this out: <input name="bot-field" />
                </label>
              </p>
              <input
                type="email"
                name="email"
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                placeholder="email@institution.edu"
                className="w-full max-w-[220px] px-3 py-1.5 rounded-lg bg-paper-deep border border-line-strong text-ink text-xs focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={subStatus === "SENDING"}
                className="px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-deep transition-colors cursor-pointer shrink-0"
              >
                {subStatus === "SENDING" ? "..." : "Join"}
              </button>
            </form>
          )}
          <div className="pt-2 border-t border-line/60">
            <p className="m-0">© {year} {SITE.brandName} · Prototype &amp; Ideation Exploration.</p>
            <p className="m-0">All spatial layer schemas represent technical intent under active validation.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

