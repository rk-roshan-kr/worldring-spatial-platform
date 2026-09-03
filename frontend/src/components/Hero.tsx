"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Box, Cpu, Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Counts a number up from 0 to `target` over `duration`ms once `trigger` is true. */
function useCounter(target: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return value;
}

/** Extracts a numeric value and its trailing unit string from a meta string like "39 frames" */
function parseMeta(str: string): { num: number; rest: string } | null {
  const match = str.match(/^(\d+)(.*)/);
  if (!match) return null;
  return { num: parseInt(match[1]), rest: match[2] };
}

function MetaItem({ text, trigger }: { text: string; trigger: boolean }) {
  const parsed = parseMeta(text);
  const count = useCounter(parsed?.num ?? 0, 1400, trigger && !!parsed);
  return (
    <li className="flex items-center gap-1.5">
      <span className="w-1 h-1 bg-muted rounded-full shrink-0" />
      {parsed ? (
        <span>
          <span className="tabular-nums">{count}</span>
          {parsed.rest}
        </span>
      ) : (
        text
      )}
    </li>
  );
}

export function Hero({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  const rightColRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);

  // Subtle parallax on right column — shifts slightly on scroll
  useEffect(() => {
    const container = document.getElementById("snap-container") ?? window;
    const handle = () => {
      if (!rightColRef.current) return;
      const scrollY =
        container === window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;
      // Very subtle: 0.08 factor, max 32px shift
      const shift = Math.min(scrollY * 0.08, 32);
      rightColRef.current.style.transform = `translateY(${shift}px)`;
    };
    container.addEventListener("scroll", handle, { passive: true });
    return () => container.removeEventListener("scroll", handle);
  }, []);

  // Trigger number counters when section enters view
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
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8 lg:gap-14 lg:items-start">

        {/* Left Column */}
        <div className="space-y-5 lg:space-y-5">
          <Reveal>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep mb-2 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent shrink-0" />
              <span>Stage 0 · Hypothesis Validation</span>
            </div>
            <h1 className="font-serif text-[clamp(2.2rem,5.5vw,4.4rem)] leading-[1.12] tracking-[-0.02em] font-medium max-w-[20ch] text-balance text-ink">
              {SITE.hero.headline}
            </h1>
            <p className="font-serif italic text-[clamp(1rem,2.2vw,1.45rem)] text-accent-deep mt-2">
              {SITE.hero.subhead}
            </p>
          </Reveal>

          <Reveal>
            <p className="prose-copy text-[0.95rem] sm:text-[1rem] leading-relaxed max-w-[46ch] text-body-text">
              {SITE.hero.lede}
            </p>
          </Reveal>

          <Reveal>
            <div className="flex flex-col xs:flex-row flex-wrap items-start xs:items-center gap-3 pt-2">
              <button
                onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
                className="btn btn-solid cursor-pointer flex items-center gap-2 w-full xs:w-auto justify-center xs:justify-start"
              >
                {SITE.hero.primaryCta.label}
              </button>
              <Link
                href="/capture"
                className="btn btn-solid bg-[#FFE8D6] text-[#FF6B35] border border-[#FF6B35]/20 hover:bg-[#FFE8D6]/80 flex items-center gap-2 w-full xs:w-auto justify-center xs:justify-start"
              >
                Launch Simulation →
              </Link>
              <a
                href={SITE.hero.secondaryCta.href}
                className="btn btn-ghost flex items-center gap-2 w-full xs:w-auto justify-center xs:justify-start"
              >
                {SITE.hero.secondaryCta.label}
              </a>
            </div>
          </Reveal>

          <Reveal>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none m-0 mt-6 lg:mt-4 pt-4 border-t border-line font-mono text-[0.66rem] tracking-[0.06em] text-muted">
              {SITE.hero.meta.map((m) => (
                <MetaItem key={m} text={m} trigger={triggered} />
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Right Column — Vision Breakdown */}
        <div ref={rightColRef} className="lg:mt-0 transition-transform duration-75 ease-out will-change-transform">
          <Reveal className="lg:border-t-0 lg:pt-0">
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted mb-3 font-semibold">
              The 30-Second Vision Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 p-4 sm:p-5 rounded bg-paper-deep text-ink border border-line">

              <div className="p-3 sm:p-3.5 rounded border border-line bg-paper flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[0.55rem] text-accent-deep uppercase tracking-wider font-bold mb-1">INPUT</div>
                  <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-accent shrink-0" /> Real 360° Video
                  </div>
                  <p className="text-[0.73rem] text-muted mt-1 leading-snug">
                    Low-cost panoramic optical streams from car/drone rigs.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-line font-mono text-[0.55rem] text-faint">
                  5.7K equirectangular
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded border border-line bg-paper flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[0.55rem] text-accent-deep uppercase tracking-wider font-bold mb-1">PIPELINE</div>
                  <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-accent shrink-0" /> 3D Reconstruction
                  </div>
                  <p className="text-[0.73rem] text-muted mt-1 leading-snug">
                    Visual-inertial SfM, Gaussian Splatting &amp; PII blurring.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-line font-mono text-[0.55rem] text-faint">
                  6-DOF trajectories
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded border border-line bg-paper flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="font-mono text-[0.55rem] text-accent-deep uppercase tracking-wider font-bold mb-1">OUTPUT SPATIAL INFRASTRUCTURE</div>
                  <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-accent shrink-0" /> Earthos 7-Layer Spatial Representation
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="p-2.5 rounded bg-paper-deep border border-line">
                      <div className="font-mono text-[0.58rem] font-bold text-accent-deep">HUMAN WORLD</div>
                      <div className="font-sans text-[0.72rem] font-semibold text-ink mt-0.5">OnMyWay Route</div>
                      <div className="text-[0.66rem] text-muted leading-tight mt-0.5">Campus &amp; storefront location UX</div>
                    </div>
                    <div className="p-2.5 rounded bg-paper-deep border border-line">
                      <div className="font-mono text-[0.58rem] font-bold text-accent-deep">MACHINE WORLD</div>
                      <div className="font-sans text-[0.72rem] font-semibold text-ink mt-0.5">Data Wing Platform</div>
                      <div className="text-[0.66rem] text-muted leading-tight mt-0.5">Robotics &amp; physical-AI datasets</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
