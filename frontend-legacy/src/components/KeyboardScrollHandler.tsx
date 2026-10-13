"use client";

import { useEffect } from "react";
import { animateScrollTo } from "@/lib/ScrollEngine";

export function KeyboardScrollHandler() {
  useEffect(() => {
    const snapContainer = document.getElementById("snap-container");
    if (snapContainer) {
      if (!snapContainer.hasAttribute("tabindex")) {
        snapContainer.setAttribute("tabindex", "0");
      }
      snapContainer.style.outline = "none";
      snapContainer.focus();
    }

    // Observe all section wrappers to toggle .is-in class for animation triggers
    const sections = Array.from(document.getElementsByClassName("section-snap-wrap"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });

    sections.forEach((sec) => io.observe(sec));

    return () => {
      io.disconnect();
    };
  }, []);

  return null;
}
