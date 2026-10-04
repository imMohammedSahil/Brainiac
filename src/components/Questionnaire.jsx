import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";
import { calculateScores } from "../utils/scoring";
import { TEST_PROFILES } from "../config/testProfiles";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";
import SoundPill from "./SoundPill";

export default function Questionnaire() {
  const navigate = useNavigate();
  const DEV_MODE = false; // set to true only for instant debug
  const { audioPlaying, audioPaused, toggleAudio } = useSoundSanctuary();

  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [direction, setDirection] = useState("next");
  const [fading, setFading] = useState(false);
  const [showExpressModal, setShowExpressModal] = useState(false);

  const question = questions[current];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((current + 1) / totalQuestions) * 100);

  // Group sections to show pillar progress
  const sectionList = useMemo(() => {
    const list = [];
    questions.forEach((q) => {
      if (!list.includes(q.section)) list.push(q.section);
    });
    return list;
  }, []);

  const currentSectionIndex = sectionList.indexOf(question.section) + 1;
  const totalSections = sectionList.length;

  // Sync selection when navigating back/forward
  useEffect(() => {
    setSelected(answers[question.id] ?? null);
  }, [current, answers, question.id]);

  const handleSelectOption = useCallback((val) => {
    setSelected((prev) => (prev === val ? null : val));
  }, []);

  const finishAssessment = useCallback(
    (finalAnswers) => {
      const scores = calculateScores(finalAnswers);
      try {
        localStorage.setItem("brainiac_user_assessment_scores", JSON.stringify(scores));
        localStorage.removeItem("brainiac_saved_care_plans");
        sessionStorage.removeItem("brainiac_last_active_report");
      } catch (e) {}
      navigate("/results", { state: scores });
    },
    [navigate]
  );

  const handleExpressProceed = useCallback(() => {
    setShowExpressModal(false);
    const sampleAnswers = {};
    questions.forEach((q) => {
      // Pick random option from valid choices for realistic assessment profile
      const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
      sampleAnswers[q.id] = randomOpt.value;
    });
    finishAssessment(sampleAnswers);
  }, [finishAssessment]);

  const handleNext = useCallback(() => {
    if (selected === null) return;
    const updated = { ...answers, [question.id]: selected };
    setAnswers(updated);

    if (current < totalQuestions - 1) {
      setDirection("next");
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => prev + 1);
        setFading(false);
      }, 160);
    } else {
      finishAssessment(updated);
    }
  }, [selected, answers, question.id, current, totalQuestions, finishAssessment]);

  const handlePrev = useCallback(() => {
    if (current > 0) {
      setDirection("prev");
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => prev - 1);
        setFading(false);
      }, 160);
    }
  }, [current]);

  // Keyboard shortcut integration: Enter to proceed, Backspace/ArrowLeft to go back, Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showExpressModal) {
        if (e.key === "Escape") setShowExpressModal(false);
        return;
      }

      // Ignore if inside an input/textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.key === "Enter" && selected !== null) {
        handleNext();
      } else if (e.key === "Backspace" || e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, handleNext, handlePrev, showExpressModal]);

  return (
    <>
      <style>{styles}</style>

      <div className="q-page-root">
        {/* Ambient background glow & pattern */}
        <div className="q-bg-ambient-glow" />
        <div className="q-bg-grid" />

        {/* Top Floating Glass Navigation */}
        <header className="q-nav-bar">
          <div
            className="q-nav-left"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            aria-label="Exit Assessment"
          >
            <span className="q-back-arrow">←</span>
            <span className="q-nav-home-text">Exit Assessment</span>
          </div>

          <div className="q-nav-center">
            <div className="q-pillar-badge">
              <span>
                Pillar {String(currentSectionIndex).padStart(2, "0")}/{String(totalSections).padStart(2, "0")} · {question.section}
              </span>
            </div>
          </div>

          <div className="q-nav-right">
            <SoundPill />

            <div className="q-progress-digits-wrap">
              <span className="q-progress-current">{String(current + 1).padStart(2, "0")}</span>
              <span className="q-progress-divider">/</span>
              <span className="q-progress-total">{String(totalQuestions).padStart(2, "0")}</span>
            </div>
            <span className="q-progress-pct-badge">{progressPercent}%</span>
          </div>
        </header>

        {/* Global Precision Progress Track */}
        <div className="q-global-progress-track">
          <div
            className="q-global-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Center Stage */}
        <main className="q-stage-container">
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
              Skip All [Dev]
            </button>
          )}

          <div className={`q-question-flow ${fading ? `fade-out-${direction}` : "fade-in"}`}>
            {/* Question Header & Meta Row */}
            <div className="q-meta-row">
              <div className="q-meta-left">
                <span className="q-index-pill">
                  Question {String(current + 1).padStart(2, "0")}
                </span>
                <span className="q-meta-separator">/</span>
                <span className="q-section-name">{question.section}</span>
              </div>
            </div>

            {/* Master Question Headline */}
            <h1 className="q-headline">{question.text}</h1>

            {/* Options Stack */}
            <div className="q-options-stack">
              {question.options.map((opt, idx) => {
                const isSelected = selected === opt.value;
                const keyNumber = idx + 1;

                return (
                  <div
                    key={opt.value}
                    className={`q-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOption(opt.value)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectOption(opt.value);
                      }
                    }}
                  >
                    <div className="q-option-key-badge">
                      <span>{keyNumber}</span>
                    </div>
                    <span className="q-option-text">{opt.label}</span>
                    <div className={`q-option-radio-dot ${isSelected ? "selected" : ""}`}>
                      {isSelected ? (
                        <svg className="q-option-check-icon" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 7.2L5.8 10L11 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <div className="q-option-radio-inner" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Dock */}
            <div className="q-bottom-dock">
              <button
                className={`q-btn-ghost ${current === 0 ? "hidden" : ""}`}
                onClick={handlePrev}
                disabled={current === 0}
                aria-label="Previous question"
              >
                <span className="q-btn-arrow-left">←</span>
                <span>Previous</span>
              </button>

              <button
                className={`q-btn-continue ${selected === null ? "disabled" : ""}`}
                onClick={handleNext}
                disabled={selected === null}
              >
                <span>{current === totalQuestions - 1 ? "Complete Assessment" : "Continue"}</span>
                <span className="q-btn-arrow-right">→</span>
              </button>
            </div>
          </div>
        </main>

        {/* Floating Bottom-Right Recruiter Preview Pill */}
        <button
          className="q-floating-recruiter-btn"
          onClick={() => setShowExpressModal(true)}
          aria-label="Recruiter Preview"
        >
          Recruiter Preview
        </button>

        {/* Express Demo Modal Dialog */}
        {showExpressModal && (
          <div
            className="q-modal-backdrop"
            onClick={() => setShowExpressModal(false)}
          >
            <div
              className="q-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="express-modal-title"
            >
              {/* Close Button */}
              <button
                className="q-modal-close-btn"
                onClick={() => setShowExpressModal(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>

              {/* Header Badge */}
              <div className="q-modal-badge-row">
                <span className="q-modal-tag">RECRUITER PREVIEW</span>
              </div>

              {/* Warm Title */}
              <h2 id="express-modal-title" className="q-modal-title">
                A warm welcome — so glad you're here.
              </h2>

              {/* Caring & Warm Body Copy (Solo Creator Voice) */}
              <div className="q-modal-body">
                <p className="q-modal-paragraph">
                  I built Brainiac with genuine care as a mindful sanctuary for cognitive wellness. While answering all 20 questions is recommended for the most authentic personal profile, I understand your time is valuable.
                </p>
                <div className="q-modal-highlight">
                  <p className="q-modal-paragraph" style={{ color: "#f4f4f5", margin: 0 }}>
                    If you're reviewing this on a busy schedule, you can jump straight in with a rich sample evaluation — allowing you to immediately explore the interactive 3D brain map, cognitive pillar analytics, and tailored care recommendations.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="q-modal-actions">
                <button
                  className="q-modal-btn-primary"
                  onClick={handleExpressProceed}
                >
                  <span>Explore with Sample Profile</span>
                  <span className="q-modal-arrow">→</span>
                </button>
                <button
                  className="q-modal-btn-secondary"
                  onClick={() => setShowExpressModal(false)}
                >
                  Take Full Mindful Assessment (20 Questions)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Roboto+Mono:wght@400;500;600;700&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .q-page-root {
    min-height: 100vh;
    background: #000000;
    color: #ffffff;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;
    scroll-behavior: smooth;
  }

  /* Sleek Minimalist Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #000000;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.16);
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.32);
  }

  /* ── Background Atmosphere ── */
  .q-bg-ambient-glow {
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.008) 45%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .q-bg-grid {
    position: fixed;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 80%);
  }

  /* ── Top Floating Navigation ── */
  .q-nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 54px;
    padding: 0 3.5vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .q-nav-left {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #a1a1aa;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .q-nav-left:hover {
    color: #000000;
    background: #ffffff;
    border-color: #ffffff;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }
  .q-back-arrow {
    font-size: 14px;
    line-height: 1;
    transition: transform 0.22s ease;
  }
  .q-nav-left:hover .q-back-arrow {
    transform: translateX(-3px);
  }

  .q-nav-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
  }

  .q-pillar-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ffffff;
    background: #0a0a0d;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 99px;
    padding: 4px 12px;
  }
  .q-pillar-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 0 6px #ffffff;
    animation: pulseDot 2s infinite ease-in-out;
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }

  .q-region-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    color: #a1a1aa;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 99px;
    padding: 4px 10px;
    letter-spacing: 0.02em;
  }
  .q-region-icon {
    font-size: 11px;
    filter: grayscale(0.5);
  }

  .q-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .q-btn-432hz {
    height: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #e4e4e7;
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    padding: 0 12px;
    border-radius: 99px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .q-btn-432hz:hover {
    background: #ffffff;
    border-color: #ffffff;
    color: #000000;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }
  .q-btn-432hz.active {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    font-weight: 700;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
  }
  .q-pill-eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 11px;
    flex-shrink: 0;
  }
  .q-pill-eq .q-eq-bar {
    width: 2px;
    background-color: currentColor;
    border-radius: 1px;
  }
  .q-pill-eq .bar-1 { height: 4px; }
  .q-pill-eq .bar-2 { height: 10px; }
  .q-pill-eq .bar-3 { height: 6px; }

  .q-pill-eq.playing .bar-1 {
    animation: qEqAnim 1.2s infinite ease-in-out;
  }
  .q-pill-eq.playing .bar-2 {
    animation: qEqAnim 0.9s infinite ease-in-out 0.2s;
  }
  .q-pill-eq.playing .bar-3 {
    animation: qEqAnim 1.4s infinite ease-in-out 0.4s;
  }

  .q-pill-eq.paused .q-eq-bar {
    animation-play-state: paused !important;
    opacity: 0.5;
  }

  @keyframes qEqAnim {
    0%, 100% { height: 3px; }
    50% { height: 11px; }
  }
  .q-progress-digits-wrap {
    font-family: 'Roboto Mono', monospace;
    display: flex;
    align-items: baseline;
    gap: 3px;
  }
  .q-progress-current {
    font-size: 13.5px;
    font-weight: 700;
    color: #ffffff;
  }
  .q-progress-divider {
    font-size: 11px;
    color: #52525b;
  }
  .q-progress-total {
    font-size: 11px;
    color: #71717a;
    font-weight: 500;
  }
  .q-progress-pct-badge {
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 5px;
    padding: 2px 7px;
    letter-spacing: 0.03em;
  }

  /* ── Precision Top Progress Line ── */
  .q-global-progress-track {
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.06);
    position: sticky;
    top: 54px;
    z-index: 101;
    flex-shrink: 0;
  }
  .q-global-progress-bar {
    height: 100%;
    background: #ffffff;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 0 3px #ffffff;
    transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── Main Stage Area ── */
  .q-stage-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 56px 24px 60px;
    position: relative;
    z-index: 1;
  }

  .q-skip-btn {
    position: absolute;
    top: 10px;
    right: 20px;
    padding: 5px 12px;
    border-radius: 99px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: #080808;
    color: #ffffff;
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    z-index: 20;
    transition: all 0.2s ease;
  }
  .q-skip-btn:hover {
    background: #ffffff;
    color: #000000;
  }

  /* ── Open Unboxed Question Stage ── */
  .q-question-flow {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    transition: opacity 0.16s ease, transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .fade-in {
    opacity: 1;
    transform: translateY(0);
  }
  .fade-out-next {
    opacity: 0;
    transform: translateY(-6px);
  }
  .fade-out-prev {
    opacity: 0;
    transform: translateY(6px);
  }

  /* Meta Header Row */
  .q-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .q-meta-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .q-index-pill {
    font-family: 'Roboto Mono', monospace;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 6px;
    padding: 3.5px 9px;
  }
  .q-meta-separator {
    color: #3f3f46;
    font-size: 12px;
  }
  .q-section-name {
    font-family: 'Roboto Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    color: #71717a;
    letter-spacing: 0.04em;
  }
  .q-lobe-tag {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #a1a1aa;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 3.5px 9px;
  }

  /* Question Headline */
  .q-headline {
    font-family: 'Sora', sans-serif;
    font-size: clamp(23px, 2.5vw, 28px);
    font-weight: 600;
    color: #ffffff;
    line-height: 1.38;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    user-select: text;
  }

  /* Options Stack */
  .q-options-stack {
    display: flex;
    flex-direction: column;
    gap: 11px;
    margin-bottom: 26px;
  }

  .q-option-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 15px 22px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.025);
    color: #d4d4d8;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    position: relative;
    outline: none;
  }
  .q-option-card:focus-visible {
    border-color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }

  /* 1. When hovering ANY card: that card is immediately solid white */
  .q-options-stack .q-option-card:hover {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.18), 0 3px 12px rgba(0, 0, 0, 0.6) !important;
    transform: translateX(5px) !important;
  }
  .q-options-stack .q-option-card:hover .q-option-key-badge {
    color: #ffffff !important;
    background: #000000 !important;
    border-color: #000000 !important;
  }
  .q-options-stack .q-option-card:hover .q-option-text {
    color: #000000 !important;
    font-weight: 600 !important;
  }
  .q-options-stack .q-option-card:hover .q-option-radio-dot {
    border-color: #000000 !important;
    background: #000000 !important;
    color: #ffffff !important;
  }

  /* 2. When NO card is hovered: the selected card is solid white */
  .q-options-stack:not(:hover) .q-option-card.selected {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.18), 0 3px 12px rgba(0, 0, 0, 0.6) !important;
    transform: translateX(5px) !important;
  }
  .q-options-stack:not(:hover) .q-option-card.selected .q-option-key-badge {
    color: #ffffff !important;
    background: #000000 !important;
    border-color: #000000 !important;
  }
  .q-options-stack:not(:hover) .q-option-card.selected .q-option-text {
    color: #000000 !important;
    font-weight: 600 !important;
  }
  .q-options-stack:not(:hover) .q-option-card.selected .q-option-radio-dot {
    border-color: #000000 !important;
    background: #000000 !important;
    color: #ffffff !important;
  }

  /* 3. When hovering another card while a card is selected: selected card stays dark with clean checkmark */
  .q-options-stack:hover .q-option-card.selected:not(:hover) {
    background: rgba(255, 255, 255, 0.025) !important;
    border-color: rgba(255, 255, 255, 0.09) !important;
    color: #d4d4d8 !important;
    box-shadow: none !important;
    transform: none !important;
  }
  .q-options-stack:hover .q-option-card.selected:not(:hover) .q-option-key-badge {
    color: #71717a !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
  }
  .q-options-stack:hover .q-option-card.selected:not(:hover) .q-option-text {
    color: #d4d4d8 !important;
    font-weight: 450 !important;
  }
  .q-options-stack:hover .q-option-card.selected:not(:hover) .q-option-radio-dot {
    border-color: rgba(255, 255, 255, 0.35) !important;
    background: transparent !important;
    color: #ffffff !important;
  }

  /* Key Badge */
  .q-option-key-badge {
    font-family: 'Roboto Mono', monospace;
    font-size: 11.5px;
    font-weight: 700;
    color: #71717a;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 7px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .q-option-text {
    flex: 1;
    font-size: 16.5px;
    line-height: 1.48;
    color: #d4d4d8;
    font-weight: 450;
    transition: color 0.15s ease;
    user-select: text;
  }

  /* Custom Radio / Check Indicator */
  .q-option-radio-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.28);
    flex-shrink: 0;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    color: #ffffff;
  }
  .q-option-check-icon {
    width: 12px;
    height: 12px;
    display: block;
  }
  .q-option-radio-inner {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: transparent;
    opacity: 0;
  }

  /* Bottom Dock Actions */
  .q-bottom-dock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .q-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #a1a1aa;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 22px;
    border-radius: 11px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: all 0.2s ease;
  }
  .q-btn-ghost:hover:not(:disabled) {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.05);
  }
  .q-btn-ghost.hidden {
    visibility: hidden;
    pointer-events: none;
  }
  .q-btn-arrow-left {
    font-size: 14px;
    transition: transform 0.2s ease;
  }
  .q-btn-ghost:hover .q-btn-arrow-left {
    transform: translateX(-3px);
  }

  .q-btn-continue {
    background: #ffffff;
    color: #000000;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 700;
    padding: 12px 30px;
    border-radius: 11px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .q-btn-continue:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.18);
    background: #ffffff;
  }
  .q-btn-continue.disabled {
    background: #141417;
    color: #52525b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.65;
  }
  .q-btn-arrow-right {
    font-size: 15px;
    transition: transform 0.2s ease;
  }
  .q-btn-continue:hover:not(.disabled) .q-btn-arrow-right {
    transform: translateX(4px);
  }

  /* Floating Bottom-Right Recruiter Preview Pill */
  .q-floating-recruiter-btn {
    position: fixed;
    bottom: 26px;
    right: 30px;
    z-index: 90;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 13, 18, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.24);
    color: #ffffff;
    font-family: 'Roboto Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 0 20px;
    border-radius: 99px;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .q-floating-recruiter-btn:hover {
    background: #ffffff;
    border-color: #ffffff;
    color: #000000;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), 0 0 18px rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  /* ── Express Demo Modal ── */
  .q-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: qFadeInBackdrop 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes qFadeInBackdrop {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .q-modal-card {
    position: relative;
    width: 100%;
    max-width: 520px;
    background: #0d0d12;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 20px;
    padding: 32px 28px 28px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.04);
    animation: qScaleInCard 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes qScaleInCard {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .q-modal-close-btn {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: rgba(255, 255, 255, 0.75);
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .q-modal-close-btn:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    transform: rotate(90deg);
  }

  .q-modal-badge-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .q-modal-tag {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #d4d4d8;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    padding: 3px 9px;
    border-radius: 99px;
  }

  .q-modal-title {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.35;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }

  .q-modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  .q-modal-paragraph {
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    line-height: 1.6;
    color: #a1a1aa;
  }
  .q-modal-highlight {
    background: rgba(255, 255, 255, 0.04);
    border-left: 2px solid rgba(255, 255, 255, 0.35);
    padding: 12px 14px;
    border-radius: 0 10px 10px 0;
  }

  .q-modal-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .q-modal-btn-primary {
    width: 100%;
    padding: 13px 20px;
    background: #ffffff;
    color: #000000;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .q-modal-btn-primary:hover {
    box-shadow: none;
    background: #f4f4f5;
  }
  .q-modal-arrow {
    font-size: 15px;
    transition: transform 0.2s ease;
  }
  .q-modal-btn-primary:hover .q-modal-arrow {
    transform: translateX(4px);
  }

  .q-modal-btn-secondary {
    width: 100%;
    padding: 11px 20px;
    background: transparent;
    color: #a1a1aa;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .q-modal-btn-secondary:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .q-page-root {
      height: auto;
      min-height: 100vh;
      overflow-y: auto;
    }
    .q-question-flow {
      padding: 0 4px;
    }
    .q-nav-center {
      display: none;
    }
    .q-nav-right {
      gap: 8px;
    }
    .q-btn-express {
      padding: 0 8px;
    }
    .q-modal-card {
      padding: 24px 20px 20px;
    }
    .q-modal-title {
      font-size: 18px;
    }
    .q-headline {
      font-size: 19px;
      margin-bottom: 16px;
    }
    .q-bottom-dock {
      flex-direction: column-reverse;
      gap: 10px;
    }
    .q-btn-continue, .q-btn-ghost {
      width: 100%;
      justify-content: center;
    }
    .q-floating-recruiter-btn {
      bottom: 16px;
      right: 16px;
      height: 36px;
      padding: 0 14px;
      font-size: 11px;
    }
  }
`;