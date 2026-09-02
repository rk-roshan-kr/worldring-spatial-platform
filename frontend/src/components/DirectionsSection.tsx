import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { User, Cpu, ArrowRight } from "lucide-react";

export function DirectionsSection() {
  const inf = SITE.infrastructure;
  return (
    <Section id="infrastructure" num="05 — Infrastructure" title={inf.heading} intro={inf.intro}>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {inf.paths.map((path, i) => (
          <Reveal key={path.name}>
            <article className="p-[clamp(1.5rem,3vw,2.5rem)] rounded-lg border border-line bg-paper-deep h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent-deep font-bold mb-3">
                  {i === 0 ? <User className="w-4 h-4 text-accent" /> : <Cpu className="w-4 h-4 text-accent" />}
                  {path.title}
                </div>
                <h3 className="font-serif font-medium text-[clamp(1.5rem,2.5vw,2rem)] text-ink m-0">
                  {path.name}
                </h3>
                <p className="italic text-accent-deep text-[1rem] mt-1 mb-3">{path.tagline}</p>
                <p className="text-body-text text-[0.92rem] leading-relaxed m-0">{path.desc}</p>
              </div>

              <ul className="list-none m-0 mt-6 pt-4 border-t border-line font-mono text-[0.74rem] text-muted grid gap-2">
                {path.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
