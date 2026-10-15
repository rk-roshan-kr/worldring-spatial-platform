import * as THREE from "three";
import { CIRCUIT_ENTRANCE, getEarthosCircuitPoints } from "./earthosPointsData";

export { CIRCUIT_ENTRANCE, getEarthosCircuitPoints };

export interface CircuitPoint {
  x: number;
  z: number;
}

export interface CircuitPose {
  x: number;
  z: number;
  dirX: number;
  dirZ: number;
  normX: number;
  normZ: number;
}

/**
 * Parametric connecting avenue from City Avenue (z = 550m) straight up to EarthOS Lab T-Intersection (697.5m).
 * Completely straight along central axis (x = 0), C1 continuous with the avenue and T-intersection.
 */
export function getConnectingRoadPoint(t: number) {
  const startZ = 550.0;
  const endZ = 697.5;
  const z = startZ + (endZ - startZ) * t;
  const x = 0.0;

  const dx = 0.0;
  const dz = endZ - startZ;
  const dirX = 0.0;
  const dirZ = 1.0;
  const normX = -1.0;
  const normZ = 0.0;

  return { x, z, dx, dz, dirX, dirZ, normX, normZ };
}

/**
 * Builds the continuous "earthoslab" circuit featuring:
 * 1. Real-world channelized highway T-intersection arrival (x = 0, z = 697.5)
 * 2. Left-turn guide arc onto the westbound expressway (z = 705.205)
 * 3. Smooth natural bridge from expressway into the ramp climbing into 'e'
 * 4. Continuous navigation through all 10 letters ('e' through 'b')
 * 5. Outer turnaround loop around 'b' returning along the bottom expressway back past the central junction
 * Resampled at uniform 2.0m arc-length intervals for zero vertex clumping and even lighting.
 */
export function createEarthosCircuitPolyline(): CircuitPoint[] {
  const rawPts: CircuitPoint[] = [];

  const pushPt = (x: number, z: number) => {
    if (rawPts.length > 0) {
      const last = rawPts[rawPts.length - 1];
      if (Math.hypot(x - last.x, z - last.z) < 0.05) return;
    }
    rawPts.push({ x, z });
  };

  const addBezier = (
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    steps: number = 24
  ) => {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const it = 1 - t;
      const x =
        it * it * it * p0[0] +
        3 * it * it * t * p1[0] +
        3 * it * t * t * p2[0] +
        t * t * t * p3[0];
      const z =
        it * it * it * p0[1] +
        3 * it * it * t * p1[1] +
        3 * it * t * t * p2[1] +
        t * t * t * p3[1];
      pushPt(x, z);
    }
  };

  const addLine = (p0: [number, number], p1: [number, number], steps: number = 16) => {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pushPt(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t);
    }
  };

  // Master Grid:
  // Baseline = 716.0m | X-Height = 736.0m | Ascender Top = 755.5m | Bottom Expressway = 705.0m
  // In World Space: Left (+X) to Right (-X). (Screen X = -World X)

  // 1. Straight Central Avenue Arrival from City: z = 550.0m to z = 697.5m along x = 0
  addLine([0.0, 550.0], [0.0, 697.5], 36);

  // 2. Real-World Channelized T-Intersection Left-Turn curve onto the westbound expressway
  // Curves smoothly from (0, 697.5) through the intersection throat into heading west (+X) along z = 705.205m
  addBezier([0.0, 697.5], [0.0, 702.5], [4.0, 705.205], [16.0, 705.205], 24);

  // 3. Straight Bottom Expressway toward 'e' (World X: 16.0 to 73.8, Z = 705.205)
  addLine([16.0, 705.205], [73.8, 705.205], 28);

  // 4. One Seamless Sweeping Road Curve from Expressway into Letter 'e'
  // Exactly follows the centerline of the seamless road curve (P0 -> P1 -> P2 -> P3) with C1 continuity into 'e'
  addBezier([73.8, 705.205], [112.0, 705.205], [123.94, 704.81], [119.6, 716.0], 32);

  // 5. Natural Stem of 'e' climbing straight into Crossbar
  addLine([119.6, 716.0], [104.0, 732.5], 20);

  // 6. Crossbar of 'e'
  addLine([104.0, 732.5], [92.0, 732.5], 16);

  // 7. Pristine Top Loop and Bottom Bowl of 'e'
  addBezier([92.0, 732.5], [87.0, 736.0], [92.0, 746.0], [100.0, 746.0], 18);
  addBezier([100.0, 746.0], [107.0, 746.0], [108.0, 738.0], [106.0, 732.0], 18);
  addBezier([106.0, 732.0], [104.0, 724.0], [96.0, 722.0], [92.0, 722.0], 18);
  addBezier([92.0, 722.0], [87.5, 722.0], [86.5, 725.5], [86.5, 725.5], 14); // rises into baseline of 'a'

  // 6. First 'a' - Perimeter-only oval bowl (ZERO internal cut) + vertical right stem
  addBezier([86.5, 725.5], [86.0, 732.5], [81.5, 736.5], [76.0, 736.5], 18);
  addBezier([76.0, 736.5], [70.5, 736.5], [66.5, 732.5], [66.5, 726.0], 18);
  addBezier([66.5, 726.0], [66.5, 719.5], [70.5, 716.0], [76.0, 716.0], 18);
  addBezier([76.0, 716.0], [81.5, 716.0], [86.5, 719.5], [86.5, 726.0], 18);
  addBezier([86.5, 726.0], [86.5, 732.5], [81.5, 736.5], [75.5, 736.5], 18);
  addBezier([75.5, 736.5], [69.5, 736.5], [66.5, 733.5], [66.5, 728.0], 14);
  addLine([66.5, 728.0], [66.5, 720.0], 12);
  addBezier([66.5, 720.0], [66.5, 715.5], [60.0, 715.5], [58.5, 721.0], 16); // valley into 'r'

  // 7. 'r' - Stem + arched shoulder flowing into 't' valley (World X: 58.5 to 38.5)
  addLine([58.5, 721.0], [58.5, 731.0], 12);
  addBezier([58.5, 731.0], [58.5, 736.8], [50.0, 736.8], [47.5, 731.0], 18);
  addBezier([47.5, 731.0], [45.5, 725.0], [45.5, 716.0], [42.0, 716.0], 16);
  addBezier([42.0, 716.0], [39.0, 716.0], [38.5, 720.0], [38.5, 726.0], 14); // entry into 't' left stem

  // 8. 't' - Wide 9.0m ascender loop + continuous horizontal crossbar (World X: 38.5 to 21.0)
  addLine([38.5, 726.0], [38.5, 750.0], 24);
  addBezier([38.5, 750.0], [38.5, 756.0], [29.5, 756.0], [29.5, 750.0], 20); // wide 9m dome
  addLine([29.5, 750.0], [29.5, 738.0], 12);
  addBezier([29.5, 738.0], [33.0, 736.5], [42.0, 736.5], [47.0, 736.0], 16);
  addBezier([47.0, 736.0], [42.0, 735.8], [28.0, 735.8], [23.0, 735.8], 20);
  addBezier([23.0, 735.8], [27.5, 735.8], [29.5, 734.5], [29.5, 731.0], 12);
  addLine([29.5, 731.0], [29.5, 720.5], 12);
  addBezier([29.5, 720.5], [29.5, 715.5], [21.5, 715.5], [20.5, 721.0], 16); // valley into 'h'

  // 9. 'h' - Wide 9.0m ascender loop + clean round arch (World X: 20.5 to -2.0)
  addLine([20.5, 721.0], [20.5, 750.0], 28);
  addBezier([20.5, 750.0], [20.5, 756.0], [11.5, 756.0], [11.5, 750.0], 20); // wide 9m top dome
  addLine([11.5, 750.0], [11.5, 725.0], 24);
  addBezier([11.5, 725.0], [11.5, 733.5], [8.0, 736.5], [4.0, 736.5], 16);
  addBezier([4.0, 736.5], [-0.5, 736.5], [-2.0, 733.0], [-2.0, 727.0], 16);
  addLine([-2.0, 727.0], [-2.0, 720.5], 10);
  addBezier([-2.0, 720.5], [-2.0, 716.0], [-8.5, 716.0], [-18.5, 716.0], 18); // entry into 'o'

  // 10. 'o' - Pure baseline-aligned circle (Center: [-18.5, 726.25], Radius: 10.25m)
  addBezier([-18.5, 716.0], [-24.2, 716.0], [-28.75, 720.6], [-28.75, 726.25], 18);
  addBezier([-28.75, 726.25], [-28.75, 731.9], [-24.2, 736.5], [-18.5, 736.5], 18);
  addBezier([-18.5, 736.5], [-12.8, 736.5], [-8.25, 731.9], [-8.25, 726.25], 18);
  addBezier([-8.25, 726.25], [-8.25, 720.6], [-12.8, 716.0], [-18.5, 716.0], 18);
  // Bridge to 's'
  addBezier([-18.5, 716.0], [-24.5, 716.0], [-28.75, 724.0], [-28.5, 733.15], 18);

  // 11. 's' - True forward cursive 's'
  addBezier([-28.5, 733.15], [-28.5, 741.0], [-31.0, 746.3], [-35.1, 746.3], 16);
  addBezier([-35.1, 746.3], [-41.0, 746.3], [-43.0, 742.0], [-39.0, 738.5], 16);
  addBezier([-39.0, 738.5], [-34.0, 734.0], [-36.0, 732.0], [-41.1, 729.0], 18);
  addBezier([-41.1, 729.0], [-43.0, 724.0], [-39.5, 722.0], [-35.1, 722.0], 16);
  addBezier([-35.1, 722.0], [-29.5, 722.0], [-27.5, 725.0], [-28.5, 728.0], 16);
  addBezier([-28.5, 728.0], [-33.0, 726.0], [-38.0, 727.5], [-43.0, 729.5], 16);
  addBezier([-43.0, 729.5], [-45.0, 730.5], [-46.0, 731.5], [-48.0, 733.5], 12);

  // 12. 'l' - Wide 9.0m ascender loop
  addLine([-48.0, 733.5], [-48.0, 750.0], 20);
  addBezier([-48.0, 750.0], [-48.0, 756.0], [-57.0, 756.0], [-57.0, 750.0], 20); // wide 9m top dome
  addLine([-57.0, 750.0], [-57.0, 721.0], 26);
  addBezier([-57.0, 721.0], [-57.0, 716.0], [-63.0, 716.0], [-72.5, 725.5], 18); // valley into second 'a'

  // 13. Second 'a' - Perimeter-only oval bowl (ZERO internal cut) + vertical right stem
  addBezier([-72.5, 725.5], [-73.0, 732.5], [-77.5, 736.5], [-83.0, 736.5], 18);
  addBezier([-83.0, 736.5], [-88.5, 736.5], [-92.5, 732.5], [-92.5, 726.0], 18);
  addBezier([-92.5, 726.0], [-92.5, 719.5], [-88.5, 716.0], [-83.0, 716.0], 18);
  addBezier([-83.0, 716.0], [-77.5, 716.0], [-72.5, 719.5], [-72.5, 726.0], 18);
  addBezier([-72.5, 726.0], [-72.5, 732.5], [-77.5, 736.5], [-83.5, 736.5], 18);
  addBezier([-83.5, 736.5], [-89.5, 736.5], [-92.5, 733.5], [-92.5, 728.0], 14);
  addLine([-92.5, 728.0], [-92.5, 720.0], 12);
  addBezier([-92.5, 720.0], [-92.5, 715.5], [-99.0, 715.5], [-100.0, 721.0], 16); // valley into 'b'

  // 14. 'b' - Wide 9.0m ascender loop + circular bowl + continuous climb to outer turnaround
  addLine([-100.0, 721.0], [-100.0, 750.0], 28);
  addBezier([-100.0, 750.0], [-100.0, 756.0], [-109.0, 756.0], [-109.0, 750.0], 20); // wide 9m top dome
  addLine([-109.0, 750.0], [-109.0, 724.0], 24);
  addBezier([-109.0, 724.0], [-109.0, 718.5], [-113.5, 716.0], [-119.0, 716.0], 18);
  addBezier([-119.0, 716.0], [-125.0, 716.0], [-129.0, 720.5], [-129.0, 726.25], 18);
  addBezier([-129.0, 726.25], [-129.0, 732.0], [-125.0, 736.5], [-119.0, 736.5], 18);
  addBezier([-119.0, 736.5], [-113.0, 736.5], [-109.0, 733.5], [-109.0, 729.0], 16);
  addLine([-109.0, 729.0], [-109.0, 750.0], 20);

  // 15. Giant Outer Turnaround Loop around 'b' to bottom expressway at z = 705.2m
  addBezier([-109.0, 750.0], [-109.0, 757.0], [-122.0, 758.5], [-135.0, 752.0], 24);
  addBezier([-135.0, 752.0], [-148.0, 745.5], [-153.0, 732.0], [-151.0, 718.0], 24);
  addBezier([-151.0, 718.0], [-149.0, 710.0], [-136.0, 705.2], [-118.0, 705.2], 24);

  // 16. Straight bottom expressway return along Z = 705.205m back past the central T-intersection
  addLine([-118.0, 705.205], [28.0, 705.205], 85);

  // --- UNIFORM ARC-LENGTH RESAMPLING (Eliminates vertex clumping & light glare) ---
  const cumDist: number[] = [0];
  for (let i = 0; i < rawPts.length - 1; i++) {
    const d = Math.hypot(rawPts[i + 1].x - rawPts[i].x, rawPts[i + 1].z - rawPts[i].z);
    cumDist.push(cumDist[i] + d);
  }
  const totalLen = cumDist[cumDist.length - 1];
  const sampleSpacing = 2.0; // Uniform 2.0m spacing across the entire circuit
  const numSamples = Math.max(2, Math.round(totalLen / sampleSpacing));

  const uniformPts: CircuitPoint[] = [];
  let segIdx = 0;
  for (let i = 0; i <= numSamples; i++) {
    const targetD = (i / numSamples) * totalLen;
    while (segIdx < cumDist.length - 2 && cumDist[segIdx + 1] < targetD) {
      segIdx++;
    }
    const segStart = cumDist[segIdx];
    const segLen = cumDist[segIdx + 1] - segStart;
    const localT = segLen > 1e-5 ? (targetD - segStart) / segLen : 0;
    uniformPts.push({
      x: rawPts[segIdx].x + (rawPts[segIdx + 1].x - rawPts[segIdx].x) * localT,
      z: rawPts[segIdx].z + (rawPts[segIdx + 1].z - rawPts[segIdx].z) * localT,
    });
  }

  return uniformPts;
}

export const EARTHOS_CIRCUIT_SPLINE = createEarthosCircuitPolyline();

// Pre-calculate cumulative lengths along circuit
const CIRCUIT_CUMULATIVE_DIST: number[] = [0];
for (let i = 0; i < EARTHOS_CIRCUIT_SPLINE.length - 1; i++) {
  const p0 = EARTHOS_CIRCUIT_SPLINE[i];
  const p1 = EARTHOS_CIRCUIT_SPLINE[i + 1];
  const d = Math.hypot(p1.x - p0.x, p1.z - p0.z);
  CIRCUIT_CUMULATIVE_DIST.push(CIRCUIT_CUMULATIVE_DIST[i] + d);
}
export const CIRCUIT_TOTAL_LENGTH = CIRCUIT_CUMULATIVE_DIST[CIRCUIT_CUMULATIVE_DIST.length - 1];

export function getCircuitPose(progress: number): CircuitPose {
  const clampedProgress = Math.max(0.0, Math.min(1.0, progress));
  const targetDist = clampedProgress * CIRCUIT_TOTAL_LENGTH;

  let segIdx = 0;
  for (let i = 0; i < CIRCUIT_CUMULATIVE_DIST.length - 1; i++) {
    if (targetDist >= CIRCUIT_CUMULATIVE_DIST[i] && targetDist <= CIRCUIT_CUMULATIVE_DIST[i + 1]) {
      segIdx = i;
      break;
    }
  }

  const p0 = EARTHOS_CIRCUIT_SPLINE[segIdx];
  const p1 = EARTHOS_CIRCUIT_SPLINE[segIdx + 1] || p0;
  const segStart = CIRCUIT_CUMULATIVE_DIST[segIdx];
  const segEnd = CIRCUIT_CUMULATIVE_DIST[segIdx + 1] || segStart + 0.001;
  const segLen = segEnd - segStart;
  const localT = segLen > 0.0001 ? (targetDist - segStart) / segLen : 0.0;

  const curX = p0.x + (p1.x - p0.x) * localT;
  const curZ = p0.z + (p1.z - p0.z) * localT;

  // Smoothed tangent across neighboring points for clean ribbon normals
  const prevPt = EARTHOS_CIRCUIT_SPLINE[Math.max(0, segIdx - 1)];
  const nextPt = EARTHOS_CIRCUIT_SPLINE[Math.min(EARTHOS_CIRCUIT_SPLINE.length - 1, segIdx + 2)];
  const dx = nextPt.x - prevPt.x;
  const dz = nextPt.z - prevPt.z;
  const dLen = Math.hypot(dx, dz) || 0.001;

  const dirX = dx / dLen;
  const dirZ = dz / dLen;
  const normX = -dirZ;
  const normZ = dirX;

  return {
    x: curX,
    z: curZ,
    dirX,
    dirZ,
    normX,
    normZ,
  };
}
