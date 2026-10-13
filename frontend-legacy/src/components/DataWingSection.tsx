"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { PhysicalAiDataWing } from "@/components/PhysicalAiDataWing";

export function DataWingSection() {
  const d = SITE.dataWing;

  return (
    <Section
      id="data"
      num="06 — Data wing"
      title={d.heading}
      intro={d.intro}
      className="!border-t-0 bg-inv-bg text-inv-text [&_.sec-num]:text-[#e08a67] [&_h2]:!text-[#FAF8F3] [&_.prose-copy]:!text-[#E6DFD5] [&_.prose-copy]:!text-[1.08rem] [&_.prose-copy]:!leading-relaxed p-8 md:p-12 lg:p-14 rounded-3xl my-6 border border-[#3A3228] shadow-2xl"
    >
      <Reveal className="w-full mt-6">
        <PhysicalAiDataWing />
      </Reveal>

      <Reveal>
        <p className="font-mono text-[0.72rem] text-[#D6C5B3] max-w-prose mt-8 border-t border-inv-line/30 pt-4">
          {d.footnote}
        </p>
      </Reveal>
    </Section>
  );
}
