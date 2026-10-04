import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildInsightData } from "../utils/insightData";
import { buildBrainPrompt } from "../utils/buildPrompt";
import { getAIInsights } from "../utils/aiInsights";
import { brainRegions } from "../data/brainRegions";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";
import SoundPill from "./SoundPill";

/* DEV SWITCH */
const ENABLE_AI = false;

// 5 Master Cognitive Pillars & their mapped brain regions
const PILLARS = [
  {
    id: "executive",
    name: "Focus",
    icon: "⚡",
    tag: "Pillar 01",
    regions: ["Prefrontal Cortex", "Orbitofrontal Cortex", "Anterior Cingulate Cortex"],
    desc: "Deep focus, intentional choice-making, and clear problem-solving."
  },
  {
    id: "emotional",
    name: "Calm",
    icon: "🌊",
    tag: "Pillar 02",
    regions: ["Amygdala", "Hippocampus", "Insular Cortex", "Hypothalamus"],
    desc: "Inner peace, emotional balance, and body-state comfort."
  },
  {
    id: "reward",
    name: "Energy",
    icon: "🔥",
    tag: "Pillar 03",
    regions: ["Dopamine Reward System", "Nucleus Accumbens", "Ventral Tegmental Area"],
    desc: "Morning spark, healthy motivation, and enthusiasm for life."
  },
  {
    id: "habits",
    name: "Habits",
    icon: "🌿",
    tag: "Pillar 04",
    regions: ["Basal Ganglia", "Cerebellum"],
    desc: "Nourishing daily routines, smooth physical actions, and flow."
  },
  {
    id: "sensory",
    name: "Senses",
    icon: "✦",
    tag: "Pillar 05",
    regions: ["Thalamus", "Parietal Lobe", "Temporal Lobe"],
    desc: "Grounded sensory awareness, presence, and sound perception."
  }
];

// Default demo scores if visiting /results directly
const DEFAULT_DEMO_SCORES = {
  "Prefrontal Cortex": 85,
  "Orbitofrontal Cortex": 78,
  "Anterior Cingulate Cortex": 82,
  "Amygdala": 70,
  "Hippocampus": 88,
  "Insular Cortex": 75,
  "Hypothalamus": 80,
  "Dopamine Reward System": 72,
  "Nucleus Accumbens": 84,
  "Ventral Tegmental Area": 76,
  "Basal Ganglia": 82,
  "Cerebellum": 88,
  "Thalamus": 74,
  "Parietal Lobe": 80,
  "Temporal Lobe": 86
};

// Concise, feel-good explanations for every brain region card under "A Journey Inside Your Mind"
const REGION_CARD_DESCRIPTIONS = {
  "Prefrontal Cortex": "Guides calm clarity, executive focus, and mindful decisions.",
  "Orbitofrontal Cortex": "Balances emotional choices, values, and gentle self-discipline.",
  "Anterior Cingulate Cortex": "Harmonizes attention, resolves inner conflict, and supports ease.",
  "Amygdala": "Sentinel of emotional safety, deep intuition, and soothing reassurance.",
  "Hippocampus": "Curator of cherished memories, joyful learning, and inner maps.",
  "Insular Cortex": "Bridges bodily sensations, heart awareness, and mindful presence.",
  "Hypothalamus": "Master regulator of restful sleep, energy, and inner harmony.",
  "Dopamine Reward System": "Sparks natural motivation, curiosity, enthusiasm, and joyful drive.",
  "Nucleus Accumbens": "Nurtures genuine optimism, anticipation of good things, and delight.",
  "Ventral Tegmental Area": "Ignites the inner bio-spark of inspiration and purposeful action.",
  "Basal Ganglia": "Coordinates smooth daily habits, procedural flow, and automatic ease.",
  "Cerebellum": "Brings graceful physical balance, posture, and motor coordination.",
  "Thalamus": "The grand sensory gateway, filtering perceptions into conscious calm.",
  "Parietal Lobe": "Grounds sensory awareness, touch perception, and spatial presence.",
  "Temporal Lobe": "Deepens auditory harmony, language, and meaningful connection."
};

function getScoreTier(score) {
  if (score < 45) {
    return {
      tierKey: "needs-care",
      label: "Needs Care",
      color: "#f87171",
      badgeBg: "#000000",
      badgeBorder: "rgba(248, 113, 113, 0.4)",
      glow: "rgba(248, 113, 113, 0.4)",
      headline: "Rest & Restore"
    };
  }
  if (score < 75) {
    return {
      tierKey: "good-balance",
      label: "Good Balance",
      color: "#d4d4d8",
      badgeBg: "#000000",
      badgeBorder: "rgba(255, 255, 255, 0.35)",
      glow: "rgba(255, 255, 255, 0.4)",
      headline: "Steady Rhythm"
    };
  }
  return {
    tierKey: "at-your-best",
    label: "At Your Best",
    color: "#ffffff",
    badgeBg: "#000000",
    badgeBorder: "rgba(255, 255, 255, 0.35)",
    glow: "rgba(255, 255, 255, 0.8)",
    headline: "Full Vitality"
  };
}

function AnimatedScore({ target }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [target]);

  return <>{display}</>;
}

// ── Interactive SVG Radar Chart ──
function RadarChart({ pillarScores }) {
  const size = 360;
  const center = size / 2;
  const radius = 95;
  const totalSides = PILLARS.length;

  const points = useMemo(() => {
    return PILLARS.map((p, i) => {
      const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
      const score = pillarScores[p.id] || 60;
      const r = (score / 100) * radius;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Directional anchoring and baseline alignment to prevent web overlap
      let textAnchor = "middle";
      if (cos > 0.25) textAnchor = "start";
      else if (cos < -0.25) textAnchor = "end";

      let dominantBaseline = "central";
      if (sin < -0.4) dominantBaseline = "auto";
      else if (sin > 0.4) dominantBaseline = "hanging";

      // Clear breathing distance from outer web vertex
      const labelDistance = radius + (Math.abs(sin) > 0.7 ? 24 : 18);

      return {
        x: center + r * cos,
        y: center + r * sin,
        score,
        pillar: p,
        labelX: center + labelDistance * cos,
        labelY: center + labelDistance * sin,
        textAnchor,
        dominantBaseline
      };
    });
  }, [pillarScores, center, radius, totalSides]);

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Concentric levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="res-radar-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="res-radar-svg">
        {/* Background Grids */}
        {gridLevels.map((lvl) => {
          const gridPoints = PILLARS.map((_, i) => {
            const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
            const r = lvl * radius;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(" ");
          return (
            <polygon
              key={lvl}
              points={gridPoints}
              fill={lvl === 1.0 ? "rgba(255, 255, 255, 0.025)" : "none"}
              stroke={lvl === 1.0 ? "rgba(255, 255, 255, 0.38)" : "rgba(255, 255, 255, 0.22)"}
              strokeWidth={lvl === 1.0 ? "1.25" : "1"}
            />
          );
        })}

        {/* Axis Spokes */}
        {PILLARS.map((_, i) => {
          const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.26)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={polygonPath}
          fill="rgba(255, 255, 255, 0.16)"
          stroke="#ffffff"
          strokeWidth="2.2"
          className="res-radar-polygon"
        />

        {/* Vertex Dots & Score Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="2"
              className="res-radar-node"
            />
            {/* Axis Label */}
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor={p.textAnchor}
              dominantBaseline={p.dominantBaseline}
              className="res-radar-axis-label"
            >
              <tspan className="res-radar-name-text">{p.pillar.name}</tspan>{" "}
              <tspan className="res-radar-score-text">({p.score}%)</tspan>
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { audioPlaying, audioPaused, toggleAudio } = useSoundSanctuary();

  const rawScores = useMemo(() => {
    if (location.state && Object.keys(location.state).length > 0) {
      try {
        localStorage.setItem("brainiac_user_assessment_scores", JSON.stringify(location.state));
      } catch (e) { }
      return location.state;
    }
    try {
      const saved = localStorage.getItem("brainiac_user_assessment_scores");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) { }
    return DEFAULT_DEMO_SCORES;
  }, [location.state]);

  const [insightText, setInsightText] = useState("");
  const [loadingAI, setLoadingAI] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const regionScores = rawScores;

  // Overall score across all 15 regions
  const overallScore = useMemo(() => {
    const keys = Object.keys(regionScores);
    if (keys.length === 0) return 0;
    return Math.round(Object.values(regionScores).reduce((a, b) => a + b, 0) / keys.length);
  }, [regionScores]);

  // Pillar scores (averaging regions under each pillar)
  const pillarScores = useMemo(() => {
    const scores = {};
    PILLARS.forEach((pillar) => {
      let sum = 0;
      let count = 0;
      pillar.regions.forEach((r) => {
        if (regionScores[r] !== undefined) {
          sum += regionScores[r];
          count += 1;
        }
      });
      scores[pillar.id] = count > 0 ? Math.round(sum / count) : 75;
    });
    return scores;
  }, [regionScores]);

  const insightData = useMemo(() => {
    return buildInsightData(regionScores);
  }, [regionScores]);

  const overallTier = getScoreTier(overallScore);

  // Highest and lowest regions for the summary bento
  const sortedRegions = useMemo(() => {
    return Object.entries(regionScores).sort((a, b) => b[1] - a[1]);
  }, [regionScores]);

  const topRegion = sortedRegions[0] || ["Hippocampus", 88];
  const lowestRegion = sortedRegions[sortedRegions.length - 1] || ["Amygdala", 70];

  useEffect(() => {
    async function generateInsights() {
      try {
        if (ENABLE_AI) {
          const prompt = buildBrainPrompt(insightData);
          const aiText = await getAIInsights(prompt);
          setInsightText(aiText);
        } else {
          setInsightText(
            `Your mind is navigating life with quiet resilience and remarkable adaptability. You carry a natural strength for steady focus and intentional clarity, even through demanding moments. When mental energy feels a little stretched, treat yourself with kindness and gentle patience. Embracing small restorative pauses, mindful deep breaths, and nourishing daily rituals will help replenish your inner calm — keeping your thoughts balanced, clear, and deeply supported.`
          );
        }
      } catch (error) {
        console.error(error);
        setInsightText(
          "Your mind holds immense natural resilience and adaptability. Take a gentle breath, honor where you are today, and give yourself the restorative time you deserve to feel balanced, energized, and at ease."
        );
      } finally {
        setLoadingAI(false);
      }
    }

    generateInsights();
  }, [insightData]);

  // Filter and sort regions based on active tab (highest score first)
  const displayedRegions = useMemo(() => {
    let list = Object.entries(regionScores);
    if (activeTab !== "all") {
      const currentPillar = PILLARS.find((p) => p.id === activeTab);
      if (currentPillar) {
        list = list.filter(([reg]) => currentPillar.regions.includes(reg));
      }
    }
    return list.sort((a, b) => b[1] - a[1]);
  }, [regionScores, activeTab]);

  return (
    <>
      <style>{styles}</style>

      <div className="res-root">
        {/* Background Grid */}
        <div className="res-bg-grid" />

        {/* Top Floating Glass Navigation */}
        <header className="res-nav-bar">
          <div className="res-nav-inner">
            <div
              className="res-nav-left"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={0}
              aria-label="Return to Home"
            >
              <span className="res-back-arrow">←</span>
              <span>Home</span>
            </div>

            <div className="res-nav-center">
              <div className="res-nav-badge">
                <span>A Sanctuary for Your Thoughts</span>
              </div>
            </div>

            <div className="res-nav-right">
              <SoundPill />

              <button
                className="res-nav-btn-retake"
                onClick={() => {
                  try {
                    localStorage.removeItem("brainiac_saved_care_plans");
                    sessionStorage.removeItem("brainiac_last_active_report");
                  } catch (e) { }
                  navigate("/assessment");
                }}
              >
                <span>Retake Assessment</span>
              </button>
            </div>
          </div>
        </header>

        {/* Master Dashboard Container */}
        <main className="res-container">

          {/* ── Full-Screen Hero Zone ── */}
          <div className="res-hero-zone">

            {/* Section 1: Executive Overview Bento */}
            <section className="res-hero-bento">

              {/* Left Column: Radial Composite Score Card */}
              <div className="res-bento-card res-score-hero">
                <div className="res-card-ambient-light" />

                <div className="res-card-header-row">
                  <span className="res-tag-mono">PERSONAL WELL-BEING INDEX</span>
                </div>

                <div className="res-score-centerpiece">
                  <div className="res-score-dial-wrap">
                    <div className="res-score-dial-num">
                      <AnimatedScore target={overallScore} />
                    </div>
                    <div className="res-score-dial-denom">out of 100</div>
                  </div>

                  <div className="res-radial-track-wrap">
                    <div className="res-meter-track-container">
                      <div className="res-meter-track">
                        <div
                          className="res-meter-fill"
                          style={{
                            width: `${overallScore}%`
                          }}
                        />
                      </div>

                      {/* 3 Major Level Milestone Dots */}
                      <div className="res-meter-major-dots">
                        <span
                          className={`res-level-dot ${overallScore >= 0 ? 'active' : ''}`}
                          data-pos="start"
                        />
                        <span
                          className={`res-level-dot ${overallScore >= 50 ? 'active' : ''}`}
                          data-pos="mid"
                        />
                        <span
                          className={`res-level-dot ${overallScore >= 75 ? 'active' : ''}`}
                          data-pos="end"
                        />
                      </div>
                    </div>

                    <div className="res-meter-labels">
                      <span className={overallScore < 50 ? 'res-label-active' : ''}>Needs Care</span>
                      <span className={overallScore >= 50 && overallScore < 75 ? 'res-label-active' : ''}>Good Balance</span>
                      <span className={overallScore >= 75 ? 'res-label-active' : ''}>At Your Best</span>
                    </div>
                  </div>
                </div>

                <div className="res-score-subtext">
                  A caring snapshot of your inner world, shaped by your unique experiences across 5 key pillars of everyday well-being.
                </div>
              </div>

              {/* Right Column: 5-Pillar Neural Radar */}
              <div className="res-bento-card res-radar-hero">
                <div className="res-card-header-row">
                  <span className="res-tag-mono">5 PILLARS OF EVERYDAY WELL-BEING</span>
                </div>
                <RadarChart pillarScores={pillarScores} />
              </div>
            </section>

            {/* Section 3: AI Neural Synthesis Section */}
            <section className="res-synthesis-box">
              <div className="res-synthesis-glow" />
              <div className="res-synthesis-header">
                <div className="res-synthesis-title-wrap">
                  <span className="res-sparkle-icon">&#x2726;</span>
                  <h3 className="res-synthesis-title">Mindful Insights &amp; Gentle Guidance</h3>
                </div>
                <span className="res-tag-mono">Powered by Brainiac Intelligence</span>
              </div>
              {loadingAI ? (
                <div className="res-synthesis-loading">
                  <span className="res-loading-pulse" />
                  <span>Synthesizing your cognitive balance profile...</span>
                </div>
              ) : (
                <p className="res-synthesis-body">{insightText}</p>
              )}
            </section>

          </div>

          {/* Section 4: Cognitive Domain Breakdown & Pillar Matrix */}
          <section className="res-matrix-section">
            <div className="res-matrix-header">
              <div>
                <h2 className="res-section-title">A Journey Inside Your Mind</h2>
                <p className="res-section-subtitle">
                  See how your individual brain regions shape the way you think, feel, and thrive each day.
                </p>
              </div>

              {/* Pillar Tabs */}
              <div className="res-tabs-bar">
                <button
                  className={`res-tab-btn ${activeTab === "all" ? "active" : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  All (15)
                </button>
                {PILLARS.map((p) => (
                  <button
                    key={p.id}
                    className={`res-tab-btn ${activeTab === p.id ? "active" : ""}`}
                    onClick={() => setActiveTab(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Pillar Context Banner */}
            {activeTab !== "all" && (
              <div className="res-pillar-active-hint" key={`hint-${activeTab}`}>
                <span className="res-pillar-hint-tag">{PILLARS.find(p => p.id === activeTab)?.tag}</span>
                <span className="res-pillar-hint-name">{PILLARS.find(p => p.id === activeTab)?.name}</span>
                <span className="res-pillar-hint-sep">•</span>
                <span className="res-pillar-hint-desc">{PILLARS.find(p => p.id === activeTab)?.desc}</span>
              </div>
            )}

            {/* Region Cards Grid */}
            <div className="res-cards-grid" key={`grid-${activeTab}`}>
              {displayedRegions.map(([region, score], idx) => {
                const cfg = getScoreTier(score);
                const matchedBrainRegion = brainRegions.find(
                  (r) => r.name.toLowerCase() === region.toLowerCase()
                );

                return (
                  <div
                    key={`${activeTab}-${region}`}
                    className={`res-region-card tier-${cfg.tierKey || 'good-balance'}`}
                    style={{ animationDelay: `${idx * 0.11}s` }}
                  >
                    <div className="res-rc-header">
                      <div className="res-rc-meta-row">
                        <span
                          className="res-rc-chip"
                          style={{
                            color: cfg.color,
                            background: cfg.badgeBg,
                            borderColor: cfg.badgeBorder
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <h4 className="res-rc-title">{region}</h4>
                    </div>

                    <p className="res-rc-summary">
                      {REGION_CARD_DESCRIPTIONS[region] || matchedBrainRegion?.summary || "Nurtures cognitive balance and daily neural harmony."}
                    </p>

                    <div className="res-rc-score-wrap">
                      <div className="res-rc-score-line">
                        <span className="res-rc-score-val">{Math.round(score)}</span>
                        <span className="res-rc-score-max">/ 100</span>
                      </div>
                      <div className="res-rc-bar-track">
                        <div
                          className="res-rc-bar-fill"
                          style={{
                            width: `${score}%`,
                            background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})`,
                            boxShadow: `0 0 10px ${cfg.color}60`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 5: Action Hub / CTA Banner */}
          <section className="res-action-banner">
            <div className="res-action-content">
              <h3 className="res-action-heading">Experience the Wonder of Your Own Mind</h3>
              <p className="res-action-sub">
                Take a gentle moment to explore how your thoughts, emotions, and memories come alive in living 3D light.
              </p>
            </div>

            <div className="res-action-buttons">
              <button
                className="res-btn-white"
                onClick={() => navigate("/brain")}
              >
                <span>Begin Your 3D Journey</span>
                <span className="res-btn-arrow-right">→</span>
              </button>
            </div>
          </section>

        </main>
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

  .res-root {
    min-height: 100vh;
    background: #000000;
    color: #ffffff;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    overflow-x: hidden;
    padding-bottom: 90px;
  }

  /* Sleek Scrollbar */
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

  /* ── Background Grid ── */

  .res-bg-grid {
    position: fixed;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
    mask-image: radial-gradient(ellipse 85% 65% at 50% 35%, #000 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse 85% 65% at 50% 35%, #000 30%, transparent 80%);
  }

  /* ── Sticky Top Navigation ── */
  .res-nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 68px;
    padding: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .res-nav-inner {
    max-width: 1360px;
    width: 100%;
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .res-nav-left {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #a1a1aa;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 8px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.16);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-nav-left:hover {
    color: #000000;
    background: #ffffff;
    border-color: #ffffff;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }
  .res-back-arrow {
    font-size: 14px;
    line-height: 1;
    transition: transform 0.22s ease;
  }
  .res-nav-left:hover .res-back-arrow {
    transform: translateX(-3px);
  }

  .res-nav-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    display: flex;
    align-items: center;
  }
  .res-nav-badge {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ffffff;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 99px;
    padding: 5px 16px;
  }

  .res-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .res-nav-btn-432hz {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: #e4e4e7;
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 99px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-nav-btn-432hz:hover {
    background: #ffffff;
    border-color: #ffffff;
    color: #000000;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }
  .res-nav-btn-432hz.active {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    font-weight: 700;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
  }
  .res-pill-eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2.5px;
    height: 12px;
    flex-shrink: 0;
  }
  .res-pill-eq .res-eq-bar {
    width: 2px;
    background-color: currentColor;
    border-radius: 1px;
  }
  .res-pill-eq .bar-1 { height: 5px; }
  .res-pill-eq .bar-2 { height: 11px; }
  .res-pill-eq .bar-3 { height: 7px; }

  .res-pill-eq.playing .bar-1 {
    animation: resEqAnim 1.2s infinite ease-in-out;
  }
  .res-pill-eq.playing .bar-2 {
    animation: resEqAnim 0.9s infinite ease-in-out 0.2s;
  }
  .res-pill-eq.playing .bar-3 {
    animation: resEqAnim 1.4s infinite ease-in-out 0.4s;
  }

  .res-pill-eq.paused .res-eq-bar {
    animation-play-state: paused !important;
    opacity: 0.5;
  }

  @keyframes resEqAnim {
    0%, 100% { height: 3px; }
    50% { height: 12px; }
  }

  .res-nav-btn-retake {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #d4d4d8;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-nav-btn-retake:hover {
    color: #000000;
    background: #ffffff;
    border-color: #ffffff;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  /* ── Main Container ── */
  .res-container {
    max-width: 1360px;
    margin: 0 auto;
    padding: 38px 24px 0;
    position: relative;
    z-index: 1;
  }

  /* ── Full-Screen Hero Zone ── */
  .res-hero-zone {
    min-height: calc(100vh - 110px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
  }

  /* ── Section 1: Hero Bento ── */
  .res-hero-bento {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 16px;
    flex: 1;
  }

  .res-bento-card {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 18px;
    padding: 24px 26px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.9);
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-bento-card:hover {
    background: #ffffff;
    border-color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 255, 255, 0.35);
  }
  .res-bento-card:hover .res-tag-mono {
    background: #000000;
    color: #ffffff;
    border-color: #000000;
  }
  .res-bento-card:hover .res-score-dial-num {
    color: #000000;
    background: none;
    -webkit-text-fill-color: #000000;
  }
  .res-bento-card:hover .res-score-dial-denom {
    color: #71717a;
  }
  .res-bento-card:hover .res-meter-track {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.16);
  }
  .res-bento-card:hover .res-meter-fill {
    background: #000000;
  }
  .res-bento-card:hover .res-level-dot {
    background: #ffffff;
    border-color: #000000;
  }
  .res-bento-card:hover .res-level-dot.active {
    background: #000000;
    border-color: #000000;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
  }
  .res-bento-card:hover .res-meter-labels {
    color: #71717a;
  }
  .res-bento-card:hover .res-meter-labels .res-label-active {
    color: #000000;
    text-shadow: none;
  }
  .res-bento-card:hover .res-score-subtext {
    color: #3f3f46;
  }
  /* Radar Chart hover inside bento */
  .res-bento-card:hover .res-radar-svg polygon.res-radar-polygon {
    fill: rgba(0, 0, 0, 0.08);
    stroke: #000000;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.2));
  }
  .res-bento-card:hover .res-radar-svg line {
    stroke: rgba(0, 0, 0, 0.18);
  }
  .res-bento-card:hover .res-radar-svg polygon:not(.res-radar-polygon) {
    stroke: rgba(0, 0, 0, 0.16);
  }
  .res-bento-card:hover .res-radar-node {
    fill: #000000;
    stroke: #ffffff;
  }
  .res-bento-card:hover .res-radar-name-text {
    fill: #52525b;
  }
  .res-bento-card:hover .res-radar-score-text {
    fill: #000000;
  }
  .res-card-ambient-light {
    position: absolute;
    top: -50px;
    left: -50px;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .res-card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .res-tag-mono {
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #d4d4d8;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 6px;
    padding: 3.5px 9px;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
  }
  .res-tier-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 99px;
    border: 1px solid;
    background: #000000;
  }
  .res-tier-dot {
    width: 6px;
    height: 6px;
    min-width: 6px;
    min-height: 6px;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
    border-radius: 50%;
    display: inline-block;
  }

  /* Score Centerpiece */
  .res-score-centerpiece {
    margin: 10px 0 18px;
  }
  .res-score-dial-wrap {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 16px;
  }
  .res-score-dial-num {
    font-family: 'Sora', sans-serif;
    font-size: 68px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #ffffff;
    background: linear-gradient(180deg, #ffffff 35%, #a1a1aa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .res-score-dial-denom {
    font-family: 'Roboto Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: #71717a;
  }

  .res-radial-track-wrap {
    margin-bottom: 14px;
  }
  .res-meter-track-container {
    position: relative;
    width: 100%;
    height: 18px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  .res-meter-track {
    position: absolute;
    left: 0;
    right: 0;
    height: 7px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 99px;
    overflow: hidden;
    box-sizing: border-box;
  }
  .res-meter-fill {
    height: 100%;
    background: #ffffff;
    border-radius: 99px;
    transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* 3 Major Level Milestone Dots */
  .res-meter-major-dots {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
  .res-level-dot {
    position: absolute;
    top: 50%;
    display: block;
    width: 14px;
    height: 14px;
    min-width: 14px;
    min-height: 14px;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    box-sizing: border-box;
    background: #000000;
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
    transition: all 0.4s ease;
    z-index: 2;
  }
  .res-level-dot[data-pos="start"] {
    left: 7px;
    transform: translate(-50%, -50%);
  }
  .res-level-dot[data-pos="mid"] {
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .res-level-dot[data-pos="end"] {
    left: calc(100% - 7px);
    transform: translate(-50%, -50%);
  }
  .res-level-dot.active {
    background: #ffffff;
    border-color: #ffffff;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.75);
  }

  .res-meter-labels {
    display: flex;
    justify-content: space-between;
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    color: #52525b;
    letter-spacing: 0.04em;
  }
  .res-meter-labels .res-label-active {
    color: #ffffff;
    font-weight: 600;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  }

  .res-score-subtext {
    font-size: 13px;
    line-height: 1.55;
    color: #a1a1aa;
  }

  /* Radar Card */
  .res-radar-hero {
    align-items: center;
  }
  .res-radar-badge {
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    color: #71717a;
  }
  .res-radar-wrap {
    width: 100%;
    max-width: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -6px 0;
  }
  .res-radar-svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .res-radar-polygon {
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.35));
    transition: all 0.8s ease;
  }
  .res-radar-node {
    transition: all 0.3s ease;
  }
  .res-radar-axis-label {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.02em;
    user-select: none;
  }
  .res-radar-name-text {
    fill: #a1a1aa;
    font-weight: 500;
  }
  .res-radar-score-text {
    fill: #ffffff;
    font-weight: 700;
  }

  .res-radar-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .res-legend-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 99px;
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
  }
  .res-legend-icon {
    font-size: 10px;
  }
  .res-legend-name {
    color: #d4d4d8;
  }
  .res-legend-score {
    font-weight: 700;
  }

  /* ── Section 2: Bento Triplet ── */
  .res-bento-triplet {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .res-mini-bento {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 16px;
    padding: 22px 20px;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
  }
  .res-mini-bento:hover {
    border-color: rgba(255, 255, 255, 0.38);
    background: #000000;
    transform: translateY(-3px);
  }
  .res-mini-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .res-mini-icon {
    font-size: 14px;
  }
  .res-mini-title {
    font-family: 'Sora', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
  }
  .res-mini-score {
    font-family: 'Roboto Mono', monospace;
    font-size: 13.5px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .res-mini-unit {
    font-size: 11px;
    color: #71717a;
    font-weight: 500;
  }
  .res-mini-desc {
    font-size: 12.5px;
    line-height: 1.5;
    color: #a1a1aa;
  }

  .res-dist-bars {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .res-dist-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Roboto Mono', monospace;
    font-size: 10.5px;
    color: #d4d4d8;
  }
  .res-dist-dot {
    width: 6px;
    height: 6px;
    min-width: 6px;
    min-height: 6px;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
    border-radius: 50%;
    display: inline-block;
  }

  /* ── Section 3: AI Synthesis Box ── */
  .res-synthesis-box {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 18px;
    padding: 22px 26px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.9);
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-synthesis-box:hover {
    background: #ffffff;
    border-color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 255, 255, 0.35);
  }
  .res-synthesis-box:hover .res-sparkle-icon {
    color: #000000;
  }
  .res-synthesis-box:hover .res-synthesis-title {
    color: #000000;
  }
  .res-synthesis-box:hover .res-tag-mono {
    background: #000000;
    color: #ffffff;
    border-color: #000000;
  }
  .res-synthesis-box:hover .res-synthesis-body {
    color: #27272a;
  }
  .res-synthesis-glow {
    position: absolute;
    top: 50%;
    left: -70px;
    transform: translateY(-50%);
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .res-synthesis-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 12px;
  }
  .res-synthesis-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .res-sparkle-icon {
    font-size: 14px;
    color: #ffffff;
    animation: sparkleSpin 4s infinite linear;
    transition: color 0.3s ease;
  }
  @keyframes sparkleSpin {
    0% { transform: rotate(0deg); opacity: 0.8; }
    50% { transform: rotate(180deg); opacity: 1; }
    100% { transform: rotate(360deg); opacity: 0.8; }
  }
  .res-synthesis-title {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.01em;
    transition: color 0.3s ease;
  }
  .res-synthesis-body {
    font-size: 14.5px;
    line-height: 1.75;
    color: #d4d4d8;
    transition: color 0.3s ease;
  }
  .res-synthesis-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    color: #71717a;
    font-family: 'Roboto Mono', monospace;
  }
  .res-loading-pulse {
    width: 6px;
    height: 6px;
    min-width: 6px;
    min-height: 6px;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
    border-radius: 50%;
    display: inline-block;
    background: #ffffff;
    animation: pulseDot 1.4s infinite ease-in-out;
  }

  /* ── Section 4: Cognitive Domain Matrix ── */
  .res-matrix-section {
    margin-top: 80px;
    margin-bottom: 36px;
    min-height: 520px;
    transition: min-height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-matrix-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 16px;
    padding: 0 6px;
  }
  .res-section-title {
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .res-section-subtitle {
    font-size: 13.5px;
    color: #71717a;
  }

  .res-tabs-bar {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 9.5px;
    padding: 4px;
    box-sizing: border-box;
  }
  .res-tab-btn {
    background: transparent;
    border: 1px solid transparent;
    color: #71717a;
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 5.5px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin: 0;
    box-sizing: border-box;
  }
  .res-tab-btn:hover {
    color: #ffffff;
  }
  .res-tab-btn.active {
    background: #ffffff;
    color: #000000;
    font-weight: 700;
    border-color: #ffffff;
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.25);
  }
  .res-tab-btn.active:hover {
    background: #ffffff;
    color: #000000;
  }

  /* Active Pillar Context Banner */
  .res-pillar-active-hint {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    gap: 12px;
    margin-top: 14px;
    margin-bottom: 24px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 99px;
    animation: cinematicCardEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .res-pillar-hint-tag {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: inline-block;
  }
  .res-pillar-hint-name {
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #ffffff;
  }
  .res-pillar-hint-sep {
    color: #52525b;
    font-size: 12px;
    margin: 0 2px;
  }
  .res-pillar-hint-desc {
    font-size: 13px;
    color: #a1a1aa;
    line-height: 1.4;
  }

  /* Grid of Cards */
  .res-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
    gap: 16px;
    min-height: 240px;
    justify-content: start;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-region-card {
    position: relative;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 16px;
    padding: 22px 20px;
    cursor: default;
    min-height: 195px;
    box-sizing: border-box;
    animation: synapticBloom 1.35s cubic-bezier(0.12, 0.95, 0.25, 1.0) both;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.3s ease,
                border-color 0.3s ease,
                box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    outline: none;
    will-change: transform, opacity, border-color;
  }
  @keyframes synapticBloom {
    0% {
      opacity: 0;
      transform: translateY(46px) scale(0.90);
      border-color: rgba(255, 255, 255, 0.08);
    }
    35% {
      opacity: 0.85;
      transform: translateY(-4px) scale(1.018);
      border-color: rgba(255, 255, 255, 0.8);
    }
    65% {
      opacity: 0.96;
      transform: translateY(1.5px) scale(0.996);
      border-color: rgba(255, 255, 255, 0.5);
    }
    85% {
      transform: translateY(-0.5px) scale(1.002);
      border-color: rgba(255, 255, 255, 0.4);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      border-color: rgba(255, 255, 255, 0.35);
    }
  }
  .res-region-card:hover {
    transform: translateY(-4px);
    border-color: #ffffff;
    background: #ffffff;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 255, 255, 0.3);
  }
  .res-region-card:hover .res-rc-title {
    color: #000000;
  }
  .res-region-card:hover .res-rc-summary {
    color: #3f3f46;
  }
  .res-region-card:hover .res-rc-score-val {
    color: #000000;
  }
  .res-region-card:hover .res-rc-score-max {
    color: #71717a;
  }
  .res-region-card:hover .res-rc-bar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  .res-region-card:hover .res-rc-bar-fill {
    background: linear-gradient(90deg, #3f3f46, #000000) !important;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3) !important;
  }
  .res-region-card.tier-needs-care:hover .res-rc-bar-fill {
    background: linear-gradient(90deg, #f87171, #ef4444) !important;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.45) !important;
  }
  .res-region-card:hover .res-rc-chip {
    background: #000000 !important;
    border-color: #000000 !important;
  }
  .res-region-card.tier-needs-care:hover .res-rc-chip {
    background: #000000 !important;
    border-color: rgba(239, 68, 68, 0.45) !important;
    color: #f87171 !important;
  }
  .res-region-card:focus-visible {
    border-color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }

  .res-rc-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }
  .res-rc-meta-row {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .res-rc-title {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.35;
    transition: color 0.3s ease;
    min-height: 22px;
  }
  .res-rc-chip {
    font-family: 'Roboto Mono', monospace;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid;
    flex-shrink: 0;
    background: #000000;
    transition: all 0.3s ease;
  }
  .res-rc-summary {
    font-size: 12.5px;
    line-height: 1.5;
    color: #a1a1aa;
    margin-bottom: 16px;
    min-height: 38px;
    transition: color 0.3s ease;
  }

  .res-rc-score-wrap {
    margin-bottom: 0;
  }
  .res-rc-score-line {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 8px;
  }
  .res-rc-score-val {
    font-family: 'Sora', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
    transition: color 0.3s ease;
  }
  .res-rc-score-max {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    color: #52525b;
    transition: color 0.3s ease;
  }
  .res-rc-bar-track {
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 99px;
    overflow: hidden;
    transition: background 0.3s ease;
  }
  .res-rc-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s ease;
  }



  /* ── Section 5: Action Hub ── */
  .res-action-banner {
    position: relative;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 20px;
    padding: 36px 38px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-action-banner:hover {
    background: #ffffff;
    border-color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 255, 255, 0.35);
  }
  .res-action-content,
  .res-action-buttons {
    position: relative;
    z-index: 1;
  }
  .res-action-content {
    max-width: 580px;
  }
  .res-action-heading {
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 6px;
    transition: color 0.3s ease;
  }
  .res-action-banner:hover .res-action-heading {
    color: #000000;
  }
  .res-action-sub {
    font-size: 14px;
    line-height: 1.6;
    color: #a1a1aa;
    transition: color 0.3s ease;
  }
  .res-action-banner:hover .res-action-sub {
    color: #3f3f46;
  }
  .res-action-buttons {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  .res-btn-white {
    background: #ffffff;
    color: #000000;
    border: 1px solid #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 700;
    padding: 13px 26px;
    border-radius: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .res-action-banner:hover .res-btn-white {
    background: #000000;
    color: #ffffff;
    border-color: #000000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }
  .res-action-banner:hover .res-btn-white:hover {
    background: #18181b;
    border-color: #18181b;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
  .res-btn-arrow-right {
    font-size: 16px;
    line-height: 1;
    transition: transform 0.2s ease;
  }
  .res-btn-white:hover .res-btn-arrow-right {
    transform: translateX(4px);
  }

  .res-btn-glass {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #e4e4e7;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 600;
    padding: 13px 24px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .res-action-banner:hover .res-btn-glass {
    border-color: rgba(0, 0, 0, 0.25);
    color: #18181b;
  }
  .res-action-banner:hover .res-btn-glass:hover {
    color: #000000;
    border-color: #000000;
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  /* Responsive Design */
  @media (max-width: 960px) {
    .res-hero-bento {
      grid-template-columns: 1fr;
    }
    .res-bento-triplet {
      grid-template-columns: 1fr;
    }
    .res-action-banner {
      flex-direction: column;
      align-items: flex-start;
    }
    .res-action-buttons {
      width: 100%;
      flex-direction: column;
    }
    .res-btn-white, .res-btn-glass {
      width: 100%;
      justify-content: center;
    }
    .res-matrix-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .res-tabs-bar {
      width: 100%;
      overflow-x: auto;
    }
  }
`;
