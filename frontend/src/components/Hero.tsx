import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { ArrowDown, Layers, Box, Cpu, Compass } from "lucide-react";
import Link from "next/link";

export function Hero({ onOpenContact }: { onOpenContact?: (mode?: string) => void }) {
  return (
    <section id="top" className="mx-auto max-w-[76rem] px-(--gutter) pt-8 md:pt-14 lg:pt-4 pb-6 md:pb-10 lg:pb-3">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8 lg:gap-14 lg:items-start">
        
        {/* Left Column: Headline and CTAs */}
        <div className="space-y-6 lg:space-y-5">
          <Reveal>
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent-deep mb-3 lg:mb-2 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span>Stage 0 · Hypothesis Validation</span>
            </div>
            <h1 className="font-serif text-[clamp(2.7rem,5.5vw,4.4rem)] leading-[1.12] tracking-[-0.02em] font-medium max-w-[20ch] text-balance text-ink">
              {SITE.hero.headline}
            </h1>
            <p className="font-serif italic text-[clamp(1.2rem,2.2vw,1.45rem)] text-accent-deep mt-2">
              {SITE.hero.subhead}
            </p>
          </Reveal>

          <Reveal>
            <p className="prose-copy text-[1rem] leading-relaxed max-w-[46ch] text-body-text">
              {SITE.hero.lede}
            </p>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onOpenContact?.("FUND_PROTOTYPE")}
                className="btn btn-solid cursor-pointer flex items-center gap-2"
              >
                {SITE.hero.primaryCta.label}
              </button>
              <Link
                href="/capture"
                className="btn btn-solid bg-[#FFE8D6] text-[#FF6B35] border border-[#FF6B35]/20 hover:bg-[#FFE8D6]/80 flex items-center gap-2"
              >
                Launch Simulation →
              </Link>
              <a href={SITE.hero.secondaryCta.href} className="btn btn-ghost flex items-center gap-2">
                {SITE.hero.secondaryCta.label}
              </a>
            </div>
          </Reveal>

          <Reveal>
            <ul className="flex flex-wrap gap-x-9 gap-y-2 list-none m-0 mt-8 lg:mt-6 pt-4 border-t border-line font-mono text-[0.68rem] tracking-[0.06em] text-muted">
              {SITE.hero.meta.map((m) => (
                <li key={m} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-muted rounded-full" />
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Right Column: 30-Second Vision Breakdown Diagram */}
        <div className="lg:mt-0">
          <Reveal className="lg:border-t-0 lg:pt-0">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted mb-3 font-semibold">
              The 30-Second Vision Breakdown
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-1 gap-4 p-5 rounded bg-paper-deep text-ink border border-line">
              
              <div className="p-3.5 rounded border border-line bg-paper flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[0.58rem] text-accent-deep uppercase tracking-wider font-bold mb-1">INPUT</div>
                  <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-accent" /> Real 360° Video
                  </div>
                  <p className="text-[0.74rem] text-muted mt-1 leading-snug">
                    Low-cost panoramic optical streams from car/drone rigs.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-line font-mono text-[0.58rem] text-faint">
                  5.7K equirectangular
                </div>
              </div>

              <div className="p-3.5 rounded border border-line bg-paper flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[0.58rem] text-accent-deep uppercase tracking-wider font-bold mb-1">PIPELINE</div>
                  <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-accent" /> 3D Reconstruction
                  </div>
                  <p className="text-[0.74rem] text-muted mt-1 leading-snug">
                    Visual-inertial SfM, Gaussian Splatting & PII blurring.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-line font-mono text-[0.58rem] text-faint">
                  6-DOF trajectories
                </div>
              </div>

              <div className="p-3.5 rounded border border-line bg-paper flex flex-col justify-between md:col-span-2 lg:col-span-1">
                <div>
                  <div className="font-mono text-[0.58rem] text-accent-deep uppercase tracking-wider font-bold mb-1">OUTPUT SPATIAL INFRASTRUCTURE</div>
                  <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-accent" /> Earthos 7-Layer Spatial Representation
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-2.5 rounded bg-paper-deep border border-line">
                      <div className="font-mono text-[0.62rem] font-bold text-accent-deep">HUMAN WORLD</div>
                      <div className="font-sans text-[0.74rem] font-semibold text-ink mt-0.5">OnMyWay Route</div>
                      <div className="text-[0.68rem] text-muted leading-tight mt-0.5">Campus & storefront location UX</div>
                    </div>
                    <div className="p-2.5 rounded bg-paper-deep border border-line">
                      <div className="font-mono text-[0.62rem] font-bold text-accent-deep">MACHINE WORLD</div>
                      <div className="font-sans text-[0.74rem] font-semibold text-ink mt-0.5">Data Wing Platform</div>
                      <div className="text-[0.68rem] text-muted leading-tight mt-0.5">Robotics & physical-AI datasets</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
