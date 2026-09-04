"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { MapGapDiagram, RouteWayDiagram } from "@/components/glyphs";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function GapSection() {
  const g = SITE.gap;
  return (
    <Section id="gap" num="02 — The gap" title={g.heading} intro={g.intro}>
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        
        {/* Column 1: Formal Address */}
        <Reveal delay={0.1} direction="up">
          <motion.article
            whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(27, 23, 18, 0.08)" }}
            transition={{ duration: 0.25 }}
            className="p-6 md:p-7 rounded-2xl border border-line-strong/60 bg-paper h-full flex flex-col justify-between relative overflow-hidden group shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted m-0">
                  A Formal Address
                </h3>
                <span className="flex items-center gap-1 font-mono text-[0.6rem] text-accent font-semibold px-2 py-0.5 rounded bg-accent/10">
                  <AlertCircle className="w-3 h-3" />
                  Geometric Failure
                </span>
              </div>
              <div className="text-ink mb-5 p-3 rounded-xl bg-paper-deep/50 border border-line/50">
                <MapGapDiagram />
              </div>
              <dl className="m-0 font-mono text-[0.74rem] border-l-2 border-line-strong pl-4.5 space-y-1.5">
                {g.formal.map((row) => (
                  <div key={row.term} className="flex gap-4 py-0.5">
                    <dt className="text-muted w-[8ch] shrink-0 font-medium">{row.term}</dt>
                    <dd className={`m-0 ${row.warn ? "text-accent font-bold" : "text-ink"}`}>
                      {row.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-5 pt-3.5 border-t border-line font-mono text-[0.68rem] text-muted">
              Ambiguity rate in dense unnumbered sectors: <strong className="text-accent">~44%</strong>
            </div>
          </motion.article>
        </Reveal>

        {/* Column 2: Informal Landmarks */}
        <Reveal delay={0.2} direction="up">
          <motion.article
            whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(191, 71, 34, 0.12)" }}
            transition={{ duration: 0.25 }}
            className="bg-paper-deep p-6 md:p-7 rounded-2xl border border-line-strong/70 h-full flex flex-col justify-between relative overflow-hidden group shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent-deep m-0">
                  How People Actually Navigate
                </h3>
                <span className="flex items-center gap-1 font-mono text-[0.6rem] text-accent font-semibold px-2 py-0.5 rounded bg-accent/10">
                  <CheckCircle2 className="w-3 h-3" />
                  Semantic Ground Truth
                </span>
              </div>
              <div className="text-ink mb-5 p-3 rounded-xl bg-paper/60 border border-line/50">
                <RouteWayDiagram />
              </div>
              <ol className="list-none m-0 p-0 grid gap-3">
                {g.landmarkSteps.map((step, i) => (
                  <li key={i} className="flex gap-3.5 items-baseline text-[0.82rem] leading-relaxed p-2 rounded-lg transition-colors hover:bg-paper/50">
                    <span className="font-mono text-[0.62rem] text-accent border-b-2 border-accent pb-0.5 shrink-0 font-bold">
                      0{i + 1}
                    </span>
                    <span>
                      <strong className="text-ink font-serif font-semibold">{step.title}</strong>{" "}
                      <span className="text-body-text">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-6 pt-4 border-t border-line font-mono text-[0.68rem] text-muted">
              Visual landmark confidence rating: <strong className="text-ink">98.2%</strong>
            </div>
          </motion.article>
        </Reveal>

      </div>
    </Section>
  );
}

