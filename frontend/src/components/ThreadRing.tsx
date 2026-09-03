"use client";

import { useEffect, useRef } from "react";

// ─── Design Tokens & Physics Config ──────────────────────────────────────────
const N_THREADS   = 100;       // number of super long threads forming the ring
const N_SEGS      = 36;        // 36 control particles per thread
const ARC_SPAN    = Math.PI * 3.8; // super long threads wrapping 684°
const RING_FRAC   = 0.36;      // radius as fraction of min(W, H)

// Physics Constants
const K_HOME      = 0.09;      // spring force pulling particles back to ring home
const K_LINK      = 0.42;      // strong link spring along the super long fiber
const DAMPING     = 0.75;      // velocity damping per frame

// Drag & Hook Physics
const HOOK_RADIUS = 55;        // radius to snag/hook threads with cursor (px)
const MAX_HOOKS   = 16;        // max threads hooked simultaneously

// Color: Terracotta Red matching favicon (#bf4722)
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // Target home X on ring
  hy: number; // Target home Y on ring
  sx: number; // Non-radial start X (parallel lines)
  sy: number; // Non-radial start Y (parallel lines)
}

interface Thread {
  pts: Pt[];
  delay: number;
  lw: number;
  alpha: number;
  phase: number;
  isHooked: boolean;
  hookPtIdx: number;
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
    let isPointerDown = false;
    let live = true;
    let rafId = 0;

    const build = () => {
      threads = [];

      for (let i = 0; i < N_THREADS; i++) {
        const baseAngle = (i / N_THREADS) * Math.PI * 2;
        const rOffset = (Math.random() - 0.5) * 18;
        const threadRadius = R + rOffset;

        // NON-RADIAL START: Long straight parallel lines spanning horizontally across the canvas
        // Each thread starts as a straight line at Y position distributed vertically
        const startY = cy + (i / N_THREADS - 0.5) * H * 1.4;

        const pts: Pt[] = [];
        for (let s = 0; s < N_SEGS; s++) {
          const t = s / (N_SEGS - 1);
          const angle = baseAngle + (t - 0.5) * ARC_SPAN;

          // Target home position on the ring
          const hx = cx + threadRadius * Math.cos(angle);
          const hy = cy + threadRadius * Math.sin(angle);

          // Non-radial start position: straight horizontal line passing across canvas
          const sx = cx + (t - 0.5) * W * 1.6;
          const sy = startY + (Math.random() - 0.5) * 10;

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

        threads.push({
          pts,
          delay: (i / N_THREADS) * 800,
          lw: 0.5 + Math.random() * 1.1,
          alpha: 0.35 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(N_SEGS / 2),
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

    const updateHooks = () => {
      if (mx < -500 || my < -500) {
        for (const th of threads) th.isHooked = false;
        return;
      }

      let activeHookCount = 0;
      for (const th of threads) {
        if (th.isHooked) activeHookCount++;
      }

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];

        let minDist = Infinity;
        let nearestPtIdx = Math.floor(N_SEGS / 2);

        for (let s = 0; s < N_SEGS; s++) {
          const dx = th.pts[s].x - mx;
          const dy = th.pts[s].y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearestPtIdx = s;
          }
        }

        if ((isPointerDown && minDist < HOOK_RADIUS * 1.6) || minDist < HOOK_RADIUS) {
          if (!th.isHooked && activeHookCount < MAX_HOOKS) {
            th.isHooked = true;
            th.hookPtIdx = nearestPtIdx;
            activeHookCount++;
          }
        } else if (!isPointerDown && minDist > HOOK_RADIUS * 2.8) {
          th.isHooked = false;
        }
      }
    };

    const frame = (now: number) => {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);

      const elapsed = now - t0;
      updateHooks();

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        const localTime = elapsed - th.delay;
        if (localTime < 0) continue;

        const rawProgress = Math.min(localTime / 1400, 1);
        const easeIntro = 1 - Math.pow(1 - rawProgress, 3);

        const breath = Math.sin(now * 0.001 + th.phase) * 1.5 * easeIntro;
        const N = th.pts.length;

        for (let s = 0; s < N; s++) {
          const p = th.pts[s];

          if (th.isHooked && s === th.hookPtIdx && mx > -500) {
            p.x = mx;
            p.y = my;
            p.vx = 0;
            p.vy = 0;
          } else {
            const angle = Math.atan2(p.hy - cy, p.hx - cx);
            const targetX = p.hx + Math.cos(angle) * breath;
            const targetY = p.hy + Math.sin(angle) * breath;

            // Lerp target from parallel start line to ring target
            const currentTargetX = p.sx + (targetX - p.sx) * easeIntro;
            const currentTargetY = p.sy + (targetY - p.sy) * easeIntro;

            p.vx += (currentTargetX - p.x) * K_HOME;
            p.vy += (currentTargetY - p.y) * K_HOME;

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

            p.vx *= DAMPING;
            p.vy *= DAMPING;
            p.x += p.vx;
            p.y += p.vy;
          }
        }

        const opacity = th.alpha * Math.min(rawProgress * 1.5, 1);
        ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${opacity.toFixed(3)})`;
        ctx.lineWidth = th.isHooked ? th.lw * 1.5 : th.lw;
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

    const updateMousePos = (clientX: number, clientY: number) => {
      const r = cv.getBoundingClientRect();
      mx = clientY !== undefined ? clientX - r.left : -9999;
      my = clientY !== undefined ? clientY - r.top : -9999;
    };

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      updateMousePos(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      updateMousePos(e.clientX, e.clientY);
    };
    const onPointerUp = () => {
      isPointerDown = false;
      for (const th of threads) th.isHooked = false;
    };
    const onPointerLeave = () => {
      isPointerDown = false;
      mx = -9999;
      my = -9999;
      for (const th of threads) th.isHooked = false;
    };

    cv.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    cv.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      live = false;
      cancelAnimationFrame(rafId);
      cv.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      cv.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      className={`block w-full h-full ${className}`}
      style={{ cursor: "grab", touchAction: "none" }}
      aria-label="Interactive red thread circle formed from non-radial parallel threads"
      role="img"
    />
  );
}
