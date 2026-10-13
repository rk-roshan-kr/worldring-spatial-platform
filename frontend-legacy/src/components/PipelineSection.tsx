"use client";

import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SpatialThesisCanvas } from "@/components/SpatialThesisCanvas";

export function PipelineSection() {
  const t = SITE.thesis;

  return (
    <section id="thesis" className="w-full">
      <div className="mx-auto max-w-[76rem] px-(--gutter)">
        <Reveal delay={0.06}>
          <SpatialThesisCanvas
            num="03 — The thesis"
            heading={t.heading}
            intro={t.intro}
          />
        </Reveal>
      </div>
    </section>
  );
}
