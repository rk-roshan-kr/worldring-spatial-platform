"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, Navigation, Layers, Compass, Sparkles } from "lucide-react";

interface LayerInfo {
  id: "optical" | "trajectory" | "radiance" | "topology";
  num: string;
  title: string;
  concept: string;
  artisticTitle: string;
  stats: { label: string; value: string }[];
}

const LAYERS: LayerInfo[] = [
  {
    id: "optical",
    num: "01",
    title: "Panoramic Optical Ingestion",
    concept: "Continuous 360° panoramic video capture replaces $300k LiDAR rigs with accessible dual-sensor optical rigs.",
    artisticTitle: "Spherical Lens Field · Equirectangular Horizon",
    stats: [
      { label: "Optical Rig", value: "Dual 200° F/2.0" },
      { label: "Hardware Cost", value: "< 2% of LiDAR" },
    ],
  },
  {
    id: "trajectory",
    num: "02",
    title: "Visual-Inertial Camera Splines",
    concept: "Structure-from-Motion (SfM) solves 6-DOF camera pose matrices, tracking exact vehicle and pedestrian trajectory.",
    artisticTitle: "Bundle Adjustment · 6-DOF Pose Matrices",
    stats: [
      { label: "Pose Loop Closure", value: "Sub-centimeter" },
      { label: "Keyframe Linkages", value: "60 fps visual spline" },
    ],
  },
  {
    id: "radiance",
    num: "03",
    title: "Volumetric Radiance & Splatting",
    concept: "Neural radiance fields and 3D Gaussian Splats reconstruct photorealistic, continuous view-dependent depth.",
    artisticTitle: "Gaussian Point Cloud · Continuous Surface Synthesis",
    stats: [
      { label: "Depth Density", value: "2.4M Splats / Block" },
      { label: "Visual Fidelity", value: "View-dependent photo ground" },
    ],
  },
  {
    id: "topology",
    num: "04",
    title: "Structured Spatial Ground Truth",
    concept: "Continuous radiance is vectorized into navigable walkways, building envelopes, and street approach landmarks.",
    artisticTitle: "Axonometric Vector Matrix · Navigable Graph",
    stats: [
      { label: "Navigational Layers", value: "7-Layer Vector Schema" },
      { label: "Spatial Consumer", value: "Human & Physical-AI" },
    ],
  },
];

interface SpatialThesisCanvasProps {
  num?: string;
  heading?: string;
  intro?: string;
}

export function SpatialThesisCanvas({
  num = "03 — The thesis",
  heading = "What if ordinary optical observations could become a structured representation of reality?",
  intro = "Instead of deploying capital-intensive LiDAR fleets, we test whether consumer-grade 360° video, supplemented by low-cost GNSS/IMU sensors, can generate structured 3D spatial representations at a fraction of traditional mapping costs.",
}: SpatialThesisCanvasProps) {
  const [activeLayer, setActiveLayer] = useState<LayerInfo["id"]>("optical");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const activeIndex = LAYERS.findIndex((l) => l.id === activeLayer);
  const currentLayer = LAYERS[activeIndex];

  // Canvas animation loop rendering the artistic generative visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener("resize", onResize);

    // Generate constellation points for Gaussian / SfM clouds
    const numPoints = 120;
    const points: { x: number; y: number; z: number; ox: number; oy: number; oz: number; size: number; phase: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * Math.PI * 2 * 3;
      const radius = 60 + (i % 5) * 35;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * (radius * 0.45);
      const z = (Math.sin(i * 0.4) * 50);
      points.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        size: 1.5 + (i % 3) * 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.014;

      // Mouse smoothing
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.06;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const rotX = (mousePos.current.y / height - 0.5) * 0.4;
      const rotY = (mousePos.current.x / width - 0.5) * 0.6;

      // Background subtle ambient vignette
      const bgGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, width * 0.6);
      bgGrad.addColorStop(0, "rgba(191, 71, 34, 0.035)");
      bgGrad.addColorStop(1, "rgba(250, 248, 243, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(cx, cy);

      // ── MODE 1: OPTICAL SPHERICAL FIELD ──
      if (activeLayer === "optical") {
        ctx.strokeStyle = "rgba(27, 23, 18, 0.12)";
        ctx.lineWidth = 1;

        // Radiating equirectangular rays
        const rayCount = 24;
        for (let r = 0; r < rayCount; r++) {
          const angle = (r / rayCount) * Math.PI * 2 + time * 0.1;
          const rayLen = Math.min(width, height) * 0.44;
          const rx = Math.cos(angle) * rayLen;
          const ry = Math.sin(angle) * (rayLen * 0.55);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = `rgba(191, 71, 34, ${0.08 + Math.sin(angle + time) * 0.04})`;
          ctx.stroke();
        }

        // Concentric optical distortion rings
        for (let ring = 1; ring <= 6; ring++) {
          const radius = ring * (Math.min(width, height) * 0.065);
          const pulse = Math.sin(time * 1.5 - ring * 0.4) * 3;
          ctx.beginPath();
          ctx.ellipse(
            rotY * 20,
            rotX * 20,
            radius + pulse,
            (radius + pulse) * 0.52,
            rotY * 0.2,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = ring === 4 ? "rgba(191, 71, 34, 0.45)" : "rgba(27, 23, 18, 0.14)";
          ctx.lineWidth = ring === 4 ? 1.5 : 1;
          ctx.stroke();

          // Delicate tick marks on outer ring
          if (ring === 5) {
            for (let t = 0; t < 36; t++) {
              const ang = (t / 36) * Math.PI * 2;
              const tx1 = Math.cos(ang) * (radius + pulse);
              const ty1 = Math.sin(ang) * ((radius + pulse) * 0.52);
              const tx2 = Math.cos(ang) * (radius + pulse + 6);
              const ty2 = Math.sin(ang) * ((radius + pulse) * 0.52 + 3);
              ctx.beginPath();
              ctx.moveTo(tx1, ty1);
              ctx.lineTo(tx2, ty2);
              ctx.strokeStyle = "rgba(191, 71, 34, 0.35)";
              ctx.stroke();
            }
          }
        }

        // Center focal sensor iris
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#bf4722";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(191, 71, 34, 0.5)";
        ctx.stroke();
      }

      // ── MODE 2: TRAJECTORY & 6-DOF SPLINES ──
      else if (activeLayer === "trajectory") {
        // Draw undulating camera trajectory path
        ctx.beginPath();
        const steps = 80;
        const curveWidth = width * 0.7;
        for (let s = 0; s <= steps; s++) {
          const tNorm = (s / steps) - 0.5;
          const px = tNorm * curveWidth;
          const py = Math.sin(tNorm * 4 + time * 1.5) * 35 + Math.cos(tNorm * 2) * 20;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "#bf4722";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Secondary shadow track
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const tNorm = (s / steps) - 0.5;
          const px = tNorm * curveWidth;
          const py = Math.sin(tNorm * 4 + time * 1.5) * 35 + Math.cos(tNorm * 2) * 20 + 45;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "rgba(27, 23, 18, 0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Camera Frustums along the spline
        const numCameras = 7;
        for (let c = 0; c < numCameras; c++) {
          const tNorm = (c / (numCameras - 1)) - 0.5;
          const cxPos = tNorm * curveWidth;
          const cyPos = Math.sin(tNorm * 4 + time * 1.5) * 35 + Math.cos(tNorm * 2) * 20;

          // Camera focal node
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, 4, 0, Math.PI * 2);
          ctx.fillStyle = c === 3 ? "#bf4722" : "#1b1712";
          ctx.fill();

          // Camera visual cone
          ctx.beginPath();
          ctx.moveTo(cxPos, cyPos);
          ctx.lineTo(cxPos - 18, cyPos - 26);
          ctx.lineTo(cxPos + 18, cyPos - 26);
          ctx.closePath();
          ctx.strokeStyle = c === 3 ? "rgba(191, 71, 34, 0.7)" : "rgba(27, 23, 18, 0.25)";
          ctx.fillStyle = c === 3 ? "rgba(191, 71, 34, 0.1)" : "rgba(27, 23, 18, 0.04)";
          ctx.fill();
          ctx.stroke();

          // Vertical ground projection line
          ctx.beginPath();
          ctx.moveTo(cxPos, cyPos);
          ctx.lineTo(cxPos, cyPos + 45);
          ctx.strokeStyle = "rgba(191, 71, 34, 0.25)";
          ctx.stroke();
        }
      }

      // ── MODE 3: VOLUMETRIC RADIANCE / GAUSSIAN SPLATS ──
      else if (activeLayer === "radiance") {
        // Shimmering 3D point cloud & radiance ellipses
        points.forEach((p, idx) => {
          const wave = Math.sin(time * 2 + p.phase);
          const x3d = p.ox + rotY * p.oz * 0.8;
          const y3d = p.oy + rotX * p.oz * 0.8 + wave * 4;
          const scale = (p.oz + 100) / 100;

          // Gaussian soft radiance glow
          const grad = ctx.createRadialGradient(x3d, y3d, 0, x3d, y3d, p.size * 6 * scale);
          const isAccent = idx % 4 === 0;
          grad.addColorStop(0, isAccent ? "rgba(191, 71, 34, 0.6)" : "rgba(27, 23, 18, 0.45)");
          grad.addColorStop(1, "rgba(250, 248, 243, 0)");

          ctx.beginPath();
          ctx.arc(x3d, y3d, p.size * 5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Hard core
          ctx.beginPath();
          ctx.arc(x3d, y3d, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = isAccent ? "#bf4722" : "#1b1712";
          ctx.fill();

          // Thin link lines to neighbors
          if (idx % 3 === 0 && idx + 1 < points.length) {
            const pNext = points[idx + 1];
            ctx.beginPath();
            ctx.moveTo(x3d, y3d);
            ctx.lineTo(pNext.ox + rotY * pNext.oz * 0.8, pNext.oy + rotX * pNext.oz * 0.8);
            ctx.strokeStyle = "rgba(191, 71, 34, 0.12)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }

      // ── MODE 4: STRUCTURED VECTOR TOPOLOGY ──
      else if (activeLayer === "topology") {
        ctx.strokeStyle = "rgba(27, 23, 18, 0.3)";
        ctx.lineWidth = 1.2;

        // Perspective urban corridor grid
        const groundY = 60;
        const horizonY = -70;

        // Street vanishing perspective lines
        const vanishingX = rotY * 40;
        for (let v = -4; v <= 4; v++) {
          const bottomX = v * 55;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(bottomX * 2.4, groundY + 120);
          ctx.strokeStyle = Math.abs(v) <= 1 ? "rgba(191, 71, 34, 0.6)" : "rgba(27, 23, 18, 0.16)";
          ctx.lineWidth = Math.abs(v) <= 1 ? 1.8 : 1;
          ctx.stroke();
        }

        // Horizontal cross-streets
        for (let h = 1; h <= 5; h++) {
          const hy = horizonY + (h / 5) * (groundY + 120 - horizonY);
          const span = (h / 5) * width * 0.45;
          ctx.beginPath();
          ctx.moveTo(vanishingX - span, hy);
          ctx.lineTo(vanishingX + span, hy);
          ctx.strokeStyle = "rgba(27, 23, 18, 0.18)";
          ctx.stroke();
        }

        // Isometric building volume envelopes
        const drawBuilding = (bx: number, by: number, bw: number, bh: number) => {
          ctx.beginPath();
          ctx.rect(bx, by - bh, bw, bh);
          ctx.fillStyle = "rgba(243, 239, 230, 0.75)";
          ctx.fill();
          ctx.strokeStyle = "rgba(27, 23, 18, 0.4)";
          ctx.stroke();

          // Roof top polygon
          ctx.beginPath();
          ctx.moveTo(bx, by - bh);
          ctx.lineTo(bx + bw * 0.3, by - bh - 15);
          ctx.lineTo(bx + bw * 1.3, by - bh - 15);
          ctx.lineTo(bx + bw, by - bh);
          ctx.closePath();
          ctx.fillStyle = "rgba(235, 230, 218, 0.85)";
          ctx.fill();
          ctx.stroke();

          // Building side facet
          ctx.beginPath();
          ctx.moveTo(bx + bw, by - bh);
          ctx.lineTo(bx + bw * 1.3, by - bh - 15);
          ctx.lineTo(bx + bw * 1.3, by - 15);
          ctx.lineTo(bx + bw, by);
          ctx.closePath();
          ctx.fillStyle = "rgba(215, 208, 192, 0.65)";
          ctx.fill();
          ctx.stroke();
        };

        // Left building block
        drawBuilding(-190, 40, 70, 80);
        // Right building block
        drawBuilding(110, 40, 80, 100);

        // Navigational Destination Beacon
        const beaconX = 35 + vanishingX * 0.5;
        const beaconY = groundY - 20;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#bf4722";
        ctx.fill();

        // Pulsing radar rings
        const ringPulse = (time * 2) % 1;
        ctx.beginPath();
        ctx.ellipse(beaconX, beaconY + 2, 14 + ringPulse * 16, 6 + ringPulse * 8, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(191, 71, 34, ${1 - ringPulse})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      ctx.restore();

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current.targetX = e.clientX - rect.left;
      mousePos.current.targetY = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", onResize);
      if (canvas) canvas.removeEventListener("mousemove", handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [activeLayer]);

  return (
    <div className="grid lg:grid-cols-[1.05fr_1.25fr] gap-8 lg:gap-10 items-stretch">
      
      {/* ── Left Column: Question, Thesis Narrative & Interactive Stages ── */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          {/* Section Kicker */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-3 h-px bg-accent inline-block" />
            <span className="sec-num font-mono text-[0.72rem] tracking-[0.16em] uppercase text-accent font-semibold">
              {num}
            </span>
          </div>

          {/* Big Question / Heading */}
          <h2 className="mt-1 font-serif text-[clamp(1.75rem,2.8vw,2.5rem)] leading-[1.16] tracking-[-0.02em] font-medium text-balance text-ink">
            {heading}
          </h2>

          {/* Lede / Intro */}
          {intro && (
            <p className="prose-copy mt-2.5 text-[0.88rem] leading-relaxed text-body-text">
              {intro}
            </p>
          )}

          {/* Subheader */}
          <div className="flex items-center gap-2 mt-5 mb-2.5">
            <span className="w-2 h-px bg-accent/60" />
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-accent-deep font-bold">
              4 Synthesis Transformations
            </span>
          </div>
        </div>

        {/* Stage Selection Cards */}
        <div className="grid gap-2">
          {LAYERS.map((layer) => {
            const isSelected = layer.id === activeLayer;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-paper border-accent shadow-xs ring-1 ring-accent/30"
                    : "bg-paper/40 border-line hover:border-line-strong hover:bg-paper/70"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[0.62rem] font-bold ${isSelected ? "text-accent" : "text-muted"}`}>
                      {layer.num}
                    </span>
                    <h4 className={`text-[0.88rem] font-serif font-semibold m-0 leading-tight ${isSelected ? "text-ink" : "text-body-text"}`}>
                      {layer.title}
                    </h4>
                  </div>
                  <p className="font-sans text-[0.74rem] text-muted leading-relaxed m-0 pr-2">
                    {layer.concept}
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  {isSelected ? (
                    <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-line-strong inline-block" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Technical Summary */}
        <div className="p-3 rounded-xl bg-paper-deep/60 border border-line/60 font-mono text-[0.68rem] text-muted flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentLayer.stats.map((s, idx) => (
              <div key={idx}>
                <span className="text-faint text-[0.58rem] uppercase tracking-wider block">{s.label}</span>
                <strong className="text-ink font-semibold">{s.value}</strong>
              </div>
            ))}
          </div>
          <span className="text-accent font-semibold text-[0.64rem]">Phase {currentLayer.num} / 04</span>
        </div>
      </div>

      {/* ── Right Column: Generative Artistic Canvas ── */}
      <div className="relative rounded-2xl border border-line-strong/60 bg-paper-deep/40 overflow-hidden shadow-xs flex flex-col min-h-[420px] lg:min-h-[480px]">
        
        {/* Artistic Canvas Top Bar */}
        <div className="flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted px-5 py-3 border-b border-line/60 bg-paper/70 backdrop-blur-xs select-none">
          <div className="flex items-center gap-2 text-ink font-semibold">
            {activeLayer === "optical" && <Eye className="w-3.5 h-3.5 text-accent" />}
            {activeLayer === "trajectory" && <Navigation className="w-3.5 h-3.5 text-accent" />}
            {activeLayer === "radiance" && <Sparkles className="w-3.5 h-3.5 text-accent" />}
            {activeLayer === "topology" && <Layers className="w-3.5 h-3.5 text-accent" />}
            <span>{currentLayer.artisticTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] text-muted font-sans hidden sm:inline">Interactive Vector Simulation</span>
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-bold text-[0.58rem]">
              LAYER {currentLayer.num}
            </span>
          </div>
        </div>

        {/* Dynamic HTML5 Canvas */}
        <div className="relative flex-1 w-full h-full min-h-[340px]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          />
        </div>

        {/* Artistic Canvas Footer */}
        <div className="flex items-center justify-between font-mono text-[0.64rem] text-muted px-5 py-2.5 border-t border-line/60 bg-paper/60 select-none">
          <span className="text-muted">Move pointer to displace optical / volumetric perspective</span>
          <span className="text-ink font-medium">Earthos Lab Field Experiment · Chandigarh Corridor</span>
        </div>
      </div>

    </div>
  );
}
