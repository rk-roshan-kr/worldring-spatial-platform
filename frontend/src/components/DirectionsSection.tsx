"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { User, Cpu, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function DirectionsSection() {
  const inf = SITE.infrastructure;
  return (
    <Section id="infrastructure" num="05 — Infrastructure" title={inf.heading} intro={inf.intro}>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {inf.paths.map((path, i) => (
          <Reveal key={path.name} delay={i * 0.15}>
            <motion.article
              whileHover={{ y: -4, boxShadow: "0 16px 36px -12px rgba(27, 23, 18, 0.1)" }}
              transition={{ duration: 0.25 }}
              className="p-[clamp(1.5rem,3vw,2.5rem)] rounded-2xl border border-line-strong/60 bg-paper-deep h-full flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent-deep font-bold mb-3">
                  <div className="p-1.5 rounded-md bg-paper border border-line">
                    {i === 0 ? <User className="w-4 h-4 text-accent" /> : <Cpu className="w-4 h-4 text-accent" />}
                  </div>
                  {path.title}
                </div>
                <h3 className="font-serif font-medium text-[clamp(1.5rem,2.5vw,2.1rem)] text-ink m-0 tracking-tight">
                  {path.name}
                </h3>
                <p className="italic text-accent text-[1.02rem] mt-1 mb-3.5 font-serif">{path.tagline}</p>
                <p className="text-body-text text-[0.94rem] leading-relaxed m-0">{path.desc}</p>
              </div>

              <ul className="list-none m-0 mt-8 pt-4 border-t border-line/70 font-mono text-[0.74rem] text-muted grid gap-2.5">
                {path.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 group/item">
                    <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 transition-transform group-hover/item:translate-x-1" />
                    <span className="text-body-text group-hover/item:text-ink transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

