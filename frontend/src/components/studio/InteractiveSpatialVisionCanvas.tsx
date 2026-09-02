"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Scan, 
  Eye, 
  Sparkles, 
  MapPin, 
  Compass, 
  Sliders, 
  Maximize2,
  Box,
  Cpu,
  Radio,
  Building2,
  Navigation
} from "lucide-react";

export function InteractiveSpatialVisionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visionMode, setVisionMode] = useState<"rgb" | "depth" | "wireframe" | "semantics">("rgb");
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>("BLD_02");
  const [cameraPose, setCameraPose] = useState({ x: 0, y: -20, z: -80, yaw: 0, pitch: 0.15 });
  
  // Animation & Physics Refs
  const poseRef = useRef({ x: 0, y: -20, z: -80, yaw: 0, pitch: 0.15 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const routeProgress = useRef(0);
  const animFrameId = useRef<number>(0);

  // Define 3D Scene Geometry (Street, Buildings, Vehicles, Landmarks)
  const sceneEntities = [
    {
      id: "BLD_01",
      name: "North Retail Arcade",
      type: "STRUCTURE",
      x: -42, y: -45, z: -30, w: 30, h: 70, d: 45,
      colorRGB: "#2a3442", colorSemantics: "#6366f1",
      heightM: 21.0, address: "Sector 17-B, North Plaza"
    },
    {
      id: "BLD_02",
      name: "Cobalt Commercial Complex",
      type: "KEY_LANDMARK",
      x: 45, y: -60, z: 20, w: 34, h: 95, d: 55,
      colorRGB: "#1e3a8a", colorSemantics: "#00f0ff",
      heightM: 28.5, address: "Corridor Turn 02, East Portico",
      isKeyLandmark: true
    },
    {
      id: "BLD_03",
      name: "Corner Veranda Bakery",
      type: "DESTINATION",
      x: 40, y: -25, z: 85, w: 26, h: 45, d: 35,
      colorRGB: "#065f46", colorSemantics: "#10b981",
      heightM: 14.0, address: "Destination Gate 04, Veranda Deck",
      isDestination: true
    },
    {
      id: "BLD_04",
      name: "West Civic Tower",
      type: "STRUCTURE",
      x: -46, y: -75, z: 50, w: 36, h: 110, d: 50,
      colorRGB: "#334155", colorSemantics: "#6366f1",
      heightM: 33.0, address: "Sector 17-C, Civic Wing"
    }
  ];

  // Route Waypoints for Automated Drone Flythrough
  const routePath = [
    { x: 0, y: -15, z: -110, yaw: 0, pitch: 0.12, cue: "START: Sector Roundabout Monument" },
    { x: 0, y: -15, z: -30, yaw: 0.05, pitch: 0.1, cue: "Approaching North Corridor" },
    { x: 8, y: -18, z: 15, yaw: 0.45, pitch: 0.14, cue: "TURN RIGHT: Pass Cobalt Blue Complex" },
    { x: 26, y: -12, z: 75, yaw: 0.85, pitch: 0.18, cue: "ARRIVED: 4th Storefront (Corner Bakery)" },
  ];

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse Drag Listeners
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      poseRef.current.yaw += dx * 0.005;
      poseRef.current.pitch = Math.max(-0.4, Math.min(0.6, poseRef.current.pitch - dy * 0.004));
      
      dragStart.current = { x: e.clientX, y: e.clientY };
      setCameraPose({ ...poseRef.current });
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const canvasElem = canvasRef.current;
    if (canvasElem) {
      canvasElem.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const cx = w / 2;
      const cy = h / 2;

      // Handle Route Flight Animation
      if (isPlayingRoute) {
        routeProgress.current += 0.004;
        if (routeProgress.current >= 1) {
          routeProgress.current = 1;
          setIsPlayingRoute(false);
        }

        const t = routeProgress.current;
        const p0 = routePath[0];
        const p1 = routePath[1];
        const p2 = routePath[2];
        const p3 = routePath[3];

        // Spline interpolation
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const curX = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        const curY = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
        const curZ = uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z;
        const curYaw = uuu * p0.yaw + 3 * uu * t * p1.yaw + 3 * u * tt * p2.yaw + ttt * p3.yaw;
        const curPitch = uuu * p0.pitch + 3 * uu * t * p1.pitch + 3 * u * tt * p2.pitch + ttt * p3.pitch;

        poseRef.current = { x: curX, y: curY, z: curZ, yaw: curYaw, pitch: curPitch };
        setCameraPose({ ...poseRef.current });
      }

      ctx.clearRect(0, 0, w, h);

      // Background Tone based on Mode
      if (visionMode === "rgb") {
        ctx.fillStyle = "#070a10";
      } else if (visionMode === "depth") {
        ctx.fillStyle = "#030407";
      } else if (visionMode === "wireframe") {
        ctx.fillStyle = "#020305";
      } else {
        ctx.fillStyle = "#05070c";
      }
      ctx.fillRect(0, 0, w, h);

      // Project 3D coordinate to 2D screen
      const fov = 420;
      const cosY = Math.cos(poseRef.current.yaw);
      const sinY = Math.sin(poseRef.current.yaw);
      const cosP = Math.cos(poseRef.current.pitch);
      const sinP = Math.sin(poseRef.current.pitch);

      const project = (x: number, y: number, z: number) => {
        const rx = x - poseRef.current.x;
        const ry = y - poseRef.current.y;
        const rz = z - poseRef.current.z;

        const x1 = rx * cosY - rz * sinY;
        const z1 = rx * sinY + rz * cosY;

        const y2 = ry * cosP - z1 * sinP;
        const z2 = ry * sinP + z1 * cosP;

        if (z2 <= 2) return null;
        const scale = fov / z2;
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale
        };
      };

      // 1. Draw Ground Grid & Road Surface
      ctx.lineWidth = 1;
      const roadZMin = -140;
      const roadZMax = 140;

      for (let z = roadZMin; z <= roadZMax; z += 12) {
        const left = project(-18, 20, z);
        const right = project(18, 20, z);
        if (left && right) {
          ctx.beginPath();
          ctx.moveTo(left.px, left.py);
          ctx.lineTo(right.px, right.py);
          
          if (visionMode === "rgb") {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          } else if (visionMode === "depth") {
            const depthColor = Math.max(0, 255 - left.pz * 1.4);
            ctx.strokeStyle = `rgba(${depthColor}, 100, 200, 0.4)`;
          } else if (visionMode === "wireframe") {
            ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
          } else {
            ctx.strokeStyle = "rgba(255, 170, 0, 0.4)";
          }
          ctx.stroke();
        }
      }

      const pCurbL1 = project(-18, 20, roadZMin);
      const pCurbL2 = project(-18, 20, roadZMax);
      const pCurbR1 = project(18, 20, roadZMin);
      const pCurbR2 = project(18, 20, roadZMax);
      const pCenter1 = project(0, 20, roadZMin);
      const pCenter2 = project(0, 20, roadZMax);

      if (pCurbL1 && pCurbL2) {
        ctx.beginPath();
        ctx.moveTo(pCurbL1.px, pCurbL1.py);
        ctx.lineTo(pCurbL2.px, pCurbL2.py);
        ctx.strokeStyle = visionMode === "wireframe" ? "#00f0ff" : "#ff571a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (pCurbR1 && pCurbR2) {
        ctx.beginPath();
        ctx.moveTo(pCurbR1.px, pCurbR1.py);
        ctx.lineTo(pCurbR2.px, pCurbR2.py);
        ctx.strokeStyle = visionMode === "wireframe" ? "#00f0ff" : "#ff571a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (pCenter1 && pCenter2) {
        ctx.beginPath();
        ctx.setLineDash([8, 8]);
        ctx.moveTo(pCenter1.px, pCenter1.py);
        ctx.lineTo(pCenter2.px, pCenter2.py);
        ctx.strokeStyle = "#ff571a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Draw 3D Buildings
      sceneEntities.forEach((b) => {
        const hw = b.w / 2;
        const hd = b.d / 2;

        const corners = [
          { x: b.x - hw, y: b.y, z: b.z - hd },
          { x: b.x + hw, y: b.y, z: b.z - hd },
          { x: b.x + hw, y: b.y, z: b.z + hd },
          { x: b.x - hw, y: b.y, z: b.z + hd },
          { x: b.x - hw, y: b.y + b.h, z: b.z - hd },
          { x: b.x + hw, y: b.y + b.h, z: b.z - hd },
          { x: b.x + hw, y: b.y + b.h, z: b.z + hd },
          { x: b.x - hw, y: b.y + b.h, z: b.z + hd },
        ];

        const projCorners = corners.map((c) => project(c.x, c.y, c.z));
        const allVisible = projCorners.every((c) => c !== null);

        if (allVisible) {
          const pts = projCorners as NonNullable<typeof projCorners[0]>[];
          const isSelected = selectedEntity === b.id;

          const faces = [
            [pts[0], pts[1], pts[5], pts[4]], 
            [pts[1], pts[2], pts[6], pts[5]], 
            [pts[2], pts[3], pts[7], pts[6]], 
            [pts[3], pts[0], pts[4], pts[7]], 
            [pts[4], pts[5], pts[6], pts[7]], 
          ];

          faces.forEach((face) => {
            ctx.beginPath();
            ctx.moveTo(face[0].px, face[0].py);
            for (let i = 1; i < face.length; i++) {
              ctx.lineTo(face[i].px, face[i].py);
            }
            ctx.closePath();

            if (visionMode === "rgb") {
              ctx.fillStyle = isSelected ? "rgba(30, 58, 138, 0.85)" : b.colorRGB;
              ctx.strokeStyle = isSelected ? "#00f0ff" : "rgba(255, 255, 255, 0.25)";
            } else if (visionMode === "depth") {
              const depthVal = Math.max(10, Math.min(255, 255 - face[0].pz * 1.3));
              ctx.fillStyle = `rgba(${depthVal}, 40, ${255 - depthVal}, 0.7)`;
              ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            } else if (visionMode === "wireframe") {
              ctx.fillStyle = "rgba(0, 240, 255, 0.05)";
              ctx.strokeStyle = isSelected ? "#ff571a" : "#00f0ff";
            } else {
              ctx.fillStyle = b.colorSemantics;
              ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            }

            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.fill();
            ctx.stroke();
          });

          const topCenter = project(b.x, b.y - 10, b.z);
          if (topCenter && topCenter.pz < 200) {
            ctx.save();
            ctx.translate(topCenter.px, topCenter.py);

            ctx.beginPath();
            ctx.arc(0, 0, isSelected ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = b.isKeyLandmark ? "#00f0ff" : b.isDestination ? "#10b981" : "#ff571a";
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.fillText(b.name, 10, 4);

            ctx.fillStyle = "#8e94a0";
            ctx.font = "9px monospace";
            ctx.fillText(`${b.heightM}m • ${b.type}`, 10, 16);

            ctx.restore();
          }
        }
      });

      const droneHead = project(poseRef.current.x, poseRef.current.y + 8, poseRef.current.z + 12);
      if (droneHead) {
        ctx.beginPath();
        ctx.arc(droneHead.px, droneHead.py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ff571a";
        ctx.fill();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (canvasElem) {
        canvasElem.removeEventListener("mousedown", onMouseDown);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(animFrameId.current);
    };
  }, [visionMode, isPlayingRoute, selectedEntity]);

  const activeEntityData = sceneEntities.find((e) => e.id === selectedEntity) || sceneEntities[1];

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col relative select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-black border-b border-white/10 font-mono text-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff571a] animate-pulse" />
            <span className="text-white font-bold tracking-wider">EARTHOS SPATIAL WORKSTATION</span>
          </div>
          <span className="hidden sm:inline text-zinc-800">|</span>
          <span className="hidden sm:inline text-zinc-400">CHANDIGARH CALIBRATION SECTOR</span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded border border-white/5">
          {[
            { id: "rgb", label: "RGB Photometric" },
            { id: "depth", label: "Metric Depth" },
            { id: "wireframe", label: "3D Wireframe" },
            { id: "semantics", label: "Semantic Classes" },
          ].map((mode) => {
            const isActive = visionMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setVisionMode(mode.id as any)}
                className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#ff571a] text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative w-full h-[520px] bg-black overflow-hidden cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 font-mono text-xs">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (isPlayingRoute) {
                setIsPlayingRoute(false);
              } else {
                routeProgress.current = 0;
                setIsPlayingRoute(true);
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#ff571a] hover:bg-[#ff6f3b] text-black font-bold shadow-lg shadow-[#ff571a]/30 flex items-center gap-2 cursor-pointer"
          >
            {isPlayingRoute ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlayingRoute ? "PAUSE FLIGHT" : "SIMULATE CORRIDOR FLIGHT"}</span>
          </motion.button>

          <button
            onClick={() => {
              setIsPlayingRoute(false);
              routeProgress.current = 0;
              poseRef.current = { x: 0, y: -20, z: -80, yaw: 0, pitch: 0.15 };
              setCameraPose({ ...poseRef.current });
            }}
            className="p-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute top-4 right-4 z-20 hidden md:flex flex-col gap-1.5 font-mono text-xs bg-black/85 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
          <div className="text-[10px] text-zinc-500 px-2 py-0.5 uppercase font-bold">SELECT SPATIAL ENTITY:</div>
          {sceneEntities.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEntity(e.id)}
              className={`px-2.5 py-1.5 rounded text-left transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                selectedEntity === e.id
                  ? "bg-[#ff571a] text-black font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{e.name}</span>
              <span className="text-[10px]">{e.heightM}m</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 z-20 font-mono text-[11px] bg-black/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 space-y-1 text-zinc-400">
          <div className="text-white font-bold flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#ff571a]" />
            <span>POSE TELEMETRY: 6-DOF VIO</span>
          </div>
          <div>
            X: {cameraPose.x.toFixed(1)}m &bull; Y: {cameraPose.y.toFixed(1)}m &bull; Z: {cameraPose.z.toFixed(1)}m
          </div>
          <div className="text-cyan-400 font-semibold">
            YAW: {(cameraPose.yaw * (180 / Math.PI)).toFixed(1)}&deg; &bull; DRIFT MARGIN &lt; 0.18%
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 font-mono text-[11px] bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400">
          [Click &amp; Drag in 360&deg; to Rotate Camera]
        </div>
      </div>

      <div className="p-6 bg-zinc-950 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold">INSPECTED ENTITY</div>
          <div className="text-white font-bold text-sm mt-0.5">{activeEntityData.name}</div>
        </div>

        <div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold">PHYSICAL VOLUME</div>
          <div className="text-cyan-400 font-bold text-sm mt-0.5">{activeEntityData.heightM}m Elevation &bull; {activeEntityData.type}</div>
        </div>

        <div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold">ADDRESS / SECTOR</div>
          <div className="text-zinc-300 font-sans text-xs mt-0.5">{activeEntityData.address}</div>
        </div>

        <div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold">CANONICAL STATUS</div>
          <div className="text-emerald-400 font-bold text-sm mt-0.5">Persistent Mesh Synced</div>
        </div>
      </div>
    </div>
  );
}
