"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { ThreadRing } from "@/components/ThreadRing";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
    <li className="flex items-center gap-1.5">
      <span className="w-1 h-1 bg-muted rounded-full shrink-0" />
      {parsed ? <><span className="tabular-nums">{count}</span>{parsed.rest}</> : text}
    </li>
  );
}

export function Hero({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  const rightColRef = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);

  // Subtle parallax on the globe — shifts very slightly against scroll
  useEffect(() => {
    const container = document.getElementById("snap-container") ?? window;
    const handle = () => {
      if (!rightColRef.current) return;
      const scrollY = container === window
        ? window.scrollY
        : (container as HTMLElement).scrollTop;
      rightColRef.current.style.transform = `translateY(${Math.min(scrollY * 0.06, 24)}px)`;
    };
    container.addEventListener("scroll", handle, { passive: true });
    return () => container.removeEventListener("scroll", handle);
  }, []);

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
      className="mx-auto max-w-[76rem] px-(--gutter) pt-6 md:pt-10 lg:pt-4 pb-6 md:pb-10 lg:pb-3"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 lg:items-center">

        {/* ── Left column ── */}
        <div className="space-y-5">
          <Reveal>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent mb-2 font-semibold flex items-center gap-2">
              <span className="inline-block w-4 h-px bg-accent" />
              Stage 0 · Hypothesis Validation
            </div>
            <h1 className="font-serif text-[clamp(2.1rem,5.5vw,4.4rem)] leading-[1.12] tracking-[-0.02em] font-medium max-w-[20ch] text-balance text-ink">
              {SITE.hero.headline}
            </h1>
            <p className="font-serif italic text-[clamp(1rem,2.2vw,1.4rem)] text-accent mt-2">
              {SITE.hero.subhead}
            </p>
          </Reveal>

          <Reveal>
            <p className="prose-copy text-[0.95rem] sm:text-[1rem] leading-relaxed max-w-[46ch]">
              {SITE.hero.lede}
            </p>
          </Reveal>

          <Reveal>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
                className="btn btn-solid cursor-pointer justify-center sm:justify-start"
              >
                {SITE.hero.primaryCta.label}
              </button>
              <Link
                href="/capture"
                className="btn btn-ghost justify-center sm:justify-start"
              >
                Launch Simulation
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none m-0 mt-6 pt-4 border-t border-line font-mono text-[0.66rem] tracking-[0.06em] text-muted">
              {SITE.hero.meta.map((m) => (
                <MetaItem key={m} text={m} trigger={triggered} />
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ── Right column — Thread Globe ── */}
        <div
          ref={rightColRef}
          className="relative transition-transform duration-75 ease-out will-change-transform"
        >
          <Reveal>
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted mb-3 font-semibold select-none">
              Spatial Layer Mesh
            </div>

            {/* Canvas container — square aspect ratio */}
            <div
              className="relative rounded border border-line bg-paper-deep overflow-hidden"
              style={{ aspectRatio: "1 / 1" }}
            >
              <ThreadRing className="absolute inset-0 w-full h-full" />
            </div>

            <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-faint mt-2.5 text-center select-none">
              Move cursor to pull threads apart
            </p>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
