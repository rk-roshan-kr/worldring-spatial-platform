"use client";

import { useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const RING_FRAC   = 0.38;      // ring radius fraction of min(W, H)

// Physics Constants
const K_HOME      = 0.07;      // spring force pulling particles back to map home
const K_LINK      = 0.15;      // link spring along thread
const DAMPING     = 0.83;      // smooth damping
const MAX_SPEED   = 11;        // speed cap (px/frame)

// Drag, Grab & Break
const HOOK_RADIUS = 45;        // grab radius around cursor (px)
const MAX_HOOKS   = 14;        // max threads grabbed simultaneously
const BREAK_DIST  = 160;       // max stretch before thread snaps
const REPAIR_MS   = 1200;      // ms to re-knit snapped thread

// Terracotta Red color matching favicon (#bf4722)
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // Target home X on 2D India Earth map
  hy: number; // Target home Y on 2D India Earth map
  sx: number; // Start X for intro
  sy: number; // Start Y for intro
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

    // Helper: Orthographic 2D projection mapping (lon, lat) centered on India (78°E, 16°N)
    const geoTo2D = (lon: number, lat: number): { x: number; y: number } => {
      const centerLon = 78.0;
      const centerLat = 16.0;
      const scale = R / 70.0; // 70 degrees spans radius R

      const dx = (lon - centerLon) * scale;
      const dy = -(lat - centerLat) * scale; // invert Y for canvas
      return { x: cx + dx, y: cy + dy };
    };

    const build = () => {
      threads = [];
      let threadId = 0;

      const addThreadPath = (
        rawPts: { x: number; y: number }[],
        alpha: number = 0.55,
        lw: number = 0.9,
        subdivide: number = 20
      ) => {
        if (rawPts.length < 2) return;

        const pts: Pt[] = [];
        const totalSegments = rawPts.length - 1;

        for (let i = 0; i < subdivide; i++) {
          const tGlobal = i / (subdivide - 1);
          const segFloat = tGlobal * totalSegments;
          const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
          const tSeg = segFloat - segIdx;

          const p1 = rawPts[segIdx];
          const p2 = rawPts[Math.min(segIdx + 1, totalSegments - 1)];

          const hx = p1.x + (p2.x - p1.x) * tSeg;
          const hy = p1.y + (p2.y - p1.y) * tSeg;

          const offsetDist = 10 + Math.random() * 18;
          const offsetAngle = Math.random() * Math.PI * 2;
          const sx = hx + Math.cos(offsetAngle) * offsetDist;
          const sy = hy + Math.sin(offsetAngle) * offsetDist;

          pts.push({ x: sx, y: sy, vx: 0, vy: 0, hx, hy, sx, sy });
        }

        threads.push({
          pts,
          delay: (threadId++ % 60) * 15,
          lw: lw + (Math.random() - 0.5) * 0.2,
          alpha: alpha + (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(subdivide / 2),
          isBroken: false,
          breakTime: 0,
        });
      };

      // ── 1. Outer Ring Threads (Circle Frame matching favicon) ─────────────
      const N_OUTER = 50;
      for (let i = 0; i < N_OUTER; i++) {
        const baseAngle = (i / N_OUTER) * Math.PI * 2;
        const threadR = R + (Math.random() - 0.5) * 12;
        const arcSpan = Math.PI * 0.85;
        const pts: Pt[] = [];
        const segs = 18;

        for (let s = 0; s < segs; s++) {
          const t = s / (segs - 1);
          const angle = baseAngle + (t - 0.5) * arcSpan;
          const hx = cx + threadR * Math.cos(angle);
          const hy = cy + threadR * Math.sin(angle);
          const sx = hx + (Math.random() - 0.5) * 25;
          const sy = hy + (Math.random() - 0.5) * 25;
          pts.push({ x: sx, y: sy, vx: 0, vy: 0, hx, hy, sx, sy });
        }

        threads.push({
          pts,
          delay: (i / N_OUTER) * 400,
          lw: 0.8 + Math.random() * 0.7,
          alpha: 0.45 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(segs / 2),
          isBroken: false,
          breakTime: 0,
        });
      }

      // ── 2. Detailed India Subcontinent & Crown (Centered in upper-mid) ─────

      // Detailed Indian Coastline & Border Path
      const indiaCoastline = [
        { lon: 68.7, lat: 23.8 }, // Kutch, Gujarat
        { lon: 70.2, lat: 22.5 }, // Kathiawar peninsula
        { lon: 72.8, lat: 21.2 }, // Gulf of Khambhat
        { lon: 72.8, lat: 19.1 }, // Mumbai / Konkan Coast
        { lon: 73.8, lat: 15.4 }, // Goa
        { lon: 74.8, lat: 12.9 }, // Mangalore
        { lon: 76.2, lat: 9.9 },  // Kochi / Malabar
        { lon: 77.5, lat: 8.1 },  // Kanyakumari (Cape Comorin)
        { lon: 79.8, lat: 10.8 }, // Point Calimere
        { lon: 80.3, lat: 13.1 }, // Chennai / Coromandel
        { lon: 81.8, lat: 15.8 }, // Andhra Pradesh Coast
        { lon: 83.3, lat: 17.7 }, // Visakhapatnam
        { lon: 85.8, lat: 19.8 }, // Puri / Odisha
        { lon: 88.3, lat: 21.6 }, // Sundarbans / West Bengal
        { lon: 91.8, lat: 24.5 }, // Bangladesh / Meghalaya border
        { lon: 95.0, lat: 27.5 }, // Assam / Northeast border
        { lon: 88.6, lat: 27.3 }, // Sikkim / Himalayas
        { lon: 85.0, lat: 27.8 }, // Nepal border
        { lon: 81.0, lat: 30.0 }, // Uttarakhand Himalayas
        { lon: 76.5, lat: 32.5 }, // Himachal Pradesh
        { lon: 74.8, lat: 34.5 }, // Kashmir / Crown of India
        { lon: 71.5, lat: 30.2 }, // Punjab / Frontier
        { lon: 69.5, lat: 26.8 }, // Thar Desert / Rajasthan
        { lon: 68.7, lat: 23.8 }, // Back to Kutch
      ];

      // Add 4 layered thread strands for the Indian Peninsula outline
      for (let offset = -0.8; offset <= 0.8; offset += 0.5) {
        const path2D = indiaCoastline.map((g) =>
          geoTo2D(g.lon + offset, g.lat + offset * 0.4)
        );
        addThreadPath(path2D, 0.80, 1.3, 30);
      }

      // Himalayas Mountain Chain Threads (3 sweeping arcs across Northern India)
      const himalayas1 = [
        { lon: 71.0, lat: 35.5 }, // Karakoram / Pamir
        { lon: 75.0, lat: 34.0 }, // Kashmir Himalayas
        { lon: 80.0, lat: 30.5 }, // Uttarakhand / Nepal
        { lon: 88.0, lat: 28.0 }, // Everest region
        { lon: 95.0, lat: 28.5 }, // Arunachal Himalayas
      ];
      addThreadPath(himalayas1.map((g) => geoTo2D(g.lon, g.lat)), 0.70, 1.1, 24);
      addThreadPath(himalayas1.map((g) => geoTo2D(g.lon + 0.4, g.lat - 0.5)), 0.60, 0.95, 24);
      addThreadPath(himalayas1.map((g) => geoTo2D(g.lon - 0.4, g.lat + 0.5)), 0.50, 0.85, 24);

      // Western & Eastern Ghats Ridge Threads
      const westernGhats = [
        { lon: 73.0, lat: 20.5 },
        { lon: 73.8, lat: 16.5 },
        { lon: 75.5, lat: 12.0 },
        { lon: 77.0, lat: 8.8 },
      ];
      addThreadPath(westernGhats.map((g) => geoTo2D(g.lon, g.lat)), 0.60, 0.9, 16);

      const easternGhats = [
        { lon: 87.0, lat: 21.0 },
        { lon: 83.0, lat: 18.0 },
        { lon: 80.0, lat: 14.0 },
        { lon: 78.5, lat: 11.5 },
      ];
      addThreadPath(easternGhats.map((g) => geoTo2D(g.lon, g.lat)), 0.55, 0.85, 16);

      // Sri Lanka Island Thread
      const sriLanka = [
        { lon: 79.8, lat: 9.8 },
        { lon: 81.8, lat: 8.5 },
        { lon: 81.2, lat: 6.0 }, // Southern tip
        { lon: 79.7, lat: 6.9 }, // Colombo
        { lon: 79.8, lat: 9.8 },
      ];
      addThreadPath(sriLanka.map((g) => geoTo2D(g.lon, g.lat)), 0.75, 1.1, 14);

      // ── 3. Arabian Peninsula & Red Sea / Persian Gulf (West / Left) ────────

      // Red Sea Strip
      const redSeaWest = [
        { lon: 32.5, lat: 29.8 }, // Suez
        { lon: 35.0, lat: 25.0 }, // Egypt coast
        { lon: 38.5, lat: 18.0 }, // Sudan coast
        { lon: 43.0, lat: 12.6 }, // Bab-el-Mandeb
      ];
      addThreadPath(redSeaWest.map((g) => geoTo2D(g.lon, g.lat)), 0.45, 0.8, 16);

      // Arabian Peninsula Coastline (Yemen, Oman, UAE, Persian Gulf)
      const arabiaCoast = [
        { lon: 43.5, lat: 12.6 }, // Bab-el-Mandeb
        { lon: 45.0, lat: 12.8 }, // Aden / Yemen
        { lon: 54.0, lat: 17.0 }, // Dhofar / Oman
        { lon: 59.8, lat: 22.5 }, // Ras al Hadd / Oman tip
        { lon: 56.5, lat: 26.0 }, // Strait of Hormuz
        { lon: 50.0, lat: 27.0 }, // Persian Gulf / Qatar
        { lon: 48.0, lat: 30.0 }, // Kuwait / Shatt al-Arab
      ];
      addThreadPath(arabiaCoast.map((g) => geoTo2D(g.lon, g.lat)), 0.55, 0.9, 22);

      // Horn of Africa & East Africa Coast
      const hornOfAfrica = [
        { lon: 43.0, lat: 11.5 }, // Djibouti
        { lon: 51.2, lat: 11.8 }, // Cape Guardafui (Horn tip)
        { lon: 49.0, lat: 8.0 },  // Somalia coast
        { lon: 41.0, lat: -2.0 }, // Kenya coast
        { lon: 39.0, lat: -6.0 }, // Tanzania / Zanzibar
      ];
      addThreadPath(hornOfAfrica.map((g) => geoTo2D(g.lon, g.lat)), 0.55, 0.9, 20);

      // Madagascar Island (Lower-Left)
      const madagascar = [
        { lon: 49.2, lat: -12.0 }, // North tip
        { lon: 50.5, lat: -16.0 },
        { lon: 47.0, lat: -25.0 }, // South tip
        { lon: 43.5, lat: -23.0 },
        { lon: 49.2, lat: -12.0 },
      ];
      addThreadPath(madagascar.map((g) => geoTo2D(g.lon, g.lat)), 0.45, 0.8, 16);

      // ── 4. Southeast Asia & Indonesian Archipelago (East / Right) ──────────

      // Indochina Coastline (Myanmar, Thailand, Vietnam)
      const indochina = [
        { lon: 92.5, lat: 20.5 }, // Myanmar / Rakhine
        { lon: 97.5, lat: 16.0 }, // Gulf of Martaban
        { lon: 98.5, lat: 10.0 }, // Kra Isthmus
        { lon: 103.8, lat: 1.3 }, // Singapore / Malacca Strait
        { lon: 105.0, lat: 9.0 }, // Mekong Delta / Vietnam
        { lon: 109.0, lat: 13.5 }, // Vietnam coast
        { lon: 108.0, lat: 16.0 }, // Da Nang
      ];
      addThreadPath(indochina.map((g) => geoTo2D(g.lon, g.lat)), 0.55, 0.9, 22);

      // Sumatra Island Diagonal Arc
      const sumatra = [
        { lon: 95.3, lat: 5.5 },  // Banda Aceh
        { lon: 98.6, lat: 3.0 },  // Medan
        { lon: 102.0, lat: -2.0 },
        { lon: 106.0, lat: -6.0 }, // Sunda Strait
      ];
      addThreadPath(sumatra.map((g) => geoTo2D(g.lon, g.lat)), 0.50, 0.85, 16);

      // Java Island Arc
      const java = [
        { lon: 106.0, lat: -6.0 }, // Jakarta
        { lon: 110.0, lat: -7.0 }, // Semarang
        { lon: 114.5, lat: -8.5 }, // Bali Strait
      ];
      addThreadPath(java.map((g) => geoTo2D(g.lon, g.lat)), 0.45, 0.8, 14);

      // Borneo Island Contour
      const borneo = [
        { lon: 109.0, lat: 2.0 },
        { lon: 117.0, lat: 7.0 }, // Sabah
        { lon: 119.0, lat: 4.0 },
        { lon: 117.0, lat: -4.0 },
        { lon: 109.0, lat: 2.0 },
      ];
      addThreadPath(borneo.map((g) => geoTo2D(g.lon, g.lat)), 0.45, 0.8, 16);

      // ── 5. Central Asia & Caspian / Persian Gulf (Top-Left) ────────────────

      // Caspian Sea Outline
      const caspianSea = [
        { lon: 50.0, lat: 37.0 }, // Iran coast
        { lon: 53.0, lat: 40.0 }, // Turkmenistan coast
        { lon: 51.5, lat: 46.5 }, // Volga Delta / Russia
        { lon: 47.0, lat: 41.5 }, // Baku / Azerbaijan
        { lon: 50.0, lat: 37.0 },
      ];
      addThreadPath(caspianSea.map((g) => geoTo2D(g.lon, g.lat)), 0.45, 0.8, 16);

      // ── 6. Earth Spatial Graticule Lines (Latitude / Longitude Arcs) ────────

      // Tropic of Cancer (23.5°N) passing right across Kutch, Madhya Pradesh & Mizoram
      const tropicOfCancer = [];
      for (let lon = 25; lon <= 125; lon += 4) {
        tropicOfCancer.push(geoTo2D(lon, 23.5));
      }
      addThreadPath(tropicOfCancer, 0.35, 0.65, 26);

      // Equator (0° Latitude) across the Indian Ocean
      const equator = [];
      for (let lon = 25; lon <= 125; lon += 4) {
        equator.push(geoTo2D(lon, 0.0));
      }
      addThreadPath(equator, 0.32, 0.65, 26);

      // 30°N Latitude (Across Himalayas & Middle East)
      const lat30N = [];
      for (let lon = 25; lon <= 125; lon += 4) {
        lat30N.push(geoTo2D(lon, 30.0));
      }
      addThreadPath(lat30N, 0.32, 0.65, 26);

      // Central Meridian 78°E (Running straight down through India)
      const meridian78E = [];
      for (let lat = -35; lat <= 60; lat += 4) {
        meridian78E.push(geoTo2D(78.0, lat));
      }
      addThreadPath(meridian78E, 0.32, 0.65, 26);

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
        if (localTime < 0) continue;

        const rawProgress = Math.min(localTime / 1400, 1);
        const easeIntro = 1 - Math.pow(1 - rawProgress, 3);

        const breath = Math.sin(now * 0.0008 + th.phase) * 1.2 * easeIntro;
        const N = th.pts.length;

        // Check for thread snapping if pulled too far
        if (th.isHooked && mx > -500) {
          const p = th.pts[th.hookPtIdx];
          const stretchDist = Math.hypot(mx - p.hx, my - p.hy);

          if (stretchDist > BREAK_DIST) {
            th.isHooked = false;
            th.isBroken = true;
            th.breakTime = now;

            for (let s = 0; s < N; s++) {
              const pt = th.pts[s];
              pt.vx += (pt.hx - pt.x) * 0.16;
              pt.vy += (pt.hy - pt.y) * 0.16;
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
            const targetX = p.hx + Math.cos(angle) * breath;
            const targetY = p.hy + Math.sin(angle) * breath;

            if (rawProgress < 1.0) {
              const curTargetX = p.sx + (targetX - p.sx) * easeIntro;
              const curTargetY = p.sy + (targetY - p.sy) * easeIntro;
              p.x += (curTargetX - p.x) * 0.15;
              p.y += (curTargetY - p.y) * 0.15;
              p.vx = 0;
              p.vy = 0;
            } else {
              p.vx += (targetX - p.x) * K_HOME;
              p.vy += (targetY - p.y) * K_HOME;

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
      aria-label="Interactive 2D thread map of Earth matching reference image (India, Horn of Africa, Southeast Asia, Himalayas) framed in red circular emblem"
      role="img"
    />
  );
}
