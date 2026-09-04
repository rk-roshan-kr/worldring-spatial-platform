import { Reveal } from "@/components/Reveal";

export function Section({
  id,
  num,
  title,
  intro,
  children,
  className = "",
}: {
  id: string;
  num: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`w-full scroll-mt-20 ${className}`}
    >
      <div className="mx-auto max-w-[76rem] px-(--gutter)">
        <Reveal delay={0.06} className="mb-8 md:mb-12 lg:mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-3 h-px bg-accent inline-block" />
            <span className="sec-num font-mono text-[0.72rem] tracking-[0.16em] uppercase text-accent font-semibold">{num}</span>
          </div>
          <h2 className="mt-1 font-serif text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.15] tracking-[-0.02em] font-medium max-w-[24ch] text-balance text-ink">
            {title}
          </h2>
          {intro ? <p className="prose-copy mt-3 text-[1rem] leading-relaxed text-body-text">{intro}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

