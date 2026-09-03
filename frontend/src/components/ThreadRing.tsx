"use client";

import { useEffect, useRef } from "react";

// ─── Design Tokens & Physics Config ──────────────────────────────────────────
const N_THREADS   = 220;       // number of overlapping threads forming the ring
const N_SEGS      = 7;         // points per thread for smooth bezier curves
const ARC_SPAN    = Math.PI / 5; // angle span of each thread segment (~36°)
const RING_FRAC   = 0.36;      // radius as fraction of min(W, H)

// Physics
const K_HOME      = 0.08;      // spring force pulling each particle to its ring home
const K_LINK      = 0.25;      // spring force linking adjacent points in a thread
const DAMPING     = 0.80;      // velocity damping per frame

// Mouse Interaction
const MOUSE_R     = 100;       // mouse repulsion radius (px)
const MOUSE_F     = 160;       // mouse repulsion force

// Intro Animation
const INTRO_MS    = 1800;      // total intro animation duration (ms)
const STAGGER_MS  = 1000;      // wave stagger spread across threads (ms)

// Color: Terracotta Red matching favicon (#bf4722)
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // Target home X on ring
  hy: number; // Target home Y on ring
  sx: number; // Start X for intro fly-in
  sy: number; // Start Y for intro fly-in
}

interface Thread {
  pts: Pt[];
  delay: number;
  lw: number;
  alpha: number;
  phase: number;
}

export function ThreadRing({ className = "" }: { className?: string }) {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, cx = 0, cy = 0, R = 0;
    let threads: Thread[] = [];
    let t0 = 0;
    let mx = -9999, my = -9999;
    let live = true;
    let rafId = 0;

    const build = () => {
      threads = [];

      for (let i = 0; i < N_THREADS; i++) {
        const baseAngle = (i / N_THREADS) * Math.PI * 2;
        // Radial texture offset: slight variation in radius per thread for fibrous look
        const rOffset = (Math.random() - 0.5) * 16;
        const threadRadius = R + rOffset;

        // Launch direction for intro fly-in (radial line shooting into ring position)
        const flyAngle = baseAngle + (Math.random() - 0.5) * 0.4;
        const flyDist = Math.max(W, H) * (0.6 + Math.random() * 0.4);

        const pts: Pt[] = [];
        for (let s = 0; s < N_SEGS; s++) {
          const t = s / (N_SEGS - 1);
          const angle = baseAngle + (t - 0.5) * ARC_SPAN;

          // Home position on the ring
          const hx = cx + threadRadius * Math.cos(angle);
          const hy = cy + threadRadius * Math.sin(angle);

          // Start position outside canvas for intro stretch-in
          const sx = cx + Math.cos(flyAngle) * flyDist + (t - 0.5) * 120 * Math.cos(flyAngle + Math.PI / 2);
          const sy = cy + Math.sin(flyAngle) * flyDist + (t - 0.5) * 120 * Math.sin(flyAngle + Math.PI / 2);

          pts.push({
            x: sx,
            y: sy,
            vx: 0,
            vy: 0,
            hx,
            hy,
            sx,
            sy,
          });
        }

        // Staggered delay around the circle
        const delay = (i / N_THREADS) * STAGGER_MS;

        threads.push({
          pts,
          delay,
          lw: 0.6 + Math.random() * 1.0,
          alpha: 0.35 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
        });
      }

      t0 = performance.now();
    };

    const resize = () => {
      const rect = cv.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W <= 0 || H <= 0) return;

      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = W / 2;
      cy = H / 2;
      R = Math.min(W, H) * RING_FRAC;

      build();
    };

    const frame = (now: number) => {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);

      const elapsed = now - t0;

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        const localTime = elapsed - th.delay;
        if (localTime < 0) continue; // Not launched yet

        // Intro progress (0 -> 1) with cubic ease-out
        const rawProgress = Math.min(localTime / INTRO_MS, 1);
        const easeIntro = 1 - Math.pow(1 - rawProgress, 3);

        // Breathing offset (subtle living motion after intro)
        const breath = Math.sin(now * 0.001 + th.phase) * 1.8 * easeIntro;

        const N = th.pts.length;

        // Update physics for each point in thread
        for (let s = 0; s < N; s++) {
          const p = th.pts[s];

          // Compute target home position with breathing
          const angle = Math.atan2(p.hy - cy, p.hx - cx);
          const targetX = p.hx + Math.cos(angle) * breath;
          const targetY = p.hy + Math.sin(angle) * breath;

          // Current intro target lerps from start position to home target
          const currentTargetX = p.sx + (targetX - p.sx) * easeIntro;
          const currentTargetY = p.sy + (targetY - p.sy) * easeIntro;

          // 1. Spring toward current target
          p.vx += (currentTargetX - p.x) * K_HOME;
          p.vy += (currentTargetY - p.y) * K_HOME;

          // 2. Neighbor link springs for thread continuity
          if (s > 0) {
            const prev = th.pts[s - 1];
            p.vx += (prev.x - p.x) * K_LINK;
            p.vy += (prev.y - p.y) * K_LINK;
          }
          if (s < N - 1) {
            const next = th.pts[s + 1];
            p.vx += (next.x - p.x) * K_LINK;
            p.vy += (next.y - p.y) * K_LINK;
          }

          // 3. Mouse repulsion (parting threads)
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;

          if (distSq < MOUSE_R * MOUSE_R && distSq > 0.5) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / MOUSE_R) * MOUSE_F * 0.02;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }

          // Apply damping & integration
          p.vx *= DAMPING;
          p.vy *= DAMPING;
          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw thread as smooth bezier curve
        const opacity = th.alpha * Math.min(rawProgress * 1.5, 1);
        ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${opacity.toFixed(3)})`;
        ctx.lineWidth = th.lw;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(th.pts[0].x, th.pts[0].y);

        for (let s = 1; s < N - 1; s++) {
          const midX = (th.pts[s].x + th.pts[s + 1].x) / 2;
          const midY = (th.pts[s].y + th.pts[s + 1].y) / 2;
          ctx.quadraticCurveTo(th.pts[s].x, th.pts[s].y, midX, midY);
        }
        ctx.lineTo(th.pts[N - 1].x, th.pts[N - 1].y);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(frame);
    };

    const onMM = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const offM = () => {
      mx = -9999;
      my = -9999;
    };
    const onTM = (e: TouchEvent) => {
      const r = cv.getBoundingClientRect();
      const t = e.touches[0];
      mx = t.clientX - r.left;
      my = t.clientY - r.top;
    };

    cv.addEventListener("mousemove", onMM, { passive: true });
    cv.addEventListener("mouseleave", offM);
    cv.addEventListener("touchmove", onTM, { passive: true });
    cv.addEventListener("touchend", offM);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      live = false;
      cancelAnimationFrame(rafId);
      cv.removeEventListener("mousemove", onMM);
      cv.removeEventListener("mouseleave", offM);
      cv.removeEventListener("touchmove", onTM);
      cv.removeEventListener("touchend", offM);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      className={`block w-full h-full ${className}`}
      style={{ cursor: "crosshair", touchAction: "none" }}
      aria-label="Interactive red textured thread circle matching logo"
      role="img"
    />
  );
}
