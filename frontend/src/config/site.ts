export const SITE = {
  brandName: "Earthos Lab",
  stageTag: "Prototype / Ideation Stage",
  contactEmail: "hello@earthoslab.example",

  hero: {
    kicker: "01 — The World",
    headline: "The physical world is becoming the next data layer.",
    subhead: "The internet mapped the digital world. We are exploring the physical one.",
    lede: "We're building a pipeline that converts low-cost 360° street video into structured, navigable 3D spatial data — connecting optical observation to human route previews and machine physical-AI infrastructure. Prototype & ideation stage.",
    primaryCta: { label: "Fund Prototype Capital", href: "#capital" },
    secondaryCta: { label: "Technical Thesis & Demo", href: "#demo" },
    meta: [
      "30.7333° N / 76.7794° E",
      "Chandigarh · First Field Sector",
      "Stage 0 Hypothesis Validation",
      "v0.1.5 Technical Sandbox",
    ],
  },

  nav: [
    { num: "01", label: "Overview", href: "#top" },
    { num: "02", label: "The Gap", href: "#gap" },
    { num: "03", label: "Thesis", href: "#thesis" },
    { num: "04", label: "Data Wing", href: "#data" },
    { num: "05", label: "Capital", href: "#capital" },
  ],

  gap: {
    heading: "We have mapped the world in coordinates. But coordinates aren't the world.",
    intro:
      "Coordinates tell you where a pin lands. They don't communicate what you'll see upon arrival or how the final approach will unfold — stranded 120 meters away on an arterial road with no visual cues for the last turn.",
    formal: [
      { term: "Sector", detail: "Sector 17-C" },
      { term: "Road", detail: "Inner Loop Road 4" },
      { term: "Unit", detail: "Shop B-14 / Block 2" },
      { term: "GPS pin", detail: "Stops 120 m away on the arterial", warn: true },
    ],
    formalVerdict:
      "Coordinates pinpoint a theoretical spot on paper. On the ground, they leave humans and mobile systems searching for final-meter context.",
    landmarkSteps: [
      {
        title: "Pass the roundabout monument.",
        detail: "Orient north, take the first pedestrian walkway right.",
      },
      {
        title: "Follow shaded storefronts",
        detail: "about 150 m to the cobalt-blue commercial complex.",
      },
      {
        title: "Fourth shop on the right",
        detail: "— corner bakery with the wood-trimmed canopy.",
      },
    ],
    landmarkVerdict:
      "This matches what your eyes see on the street. It's how directions are given — and what we want spatial software to understand.",
  },

  thesis: {
    heading: "What if ordinary optical observations could become a structured representation of reality?",
    intro:
      "Instead of deploying capital-intensive LiDAR fleets, we test whether consumer-grade 360° video, supplemented by low-cost GNSS/IMU sensors, can generate structured 3D spatial representations at a fraction of traditional mapping costs.",
    pipeline: [
      { step: "01", name: "Observe", desc: "Low-cost panoramic 360° video streams", tag: "5.7K optical rig" },
      { step: "02", name: "Trajectory", desc: "Visual-inertial SfM & 6-DOF camera splines", tag: "Pose estimation" },
      { step: "03", name: "Reconstruct", desc: "Neural radiance fields & Gaussian Splatting", tag: "Point cloud + mesh" },
      { step: "04", name: "Privacy", desc: "Automated face & license plate blurring", tag: "PII anonymization" },
      { step: "05", name: "Structure", desc: "Semantic layer extraction & surface fitting", tag: "7-layer schema" },
      { step: "06", name: "Deploy", desc: "Human route previews & physical-AI APIs", tag: "Spatial infrastructure" },
    ],
  },

  demo: {
    heading: "One street. One experiment.",
    intro:
      "A drone hands off to a car, footage streams to a laptop, and a route opens on a phone. Thirty-nine frames, one camera, zero cuts. Drag the scrubber below to test the spatial transition between raw observation and reconstructed geometry.",
  },

  infrastructure: {
    heading: "One spatial representation, dual value streams.",
    intro:
      "We aren't building three unrelated products. We are building a single underlying spatial representation that powers both human-facing visual navigation and machine-facing physical AI.",
    paths: [
      {
        title: "Human World — Consumer & Commercial UX",
        name: "OnMyWay & Location Approach Previews",
        tagline: "See the journey before you take it.",
        desc: "Visual route previews for complex campuses, hospitals, shopping malls, and unfamiliar urban sectors.",
        items: [
          "Continuous 3D route previews",
          "Landmark recognition cues",
          "Final-meter destination context",
          "Embeddable storefront approach widgets",
        ],
      },
      {
        title: "Machine World — Physical AI Infrastructure",
        name: "Data Wing Platform",
        tagline: "Data for machines that live in the physical world.",
        desc: "Structured real-world 3D environments for robotics simulation, embodied AI training, and environment evaluation.",
        items: [
          "Metric multi-layer spatial geometry",
          "6-DOF camera & pedestrian trajectories",
          "Semantic surface & object instances",
          "Temporal change vectors across scans",
        ],
      },
    ],
  },

  dataWing: {
    heading: "Data Wing: Pipeline for physical-AI datasets.",
    intro:
      "Today, this is a research hypothesis we are actively building toward. Robotics and physical-AI systems (such as NVIDIA Omniverse and Cosmos world models) increasingly require grounded real-world 3D data for perception and simulation.",
    layers: [
      { name: "01 · Road", contains: "Drivable bounds, curbs, friction profiles" },
      { name: "02 · Buildings", contains: "Volumetric envelopes, storefronts, portals" },
      { name: "03 · Objects", contains: "Lamps, signage, utility poles, street clutter" },
      { name: "04 · Trajectories", contains: "6-DOF camera splines & movement flows" },
      { name: "05 · Geometry", contains: "Dense metric point clouds & surface normals" },
      { name: "06 · Appearance", contains: "Photometric radiance profiles & materials" },
      { name: "07 · Time", contains: "Scan timestamps & temporal change vectors" },
    ],
    footnote:
      "Layer descriptions represent our proposed spatial schema under active development. No public commercial dataset is live today.",
  },

  proving: {
    heading: "What we are currently proving.",
    intro:
      "We are early. That's intentional. We are executing Stage 0 to test core technical hypotheses before making production or scaling claims.",
    hypotheses: [
      {
        id: "01",
        title: "Can consumer 360° capture produce useful 3D spatial reconstructions?",
        detail: "Testing visual-inertial SfM and Gaussian Splatting on commodity panoramic rigs.",
      },
      {
        id: "02",
        title: "Can we maintain usable spatial accuracy across a continuous road corridor?",
        detail: "Evaluating odometry drift correction and scale recovery across 500 m+ urban corridors.",
      },
      {
        id: "03",
        title: "Can we structure the reconstruction into reusable multi-layer spatial data?",
        detail: "Developing semantic segmenters for curbs, storefronts, roads, and obstacles.",
      },
      {
        id: "04",
        title: "Can the pipeline reach a viable processing cost per road-kilometer?",
        detail: "Measuring compute hours and sensor overhead compared to dedicated LiDAR survey fleets.",
      },
      {
        id: "05",
        title: "Can the resulting representation support applications beyond visualization?",
        detail: "Assessing dataset utility with physical-AI, simulation, and robotics research teams.",
      },
    ],
    experiment: {
      title: "First Field Trial: One Chandigarh Sector",
      desc: "Our initial benchmark evaluates the pipeline end-to-end across a single urban sector in Chandigarh, India. We measure metric fidelity, processing overhead, and cost per kilometer.",
    },
  },

  capital: {
    heading: "Milestone-driven prototype capital ask.",
    intro:
      "We are raising our first prototype capital to build, validate, and benchmark the end-to-end spatial reconstruction pipeline across our initial Chandigarh road corridor.",
    milestoneBought: "A validated end-to-end pipeline capable of turning real-world 360° capture into a structured 3D spatial environment.",
    allocation: [
      { area: "360° Capture Rigs & Sensors", pct: "25%", desc: "Panoramic optical rigs, IMUs, GNSS receivers & mounting hardware" },
      { area: "Field Ops & Ground Support", pct: "20%", desc: "On-the-ground sector scanning, control point surveys & compliance" },
      { area: "Pipeline Engineering & Compute", pct: "40%", desc: "SfM trajectory solver, radiance reconstruction & semantic classification" },
      { area: "Data Governance & Compliance", pct: "15%", desc: "Automated PII anonymization, face/plate blurring & spatial redacting" },
    ],
  },

  founder: {
    heading: "Why we are building Earthos Lab.",
    quote:
      "The physical world is complex, dynamic, and full of context that flat coordinates destroy. Building the infrastructure to capture and structure physical reality is one of the most important technical journeys of the coming decade.",
    bio:
      "Independent technical exploration in spatial computing, computer vision, and physical AI systems. Based in Chandigarh, India.",
  },
};
