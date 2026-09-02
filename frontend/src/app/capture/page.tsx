"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowLeft, Play, Pause, Compass, Layers, Box, Code } from "lucide-react";
import Link from "next/link";

export default function CaptureSimulationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentScene, setCurrentScene] = useState<"capture" | "transition" | "ingestion" | "reconstruction" | "semantic" | "product" | "temporal">("capture");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Reference to manually jump the animation elapsed time index
  const elapsedOverrideRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#FFFFFF");

    // Orthographic Camera for God's-Eye View
    const aspect = width / height;
    const baseViewSize = 25;
    const camera = new THREE.OrthographicCamera(
      -baseViewSize * aspect,
      baseViewSize * aspect,
      baseViewSize,
      -baseViewSize,
      0.1,
      1000
    );
    camera.position.set(0, 50, 0); // Start looking straight down (God's-eye)
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Texture Loader & Real Map Background Plane
    const textureLoader = new THREE.TextureLoader();
    const mapTexture = textureLoader.load("/map.jpg");
    
    const mapGeom = new THREE.PlaneGeometry(50, 50);
    const mapMat = new THREE.MeshBasicMaterial({
      map: mapTexture,
      side: THREE.DoubleSide
    });
    const mapMesh = new THREE.Mesh(mapGeom, mapMat);
    mapMesh.rotation.x = -Math.PI / 2;
    mapMesh.position.y = 0.01;
    scene.add(mapMesh);

    // Overlay light gray grid on top of map texture (#E5E5E5)
    const gridHelper = new THREE.GridHelper(50, 50, 0xe5e5e5, 0xe5e5e5);
    gridHelper.position.y = 0.02;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.12;
    scene.add(gridHelper);

    // 3. Rectilinear Path State Mechanics
    const waypoints = [
      new THREE.Vector3(-23.5, 0.15, -26), // Start (Top-Left)
      new THREE.Vector3(-23.5, 0.15, 0.1),  // Junction 1 (Left-Center)
      new THREE.Vector3(0.2, 0.15, 0.1),     // Junction 2 (Central intersection)
      new THREE.Vector3(0.2, 0.15, 26.0)     // Exit (Bottom-Center)
    ];

    const segRatios = [0, 26.1 / 75.7, (26.1 + 23.7) / 75.7, 1.0];

    const getPathState = (progress: number) => {
      const p = Math.max(0, Math.min(1.0, progress));
      
      let segIndex = 0;
      for (let i = 0; i < 3; i++) {
        if (p >= segRatios[i] && p <= segRatios[i + 1]) {
          segIndex = i;
          break;
        }
      }

      const segmentPercent = (p - segRatios[segIndex]) / (segRatios[segIndex + 1] - segRatios[segIndex]);
      const start = waypoints[segIndex];
      const end = waypoints[segIndex + 1];

      const pos = new THREE.Vector3().lerpVectors(start, end, segmentPercent);
      const dir = new THREE.Vector3().subVectors(end, start).normalize();

      return { pos, dir };
    };

    // 4. Drone Model Group
    const droneGroup = new THREE.Group();
    scene.add(droneGroup);

    const bodyGeom = new THREE.ConeGeometry(0.38, 1.1, 6);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x2c2c2a });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    droneGroup.add(bodyMesh);

    const armGeom = new THREE.BoxGeometry(1.6, 0.05, 0.08);
    const armMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
    const arm1 = new THREE.Mesh(armGeom, armMat);
    arm1.rotateY(Math.PI / 4);
    droneGroup.add(arm1);
    const arm2 = new THREE.Mesh(armGeom, armMat);
    arm2.rotateY(-Math.PI / 4);
    droneGroup.add(arm2);

    const rotorBladeGeom = new THREE.RingGeometry(0.22, 0.26, 12);
    rotorBladeGeom.rotateX(Math.PI / 2);
    const rotorBladeMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });

    const blades: THREE.Mesh[] = [];
    const bladeOffsets = [
      new THREE.Vector3(0.56, 0.04, 0.56),
      new THREE.Vector3(-0.56, 0.04, 0.56),
      new THREE.Vector3(0.56, 0.04, -0.56),
      new THREE.Vector3(-0.56, 0.04, -0.56)
    ];

    bladeOffsets.forEach((offset) => {
      const blade = new THREE.Mesh(rotorBladeGeom, rotorBladeMat);
      blade.position.copy(offset);
      droneGroup.add(blade);
      blades.push(blade);
    });

    const arrowGeom = new THREE.ConeGeometry(0.14, 0.45, 4);
    arrowGeom.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);
    arrow.position.set(0, 0.08, 0.55);
    droneGroup.add(arrow);

    // 5. Pulsing Coverage Radar
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    const radarPulseGeom = new THREE.CircleGeometry(4.5, 32);
    radarPulseGeom.rotateX(-Math.PI / 2);
    const radarPulseMat = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const radarPulse = new THREE.Mesh(radarPulseGeom, radarPulseMat);
    radarGroup.add(radarPulse);

    const radarRingGeom = new THREE.RingGeometry(4.4, 4.5, 48);
    radarRingGeom.rotateX(-Math.PI / 2);
    const radarRingMat = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const radarRing = new THREE.Mesh(radarRingGeom, radarRingMat);
    radarGroup.add(radarRing);

    // 6. Dynamic Glowing Orange Trail System
    const trailPointCount = 200;
    const trailPositions = new Float32Array(trailPointCount * 3);
    for (let i = 0; i < trailPointCount * 3; i += 3) {
      trailPositions[i] = -999;
      trailPositions[i + 1] = 0.18;
      trailPositions[i + 2] = -999;
    }
    const trailGeom = new THREE.BufferGeometry();
    trailGeom.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));

    const trailCoreMat = new THREE.LineBasicMaterial({ color: 0xff6b35, linewidth: 2.5 });
    const trailCoreLine = new THREE.Line(trailGeom, trailCoreMat);
    scene.add(trailCoreLine);

    const glowLines: THREE.Line[] = [];
    const glowOffsets = [
      new THREE.Vector3(0.06, 0, 0),
      new THREE.Vector3(-0.06, 0, 0),
      new THREE.Vector3(0, 0, 0.06),
      new THREE.Vector3(0, 0, -0.06)
    ];
    glowOffsets.forEach(() => {
      const glowMat = new THREE.LineBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.22,
        linewidth: 1
      });
      const glowLine = new THREE.Line(trailGeom, glowMat);
      scene.add(glowLine);
      glowLines.push(glowLine);
    });

    // 7. SCENES 3 & 4 — 3D RECONSTRUCTION VISUALIZATIONS Setup
    const reconCenter = new THREE.Vector3(6, 1.5, 0);

    const reconGroup = new THREE.Group();
    scene.add(reconGroup);

    const reconGrid = new THREE.GridHelper(30, 30, 0xcccccc, 0xe8e8e8);
    reconGrid.position.copy(reconCenter).setY(-0.01);
    reconGroup.add(reconGrid);

    const generatePointPositions = (count: number) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let px = 0, py = 0, pz = 0;

        if (rand < 0.35) {
          px = reconCenter.x + (Math.random() - 0.5) * 12;
          py = 0.05 + Math.random() * 0.4;
          pz = reconCenter.z + (Math.random() - 0.5) * 24;
        } else if (rand < 0.68) {
          px = reconCenter.x - 6.0 + (Math.random() - 0.5) * 1.5;
          py = Math.random() * 7.5;
          pz = reconCenter.z + (Math.random() - 0.5) * 24;
        } else {
          px = reconCenter.x + 6.0 + (Math.random() - 0.5) * 1.5;
          py = Math.random() * 7.5;
          pz = reconCenter.z + (Math.random() - 0.5) * 24;
        }

        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = pz;
      }
      return positions;
    };

    // Phase 1: Sparse Point Cloud Group
    const sparseCount = 500;
    const sparseGeom = new THREE.BufferGeometry();
    sparseGeom.setAttribute("position", new THREE.BufferAttribute(generatePointPositions(sparseCount), 3));
    const sparseMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.0
    });
    const sparsePoints = new THREE.Points(sparseGeom, sparseMat);
    reconGroup.add(sparsePoints);

    // Phase 2: Dense Point Cloud Group
    const denseCount = 5000;
    const denseGeom = new THREE.BufferGeometry();
    const densePositions = generatePointPositions(denseCount);
    denseGeom.setAttribute("position", new THREE.BufferAttribute(densePositions, 3));

    const denseColors = new Float32Array(denseCount * 3);
    const colorLow = new THREE.Color("#3B8BD4"); // Blue
    const colorMid = new THREE.Color("#999999"); // Gray
    const colorHigh = new THREE.Color("#FF6B35"); // Orange

    for (let i = 0; i < denseCount; i++) {
      const yVal = densePositions[i * 3 + 1];
      let colorTarget = colorMid;
      if (yVal < 1.2) {
        colorTarget = colorLow;
      } else if (yVal > 4.5) {
        colorTarget = colorHigh;
      }
      denseColors[i * 3] = colorTarget.r;
      denseColors[i * 3 + 1] = colorTarget.g;
      denseColors[i * 3 + 2] = colorTarget.b;
    }
    denseGeom.setAttribute("color", new THREE.BufferAttribute(denseColors, 3));

    const denseMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.0
    });
    const densePoints = new THREE.Points(denseGeom, denseMat);
    reconGroup.add(densePoints);

    // Phase 3: Mesh Geometry Group
    const meshGroup = new THREE.Group();
    reconGroup.add(meshGroup);

    const createMeshBuilding = (xOffset: number, widthVal: number, heightVal: number, depthVal: number) => {
      const geom = new THREE.BoxGeometry(widthVal, heightVal, depthVal);
      
      const faceMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geom, faceMat);
      mesh.position.set(xOffset, heightVal / 2, 0);

      const wireframeGeom = new THREE.WireframeGeometry(geom);
      const wireframeMat = new THREE.LineBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.0
      });
      const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
      mesh.add(wireframe);

      meshGroup.add(mesh);
      return { faceMat, wireframeMat };
    };

    const meshComponents = [
      createMeshBuilding(reconCenter.x - 6.0, 2.0, 6.5, 8.0),
      createMeshBuilding(reconCenter.x - 6.0, 2.0, 5.0, 8.0),
      createMeshBuilding(reconCenter.x + 6.0, 2.0, 6.0, 9.0),
      createMeshBuilding(reconCenter.x + 6.0, 2.0, 4.5, 9.0),
      createMeshBuilding(reconCenter.x, 10.0, 0.05, 24.0)
    ];

    meshGroup.children[0].position.z = -6.0;
    meshGroup.children[1].position.z = 6.0;
    meshGroup.children[2].position.z = -6.0;
    meshGroup.children[3].position.z = 6.0;

    reconGroup.visible = false;

    // 8. SCENE 4 — SEMANTIC INTELLIGENCE OVERLAYS Setup
    const semanticGroup = new THREE.Group();
    scene.add(semanticGroup);

    const curbLeftPoints = [
      new THREE.Vector3(reconCenter.x - 5.0, 0.08, -12),
      new THREE.Vector3(reconCenter.x - 5.0, 0.08, 12)
    ];
    const curbRightPoints = [
      new THREE.Vector3(reconCenter.x + 5.0, 0.08, -12),
      new THREE.Vector3(reconCenter.x + 5.0, 0.08, 12)
    ];

    const curbLeftGeom = new THREE.BufferGeometry().setFromPoints(curbLeftPoints);
    const curbRightGeom = new THREE.BufferGeometry().setFromPoints(curbRightPoints);
    
    const curbMat = new THREE.LineBasicMaterial({
      color: 0xe24b4a,
      transparent: true,
      opacity: 0.0,
      linewidth: 3
    });

    const curbLeftLine = new THREE.Line(curbLeftGeom, curbMat);
    const curbRightLine = new THREE.Line(curbRightGeom, curbMat);
    semanticGroup.add(curbLeftLine, curbRightLine);

    const lanePoints = [
      new THREE.Vector3(reconCenter.x, 0.06, -12),
      new THREE.Vector3(reconCenter.x, 0.06, 12)
    ];
    const laneGeom = new THREE.BufferGeometry().setFromPoints(lanePoints);
    const laneMat = new THREE.LineDashedMaterial({
      color: 0xef9f27,
      dashSize: 0.8,
      gapSize: 0.5,
      transparent: true,
      opacity: 0.0
    });
    const laneLine = new THREE.Line(laneGeom, laneMat);
    laneLine.computeLineDistances();
    semanticGroup.add(laneLine);

    const treeGroup = new THREE.Group();
    semanticGroup.add(treeGroup);

    const treeGeom = new THREE.CylinderGeometry(0.12, 0.6, 2.5, 8);
    const treeMat = new THREE.MeshBasicMaterial({
      color: 0x639922,
      transparent: true,
      opacity: 0.0
    });

    const addTree = (x: number, z: number) => {
      const tree = new THREE.Mesh(treeGeom, treeMat);
      tree.position.set(x, 1.25, z);
      treeGroup.add(tree);
    };

    addTree(reconCenter.x - 5.8, -8);
    addTree(reconCenter.x - 5.8, 4);
    addTree(reconCenter.x + 5.8, -4);
    addTree(reconCenter.x + 5.8, 8);

    const semanticBuildingGroup = new THREE.Group();
    semanticGroup.add(semanticBuildingGroup);

    const buildingSemanticMat = new THREE.MeshBasicMaterial({
      color: 0x5dcaa5,
      transparent: true,
      opacity: 0.0
    });

    const addSemanticBuildingBox = (x: number, ySize: number, z: number, w: number, d: number) => {
      const geom = new THREE.BoxGeometry(w + 0.1, ySize + 0.1, d + 0.1);
      const mesh = new THREE.Mesh(geom, buildingSemanticMat);
      mesh.position.set(x, ySize / 2, z);
      semanticBuildingGroup.add(mesh);
    };

    addSemanticBuildingBox(reconCenter.x - 6.0, 6.5, -6.0, 2.0, 8.0);
    addSemanticBuildingBox(reconCenter.x - 6.0, 5.0, 6.0, 2.0, 8.0);
    addSemanticBuildingBox(reconCenter.x + 6.0, 6.0, -6.0, 2.0, 9.0);
    addSemanticBuildingBox(reconCenter.x + 6.0, 4.5, 6.0, 2.0, 9.0);

    const poleGroup = new THREE.Group();
    semanticGroup.add(poleGroup);

    const poleGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.8, 6);
    const poleMat = new THREE.MeshBasicMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0.0
    });

    const addPole = (x: number, z: number) => {
      const pole = new THREE.Mesh(poleGeom, poleMat);
      pole.position.set(x, 1.9, z);
      poleGroup.add(pole);
    };

    addPole(reconCenter.x - 4.8, -10);
    addPole(reconCenter.x + 4.8, 10);

    const geoGrid = new THREE.GridHelper(26, 26, 0xffe8d6, 0xffe8d6);
    geoGrid.position.copy(reconCenter).setY(0.04);
    const geoGridMat = geoGrid.material as THREE.LineBasicMaterial;
    geoGridMat.transparent = true;
    geoGridMat.opacity = 0.0;
    semanticGroup.add(geoGrid);

    semanticGroup.visible = false;

    // 9. Animation Timeline Controller (Sequential Multi-Scene Engine)
    // 0.0s - 5.0s: Scene 1 (Drone Capture)
    // 5.0s - 6.0s: Zoom & Tilt Transition
    // 6.0s - 10.0s: Scene 2 (Raw Data Ingestion)
    // 10.0s - 15.0s: Scene 3 (3D Reconstruction)
    // 15.0s - 20.0s: Scene 4 (Semantic Intelligence)
    // 20.0s - 26.0s: Scene 5 (Multi-Product Split-Screen)
    // 26.0s - 31.0s: Scene 6 (Temporal Flywheel & Geographic Scale)
    let animationStart = performance.now();
    let animationFrameId: number;
    let localIsAutoplay = true;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle user click elapsed overrides
      if (elapsedOverrideRef.current !== null) {
        animationStart = time - elapsedOverrideRef.current;
        elapsedOverrideRef.current = null;
      }

      let elapsed = time - animationStart;
      const totalDuration = 31000; // Expanded to 31.0s total cycle duration

      // Handle Autoplay Loop Freeze
      if (!localIsAutoplay) {
        if (elapsed < 5000) {
          if (elapsed >= 4900) animationStart = time;
        } else if (elapsed >= 6000 && elapsed < 10000) {
          if (elapsed >= 9900) animationStart = time - 6000;
        } else if (elapsed >= 10000 && elapsed < 15000) {
          if (elapsed >= 14900) animationStart = time - 10000;
        } else if (elapsed >= 15000 && elapsed < 20000) {
          if (elapsed >= 19900) animationStart = time - 15000;
        } else if (elapsed >= 20000 && elapsed < 26000) {
          if (elapsed >= 25900) animationStart = time - 20000;
        } else if (elapsed >= 26000) {
          if (elapsed >= 30900) animationStart = time - 26000;
        }
        elapsed = time - animationStart;
      }

      // Autoplay global loop boundary reset
      if (localIsAutoplay && elapsed >= totalDuration) {
        animationStart = time;
        elapsed = 0;
        
        // Reset properties
        camera.zoom = 1.0;
        camera.position.set(0, 50, 0);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        // Reset trail points
        const positions = trailCoreLine.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < trailPointCount * 3; i += 3) {
          positions[i] = -999;
          positions[i + 2] = -999;
        }
        trailCoreLine.geometry.attributes.position.needsUpdate = true;
        glowLines.forEach((gl) => { gl.geometry.attributes.position.needsUpdate = true; });

        // Reset reconstruction states
        reconGroup.visible = false;
        sparseMat.opacity = 0;
        denseMat.opacity = 0;
        meshComponents.forEach((c) => {
          c.faceMat.opacity = 0;
          c.wireframeMat.opacity = 0;
        });

        // Reset semantic states
        semanticGroup.visible = false;
        curbMat.opacity = 0;
        laneMat.opacity = 0;
        treeMat.opacity = 0;
        buildingSemanticMat.opacity = 0;
        poleMat.opacity = 0;
        geoGridMat.opacity = 0;

        scene.background = new THREE.Color("#FFFFFF");
        mapMesh.visible = true;
        gridHelper.visible = true;
      }

      setElapsedTime(elapsed);

      // --- PHASE 1: SCENE 1 — DRONE CAPTURE (0.0s - 5.0s) ---
      if (elapsed < 5000) {
        setCurrentScene("capture");
        droneGroup.visible = true;
        radarGroup.visible = true;
        reconGroup.visible = false;
        semanticGroup.visible = false;

        mapMesh.visible = true;
        gridHelper.visible = true;
        scene.background = new THREE.Color("#FFFFFF");

        const progress = elapsed / 5000;
        const { pos, dir } = getPathState(progress);
        droneGroup.position.copy(pos);

        const targetRotationMat = new THREE.Matrix4().lookAt(
          new THREE.Vector3(0, 0, 0),
          dir,
          new THREE.Vector3(0, 1, 0)
        );
        const targetQuat = new THREE.Quaternion().setFromRotationMatrix(targetRotationMat);
        droneGroup.quaternion.slerp(targetQuat, 0.12);

        blades.forEach((b) => { b.rotation.y += 0.22; });

        radarGroup.position.copy(pos);
        const radarCycleTime = 1200;
        const radarProgress = (elapsed % radarCycleTime) / radarCycleTime;
        const radarScale = 0.1 + radarProgress * 2.2;
        radarGroup.scale.set(radarScale, radarScale, radarScale);
        
        const pulseOpacity = 0.55 + Math.sin(radarProgress * Math.PI * 2) * 0.25;
        radarRingMat.opacity = pulseOpacity;
        radarPulseMat.opacity = pulseOpacity * 0.2;

        const activePointsCount = Math.min(trailPointCount, Math.floor(progress * trailPointCount));
        const positions = trailCoreLine.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < activePointsCount; i++) {
          const ptProgress = i / trailPointCount;
          const { pos: ptPos } = getPathState(ptProgress);
          positions[i * 3] = ptPos.x;
          positions[i * 3 + 1] = ptPos.y;
          positions[i * 3 + 2] = ptPos.z;
        }
        for (let i = activePointsCount; i < trailPointCount; i++) {
          positions[i * 3] = pos.x;
          positions[i * 3 + 1] = pos.y;
          positions[i * 3 + 2] = pos.z;
        }
        trailCoreLine.geometry.attributes.position.needsUpdate = true;
        glowLines.forEach((gl) => { gl.geometry.attributes.position.needsUpdate = true; });

        camera.zoom = 1.0;
        camera.position.set(0, 50, 0);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        trailCoreMat.opacity = 1.0;
        glowLines.forEach((gl) => { (gl.material as THREE.LineBasicMaterial).opacity = 0.22; });
      }

      // --- PHASE 2: SCENE 1 TO SCENE 2 TRANSITION (5.0s - 6.0s) ---
      else if (elapsed >= 5000 && elapsed < 6000) {
        setCurrentScene("transition");

        const transProgress = (elapsed - 5000) / 1000;

        camera.zoom = 1.0 + transProgress * 1.5; 
        const targetCamY = 50 - transProgress * 15;
        const targetCamZ = 0 + transProgress * 35;
        camera.position.set(0.2, targetCamY, targetCamZ);
        camera.lookAt(0.2, 0.15, 0.1);
        camera.updateProjectionMatrix();

        droneGroup.position.copy(waypoints[2]);
        radarGroup.position.copy(waypoints[2]);

        const fadeOut = 1 - transProgress;
        radarRingMat.opacity = 0.5 * fadeOut;
        radarPulseMat.opacity = 0.05 * fadeOut;
        trailCoreMat.opacity = fadeOut;
        glowLines.forEach((gl) => {
          (gl.material as THREE.LineBasicMaterial).opacity = 0.22 * fadeOut;
        });
      }

      // --- PHASE 3: SCENE 2 — RAW DATA INGESTION (6.0s - 10.0s) ---
      else if (elapsed >= 6000 && elapsed < 10000) {
        setCurrentScene("ingestion");
        droneGroup.visible = false;
        radarGroup.visible = false;
        reconGroup.visible = false;
        semanticGroup.visible = false;

        mapMesh.visible = true;
        gridHelper.visible = true;
        scene.background = new THREE.Color("#FFFFFF");

        camera.zoom = 2.5;
        camera.position.set(0.2, 35, 35);
        camera.lookAt(0.2, 0.15, 0.1);
        camera.updateProjectionMatrix();

        trailCoreMat.opacity = 0;
        glowLines.forEach((gl) => {
          (gl.material as THREE.LineBasicMaterial).opacity = 0;
        });
      }

      // --- PHASE 4: SCENE 3 — 3D RECONSTRUCTION (10.0s - 15.0s) ---
      else if (elapsed >= 10000 && elapsed < 15000) {
        setCurrentScene("reconstruction");
        droneGroup.visible = false;
        radarGroup.visible = false;
        reconGroup.visible = true;
        semanticGroup.visible = false;

        mapMesh.visible = false;
        gridHelper.visible = false;
        scene.background = new THREE.Color("#F5F5F5");

        const reconElapsed = elapsed - 10000;
        const progress = reconElapsed / 5000;

        const orbitRadius = 18;
        const theta = progress * Math.PI * 2;
        camera.zoom = 2.2;
        camera.position.set(
          reconCenter.x + Math.sin(theta) * orbitRadius,
          reconCenter.y + 11.5,
          reconCenter.z + Math.cos(theta) * orbitRadius
        );
        camera.lookAt(reconCenter.x, reconCenter.y + 1.5, reconCenter.z);
        camera.updateProjectionMatrix();

        if (reconElapsed < 1500) {
          sparsePoints.visible = true;
          densePoints.visible = false;
          meshGroup.visible = false;

          const sparseProgress = Math.min(1.0, reconElapsed / 600);
          sparseMat.opacity = sparseProgress;
        }
        else if (reconElapsed >= 1500 && reconElapsed < 2800) {
          sparsePoints.visible = true;
          densePoints.visible = true;
          meshGroup.visible = false;

          const crossProgress = (reconElapsed - 1500) / 500;
          sparseMat.opacity = Math.max(0.0, 1.0 - crossProgress);
          denseMat.opacity = Math.min(1.0, crossProgress);
        }
        else if (reconElapsed >= 2800) {
          sparsePoints.visible = false;
          densePoints.visible = true;
          meshGroup.visible = true;

          denseMat.opacity = 0.55;

          const meshProgress = Math.min(1.0, (reconElapsed - 2800) / 700);
          meshComponents.forEach((c) => {
            c.faceMat.opacity = meshProgress * 0.3;
            c.wireframeMat.opacity = meshProgress * 0.6;
          });
        }

        reconGrid.material.opacity = 0.12;
      }

      // --- PHASE 5: SCENE 4 — SEMANTIC INTELLIGENCE (15.0s - 20.0s) ---
      else if (elapsed >= 15000 && elapsed < 20000) {
        setCurrentScene("semantic");
        droneGroup.visible = false;
        radarGroup.visible = false;
        
        reconGroup.visible = true;
        sparsePoints.visible = false;
        densePoints.visible = true;
        denseMat.opacity = 0.4;
        meshGroup.visible = true;
        meshComponents.forEach((c) => {
          c.faceMat.opacity = 0.25;
          c.wireframeMat.opacity = 0.45;
        });

        semanticGroup.visible = true;
        reconGrid.material.opacity = 0.12;

        mapMesh.visible = false;
        gridHelper.visible = false;
        scene.background = new THREE.Color("#F5F5F5");

        const semanticElapsed = elapsed - 15000;
        const progress = (elapsed - 10000) / 10000;

        const orbitRadius = 18;
        const theta = progress * Math.PI * 2;
        camera.zoom = 2.2;
        camera.position.set(
          reconCenter.x + Math.sin(theta) * orbitRadius,
          reconCenter.y + 11.5,
          reconCenter.z + Math.cos(theta) * orbitRadius
        );
        camera.lookAt(reconCenter.x, reconCenter.y + 1.5, reconCenter.z);
        camera.updateProjectionMatrix();

        const getFadeProgress = (delay: number) => {
          if (semanticElapsed < delay) return 0.0;
          return Math.min(1.0, (semanticElapsed - delay) / 800);
        };

        curbMat.opacity = getFadeProgress(500) * 0.7;
        laneMat.opacity = getFadeProgress(1100);
        treeMat.opacity = getFadeProgress(1700) * 0.5;
        buildingSemanticMat.opacity = getFadeProgress(2300) * 0.3;
        poleMat.opacity = getFadeProgress(2900) * 0.7;
        geoGridMat.opacity = getFadeProgress(3500) * 0.5;
      }

      // --- PHASE 6: SCENE 5 — MULTI-PRODUCT SPLIT-SCREEN (20.0s - 26.0s) ---
      else if (elapsed >= 20000 && elapsed < 26000) {
        setCurrentScene("product");
        droneGroup.visible = false;
        radarGroup.visible = false;
        reconGroup.visible = false;
        semanticGroup.visible = false;

        mapMesh.visible = false;
        gridHelper.visible = false;
        scene.background = new THREE.Color("#F5F5F5");

        renderer.clear();
      }

      // --- PHASE 7: SCENE 6 — TEMPORAL FLYWHEEL & GEOGRAPHIC SCALE (26.0s - 31.0s) ---
      else if (elapsed >= 26000) {
        setCurrentScene("temporal");
        droneGroup.visible = false;
        radarGroup.visible = false;
        reconGroup.visible = false;
        semanticGroup.visible = false;

        mapMesh.visible = false;
        gridHelper.visible = false;
        scene.background = new THREE.Color("#F5F5F5");

        renderer.clear();
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const syncAutoplay = () => {
      localIsAutoplay = isAutoplay;
    };
    syncAutoplay();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      
      const newAspect = w / h;
      camera.left = -baseViewSize * newAspect;
      camera.right = baseViewSize * newAspect;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      container.removeChild(renderer.domElement);
      
      // Cleanup WebGL resources
      mapGeom.dispose();
      mapMat.dispose();
      gridHelper.geometry.dispose();
      bodyGeom.dispose();
      bodyMat.dispose();
      armGeom.dispose();
      armMat.dispose();
      rotorBladeGeom.dispose();
      rotorBladeMat.dispose();
      arrowGeom.dispose();
      arrowMat.dispose();
      radarPulseGeom.dispose();
      radarPulseMat.dispose();
      radarRingGeom.dispose();
      radarRingMat.dispose();
      trailGeom.dispose();
      trailCoreMat.dispose();
      glowLines.forEach((gl) => (gl.material as THREE.LineBasicMaterial).dispose());
      
      // Scene 3 resources
      reconGrid.geometry.dispose();
      sparseGeom.dispose();
      sparseMat.dispose();
      denseGeom.dispose();
      denseMat.dispose();
      geomListCleanup();

      // Scene 4 resources
      curbLeftGeom.dispose();
      curbRightGeom.dispose();
      curbMat.dispose();
      laneGeom.dispose();
      laneMat.dispose();
      treeGeom.dispose();
      treeMat.dispose();
      buildingSemanticMat.dispose();
      poleGeom.dispose();
      poleMat.dispose();
      geoGrid.geometry.dispose();

      renderer.dispose();
    };

    function geomListCleanup() {
      meshGroup.children.forEach((c) => {
        const mesh = c as THREE.Mesh;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        mesh.children.forEach((w) => {
          const ls = w as THREE.LineSegments;
          ls.geometry.dispose();
          (ls.material as THREE.Material).dispose();
        });
      });
    }
  }, [isMounted, isAutoplay]);

  // Derived progress values for Ingestion, Reconstruction, Semantic, Product & Temporal HUDs
  const ingestionElapsed = elapsedTime - 6000; 
  const reconElapsed = elapsedTime - 10000;
  const semanticElapsed = elapsedTime - 15000;
  const productElapsed = elapsedTime - 20000;
  const temporalElapsed = elapsedTime - 26000;

  // Active scene mapping for header highlight
  let activeTabNum = 1;
  if (currentScene === "ingestion" || currentScene === "transition") {
    activeTabNum = 2;
  } else if (currentScene === "reconstruction") {
    activeTabNum = 3;
  } else if (currentScene === "semantic") {
    activeTabNum = 4;
  } else if (currentScene === "product") {
    activeTabNum = 5;
  } else if (currentScene === "temporal") {
    activeTabNum = 6;
  }

  const handleSceneSelect = (sceneNum: number) => {
    setIsAutoplay(false);
    if (sceneNum === 1) elapsedOverrideRef.current = 100;    // Scene 1 In
    if (sceneNum === 2) elapsedOverrideRef.current = 6100;   // Scene 2 In
    if (sceneNum === 3) elapsedOverrideRef.current = 10100;  // Scene 3 In
    if (sceneNum === 4) elapsedOverrideRef.current = 15100;  // Scene 4 In
    if (sceneNum === 5) elapsedOverrideRef.current = 20100;  // Scene 5 In
    if (sceneNum === 6) elapsedOverrideRef.current = 26100;  // Scene 6 In
  };

  const toggleAutoplay = () => {
    setIsAutoplay((v) => !v);
  };

  if (!isMounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white font-mono text-xs text-[#2C2C2A]">
        Initializing Spatial Simulation Canvas...
      </div>
    );
  }

  const showText = elapsedTime >= 500 && elapsedTime < 5000;

  // Exit fades
  const exitFadeS5 = productElapsed >= 5500 ? 1.0 - (productElapsed - 5500) / 500 : 1.0;
  const exitFadeS6 = temporalElapsed >= 4500 ? 1.0 - (temporalElapsed - 4500) / 500 : 1.0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white select-none">
      
      {/* --- ARCHITECTURAL HEADER CONTROL PANEL --- */}
      <header className="absolute top-0 inset-x-0 z-50 border-b border-line bg-white/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto max-w-[76rem] px-10 py-3.5 flex items-center justify-between gap-6">
          
          {/* Logo & Led Status */}
          <div className="flex items-baseline gap-2.5 no-underline whitespace-nowrap">
            <span className="font-serif text-[1.28rem] font-semibold tracking-tight text-ink">
              Earthos Lab
            </span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted border-l border-line-strong pl-2 py-0.5 ml-1">
              SIMULATION OS
            </span>
            <span className="flex items-center gap-1.5 border-l border-line-strong pl-2.5 py-0.5 ml-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span className="font-mono text-[0.55rem] uppercase tracking-wider font-semibold text-muted">
                SANDBOX: LIVE
              </span>
            </span>
          </div>

          {/* Interactive Scene Navigation Links */}
          <nav aria-label="Simulation" className="hidden lg:flex">
            <ul className="flex items-center gap-8 list-none m-0 p-0">
              
              {/* Tab 1: Capture */}
              <li>
                <button
                  onClick={() => handleSceneSelect(1)}
                  className={`flex items-baseline font-mono text-[0.74rem] no-underline transition-colors cursor-pointer ${
                    activeTabNum === 1 ? "text-accent-deep font-bold" : "text-body-text hover:text-accent-deep"
                  }`}
                >
                  <span className="text-faint text-[0.66rem] mr-1.5">01</span>
                  Drone Capture
                </button>
              </li>

              {/* Tab 2: Ingestion */}
              <li>
                <button
                  onClick={() => handleSceneSelect(2)}
                  className={`flex items-baseline font-mono text-[0.74rem] no-underline transition-colors cursor-pointer ${
                    activeTabNum === 2 ? "text-accent-deep font-bold" : "text-body-text hover:text-accent-deep"
                  }`}
                >
                  <span className="text-faint text-[0.66rem] mr-1.5">02</span>
                  Raw Ingestion
                </button>
              </li>

              {/* Tab 3: Reconstruction */}
              <li>
                <button
                  onClick={() => handleSceneSelect(3)}
                  className={`flex items-baseline font-mono text-[0.74rem] no-underline transition-colors cursor-pointer ${
                    activeTabNum === 3 ? "text-accent-deep font-bold" : "text-body-text hover:text-accent-deep"
                  }`}
                >
                  <span className="text-faint text-[0.66rem] mr-1.5">03</span>
                  3D Reconstruction
                </button>
              </li>

              {/* Tab 4: Semantic Intelligence */}
              <li>
                <button
                  onClick={() => handleSceneSelect(4)}
                  className={`flex items-baseline font-mono text-[0.74rem] no-underline transition-colors cursor-pointer ${
                    activeTabNum === 4 ? "text-accent-deep font-bold" : "text-body-text hover:text-accent-deep"
                  }`}
                >
                  <span className="text-faint text-[0.66rem] mr-1.5">04</span>
                  Semantic Intelligence
                </button>
              </li>

              {/* Tab 5: Multi-Product Split */}
              <li>
                <button
                  onClick={() => handleSceneSelect(5)}
                  className={`flex items-baseline font-mono text-[0.74rem] no-underline transition-colors cursor-pointer ${
                    activeTabNum === 5 ? "text-accent-deep font-bold" : "text-body-text hover:text-accent-deep"
                  }`}
                >
                  <span className="text-faint text-[0.66rem] mr-1.5">05</span>
                  Product Split
                </button>
              </li>

              {/* Tab 6: Temporal Flywheel */}
              <li>
                <button
                  onClick={() => handleSceneSelect(6)}
                  className={`flex items-baseline font-mono text-[0.74rem] no-underline transition-colors cursor-pointer ${
                    activeTabNum === 6 ? "text-accent-deep font-bold" : "text-body-text hover:text-accent-deep"
                  }`}
                >
                  <span className="text-faint text-[0.66rem] mr-1.5">06</span>
                  Temporal Flywheel
                </button>
              </li>

            </ul>
          </nav>

          {/* Autoplay toggle and Return Home Link */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAutoplay}
              className="flex items-center gap-2 border border-line-strong rounded px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted hover:border-accent-deep hover:text-accent-deep transition-colors cursor-pointer"
            >
              {isAutoplay ? (
                <>
                  <Pause className="w-3 h-3 text-accent shrink-0" />
                  Autoplay: ON
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-muted shrink-0" />
                  Autoplay: OFF
                </>
              )}
            </button>

            <Link
              href="/"
              className="btn btn-solid !py-2 hidden sm:inline-flex cursor-pointer text-xs"
            >
              Return Home
            </Link>
          </div>

        </div>
      </header>

      {/* 2. WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full pt-16" />

      {/* --- SCENE 1 OVERLAY (Drone Capture Overlay) --- */}
      <div
        className={`absolute bottom-8 left-8 z-40 flex flex-col font-mono text-sm tracking-wide text-[#2C2C2A] transition-opacity duration-500 ease-in-out pointer-events-none ${
          showText && currentScene === "capture" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
          <span className="font-bold">Stage 0</span>
        </div>
        <span className="text-[14px]">Continuous Spatial Data Capture</span>
      </div>

      {/* --- SCENE 2 OVERLAY (Raw Data Ingestion Overlay) --- */}
      {currentScene === "ingestion" && (
        <div className="absolute inset-0 z-40 flex flex-col pointer-events-none p-10 pt-24 select-none">
          <div className="flex-1 w-full flex items-center justify-between py-12 relative">
            
            {/* Left Column: Stacked File Cards */}
            <div className="flex flex-col gap-3 pointer-events-auto">
              <span className="font-mono text-[14px] text-[#666666] tracking-wide mb-1">
                DRONE_01 — 3 FILES
              </span>

              <div
                className={`w-[240px] h-[48px] bg-white border border-[#E0E0E0] rounded p-3.5 flex items-center justify-between shadow-sm transition-all duration-600 ease-out transform ${
                  ingestionElapsed >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
                }`}
              >
                <span className="font-mono text-[11px] font-semibold text-[#2C2C2A]">
                  RAW_0047.INSV
                </span>
                <span className="font-mono text-[10px] text-[#FF6B35] font-bold">
                  4.2 GB
                </span>
              </div>

              <div
                className={`w-[240px] h-[48px] bg-white border border-[#E0E0E0] rounded p-3.5 flex items-center justify-between shadow-sm transition-all duration-600 ease-out transform ${
                  ingestionElapsed >= 300 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
                }`}
              >
                <span className="font-mono text-[11px] font-semibold text-[#2C2C2A]">
                  RAW_0048.INSV
                </span>
                <span className="font-mono text-[10px] text-[#FF6B35] font-bold">
                  4.1 GB
                </span>
              </div>

              <div
                className={`w-[240px] h-[48px] bg-white border border-[#E0E0E0] rounded p-3.5 flex items-center justify-between shadow-sm transition-all duration-600 ease-out transform ${
                  ingestionElapsed >= 600 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
                }`}
              >
                <span className="font-mono text-[11px] font-semibold text-[#2C2C2A]">
                  RAW_0049.INSV
                </span>
                <span className="font-mono text-[10px] text-[#FF6B35] font-bold">
                  4.3 GB
                </span>
              </div>
            </div>

            {/* Center: Street-Level Video Frame Overlay */}
            <div
              className={`w-[400px] h-[300px] rounded border border-[#E0E0E0] overflow-hidden bg-white/95 shadow-lg transition-all duration-800 ease-out transform ${
                ingestionElapsed >= 1000 ? "opacity-90 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="w-full bg-[#FAFAFA] border-b border-[#E0E0E0] px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] text-[#666666]">
                <span>CAM_360_STREAM</span>
                <span className="text-[#FF6B35]">LIVE RECORDING</span>
              </div>
              <div className="relative w-full h-[calc(100%-35px)]">
                <img
                  src="/street_view.png"
                  alt="Street-level raw capture"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-[#FF6B35]/5 pointer-events-none animate-pulse" />
              </div>
            </div>

            {/* Right Column: Ingestion Pipeline Panel */}
            <div className="pointer-events-auto">
              <div
                className={`w-[320px] h-[200px] bg-[#FFF5ED] border-2 border-dashed border-[#FF6B35] rounded p-5 flex flex-col justify-between shadow-sm relative transition-all duration-700 ease-out transform ${
                  ingestionElapsed >= 400 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
              >
                <div className="w-full flex items-center justify-between font-mono text-[10px] text-[#2C2C2A] font-bold border-b border-[#FFE8D6] pb-2">
                  <span>EARTHOS LAB PIPELINE</span>
                  <span className="text-[#FF6B35]">READY</span>
                </div>

                <div className="flex-1 flex items-center justify-center border border-dashed border-[#FFE8D6] rounded bg-[#FFF5ED]/50 my-3 font-mono text-[11px] text-[#999999]">
                  DROP RAW FOOTAGE HERE
                </div>

                <div className="w-full flex justify-end">
                  <button className="bg-[#FFF5ED] border border-[#FF6B35] px-3.5 py-1.5 rounded font-mono text-[11px] text-[#FF6B35] font-bold hover:bg-[#FFE8D6] transition-colors cursor-pointer">
                    Upload
                  </button>
                </div>
                
                <div
                  className={`absolute inset-0 bg-[#FF6B35]/5 rounded transition-opacity duration-300 pointer-events-none ${
                    ingestionElapsed >= 2500 ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>

          </div>

          {/* SVG Particle Ingestion Stream */}
          {ingestionElapsed >= 2000 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
              <defs>
                <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 230 260 Q 420 220 540 260 T 930 260"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth="4"
                strokeDasharray="12, 18"
                className="animate-flow-stream"
              />
              <path
                d="M 230 320 Q 420 250 540 290 T 930 270"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth="4"
                strokeDasharray="12, 18"
                className="animate-flow-stream-delayed"
              />
              <path
                d="M 230 380 Q 420 280 540 320 T 930 280"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth="4"
                strokeDasharray="12, 18"
                className="animate-flow-stream"
              />
            </svg>
          )}

          {/* Bottom Info bar */}
          <div className="w-full flex items-center justify-between border-t border-line pt-4 shrink-0 font-mono text-[11px] text-[#2C2C2A] tracking-wide animate-fade-in-up">
            <span>Stage 1: Raw Data Ingestion Phase</span>
            <span className="text-[#FF6B35]">FLOW: ACTIVE (12.6 GB/s)</span>
          </div>

        </div>
      )}

      {/* --- SCENE 3 OVERLAY (3D Reconstruction Overlay) --- */}
      {currentScene === "reconstruction" && (
        <div className="absolute inset-0 z-40 flex flex-col pointer-events-none p-10 pt-24 select-none">
          <div
            className={`absolute top-24 left-1/2 transform -translate-x-1/2 font-sans text-[16px] font-bold text-[#2C2C2A] tracking-tight transition-opacity duration-500 z-50 ${
              reconElapsed >= 500 ? "opacity-100" : "opacity-0"
            }`}
          >
            Reconstruction: Raw Pixels → 3D Geometry
          </div>

          <div className="flex-1 w-full flex justify-between items-center relative py-12">
            
            {/* Dimmed Left Panel */}
            <div className="opacity-35 pointer-events-none scale-95 origin-left transition-opacity duration-1000">
              <div className="w-[280px] h-[175px] bg-[#FFF5ED] border border-dashed border-[#FF6B35] rounded p-4 flex flex-col justify-between shadow-sm">
                <div className="w-full flex items-center justify-between font-mono text-[9px] text-[#2C2C2A] font-bold">
                  <span>EARTHOS LAB PIPELINE</span>
                  <span className="text-[#FF6B35]">STABLE</span>
                </div>
                <div className="flex-1 flex items-center justify-center border border-dashed border-[#FFE8D6] rounded my-2 font-mono text-[10px] text-[#999999]">
                  RAW FOOTAGE QUEUED
                </div>
              </div>
            </div>

            {/* Right side Stage completes tracker */}
            <div className="flex flex-col gap-4 font-mono text-[12px] text-[#666666] tracking-wide pr-10 text-right">
              <div
                className={`transition-opacity duration-400 ${
                  reconElapsed >= 500 && reconElapsed < 1500 ? "opacity-100 font-bold text-[#2C2C2A]" : "opacity-35"
                }`}
              >
                Sparse cloud • {reconElapsed >= 1500 ? "Done" : "Active"}
              </div>

              <div
                className={`transition-opacity duration-400 ${
                  reconElapsed >= 1500 && reconElapsed < 2800 ? "opacity-100 font-bold text-[#2C2C2A]" : "opacity-35"
                }`}
              >
                Dense cloud • {reconElapsed >= 2800 ? "Done" : reconElapsed >= 1500 ? "Active" : "Queued"}
              </div>

              <div
                className={`transition-opacity duration-400 ${
                  reconElapsed >= 2800 ? "opacity-100 font-bold text-[#FF6B35]" : "opacity-35"
                }`}
              >
                Mesh generation • {reconElapsed >= 2800 ? "Rendering" : "Queued"}
              </div>
            </div>

          </div>

          {/* Bottom-left Progress bar */}
          <div className="absolute bottom-10 left-10 flex flex-col gap-2 font-mono z-50">
            <span
              className={`text-[12px] text-[#999999] transition-opacity duration-500 ${
                reconElapsed >= 500 ? "opacity-100" : "opacity-0"
              }`}
            >
              Processing • {Math.min(100, Math.floor(progressPercent(reconElapsed)))}%
            </span>
            <div className="w-[200px] h-[3px] bg-[#CCCCCC]/30 rounded overflow-hidden relative">
              <div
                className="h-full bg-[#FF6B35] rounded transition-all duration-100 ease-out"
                style={{ width: `${progressPercent(reconElapsed)}%` }}
              />
            </div>
          </div>

        </div>
      )}

      {/* --- SCENE 4 OVERLAY (Semantic Intelligence Overlay) --- */}
      {currentScene === "semantic" && (
        <div className="absolute inset-0 z-40 flex flex-col pointer-events-none p-10 pt-24 select-none">
          <div
            className={`absolute top-24 left-1/2 transform -translate-x-1/2 font-sans text-[16px] font-bold text-[#2C2C2A] tracking-tight transition-opacity duration-500 z-50 ${
              semanticElapsed >= 300 ? "opacity-100" : "opacity-0"
            }`}
          >
            Semantic Atlas: Machine-Readable World
          </div>

          <div className="flex-1 w-full flex justify-end items-center relative py-12">
            
            {/* Right Floating Labels */}
            <div className="flex flex-col gap-4 font-mono text-[12px] tracking-wide pr-10 text-right select-none">
              
              <div
                className={`flex items-center justify-end gap-2.5 transition-all duration-500 transform ${
                  semanticElapsed >= 500 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ color: "#E24B4A" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#E24B4A]" />
                <span className="font-bold">Curbs</span>
              </div>

              <div
                className={`flex items-center justify-end gap-2.5 transition-all duration-500 transform ${
                  semanticElapsed >= 1100 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ color: "#EF9F27" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#EF9F27]" />
                <span className="font-bold">Lane markings</span>
              </div>

              <div
                className={`flex items-center justify-end gap-2.5 transition-all duration-500 transform ${
                  semanticElapsed >= 1700 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ color: "#639922" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#639922]" />
                <span className="font-bold">Trees</span>
              </div>

              <div
                className={`flex items-center justify-end gap-2.5 transition-all duration-500 transform ${
                  semanticElapsed >= 2300 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ color: "#5DCAA5" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#5DCAA5]" />
                <span className="font-bold">Buildings</span>
              </div>

              <div
                className={`flex items-center justify-end gap-2.5 transition-all duration-500 transform ${
                  semanticElapsed >= 2900 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ color: "#999999" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#999999]" />
                <span className="font-bold">Street furniture</span>
              </div>

              <div
                className={`flex items-center justify-end gap-2.5 transition-all duration-500 transform ${
                  semanticElapsed >= 3500 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ color: "#FF6B35" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                <span className="font-bold">Georeferencing</span>
              </div>

            </div>

          </div>

          {/* Bottom Info bar */}
          <div className="w-full flex items-center justify-between border-t border-line pt-4 shrink-0 font-mono text-[11px] text-[#2C2C2A] tracking-wide animate-fade-in-up">
            <span>Stage 2: Semantic Intelligence Extraction</span>
            <span className="text-[#FF6B35] animate-pulse">CLASSIFIER: ACTIVE</span>
          </div>

        </div>
      )}

      {/* --- SCENE 5 OVERLAY (Multi-Product Split-Screen Overlay) --- */}
      {currentScene === "product" && (
        <div 
          className="absolute inset-0 z-40 flex flex-col justify-between p-10 pt-24 select-none bg-[#F5F5F5] transition-opacity duration-500"
          style={{ opacity: exitFadeS5 }}
        >
          
          {/* Top-Center Text Overlay */}
          <div
            className={`text-center font-sans text-[18px] font-bold text-[#2C2C2A] tracking-tight transition-all duration-700 transform ${
              productElapsed >= 300 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            }`}
          >
            One Capture. Three Revenue Streams. Infinite Scale.
          </div>

          <div className="flex-1 w-full flex items-center justify-center gap-6 max-w-[76rem] mx-auto py-4 relative">
            
            {/* LEFT PANEL */}
            <div
              className={`w-[360px] h-[300px] bg-white border border-[#E0E0E0] rounded-lg p-5 flex flex-col justify-between shadow-sm transition-all duration-1000 transform ${
                productElapsed >= 500 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="border-b border-[#F0F0F0] pb-2">
                <h4 className="font-sans text-[14px] font-bold text-[#2C2C2A] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#FF6B35]" />
                  WorldRing Streets
                </h4>
                <p className="font-mono text-[11px] text-[#666666] uppercase tracking-wider">B2C Route Preview</p>
              </div>

              <div className="flex-1 mt-3 bg-[#F9F9F9] border border-[#EBEBEB] rounded p-2.5 flex flex-col justify-between relative overflow-hidden">
                <div className="font-mono text-[9px] text-[#999999] flex justify-between items-center">
                  <span>GPS Connected</span>
                  <span className="text-[#FF6B35] font-bold">120m</span>
                </div>
                
                <div className="flex-1 my-2 flex items-center justify-center relative bg-white border border-[#EBEBEB] rounded overflow-hidden">
                  <img src="/street_view.png" alt="mock navigation map view" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                  <svg className="absolute inset-0 w-full h-full">
                    <path d="M 30 110 Q 140 30 250 90" fill="none" stroke="#3B8BD4" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="250" cy="90" r="5" fill="#3B8BD4" />
                  </svg>
                  <span className="absolute bottom-2 left-2.5 font-mono text-[9px] text-[#2C2C2A] bg-white/90 border border-[#DDD] px-1.5 py-0.5 rounded font-semibold">
                    Route preview
                  </span>
                </div>

                <button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-mono text-[10px] font-bold py-2 rounded text-center transition-colors cursor-pointer">
                  Start Navigation
                </button>
              </div>
            </div>

            {/* CENTER PANEL */}
            <div
              className={`w-[360px] h-[300px] bg-white border border-[#E0E0E0] rounded-lg p-5 flex flex-col justify-between shadow-sm transition-all duration-1000 transform ${
                productElapsed >= 500 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="border-b border-[#F0F0F0] pb-2">
                <h4 className="font-sans text-[14px] font-bold text-[#2C2C2A] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#FF6B35]" />
                  WorldRing Places
                </h4>
                <p className="font-mono text-[11px] text-[#666666] uppercase tracking-wider">B2B Business Widget</p>
              </div>

              <div className="flex-1 mt-3 bg-[#F9F9F9] border border-[#EBEBEB] rounded p-3 flex flex-col justify-between">
                <div className="w-full h-[85px] bg-[#EAEAEA] border border-[#E0E0E0] rounded relative overflow-hidden flex items-center justify-center">
                  <img src="/map.jpg" alt="mock mapping storefront background" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  <div className="absolute top-2 left-2 bg-[#FF6B35] text-white font-mono text-[8px] px-1 rounded uppercase tracking-wider">Featured Store</div>
                  <Box className="w-6 h-6 text-[#999999]/65" />
                </div>

                <div className="my-2.5">
                  <div className="font-sans text-[12px] font-bold text-[#FF6B35] tracking-tight">
                    KHADI & CHAIR CO.
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#999999] mt-0.5">
                    <span>Open now • 12.3 km away</span>
                    <span className="text-[#FF6B35]">★★★★★</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 bg-white border border-[#E0E0E0] text-[#2C2C2A] font-mono text-[9px] py-1.5 rounded text-center hover:border-[#666] transition-colors cursor-pointer">
                    View 3D Splat
                  </button>
                  <button className="flex-1 bg-[#2C2C2A] text-white font-mono text-[9px] py-1.5 rounded text-center hover:bg-black transition-colors cursor-pointer">
                    Book Visit
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div
              className={`w-[360px] h-[300px] bg-white border border-[#E0E0E0] rounded-lg p-5 flex flex-col justify-between shadow-sm transition-all duration-1000 transform ${
                productElapsed >= 500 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="border-b border-[#F0F0F0] pb-2">
                <h4 className="font-sans text-[14px] font-bold text-[#2C2C2A] flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-[#FF6B35]" />
                  WorldRing Intelligence
                </h4>
                <p className="font-mono text-[11px] text-[#666666] uppercase tracking-wider">Enterprise API & Data</p>
              </div>

              <div className="flex-1 mt-3 bg-[#1B1712] rounded p-3 flex flex-col justify-between text-white font-mono">
                <div className="flex justify-between items-center text-[8px] text-[#999] border-b border-[#2C251F] pb-1.5">
                  <span>API SUITE v2.8</span>
                  <span className="text-[#FF6B35]">CONNECTED</span>
                </div>

                <div className="flex-1 my-2 flex items-center justify-center gap-1.5 relative">
                  <div className="flex flex-col gap-1">
                    <div className="w-9 h-3.5 bg-[#FF6B35]/40 border border-[#FF6B35] transform skew-x-12 rounded-sm" />
                    <div className="w-9 h-3.5 bg-[#FF6B35]/15 border border-[#FF6B35]/40 transform skew-x-12 rounded-sm animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-9 h-3.5 bg-[#FF6B35]/25 border border-[#FF6B35]/60 transform skew-x-12 rounded-sm" />
                    <div className="w-9 h-3.5 bg-[#FF6B35]/60 border border-[#FF6B35] transform skew-x-12 rounded-sm" />
                  </div>
                  <div className="absolute bottom-1 right-1 text-[8px] text-[#5DCAA5]">TLS SECURE</div>
                </div>

                <div className="bg-[#2C251F] p-2 rounded flex items-center justify-between">
                  <span className="text-[9px] text-[#FFE8D6]">GET /v2/3d-tiles/sector37</span>
                  <span className="text-[9px] text-[#5DCAA5]">200 OK</span>
                </div>
              </div>
            </div>

            {/* Connecting lines */}
            {productElapsed >= 1500 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <linearGradient id="glowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path d="M 540 280 Q 360 270 200 230" fill="none" stroke="url(#glowGrad)" strokeWidth="2.5" strokeDasharray="6, 8" className="animate-flow-stream" />
                <path d="M 540 280 Q 540 230 540 180" fill="none" stroke="url(#glowGrad)" strokeWidth="2.5" strokeDasharray="6, 8" className="animate-flow-stream" />
                <path d="M 540 280 Q 720 270 880 230" fill="none" stroke="url(#glowGrad)" strokeWidth="2.5" strokeDasharray="6, 8" className="animate-flow-stream-delayed" />
              </svg>
            )}

            <div
              className={`absolute top-2/3 left-[28%] font-mono text-[11px] text-[#666666] tracking-wide transition-opacity duration-700 pointer-events-none ${
                productElapsed >= 1500 ? "opacity-100 animate-fade-in-up" : "opacity-0"
              }`}
            >
              Consumer
            </div>
            
            <div
              className={`absolute top-2/3 right-[28%] font-mono text-[11px] text-[#666666] tracking-wide transition-opacity duration-700 pointer-events-none ${
                productElapsed >= 1500 ? "opacity-100 animate-fade-in-up" : "opacity-0"
              }`}
            >
              Enterprise
            </div>

          </div>

          <div className="h-[120px] w-full flex flex-col justify-center items-center relative overflow-visible select-none shrink-0 mb-4">
            <div
              className={`absolute w-[220px] h-[220px] rounded-full transition-all duration-[2000ms] pointer-events-none ease-in-out transform ${
                productElapsed >= 200 ? "scale-100 opacity-80" : "scale-50 opacity-0"
              }`}
              style={{
                background: "radial-gradient(circle, rgba(255,107,53,0.3) 0%, rgba(255,107,53,0.06) 45%, transparent 70%)"
              }}
            />
            <div
              className={`absolute w-3.5 h-3.5 bg-[#FF6B35] rounded-full shadow-lg transition-opacity duration-500 ${
                productElapsed >= 500 ? "opacity-100 animate-pulse" : "opacity-0"
              }`}
            />
            
            <span
              className={`font-sans text-[14px] font-bold text-[#FF6B35] uppercase tracking-widest mt-12 transition-all duration-700 transform ${
                productElapsed >= 2000 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              WorldRing Atlas
            </span>
          </div>

          {/* Bottom Info bar */}
          <div className="w-full flex items-center justify-between border-t border-line pt-4 shrink-0 font-mono text-[11px] text-[#2C2C2A] tracking-wide select-none">
            <span>Stage 3: Downstream Multi-Product Pipeline</span>
            <span className="text-[#FF6B35]">REVENUE STREAMS: 3 ACTIVE</span>
          </div>

        </div>
      )}

      {/* --- SCENE 6 OVERLAY (Temporal Flywheel & Geographic Scale Overlay) --- */}
      {currentScene === "temporal" && (
        <div 
          className="absolute inset-0 z-40 flex flex-col justify-between p-10 pt-24 select-none bg-[#F5F5F5] transition-opacity duration-500"
          style={{ opacity: exitFadeS6 }}
        >
          {/* Top-Center Text Header */}
          <div
            className={`text-center font-sans text-[18px] font-bold text-[#2C2C2A] tracking-tight transition-all duration-700 transform ${
              temporalElapsed >= 300 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            }`}
          >
            Your Moat: Accumulated Spatial History
          </div>

          <div className="flex-1 w-full flex items-stretch max-w-[76rem] mx-auto py-6 gap-10">
            
            {/* LEFT SIDE: Temporal Dimension & Flywheel (40% width) */}
            <div className="w-[42%] flex flex-col justify-between gap-6 border-r border-[#E0E0E0] pr-10">
              
              {/* Version Timeline cards */}
              <div className="flex flex-col gap-4 relative">
                
                {/* v1.0 Card */}
                <div
                  className={`bg-white border border-[#E0E0E0] rounded p-3 flex items-center justify-between shadow-xs transition-all duration-700 transform ${
                    temporalElapsed >= 500 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#FFE8D6] flex items-center justify-center font-mono text-[11px] text-[#FF6B35] font-bold">1.0</div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[12px] font-bold text-[#2C2C2A]">v1.0 Capture</span>
                      <span className="font-sans text-[10px] text-[#999999]">Day 1 • Sector 37 Base</span>
                    </div>
                  </div>
                  <div className="w-12 h-8 rounded border border-[#E0E0E0] overflow-hidden bg-gray-100">
                    <img src="/map.jpg" alt="Thumbnail v1.0" className="w-full h-full object-cover opacity-55" />
                  </div>
                </div>

                {/* Arrow indicator between v1.0 and v1.1 */}
                {temporalElapsed >= 1800 && (
                  <div className="absolute top-[52px] left-4 font-mono text-[9px] text-[#FF6B35] font-bold animate-pulse flex items-center gap-1">
                    <span>↓</span>
                    <span>Improvement</span>
                  </div>
                )}

                {/* v1.1 Card */}
                <div
                  className={`bg-white border border-[#E0E0E0] rounded p-3 flex items-center justify-between shadow-xs mt-3 transition-all duration-700 transform ${
                    temporalElapsed >= 2000 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#FFE8D6] flex items-center justify-center font-mono text-[11px] text-[#FF6B35] font-bold">1.1</div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[12px] font-bold text-[#2C2C2A] flex items-center gap-2">
                        v1.1 Update
                        <span className="font-sans text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Changes detected</span>
                      </span>
                      <span className="font-sans text-[10px] text-[#999999]">Month 3 • Road changes parsed</span>
                    </div>
                  </div>
                  <div className="w-12 h-8 rounded border border-[#E0E0E0] overflow-hidden bg-gray-100">
                    <img src="/map.jpg" alt="Thumbnail v1.1" className="w-full h-full object-cover opacity-75" />
                  </div>
                </div>

                {/* Arrow indicator between v1.1 and v1.2 */}
                {temporalElapsed >= 3200 && (
                  <div className="absolute top-[125px] left-4 font-mono text-[9px] text-[#FF6B35] font-bold animate-pulse flex items-center gap-1">
                    <span>↓</span>
                    <span>Improvement</span>
                  </div>
                )}

                {/* v1.2 Card */}
                <div
                  className={`bg-white border border-[#E0E0E0] rounded p-3 flex items-center justify-between shadow-xs mt-3 transition-all duration-700 transform ${
                    temporalElapsed >= 3500 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#FFE8D6] flex items-center justify-center font-mono text-[11px] text-[#FF6B35] font-bold">1.2</div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[12px] font-bold text-[#2C2C2A]">v1.2 Atlas</span>
                      <span className="font-sans text-[10px] text-[#999999]">Month 6 • Temporal model complete</span>
                    </div>
                  </div>
                  <div className="w-12 h-8 rounded border border-[#E0E0E0] overflow-hidden bg-gray-100">
                    <img src="/map.jpg" alt="Thumbnail v1.2" className="w-full h-full object-cover opacity-95" />
                  </div>
                </div>

              </div>

              {/* Flywheel Container */}
              <div className="flex flex-col items-center gap-2 select-none relative mt-2">
                <span
                  className={`font-sans text-[12px] font-bold text-[#FF6B35] uppercase tracking-wider transition-opacity duration-500 ${
                    temporalElapsed >= 1500 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  The Reconstruction Flywheel
                </span>
                
                {/* SVG 5-Stage Flywheel */}
                <div
                  className={`w-[180px] h-[180px] rounded-full border border-dashed border-[#FF6B35]/40 flex items-center justify-center relative transition-opacity duration-1000 ${
                    temporalElapsed >= 1500 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <svg className="w-full h-full absolute inset-0 animate-spin-slow">
                    {/* Ring Path for flowing dash */}
                    <circle cx="90" cy="90" r="75" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeDasharray="8, 12" />
                  </svg>
                  
                  {/* Stationary Labels overlaying the stages */}
                  <div className="absolute inset-0 flex items-center justify-center text-center font-sans font-semibold text-[8px] text-[#2C2C2A] uppercase tracking-tight">
                    <span className="absolute top-2 w-full text-center">More Coverage</span>
                    <span className="absolute right-1 top-[42%] text-right pr-1">More Usage</span>
                    <span className="absolute right-2 bottom-5 text-right">More Observations</span>
                    <span className="absolute left-2 bottom-5 text-left">Better Changes</span>
                    <span className="absolute left-1 top-[42%] text-left pl-1">Cheaper Updates</span>
                    
                    <span className="font-mono text-[10px] text-[#FF6B35] font-bold border border-[#FFE8D6] bg-white px-2 py-1 rounded shadow-xs">
                      FLOW
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Geographic scale Map (60% width) */}
            <div className="flex-1 flex flex-col justify-between pl-4">
              
              <div className="flex justify-between items-center border-b border-[#E0E0E0] pb-2">
                <span
                  className={`font-sans text-[14px] font-bold text-[#FF6B35] uppercase tracking-wider transition-opacity duration-500 ${
                    temporalElapsed >= 2500 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Multi-City Expansion
                </span>
                <span className="font-mono text-[9px] text-[#999999]">GRID: ACTIVE</span>
              </div>

              {/* Simplified network map of India representation */}
              <div className="flex-1 my-4 flex items-center justify-center relative bg-white border border-[#E0E0E0] rounded overflow-hidden p-6 shadow-2xs">
                
                {/* Abstract Dotted Map of India Background */}
                <svg
                  className={`absolute inset-0 w-full h-full opacity-10 transition-opacity duration-1000 ${
                    temporalElapsed >= 500 ? "opacity-20" : "opacity-0"
                  }`}
                  viewBox="0 0 280 320"
                >
                  {/* Rough stylized borders of India */}
                  <path
                    d="M 120 40 L 145 50 L 155 70 L 180 80 L 195 105 L 180 135 L 205 150 L 225 170 L 205 190 L 210 215 L 190 230 L 185 255 L 155 285 L 140 310 L 130 310 L 120 285 L 105 260 L 95 240 L 75 220 L 70 190 L 50 170 L 60 145 L 65 110 L 85 90 L 100 80 Z"
                    fill="#CCCCCC"
                    stroke="#999999"
                    strokeWidth="1.5"
                    strokeDasharray="4, 4"
                  />
                </svg>

                {/* Live Network paths (t >= 4.0s) */}
                {temporalElapsed >= 4000 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 320">
                    {/* Chandigarh -> Delhi */}
                    <path d="M 120 45 L 130 70" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeDasharray="4, 6" className="animate-flow-stream" />
                    {/* Delhi -> Mumbai */}
                    <path d="M 130 70 L 70 180" fill="none" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4, 6" className="animate-flow-stream-delayed" />
                    {/* Mumbai -> Pune */}
                    <path d="M 70 180 L 85 200" fill="none" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4, 6" className="animate-flow-stream" />
                    {/* Pune -> Hyderabad */}
                    <path d="M 85 200 L 130 220" fill="none" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4, 6" className="animate-flow-stream-delayed" />
                    {/* Hyderabad -> Bangalore */}
                    <path d="M 130 220 L 115 260" fill="none" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4, 6" className="animate-flow-stream" />
                    {/* Delhi -> Hyderabad */}
                    <path d="M 130 70 L 130 220" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="4, 6" className="animate-flow-stream" />
                  </svg>
                )}

                {/* Cities indicators */}
                <div className="absolute inset-0 pointer-events-none" style={{ transform: "scale(1.2) translate(-20px, -15px)", transformOrigin: "center" }}>
                  
                  {/* 1. Chandigarh (Always Active, glowing radius) */}
                  <div className="absolute top-[45px] left-[120px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="absolute w-[20px] h-[20px] rounded-full bg-[#FF6B35]/25 border border-[#FF6B35] animate-ping" />
                    <span className="w-2.5 h-2.5 bg-[#FF6B35] rounded-full border border-white z-10 shadow-xs" />
                    <span className="absolute left-4 font-mono text-[9px] text-[#2C2C2A] font-bold bg-white/95 px-1 py-0.5 rounded shadow-2xs border border-[#DDD]">Chandigarh</span>
                  </div>

                  {/* 2. Delhi (appears at 3.0s) */}
                  <div
                    className={`absolute top-[70px] left-[130px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-500 ${
                      temporalElapsed >= 3000 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="absolute w-[14px] h-[14px] rounded-full bg-[#FF6B35]/20 animate-pulse" />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full z-10" />
                    <span className="absolute left-3.5 font-mono text-[9px] text-[#666666] bg-white/95 px-1 rounded shadow-2xs">Delhi</span>
                  </div>

                  {/* 3. Mumbai (appears at 3.4s) */}
                  <div
                    className={`absolute top-[180px] left-[70px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-500 ${
                      temporalElapsed >= 3400 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="absolute w-[14px] h-[14px] rounded-full bg-[#FF6B35]/20 animate-pulse" />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full z-10" />
                    <span className="absolute left-3.5 font-mono text-[9px] text-[#666666] bg-white/95 px-1 rounded shadow-2xs">Mumbai</span>
                  </div>

                  {/* 4. Pune (appears at 3.8s) */}
                  <div
                    className={`absolute top-[200px] left-[85px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-500 ${
                      temporalElapsed >= 3800 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="absolute w-[14px] h-[14px] rounded-full bg-[#FF6B35]/20 animate-pulse" />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full z-10" />
                    <span className="absolute left-3.5 font-mono text-[9px] text-[#666666] bg-white/95 px-1 rounded shadow-2xs">Pune</span>
                  </div>

                  {/* 5. Hyderabad (appears at 4.2s) */}
                  <div
                    className={`absolute top-[220px] left-[130px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-500 ${
                      temporalElapsed >= 4200 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="absolute w-[14px] h-[14px] rounded-full bg-[#FF6B35]/20 animate-pulse" />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full z-10" />
                    <span className="absolute left-3.5 font-mono text-[9px] text-[#666666] bg-white/95 px-1 rounded shadow-2xs">Hyderabad</span>
                  </div>

                  {/* 6. Bangalore (appears at 4.6s) */}
                  <div
                    className={`absolute top-[260px] left-[115px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-500 ${
                      temporalElapsed >= 4600 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="absolute w-[14px] h-[14px] rounded-full bg-[#FF6B35]/20 animate-pulse" />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full z-10" />
                    <span className="absolute left-3.5 font-mono text-[9px] text-[#666666] bg-white/95 px-1 rounded shadow-2xs">Bangalore</span>
                  </div>

                </div>

              </div>

              {/* Finale Message (appears t >= 4.5s) */}
              <div
                className={`text-center font-serif text-[15px] italic text-[#2C2C2A] h-[25px] transition-all duration-[800ms] transform ${
                  temporalElapsed >= 4500 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                The machine-readable physical world scales
              </div>

            </div>

          </div>

          {/* Bottom Info bar */}
          <div className="w-full flex items-center justify-between border-t border-line pt-4 shrink-0 font-mono text-[11px] text-[#2C2C2A] tracking-wide select-none">
            <span>Stage 4: Temporal Versioning & National Scale Deployment</span>
            <span className="text-[#FF6B35]">STATUS: COMPOUNDING DATA NETWORK</span>
          </div>

        </div>
      )}

      {/* Global CSS Inject */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flowStream {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes spinClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-flow-stream {
          animation: flowStream 1.5s linear infinite;
        }
        .animate-flow-stream-delayed {
          animation: flowStream 1.8s linear infinite;
        }
        .animate-spin-slow {
          animation: spinClockwise 16s linear infinite;
        }
      `}</style>

    </div>
  );
}

function progressPercent(elapsed: number): number {
  return Math.max(0, Math.min(100, (elapsed / 5000) * 100));
}
