"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, 
  Cpu, 
  Box, 
  Navigation, 
  Compass, 
  Copy, 
  Check, 
  ArrowRight,
  Eye,
  Radio,
  Scan,
  Sparkles,
  Maximize2,
  FileCode2,
  Bot,
  Activity,
  Sliders
} from "lucide-react";

interface SchemaLayer {
  id: string;
  num: string;
  name: string;
  category: string;
  format: string;
  precision: string;
  description: string;
  aiUse: string;
  color: string;
  elevation: number;
  spec: {
    layer: string;
    schema: string;
    coordinate_frame: string;
    primitives: string[];
    metric_tolerance: string;
    downstream_targets: string[];
  };
}

const SCHEMA_LAYERS: SchemaLayer[] = [
  {
    id: "road",
    num: "01",
    name: "Road & Surface Kinematics",
    category: "Physical Surface",
    format: "glTF 2.0 / Vector Spline",
    precision: "±1.2 cm relative elevation",
    description: "Continuous metric road mesh with drivable corridor boundaries, curb elevation profiles, crosswalk splines, and friction coefficients.",
    aiUse: "Wheel-ground contact dynamics, autonomous sidewalk rover traversability, micro-mobility path planning.",
    color: "#e08a67",
    elevation: 0,
    spec: {
      layer: "surface_kinematics",
      schema: "glTF 2.0 Draco + OGC Vector",
      coordinate_frame: "EPSG:4326 (WGS84) + Ellipsoid Height",
      primitives: ["DrivableMesh", "CurbProfileSpline", "PedestrianRampPolygon", "FrictionFacies"],
      metric_tolerance: "±1.2 cm vertical / ±2.0 cm horizontal",
      downstream_targets: ["ROS 2 Nav2", "Isaac Sim Physics Engine", "Sidewalk Delivery Rovers"]
    }
  },
  {
    id: "buildings",
    num: "02",
    name: "Volumetric Envelopes & Portals",
    category: "Structural Massing",
    format: "OpenUSD / IFC Geometry",
    precision: "Sub-decimeter facade normals",
    description: "Volumetric architectural envelopes, storefront facade planes, entryway portals, canopy projections, and vertical height limits.",
    aiUse: "LiDAR/Radar raycast occlusion, visual landmark grounding, final-meter storefront approach guidance.",
    color: "#d4a373",
    elevation: 35,
    spec: {
      layer: "volumetric_envelopes",
      schema: "Universal Scene Description (OpenUSD)",
      coordinate_frame: "EPSG:4326 (WGS84)",
      primitives: ["UsdGeomMesh", "UsdShadeMaterial", "EntrywayPortals", "FacadeNormals"],
      metric_tolerance: "< 5.0 cm facade boundary",
      downstream_targets: ["NVIDIA Omniverse", "Synthetic Camera Simulators", "AR Wayfinding Engines"]
    }
  },
  {
    id: "objects",
    num: "03",
    name: "Semantic Physical Entities",
    category: "Instance 3D Bounding",
    format: "Oriented BBox (OBB) + USD",
    precision: "9-DOF metric bounding boxes",
    description: "Centimeter-accurate instance classifications for utility poles, street lamps, fire hydrants, bollards, benches, and outdoor seating.",
    aiUse: "Obstacle avoidance, dynamic spatial grounding, robotic arm manipulation anchors, urban clutter assessment.",
    color: "#52b788",
    elevation: 70,
    spec: {
      layer: "semantic_instances",
      schema: "Cityscapes3D / Waymo Open OBB",
      coordinate_frame: "Local SE(3) to Corridor Metric Anchor",
      primitives: ["OrientedBoundingBox9DOF", "ClassConfidenceScore", "PhysicalAffordanceVector"],
      metric_tolerance: "±3.0 cm centroid offset",
      downstream_targets: ["Autonomous Delivery Systems", "Embodied VLA Foundation Models", "Smart City Logistics"]
    }
  },
  {
    id: "trajectories",
    num: "04",
    name: "Kinematic 6-DOF Trajectories",
    category: "Motion & Odometry",
    format: "SE(3) Pose Time-Series",
    precision: "60 Hz synchronized spline",
    description: "Continuous 6-degrees-of-freedom camera and pedestrian trajectories synchronized with GNSS/IMU timestamps and velocity vectors.",
    aiUse: "Imitation learning for embodied agents, autonomous trajectory synthesis, camera movement prediction.",
    color: "#70a1ff",
    elevation: 105,
    spec: {
      layer: "kinematic_trajectories",
      schema: "SE(3) Lie Group (R3 x SO3)",
      coordinate_frame: "Continuous Time-Indexed Metric Frame",
      primitives: ["PoseTrajectorySpline", "IMUAccelerometerQuaternion", "GNSSCarrierPhaseFix"],
      metric_tolerance: "< 0.8% drift over 500 m corridor",
      downstream_targets: ["Autonomous Driving Simulators", "Drone Flight Planners", "Robotic Teleoperation"]
    }
  },
  {
    id: "radiance",
    num: "05",
    name: "Photometric Radiance Field",
    category: "Neural Radiance",
    format: "3D Gaussian Splats (PLY)",
    precision: "2.4M splats / city corridor",
    description: "Continuous view-dependent photometric fields and spherical harmonics modeling sunlight, reflections, and ambient illumination.",
    aiUse: "Synthetic sensor simulation (generating photorealistic camera feeds for AV & robot perception in Isaac Sim / Cosmos).",
    color: "#ff7675",
    elevation: 140,
    spec: {
      layer: "photometric_radiance",
      schema: "3D Gaussian Splatting (3DGS PLY)",
      coordinate_frame: "Metric World Coordinate Space",
      primitives: ["GaussianCentroidXYZ", "SphericalHarmonicsDegree3", "OpacityScaleCovariance"],
      metric_tolerance: "Sub-pixel visual reprojection fidelity",
      downstream_targets: ["NVIDIA Cosmos World Models", "Isaac Sim Synthetic Feeds", "Digital Twin Previews"]
    }
  }
];

const DOWNSTREAM_ECOSYSTEM = [
  {
    icon: Bot,
    title: "Embodied AI & Ground Robotics",
    headline: "Zero-Collision Sidewalk Autonomy",
    desc: "Autonomous delivery rovers, sidewalk couriers, and inspection crawlers require sub-decimeter ground surface elevation and curb contour splines to navigate without expensive on-board LiDAR suites.",
    tag: "ROS 2 · Isaac Sim",
    metrics: ["±1.2 cm curb precision", "Friction surface maps", "Affordance vectors"]
  },
  {
    icon: Cpu,
    title: "Generative World Foundation Models",
    headline: "Photorealistic Sensor Simulation",
    desc: "Next-gen world models (e.g. NVIDIA Cosmos, Sora-like spatial foundations) need real-world continuous 3D environments to simulate cameras, radar, and sensor feeds with zero sim-to-real gap.",
    tag: "OpenUSD · Cosmos",
    metrics: ["3D Gaussian Radiance", "Multi-view raycasting", "Dynamic lighting harmonics"]
  },
  {
    icon: Navigation,
    title: "Spatial Consumer Navigation",
    headline: "Visual Landmark Grounding",
    desc: "Modern consumer navigation needs rich visual approach cues ('enter by the shaded wood-trimmed canopy') rather than raw lat/long coordinates that leave users stranded 120 m away on arterial roads.",
    tag: "OnMyWay API",
    metrics: ["Final-meter entrance anchors", "Storefront facades", "Pedestrian route previews"]
  }
];

export function PhysicalAiDataWing() {
  const [activeLayerId, setActiveLayerId] = useState<string>("road");
  const [activeTab, setActiveTab] = useState<"strata" | "sensor_sim" | "downstream" | "spec">("strata");
  const [simMode, setSimMode] = useState<"rgb" | "lidar" | "semantics" | "trajectories">("lidar");
  const [copied, setCopied] = useState(false);

  const activeLayer = SCHEMA_LAYERS.find((l) => l.id === activeLayerId) || SCHEMA_LAYERS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activeLayer.spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-7 text-[#FAF8F3]">
      
      {/* ── Top Navigation Bar & Strata Status ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-inv-line/40 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#19140f] border border-inv-line/50">
          <button
            id="tab-strata"
            onClick={() => setActiveTab("strata")}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-[0.72rem] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              activeTab === "strata"
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-inv-muted hover:text-inv-text"
            }`}
          >
            01 · Exploded Spatial Strata
          </button>
          <button
            id="tab-sensor"
            onClick={() => setActiveTab("sensor_sim")}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-[0.72rem] uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sensor_sim"
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-inv-muted hover:text-inv-text"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>02 · Synthetic Sensor Sim</span>
          </button>
          <button
            id="tab-downstream"
            onClick={() => setActiveTab("downstream")}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-[0.72rem] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              activeTab === "downstream"
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-inv-muted hover:text-inv-text"
            }`}
          >
            03 · Physical-AI Downstream
          </button>
          <button
            id="tab-spec"
            onClick={() => setActiveTab("spec")}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-[0.72rem] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              activeTab === "spec"
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-inv-muted hover:text-inv-text"
            }`}
          >
            04 · OpenUSD Stage Spec
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-[0.68rem] text-inv-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e08a67] animate-pulse" />
            <span className="text-[#E6DFD5]">EPSG:4326 Metrology Anchor</span>
          </span>
          <span className="text-inv-line">|</span>
          <span>Chandigarh Sector 17 Benchmark</span>
        </div>
      </div>

      {/* ── TAB 1: EXPLODED SPATIAL STRATA (VISUAL TWIN) ── */}
      {activeTab === "strata" && (
        <div className="grid lg:grid-cols-[1.1fr_1.35fr] gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Strata Layer Selection Cards */}
          <div className="flex flex-col gap-2.5">
            <div className="text-xs font-mono uppercase tracking-widest text-[#e08a67] font-semibold mb-1 flex items-center justify-between">
              <span>Select Spatial Stratum to Inspect</span>
              <span className="text-[0.65rem] text-inv-muted lowercase">5 metric layers active</span>
            </div>

            {SCHEMA_LAYERS.map((layer) => {
              const isSelected = layer.id === activeLayerId;
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden ${
                    isSelected
                      ? "bg-[#211a14] border-[#e08a67] ring-1 ring-[#e08a67]/50 shadow-lg shadow-black/40"
                      : "bg-[#14100c]/70 border-inv-line/40 hover:border-inv-line hover:bg-[#1a1511]"
                  }`}
                >
                  {/* Left accent color bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 transition-all"
                    style={{ backgroundColor: isSelected ? layer.color : "transparent" }}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[0.68rem] font-bold text-[#e08a67]">
                          {layer.num}
                        </span>
                        <h4 className="text-[0.98rem] font-serif font-semibold m-0 leading-tight text-[#FAF8F3]">
                          {layer.name}
                        </h4>
                        <span className="font-mono text-[0.62rem] px-2 py-0.5 rounded border border-inv-line/70 text-[#d6c5b3] bg-[#0c0907]/60">
                          {layer.format}
                        </span>
                      </div>
                      <p className="text-[0.78rem] text-[#D6C5B3] leading-relaxed m-0 font-sans line-clamp-1">
                        {layer.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="font-mono text-[0.65rem] text-[#e08a67] font-medium hidden sm:inline">
                        {layer.precision.split(" ")[0]}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-[#e08a67] translate-x-1" : "text-inv-muted/40"}`} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Summary Pill */}
            <div className="mt-2 p-3.5 rounded-xl bg-[#17120e] border border-inv-line/30 flex items-center justify-between text-xs font-mono text-inv-muted">
              <span>Universal Interchange:</span>
              <span className="text-[#e08a67] font-semibold">OpenUSD · glTF 2.0 · 3DGS PLY</span>
            </div>
          </div>

          {/* Right Column: Interactive Axonometric Exploded Twin & Telemetry */}
          <div className="rounded-2xl border border-inv-line/50 bg-[#120e0a] p-6 lg:p-7 flex flex-col justify-between shadow-inner relative overflow-hidden">
            
            {/* Ambient subtle architectural grid */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(224, 138, 103, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(224, 138, 103, 0.25) 1px, transparent 1px)",
                backgroundSize: "28px 28px"
              }}
            />

            <div>
              {/* Header with Title and active format badge */}
              <div className="flex items-start justify-between border-b border-inv-line/40 pb-4 mb-5 relative z-10">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#e08a67] font-semibold mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Layer {activeLayer.num} · {activeLayer.category}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#FAF8F3] m-0">
                    {activeLayer.name}
                  </h3>
                </div>
                <div className="text-right font-mono text-[0.65rem]">
                  <span className="text-inv-muted block uppercase">Schema Encoding</span>
                  <span className="text-[#e08a67] font-bold text-xs">{activeLayer.format}</span>
                </div>
              </div>

              {/* ── Interactive Axonometric Strata Visual Canvas ── */}
              <div className="relative w-full h-[220px] rounded-xl bg-[#0a0705] border border-inv-line/50 mb-5 overflow-hidden flex items-center justify-center">
                
                {/* SVG Axonometric Corridor Cross-Section */}
                <svg viewBox="0 0 600 240" className="w-full h-full select-none">
                  <defs>
                    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e08a67" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#bf4722" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#d4a373" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#d4a373" stopOpacity="0.05" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ground Coordinate Plane Grid (WGS84 Reference) */}
                  <g opacity="0.25" stroke="#e08a67" strokeWidth="0.75">
                    <line x1="120" y1="180" x2="480" y2="180" strokeDasharray="3 3" />
                    <line x1="80" y1="210" x2="520" y2="210" strokeDasharray="3 3" />
                    <line x1="160" y1="150" x2="440" y2="150" strokeDasharray="3 3" />
                    <line x1="150" y1="140" x2="60" y2="215" />
                    <line x1="300" y1="140" x2="300" y2="225" />
                    <line x1="450" y1="140" x2="540" y2="215" />
                  </g>

                  {/* STRATUM 01: ROAD & SURFACE KINEMATICS */}
                  <g 
                    opacity={activeLayerId === "road" ? 1 : 0.45}
                    className="cursor-pointer transition-opacity duration-300"
                    onClick={() => setActiveLayerId("road")}
                  >
                    {/* Isometric Road Surface Polygon */}
                    <polygon 
                      points="160,180 440,180 520,215 80,215" 
                      fill="url(#roadGrad)" 
                      stroke={activeLayerId === "road" ? "#e08a67" : "#8c564b"}
                      strokeWidth={activeLayerId === "road" ? "2" : "1"}
                    />
                    {/* Road Centerline Spline */}
                    <line 
                      x1="300" y1="180" x2="300" y2="215" 
                      stroke="#e08a67" 
                      strokeWidth="2" 
                      strokeDasharray="6 4" 
                    />
                    {/* Curb boundary elevation offsets */}
                    <line x1="160" y1="178" x2="80" y2="213" stroke="#e08a67" strokeWidth="1.5" />
                    <line x1="440" y1="178" x2="520" y2="213" stroke="#e08a67" strokeWidth="1.5" />
                    {activeLayerId === "road" && (
                      <text x="310" y="205" fill="#e08a67" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        SURFACE METRIC ±1.2cm
                      </text>
                    )}
                  </g>

                  {/* STRATUM 02: VOLUMETRIC BUILDING ENVELOPES */}
                  <g 
                    opacity={activeLayerId === "buildings" ? 1 : 0.45}
                    className="cursor-pointer transition-opacity duration-300"
                    onClick={() => setActiveLayerId("buildings")}
                  >
                    {/* Left building envelope */}
                    <polygon points="100,100 150,100 150,175 100,175" fill="url(#buildingGrad)" stroke="#d4a373" strokeWidth="1.2" />
                    <polygon points="150,100 180,85 180,160 150,175" fill="#d4a373" fillOpacity="0.15" stroke="#d4a373" strokeWidth="1.2" />
                    <polygon points="100,100 130,85 180,85 150,100" fill="#d4a373" fillOpacity="0.25" stroke="#d4a373" strokeWidth="1.2" />
                    
                    {/* Entrance portal anchor */}
                    <rect x="115" y="145" width="18" height="30" fill="#e08a67" fillOpacity="0.2" stroke="#e08a67" strokeWidth="1" strokeDasharray="2 2" />
                    
                    {/* Right building envelope */}
                    <polygon points="450,110 500,110 500,175 450,175" fill="url(#buildingGrad)" stroke="#d4a373" strokeWidth="1.2" />
                    <polygon points="420,95 450,110 450,175 420,160" fill="#d4a373" fillOpacity="0.15" stroke="#d4a373" strokeWidth="1.2" />
                    
                    {activeLayerId === "buildings" && (
                      <text x="110" y="78" fill="#d4a373" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        OPENUSD FACADE SHELL
                      </text>
                    )}
                  </g>

                  {/* STRATUM 03: SEMANTIC PHYSICAL ENTITIES (OBB) */}
                  <g 
                    opacity={activeLayerId === "objects" ? 1 : 0.45}
                    className="cursor-pointer transition-opacity duration-300"
                    onClick={() => setActiveLayerId("objects")}
                  >
                    {/* Street lamp entity box */}
                    <line x1="210" y1="190" x2="210" y2="135" stroke="#52b788" strokeWidth="1.5" />
                    <circle cx="210" cy="135" r="3" fill="#52b788" />
                    <rect x="202" y="130" width="16" height="60" fill="none" stroke="#52b788" strokeWidth="0.75" strokeDasharray="2 2" />

                    {/* Delivery rover bounding box */}
                    <rect x="260" y="185" width="30" height="18" rx="2" fill="#52b788" fillOpacity="0.25" stroke="#52b788" strokeWidth="1.2" />
                    
                    {/* Fire hydrant entity */}
                    <rect x="390" y="182" width="12" height="15" fill="#52b788" fillOpacity="0.2" stroke="#52b788" strokeWidth="1" />

                    {activeLayerId === "objects" && (
                      <g>
                        <text x="260" y="180" fill="#52b788" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          [OBB: ROVER_9DOF]
                        </text>
                        <text x="215" y="125" fill="#52b788" fontSize="8" fontFamily="monospace">
                          [OBB: LAMP_01]
                        </text>
                      </g>
                    )}
                  </g>

                  {/* STRATUM 04: KINEMATIC 6-DOF TRAJECTORY SPLINE */}
                  <g 
                    opacity={activeLayerId === "trajectories" ? 1 : 0.45}
                    className="cursor-pointer transition-opacity duration-300"
                    onClick={() => setActiveLayerId("trajectories")}
                  >
                    {/* Glowing camera trajectory spline path */}
                    <path 
                      d="M 180 180 Q 240 140 300 155 T 420 120" 
                      fill="none" 
                      stroke="#70a1ff" 
                      strokeWidth={activeLayerId === "trajectories" ? "2.5" : "1.5"}
                      filter={activeLayerId === "trajectories" ? "url(#glow)" : undefined}
                    />
                    {/* Trajectory keyframe nodes */}
                    <circle cx="180" cy="180" r="3" fill="#70a1ff" />
                    <circle cx="270" cy="150" r="3" fill="#70a1ff" />
                    <circle cx="340" cy="145" r="3" fill="#70a1ff" />
                    <circle cx="420" cy="120" r="3" fill="#70a1ff" />

                    {activeLayerId === "trajectories" && (
                      <text x="280" y="138" fill="#70a1ff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        SE(3) CAMERA POSE 60Hz
                      </text>
                    )}
                  </g>

                  {/* STRATUM 05: PHOTOMETRIC RADIANCE GAUSSIANS */}
                  <g 
                    opacity={activeLayerId === "radiance" ? 1 : 0.4}
                    className="cursor-pointer transition-opacity duration-300"
                    onClick={() => setActiveLayerId("radiance")}
                  >
                    {/* Particle radiance cloud */}
                    {[
                      [220, 110, 2], [235, 118, 1.5], [250, 105, 2.5], [280, 115, 1.8],
                      [310, 95, 2], [330, 105, 1.5], [350, 90, 2.2], [370, 110, 1.8],
                      [160, 130, 2], [175, 140, 1.5], [410, 100, 2], [430, 110, 1.5]
                    ].map(([cx, cy, r], i) => (
                      <circle key={i} cx={cx} cy={cy} r={r} fill="#ff7675" fillOpacity="0.75" />
                    ))}
                    {activeLayerId === "radiance" && (
                      <text x="240" y="85" fill="#ff7675" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        3D GAUSSIAN RADIANCE DENSITY
                      </text>
                    )}
                  </g>
                </svg>

                {/* Canvas Overlay Badges */}
                <div className="absolute top-2.5 left-3 flex items-center gap-2 font-mono text-[0.62rem] text-inv-muted bg-[#14100c]/80 px-2.5 py-1 rounded-md border border-inv-line/30 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e08a67]" />
                  <span>Click any layer in diagram to isolate</span>
                </div>
                <div className="absolute bottom-2.5 right-3 font-mono text-[0.6rem] text-inv-muted bg-[#14100c]/80 px-2 py-0.5 rounded border border-inv-line/30">
                  Axonometric Metric Scale: 1:100
                </div>
              </div>

              {/* Architectural Decomposition Details */}
              <div className="p-5 rounded-xl bg-[#18130e] border border-inv-line/40 mb-5 relative">
                <div className="flex items-center justify-between text-xs font-mono text-inv-muted mb-2.5">
                  <span className="uppercase tracking-wider">Metric Specification</span>
                  <span className="text-[#e08a67] font-semibold">{activeLayer.precision}</span>
                </div>
                <p className="font-serif text-[1.02rem] leading-relaxed text-[#FAF8F3] m-0 mb-3">
                  {activeLayer.description}
                </p>
                <div className="pt-3 border-t border-inv-line/30 flex items-start gap-2 text-xs font-sans text-[#E6DFD5]">
                  <span className="font-mono text-[0.62rem] text-[#e08a67] uppercase font-bold shrink-0 mt-0.5">
                    Physical-AI Use:
                  </span>
                  <span className="leading-relaxed">{activeLayer.aiUse}</span>
                </div>
              </div>

              {/* Layer Telemetry Parameters Matrix */}
              <div className="rounded-xl border border-inv-line/40 bg-[#0c0907] p-4 font-mono text-[0.7rem] space-y-2.5">
                <div className="flex items-center justify-between text-[0.62rem] text-inv-muted border-b border-inv-line/20 pb-1.5">
                  <span className="uppercase tracking-wider text-[#e08a67] font-bold">Interchange Telemetry & Primitives</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[#e08a67] hover:text-white transition-colors cursor-pointer bg-[#1c1611] px-2.5 py-1 rounded border border-inv-line/50"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy Spec JSON"}</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-[0.66rem] pt-1">
                  <div>
                    <span className="text-inv-muted block">Coordinate Reference:</span>
                    <span className="text-[#E6DFD5] font-semibold">{activeLayer.spec.coordinate_frame}</span>
                  </div>
                  <div>
                    <span className="text-inv-muted block">Target AI Runtimes:</span>
                    <span className="text-[#e08a67] font-semibold">{activeLayer.spec.downstream_targets.join(" · ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer status */}
            <div className="mt-5 pt-3 border-t border-inv-line/30 flex items-center justify-between font-mono text-[0.62rem] text-inv-muted">
              <span>Chandigarh Sector 17 Corridor Calibration</span>
              <span className="text-[#e08a67]">OpenUSD & glTF Native Primitives</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SYNTHETIC SENSOR SIMULATION (HOW PHYSICAL AI SEES THE CORRIDOR) ── */}
      {activeTab === "sensor_sim" && (
        <div className="rounded-2xl border border-inv-line/50 bg-[#120e0a] p-6 lg:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-inv-line/40 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e08a67] font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>Synthetic Sensor Feeds · Simulation Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#FAF8F3] m-0">
                How Physical-AI Models Ingest Real-World Corridors
              </h3>
              <p className="font-sans text-xs text-[#D6C5B3] mt-1 max-w-2xl leading-relaxed">
                Autonomous vehicles, delivery rovers, and NVIDIA Cosmos world models cannot navigate using 2D image pixels alone. They ingest multi-modal sensor projections extracted from the unified 3D reconstruction.
              </p>
            </div>

            {/* Sensor Channel Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#19140f] border border-inv-line/60 self-start md:self-auto">
              {[
                { id: "lidar", label: "LiDAR Point Cloud", icon: Scan },
                { id: "semantics", label: "Semantic 3D Masks", icon: Box },
                { id: "rgb", label: "Gaussian Radiance", icon: Sparkles },
                { id: "trajectories", label: "Odometry Spline", icon: Radio }
              ].map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSimMode(mode.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[0.68rem] uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      simMode === mode.id
                        ? "bg-accent text-white shadow-sm"
                        : "text-inv-muted hover:text-inv-text"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensor Screen Canvas */}
          <div className="relative w-full h-[320px] rounded-xl bg-[#080604] border border-inv-line/60 overflow-hidden flex items-center justify-center">
            
            {/* Viewport UI Overlay */}
            <div className="absolute top-3 left-4 font-mono text-[0.65rem] text-inv-muted z-10 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#e08a67]">
                <span className="w-2 h-2 rounded-full bg-[#e08a67] animate-ping" />
                <span>CHANNEL: {simMode.toUpperCase()}</span>
              </span>
              <span>FOV: 90° H / 60° V</span>
              <span>FPS: 60.0 METRIC SYNC</span>
            </div>

            <div className="absolute top-3 right-4 font-mono text-[0.62rem] text-inv-muted z-10">
              TARGET: ISAAC_SIM_BRIDGE_V1
            </div>

            {/* Dynamic Sensor Visuals based on mode */}
            {simMode === "lidar" && (
              <svg viewBox="0 0 700 280" className="w-full h-full">
                {/* LiDAR Depth scan lines & point cloud */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = 50 + (i * 15);
                  const yBase = 220 - Math.sin(i * 0.2) * 40;
                  return (
                    <g key={i}>
                      <line x1="350" y1="260" x2={x} y2={yBase} stroke="#52b788" strokeOpacity="0.15" strokeWidth="0.5" />
                      <circle cx={x} cy={yBase} r="2" fill="#52b788" fillOpacity="0.8" />
                      <circle cx={x} cy={yBase - 30} r="1.5" fill="#70a1ff" fillOpacity="0.7" />
                      <circle cx={x} cy={yBase - 60} r="1.2" fill="#ff7675" fillOpacity="0.6" />
                    </g>
                  );
                })}
                <text x="350" y="140" textAnchor="middle" fill="#52b788" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  SYNTHETIC LIDAR RAYCASTING (128-BEAM EQUIVALENT)
                </text>
                <text x="350" y="160" textAnchor="middle" fill="#D6C5B3" fontSize="10" fontFamily="monospace">
                  Direct collision mesh raycast with surface normal return
                </text>
              </svg>
            )}

            {simMode === "semantics" && (
              <svg viewBox="0 0 700 280" className="w-full h-full">
                {/* Sidewalk semantic polygon */}
                <polygon points="100,240 600,240 500,180 200,180" fill="#e08a67" fillOpacity="0.25" stroke="#e08a67" strokeWidth="1.5" />
                <text x="350" y="215" textAnchor="middle" fill="#e08a67" fontSize="10" fontFamily="monospace">
                  CLASS: ROAD_DRIVABLE_CORRIDOR (99.2%)
                </text>

                {/* Building facade semantic envelope */}
                <rect x="80" y="60" width="140" height="120" fill="#d4a373" fillOpacity="0.2" stroke="#d4a373" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="150" y="120" textAnchor="middle" fill="#d4a373" fontSize="9" fontFamily="monospace">
                  CLASS: FACADE_WALL
                </text>

                {/* Rover 3D OBB */}
                <rect x="310" y="160" width="80" height="40" rx="3" fill="#52b788" fillOpacity="0.3" stroke="#52b788" strokeWidth="2" />
                <text x="350" y="185" textAnchor="middle" fill="#52b788" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  ROVER_OBB_01
                </text>

                <text x="350" y="40" textAnchor="middle" fill="#52b788" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  INSTANCE-SEGMENTED METRIC 3D BOUNDING MASKS
                </text>
              </svg>
            )}

            {simMode === "rgb" && (
              <div className="text-center space-y-3 p-6">
                <Sparkles className="w-8 h-8 text-[#ff7675] mx-auto animate-pulse" />
                <h4 className="text-lg font-serif text-[#FAF8F3] m-0">3D Gaussian Radiance Synthesis</h4>
                <p className="font-mono text-xs text-[#D6C5B3] max-w-md mx-auto leading-relaxed">
                  Generates novel viewpoint camera frames with real-world photometric reflections, sun-angle changes, and optical lens distortion for sensor-in-the-loop training.
                </p>
                <div className="font-mono text-[0.65rem] text-[#e08a67]">
                  2,410,800 Gaussian Splats · 3rd-Degree Spherical Harmonics
                </div>
              </div>
            )}

            {simMode === "trajectories" && (
              <svg viewBox="0 0 700 280" className="w-full h-full">
                <path d="M 80 220 Q 250 120 400 160 T 620 90" fill="none" stroke="#70a1ff" strokeWidth="3" />
                {[80, 200, 320, 440, 560, 620].map((cx, i) => (
                  <g key={i}>
                    <circle cx={cx} cy={220 - i * 20} r="4" fill="#70a1ff" />
                    <line x1={cx} y1={220 - i * 20} x2={cx + 10} y2={200 - i * 20} stroke="#e08a67" strokeWidth="1.5" />
                  </g>
                ))}
                <text x="350" y="60" textAnchor="middle" fill="#70a1ff" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  6-DOF ODOMETRY & POSE TIME-SERIES SPLINE (60Hz)
                </text>
                <text x="350" y="80" textAnchor="middle" fill="#D6C5B3" fontSize="10" fontFamily="monospace">
                  RTK GNSS + IMU Continuous Drift-Corrected Trajectory
                </text>
              </svg>
            )}

            {/* Bottom Telemetry Bar */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[0.62rem] text-inv-muted border-t border-inv-line/30 pt-2">
              <span>LAT: 30.7333° N · LON: 76.7794° E</span>
              <span className="text-[#e08a67]">Zero Sim-to-Real Domain Shift</span>
            </div>
          </div>

          {/* 3 Metric Value Pillars */}
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#17120e] border border-inv-line/40 space-y-1">
              <span className="font-mono text-[0.62rem] text-inv-muted uppercase tracking-wider block">Data Format</span>
              <h5 className="font-serif text-[0.95rem] text-[#FAF8F3] m-0">Universal Stage Ingestion</h5>
              <p className="text-xs text-[#D6C5B3] m-0 font-sans leading-relaxed">Direct USD stage loader for Isaac Sim & Omniverse without coordinate conversion overhead.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#17120e] border border-inv-line/40 space-y-1">
              <span className="font-mono text-[0.62rem] text-inv-muted uppercase tracking-wider block">Ground Truth Accuracy</span>
              <h5 className="font-serif text-[0.95rem] text-[#FAF8F3] m-0">Metric Centimeter Rigor</h5>
              <p className="text-xs text-[#D6C5B3] m-0 font-sans leading-relaxed">Real-world ground elevation prevents floating wheel errors in autonomous rover simulations.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#17120e] border border-inv-line/40 space-y-1">
              <span className="font-mono text-[0.62rem] text-inv-muted uppercase tracking-wider block">Temporal Coherence</span>
              <h5 className="font-serif text-[0.95rem] text-[#FAF8F3] m-0">Continuous Delta Sync</h5>
              <p className="text-xs text-[#D6C5B3] m-0 font-sans leading-relaxed">Regular passes detect construction zones and storefront changes before robots deploy.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DOWNSTREAM PHYSICAL-AI USE CASES ── */}
      {activeTab === "downstream" && (
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {DOWNSTREAM_ECOSYSTEM.map((target, idx) => {
            const Icon = target.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-inv-line/50 bg-[#16120e] flex flex-col justify-between space-y-5 hover:border-[#e08a67]/60 transition-colors shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-[#211a14] border border-inv-line/60 text-[#e08a67]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#e08a67] px-2.5 py-1 rounded bg-accent/15 font-semibold border border-accent/30">
                      {target.tag}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[#FAF8F3] m-0">
                      {target.title}
                    </h4>
                    <p className="font-mono text-xs text-[#e08a67] mt-1 font-medium">
                      {target.headline}
                    </p>
                  </div>

                  <p className="font-sans text-[0.85rem] leading-relaxed text-[#D6C5B3] m-0">
                    {target.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-inv-line/30">
                  <span className="font-mono text-[0.62rem] text-inv-muted uppercase tracking-wider block">Key Metric Deliverables</span>
                  <div className="flex flex-wrap gap-1.5">
                    {target.metrics.map((m, i) => (
                      <span key={i} className="font-mono text-[0.62rem] px-2 py-0.5 rounded bg-[#100c08] border border-inv-line/50 text-[#E6DFD5]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 4: OPENUSD STAGE SPEC & SCHEMA DEFINITIONS ── */}
      {activeTab === "spec" && (
        <div className="rounded-2xl border border-inv-line/50 bg-[#120e0a] p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-inv-line/40 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e08a67] font-semibold mb-1">
                <FileCode2 className="w-4 h-4" />
                <span>Universal OpenUSD Schema Specification</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#FAF8F3] m-0">
                Chandigarh Corridor Stage Interchange (v0.1)
              </h3>
              <p className="font-mono text-xs text-inv-muted mt-1">
                Standardized interchange format for NVIDIA Omniverse, Cosmos world models, and robotics pipelines.
              </p>
            </div>
            
            <button
              onClick={() => {
                const fullSchema = {
                  dataset_id: "worldring_chandigarh_sector17_corridor_benchmark_v0.1",
                  coordinate_reference_system: "EPSG:4326 (WGS84)",
                  metric_ground_origin: [30.7333, 76.7794, 321.0],
                  layers: SCHEMA_LAYERS.map(l => ({
                    stratum: l.num,
                    name: l.name,
                    format: l.format,
                    spec: l.spec
                  }))
                };
                navigator.clipboard.writeText(JSON.stringify(fullSchema, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-4 py-2.5 rounded-lg bg-[#211a14] border border-inv-line hover:border-[#e08a67] text-[#FAF8F3] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#e08a67]" />}
              <span>{copied ? "Full Stage Schema Copied!" : "Copy Complete Stage Spec"}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-[1.1fr_1.4fr] gap-6 items-start">
            <div className="space-y-4">
              <span className="font-mono text-xs text-[#e08a67] uppercase font-bold tracking-wider block">
                Engineering Design Principles
              </span>
              <ul className="space-y-3 text-xs text-[#D6C5B3] font-sans leading-relaxed list-none p-0 m-0">
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#18130e] border border-inv-line/30">
                  <span className="font-mono text-[#e08a67] font-bold text-sm">01</span>
                  <span><strong>Zero Proprietary Lock-In:</strong> All outputs serialize to standardized formats (OpenUSD, glTF 2.0 Draco, PLY 3DGS, GeoJSON) with open schema specs.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#18130e] border border-inv-line/30">
                  <span className="font-mono text-[#e08a67] font-bold text-sm">02</span>
                  <span><strong>Metric Precision:</strong> Real-world centimeter-scale coordinates tied to WGS84 ellipsoid elevation rather than floating normalized bounds.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#18130e] border border-inv-line/30">
                  <span className="font-mono text-[#e08a67] font-bold text-sm">03</span>
                  <span><strong>Dual-Consumer Value:</strong> A single spatial reconstruction feeds both human visual wayfinding and machine physical-AI simulation concurrently.</span>
                </li>
              </ul>
            </div>

            {/* USD Stage Syntax Inspector */}
            <div className="p-4 rounded-xl bg-[#090705] border border-inv-line/40 font-mono text-[0.72rem] text-[#E6DFD5] overflow-y-auto max-h-[300px]">
              <div className="text-[#e08a67] text-[0.62rem] mb-2 uppercase tracking-widest border-b border-inv-line/30 pb-1 flex items-center justify-between font-bold">
                <span>Stage Header Excerpt (.usda)</span>
                <span>METERS_PER_UNIT = 1.0</span>
              </div>
              <pre className="m-0 leading-relaxed text-[#d6c5b3]">
{`#usda 1.0
(
  defaultPrim = "CorridorStage"
  metersPerUnit = 1.0
  upAxis = "Z"
)
def Xform "CorridorStage" (
  assetInfo = {
    string dataset = "worldring_chandigarh_sector17_v0.1"
    string crs = "EPSG:4326"
    double3 origin = (30.7333, 76.7794, 321.0)
  }
) {
  def Scope "SurfaceKinematics" {
    rel metric:tolerance = 0.012
    def Mesh "DrivableSurface" {}
    def BasisCurves "CurbContourSplines" {}
  }
  def Scope "VolumetricEnvelopes" {
    def UsdGeomMesh "StorefrontFacade_01" {}
    def Scope "Portals" {}
  }
  def Scope "SemanticInstances" {
    def UsdGeomSubset "Entity_OBB_Collection" {}
  }
  def Scope "PhotometricRadiance" {
    string representation = "3D_gaussian_splatting_v1"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
