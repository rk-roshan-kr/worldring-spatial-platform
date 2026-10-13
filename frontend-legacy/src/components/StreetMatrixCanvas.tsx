"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ─── Constants & Parameters ──────────────────────────────────────────────────
const LOOP_LENGTH = 260.0;    // Total corridor cycle in world meters
const ROAD_HALF_WIDTH = 6.2;  // Half-width of urban street
const CAM_HEIGHT = 1.75;      // Eye-level camera height (meters)
const BASE_SPEED = 4.5;       // Meters per second idle drift
const SCROLL_FACTOR = 0.08;   // Meters per pixel scrolled

// Color palette (RGB normalized)
const PALETTE = {
  cyan:      [0.0, 0.88, 1.0],
  teal:      [0.0, 0.65, 0.85],
  darkBlue:  [0.08, 0.28, 0.45],
  windowDim: [0.15, 0.45, 0.65],
  amber:     [1.0, 0.72, 0.28],
  warmWhite: [0.88, 0.95, 1.0],
  redLaser:  [1.0, 0.25, 0.25],
  dust:      [0.2, 0.45, 0.65],
} as const;

// ─── Dot Matrix 5x7 Font for Neon Signs ──────────────────────────────────────
const GLYPHS: Record<string, number[]> = {
  A: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
  B: [1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0],
  C: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0],
  D: [1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0],
  E: [1,1,1,1,1, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,0, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
  F: [1,1,1,1,1, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0],
  G: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,0, 1,0,1,1,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
  H: [1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
  I: [0,1,1,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
  K: [1,0,0,0,1, 1,0,0,1,0, 1,0,1,0,0, 1,1,0,0,0, 1,0,1,0,0, 1,0,0,1,0, 1,0,0,0,1],
  L: [1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
  M: [1,0,0,0,1, 1,1,0,1,1, 1,0,1,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
  N: [1,0,0,0,1, 1,1,0,0,1, 1,0,1,0,1, 1,0,0,1,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
  O: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
  P: [1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0],
  R: [1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0, 1,0,1,0,0, 1,0,0,1,0, 1,0,0,0,1],
  S: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,0, 0,1,1,1,0, 0,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
  T: [1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0],
  U: [1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
  V: [1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,0,1,0, 0,1,0,1,0, 0,0,1,0,0],
  W: [1,0,0,0,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,1,0,1, 1,1,0,1,1, 1,1,0,1,1, 1,0,0,0,1],
  X: [1,0,0,0,1, 0,1,0,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,0,1,0, 1,0,0,0,1],
  Y: [1,0,0,0,1, 0,1,0,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0],
  "0": [0,1,1,1,0, 1,0,0,1,1, 1,0,1,0,1, 1,1,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
  "1": [0,0,1,0,0, 0,1,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
  "2": [0,1,1,1,0, 1,0,0,0,1, 0,0,0,0,1, 0,0,1,1,0, 0,1,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
  "7": [1,1,1,1,1, 0,0,0,0,1, 0,0,0,1,0, 0,0,1,0,0, 0,1,0,0,0, 0,1,0,0,0, 0,1,0,0,0],
  " ": [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
};

// ─── Procedural Geometry Generator ───────────────────────────────────────────
function buildCityPointCloud(): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  alphas: Float32Array;
} {
  const pos: number[] = [];
  const col: number[] = [];
  const sz: number[] = [];
  const al: number[] = [];

  const addPt = (
    x: number,
    y: number,
    z: number,
    color: readonly number[],
    size: number,
    alpha: number
  ) => {
    pos.push(x, y, z);
    col.push(color[0], color[1], color[2]);
    sz.push(size);
    al.push(alpha);
  };

  const addSign = (
    text: string,
    sx: number,
    sy: number,
    szZ: number,
    scale: number,
    color: readonly number[]
  ) => {
    let curX = sx;
    for (const char of text.toUpperCase()) {
      const g = GLYPHS[char];
      if (!g) {
        curX += 6 * scale;
        continue;
      }
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (g[r * 5 + c]) {
            addPt(curX + c * scale, sy - r * scale, szZ, color, 1.4, 0.95);
          }
        }
      }
      curX += 6 * scale;
    }
  };

  const rnd = () => Math.random();

  // 1. Road Surface & Curbs & Lane Markings
  for (let z = 0; z < LOOP_LENGTH; z += 0.45) {
    // Glowing edge curbs
    addPt(-ROAD_HALF_WIDTH, 0.05, z, PALETTE.cyan, 1.8, 0.9);
    addPt(ROAD_HALF_WIDTH, 0.05, z, PALETTE.cyan, 1.8, 0.9);

    // Sidewalk outer boundaries
    addPt(-ROAD_HALF_WIDTH - 2.5, 0.15, z, PALETTE.teal, 1.2, 0.4);
    addPt(ROAD_HALF_WIDTH + 2.5, 0.15, z, PALETTE.teal, 1.2, 0.4);

    // Dotted center road stripe (dashed)
    if (Math.floor(z / 3.0) % 2 === 0) {
      addPt(-0.15, 0.02, z, PALETTE.warmWhite, 1.6, 0.85);
      addPt(0.15, 0.02, z, PALETTE.warmWhite, 1.6, 0.85);
    }
  }

  // Asphalt road surface texture dots (LiDAR ground reflections)
  for (let i = 0; i < 3200; i++) {
    const z = rnd() * LOOP_LENGTH;
    const x = (rnd() - 0.5) * ROAD_HALF_WIDTH * 2;
    addPt(x, 0.0, z, PALETTE.darkBlue, 0.8 + rnd() * 0.8, 0.18 + rnd() * 0.25);
  }

  // Crosswalk zebra stripes at milestones
  const crosswalks = [45, 110, 175, 230];
  for (const cz of crosswalks) {
    for (let strip = -ROAD_HALF_WIDTH + 0.8; strip < ROAD_HALF_WIDTH - 0.8; strip += 1.2) {
      for (let zOffset = 0; zOffset < 3.2; zOffset += 0.3) {
        addPt(strip, 0.02, cz + zOffset, PALETTE.cyan, 1.3, 0.75);
      }
    }
  }

  // 2. Procedural Buildings (Left & Right Flanks)
  const buildings: { side: number; z0: number; w: number; h: number; d: number }[] = [];
  
  // Left flank
  let curZL = 4;
  while (curZL < LOOP_LENGTH - 10) {
    const w = 12 + rnd() * 16;
    const h = 8 + rnd() * 22;
    const d = 8 + rnd() * 14;
    buildings.push({ side: -1, z0: curZL, w, h, d });
    curZL += w + 2 + rnd() * 4;
  }

  // Right flank
  let curZR = 6;
  while (curZR < LOOP_LENGTH - 10) {
    const w = 10 + rnd() * 18;
    const h = 10 + rnd() * 24;
    const d = 8 + rnd() * 14;
    buildings.push({ side: 1, z0: curZR, w, h, d });
    curZR += w + 2 + rnd() * 4;
  }

  for (const b of buildings) {
    const fx = b.side * (ROAD_HALF_WIDTH + 2.8);
    const bx = fx + b.side * b.d;

    // Vertical structural corner columns
    for (let y = 0; y < b.h; y += 0.4) {
      addPt(fx, y, b.z0, PALETTE.cyan, 1.4, 0.8);
      addPt(fx, y, b.z0 + b.w, PALETTE.cyan, 1.4, 0.8);
      // Back depth corners (softer)
      addPt(bx, y, b.z0, PALETTE.teal, 1.0, 0.4);
      addPt(bx, y, b.z0 + b.w, PALETTE.teal, 1.0, 0.4);
    }

    // Horizontal facade roof & base lines
    for (let z = b.z0; z <= b.z0 + b.w; z += 0.5) {
      addPt(fx, b.h, z, PALETTE.cyan, 1.5, 0.85); // Roof parapet
      addPt(fx, 0.1, z, PALETTE.teal, 1.2, 0.5);  // Ground trim
    }

    // Floor slabs & window grid matrices
    const floors = Math.floor(b.h / 3.4);
    for (let f = 1; f <= floors; f++) {
      const fy = f * 3.4;
      // Floor perimeter edge
      for (let z = b.z0; z <= b.z0 + b.w; z += 1.0) {
        addPt(fx, fy, z, PALETTE.teal, 1.1, 0.45);
      }

      // Windows
      const winCount = Math.max(2, Math.floor(b.w / 2.6));
      const winSpacing = b.w / (winCount + 1);
      for (let wIdx = 1; wIdx <= winCount; wIdx++) {
        const winCenterZ = b.z0 + wIdx * winSpacing;
        const winY = fy - 1.5;
        const isWarmLight = rnd() > 0.65;
        const winColor = isWarmLight ? PALETTE.amber : PALETTE.windowDim;
        const winAlpha = isWarmLight ? 0.85 : 0.45;

        // 4 corners of window frame
        const hw = 0.55;
        const hh = 0.7;
        for (let wz = winCenterZ - hw; wz <= winCenterZ + hw; wz += 0.35) {
          addPt(fx, winY - hh, wz, winColor, 1.0, winAlpha);
          addPt(fx, winY + hh, wz, winColor, 1.0, winAlpha);
        }
        for (let wy = winY - hh; wy <= winY + hh; wy += 0.35) {
          addPt(fx, wy, winCenterZ - hw, winColor, 1.0, winAlpha);
          addPt(fx, wy, winCenterZ + hw, winColor, 1.0, winAlpha);
        }
      }
    }

    // Rooftop antennas / LiDAR beacon spikes
    if (rnd() > 0.4) {
      const antZ = b.z0 + b.w * 0.5;
      for (let ay = b.h; ay < b.h + 5.5; ay += 0.4) {
        addPt(fx, ay, antZ, PALETTE.cyan, 1.2, 0.6);
      }
      // Beacon red/cyan pulse point on tip
      addPt(fx, b.h + 5.6, antZ, PALETTE.redLaser, 2.8, 1.0);
    }
  }

  // 3. Streetlights & Overhead Poles
  const lampZPositions = [15, 42, 70, 98, 128, 158, 188, 218, 248];
  for (const lz of lampZPositions) {
    const side = lz % 2 === 0 ? 1 : -1;
    const px = side * (ROAD_HALF_WIDTH + 0.4);

    // Vertical post
    for (let y = 0; y < 6.8; y += 0.35) {
      addPt(px, y, lz, PALETTE.teal, 1.2, 0.6);
    }

    // Overhang arm towards street center
    for (let d = 0; d < 2.4; d += 0.3) {
      const armX = px - side * d;
      const armY = 6.8 + Math.sin((d / 2.4) * 0.5) * 0.6;
      addPt(armX, armY, lz, PALETTE.cyan, 1.3, 0.75);
    }

    // Glowing lantern cluster (high intensity point sprite)
    const bulbX = px - side * 2.4;
    const bulbY = 6.9;
    for (let i = 0; i < 7; i++) {
      addPt(
        bulbX + (rnd() - 0.5) * 0.25,
        bulbY + (rnd() - 0.5) * 0.25,
        lz + (rnd() - 0.5) * 0.25,
        PALETTE.warmWhite,
        2.5 + rnd() * 1.5,
        0.95
      );
    }
  }

  // 4. Overhead Festive String Lights (Catenary Wires)
  const stringLightZ = [28, 60, 90, 120, 150, 180, 210, 240];
  for (const szZ of stringLightZ) {
    const bulbCount = 22;
    for (let i = 0; i <= bulbCount; i++) {
      const t = i / bulbCount;
      const x = -ROAD_HALF_WIDTH + t * (ROAD_HALF_WIDTH * 2);
      // Parabolic catenary sag
      const sag = Math.sin(t * Math.PI) * 1.8;
      const y = 6.0 - sag;
      addPt(x, y, szZ + (rnd() - 0.5) * 0.15, PALETTE.amber, 1.8 + rnd() * 0.8, 0.9);
    }
  }

  // 5. Storefront Neon Dot-Matrix Signs
  const signs = [
    { text: "WORLDRING", x: -ROAD_HALF_WIDTH - 2.6, y: 4.8, z: 12, s: 0.18, col: PALETTE.cyan },
    { text: "SPATIAL AI", x: ROAD_HALF_WIDTH + 0.6, y: 5.2, z: 38, s: 0.16, col: PALETTE.cyan },
    { text: "SECTOR 17", x: -ROAD_HALF_WIDTH - 2.6, y: 4.5, z: 68, s: 0.17, col: PALETTE.amber },
    { text: "CAFE", x: ROAD_HALF_WIDTH + 0.6, y: 4.2, z: 95, s: 0.22, col: PALETTE.amber },
    { text: "NEURAL HUB", x: -ROAD_HALF_WIDTH - 2.6, y: 5.4, z: 135, s: 0.15, col: PALETTE.cyan },
    { text: "QUANTUM", x: ROAD_HALF_WIDTH + 0.6, y: 4.8, z: 172, s: 0.18, col: PALETTE.amber },
    { text: "STUDIO 01", x: -ROAD_HALF_WIDTH - 2.6, y: 4.6, z: 205, s: 0.17, col: PALETTE.cyan },
    { text: "WORLD LAB", x: ROAD_HALF_WIDTH + 0.6, y: 5.0, z: 238, s: 0.16, col: PALETTE.cyan },
  ];
  for (const s of signs) {
    addSign(s.text, s.x, s.y, s.z, s.s, s.col);
  }

  // 6. Autonomous Vehicle Wireframe Driving Ahead
  for (let zCar = 20; zCar <= 24.5; zCar += 0.3) {
    // Car chassis box
    const cx = 1.8;
    addPt(cx - 0.9, 0.4, zCar, PALETTE.cyan, 1.3, 0.7);
    addPt(cx + 0.9, 0.4, zCar, PALETTE.cyan, 1.3, 0.7);
    addPt(cx - 0.8, 1.3, zCar, PALETTE.cyan, 1.2, 0.6);
    addPt(cx + 0.8, 1.3, zCar, PALETTE.cyan, 1.2, 0.6);
  }
  // Red tail lights on car
  addPt(1.0, 0.7, 20.0, PALETTE.redLaser, 2.8, 1.0);
  addPt(2.6, 0.7, 20.0, PALETTE.redLaser, 2.8, 1.0);

  // 7. Floating Atmospheric Particles & LiDAR Dust
  for (let i = 0; i < 2800; i++) {
    const x = (rnd() - 0.5) * (ROAD_HALF_WIDTH * 3.2);
    const y = rnd() * 16.0;
    const z = rnd() * LOOP_LENGTH;
    addPt(x, y, z, PALETTE.dust, 0.6 + rnd() * 0.9, 0.15 + rnd() * 0.3);
  }

  return {
    positions: new Float32Array(pos),
    colors: new Float32Array(col),
    sizes: new Float32Array(sz),
    alphas: new Float32Array(al),
  };
}

// ─── Custom Shaders for Distance Reveal & LiDAR Sweep ─────────────────────────
const VERTEX_SHADER = `
  uniform float uCamZ;
  uniform float uLoopLength;
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Infinite coordinate wrap along Z axis
    // When point drops behind camera, wraps smoothly to far horizon
    float relZ = position.z - uCamZ;
    relZ = mod(relZ, uLoopLength);

    // Reconstructed world position for this camera frame
    vec3 worldPos = vec3(position.x, position.y, uCamZ + relZ);

    // Transform to camera view space
    vec4 mvPosition = viewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // View distance from camera plane
    float viewDist = -mvPosition.z;

    // 1. Horizon Emergence (fade in from black void between 180m and 110m)
    float horizonFade = smoothstep(190.0, 100.0, viewDist);

    // 2. Near Dissolve (fade out beside lens between 3.5m and 0.8m)
    float nearDissolve = smoothstep(0.8, 3.5, viewDist);

    // 3. Active LiDAR Scan Wave (sweeping radar pulse along corridor)
    float scanPos = mod(uTime * 32.0, 180.0);
    float scanDist = abs(viewDist - scanPos);
    float scanPulse = exp(-scanDist * 0.18) * 0.75;

    // Combined alpha
    float baseAlpha = aAlpha * horizonFade * nearDissolve;
    vAlpha = clamp(baseAlpha * (1.0 + scanPulse), 0.0, 1.0);

    // Extra brightness / tint when LiDAR pulse strikes
    vColor = aColor + vec3(0.0, 0.4, 0.6) * scanPulse;

    // Attenuated point size based on perspective distance
    float sizeScale = (270.0 / max(viewDist, 1.2)) * uPixelRatio;
    gl_PointSize = clamp(aSize * sizeScale * (1.0 + scanPulse * 0.35), 0.8, 8.5);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from center of point sprite [ -0.5 to 0.5 ]
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    // Discard outside soft circular boundary
    if (dist > 0.5) discard;

    // Soft Gaussian-like core with luminescent bloom halo
    float core = smoothstep(0.5, 0.15, dist);
    float halo = (1.0 - dist * 2.0) * 0.45;
    float intensity = clamp(core + halo, 0.0, 1.0);

    float finalAlpha = vAlpha * intensity;
    if (finalAlpha < 0.008) discard;

    // Output glowing color with premultiplied brightness for AdditiveBlending
    gl_FragColor = vec4(vColor * finalAlpha, finalAlpha);
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
interface StreetMatrixCanvasProps {
  className?: string;
  onMaterializeComplete?: () => void;
  paused?: boolean;
}

export function StreetMatrixCanvas({ className = "", onMaterializeComplete, paused = false }: StreetMatrixCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, CAM_HEIGHT, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      alpha: false,
      stencil: false,
      depth: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Post-Processing Bloom
    let composer: EffectComposer | null = null;
    try {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.75, // strength
        0.35, // radius
        0.18  // threshold
      );
      composer.addPass(bloomPass);
    } catch (e) {
      console.warn("UnrealBloomPass unavailable, running direct shader pass:", e);
      composer = null;
    }

    // 4. Build Point Cloud Geometry & Shader Material
    const cityData = buildCityPointCloud();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(cityData.positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(cityData.colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(cityData.sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(cityData.alphas, 1));

    const uniforms = {
      uCamZ: { value: 0.0 },
      uLoopLength: { value: LOOP_LENGTH },
      uTime: { value: 0.0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
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

    const pointCloud = new THREE.Points(geometry, shaderMaterial);
    scene.add(pointCloud);

    // 5. Interaction & Dynamic State
    let camZ = 0.0;
    let targetScrollCamZ = 0.0;
    let autoCamZ = 0.0;
    let lastTime = performance.now();
    let animId = 0;
    let isVisible = true;

    // Mouse parallax tracking
    let mouseX = 0.5;
    let mouseY = 0.5;
    let curRotX = 0.0;
    let curRotY = 0.0;
    let curCamX = 0.0;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      targetScrollCamZ = scrollY * SCROLL_FACTOR;
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      const pr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pr);
      uniforms.uPixelRatio.value = pr;

      if (composer) {
        composer.setSize(width, height);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Initial scroll setup
    handleScroll();

    // Intersection Observer to sleep when out of screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 6. Animation Render Loop
    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Base auto-drift forward
      autoCamZ += BASE_SPEED * dt;

      // Smooth camera Z lerp combining auto-drift + scroll position
      const desiredZ = autoCamZ + targetScrollCamZ;
      camZ += (desiredZ - camZ) * 0.12;

      // Update uniforms
      uniforms.uCamZ.value = camZ;
      uniforms.uTime.value = currentTime / 1000.0;

      // Mouse parallax camera tilt & gentle horizontal sway
      const targetRotY = (mouseX - 0.5) * -0.16; // Yaw
      const targetRotX = (mouseY - 0.5) * -0.09; // Pitch
      const targetCamX = (mouseX - 0.5) * 0.6;   // Sway

      curRotY += (targetRotY - curRotY) * 0.08;
      curRotX += (targetRotX - curRotX) * 0.08;
      curCamX += (targetCamX - curCamX) * 0.08;

      camera.position.x = curCamX;
      camera.position.y = CAM_HEIGHT;
      camera.position.z = camZ;

      // Look forward along +Z axis
      camera.lookAt(curCamX + curRotY * 50.0, CAM_HEIGHT + curRotX * 35.0, camZ + 60.0);

      // Render via Bloom EffectComposer or direct renderer
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      // Update HUD telemetry
      if (telemetryRef.current) {
        telemetryRef.current.innerText = `DEPTH: ${camZ.toFixed(1)}m · V: ${(
          BASE_SPEED + (desiredZ - camZ) * 2.0
        ).toFixed(1)}m/s · PTS: 21,480`;
      }
    };

    animId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden pointer-events-none ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Cyberpunk LiDAR Telemetry HUD Readout in Bottom-Right */}
      <div className="absolute bottom-5 right-6 z-20 pointer-events-none hidden sm:flex items-center gap-3 font-mono text-[0.62rem] text-accent/60 tracking-wider uppercase backdrop-blur-xs px-3 py-1.5 rounded-full border border-accent/15 bg-paper/60">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span ref={telemetryRef}>DEPTH: 0.0m · SCANNING</span>
      </div>

      {/* Subtle Vanishing-Point Crosshair Reticle */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-30 flex items-center justify-center">
        <div className="w-6 h-6 border border-accent/40 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-accent rounded-full" />
        </div>
      </div>
    </div>
  );
}
