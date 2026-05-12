import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BrainModel from "../components/BrainModel";
import { meshRegionMap } from "../data/meshRegionMap";
import { brainRegions } from "../data/brainRegions";
import { useNavigate } from "react-router-dom";

export default function BrainView() {
  const navigate = useNavigate();

  const [resetHighlight, setResetHighlight] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);

  // ✅ reset tab when new region selected
  useEffect(() => {
    setActiveTab(null);
  }, [selectedRegions]);

  // Animate popup in
  useEffect(() => {
    if (selectedRegions) {
      requestAnimationFrame(() => setPopupVisible(true));
    } else {
      setPopupVisible(false);
    }
  }, [selectedRegions]);

  const handleClose = () => {
  setPopupVisible(false);

  // reset highlight
  setResetHighlight(true);
  setTimeout(() => setResetHighlight(false), 50);

  setTimeout(() => setSelectedRegions(null), 280);
};

  const handleRegionDetected = (meshName) => {
    const lower = meshName.toLowerCase();

    for (let key in meshRegionMap) {
      if (lower.includes(key)) {
        const ids = meshRegionMap[key];
        const regionData = brainRegions.filter((r) => ids.includes(r.id));
        if (regionData.length > 0) {
  setSelectedRegions(regionData);
}
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .brainview-root {
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at 40% 50%, #0b0f1e 0%, #060810 60%, #000 100%);
          position: relative;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        /* HUD label top-left */
        .brainview-hud {
          position: absolute;
          top: 28px;
          left: 32px;
          z-index: 10;
          pointer-events: none;
        }
        .brainview-hud-tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #818cf8;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          padding: 5px 14px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .brainview-hud-subtitle {
          display: block;
          font-size: 12px;
          color: rgba(148,163,184,0.6);
          letter-spacing: 0.05em;
        }

        /* Hint bottom-center */
        .brainview-hint {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          pointer-events: none;
          font-size: 12px;
          color: rgba(148,163,184,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Overlay */
        .bv-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          background: rgba(0,0,0,0);
          transition: background 0.28s ease;
        }
        .bv-overlay.visible {
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }

        /* Card */
        .bv-card {
          background: linear-gradient(145deg, rgba(13,17,32,0.97) 0%, rgba(9,12,24,0.98) 100%);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          padding: 32px;
          max-width: 440px;
          width: 90%;
          color: #e2e8f0;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 20px 60px rgba(0,0,0,0.7),
            0 0 40px rgba(99,102,241,0.12);
          max-height: 82vh;
          overflow-y: auto;
          opacity: 0;
          transform: scale(0.93) translateY(10px);
          transition: opacity 0.28s ease, transform 0.28s ease;
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.3) transparent;
        }
        .bv-card.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        /* Region block */
        .bv-region {
          margin-bottom: 24px;
        }
        .bv-region + .bv-region {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 24px;
        }

        /* Region header */
        .bv-region-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .bv-region-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #818cf8;
          box-shadow: 0 0 8px #6366f1;
          flex-shrink: 0;
        }
        .bv-region-name {
          font-size: 18px;
          font-weight: 700;
          color: #a5b4fc;
          letter-spacing: 0.01em;
          margin: 0;
        }
        .bv-region-summary {
          font-size: 13.5px;
          line-height: 1.7;
          color: #94a3b8;
          margin: 0 0 16px;
        }

        /* Option buttons */
        .bv-btn-row {
          display: flex;
          gap: 10px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .bv-opt-btn {
          padding: 9px 18px;
          border-radius: 10px;
          border: 1px solid rgba(99,102,241,0.3);
          background: rgba(99,102,241,0.1);
          color: #a5b4fc;
          font-size: 12.5px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.15s, box-shadow 0.18s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bv-opt-btn:hover {
          background: rgba(99,102,241,0.22);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 16px rgba(99,102,241,0.2);
          transform: translateY(-1px);
        }
        .bv-opt-btn.active {
          background: rgba(99,102,241,0.28);
          border-color: rgba(99,102,241,0.6);
          color: #c7d2fe;
        }
        .bv-improve-btn {
          padding: 9px 18px;
          border-radius: 10px;
          border: 1px solid rgba(56,189,248,0.3);
          background: rgba(56,189,248,0.08);
          color: #7dd3fc;
          font-size: 12.5px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.15s, box-shadow 0.18s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bv-improve-btn:hover {
          background: rgba(56,189,248,0.18);
          border-color: rgba(56,189,248,0.5);
          box-shadow: 0 0 16px rgba(56,189,248,0.2);
          transform: translateY(-1px);
        }

        /* Dynamic section */
        .bv-section {
          margin-top: 14px;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          line-height: 1.65;
          font-size: 13.5px;
          color: #94a3b8;
        }
        .bv-section ul {
          margin: 0;
          padding-left: 18px;
        }
        .bv-section li {
          margin-bottom: 6px;
          color: #94a3b8;
        }
        .bv-section li::marker {
          color: #6366f1;
        }
        .bv-placeholder {
          opacity: 0.45;
          font-style: italic;
        }

        /* Close button */
        .bv-close-btn {
          margin-top: 24px;
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.08) 100%);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 12px;
          color: #a5b4fc;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.15s;
        }
        .bv-close-btn:hover {
          background: rgba(99,102,241,0.22);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 20px rgba(99,102,241,0.2);
          transform: translateY(-1px);
        }

        /* Divider */
        .bv-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent);
          margin: 22px 0 20px;
        }
      `}</style>

      <div className="brainview-root">
        {/* HUD */}
        <div className="brainview-hud">
          <span className="brainview-hud-tag">Brainiac</span>
          <span className="brainview-hud-subtitle">Neural Explorer</span>
        </div>

        {/* Hint */}
        <div className="brainview-hint">Click a region to explore</div>

        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 4, 3]} intensity={1.0} color="#e8eeff" />
          <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#a5b4fc" />
          <pointLight position={[0, 3, 4]} intensity={0.5} color="#818cf8" />
          <hemisphereLight skyColor="#1e2050" groundColor="#000010" intensity={0.4} />

          <Suspense fallback={null}>
            <BrainModel
              onRegionDetected={handleRegionDetected}
              resetHighlight={resetHighlight}
            />
          </Suspense>

          <OrbitControls enablePan={false} />
        </Canvas>

        {/* POPUP */}
        {selectedRegions && (
          <div className={`bv-overlay${popupVisible ? " visible" : ""}`}>
            <div className={`bv-card${popupVisible ? " visible" : ""}`}>
              {selectedRegions.map((region, idx) => (
                <div key={region.id} className="bv-region">
                  <div className="bv-region-header">
                    <span className="bv-region-dot" />
                    <h2 className="bv-region-name">{region.name}</h2>
                  </div>

                  <p className="bv-region-summary">{region.summary}</p>

                  {/* Option Buttons */}
                  <div className="bv-btn-row">
                    <button
                      className={`bv-opt-btn${activeTab === "impact" ? " active" : ""}`}
                      onClick={() => setActiveTab("impact")}
                    >
                      🧬 Body Impact
                    </button>
                    <button
                      className="bv-improve-btn"
                      onClick={() => navigate("/improve", { state: { region } })}
                    >
                      🧠 Improve Function
                    </button>
                  </div>

                  {/* Dynamic Content */}
                  <div className="bv-section">
                    {activeTab === "impact" && (
                      <ul>
                        {region.organs.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    )}
                    {activeTab === "improve" && (
                      <ul>
                        {region.improve.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    )}
                    {!activeTab && (
                      <p className="bv-placeholder">Select an option to view insights.</p>
                    )}
                  </div>

                  {idx < selectedRegions.length - 1 && <div className="bv-divider" />}
                </div>
              ))}

              <button className="bv-close-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}