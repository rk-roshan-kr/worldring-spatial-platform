"use client";

import React, { useState, useRef, useEffect } from "react";
import { StreetMatrixCanvas } from "@/components/StreetMatrixCanvas";
import { SiteNav } from "@/components/SiteNav";
import { ContactModal } from "@/components/ui/ContactModal";
import { CursorGlow } from "@/components/CursorGlow";
import { SITE } from "@/config/site";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { ArrowRight, ArrowDown, Eye, Cpu, MapPin, Layers, Shield, Target, Landmark, ChevronRight } from "lucide-react";

// ─── Scroll-Revealed Section ────────────────────────────────────────────────
function VoidSection({
  children,
  id,
  className = "",
  glass = false,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  glass?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px -10% 0px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative ${className}`}
    >
      {glass ? (
        <div className="void-glass">
          {children}
        </div>
      ) : (
        children
      )}
    </motion.section>
  );
}

// ─── Stagger Item ───────────────────────────────────────────────────────────
function StaggerItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState("FUND_PROTOTYPE");
  const [navVisible, setNavVisible] = useState(false);

  const handleOpenContact = (mode: string = "FUND_PROTOTYPE") => {
    setContactMode(mode);
    setIsContactOpen(true);
  };

  // Show nav after initial void moment
  useEffect(() => {
    const t = setTimeout(() => setNavVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── VOID: Fixed full-screen canvas background ── */}
      <div className="fixed inset-0 z-0">
        <StreetMatrixCanvas className="w-full h-full" />
      </div>

      <CursorGlow />

      {/* ── Nav (fades in) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={navVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50"
      >
        <SiteNav onOpenContact={() => handleOpenContact("FUND_PROTOTYPE")} />
      </motion.div>

      {/* ── Scrollable content over the void ── */}
      <main className="relative z-10">

        {/* ═══════════════════════════════════════════════════════════════
            HERO — Full viewport, centered, floating in the void
        ═══════════════════════════════════════════════════════════════ */}
        <section id="top" className="min-h-screen flex flex-col items-center justify-center px-(--gutter) text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {SITE.stageTag}
            </div>

            <h1 className="font-serif text-[clamp(2.4rem,6vw,5rem)] leading-[1.08] tracking-[-0.03em] font-medium text-ink glow-text">
              {SITE.hero.headline}
            </h1>

            <p className="font-serif italic text-[clamp(1.1rem,2.2vw,1.5rem)] text-accent/80 leading-relaxed" style={{ textShadow: "0 0 40px rgba(0,200,232,0.15)" }}>
              {SITE.hero.subhead}
            </p>

            <p className="text-body-text text-[0.95rem] leading-relaxed max-w-[52ch] mx-auto">
              {SITE.hero.lede}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0,200,232,0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpenContact("FUND_PROTOTYPE")}
                className="btn btn-solid gap-2 group cursor-pointer"
              >
                <span>{SITE.hero.primaryCta.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <a href="#gap" className="btn btn-ghost">
                Scroll to explore <ArrowDown className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted font-mono text-[0.6rem] tracking-widest uppercase"
          >
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </motion.div>
          </motion.div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            THE GAP — Problem statement
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[60vh]" /> {/* void breathing room */}

        <VoidSection id="gap" className="py-24 px-(--gutter)">
          <div className="max-w-4xl mx-auto">
            <StaggerItem>
              <span className="kicker mb-4 block">02 · The Gap</span>
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] tracking-tight text-ink max-w-[24ch]">
                {SITE.gap.heading}
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.2}>
              <p className="text-body-text text-[0.95rem] leading-relaxed mt-6 max-w-[56ch]">
                {SITE.gap.intro}
              </p>
            </StaggerItem>

            {/* Address vs Reality comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <StaggerItem delay={0.3}>
                <div className="void-glass p-6 space-y-4">
                  <div className="font-mono text-[0.7rem] uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Formal Address
                  </div>
                  {SITE.gap.formal.map((f) => (
                    <div key={f.term} className="flex justify-between items-baseline border-b border-line pb-2">
                      <span className="font-mono text-[0.75rem] text-muted">{f.term}</span>
                      <span className={`text-[0.85rem] ${f.warn ? "text-red-400" : "text-ink"}`}>{f.detail}</span>
                    </div>
                  ))}
                  <p className="text-[0.8rem] text-muted/80 italic pt-2">{SITE.gap.formalVerdict}</p>
                </div>
              </StaggerItem>

              <StaggerItem delay={0.4}>
                <div className="void-glass p-6 space-y-4 border-accent/20">
                  <div className="font-mono text-[0.7rem] uppercase tracking-wider text-accent mb-3 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Visual Landmark Directions
                  </div>
                  {SITE.gap.landmarkSteps.map((s, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-line">
                      <span className="font-mono text-accent text-[0.7rem] mt-0.5 shrink-0">0{i + 1}</span>
                      <div>
                        <div className="text-ink text-[0.88rem] font-medium">{s.title}</div>
                        <div className="text-muted text-[0.8rem]">{s.detail}</div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[0.8rem] text-accent/60 italic pt-2">{SITE.gap.landmarkVerdict}</p>
                </div>
              </StaggerItem>
            </div>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            PIPELINE — How it works
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[40vh]" />

        <VoidSection id="thesis" className="py-24 px-(--gutter)">
          <div className="max-w-5xl mx-auto">
            <StaggerItem>
              <span className="kicker mb-4 block">03 · The Pipeline</span>
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] tracking-tight text-ink max-w-[28ch]">
                {SITE.thesis.heading}
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.2}>
              <p className="text-body-text text-[0.95rem] leading-relaxed mt-4 max-w-[56ch]">
                {SITE.thesis.intro}
              </p>
            </StaggerItem>

            <div className="mt-14 space-y-1">
              {SITE.thesis.pipeline.map((step, i) => (
                <StaggerItem key={step.step} delay={0.15 + i * 0.08}>
                  <div className="void-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-accent/30 transition-colors duration-300">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center font-mono text-accent text-[0.75rem] font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-ink font-medium text-[0.95rem]">{step.name}</h3>
                        <span className="font-mono text-[0.58rem] uppercase tracking-wider text-accent/50 border border-accent/15 px-2 py-0.5 rounded-full">{step.tag}</span>
                      </div>
                      <p className="text-muted text-[0.82rem] leading-relaxed">{step.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-faint group-hover:text-accent transition-colors shrink-0 hidden sm:block" />
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            DUAL STREAMS — Human + Machine
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[40vh]" />

        <VoidSection id="streams" className="py-24 px-(--gutter)">
          <div className="max-w-5xl mx-auto">
            <StaggerItem>
              <span className="kicker mb-4 block">04 · Dual Value Streams</span>
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] tracking-tight text-ink max-w-[28ch]">
                {SITE.infrastructure.heading}
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.15}>
              <p className="text-body-text text-[0.95rem] leading-relaxed mt-4 max-w-[56ch]">
                {SITE.infrastructure.intro}
              </p>
            </StaggerItem>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
              {SITE.infrastructure.paths.map((path, pi) => (
                <StaggerItem key={path.name} delay={0.2 + pi * 0.12}>
                  <div className="void-glass p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      {pi === 0 ? <Eye className="w-5 h-5 text-accent" /> : <Cpu className="w-5 h-5 text-amber-400" />}
                      <div>
                        <h3 className="text-ink font-medium text-[1rem]">{path.name}</h3>
                        <p className="font-serif italic text-[0.82rem] text-accent/60">{path.tagline}</p>
                      </div>
                    </div>
                    <p className="text-muted text-[0.85rem] leading-relaxed mb-4">{path.desc}</p>
                    <ul className="space-y-2 mt-auto">
                      {path.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2 text-[0.82rem] text-body-text">
                          <span className="w-1 h-1 rounded-full bg-accent/50 mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            DATA WING — Physical AI Layers
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[40vh]" />

        <VoidSection id="data" className="py-24 px-(--gutter)">
          <div className="max-w-4xl mx-auto">
            <StaggerItem>
              <span className="kicker mb-4 block">05 · Physical AI Infrastructure</span>
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] tracking-tight text-ink max-w-[28ch]">
                {SITE.dataWing.heading}
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.15}>
              <p className="text-body-text text-[0.95rem] leading-relaxed mt-4 max-w-[56ch]">
                {SITE.dataWing.intro}
              </p>
            </StaggerItem>

            <div className="mt-12 space-y-1">
              {SITE.dataWing.layers.map((layer, i) => (
                <StaggerItem key={layer.name} delay={0.15 + i * 0.06}>
                  <div className="void-glass p-4 flex items-start gap-4 group hover:border-accent/25 transition-colors">
                    <Layers className="w-4 h-4 text-accent/40 mt-0.5 shrink-0 group-hover:text-accent transition-colors" />
                    <div>
                      <span className="font-mono text-[0.75rem] text-accent/70 font-medium">{layer.name}</span>
                      <p className="text-muted text-[0.82rem] mt-0.5">{layer.contains}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>

            <StaggerItem delay={0.8}>
              <p className="text-muted/50 text-[0.72rem] font-mono mt-6 italic">{SITE.dataWing.footnote}</p>
            </StaggerItem>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            PROVING — What we're testing
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[40vh]" />

        <VoidSection id="proving" className="py-24 px-(--gutter)">
          <div className="max-w-4xl mx-auto">
            <StaggerItem>
              <span className="kicker mb-4 block">06 · Sector Pilot</span>
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] tracking-tight text-ink max-w-[28ch]">
                {SITE.proving.heading}
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.15}>
              <p className="text-body-text text-[0.95rem] leading-relaxed mt-4 max-w-[56ch]">
                {SITE.proving.intro}
              </p>
            </StaggerItem>

            <div className="mt-12 space-y-3">
              {SITE.proving.hypotheses.map((h, i) => (
                <StaggerItem key={h.id} delay={0.15 + i * 0.08}>
                  <div className="void-glass p-5 group hover:border-accent/25 transition-colors">
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-accent/50 text-[0.7rem] mt-1 shrink-0">{h.id}</span>
                      <div>
                        <h3 className="text-ink text-[0.92rem] font-medium leading-snug">{h.title}</h3>
                        <p className="text-muted text-[0.82rem] mt-2 leading-relaxed">{h.detail}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>

            <StaggerItem delay={0.7}>
              <div className="void-glass p-6 mt-8 border-accent/20">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-4 h-4 text-accent" />
                  <h3 className="font-mono text-[0.75rem] uppercase tracking-wider text-accent">{SITE.proving.experiment.title}</h3>
                </div>
                <p className="text-body-text text-[0.88rem] leading-relaxed">{SITE.proving.experiment.desc}</p>
              </div>
            </StaggerItem>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            CAPITAL — Investment ask
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[40vh]" />

        <VoidSection id="capital" className="py-24 px-(--gutter)">
          <div className="max-w-4xl mx-auto">
            <StaggerItem>
              <span className="kicker mb-4 block">07 · Capital Ask</span>
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] tracking-tight text-ink max-w-[28ch]">
                {SITE.capital.heading}
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.15}>
              <p className="text-body-text text-[0.95rem] leading-relaxed mt-4 max-w-[56ch]">
                {SITE.capital.intro}
              </p>
            </StaggerItem>

            <StaggerItem delay={0.25}>
              <div className="void-glass p-5 mt-8 border-accent/20">
                <div className="font-mono text-[0.68rem] uppercase tracking-wider text-accent/60 mb-2">What this capital buys</div>
                <p className="text-ink text-[0.92rem] leading-relaxed">{SITE.capital.milestoneBought}</p>
              </div>
            </StaggerItem>

            <div className="mt-8 space-y-1">
              {SITE.capital.allocation.map((a, i) => (
                <StaggerItem key={a.area} delay={0.3 + i * 0.08}>
                  <div className="void-glass p-4 flex items-center gap-4">
                    <span className="font-mono text-accent text-[0.9rem] font-bold w-12 shrink-0">{a.pct}</span>
                    <div className="flex-1">
                      <div className="text-ink text-[0.88rem] font-medium">{a.area}</div>
                      <div className="text-muted text-[0.78rem]">{a.desc}</div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            FOUNDER
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[40vh]" />

        <VoidSection className="py-24 px-(--gutter)">
          <div className="max-w-3xl mx-auto text-center">
            <StaggerItem>
              <Landmark className="w-6 h-6 text-accent/40 mx-auto mb-6" />
            </StaggerItem>
            <StaggerItem delay={0.1}>
              <blockquote className="font-serif text-[clamp(1.2rem,2.5vw,1.6rem)] leading-[1.5] text-ink italic">
                &ldquo;{SITE.founder.quote}&rdquo;
              </blockquote>
            </StaggerItem>
            <StaggerItem delay={0.25}>
              <p className="text-muted text-[0.85rem] mt-6 max-w-[40ch] mx-auto">{SITE.founder.bio}</p>
            </StaggerItem>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════════ */}
        <div className="min-h-[30vh]" />

        <VoidSection className="py-32 px-(--gutter)">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <StaggerItem>
              <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1] tracking-tight text-ink glow-text">
                The physical world is waiting to be understood.
              </h2>
            </StaggerItem>
            <StaggerItem delay={0.15}>
              <p className="text-body-text text-[1rem] leading-relaxed max-w-[42ch] mx-auto">
                We&apos;re building the infrastructure to make it readable — for humans and machines alike.
              </p>
            </StaggerItem>
            <StaggerItem delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(0,200,232,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOpenContact("FUND_PROTOTYPE")}
                  className="btn btn-solid gap-2 group cursor-pointer text-[0.9rem]"
                >
                  Discuss Prototype Investment
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenContact("GENERAL")}
                  className="btn btn-ghost cursor-pointer"
                >
                  Get in touch
                </motion.button>
              </div>
            </StaggerItem>
          </div>
        </VoidSection>


        {/* ═══════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════ */}
        <footer className="py-12 px-(--gutter) border-t border-line mt-24">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-serif text-ink font-semibold text-[1.05rem]">{SITE.brandName}</span>
              <span className="text-faint text-[0.7rem] font-mono">Spatial Intelligence Infrastructure</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[0.65rem] text-muted">
              <span>30.73° N · 76.78° E</span>
              <span className="text-faint">·</span>
              <span>Chandigarh, India</span>
              <span className="text-faint">·</span>
              <a href={`mailto:${SITE.contactEmail}`} className="text-accent/60 hover:text-accent transition-colors">{SITE.contactEmail}</a>
            </div>
          </div>
        </footer>

        {/* Bottom void fade-out */}
        <div className="h-[20vh]" />

      </main>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialMode={contactMode}
      />
    </>
  );
}
