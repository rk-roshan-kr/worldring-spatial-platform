"use client";

import { useEffect, useRef } from "react";

// ─── High-Performance Config ──────────────────────────────────────────────────
const RING_FRAC   = 0.38;      // ring radius fraction of min(W, H)

// Drag & Grab
const HOOK_RADIUS  = 48;       // grab radius around cursor (px)
const HOVER_RADIUS = 75;       // proximity hover influence radius (px)
const MAX_HOOKS    = 18;       // max threads grabbed simultaneously
const BREAK_DIST   = 170;      // max stretch before thread snaps
const REPAIR_MS    = 1200;     // ms to re-knit snapped thread

// Staged Intro Convergence Duration per thread (ms)
const CONVERGE_MS = 2200;

// Outer Ring Continuous Rotation Speed (rad/ms)
const RING_SPIN_SPEED = 0.00016;

// Terracotta Red colors
const ACC_R = 191, ACC_G = 71, ACC_B = 34;
const GLOW_R = 235, GLOW_G = 95, GLOW_B = 45;

interface Pt {
  x: number;
  y: number;
  hx: number;
  hy: number;
  sx: number;
  sy: number;
  tRatio: number;
  lineAngle: number;
  lineLength: number;
  baseAngle?: number;
  radius?: number;
  arcSpan?: number;
}

interface Thread {
  pts: Pt[];
  delay: number;
  lw: number;
  alpha: number;
  isHooked: boolean;
  isHovered: boolean;
  hoverIntensity: number;
  hookPtIdx: number;
  isBroken: boolean;
  breakTime: number;
  dragReleaseTime: number;
  releasePt: { x: number; y: number } | null;
  isOuterRing?: boolean;
}

interface ClickRipple {
  x: number;
  y: number;
  t0: number;
  radius: number;
  maxRadius: number;
}

interface ThreadRingProps {
  className?: string;
  onHoverCoordinates?: (coords: { lat: string; lon: string; tension: number }) => void;
}

export function ThreadRing({ className = "", onHoverCoordinates }: ThreadRingProps) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const onHoverRef = useRef(onHoverCoordinates);
  onHoverRef.current = onHoverCoordinates;

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Cap DPR to 1.5 to prevent GPU pixel fill bottleneck on 4K/Retina displays
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, cx = 0, cy = 0, R = 0;
    let threads: Thread[] = [];
    let ripples: ClickRipple[] = [];
    let t0 = 0;
    let mx = -9999, my = -9999;
    let smoothMx = -9999, smoothMy = -9999;
    let isPointerDown = false;
    let live = true;
    let isVisibleInViewport = true;
    let rafId = 0;

    // Mathematical 3D -> 2D Orthographic Globe Projection centered on India (16°N, 78°E)
    const projectGeo = (lonDeg: number, latDeg: number): { x: number; y: number; visible: boolean } => {
      const lon0 = (78.0 * Math.PI) / 180.0;
      const lat0 = (16.0 * Math.PI) / 180.0;

      const lon = (lonDeg * Math.PI) / 180.0;
      const lat = (latDeg * Math.PI) / 180.0;

      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const cosLat0 = Math.cos(lat0);
      const sinLat0 = Math.sin(lat0);
      const dLon = lon - lon0;
      const cosDLon = Math.cos(dLon);

      const cosC = sinLat0 * sinLat + cosLat0 * cosLat * cosDLon;
      if (cosC < 0.05) {
        return { x: cx, y: cy, visible: false };
      }

      const px = R * cosLat * Math.sin(dLon);
      const py = -R * (cosLat0 * sinLat - sinLat0 * cosLat * cosDLon);

      return { x: cx + px, y: cy + py, visible: true };
    };

    const build = () => {
      threads = [];

      const addGeoThreadPath = (
        geoPts: { lon: number; lat: number }[],
        stageDelayMs: number,
        alpha: number = 0.68,
        lw: number = 0.95,
        subdivide: number = 22
      ) => {
        const projPts = geoPts
          .map((g) => projectGeo(g.lon, g.lat))
          .filter((p) => p.visible);

        if (projPts.length < 2) return;

        const pts: Pt[] = [];
        const totalSegments = projPts.length - 1;

        const flyAngle = Math.random() * Math.PI * 2;
        const flyDist = Math.max(W, H) * (0.85 + Math.random() * 0.4);
        const startX = cx + Math.cos(flyAngle) * flyDist;
        const startY = cy + Math.sin(flyAngle) * flyDist;
        const lineTangentAngle = flyAngle + Math.PI / 2;
        const lineLength = 140 + Math.random() * 80;

        for (let i = 0; i < subdivide; i++) {
          const tGlobal = i / (subdivide - 1);
          const segFloat = tGlobal * totalSegments;
          const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
          const tSeg = segFloat - segIdx;

          const p1 = projPts[segIdx];
          const p2 = projPts[Math.min(segIdx + 1, totalSegments - 1)];

          const hx = p1.x + (p2.x - p1.x) * tSeg;
          const hy = p1.y + (p2.y - p1.y) * tSeg;

          const sx = startX + (tGlobal - 0.5) * lineLength * Math.cos(lineTangentAngle);
          const sy = startY + (tGlobal - 0.5) * lineLength * Math.sin(lineTangentAngle);

          pts.push({
            x: sx,
            y: sy,
            hx,
            hy,
            sx,
            sy,
            tRatio: tGlobal,
            lineAngle: lineTangentAngle,
            lineLength,
          });
        }

        threads.push({
          pts,
          delay: stageDelayMs + Math.random() * 200,
          lw: lw + (Math.random() - 0.5) * 0.2,
          alpha: alpha + (Math.random() - 0.5) * 0.1,
          isHooked: false,
          isHovered: false,
          hoverIntensity: 0,
          hookPtIdx: Math.floor(subdivide / 2),
          isBroken: false,
          breakTime: 0,
          dragReleaseTime: 0,
          releasePt: null,
          isOuterRing: false,
        });
      };

      // ── STAGE 1 (0ms - 900ms): Outer Emblem Circle Frame (38 Strands) ─────
      const STAGE_1_DELAY = 0;
      const N_OUTER = 38;
      for (let i = 0; i < N_OUTER; i++) {
        const baseAngle = (i / N_OUTER) * Math.PI * 2;
        const threadR = R + (Math.random() - 0.5) * 14;
        const arcSpan = Math.PI * 0.85;

        const flyAngle = Math.random() * Math.PI * 2;
        const flyDist = Math.max(W, H) * (0.85 + Math.random() * 0.4);
        const startX = cx + Math.cos(flyAngle) * flyDist;
        const startY = cy + Math.sin(flyAngle) * flyDist;
        const lineTangentAngle = flyAngle + Math.PI / 2;
        const lineLength = 140;

        const pts: Pt[] = [];
        const segs = 16;

        for (let s = 0; s < segs; s++) {
          const t = s / (segs - 1);
          const angle = baseAngle + (t - 0.5) * arcSpan;
          const hx = cx + threadR * Math.cos(angle);
          const hy = cy + threadR * Math.sin(angle);

          const sx = startX + (t - 0.5) * lineLength * Math.cos(lineTangentAngle);
          const sy = startY + (t - 0.5) * lineLength * Math.sin(lineTangentAngle);

          pts.push({
            x: sx,
            y: sy,
            hx,
            hy,
            sx,
            sy,
            tRatio: t,
            lineAngle: lineTangentAngle,
            lineLength,
            baseAngle,
            radius: threadR,
            arcSpan,
          });
        }

        threads.push({
          pts,
          delay: STAGE_1_DELAY + (i / N_OUTER) * 800,
          lw: 0.8 + Math.random() * 0.7,
          alpha: 0.45 + Math.random() * 0.35,
          isHooked: false,
          isHovered: false,
          hoverIntensity: 0,
          hookPtIdx: Math.floor(segs / 2),
          isBroken: false,
          breakTime: 0,
          dragReleaseTime: 0,
          releasePt: null,
          isOuterRing: true,
        });
      }

      // ── STAGE 2 (1000ms - 2200ms): Official Undivided Sovereign Boundary of India ─
      const STAGE_2_DELAY = 1000;

      const sovereignIndiaBoundary = [
        { lon: 68.5, lat: 23.7 }, // Kutch, Gujarat
        { lon: 69.8, lat: 22.5 }, // Kathiawar West
        { lon: 72.8, lat: 21.0 }, // Khambhat
        { lon: 72.8, lat: 19.0 }, // Mumbai / Konkan
        { lon: 73.8, lat: 15.4 }, // Goa
        { lon: 74.8, lat: 12.8 }, // Mangalore / Canara
        { lon: 76.5, lat: 9.5 },  // Kochi / Malabar
        { lon: 77.5, lat: 8.1 },  // Kanyakumari Southernmost Tip
        { lon: 78.5, lat: 9.5 },  // Coromandel / TN
        { lon: 80.2, lat: 13.0 }, // Chennai
        { lon: 82.2, lat: 16.8 }, // Visakhapatnam / AP
        { lon: 85.0, lat: 19.5 }, // Odisha Coast
        { lon: 88.0, lat: 21.8 }, // Sundarbans / Bengal
        { lon: 91.5, lat: 23.5 }, // Tripura Peninsula
        { lon: 93.0, lat: 22.0 }, // Mizoram Tip
        { lon: 94.2, lat: 24.5 }, // Manipur / Imphal
        { lon: 95.2, lat: 26.0 }, // Nagaland / Kohima
        { lon: 96.8, lat: 27.2 }, // Tinsukia / Assam East
        { lon: 97.2, lat: 28.0 }, // Arunachal Pradesh East Tip (Kibithu)
        { lon: 94.0, lat: 28.5 }, // Siang Arc
        { lon: 92.0, lat: 27.8 }, // Tawang
        { lon: 88.6, lat: 28.2 }, // Sikkim North Tip (Kanchenjunga)
        { lon: 88.2, lat: 26.5 }, // Siliguri Corridor
        { lon: 85.0, lat: 27.8 }, // Nepal Border
        { lon: 80.5, lat: 30.0 }, // Uttarakhand
        { lon: 78.8, lat: 31.8 }, // Himachal East
        { lon: 79.2, lat: 32.8 }, // Spiti / Demchok
        { lon: 79.5, lat: 34.2 }, // Pangong Tso / Eastern Aksai Chin
        { lon: 79.2, lat: 35.3 }, // Northern Aksai Chin
        { lon: 77.8, lat: 35.7 }, // Siachen Glacier
        { lon: 76.2, lat: 36.0 }, // K2 Crest Tip
        { lon: 74.8, lat: 35.8 }, // Gilgit / Nanga Parbat
        { lon: 73.5, lat: 34.8 }, // Muzaffarabad
        { lon: 74.0, lat: 33.5 }, // Punch / Jammu West
        { lon: 74.5, lat: 31.8 }, // Punjab / Wagah
        { lon: 71.5, lat: 29.5 }, // Thar Desert North
        { lon: 70.0, lat: 26.8 }, // Barmer / Rajasthan
        { lon: 68.5, lat: 23.7 }, // Back to Kutch
      ];

      for (let offset = -0.6; offset <= 0.6; offset += 0.4) {
        const path = sovereignIndiaBoundary.map((g) => ({ lon: g.lon + offset, lat: g.lat + offset * 0.25 }));
        addGeoThreadPath(path, STAGE_2_DELAY, 0.88, 1.4, 34);
      }

      // Major Inland Rivers
      addGeoThreadPath([
        { lon: 79.0, lat: 31.0 }, { lon: 78.1, lat: 30.0 }, { lon: 79.5, lat: 28.5 },
        { lon: 81.8, lat: 25.4 }, { lon: 85.1, lat: 25.6 }, { lon: 88.0, lat: 24.5 },
        { lon: 89.5, lat: 23.0 }, { lon: 88.3, lat: 21.8 },
      ], STAGE_2_DELAY + 250, 0.68, 1.05, 20); // Ganga

      addGeoThreadPath([
        { lon: 82.0, lat: 30.6 }, { lon: 87.0, lat: 29.2 }, { lon: 95.0, lat: 28.2 },
        { lon: 95.5, lat: 27.5 }, { lon: 91.5, lat: 26.2 }, { lon: 89.8, lat: 25.2 },
      ], STAGE_2_DELAY + 400, 0.72, 1.1, 22); // Brahmaputra

      addGeoThreadPath([
        { lon: 81.0, lat: 31.0 }, { lon: 78.5, lat: 33.8 }, { lon: 76.0, lat: 34.5 },
        { lon: 74.0, lat: 35.5 }, { lon: 71.5, lat: 33.0 }, { lon: 70.0, lat: 28.0 }, { lon: 68.0, lat: 24.0 },
      ], STAGE_2_DELAY + 550, 0.65, 1.0, 20); // Indus

      // Himalayas Crest
      const himalayasCrest = [
        { lon: 75.0, lat: 34.5 }, { lon: 80.5, lat: 30.2 }, { lon: 88.5, lat: 27.6 }, { lon: 95.0, lat: 28.5 },
      ];
      addGeoThreadPath(himalayasCrest, STAGE_2_DELAY + 700, 0.78, 1.3, 22);
      addGeoThreadPath(himalayasCrest.map(g => ({ lon: g.lon, lat: g.lat - 0.6 })), STAGE_2_DELAY + 800, 0.68, 1.0, 22);

      // Ghats & Sri Lanka
      addGeoThreadPath([
        { lon: 73.2, lat: 20.2 }, { lon: 73.8, lat: 16.5 }, { lon: 75.5, lat: 12.0 }, { lon: 77.0, lat: 8.8 },
      ], STAGE_2_DELAY + 900, 0.68, 1.05, 16);

      const sriLanka = [
        { lon: 79.8, lat: 9.8 }, { lon: 81.8, lat: 8.5 }, { lon: 81.2, lat: 6.0 },
        { lon: 79.7, lat: 6.9 }, { lon: 79.8, lat: 9.8 },
      ];
      addGeoThreadPath(sriLanka, STAGE_2_DELAY + 1000, 0.78, 1.2, 14);

      // ── STAGE 3 (2200ms - 3400ms): High-Precision Arabia & Africa ────────────
      const STAGE_3_DELAY = 2200;

      const arabiaMainCoast = [
        { lon: 32.5, lat: 29.9 }, { lon: 34.8, lat: 27.8 }, { lon: 36.5, lat: 26.0 },
        { lon: 39.1, lat: 21.5 }, { lon: 43.0, lat: 12.6 }, { lon: 48.0, lat: 14.0 },
        { lon: 55.4, lat: 19.0 }, { lon: 59.8, lat: 22.5 }, { lon: 56.5, lat: 26.2 },
        { lon: 50.0, lat: 27.0 }, { lon: 48.0, lat: 30.0 },
      ];
      for (let offset = -0.5; offset <= 0.5; offset += 0.5) {
        const path = arabiaMainCoast.map((g) => ({ lon: g.lon + offset, lat: g.lat + offset * 0.2 }));
        addGeoThreadPath(path, STAGE_3_DELAY, 0.80, 1.3, 24);
      }

      const nileRiver = [
        { lon: 33.0, lat: 4.0 }, { lon: 31.8, lat: 9.5 }, { lon: 32.5, lat: 15.6 },
        { lon: 30.5, lat: 19.5 }, { lon: 32.8, lat: 24.0 }, { lon: 31.2, lat: 30.0 },
      ];
      addGeoThreadPath(nileRiver, STAGE_3_DELAY + 300, 0.75, 1.15, 22);

      const hornOfAfricaDetailed = [
        { lon: 43.0, lat: 11.6 }, { lon: 51.2, lat: 11.8 }, { lon: 48.0, lat: 5.5 },
        { lon: 41.5, lat: -1.5 }, { lon: 39.0, lat: -6.8 }, { lon: 40.5, lat: -15.0 },
      ];
      for (let offset = -0.5; offset <= 0.5; offset += 0.5) {
        const path = hornOfAfricaDetailed.map((g) => ({ lon: g.lon + offset, lat: g.lat + offset * 0.2 }));
        addGeoThreadPath(path, STAGE_3_DELAY + 500, 0.80, 1.25, 22);
      }

      const madagascarDetailed = [
        { lon: 49.2, lat: -12.0 }, { lon: 50.5, lat: -15.5 }, { lon: 47.0, lat: -25.5 },
        { lon: 43.6, lat: -20.0 }, { lon: 49.2, lat: -12.0 },
      ];
      addGeoThreadPath(madagascarDetailed, STAGE_3_DELAY + 700, 0.75, 1.15, 18);

      // ── STAGE 4 (3400ms - 4600ms): SE Asia & East Asia ────────────────────
      const STAGE_4_DELAY = 3400;

      const indochinaDetailed = [
        { lon: 92.5, lat: 20.8 }, { lon: 96.2, lat: 16.8 }, { lon: 98.5, lat: 9.8 },
        { lon: 103.8, lat: 1.3 }, { lon: 104.5, lat: 10.0 }, { lon: 109.2, lat: 13.5 },
        { lon: 106.5, lat: 20.8 }, { lon: 108.0, lat: 21.5 },
      ];
      for (let offset = -0.5; offset <= 0.5; offset += 0.5) {
        const path = indochinaDetailed.map((g) => ({ lon: g.lon + offset, lat: g.lat + offset * 0.2 }));
        addGeoThreadPath(path, STAGE_4_DELAY, 0.80, 1.3, 24);
      }

      const sumatraDetailed = [
        { lon: 95.3, lat: 5.5 }, { lon: 98.6, lat: 3.5 }, { lon: 102.0, lat: -2.0 }, { lon: 106.0, lat: -6.0 },
      ];
      addGeoThreadPath(sumatraDetailed, STAGE_4_DELAY + 300, 0.75, 1.15, 18);

      const javaDetailed = [
        { lon: 106.0, lat: -6.0 }, { lon: 110.0, lat: -7.0 }, { lon: 114.5, lat: -8.5 },
      ];
      addGeoThreadPath(javaDetailed, STAGE_4_DELAY + 450, 0.72, 1.1, 14);

      const borneoDetailed = [
        { lon: 109.0, lat: 2.0 }, { lon: 114.0, lat: 4.5 }, { lon: 118.0, lat: 5.0 },
        { lon: 116.0, lat: -4.0 }, { lon: 109.0, lat: 2.0 },
      ];
      addGeoThreadPath(borneoDetailed, STAGE_4_DELAY + 600, 0.78, 1.2, 18);

      const chinaCoastDetailed = [
        { lon: 108.5, lat: 21.5 }, { lon: 113.5, lat: 22.5 }, { lon: 118.0, lat: 24.5 },
        { lon: 121.5, lat: 31.2 }, { lon: 122.0, lat: 39.0 },
      ];
      for (let offset = -0.5; offset <= 0.5; offset += 0.5) {
        const path = chinaCoastDetailed.map((g) => ({ lon: g.lon + offset, lat: g.lat + offset * 0.2 }));
        addGeoThreadPath(path, STAGE_4_DELAY + 800, 0.78, 1.2, 22);
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

    const updateHooks = (now: number) => {
      // Smooth mouse coordinates
      if (mx > -500 && my > -500) {
        smoothMx += (mx - smoothMx) * 0.25;
        smoothMy += (my - smoothMy) * 0.25;
      }

      // Check repair on broken threads
      for (const th of threads) {
        if (th.isBroken && now - th.breakTime > REPAIR_MS) {
          th.isBroken = false;
        }
      }

      // Unhook if pointer released
      if (!isPointerDown) {
        for (const th of threads) {
          if (th.isHooked) {
            th.isHooked = false;
            th.dragReleaseTime = now;
            th.releasePt = { x: th.pts[th.hookPtIdx].x, y: th.pts[th.hookPtIdx].y };
          }
        }
      }

      let activeHookCount = 0;
      let totalTension = 0;

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        if (th.isBroken) continue;

        let minDist = Infinity;
        let nearestPtIdx = Math.floor(th.pts.length / 2);

        for (let s = 0; s < th.pts.length; s++) {
          const dx = th.pts[s].x - mx;
          const dy = th.pts[s].y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearestPtIdx = s;
          }
        }

        // Proximity hover detection (ALIVE WITHOUT CLICKING!)
        if (minDist < HOVER_RADIUS && mx > -500) {
          th.isHovered = true;
          th.hoverIntensity = Math.max(0, 1 - minDist / HOVER_RADIUS);
        } else {
          th.isHovered = false;
          th.hoverIntensity *= 0.85; // smooth fadeout
        }

        // Active dragging / hooking when pointer down
        if (isPointerDown && minDist < HOOK_RADIUS && activeHookCount < MAX_HOOKS) {
          if (!th.isHooked) {
            th.isHooked = true;
            th.hookPtIdx = nearestPtIdx;
          }
          activeHookCount++;
          totalTension += minDist / HOOK_RADIUS;
        }
      }

      // Update telemetry callback if provided
      if (onHoverRef.current && mx > -500 && my > -500 && R > 0) {
        const dX = (mx - cx) / R;
        const dY = (my - cy) / R;
        const latEst = Math.max(-80, Math.min(80, 16.0 - dY * 45));
        const lonEst = Math.max(-180, Math.min(180, 78.0 + dX * 55));
        const tensionPct = Math.round(Math.min(100, (activeHookCount / MAX_HOOKS) * 100));
        onHoverRef.current({
          lat: `${Math.abs(latEst).toFixed(2)}° ${latEst >= 0 ? "N" : "S"}`,
          lon: `${Math.abs(lonEst).toFixed(2)}° ${lonEst >= 0 ? "E" : "W"}`,
          tension: tensionPct,
        });
      }
    };

    const frame = (now: number) => {
      if (!live || !isVisibleInViewport) return;
      ctx.clearRect(0, 0, W, H);

      const elapsed = now - t0;
      updateHooks(now);

      const spinAngle = elapsed * RING_SPIN_SPEED;

      // Draw subtle background ambient depth ring
      const bgGrad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.15);
      bgGrad.addColorStop(0, "rgba(191, 71, 34, 0.04)");
      bgGrad.addColorStop(0.7, "rgba(191, 71, 34, 0.015)");
      bgGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw ripples
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const rip = ripples[rIdx];
        const age = now - rip.t0;
        rip.radius += 3.2;
        const ripAlpha = Math.max(0, (1 - rip.radius / rip.maxRadius) * 0.4);
        if (ripAlpha <= 0.01) {
          ripples.splice(rIdx, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(${GLOW_R},${GLOW_G},${GLOW_B},${ripAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        const localTime = elapsed - th.delay;
        if (localTime < 0) continue;

        const rawProgress = Math.min(localTime / CONVERGE_MS, 1);
        const easeIntro = 1 - Math.pow(1 - rawProgress, 3);

        let bendFactor = 0;
        if (rawProgress > 0.30) {
          const bendProgress = Math.min((rawProgress - 0.30) / 0.70, 1);
          bendFactor = 1 - Math.pow(1 - bendProgress, 3);
        }

        const N = th.pts.length;

        // Snapping check when dragged too far
        if (th.isHooked && mx > -500) {
          const p = th.pts[th.hookPtIdx];
          const stretchDist = Math.hypot(mx - p.hx, my - p.hy);

          if (stretchDist > BREAK_DIST) {
            th.isHooked = false;
            th.isBroken = true;
            th.breakTime = now;
            th.dragReleaseTime = now;
            th.releasePt = { x: mx, y: my };
          }
        }

        for (let s = 0; s < N; s++) {
          const p = th.pts[s];

          let targetHx = p.hx;
          let targetHy = p.hy;

          if (th.isOuterRing && p.baseAngle !== undefined && p.radius !== undefined && p.arcSpan !== undefined) {
            const currentAngle = p.baseAngle + spinAngle + (p.tRatio - 0.5) * p.arcSpan;
            targetHx = cx + p.radius * Math.cos(currentAngle);
            targetHy = cy + p.radius * Math.sin(currentAngle);
          }

          if (rawProgress < 1.0) {
            const lineCenterX = p.sx + (targetHx - p.sx) * easeIntro;
            const lineCenterY = p.sy + (targetHy - p.sy) * easeIntro;

            const straightX = lineCenterX + (p.tRatio - 0.5) * p.lineLength * Math.cos(p.lineAngle);
            const straightY = lineCenterY + (p.tRatio - 0.5) * p.lineLength * Math.sin(p.lineAngle);

            p.x = straightX + (targetHx - straightX) * bendFactor;
            p.y = straightY + (targetHy - straightY) * bendFactor;
          } else {
            if (th.isHooked && isPointerDown && mx > -500) {
              const hookIdx = th.hookPtIdx;
              const distFromHook = Math.abs(s - hookIdx) / N;
              const influence = Math.max(0, 1 - distFromHook * 3);

              p.x = targetHx + (mx - targetHx) * influence;
              p.y = targetHy + (my - targetHy) * influence;
            } else if (th.releasePt && now - th.dragReleaseTime < 800) {
              // Harmonic plucked string vibration on release!
              const timeSince = (now - th.dragReleaseTime);
              const decay = Math.exp(-timeSince * 0.006);
              const oscillation = Math.cos(timeSince * 0.045) * decay;

              const hookIdx = th.hookPtIdx;
              const distFromHook = Math.abs(s - hookIdx) / N;
              const influence = Math.max(0, 1 - distFromHook * 3);

              const startOffsetPtX = th.releasePt.x - targetHx;
              const startOffsetPtY = th.releasePt.y - targetHy;

              p.x = targetHx + startOffsetPtX * influence * oscillation;
              p.y = targetHy + startOffsetPtY * influence * oscillation;
            } else if (th.isHovered && th.hoverIntensity > 0.05 && mx > -500) {
              // Reactive Hover Silk Wave displacement
              const dx = targetHx - mx;
              const dy = targetHy - my;
              const dist = Math.hypot(dx, dy);
              const repel = Math.max(0, (1 - dist / HOVER_RADIUS)) * 12 * th.hoverIntensity;
              const angle = Math.atan2(dy, dx);

              p.x = targetHx + Math.cos(angle) * repel;
              p.y = targetHy + Math.sin(angle) * repel;
            } else {
              p.x = targetHx;
              p.y = targetHy;
            }
          }
        }

        // Dynamic styling: highlighted glow when hovered or hooked
        const baseOpacity = Math.min(th.alpha * Math.min(rawProgress * 1.5, 1), 0.95);
        const hoverBoost = th.hoverIntensity * 0.35;
        const opacity = Math.min(0.98, baseOpacity + hoverBoost);

        if (th.isHooked) {
          ctx.strokeStyle = `rgba(${GLOW_R},${GLOW_G},${GLOW_B},0.98)`;
          ctx.lineWidth = th.lw * 1.9;
        } else if (th.isHovered && th.hoverIntensity > 0.1) {
          ctx.strokeStyle = `rgba(${GLOW_R},${GLOW_G},${GLOW_B},${opacity.toFixed(3)})`;
          ctx.lineWidth = th.lw * (1 + th.hoverIntensity * 0.6);
        } else {
          ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${opacity.toFixed(3)})`;
          ctx.lineWidth = th.lw;
        }

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

        // Draw luminous spark vertices on hovered or hooked thread points
        if ((th.isHooked || th.hoverIntensity > 0.5) && th.pts[th.hookPtIdx]) {
          const hp = th.pts[th.hookPtIdx];
          ctx.fillStyle = `rgba(255, 240, 220, ${(0.8 * th.hoverIntensity).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    // IntersectionObserver: Pause canvas animation loop when hero is out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        if (inView && !isVisibleInViewport) {
          isVisibleInViewport = true;
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(frame);
        } else if (!inView && isVisibleInViewport) {
          isVisibleInViewport = false;
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(cv);

    const updateMousePos = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (smoothMx < -500) {
        smoothMx = mx;
        smoothMy = my;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      updateMousePos(e);
      // Spawn tactile sonar ripple wave on click!
      ripples.push({
        x: mx,
        y: my,
        t0: performance.now(),
        radius: 6,
        maxRadius: Math.min(W, H) * 0.65,
      });
    };
    
    // Pointermove tracks ALWAYS for live hover responsiveness!
    const onPointerMove = (e: PointerEvent) => {
      updateMousePos(e);
    };

    const onPointerUp = () => {
      isPointerDown = false;
      for (const th of threads) {
        if (th.isHooked) {
          th.isHooked = false;
          th.dragReleaseTime = performance.now();
          th.releasePt = { x: mx, y: my };
        }
      }
    };

    const onPointerLeave = () => {
      isPointerDown = false;
      mx = -9999;
      my = -9999;
      smoothMx = -9999;
      smoothMy = -9999;
      for (const th of threads) {
        th.isHooked = false;
        th.isHovered = false;
        th.hoverIntensity = 0;
      }
    };

    cv.addEventListener("pointerdown", onPointerDown);
    cv.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    cv.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      live = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      cv.removeEventListener("pointerdown", onPointerDown);
      cv.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      cv.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      className={`block w-full h-full ${className}`}
      style={{ cursor: "crosshair", touchAction: "none" }}
      aria-label="Interactive 2D Red Thread Earth Map — hover to ripple threads, click and drag to pull and snap threads elastically"
      role="img"
    />
  );
}

