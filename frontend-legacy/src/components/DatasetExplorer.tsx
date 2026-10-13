"use client";

import React, { useState } from "react";
import { DatasetExampleData } from "@/lib/api";

interface DatasetExplorerProps {
  data: DatasetExampleData;
}

export function DatasetExplorer({ data }: DatasetExplorerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data.sampleJsonSnippet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 text-inv-text font-mono">
      
      {/* Column 1: Spatial Schema Layers (Sliced to 3) */}
      <div className="space-y-3">
        <div className="text-[0.68rem] text-[#D6C5B3] tracking-wider uppercase font-bold border-b border-inv-line/40 pb-2">
          Spatial Schema Layers (Key layers)
        </div>
        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
          {data.layers.slice(0, 3).map((layer) => (
            <div key={layer.layerKey} className="border border-inv-line/30 rounded bg-[#120e0a] p-3 space-y-1">
              <div className="flex items-center justify-between text-inv-text font-bold text-[0.72rem]">
                <span>{layer.layerKey}</span>
                <span className="text-[0.58rem] opacity-70 border border-inv-line px-1.5 py-0.5 rounded font-normal shrink-0">
                  {layer.format}
                </span>
              </div>
              <p className="text-[0.62rem] text-[#E6DFD5]/90 leading-normal">
                {layer.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Downstream AI Use Cases (Sliced to 2) */}
      <div className="space-y-3">
        <div className="text-[0.68rem] text-[#D6C5B3] tracking-wider uppercase font-bold border-b border-inv-line/40 pb-2">
          AI Downstream Use Cases
        </div>
        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
          {data.downstreamApplications.slice(0, 2).map((app) => (
            <div key={app.domain} className="border border-inv-line/30 rounded bg-[#120e0a] p-3 space-y-1">
              <div className="text-[#e08a67] uppercase text-[0.58rem] font-bold tracking-wide">
                {app.domain} Domain
              </div>
              <p className="text-[#E6DFD5] text-[0.65rem] leading-normal">
                {app.useCase}
              </p>
              <div className="flex flex-wrap gap-1 pt-1.5 border-t border-inv-line/20">
                {app.dataUtilized.map((layerKey) => (
                  <span key={layerKey} className="text-[0.52rem] text-[#D6C5B3] border border-inv-line/30 px-1 py-0.2 rounded shrink-0">
                    {layerKey}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: JSON Environment Schema Preview (Shrunk height) */}
      <div className="space-y-3">
        <div className="text-[0.68rem] text-[#D6C5B3] tracking-wider uppercase font-bold border-b border-inv-line/40 pb-2 flex items-center justify-between">
          <span>JSON Schema Snippet</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[0.55rem] text-[#D6C5B3] hover:text-inv-text border border-inv-line/40 px-2 py-0.5 rounded bg-inv-bg transition-colors cursor-pointer"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="relative rounded border border-inv-line/30 bg-[#120e0a]/90 p-3 h-[180px]">
          <pre className="h-full overflow-y-auto scrollbar-none font-mono text-[0.62rem] text-[#E6DFD5]/90 leading-normal select-all">
            {JSON.stringify(data.sampleJsonSnippet, null, 2)}
          </pre>
        </div>
        <div className="text-[0.55rem] text-[#D6C5B3]/80 leading-normal flex items-start gap-1">
          <span className="text-[#e08a67] font-bold shrink-0">*</span>
          <span>Targeting NVIDIA Omniverse, Cosmos world models, and spatial developer nodes.</span>
        </div>
      </div>

    </div>
  );
}
