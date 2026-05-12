import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BrainModel from "./BrainModel";

export default function BrainScene() {
  const [region, setRegion] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} />

        {/* 👇 receives region clicks */}
        <BrainModel onRegionClick={setRegion} />

        <OrbitControls />
      </Canvas>

      {/* SIMPLE POPUP (TEST) */}
      {region && (
        <div
          onClick={() => setRegion(null)}
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            color: "black",
            padding: "30px",
            borderRadius: "12px",
            fontWeight: "bold",
            zIndex: 9999,
            cursor: "pointer"
          }}
        >
          YOU CLICKED: {region}
          <br />
          <small>(click to close)</small>
        </div>
      )}
      
    </div>
  );
}