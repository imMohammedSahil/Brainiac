import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";
import SoundPill from "../components/SoundPill";

export default function Improve() {
  const location = useLocation();
  const navigate = useNavigate();
  const { audioPlaying, audioPaused, toggleAudio } = useSoundSanctuary();
  const region = location.state?.region;
  const regionKey = (region?.id || region?.name || "").toLowerCase();

  // Check if a care plan was previously created for this region
  const [existingPlan, setExistingPlan] = useState(() => {
    try {
      const raw = localStorage.getItem("brainiac_saved_care_plans");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed[regionKey] || null;
      }
    } catch (e) {}
    return null;
  });

  const [userInput, setUserInput] = useState(() => existingPlan?.userInput || "");
  const [selectedFocus, setSelectedFocus] = useState(() => existingPlan?.focus || "Calm & Emotional Balance");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const focusOptions = [
    "Calm & Emotional Balance",
    "Mindful Energy & Flow",
    "Restorative Sleep & Recovery",
    "Compassionate Self-Care"
  ];

  const handleRetakeAssessment = () => {
    try {
      localStorage.removeItem("brainiac_saved_care_plans");
      sessionStorage.removeItem("brainiac_last_active_report");
    } catch (e) {}
    navigate("/assessment");
  };

  if (!region) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="ip-container">
          <div className="ip-bg-grid" />
          <header className="ip-navbar">
            <button className="ip-nav-btn" onClick={() => navigate("/brain")}>
              Brain Explorer
            </button>
            <div className="ip-nav-right">
              <SoundPill />
              <button className="ip-nav-btn" onClick={() => navigate("/")}>
                Home
              </button>
              <button className="ip-nav-btn" onClick={() => navigate("/results")}>
                Profile Results
              </button>
              <button className="ip-nav-btn" onClick={handleRetakeAssessment}>
                Retake Assessment
              </button>
            </div>
          </header>

          <div className="ip-content-wrapper">
            <div className="ip-card" style={{ textAlign: "center", maxWidth: "500px", padding: "48px 36px" }}>
              <div className="ip-tag">Mindful Care</div>
              <h2 className="ip-title" style={{ marginTop: "14px", marginBottom: "12px" }}>
                Select a Region to Nurture
              </h2>
              <p className="ip-subtitle" style={{ marginBottom: "28px", lineHeight: "1.6" }}>
                To create a tailored wellness and self-care plan, please choose an anatomical structure from the Brain Explorer.
              </p>
              <button
                className="ip-btn"
                onClick={() => navigate("/brain")}
              >
                Explore Brain Regions
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert("Please share a few words about what you are experiencing.");
      return;
    }

    setLoading(true);

    try {
      const prompt = `
You are a deeply warm, compassionate, loving, and supportive neuroscience-informed wellness companion.
Craft an intensely personalized, deeply comforting care plan tailored specifically for someone nurturing their ${region.name}.

Target Focus: ${selectedFocus}
User's Personal Thoughts & What They Are Experiencing: "${userInput}"

CRITICAL RULES:
1. Provide EXACTLY 5 distinct sections.
2. Under EACH section header, write EXACTLY ONE single, continuous paragraph (3 to 4 lines / 45 to 60 words, consisting of 2 to 3 comforting, cohesive sentences). Do NOT output multiple paragraphs or separate bullet points under a single section.
3. Tone: Warm, soothing, feel-good, gentle, and comforting. Never clinical or overwhelming.
4. Formatting: Do NOT use emojis. Do NOT use markdown bold asterisks.
5. Structure: Strictly format your response into these exact 5 sections:

Core Neural Insight:
(One single paragraph of 3 to 4 lines connecting their feelings with their ${region.name} and how giving their mind permission to soften brings calm and emotional balance.)

Morning Mindful Ritual:
(One single paragraph of 3 to 4 lines describing a morning breath intention and a nourishing sensory awakening like warm hydration or soft daylight.)

Daytime Flow & Reset:
(One single paragraph of 3 to 4 lines describing a midday pause to unhurry thoughts, soften shoulders, and release tension.)

Sensory Grounding Pause:
(One single paragraph of 3 to 4 lines describing an afternoon sensory pause to reconnect with fresh air or mindful warmth to ease fatigue.)

Evening Wind-Down & Deep Rest:
(One single paragraph of 3 to 4 lines describing a cozy lighting dimming routine and peaceful gratitude reflection for deep, healing sleep.)
`;

      let aiText = "";

      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL
          ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/ai-improve`
          : "/api/ai-improve";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            regionName: region.name,
            focus: selectedFocus,
            userInput
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data?.result || "";
        }
      } catch (netErr) {
        console.warn("Backend server not responding, generating instant synthesized plan:", netErr);
      }

      if (!aiText || aiText.trim() === "" || aiText === "No AI response." || aiText === "AI did not return a response.") {
        aiText = generateClientCarePlan(region.name, selectedFocus, userInput, region.improve);
      }

      /* ===== FORCE CLEAN STRUCTURE ===== */
      aiText = aiText.replace(/\*\*/g, "");
      if (aiText.includes("Core Neural Insight:")) {
        aiText = aiText.substring(aiText.indexOf("Core Neural Insight:"));
      }
      aiText = aiText.replace(/(Core Neural Insight:|Morning Mindful Rituals?:|Daytime Flow & (?:Energy|Reset):|Sensory Grounding Pause:|Evening Wind-Down & Deep Rest:)/gi, "\n\n$1\n");
      aiText = aiText.replace(/ - /g, "\n- ");
      aiText = aiText.replace(/\n\s*\n\s*-/g, "\n- ");
      aiText = aiText.replace(/\n{3,}/g, "\n\n");

      // Save plan permanently in localStorage so user can access it next time
      try {
        const raw = localStorage.getItem("brainiac_saved_care_plans");
        const plans = raw ? JSON.parse(raw) : {};
        plans[regionKey] = {
          result: aiText.trim(),
          region,
          focus: selectedFocus,
          userInput,
          savedAt: Date.now()
        };
        localStorage.setItem("brainiac_saved_care_plans", JSON.stringify(plans));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      setLoading(false);
      navigate("/care-plan", {
        state: {
          result: aiText.trim(),
          region,
          focus: selectedFocus,
          userInput,
          isCacheHit: false
        }
      });
    } catch (error) {
      console.error(error);
      const fallback = generateClientCarePlan(region.name, selectedFocus, userInput, region.improve);
      
      try {
        const raw = localStorage.getItem("brainiac_saved_care_plans");
        const plans = raw ? JSON.parse(raw) : {};
        plans[regionKey] = {
          result: fallback.trim(),
          region,
          focus: selectedFocus,
          userInput,
          savedAt: Date.now()
        };
        localStorage.setItem("brainiac_saved_care_plans", JSON.stringify(plans));
      } catch (e) {}

      setLoading(false);
      navigate("/care-plan", {
        state: {
          result: fallback.trim(),
          region,
          focus: selectedFocus,
          userInput,
          isCacheHit: false
        }
      });
    }
  };

  const generateClientCarePlan = (regionName, focus, context) => {
    const userSnippet = context && context.trim()
      ? `In honoring what you shared ("${context.trim().slice(0, 90)}..."), your nervous system is simply calling for gentler pacing, spaciousness, and soothing reassurance.`
      : `Nurturing your ${regionName} begins with honoring how much you carry and giving your mind wholehearted permission to soften and rest.`;

    return `Core Neural Insight:
${userSnippet} Prioritizing ${focus} lovingly creates the safe internal space your brain needs to restore natural inner ease, emotional stability, and clear, joyful energy.

Morning Mindful Ritual:
Begin your morning with 5 slow, comforting breaths before leaving bed, bringing to mind one kind word to gently carry with you throughout the day ahead. Enjoy a warm glass of water in peaceful stillness near a window, letting soft natural light gently awaken your frontal pathways without the rush of screens.

Daytime Flow & Reset:
Take regular micro-pauses throughout your day to gently drop your shoulders, unclamp your jaw, and release built-up tension with an easy, extended exhale. Whenever your mind feels crowded, step into fresh air for two quiet minutes to reconnect with your natural rhythm.

Sensory Grounding Pause:
Whenever you notice fatigue or mental overload setting in, pause for two minutes with a cup of warm tea or step into fresh air to lovingly reground your senses. Allow the gentle warmth and grounding physical sensations to soothe your nervous system.

Evening Wind-Down & Deep Rest:
Create a cozy, dimly lit sanctuary 45 minutes before bedtime, closing demanding tabs and letting warm lighting signal complete safety to your nervous system. Reflect on three quiet, comforting moments you appreciate from today, allowing your body to soften into deep, restorative, and healing sleep.`;
  };

  return (
    <>
      <style>{baseStyles}</style>

      <div className="ip-container">
        <div className="ip-bg-grid" />

        {/* ── TOP NAV BAR ── */}
        <header className="ip-navbar">
          <button className="ip-nav-btn ip-back-btn" onClick={() => navigate("/brain")}>
            Brain Explorer
          </button>
          <div className="ip-nav-right">
            <SoundPill />
            <button className="ip-nav-btn" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="ip-nav-btn" onClick={() => navigate("/results")}>
              Profile Results
            </button>
            <button className="ip-nav-btn" onClick={() => navigate("/assessment")}>
              Retake Assessment
            </button>
          </div>
        </header>

        {/* ── MAIN 2-COLUMN STUDIO LAYOUT ── */}
        <main className="ip-content-wrapper">
          <div className="ip-studio-grid">
            
            {/* ── LEFT COLUMN: REGION CONTEXT & ESSENTIALS ── */}
            <section className="ip-panel ip-left-panel">
              <div className="ip-panel-header">
                <span className="ip-tag">Focused Brain Structure</span>
                <h2 className="ip-region-hero-title">{region.name}</h2>
                <p className="ip-region-hero-summary">{region.summary}</p>
              </div>

              {/* Natural Gifts */}
              {region.functions && region.functions.length > 0 && (
                <div className="ip-section-block">
                  <span className="ip-section-label">Natural Gifts & Strengths</span>
                  <div className="ip-chip-wrap">
                    {region.functions.map((fn, idx) => (
                      <span key={idx} className="ip-chip">
                        <span className="ip-chip-dot" />
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mind-Body Connection */}
              {region.organs && region.organs.length > 0 && (
                <div className="ip-section-block">
                  <span className="ip-section-label">Mind-Body Harmony</span>
                  <div className="ip-chip-wrap">
                    {region.organs.map((org, idx) => (
                      <span key={idx} className="ip-chip ip-chip-subtle">
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Loving Practices Preview */}
              {region.improve && region.improve.length > 0 && (
                <div className="ip-section-block">
                  <span className="ip-section-label">Gentle Everyday Habits</span>
                  <ul className="ip-preview-list">
                    {region.improve.slice(0, 3).map((tip, idx) => (
                      <li key={idx} className="ip-preview-item">
                        <span className="ip-preview-num">{idx + 1}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ip-panel-footer">
                <button className="ip-switch-btn" onClick={() => navigate("/brain")}>
                  Switch Focused Region
                </button>
              </div>
            </section>

            {/* ── RIGHT COLUMN: AI CARE PLAN STUDIO ── */}
            <section className="ip-panel ip-right-panel">
              <div className="ip-panel-header">
                <span className="ip-tag ip-tag-accent">Mindful Care Studio</span>
                <h1 className="ip-title">Personalized Care Plan</h1>
                <p className="ip-subtitle">
                  Share what you are feeling to receive tailored self-care routines and mindful habits.
                </p>
              </div>

              {/* Active Saved Plan Quick Access */}
              {existingPlan && (
                <div className="ip-saved-plan-banner">
                  <div className="ip-saved-plan-top">
                    <span className="ip-saved-badge">✦ Active Care Plan Available</span>
                    {existingPlan.savedAt && (
                      <span className="ip-saved-time">
                        {new Date(existingPlan.savedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="ip-saved-title">
                    You already created a tailored care plan for {region.name}
                  </h3>
                  <p className="ip-saved-desc">
                    Focus: <strong>{existingPlan.focus}</strong>
                    {existingPlan.userInput && (
                      <span> • "{existingPlan.userInput.slice(0, 70)}{existingPlan.userInput.length > 70 ? "…" : ""}"</span>
                    )}
                  </p>
                  <div className="ip-saved-actions">
                    <button
                      type="button"
                      className="ip-btn ip-btn-saved"
                      onClick={() =>
                        navigate("/care-plan", {
                          state: {
                            result: existingPlan.result,
                            region: existingPlan.region || region,
                            focus: existingPlan.focus,
                            userInput: existingPlan.userInput,
                            isCacheHit: true
                          }
                        })
                      }
                    >
                      <span className="ip-btn-inner">Access Saved Care Plan →</span>
                    </button>
                  </div>
                  <div className="ip-saved-divider">
                    <span>Or modify below to generate a new plan</span>
                  </div>
                </div>
              )}

              {/* Focus Dimension Selector */}
              <div className="ip-form-group">
                <div className="ip-label-row">
                  <label className="ip-label">Primary Wellness Focus</label>
                </div>
                <div className="ip-focus-grid">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`ip-focus-pill${selectedFocus === opt ? " active" : ""}`}
                      onClick={() => setSelectedFocus(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Experience Reflection Textarea */}
              <div className="ip-form-group">
                <div className="ip-label-row">
                  <label className="ip-label">Your Experience & Context</label>
                  <span className={`ip-char-counter ${userInput.length >= 900 ? "warn" : ""}`}>
                    {userInput.length} / 1000
                  </span>
                </div>
                <textarea
                  className={`ip-textarea${focused ? " focused" : ""}`}
                  placeholder="Describe your current daily routine, energy levels, stress points, or what kind of calm you hope to invite..."
                  value={userInput}
                  maxLength={1000}
                  onChange={(e) => setUserInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </div>

              {/* Submit CTA */}
              <button
                className={`ip-btn${loading ? " loading" : ""}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="ip-btn-inner">
                    <span className="ip-spinner" />
                    Crafting Your Care Plan…
                  </span>
                ) : (
                  <span className="ip-btn-inner">
                    Generate Personalized Care Plan →
                  </span>
                )}
              </button>
            </section>

          </div>
        </main>

      </div>
    </>
  );
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @keyframes ipFadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ipSpin {
    to { transform: rotate(360deg); }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .ip-container {
    min-height: 100vh;
    background: #000000;
    display: flex;
    flex-direction: column;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    position: relative;
    overflow-x: hidden;
    color: #ffffff;
  }

  .ip-bg-grid {
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Top Navbar ── */
  .ip-navbar {
    height: 56px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    position: relative;
    z-index: 10;
  }

  .ip-nav-btn {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    background: #000000;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.22);
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
  }

  .ip-nav-btn:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .ip-nav-btn-active {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #ffffff !important;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.4) !important;
  }

  .ip-btn-432hz {
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
    font-family: inherit;
  }

  .ip-btn-432hz:hover {
    background: #ffffff;
    border-color: #ffffff;
    color: #000000;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }

  .ip-btn-432hz.active {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
  }

  .ip-pill-eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2.5px;
    height: 12px;
    flex-shrink: 0;
  }

  .ip-pill-eq .ip-eq-bar {
    width: 2px;
    background-color: currentColor;
    border-radius: 1px;
  }

  .ip-pill-eq .bar-1 { height: 5px; }
  .ip-pill-eq .bar-2 { height: 11px; }
  .ip-pill-eq .bar-3 { height: 7px; }

  .ip-pill-eq.playing .bar-1 {
    animation: ipEqAnim 1.2s infinite ease-in-out;
  }
  .ip-pill-eq.playing .bar-2 {
    animation: ipEqAnim 0.9s infinite ease-in-out 0.2s;
  }
  .ip-pill-eq.playing .bar-3 {
    animation: ipEqAnim 1.4s infinite ease-in-out 0.4s;
  }

  .ip-pill-eq.paused .ip-eq-bar {
    animation-play-state: paused !important;
    opacity: 0.5;
  }

  @keyframes ipEqAnim {
    0%, 100% { height: 3px; }
    50% { height: 12px; }
  }

  .ip-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Studio Content Wrapper ── */
  .ip-content-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30px 28px;
    position: relative;
    z-index: 1;
  }

  .ip-studio-grid {
    display: grid;
    grid-template-columns: 390px 1fr;
    gap: 24px;
    max-width: 1200px;
    width: 100%;
    animation: ipFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── Panels Common Style ── */
  .ip-panel {
    background: rgba(12, 12, 12, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 20px;
    padding: 30px 28px;
    backdrop-filter: blur(24px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
  }

  .ip-panel-header {
    margin-bottom: 18px;
  }

  .ip-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 100px;
    padding: 3.5px 12px;
    display: inline-block;
    margin-bottom: 10px;
  }

  .ip-title {
    font-size: 23px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }

  .ip-subtitle {
    font-size: 13.5px;
    color: #a1a1aa;
    line-height: 1.5;
    margin: 0;
  }

  /* ── Left Column Elements ── */
  .ip-region-hero-title {
    font-size: 21px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }

  .ip-region-hero-summary {
    font-size: 13px;
    line-height: 1.6;
    color: #d4d4d8;
  }

  .ip-section-block {
    margin-top: 15px;
    padding-top: 13px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .ip-section-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 8px;
  }

  .ip-chip-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .ip-chip {
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-transform: capitalize;
  }

  .ip-chip-subtle {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
    color: #a1a1aa;
  }

  .ip-chip-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ffffff;
  }

  .ip-preview-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .ip-preview-item {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font-size: 12.5px;
    color: #d4d4d8;
    line-height: 1.45;
  }

  .ip-preview-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    font-weight: 700;
    color: #000000;
    background: #ffffff;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .ip-panel-footer {
    margin-top: auto;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .ip-switch-btn {
    width: 100%;
    padding: 9.5px 14px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 9px;
    color: rgba(255, 255, 255, 0.8);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ip-switch-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ── Active Saved Plan Card ── */
  .ip-saved-plan-banner {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 18px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
  }

  .ip-saved-plan-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .ip-saved-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 3px 9px;
    border-radius: 100px;
  }

  .ip-saved-time {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: rgba(255, 255, 255, 0.5);
  }

  .ip-saved-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 6px 0;
    line-height: 1.4;
  }

  .ip-saved-desc {
    font-size: 12.5px;
    color: #a1a1aa;
    margin: 0 0 14px 0;
    line-height: 1.5;
  }

  .ip-saved-desc strong {
    color: #ffffff;
  }

  .ip-saved-actions {
    display: flex;
    gap: 10px;
  }

  .ip-btn-saved {
    background: #ffffff !important;
    color: #000000 !important;
    font-weight: 700 !important;
    padding: 10px 18px !important;
    font-size: 12.5px !important;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25) !important;
  }

  .ip-btn-saved:hover {
    background: #e4e4e7 !important;
    box-shadow: 0 6px 28px rgba(255, 255, 255, 0.4) !important;
    transform: translateY(-1px) !important;
  }

  .ip-saved-divider {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px dashed rgba(255, 255, 255, 0.12);
    text-align: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── Right Column Elements ── */
  .ip-form-group {
    margin-top: 15px;
    padding-top: 13px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .ip-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .ip-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 0;
    padding-left: 2px;
  }

  .ip-char-counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 0.04em;
    transition: color 0.15s ease;
  }

  .ip-char-counter.warn {
    color: #facc15;
    font-weight: 700;
  }

  .ip-focus-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .ip-focus-pill {
    padding: 8.5px 12px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #a1a1aa;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .ip-focus-pill:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.22);
  }

  .ip-focus-pill.active {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.22);
  }

  .ip-textarea {
    width: 100%;
    min-height: 120px;
    height: 125px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    padding: 13px 15px;
    font-size: 13.5px;
    font-family: inherit;
    color: #ffffff;
    line-height: 1.6;
    resize: none;
    outline: none;
    transition: all 0.2s ease;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.8) transparent;
  }

  .ip-textarea::-webkit-scrollbar {
    width: 6px;
  }

  .ip-textarea::-webkit-scrollbar-track {
    background: transparent;
  }

  .ip-textarea::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.75);
    border-radius: 100px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .ip-textarea::-webkit-scrollbar-thumb:hover {
    background: #ffffff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  }

  .ip-textarea::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }

  .ip-textarea.focused {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 0 1px #ffffff, 0 0 18px rgba(255, 255, 255, 0.12);
  }

  /* ── Submit CTA ── */
  .ip-btn {
    width: 100%;
    padding: 14.5px 20px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 11px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    letter-spacing: 0.02em;
    cursor: pointer;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.6);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    margin-top: 16px;
  }

  .ip-btn:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 26px rgba(255, 255, 255, 0.38);
    transform: translateY(-1px);
  }

  .ip-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .ip-btn-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ip-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ipSpin 0.7s linear infinite;
    display: inline-block;
  }

  /* ── Responsive Grid ── */
  @media (max-width: 900px) {
    .ip-studio-grid {
      grid-template-columns: 1fr;
      max-width: 600px;
    }
    .ip-focus-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ── Floating Ambient Music Dock ── */
  .cr-music-dock {
    position: fixed;
    bottom: 28px;
    right: 28px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 100px;
    padding: 10px 18px 10px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 255, 255, 0.08);
    z-index: 999;
    animation: ipFadeIn 0.35s ease;
    backdrop-filter: blur(16px);
  }

  .cr-music-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cr-music-equalizer {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 16px;
  }

  .cr-eq-bar {
    width: 3px;
    background: #ffffff;
    border-radius: 2px;
  }

  .bar-1 { animation: crEq 1.2s infinite ease-in-out; height: 8px; }
  .bar-2 { animation: crEq 0.9s infinite ease-in-out 0.2s; height: 14px; }
  .bar-3 { animation: crEq 1.4s infinite ease-in-out 0.4s; height: 10px; }

  @keyframes crEq {
    0%, 100% { height: 4px; }
    50% { height: 15px; }
  }

  .cr-music-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cr-music-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #ffffff;
  }

  .cr-music-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .cr-music-close-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 100px;
    color: #ffffff;
    font-size: 11.5px;
    font-weight: 600;
    padding: 4px 12px;
    cursor: pointer;
    transition: all 0.18s ease;
    font-family: inherit;
  }

  .cr-music-close-btn:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  /* ── Music Paused Controls ── */
  .cr-music-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cr-music-paused-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cr-music-continue-btn {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #ffffff !important;
    font-weight: 700 !important;
  }

  .cr-music-continue-btn:hover {
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.5) !important;
  }

  .cr-music-stop-btn {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  .cr-music-stop-btn:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    color: #ffffff !important;
    border-color: #ffffff !important;
  }

  .cr-music-equalizer.paused .cr-eq-bar {
    animation-play-state: paused !important;
    opacity: 0.45;
  }

  .cr-hidden-audio-frame {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0.01;
    pointer-events: none;
    border: none;
  }

  /* ── Music Gratitude & Loving Credits Sanctuary ── */
  .cr-music-gratitude-section {
    max-width: 1440px;
    margin: 0 auto;
    width: 100%;
    padding: 24px 28px 80px;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
  }

  .cr-music-gratitude-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 20px;
    padding: 34px 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    text-align: left;
  }

  .cr-music-gratitude-card:hover {
    background: #ffffff !important;
    border-color: #ffffff !important;
    color: #000000 !important;
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .cr-gratitude-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .cr-gratitude-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #000000;
    background: #ffffff;
    border-radius: 100px;
    padding: 4px 14px;
    display: inline-flex;
    align-items: center;
    transition: all 0.25s ease;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-badge {
    background: #000000;
    color: #ffffff;
  }

  .cr-gratitude-resonance {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 100px;
    padding: 4px 12px;
    transition: all 0.25s ease;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-resonance {
    color: #52525b;
    border-color: rgba(0, 0, 0, 0.16);
  }

  .cr-gratitude-title {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    transition: color 0.25s ease;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-title {
    color: #000000 !important;
  }

  .cr-gratitude-text {
    font-size: 14.5px;
    line-height: 1.75;
    color: #a1a1aa;
    margin-bottom: 24px;
    transition: color 0.25s ease;
    max-width: 1080px;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-text {
    color: #27272a !important;
  }

  .cr-gratitude-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
    transition: border-color 0.25s ease;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-footer {
    border-top-color: rgba(0, 0, 0, 0.12);
  }

  .cr-gratitude-track-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.25s ease;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-track-pill {
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.16);
    color: #000000;
  }

  .cr-gratitude-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    opacity: 0.9;
    transition: background 0.25s ease;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-dot {
    background: #000000;
  }

  .cr-gratitude-track-name {
    font-weight: 600;
    font-family: inherit;
  }

  .cr-gratitude-yt-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 100px;
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: inherit;
  }

  .cr-gratitude-yt-link:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }

  .cr-music-gratitude-card:hover .cr-gratitude-yt-link {
    background: #000000;
    color: #ffffff;
    border-color: #000000;
  }

  .cr-music-gratitude-card:hover .cr-gratitude-yt-link:hover {
    background: #27272a;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  }
`;