"use client";

import { SITE } from "@/config/site";
import { StreetMatrixCanvas } from "@/components/StreetMatrixCanvas";
import { useEffect, useRef, useState, forwardRef } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
    <li className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-line-strong/60 bg-paper-deep/80">
      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" style={{ boxShadow: "0 0 6px rgba(0,200,232,0.5)" }} />
      {parsed ? <><span className="tabular-nums font-semibold text-ink">{count}</span>{parsed.rest}</> : text}
    </li>
  );
}

interface HeroProps {
  onOpenContact?: (mode?: string) => void;
  heroRevealed?: boolean;
  introComplete?: boolean;
}

export const Hero = forwardRef<HTMLDivElement, HeroProps>(function Hero(
  { onOpenContact, heroRevealed = true, introComplete = true },
  canvasTargetRef,
) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (heroRevealed) {
      const t = setTimeout(() => setTriggered(true), 400);
      return () => clearTimeout(t);
    }
  }, [heroRevealed]);

  const stagger = (index: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.7, delay: index * 0.12, ease: EASE },
  });

  return (
    <section
      id="top"
      className="mx-auto max-w-[76rem] px-(--gutter) pt-8 md:pt-14 lg:pt-6 pb-8 md:pb-12 lg:pb-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 lg:items-center">

        {/* ── Left column ── */}
        <div className="space-y-6">
          <motion.div {...stagger(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent font-semibold mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-accent" style={{ boxShadow: "0 0 8px rgba(0,200,232,0.6)" }} />
              {SITE.stageTag} · 360° Optical Pipeline
            </div>
          </motion.div>

          <motion.div {...stagger(1)}>
            <h1 className="font-serif text-[clamp(2.2rem,5.2vw,4.2rem)] leading-[1.12] tracking-[-0.025em] font-medium max-w-[20ch] text-balance text-ink">
              {SITE.hero.headline}
            </h1>
            <p className="font-serif italic text-[clamp(1.05rem,2.1vw,1.38rem)] text-accent mt-2 leading-relaxed" style={{ textShadow: "0 0 30px rgba(0,200,232,0.2)" }}>
              {SITE.hero.subhead}
            </p>
          </motion.div>

          <motion.div {...stagger(2)}>
            <p className="prose-copy text-[0.98rem] sm:text-[1.02rem] leading-relaxed text-body-text max-w-[48ch]">
              {SITE.hero.lede}
            </p>
          </motion.div>

          <motion.div {...stagger(3)}>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-1">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(0, 200, 232, 0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
                className="btn btn-solid cursor-pointer justify-center sm:justify-start gap-2 group"
              >
                <span>{SITE.hero.primaryCta.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <a
                href="#thesis"
                className="btn btn-ghost justify-center sm:justify-start"
              >
                Explore Pipeline ↓
              </a>
            </div>
          </motion.div>

          <motion.div {...stagger(4)}>
            <ul className="flex flex-wrap gap-2 list-none m-0 pt-4 border-t border-line font-mono text-[0.65rem] tracking-[0.06em] text-muted">
              {SITE.hero.meta.map((m) => (
                <MetaItem key={m} text={m} trigger={triggered} />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Right column — Street Matrix ── */}
        <div
          ref={canvasTargetRef as React.Ref<HTMLDivElement>}
          className="relative"
        >
          <div className="relative rounded-2xl border border-line-strong overflow-hidden glow-border">
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "16 / 10" }}
            >
              {introComplete ? (
                <StreetMatrixCanvas className="absolute inset-0 w-full h-full" />
              ) : (
                <div className="absolute inset-0 bg-black" />
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: heroRevealed ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              className="flex items-center justify-between font-mono text-[0.68rem] text-muted px-5 py-3 border-t border-line bg-paper-deep/80"
            >
              <span className="text-accent/70 font-medium">Spatial Point-Cloud Corridor · Sector 17</span>
              <span className="text-muted">30.73° N · 76.78° E</span>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
});
