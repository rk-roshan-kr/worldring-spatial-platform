"use client";

import React, { useEffect, useState, useRef } from "react";
import { PipelineStatusData } from "@/lib/api";
import { Terminal, Cpu, ShieldCheck } from "lucide-react";

interface PipelineTelemetryHUDProps {
  data: PipelineStatusData;
}

const MOCK_LOGS = [
  "[SfM] Loop closure detected: 14 image frame linkages optimized.",
  "[Sparse] Reconstructed 34,200 sparse point cloud landmarks.",
  "[Dense] Generating depth maps from monocular stream.",
  "[Splatting] Gaussian point cloud optimized. Point count: 184,200.",
  "[Extract] Building 3D storefront meshes (tolerance threshold: 1.5cm).",
  "[PII] License plate redacted (conf: 98.4%) at coordinate offset [24, -12].",
  "[Export] Packaging glTF geometry and neural textures...",
  "[Deploy] Dynamic spatial tileset compiled (WGS84 alignment: 99.98%).",
  "[Observe] Waiting for client node request ping..."
];

export function PipelineTelemetryHUD({ data }: PipelineTelemetryHUDProps) {
  const [logs, setLogs] = useState<string[]>([
    "[System] Earthos Lab sandbox environment initialized.",
    "[Backend] Listening for spatial telemetry requests on port 3001...",
    "[API] Pipeline benchmark listener active."
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Live log ticker ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextLog = MOCK_LOGS[Math.floor(Math.random() * MOCK_LOGS.length)];
        const withTimestamp = `[${new Date().toLocaleTimeString()}] ${nextLog}`;
        return [...prev.slice(-3), withTimestamp]; // Keep last 4 logs to save vertical height
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs to bottom locally (prevents page viewport hijacking)
  useEffect(() => {
    const el = terminalRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 text-ink">
      
      {/* Column 1: Vertical Timeline of Key Stages (Sliced to 5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2 mb-1">
          <span className="font-mono text-[0.68rem] text-muted tracking-wider uppercase font-bold">
            Pipeline Architecture (Key Stages)
          </span>
          <span className="font-mono text-[0.62rem] text-faint">
            STABLE TARGET
          </span>
        </div>

        <div className="border border-line rounded bg-paper-deep p-4 font-mono text-[0.7rem] max-h-[220px] overflow-y-auto scrollbar-none divide-y divide-line/60">
          {data.pipelineStages.slice(0, 5).map((stage) => (
            <div key={stage.id} className="flex items-start justify-between py-1.5 gap-4">
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">STG {stage.stepNumber}</span>
                <div>
                  <div className="text-ink font-serif font-medium leading-tight">{stage.name}</div>
                  <div className="text-[0.62rem] text-muted leading-normal mt-0.5 max-w-[280px]">
                    {stage.technicalDetails}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                <span className="text-faint text-[0.55rem] uppercase border border-line px-1.5 py-0.5 rounded tracking-wide font-semibold">
                  {stage.category}
                </span>
                <span className="text-muted text-[0.65rem]">{stage.telemetry.targetLatency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Status HUD & Logs Console */}
      <div className="space-y-4">
        
        {/* Telemetry metadata panel */}
        <div className="border border-line rounded bg-paper-deep p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="font-mono text-[0.68rem] text-muted tracking-wider uppercase font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              Environment Benchmarks
            </span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="font-mono text-[0.62rem] text-muted uppercase font-bold">
                Live Status
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-[0.7rem] text-muted">
            <div className="p-3 border border-line rounded bg-paper">
              <div className="text-faint text-[0.58rem] uppercase tracking-wider mb-1">DATASTREAM INGEST</div>
              <div className="text-ink font-bold font-sans">Equirectangular 360° MP4</div>
            </div>
            <div className="p-3 border border-line rounded bg-paper">
              <div className="text-faint text-[0.58rem] uppercase tracking-wider mb-1">DATA LAYERS EXPORT</div>
              <div className="text-ink font-bold font-sans flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                USD / glTF / LAS
              </div>
            </div>
          </div>
        </div>

        {/* Live log ticker console (Shrunk height) */}
        <div className="border border-line rounded bg-paper-deep p-4 flex flex-col h-[125px] relative overflow-hidden">
          <div className="flex items-center gap-1.5 font-mono text-[0.62rem] text-muted tracking-wider uppercase font-bold border-b border-line pb-2 mb-2 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            Sandbox Console Logs
          </div>
          <div ref={terminalRef} className="flex-1 overflow-y-auto scrollbar-none font-mono text-[0.62rem] text-emerald-600 space-y-1.5 pr-2 select-text">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                <span className="text-muted mr-1 select-none">&gt;</span>
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
