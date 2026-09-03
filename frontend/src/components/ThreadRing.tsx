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

    // Mathematical 3D -> 2D Orthographic Globe Projection centered on India (15°N, 75°E)
    // Matches the exact perspective of the user's reference photograph!
    const projectGeo = (lonDeg: number, latDeg: number): { x: number; y: number; visible: boolean } => {
      const lon0 = (75.0 * Math.PI) / 180.0;
      const lat0 = (15.0 * Math.PI) / 180.0;

      const lon = (lonDeg * Math.PI) / 180.0;
      const lat = (latDeg * Math.PI) / 180.0;

      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const cosLat0 = Math.cos(lat0);
      const sinLat0 = Math.sin(lat0);
      const dLon = lon - lon0;
      const cosDLon = Math.cos(dLon);

      // Check visibility on front hemisphere
      const cosC = sinLat0 * sinLat + cosLat0 * cosLat * cosDLon;
      if (cosC < 0) {
        return { x: cx, y: cy, visible: false };
      }

      // Orthographic coordinates
      const px = R * cosLat * Math.sin(dLon);
      const py = -R * (cosLat0 * sinLat - sinLat0 * cosLat * cosDLon);

      return { x: cx + px, y: cy + py, visible: true };
    };

    const build = () => {
      threads = [];
      let threadId = 0;

      const addGeoThreadPath = (
        geoPts: { lon: number; lat: number }[],
        alpha: number = 0.55,
        lw: number = 0.95,
        subdivide: number = 22
      ) => {
        // Project all geographic points
        const projPts = geoPts
          .map((g) => projectGeo(g.lon, g.lat))
          .filter((p) => p.visible);

        if (projPts.length < 2) return;

        const pts: Pt[] = [];
        const totalSegments = projPts.length - 1;

        for (let i = 0; i < subdivide; i++) {
          const tGlobal = i / (subdivide - 1);
          const segFloat = tGlobal * totalSegments;
          const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
          const tSeg = segFloat - segIdx;

          const p1 = projPts[segIdx];
          const p2 = projPts[Math.min(segIdx + 1, totalSegments - 1)];

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
          delay: (threadId++ % 65) * 14,
          lw: lw + (Math.random() - 0.5) * 0.2,
          alpha: alpha + (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(subdivide / 2),
          isBroken: false,
          breakTime: 0,
        });
      };

      // ── 1. Outer Ring Threads (Red Circle Frame from logo) ──────────────────
      const N_OUTER = 55;
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

      // ── 2. Accurate India Subcontinent & Himalayas (Centered) ─────────────

      // Detailed Indian Subcontinent Boundary
      const indiaSubcontinent = [
        { lon: 68.2, lat: 23.7 }, // Kutch / Lakhpat
        { lon: 70.0, lat: 22.8 }, // Rann of Kutch
        { lon: 69.0, lat: 21.5 }, // Kathiawar West
        { lon: 71.0, lat: 20.7 }, // Diu / Gir
        { lon: 72.8, lat: 21.2 }, // Gulf of Khambhat
        { lon: 72.8, lat: 19.0 }, // Mumbai
        { lon: 73.8, lat: 15.4 }, // Goa
        { lon: 74.8, lat: 12.8 }, // Mangalore
        { lon: 75.8, lat: 11.2 }, // Kozhikode / Malabar
        { lon: 76.5, lat: 9.5 },  // Alappuzha
        { lon: 77.5, lat: 8.1 },  // Kanyakumari
        { lon: 78.2, lat: 8.8 },  // Tirunelveli
        { lon: 79.8, lat: 10.3 }, // Point Calimere
        { lon: 79.8, lat: 11.9 }, // Puducherry
        { lon: 80.3, lat: 13.1 }, // Chennai
        { lon: 80.8, lat: 15.8 }, // Nellore / AP
        { lon: 82.2, lat: 16.9 }, // Kakinada / Godavari Delta
        { lon: 83.3, lat: 17.7 }, // Visakhapatnam
        { lon: 85.0, lat: 19.3 }, // Chilika Lake
        { lon: 86.8, lat: 21.0 }, // Balasore / Odisha
        { lon: 88.2, lat: 21.6 }, // Sundarbans
        { lon: 91.8, lat: 22.3 }, // Chittagong
        { lon: 92.5, lat: 25.0 }, // Meghalaya / Assam
        { lon: 95.0, lat: 27.5 }, // Arunachal Pradesh
        { lon: 88.6, lat: 27.3 }, // Sikkim / Kanchenjunga
        { lon: 85.3, lat: 27.7 }, // Nepal / Kathmandu
        { lon: 81.0, lat: 30.0 }, // Uttarakhand / Nanda Devi
        { lon: 77.0, lat: 31.8 }, // Himachal Pradesh
        { lon: 74.8, lat: 34.1 }, // Kashmir / Srinagar
        { lon: 73.8, lat: 34.8 }, // Gilgit / Nanga Parbat
        { lon: 71.0, lat: 30.0 }, // Punjab / Indus Plain
        { lon: 69.8, lat: 26.5 }, // Jaisalmer / Rajasthan
        { lon: 68.2, lat: 23.7 }, // Back to Kutch
      ];

      // Add 4 layered thread strands for high visual density along India's border
      for (let offset = -0.6; offset <= 0.6; offset += 0.4) {
        const path = indiaSubcontinent.map((g) => ({
          lon: g.lon + offset,
          lat: g.lat + offset * 0.3,
        }));
        addGeoThreadPath(path, 0.82, 1.35, 32);
      }

      // Himalayas Mountain Ranges (3 Parallel Mountain Crest Strands)
      const mainHimalayas = [
        { lon: 72.0, lat: 35.8 }, // Hindu Kush / Karakoram
        { lon: 75.5, lat: 34.2 }, // Ladakh / Zanskar
        { lon: 80.5, lat: 30.2 }, // Uttarakhand
        { lon: 85.0, lat: 28.2 }, // Annapurna / Everest
        { lon: 88.5, lat: 27.6 }, // Kanchenjunga
        { lon: 94.5, lat: 28.5 }, // Namcha Barwa
      ];
      addGeoThreadPath(mainHimalayas, 0.75, 1.25, 26);
      addGeoThreadPath(mainHimalayas.map((g) => ({ lon: g.lon, lat: g.lat - 0.7 })), 0.65, 1.0, 26);
      addGeoThreadPath(mainHimalayas.map((g) => ({ lon: g.lon, lat: g.lat + 0.8 })), 0.55, 0.9, 26);

      // Western Ghats Mountain Ridge
      const westernGhats = [
        { lon: 73.2, lat: 20.2 },
        { lon: 73.8, lat: 16.5 },
        { lon: 75.5, lat: 12.0 },
        { lon: 77.0, lat: 8.8 },
      ];
      addGeoThreadPath(westernGhats, 0.65, 1.0, 18);

      // Eastern Ghats Mountain Ridge
      const easternGhats = [
        { lon: 86.5, lat: 21.2 },
        { lon: 83.0, lat: 18.0 },
        { lon: 80.0, lat: 14.2 },
        { lon: 78.5, lat: 11.5 },
      ];
      addGeoThreadPath(easternGhats, 0.60, 0.9, 18);

      // Sri Lanka Teardrop Island
      const sriLanka = [
        { lon: 79.8, lat: 9.8 },
        { lon: 81.8, lat: 8.5 },
        { lon: 81.2, lat: 6.0 }, // Dondra Head
        { lon: 79.8, lat: 6.9 }, // Colombo
        { lon: 79.8, lat: 9.8 },
      ];
      addGeoThreadPath(sriLanka, 0.78, 1.2, 16);

      // ── 3. Arabian Peninsula & Red Sea / Persian Gulf (West / Upper-Left) ──

      // Red Sea Strip
      const redSeaEast = [
        { lon: 32.5, lat: 29.9 }, // Suez
        { lon: 35.0, lat: 27.5 },
        { lon: 39.0, lat: 21.5 }, // Jeddah
        { lon: 43.0, lat: 12.6 }, // Bab-el-Mandeb
      ];
      addGeoThreadPath(redSeaEast, 0.55, 0.9, 18);

      // Arabian Peninsula Coastline
      const arabiaCoast = [
        { lon: 43.2, lat: 12.6 }, // Bab-el-Mandeb
        { lon: 45.0, lat: 12.8 }, // Aden
        { lon: 53.0, lat: 16.5 }, // Salalah / Oman
        { lon: 59.8, lat: 22.5 }, // Ras al Hadd
        { lon: 56.5, lat: 26.2 }, // Strait of Hormuz
        { lon: 50.5, lat: 26.0 }, // Qatar / Gulf
        { lon: 48.0, lat: 30.0 }, // Kuwait
      ];
      addGeoThreadPath(arabiaCoast, 0.60, 0.95, 22);

      // Horn of Africa & East Africa (Lower-Left)
      const hornOfAfrica = [
        { lon: 43.0, lat: 11.6 }, // Djibouti
        { lon: 51.2, lat: 11.8 }, // Cape Guardafui
        { lon: 49.0, lat: 8.0 },  // Somalia coast
        { lon: 41.5, lat: -1.5 }, // Kenya / Mombasa
        { lon: 39.0, lat: -6.0 }, // Tanzania / Zanzibar
        { lon: 40.5, lat: -15.0 }, // Mozambique
      ];
      addGeoThreadPath(hornOfAfrica, 0.58, 0.9, 22);

      // Madagascar Island
      const madagascar = [
        { lon: 49.2, lat: -12.0 },
        { lon: 50.5, lat: -16.0 },
        { lon: 47.0, lat: -25.0 },
        { lon: 43.5, lat: -23.0 },
        { lon: 49.2, lat: -12.0 },
      ];
      addGeoThreadPath(madagascar, 0.50, 0.85, 18);

      // ── 4. Southeast Asia & Indonesian Archipelago (East / Right) ──────────

      // Indochina Peninsula & Vietnam Coast
      const indochinaCoast = [
        { lon: 92.5, lat: 20.5 }, // Myanmar
        { lon: 97.5, lat: 16.0 }, // Yangon
        { lon: 98.5, lat: 9.8 },  // Kra Isthmus
        { lon: 103.8, lat: 1.3 }, // Singapore
        { lon: 104.5, lat: 10.0 }, // Gulf of Thailand
        { lon: 107.0, lat: 10.5 }, // Saigon / Mekong Delta
        { lon: 109.2, lat: 13.5 }, // Vietnam East Coast
        { lon: 108.0, lat: 16.5 }, // Da Nang
        { lon: 106.5, lat: 20.8 }, // Hanoi / Haiphong
      ];
      addGeoThreadPath(indochinaCoast, 0.60, 0.95, 24);

      // Sumatra Island Arc
      const sumatra = [
        { lon: 95.3, lat: 5.5 },  // Banda Aceh
        { lon: 98.6, lat: 3.5 },  // Medan
        { lon: 102.0, lat: -2.0 },
        { lon: 106.0, lat: -6.0 }, // Sunda Strait
      ];
      addGeoThreadPath(sumatra, 0.55, 0.9, 18);

      // Java Island Arc
      const java = [
        { lon: 106.0, lat: -6.0 }, // Jakarta
        { lon: 110.0, lat: -7.0 }, // Semarang
        { lon: 114.5, lat: -8.5 }, // Bali Strait
      ];
      addGeoThreadPath(java, 0.50, 0.85, 16);

      // Borneo Island Contour
      const borneo = [
        { lon: 109.0, lat: 2.0 },
        { lon: 114.0, lat: 4.5 },
        { lon: 118.0, lat: 5.0 }, // Sabah
        { lon: 117.0, lat: -4.0 },
        { lon: 109.0, lat: 2.0 },
      ];
      addGeoThreadPath(borneo, 0.50, 0.85, 18);

      // Philippines Island Arc (Upper-Right)
      const philippines = [
        { lon: 120.0, lat: 18.5 }, // Luzon / Manila
        { lon: 123.0, lat: 11.5 }, // Visayas
        { lon: 125.0, lat: 7.0 },  // Mindanao
      ];
      addGeoThreadPath(philippines, 0.45, 0.8, 16);

      // ── 5. Central Asia & Caspian / Aral Seas (Top-Left) ───────────────────

      // Caspian Sea Contour
      const caspianSea = [
        { lon: 50.0, lat: 37.0 }, // Iran
        { lon: 53.0, lat: 40.0 }, // Turkmenistan
        { lon: 51.5, lat: 46.5 }, // Volga / Russia
        { lon: 47.0, lat: 41.5 }, // Azerbaijan
        { lon: 50.0, lat: 37.0 },
      ];
      addGeoThreadPath(caspianSea, 0.48, 0.85, 18);

      // China East Coastline (Top-Right)
      const chinaCoast = [
        { lon: 108.5, lat: 21.5 }, // Guangxi
        { lon: 113.5, lat: 22.5 }, // Hong Kong / Pearl River Delta
        { lon: 118.0, lat: 24.5 }, // Taiwan Strait
        { lon: 121.5, lat: 31.2 }, // Shanghai / Yangtze Delta
      ];
      addGeoThreadPath(chinaCoast, 0.45, 0.8, 18);

      // ── 6. Graticule Arcs (Equator, Tropics & Central Meridian) ────────────

      // Tropic of Cancer (23.5°N)
      const tropicOfCancer = [];
      for (let lon = 20; lon <= 130; lon += 4) {
        tropicOfCancer.push({ lon, lat: 23.5 });
      }
      addGeoThreadPath(tropicOfCancer, 0.35, 0.65, 28);

      // Equator (0° Latitude)
      const equator = [];
      for (let lon = 20; lon <= 130; lon += 4) {
        equator.push({ lon, lat: 0.0 });
      }
      addGeoThreadPath(equator, 0.32, 0.65, 28);

      // 30°N Latitude Arc
      const lat30N = [];
      for (let lon = 20; lon <= 130; lon += 4) {
        lat30N.push({ lon, lat: 30.0 });
      }
      addGeoThreadPath(lat30N, 0.32, 0.65, 28);

      // Central Meridian 75°E (Running straight down through India)
      const meridian75E = [];
      for (let lat = -40; lat <= 65; lat += 4) {
        meridian75E.push({ lon: 75.0, lat });
      }
      addGeoThreadPath(meridian75E, 0.32, 0.65, 28);

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
      aria-label="High-precision 2D orthographic thread map of Earth matching reference photo (India, Himalayas, Sri Lanka, Horn of Africa, Indochina) framed in red emblem — click and hold to grab and pull threads apart"
      role="img"
    />
  );
}
