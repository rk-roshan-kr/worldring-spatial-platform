export const SITE = {
  brandName: "WorldRing",
  stageTag: "Chandigarh Field Benchmark",
  contactEmail: "hello@worldring.xyz",

  hero: {
    kicker: "Spatial Intelligence Infrastructure",
    headline: "The physical world is becoming the next data layer.",
    subhead: "The internet mapped the digital world. We are reconstructing the physical one.",
    lede: "Traditional maps reduce reality to flat pins on arterial roads. We are building a computer vision pipeline that turns commodity 360° optical capture into continuous, structured 3D spatial environments — giving humans visual arrival previews for the final 100 meters, and providing autonomous machines with rich physical-AI navigation priors. Without $300,000 LiDAR fleets.",
    primaryCta: { label: "Discuss Prototype Investment", href: "#capital" },
    secondaryCta: { label: "Explore The Corridor Demo ↓", href: "#demo" },
    meta: [
      "30.7333° N / 76.7794° E",
      "Sector 17, Chandigarh · Field Benchmark",
      "Commodity Dual-Lens Optical Pipeline",
      "< 2% Cost of Survey LiDAR Vehicles",
    ],
  },

  nav: [
    { num: "01", label: "The Vision", href: "#top" },
    { num: "02", label: "The Gap", href: "#gap" },
    { num: "03", label: "Pipeline", href: "#thesis" },
    { num: "04", label: "Corridor Demo", href: "#demo" },
    { num: "05", label: "Physical AI", href: "#data" },
    { num: "06", label: "Sector Pilot", href: "#proving" },
    { num: "07", label: "Capital Ask", href: "#capital" },
  ],

  gap: {
    heading: "We have mapped the world in coordinates. But coordinates aren't the world.",
    intro:
      "A GPS coordinate only tells you where a pin lands on paper. It cannot tell you what you'll see upon arrival, where the pedestrian arcade begins, or which courtyard alley leads to the actual entrance — leaving people and delivery rovers stranded 120 meters away on an arterial road.",
    formal: [
      { term: "Sector", detail: "Sector 17-C" },
      { term: "Road", detail: "Inner Loop Road 4" },
      { term: "Unit", detail: "Shop B-14 / Block 2" },
      { term: "GPS pin", detail: "Stops 120 m away on the 4-lane arterial", warn: true },
    ],
    formalVerdict:
      "Coordinates pinpoint a theoretical spot on paper. In dense or multi-level urban sectors, they leave humans and mobile systems searching for final-meter context.",
    landmarkSteps: [
      {
        title: "Pass the central monument fountain.",
        detail: "Orient north and take the shaded pedestrian walkway on the right.",
      },
      {
        title: "Follow shaded storefronts",
        detail: "about 150 m past the post office complex into the open courtyard.",
      },
      {
        title: "Fourth shop on the right",
        detail: "— corner bakery with the wood-trimmed canopy.",
      },
    ],
    landmarkVerdict:
      "This matches what eyes and cameras see on the street. It's how directions are given — and what spatial intelligence must understand.",
  },

  thesis: {
    heading: "From raw optical video to structured 3D spatial reality in four steps.",
    intro:
      "Instead of deploying capital-intensive LiDAR fleets, we prove that commodity 360° video, combined with visual-inertial odometry, can reconstruct centimeter-accurate 3D spatial environments at a fraction of traditional surveying costs.",
    pipeline: [
      { step: "01", name: "Panoramic Capture", desc: "Dual-lens 5.7K optical rigs mounted on everyday bikes, cars, or carts (< $500 total hardware)", tag: "Commodity Optical" },
      { step: "02", name: "Trajectory & Pose", desc: "Visual-inertial SfM solves continuous 6-DOF camera splines with loop closure across the corridor", tag: "Pose Splines" },
      { step: "03", name: "3D Reconstruction", desc: "Continuous photometric optimization and Gaussian Splatting generate metric depth and point clouds", tag: "Dense Geometry" },
      { step: "04", name: "Privacy Redaction", desc: "Automated on-device neural anonymization of faces, license plates, and private identifiers", tag: "PII Compliant" },
      { step: "05", name: "Semantic Structuring", desc: "Separating walkable walkways, curb heights, building envelopes, and visual landmark cues", tag: "Vector Strata" },
      { step: "06", name: "Dual Deployment", desc: "Powering human-facing visual arrival previews and machine-facing physical-AI navigation priors", tag: "Dual Streams" },
    ],
  },

  demo: {
    heading: "One continuous corridor. Zero cuts.",
    intro:
      "A drone captures the block, hands off to street optical video, reconstructs the 3D geometry, and outputs a first-person route on a phone. Drag the scrubber below to inspect how raw street observation transforms into structured spatial navigation.",
  },

  infrastructure: {
    heading: "One underlying 3D representation. Dual value streams.",
    intro:
      "We aren't building disparate point solutions. We are building a single underlying 3D spatial model that simultaneously powers visual navigation for humans and spatial ground-truth for autonomous machines.",
    paths: [
      {
        title: "Human World — Visual Arrival Previews",
        name: "OnMyWay Navigation",
        tagline: "See the journey before you take it.",
        desc: "Visual route previews for complex campuses, hospitals, shopping malls, transit hubs, and dense unnumbered urban sectors.",
        items: [
          "Continuous first-person corridor walkthroughs",
          "Visual landmark identification cues",
          "Final-meter destination & entrance context",
          "Embeddable storefront approach widgets",
        ],
      },
      {
        title: "Machine World — Physical AI Infrastructure",
        name: "Data Wing Platform",
        tagline: "Ground truth for machines that operate in the physical world.",
        desc: "Structured real-world 3D environments for sidewalk delivery rovers, robotics simulation, and autonomous path planning.",
        items: [
          "Centimeter-accurate curb elevations & ramp profiles",
          "Pedestrian corridor meshes separated from traffic",
          "3D semantic obstacle bounding (bollards, benches, poles)",
          "Real-world metric coordinate frames for simulators",
        ],
      },
    ],
  },

  dataWing: {
    heading: "Physical-AI Infrastructure: Multi-layer spatial ground truth.",
    intro:
      "Autonomous sidewalk delivery rovers and physical-AI models cannot navigate on 2D road lines alone. They require multi-layer 3D spatial priors: curb traversability, entryway portals, and physical obstacle bounding.",
    layers: [
      { name: "01 · Ground & Corridors", contains: "Walkway meshes, curb elevation profiles, sidewalk friction" },
      { name: "02 · Building Envelopes", contains: "Volumetric facade planes, entryway portals, canopy projections" },
      { name: "03 · Physical Obstacles", contains: "Bollards, light poles, hydrants, street furniture bounds" },
      { name: "04 · Camera Trajectories", contains: "Continuous 6-DOF pose splines with real-world metric anchors" },
      { name: "05 · Dense Geometry", contains: "Metric point clouds, surface normals, and spatial meshes" },
      { name: "06 · Appearance & Radiance", contains: "View-dependent photometric radiance and surface materials" },
      { name: "07 · Temporal Dynamics", contains: "Corridor scan timestamps and seasonal change vectors" },
    ],
    footnote:
      "Multi-stratum spatial schema under active trial and validation across the Chandigarh pilot corridor.",
  },

  proving: {
    heading: "What we are currently proving on the ground.",
    intro:
      "We are deliberate and transparent. We are executing our first field trial to validate core technical hypotheses against real street conditions before making scaling claims.",
    hypotheses: [
      {
        id: "01",
        title: "Can commodity 360° video produce reliable 3D spatial geometry?",
        detail: "Evaluating visual-inertial SfM and Gaussian Splatting using sub-$500 panoramic rigs rather than multi-laser LiDAR systems.",
      },
      {
        id: "02",
        title: "Can we maintain metric scale without odometry drift across 500m+?",
        detail: "Benchmarking scale recovery and visual drift correction along a 500m commercial pedestrian corridor in Chandigarh.",
      },
      {
        id: "03",
        title: "Can automated vision segment storefront portals and curbs accurately?",
        detail: "Testing semantic segmentation to extract walkable paths and entryway portals from dense optical footage.",
      },
      {
        id: "04",
        title: "Can the processing pipeline reach a viable cost per road-kilometer?",
        detail: "Benchmarking compute hours and sensor overhead to confirm a 10x cost reduction compared to dedicated LiDAR survey fleets.",
      },
      {
        id: "05",
        title: "Can the resulting 3D models power both humans and delivery robotics?",
        detail: "Testing arrival preview utility with local pedestrians alongside spatial mesh compatibility with robotics navigation engines.",
      },
    ],
    experiment: {
      title: "First Field Benchmark: Sector 17, Chandigarh",
      desc: "Our active benchmark evaluates the pipeline end-to-end across the iconic pedestrian plazas of Sector 17, Chandigarh, India. We measure metric fidelity, processing overhead, and cost per kilometer.",
    },
  },

  capital: {
    heading: "Milestone-driven prototype capital ask.",
    intro:
      "We are raising our first prototype capital to validate and benchmark the end-to-end optical spatial reconstruction pipeline across our initial 10 urban sectors.",
    milestoneBought: "A validated end-to-end pipeline capable of turning real-world 360° capture into structured 3D spatial environments across 10 complete urban sectors.",
    allocation: [
      { area: "360° Optical Rigs & Sensor Mounts", pct: "30%", desc: "Panoramic optical rigs, IMUs, GNSS receivers, vehicle & bicycle mounts" },
      { area: "Pipeline Engineering & Reconstruction Compute", pct: "40%", desc: "SfM trajectory solver, Gaussian Splatting compute & semantic vectorization" },
      { area: "Field Operations & Sector Ground Surveys", pct: "20%", desc: "On-the-ground sector scanning, ground control point surveys & verification" },
      { area: "Privacy Redaction & Data Governance", pct: "10%", desc: "Automated on-device blurring of faces, vehicle plates, and private identifiers" },
    ],
  },

  founder: {
    heading: "Why we are building WorldRing.",
    quote:
      "Flat maps destroyed visual reality. The real world has landmark cues, storefronts, and elevations. Building affordable tools to capture and structure physical reality is the most important navigation transition since GPS.",
    bio:
      "Independent technical exploration in spatial computing, computer vision, and physical AI systems. Based in Chandigarh, India.",
  },
};
