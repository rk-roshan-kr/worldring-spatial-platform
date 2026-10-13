"use client";

import React, { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    let targetX = -100, targetY = -100;
    let currentX = -100, currentY = -100;
    let raf = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const update = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      if (el) {
        el.style.transform = `translate3d(${currentX - 160}px, ${currentY - 160}px, 0)`;
      }
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none z-30 opacity-40 mix-blend-screen transition-opacity duration-500"
      style={{
        background: "radial-gradient(circle, rgba(0,200,232,0.12) 0%, rgba(0,128,255,0.04) 45%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
