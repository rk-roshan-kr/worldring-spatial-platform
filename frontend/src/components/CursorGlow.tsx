"use client";

import { useEffect, useRef } from "react";

/**
 * CursorGlow — a large, very faint accent-wash radial gradient that
 * follows the cursor with spring damping. Only rendered on pointer-fine
 * (mouse) devices; hidden via CSS on touch screens.
 *
 * Spring params: stiffness drives how closely it tracks, damping controls overshoot.
 */
export function CursorGlow() {
  const elRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -9999, y: -9999 });
  const cur = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const el = elRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const spring = 0.09; // 0 = no tracking, 1 = instant

    const tick = () => {
      if (!mounted.current) return;
      cur.current.x += (pos.current.x - cur.current.x) * spring;
      cur.current.y += (pos.current.y - cur.current.y) * spring;
      if (el) {
        el.style.left = `${cur.current.x}px`;
        el.style.top = `${cur.current.y}px`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      mounted.current = false;
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div id="cursor-glow" ref={elRef} aria-hidden="true" />;
}
