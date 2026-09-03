"use client";

import { useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const RING_FRAC   = 0.38;      // ring radius fraction of min(W, H)

// Physics Constants
const K_HOME      = 0.08;      // spring force pulling particles back to map home
const K_LINK      = 0.16;      // link spring along thread
const DAMPING     = 0.83;      // smooth damping
const MAX_SPEED   = 11;        // speed cap (px/frame)

// Drag, Grab & Break
const HOOK_RADIUS = 40;        // grab radius around cursor (px)
const MAX_HOOKS   = 16;        // max threads grabbed simultaneously
const BREAK_DIST  = 160;       // max stretch before thread snaps
const REPAIR_MS   = 1200;      // ms to re-knit snapped thread

// Weaving Intro Timings (Slow, progressive thread-by-thread formation)
const WEAVE_TOTAL_MS  = 6500;  // 6.5s total to weave all threads thread-by-thread
const THREAD_DRAW_MS = 320;   // 320ms for an individual thread to unfurl from end to end

// Terracotta Red color matching favicon (#bf4722)
const ACC_R = 191, ACC_G = 71, ACC_B = 34;

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // Target home X on 2D India Earth map
  hy: number; // Target home Y on 2D India Earth map
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

    // Mathematical 3D -> 2D Orthographic Globe Projection centered on India (16°N, 78°E)
    // Matches the exact perspective of the user's reference photograph!
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

        for (let i = 0; i < subdivide; i++) {
          const tGlobal = i / (subdivide - 1);
          const segFloat = tGlobal * totalSegments;
          const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
          const tSeg = segFloat - segIdx;

          const p1 = projPts[segIdx];
          const p2 = projPts[Math.min(segIdx + 1, totalSegments - 1)];

          const hx = p1.x + (p2.x - p1.x) * tSeg;
          const hy = p1.y + (p2.y - p1.y) * tSeg;

          pts.push({ x: hx, y: hy, vx: 0, vy: 0, hx, hy });
        }

        threads.push({
          pts,
          delay: 0, // Delay set after build
          lw: lw + (Math.random() - 0.5) * 0.2,
          alpha: alpha + (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(subdivide / 2),
          isBroken: false,
          breakTime: 0,
        });
      };

      // ── 1. Outer Ring Threads (Red Circle Frame matching logo) ─────────────
      const N_OUTER = 50;
      for (let i = 0; i < N_OUTER; i++) {
        const baseAngle = (i / N_OUTER) * Math.PI * 2;
        const threadR = R + (Math.random() - 0.5) * 14;
        const arcSpan = Math.PI * 0.85;
        const pts: Pt[] = [];
        const segs = 18;

        for (let s = 0; s < segs; s++) {
          const t = s / (segs - 1);
          const angle = baseAngle + (t - 0.5) * arcSpan;
          const hx = cx + threadR * Math.cos(angle);
          const hy = cy + threadR * Math.sin(angle);
          pts.push({ x: hx, y: hy, vx: 0, vy: 0, hx, hy });
        }

        threads.push({
          pts,
          delay: 0,
          lw: 0.8 + Math.random() * 0.7,
          alpha: 0.45 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          isHooked: false,
          hookPtIdx: Math.floor(segs / 2),
          isBroken: false,
          breakTime: 0,
        });
      }

      // ── 2. Highly Detailed India Subcontinent & Rivers ──────────────────────
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
        addGeoThreadPath(path, 0.85, 1.4, 34);
      }

      // Major Indian Rivers
      addGeoThreadPath([
        { lon: 79.0, lat: 31.0 }, { lon: 78.1, lat: 30.0 }, { lon: 79.5, lat: 28.5 },
        { lon: 81.8, lat: 25.4 }, { lon: 85.1, lat: 25.6 }, { lon: 88.0, lat: 24.5 },
        { lon: 89.5, lat: 23.0 }, { lon: 88.3, lat: 21.8 },
      ], 0.65, 1.0, 24); // Ganga

      addGeoThreadPath([
        { lon: 82.0, lat: 30.6 }, { lon: 87.0, lat: 29.2 }, { lon: 95.0, lat: 28.2 },
        { lon: 95.5, lat: 27.5 }, { lon: 91.5, lat: 26.2 }, { lon: 89.8, lat: 25.2 },
      ], 0.65, 1.0, 24); // Brahmaputra

      addGeoThreadPath([
        { lon: 81.0, lat: 31.0 }, { lon: 76.0, lat: 34.5 }, { lon: 73.0, lat: 35.5 },
        { lon: 71.5, lat: 33.0 }, { lon: 70.0, lat: 28.0 }, { lon: 68.0, lat: 24.0 },
      ], 0.65, 1.0, 22); // Indus

      // Himalayas Crest
      const himalayasCrest = [
        { lon: 71.5, lat: 35.8 }, { lon: 75.5, lat: 34.2 }, { lon: 80.5, lat: 30.2 },
        { lon: 85.0, lat: 28.2 }, { lon: 88.5, lat: 27.6 }, { lon: 95.0, lat: 28.5 },
      ];
      addGeoThreadPath(himalayasCrest, 0.78, 1.3, 26);
      addGeoThreadPath(himalayasCrest.map(g => ({ lon: g.lon, lat: g.lat - 0.6 })), 0.68, 1.0, 26);

      // Western & Eastern Ghats
      addGeoThreadPath([
        { lon: 73.2, lat: 20.2 }, { lon: 73.8, lat: 16.5 }, { lon: 75.5, lat: 12.0 }, { lon: 77.0, lat: 8.8 },
      ], 0.68, 1.05, 18);
      addGeoThreadPath([
        { lon: 86.5, lat: 21.2 }, { lon: 83.0, lat: 18.0 }, { lon: 80.0, lat: 14.2 }, { lon: 78.5, lat: 11.5 },
      ], 0.62, 0.95, 18);

      // Sri Lanka
      const sriLanka = [
        { lon: 79.8, lat: 9.8 }, { lon: 81.8, lat: 8.5 }, { lon: 81.2, lat: 6.0 },
        { lon: 79.7, lat: 6.9 }, { lon: 79.8, lat: 9.8 },
      ];
      addGeoThreadPath(sriLanka, 0.78, 1.2, 16);

      // ── 3. High-Detail Arabian Peninsula & Middle East ──────────────────────

      // Red Sea East (Arabia)
      const redSeaEast = [
        { lon: 32.5, lat: 29.9 }, { lon: 34.8, lat: 27.8 }, { lon: 37.0, lat: 24.5 },
        { lon: 39.1, lat: 21.5 }, { lon: 41.5, lat: 16.5 }, { lon: 43.0, lat: 12.6 },
      ];
      addGeoThreadPath(redSeaEast, 0.65, 1.0, 22);

      // Red Sea West (Africa)
      const redSeaWest = [
        { lon: 32.2, lat: 29.5 }, { lon: 34.0, lat: 27.0 }, { lon: 36.8, lat: 21.0 },
        { lon: 38.5, lat: 18.0 }, { lon: 42.5, lat: 13.0 },
      ];
      addGeoThreadPath(redSeaWest, 0.60, 0.9, 20);

      // Southern Arabia (Yemen & Oman Coastline)
      const southArabia = [
        { lon: 43.2, lat: 12.6 }, { lon: 45.0, lat: 12.8 }, { lon: 48.0, lat: 14.0 },
        { lon: 52.0, lat: 15.5 }, { lon: 54.0, lat: 17.0 }, { lon: 58.0, lat: 20.5 },
        { lon: 59.8, lat: 22.5 }, { lon: 58.8, lat: 23.6 },
      ];
      addGeoThreadPath(southArabia, 0.65, 1.0, 24);

      // Persian Gulf Coastline (UAE, Qatar, Kuwait, Iraq, Iran)
      const persianGulfSouth = [
        { lon: 59.8, lat: 22.5 }, { lon: 56.5, lat: 26.2 }, { lon: 55.0, lat: 25.0 },
        { lon: 51.5, lat: 25.3 }, { lon: 50.8, lat: 26.0 }, { lon: 50.0, lat: 27.0 },
        { lon: 48.5, lat: 29.5 }, { lon: 48.0, lat: 30.0 },
      ];
      addGeoThreadPath(persianGulfSouth, 0.62, 0.95, 22);

      const persianGulfNorth = [
        { lon: 48.0, lat: 30.0 }, { lon: 50.0, lat: 29.5 }, { lon: 52.5, lat: 27.5 },
        { lon: 56.5, lat: 27.0 }, { lon: 56.5, lat: 26.2 }, { lon: 60.5, lat: 25.3 },
        { lon: 62.5, lat: 25.2 }, { lon: 67.0, lat: 24.8 },
      ];
      addGeoThreadPath(persianGulfNorth, 0.62, 0.95, 24);

      // Rub' al Khali (Empty Quarter) Sand Dunes Arcs
      addGeoThreadPath([
        { lon: 46.0, lat: 22.0 }, { lon: 50.0, lat: 20.0 }, { lon: 54.0, lat: 21.5 },
      ], 0.42, 0.75, 16);

      // ── 4. High-Detail Africa & Horn of Africa ─────────────────────────────

      // Nile River & Delta
      const nileRiver = [
        { lon: 33.0, lat: 4.0 }, { lon: 31.8, lat: 9.5 }, { lon: 32.5, lat: 15.6 },
        { lon: 30.5, lat: 19.5 }, { lon: 32.8, lat: 24.0 }, { lon: 31.2, lat: 30.0 },
        { lon: 30.0, lat: 31.3 }, { lon: 31.5, lat: 31.5 }, { lon: 32.3, lat: 31.2 },
      ];
      addGeoThreadPath(nileRiver, 0.68, 1.05, 26);

      // Horn of Africa (Somalia, Djibouti, Ethiopia)
      const hornOfAfrica = [
        { lon: 43.0, lat: 11.6 }, { lon: 46.0, lat: 11.8 }, { lon: 51.2, lat: 11.8 }, // Guardafui
        { lon: 49.0, lat: 8.0 },  { lon: 46.0, lat: 4.0 },  { lon: 41.5, lat: -1.5 },
        { lon: 39.0, lat: -6.0 }, { lon: 40.5, lat: -15.0 }, { lon: 35.0, lat: -24.5 },
      ];
      addGeoThreadPath(hornOfAfrica, 0.65, 1.0, 26);

      // Great Rift Valley Lakes (Victoria, Tanganyika, Malawi)
      addGeoThreadPath([
        { lon: 31.5, lat: -1.0 }, { lon: 33.5, lat: -1.0 }, { lon: 34.0, lat: -2.5 },
        { lon: 32.0, lat: -2.5 }, { lon: 31.5, lat: -1.0 },
      ], 0.50, 0.8, 14); // Lake Victoria

      // Madagascar Island (Detailed Contour)
      const madagascar = [
        { lon: 49.2, lat: -12.0 }, { lon: 50.5, lat: -15.5 }, { lon: 48.5, lat: -20.0 },
        { lon: 47.0, lat: -25.5 }, { lon: 44.0, lat: -25.0 }, { lon: 43.5, lat: -20.0 },
        { lon: 46.5, lat: -15.5 }, { lon: 49.2, lat: -12.0 },
      ];
      addGeoThreadPath(madagascar, 0.60, 0.95, 20);

      // ── 5. High-Detail Indochina & Southeast Asia ──────────────────────────

      // Irrawaddy River & Myanmar Andaman Coast
      const myanmarCoast = [
        { lon: 92.5, lat: 20.8 }, { lon: 94.0, lat: 19.5 }, { lon: 94.5, lat: 16.0 },
        { lon: 96.0, lat: 16.8 }, { lon: 98.0, lat: 15.0 }, { lon: 98.5, lat: 10.0 },
      ];
      addGeoThreadPath(myanmarCoast, 0.62, 0.95, 20);

      // Malay Peninsula (Thailand, Malaysia, Singapore)
      const malayPeninsula = [
        { lon: 98.5, lat: 10.0 }, { lon: 99.8, lat: 7.0 }, { lon: 103.8, lat: 1.3 }, // Singapore
        { lon: 103.5, lat: 1.8 }, { lon: 101.5, lat: 6.0 }, { lon: 100.0, lat: 12.5 },
      ];
      addGeoThreadPath(malayPeninsula, 0.65, 1.0, 22);

      // Mekong River
      const mekongRiver = [
        { lon: 94.0, lat: 33.0 }, { lon: 99.0, lat: 24.0 }, { lon: 101.0, lat: 20.0 },
        { lon: 104.0, lat: 17.0 }, { lon: 105.5, lat: 11.5 }, { lon: 105.0, lat: 9.5 },
      ];
      addGeoThreadPath(mekongRiver, 0.62, 0.95, 22);

      // Vietnam & Gulf of Tonkin Coastline
      const vietnamCoast = [
        { lon: 104.5, lat: 10.0 }, { lon: 107.0, lat: 10.5 }, { lon: 109.2, lat: 13.5 },
        { lon: 108.0, lat: 16.5 }, { lon: 106.5, lat: 20.8 }, { lon: 108.0, lat: 21.5 },
      ];
      addGeoThreadPath(vietnamCoast, 0.65, 1.0, 22);

      // Hainan Island
      const hainan = [
        { lon: 108.6, lat: 19.3 }, { lon: 111.0, lat: 19.8 }, { lon: 110.5, lat: 18.2 },
        { lon: 108.6, lat: 19.3 },
      ];
      addGeoThreadPath(hainan, 0.55, 0.85, 12);

      // ── 6. High-Detail Indonesian Archipelago & Philippines ────────────────

      // Sumatra Island & Barisan Mountain Ridge
      const sumatra = [
        { lon: 95.3, lat: 5.5 },  { lon: 97.5, lat: 4.2 },  { lon: 98.6, lat: 3.5 },
        { lon: 101.0, lat: 0.5 }, { lon: 103.5, lat: -3.0 }, { lon: 106.0, lat: -6.0 },
      ];
      addGeoThreadPath(sumatra, 0.65, 1.0, 20);

      // Java Island Arc (Jakarta to Bali Strait)
      const java = [
        { lon: 106.0, lat: -6.0 }, { lon: 108.5, lat: -6.8 }, { lon: 110.0, lat: -7.0 },
        { lon: 112.5, lat: -7.5 }, { lon: 114.5, lat: -8.5 },
      ];
      addGeoThreadPath(java, 0.62, 0.95, 18);

      // Lesser Sunda Islands (Bali, Lombok, Sumbawa, Flores, Timor)
      addGeoThreadPath([
        { lon: 114.5, lat: -8.5 }, { lon: 116.0, lat: -8.6 }, { lon: 118.0, lat: -8.5 },
        { lon: 121.0, lat: -8.6 }, { lon: 125.0, lat: -9.0 },
      ], 0.55, 0.85, 18);

      // Borneo / Kalimantan Island (Detailed Contour)
      const borneo = [
        { lon: 109.0, lat: 2.0 },  { lon: 112.0, lat: 3.5 },  { lon: 114.0, lat: 4.5 },
        { lon: 118.0, lat: 5.0 },  { lon: 119.0, lat: 4.0 },  { lon: 117.5, lat: -1.0 },
        { lon: 116.0, lat: -4.0 }, { lon: 110.0, lat: -3.0 }, { lon: 109.0, lat: 2.0 },
      ];
      addGeoThreadPath(borneo, 0.60, 0.95, 22);

      // Sulawesi K-Shaped Island
      const sulawesi = [
        { lon: 119.5, lat: -5.0 }, { lon: 119.5, lat: -1.0 }, { lon: 121.0, lat: 1.5 },
        { lon: 125.0, lat: 1.5 },  { lon: 121.0, lat: -3.5 }, { lon: 123.0, lat: -5.0 },
      ];
      addGeoThreadPath(sulawesi, 0.55, 0.85, 18);

      // Philippines Archipelago (Luzon, Visayas, Mindanao)
      const philippinesLuzon = [
        { lon: 120.0, lat: 18.5 }, { lon: 122.0, lat: 18.0 }, { lon: 121.5, lat: 14.5 },
        { lon: 124.0, lat: 13.0 },
      ];
      addGeoThreadPath(philippinesLuzon, 0.55, 0.85, 16);

      const philippinesMindanao = [
        { lon: 122.0, lat: 7.5 }, { lon: 125.5, lat: 9.8 }, { lon: 126.0, lat: 7.0 },
        { lon: 124.5, lat: 6.0 }, { lon: 122.0, lat: 7.5 },
      ];
      addGeoThreadPath(philippinesMindanao, 0.55, 0.85, 16);

      // ── 7. High-Detail East Asia & Central Asia ────────────────────────────

      // Caspian Sea Outline
      const caspianSea = [
        { lon: 50.0, lat: 37.0 }, { lon: 53.0, lat: 40.0 }, { lon: 51.5, lat: 46.5 },
        { lon: 47.0, lat: 41.5 }, { lon: 50.0, lat: 37.0 },
      ];
      addGeoThreadPath(caspianSea, 0.55, 0.9, 18);

      // Yangtze River
      const yangtzeRiver = [
        { lon: 91.0, lat: 33.0 }, { lon: 100.0, lat: 27.0 }, { lon: 107.0, lat: 29.5 },
        { lon: 113.0, lat: 30.5 }, { lon: 121.5, lat: 31.2 },
      ];
      addGeoThreadPath(yangtzeRiver, 0.60, 0.9, 20);

      // Yellow River (Huang He)
      const yellowRiver = [
        { lon: 96.0, lat: 35.0 }, { lon: 103.0, lat: 36.0 }, { lon: 110.0, lat: 38.0 },
        { lon: 118.0, lat: 36.0 },
      ];
      addGeoThreadPath(yellowRiver, 0.55, 0.85, 18);

      // China East Coastline
      const chinaCoast = [
        { lon: 108.5, lat: 21.5 }, { lon: 113.5, lat: 22.5 }, { lon: 118.0, lat: 24.5 },
        { lon: 121.5, lat: 31.2 }, { lon: 120.0, lat: 36.0 }, { lon: 122.0, lat: 39.0 },
      ];
      addGeoThreadPath(chinaCoast, 0.58, 0.9, 22);

      // Taiwan Island
      const taiwan = [
        { lon: 121.5, lat: 25.3 }, { lon: 122.0, lat: 24.0 }, { lon: 120.8, lat: 21.9 },
        { lon: 120.0, lat: 23.5 }, { lon: 121.5, lat: 25.3 },
      ];
      addGeoThreadPath(taiwan, 0.55, 0.85, 12);

      // Korea Peninsula
      const koreaPeninsula = [
        { lon: 124.5, lat: 40.0 }, { lon: 129.0, lat: 38.5 }, { lon: 129.0, lat: 35.0 },
        { lon: 126.5, lat: 34.5 }, { lon: 126.0, lat: 37.5 },
      ];
      addGeoThreadPath(koreaPeninsula, 0.50, 0.85, 16);

      // Japan Main Arc
      const japanHonshu = [
        { lon: 130.5, lat: 33.5 }, { lon: 135.0, lat: 34.5 }, { lon: 139.5, lat: 35.5 },
        { lon: 141.0, lat: 41.0 },
      ];
      addGeoThreadPath(japanHonshu, 0.50, 0.85, 16);

      // ── 8. Earth Graticule Arcs Mesh ───────────────────────────────────────
      const lats = [-30, -15, 0, 15, 23.5, 30, 45];
      for (const lat of lats) {
        const line = [];
        for (let lon = 15; lon <= 140; lon += 3) {
          line.push({ lon, lat });
        }
        addGeoThreadPath(line, lat === 23.5 ? 0.38 : 0.30, 0.65, 30);
      }

      const lons = [30, 45, 60, 75, 90, 105, 120];
      for (const lon of lons) {
        const line = [];
        for (let lat = -45; lat <= 65; lat += 3) {
          line.push({ lon, lat });
        }
        addGeoThreadPath(line, lon === 75 ? 0.38 : 0.30, 0.65, 30);
      }

      // Order thread delays so the entire world map weaves progressively thread-by-thread
      for (let i = 0; i < threads.length; i++) {
        threads[i].delay = (i / threads.length) * WEAVE_TOTAL_MS;
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
        if (localTime < 0) continue;

        const drawProgress = Math.min(localTime / THREAD_DRAW_MS, 1);
        const easeDraw = 1 - Math.pow(1 - drawProgress, 3);

        const breath = Math.sin(now * 0.0008 + th.phase) * 1.2;
        const N = th.pts.length;

        const visiblePtsCount = Math.max(2, Math.floor(N * easeDraw));

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

        const opacity = th.alpha * Math.min(drawProgress * 1.5, 1);
        ctx.strokeStyle = `rgba(${ACC_R},${ACC_G},${ACC_B},${opacity.toFixed(3)})`;
        ctx.lineWidth = th.isHooked ? th.lw * 1.6 : th.lw;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(th.pts[0].x, th.pts[0].y);

        for (let s = 1; s < visiblePtsCount - 1; s++) {
          const midX = (th.pts[s].x + th.pts[s + 1].x) / 2;
          const midY = (th.pts[s].y + th.pts[s + 1].y) / 2;
          ctx.quadraticCurveTo(th.pts[s].x, th.pts[s].y, midX, midY);
        }
        if (visiblePtsCount > 1) {
          ctx.lineTo(th.pts[visiblePtsCount - 1].x, th.pts[visiblePtsCount - 1].y);
        }
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
      aria-label="High-density 2D red thread map of Earth matching reference image — watch all world countries, coastlines, rivers, mountains and graticules weave thread-by-thread over 6.5s. Click and hold to grab and pull threads apart"
      role="img"
    />
  );
}
