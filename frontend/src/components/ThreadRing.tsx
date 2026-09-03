"use client";

import { useEffect, useRef } from "react";

// ─── Design Tokens & Config ───────────────────────────────────────────────────
const N_LAT       = 7;          // latitude rings
const N_LON       = 12;         // longitude meridians
const N_SEGS      = 24;         // particles per grid thread
const RING_FRAC   = 0.36;       // Earth radius fraction of min(W, H)
const ROT_SPEED   = 0.0006;     // gentle auto-rotation speed (rad/frame)
const TILT        = 0.40;       // axial tilt (~23°)

// Physics Constants
const K_HOME      = 0.07;       // home spring force
const K_LINK      = 0.20;       // neighbor link spring force
const DAMPING     = 0.82;       // smooth damping
const MAX_SPEED   = 12;         // hard speed cap (px/frame)

// Drag, Grab & Break Thresholds
const HOOK_RADIUS = 45;         // grab radius around cursor (px)
const MAX_HOOKS   = 18;         // max threads grabbed simultaneously
const BREAK_DIST  = 165;        // max stretch distance (px) before thread snaps & breaks!
const REPAIR_MS   = 1200;       // ms for snapped thread to recoil and re-knit back into Earth

// Color: Terracotta Red matching favicon (#bf4722)
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

// ─── Simplified Earth Continent Path Outlines (Lat/Lon in Radians) ───────────
const CONTINENTS: Array<Array<[number, number]>> = [
  // North America
  [
    [1.1, -2.5], [1.2, -2.0], [1.0, -1.5], [0.8, -1.2], [0.5, -1.3],
    [0.4, -1.6], [0.3, -1.8], [0.5, -2.1], [0.8, -2.4], [1.1, -2.5]
  ],
  // South America
  [
    [0.2, -1.4], [0.0, -0.9], [-0.3, -0.7], [-0.6, -1.0], [-0.9, -1.2],
    [-0.8, -1.3], [-0.4, -1.3], [0.0, -1.4], [0.2, -1.4]
  ],
  // Europe & Africa
  [
    [1.1, 0.2], [1.0, 0.5], [0.7, 0.6], [0.6, 0.4], [0.6, 0.1], [0.7, -0.1], [0.9, -0.1], [1.1, 0.2]
  ],
  [
    [0.6, -0.3], [0.6, 0.8], [0.2, 0.8], [-0.3, 0.7], [-0.6, 0.4],
    [-0.6, 0.3], [0.0, 0.2], [0.2, -0.3], [0.6, -0.3]
  ],
  // Eurasia & India
  [
    [1.2, 0.6], [1.1, 1.5], [0.9, 2.3], [0.7, 2.2], [0.4, 2.0],
    [0.4, 1.8], [0.7, 1.4], [0.9, 0.9], [1.2, 0.6]
  ],
  [
    [0.5, 1.2], [0.4, 1.4], [0.1, 1.3], [0.3, 1.1], [0.5, 1.2]
  ],
  // Australia
  [
    [-0.3, 2.0], [-0.2, 2.6], [-0.6, 2.6], [-0.6, 2.0], [-0.3, 2.0]
  ]
];

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lat: number; // Fixed latitude on Earth sphere
  lon: number; // Fixed longitude on Earth sphere
  hx: number;  // Computed 2D home X on canvas
  hy: number;  // Computed 2D home Y on canvas
  depth: number; // Computed 3D Z depth
}

interface Thread {
  pts: Pt[];
  lw: number;
  alpha: number;
  isHooked: boolean;
  hookPtIdx: number;
  isBroken: boolean;
  breakTime: number;
  isContinent: boolean;
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
    let rotY = 0;
    let mx = -9999, my = -9999;
    let isPointerDown = false;
    let live = true;
    let rafId = 0;

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    const build = () => {
      threads = [];

      // 1. Latitude Threads (Rings parallel to Equator)
      for (let p = 1; p < N_LAT; p++) {
        const lat = -Math.PI / 2 + (p / N_LAT) * Math.PI;
        const pts: Pt[] = [];

        for (let s = 0; s < N_SEGS; s++) {
          const lon = (s / (N_SEGS - 1)) * Math.PI * 2;
          pts.push({
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            lat,
            lon,
            hx: cx,
            hy: cy,
            depth: 0,
          });
        }

        const isEquator = p === Math.floor(N_LAT / 2);
        threads.push({
          pts,
          lw: isEquator ? 1.2 : 0.7,
          alpha: isEquator ? 0.75 : 0.45,
          isHooked: false,
          hookPtIdx: Math.floor(N_SEGS / 2),
          isBroken: false,
          breakTime: 0,
          isContinent: false,
        });
      }

      // 2. Longitude Threads (Meridians Pole to Pole)
      for (let m = 0; m < N_LON; m++) {
        const lon = (m / N_LON) * Math.PI * 2;
        const pts: Pt[] = [];

        for (let s = 0; s < N_SEGS; s++) {
          const lat = -Math.PI / 2 + (s / (N_SEGS - 1)) * Math.PI;
          pts.push({
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            lat,
            lon,
            hx: cx,
            hy: cy,
            depth: 0,
          });
        }

        const isPrime = m % 6 === 0;
        threads.push({
          pts,
          lw: isPrime ? 1.1 : 0.65,
          alpha: isPrime ? 0.70 : 0.40,
          isHooked: false,
          hookPtIdx: Math.floor(N_SEGS / 2),
          isBroken: false,
          breakTime: 0,
          isContinent: false,
        });
      }

      // 3. Continent Landmass Threads
      for (const poly of CONTINENTS) {
        const pts: Pt[] = [];
        const nPoly = poly.length;

        for (let s = 0; s < nPoly; s++) {
          const [lat, lon] = poly[s];
          pts.push({
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            lat,
            lon,
            hx: cx,
            hy: cy,
            depth: 0,
          });
        }

        threads.push({
          pts,
          lw: 1.3,
          alpha: 0.85,
          isHooked: false,
          hookPtIdx: Math.floor(nPoly / 2),
          isBroken: false,
          breakTime: 0,
          isContinent: true,
        });
      }
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

    // Update 3D sphere positions & projection to 2D home points
    const updateEarthPositions = () => {
      rotY += ROT_SPEED;
      const cosR = Math.cos(rotY);
      const sinR = Math.sin(rotY);

      for (const th of threads) {
        for (const p of th.pts) {
          // 1. Unit sphere normal from lat/lon
          const cosL = Math.cos(p.lat);
          const sinL = Math.sin(p.lat);
          const nx = cosL * Math.cos(p.lon);
          const ny = sinL;
          const nz = cosL * Math.sin(p.lon);

          // 2. Rotate Y (Earth spin)
          const rx1 = nx * cosR + nz * sinR;
          const ry1 = ny;
          const rz1 = -nx * sinR + nz * cosR;

          // 3. Apply axial tilt (X rotation)
          const rx = rx1;
          const ry = ry1 * cosT - rz1 * sinT;
          const rz = ry1 * sinT + rz1 * cosT;

          p.depth = rz; // Cache depth [-1, 1]

          // 4. Orthographic projection to 2D Home Position
          p.hx = cx + rx * R;
          p.hy = cy - ry * R;

          // On first frame or reset, initialize (x,y) at home position
          if (p.x === 0 && p.y === 0) {
            p.x = p.hx;
            p.y = p.hy;
          }
        }
      }
    };

    // Update thread grab state (only when pointer down)
    const updateHooks = (now: number) => {
      if (!isPointerDown || mx < -500 || my < -500) {
        for (const th of threads) th.isHooked = false;
        return;
      }

      let activeHookCount = 0;
      for (const th of threads) {
        if (th.isHooked) activeHookCount++;
        if (th.isBroken && now - th.breakTime > REPAIR_MS) {
          th.isBroken = false;
        }
      }

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        if (th.isBroken) continue;

        let minDist = Infinity;
        let nearestPtIdx = Math.floor(th.pts.length / 2);

        for (let s = 0; s < th.pts.length; s++) {
          const pt = th.pts[s];
          if (pt.depth < -0.3) continue; // Only grab front-facing threads

          const dx = pt.x - mx;
          const dy = pt.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearestPtIdx = s;
          }
        }

        if (minDist < HOOK_RADIUS) {
          if (!th.isHooked && activeHookCount < MAX_HOOKS) {
            th.isHooked = true;
            th.hookPtIdx = nearestPtIdx;
            activeHookCount++;
          }
        }
      }
    };

    const frame = (now: number) => {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);

      updateEarthPositions();
      updateHooks(now);

      // Draw Outer Favicon Circle Boundary
      ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B}, 0.25)`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        const N = th.pts.length;

        // Check for thread snapping/breaking if stretched past BREAK_DIST
        if (th.isHooked && mx > -500) {
          const p = th.pts[th.hookPtIdx];
          const stretchDist = Math.hypot(mx - p.hx, my - p.hy);

          if (stretchDist > BREAK_DIST) {
            th.isHooked = false;
            th.isBroken = true;
            th.breakTime = now;

            for (let s = 0; s < N; s++) {
              const pt = th.pts[s];
              pt.vx += (pt.hx - pt.x) * 0.18;
              pt.vy += (pt.hy - pt.y) * 0.18;
            }
          }
        }

        // Physics update
        let avgDepth = 0;
        for (let s = 0; s < N; s++) {
          const p = th.pts[s];
          avgDepth += p.depth;

          if (th.isHooked && s === th.hookPtIdx && isPointerDown && mx > -500) {
            p.x = mx;
            p.y = my;
            p.vx = 0;
            p.vy = 0;
          } else {
            // Spring force to Earth projected home position
            p.vx += (p.hx - p.x) * K_HOME;
            p.vy += (p.hy - p.y) * K_HOME;

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

            const speedSq = p.vx * p.vx + p.vy * p.vy;
            if (speedSq > MAX_SPEED * MAX_SPEED) {
              const spd = Math.sqrt(speedSq);
              p.vx = (p.vx / spd) * MAX_SPEED;
              p.vy = (p.vy / spd) * MAX_SPEED;
            }

            p.vx *= DAMPING;
            p.vy *= DAMPING;
            p.x += p.vx;
            p.y += p.vy;
          }
        }

        avgDepth /= N; // [-1, 1] depth

        // Hide back-facing continent/grid paths when on back hemisphere
        if (avgDepth < -0.35 && !th.isHooked) continue;

        // Depth-based opacity & thickness
        const depthAlpha = Math.max(0.08, (avgDepth + 1) * 0.5);
        const opacity = th.alpha * (0.2 + depthAlpha * 0.8);
        const lw = th.isHooked ? th.lw * 1.6 : th.lw * (0.7 + depthAlpha * 0.4);

        ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${opacity.toFixed(3)})`;
        ctx.lineWidth = lw;
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
      aria-label="Interactive Earth made of woven terracotta red threads — click and hold to pull threads apart; threads snap if pulled too far"
      role="img"
    />
  );
}
