import { Injectable } from '@nestjs/common';

export interface SpatialEnvironment {
  id: string;
  name: string;
  region: string;
  status: 'CONCEPT' | 'PROTOTYPE' | 'VALIDATION';
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

export interface RouteGuide {
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

@Injectable()
export class DemoService {
  getEnvironment(): SpatialEnvironment {
    return {
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
        {
          id: 'road',
          name: 'Road Surface',
          color: '#38BDF8',
          description: 'Drivable surface geometry and lane boundaries',
          elementCount: 1,
        },
        {
          id: 'sidewalk',
          name: 'Pedestrian Corridors',
          color: '#2DD4BF',
          description: 'Walkways, curbs, and sidewalk elevation steps',
          elementCount: 2,
        },
        {
          id: 'buildings',
          name: 'Architectural Volumes',
          color: '#A855F7',
          description: '3D building facades, storefront heights, and entrances',
          elementCount: 14,
        },
        {
          id: 'vegetation',
          name: 'Urban Foliage',
          color: '#22C55E',
          description: 'Trees, planters, and canopy occlusion boundaries',
          elementCount: 18,
        },
        {
          id: 'vehicles',
          name: 'Dynamic & Static Vehicles',
          color: '#F59E0B',
          description: 'Stationary vehicles, parking areas, and clearance envelopes',
          elementCount: 6,
        },
        {
          id: 'lighting',
          name: 'Street Infrastructure',
          color: '#E0E7FF',
          description: 'Streetlamps, signage posts, and utility reference nodes',
          elementCount: 12,
        },
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
  }

  getRoute(): RouteGuide {
    return {
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
  }
}
