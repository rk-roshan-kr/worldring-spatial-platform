"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { LayerStackDiagram } from "@/components/glyphs";
import { fetchDatasetsExample, DatasetExampleData } from "@/lib/api";
import { DatasetExplorer } from "@/components/DatasetExplorer";
import { Loader2 } from "lucide-react";

export function DataWingSection() {
  const d = SITE.dataWing;
  const [datasetData, setDatasetData] = useState<DatasetExampleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchDatasetsExample()
      .then((data) => {
        if (active) {
          setDatasetData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      id="data"
      num="06 — Data wing"
      title={d.heading}
      intro={d.intro}
      className="!border-t-0 bg-inv-bg text-inv-text [&_.sec-num]:text-[#e08a67] [&_.prose-copy]:!text-[#E6DFD5] [&_.prose-copy]:!text-[1.08rem] [&_.prose-copy]:!leading-relaxed p-8 md:p-14 lg:p-16 rounded-3xl my-8 border border-[#3A3228] shadow-2xl"
    >
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
        <Reveal>
          <LayerStackDiagram />
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-[#D6C5B3] mt-5 mb-0">
            Earthos Proposed 7-Layer Schema
          </p>
        </Reveal>
        <Reveal className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[380px] border border-inv-line bg-inv-bg/30 rounded-xl">
              <Loader2 className="w-8 h-8 text-[#e08a67] animate-spin mb-3" />
              <span className="font-mono text-xs text-[#D6C5B3]">Loading Spatial Schema Data...</span>
            </div>
          ) : datasetData ? (
            <DatasetExplorer data={datasetData} />
          ) : (
            <div className="flex items-center justify-center min-h-[380px] border border-inv-line bg-inv-bg/30 rounded-xl font-mono text-xs text-[#D6C5B3]">
              Failed to load spatial schema datasets.
            </div>
          )}
        </Reveal>
      </div>

      <Reveal>
        <p className="font-mono text-[0.74rem] tracking-[0.05em] text-[#D6C5B3] mt-8 mb-0">
          <span className="block w-8 border-t border-inv-line mb-4" aria-hidden />
          Intended Physical-AI Ecosystem — Robotics · Autonomous Systems · Simulation · Physical-AI Research
        </p>
      </Reveal>
      <Reveal>
        <p className="font-mono text-[0.72rem] text-[#D6C5B3] max-w-prose mt-6">{d.footnote}</p>
      </Reveal>
    </Section>
  );
}
