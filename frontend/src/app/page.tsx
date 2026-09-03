"use client";

import React, { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { GapSection } from "@/components/GapSection";
import { PipelineSection } from "@/components/PipelineSection";
import { DirectionsSection } from "@/components/DirectionsSection";
import { DataWingSection } from "@/components/DataWingSection";
import { DemoSection } from "@/components/DemoSection";
import { StatusSection } from "@/components/StatusSection";
import { RoadmapSection } from "@/components/RoadmapSection";
import { FounderSection } from "@/components/FounderSection";
import { CtaBand, SiteFooter } from "@/components/CtaBand";
import { ContactModal } from "@/components/ui/ContactModal";
import { KeyboardScrollHandler } from "@/components/KeyboardScrollHandler";
import { PageScrollerDots } from "@/components/PageScrollerDots";
import { CursorGlow } from "@/components/CursorGlow";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState("FUND_PROTOTYPE");

  const handleOpenContact = (mode: string = "FUND_PROTOTYPE") => {
    setContactMode(mode);
    setIsContactOpen(true);
  };

  return (
    <>
      <CursorGlow />
      <SiteNav onOpenContact={() => handleOpenContact("FUND_PROTOTYPE")} />
      
      <main
        id="snap-container"
        className="w-full flex-1 flex flex-col lg:h-screen lg:overflow-y-auto lg:snap-y lg:snap-mandatory scroll-smooth scrollbar-none snap-y select-none relative overflow-x-hidden"
      >
        <KeyboardScrollHandler />
        <PageScrollerDots />

        {/* 01 — The World & 30-Second Vision Breakdown */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <Hero onOpenContact={handleOpenContact} />
        </div>

        {/* 02 — The Gap (Address vs Visual Reality) */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <GapSection />
        </div>

        {/* 03 — The Thesis & Pipeline Architecture */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <PipelineSection />
        </div>

        {/* 04 — The Wow Moment & Field Experiment (Continuous Take Demo) */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <DemoSection />
        </div>

        {/* 05 — Infrastructure (Dual Extraction Streams) */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <DirectionsSection />
        </div>

        {/* 06 — Data Wing (Physical AI Infrastructure) */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <DataWingSection />
        </div>

        {/* 07 — What We Are Proving (Core Hypotheses & Chandigarh Sector Trial) */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <StatusSection />
        </div>

        {/* 08 — Capital Ask & Milestone Allocation */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <RoadmapSection onOpenContact={handleOpenContact} />
        </div>

        {/* 09 — Founder Story & Thesis Purpose */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <FounderSection />
        </div>

        {/* 10 — The Final Screen & Investor Actions */}
        <div className="section-snap-wrap w-full shrink-0 relative border-b border-line pt-24 lg:pt-28 pb-8 lg:pb-12">
          <CtaBand onOpenContact={handleOpenContact} />
        </div>

        {/* 11 — Footer */}
        <div className="section-snap-wrap w-full shrink-0 relative border-t border-line py-12 lg:py-16">
          <SiteFooter />
        </div>
      </main>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialMode={contactMode}
      />
    </>
  );
}
