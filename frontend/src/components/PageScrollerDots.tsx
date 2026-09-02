"use client";

import React, { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { animateScrollTo } from "@/lib/ScrollEngine";

export function PageScrollerDots() {
  const [activeId, setActiveId] = useState("#top");
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

      setActiveId(closestId);
    };

    const checkVisibility = () => {
      // Hide dots elevator if screen height is too short for snapping (< 600px)
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

  const handleDotClick = (href: string) => {
    const target = document.getElementById(href.slice(1));
    const container = document.getElementById("snap-container");
    if (target && container) {
      const targetTop = target.offsetTop;
      animateScrollTo(container, targetTop, 1100);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-4 select-none pointer-events-auto">
      {SITE.nav.map((item) => {
        const isActive = activeId === item.href;
        return (
          <button
            key={item.href}
            onClick={() => handleDotClick(item.href)}
            className="group relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer focus:outline-none"
            aria-label={`Scroll to ${item.label}`}
          >
            {/* Tooltip Label */}
            <span className="absolute right-9 opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none font-mono text-[0.62rem] uppercase tracking-widest text-ink bg-paper border border-line px-2.5 py-1 rounded shadow-sm whitespace-nowrap">
              {item.num} · {item.label}
            </span>
            
            {/* Elevator Dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-accent scale-150 ring-4 ring-accent/20"
                  : "bg-muted group-hover:bg-accent-deep group-hover:scale-125"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
