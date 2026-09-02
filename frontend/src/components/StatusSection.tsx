import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { Target, CheckCircle2 } from "lucide-react";

export function StatusSection() {
  const p = SITE.proving;
  return (
    <Section id="proving" num="07 — What we're proving" title={p.heading} intro={p.intro}>
      <Reveal className="mb-10 p-6 rounded-lg border border-accent/40 bg-accent/5">
        <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep font-bold mb-2">
          <Target className="w-4 h-4 text-accent" />
          {p.experiment.title}
        </div>
        <p className="text-ink font-serif text-[1.1rem] leading-relaxed m-0 max-w-prose">
          {p.experiment.desc}
        </p>
      </Reveal>

      <Reveal>
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-6 font-bold">
          The 5 Core Technical & Commercial Hypotheses Under Test
        </div>
        <ol className="list-none m-0 p-0 grid md:grid-cols-2 gap-6">
          {p.hypotheses.map((h, idx) => (
            <li
              key={h.id}
              className={`p-5 rounded-lg border border-line bg-paper-deep flex flex-col justify-between ${
                idx === p.hypotheses.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[0.68rem] text-accent-deep font-bold">HYPOTHESIS {h.id}</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-wider text-accent-deep font-bold">STAGE 0 TEST</span>
                </div>
                <h4 className="font-serif font-semibold text-ink text-[1.05rem] m-0 mb-2 leading-snug">
                  {h.title}
                </h4>
                <p className="text-body-text text-[0.85rem] m-0 leading-relaxed">
                  {h.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}
