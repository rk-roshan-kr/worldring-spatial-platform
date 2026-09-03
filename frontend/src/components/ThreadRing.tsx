"use client";

import { useEffect, useRef } from "react";

// ─── Tension-Driven Rope Network Configuration ────────────────────────────────
const RING_FRAC   = 0.38;      // circle radius fraction

// Physical Tension Constants
const ROPE_TENSION  = 0.18;    // internal rope tension along string
const CROSS_TENSION = 0.08;    // cross-link tension between intersecting ropes
const ANCHOR_STIFF  = 0.12;    // perimeter anchor tension pulling circle round
const DAMPING       = 0.88;    // smooth physical damping
const MAX_SPEED     = 10;      // max velocity (px/frame)

// Mouse Drag & Snapping
const HOOK_RADIUS   = 40;      // cursor grab radius (px)
const MAX_HOOKS     = 16;      // max threads pulled simultaneously
const BREAK_DIST    = 160;     // max rope stretch before tension snaps rope
const REPAIR_MS     = 1200;    // ms to re-knit snapped rope

// Intro Animation
const CONVERGE_MS   = 2800;    // time for straight ropes to enter & pull into tension equilibrium

// Terracotta Red matching favicon (#bf4722)
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // Target equilibrium position on map/circle
  hy: number;
  sx: number; // Straight offscreen origin
  sy: number;
  tRatio: number;
  lineAngle: number;
  lineLength: number;
}

interface Thread {
  pts: Pt[];
  delay: number;
  lw: number;
  alpha: number;
  phase: number;
  isHooked: boolean;
  hookPtIdx: number;
  isBroken: boolean;
  breakTime: number;
  crossLinks: { targetThreadIdx: number; ptIdx: number; targetPtIdx: number }[];
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
      if (cosC < 0) {
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
        alpha: number = 0.58,
        lw: number = 0.95,
        subdivide: number = 22
      ) => {
        const projPts = geoPts
          .map((g) => projectGeo(g.lon, g.lat))
          .filter((p) => p.visible);

        if (projPts.length < 2) return;

        const pts: Pt[] = [];
        const totalSegments = projPts.length - 1;

        // Straight offscreen start position coming in from edge angle
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
            vx: 0,
            vy: 0,
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
          delay: stageDelayMs + Math.random() * 250,
          lw: lw + (Math.random() - 0.5) * 0.2,
          alpha: alpha + (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(subdivide / 2),
          isBroken: false,
          breakTime: 0,
          crossLinks: [],
        });
      };

      // ── STAGE 1 (0ms - 1000ms): Outer Emblem Circle Ropes ──────────────────
      // These outer ropes connect to each other under tension to form the circle ring!
      const STAGE_1_DELAY = 0;
      const N_OUTER = 50;
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
        const segs = 18;

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
            vx: 0,
            vy: 0,
            hx,
            hy,
            sx,
            sy,
            tRatio: t,
            lineAngle: lineTangentAngle,
            lineLength,
          });
        }

        threads.push({
          pts,
          delay: STAGE_1_DELAY + (i / N_OUTER) * 900,
          lw: 0.8 + Math.random() * 0.7,
          alpha: 0.45 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(segs / 2),
          isBroken: false,
          breakTime: 0,
          crossLinks: [],
        });
      }

      // ── STAGE 2 (1200ms - 2400ms): India & Himalayas Ropes ────────────────
      const STAGE_2_DELAY = 1200;

      const indiaCoast = [
        { lon: 68.2, lat: 23.7 }, { lon: 69.5, lat: 22.8 }, { lon: 70.4, lat: 21.6 },
        { lon: 72.8, lat: 21.2 }, { lon: 72.8, lat: 19.0 }, { lon: 73.8, lat: 15.4 },
        { lon: 74.8, lat: 12.8 }, { lon: 75.8, lat: 11.2 }, { lon: 76.5, lat: 9.5 },
        { lon: 77.5, lat: 8.1 },  { lon: 78.2, lat: 8.8 },  { lon: 79.8, lat: 10.3 },
        { lon: 80.3, lat: 13.1 }, { lon: 80.8, lat: 15.8 }, { lon: 82.2, lat: 16.9 },
        { lon: 83.3, lat: 17.7 }, { lon: 85.0, lat: 19.3 }, { lon: 86.8, lat: 21.0 },
        { lon: 88.2, lat: 21.6 }, { lon: 91.8, lat: 22.3 }, { lon: 92.5, lat: 25.0 },
        { lon: 95.0, lat: 27.5 }, { lon: 88.6, lat: 27.3 }, { lon: 85.3, lat: 27.7 },
        { lon: 81.0, lat: 30.0 }, { lon: 77.0, lat: 31.8 }, { lon: 74.8, lat: 34.1 },
        { lon: 73.8, lat: 34.8 }, { lon: 71.5, lat: 30.2 }, { lon: 69.8, lat: 26.8 },
        { lon: 68.2, lat: 23.7 },
      ];
      for (let offset = -0.6; offset <= 0.6; offset += 0.3) {
        const path = indiaCoast.map((g) => ({ lon: g.lon + offset, lat: g.lat + offset * 0.25 }));
        addGeoThreadPath(path, STAGE_2_DELAY, 0.85, 1.4, 34);
      }

      // Rivers
      addGeoThreadPath([
        { lon: 79.0, lat: 31.0 }, { lon: 78.1, lat: 30.0 }, { lon: 79.5, lat: 28.5 },
        { lon: 81.8, lat: 25.4 }, { lon: 85.1, lat: 25.6 }, { lon: 88.0, lat: 24.5 },
        { lon: 89.5, lat: 23.0 }, { lon: 88.3, lat: 21.8 },
      ], STAGE_2_DELAY + 300, 0.65, 1.0, 24); // Ganga

      addGeoThreadPath([
        { lon: 82.0, lat: 30.6 }, { lon: 87.0, lat: 29.2 }, { lon: 95.0, lat: 28.2 },
        { lon: 95.5, lat: 27.5 }, { lon: 91.5, lat: 26.2 }, { lon: 89.8, lat: 25.2 },
      ], STAGE_2_DELAY + 450, 0.65, 1.0, 24); // Brahmaputra

      addGeoThreadPath([
        { lon: 81.0, lat: 31.0 }, { lon: 76.0, lat: 34.5 }, { lon: 73.0, lat: 35.5 },
        { lon: 71.5, lat: 33.0 }, { lon: 70.0, lat: 28.0 }, { lon: 68.0, lat: 24.0 },
      ], STAGE_2_DELAY + 600, 0.65, 1.0, 22); // Indus

      // Himalayas Crest
      const himalayasCrest = [
        { lon: 71.5, lat: 35.8 }, { lon: 75.5, lat: 34.2 }, { lon: 80.5, lat: 30.2 },
        { lon: 85.0, lat: 28.2 }, { lon: 88.5, lat: 27.6 }, { lon: 95.0, lat: 28.5 },
      ];
      addGeoThreadPath(himalayasCrest, STAGE_2_DELAY + 700, 0.78, 1.3, 26);
      addGeoThreadPath(himalayasCrest.map(g => ({ lon: g.lon, lat: g.lat - 0.6 })), STAGE_2_DELAY + 850, 0.68, 1.0, 26);

      // Ghats
      addGeoThreadPath([
        { lon: 73.2, lat: 20.2 }, { lon: 73.8, lat: 16.5 }, { lon: 75.5, lat: 12.0 }, { lon: 77.0, lat: 8.8 },
      ], STAGE_2_DELAY + 950, 0.68, 1.05, 18);
      addGeoThreadPath([
        { lon: 86.5, lat: 21.2 }, { lon: 83.0, lat: 18.0 }, { lon: 80.0, lat: 14.2 }, { lon: 78.5, lat: 11.5 },
      ], STAGE_2_DELAY + 1050, 0.62, 0.95, 18);

      // Sri Lanka
      const sriLanka = [
        { lon: 79.8, lat: 9.8 }, { lon: 81.8, lat: 8.5 }, { lon: 81.2, lat: 6.0 },
        { lon: 79.7, lat: 6.9 }, { lon: 79.8, lat: 9.8 },
      ];
      addGeoThreadPath(sriLanka, STAGE_2_DELAY + 1100, 0.78, 1.2, 16);

      // ── STAGE 3 (2600ms - 3800ms): Middle East & Africa Ropes ─────────────
      const STAGE_3_DELAY = 2600;

      const nileRiver = [
        { lon: 33.0, lat: 4.0 }, { lon: 31.8, lat: 9.5 }, { lon: 32.5, lat: 15.6 },
        { lon: 30.5, lat: 19.5 }, { lon: 32.8, lat: 24.0 }, { lon: 31.2, lat: 30.0 },
        { lon: 30.0, lat: 31.3 }, { lon: 31.5, lat: 31.5 }, { lon: 32.3, lat: 31.2 },
      ];
      addGeoThreadPath(nileRiver, STAGE_3_DELAY, 0.68, 1.05, 26);

      const redSeaEast = [
        { lon: 32.5, lat: 29.9 }, { lon: 35.0, lat: 27.5 }, { lon: 39.0, lat: 21.5 },
        { lon: 43.0, lat: 12.6 },
      ];
      addGeoThreadPath(redSeaEast, STAGE_3_DELAY + 200, 0.58, 0.9, 18);

      const arabiaCoast = [
        { lon: 43.2, lat: 12.6 }, { lon: 45.0, lat: 12.8 }, { lon: 53.0, lat: 16.5 },
        { lon: 59.8, lat: 22.5 }, { lon: 56.5, lat: 26.2 }, { lon: 50.5, lat: 26.0 },
        { lon: 48.0, lat: 30.0 },
      ];
      addGeoThreadPath(arabiaCoast, STAGE_3_DELAY + 400, 0.62, 0.95, 22);

      const hornOfAfrica = [
        { lon: 43.0, lat: 11.6 }, { lon: 51.2, lat: 11.8 }, { lon: 49.0, lat: 8.0 },
        { lon: 41.5, lat: -1.5 }, { lon: 39.0, lat: -6.0 }, { lon: 40.5, lat: -15.0 },
      ];
      addGeoThreadPath(hornOfAfrica, STAGE_3_DELAY + 650, 0.60, 0.95, 22);

      const madagascar = [
        { lon: 49.2, lat: -12.0 }, { lon: 50.5, lat: -16.0 }, { lon: 47.0, lat: -25.0 },
        { lon: 43.5, lat: -23.0 }, { lon: 49.2, lat: -12.0 },
      ];
      addGeoThreadPath(madagascar, STAGE_3_DELAY + 900, 0.52, 0.85, 18);

      // ── STAGE 4 (4000ms - 5200ms): SE Asia & East Asia Ropes ──────────────
      const STAGE_4_DELAY = 4000;

      const mekongRiver = [
        { lon: 94.0, lat: 33.0 }, { lon: 99.0, lat: 24.0 }, { lon: 101.0, lat: 20.0 },
        { lon: 104.0, lat: 17.0 }, { lon: 105.5, lat: 11.5 }, { lon: 105.0, lat: 9.5 },
      ];
      addGeoThreadPath(mekongRiver, STAGE_4_DELAY, 0.58, 0.9, 22);

      const indochinaCoast = [
        { lon: 92.5, lat: 20.5 }, { lon: 97.5, lat: 16.0 }, { lon: 98.5, lat: 9.8 },
        { lon: 103.8, lat: 1.3 }, { lon: 104.5, lat: 10.0 }, { lon: 107.0, lat: 10.5 },
        { lon: 109.2, lat: 13.5 }, { lon: 108.0, lat: 16.5 }, { lon: 106.5, lat: 20.8 },
      ];
      addGeoThreadPath(indochinaCoast, STAGE_4_DELAY + 200, 0.62, 0.95, 24);

      const sumatra = [
        { lon: 95.3, lat: 5.5 }, { lon: 98.6, lat: 3.5 }, { lon: 102.0, lat: -2.0 },
        { lon: 106.0, lat: -6.0 },
      ];
      addGeoThreadPath(sumatra, STAGE_4_DELAY + 400, 0.58, 0.9, 18);

      const java = [
        { lon: 106.0, lat: -6.0 }, { lon: 110.0, lat: -7.0 }, { lon: 114.5, lat: -8.5 },
      ];
      addGeoThreadPath(java, STAGE_4_DELAY + 550, 0.55, 0.85, 16);

      const borneo = [
        { lon: 109.0, lat: 2.0 }, { lon: 114.0, lat: 4.5 }, { lon: 118.0, lat: 5.0 },
        { lon: 117.0, lat: -4.0 }, { lon: 109.0, lat: 2.0 },
      ];
      addGeoThreadPath(borneo, STAGE_4_DELAY + 700, 0.55, 0.85, 18);

      const philippines = [
        { lon: 120.0, lat: 18.5 }, { lon: 121.0, lat: 14.5 }, { lon: 123.0, lat: 11.5 },
        { lon: 125.0, lat: 7.0 },
      ];
      addGeoThreadPath(philippines, STAGE_4_DELAY + 850, 0.50, 0.85, 18);

      const caspianSea = [
        { lon: 50.0, lat: 37.0 }, { lon: 53.0, lat: 40.0 }, { lon: 51.5, lat: 46.5 },
        { lon: 47.0, lat: 41.5 }, { lon: 50.0, lat: 37.0 },
      ];
      addGeoThreadPath(caspianSea, STAGE_4_DELAY + 1000, 0.50, 0.85, 18);

      const chinaCoast = [
        { lon: 108.5, lat: 21.5 }, { lon: 113.5, lat: 22.5 }, { lon: 118.0, lat: 24.5 },
        { lon: 121.5, lat: 31.2 }, { lon: 120.0, lat: 36.0 }, { lon: 122.0, lat: 39.0 },
      ];
      addGeoThreadPath(chinaCoast, STAGE_4_DELAY + 1150, 0.52, 0.85, 22);

      // Build cross-rope tension links where threads cross or touch each other
      for (let i = 0; i < threads.length; i++) {
        const th1 = threads[i];
        for (let j = i + 1; j < threads.length; j++) {
          const th2 = threads[j];
          for (let s1 = 0; s1 < th1.pts.length; s1 += 4) {
            for (let s2 = 0; s2 < th2.pts.length; s2 += 4) {
              const p1 = th1.pts[s1];
              const p2 = th2.pts[s2];
              const dist = Math.hypot(p1.hx - p2.hx, p1.hy - p2.hy);
              if (dist < 18) {
                th1.crossLinks.push({ targetThreadIdx: j, ptIdx: s1, targetPtIdx: s2 });
              }
            }
          }
        }
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
          const dx = th.pts[s].x - mx;
          const dy = th.pts[s].y - my;
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

      const elapsed = now - t0;
      updateHooks(now);

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        const localTime = elapsed - th.delay;
        if (localTime < 0) continue; // Waiting for stage to start

        const rawProgress = Math.min(localTime / CONVERGE_MS, 1);
        const easeIntro = 1 - Math.pow(1 - rawProgress, 3); // Cubic ease-out

        // Pure monotonic bending factor (zero bounce/overshoot)
        let bendFactor = 0;
        if (rawProgress > 0.30) {
          const bendProgress = Math.min((rawProgress - 0.30) / 0.70, 1);
          bendFactor = 1 - Math.pow(1 - bendProgress, 3);
        }

        const breath = Math.sin(now * 0.0008 + th.phase) * 1.2 * easeIntro;
        const N = th.pts.length;

        // Snapping check when pulled too far
        if (th.isHooked && mx > -500) {
          const p = th.pts[th.hookPtIdx];
          const stretchDist = Math.hypot(mx - p.hx, my - p.hy);

          if (stretchDist > BREAK_DIST) {
            th.isHooked = false;
            th.isBroken = true;
            th.breakTime = now;

            for (let s = 0; s < N; s++) {
              const pt = th.pts[s];
              pt.vx += (pt.hx - pt.x) * 0.12;
              pt.vy += (pt.hy - pt.y) * 0.12;
            }
          }
        }

        for (let s = 0; s < N; s++) {
          const p = th.pts[s];

          if (th.isHooked && s === th.hookPtIdx && isPointerDown && mx > -500) {
            p.x = mx;
            p.y = my;
            p.vx = 0;
            p.vy = 0;
          } else {
            const angle = Math.atan2(p.hy - cy, p.hx - cx);
            const targetCurvedX = p.hx + Math.cos(angle) * breath;
            const targetCurvedY = p.hy + Math.sin(angle) * breath;

            if (rawProgress < 1.0) {
              // 1. Center of straight line lerps smoothly from offscreen (sx, sy) to home (hx, hy)
              const lineCenterX = p.sx + (p.hx - p.sx) * easeIntro;
              const lineCenterY = p.sy + (p.hy - p.sy) * easeIntro;

              // 2. Dead-straight line position during flight
              const straightX = lineCenterX + (p.tRatio - 0.5) * p.lineLength * Math.cos(p.lineAngle);
              const straightY = lineCenterY + (p.tRatio - 0.5) * p.lineLength * Math.sin(p.lineAngle);

              // 3. Smooth monotonic flex/bend into target curved map shape (0% bounce)
              const curTargetX = straightX + (targetCurvedX - straightX) * bendFactor;
              const curTargetY = straightY + (targetCurvedY - straightY) * bendFactor;

              p.x += (curTargetX - p.x) * 0.14;
              p.y += (curTargetY - p.y) * 0.14;
              p.vx = 0;
              p.vy = 0;
            } else {
              // Post-intro rope tension physics equilibrium
              p.vx += (targetCurvedX - p.x) * ANCHOR_STIFF;
              p.vy += (targetCurvedY - p.y) * ANCHOR_STIFF;

              // 1. Internal Rope Tension along adjacent nodes in the string
              if (s > 0) {
                const prev = th.pts[s - 1];
                p.vx += (prev.x - p.x) * ROPE_TENSION;
                p.vy += (prev.y - p.y) * ROPE_TENSION;
              }
              if (s < N - 1) {
                const next = th.pts[s + 1];
                p.vx += (next.x - p.x) * ROPE_TENSION;
                p.vy += (next.y - p.y) * ROPE_TENSION;
              }

              // 2. Cross-Link Tension forces connecting intersecting ropes into circle shape
              for (const link of th.crossLinks) {
                if (link.ptIdx === s) {
                  const targetTh = threads[link.targetThreadIdx];
                  if (targetTh && !targetTh.isBroken) {
                    const targetPt = targetTh.pts[link.targetPtIdx];
                    p.vx += (targetPt.x - p.x) * CROSS_TENSION;
                    p.vy += (targetPt.y - p.y) * CROSS_TENSION;
                  }
                }
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
        }

        const opacity = th.alpha * Math.min(rawProgress * 1.5, 1);
        ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${opacity.toFixed(3)})`;
        ctx.lineWidth = th.isHooked ? th.lw * 1.6 : th.lw;
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
      aria-label="Tension-driven 2D red rope Earth map — straight ropes enter from offscreen across 4 geographic stages and bend into a circle and map silhouette via mutual rope tension. Click and hold to pull threads apart"
      role="img"
    />
  );
}
