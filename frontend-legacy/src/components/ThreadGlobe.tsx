"use client";

import { useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const N_MER    = 18;      // longitude lines
const N_PAR    = 9;       // latitude circles (excl. poles)
const SEG      = 80;      // points per thread
const ROT_SPD  = 0.0009;  // auto-rotation speed (rad/frame)
const TILT     = 0.40;    // axial tilt (~23°) — makes it feel like Earth
const INTRO_MS = 3000;    // unfurl duration (ms)
const MR       = 140;     // mouse repulsion radius (px)
const MF       = 190;     // mouse repulsion force
const K_HOME   = 0.052;   // spring stiffness toward home
const K_NEIGH  = 0.016;   // spring stiffness toward neighbours
const DAMP     = 0.82;    // velocity damping per frame
const INK      = "27,23,18"  as const;
const ACC      = "191,71,34" as const;

interface Pt {
  x: number; y: number;
  vx: number; vy: number;
  nx: number; ny: number; nz: number; // fixed unit-sphere normal
  rz: number;                           // cached depth (updated each frame)
  accent: boolean;
  isParallel: boolean;
}

export function ThreadGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, cx = 0, cy = 0, R = 0;
    let threads: Pt[][] = [];
    let rot = 0, t0 = 0;
    let mx = -9999, my = -9999;
    let rafId = 0;
    let live = true;

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    // ── Build sphere ──────────────────────────────────────────────────────────
    const build = () => {
      threads = [];

      for (let m = 0; m < N_MER; m++) {
        const lon    = (m / N_MER) * Math.PI * 2;
        const accent = m % 6 === 0;
        const pts: Pt[] = [];
        for (let s = 0; s < SEG; s++) {
          const lat = -Math.PI / 2 + (s / (SEG - 1)) * Math.PI;
          const cosL = Math.cos(lat);
          pts.push({
            x: cx + (Math.random() - 0.5) * 10,
            y: cy + (Math.random() - 0.5) * 10,
            vx: 0, vy: 0,
            nx: cosL * Math.cos(lon),
            ny: Math.sin(lat),
            nz: cosL * Math.sin(lon),
            rz: 0, accent, isParallel: false,
          });
        }
        threads.push(pts);
      }

      for (let p = 1; p < N_PAR; p++) {
        const lat    = -Math.PI / 2 + (p / N_PAR) * Math.PI;
        const cosL   = Math.cos(lat);
        const sinL   = Math.sin(lat);
        const accent = p === Math.floor(N_PAR / 2); // equator
        const pts: Pt[] = [];
        for (let s = 0; s < SEG; s++) {
          const lon = (s / SEG) * Math.PI * 2;
          pts.push({
            x: cx + (Math.random() - 0.5) * 10,
            y: cy + (Math.random() - 0.5) * 10,
            vx: 0, vy: 0,
            nx: cosL * Math.cos(lon),
            ny: sinL,
            nz: cosL * Math.sin(lon),
            rz: 0, accent, isParallel: true,
          });
        }
        threads.push(pts);
      }
    };

    // ── Resize / init ─────────────────────────────────────────────────────────
    const resize = () => {
      const rect = cv.getBoundingClientRect();
      W = rect.width; H = rect.height;
      if (W <= 0 || H <= 0) return;
      cv.width  = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      R  = Math.min(W, H) * 0.40;
      build();
      t0 = performance.now();
    };

    // ── Animation tick ────────────────────────────────────────────────────────
    const frame = (now: number) => {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);

      const ease = 1 - Math.pow(1 - Math.min((now - t0) / INTRO_MS, 1), 3);
      rot += ROT_SPD;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);

      for (const thread of threads) {
        const n = thread.length;

        // ── Physics ──────────────────────────────────────────────────────────
        for (let i = 0; i < n; i++) {
          const p = thread[i];

          // Y-axis rotation (auto-spin)
          const rx1 =  p.nx * cosR + p.nz * sinR;
          const ry1 =  p.ny;
          const rz1 = -p.nx * sinR + p.nz * cosR;

          // Fixed axial tilt (X-axis rotation)
          const rx = rx1;
          const ry = ry1 * cosT - rz1 * sinT;
          const rz = ry1 * sinT + rz1 * cosT;
          p.rz = rz;

          // Orthographic projection → home
          const hx = cx + rx * R;
          const hy = cy - ry * R;
          // Intro lerp: particles fly out from center
          const tx = cx + (hx - cx) * ease;
          const ty = cy + (hy - cy) * ease;

          // Spring toward home
          p.vx += (tx - p.x) * K_HOME;
          p.vy += (ty - p.y) * K_HOME;

          // Spring toward neighbours (thread cohesion)
          const pi = p.isParallel ? (i > 0 ? i - 1 : n - 1) : (i > 0 ? i - 1 : 0);
          const ni = p.isParallel ? (i < n - 1 ? i + 1 : 0) : (i < n - 1 ? i + 1 : n - 1);
          p.vx += (thread[pi].x - p.x) * K_NEIGH + (thread[ni].x - p.x) * K_NEIGH;
          p.vy += (thread[pi].y - p.y) * K_NEIGH + (thread[ni].y - p.y) * K_NEIGH;

          // Mouse repulsion
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < MR * MR && d2 > 0.5) {
            const d = Math.sqrt(d2);
            const f = (1 - d / MR) * MF * 0.013;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }

          p.vx *= DAMP; p.vy *= DAMP;
          p.x  += p.vx; p.y  += p.vy;
        }

        // ── Draw — single path per thread, avg depth for opacity ─────────────
        let sumRz = 0;
        for (const p of thread) sumRz += p.rz;
        const depth = (sumRz / n + 1) * 0.5; // [0, 1]

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const p = thread[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        if (thread[0].isParallel) ctx.closePath();

        if (thread[0].accent) {
          ctx.strokeStyle = `rgba(${ACC},${(0.18 + depth * 0.58).toFixed(3)})`;
          ctx.lineWidth   = 0.75 + depth * 0.35;
        } else {
          ctx.strokeStyle = `rgba(${INK},${(0.05 + depth * 0.24).toFixed(3)})`;
          ctx.lineWidth   = 0.5  + depth * 0.15;
        }
        ctx.stroke();
      }

      rafId = requestAnimationFrame(frame);
    };

    // ── Event handlers ────────────────────────────────────────────────────────
    const onMouseMove  = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const clearMouse   = () => { mx = -9999; my = -9999; };
    const onTouchMove  = (e: TouchEvent) => {
      const r = cv.getBoundingClientRect(), t = e.touches[0];
      mx = t.clientX - r.left; my = t.clientY - r.top;
    };

    cv.addEventListener("mousemove",  onMouseMove,  { passive: true });
    cv.addEventListener("mouseleave", clearMouse);
    cv.addEventListener("touchmove",  onTouchMove,  { passive: true });
    cv.addEventListener("touchend",   clearMouse);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      live = false;
      cancelAnimationFrame(rafId);
      cv.removeEventListener("mousemove",  onMouseMove);
      cv.removeEventListener("mouseleave", clearMouse);
      cv.removeEventListener("touchmove",  onTouchMove);
      cv.removeEventListener("touchend",   clearMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full ${className}`}
      style={{ cursor: "crosshair", touchAction: "none" }}
      aria-label="Interactive globe — threads form a sphere, move cursor to pull threads apart"
      role="img"
    />
  );
}
