import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import * as THREE from "three";
import BrainModel from "../components/BrainModel";
import { meshRegionMap } from "../data/meshRegionMap";
import { brainRegions } from "../data/brainRegions";
import { useNavigate } from "react-router-dom";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";
import SoundPill from "../components/SoundPill";

// Anatomical cinematic camera targets (elevated, side, and rear angles)
const REGION_CAMERA_TARGETS = {
  // Parietal Lobe: Elevated crown view looking down at upper parietal cortex
  parietal: [1.0, 4.4, 4.6],

  // Frontal / Prefrontal: Direct anterior frontal view
  prefrontal: [0, 0.4, 6.8],

  // Occipital: Rear posterior view
  occipital: [0.2, 1.4, -6.8],

  // Temporal: Lateral side profile view
  temporal: [6.4, 0.6, 2.2],

  // Cerebellum: Low-posterior angle
  cerebellum: [1.6, -3.2, -5.6],

  // Brainstem: Inferior base angle
  brainstem: [0, -3.5, 4.8],

  // Deep Internal Structures (Zoomed cinematic diencephalic framing)
  thalamus: [1.2, 0.4, 5.4],
  corpus: [2.2, 1.4, 5.0],
  hypothalamus: [0.0, -1.8, 5.2],
  amygdala: [1.6, -1.2, 5.2],
  hippocampus: [-1.6, -1.0, 5.2],
  vta: [0.0, -2.2, 5.0],

  // Default Front Framing
  default: [0, 0, 7.2],
};

function CinematicCameraController({ cameraTarget, orbitRef }) {
  const { camera } = useThree();
  const animatingRef = useRef(false);
  const animStartTime = useRef(0);
  const animDuration = useRef(2.4);
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3(0, 0, 7.2));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const hasInitialized = useRef(false);

  const baseForward = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      camera.position.set(0, 0.2, 8.2);
      startPos.current.set(0, 0.2, 8.2);
      targetPos.current.set(0, 0, 7.2);
      animStartTime.current = performance.now();
      animDuration.current = 2.4;
      animatingRef.current = true;
      return;
    }

    if (!cameraTarget) return;
    const targetId = typeof cameraTarget === "string" ? cameraTarget : cameraTarget.id;
    const targetCoords =
      REGION_CAMERA_TARGETS[targetId] || REGION_CAMERA_TARGETS.default;

    startPos.current.copy(camera.position);
    targetPos.current.set(targetCoords[0], targetCoords[1], targetCoords[2]);
    animDuration.current = 2.6;
    animStartTime.current = performance.now();
    animatingRef.current = true;
  }, [cameraTarget, camera]);

  useFrame(() => {
    if (!animatingRef.current) return;

    const now = performance.now();
    const elapsed = (now - animStartTime.current) / 1000;
    const progress = Math.min(Math.max(elapsed / animDuration.current, 0), 1);

    // Ken Perlin's Smootherstep curve (6t^5 - 15t^4 + 10t^3) with zero initial & final acceleration jerk
    const ease = progress * progress * progress * (progress * (progress * 6 - 15) + 10);

    const s = startPos.current;
    const e = targetPos.current;
    const sLen = s.length();
    const eLen = e.length();

    if (sLen > 0.001 && eLen > 0.001) {
      const sNorm = s.clone().normalize();
      const eNorm = e.clone().normalize();

      // Spherical quaternion slerp for great-circle orbital movement around the brain
      const qStart = new THREE.Quaternion().setFromUnitVectors(baseForward, sNorm);
      const qEnd = new THREE.Quaternion().setFromUnitVectors(baseForward, eNorm);
      const qCurrent = qStart.clone().slerp(qEnd, ease);

      const currentDir = baseForward.clone().applyQuaternion(qCurrent);
      const currentRadius = sLen + (eLen - sLen) * ease;

      camera.position.copy(currentDir.multiplyScalar(currentRadius));
    } else {
      camera.position.lerpVectors(s, e, ease);
    }

    if (orbitRef && orbitRef.current) {
      orbitRef.current.target.lerp(lookAtTarget.current, 0.03);
      orbitRef.current.update();
    }

    if (progress >= 1) {
      camera.position.copy(targetPos.current);
      animatingRef.current = false;
    }
  });

  return null;
}

function CinematicLightingRig({ introSharedRef }) {
  const ambientRef = useRef();
  const dir1Ref = useRef();
  const dir2Ref = useRef();
  const dir3Ref = useRef();
  const pt1Ref = useRef();

  useFrame(() => {
    const p = introSharedRef ? introSharedRef.current : 1;
    if (ambientRef.current) ambientRef.current.intensity = 1.1 * p;
    if (dir1Ref.current) dir1Ref.current.intensity = 2.2 * p;
    if (dir2Ref.current) dir2Ref.current.intensity = 1.0 * p;
    if (dir3Ref.current) dir3Ref.current.intensity = 2.6 * p;
    if (pt1Ref.current) pt1Ref.current.intensity = 1.4 * p;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} color="#ffffff" />
      <directionalLight ref={dir1Ref} position={[6, 8, 7]} intensity={0} color="#ffffff" castShadow />
      <directionalLight ref={dir2Ref} position={[-6, -4, -4]} intensity={0} color="#cbd5e1" />
      <directionalLight ref={dir3Ref} position={[0, 6, -8]} intensity={0} color="#f8fafc" />
      <pointLight ref={pt1Ref} position={[0, 3, 4]} intensity={0} color="#ffffff" distance={12} />
      <pointLight position={[0, -4, -3]} intensity={0.8} color="#94a3b8" distance={10} />
      <hemisphereLight skyColor="#ffffff" groundColor="#09090b" intensity={0.85} />
    </>
  );
}

function CinematicBrainRig({
  sidebarOpen,
  inspectorOpen,
  onRegionDetected,
  onHoverRegion,
  currentRegion,
  meshRegionMap,
  resetHighlight,
  wireframe,
  introSharedRef
}) {
  const groupRef = useRef();
  const introStartTime = useRef(null);
  const introDuration = 2.4; // 2.4 seconds of tranquil, slow cinematic emergence

  // Determine optical center offset:
  let targetX = 0;
  if (sidebarOpen && !inspectorOpen) targetX = 0.22;
  else if (!sidebarOpen && inspectorOpen) targetX = -0.58;
  else if (sidebarOpen && inspectorOpen) targetX = -0.05;

  const targetScale = inspectorOpen ? 0.50 : sidebarOpen ? 0.54 : 0.55;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (introStartTime.current === null) {
      introStartTime.current = performance.now();
      groupRef.current.scale.set(0.001, 0.001, 0.001);
    }

    const elapsed = (performance.now() - introStartTime.current) / 1000;
    const rawP = Math.min(Math.max(elapsed / introDuration, 0), 1);
    // Ken Perlin's Smootherstep curve for zero jerk
    const introProgress = rawP * rawP * rawP * (rawP * (rawP * 6 - 15) + 10);

    if (introSharedRef) {
      introSharedRef.current = introProgress;
    }

    // Frame-rate independent ultra-smooth cinematic ease
    const factor = 1 - Math.exp(-2.6 * delta);
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * factor;

    // Scale starts smoothly from near 0 and blossoms outward to targetScale
    const finalTargetScale = targetScale * introProgress;
    const currentScale = groupRef.current.scale.x;
    const nextScale = currentScale + (finalTargetScale - currentScale) * factor;
    groupRef.current.scale.set(nextScale, nextScale, nextScale);
  });

  return (
    <group ref={groupRef}>
      <Center target={[0, 0, 0]}>
        <BrainModel
          onRegionDetected={onRegionDetected}
          onHoverRegion={onHoverRegion}
          selectedRegionId={currentRegion ? currentRegion.id : null}
          meshRegionMap={meshRegionMap}
          resetHighlight={resetHighlight}
          wireframe={wireframe}
        />
      </Center>
    </group>
  );
}

export default function BrainView() {
  const navigate = useNavigate();
  const orbitRef = useRef(null);
  const introSharedRef = useRef(0);
  const { audioPlaying, audioPaused, toggleAudio } = useSoundSanctuary();

  // States
  const [selectedRegions, setSelectedRegions] = useState(null);
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("functions"); // 'functions' | 'impact' | 'improve'
  const [hoveredRegionName, setHoveredRegionName] = useState(null);
  const [resetHighlight, setResetHighlight] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [crossSection, setCrossSection] = useState(false);
  const [synapses, setSynapses] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cameraTarget, setCameraTarget] = useState({ id: "default", timestamp: Date.now() });

  // Categorize visible anatomical lobes and deep core nuclei
  const categories = [
    { id: "all", label: "All Areas" },
    { id: "cortex", label: "Cerebral Cortex", ids: ["prefrontal", "parietal", "temporal", "occipital"] },
    { id: "subcortical", label: "Cerebellum & Stem", ids: ["cerebellum", "brainstem"] },
    { id: "deep", label: "Deep Core & Limbic", ids: ["thalamus", "corpus", "hypothalamus", "amygdala", "hippocampus", "vta"] },
  ];

  // Deep internal structures that auto-toggle wireframe mode
  const WIREFRAME_REGIONS = ["thalamus", "corpus", "hypothalamus", "amygdala", "hippocampus", "vta"];

  // Filtered regions for sidebar search
  const filteredRegions = brainRegions.filter((region) => {
    const matchesQuery =
      region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesQuery) return false;
    if (selectedCategory === "all") return true;

    const catObj = categories.find((c) => c.id === selectedCategory);
    return catObj ? catObj.ids.includes(region.id) : true;
  });

  // Mesh click detection
  const handleRegionDetected = (lobeName) => {
    if (!lobeName) return;
    const lower = lobeName.toLowerCase();
    const ids = meshRegionMap[lower];
    if (ids) {
      const regionData = brainRegions.filter((r) => ids.includes(r.id));
      if (regionData.length > 0) {
        const targetRegion = regionData[0];
        setSelectedRegions([targetRegion]);
        setActiveRegionIndex(0);
        setCameraTarget({ id: targetRegion.id, timestamp: Date.now() });
        setWireframe(false);
        return;
      }
    }
  };

  // Mesh hover detection
  const handleHoverRegion = (lobeName) => {
    if (!lobeName) {
      setHoveredRegionName(null);
      return;
    }
    const lower = lobeName.toLowerCase();
    const ids = meshRegionMap[lower];
    if (ids) {
      const regionData = brainRegions.filter((r) => ids.includes(r.id));
      if (regionData.length > 0) {
        setHoveredRegionName(regionData[0].name);
        return;
      }
    }
    setHoveredRegionName(null);
  };

  // Direct selection from sidebar list with cinematic camera focus and auto-wireframe for deep structures
  const handleSelectFromList = (region) => {
    setSelectedRegions([region]);
    setActiveRegionIndex(0);
    setCameraTarget({ id: region.id, timestamp: Date.now() });

    // Auto-switch to wireframe for Thalamus and deep internal nuclei so you can see inside
    if (WIREFRAME_REGIONS.includes(region.id)) {
      setWireframe(true);
    } else {
      setWireframe(false);
    }
  };

  const handleClose = () => {
    setSelectedRegions(null);
    setResetHighlight(true);
    setTimeout(() => setResetHighlight(false), 50);
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
    setSelectedRegions(null);
    setResetHighlight(true);
    setTimeout(() => setResetHighlight(false), 50);
  };

  const handleResetCamera = () => {
    setSelectedRegions(null);
    setWireframe(false);
    setCameraTarget({ id: "default", timestamp: Date.now() });
    setResetHighlight(true);
    setTimeout(() => setResetHighlight(false), 50);
  };

  const handleRetakeAssessment = () => {
    try {
      localStorage.removeItem("brainiac_saved_care_plans");
      sessionStorage.removeItem("brainiac_last_active_report");
    } catch (e) {}
    navigate("/assessment");
  };

  const currentRegion = selectedRegions ? selectedRegions[activeRegionIndex] || selectedRegions[0] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .bv-container {
          width: 100vw;
          height: 100vh;
          background: #000000;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          user-select: none;
        }

        /* Subtle background grid & vignette */
        .bv-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.95) 75%),
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 100% 100%, 48px 48px, 48px 48px;
          pointer-events: none;
          z-index: 1;
        }

        /* ── TOP NAV BAR ── */
        .bv-navbar {
          height: 48px;
          padding: 0 20px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: #000000;
          z-index: 40;
          flex-shrink: 0;
        }

        .bv-nav-left {
          display: flex;
          align-items: center;
          height: 48px;
          padding-left: 20px;
        }

        .bv-nav-left.sidebar-open {
          width: 320px;
          padding: 0 16px;
          border-right: 1px solid rgba(255,255,255,0.08);
          justify-content: space-between;
          background: #000000;
          flex-shrink: 0;
        }

        .bv-sidebar-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bv-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-right: 4px;
        }

        .bv-nav-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: #000000;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.22);
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bv-nav-btn:hover {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 16px rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .bv-discover-btn {
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          font-weight: 600;
        }

        .bv-discover-btn:hover {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }

        .bv-btn-432hz {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bv-btn-432hz:hover {
          background: #ffffff;
          border-color: #ffffff;
          color: #000000;
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }

        .bv-btn-432hz.active {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
        }

        .bv-pill-eq {
          display: inline-flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 12px;
          flex-shrink: 0;
        }

        .bv-pill-eq .bv-eq-bar {
          width: 2px;
          background-color: currentColor;
          border-radius: 1px;
        }

        .bv-pill-eq .bar-1 { height: 5px; }
        .bv-pill-eq .bar-2 { height: 11px; }
        .bv-pill-eq .bar-3 { height: 7px; }

        .bv-pill-eq.playing .bar-1 {
          animation: bvEqAnim 1.2s infinite ease-in-out;
        }
        .bv-pill-eq.playing .bar-2 {
          animation: bvEqAnim 0.9s infinite ease-in-out 0.2s;
        }
        .bv-pill-eq.playing .bar-3 {
          animation: bvEqAnim 1.4s infinite ease-in-out 0.4s;
        }

        .bv-pill-eq.paused .bv-eq-bar {
          animation-play-state: paused !important;
          opacity: 0.5;
        }

        @keyframes bvEqAnim {
          0%, 100% { height: 3px; }
          50% { height: 12px; }
        }

        .bv-nav-btn-primary {
          background: #000000;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.22);
          font-weight: 600;
        }

        .bv-nav-btn-primary:hover {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 16px rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        /* ── MAIN WORKSPACE ── */
        .bv-workspace {
          flex: 1 1 0%;
          height: calc(100vh - 48px);
          min-height: 0;
          position: relative;
          overflow: hidden;
          z-index: 10;
        }

        /* ── LEFT SIDEBAR (Cinematic Floating Drawer) ── */
        .bv-sidebar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 320px;
          height: 100%;
          max-height: 100%;
          min-height: 0;
          background: rgba(10, 10, 10, 0.94);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          transform: translateX(0);
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 25;
          box-shadow: 20px 0 50px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          user-select: auto;
        }

        .bv-sidebar.collapsed {
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }

        .bv-sidebar-search {
          padding: 6px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .bv-search-input {
          width: 100%;
          padding: 7px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff;
          font-size: 12px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .bv-search-input:focus {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.07);
        }

        .bv-filter-container {
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.95);
          z-index: 5;
          flex-shrink: 0;
          overflow: hidden;
        }

        .bv-filter-pills {
          display: flex;
          gap: 6px;
          padding: 10px 32px 10px 14px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 78%, transparent 98%);
          mask-image: linear-gradient(90deg, #000 0%, #000 78%, transparent 98%);
        }

        .bv-filter-pills::-webkit-scrollbar {
          display: none;
        }

        .bv-filter-shadow-right {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 32px;
          background: linear-gradient(90deg, transparent 0%, rgba(10, 10, 10, 0.98) 100%);
          pointer-events: none;
          z-index: 2;
        }

        .bv-filter-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bv-filter-pill:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.2);
        }

        .bv-filter-pill.active {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255,255,255,0.2);
        }

        .bv-region-list {
          flex: 1 1 0%;
          min-height: 0;
          max-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.25) transparent;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          user-select: auto;
        }

        .bv-region-list::-webkit-scrollbar {
          width: 6px;
        }

        .bv-region-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .bv-region-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .bv-region-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.45);
        }

        .bv-region-item {
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .bv-region-item:hover {
          background: rgba(255, 255, 255, 0.055);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(2px);
        }

        .bv-region-item.active {
          background: #ffffff !important;
          border-color: #ffffff !important;
          color: #000000 !important;
          box-shadow: 0 6px 24px rgba(255, 255, 255, 0.25);
          transform: translateX(4px);
        }

        .bv-region-item.active .bv-item-name {
          color: #000000 !important;
        }

        .bv-region-item.active .bv-item-summary {
          color: #3f3f46 !important;
        }

        .bv-region-item.active .bv-item-badge {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
        }

        .bv-region-item.active .bv-mini-chip {
          background: rgba(0, 0, 0, 0.07) !important;
          color: #18181b !important;
          border-color: rgba(0, 0, 0, 0.14) !important;
          font-weight: 600;
        }

        .bv-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .bv-item-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
          transition: color 0.15s;
        }

        .bv-item-badge {
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: rgba(255, 255, 255, 0.55);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2px 7px;
          border-radius: 4px;
          white-space: nowrap;
          transition: all 0.15s;
        }

        .bv-item-summary {
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.15s;
        }

        .bv-item-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }

        .bv-mini-chip {
          font-size: 10.5px;
          padding: 2.5px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #d4d4d8;
          text-transform: capitalize;
          letter-spacing: 0.01em;
        }

        /* ── CANVAS 3D STAGE (Stable Full-Bleed 3D Viewport) ── */
        .bv-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 5;
          overflow: hidden;
          animation: bvStageIntro 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes bvStageIntro {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Live Hover Tooltip */
        .bv-hover-badge {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          padding: 8px 18px;
          background: rgba(12,12,12,0.85);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
          pointer-events: none;
        }

        /* Floating HUD Control Dock - Always dead-center */
        .bv-control-dock {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(14, 14, 14, 0.85);
          border: 1px solid rgba(255,255,255,0.14);
          padding: 6px 10px;
          border-radius: 100px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.7);
        }

        .bv-dock-btn {
          padding: 7px 14px;
          border-radius: 100px;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bv-dock-btn:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.08);
        }

        .bv-dock-btn.active {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }

        .bv-dock-divider {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.12);
        }

        /* Toggle Sidebar Button */
        .bv-toggle-sidebar {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 20;
          padding: 8px 12px;
          background: rgba(12,12,12,0.8);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: rgba(255,255,255,0.8);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bv-toggle-sidebar:hover {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
        }

        /* ── RIGHT INSPECTOR PANEL (SLIDE-IN GLASS CARD) ── */
        .bv-inspector {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 440px;
          max-width: 100vw;
          height: 100%;
          max-height: 100%;
          min-height: 0;
          background: rgba(10, 10, 10, 0.94);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-left: 1px solid rgba(255,255,255,0.12);
          display: flex;
          flex-direction: column;
          z-index: 30;
          box-shadow: -20px 0 60px rgba(0,0,0,0.85);
          animation: bv-slideLeft 0.55s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          user-select: auto;
        }

        @keyframes bv-slideLeft {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .bv-inspector-header {
          padding: 24px 28px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }

        .bv-insp-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .bv-insp-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #ffffff;
          padding: 3px 10px;
          border-radius: 100px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
        }

        .bv-close-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.15s;
        }

        .bv-close-icon-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .bv-insp-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .bv-insp-summary {
          font-size: 13.5px;
          line-height: 1.6;
          color: #a1a1aa;
        }

        /* Sibling Sub-structures Switcher */
        .bv-sibling-tabs {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .bv-sibling-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }

        .bv-sibling-btn.active {
          background: rgba(255,255,255,0.15);
          color: #ffffff;
          border-color: rgba(255,255,255,0.4);
        }

        /* Tab Switcher */
        .bv-insp-tabs {
          display: flex;
          padding: 12px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 12px;
        }

        .bv-insp-tab {
          flex: 1;
          padding: 9px 8px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          letter-spacing: 0.02em;
        }

        .bv-insp-tab:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.04);
        }

        .bv-insp-tab.active {
          background: #ffffff;
          color: #000000;
          box-shadow: 0 2px 10px rgba(255,255,255,0.15);
        }

        /* Inspector Body Content */
        .bv-insp-body {
          flex: 1 1 0%;
          min-height: 0;
          max-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px 28px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.25) transparent;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          user-select: auto;
        }

        .bv-insp-body::-webkit-scrollbar {
          width: 6px;
        }

        .bv-insp-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .bv-insp-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .bv-insp-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.45);
        }

        .bv-section-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 16px;
        }

        .bv-card-title {
          font-size: 11.5px;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.45);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bv-tag-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .bv-chip {
          padding: 7px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 12.5px;
          font-weight: 500;
          color: #e4e4e7;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: capitalize;
        }

        .bv-chip-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ffffff;
        }

        .bv-action-list {
          list-style: none;
        }

        .bv-action-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
          color: #d4d4d8;
          line-height: 1.5;
        }

        .bv-action-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .bv-action-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #000000;
          background: #ffffff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Inspector Footer */
        .bv-insp-footer {
          padding: 20px 28px 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(8, 8, 8, 0.9);
        }

        .bv-ai-protocol-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: #ffffff;
          color: #000000;
          border: 1px solid #ffffff;
          font-size: 13.5px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.18s ease;
        }

        .bv-ai-protocol-btn:hover {
          background: #e4e4e7;
          box-shadow: 0 0 24px rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .bv-dismiss-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .bv-dismiss-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #ffffff;
        }

        /* Empty state floating pill */
        .bv-empty-hint {
          position: absolute;
          top: 30px;
          right: 32px;
          background: rgba(12,12,12,0.8);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 14px 20px;
          max-width: 260px;
          backdrop-filter: blur(16px);
          z-index: 15;
          pointer-events: none;
        }

        .bv-empty-title {
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bv-empty-desc {
          font-size: 11.5px;
          color: rgba(255,255,255,0.5);
          line-height: 1.4;
        }
      `}</style>

      <div className="bv-container" data-lenis-prevent="true">
        <div className="bv-bg-grid" />

        {/* ── TOP NAV BAR ── */}
        <header className="bv-navbar">
          <div className={`bv-nav-left${sidebarOpen ? " sidebar-open" : ""}`}>
            {sidebarOpen ? (
              <>
                <span className="bv-sidebar-title">Discover Regions</span>
                <button
                  className="bv-close-icon-btn"
                  aria-label="Collapse Sidebar"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                className="bv-nav-btn bv-discover-btn"
                onClick={handleOpenSidebar}
                aria-label="Discover Regions"
              >
                <span>Discover Regions</span>
              </button>
            )}
          </div>

          <div className="bv-nav-right">
            <SoundPill />
            <button className="bv-nav-btn" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="bv-nav-btn" onClick={() => navigate("/results")}>
              Profile Results
            </button>
            <button
              className="bv-nav-btn bv-nav-btn-primary"
              onClick={handleRetakeAssessment}
            >
              Retake Assessment
            </button>
          </div>
        </header>

        {/* ── MAIN WORKSPACE ── */}
        <main className="bv-workspace" data-lenis-prevent="true">
          {/* ── LEFT ANATOMICAL SIDEBAR ── */}
          <aside className={`bv-sidebar${sidebarOpen ? "" : " collapsed"}`} data-lenis-prevent="true">
            <div className="bv-filter-container">
              <div className="bv-filter-pills">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`bv-filter-pill${selectedCategory === cat.id ? " active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="bv-filter-shadow-right" />
            </div>

            <div
              className="bv-region-list"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              {filteredRegions.map((region) => {
                const isSelected =
                  currentRegion && currentRegion.id === region.id;
                return (
                  <div
                    key={region.id}
                    className={`bv-region-item${isSelected ? " active" : ""}`}
                    onClick={() => handleSelectFromList(region)}
                  >
                    <div className="bv-item-top">
                      <span className="bv-item-name">{region.name}</span>
                    </div>
                    <p className="bv-item-summary">{region.summary}</p>
                    {region.functions && region.functions.length > 0 && (
                      <div className="bv-item-chips">
                        {region.functions.slice(0, 2).map((fn, i) => (
                          <span key={i} className="bv-mini-chip">
                            {fn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── 3D CANVAS STAGE ── */}
          <section className="bv-stage">
            {/* Live Hover Tooltip */}
            {hoveredRegionName && (
              <div className="bv-hover-badge">
                <span>{hoveredRegionName}</span>
              </div>
            )}

            {/* Empty State Guide if no selection */}
            {!selectedRegions && (
              <div className="bv-empty-hint">
                <div className="bv-empty-title">
                  Spatial Exploration
                </div>
                <div className="bv-empty-desc">
                  Left click & drag to rotate. Click any anatomical lobe to reveal deep clinical and cognitive insights.
                </div>
              </div>
            )}

            {/* 3D WebGL Canvas */}
            <Canvas camera={{ position: [0, 0, 7.2], fov: 42 }}>
              <CinematicCameraController
                cameraTarget={cameraTarget}
                orbitRef={orbitRef}
              />
              <CinematicLightingRig introSharedRef={introSharedRef} />

              <Suspense fallback={null}>
                <CinematicBrainRig
                  sidebarOpen={sidebarOpen}
                  inspectorOpen={Boolean(selectedRegions && currentRegion)}
                  onRegionDetected={handleRegionDetected}
                  onHoverRegion={handleHoverRegion}
                  currentRegion={currentRegion}
                  meshRegionMap={meshRegionMap}
                  resetHighlight={resetHighlight}
                  wireframe={wireframe}
                  introSharedRef={introSharedRef}
                />
              </Suspense>

              <OrbitControls
                ref={orbitRef}
                enablePan={false}
                makeDefault
                target={[0, 0, 0]}
                autoRotate={autoRotate}
                autoRotateSpeed={0.25}
                maxDistance={12}
                minDistance={2.5}
                enableDamping
                dampingFactor={0.06}
              />
            </Canvas>

            {/* Bottom HUD Controls Deck (Always dead center) */}
            <div className="bv-control-dock">
              <button
                className="bv-dock-btn"
                onClick={handleResetCamera}
              >
                Reset
              </button>
              <div className="bv-dock-divider" />
              <button
                className={`bv-dock-btn${autoRotate ? " active" : ""}`}
                onClick={() => setAutoRotate(!autoRotate)}
              >
                {autoRotate ? "Orbiting" : "Rotate"}
              </button>
              <button
                className={`bv-dock-btn${wireframe ? " active" : ""}`}
                onClick={() => setWireframe(!wireframe)}
              >
                Wireframe
              </button>
            </div>
          </section>

          {/* ── RIGHT INSPECTOR DRAWER ── */}
          {selectedRegions && currentRegion && (
            <aside className="bv-inspector" data-lenis-prevent="true">
              <div className="bv-inspector-header">
                <div className="bv-insp-top-meta">
                  <span className="bv-insp-tag">Mindful Brain Sanctuary</span>
                  <button className="bv-close-icon-btn" onClick={handleClose}>
                    ✕
                  </button>
                </div>

                <h2 className="bv-insp-title">{currentRegion.name}</h2>
                <p className="bv-insp-summary">{currentRegion.summary}</p>
              </div>

              {/* Tab Navigation */}
              <div className="bv-insp-tabs">
                <button
                  className={`bv-insp-tab${activeTab === "functions" ? " active" : ""}`}
                  onClick={() => setActiveTab("functions")}
                >
                  Natural Gifts
                </button>
                <button
                  className={`bv-insp-tab${activeTab === "impact" ? " active" : ""}`}
                  onClick={() => setActiveTab("impact")}
                >
                  Body Harmony
                </button>
                <button
                  className={`bv-insp-tab${activeTab === "improve" ? " active" : ""}`}
                  onClick={() => setActiveTab("improve")}
                >
                  Loving Care
                </button>
              </div>

              {/* Tab Content Body */}
              <div
                className="bv-insp-body"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                {activeTab === "functions" && (
                  <div className="bv-section-card">
                    <div className="bv-card-title">
                      How This Area Cares For You
                    </div>
                    <div className="bv-tag-grid">
                      {currentRegion.functions && currentRegion.functions.length > 0 ? (
                        currentRegion.functions.map((fn, idx) => (
                          <div key={idx} className="bv-chip">
                            <span className="bv-chip-dot" />
                            <span>{fn}</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          Gently supports your overall well-being.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "impact" && (
                  <div className="bv-section-card">
                    <div className="bv-card-title">
                      Mind-Body Connection & Vitality
                    </div>
                    <div className="bv-tag-grid">
                      {currentRegion.organs && currentRegion.organs.length > 0 ? (
                        currentRegion.organs.map((org, idx) => (
                          <div key={idx} className="bv-chip">
                            <span className="bv-chip-dot" />
                            <span>{org}</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          Keeps your body aligned and in restful harmony.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "improve" && (
                  <div className="bv-section-card">
                    <div className="bv-card-title">
                      Gentle Daily Habits & Self-Care
                    </div>
                    <ul className="bv-action-list">
                      {currentRegion.improve && currentRegion.improve.length > 0 ? (
                        currentRegion.improve.map((tip, idx) => (
                          <li key={idx} className="bv-action-item">
                            <span className="bv-action-num">{idx + 1}</span>
                            <span>{tip}</span>
                          </li>
                        ))
                      ) : (
                        <li className="bv-action-item">
                          <span>Restful sleep and gentle compassionate care.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Inspector Action Footer */}
              <div className="bv-insp-footer">
                <button
                  className="bv-ai-protocol-btn"
                  onClick={() => navigate("/improve", { state: { region: currentRegion } })}
                >
                  <span>Generate Personalized Care Plan</span>
                  <span>→</span>
                </button>
                <button className="bv-dismiss-btn" onClick={handleClose}>
                  Done For Now
                </button>
              </div>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}