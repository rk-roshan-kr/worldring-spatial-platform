"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { UserCheck } from "lucide-react";

export function FounderSection() {
  const f = SITE.founder;
  return (
    <Section id="founder" num="09 — Founder" title={f.heading}>
      <Reveal delay={0.1}>
        <div className="p-7 sm:p-10 rounded-2xl border border-line-strong/60 bg-paper-deep text-ink relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent font-bold mb-4">
            <UserCheck className="w-4 h-4 text-accent" />
            <span>Why We Are Building This</span>
          </div>
          <blockquote className="m-0 font-serif italic text-[clamp(1.2rem,2.4vw,1.55rem)] text-ink leading-relaxed max-w-prose border-l-2 border-accent pl-5 my-3">
            "{f.quote}"
          </blockquote>
          <p className="font-mono text-[0.8rem] text-muted mt-8 m-0 pt-4 border-t border-line/70">
            {f.bio}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

