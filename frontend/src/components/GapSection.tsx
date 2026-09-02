import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { MapGapDiagram, RouteWayDiagram } from "@/components/glyphs";

export function GapSection() {
  const g = SITE.gap;
  return (
    <Section id="gap" num="02 — The gap" title={g.heading} intro={g.intro}>
      <div className="grid md:grid-cols-2 border-t border-line">
        
        {/* Column 1: Formal Address */}
        <Reveal>
          <article className="p-5 md:p-6 lg:p-4 h-full">
            <h3 className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.15em] text-muted m-0 mb-4">
              A formal address
            </h3>
            <div className="text-ink mb-5">
              <MapGapDiagram />
            </div>
            <dl className="m-0 font-mono text-[0.74rem] border-l-2 border-line-strong pl-4.5 space-y-1">
              {g.formal.map((row) => (
                <div key={row.term} className="flex gap-4 py-0.5">
                  <dt className="text-muted w-[8ch] shrink-0">{row.term}</dt>
                  <dd className={`m-0 ${row.warn ? "text-accent-deep font-bold" : "text-ink"}`}>
                    {row.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </Reveal>

        {/* Column 2: Informal Landmarks */}
        <Reveal>
          <article className="bg-paper-deep p-5 md:p-6 lg:p-4 h-full md:border-l border-line">
            <h3 className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.15em] text-accent-deep m-0 mb-4">
              How people actually give directions
            </h3>
            <div className="text-ink mb-5">
              <RouteWayDiagram />
            </div>
            <ol className="list-none m-0 p-0 grid gap-2.5">
              {g.landmarkSteps.map((step, i) => (
                <li key={i} className="flex gap-4 items-baseline text-[0.8rem] leading-relaxed">
                  <span className="font-mono text-[0.62rem] text-accent border-b-2 border-accent pb-0.5 shrink-0">
                    0{i + 1}
                  </span>
                  <span>
                    <strong>{step.title}</strong> {step.detail}
                  </span>
                </li>
              ))}
            </ol>
          </article>
        </Reveal>

      </div>
    </Section>
  );
}
