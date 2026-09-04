"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { Coins, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function RoadmapSection({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  const c = SITE.capital;
  return (
    <Section id="capital" num="08 — Capital ask" title={c.heading} intro={c.intro}>
      <Reveal delay={0.08}>
        <div className="mb-8 p-6 md:p-8 rounded-2xl border border-line-strong/60 bg-paper-deep text-ink relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent font-bold mb-2.5">
            <ShieldCheck className="w-4 h-4 text-accent" />
            The Milestone We Are Buying
          </div>
          <p className="font-serif text-[1.25rem] sm:text-[1.35rem] font-medium text-ink m-0 leading-relaxed max-w-prose">
            {c.milestoneBought}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.18}>
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-4 font-bold">
          Capital Allocation Model
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.allocation.map((item, idx) => (
            <motion.div
              key={item.area}
              whileHover={{ y: -4, boxShadow: "0 12px 28px -8px rgba(27, 23, 18, 0.08)" }}
              transition={{ duration: 0.25 }}
              className="p-5 rounded-xl border border-line-strong/60 bg-paper flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[0.85rem] font-bold text-accent-deep">{item.pct}</span>
                  <Coins className="w-3.5 h-3.5 text-accent opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Animated allocation fill bar */}
                <div className="w-full h-1.5 bg-line-strong/30 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: item.pct }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.2 + idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>

                <h4 className="font-serif font-semibold text-ink text-[1.02rem] m-0 mb-1.5 leading-snug">
                  {item.area}
                </h4>
                <p className="text-[0.84rem] text-body-text m-0 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.28} className="mt-8 flex justify-start">
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(191, 71, 34, 0.25)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
          className="btn btn-solid cursor-pointer gap-2 shadow-xs group"
        >
          <span>Discuss Prototype Investment</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </Reveal>
    </Section>
  );
}

