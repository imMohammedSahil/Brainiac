import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildInsightData } from "../utils/insightData";
import { buildBrainPrompt } from "../utils/buildPrompt";
import { getAIInsights } from "../utils/aiInsights";

/* DEV SWITCH */
const ENABLE_AI = false;

/* ─── Inline styles (no external deps needed) ─── */
const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #07080f 0%, #0d1120 50%, #090e1a 100%)",
    color: "#e8eaf6",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "40px 24px 80px",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "fixed", top: "-200px", left: "-200px",
    width: "600px", height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  bgGlow2: {
    position: "fixed", bottom: "-200px", right: "-100px",
    width: "500px", height: "500px",
    background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  // Header
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "48px",
    animation: "fadeSlideDown 0.6s ease both",
  },
  headerTag: {
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em",
    color: "#818cf8", textTransform: "uppercase",
    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "20px", padding: "5px 14px",
  },
  headerTitle: {
    fontSize: "13px", color: "#64748b", letterSpacing: "0.05em",
  },
  // Hero panel
  heroPanelWrapper: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "24px", marginBottom: "28px",
    animation: "fadeSlideUp 0.7s ease 0.1s both",
  },
  heroScore: {
    background: "linear-gradient(145deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: "20px",
    padding: "44px 40px",
    position: "relative",
    overflow: "hidden",
    display: "flex", flexDirection: "column", justifyContent: "center",
    backdropFilter: "blur(12px)",
  },
  heroScoreGlow: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: "280px", height: "280px",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroScoreNumber: {
    fontSize: "88px", fontWeight: 700,
    lineHeight: 1, letterSpacing: "-0.04em",
    background: "linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    position: "relative", zIndex: 1,
  },
  heroScoreLabel: {
    fontSize: "13px", color: "#94a3b8", letterSpacing: "0.12em",
    textTransform: "uppercase", marginTop: "8px",
    fontWeight: 500, position: "relative", zIndex: 1,
  },
  heroScoreBar: {
    marginTop: "28px", height: "4px",
    background: "rgba(255,255,255,0.07)", borderRadius: "99px",
    overflow: "hidden", position: "relative", zIndex: 1,
  },
  // Priority panel
  priorityPanel: {
    background: "rgba(15,18,30,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px", padding: "32px",
    backdropFilter: "blur(12px)",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  priorityTitle: {
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em",
    textTransform: "uppercase", color: "#64748b", marginBottom: "4px",
  },
  priorityRow: {
    display: "flex", flexDirection: "column", gap: "12px",
  },
  priorityItem: {
    display: "flex", alignItems: "flex-start", gap: "12px",
    padding: "14px 16px", borderRadius: "12px",
  },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%",
    marginTop: "4px", flexShrink: 0,
  },
  priorityLabel: {
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: "4px",
  },
  priorityItems: {
    fontSize: "13px", color: "#94a3b8", lineHeight: 1.5,
  },
  // Cards grid
  cardsSection: {
    marginBottom: "28px",
    animation: "fadeSlideUp 0.7s ease 0.25s both",
  },
  sectionLabel: {
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em",
    textTransform: "uppercase", color: "#64748b",
    marginBottom: "16px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "rgba(15,18,30,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px", padding: "22px 20px",
    backdropFilter: "blur(12px)",
    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  },
  cardRegion: {
    fontSize: "14px", fontWeight: 600, color: "#e2e8f0",
    marginBottom: "10px", letterSpacing: "0.01em",
  },
  cardBadge: {
    display: "inline-block",
    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", borderRadius: "6px",
    padding: "3px 9px", marginBottom: "14px",
  },
  cardBarTrack: {
    height: "3px", background: "rgba(255,255,255,0.07)",
    borderRadius: "99px", overflow: "hidden",
  },
  cardScore: {
    fontSize: "11px", color: "#64748b", marginTop: "8px",
    textAlign: "right",
  },
  // Insights
  insightsSection: {
    background: "rgba(15,18,30,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px", padding: "32px",
    backdropFilter: "blur(12px)",
    marginBottom: "28px",
    animation: "fadeSlideUp 0.7s ease 0.35s both",
  },
  insightsHeader: {
    display: "flex", alignItems: "center", gap: "10px",
    marginBottom: "16px",
  },
  insightsIcon: {
    width: "28px", height: "28px", borderRadius: "8px",
    background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(56,189,248,0.3))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px",
  },
  insightsTitle: {
    fontSize: "13px", fontWeight: 600, color: "#a5b4fc",
    letterSpacing: "0.08em", textTransform: "uppercase",
  },
  insightsText: {
    fontSize: "14px", lineHeight: 1.75, color: "#94a3b8",
  },
  insightsLoading: {
    display: "flex", alignItems: "center", gap: "10px",
    fontSize: "13px", color: "#64748b",
  },
  // CTA
  ctaSection: {
    textAlign: "center",
    animation: "fadeSlideUp 0.7s ease 0.45s both",
  },
  ctaButton: {
    display: "inline-flex", alignItems: "center", gap: "10px",
    padding: "16px 40px",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#fff", border: "none", borderRadius: "14px",
    fontSize: "15px", fontWeight: 600, letterSpacing: "0.03em",
    cursor: "pointer",
    boxShadow: "0 0 30px rgba(99,102,241,0.35), 0 4px 20px rgba(0,0,0,0.4)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};

function getStatusConfig(score) {
  if (score < 40) return {
    label: "Needs Attention",
    color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)",
    barColor: "#f87171",
  };
  if (score < 70) return {
    label: "Moderate",
    color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)",
    barColor: "#fbbf24",
  };
  return {
    label: "Strong",
    color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)",
    barColor: "#34d399",
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
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.round(start));
    }, step);
    return () => clearInterval(timer);
  }, [target]);
  return <>{display}</>;
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const regionScores = location.state || {};

  const [insightText, setInsightText] = useState("");
  const [loadingAI, setLoadingAI] = useState(true);
  const [insightData, setInsightData] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [ctaHover, setCtaHover] = useState(false);

  const overallScore =
    Object.keys(regionScores).length > 0
      ? Math.round(
          Object.values(regionScores).reduce((a, b) => a + b, 0) /
            Object.keys(regionScores).length
        )
      : 0;

  useEffect(() => {
    if (Object.keys(regionScores).length === 0) {
      setLoadingAI(false);
      return;
    }

    async function generateInsights() {
      try {
        const data = buildInsightData(regionScores);
        setInsightData(data);

        if (ENABLE_AI) {
          const prompt = buildBrainPrompt(data);
          const aiText = await getAIInsights(prompt);
          setInsightText(aiText);
        } else {
          setInsightText(
            "AI insights temporarily disabled during development."
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAI(false);
      }
    }

    generateInsights();
  }, [regionScores]);

  const getStatus = (score) => {
    if (score < 40) return "Needs Attention";
    if (score < 70) return "Moderate";
    return "Strong";
  };

  const overallConfig = getStatusConfig(overallScore);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scoreFill {
          from { width: 0%; }
          to { width: var(--fill-width); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        .bar-fill-anim {
          height: 100%;
          border-radius: 99px;
          animation: scoreFill 1.2s ease 0.5s both;
        }
        .region-card-hover:hover {
          transform: translateY(-3px) !important;
          border-color: rgba(99,102,241,0.3) !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.15) !important;
        }
        .cta-btn:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 0 50px rgba(99,102,241,0.5), 0 8px 30px rgba(0,0,0,0.5) !important;
        }
      `}</style>

      <div style={S.root}>
        <div style={S.bgGlow1} />
        <div style={S.bgGlow2} />

        <div style={S.inner}>

          {/* Header */}
          <div style={S.header}>
            <span style={S.headerTag}>Brainiac</span>
            <span style={S.headerTitle}>Assessment Complete</span>
          </div>

          {/* Hero + Priority Row */}
          <div style={S.heroPanelWrapper}>

            {/* Hero Score */}
            <div style={S.heroScore}>
              <div style={S.heroScoreGlow} />
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6366f1", marginBottom: "12px", position: "relative", zIndex: 1 }}>
                Overall Score
              </div>
              <div style={S.heroScoreNumber}>
                <AnimatedScore target={overallScore} />
              </div>
              <div style={S.heroScoreLabel}>Overall Brain Health</div>
              <div style={S.heroScoreBar}>
                <div
                  className="bar-fill-anim"
                  style={{
                    "--fill-width": `${overallScore}%`,
                    background: `linear-gradient(90deg, #6366f1, ${overallConfig.barColor})`,
                    boxShadow: `0 0 8px ${overallConfig.color}80`,
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", position: "relative", zIndex: 1 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: overallConfig.color, display: "inline-block", boxShadow: `0 0 6px ${overallConfig.color}` }} />
                <span style={{ fontSize: "12px", color: overallConfig.color, fontWeight: 600 }}>{overallConfig.label}</span>
              </div>
            </div>

            {/* Priority Panel */}
            <div style={S.priorityPanel}>
              <div style={S.priorityTitle}>Priority Overview</div>
              {insightData && (
                <div style={S.priorityRow}>
                  {insightData.weak.length > 0 && (
                    <div style={{ ...S.priorityItem, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "12px" }}>
                      <span style={{ ...S.dot, background: "#f87171", boxShadow: "0 0 6px #f87171" }} />
                      <div>
                        <div style={{ ...S.priorityLabel, color: "#f87171" }}>Needs Attention</div>
                        <div style={S.priorityItems}>{insightData.weak.join(", ")}</div>
                      </div>
                    </div>
                  )}
                  {insightData.moderate.length > 0 && (
                    <div style={{ ...S.priorityItem, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "12px" }}>
                      <span style={{ ...S.dot, background: "#fbbf24", boxShadow: "0 0 6px #fbbf24" }} />
                      <div>
                        <div style={{ ...S.priorityLabel, color: "#fbbf24" }}>Moderate</div>
                        <div style={S.priorityItems}>{insightData.moderate.join(", ")}</div>
                      </div>
                    </div>
                  )}
                  {insightData.strong.length > 0 && (
                    <div style={{ ...S.priorityItem, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "12px" }}>
                      <span style={{ ...S.dot, background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                      <div>
                        <div style={{ ...S.priorityLabel, color: "#34d399" }}>Strong</div>
                        <div style={S.priorityItems}>{insightData.strong.join(", ")}</div>
                      </div>
                    </div>
                  )}
                  {!insightData.weak.length && !insightData.moderate.length && !insightData.strong.length && (
                    <div style={{ color: "#64748b", fontSize: "13px" }}>No region data available.</div>
                  )}
                </div>
              )}
              {!insightData && (
                <div style={{ color: "#64748b", fontSize: "13px" }}>Analyzing regions…</div>
              )}
            </div>
          </div>

          {/* Region Cards */}
          <div style={S.cardsSection}>
            <div style={S.sectionLabel}>Brain Region Analysis</div>
            <div style={S.cardsGrid}>
              {Object.entries(regionScores).map(([region, score], i) => {
                const cfg = getStatusConfig(score);
                return (
                  <div
                    key={region}
                    className="region-card-hover"
                    style={{
                      ...S.card,
                      animation: `fadeSlideUp 0.5s ease ${0.1 + i * 0.06}s both`,
                    }}
                  >
                    <div style={S.cardRegion}>{region}</div>
                    <div style={{
                      ...S.cardBadge,
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}>
                      {cfg.label}
                    </div>
                    <div style={S.cardBarTrack}>
                      <div
                        className="bar-fill-anim"
                        style={{
                          "--fill-width": `${score}%`,
                          background: `linear-gradient(90deg, ${cfg.barColor}aa, ${cfg.barColor})`,
                          boxShadow: `0 0 6px ${cfg.barColor}60`,
                        }}
                      />
                    </div>
                    <div style={S.cardScore}>{score} / 100</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Brain Insights */}
          <div style={S.insightsSection}>
            <div style={S.insightsHeader}>
              <div style={S.insightsIcon}>⚡</div>
              <div style={S.insightsTitle}>Brain Insights</div>
            </div>
            {loadingAI ? (
              <div style={S.insightsLoading}>
                <span style={{ animation: "pulse-dot 1.2s ease infinite", display: "inline-block" }}>●</span>
                Generating insights…
              </div>
            ) : (
              <p style={S.insightsText}>{insightText}</p>
            )}
          </div>

          {/* CTA */}
          <div style={S.ctaSection}>
            <button
              className="cta-btn"
              style={S.ctaButton}
              onClick={() => navigate("/brain")}
            >
              <span>View 3D Brain Visualization</span>
              <span style={{ fontSize: "18px", lineHeight: 1 }}>→</span>
            </button>
            <div style={{ marginTop: "14px", fontSize: "12px", color: "#475569", letterSpacing: "0.05em" }}>
              Interactive neural visualization
            </div>
          </div>

        </div>
      </div>
    </>
  );
}