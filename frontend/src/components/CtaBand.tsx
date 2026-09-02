import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";

export function CtaBand({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  return (
    <section className="border-t border-inv-line bg-inv-bg text-inv-text py-16 md:py-28 lg:py-12">
      <div className="mx-auto max-w-[76rem] px-(--gutter) text-center" id="contact">
        <Reveal>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#e08a67] mb-6 font-semibold">
            Prototype / Ideation Stage
          </div>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.12] tracking-[-0.015em] font-medium max-w-[24ch] mx-auto text-balance m-0 text-inv-text">
            The physical world is already here. We are building the infrastructure to understand it.
          </h2>
        </Reveal>

        <Reveal>
          <p className="font-mono text-[0.82rem] tracking-[0.06em] text-inv-muted mt-5 max-w-prose mx-auto">
            {SITE.brandName} · Stage 0 Experimentation · Chandigarh Road Corridor Benchmark
          </p>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button
              onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
              className="px-6 py-3.5 rounded bg-accent hover:bg-accent-deep text-white font-mono text-[0.78rem] uppercase tracking-[0.14em] font-bold shadow-md transition-colors cursor-pointer"
            >
              Fund Prototype Capital
            </button>
            <button
              onClick={() => onOpenContact?.("TECHNICAL_COLLABORATION")}
              className="px-6 py-3.5 rounded border border-inv-line hover:border-inv-text text-inv-text font-mono text-[0.78rem] uppercase tracking-[0.14em] transition-colors cursor-pointer"
            >
              Technical Collaboration
            </button>
            <button
              onClick={() => onOpenContact?.("FOLLOW_RESEARCH")}
              className="px-6 py-3.5 rounded border border-inv-line/60 text-inv-muted hover:text-inv-text font-mono text-[0.78rem] uppercase tracking-[0.14em] transition-colors cursor-pointer"
            >
              Follow Research Updates
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line py-8 lg:py-6 bg-paper">
      <div className="mx-auto max-w-[76rem] px-(--gutter) grid md:grid-cols-[1.6fr_1fr_1.4fr] gap-10 items-start">
        <div>
          <p className="font-serif text-[1.15rem] font-semibold m-0 mb-2 text-ink">{SITE.brandName}</p>
          <p className="text-[0.88rem] text-muted m-0 max-w-[38ch]">
            Exploring the pipeline from low-cost optical observations to structured 3D spatial infrastructure.
          </p>
        </div>
        <nav aria-label="Footer" className="grid gap-2 content-start">
          {SITE.nav.slice(0, 5).map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-mono text-[0.74rem] text-body-text no-underline hover:text-accent-deep"
            >
              {n.num} — {n.label}
            </a>
          ))}
        </nav>
        <div className="font-mono text-[0.68rem] leading-[1.7] text-muted space-y-1">
          <p className="m-0">© {year} {SITE.brandName} · Prototype & Ideation Exploration.</p>
          <p className="m-0">All spatial layer schemas represent technical intent under active validation.</p>
        </div>
      </div>
    </footer>
  );
}
