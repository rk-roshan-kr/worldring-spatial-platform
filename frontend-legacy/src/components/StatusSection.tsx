"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { Target, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function StatusSection() {
  const p = SITE.proving;
  return (
    <Section id="proving" num="07 — What we're proving" title={p.heading} intro={p.intro}>
      <Reveal delay={0.08}>
        <div className="mb-10 p-6 md:p-8 rounded-2xl border border-accent/25 bg-accent/5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep font-bold mb-2.5">
            <Target className="w-4 h-4 text-accent" />
            {p.experiment.title}
          </div>
          <p className="text-ink font-serif text-[1.15rem] leading-relaxed m-0 max-w-prose">
            {p.experiment.desc}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.18}>
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-6 font-bold">
          The 5 Core Technical & Commercial Hypotheses Under Test
        </div>
        <ol className="list-none m-0 p-0 grid md:grid-cols-2 gap-5">
          {p.hypotheses.map((h, idx) => (
            <motion.li
              key={h.id}
              whileHover={{ y: -3, boxShadow: "0 12px 28px -8px rgba(27, 23, 18, 0.08)" }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-xl border border-line-strong/60 bg-paper-deep flex flex-col justify-between group ${
                idx === p.hypotheses.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[0.7rem] text-accent font-bold tracking-wider">HYPOTHESIS 0{h.id}</span>
                  <span className="flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wider text-accent-deep font-bold px-2 py-0.5 rounded bg-accent/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    STAGE 0 TEST
                  </span>
                </div>
                <h4 className="font-serif font-semibold text-ink text-[1.1rem] m-0 mb-2 leading-snug">
                  {h.title}
                </h4>
                <p className="text-body-text text-[0.88rem] m-0 leading-relaxed">
                  {h.detail}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}

