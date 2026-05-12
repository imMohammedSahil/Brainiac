import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";
import { calculateScores } from "../utils/scoring";
import { TEST_PROFILES } from "../config/testProfiles";

export default function Questionnaire() {
  const navigate = useNavigate();

  const DEV_MODE = false; // keep false for real flow

  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fading, setFading] = useState(false);

  const question = questions[current];
  const progress = ((current) / questions.length) * 100;

  const handleNext = () => {
    const updated = { ...answers, [question.id]: selected };
    setAnswers(updated);

    if (current < questions.length - 1) {
      setFading(true);
      setTimeout(() => {
        setSelected(null);
        setCurrent(current + 1);
        setFading(false);
      }, 220);
    } else {
      finishAssessment(updated);
    }
  };

  const finishAssessment = (finalAnswers) => {
    const scores = calculateScores(finalAnswers);
    navigate("/results", { state: scores });
  };

  return (
    <>
      <style>{styles}</style>

      <div className="q-container">
        {/* Background glows */}
        <div className="q-glow1" />
        <div className="q-glow2" />

        {DEV_MODE && (
          <button
            className="q-skip-btn"
            onClick={() =>
              finishAssessment(
                Object.fromEntries(
                  questions.map((q, i) => [q.id, TEST_PROFILES.visual_demo[i]])
                )
              )
            }
          >
            Skip Assessment
          </button>
        )}

        <div className="q-card">
          {/* Card top accent */}
          <div className="q-card-accent" />

          {/* Header row */}
          <div className="q-header">
            <span className="q-badge">Brainiac</span>
            <span className="q-header-label">Brain Health Assessment</span>
          </div>

          {/* Progress */}
          <div className="q-progress-wrap">
            <div className="q-progress-meta">
              <span className="q-progress-label">Progress</span>
              <span className="q-progress-count">
                {current + 1} <span style={{ color: "#334155" }}>/ {questions.length}</span>
              </span>
            </div>
            <div className="q-progress-track">
              <div
                className="q-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="q-divider" />

          {/* Question */}
          <div className={`q-body${fading ? " fading" : ""}`}>
            <p className="q-number">Question {current + 1}</p>
            <h2 className="q-text">{question.text}</h2>

            {/* Options */}
            <div className="q-options">
              {question.options.map((opt) => {
                const isSelected = selected === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`q-option${isSelected ? " selected" : ""}`}
                    onClick={() => setSelected(opt.value)}
                  >
                    <span className={`q-option-dot${isSelected ? " selected" : ""}`} />
                    <span className="q-option-label">{opt.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Next button */}
            <button
              className={`q-btn${selected === null ? " disabled" : ""}`}
              onClick={handleNext}
              disabled={selected === null}
            >
              {current === questions.length - 1 ? "Complete Assessment" : "Continue"}
              <span className="q-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes qFadeIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .q-container {
    min-height: 100vh;
    background: radial-gradient(ellipse at 25% 30%, #0c1022 0%, #060810 55%, #000 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px 20px;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .q-glow1 {
    position: fixed; top: -160px; left: -160px;
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .q-glow2 {
    position: fixed; bottom: -160px; right: -80px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Skip button (dev) */
  .q-skip-btn {
    position: absolute;
    top: 20px; right: 20px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.12);
    color: #a5b4fc;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    z-index: 10;
  }

  /* Card */
  .q-card {
    background: linear-gradient(150deg, rgba(13,17,32,0.97) 0%, rgba(9,12,24,0.98) 100%);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 22px;
    width: 100%;
    max-width: 680px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03),
      0 28px 70px rgba(0,0,0,0.7),
      0 0 44px rgba(99,102,241,0.1);
    animation: qFadeIn 0.55s cubic-bezier(0.22,1,0.36,1) both;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  /* Top accent glow line */
  .q-card-accent {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 55%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.55), transparent);
  }

  /* Header */
  .q-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px 0;
  }
  .q-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #818cf8;
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.22);
    border-radius: 20px;
    padding: 4px 13px;
  }
  .q-header-label {
    font-size: 11px;
    color: #475569;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 500;
  }

  /* Progress */
  .q-progress-wrap {
    padding: 20px 28px 0;
  }
  .q-progress-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }
  .q-progress-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #475569;
  }
  .q-progress-count {
    font-size: 13px;
    font-weight: 600;
    color: #818cf8;
  }
  .q-progress-track {
    height: 3px;
    background: rgba(255,255,255,0.05);
    border-radius: 99px;
    overflow: hidden;
  }
  .q-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #818cf8);
    border-radius: 99px;
    box-shadow: 0 0 8px rgba(99,102,241,0.5);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Divider */
  .q-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    margin: 20px 0 0;
  }

  /* Body (fades on question change) */
  .q-body {
    padding: 26px 28px 30px;
    transition: opacity 0.2s ease;
  }
  .q-body.fading {
    opacity: 0;
  }

  .q-number {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6366f1;
    margin: 0 0 10px;
  }

  .q-text {
    font-size: 20px;
    font-weight: 600;
    color: #e2e8f0;
    line-height: 1.55;
    letter-spacing: -0.01em;
    margin: 0 0 26px;
  }

  /* Options */
  .q-options {
    display: flex;
    flex-direction: column;
    gap: 11px;
    margin-bottom: 26px;
  }

  .q-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 15px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.025);
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease,
                box-shadow 0.18s ease, transform 0.15s ease;
    color: #94a3b8;
    font-size: 14.5px;
    line-height: 1.5;
    user-select: none;
  }
  .q-option:hover {
    border-color: rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.06);
    transform: translateY(-1px);
    color: #c7d2fe;
  }
  .q-option.selected {
    border-color: rgba(99,102,241,0.55);
    background: rgba(99,102,241,0.12);
    box-shadow: 0 0 0 1px rgba(99,102,241,0.2), 0 4px 20px rgba(99,102,241,0.12);
    color: #c7d2fe;
    transform: translateY(-1px);
  }

  /* Radio dot */
  .q-option-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
    background: transparent;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    position: relative;
  }
  .q-option-dot.selected {
    border-color: #818cf8;
    background: #6366f1;
    box-shadow: 0 0 8px rgba(99,102,241,0.6);
  }
  .q-option-dot.selected::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.9;
  }

  .q-option-label {
    flex: 1;
  }

  /* Next/Finish button */
  .q-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 0 26px rgba(99,102,241,0.35), 0 4px 18px rgba(0,0,0,0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }
  .q-btn:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 40px rgba(99,102,241,0.5), 0 8px 26px rgba(0,0,0,0.5);
  }
  .q-btn.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }
  .q-btn-arrow {
    font-size: 16px;
    line-height: 1;
    transition: transform 0.18s;
  }
  .q-btn:hover:not(.disabled) .q-btn-arrow {
    transform: translateX(3px);
  }
`;