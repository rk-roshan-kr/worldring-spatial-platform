"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { fetchPipelineStatus, PipelineStatusData } from "@/lib/api";
import { PipelineTelemetryHUD } from "@/components/PipelineTelemetryHUD";
import { Loader2 } from "lucide-react";

export function PipelineSection() {
  const t = SITE.thesis;
  const [pipelineData, setPipelineData] = useState<PipelineStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPipelineStatus()
      .then((data) => {
        if (active) {
          setPipelineData(data);
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
    <Section id="thesis" num="03 — The thesis" title={t.heading} intro={t.intro}>
      <Reveal className="w-full">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent-deep mb-4 font-bold">
          Target Pipeline Architecture — Click stages to inspect live sandbox telemetry
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-line bg-paper-deep rounded-lg">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
            <span className="font-mono text-xs text-muted">Loading Technical Pipeline Telemetry...</span>
          </div>
        ) : pipelineData ? (
          <PipelineTelemetryHUD data={pipelineData} />
        ) : (
          <div className="flex items-center justify-center min-h-[300px] border border-line bg-paper-deep rounded-lg font-mono text-xs text-muted">
            Failed to load pipeline telemetry details.
          </div>
        )}
      </Reveal>
    </Section>
  );
}
