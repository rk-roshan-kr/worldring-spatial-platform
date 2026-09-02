import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { Coins, CheckCircle, ShieldCheck } from "lucide-react";

export function RoadmapSection({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  const c = SITE.capital;
  return (
    <Section id="capital" num="08 — Capital ask" title={c.heading} intro={c.intro}>
      <Reveal className="mb-8 p-6 rounded-lg border border-line bg-paper-deep text-ink">
        <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          The Milestone We Are Buying
        </div>
        <p className="font-serif text-[1.25rem] font-medium text-ink m-0 leading-relaxed max-w-prose">
          {c.milestoneBought}
        </p>
      </Reveal>

      <Reveal>
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted mb-4 font-bold">
          Capital Allocation Model
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.allocation.map((item) => (
            <div key={item.area} className="p-4.5 rounded-lg border border-line bg-paper flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[0.75rem] font-bold text-accent-deep">{item.pct}</span>
                  <Coins className="w-3.5 h-3.5 text-accent opacity-70" />
                </div>
                <h4 className="font-serif font-semibold text-ink text-[1rem] m-0 mb-1.5">
                  {item.area}
                </h4>
                <p className="text-[0.82rem] text-body-text m-0 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-8 flex justify-start">
        <button
          onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
          className="btn btn-solid cursor-pointer"
        >
          Discuss Prototype Investment
        </button>
      </Reveal>
    </Section>
  );
}
