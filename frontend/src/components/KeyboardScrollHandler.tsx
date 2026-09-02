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

    // Observe all section snap wrappers to toggle .is-in class for animation triggers
    const sections = Array.from(document.getElementsByClassName("section-snap-wrap"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, {
      root: snapContainer,
      threshold: 0.15 // trigger when 15% visible
    });

    sections.forEach((sec) => io.observe(sec));

    let isScrolling = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept key inputs inside forms or focusable inputs
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (!snapContainer || isScrolling) return;

      // Snapping conditions check
      if (window.innerWidth < 1024 || window.innerHeight < 600) return;

      // Query all direct child section wrappers that participate in snapping
      const snapSections = Array.from(
        snapContainer.getElementsByClassName("section-snap-wrap")
      ) as HTMLElement[];
      if (snapSections.length === 0) return;

      const currentScroll = snapContainer.scrollTop;

      // Find the index of the section closest to the current scroll offset
      let closestIndex = 0;
      let minDistance = Infinity;
      snapSections.forEach((sec, idx) => {
        const dist = Math.abs(sec.offsetTop - currentScroll);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = idx;
        }
      });

      let targetIndex = closestIndex;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          targetIndex = Math.min(snapSections.length - 1, closestIndex + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          targetIndex = Math.max(0, closestIndex - 1);
          break;
        case " ": // Spacebar
          e.preventDefault();
          if (e.shiftKey) {
            targetIndex = Math.max(0, closestIndex - 1);
          } else {
            targetIndex = Math.min(snapSections.length - 1, closestIndex + 1);
          }
          break;
        case "Home":
          e.preventDefault();
          targetIndex = 0;
          break;
        case "End":
          e.preventDefault();
          targetIndex = snapSections.length - 1;
          break;
        default:
          return; // Allow browser defaults for other key actions
      }

      const targetSection = snapSections[targetIndex];
      if (targetSection && targetIndex !== closestIndex) {
        isScrolling = true;
        animateScrollTo(snapContainer, targetSection.offsetTop, 1100, () => {
          setTimeout(() => {
            isScrolling = false;
          }, 150);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      io.disconnect();
    };
  }, []);

  return null;
}
