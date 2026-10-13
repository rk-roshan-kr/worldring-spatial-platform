"use client";

import React, { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { animateScrollTo } from "@/lib/ScrollEngine";
import { motion } from "motion/react";

export function PageScrollerDots() {
  const [activeId, setActiveId] = useState("#top");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ids = SITE.nav.map((n) => n.href);

    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveId(ids[0]);
        return;
      }

      let closestId = ids[0];
      let minDistance = Infinity;

      ids.forEach((href) => {
        const el = document.getElementById(href.slice(1));
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top - 120);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = href;
          }
        }
      });

      setActiveId(closestId);
    };

    const checkVisibility = () => {
      setIsVisible(window.innerHeight >= 550 && window.innerWidth >= 1024);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkVisibility);
    
    handleScroll();
    checkVisibility();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  const handleDotClick = (href: string) => {
    const target = document.getElementById(href.slice(1));
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 select-none pointer-events-auto p-2 rounded-full bg-paper/60 backdrop-blur-xs border border-line/40 shadow-xs">
      {SITE.nav.map((item) => {
        const isActive = activeId === item.href;
        return (
          <button
            key={item.href}
            onClick={() => handleDotClick(item.href)}
            className="group relative flex items-center justify-center w-7 h-7 rounded-full cursor-pointer focus:outline-none"
            aria-label={`Scroll to ${item.label}`}
          >
            {/* Tooltip Label */}
            <span className="absolute right-9 opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none font-mono text-[0.62rem] uppercase tracking-widest text-ink bg-paper border border-line px-2.5 py-1 rounded shadow-sm whitespace-nowrap">
              {item.num} · {item.label}
            </span>
            
            {/* Active outer ring with layoutId */}
            {isActive && (
              <motion.div
                layoutId="activeDotRing"
                className="absolute inset-0.5 rounded-full border border-accent/40 bg-accent/10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            {/* Elevator Dot */}
            <motion.span
              animate={{
                scale: isActive ? 1.4 : 1,
                backgroundColor: isActive ? "var(--accent)" : "var(--muted)",
              }}
              whileHover={{ scale: 1.3 }}
              transition={{ duration: 0.2 }}
              className="w-1.5 h-1.5 rounded-full relative z-10"
            />
          </button>
        );
      })}
    </div>
  );
}

