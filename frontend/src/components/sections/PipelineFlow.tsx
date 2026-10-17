"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { ArrowRight, Cpu, Layers } from "lucide-react";

export function PipelineFlow() {
  const [selectedStep, setSelectedStep] = useState(0);

  const stepDetails = [
    { hardware: "Insta360 X4 (< $500)", latency: "30fps 5.7K", algo: "Equirectangular projection" },
    { hardware: "Commodity IMU + Visual", latency: "Real-time solver", algo: "GLOMAP / SfM pose splines" },
    { hardware: "Nvidia RTX 4090 / Cloud", latency: "< 8 min/km", algo: "3D Gaussian Splatting" },
    { hardware: "Edge Neural Inference", latency: "< 5ms/frame", algo: "YOLOv8 + DeepPrivacy inpainting" },
    { hardware: "Vector Engine", latency: "Deterministic", algo: "Ground plane & sidewalk extraction" },
    { hardware: "Web & Edge Runtime", latency: "< 15ms query", algo: "ROS 2 & WebGL spatial API" },
  ];

  const current = stepDetails[selectedStep] || stepDetails[0];
  const activeStepData = SITE.thesis.pipeline[selectedStep] || SITE.thesis.pipeline[0];

  return (
    <div className="w-full max-w-2xl py-4 space-y-6">
      {/* Minimal Header with Frosted Contrast Shield */}
      <div className="text-center space-y-2.5 mb-8 max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <span className="font-mono text-[0.64rem] sm:text-[0.66rem] text-cyan-400 tracking-widest uppercase font-semibold">
          Level 03 · Continuous Optical Pipeline
        </span>

        <h2 className="font-serif text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium leading-[1.15] text-white">
          Commodity Optical to 3D Neural Twin
        </h2>

        <p className="text-muted text-[0.82rem] sm:text-[0.88rem] leading-relaxed">
          Sub-$500 cameras and cloud neural splatting replace $300,000 LiDAR survey fleets.
        </p>
      </div>

      {/* Main Console Box */}
      <div className="void-glass p-4 sm:p-6 rounded-2xl border border-white/12 bg-black/80 backdrop-blur-xl space-y-4">
        {/* Step Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SITE.thesis.pipeline.map((step, idx) => {
            const isSelected = selectedStep === idx;
            return (
              <button
                key={step.step}
                onClick={() => setSelectedStep(idx)}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_16px_rgba(0,200,232,0.25)]"
                    : "bg-white/5 border-white/5 text-white/70 hover:border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[0.70rem] sm:text-[0.72rem] font-bold ${isSelected ? "text-cyan-400" : "text-white/40"}`}>
                    0{step.step}
                  </span>
                  <span className="font-mono text-[0.52rem] sm:text-[0.55rem] text-muted px-1.5 py-0.5 rounded bg-black/50">
                    {step.tag}
                  </span>
                </div>
                <div className="text-[0.74rem] sm:text-[0.78rem] font-medium truncate">
                  {step.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Technical Telemetry */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 font-mono text-[0.72rem] sm:text-[0.74rem]">
          <div className="space-y-0.5">
            <div className="text-cyan-400 font-bold flex items-center gap-2">
              <span>STAGE 0{activeStepData.step}: {activeStepData.name}</span>
            </div>
            <div className="text-white/80 text-[0.70rem] sm:text-[0.72rem]">{current.algo}</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
            <div className="px-2.5 sm:px-3 py-1 rounded bg-black/60 border border-white/10 text-white/90">
              <span className="text-muted mr-1">LATENCY:</span>
              <span className="text-cyan-400 font-semibold">{current.latency}</span>
            </div>
            <div className="px-2.5 sm:px-3 py-1 rounded bg-black/60 border border-white/10 text-white/90">
              <span className="text-muted mr-1">HW:</span>
              <span className="text-white">{current.hardware.split("/")[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Link to Full Thesis */}
      <div className="mt-6 text-center">
        <Link
          href="/thesis#pipeline"
          className="inline-flex items-center justify-center gap-2 font-mono text-[0.70rem] sm:text-[0.74rem] text-cyan-400 hover:text-cyan-300 transition-colors bg-white/5 hover:bg-white/10 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full border border-white/10 max-w-full text-center"
        >
          <span>View Complete 6-Stage Algorithm Architecture in Thesis</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
