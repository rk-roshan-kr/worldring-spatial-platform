"use client";

import React, { useEffect, useState } from "react";
import { SITE } from "@/config/site";

// Real-world coordinates of Chandigarh Sector 17 corridor locations mapping
const GEOGRAPHIC_MAPPING: Record<string, { lat: string; lng: string; elev: string; label: string }> = {
  "#top": { lat: "30.7333", lng: "76.7794", elev: "321.4m", label: "Sector 17 Center" },
  "#gap": { lat: "30.7348", lng: "76.7806", elev: "320.8m", label: "Arterial Approach" },
  "#thesis": { lat: "30.7355", lng: "76.7818", elev: "322.1m", label: "Corridor Capture" },
  "#demo": { lat: "30.7369", lng: "76.7830", elev: "321.2m", label: "Sector 17 Market" },
  "#infrastructure": { lat: "30.7380", lng: "76.7842", elev: "320.5m", label: "Dynamic Paths" },
  "#data": { lat: "30.7392", lng: "76.7854", elev: "319.9m", label: "Data Wing Node" },
  "#proving": { lat: "30.7405", lng: "76.7868", elev: "321.7m", label: "Trial Bounding Box" },
  "#capital": { lat: "30.7418", lng: "76.7882", elev: "320.1m", label: "Benchmark Corridor" },
  "#founder": { lat: "30.7429", lng: "76.7895", elev: "322.6m", label: "Operations Hub" }
};

export function SpatialCoordsHUD() {
  const [coords, setCoords] = useState(GEOGRAPHIC_MAPPING["#top"]);
  const [drift, setDrift] = useState("0.00cm");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ids = SITE.nav.map((n) => n.href);
    const container = document.getElementById("snap-container");

    const handleScroll = () => {
      if (!container) return;

      let closestId = ids[0];
      let minDistance = Infinity;

      ids.forEach((href) => {
        const el = document.getElementById(href.slice(1));
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = href;
          }
        }
      });

      // Update coordinates based on scroll snap position
      const targetCoords = GEOGRAPHIC_MAPPING[closestId] || GEOGRAPHIC_MAPPING["#top"];
      setCoords(targetCoords);

      // Interpolate drift metrics dynamically based on scroll offset
      const currentScroll = container.scrollTop;
      const calculatedDrift = (Math.sin(currentScroll * 0.005) * 0.12).toFixed(2);
      setDrift(`${Math.abs(Number(calculatedDrift))}cm`);
    };

    const checkVisibility = () => {
      // Hide GPS HUD if screen height is too short for snapping (< 600px)
      setIsVisible(window.innerHeight >= 600 && window.innerWidth >= 1024);
    };

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("resize", checkVisibility);

    handleScroll();
    checkVisibility();

    return () => {
      container?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="hidden lg:flex fixed left-6 bottom-6 z-40 flex-col font-mono text-[0.62rem] uppercase tracking-wider text-muted bg-paper/90 border border-line px-3.5 py-3 rounded shadow-sm gap-1.5 select-none pointer-events-none">
      <div className="flex items-center justify-between gap-6 border-b border-line pb-1.5 mb-0.5">
        <span className="text-accent font-bold">WGS84 Reference</span>
        <span className="text-ink font-semibold">{coords.label}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-faint">Latitude</span>
        <span className="text-ink font-semibold">{coords.lat}° N</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-faint">Longitude</span>
        <span className="text-ink font-semibold">{coords.lng}° E</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-faint">Elevation</span>
        <span className="text-ink font-semibold">{coords.elev}</span>
      </div>
      <div className="flex justify-between gap-6 border-t border-line pt-1.5 mt-0.5">
        <span className="text-faint">VIO Drift Est.</span>
        <span className="text-accent font-bold">{drift}</span>
      </div>
    </div>
  );
}
