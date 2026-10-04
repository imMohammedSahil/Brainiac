import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";
import SoundPill from "../components/SoundPill";

export default function CareReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { audioPlaying, audioPaused, toggleAudio } = useSoundSanctuary();

  // Active view tab state
  const [activeTab, setActiveTab] = useState("dossier"); // 'dossier' | 'checklist' | 'breathwork' | 'circadian'

  // Try reading from location.state first
  const stateResult = location.state?.result;
  const stateRegion = location.state?.region;
  const stateFocus = location.state?.focus;
  const stateCacheHit = location.state?.isCacheHit;

  const regKey = (
    stateRegion?.id ||
    stateRegion?.name ||
    "prefrontal"
  ).toLowerCase();

  // Rehydrate initial activeData
  let activeData = {
    result: stateResult,
    region: stateRegion,
    focus: stateFocus || "Calm & Emotional Balance",
    isCacheHit: Boolean(stateCacheHit)
  };

  if (!activeData.result) {
    try {
      const rawPlans = localStorage.getItem("brainiac_saved_care_plans");
      const savedPlans = rawPlans ? JSON.parse(rawPlans) : {};
      const foundPlan = savedPlans[regKey] || Object.values(savedPlans)[0];

      if (foundPlan) {
        activeData = {
          result: foundPlan.result,
          region: foundPlan.region,
          focus: foundPlan.focus || "Calm & Emotional Balance",
          isCacheHit: true
        };
      } else {
        const saved = sessionStorage.getItem("brainiac_last_active_report");
        if (saved) {
          const parsed = JSON.parse(saved);
          activeData = {
            result: parsed.result,
            region: parsed.region,
            focus: parsed.focus || "Calm & Emotional Balance",
            isCacheHit: true
          };
        } else {
          // Sample default fallback
          activeData = {
            result: `Core Neural Insight:\n- Nurturing your Prefrontal Cortex begins with honoring how much you carry and giving your mind permission to soften and rest.\n- Prioritizing Calm & Emotional Balance lovingly restores your natural inner ease, emotional stability, and clear, joyful energy.\n\nMorning Mindful Ritual:\n- Begin your morning with 5 slow, comforting breaths, holding a kind and loving intention for your day.\n- Enjoy a warm glass of water in peaceful stillness before engaging with any screens or demanding tasks.\n\nDaytime Flow & Energy:\n- Give yourself permission to pause regularly, gently dropping your shoulders and releasing tension with an easy exhale.\n- Whenever you feel weary, step near a window or into fresh air for a moment of quiet, loving reconnection with yourself.\n\nEvening Wind-Down & Deep Rest:\n- Create a cozy, dimly lit sanctuary 45 minutes before bedtime to welcome soothing calmness into your nervous system.\n- Reflect on three gentle moments you appreciate today, drifting into deep, restorative, healing sleep.`,
            region: {
              name: "Prefrontal Cortex",
              summary: "Guides decision-making, calm focus, self-reflection, and goal direction.",
              functions: ["Executive Focus", "Emotional Regulation", "Mindful Planning", "Self-Reflection"],
              organs: ["Heart Rate", "Vagus Nerve", "Adrenal Axis"],
              improve: ["Dedicated quiet focus time", "Gentle mindfulness & breathing", "Single-tasking with calm patience"]
            },
            focus: "Calm & Emotional Balance",
            isCacheHit: true
          };
        }
      }
    } catch (e) {
      console.warn("Error rehydrating plan from storage:", e);
    }
  }

  const result = activeData.result;
  const region = activeData.region || {
    name: "Prefrontal Cortex",
    summary: "Guides decision-making, calm focus, self-reflection, and goal direction.",
    functions: ["Executive Focus", "Emotional Regulation", "Mindful Planning", "Self-Reflection"],
    organs: ["Heart Rate", "Vagus Nerve", "Adrenal Axis"],
    improve: ["Dedicated quiet focus time", "Gentle mindfulness & breathing", "Single-tasking with calm patience"]
  };
  const focus = activeData.focus;
  const isCacheHit = activeData.isCacheHit;
  const activeRegionKey = (region?.id || region?.name || "prefrontal").toLowerCase();

  // Interactive Checklist State - persisted per region
  const [completedHabits, setCompletedHabits] = useState(() => {
    try {
      const raw = localStorage.getItem("brainiac_saved_care_plans");
      if (raw) {
        const plans = JSON.parse(raw);
        return plans[activeRegionKey]?.completedHabits || {};
      }
    } catch (e) {}
    return {};
  });

  // Interactive Breathwork State - persisted per region (Moments of Calm)
  const [breathPhase, setBreathPhase] = useState("Inhale");
  const [breathCount, setBreathCount] = useState(4);
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPaused, setBreathPaused] = useState(false);
  const [breathCycles, setBreathCycles] = useState(() => {
    try {
      const raw = localStorage.getItem("brainiac_saved_care_plans");
      if (raw) {
        const plans = JSON.parse(raw);
        return plans[activeRegionKey]?.breathCycles || 0;
      }
    } catch (e) {}
    return 0;
  });

  // Sync state changes to persistent localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("brainiac_saved_care_plans");
      const plans = raw ? JSON.parse(raw) : {};
      plans[activeRegionKey] = {
        ...(plans[activeRegionKey] || {}),
        result,
        region,
        focus,
        userInput: location.state?.userInput || plans[activeRegionKey]?.userInput || "",
        breathCycles,
        completedHabits,
        savedAt: plans[activeRegionKey]?.savedAt || Date.now()
      };
      localStorage.setItem("brainiac_saved_care_plans", JSON.stringify(plans));
    } catch (e) {
      console.warn("Could not sync care plan data to localStorage:", e);
    }
  }, [breathCycles, completedHabits, activeRegionKey, result, region, focus, location.state]);

  // Parse Sections Helper
  const parseSections = (rawText) => {
    if (!rawText) return [];
    const rawBlocks = rawText.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
    const parsed = [];

    rawBlocks.forEach((block, idx) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const firstLine = lines[0];
      const isHeader =
        firstLine.endsWith(":") ||
        (!firstLine.startsWith("-") &&
          !firstLine.startsWith("•") &&
          !firstLine.startsWith("*") &&
          lines.length > 1);

      if (isHeader) {
        const title = firstLine
          .replace(/:$/, "")
          .replace(/^#+\s*/, "")
          .replace(/^\*+\s*/, "")
          .trim();
        const items = lines
          .slice(1)
          .map((l) => l.replace(/^[-*•]\s*/, "").trim())
          .filter(Boolean);
        parsed.push({
          title,
          items: items.length > 0 ? items : [lines[1] || title],
        });
      } else {
        const items = lines
          .map((l) => l.replace(/^[-*•]\s*/, "").trim())
          .filter(Boolean);
        parsed.push({
          title: `Insight Module 0${idx + 1}`,
          items,
        });
      }
    });

    return parsed.length > 0
      ? parsed
      : [{ title: "Personalized Care Protocol", items: [rawText] }];
  };

  const sections = parseSections(result);

  // Extract checklist items
  const allHabits = sections
    .filter((sec) => !sec.title.toLowerCase().includes("insight"))
    .flatMap((sec) =>
      sec.items.map((item, itemIdx) => ({
        id: `${sec.title}-${itemIdx}`,
        section: sec.title,
        text: item
      }))
    );

  const completedCount = Object.values(completedHabits).filter(Boolean).length;
  const totalHabits = allHabits.length || 1;
  const progressPercent = Math.round((completedCount / totalHabits) * 100);

  const toggleHabit = (id) => {
    setCompletedHabits((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Breathwork Timer Logic (4-4-4-4 Box Breathing)
  useEffect(() => {
    let interval = null;
    if (breathRunning) {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathPhase((currPhase) => {
              if (currPhase === "Inhale") return "Hold (Full)";
              if (currPhase === "Hold (Full)") return "Exhale";
              if (currPhase === "Exhale") return "Hold (Empty)";
              if (currPhase === "Hold (Empty)") {
                setBreathCycles((c) => c + 1);
                return "Inhale";
              }
              return "Inhale";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathRunning]);

  const handlePrint = () => {
    window.print();
  };

  const scrollToContent = () => {
    const el = document.getElementById("care-content-anchor");
    if (el) {
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.8, offset: -24 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <style>{fullPageStyles}</style>

      <div className="cr-full-container">
        <div className="cr-bg-grid" />

        {/* ── TOP APPLICATION NAVBAR ── */}
        <header className="cr-navbar">
          <div className="cr-nav-left">
            <button
              className="cr-nav-btn cr-back-action-btn"
              onClick={() => navigate("/improve", { state: { region } })}
            >
              ← Back to Care Studio
            </button>
            <div className="cr-breadcrumbs">
              <span className="cr-crumb" onClick={() => navigate("/")}>Home</span>
              <span className="cr-crumb-sep">/</span>
              <span className="cr-crumb" onClick={() => navigate("/brain")}>Brain Sanctuary</span>
              <span className="cr-crumb-sep">/</span>
              <span className="cr-crumb active">{region.name}</span>
            </div>
          </div>

          <div className="cr-nav-right">
            <SoundPill />
            <button className="cr-nav-btn" onClick={handlePrint}>
              Save Care Plan
            </button>
          </div>
        </header>

        {/* ── FULL SCREEN HERO COVER ── */}
        <section className="cr-hero-banner">
          <div className="cr-hero-content">
            <div className="cr-hero-top-badges">
              <span className="cr-badge-accent">Mindful Care Sanctuary</span>
            </div>

            <h1 className="cr-hero-title">Your Personalized Care Journey</h1>
            <p className="cr-hero-desc">
              A loving, gentle daily sanctuary created to help your mind rest, recharge, and rediscover natural ease and peaceful balance.
            </p>

            {/* Vital Metrics Ribbon */}
            <div className="cr-metric-ribbon">
              <div className="cr-metric-card">
                <div className="cr-metric-info">
                  <span className="cr-metric-label">Nurtured Brain Region</span>
                  <span className="cr-metric-val">{region.name}</span>
                </div>
              </div>

              <div className="cr-metric-card">
                <div className="cr-metric-info">
                  <span className="cr-metric-label">Loving Wellness Focus</span>
                  <span className="cr-metric-val">{focus}</span>
                </div>
              </div>

              <div className="cr-metric-card">
                <div className="cr-metric-info">
                  <span className="cr-metric-label">Daily Gentle Pause</span>
                  <span className="cr-metric-val">15 - 20 Mins of Self-Care</span>
                </div>
              </div>

              <div className="cr-metric-card">
                <div className="cr-metric-info">
                  <span className="cr-metric-label">Today's Gentle Progress</span>
                  <span className="cr-metric-val">{progressPercent}% Completed</span>
                </div>
              </div>
            </div>

            {/* Smooth Scroll Trigger */}
            <div
              className="cr-hero-scroll-prompt"
              onClick={scrollToContent}
              role="button"
              tabIndex={0}
            >
              <span className="cr-scroll-text">Scroll to explore your daily care routines</span>
              <div className="cr-scroll-arrow">↓</div>
            </div>
          </div>
        </section>

        <div id="care-content-anchor" />

        {/* ── VIEW TABS BAR ── */}
        <nav className="cr-tabs-bar-container">
          <div className="cr-tabs-bar">
            <button
              className={`cr-tab-btn ${activeTab === "dossier" ? "active" : ""}`}
              onClick={() => setActiveTab("dossier")}
            >
              Daily Care Guidance
            </button>
            <button
              className={`cr-tab-btn ${activeTab === "checklist" ? "active" : ""}`}
              onClick={() => setActiveTab("checklist")}
            >
              Loving Self-Care Checklist ({completedCount}/{totalHabits})
            </button>
            <button
              className={`cr-tab-btn ${activeTab === "breathwork" ? "active" : ""}`}
              onClick={() => setActiveTab("breathwork")}
            >
              Comforting Breath Space
            </button>
            <button
              className={`cr-tab-btn ${activeTab === "circadian" ? "active" : ""}`}
              onClick={() => setActiveTab("circadian")}
            >
              Peaceful Daily Rhythm
            </button>
          </div>
        </nav>

        {/* ── MAIN 2-COLUMN EXPANSIVE CONTENT GRID ── */}
        <main className="cr-main-layout">
          
          {/* ── LEFT COLUMN (PRIMARY VIEW) ── */}
          <section className="cr-primary-col">
            
            {/* TAB 1: FULL PROTOCOL DOSSIER */}
            {activeTab === "dossier" && (
              <div className="cr-tab-view cr-dossier-view">
                <div className="cr-view-intro">
                  <h2 className="cr-section-heading">Loving Steps for Everyday Calm</h2>
                  <p className="cr-section-sub">
                    Simple, nurturing rituals crafted to wrap your nervous system in comfort and restore peaceful clarity.
                  </p>
                </div>

                <div className="cr-modules-stack">
                  {sections.map((sec, idx) => (
                    <article key={idx} className="cr-dossier-card">
                      <div className="cr-dossier-header">
                        <span className="cr-dossier-num">0{idx + 1}</span>
                        <h3 className="cr-dossier-title">{sec.title}</h3>
                      </div>

                      <ul className="cr-dossier-list">
                        {sec.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="cr-dossier-item">
                            <span className="cr-dossier-dot" />
                            <div className="cr-dossier-text-wrap">
                              <span className="cr-dossier-text">{item}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE DAILY CHECKLIST */}
            {activeTab === "checklist" && (
              <div className="cr-tab-view cr-checklist-view">
                <div className="cr-view-intro">
                  <h2 className="cr-section-heading">Loving Self-Care Tracker</h2>
                  <p className="cr-section-sub">
                    Take things at your own gentle pace today. Every small, caring moment you dedicate to yourself is worth celebrating.
                  </p>
                </div>

                {/* Progress Visualizer */}
                <div className="cr-progress-card">
                  <div className="cr-progress-header">
                    <div>
                      <span className="cr-progress-title">Your Self-Care Rhythm</span>
                      <p className="cr-progress-sub">
                        {completedCount === totalHabits
                          ? "You have lovingly completed all your gentle self-care habits for today."
                          : "Take a deep, peaceful breath—you are nurturing your peace step by step."}
                      </p>
                    </div>
                    <div className="cr-progress-score-num">{progressPercent}%</div>
                  </div>
                  <div className="cr-progress-track">
                    <div
                      className="cr-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="cr-checklist-grid">
                  {allHabits.map((habit) => {
                    const isDone = Boolean(completedHabits[habit.id]);
                    return (
                      <div
                        key={habit.id}
                        className={`cr-check-card ${isDone ? "completed" : ""}`}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        <button
                          type="button"
                          className={`cr-checkbox ${isDone ? "checked" : ""}`}
                          aria-label="Toggle habit completion"
                        >
                          {isDone ? "✓" : ""}
                        </button>
                        <div className="cr-check-info">
                          <span className="cr-check-category">{habit.section}</span>
                          <p className={`cr-check-text ${isDone ? "strikethrough" : ""}`}>
                            {habit.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SOMATIC BREATHWORK PACER */}
            {activeTab === "breathwork" && (
              <div className="cr-tab-view cr-breathwork-view">
                <div className="cr-view-intro">
                  <h2 className="cr-section-heading">Comforting Breath Reset (4-4-4-4)</h2>
                  <p className="cr-section-sub">
                    Let your shoulders drop and allow each slow breath to send signals of warmth, safety, and deep comfort to your entire body.
                  </p>
                </div>

                <div className="cr-pacer-card">
                  <div className={`cr-pacer-visual ${breathRunning ? breathPhase.toLowerCase().replace(/[^a-z]/g, "") : "idle"}`}>
                    <div className="cr-pacer-halo" />
                    <div className="cr-pacer-inner">
                      <span className="cr-pacer-phase">{breathRunning ? breathPhase : "Ready"}</span>
                      <span className="cr-pacer-counter">{breathRunning ? breathCount : "4s"}</span>
                    </div>
                  </div>

                  <div className="cr-pacer-controls">
                    {breathRunning ? (
                      <button
                        className="cr-pacer-action-btn cr-pacer-pause-btn"
                        onClick={() => {
                          setBreathRunning(false);
                          setBreathPaused(true);
                        }}
                      >
                        Pause Practice
                      </button>
                    ) : breathPaused ? (
                      <div className="cr-pacer-paused-actions">
                        <button
                          className="cr-pacer-action-btn cr-pacer-continue-btn"
                          onClick={() => {
                            setBreathRunning(true);
                            setBreathPaused(false);
                          }}
                        >
                          Continue
                        </button>
                        <button
                          className="cr-pacer-reset-btn cr-pacer-stop-btn"
                          onClick={() => {
                            setBreathRunning(false);
                            setBreathPaused(false);
                            setBreathPhase("Inhale");
                            setBreathCount(4);
                          }}
                        >
                          Stop
                        </button>
                      </div>
                    ) : (
                      <button
                        className="cr-pacer-action-btn"
                        onClick={() => {
                          setBreathRunning(true);
                          setBreathPaused(false);
                        }}
                      >
                        Begin Gentle Breath Practice
                      </button>
                    )}
                  </div>

                  <div className="cr-pacer-footer-stats">
                    <div className="cr-pacer-stat">
                      <span className="cr-pstat-val">{breathCycles}</span>
                      <span className="cr-pstat-lbl">Moments of Calm</span>
                    </div>
                    <div className="cr-pacer-stat">
                      <span className="cr-pstat-val">4 - 4 - 4 - 4</span>
                      <span className="cr-pstat-lbl">Soft, Natural Rhythm</span>
                    </div>
                    <div className="cr-pacer-stat">
                      <span className="cr-pstat-val">Soothing Reset</span>
                      <span className="cr-pstat-lbl">Mind & Body Comfort</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CIRCADIAN TIMELINE */}
            {activeTab === "circadian" && (
              <div className="cr-tab-view cr-circadian-view">
                <div className="cr-view-intro">
                  <h2 className="cr-section-heading">Your Peaceful Daily Rhythm</h2>
                  <p className="cr-section-sub">
                    Flow gently through your day with rituals designed to meet you with warmth from sunrise to deep night rest.
                  </p>
                </div>

                <div className="cr-timeline-stack">
                  <div className="cr-time-card">
                    <div className="cr-time-card-top">
                      <span className="cr-time-hour">07:30 AM</span>
                      <span className="cr-time-tag">Morning Awakening</span>
                    </div>
                    <h4 className="cr-time-title">Morning Light & Soft Awakening</h4>
                    <p className="cr-time-desc">
                      Step into gentle daylight and enjoy a warm glass of water while holding a kind, compassionate intention for yourself today.
                    </p>
                  </div>

                  <div className="cr-time-card">
                    <div className="cr-time-card-top">
                      <span className="cr-time-hour">10:00 AM</span>
                      <span className="cr-time-tag">Calm, Focused Flow</span>
                    </div>
                    <h4 className="cr-time-title">Dedicated Mindful Flow</h4>
                    <p className="cr-time-desc">
                      Immerse yourself in gentle focus, single-tasking with calm patience and pausing whenever your mind asks for rest.
                    </p>
                  </div>

                  <div className="cr-time-card">
                    <div className="cr-time-card-top">
                      <span className="cr-time-hour">02:30 PM</span>
                      <span className="cr-time-tag">Midday Gentle Pause</span>
                    </div>
                    <h4 className="cr-time-title">Nourishing Breath Reset</h4>
                    <p className="cr-time-desc">
                      Softly drop your shoulders, release any tightness in your jaw, and take three nourishing breaths to refresh your spirit.
                    </p>
                  </div>

                  <div className="cr-time-card">
                    <div className="cr-time-card-top">
                      <span className="cr-time-hour">09:15 PM</span>
                      <span className="cr-time-tag">Cozy Night Rest</span>
                    </div>
                    <h4 className="cr-time-title">Ambient Light Dimming & Gratitude</h4>
                    <p className="cr-time-desc">
                      Invite soft, warm lighting into your room. Reflect on three peaceful moments and drift into deep, restorative, healing sleep.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </section>

          {/* ── RIGHT COLUMN (NEURAL SIDEBAR WIDGETS) ── */}
          <aside className="cr-sidebar-col">
            
            {/* WIDGET: EVIDENCE & CITATIONS */}
            <div className="cr-sidebar-card">
              <div className="cr-scard-header">
                <span className="cr-scard-tag">Scientific Comfort</span>
                <h3 className="cr-scard-title">Why Your Mind Loves This</h3>
              </div>
              <ul className="cr-evidence-list">
                <li className="cr-evidence-item">
                  <span className="cr-ev-bullet">•</span>
                  <span><strong>Nourishing Breaths:</strong> Slow, comforting exhales gently remind your heart and nervous system that you are completely safe.</span>
                </li>
                <li className="cr-evidence-item">
                  <span className="cr-ev-bullet">•</span>
                  <span><strong>Unhurried Pacing:</strong> Pausing regularly gives your brain the loving space it needs to restore clarity and peaceful energy.</span>
                </li>
                <li className="cr-evidence-item">
                  <span className="cr-ev-bullet">•</span>
                  <span><strong>Peaceful Evenings:</strong> Soft ambient lighting creates a cozy haven for your mind to experience deep, healing rest.</span>
                </li>
              </ul>
            </div>

          </aside>

        </main>

        {/* ── LOVING MUSIC CREDITS & GRATITUDE SANCTUARY ── */}
        <footer className="cr-music-gratitude-section">
          <div className="cr-music-gratitude-card">
            <div className="cr-gratitude-header">
              <span className="cr-gratitude-badge">Musical Masterpiece Tribute</span>
              <span className="cr-gratitude-resonance">432Hz Sound Sanctuary</span>
            </div>
            <h3 className="cr-gratitude-title">Honoring Joe Hisaishi & "Howl's Moving Castle"</h3>
            <p className="cr-gratitude-text">
              Music is a sacred sanctuary for the human mind. This restorative 432Hz ambient soundscape is scored from the timeless, evocative composition by maestro <strong>Joe Hisaishi</strong> for the Studio Ghibli classic <em>Howl’s Moving Castle</em> ("Merry-Go-Round of Life").
            </p>
            <p className="cr-gratitude-text" style={{ marginTop: "-12px" }}>
              As a solo developer, I extend my deepest, heartfelt reverence and gratitude to Joe Hisaishi and the orchestral artists whose soul-stirring melodies bring gentle nostalgia, emotional safety, and peaceful solace to our minds and nervous systems.
            </p>
            <div className="cr-gratitude-footer">
              <div className="cr-gratitude-track-pill">
                <span className="cr-gratitude-dot" />
                <span className="cr-gratitude-track-name">Featured Masterpiece: "Merry-Go-Round of Life" — Composed by Joe Hisaishi (432Hz Ambient Arrangement)</span>
              </div>
              <a
                href="https://youtu.be/TK1Ij_-mank?si=JB6rwnFpmIIxASOr"
                target="_blank"
                rel="noopener noreferrer"
                className="cr-gratitude-yt-link"
              >
                Experience on YouTube ↗
              </a>
            </div>
          </div>
        </footer>

        {/* ── BESPOKE ARCHITECTURAL PDF MINDFUL CARE GUIDE TEMPLATE ── */}
        <div className="cr-print-dossier">
          
          {/* ══════════════════════════════════════════════════
              PHYSICAL DOSSIER PAGE 1: LOVING OVERVIEW & DAILY GUIDANCE
              ══════════════════════════════════════════════════ */}
          <div className="cr-pdoc-page cr-pdoc-page-1">
            
            {/* Top Document Metadata Bar */}
            <div className="cr-pdoc-topbar">
              <div className="cr-pdoc-seal">
                <span className="cr-pdoc-emblem">◈</span>
                <div className="cr-pdoc-seal-text">
                  <span className="cr-pdoc-brand-title">BRAINIAC MINDFUL SANCTUARY</span>
                  <span className="cr-pdoc-brand-sub">A GENTLE, LOVING CARE GUIDE FOR YOUR NERVOUS SYSTEM</span>
                </div>
              </div>
              <div className="cr-pdoc-ref-group">
                <div className="cr-pdoc-ref-item">
                  <span className="cr-pdoc-ref-k">GUIDE FOR:</span>
                  <span className="cr-pdoc-ref-v">{region.name.toUpperCase()}</span>
                </div>
                <span className="cr-pdoc-meta-sep">/</span>
                <div className="cr-pdoc-ref-item">
                  <span className="cr-pdoc-ref-k">DATE:</span>
                  <span className="cr-pdoc-ref-v">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).toUpperCase()}</span>
                </div>
                <span className="cr-pdoc-meta-sep">/</span>
                <div className="cr-pdoc-ref-item">
                  <span className="cr-pdoc-ref-k">PURPOSE:</span>
                  <span className="cr-pdoc-ref-v">PEACE & REST</span>
                </div>
              </div>
            </div>

            {/* Dossier Header Frame */}
            <header className="cr-pdoc-hero-frame">
              <div className="cr-pdoc-hero-pills">
                <span className="cr-pdoc-pill-primary">GENTLE DAILY CARE</span>
                <span className="cr-pdoc-pill-secondary">432Hz SOOTHING SOUNDSCAPE</span>
                <span className="cr-pdoc-pill-outline">DEEP NERVOUS SYSTEM EASE</span>
              </div>

              <div className="cr-pdoc-title-row">
                <h1 className="cr-pdoc-main-title">{region.name}</h1>
                <div className="cr-pdoc-status-badge">FOR YOUR REST</div>
              </div>

              <p className="cr-pdoc-main-subtitle">
                Loving Support & Peaceful Routines For Your Mind • Heartfelt Focus: <strong>{focus}</strong>
              </p>

              {/* Heartfelt Sanctuary Inset */}
              <div className="cr-pdoc-executive-quote">
                <div className="cr-pdoc-quote-icon">◈</div>
                <p>
                  <strong>A GENTLE REMINDER:</strong> Give yourself permission to pause, soften, and breathe. This personalized guide was made with love and care to bring warmth to your mind, gentle relief to your body, and quiet moments of peace throughout your day.
                </p>
              </div>

              {/* 6-Quadrant Clinical Indicator Grid */}
              <div className="cr-pdoc-quadrant-grid">
                <div className="cr-pdoc-quad-cell">
                  <span className="cr-pdoc-cell-label">CARE FOCUS</span>
                  <span className="cr-pdoc-cell-value">{region.name}</span>
                  <span className="cr-pdoc-cell-note">{region.summary}</span>
                </div>

                <div className="cr-pdoc-quad-cell">
                  <span className="cr-pdoc-cell-label">HEARTFELT INTENTION</span>
                  <span className="cr-pdoc-cell-value">{focus}</span>
                  <span className="cr-pdoc-cell-note">Nurturing emotional safety, calm & inner ease</span>
                </div>

                <div className="cr-pdoc-quad-cell">
                  <span className="cr-pdoc-cell-label">NATURAL STRENGTHS</span>
                  <span className="cr-pdoc-cell-value">
                    {region.functions ? region.functions.slice(0, 2).join(", ") : "Focus, Emotional Balance"}
                  </span>
                  <span className="cr-pdoc-cell-note">Inherent gifts of your mind</span>
                </div>

                <div className="cr-pdoc-quad-cell">
                  <span className="cr-pdoc-cell-label">BODY CONNECTION</span>
                  <span className="cr-pdoc-cell-value">
                    {region.organs ? region.organs.slice(0, 2).join(", ") : "Gentle Breath, Heart Rhythm"}
                  </span>
                  <span className="cr-pdoc-cell-note">Soothing your nervous pathways</span>
                </div>

                <div className="cr-pdoc-quad-cell">
                  <span className="cr-pdoc-cell-label">SOOTHING MUSIC</span>
                  <span className="cr-pdoc-cell-value">432Hz Ambient Soundscape</span>
                  <span className="cr-pdoc-cell-note">"Merry-Go-Round of Life" • Joe Hisaishi</span>
                </div>

                <div className="cr-pdoc-quad-cell">
                  <span className="cr-pdoc-cell-label">COMFORTING BREATH</span>
                  <span className="cr-pdoc-cell-value">4-4-4-4 Calming Rhythm</span>
                  <span className="cr-pdoc-cell-note">Welcoming peaceful relaxation</span>
                </div>
              </div>
            </header>

            {/* PART 1: GENTLE DAILY CARE PRACTICES */}
            <section className="cr-pdoc-section-block">
              <div className="cr-pdoc-section-title-row">
                <span className="cr-pdoc-sec-badge">PART 01</span>
                <h2 className="cr-pdoc-sec-heading">LOVING STEPS FOR EVERYDAY CALM</h2>
                <span className="cr-pdoc-sec-rule" />
              </div>

              <div className="cr-pdoc-modules-matrix">
                {sections.map((sec, idx) => (
                  <div key={idx} className="cr-pdoc-matrix-cell">
                    <div className="cr-pdoc-matrix-header">
                      <span className="cr-pdoc-matrix-num">0{idx + 1}</span>
                      <h3 className="cr-pdoc-matrix-title">{sec.title}</h3>
                      <span className="cr-pdoc-matrix-tag">CARE RITUAL</span>
                    </div>
                    <ul className="cr-pdoc-matrix-list">
                      {sec.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="cr-pdoc-matrix-item">
                          <span className="cr-pdoc-bullet">◈</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Page 1 Footer */}
            <div className="cr-pdoc-page-footer">
              <span>BRAINIAC MINDFUL SANCTUARY • GENTLE CARE FOR YOUR {region.name.toUpperCase()}</span>
              <span>PAGE 01 OF 02</span>
            </div>

          </div>


          {/* ══════════════════════════════════════════════════
              PHYSICAL DOSSIER PAGE 2: BREATHWORK, RHYTHM & TRIBUTE
              ══════════════════════════════════════════════════ */}
          <div className="cr-pdoc-page cr-pdoc-page-2">

            {/* Top Mini Header for Page 2 */}
            <div className="cr-pdoc-subpage-header">
              <div className="cr-pdoc-subpage-brand">
                <span className="cr-pdoc-emblem">◈</span>
                <span>BRAINIAC MINDFUL SANCTUARY • GENTLE CARE GUIDE</span>
              </div>
              <div className="cr-pdoc-subpage-meta">
                <span>FOR: {region.name.toUpperCase()}</span>
                <span className="cr-pdoc-meta-sep">/</span>
                <span>PAGE 02 OF 02</span>
              </div>
            </div>

            {/* PART 2: COMFORTING BREATH SPACE */}
            <section className="cr-pdoc-section-block">
              <div className="cr-pdoc-section-title-row">
                <span className="cr-pdoc-sec-badge">PART 02</span>
                <h2 className="cr-pdoc-sec-heading">COMFORTING BREATH SPACE (4-4-4-4 BOX PACING)</h2>
                <span className="cr-pdoc-sec-rule" />
              </div>

              <div className="cr-pdoc-breath-strip">
                <div className="cr-pdoc-b-step">
                  <div className="cr-pdoc-b-header">
                    <span className="cr-pdoc-b-tag">STAGE 01</span>
                    <span className="cr-pdoc-b-time">4 SECONDS</span>
                  </div>
                  <h4 className="cr-pdoc-b-action">Inhale Peacefully</h4>
                  <p className="cr-pdoc-b-desc">Breathe in soft, calming air through your nose, letting your belly expand gently without rush.</p>
                  <span className="cr-pdoc-b-impact">Invites gentle ease into your body</span>
                </div>

                <div className="cr-pdoc-b-connector">→</div>

                <div className="cr-pdoc-b-step">
                  <div className="cr-pdoc-b-header">
                    <span className="cr-pdoc-b-tag">STAGE 02</span>
                    <span className="cr-pdoc-b-time">4 SECONDS</span>
                  </div>
                  <h4 className="cr-pdoc-b-action">Rest Softly</h4>
                  <p className="cr-pdoc-b-desc">Hold gently at the top; unclamp your jaw, soften facial muscles, and let your shoulders drop.</p>
                  <span className="cr-pdoc-b-impact">A quiet moment of comforting stillness</span>
                </div>

                <div className="cr-pdoc-b-connector">→</div>

                <div className="cr-pdoc-b-step">
                  <div className="cr-pdoc-b-header">
                    <span className="cr-pdoc-b-tag">STAGE 03</span>
                    <span className="cr-pdoc-b-time">4 SECONDS</span>
                  </div>
                  <h4 className="cr-pdoc-b-action">Exhale Gently</h4>
                  <p className="cr-pdoc-b-desc">Slow, warm oral release; let go of all hurry and let tension melt completely away.</p>
                  <span className="cr-pdoc-b-impact">Signals safety to your nervous system</span>
                </div>

                <div className="cr-pdoc-b-connector">→</div>

                <div className="cr-pdoc-b-step">
                  <div className="cr-pdoc-b-header">
                    <span className="cr-pdoc-b-tag">STAGE 04</span>
                    <span className="cr-pdoc-b-time">4 SECONDS</span>
                  </div>
                  <h4 className="cr-pdoc-b-action">Quiet Stillness</h4>
                  <p className="cr-pdoc-b-desc">Rest peacefully in the calm, empty space before your next natural, loving breath.</p>
                  <span className="cr-pdoc-b-impact">Restores natural calm and balance</span>
                </div>
              </div>
            </section>

            {/* PART 3: PEACEFUL DAILY RHYTHM & CHECKLIST */}
            <section className="cr-pdoc-section-block">
              <div className="cr-pdoc-section-title-row">
                <span className="cr-pdoc-sec-badge">PART 03</span>
                <h2 className="cr-pdoc-sec-heading">PEACEFUL DAILY RHYTHM & SELF-CARE CHECKLIST</h2>
                <span className="cr-pdoc-sec-rule" />
              </div>

              {/* 4-Stage Daily Timeline Strip */}
              <div className="cr-pdoc-timeline-strip">
                <div className="cr-pdoc-time-node">
                  <div className="cr-pdoc-time-top">
                    <span className="cr-pdoc-time-badge">07:30 AM</span>
                    <span className="cr-pdoc-time-phase">MORNING</span>
                  </div>
                  <h5 className="cr-pdoc-time-title">Morning Warmth</h5>
                  <p className="cr-pdoc-time-text">Warm glass of water, 5 slow comforting breaths, soft morning light.</p>
                </div>
                <div className="cr-pdoc-time-node">
                  <div className="cr-pdoc-time-top">
                    <span className="cr-pdoc-time-badge">01:00 PM</span>
                    <span className="cr-pdoc-time-phase">AFTERNOON</span>
                  </div>
                  <h5 className="cr-pdoc-time-title">Midday Reset</h5>
                  <p className="cr-pdoc-time-text">Gentle shoulder roll, soft exhale, giving yourself a peaceful pause.</p>
                </div>
                <div className="cr-pdoc-time-node">
                  <div className="cr-pdoc-time-top">
                    <span className="cr-pdoc-time-badge">06:30 PM</span>
                    <span className="cr-pdoc-time-phase">EVENING</span>
                  </div>
                  <h5 className="cr-pdoc-time-title">Evening Unwinding</h5>
                  <p className="cr-pdoc-time-text">Dimming bright lights, closing work tabs, stepping into cozy comfort.</p>
                </div>
                <div className="cr-pdoc-time-node">
                  <div className="cr-pdoc-time-top">
                    <span className="cr-pdoc-time-badge">09:15 PM</span>
                    <span className="cr-pdoc-time-phase">BEDTIME</span>
                  </div>
                  <h5 className="cr-pdoc-time-title">Deep Sleep Sanctuary</h5>
                  <p className="cr-pdoc-time-text">3 points of gentle gratitude, warm blankets, restorative healing sleep.</p>
                </div>
              </div>

              {/* Structured Habits Checklist */}
              <div className="cr-pdoc-check-table">
                <div className="cr-pdoc-table-header">
                  <span className="cr-pdoc-th-status">DONE</span>
                  <span className="cr-pdoc-th-cat">TIME OF DAY</span>
                  <span className="cr-pdoc-th-desc">GENTLE DAILY PRACTICE</span>
                </div>
                {allHabits.map((h, i) => (
                  <div key={i} className="cr-pdoc-table-row">
                    <span className="cr-pdoc-td-box">[   ]</span>
                    <span className="cr-pdoc-td-cat">{h.section.toUpperCase()}</span>
                    <span className="cr-pdoc-td-desc">{h.text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* PART 4: WHY THIS HELPS & SOLO DEVELOPER TRIBUTE */}
            <section className="cr-pdoc-section-block">
              <div className="cr-pdoc-section-title-row">
                <span className="cr-pdoc-sec-badge">PART 04</span>
                <h2 className="cr-pdoc-sec-heading">HOW GENTLE CARE RESTORES YOU & MUSICAL SANCTUARY</h2>
                <span className="cr-pdoc-sec-rule" />
              </div>

              <div className="cr-pdoc-bottom-grid">
                {/* Science / Heartfelt Relief Column */}
                <div className="cr-pdoc-science-panel">
                  <div className="cr-pdoc-panel-hdr">
                    <span className="cr-pdoc-panel-icon">◈</span>
                    <h4 className="cr-pdoc-panel-heading">HOW THIS BRINGS RELIEF TO YOUR MIND</h4>
                  </div>
                  <p className="cr-pdoc-ev-line">
                    <strong>Slowing Your Breath:</strong> Taking slow, extended exhales signals to your nervous system that you are safe, naturally easing tension and bringing your body into a peaceful, steady rhythm.
                  </p>
                  <p className="cr-pdoc-ev-line">
                    <strong>Honoring Quiet Pauses:</strong> Giving your mind short, guilt-free rest windows helps your {region.name} recharge, restoring natural clarity, emotional ease, and gentle focus.
                  </p>
                </div>

                {/* Joe Hisaishi Tribute Column */}
                <div className="cr-pdoc-tribute-panel">
                  <div className="cr-pdoc-panel-hdr">
                    <span className="cr-pdoc-panel-icon">◈</span>
                    <h4 className="cr-pdoc-panel-heading">MUSICAL SANCTUARY DEDICATION</h4>
                  </div>
                  <p className="cr-pdoc-tribute-text">
                    This care plan is harmonized with the 432Hz ambient soundscape of <em>"Merry-Go-Round of Life"</em> from Studio Ghibli's <em>Howl’s Moving Castle</em>, composed by legendary maestro <strong>Joe Hisaishi</strong>.
                  </p>
                  <p className="cr-pdoc-tribute-sub">
                    As a solo developer, I built this space with love to offer a warm sanctuary for weary minds. My deepest personal gratitude goes to Joe Hisaishi for creating timeless music that embraces hearts with solace and wonder.
                  </p>
                </div>
              </div>
            </section>

            {/* Final Document Seal & Loving Blessing Footer */}
            <footer className="cr-pdoc-final-footer">
              <div className="cr-pdoc-footer-inner">
                <div className="cr-pdoc-footer-left">
                  <div className="cr-pdoc-footer-seal-line">
                    <span className="cr-pdoc-emblem">◈</span>
                    <span className="cr-pdoc-foot-brand">BRAINIAC MINDFUL SANCTUARY</span>
                  </div>
                  <span className="cr-pdoc-foot-sub">A gentle, comforting space created with love to help your mind rest and heal</span>
                </div>
                
                <div className="cr-pdoc-footer-center">
                  <div className="cr-pdoc-signature-line">
                    <span className="cr-pdoc-sig-label">MADE WITH CARE:</span>
                    <span className="cr-pdoc-sig-value">FOR YOUR WELLBEING & PEACE</span>
                  </div>
                </div>

                <div className="cr-pdoc-footer-right">
                  <span className="cr-pdoc-foot-blessing">"May your mind always have a loving place to rest and breathe."</span>
                  <span className="cr-pdoc-foot-ver">PERSONAL CARE SANCTUARY</span>
                </div>
              </div>
            </footer>

          </div>

        </div>

      </div>
    </>
  );
}

const fullPageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  @keyframes crFade {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes crPulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.08); opacity: 1; }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .cr-full-container {
    min-height: 100vh;
    background: #000000;
    display: flex;
    flex-direction: column;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #ffffff;
    position: relative;
    overflow-x: hidden;
  }

  .cr-bg-grid {
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Navbar ── */
  .cr-navbar {
    height: 68px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    position: sticky;
    top: 0;
    z-index: 30;
  }

  .cr-nav-left {
    display: flex;
    align-items: center;
    gap: 22px;
  }

  .cr-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'JetBrains Mono', monospace;
  }

  .cr-crumb {
    cursor: pointer;
    transition: color 0.15s ease;
  }
  .cr-crumb:hover {
    color: #ffffff;
  }
  .cr-crumb.active {
    color: #ffffff;
    font-weight: 700;
    cursor: default;
  }
  .cr-crumb-sep {
    color: rgba(255, 255, 255, 0.25);
  }

  .cr-nav-btn {
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 600;
    background: #000000;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.22);
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: inherit;
  }

  .cr-nav-btn:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .cr-nav-btn-active {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #ffffff !important;
    font-weight: 700;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
  }

  .cr-pill-eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2.5px;
    height: 12px;
    flex-shrink: 0;
  }

  .cr-pill-eq .cr-eq-bar {
    width: 2px;
    background-color: currentColor;
    border-radius: 1px;
  }

  .cr-pill-eq .bar-1 { height: 5px; }
  .cr-pill-eq .bar-2 { height: 11px; }
  .cr-pill-eq .bar-3 { height: 7px; }

  .cr-pill-eq.playing .bar-1 {
    animation: crEqAnim 1.2s infinite ease-in-out;
  }
  .cr-pill-eq.playing .bar-2 {
    animation: crEqAnim 0.9s infinite ease-in-out 0.2s;
  }
  .cr-pill-eq.playing .bar-3 {
    animation: crEqAnim 1.4s infinite ease-in-out 0.4s;
  }

  .cr-pill-eq.paused .cr-eq-bar {
    animation-play-state: paused !important;
    opacity: 0.5;
  }

  @keyframes crEqAnim {
    0%, 100% { height: 3px; }
    50% { height: 12px; }
  }

  .cr-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* ── Hero Banner (Full Screen Hero Sanctuary Cover) ── */
  .cr-hero-banner {
    min-height: calc(100vh - 68px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 48px 48px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.05) 0%, transparent 75%);
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    margin-bottom: 70px;
  }

  .cr-hero-content {
    max-width: 1360px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .cr-hero-top-badges {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }

  .cr-badge-accent {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #000000;
    background: #ffffff;
    border-radius: 100px;
    padding: 5.5px 18px;
    display: inline-flex;
    align-items: center;
  }

  .cr-badge-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 100px;
    padding: 4.5px 14px;
  }

  .cr-badge-cache {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #000000;
    background: #ffffff;
    border-radius: 100px;
    padding: 4.5px 14px;
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.4);
  }

  .cr-hero-title {
    font-size: 46px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.035em;
    line-height: 1.2;
    margin: 0 0 16px;
    max-width: 960px;
  }

  .cr-hero-desc {
    font-size: 17.5px;
    color: #a1a1aa;
    line-height: 1.7;
    max-width: 800px;
    margin: 0 0 44px;
  }

  /* Metric Ribbon */
  .cr-metric-ribbon {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;
    width: 100%;
    margin-bottom: 44px;
  }

  .cr-metric-card {
    background: rgba(14, 14, 14, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 24px 26px;
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cr-metric-card:hover {
    background: rgba(22, 22, 22, 0.95);
    border-color: rgba(255, 255, 255, 0.28);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  .cr-metric-icon {
    font-size: 24px;
  }

  .cr-metric-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .cr-metric-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.5);
  }

  .cr-metric-val {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
  }

  /* ── Scroll Down Indicator ── */
  .cr-hero-scroll-prompt {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.75);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 12px 30px;
    border-radius: 100px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.2);
    user-select: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .cr-hero-scroll-prompt:hover {
    color: #000000 !important;
    background: #ffffff !important;
    border-color: #ffffff !important;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 0 32px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .cr-hero-scroll-prompt:hover .cr-scroll-text,
  .cr-hero-scroll-prompt:hover .cr-scroll-arrow {
    color: #000000 !important;
    font-weight: 800;
  }

  .cr-scroll-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    transition: color 0.2s ease;
  }

  .cr-scroll-arrow {
    font-size: 16px;
    transition: color 0.2s ease;
    animation: crBounce 1.8s infinite ease-in-out;
  }

  @keyframes crBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(5px); }
  }

  /* ── Tabs Bar ── */
  .cr-tabs-bar-container {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(8, 8, 8, 0.92);
    backdrop-filter: blur(24px);
    position: sticky;
    top: 68px;
    z-index: 25;
    width: 100%;
    padding: 0;
    margin-top: 40px;
  }

  .cr-tabs-bar {
    max-width: 1440px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    overflow-x: auto;
    padding: 18px 48px;
    box-sizing: border-box;
    text-align: left;
  }

  .cr-tab-btn {
    padding: 12px 24px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    font-family: inherit;
    white-space: nowrap;
    text-align: left;
  }

  .cr-tab-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
  }

  .cr-tab-btn.active {
    background: #ffffff;
    color: #000000;
    font-weight: 700;
    border-color: #ffffff;
    box-shadow: 0 2px 18px rgba(255, 255, 255, 0.28);
  }

  /* ── Main 2-Column Layout ── */
  .cr-main-layout {
    max-width: 1440px;
    margin: 0 auto;
    width: 100%;
    padding: 84px 48px 120px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 390px;
    gap: 48px;
    position: relative;
    z-index: 1;
    text-align: left;
  }

  .cr-tab-view {
    animation: crFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    text-align: left;
  }

  .cr-view-intro {
    margin-bottom: 28px;
    text-align: left;
  }

  .cr-section-heading {
    font-size: 23px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
    text-align: left;
  }

  .cr-section-sub {
    font-size: 14.5px;
    color: #a1a1aa;
    line-height: 1.65;
    text-align: left;
  }

  /* ── Dossier Stack ── */
  .cr-modules-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cr-dossier-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 22px;
    padding: 32px 36px;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    position: relative;
  }

  .cr-dossier-card:hover {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .cr-dossier-card:hover .cr-dossier-header {
    border-bottom-color: rgba(0, 0, 0, 0.14);
  }

  .cr-dossier-card:hover .cr-dossier-num {
    background: #000000;
    color: #ffffff;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
    transform: scale(1.08);
  }

  .cr-dossier-card:hover .cr-dossier-title {
    color: #000000 !important;
    font-weight: 800;
  }

  .cr-dossier-card:hover .cr-dossier-item {
    color: #18181b !important;
  }

  .cr-dossier-card:hover .cr-dossier-dot {
    background: #000000;
    opacity: 0.9;
  }

  .cr-dossier-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease;
  }

  .cr-dossier-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    font-weight: 700;
    color: #000000;
    background: #ffffff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.25s ease;
  }

  .cr-dossier-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff;
    margin: 0;
    transition: all 0.25s ease;
  }

  .cr-dossier-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cr-dossier-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: 14.5px;
    line-height: 1.75;
    color: #e4e4e7;
    transition: color 0.25s ease;
  }

  .cr-dossier-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    margin-top: 10px;
    flex-shrink: 0;
    opacity: 0.9;
  }

  .cr-dossier-text-wrap {
    flex: 1;
  }

  /* ── Checklist View ── */
  .cr-progress-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 24px;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .cr-progress-card:hover {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .cr-progress-card:hover .cr-progress-title {
    color: #000000 !important;
    font-weight: 800;
  }

  .cr-progress-card:hover .cr-progress-sub {
    color: #3f3f46 !important;
  }

  .cr-progress-card:hover .cr-progress-score-num {
    color: #000000 !important;
  }

  .cr-progress-card:hover .cr-progress-track {
    background: rgba(0, 0, 0, 0.12) !important;
  }

  .cr-progress-card:hover .cr-progress-fill {
    background: #000000 !important;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.35) !important;
  }

  .cr-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .cr-progress-title {
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    transition: color 0.2s ease;
  }

  .cr-progress-sub {
    font-size: 13.5px;
    color: #a1a1aa;
    margin-top: 4px;
    transition: color 0.2s ease;
  }

  .cr-progress-score-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    transition: color 0.2s ease;
  }

  .cr-progress-track {
    height: 9px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    overflow: hidden;
    transition: background 0.2s ease;
  }

  .cr-progress-fill {
    height: 100%;
    background: #ffffff;
    border-radius: 100px;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.5);
    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
  }

  .cr-checklist-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .cr-check-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .cr-check-card:hover {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(255, 255, 255, 0.22), 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .cr-check-card:hover .cr-check-category {
    color: #52525b !important;
  }

  .cr-check-card:hover .cr-check-text {
    color: #18181b !important;
  }

  .cr-check-card:hover .cr-check-text.strikethrough {
    color: #a1a1aa !important;
  }

  .cr-check-card:hover .cr-checkbox {
    border-color: rgba(0, 0, 0, 0.5);
    color: #ffffff;
  }

  .cr-check-card:hover .cr-checkbox.checked {
    background: #000000 !important;
    border-color: #000000 !important;
    color: #ffffff !important;
  }

  .cr-check-card.completed {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.04);
  }

  .cr-checkbox {
    width: 24px;
    height: 24px;
    border-radius: 7px;
    background: transparent;
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    color: #000000;
    font-weight: 800;
    font-size: 13.5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.2s ease;
  }

  .cr-checkbox.checked {
    background: #ffffff;
    border-color: #ffffff;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
  }

  .cr-check-info {
    flex: 1;
  }

  .cr-check-category {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.5);
    display: block;
    margin-bottom: 4px;
    transition: color 0.2s ease;
  }

  .cr-check-text {
    font-size: 14.5px;
    line-height: 1.65;
    color: #e4e4e7;
    transition: all 0.2s ease;
  }

  .cr-check-text.strikethrough {
    color: rgba(255, 255, 255, 0.45);
    text-decoration: line-through;
  }

  /* ── Breathwork Tool ── */
  .cr-pacer-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 24px;
    padding: 56px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .cr-pacer-card:hover {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .cr-pacer-card:hover .cr-pacer-phase,
  .cr-pacer-card:hover .cr-pacer-counter {
    color: #000000 !important;
  }

  .cr-pacer-card:hover .cr-pacer-visual {
    border-color: rgba(0, 0, 0, 0.35);
  }

  .cr-pacer-card:hover .cr-pacer-action-btn {
    background: #000000 !important;
    color: #ffffff !important;
    border-color: #000000 !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
  }

  .cr-pacer-card:hover .cr-pacer-action-btn:hover {
    background: #27272a !important;
    color: #ffffff !important;
    border-color: #27272a !important;
    transform: translateY(-1px);
  }

  .cr-pacer-card:hover .cr-pacer-reset-btn {
    border-color: rgba(0, 0, 0, 0.35) !important;
    color: #000000 !important;
    background: transparent !important;
    font-weight: 700 !important;
  }

  .cr-pacer-card:hover .cr-pacer-reset-btn:hover {
    background: rgba(0, 0, 0, 0.08) !important;
    border-color: rgba(0, 0, 0, 0.6) !important;
    color: #000000 !important;
  }

  .cr-pacer-card:hover .cr-pacer-footer-stats {
    border-top-color: rgba(0, 0, 0, 0.14);
  }

  .cr-pacer-card:hover .cr-pstat-val {
    color: #000000 !important;
  }

  .cr-pacer-card:hover .cr-pstat-lbl {
    color: #52525b !important;
  }

  .cr-pacer-visual {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 36px;
    position: relative;
    transition: all 1s ease-in-out;
  }

  .cr-pacer-visual.inhale {
    transform: scale(1.18);
    border-color: #ffffff;
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.35);
  }

  .cr-pacer-visual.holdfull {
    transform: scale(1.18);
    border-color: rgba(255, 255, 255, 0.9);
  }

  .cr-pacer-visual.exhale {
    transform: scale(0.92);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .cr-pacer-visual.holdempty {
    transform: scale(0.92);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .cr-pacer-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .cr-pacer-phase {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #ffffff;
    transition: color 0.2s ease;
  }

  .cr-pacer-counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 38px;
    font-weight: 800;
    color: #ffffff;
    transition: color 0.2s ease;
  }

  .cr-pacer-controls {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 36px;
  }

  .cr-pacer-action-btn {
    padding: 14px 32px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.32);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14.5px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .cr-pacer-action-btn:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.35);
  }

  .cr-pacer-reset-btn {
    padding: 14px 22px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .cr-pacer-reset-btn:hover {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.35);
  }

  .cr-pacer-footer-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    width: 100%;
    padding-top: 28px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease;
  }

  .cr-pstat-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 17px;
    font-weight: 800;
    color: #ffffff;
    display: block;
    margin-bottom: 3px;
    transition: color 0.2s ease;
  }

  .cr-pstat-lbl {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.2s ease;
  }

  /* ── Circadian Timeline View ── */
  .cr-timeline-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .cr-time-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 20px;
    padding: 26px 30px;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
    position: relative;
  }

  .cr-time-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease;
  }

  .cr-time-hour {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    font-weight: 800;
    color: #000000;
    background: #ffffff;
    border-radius: 8px;
    padding: 4px 12px;
    letter-spacing: 0.04em;
    transition: all 0.2s ease;
  }

  .cr-time-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.08em;
    transition: color 0.2s ease;
  }

  .cr-time-title {
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
    transition: color 0.2s ease;
  }

  .cr-time-desc {
    font-size: 14.5px;
    color: #a1a1aa;
    line-height: 1.7;
    transition: color 0.2s ease;
  }

  .cr-time-card:hover {
    border-color: #ffffff !important;
    background: #ffffff !important;
    color: #000000 !important;
    transform: translateY(-3px);
    box-shadow: 0 20px 48px rgba(255, 255, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .cr-time-card:hover .cr-time-card-top {
    border-bottom-color: rgba(0, 0, 0, 0.12);
  }

  .cr-time-card:hover .cr-time-hour {
    background: #000000 !important;
    color: #ffffff !important;
  }

  .cr-time-card:hover .cr-time-tag {
    color: #52525b !important;
  }

  .cr-time-card:hover .cr-time-title {
    color: #000000 !important;
    font-weight: 800;
  }

  .cr-time-card:hover .cr-time-desc {
    color: #18181b !important;
  }

  /* ── Sidebar Column ── */
  .cr-sidebar-col {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .cr-sidebar-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 20px;
    padding: 28px 26px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    position: relative;
    overflow: hidden;
    transition: border-color 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1;
  }

  /* Slow cinematic color wave from bottom-left to top-right */
  .cr-sidebar-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #ffffff;
    clip-path: circle(0% at 0% 100%);
    transition: clip-path 1.65s cubic-bezier(0.25, 1, 0.35, 1);
    z-index: 0;
    pointer-events: none;
  }

  .cr-sidebar-card:hover::before {
    clip-path: circle(180% at 0% 100%);
  }

  .cr-sidebar-card:hover {
    border-color: #ffffff !important;
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .cr-sidebar-card > * {
    position: relative;
    z-index: 1;
  }

  .cr-scard-header {
    margin-bottom: 14px;
  }

  .cr-scard-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.5);
    display: block;
    margin-bottom: 5px;
    transition: color 1.1s ease;
  }

  .cr-sidebar-card:hover .cr-scard-tag {
    color: #52525b !important;
  }

  .cr-scard-title {
    font-size: 19px;
    font-weight: 800;
    color: #ffffff;
    transition: color 1.1s ease;
  }

  .cr-sidebar-card:hover .cr-scard-title {
    color: #000000 !important;
    font-weight: 800;
  }

  .cr-evidence-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cr-evidence-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12.5px;
    line-height: 1.6;
    color: #d4d4d8;
    transition: color 1.1s ease;
  }

  .cr-sidebar-card:hover .cr-evidence-item {
    color: #18181b !important;
  }

  .cr-sidebar-card:hover .cr-evidence-item strong {
    color: #000000 !important;
  }

  .cr-ev-bullet {
    color: #ffffff;
    font-weight: 800;
    transition: color 1.1s ease;
  }

  .cr-sidebar-card:hover .cr-ev-bullet {
    color: #000000 !important;
  }

  /* ── Floating Ambient Music Dock ── */
  .cr-music-dock {
    position: fixed;
    bottom: 28px;
    right: 32px;
    background: rgba(14, 14, 14, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 100px;
    padding: 10px 18px 10px 14px;
    backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 50;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 255, 255, 0.15);
    animation: crFade 0.3s ease both;
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

  /* ── Breathwork Paused Controls ── */
  .cr-pacer-paused-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .cr-pacer-continue-btn {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: #ffffff;
  }

  .cr-pacer-continue-btn:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .cr-pacer-stop-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.75);
  }

  .cr-pacer-stop-btn:hover {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #ffffff !important;
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
    padding: 0 48px 100px;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
  }

  .cr-music-gratitude-card {
    background: rgba(14, 14, 14, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 22px;
    padding: 38px 44px;
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

  /* ── Responsive Grid ── */
  @media (max-width: 1100px) {
    .cr-main-layout {
      grid-template-columns: 1fr;
      padding: 36px 32px 60px;
    }
    .cr-metric-ribbon {
      grid-template-columns: repeat(2, 1fr);
    }
    .cr-time-block {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .cr-navbar, .cr-hero-banner, .cr-tabs-bar {
      padding-left: 32px;
      padding-right: 32px;
    }
  }

  @media (max-width: 768px) {
    .cr-navbar {
      padding: 0 20px;
    }
    .cr-breadcrumbs {
      display: none;
    }
    .cr-hero-banner {
      min-height: auto;
      padding: 48px 20px;
    }
    .cr-hero-title {
      font-size: 32px;
    }
    .cr-hero-desc {
      font-size: 15px;
      margin-bottom: 32px;
    }
    .cr-metric-ribbon {
      grid-template-columns: 1fr;
      margin-bottom: 32px;
    }
    .cr-tabs-bar {
      padding-left: 20px;
      padding-right: 20px;
    }
    .cr-main-layout {
      padding: 24px 20px 60px;
      gap: 28px;
    }
    .cr-dossier-card, .cr-progress-card, .cr-pacer-card, .cr-sidebar-card {
      padding: 22px 20px;
    }
    .cr-music-dock {
      bottom: 18px;
      right: 18px;
      left: 18px;
      justify-content: space-between;
    }
  }

  /* ════════════════════════════════════════════════════════════
     BESPOKE ARCHITECTURAL PDF DOSSIER STYLES (@media print)
     Spacious, Airy White Canvas with Generous Breathing Space
     ════════════════════════════════════════════════════════════ */
  .cr-print-dossier {
    display: none;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 14mm 16mm 16mm 16mm;
    }

    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }

    html, body {
      background: #ffffff !important;
      color: #09090b !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
      -webkit-font-smoothing: antialiased;
    }

    .cr-full-container {
      background: #ffffff !important;
      min-height: auto !important;
      padding: 0 !important;
    }

    /* Hide Screen UI completely */
    .cr-navbar,
    .cr-hero-banner,
    .cr-tabs-bar-container,
    .cr-main-layout,
    .cr-music-gratitude-section,
    .cr-music-dock,
    .cr-bg-grid,
    .cr-hidden-audio-frame {
      display: none !important;
    }

    /* Activate Custom Print Template */
    .cr-print-dossier {
      display: block !important;
      background: #ffffff !important;
      color: #09090b !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Physical Page Management with Airy Breathing Room */
    .cr-pdoc-page {
      background: #ffffff !important;
      color: #09090b !important;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .cr-pdoc-page-1 {
      page-break-after: always !important;
      break-after: page !important;
      min-height: 265mm;
    }

    .cr-pdoc-page-2 {
      page-break-before: always !important;
      break-before: page !important;
      min-height: 265mm;
      padding-top: 2mm;
    }

    /* Top Metadata Bar */
    .cr-pdoc-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #09090b !important;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }

    .cr-pdoc-seal {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cr-pdoc-emblem {
      font-size: 19px;
      color: #09090b !important;
    }

    .cr-pdoc-seal-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cr-pdoc-brand-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #09090b !important;
    }

    .cr-pdoc-brand-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #52525b !important;
    }

    .cr-pdoc-ref-group {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      color: #3f3f46 !important;
      letter-spacing: 0.08em;
    }

    .cr-pdoc-ref-item {
      display: flex;
      gap: 4px;
    }

    .cr-pdoc-ref-k {
      color: #71717a !important;
    }

    .cr-pdoc-ref-v {
      color: #09090b !important;
    }

    .cr-pdoc-meta-sep {
      color: #d4d4d8 !important;
    }

    /* Subpage Header for Page 2 */
    .cr-pdoc-subpage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #09090b !important;
      padding-bottom: 9px;
      margin-bottom: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      color: #52525b !important;
      letter-spacing: 0.08em;
    }

    .cr-pdoc-subpage-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #09090b !important;
      font-weight: 800;
    }

    .cr-pdoc-subpage-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Hero Frame with Airy Breathing Space */
    .cr-pdoc-hero-frame {
      border: 1px solid #e4e4e7 !important;
      border-radius: 14px;
      padding: 20px 22px;
      background: #fafafa !important;
      margin-bottom: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cr-pdoc-hero-pills {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }

    .cr-pdoc-pill-primary {
      background: #09090b !important;
      color: #ffffff !important;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: 100px;
    }

    .cr-pdoc-pill-secondary {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      color: #09090b !important;
      border: 1px solid #09090b !important;
      padding: 2.5px 9px;
      border-radius: 100px;
      background: #ffffff !important;
    }

    .cr-pdoc-pill-outline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      color: #52525b !important;
      border: 1px solid #d4d4d8 !important;
      padding: 2.5px 8px;
      border-radius: 100px;
      background: #ffffff !important;
    }

    .cr-pdoc-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .cr-pdoc-main-title {
      font-size: 27px;
      font-weight: 800;
      color: #09090b !important;
      letter-spacing: -0.03em;
      margin: 0;
      line-height: 1.15;
    }

    .cr-pdoc-status-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #ffffff !important;
      background: #09090b !important;
      padding: 3px 9px;
      border-radius: 4px;
    }

    .cr-pdoc-main-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: #3f3f46 !important;
      margin: 0 0 14px;
      line-height: 1.5;
    }

    .cr-pdoc-main-subtitle strong {
      color: #09090b !important;
      font-weight: 700;
    }

    .cr-pdoc-executive-quote {
      background: #f4f4f5 !important;
      border-left: 3.5px solid #09090b !important;
      padding: 11px 15px;
      font-size: 11px;
      line-height: 1.6;
      color: #18181b !important;
      margin-bottom: 16px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
      border-radius: 0 6px 6px 0;
    }

    .cr-pdoc-quote-icon {
      font-size: 14px;
      color: #09090b !important;
      line-height: 1;
      margin-top: 2px;
    }

    .cr-pdoc-executive-quote p {
      margin: 0;
    }

    /* 6-Quadrant Grid with Breathing Room */
    .cr-pdoc-quadrant-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }

    .cr-pdoc-quad-cell {
      background: #ffffff !important;
      border: 1px solid #e4e4e7 !important;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cr-pdoc-cell-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #71717a !important;
    }

    .cr-pdoc-cell-value {
      font-size: 11px;
      font-weight: 800;
      color: #09090b !important;
      line-height: 1.3;
    }

    .cr-pdoc-cell-note {
      font-size: 9px;
      color: #52525b !important;
      line-height: 1.35;
      margin-top: 1px;
    }

    /* Section Blocks with Airy Spacing */
    .cr-pdoc-section-block {
      margin-bottom: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cr-pdoc-section-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .cr-pdoc-sec-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      color: #ffffff !important;
      background: #09090b !important;
      padding: 2.5px 8px;
      border-radius: 3px;
    }

    .cr-pdoc-sec-heading {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #09090b !important;
      margin: 0;
      white-space: nowrap;
    }

    .cr-pdoc-sec-rule {
      flex: 1;
      height: 1px;
      background: #e4e4e7 !important;
    }

    /* Pillar 1 Modules Matrix */
    .cr-pdoc-modules-matrix {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 11px;
    }

    .cr-pdoc-matrix-cell {
      background: #fcfcfc !important;
      border: 1px solid #e4e4e7 !important;
      border-left: 3.5px solid #09090b !important;
      border-radius: 10px;
      padding: 12px 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cr-pdoc-matrix-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e4e4e7 !important;
    }

    .cr-pdoc-matrix-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      background: #09090b !important;
      color: #ffffff !important;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cr-pdoc-matrix-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #09090b !important;
      margin: 0;
      flex: 1;
    }

    .cr-pdoc-matrix-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      font-weight: 700;
      color: #52525b !important;
      border: 1px solid #d4d4d8 !important;
      padding: 1px 5px;
      border-radius: 2px;
      background: #ffffff !important;
    }

    .cr-pdoc-matrix-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
    }

    .cr-pdoc-matrix-item {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      font-size: 10.5px;
      line-height: 1.55;
      color: #27272a !important;
    }

    .cr-pdoc-bullet {
      font-size: 7.5px;
      color: #09090b !important;
      margin-top: 3px;
      flex-shrink: 0;
    }

    /* Page Footers */
    .cr-pdoc-page-footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #e4e4e7 !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      font-weight: 700;
      color: #71717a !important;
      letter-spacing: 0.08em;
    }

    /* Pillar 2 Breathwork Horizontal Strip */
    .cr-pdoc-breath-strip {
      display: flex;
      align-items: stretch;
      gap: 8px;
      background: #fafafa !important;
      border: 1px solid #e4e4e7 !important;
      border-radius: 12px;
      padding: 10px;
    }

    .cr-pdoc-b-step {
      flex: 1;
      background: #ffffff !important;
      border: 1px solid #e4e4e7 !important;
      border-radius: 8px;
      padding: 10px 11px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cr-pdoc-b-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }

    .cr-pdoc-b-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      font-weight: 800;
      color: #ffffff !important;
      background: #09090b !important;
      padding: 1.5px 5px;
      border-radius: 2px;
    }

    .cr-pdoc-b-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      color: #52525b !important;
    }

    .cr-pdoc-b-action {
      font-size: 11.5px;
      font-weight: 800;
      color: #09090b !important;
      margin: 0;
    }

    .cr-pdoc-b-desc {
      font-size: 9.5px;
      line-height: 1.4;
      color: #3f3f46 !important;
      margin: 0;
    }

    .cr-pdoc-b-impact {
      font-size: 7.5px;
      font-style: italic;
      color: #52525b !important;
      border-top: 1px dashed #e4e4e7 !important;
      padding-top: 4px;
      margin-top: 4px;
    }

    .cr-pdoc-b-connector {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #a1a1aa !important;
      font-weight: 800;
    }

    /* Pillar 3 Timeline & Habits Table */
    .cr-pdoc-timeline-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      margin-bottom: 11px;
    }

    .cr-pdoc-time-node {
      background: #fafafa !important;
      border: 1px solid #e4e4e7 !important;
      border-radius: 8px;
      padding: 9px 11px;
    }

    .cr-pdoc-time-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }

    .cr-pdoc-time-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 800;
      color: #ffffff !important;
      background: #09090b !important;
      padding: 1.5px 5px;
      border-radius: 2px;
      display: inline-block;
    }

    .cr-pdoc-time-phase {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7px;
      font-weight: 700;
      color: #71717a !important;
    }

    .cr-pdoc-time-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #09090b !important;
      margin: 0 0 2px;
    }

    .cr-pdoc-time-text {
      font-size: 9px;
      line-height: 1.4;
      color: #52525b !important;
      margin: 0;
    }

    .cr-pdoc-check-table {
      background: #ffffff !important;
      border: 1px solid #e4e4e7 !important;
      border-radius: 10px;
      overflow: hidden;
    }

    .cr-pdoc-table-header {
      display: grid;
      grid-template-columns: 60px 160px 1fr;
      padding: 6px 12px;
      background: #f4f4f5 !important;
      border-bottom: 1.5px solid #09090b !important;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #09090b !important;
    }

    .cr-pdoc-table-row {
      display: grid;
      grid-template-columns: 60px 160px 1fr;
      padding: 6px 12px;
      align-items: center;
      border-bottom: 1px solid #f4f4f5 !important;
      font-size: 10px;
    }

    .cr-pdoc-table-row:last-child {
      border-bottom: none !important;
    }

    .cr-pdoc-td-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: #09090b !important;
    }

    .cr-pdoc-td-cat {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      color: #09090b !important;
    }

    .cr-pdoc-td-desc {
      color: #27272a !important;
      line-height: 1.4;
    }

    /* Pillar 4 Science & Tribute Bottom Grid */
    .cr-pdoc-bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 11px;
    }

    .cr-pdoc-science-panel,
    .cr-pdoc-tribute-panel {
      background: #ffffff !important;
      border: 1px solid #e4e4e7 !important;
      border-left: 3.5px solid #09090b !important;
      border-radius: 10px;
      padding: 12px 14px;
    }

    .cr-pdoc-panel-hdr {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e4e4e7 !important;
    }

    .cr-pdoc-panel-icon {
      font-size: 11px;
      color: #09090b !important;
    }

    .cr-pdoc-panel-heading {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #09090b !important;
      margin: 0;
    }

    .cr-pdoc-ev-line {
      font-size: 10px;
      line-height: 1.5;
      color: #27272a !important;
      margin-bottom: 6px;
    }

    .cr-pdoc-ev-line strong {
      color: #09090b !important;
    }

    .cr-pdoc-ev-line:last-child {
      margin-bottom: 0;
    }

    .cr-pdoc-tribute-text {
      font-size: 10px;
      line-height: 1.5;
      color: #18181b !important;
      margin-bottom: 6px;
    }

    .cr-pdoc-tribute-sub {
      font-size: 9px;
      line-height: 1.45;
      color: #52525b !important;
      margin: 0;
    }

    /* Final Document Footer with Generous Separation pushed to the bottom */
    .cr-pdoc-final-footer {
      border-top: 2px solid #09090b !important;
      padding-top: 16px !important;
      margin-top: auto !important;
      padding-bottom: 2mm !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cr-pdoc-footer-inner {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 14px;
    }

    .cr-pdoc-footer-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cr-pdoc-footer-seal-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cr-pdoc-foot-brand {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #09090b !important;
    }

    .cr-pdoc-foot-sub {
      font-size: 8px;
      color: #71717a !important;
      line-height: 1.35;
    }

    .cr-pdoc-footer-center {
      display: flex;
      justify-content: center;
    }

    .cr-pdoc-signature-line {
      border: 1px dashed #09090b !important;
      padding: 5px 12px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      background: #fafafa !important;
    }

    .cr-pdoc-sig-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7px;
      color: #71717a !important;
      letter-spacing: 0.08em;
    }

    .cr-pdoc-sig-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      color: #09090b !important;
      letter-spacing: 0.08em;
    }

    .cr-pdoc-footer-right {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: flex-end;
    }

    .cr-pdoc-foot-blessing {
      font-size: 9.5px;
      font-style: italic;
      color: #09090b !important;
      text-align: right;
    }

    .cr-pdoc-foot-ver {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      color: #71717a !important;
      text-align: right;
      letter-spacing: 0.08em;
    }
  }
`;
