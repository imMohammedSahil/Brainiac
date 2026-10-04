import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Crisp Porcelain White Anatomical Palette
const ANATOMICAL_PALETTE = {
  frontal: new THREE.Color("#f8f8fa"), // Crisp Porcelain White
  pariet: new THREE.Color("#f4f4f7"),  // Pure White
  temp: new THREE.Color("#fbfbfe"),    // Pearl White
  occipit: new THREE.Color("#efeff4"), // Light Silver-White
  cereb: new THREE.Color("#e8e8ee"),   // Silver-Ivory Folia
  stem: new THREE.Color("#fdfdfd"),    // Myelinated Pure White
  corpus: new THREE.Color("#ffffff"),  // Pure White
  pitua: new THREE.Color("#e2e2e8"),   // Silver Accent
  default: new THREE.Color("#f8f8fa"),
};

const EMISSIVE_OFF = new THREE.Color("#000000");

// ── HIGH-POLY SUBDIVISION & GEOMETRIC SMOOTHING FUNCTION ──
function subdivideAndSmoothGeometry(geometry, subdivisions = 1) {
  let geo = geometry.clone();

  // 1. Merge coincident vertices to weld mesh boundaries
  geo = BufferGeometryUtils.mergeVertices(geo, 0.002);

  // 2. Perform Subdivisions (4x polygon multiplier per level with curved midpoint interpolation)
  for (let s = 0; s < subdivisions; s++) {
    const posAttr = geo.attributes.position;
    const index = geo.index;
    if (!posAttr || !index) break;

    const positions = posAttr.array;
    const indices = index.array;
    const newPositions = Array.from(positions);
    const newIndices = [];
    const midPointCache = new Map();

    const getMidPoint = (i1, i2) => {
      const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
      if (midPointCache.has(key)) return midPointCache.get(key);

      const x1 = positions[i1 * 3], y1 = positions[i1 * 3 + 1], z1 = positions[i1 * 3 + 2];
      const x2 = positions[i2 * 3], y2 = positions[i2 * 3 + 1], z2 = positions[i2 * 3 + 2];

      const mx = (x1 + x2) * 0.5;
      const my = (y1 + y2) * 0.5;
      const mz = (z1 + z2) * 0.5;

      const newIdx = newPositions.length / 3;
      newPositions.push(mx, my, mz);
      midPointCache.set(key, newIdx);
      return newIdx;
    };

    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];

      const mAB = getMidPoint(a, b);
      const mBC = getMidPoint(b, c);
      const mCA = getMidPoint(c, a);

      newIndices.push(a, mAB, mCA);
      newIndices.push(b, mBC, mAB);
      newIndices.push(c, mCA, mBC);
      newIndices.push(mAB, mBC, mCA);
    }

    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
    geo.setIndex(newIndices);
    geo = BufferGeometryUtils.mergeVertices(geo, 0.001);
  }

  // 3. Compute smooth vertex normals
  geo.computeVertexNormals();
  return geo;
}

// Walk up parent tree to find exact anatomical lobe name
function getAnatomicalLobe(mesh) {
  if (!mesh) return "frontal";
  const validLobes = ["frontal", "pariet", "temp", "occipit", "cereb", "stem", "corpus", "pitua"];
  let curr = mesh;
  while (curr) {
    const name = (curr.name || "").toLowerCase();
    for (const lobe of validLobes) {
      if (name.includes(lobe)) return lobe;
    }
    curr = curr.parent;
  }
  return "frontal";
}

export default function BrainModel({
  onRegionDetected,
  onHoverRegion,
  selectedRegionId,
  meshRegionMap,
  resetHighlight,
  wireframe = false,
}) {
  const { scene } = useGLTF("/models/brain.glb");
  const [activeMeshes, setActiveMeshes] = useState([]);
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const brainGroupRef = useRef();

  // Helper to determine anatomical lobe color
  const getLobeBaseColor = (lobe) => {
    return ANATOMICAL_PALETTE[lobe] || ANATOMICAL_PALETTE.default;
  };

  // ── 1. PROCEDURAL 2048x2048 TRUE TANGENT-SPACE NORMAL MAP & WHITE PORCELAIN TEXTURE MAPS ──
  const { albedoTexture, normalTexture, roughnessTexture, aoTexture } = useMemo(() => {
    const size = 2048;

    // A. High-Definition Height Canvas for Normal Calculation
    const cHeight = document.createElement("canvas");
    cHeight.width = size;
    cHeight.height = size;
    const ctxH = cHeight.getContext("2d");

    ctxH.fillStyle = "#808080";
    ctxH.fillRect(0, 0, size, size);

    for (let i = 0; i < 520; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 35 + Math.random() * 115;
      const grad = ctxH.createRadialGradient(x, y, 0, x, y, radius);

      if (Math.random() > 0.42) {
        grad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        grad.addColorStop(0.5, "rgba(220, 220, 220, 0.25)");
        grad.addColorStop(1, "rgba(128, 128, 128, 0)");
      } else {
        grad.addColorStop(0, "rgba(0, 0, 0, 0.7)");
        grad.addColorStop(0.6, "rgba(40, 40, 40, 0.3)");
        grad.addColorStop(1, "rgba(128, 128, 128, 0)");
      }

      ctxH.fillStyle = grad;
      ctxH.beginPath();
      ctxH.arc(x, y, radius, 0, Math.PI * 2);
      ctxH.fill();
    }

    const heightData = ctxH.getImageData(0, 0, size, size);
    const hPixels = heightData.data;

    // B. Tangent-Space Normal Map (Sobel Derivative Filter)
    const cNormal = document.createElement("canvas");
    cNormal.width = size;
    cNormal.height = size;
    const ctxN = cNormal.getContext("2d");
    const normalData = ctxN.createImageData(size, size);
    const nPixels = normalData.data;

    const strength = 1.8;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const xL = (x - 1 + size) % size;
        const xR = (x + 1) % size;
        const yU = (y - 1 + size) % size;
        const yD = (y + 1) % size;

        const hL = hPixels[(y * size + xL) * 4] / 255.0;
        const hR = hPixels[(y * size + xR) * 4] / 255.0;
        const hU = hPixels[(yU * size + x) * 4] / 255.0;
        const hD = hPixels[(yD * size + x) * 4] / 255.0;

        const dx = (hR - hL) * strength;
        const dy = (hD - hU) * strength;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = ((-dx / len) * 0.5 + 0.5) * 255;
        const ny = ((-dy / len) * 0.5 + 0.5) * 255;
        const nz = ((dz / len) * 0.5 + 0.5) * 255;

        const idx = (y * size + x) * 4;
        nPixels[idx] = nx;
        nPixels[idx + 1] = ny;
        nPixels[idx + 2] = nz;
        nPixels[idx + 3] = 255;
      }
    }
    ctxN.putImageData(normalData, 0, 0);

    // C. Clean Porcelain White Albedo Canvas
    const cAlbedo = document.createElement("canvas");
    cAlbedo.width = size;
    cAlbedo.height = size;
    const ctxA = cAlbedo.getContext("2d");

    ctxA.fillStyle = "#f8f8fa";
    ctxA.fillRect(0, 0, size, size);

    for (let i = 0; i < 480; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 40 + Math.random() * 120;
      const grad = ctxA.createRadialGradient(x, y, 0, x, y, radius);

      if (Math.random() > 0.42) {
        grad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        grad.addColorStop(0.5, "rgba(245, 245, 248, 0.3)");
        grad.addColorStop(1, "rgba(248, 248, 250, 0)");
      } else {
        grad.addColorStop(0, "rgba(185, 185, 195, 0.35)");
        grad.addColorStop(0.6, "rgba(215, 215, 222, 0.15)");
        grad.addColorStop(1, "rgba(248, 248, 250, 0)");
      }

      ctxA.fillStyle = grad;
      ctxA.beginPath();
      ctxA.arc(x, y, radius, 0, Math.PI * 2);
      ctxA.fill();
    }

    // Subtle refined silver-graphite pial micro-relief
    for (let v = 0; v < 80; v++) {
      ctxA.strokeStyle = "rgba(120, 120, 135, 0.16)";
      ctxA.lineWidth = 1.0 + Math.random() * 2.0;
      ctxA.beginPath();
      let vx = Math.random() * size;
      let vy = Math.random() * size;
      ctxA.moveTo(vx, vy);

      const segments = 6 + Math.floor(Math.random() * 6);
      for (let s = 0; s < segments; s++) {
        vx += (Math.random() - 0.5) * 90;
        vy += (Math.random() - 0.5) * 90;
        ctxA.lineTo(vx, vy);
      }
      ctxA.stroke();
    }

    // D. Roughness Map (Moist specular highlights on gyri crests)
    const cRough = document.createElement("canvas");
    cRough.width = size;
    cRough.height = size;
    const ctxR = cRough.getContext("2d");

    ctxR.fillStyle = "#555555";
    ctxR.fillRect(0, 0, size, size);

    for (let i = 0; i < 350; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 45 + Math.random() * 120;
      const grad = ctxR.createRadialGradient(x, y, 0, x, y, radius);

      grad.addColorStop(0, "rgba(20, 20, 20, 0.55)");
      grad.addColorStop(0.7, "rgba(80, 80, 80, 0.2)");
      grad.addColorStop(1, "rgba(85, 85, 85, 0)");

      ctxR.fillStyle = grad;
      ctxR.beginPath();
      ctxR.arc(x, y, radius, 0, Math.PI * 2);
      ctxR.fill();
    }

    // E. Ambient Occlusion Map
    const cAO = document.createElement("canvas");
    cAO.width = size;
    cAO.height = size;
    const ctxAO = cAO.getContext("2d");

    ctxAO.fillStyle = "#ffffff";
    ctxAO.fillRect(0, 0, size, size);

    for (let i = 0; i < 400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 30 + Math.random() * 90;
      const grad = ctxAO.createRadialGradient(x, y, 0, x, y, radius);

      grad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
      grad.addColorStop(0.7, "rgba(100, 100, 100, 0.2)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctxAO.fillStyle = grad;
      ctxAO.beginPath();
      ctxAO.arc(x, y, radius, 0, Math.PI * 2);
      ctxAO.fill();
    }

    const albTex = new THREE.CanvasTexture(cAlbedo);
    albTex.wrapS = THREE.RepeatWrapping;
    albTex.wrapT = THREE.RepeatWrapping;
    albTex.repeat.set(3, 3);
    albTex.needsUpdate = true;

    const normTex = new THREE.CanvasTexture(cNormal);
    normTex.wrapS = THREE.RepeatWrapping;
    normTex.wrapT = THREE.RepeatWrapping;
    normTex.repeat.set(3, 3);
    normTex.needsUpdate = true;

    const rghTex = new THREE.CanvasTexture(cRough);
    rghTex.wrapS = THREE.RepeatWrapping;
    rghTex.wrapT = THREE.RepeatWrapping;
    rghTex.repeat.set(3, 3);
    rghTex.needsUpdate = true;

    const aoTex = new THREE.CanvasTexture(cAO);
    aoTex.wrapS = THREE.RepeatWrapping;
    aoTex.wrapT = THREE.RepeatWrapping;
    aoTex.repeat.set(3, 3);
    aoTex.needsUpdate = true;

    return { albedoTexture: albTex, normalTexture: normTex, roughnessTexture: rghTex, aoTexture: aoTex };
  }, []);

  // ── 2. SYNCHRONOUSLY CONFIGURE CLEAN WHITE PBR PHYSICAL MATERIALS BEFORE PAINT ──
  useLayoutEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (!child.isMesh) return;

      // Apply Geometric Subdivision & Normal Smoothing
      if (!child.userData.hasBeenSubdivided) {
        child.geometry = subdivideAndSmoothGeometry(child.geometry, 1);
        child.userData.hasBeenSubdivided = true;
      }

      const lobe = getAnatomicalLobe(child);
      child.userData.anatomicalLobe = lobe;
      const baseColor = getLobeBaseColor(lobe);

      if (!child.userData.hasPhysicalMat) {
        const physicalMat = new THREE.MeshPhysicalMaterial({
          color: baseColor.clone(),
          map: albedoTexture,
          normalMap: normalTexture,
          normalScale: new THREE.Vector2(1.2, 1.2),
          aoMap: aoTexture,
          aoMapIntensity: 0.85,
          roughnessMap: roughnessTexture,
          roughness: 0.30,
          metalness: 0.01,
          clearcoat: 0.68,
          clearcoatRoughness: 0.12,
          transmission: 0,
          ior: 1.46,
          reflectivity: 0.75,
          emissive: EMISSIVE_OFF,
          emissiveIntensity: 0,
          wireframe: wireframe,
        });

        child.material = physicalMat;
        child.castShadow = true;
        child.receiveShadow = true;
        child.userData.hasPhysicalMat = true;
      } else if (child.material) {
        child.material.wireframe = wireframe;
      }
    });
  }, [scene, albedoTexture, normalTexture, roughnessTexture, aoTexture, wireframe]);

  // Wireframe toggle
  useLayoutEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = wireframe;
      }
    });
  }, [wireframe, scene]);

  // Handle region selection: precisely highlights the targeted lobe in an elegant accent tone
  useLayoutEffect(() => {
    if (!scene || !meshRegionMap) return;

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const lobe = child.userData.anatomicalLobe || getAnatomicalLobe(child);
        const naturalColor = getLobeBaseColor(lobe);

        child.material.color.copy(naturalColor);
        child.material.roughness = 0.30;
        child.material.clearcoat = 0.68;
        child.material.emissive.copy(EMISSIVE_OFF);
        child.material.emissiveIntensity = 0;
      }
    });

    if (!selectedRegionId) {
      setActiveMeshes([]);
      return;
    }

    const targetLobes = [];
    for (let lobe in meshRegionMap) {
      if (meshRegionMap[lobe].includes(selectedRegionId)) {
        targetLobes.push(lobe.toLowerCase());
      }
    }

    const newActive = [];
    if (targetLobes.length > 0) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const lobe = child.userData.anatomicalLobe || getAnatomicalLobe(child);
          if (targetLobes.includes(lobe)) {
            // Selected lobe darkens into an elegant charcoal-slate accent to stand out against white
            child.material.color.copy(new THREE.Color("#71717a"));
            child.material.emissive.copy(new THREE.Color("#27272a"));
            child.material.emissiveIntensity = 0.25;
            child.material.roughness = 0.22;
            child.material.clearcoat = 0.95;
            newActive.push(child);
          }
        }
      });
    }

    setActiveMeshes(newActive);
  }, [selectedRegionId, scene, meshRegionMap]);

  // Reset highlight
  useEffect(() => {
    if (!resetHighlight) return;
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const lobe = child.userData.anatomicalLobe || getAnatomicalLobe(child);
          const naturalColor = getLobeBaseColor(lobe);
          child.material.color.copy(naturalColor);
          child.material.emissive.copy(EMISSIVE_OFF);
          child.material.emissiveIntensity = 0;
          child.material.roughness = 0.30;
          child.material.clearcoat = 0.68;
        }
      });
    }
    setActiveMeshes([]);
    setHoveredMesh(null);
  }, [resetHighlight, scene]);

  // Living physiological micro-breathing rhythm (slow, meditative tempo)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const breathing = Math.sin(time * 0.75) * 0.007 + Math.cos(time * 1.8) * 0.002;

    if (brainGroupRef.current) {
      brainGroupRef.current.scale.set(
        1.0 + breathing,
        1.0 + breathing * 0.9,
        1.0 + breathing * 1.1
      );
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (!mesh || !mesh.isMesh) return;

    const lobe = mesh.userData.anatomicalLobe || getAnatomicalLobe(mesh);
    if (onRegionDetected) {
      onRegionDetected(lobe);
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    const mesh = e.object;
    if (mesh && mesh.isMesh && scene) {
      setHoveredMesh(mesh);
      const hoveredLobe = mesh.userData.anatomicalLobe || getAnatomicalLobe(mesh);

      scene.traverse((child) => {
        if (child.isMesh && child.material && !activeMeshes.includes(child)) {
          const childLobe = child.userData.anatomicalLobe || getAnatomicalLobe(child);
          if (childLobe === hoveredLobe) {
            // Hovered lobe illuminates into a soft silver-slate accent
            child.material.color.copy(new THREE.Color("#a1a1aa"));
            child.material.emissive.copy(new THREE.Color("#3f3f46"));
            child.material.emissiveIntensity = 0.2;
            child.material.clearcoat = 0.92;
            child.material.roughness = 0.24;
          }
        }
      });

      if (onHoverRegion) {
        onHoverRegion(hoveredLobe);
      }
    }
  };

  const handlePointerOut = (e) => {
    document.body.style.cursor = "default";
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material && !activeMeshes.includes(child)) {
          const childLobe = child.userData.anatomicalLobe || getAnatomicalLobe(child);
          const naturalColor = getLobeBaseColor(childLobe);
          child.material.color.copy(naturalColor);
          child.material.clearcoat = 0.68;
          child.material.roughness = 0.30;
          child.material.emissive.copy(EMISSIVE_OFF);
          child.material.emissiveIntensity = 0;
        }
      });
    }
    setHoveredMesh(null);
    if (onHoverRegion) {
      onHoverRegion(null);
    }
  };

  return (
    <group ref={brainGroupRef}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

useGLTF.preload("/models/brain.glb");