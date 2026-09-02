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
      className={`border-t border-line py-12 md:py-20 lg:py-10 ${className}`}
    >
      <div className="mx-auto max-w-[76rem] px-(--gutter)">
        <Reveal className="mb-8 md:mb-12 lg:mb-8">
          <span className="sec-num">{num}</span>
          <h2 className="mt-1 font-serif text-[clamp(1.95rem,4vw,3rem)] leading-[1.18] tracking-[-0.015em] font-medium max-w-[24ch] text-balance">
            {title}
          </h2>
          {intro ? <p className="prose-copy mt-3">{intro}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
