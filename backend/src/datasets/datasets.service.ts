import { Injectable } from '@nestjs/common';

export interface SpatialDatasetExample {
  datasetId: string;
  name: string;
  region: string;
  coordinateReferenceSystem: string;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
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

@Injectable()
export class DatasetsService {
  getExample(): SpatialDatasetExample {
    return {
      datasetId: 'ds_spatial_world_demo_01',
      name: 'Structured Urban Corridor Spatial Dataset',
      region: 'Chandigarh / Demo Sector',
      coordinateReferenceSystem: 'EPSG:4326 + WGS84 Orthometric Elevation',
      boundingBox: {
        minLat: 30.7321,
        maxLat: 30.7345,
        minLng: 76.7781,
        maxLng: 76.7809,
      },
      totalLayers: 7,
      layers: [
        {
          layerKey: 'ROAD',
          layerName: 'Drivable Surface & Curbs',
          category: 'Surface Geometry',
          description: '3D road surface mesh with lane boundary splines and curb elevations.',
          format: 'glTF Mesh + Vector Spline',
          sampleAttributes: {
            frictionCoeff: 0.82,
            widthMeters: 7.4,
            slopeDegrees: 0.3,
            material: 'Asphalt Composite',
          },
        },
        {
          layerKey: 'BUILDINGS',
          layerName: 'Architectural Volumes & Facades',
          category: 'Structural',
          description: 'Volumetric building envelopes with facade texture normals and entrance coordinates.',
          format: 'USD Geometries + PBR Textures',
          sampleAttributes: {
            heightMeters: 14.8,
            storefrontCount: 4,
            primaryColorHue: 'Cobalt Blue (#1D4ED8)',
            entranceOffsetMeters: [12.4, 0.0, 10.2],
          },
        },
        {
          layerKey: 'OBJECTS',
          layerName: 'Urban Clutter & Infrastructure',
          category: 'Semantic Instances',
          description: 'Segmented physical objects: street lamps, signage, planters, barriers, utility poles.',
          format: 'Instance 3D Bounding Boxes',
          sampleAttributes: {
            instanceClass: 'StreetLamp',
            clearanceHeightMeters: 4.5,
            lumensEstimated: 4200,
          },
        },
        {
          layerKey: 'TRAJECTORIES',
          layerName: 'Camera & Pedestrian Trajectories',
          category: 'Kinematics',
          description: 'Continuous 6-DOF camera positions and natural pedestrian flow paths.',
          format: 'Quat Time-series Spline',
          sampleAttributes: {
            samplingRateHz: 30,
            driftConfidence: 0.984,
            velocityAvgMps: 1.25,
          },
        },
        {
          layerKey: 'GEOMETRY',
          layerName: 'Dense Volumetric Point Cloud',
          category: 'Raw Spatial',
          description: 'Metric point cloud representation with spatial normal vectors.',
          format: 'LAS / PLY Binary',
          sampleAttributes: {
            pointCount: 142800,
            densityPerSquareMeter: 340,
            spatialPrecisionMm: 12,
          },
        },
        {
          layerKey: 'APPEARANCE',
          layerName: 'Radiance & Surface Reflectance',
          category: 'Photometric',
          description: 'Multi-view appearance profiles preserving view-dependent lighting cues.',
          format: 'Spherical Harmonics / NeRF Field',
          sampleAttributes: {
            illuminationCondition: 'Overcast Daylight',
            colorTemperatureK: 5600,
          },
        },
        {
          layerKey: 'TIME',
          layerName: 'Temporal Observation Timestamp',
          category: 'Temporal State',
          description: 'Timestamped observation state enabling future change detection across scans.',
          format: 'ISO 8601 Temporal Stamp',
          sampleAttributes: {
            capturedUtc: '2026-08-20T09:14:22Z',
            weatherState: 'Clear Visibility',
            dynamicObjectFilterActive: true,
          },
        },
      ],
      downstreamApplications: [
        {
          domain: 'Robotics',
          useCase: 'Metric obstacle avoidance and ground-truth indoor/outdoor navigation testing.',
          dataUtilized: ['GEOMETRY', 'ROAD', 'OBJECTS'],
        },
        {
          domain: 'Simulation',
          useCase: 'Synthetic sensor simulation (LiDAR, Camera, Radar) for autonomous delivery systems.',
          dataUtilized: ['BUILDINGS', 'ROAD', 'APPEARANCE', 'OBJECTS'],
        },
        {
          domain: 'Physical AI Research',
          useCase: 'Spatial reasoning and world model pretraining on real-world urban topologies.',
          dataUtilized: ['SEMANTICS', 'TRAJECTORIES', 'TIME'],
        },
        {
          domain: 'Visual Navigation',
          useCase: 'Zero-disorientation landmark route previews for consumers and delivery couriers.',
          dataUtilized: ['TRAJECTORIES', 'BUILDINGS', 'OBJECTS'],
        },
        {
          domain: 'Autonomous Systems',
          useCase: 'HD map verification and physical baseline road boundary validation.',
          dataUtilized: ['ROAD', 'GEOMETRY', 'TRAJECTORIES'],
        },
      ],
      sampleJsonSnippet: {
        dataset: 'world_ring_spatial_corridor_v0.1',
        environment: 'urban_street_corridor',
        crs: 'EPSG:4326',
        bounds_meters: { x: [-50, 50], y: [0, 25], z: [-60, 80] },
        entities: [
          {
            id: 'ent_01',
            type: 'building',
            semantic_class: 'commercial_facade',
            landmark_cue: 'Cobalt Commercial Complex',
            bounding_box: { width: 14.2, height: 16.0, depth: 22.5 },
            centroid: [12.0, 8.0, 10.0],
          },
          {
            id: 'ent_02',
            type: 'route_corridor',
            waypoints_count: 9,
            total_distance_m: 380,
            has_visual_prompts: true,
          },
        ],
        data_layers_active: ['ROAD', 'BUILDINGS', 'OBJECTS', 'TRAJECTORIES', 'GEOMETRY', 'APPEARANCE', 'TIME'],
      },
    };
  }
}
