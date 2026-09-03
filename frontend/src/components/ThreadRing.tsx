"use client";

import { useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const N_THREADS  = 200;      // total threads
const N_SEGS     = 6;        // particles per thread (incl. both endpoints)
const ARC_SPAN   = Math.PI / 7;    // arc each thread covers on the ring (~25.7°)
const RING_FRAC  = 0.38;     // ring radius as fraction of min(W, H)

// Physics
const K_EP       = 0.048;    // endpoint → home spring stiffness
const K_LINK     = 0.30;     // neighbour link stiffness (chain rigidity)
const DAMPING    = 0.82;     // velocity damping per frame

// Mouse
const MOUSE_R    = 115;      // repulsion radius (px)
const MOUSE_F    = 170;      // repulsion force scale

// Intro
const WAVE_TOTAL = 1800;     // ms — full wave duration (first → last thread launches)
const SETTLE_MS  = 1400;     // ms — time for thread to travel to ring after launch

// Breathing (post-settle)
const BREATH_AMP  = 2.2;     // px amplitude of the breathing offset
const BREATH_FREQ = 0.0008;  // breathing frequency (rad/ms)

// Design tokens
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pt { x: number; y: number; vx: number; vy: number; }

interface Thread {
  pts: Pt[];
  /** Home positions on the ring for each particle */
  hx: number[];
  hy: number[];
  /** Launch start position (outside canvas) */
  sx: number;
  sy: number;
  /** ms after t0 this thread launches */
  delay: number;
  /** Pre-randomised visual properties */
  lw: number;      // line width
  baseA: number;   // base alpha
  phaseOff: number; // breathing phase offset per thread
}

// ─── Component ───────────────────────────────────────────────────────────────
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
    let t0 = 0, mx = -9999, my = -9999;
    let live = true, rafId = 0;

    // ── Build threads ─────────────────────────────────────────────────────────
    const build = () => {
      threads = [];
      for (let i = 0; i < N_THREADS; i++) {
        // Angle where this thread's head sits on the ring
        const headAngle = (i / N_THREADS) * Math.PI * 2;
        const tailAngle = headAngle + ARC_SPAN;

        // Home positions evenly spaced along the arc
        const hx: number[] = [];
        const hy: number[] = [];
        for (let s = 0; s < N_SEGS; s++) {
          const t = s / (N_SEGS - 1);
          const a = headAngle + (tailAngle - headAngle) * t;
          hx.push(cx + R * Math.cos(a));
          hy.push(cy + R * Math.sin(a));
        }

        // Launch position: a random point outside the canvas boundary
        // Distribute launch origins radially so they come from all edges
        const launchAngle = Math.random() * Math.PI * 2;
        const launchDist  = Math.max(W, H) * (0.65 + Math.random() * 0.35);
        const sx = cx + Math.cos(launchAngle) * launchDist;
        const sy = cy + Math.sin(launchAngle) * launchDist;

        // Initialise all particles at the launch point (straight line)
        const pts: Pt[] = [];
        for (let s = 0; s < N_SEGS; s++) {
          pts.push({ x: sx, y: sy, vx: 0, vy: 0 });
        }

        // Staggered delay — wraps around the ring progressively
        const delay = (i / N_THREADS) * WAVE_TOTAL;

        threads.push({
          pts, hx, hy, sx, sy, delay,
          lw:     0.6 + Math.random() * 0.8,
          baseA:  0.45 + Math.random() * 0.40,
          phaseOff: Math.random() * Math.PI * 2,
        });
      }
      t0 = performance.now();
    };

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      const rect = cv.getBoundingClientRect();
      W = rect.width; H = rect.height;
      if (W <= 0 || H <= 0) return;
      cv.width  = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      R  = Math.min(W, H) * RING_FRAC;
      build();
    };

    // ── Frame ─────────────────────────────────────────────────────────────────
    const frame = (now: number) => {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);

      const elapsed = now - t0;

      for (const th of threads) {
        const launched = elapsed - th.delay;

        // Thread hasn't launched yet — keep all particles at start position
        if (launched < 0) continue;

        const N = th.pts.length;
        // Settle progress: 0 (just launched) → 1 (fully on ring)
        const settleRaw = Math.min(launched / SETTLE_MS, 1);
        const settle    = 1 - Math.pow(1 - settleRaw, 3); // ease-out cubic

        // Breathing offset (active only after fully settled)
        const breathProgress = Math.max(0, settleRaw - 0.95) * 20; // 0→1 fade-in
        const breath = BREATH_AMP * breathProgress *
          Math.sin(now * BREATH_FREQ + th.phaseOff);

        // ── Physics update ──────────────────────────────────────────────────
        for (let s = 0; s < N; s++) {
          const p = th.pts[s];

          const isEndpoint = s === 0 || s === N - 1;

          // Endpoints: spring toward home (lerped by settle progress)
          if (isEndpoint) {
            // Apply radial breathing offset
            const homeAngle = Math.atan2(th.hy[s] - cy, th.hx[s] - cx);
            const bx = Math.cos(homeAngle) * breath;
            const by = Math.sin(homeAngle) * breath;

            const tx = cx + (th.hx[s] - cx) * settle + bx;
            const ty = cy + (th.hy[s] - cy) * settle + by;
            p.vx += (tx - p.x) * K_EP;
            p.vy += (ty - p.y) * K_EP;
          }

          // All particles: link springs to neighbours (chain rigidity)
          if (s > 0) {
            const q = th.pts[s - 1];
            p.vx += (q.x - p.x) * K_LINK;
            p.vy += (q.y - p.y) * K_LINK;
          }
          if (s < N - 1) {
            const q = th.pts[s + 1];
            p.vx += (q.x - p.x) * K_LINK;
            p.vy += (q.y - p.y) * K_LINK;
          }

          // Mouse repulsion
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_R * MOUSE_R && d2 > 0.5) {
            const d = Math.sqrt(d2);
            const f = (1 - d / MOUSE_R) * MOUSE_F * 0.013;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }

          p.vx *= DAMPING;
          p.vy *= DAMPING;
          p.x  += p.vx;
          p.y  += p.vy;
        }

        // ── Draw as smooth bezier curve through particles ───────────────────
        const alpha = th.baseA * Math.min(settle * 1.4, 1);
        ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${alpha.toFixed(3)})`;
        ctx.lineWidth   = th.lw;
        ctx.lineCap     = "round";

        ctx.beginPath();
        ctx.moveTo(th.pts[0].x, th.pts[0].y);

        // Smooth quadratic bezier through intermediate points
        for (let s = 1; s < N - 1; s++) {
          const mx_ = (th.pts[s].x + th.pts[s + 1].x) / 2;
          const my_ = (th.pts[s].y + th.pts[s + 1].y) / 2;
          ctx.quadraticCurveTo(th.pts[s].x, th.pts[s].y, mx_, my_);
        }
        ctx.lineTo(th.pts[N - 1].x, th.pts[N - 1].y);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(frame);
    };

    // ── Events ────────────────────────────────────────────────────────────────
    const onMM  = (e: MouseEvent)  => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const offM  = ()               => { mx = -9999; my = -9999; };
    const onTM  = (e: TouchEvent) => { const r = cv.getBoundingClientRect(), t = e.touches[0]; mx = t.clientX - r.left; my = t.clientY - r.top; };

    cv.addEventListener("mousemove",  onMM,  { passive: true });
    cv.addEventListener("mouseleave", offM);
    cv.addEventListener("touchmove",  onTM,  { passive: true });
    cv.addEventListener("touchend",   offM);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      live = false;
      cancelAnimationFrame(rafId);
      cv.removeEventListener("mousemove",  onMM);
      cv.removeEventListener("mouseleave", offM);
      cv.removeEventListener("touchmove",  onTM);
      cv.removeEventListener("touchend",   offM);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      className={`block w-full h-full ${className}`}
      style={{ cursor: "crosshair", touchAction: "none" }}
      aria-label="Threads forming a circle"
      role="img"
    />
  );
}
