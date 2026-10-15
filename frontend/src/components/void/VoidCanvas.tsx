"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ── VAST CURVED METROPOLITAN SPATIAL ENVIRONMENT ──
export const LOOP_LENGTH = 800.0;     // 800m continuous winding corridor with macro satellite reveal
export const ROAD_HALF_WIDTH = 3.6;   // Uniform 7.2m wide avenue matching circuit width exactly
export const CAM_HEIGHT = 1.65;       // Driver / rover eye-level viewpoint

export type ColorMode = "auto" | "lidar" | "heatmap" | "semantic";
export type CameraMode = "cinematic" | "chase" | "hood" | "drone";

export const PALETTE = {
  cyan:        [0.0, 0.88, 1.0],
  cyanBright:  [0.55, 0.98, 1.0],
  teal:        [0.0, 0.62, 0.82],
  tealDim:     [0.06, 0.36, 0.52],
  darkBlue:    [0.04, 0.18, 0.32],
  deepGrid:    [0.03, 0.12, 0.22],
  windowCyan:  [0.20, 0.70, 0.90],
  amber:       [1.0, 0.76, 0.28],
  amberBright: [1.0, 0.88, 0.45],
  warmWhite:   [0.65, 0.88, 0.98],
  redLaser:    [1.0, 0.22, 0.22],
  skylineTeal: [0.08, 0.44, 0.64],
  dust:        [0.12, 0.30, 0.46],
  emerald:     [0.0, 0.92, 0.66],
  neonPink:    [1.0, 0.24, 0.65],
  foliage:     [0.08, 0.78, 0.45],
  laserPurple: [0.65, 0.32, 1.0],
  solarGold:   [1.0, 0.82, 0.18],
} as const;

export interface StoppageState {
  isStopped: boolean;
  pedestrianX: number;
  clearanceProgress: number;
  status: "APPROACHING" | "WAITING" | "CLEARING" | "CLEAR";
}

// ── PARAMETRIC CURVED ROAD SPLINE ──
export function getRoadCenter(z: number): { x: number; dx: number; nx: number; nz: number } {
  const k1 = (2 * Math.PI) / LOOP_LENGTH;
  const k2 = (4 * Math.PI) / LOOP_LENGTH;

  // Sweeping curves reaching negative world X (Screen right) so text has clean space on the left
  const rawX = -24.0 * Math.sin(k1 * z) - 7.5 * Math.sin(k2 * z);
  const rawDx = -24.0 * k1 * Math.cos(k1 * z) - 7.5 * k2 * Math.cos(k2 * z);

  // Smoothly straighten out between z = 450m and 550m so road aligns dead-center at x = 0
  let x = rawX;
  let dx = rawDx;
  if (z >= 450.0) {
    const t = Math.min(1.0, (z - 450.0) / 100.0);
    const ease = t * t * (3.0 - 2.0 * t);
    x = rawX * (1.0 - ease);
    dx = rawDx * (1.0 - ease);
  }

  const len = Math.sqrt(1.0 + dx * dx);
  const nx = -1.0 / len;
  const nz = dx / len;

  return { x, dx, nx, nz };
}

// Helper: converts (lateralOffset, z) to curved (x, z) world coordinates
export function getCurvePoint(latOffset: number, z: number) {
  const rc = getRoadCenter(z);
  return {
    x: rc.x + rc.nx * latOffset,
    z: z + rc.nz * latOffset,
  };
}

// ── CONTINUOUS "earthoslab" HIGHWAY CIRCUIT SPLINE & POINT CLOUD (MODULAR IMPORT) ──
export {
  type CircuitPoint,
  type CircuitPose,
  createEarthosCircuitPolyline,
  EARTHOS_CIRCUIT_SPLINE,
  CIRCUIT_TOTAL_LENGTH,
  getCircuitPose,
  getConnectingRoadPoint,
} from "./earthosCircuit";
import {
  EARTHOS_CIRCUIT_SPLINE,
  getCircuitPose,
  getConnectingRoadPoint,
  getEarthosCircuitPoints,
} from "./earthosCircuit";

// ── BUILD PROCEDURAL COMPLETE CITY WITH MULTI-BLOCK URBAN GRID (~115,000 VOXELS) ──
function buildDiverseCurvedMetropolis() {
  const pos: number[] = [];
  const col: number[] = [];
  const sz: number[] = [];
  const al: number[] = [];
  const cat: number[] = []; // 0=road, 1=building, 2=signs/accents, 3=skyway/infra, 4=stars/actors

  const addPt = (
    x: number,
    y: number,
    z: number,
    color: readonly number[],
    size: number,
    alpha: number,
    category: number = 1.0
  ) => {
    pos.push(x, y, z);
    col.push(color[0], color[1], color[2]);
    sz.push(size);
    al.push(alpha);
    cat.push(category);
  };

  const rnd = () => Math.random();

  // ── 1. MAIN CURVED ARTERIAL AVENUE (Terminates cleanly at 550m before open proving grounds) ──
  // Reconstructed to 100% match the dense LiDAR holographic raster of earthoslab
  for (let z = 0; z <= 550.0; z += 0.45) {
    const curRoadW = ROAD_HALF_WIDTH;
    const curGuideW = curRoadW - 0.35;
    const curLaneW = curRoadW * 0.50;

    const leftCurb = getCurvePoint(curRoadW, z);
    const rightCurb = getCurvePoint(-curRoadW, z);
    const leftGuide = getCurvePoint(curGuideW, z);
    const rightGuide = getCurvePoint(-curGuideW, z);
    const leftLane = getCurvePoint(curLaneW, z);
    const rightLane = getCurvePoint(-curLaneW, z);
    const centerPt = getCurvePoint(0.0, z);

    // Glowing laser curbs (matching earthoslab outer rails)
    addPt(leftCurb.x, 0.04, leftCurb.z, PALETTE.cyanBright, 1.4, 0.88, 0.0);
    addPt(rightCurb.x, 0.04, rightCurb.z, PALETTE.cyanBright, 1.4, 0.88, 0.0);

    // Inner guide rails
    addPt(leftGuide.x, 0.04, leftGuide.z, PALETTE.cyan, 1.25, 0.78, 0.0);
    addPt(rightGuide.x, 0.04, rightGuide.z, PALETTE.cyan, 1.25, 0.78, 0.0);

    // Continuous central guidance track
    addPt(centerPt.x, 0.04, centerPt.z, PALETTE.cyanBright, 1.25, 0.80, 0.0);

    // Mid-lane tracks
    addPt(leftLane.x, 0.04, leftLane.z, PALETTE.teal, 1.15, 0.68, 0.0);
    addPt(rightLane.x, 0.04, rightLane.z, PALETTE.teal, 1.15, 0.68, 0.0);

    // Transverse LiDAR asphalt scan grid (matching earthoslab darkBlue asphalt tone)
    for (let lat = -curRoadW + 0.65; lat <= curRoadW - 0.65; lat += 0.32) {
      if (Math.abs(lat) < 0.18 || Math.abs(Math.abs(lat) - curLaneW) < 0.18) continue;
      const gPt = getCurvePoint(lat, z);
      addPt(gPt.x, 0.03, gPt.z, PALETTE.darkBlue, 0.80, 0.25, 0.0);
    }

    // Regular curb lanterns matching earthoslab light posts (every ~9.2m on both curbs)
    if (z % 9.2 < 0.45) {
      for (const side of [-1, 1]) {
        const lp = getCurvePoint(side * (curRoadW + 0.28), z);
        addPt(lp.x, 0.06, lp.z, PALETTE.warmWhite, 2.4, 1.0, 2.0);
        addPt(lp.x + side * 0.15, 0.06, lp.z, PALETTE.amberBright, 1.6, 0.85, 2.0);
      }
    }
  }

  // ── 1.1 SEAMLESS STRAIGHT CENTRAL AVENUE INTO T-INTERSECTION (550m to 688.5m) ──
  // Dead-center along x = 0: dense holographic road mesh, dual laser curbs, and curb lanterns
  // Terminates cleanly flush with the channelized T-intersection at z = 688.5m
  for (let z = 550.0; z <= 688.5; z += 0.45) {
    const cx = 0.0;
    const cz = z;
    const nx = -1.0;
    const nz = 0.0;

    const curRoadW = ROAD_HALF_WIDTH;
    const curGuideW = curRoadW - 0.35;
    const curLaneW = curRoadW * 0.50;

    // Outer laser curbs
    addPt(cx + nx * curRoadW, 0.04, cz + nz * curRoadW, PALETTE.cyanBright, 1.4, 0.88, 0.0);
    addPt(cx - nx * curRoadW, 0.04, cz - nz * curRoadW, PALETTE.cyanBright, 1.4, 0.88, 0.0);

    // Inner guide rails
    addPt(cx + nx * curGuideW, 0.04, cz + nz * curGuideW, PALETTE.cyan, 1.25, 0.78, 0.0);
    addPt(cx - nx * curGuideW, 0.04, cz - nz * curGuideW, PALETTE.cyan, 1.25, 0.78, 0.0);

    // Central track (guides vehicle straight to the T-intersection hold line)
    addPt(cx, 0.04, cz, PALETTE.cyanBright, 1.25, 0.80, 0.0);

    // Mid-lane tracks
    addPt(cx + nx * curLaneW, 0.04, cz + nz * curLaneW, PALETTE.teal, 1.15, 0.68, 0.0);
    addPt(cx - nx * curLaneW, 0.04, cz - nz * curLaneW, PALETTE.teal, 1.15, 0.68, 0.0);

    // Transverse LiDAR asphalt scan grid (matching earthoslab darkBlue asphalt tone)
    for (let lat = -curRoadW + 0.65; lat <= curRoadW - 0.65; lat += 0.32) {
      if (Math.abs(lat) < 0.18 || Math.abs(Math.abs(lat) - curLaneW) < 0.18) continue;
      addPt(cx + nx * lat, 0.03, cz + nz * lat, PALETTE.darkBlue, 0.80, 0.25, 0.0);
    }

    // Regular glowing curb lanterns
    if (z % 18.0 < 0.45 && z < 682.0) {
      for (const side of [-1, 1]) {
        const lx = cx + nx * (side * (curRoadW + 0.28));
        const lz = cz + nz * (side * (curRoadW + 0.28));
        addPt(lx, 0.06, lz, PALETTE.warmWhite, 2.4, 1.0, 2.0);
        addPt(lx + nx * (side * 0.15), 0.06, lz + nz * (side * 0.15), PALETTE.amberBright, 1.6, 0.85, 2.0);
      }
    }
  }

  // Asphalt ground LiDAR reflectance dots (textured street)
  for (let i = 0; i < 7200; i++) {
    const z = rnd() * 550.0;
    const latOffset = (rnd() - 0.5) * ROAD_HALF_WIDTH * 1.9;
    const pt = getCurvePoint(latOffset, z);
    addPt(pt.x, 0.0, pt.z, PALETTE.deepGrid, 0.7 + rnd() * 0.6, 0.12 + rnd() * 0.18, 0.0);
  }

  // Connecting avenue ground LiDAR reflectance scatter
  for (let i = 0; i < 2400; i++) {
    const t = rnd();
    const pt = getConnectingRoadPoint(t);
    const latOffset = (rnd() - 0.5) * (ROAD_HALF_WIDTH * 1.9);
    addPt(pt.x + pt.normX * latOffset, 0.01, pt.z + pt.normZ * latOffset, PALETTE.deepGrid, 0.7 + rnd() * 0.6, 0.12 + rnd() * 0.18, 0.0);
  }

  // ── 2. SIDEWALKS & PEDESTRIAN ESPLANADES ALONG MAIN ROAD ──
  // Cleanly terminates at 530m, leaving the proving ground 100% open
  for (let z = 0; z <= 530.0; z += 0.85) {
    const curRoadW = ROAD_HALF_WIDTH;
    for (const side of [-1, 1]) {
      const swEdge = getCurvePoint(side * (curRoadW + 0.2), z);
      const swOuter = getCurvePoint(side * (curRoadW + 2.8), z);
      const swMid = getCurvePoint(side * (curRoadW + 1.5), z);

      addPt(swEdge.x, 0.16, swEdge.z, PALETTE.teal, 1.2, 0.75, 0.0);
      addPt(swMid.x, 0.16, swMid.z, PALETTE.tealDim, 0.9, 0.35, 0.0);
      addPt(swOuter.x, 0.16, swOuter.z, PALETTE.tealDim, 1.0, 0.42, 0.0);
    }
  }

  // Streetlamps marching along curved sidewalks (Terminates at 510m before proving grounds)
  for (let lz = 12; lz <= 510.0; lz += 22) {
    const curRoadWLamp = ROAD_HALF_WIDTH;
    for (const side of [-1, 1]) {
      const basePt = getCurvePoint(side * (curRoadWLamp + 0.4), lz);
      const armPt = getCurvePoint(side * (curRoadWLamp - 1.2), lz);
      for (let y = 0; y < 6.4; y += 0.4) {
        addPt(basePt.x, y, basePt.z, PALETTE.teal, 1.0, 0.60, 2.0);
      }
      for (let s = 0.0; s <= 1.0; s += 0.25) {
        const ax = basePt.x + (armPt.x - basePt.x) * s;
        const az = basePt.z + (armPt.z - basePt.z) * s;
        addPt(ax, 6.4 + Math.sin(s * Math.PI) * 0.4, az, PALETTE.cyan, 1.2, 0.70, 2.0);
      }
      addPt(armPt.x, 6.5, armPt.z, PALETTE.cyanBright, 1.8, 0.95, 2.0);
    }
  }

  // ── 3. INTERSECTING CROSS-STREETS (URBAN STREET GRID) ──
  // Perpendicular cross-avenues (Terminates cleanly at 485m, leaving proving ground 100% open)
  const crossStreetZs = [65, 135, 205, 275, 345, 415, 485];
  for (const cZ of crossStreetZs) {
    // Crossroad surface & curbs extending laterally with clean, elegant dot density
    for (let lat = -85.0; lat <= 85.0; lat += 2.4) {
      if (Math.abs(lat) < ROAD_HALF_WIDTH + 0.8) continue; // Keep main road open

      // Cross street curbs (north and south edges at offset z ± 4.2m)
      const pNorth = getCurvePoint(lat, cZ + 4.2);
      const pSouth = getCurvePoint(lat, cZ - 4.2);
      addPt(pNorth.x, 0.02, pNorth.z, PALETTE.tealDim, 1.0, 0.35, 0.0);
      addPt(pSouth.x, 0.02, pSouth.z, PALETTE.tealDim, 1.0, 0.35, 0.0);

      // Cross street centerline dashes
      if (Math.floor(Math.abs(lat) / 4.0) % 2 === 0) {
        const pMid = getCurvePoint(lat, cZ);
        addPt(pMid.x, 0.02, pMid.z, PALETTE.teal, 1.0, 0.40, 0.0);
      }
    }

    // Pedestrian Crosswalk Zebra Stripes across both sides of the intersection (Soft teal)
    for (const offsetZ of [-ROAD_HALF_WIDTH - 1.2, ROAD_HALF_WIDTH + 1.2]) {
      for (let lat = -ROAD_HALF_WIDTH + 0.8; lat <= ROAD_HALF_WIDTH - 0.8; lat += 1.4) {
        for (let sz = 0.0; sz <= 2.0; sz += 0.6) {
          const zPos = cZ + offsetZ + (offsetZ > 0 ? sz : -sz);
          const pZebra = getCurvePoint(lat, zPos);
          addPt(pZebra.x, 0.03, pZebra.z, PALETTE.teal, 1.0, 0.40, 0.0);
        }
      }
    }

    // Traffic Signal Gantries on intersection corners with amber/green LED clusters
    for (const s of [-1, 1]) {
      const pCorner = getCurvePoint(s * (ROAD_HALF_WIDTH + 1.8), cZ + 5.2);
      for (let py = 0; py <= 6.2; py += 0.4) {
        addPt(pCorner.x, py, pCorner.z, PALETTE.teal, 1.1, 0.65, 2.0);
      }
      const pSignal = getCurvePoint(s * (ROAD_HALF_WIDTH - 0.6), cZ + 5.2);
      addPt(pSignal.x, 5.8, pSignal.z, PALETTE.amberBright, 2.2, 0.95, 2.0);
      addPt(pSignal.x, 5.4, pSignal.z, PALETTE.emerald, 2.0, 0.95, 2.0);
    }
  }

  // ── 4. CITY BLOCKS ROW 1: STREETFRONT RETAIL & PEDESTRIAN ARCADES (x = ±[7.5m to 24m]) ──
  // Continuous street facades, storefront window lattices, neon signage, and canopies
  for (let bIdx = 0; bIdx < crossStreetZs.length; bIdx++) {
    const zStart = bIdx === 0 ? 8 : crossStreetZs[bIdx - 1] + 6.0;
    const zEnd = crossStreetZs[bIdx] - 6.0;
    if (zEnd <= zStart) continue;

    for (const side of [-1, 1]) {
      const frontageOffset = side * (ROAD_HALF_WIDTH + 2.4);
      const canopyOffset = frontageOffset - side * 1.5;

      for (let z = zStart; z <= zEnd; z += 1.6) {
        const fPt = getCurvePoint(frontageOffset, z);

        // Ground-floor display windows (warm interior amber glow)
        for (let y = 0.2; y <= 3.4; y += 0.4) {
          addPt(fPt.x, y, fPt.z, PALETTE.windowCyan, 1.2, 0.70, 1.0);
          addPt(fPt.x - side * 0.6, y, fPt.z, PALETTE.amber, 1.0, 0.40, 1.0);
        }

        // Upper-floor architectural window mullions (4–6 stories, y = 3.8 to 18m)
        const blockHeight = 12.0 + ((z * 3) % 9.0);
        for (let y = 3.8; y <= blockHeight; y += 0.8) {
          const isFloorLine = Math.abs(y % 3.2) < 0.4;
          const cVal = isFloorLine ? PALETTE.cyanBright : PALETTE.teal;
          addPt(fPt.x, y, fPt.z, cVal, isFloorLine ? 1.3 : 1.0, isFloorLine ? 0.80 : 0.50, 1.0);
        }

        // Storefront canopy eaves
        if (z % 3.2 < 1.6) {
          const cPt = getCurvePoint(canopyOffset, z);
          addPt(cPt.x, 3.4, cPt.z, PALETTE.amberBright, 1.3, 0.80, 2.0);
        }
      }

      // Neon Storefront Brand Signs along the arcade
      const signZ = zStart + (zEnd - zStart) * 0.45;
      const signColors = [PALETTE.neonPink, PALETTE.cyanBright, PALETTE.emerald, PALETTE.amberBright, PALETTE.laserPurple];
      const signCol = signColors[bIdx % signColors.length];
      for (let sz = signZ - 2.2; sz <= signZ + 2.2; sz += 0.4) {
        const sp = getCurvePoint(frontageOffset - side * 0.25, sz);
        addPt(sp.x, 4.0, sp.z, signCol, 1.8, 0.95, 2.0);
        addPt(sp.x, 4.4, sp.z, signCol, 1.6, 0.85, 2.0);
      }
    }
  }

  // ── 5. INNER PEDESTRIAN COURTYARDS & FOUNTAIN PLAZAS (The exact final 100m problem!) ──
  // Located behind the streetfront at z = 100m, 240m, 380m, 520m, 660m
  // ── 5. INNER PEDESTRIAN COURTYARDS & FOUNTAIN PLAZAS ──
  // Located behind the streetfront (Terminates cleanly at 520m, leaving stage 4 completely open)
  const courtyardZs = [100.0, 240.0, 380.0, 520.0];
  for (const ctz of courtyardZs) {
    for (const side of [-1, 1]) {
      const courtCenter = getCurvePoint(side * (ROAD_HALF_WIDTH + 14.0), ctz);

      // Plaza circular flagstone ring
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
        const px = courtCenter.x + Math.sin(a) * 6.5;
        const pz = courtCenter.z + Math.cos(a) * 6.5;
        addPt(px, 0.08, pz, PALETTE.teal, 1.2, 0.65, 0.0);

        const innerPx = courtCenter.x + Math.sin(a) * 3.2;
        const innerPz = courtCenter.z + Math.cos(a) * 3.2;
        addPt(innerPx, 0.12, innerPz, PALETTE.cyanBright, 1.3, 0.75, 0.0);
      }

      // Tiered Central Fountain (Glowing landmark)
      for (let fy = 0.1; fy <= 1.4; fy += 0.25) {
        for (let fa = 0; fa < Math.PI * 2; fa += Math.PI / 6) {
          const fx = courtCenter.x + Math.sin(fa) * 1.4;
          const fz = courtCenter.z + Math.cos(fa) * 1.4;
          addPt(fx, fy, fz, PALETTE.cyanBright, 1.4, 0.85, 2.0);
        }
      }
      // Water spray apex dots
      addPt(courtCenter.x, 2.1, courtCenter.z, PALETTE.warmWhite, 2.2, 1.0, 2.0);
      addPt(courtCenter.x, 1.8, courtCenter.z, PALETTE.cyanBright, 1.8, 0.9, 2.0);

      // Courtyard Shaded Trees
      for (const [txOff, tzOff] of [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]]) {
        const tx = courtCenter.x + txOff;
        const tz = courtCenter.z + tzOff;
        for (let ty = 0.1; ty <= 2.8; ty += 0.35) {
          addPt(tx, ty, tz, PALETTE.amber, 1.1, 0.65, 3.0);
        }
        for (let i = 0; i < 28; i++) {
          const rad = 0.8 + rnd() * 0.9;
          const theta = rnd() * Math.PI * 2;
          const phi = (rnd() - 0.5) * Math.PI;
          addPt(tx + rad * Math.cos(theta), 3.5 + rad * Math.sin(phi), tz + rad * Math.sin(theta), PALETTE.foliage, 1.2, 0.75, 3.0);
        }
      }
    }
  }

  // ── 6. CITY BLOCKS ROW 2: MID-RISE TOWERS & SKYBRIDGES (x = ±[26m to 58m]) ──
  // Stops cleanly at 460m, opening up the entire satellite reveal
  for (const side of [-1, 1]) {
    for (let mz = 25; mz <= 460; mz += 45) {
      const bW = 28.0;
      const bH = 26.0 + ((mz * 7) % 24.0);
      const x0 = side * (ROAD_HALF_WIDTH + 26.0);

      // Facade grid with illuminated floor slabs
      for (let y = 0.5; y <= bH; y += 1.2) {
        for (let z = mz; z <= mz + bW; z += 2.2) {
          const pt = getCurvePoint(x0, z);
          const isFloor = Math.abs(y % 3.6) < 0.5;
          const cVal = isFloor ? PALETTE.windowCyan : PALETTE.tealDim;
          addPt(pt.x, y, pt.z, cVal, isFloor ? 1.2 : 0.9, isFloor ? 0.75 : 0.40, 1.0);
        }
      }
      // Rooftop parapet line
      for (let z = mz; z <= mz + bW; z += 1.8) {
        const pTop = getCurvePoint(x0, z);
        addPt(pTop.x, bH, pTop.z, PALETTE.cyanBright, 1.3, 0.80, 1.0);
      }
    }

    // Elevated Glass Skybridges spanning between buildings at y = 14m (Terminates at 415m)
    for (const sbZ of [135, 275, 415]) {
      const pStart = getCurvePoint(side * (ROAD_HALF_WIDTH + 4.0), sbZ);
      const pEnd = getCurvePoint(side * (ROAD_HALF_WIDTH + 24.0), sbZ);
      for (let s = 0.0; s <= 1.0; s += 0.08) {
        const sx = pStart.x + (pEnd.x - pStart.x) * s;
        const sz = pStart.z + (pEnd.z - pStart.z) * s;
        addPt(sx, 13.5, sz, PALETTE.cyanBright, 1.3, 0.80, 3.0);
        addPt(sx, 15.5, sz, PALETTE.teal, 1.1, 0.65, 3.0);
        addPt(sx, 14.5, sz, PALETTE.warmWhite, 1.0, 0.70, 3.0);
      }
    }
  }

  // ── 7. CITY BLOCKS ROW 3: METROPOLITAN SKYLINE CANYON (x = ±[65m to 140m]) ──
  // Terminates cleanly before 480m, leaving proving ground 100% open
  for (const side of [-1, 1]) {
    const skylineTowers = [
      { z: 20,  w: 36, h: 90,  dist: 70 },
      { z: 85,  w: 42, h: 125, dist: 85 },
      { z: 160, w: 38, h: 105, dist: 75 },
      { z: 230, w: 45, h: 135, dist: 95 },
      { z: 310, w: 40, h: 115, dist: 80 },
      { z: 390, w: 44, h: 130, dist: 90 },
      { z: 470, w: 38, h: 110, dist: 78 },
    ];
    for (const t of skylineTowers) {
      const o0 = side * t.dist;
      const o1 = o0 + side * t.w;
      for (let y = 0; y < t.h; y += 1.8) {
        const p0 = getCurvePoint(o0, t.z);
        const p1 = getCurvePoint(o0, t.z + t.w);
        const p2 = getCurvePoint(o1, t.z);
        const p3 = getCurvePoint(o1, t.z + t.w);
        addPt(p0.x, y, p0.z, PALETTE.skylineTeal, 1.2, 0.55, 1.0);
        addPt(p1.x, y, p1.z, PALETTE.skylineTeal, 1.2, 0.55, 1.0);
        addPt(p2.x, y, p2.z, PALETTE.tealDim, 0.9, 0.35, 1.0);
        addPt(p3.x, y, p3.z, PALETTE.tealDim, 0.9, 0.35, 1.0);
      }
      // Spire with pulsing red aviation hazard warning beacon
      const spirePt = getCurvePoint(o0 + side * t.w * 0.5, t.z + t.w * 0.5);
      for (let sy = t.h; sy < t.h + 22.0; sy += 0.8) {
        addPt(spirePt.x, sy, spirePt.z, PALETTE.cyanBright, 1.2, 0.75, 1.0);
      }
      addPt(spirePt.x, t.h + 22.5, spirePt.z, PALETTE.redLaser, 2.6, 1.0, 2.0);
    }
  }

  // ── 8. PARKED CITY VEHICLES ALONG CURBS ──
  const parkedCarZs = [24, 46, 92, 118, 162, 234, 318, 362, 442];
  for (const pz of parkedCarZs) {
    for (const side of [-1, 1]) {
      const carLat = side * (ROAD_HALF_WIDTH - 0.7);
      for (const cz of [-1.1, 1.1]) {
        const wPt = getCurvePoint(carLat, pz + cz);
        addPt(wPt.x, 0.25, wPt.z, PALETTE.cyanBright, 1.2, 0.85, 0.0);
      }
      for (let cz = -1.6; cz <= 1.6; cz += 0.4) {
        const bPt = getCurvePoint(carLat, pz + cz);
        addPt(bPt.x, 0.65, bPt.z, PALETTE.teal, 1.1, 0.65, 0.0);
        if (Math.abs(cz) < 0.9) {
          addPt(bPt.x, 1.15, bPt.z, PALETTE.windowCyan, 1.1, 0.70, 0.0);
        }
      }
      const tlPt = getCurvePoint(carLat, pz - 1.7);
      addPt(tlPt.x, 0.65, tlPt.z, [0.95, 0.15, 0.15], 1.6, 0.9, 0.0);
    }
  }

  // ── 9. KEY MONUMENTAL LANDMARKS (Balanced & Non-Blinding!) ──
  // The Spatial Gap Benchmark Gantry at z = 185m
  const gantryZ = 185.0;
  const gantryH = 6.8;
  const pL185 = getCurvePoint(-ROAD_HALF_WIDTH - 1.2, gantryZ);
  const pR185 = getCurvePoint(ROAD_HALF_WIDTH + 1.2, gantryZ);
  for (let y = 0; y <= gantryH; y += 0.3) {
    addPt(pL185.x, y, pL185.z, PALETTE.cyanBright, 1.4, 0.9, 2.0);
    addPt(pR185.x, y, pR185.z, PALETTE.cyanBright, 1.4, 0.9, 2.0);
  }
  for (let lat = -ROAD_HALF_WIDTH - 1.2; lat <= ROAD_HALF_WIDTH + 1.2; lat += 0.4) {
    const pt1 = getCurvePoint(lat, gantryZ);
    addPt(pt1.x, gantryH, pt1.z, PALETTE.cyanBright, 1.6, 0.95, 2.0);
  }
  for (let lat = -3.2; lat <= 3.2; lat += 0.6) {
    const signPt = getCurvePoint(lat, gantryZ + 0.1);
    addPt(signPt.x, gantryH - 0.5, signPt.z, PALETTE.warmWhite, 1.8, 0.95, 2.0);
  }

  // Monumental Glass Atrium at T-Junction (z = 300m) — BALANCED, NO HORIZONTAL BLOWOUT!
  const tJuncZ = 300.0;
  const atriumW = 64.0;
  const atriumH = 44.0;
  for (let ax = -atriumW * 0.5; ax <= atriumW * 0.5; ax += 1.6) {
    for (let ay = 0; ay <= atriumH; ay += 1.2) {
      const diag1 = Math.abs((ax + ay * 0.75) % 6.0) < 0.6;
      const diag2 = Math.abs((ax - ay * 0.75) % 6.0) < 0.6;
      if (diag1 || diag2) {
        addPt(ax, ay, tJuncZ + 6.0, PALETTE.cyanBright, 1.3, 0.80, 1.0);
      } else if (ay % 3.6 === 0) {
        addPt(ax, ay, tJuncZ + 6.0, PALETTE.teal, 1.0, 0.45, 1.0);
      }
    }
  }

  // Overhead Transit Skyway Viaduct at z = 425m to 535m
  for (let vz = 425; vz <= 535; vz += 25) {
    const pL = getCurvePoint(-ROAD_HALF_WIDTH - 2.0, vz);
    const pR = getCurvePoint(ROAD_HALF_WIDTH + 2.0, vz);
    for (let y = 0; y <= 12.5; y += 0.6) {
      addPt(pL.x, y, pL.z, PALETTE.tealDim, 1.2, 0.65, 3.0);
      addPt(pR.x, y, pR.z, PALETTE.tealDim, 1.2, 0.65, 3.0);
    }
    for (let lat = -ROAD_HALF_WIDTH - 2.0; lat <= ROAD_HALF_WIDTH + 2.0; lat += 0.5) {
      const pt = getCurvePoint(lat, vz);
      addPt(pt.x, 12.5, pt.z, PALETTE.cyan, 1.2, 0.75, 3.0);
    }
  }
  for (let vz = 420; vz <= 540; vz += 0.9) {
    const r1 = getCurvePoint(-1.6, vz);
    const r2 = getCurvePoint(1.6, vz);
    addPt(r1.x, 12.7, r1.z, PALETTE.cyanBright, 1.2, 0.80, 3.0);
    addPt(r2.x, 12.7, r2.z, PALETTE.cyanBright, 1.2, 0.80, 3.0);
  }

  // ── 9.5 NATIVE PRISTINE EARTHOSLAB SATELLITE PROVING GROUND POINT CLOUD ──
  // 100% native WebGL points reconstructed in code directly from the master satellite circuit. Zero external image textures.
  const circuitData = getEarthosCircuitPoints();
  for (let i = 0; i < circuitData.count; i++) {
    const i3 = i * 3;
    const px = circuitData.positions[i3];
    const py = circuitData.positions[i3 + 1];
    const pz = circuitData.positions[i3 + 2];
    const cr = circuitData.colors[i3];
    const cg = circuitData.colors[i3 + 1];
    const cb = circuitData.colors[i3 + 2];
    const cSize = circuitData.sizes[i];
    const cAlpha = circuitData.alphas[i];
    addPt(px, py, pz, [cr, cg, cb], cSize, cAlpha, 0.0);
  }

  // ── 10. ATMOSPHERIC SPATIAL STARS & VOXEL PARTICLES ──
  for (let i = 0; i < 4200; i++) {
    const latOffset = (rnd() - 0.5) * 360.0;
    if (Math.abs(latOffset) < 5.0) continue;
    const y = 1.0 + rnd() * 60.0;
    const z = rnd() * LOOP_LENGTH;
    const pt = getCurvePoint(latOffset, z);
    addPt(pt.x, y, pt.z, PALETTE.dust, 0.6 + rnd() * 0.6, 0.10 + rnd() * 0.18, 4.0);
  }

  return {
    positions: new Float32Array(pos),
    colors: new Float32Array(col),
    sizes: new Float32Array(sz),
    alphas: new Float32Array(al),
    categories: new Float32Array(cat),
    count: pos.length / 3,
  };
}

const VERTEX_SHADER = `
  uniform float uCamZ;
  uniform float uTruckZ;
  uniform float uLoopLength;
  uniform float uElapsed;
  uniform float uPixelRatio;
  uniform float uColorMode; // 0.0 = LiDAR Phosphor, 1.0 = Thermal Heatmap, 2.0 = Semantic AI
  uniform float uMacroProgress; // 0.0 = Ground corridor, 1.0 = Satellite macro orbit

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;
  attribute float aCategory; // 0=road, 1=building, 2=signs/accents, 3=skyway/infra, 4=stars/actors

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDist;

  // Heatmap palette generator (Blackbody / Spectral)
  vec3 getHeatmapColor(float h) {
    h = clamp(h, 0.0, 1.0);
    vec3 c1 = vec3(0.12, 0.02, 0.35); // Deep Indigo
    vec3 c2 = vec3(0.0, 0.75, 1.0);   // Cyan
    vec3 c3 = vec3(0.0, 1.0, 0.55);   // Emerald
    vec3 c4 = vec3(1.0, 0.85, 0.15);  // Gold
    vec3 c5 = vec3(1.0, 0.20, 0.25);  // Red/Orange

    if (h < 0.25) return mix(c1, c2, h / 0.25);
    if (h < 0.50) return mix(c2, c3, (h - 0.25) / 0.25);
    if (h < 0.75) return mix(c3, c4, (h - 0.50) / 0.25);
    return mix(c4, c5, (h - 0.75) / 0.25);
  }

  // Semantic AI classification palette
  vec3 getSemanticColor(float cat, vec3 base) {
    if (cat < 0.5) return vec3(0.06, 0.95, 0.55); // Ground / Road (Neon Emerald)
    if (cat < 1.5) return vec3(0.55, 0.25, 0.95); // Architecture / Buildings (Cyber Violet)
    if (cat < 2.5) return vec3(1.0, 0.25, 0.65);  // Signage / Commercial Accents (Neon Pink)
    if (cat < 3.5) return vec3(0.0, 0.85, 1.0);   // Infrastructure / Skyway (Electric Cyan)
    return vec3(1.0, 0.80, 0.20);                 // Atmospheric / Dynamic Actors (Gold)
  }

  void main() {
    // Full 710M metropolitan corridor and continuous earthoslab circuit rendered in true world space
    vec3 worldPos = position.xyz;

    vec4 mvPosition = viewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float viewDist = -mvPosition.z;
    // In satellite macro view, horizonFade smoothly relaxes to 1.0 so the entire word and city glow brightly
    float horizonFade = mix(smoothstep(360.0, 70.0, viewDist), 1.0, uMacroProgress);
    float nearDissolve = smoothstep(1.2, 5.0, viewDist);
    // Distance density attenuation smoothly balances near and far corridor radiance
    float distDensityAtten = mix(clamp(32.0 / max(viewDist, 32.0), 0.22, 1.0), 1.0, uMacroProgress);

    float entrance = clamp(uElapsed / 0.6, 0.0, 1.0);
    entrance = entrance * entrance * (3.0 - 2.0 * entrance);

    // ── BESPOKE SPATIAL NEURAL RECONSTRUCTION FIELD (SMOOTH & SICK) ──
    // Continuous harmonic phase envelope rolling forward along the corridor (never an obvious blunt ring)
    float deltaZ = worldPos.z - uTruckZ;
    // Forward directional aperture cone (reconstruction focuses forward from the survey vehicle)
    float forwardWeight = smoothstep(-8.0, 14.0, deltaZ) * smoothstep(110.0, 25.0, deltaZ);
    float lateralWeight = smoothstep(36.0, 0.0, abs(position.x));
    float aperture = forwardWeight * lateralWeight;

    // Dual-harmonic continuous spatial phase (silky smooth rolling spatial interference)
    float phase1 = cos(deltaZ * 0.075 - uElapsed * 2.2 + position.x * 0.05);
    float phase2 = cos(deltaZ * 0.15 - uElapsed * 3.4 - position.y * 0.08);
    float waveField = pow(max(0.0, phase1 * 0.7 + phase2 * 0.3), 3.0) * aperture;

    // Laser optical scintillation (alive micro-interference shimmer)
    float microScint = sin(dot(position.xyz, vec3(12.9898, 78.233, 45.164)) * 0.4 + uElapsed * 1.8);
    float shimmer = 1.0 + microScint * 0.12;

    // ── COLOR MODE PROCESSING ──
    vec3 finalCol = aColor;
    if (uColorMode > 1.5) {
      finalCol = getSemanticColor(aCategory, aColor);
    } else if (uColorMode > 0.5) {
      float heightNorm = clamp(position.y / 48.0, 0.0, 1.0);
      finalCol = getHeatmapColor(heightNorm);
    }

    // Smooth chromatic excitation (Electric phosphor glow)
    vec3 excitationCyan = vec3(0.0, 0.65, 1.0);
    vec3 excitationViolet = vec3(0.45, 0.10, 0.85);
    vec3 waveColor = mix(excitationCyan, excitationViolet, smoothstep(0.0, 1.0, waveField));
    finalCol = finalCol * shimmer + waveColor * (waveField * 0.40);

    float finalAlpha = (aAlpha * distDensityAtten + waveField * 0.10) * horizonFade * nearDissolve * entrance;
    vAlpha = clamp(finalAlpha, 0.0, 1.0);
    vColor = finalCol;
    vDist = viewDist;

    // Attenuated clean point size with subtle wave breathing and macro balance
    float sizeScale = (220.0 / max(viewDist, 1.8)) * uPixelRatio;
    float macroBoost = mix(1.0, 1.65, uMacroProgress);
    float waveSizeBoost = 1.0 + waveField * 0.08;
    gl_PointSize = clamp(aSize * sizeScale * entrance * waveSizeBoost * macroBoost, 1.2, 9.0);
  }
`;

const DYNAMIC_VERTEX_SHADER = `
  uniform float uPixelRatio;
  uniform float uMacroProgress;

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mvPosition = viewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float viewDist = -mvPosition.z;
    float nearDissolve = smoothstep(0.4, 2.0, viewDist);

    vAlpha = clamp(aAlpha * nearDissolve, 0.0, 1.0);
    vColor = aColor;

    float sizeScale = (210.0 / max(viewDist, 1.5)) * uPixelRatio;
    float macroBoost = mix(1.0, 1.65, uMacroProgress);
    gl_PointSize = clamp(aSize * sizeScale * macroBoost, 1.2, 9.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float intensity = smoothstep(0.5, 0.03, dist);
    // Luminous laser phosphor core
    float core = exp(-dist * dist * 14.0) * 0.65;
    float finalAlpha = vAlpha * intensity;
    if (finalAlpha < 0.005) discard;

    // Glowing cybernetic neon radiance (Vibrant electric neon without whiteout)
    vec3 hdrColor = vColor * (1.08 + core * 1.35);
    gl_FragColor = vec4(hdrColor * finalAlpha, finalAlpha);
  }
`;

export function VoidCanvas({
  className = "",
  colorMode = "auto",
  cameraMode = "cinematic",
  onStats,
  onStoppageChange,
  forceOverride = false,
}: {
  className?: string;
  colorMode?: ColorMode;
  cameraMode?: CameraMode;
  onStats?: (stats: { pts: number; fps: number; depthM: number; speedKmh: number; macroProgress?: number }) => void;
  onStoppageChange?: (state: any) => void;
  forceOverride?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorModeRef = useRef(colorMode);
  colorModeRef.current = colorMode;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(68, width / height, 0.1, 1500);
    camera.position.set(0, CAM_HEIGHT, 0);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      alpha: false,
      depth: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    container.appendChild(renderer.domElement);

    let composer: EffectComposer | null = null;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      // Calibrated luminous cybernetic bloom (Threshold 0.38, balanced strength 0.38, radius 0.32)
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.38, 0.32, 0.38));
    } catch {
      composer = null;
    }

    // ── 1. STATIC METROPOLIS POINT CLOUD ──
    const cityData = buildDiverseCurvedMetropolis();
    const staticGeo = new THREE.BufferGeometry();
    staticGeo.setAttribute("position", new THREE.BufferAttribute(cityData.positions, 3));
    staticGeo.setAttribute("aColor", new THREE.BufferAttribute(cityData.colors, 3));
    staticGeo.setAttribute("aSize", new THREE.BufferAttribute(cityData.sizes, 1));
    staticGeo.setAttribute("aAlpha", new THREE.BufferAttribute(cityData.alphas, 1));
    staticGeo.setAttribute("aCategory", new THREE.BufferAttribute(cityData.categories, 1));

    const uniforms = {
      uCamZ: { value: 0.0 },
      uTruckZ: { value: 0.0 },
      uLoopLength: { value: LOOP_LENGTH },
      uElapsed: { value: 0.0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColorMode: { value: 0.0 },
      uMacroProgress: { value: 0.0 },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const staticPointCloud = new THREE.Points(staticGeo, shaderMaterial);
    scene.add(staticPointCloud);

    // ── 1.5 PRISTINE POINT CLOUD SCENE SETUP ──


    // ── 2. DYNAMIC ACTORS POINT CLOUD (Detailed Truck, Pedestrian, Rover, Transit) ──
    const MAX_DYN_POINTS = 9000;
    const dynPositions = new Float32Array(MAX_DYN_POINTS * 3);
    const dynColors = new Float32Array(MAX_DYN_POINTS * 3);
    const dynSizes = new Float32Array(MAX_DYN_POINTS);
    const dynAlphas = new Float32Array(MAX_DYN_POINTS);

    const dynGeo = new THREE.BufferGeometry();
    const dynPosAttr = new THREE.BufferAttribute(dynPositions, 3);
    const dynColAttr = new THREE.BufferAttribute(dynColors, 3);
    const dynSzAttr = new THREE.BufferAttribute(dynSizes, 1);
    const dynAlAttr = new THREE.BufferAttribute(dynAlphas, 1);

    dynGeo.setAttribute("position", dynPosAttr);
    dynGeo.setAttribute("aColor", dynColAttr);
    dynGeo.setAttribute("aSize", dynSzAttr);
    dynGeo.setAttribute("aAlpha", dynAlAttr);

    const dynUniforms = {
      uPixelRatio: { value: renderer.getPixelRatio() },
      uMacroProgress: { value: 0.0 },
    };

    const dynMaterial = new THREE.ShaderMaterial({
      vertexShader: DYNAMIC_VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: dynUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const dynamicPointCloud = new THREE.Points(dynGeo, dynMaterial);
    scene.add(dynamicPointCloud);

    let targetScrollProgress = 0.0;
    let smoothProgress = 0.0;
    let prevSmoothProgress = 0.0;
    let scrollVelocity = 0.0;
    let camZ = 0.0;
    let mountTime = 0;
    let animId = 0;
    let isVisible = true;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let currentFps = 60;

    // Mouse Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2.0;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2.0;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      const pr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(pr);
      uniforms.uPixelRatio.value = pr;
      dynUniforms.uPixelRatio.value = pr;
      if (composer) composer.setSize(width, height);
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // Camera smoothing springs (Stage 0: Survey truck framed on the RIGHT, text on the LEFT)
    let curCamX = 4.0;
    let curCamY = 1.85;
    let curCamZ = -0.09;
    let curLookX = -8.56;
    let curLookY = 1.65;
    let curLookZ = 26.66;

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      if (!mountTime) mountTime = currentTime;
      const elapsed = (currentTime - mountTime) / 1000.0;
      uniforms.uElapsed.value = elapsed;

      // Update FPS counter
      frameCount++;
      const now = performance.now();
      const dt = Math.min(0.066, Math.max(0.001, (now - lastFrameTime) / 1000.0));
      lastFrameTime = now;

      if (now - lastFpsUpdate >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Smooth mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // ── SUB-FRAME CRITICAL DAMPING (ELIMINATES WHEEL STEP JITTER & OVERLAP) ──
      const decayAlpha = 1.0 - Math.exp(-14.0 * dt);
      smoothProgress += (targetScrollProgress - smoothProgress) * decayAlpha;

      scrollVelocity = Math.abs(smoothProgress - prevSmoothProgress) / dt;
      prevSmoothProgress = smoothProgress;
      const speedKmh = Math.min(95, Math.round(scrollVelocity * (LOOP_LENGTH - 4.8) * 3.6 * 0.20));

      // ── CONTINUOUS UNIFIED KINEMATIC SPLINE (ZERO SEGMENTS, ZERO LAPPING) ──
      let rawTruckZ: number;
      let rawTruckLat: number;
      let targetCamX: number;
      let targetCamY: number;
      let targetCamZ: number;
      let targetLookX: number;
      let targetLookY: number;
      let targetLookZ: number;

      const p = Math.max(0.0, Math.min(1.0, smoothProgress));

      if (p <= 0.035) {
        // Stage 0: Hero Parked Origin (Waypoint 00: 5M)
        rawTruckZ = 5.0;
        rawTruckLat = 0.0;
        const camPt0 = getCurvePoint(-3.8, rawTruckZ - 6.0);
        const lookPt0 = getCurvePoint(0.5, rawTruckZ + 22.0);
        targetCamX = camPt0.x;
        targetCamY = 1.85;
        targetCamZ = camPt0.z;
        targetLookX = lookPt0.x;
        targetLookY = 1.65;
        targetLookZ = lookPt0.z;
      } else if (p < 0.18) {
        // Stage 1: Smooth pull-out from hero into The Gap (5m to 185m)
        const u = (p - 0.035) / (0.18 - 0.035);
        const eased = u * u * (3.0 - 2.0 * u);

        rawTruckZ = 5.0 + (185.0 - 5.0) * eased;
        rawTruckLat = 0.0;

        const chaseDist = 6.0 + 0.4 * eased;
        const chaseZ = rawTruckZ - chaseDist;
        const camLat = -3.8 + 0.6 * eased;
        const camPt = getCurvePoint(camLat, chaseZ);
        const lookPt = getCurvePoint(0.5, rawTruckZ + 22.0 + 2.0 * eased);

        targetCamX = camPt.x;
        targetCamY = 1.85 + 0.30 * eased;
        targetCamZ = camPt.z;
        targetLookX = lookPt.x;
        targetLookY = 1.65 + 0.40 * eased;
        targetLookZ = lookPt.z;
      } else if (p <= 0.70) {
        // Stage 2: Main Avenue Continuous Cruise through sectors (185m to 540m)
        // CAR CONSTANTLY ON THE RIGHT THIRD OF SCREEN; TEXT DOCKED ON THE LEFT
        const v = (p - 0.18) / (0.70 - 0.18);
        rawTruckZ = 185.0 + (540.0 - 185.0) * v;
        rawTruckLat = 0.0; // Centered in lane

        const chaseDist = 6.4;
        const chaseZ = rawTruckZ - chaseDist;
        const camPt = getCurvePoint(-3.2, chaseZ);
        const lookPt = getCurvePoint(0.5, rawTruckZ + 24.0);

        targetCamX = camPt.x;
        targetCamY = 2.15;
        targetCamZ = camPt.z;
        targetLookX = lookPt.x;
        targetLookY = 2.05;
        targetLookZ = lookPt.z;
      } else if (p <= 0.88) {
        // Stage 3: Summit Overlook & Approach (540m to 550m)
        const u = (p - 0.70) / (0.88 - 0.70);
        const eased = u * u * (3.0 - 2.0 * u);
        rawTruckZ = 540.0 + (550.0 - 540.0) * eased;
        rawTruckLat = 0.0;

        const chaseDist = 6.4 + 10.5 * eased;
        const chaseZ = rawTruckZ - chaseDist;
        const camPt = getCurvePoint(-3.2 * (1.0 - eased * 0.45), chaseZ);
        const lookPt = getCurvePoint(0.5 * (1.0 - eased * 0.5), rawTruckZ + 24.0);

        targetCamX = camPt.x;
        targetCamY = 2.15 + (4.8 - 2.15) * eased;
        targetCamZ = camPt.z;
        targetLookX = lookPt.x;
        targetLookY = 2.05 + (1.6 - 2.05) * eased;
        targetLookZ = lookPt.z;
      } else {
        // Stage 4: SATELLITE MACRO ZOOM-OUT · CONTINUOUS "earthoslab" REVEAL (p = 0.88 to 1.0)
        // Rover completes avenue travel from 550m through connecting avenue into circuit entrance (686.3m)
        const s = (p - 0.88) / 0.12;
        const sEased = s * s * (3.0 - 2.0 * s);

        const connPt = getConnectingRoadPoint(Math.min(1.0, sEased * 1.05));
        rawTruckZ = connPt.z;
        rawTruckLat = 0.0;

        // Camera ascends into majestic satellite orbit (altitude 220m), centering dead-center over glowing earthoslab circuit at (0.0, 0.0, 735.0)
        const macroCamHeight = 4.8 + (220.0 - 4.8) * sEased;
        const baseChaseZ = 550.0 - 16.9;
        const targetCenterZ = 735.0; // Geographic center Z of the earthoslab continuous circuit
        const macroCamZ = baseChaseZ + (targetCenterZ - baseChaseZ) * sEased;
        const baseCamX = getCurvePoint(-1.76, baseChaseZ).x;
        const macroCamX = baseCamX * (1.0 - sEased) + 0.0 * sEased; // Centered horizontally at X = 0.0

        targetCamX = macroCamX;
        targetCamY = macroCamHeight;
        targetCamZ = macroCamZ;

        // Center look target dead-center on the glowing earthoslab circuit at (0.0, 0, 735m)
        targetLookX = 0.0 * sEased;
        targetLookY = 0.0;
        targetLookZ = (550.0 + 24.0) * (1.0 - sEased) + targetCenterZ * sEased;

        // Smooth camera up vector interpolation to top-down 180-deg orientation:
        // Text reads left-to-right, right-side-up, and the city avenue approaches cleanly at bottom-left!
        const curUpY = Math.cos(sEased * Math.PI * 0.5);
        const curUpZ = Math.sin(sEased * Math.PI * 0.5);
        camera.up.set(0, curUpY, curUpZ).normalize();
      }

      // Update color mode uniform (Auto switches by sector, or manual override)
      const cm = colorModeRef.current;
      let effectiveColorMode = 0.0;
      if (cm === "auto") {
        if (rawTruckZ < 210) effectiveColorMode = 0.0; // LiDAR Phosphor
        else if (rawTruckZ < 380) effectiveColorMode = 1.0; // Thermal Heatmap
        else if (rawTruckZ < 520) effectiveColorMode = 2.0; // AI Semantic Strata
        else effectiveColorMode = 0.0; // LiDAR Phosphor finale
      } else {
        effectiveColorMode = cm === "heatmap" ? 1.0 : cm === "semantic" ? 2.0 : 0.0;
      }
      uniforms.uColorMode.value = effectiveColorMode;

      // Apply mouse parallax drift
      targetCamX += mouseX * 0.8;
      targetCamY += -mouseY * 0.4;

      // Smooth camera interpolation (Tuned critically to eliminate lag & jitter)
      curCamX += (targetCamX - curCamX) * 0.16;
      curCamY += (targetCamY - curCamY) * 0.16;
      curCamZ += (targetCamZ - curCamZ) * 0.16;
      curLookX += (targetLookX - curLookX) * 0.16;
      curLookY += (targetLookY - curLookY) * 0.16;
      curLookZ += (targetLookZ - curLookZ) * 0.16;

      camera.position.set(curCamX, curCamY, curCamZ);
      if (p <= 0.88) {
        camera.up.set(0, 1, 0);
      }
      camera.lookAt(curLookX, curLookY, curLookZ);

      // Shader wrapping points follow camera and truck
      camZ = curCamZ;
      uniforms.uCamZ.value = camZ;
      uniforms.uTruckZ.value = rawTruckZ;

      const truckZ = rawTruckZ;
      const truckLat = rawTruckLat;

      // Update macro progress uniform for satellite elevation
      const macroVal = p > 0.88 ? Math.min(1.0, (p - 0.88) / 0.12) : 0.0;
      const macroEased = macroVal * macroVal * (3.0 - 2.0 * macroVal);
      uniforms.uMacroProgress.value = macroEased;
      dynUniforms.uMacroProgress.value = macroEased;

      // Report stats to parent HUD
      onStats?.({
        pts: cityData.count,
        fps: currentFps,
        depthM: Math.round(truckZ),
        speedKmh: speedKmh,
        macroProgress: macroEased,
      });

      // Compute circuit progress and vehicle pose helper for Stage 4
      const getTruckPoint = (localX: number, localZ: number) => {
        if (p <= 0.88) {
          return getCurvePoint(truckLat + localX, truckZ + localZ);
        } else {
          const s = (p - 0.88) / 0.12;
          const sEased = s * s * (3.0 - 2.0 * s);
          if (sEased < 0.88) {
            const connPt = getConnectingRoadPoint(sEased / 0.88);
            return {
              x: connPt.x + connPt.normX * localX + connPt.dirX * localZ,
              z: connPt.z + connPt.normZ * localX + connPt.dirX * localZ,
            };
          } else {
            // Vehicle smoothly navigates around the entire cursive earthoslab circuit in real-time
            const trackProgress = ((sEased - 0.88) * 0.45 + elapsed * 0.025) % 1.0;
            const pose = getCircuitPose(trackProgress);
            return {
              x: pose.x + pose.normX * localX + pose.dirX * localZ,
              z: pose.z + pose.normZ * localX + pose.dirZ * localZ,
            };
          }
        }
      };

      // ── RENDER DYNAMIC ACTORS BUFFER ──
      let pIdx = 0;
      const addDynPt = (x: number, y: number, z: number, r: number, g: number, b: number, sz: number, al: number) => {
        if (pIdx >= MAX_DYN_POINTS) return;
        const i3 = pIdx * 3;
        dynPositions[i3] = x;
        dynPositions[i3 + 1] = y;
        dynPositions[i3 + 2] = z;
        dynColors[i3] = r;
        dynColors[i3 + 1] = g;
        dynColors[i3 + 2] = b;
        dynSizes[pIdx] = sz;
        dynAlphas[pIdx] = al;
        pIdx++;
      };

      // ── A. HIGH-FIDELITY SURVEY TRUCK ──
      // Wheels (4 corner assemblies with rotating spokes)
      const wheelOffsets = [
        [-0.88, 1.45], [0.88, 1.45],
        [-0.88, -1.45], [0.88, -1.45],
      ];
      const wheelAngle = (truckZ * 2.8) % (Math.PI * 2);
      const tireR = 0.44;

      for (const [wx, wz] of wheelOffsets) {
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          const ty = tireR + Math.sin(a) * tireR;
          const tz = wz + Math.cos(a) * tireR;
          const pt = getTruckPoint(wx, tz);
          addDynPt(pt.x, ty, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.4, 0.9);

          const rRim = 0.22;
          const ry = tireR + Math.sin(a + wheelAngle) * rRim;
          const rz = wz + Math.cos(a + wheelAngle) * rRim;
          const rPt = getTruckPoint(wx, rz);
          addDynPt(rPt.x, ry, rPt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.2, 0.95);
        }
        const hubPt = getTruckPoint(wx, wz);
        addDynPt(hubPt.x, tireR, hubPt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.7, 0.95);
      }

      // Ladder Chassis Rails
      for (let bz = -2.1; bz <= 2.2; bz += 0.25) {
        for (const side of [-1, 1]) {
          const pt = getTruckPoint(side * 0.52, bz);
          addDynPt(pt.x, 0.38, pt.z, PALETTE.tealDim[0], PALETTE.tealDim[1], PALETTE.tealDim[2], 1.1, 0.65);
        }
      }

      // Tubular Off-Road Front Bumper & Recovery Winch (z = +2.35m)
      for (let bx = -0.88; bx <= 0.88; bx += 0.12) {
        const pt = getTruckPoint(bx, 2.35);
        addDynPt(pt.x, 0.45, pt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.4, 0.88);
        addDynPt(pt.x, 0.25, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.2, 0.75);
      }
      const winchPt = getTruckPoint(0, 2.42);
      addDynPt(winchPt.x, 0.45, winchPt.z, PALETTE.amberBright[0], PALETTE.amberBright[1], PALETTE.amberBright[2], 1.8, 1.0);

      // Hexagonal Grille & Aggressive LED Headlights (z = +2.20m)
      for (let gx = -0.65; gx <= 0.65; gx += 0.12) {
        for (let gy = 0.55; gy <= 0.95; gy += 0.10) {
          const pt = getTruckPoint(gx, 2.20);
          addDynPt(pt.x, gy, pt.z, PALETTE.darkBlue[0], PALETTE.darkBlue[1], PALETTE.darkBlue[2], 1.0, 0.55);
        }
      }
      // Quad-LED Projector Headlights (Vibrant luminous cybernetic beams)
      for (const side of [-1, 1]) {
        for (let ly = 0.65; ly <= 0.88; ly += 0.08) {
          const pt = getTruckPoint(side * 0.82, 2.22);
          addDynPt(pt.x, ly, pt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 2.0, 0.95);
          addDynPt(pt.x + side * 0.06, ly + 0.08, pt.z, PALETTE.amberBright[0], PALETTE.amberBright[1], PALETTE.amberBright[2], 1.5, 0.85);
        }
      }

      // Sculpted Hood & Muscular Fenders (z = +0.8m to +2.1m)
      for (let fz = 0.8; fz <= 2.1; fz += 0.20) {
        for (let fx = -0.88; fx <= 0.88; fx += 0.14) {
          const isEdge = Math.abs(fx) > 0.75;
          const hy = isEdge ? 1.02 : 0.96;
          const pt = getTruckPoint(fx, fz);
          addDynPt(pt.x, hy, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.2, 0.85);
        }
      }

      // Dual-Cab Greenhouse & Windshield (z = -0.6m to +0.8m)
      // Raked Aerodynamic Windshield
      for (let s = 0.0; s <= 1.0; s += 0.15) {
        const wz = 0.8 - s * 0.45;
        const wy = 0.98 + s * 0.58;
        for (let wx = -0.76; wx <= 0.76; wx += 0.15) {
          const pt = getTruckPoint(wx, wz);
          addDynPt(pt.x, wy, pt.z, PALETTE.windowCyan[0], PALETTE.windowCyan[1], PALETTE.windowCyan[2], 1.2, 0.75);
        }
      }
      // Roof Deck Panel
      for (let rz = -0.6; rz <= 0.35; rz += 0.18) {
        for (let rx = -0.74; rx <= 0.74; rx += 0.16) {
          const pt = getTruckPoint(rx, rz);
          addDynPt(pt.x, 1.56, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.3, 0.85);
        }
      }
      // Roof Pillars (A, B, C)
      for (const side of [-1, 1]) {
        for (let py = 1.0; py <= 1.55; py += 0.12) {
          const aPt = getTruckPoint(side * 0.78, 0.38);
          addDynPt(aPt.x, py, aPt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.4, 0.9);
          const bPt = getTruckPoint(side * 0.84, 0);
          addDynPt(bPt.x, py, bPt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.3, 0.85);
          const cPt = getTruckPoint(side * 0.84, -0.65);
          addDynPt(cPt.x, py, cPt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.3, 0.85);
        }
      }

      // Cockpit Interior Steering Wheel & Dashboard
      const steerPt = getTruckPoint(-0.38, 0.48);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const swY = 1.05 + Math.sin(a) * 0.14;
        const swX = steerPt.x + Math.cos(a) * 0.14;
        addDynPt(swX, swY, steerPt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.1, 0.8);
      }
      const dashPt = getTruckPoint(0, 0.68);
      addDynPt(dashPt.x, 0.96, dashPt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 2.2, 1.0);

      // Side Mirrors with Amber LEDs
      for (const side of [-1, 1]) {
        const mBase = getTruckPoint(side * 0.90, 0.65);
        const mTip = getTruckPoint(side * 1.25, 0.62);
        addDynPt(mBase.x, 1.20, mBase.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.2, 0.85);
        addDynPt(mTip.x, 1.25, mTip.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.4, 0.95);
        addDynPt(mTip.x, 1.26, mTip.z + 0.04, PALETTE.amberBright[0], PALETTE.amberBright[1], PALETTE.amberBright[2], 2.0, 1.0);
      }

      // Open Bed & Overland Bed Rack
      for (let bz = -0.7; bz >= -2.1; bz -= 0.20) {
        for (const side of [-1, 1]) {
          const pt = getTruckPoint(side * 0.90, bz);
          addDynPt(pt.x, 0.92, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.3, 0.85);
        }
      }
      for (const rz of [-0.75, -1.95]) {
        for (const side of [-1, 1]) {
          for (let ry = 0.92; ry <= 1.55; ry += 0.15) {
            const pt = getTruckPoint(side * 0.88, rz);
            addDynPt(pt.x, ry, pt.z, PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2], 1.3, 0.85);
          }
        }
        for (let rx = -0.88; rx <= 0.88; rx += 0.20) {
          const pt = getTruckPoint(rx, rz);
          addDynPt(pt.x, 1.55, pt.z, PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2], 1.2, 0.80);
        }
      }
      // Tailgate
      for (let tx = -0.88; tx <= 0.88; tx += 0.15) {
        const pt = getTruckPoint(tx, -2.15);
        addDynPt(pt.x, 0.92, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.3, 0.9);
      }

      // ── 360° COMMODITY OPTICAL CAPTURE RIG ──
      // Roof crossbars
      for (const rz of [-0.30, 0.25]) {
        for (let rx = -0.80; rx <= 0.80; rx += 0.12) {
          const pt = getTruckPoint(rx, rz);
          addDynPt(pt.x, 1.58, pt.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.2, 0.85);
        }
      }
      // Dual RTK GNSS Receiver Pucks with pulsing cyan aura
      const rtkPucks = [
        [-0.72, 0.25], [0.72, 0.25],
        [-0.72, -0.30], [0.72, -0.30],
      ];
      for (const [gx, gz] of rtkPucks) {
        const pt = getTruckPoint(gx, gz);
        addDynPt(pt.x, 1.63, pt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.3, 0.85);
        addDynPt(pt.x, 1.65, pt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.1, 0.75);
      }

      // Optical Camera Pedestal & 5.7K Body
      for (let py = 1.59; py <= 1.76; py += 0.05) {
        for (const px of [-0.08, 0.08]) {
          for (const pz of [-0.08, 0.08]) {
            const pt = getTruckPoint(px, pz);
            addDynPt(pt.x, py, pt.z, PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2], 1.1, 0.8);
          }
        }
      }
      const rigCenter = getTruckPoint(0, 0);
      for (let cy = 1.76; cy <= 1.94; cy += 0.04) {
        for (let ca = 0; ca < Math.PI * 2; ca += Math.PI / 4) {
          const cx = rigCenter.x + Math.sin(ca) * 0.09;
          const cz = rigCenter.z + Math.cos(ca) * 0.07;
          addDynPt(cx, cy, cz, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.1, 0.8);
        }
      }
      // Dual Front/Rear Coated Optical Fisheye Lenses
      const lensFront = getTruckPoint(0, 0.08);
      const lensRear = getTruckPoint(0, -0.08);
      addDynPt(lensFront.x, 1.86, lensFront.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.8, 0.95);
      addDynPt(lensRear.x, 1.86, lensRear.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.8, 0.95);

      // Steady Green Recording Tally LED
      const tallyPt = getTruckPoint(-0.07, 0);
      addDynPt(tallyPt.x, 1.91, tallyPt.z, PALETTE.emerald[0], PALETTE.emerald[1], PALETTE.emerald[2], 1.8, 1.0);

      // Conical Headlight Beam Washing onto Asphalt (Luminous electric cyan ground trace)
      for (let dist = 1.6; dist <= 22.0; dist += 1.4) {
        const spread = dist * 0.16;
        const beamL = getTruckPoint(-0.75 - spread, 2.35 + dist);
        const beamR = getTruckPoint(0.75 + spread, 2.35 + dist);
        const beamC = getTruckPoint(0, 2.35 + dist);
        const bAlpha = THREE.MathUtils.clamp(0.38 * (1.0 - dist / 24.0), 0.04, 0.38);
        addDynPt(beamL.x, 0.04, beamL.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.4, bAlpha);
        addDynPt(beamR.x, 0.04, beamR.z, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.4, bAlpha);
        addDynPt(beamC.x, 0.04, beamC.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.6, bAlpha * 1.25);
      }

      // Steady Taillights at z = -2.18m
      const tlCol = [0.95, 0.08, 0.08];
      for (const side of [-1, 1]) {
        for (let ty = 0.65; ty <= 0.88; ty += 0.08) {
          const pt = getTruckPoint(side * 0.88, -2.18);
          addDynPt(pt.x, ty, pt.z, tlCol[0], tlCol[1], tlCol[2], 2.6, 1.0);
        }
      }
      for (let bx = -0.35; bx <= 0.35; bx += 0.12) {
        const pt = getTruckPoint(bx, -0.68);
        addDynPt(pt.x, 1.58, pt.z, tlCol[0], tlCol[1], tlCol[2], 2.0, 1.0);
      }

      // ── D. 3D AI PERCEPTION BOUNDING BOX AROUND SURVEY RIG ──
      const boxCol = cm === "semantic" ? PALETTE.solarGold : PALETTE.cyanBright;
      const xCorners = [-1.10, 1.10];
      const yCorners = [0.12, 2.15];
      const zCorners = [-2.35, 2.45];
      const bracketLen = 0.35;

      // Draw 8 Corner L-Brackets for the Vehicle Bounding Box
      for (const cx of xCorners) {
        for (const cy of yCorners) {
          for (const cz of zCorners) {
            const cPt = getTruckPoint(cx, cz);
            addDynPt(cPt.x, cy, cPt.z, boxCol[0], boxCol[1], boxCol[2], 2.4, 1.0);

            // X-arm
            const xDir = cx > 0 ? -1 : 1;
            for (let step = 0.08; step <= bracketLen; step += 0.09) {
              const aPt = getTruckPoint(cx + xDir * step, cz);
              addDynPt(aPt.x, cy, aPt.z, boxCol[0], boxCol[1], boxCol[2], 1.4, 0.85);
            }
            // Y-arm
            const yDir = cy > 1.0 ? -1 : 1;
            for (let step = 0.08; step <= bracketLen; step += 0.09) {
              addDynPt(cPt.x, cy + yDir * step, cPt.z, boxCol[0], boxCol[1], boxCol[2], 1.4, 0.85);
            }
            // Z-arm
            const zDir = cz > 0 ? -1 : 1;
            for (let step = 0.08; step <= bracketLen; step += 0.09) {
              const aPt = getTruckPoint(cx, cz + zDir * step);
              addDynPt(aPt.x, cy, aPt.z, boxCol[0], boxCol[1], boxCol[2], 1.4, 0.85);
            }
          }
        }
      }

      // Autonomous Heading Trajectory Spline (Green prediction vector)
      for (let fz = 2.45; fz <= 9.5; fz += 0.35) {
        const fPt = getTruckPoint(0, fz);
        const fAlpha = (1.0 - (fz - 2.45) / 7.2) * 0.95;
        const pulseChevron = Math.floor((fz - 2.45 - elapsed * 8.0) * 1.5) % 3 === 0;
        const sz = pulseChevron ? 2.4 : 1.4;
        addDynPt(fPt.x, 0.05, fPt.z, PALETTE.emerald[0], PALETTE.emerald[1], PALETTE.emerald[2], sz, fAlpha);
      }

      // Floating Sensor Target Diamond Reticle above Cab (y = 2.42m)
      const roofTarget = getTruckPoint(0, 0);
      const diamondR = 0.18;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        const dx = roofTarget.x + Math.sin(a + elapsed * 1.5) * diamondR;
        const dz = roofTarget.z + Math.cos(a + elapsed * 1.5) * diamondR;
        addDynPt(dx, 2.42, dz, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.8, 1.0);
      }
      addDynPt(roofTarget.x, 2.42, roofTarget.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 2.0, 1.0);

      // High-Altitude Orbital Rover Beacon & Forward Searchlight (Crystal clear from 220m orbit)
      if (p > 0.88) {
        addDynPt(roofTarget.x, 2.9, roofTarget.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 3.6, 1.0);
        addDynPt(roofTarget.x, 3.4, roofTarget.z, PALETTE.warmWhite[0], PALETTE.warmWhite[1], PALETTE.warmWhite[2], 4.6, 1.0);
        for (let bz = 2.0; bz <= 16.0; bz += 2.0) {
          const bp = getTruckPoint(0, bz);
          addDynPt(bp.x, 0.15, bp.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 2.2, 0.85 * (1.0 - bz / 18.0));
        }
      }

      // ── B. AUTONOMOUS SIDEWALK DELIVERY ROVER ──
      const roverZ = (elapsed * 2.8 + 26.0) % LOOP_LENGTH;
      const rvrPt = getCurvePoint(-ROAD_HALF_WIDTH - 1.4, roverZ);
      for (let rz = -0.35; rz <= 0.35; rz += 0.20) {
        for (const rx of [-0.25, 0.25]) {
          addDynPt(rvrPt.x + rx, 0.25, rvrPt.z + rz, PALETTE.cyan[0], PALETTE.cyan[1], PALETTE.cyan[2], 1.4, 0.9);
        }
      }
      const puckAngle = elapsed * 8.0;
      addDynPt(rvrPt.x, 0.65, rvrPt.z, PALETTE.amberBright[0], PALETTE.amberBright[1], PALETTE.amberBright[2], 2.6, 1.0);
      addDynPt(rvrPt.x + Math.cos(puckAngle) * 0.15, 0.65, rvrPt.z + Math.sin(puckAngle) * 0.15, PALETTE.amber[0], PALETTE.amber[1], PALETTE.amber[2], 1.8, 0.95);

      // Rover 3D Perception Bounding Box
      const roverCornersX = [-0.42, 0.42];
      const roverCornersY = [0.08, 0.85];
      const roverCornersZ = [-0.48, 0.48];
      for (const cx of roverCornersX) {
        for (const cy of roverCornersY) {
          for (const cz of roverCornersZ) {
            addDynPt(rvrPt.x + cx, cy, rvrPt.z + cz, PALETTE.amberBright[0], PALETTE.amberBright[1], PALETTE.amberBright[2], 1.8, 0.95);
          }
        }
      }
      // Floating Diamond over Rover
      addDynPt(rvrPt.x, 1.12, rvrPt.z, PALETTE.amberBright[0], PALETTE.amberBright[1], PALETTE.amberBright[2], 2.4, 1.0);

      // ── C. OVERHEAD HIGH-SPEED TRANSIT CAPSULE (Z = 420m to 540m) ──
      const transitZ = 420.0 + ((elapsed * 32.0) % 120.0);
      const trPt = getCurvePoint(0.0, transitZ);
      for (let tz = -3.5; tz <= 3.5; tz += 0.4) {
        addDynPt(trPt.x, 13.0, trPt.z + tz, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 2.2, 1.0);
        addDynPt(trPt.x, 12.6, trPt.z + tz, PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2], 1.6, 0.85);
      }

      // ── F. DYNAMIC VELOCITY WARP PARTICLES (Speed streaks) ──
      if (speedKmh > 10) {
        const streakIntensity = Math.min(1.0, speedKmh / 50.0);
        for (let i = 0; i < 36; i++) {
          const streakOffsetZ = ((elapsed * 55.0 + i * 14.0) % 120.0) - 15.0;
          const streakLat = (((i * 7) % 11) - 5) * 0.85;
          const pt = getCurvePoint(streakLat, truckZ + streakOffsetZ);
          const sAlpha = 0.40 * streakIntensity * Math.sin(((i + 1) / 37.0) * Math.PI);
          addDynPt(pt.x, 0.08 + (i % 3) * 0.12, pt.z, PALETTE.cyanBright[0], PALETTE.cyanBright[1], PALETTE.cyanBright[2], 1.6, sAlpha);
        }
      }

      // Zero out remaining dynamic buffer points
      for (let i = pIdx; i < MAX_DYN_POINTS; i++) {
        dynSizes[i] = 0.0;
        dynAlphas[i] = 0.0;
      }

      dynPosAttr.needsUpdate = true;
      dynColAttr.needsUpdate = true;
      dynSzAttr.needsUpdate = true;
      dynAlAttr.needsUpdate = true;

      if (composer) composer.render();
      else renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      renderer.dispose();
      staticGeo.dispose();
      shaderMaterial.dispose();
      dynGeo.dispose();
      dynMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
