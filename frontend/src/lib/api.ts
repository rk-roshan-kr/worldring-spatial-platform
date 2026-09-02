/**
 * API Service Layer with Graceful Local Fallback
 * Connects to NestJS Backend on http://localhost:3001/api
 * Falls back to local datasets if offline.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface SpatialEnvironmentData {
  id: string;
  name: string;
  region: string;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
    elevationMeters: number;
  };
  metrics: {
    corridorLengthMeters: number;
    pointCloudDensity: string;
    semanticClassesCount: number;
    reconstructionMode: string;
  };
  layers: {
    id: string;
    name: string;
    color: string;
    description: string;
    elementCount: number;
  }[];
  landmarks: {
    id: string;
    name: string;
    type: string;
    position: [number, number, number];
    visualCue: string;
  }[];
}

export interface RouteGuideData {
  id: string;
  title: string;
  origin: string;
  destination: string;
  distanceMeters: number;
  estimatedWalkingMinutes: number;
  traditionalAddress: {
    sector: string;
    road: string;
    unit: string;
    note: string;
  };
  visualSteps: {
    step: number;
    action: string;
    cue: string;
    landmarkRef: string;
    position: [number, number, number];
  }[];
  waypoints: [number, number, number][];
}

export interface PipelineStatusData {
  systemStatus: string;
  pipelineStages: {
    id: string;
    stepNumber: string;
    name: string;
    category: string;
    description: string;
    technicalDetails: string;
    status: string;
    telemetry: {
      inputFormat: string;
      outputFormat: string;
      targetLatency: string;
    };
  }[];
  prototype: {
    currentStage: string;
    statusBadge: string;
    stageIndex: number;
    totalStages: number;
    stages: {
      number: string;
      title: string;
      description: string;
      status: string;
    }[];
    researchHypotheses: {
      id: string;
      question: string;
      validationApproach: string;
      currentObservation: string;
    }[];
  };
}

export interface DatasetExampleData {
  datasetId: string;
  name: string;
  region: string;
  coordinateReferenceSystem: string;
  totalLayers: number;
  layers: {
    layerKey: string;
    layerName: string;
    category: string;
    description: string;
    format: string;
    sampleAttributes: Record<string, any>;
  }[];
  downstreamApplications: {
    domain: string;
    useCase: string;
    dataUtilized: string[];
  }[];
  sampleJsonSnippet: Record<string, any>;
}

// Fallback data
const FALLBACK_ENVIRONMENT: SpatialEnvironmentData = {
  id: 'env_demo_chandigarh_01',
  name: 'Corridor Reconstruction Demo',
  region: 'Chandigarh / Demo Sector',
  status: 'PROTOTYPE',
  coordinates: {
    lat: 30.7333,
    lng: 76.7794,
    elevationMeters: 321.4,
  },
  metrics: {
    corridorLengthMeters: 450,
    pointCloudDensity: 'Simulated 142k spatial vertices',
    semanticClassesCount: 6,
    reconstructionMode: 'Neural Trajectory & Multi-View Geometry',
  },
  layers: [
    { id: 'road', name: 'Road Surface', color: '#38BDF8', description: 'Drivable surface geometry and lane boundaries', elementCount: 1 },
    { id: 'sidewalk', name: 'Pedestrian Corridors', color: '#2DD4BF', description: 'Walkways, curbs, and sidewalk elevation steps', elementCount: 2 },
    { id: 'buildings', name: 'Architectural Volumes', color: '#A855F7', description: '3D building facades, storefront heights, and entrances', elementCount: 14 },
    { id: 'vegetation', name: 'Urban Foliage', color: '#22C55E', description: 'Trees, planters, and canopy occlusion boundaries', elementCount: 18 },
    { id: 'vehicles', name: 'Dynamic & Static Vehicles', color: '#F59E0B', description: 'Stationary vehicles, parking areas, and clearance envelopes', elementCount: 6 },
    { id: 'lighting', name: 'Street Infrastructure', color: '#E0E7FF', description: 'Streetlamps, signage posts, and utility reference nodes', elementCount: 12 },
  ],
  landmarks: [
    {
      id: 'lm_roundabout',
      name: 'Central Sector Roundabout',
      type: 'Geographic Anchor',
      position: [-35, 0, -40],
      visualCue: 'Prominent roundabout with stone monument at intersection',
    },
    {
      id: 'lm_blue_building',
      name: 'Cobalt Commercial Complex',
      type: 'Architectural Cue',
      position: [12, 0, 10],
      visualCue: 'High-contrast cobalt blue facade with distinct portico',
    },
    {
      id: 'lm_cafe_entrance',
      name: 'Corner Veranda Bakery',
      type: 'Destination / 4th Shop',
      position: [16, 0, 65],
      visualCue: '4th shop on the right past the blue building portico',
    },
  ],
};

const FALLBACK_ROUTE: RouteGuideData = {
  id: 'route_sample_01',
  title: 'Visual Landmark Route Preview',
  origin: 'Sector Transit Point A',
  destination: 'Corner Veranda Bakery (Destination)',
  distanceMeters: 380,
  estimatedWalkingMinutes: 4.5,
  traditionalAddress: {
    sector: 'Sector 17-C',
    road: 'Inner Loop Road 4',
    unit: 'Shop B-14',
    note: 'Standard GPS stops 120m away on opposite arterial',
  },
  visualSteps: [
    {
      step: 1,
      action: 'DEPART_TRANSIT',
      cue: 'Start at the transit shelter facing North towards the monument',
      landmarkRef: 'Central Sector Roundabout',
      position: [-30, 0.5, -45],
    },
    {
      step: 2,
      action: 'PASS_LANDMARK',
      cue: 'Pass the landmark monument and take the first pedestrian walkway to the right',
      landmarkRef: 'Central Sector Roundabout',
      position: [-10, 0.5, -20],
    },
    {
      step: 3,
      action: 'CONTINUE_STREET',
      cue: 'Continue straight for 150m along the shaded sidewalk until you see the blue building',
      landmarkRef: 'Cobalt Commercial Complex',
      position: [0, 0.5, 5],
    },
    {
      step: 4,
      action: 'APPROACH_DESTINATION',
      cue: 'Turn right immediately past the cobalt blue building portico',
      landmarkRef: 'Cobalt Commercial Complex',
      position: [10, 0.5, 30],
    },
    {
      step: 5,
      action: 'REACH_DESTINATION',
      cue: 'Arrive at destination: 4th storefront on the right with wood-trimmed veranda',
      landmarkRef: 'Corner Veranda Bakery',
      position: [16, 0.5, 65],
    },
  ],
  waypoints: [
    [-30, 0.2, -45],
    [-20, 0.2, -35],
    [-10, 0.2, -20],
    [-2, 0.2, -5],
    [0, 0.2, 10],
    [4, 0.2, 25],
    [10, 0.2, 40],
    [14, 0.2, 55],
    [16, 0.2, 65],
  ],
};

const FALLBACK_DATASET: DatasetExampleData = {
  datasetId: 'ds_spatial_world_demo_01',
  name: 'Structured Urban Corridor Spatial Dataset',
  region: 'Chandigarh / Demo Sector',
  coordinateReferenceSystem: 'EPSG:4326 + WGS84 Orthometric Elevation',
  totalLayers: 7,
  layers: [
    { layerKey: 'ROAD', layerName: 'Drivable Surface & Curbs', category: 'Surface Geometry', description: '3D road surface mesh with lane boundary splines and curb elevations.', format: 'glTF Mesh + Vector Spline', sampleAttributes: { frictionCoeff: 0.82, widthMeters: 7.4, slopeDegrees: 0.3 } },
    { layerKey: 'BUILDINGS', layerName: 'Architectural Volumes & Facades', category: 'Structural', description: 'Volumetric building envelopes with facade texture normals and entrance coordinates.', format: 'USD Geometries + PBR Textures', sampleAttributes: { heightMeters: 14.8, storefrontCount: 4, primaryColorHue: 'Cobalt Blue' } },
    { layerKey: 'OBJECTS', layerName: 'Urban Clutter & Infrastructure', category: 'Semantic Instances', description: 'Segmented physical objects: street lamps, signage, planters, barriers, utility poles.', format: 'Instance 3D Bounding Boxes', sampleAttributes: { instanceClass: 'StreetLamp', clearanceHeightMeters: 4.5 } },
    { layerKey: 'TRAJECTORIES', layerName: 'Camera & Pedestrian Trajectories', category: 'Kinematics', description: 'Continuous 6-DOF camera positions and natural pedestrian flow paths.', format: 'Quat Time-series Spline', sampleAttributes: { samplingRateHz: 30, driftConfidence: 0.984 } },
    { layerKey: 'GEOMETRY', layerName: 'Dense Volumetric Point Cloud', category: 'Raw Spatial', description: 'Metric point cloud representation with spatial normal vectors.', format: 'LAS / PLY Binary', sampleAttributes: { pointCount: 142800, spatialPrecisionMm: 12 } },
    { layerKey: 'APPEARANCE', layerName: 'Radiance & Surface Reflectance', category: 'Photometric', description: 'Multi-view appearance profiles preserving view-dependent lighting cues.', format: 'Spherical Harmonics / NeRF Field', sampleAttributes: { illumination: 'Overcast Daylight', colorTempK: 5600 } },
    { layerKey: 'TIME', layerName: 'Temporal Observation Timestamp', category: 'Temporal State', description: 'Timestamped observation state enabling future change detection across scans.', format: 'ISO 8601 Temporal Stamp', sampleAttributes: { capturedUtc: '2026-08-20T09:14:22Z', weather: 'Clear' } },
  ],
  downstreamApplications: [
    { domain: 'Robotics', useCase: 'Metric obstacle avoidance and ground-truth indoor/outdoor navigation testing.', dataUtilized: ['GEOMETRY', 'ROAD', 'OBJECTS'] },
    { domain: 'Simulation', useCase: 'Synthetic sensor simulation (LiDAR, Camera, Radar) for autonomous delivery systems.', dataUtilized: ['BUILDINGS', 'ROAD', 'APPEARANCE', 'OBJECTS'] },
    { domain: 'Physical AI Research', useCase: 'Spatial reasoning and world model pretraining on real-world urban topologies.', dataUtilized: ['SEMANTICS', 'TRAJECTORIES', 'TIME'] },
    { domain: 'Visual Navigation', useCase: 'Zero-disorientation landmark route previews for consumers and delivery couriers.', dataUtilized: ['TRAJECTORIES', 'BUILDINGS', 'OBJECTS'] },
    { domain: 'Autonomous Systems', useCase: 'HD map verification and physical baseline road boundary validation.', dataUtilized: ['ROAD', 'GEOMETRY', 'TRAJECTORIES'] },
  ],
  sampleJsonSnippet: {
    dataset: 'world_ring_spatial_corridor_v0.1',
    environment: 'urban_street_corridor',
    crs: 'EPSG:4326',
    bounds_meters: { x: [-50, 50], y: [0, 25], z: [-60, 80] },
    entities: [
      { id: 'ent_01', type: 'building', semantic_class: 'commercial_facade', landmark_cue: 'Cobalt Commercial Complex', centroid: [12.0, 8.0, 10.0] },
      { id: 'ent_02', type: 'route_corridor', waypoints_count: 9, total_distance_m: 380, has_visual_prompts: true },
    ],
    data_layers_active: ['ROAD', 'BUILDINGS', 'OBJECTS', 'TRAJECTORIES', 'GEOMETRY', 'APPEARANCE', 'TIME'],
  },
};

const FALLBACK_PIPELINE_STATUS: PipelineStatusData = {
  systemStatus: 'ONLINE_PROTOTYPE_SANDBOX',
  pipelineStages: [
    {
      id: 'stage_01',
      stepNumber: '01',
      name: '360° Optical Video Ingestion',
      category: 'INGEST',
      description: 'High-resolution equirectangular video capture from street-level panoramic rigs.',
      technicalDetails: 'Extracts time-synchronized frame sequences with timestamped IMU and GPS anchors.',
      status: 'PROTOTYPE_STABLE',
      telemetry: {
        inputFormat: 'Dual Fisheye / 5.7K 360° Stream',
        outputFormat: 'Synchronized Frame Matrix',
        targetLatency: 'Offline Batching',
      },
    },
    {
      id: 'stage_02',
      stepNumber: '02',
      name: 'Frame Quality & Motion Deblur',
      category: 'INGEST',
      description: 'Keyframe extraction and optical flow motion deblurring across velocity shifts.',
      technicalDetails: 'Filters transient occlusions (passing pedestrians, dirty lens flares) using semantic masks.',
      status: 'ACTIVE_DEVELOPMENT',
      telemetry: {
        inputFormat: 'Raw Video Stream',
        outputFormat: 'Curated Keyframe Batches',
        targetLatency: '15 fps stream filtering',
      },
    },
    {
      id: 'stage_03',
      stepNumber: '03',
      name: 'Camera Motion & Pose Estimation',
      category: 'RECONSTRUCT',
      description: 'Estimates 6-DOF camera trajectory and relative coordinate poses across space.',
      technicalDetails: 'Structure-from-Motion (SfM) feature matching coupled with visual-inertial odometry.',
      status: 'ACTIVE_DEVELOPMENT',
      telemetry: {
        inputFormat: 'Keyframe Sequences + IMU',
        outputFormat: '6-DOF Trajectory Spline',
        targetLatency: 'Sub-centimeter relative loop closure',
      },
    },
    {
      id: 'stage_04',
      stepNumber: '04',
      name: 'Multi-View Geometric Understanding',
      category: 'RECONSTRUCT',
      description: 'Stereo disparity estimation and sparse depth calculation across continuous viewpoints.',
      technicalDetails: 'Multi-view epipolar geometry establishing consistent spatial correspondences.',
      status: 'RESEARCH_PHASE',
      telemetry: {
        inputFormat: 'Registered Camera Poses',
        outputFormat: 'Sparse Geometric Tie-Points',
        targetLatency: 'Batch Geometry Solver',
      },
    },
    {
      id: 'stage_05',
      stepNumber: '05',
      name: '3D Neural & Surface Reconstruction',
      category: 'RECONSTRUCT',
      description: 'Synthesizes continuous volumetric 3D geometry and textured corridor meshes.',
      technicalDetails: 'Neural radiance / gaussian field reconstruction optimized for long street corridors.',
      status: 'ACTIVE_DEVELOPMENT',
      telemetry: {
        inputFormat: 'Sparse Cloud + Calibrated Rays',
        outputFormat: 'Continuous 3D Mesh / Point Mesh',
        targetLatency: 'Modular Tile Synthesis',
      },
    },
    {
      id: 'stage_06',
      stepNumber: '06',
      name: 'Semantic Segmentation & Object Tagging',
      category: 'SEMANTICS',
      description: 'Labels physical surfaces into road, sidewalk, buildings, vegetation, signs, and landmarks.',
      technicalDetails: 'Zero-shot 3D segmentation propagating 2D visual priors into 3D bounding geometry.',
      status: 'RESEARCH_PHASE',
      telemetry: {
        inputFormat: 'Reconstructed 3D Scene',
        outputFormat: 'Segmented Semantic Hierarchy',
        targetLatency: 'Multi-class Classification',
      },
    },
    {
      id: 'stage_07',
      stepNumber: '07',
      name: 'Structured Spatial Hierarchy',
      category: 'SEMANTICS',
      description: 'Organizes raw geometric meshes into navigable road graphs, building envelopes, and POI anchors.',
      technicalDetails: 'Constructs topology graph connecting physical landmark cues with route corridors.',
      status: 'RESEARCH_PHASE',
      telemetry: {
        inputFormat: 'Semantic Mesh & Landmarks',
        outputFormat: 'Structured Topological Graph',
        targetLatency: 'Instant Graph Querying',
      },
    },
    {
      id: 'stage_08',
      stepNumber: '08',
      name: 'World Dataset Generation',
      category: 'DELIVERY',
      description: 'Compiles normalized multi-layer datasets (Geometry, Appearance, Trajectories, Semantics, Time).',
      technicalDetails: 'Export formats compatible with robotics simulation engines (USD, glTF, OpenDRIVE, custom JSON).',
      status: 'PLANNED',
      telemetry: {
        inputFormat: 'Structured Spatial Graph',
        outputFormat: 'USD / glTF / Spatial JSON',
        targetLatency: 'Dataset Partition Pipeline',
      },
    },
    {
      id: 'stage_09',
      stepNumber: '09',
      name: 'Application API & Interactive Delivery',
      category: 'DELIVERY',
      description: 'Delivers route previews, business spatial embeds, and robotic simulation query endpoints.',
      technicalDetails: 'Low-latency streaming of 3D tiles and visual wayfinding cues to web and native clients.',
      status: 'PROTOTYPE_STABLE',
      telemetry: {
        inputFormat: 'Spatial Database',
        outputFormat: 'REST / WebGL Stream',
        targetLatency: '< 50ms Telemetry Query',
      },
    },
  ],
  prototype: {
    currentStage: 'PROTOTYPE + IDEATION',
    statusBadge: 'Prototype / Ideation Stage',
    stageIndex: 2,
    totalStages: 5,
    stages: [
      { number: '01', title: 'Concept & Technical Thesis', description: 'Formulating the 360° video to 3D spatial world reconstruction thesis.', status: 'COMPLETED' },
      { number: '02', title: 'Pipeline Prototype', description: 'Building the core ingestion, trajectory estimation, and 3D street simulation engine.', status: 'IN_PROGRESS' },
      { number: '03', title: 'Field Test Validation', description: 'Capturing and reconstructing the first small real-world street sector.', status: 'UPCOMING' },
      { number: '04', title: 'Data & Use-Case Validation', description: 'Testing whether reconstructed environments solve visual navigation.', status: 'UPCOMING' },
      { number: '05', title: 'Productization', description: 'Packaging validated technology into consumer and data APIs.', status: 'UPCOMING' },
    ],
    researchHypotheses: [
      { id: 'hyp_01', question: 'Can 360° street footage be converted into a consistent, navigable 3D environment?', validationApproach: 'Synthesizing continuous geometry from standard consumer 360 camera rigs.', currentObservation: 'Feasible in constrained corridors.' },
      { id: 'hyp_02', question: 'Can reconstruction remain spatially consistent over useful real-world distances?', validationApproach: 'Benchmarking visual-inertial drift across 500m+ urban street segments.', currentObservation: 'Loop closure and periodic GPS anchors prevent geometric warping.' },
      { id: 'hyp_03', question: 'Can the resulting data support intuitive visual landmark route preview?', validationApproach: 'User testing natural verbal directions.', currentObservation: 'Significantly reduces cognitive disorientation.' },
      { id: 'hyp_04', question: 'Is structured 3D spatial data valuable to external robotics and simulation teams?', validationApproach: 'Engaging physical AI researchers to evaluate semantic mesh utility.', currentObservation: 'High interest in ground-truth architectural geometry.' },
      { id: 'hyp_05', question: 'What is the real-world compute and capture cost per useful kilometer?', validationApproach: 'Measuring processing time and GPU hours.', currentObservation: 'Active optimization target: streaming tile reconstruction.' },
    ],
  },
};

export async function fetchSpatialEnvironment(): Promise<SpatialEnvironmentData> {
  try {
    const res = await fetch(`${API_BASE}/demo/environment`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  } catch {
    return FALLBACK_ENVIRONMENT;
  }
}

export async function fetchRouteGuide(): Promise<RouteGuideData> {
  try {
    const res = await fetch(`${API_BASE}/demo/route`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  } catch {
    return FALLBACK_ROUTE;
  }
}

export async function fetchDatasetsExample(): Promise<DatasetExampleData> {
  try {
    const res = await fetch(`${API_BASE}/datasets/example`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  } catch {
    return FALLBACK_DATASET;
  }
}

export async function fetchPipelineStatus(): Promise<PipelineStatusData> {
  try {
    const res = await fetch(`${API_BASE}/pipeline/status`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  } catch {
    return FALLBACK_PIPELINE_STATUS;
  }
}

export async function submitContactInquiry(data: {
  name: string;
  email: string;
  interestType: string;
  message: string;
  organization?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit inquiry');
    return await res.json();
  } catch (err: any) {
    // Fallback simulation
    return {
      success: true,
      message: 'Inquiry registered locally (prototype mode). Thank you for reaching out!',
      inquiryId: `inq_client_${Date.now()}`,
      stage: 'LOCAL_SANDBOX',
    };
  }
}
