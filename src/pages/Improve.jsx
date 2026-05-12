import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ResultModal from "../components/ResultModal";

export default function Improve() {
  const location = useLocation();
  const region = location.state?.region;

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [focused, setFocused] = useState(false);

  if (!region) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="ip-container">
          <div className="ip-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>⚠</div>
            <h2 style={{ color: "#a5b4fc", marginBottom: "10px" }}>No Region Selected</h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Please go back and select a brain region.</p>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert("Please describe your situation.");
      return;
    }

    setLoading(true);

    try {
      const prompt = `
Provide clear, point-wise advice to improve the ${region.name}.

FORMAT RULES:
- Use section headings
- Leave spacing between sections
- Use dash bullet points
- Keep points concise
- Avoid long paragraphs

User issue:
${userInput}
`;

      const response = await fetch("http://localhost:5000/ai-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      let aiText = data.result || "AI did not return a response.";

      /* ===== FORCE CLEAN STRUCTURE ===== */
      aiText = aiText.replace(/\*\*/g, "");
      aiText = aiText.replace(/([A-Z][A-Za-z &]+:)/g, "\n\n$1");
      aiText = aiText.replace(/ - /g, "\n- ");
      aiText = aiText.replace(/\n\s*\n\s*-/g, "\n- ");
      aiText = aiText.replace(/\n{3,}/g, "\n\n");

      setAiResult(aiText.trim());
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("AI request failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <style>{baseStyles}</style>

      <div className="ip-container">
        {/* Background glows */}
        <div className="ip-glow1" />
        <div className="ip-glow2" />

        <div className="ip-card">
          {/* Header */}
          <div className="ip-header">
            <span className="ip-tag">Brainiac</span>
            <h1 className="ip-title">Improve Brain Function</h1>
            <p className="ip-subtitle">Personalized neural improvement guidance</p>
          </div>

          {/* Region Info */}
          <div className="ip-region-box">
            <div className="ip-region-header">
              <span className="ip-region-dot" />
              <span className="ip-region-label">Selected Region</span>
            </div>
            <h2 className="ip-region-name">{region.name}</h2>
            <p className="ip-region-summary">{region.summary}</p>
          </div>

          {/* Divider */}
          <div className="ip-divider" />

          {/* Input */}
          <label className="ip-label">
            Describe your habits, symptoms, or challenges
          </label>
          <textarea
            className={`ip-textarea${focused ? " focused" : ""}`}
            placeholder="Example: I have eye strain and spend long hours gaming..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* Submit */}
          <button
            className={`ip-btn${loading ? " loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="ip-btn-inner">
                <span className="ip-spinner" />
                Analyzing…
              </span>
            ) : (
              <span className="ip-btn-inner">
                <span>⚡</span>
                Analyze &amp; Suggest Improvements
              </span>
            )}
          </button>
        </div>
      </div>

      {showModal && (
        <ResultModal
          result={aiResult}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes ipFadeIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ipSpin {
    to { transform: rotate(360deg); }
  }

  .ip-container {
    min-height: 100vh;
    background: radial-gradient(ellipse at 35% 40%, #0b0f1e 0%, #060810 55%, #000 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .ip-glow1 {
    position: fixed; top: -180px; left: -180px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .ip-glow2 {
    position: fixed; bottom: -160px; right: -100px;
    width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .ip-card {
    background: linear-gradient(145deg, rgba(13,17,32,0.97) 0%, rgba(9,12,24,0.98) 100%);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 22px;
    padding: 40px 36px;
    max-width: 580px;
    width: 100%;
    color: #e2e8f0;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03),
      0 24px 64px rgba(0,0,0,0.7),
      0 0 40px rgba(99,102,241,0.1);
    animation: ipFadeIn 0.6s ease both;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .ip-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .ip-tag {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #818cf8;
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.22);
    border-radius: 20px;
    padding: 4px 14px;
    display: inline-block;
    margin-bottom: 14px;
  }
  .ip-title {
    font-size: 24px;
    font-weight: 700;
    color: #e2e8f0;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }
  .ip-subtitle {
    font-size: 13px;
    color: #475569;
    margin: 0;
    letter-spacing: 0.04em;
  }

  /* Region box */
  .ip-region-box {
    background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%);
    border: 1px solid rgba(99,102,241,0.22);
    border-radius: 14px;
    padding: 22px 22px 20px;
    margin-bottom: 26px;
  }
  .ip-region-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .ip-region-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #818cf8;
    box-shadow: 0 0 7px #6366f1;
    flex-shrink: 0;
  }
  .ip-region-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6366f1;
  }
  .ip-region-name {
    font-size: 20px;
    font-weight: 700;
    color: #a5b4fc;
    margin: 0 0 10px;
    letter-spacing: -0.01em;
  }
  .ip-region-summary {
    font-size: 13.5px;
    line-height: 1.7;
    color: #94a3b8;
    margin: 0;
  }

  /* Divider */
  .ip-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent);
    margin-bottom: 26px;
  }

  /* Label */
  .ip-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 12px;
  }

  /* Textarea */
  .ip-textarea {
    width: 100%;
    min-height: 130px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px;
    font-size: 14px;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    color: #e2e8f0;
    line-height: 1.65;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    margin-bottom: 22px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .ip-textarea::placeholder {
    color: #334155;
  }
  .ip-textarea.focused {
    border-color: rgba(99,102,241,0.45);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 0 18px rgba(99,102,241,0.08);
  }

  /* Button */
  .ip-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    border-radius: 13px;
    color: #fff;
    font-size: 14.5px;
    font-weight: 600;
    font-family: inherit;
    letter-spacing: 0.03em;
    cursor: pointer;
    box-shadow: 0 0 28px rgba(99,102,241,0.35), 0 4px 20px rgba(0,0,0,0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }
  .ip-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 40px rgba(99,102,241,0.5), 0 8px 28px rgba(0,0,0,0.5);
  }
  .ip-btn:disabled {
    opacity: 0.75;
    cursor: default;
  }
  .ip-btn-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }

  /* Spinner */
  .ip-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ipSpin 0.7s linear infinite;
    display: inline-block;
  }
`;