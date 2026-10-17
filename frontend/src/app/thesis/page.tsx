"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { ContactModal } from "@/components/ui/ContactModal";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  MapPin,
  Eye,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  Target,
  PieChart,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Download,
} from "lucide-react";

export default function ThesisPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState("FUND_PROTOTYPE");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const handleOpenContact = (mode: string = "FUND_PROTOTYPE") => {
    setContactMode(mode);
    setIsContactOpen(true);
  };

  const sections = [
    { id: "abstract", label: "01. Executive Summary" },
    { id: "gap", label: "02. The Spatial Gap" },
    { id: "pipeline", label: "03. Optical Pipeline" },
    { id: "data-strata", label: "04. Physical AI Strata" },
    { id: "dual-streams", label: "05. Dual Value Streams" },
    { id: "proving-ground", label: "06. Sector 17 Pilot" },
    { id: "capital", label: "07. Capital & Roadmap" },
    { id: "faq", label: "08. Technical FAQ" },
  ];

  return (
    <div className="min-h-screen bg-black text-[#f2ede4] font-sans selection:bg-cyan-500/20 selection:text-white">
      {/* ── Fixed Header ── */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[0.76rem] sm:text-[0.80rem] font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-white/5 hover:bg-white/10 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/10 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Spatial Experience</span>
            <span className="sm:hidden">3D Experience</span>
          </Link>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <span className="font-serif text-[1.05rem] font-medium tracking-tight text-white hidden sm:inline">
            WorldRing <span className="text-white/40 font-mono text-[0.75rem] font-normal">/ Full Technical Thesis</span>
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleOpenContact("FUND_PROTOTYPE")}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-[0.74rem] sm:text-[0.78rem] font-mono py-1.5 px-3 sm:px-4 rounded-full transition-all cursor-pointer shadow-[0_0_16px_rgba(0,200,232,0.3)]"
          >
            <span className="hidden sm:inline">Review Data Room</span>
            <span className="sm:hidden">Data Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="border-b border-white/10 py-12 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 font-mono text-[0.68rem] uppercase tracking-widest font-semibold max-w-full">
            <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Complete Architecture & Investment Thesis · v0.2</span>
          </div>

          <h1 className="font-serif text-[clamp(1.9rem,5vw,3.8rem)] leading-[1.08] tracking-[-0.02em] font-medium text-white">
            Reconstructing the Physical World as Structured Spatial Intelligence.
          </h1>

          <p className="font-serif italic text-cyan-200/80 text-[1.05rem] sm:text-[1.15rem] leading-relaxed">
            The mathematical foundations, optical reconstruction pipeline, and dual commercial deployment of WorldRing in Chandigarh Sector 17.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-muted font-mono text-[0.70rem] sm:text-[0.74rem]">
            <span>LOCATION: Sector 17, Chandigarh (30.7333° N / 76.7794° E)</span>
            <span className="text-white/20">·</span>
            <span>HARDWARE COST: &lt; $500 per rig</span>
            <span className="text-white/20">·</span>
            <span>ACCURACY: Centimeter Metric Ground Truth</span>
          </div>
        </div>
      </section>

      {/* ── Main Two-Column Document Layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Table of Contents Sidebar */}
        <aside className="lg:w-64 shrink-0">
          {/* Mobile TOC Toggle (Hidden on Desktop) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileTocOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[0.76rem] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Table of Contents ({sections.length} Chapters)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isMobileTocOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Links list: Collapsible on mobile, Always visible & sticky on PC */}
          <div className={`${isMobileTocOpen ? "block mt-3" : "hidden"} lg:block sticky top-24 space-y-4`}>
            <div className="font-mono text-[0.66rem] uppercase tracking-widest text-muted font-bold hidden lg:block">
              DOCUMENT SECTIONS
            </div>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setIsMobileTocOpen(false)}
                  className="block font-mono text-[0.76rem] text-white/60 hover:text-cyan-400 hover:bg-white/5 py-1.5 px-2.5 rounded-lg transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 lg:pt-6 border-t border-white/10 space-y-3">
              <div className="font-mono text-[0.66rem] uppercase tracking-widest text-muted font-bold">
                DOCUMENT ACTIONS
              </div>
              <button
                onClick={() => {
                  setIsMobileTocOpen(false);
                  handleOpenContact("FUND_PROTOTYPE");
                }}
                className="w-full text-left font-mono text-[0.74rem] text-cyan-300 hover:text-white bg-white/5 p-2 rounded-lg border border-white/10 flex items-center justify-between cursor-pointer"
              >
                <span>Request Cap Table & Pitch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsMobileTocOpen(false);
                  handleOpenContact("PARTNER_PILOT");
                }}
                className="w-full text-left font-mono text-[0.74rem] text-white/80 hover:text-white bg-white/5 p-2 rounded-lg border border-white/10 flex items-center justify-between cursor-pointer"
              >
                <span>Partner on Sector Pilot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Deep-Dive Editorial Text Content */}
        <main className="flex-1 space-y-20 max-w-3xl">
          {/* ── 01. ABSTRACT ── */}
          <section id="abstract" className="space-y-5 scroll-mt-24">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 01
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              Executive Summary: The Physical World as the Next Data Layer
            </h2>
            <div className="space-y-4 text-muted leading-relaxed text-[0.95rem]">
              <p>
                The digital internet was mapped over three decades through search engines, indexes, and hyperlinks. However, the physical environment—where $4.8 trillion of commerce, last-mile logistics, and autonomous robotics operate—remains trapped in primitive 2D vector representations designed for 20th-century road navigation.
              </p>
              <p>
                Traditional mapping platforms pin addresses to the nearest arterial roadway centerline. In dense urban sectors, multi-level retail plazas, campus complexes, and courtyard arcades, formal addressing fails catastrophically in the final 100 meters. Delivery couriers circle aimlessly, emergency personnel lose critical minutes, and autonomous sidewalk rovers lack the geometric priors required to dock at real-world entrances.
              </p>
              <p className="text-white/90 font-medium">
                WorldRing introduces an optical-to-neural reconstruction pipeline that converts commodity 360° dual-lens video captured from bicycles, carts, or passenger vehicles into continuous, metric-accurate 3D Gaussian Splats and semantic vector graphs.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-[0.74rem]">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-muted block text-[0.62rem] uppercase">SURVEY COST</span>
                <span className="text-cyan-400 font-bold text-[1.1rem]">&lt; $500</span>
                <span className="text-muted block text-[0.65rem] mt-0.5">vs $300k LiDAR</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-muted block text-[0.62rem] uppercase">PRECISION</span>
                <span className="text-cyan-400 font-bold text-[1.1rem]">&lt; 0.05m</span>
                <span className="text-muted block text-[0.65rem] mt-0.5">Centimeter Scale</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-muted block text-[0.62rem] uppercase">CORRIDOR DEPTH</span>
                <span className="text-cyan-400 font-bold text-[1.1rem]">500m Loop</span>
                <span className="text-muted block text-[0.65rem] mt-0.5">Sector 17 Benchmark</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-muted block text-[0.62rem] uppercase">RECON SPEED</span>
                <span className="text-cyan-400 font-bold text-[1.1rem]">&lt; 8 min/km</span>
                <span className="text-muted block text-[0.65rem] mt-0.5">Cloud Splatting</span>
              </div>
            </div>
          </section>

          {/* ── 02. THE SPATIAL GAP ── */}
          <section id="gap" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 02
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              The Spatial Gap: Why Formal Addresses Fail in the Last 100m
            </h2>
            <p className="text-muted text-[0.95rem] leading-relaxed">
              To understand the limitation of coordinates, consider our proving ground in Sector 17, Chandigarh—Le Corbusier’s modernist pedestrian paradise characterized by deep retail arcades, sunken plazas, and peripheral vehicular parking.
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[0.78rem]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-muted text-[0.68rem] uppercase">
                    <th className="py-2.5 pr-4">Dimension</th>
                    <th className="py-2.5 px-4 text-red-400">Formal GPS Address</th>
                    <th className="py-2.5 pl-4 text-cyan-400">WorldRing Visual Landmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-4 text-muted">Input Schema</td>
                    <td className="py-3 px-4 text-white">`SCO 123-124, Sector 17-C, Chandigarh`</td>
                    <td className="py-3 pl-4 text-cyan-300">Continuous 360° Visual Anchor Spline</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-muted">Pin Location</td>
                    <td className="py-3 px-4 text-red-300">Stops 120m away on arterial asphalt</td>
                    <td className="py-3 pl-4 text-cyan-300">Directly at retail storefront glass portal</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-muted">Vertical & Interior Context</td>
                    <td className="py-3 px-4 text-white">Zero. Lacks floor, arcade, and canopy data</td>
                    <td className="py-3 pl-4 text-cyan-300">Full 3D arcade pillars, stairs, and setbacks</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-muted">Courier / Rover Experience</td>
                    <td className="py-3 px-4 text-red-300">14 min average circling, 18% failed dropoff</td>
                    <td className="py-3 pl-4 text-cyan-300">Deterministic first-pass arrival success</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-3 text-muted text-[0.92rem] leading-relaxed">
              <h3 className="font-serif text-[1.2rem] text-white font-medium">Human Navigation Relies on Visual Ground Truth</h3>
              <p>
                When a local gives directions in Sector 17, they never say: <span className="font-mono text-white/80">&quot;Go to 30.7333° N, 76.7794° E.&quot;</span> They say:
              </p>
              <blockquote className="border-l-2 border-cyan-400 pl-4 py-1 italic font-serif text-white/90 text-[1.05rem]">
                &ldquo;Park at the northern lot, walk past the central tiered fountain, enter the shaded arcade between the two concrete pillars, and it’s the fourth glass entrance on the right.&rdquo;
              </blockquote>
              <p>
                This is visual landmark routing. WorldRing digitizes this exact perceptual experience into an embeddable, centimeter-accurate 3D layer.
              </p>
            </div>
          </section>

          {/* ── 03. OPTICAL PIPELINE ── */}
          <section id="pipeline" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 03
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              The 6-Stage Commodity Optical Reconstruction Pipeline
            </h2>
            <p className="text-muted text-[0.95rem] leading-relaxed">
              Rather than mounting $300,000 multi-beam Velodyne or Ouster LiDAR systems on expensive specialized fleet vehicles, WorldRing proves that dual-lens 5.7K optical sensors ($450 Insta360 X4 or equivalent) combined with visual-inertial odometry can recover metric 3D geometry with sub-5cm precision.
            </p>

            <div className="space-y-4">
              {SITE.thesis.pipeline.map((step, idx) => (
                <div key={step.step} className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-cyan-400 text-[0.80rem] font-bold">STAGE 0{step.step}</span>
                      <span className="text-white font-medium text-[0.95rem]">{step.name}</span>
                    </div>
                    <span className="font-mono text-[0.62rem] text-muted px-2 py-0.5 rounded bg-black/50 border border-white/10">
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-muted text-[0.84rem] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/30 text-cyan-200 text-[0.82rem] font-mono space-y-1">
              <div className="font-bold uppercase tracking-wider text-cyan-300">Algorithmic Moat: Continuous Photometric Gaussian Optimization</div>
              <div>Camera Pose Solver: GLOMAP accelerated sparse SfM with IMU gravity constraints</div>
              <div>Radiance Representation: 3D Gaussian Splatting with depth regularization and view-dependent spherical harmonics</div>
              <div>Privacy Protection: On-device YOLOv8-pose + DeepPrivacy generative facial & license plate inpainting</div>
            </div>
          </section>

          {/* ── 04. PHYSICAL AI STRATA ── */}
          <section id="data-strata" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 04
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              Physical AI Infrastructure: Multi-Strata Spatial Ground Truth
            </h2>
            <p className="text-muted text-[0.95rem] leading-relaxed">
              Robotics, delivery rovers, and foundation models operating in physical space cannot function on flat 2D maps. WorldRing decomposes the street into 7 synchronized strata layers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[0.76rem]">
              {SITE.dataWing.layers.map((layer) => (
                <div key={layer.name} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-cyan-400 font-bold">{layer.name}</div>
                  <div className="text-muted text-[0.72rem] leading-snug">{layer.contains}</div>
                </div>
              ))}
            </div>

            <p className="text-muted text-[0.85rem] italic">
              {SITE.dataWing.footnote}
            </p>
          </section>

          {/* ── 05. DUAL VALUE STREAMS ── */}
          <section id="dual-streams" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 05
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              Dual Value Streams: One Capture Foundation, Two Massive Markets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="font-mono text-[0.68rem] text-cyan-400 uppercase font-bold">STREAM A</span>
                    <h3 className="font-serif text-[1.2rem] text-white font-medium">Human Visual Navigation</h3>
                  </div>
                </div>
                <p className="text-muted text-[0.84rem] leading-relaxed">
                  Turn-by-turn immersive visual arrival previews for pedestrians, couriers, and hospital/campus visitors. Embeddable via lightweight WebGL or mobile SDK.
                </p>
                <ul className="space-y-1.5 font-mono text-[0.74rem] text-white/80">
                  <li>• Zero courier arrival failures in dense retail corridors</li>
                  <li>• Eliminates 14-minute average dropoff delays</li>
                  <li>• Embeddable storefront visual approach widgets</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="font-mono text-[0.68rem] text-amber-400 uppercase font-bold">STREAM B</span>
                    <h3 className="font-serif text-[1.2rem] text-white font-medium">Physical AI & Robotics Priors</h3>
                  </div>
                </div>
                <p className="text-muted text-[0.84rem] leading-relaxed">
                  Centimeter ground truth for sidewalk delivery rovers, drones, and simulation environments. Exposed via ROS 2 and spatial REST APIs.
                </p>
                <ul className="space-y-1.5 font-mono text-[0.74rem] text-white/80">
                  <li>• Metric sidewalk friction and curb elevation profiles</li>
                  <li>• 3D obstacle bounding (bollards, benches, trees)</li>
                  <li>• Real-world digital twin environments for synthetic training</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── 06. SECTOR 17 PILOT ── */}
          <section id="proving-ground" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 06
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              The Chandigarh Sector 17 Proving Ground
            </h2>
            <p className="text-muted text-[0.95rem] leading-relaxed">
              We selected Sector 17 as our primary benchmark because Le Corbusier designed it with strict pedestrian plazas, high concrete colonnades, sunken fountains, and zero vehicular penetration into inner courtyards. If an optical spatial model can solve Sector 17, it can solve any commercial district on earth.
            </p>

            <div className="space-y-3">
              {SITE.proving.hypotheses.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 text-[0.70rem] font-bold">HYPOTHESIS 0{h.id}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h4 className="text-white text-[0.88rem] font-medium">{h.title}</h4>
                  <p className="text-muted text-[0.80rem] leading-relaxed">{h.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 07. CAPITAL & ROADMAP ── */}
          <section id="capital" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 07
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              Capital Allocation & Prototype Milestone
            </h2>
            <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-400/30 space-y-2">
              <div className="font-mono text-[0.70rem] text-cyan-300 font-bold uppercase tracking-wider">
                PROTOTYPE ROUND MILESTONE DELIVERABLE
              </div>
              <p className="text-white font-serif text-[1.15rem] leading-snug">
                {SITE.capital.milestoneBought}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[0.74rem]">
              {SITE.capital.allocation.map((a) => (
                <div key={a.area} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-cyan-400 text-[1.4rem] font-bold">{a.pct}</div>
                  <div className="text-white font-medium text-[0.80rem]">{a.area}</div>
                  <div className="text-muted text-[0.70rem] leading-tight pt-1 border-t border-white/5">{a.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => handleOpenContact("FUND_PROTOTYPE")}
                className="inline-flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-[0.88rem] font-mono py-3 px-6 rounded-full transition-all cursor-pointer shadow-[0_0_24px_rgba(0,200,232,0.4)]"
              >
                <span>Request Prototype Investment Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-[0.84rem] py-3 px-5 rounded-full transition-all border border-white/20"
              >
                <span>Return to 3D Experience</span>
              </Link>
            </div>
          </section>

          {/* ── 08. TECHNICAL FAQ ── */}
          <section id="faq" className="space-y-6 scroll-mt-24 pt-8 border-t border-white/10">
            <span className="font-mono text-[0.70rem] text-cyan-400 uppercase tracking-widest font-semibold block">
              SECTION 08
            </span>
            <h2 className="font-serif text-[2.0rem] font-medium text-white tracking-tight">
              Technical FAQ
            </h2>

            <div className="space-y-4 text-[0.90rem]">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-white font-medium">Why not just use Apple or Google Street View?</h4>
                <p className="text-muted leading-relaxed text-[0.85rem]">
                  Commercial street view services are 2D panoramic image spheres stitched along vehicular roadway lines. They stop on the 4-lane avenue and do not enter pedestrian arcades, courtyards, or interior escalators. Furthermore, they are closed ecosystems that do not output metric 3D geometric meshes or real-time ROS 2 APIs for robotics.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-white font-medium">How do you maintain metric scale without LiDAR?</h4>
                <p className="text-muted leading-relaxed text-[0.85rem]">
                  We fuse visual feature tracks from dual 180° fisheye cameras with commodity RTK-GNSS pucks and calibrated IMU baselines. Closed-loop pose graph optimization eliminates scale drift across 500m+ survey traverses.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-white font-medium">How is pedestrian privacy protected?</h4>
                <p className="text-muted leading-relaxed text-[0.85rem]">
                  All raw capture streams undergo on-device neural redaction before cloud transmission. Keyframes run through YOLOv8-pose and generative inpainting models, completely removing faces, license plates, and private identifiers prior to 3D Gaussian Splatting.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[0.74rem] text-muted">
        <div>
          <span>WorldRing Spatial Intelligence Platform</span>
          <span className="mx-2 text-white/20">·</span>
          <span>Technical Whitepaper v0.2</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-cyan-400 transition-colors">3D Experience</Link>
          <a href="#abstract" className="hover:text-white transition-colors">Top ↑</a>
          <button onClick={() => handleOpenContact("FUND_PROTOTYPE")} className="text-cyan-400 hover:underline cursor-pointer">
            Inquiries
          </button>
        </div>
      </footer>

      {/* Institutional Contact Inquiries Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialMode={contactMode}
      />
    </div>
  );
}
