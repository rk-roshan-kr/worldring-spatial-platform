"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { ThreadRing } from "@/components/ThreadRing";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/** Counts a number from 0 → target over `duration`ms once `trigger` is true */
function useCounter(target: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return value;
}

function parseMeta(s: string): { num: number; rest: string } | null {
  const m = s.match(/^(\d+)(.*)/);
  return m ? { num: parseInt(m[1]), rest: m[2] } : null;
}

function MetaItem({ text, trigger }: { text: string; trigger: boolean }) {
  const parsed = parseMeta(text);
  const count  = useCounter(parsed?.num ?? 0, 1400, trigger && !!parsed);
  return (
    <li className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-paper-deep/60 border border-line/60">
      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
      {parsed ? <><span className="tabular-nums font-semibold text-ink">{count}</span>{parsed.rest}</> : text}
    </li>
  );
}

export function Hero({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  const rightColRef = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);


  // Trigger counters when hero enters view
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.2 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="mx-auto max-w-[76rem] px-(--gutter) pt-8 md:pt-14 lg:pt-6 pb-8 md:pb-12 lg:pb-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 lg:items-center">

        {/* ── Left column ── */}
        <div className="space-y-6">
          <Reveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line-strong/60 bg-paper-deep/80 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent font-semibold mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              Stage 0 · Hypothesis Validation
            </div>
            <h1 className="font-serif text-[clamp(2.2rem,5.2vw,4.2rem)] leading-[1.12] tracking-[-0.025em] font-medium max-w-[20ch] text-balance text-ink">
              {SITE.hero.headline}
            </h1>
            <p className="font-serif italic text-[clamp(1.05rem,2.1vw,1.38rem)] text-accent mt-2 leading-relaxed">
              {SITE.hero.subhead}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="prose-copy text-[0.98rem] sm:text-[1.02rem] leading-relaxed text-body-text max-w-[48ch]">
              {SITE.hero.lede}
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-1">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(191, 71, 34, 0.25)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
                className="btn btn-solid cursor-pointer justify-center sm:justify-start gap-2 shadow-xs group"
              >
                <span>{SITE.hero.primaryCta.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <a
                href="#thesis"
                className="btn btn-ghost justify-center sm:justify-start"
              >
                Explore Architecture ↓
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.38}>
            <ul className="flex flex-wrap gap-2 list-none m-0 pt-4 border-t border-line/80 font-mono text-[0.65rem] tracking-[0.06em] text-muted">
              {SITE.hero.meta.map((m) => (
                <MetaItem key={m} text={m} trigger={triggered} />
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ── Right column — Thread Ring Visualizer ── */}
        <div
          ref={rightColRef}
          className="relative transition-transform duration-75 ease-out will-change-transform"
        >
          <Reveal delay={0.2} direction="scale">
            <div className="relative rounded-2xl border border-line-strong/60 bg-paper-deep/20 overflow-hidden shadow-xs">
              {/* Canvas container — square aspect ratio */}
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "1 / 1" }}
              >
                <ThreadRing className="absolute inset-0 w-full h-full" />
              </div>

              {/* Minimal authentic caption */}
              <div className="flex items-center justify-between font-mono text-[0.68rem] text-muted px-5 py-3 border-t border-line/50 bg-paper/60">
                <span className="text-ink font-medium">World Coordinate Projection</span>
                <span className="text-muted">30.73° N · 76.78° E</span>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}

