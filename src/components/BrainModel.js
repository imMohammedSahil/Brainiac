import React, { useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

export default function BrainModel({ onRegionDetected, resetHighlight }) {
  const { scene } = useGLTF("/models/brain.glb");
  const [activeMesh, setActiveMesh] = useState(null);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      child.material = child.material.clone();
      child.userData.originalColor = child.material.color.clone();
    });
  }, [scene]);

  // ✅ reset highlight when popup closes
  useEffect(() => {
    if (!resetHighlight || !activeMesh) return;

    activeMesh.material.color.copy(activeMesh.userData.originalColor);
    setActiveMesh(null);
  }, [resetHighlight]);

  const handleClick = (e) => {
    e.stopPropagation();

    const mesh = e.object;
    if (!mesh.isMesh || !mesh.material) return;

    // restore previous highlight
    if (activeMesh && activeMesh !== mesh) {
      activeMesh.material.color.copy(activeMesh.userData.originalColor);
    }

    // highlight clicked mesh
    mesh.material.color.set("#ff4d4d");
    setActiveMesh(mesh);

    console.log("Mesh clicked:", mesh.name);

    if (onRegionDetected) onRegionDetected(mesh.name);
  };

  return <primitive object={scene} onClick={handleClick} />;
}