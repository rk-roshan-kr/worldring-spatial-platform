import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { UserCheck } from "lucide-react";

export function FounderSection() {
  const f = SITE.founder;
  return (
    <Section id="founder" num="09 — Founder" title={f.heading}>
      <Reveal>
        <div className="p-6 sm:p-8 rounded-lg border border-line bg-paper-deep text-ink">
          <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep font-bold mb-3">
            <UserCheck className="w-4 h-4 text-accent" />
            Why We Are Building This
          </div>
          <blockquote className="m-0 font-serif italic text-[clamp(1.15rem,2.2vw,1.45rem)] text-ink leading-relaxed max-w-prose border-l-2 border-accent pl-4">
            "{f.quote}"
          </blockquote>
          <p className="font-mono text-[0.78rem] text-muted mt-6 m-0 pt-4 border-t border-line">
            {f.bio}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
