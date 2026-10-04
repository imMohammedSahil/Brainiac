import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MoltenMetal from "../components/MoltenMetal";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";
import SoundPill from "../components/SoundPill";

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Sub-components ── */
function RevealSection({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-section ${className} ${visible ? "revealed" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Editorial Book-Face Character Hero Image ── */
function HeroBookCharacter({ mousePos }) {
  // Parallax 3D head tilt physics
  const tiltX = (mousePos.x - 50) * 0.12;
  const tiltY = (mousePos.y - 50) * -0.08;

  return (
    <div
      className="hero-character-container"
      style={{
        transform: `perspective(1000px) rotateY(${tiltX}deg) rotateX(${tiltY}deg)`,
      }}
    >
      <img
        src="/hero-character.png"
        alt="Brainiac Editorial Hero Character"
        className="hero-character-img"
        draggable={false}
      />
    </div>
  );
}

/* ── SVG Neural orb background ── */
function NeuralOrb({ style }) {
  return (
    <div className="neural-orb" style={style} aria-hidden="true">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="100" cy="100" r="55" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="100" cy="100" r="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 30 * Math.cos(rad);
          const y1 = 100 + 30 * Math.sin(rad);
          const x2 = 100 + 80 * Math.cos(rad);
          const y2 = 100 + 80 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />;
        })}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + 55 * Math.cos(rad);
          const cy = 100 + 55 * Math.sin(rad);
          return <circle key={i} cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.25)" />;
        })}
      </svg>
    </div>
  );
}

/* ── Capability card ── */
function CapCard({ title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`cap-card ${visible ? "revealed" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="cap-title">{title}</div>
      <div className="cap-desc">{desc}</div>
    </div>
  );
}

/* ── Step card ── */
function StepCard({ num, title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`step-card ${visible ? "revealed" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="step-num">{num}</div>
      <div className="step-body">
        <div className="step-title">{title}</div>
        <div className="step-desc">{desc}</div>
      </div>
    </div>
  );
}

/* ── Pillar card ── */
function PillarCard({ title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`pillar-card ${visible ? "revealed" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="pillar-title">{title}</div>
      <div className="pillar-desc">{desc}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Intro() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [showResetModal, setShowResetModal] = useState(false);
  const { audioPlaying, audioPaused, toggleAudio } = useSoundSanctuary();

  const handleGlobalMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  const handleStartClick = () => {
    try {
      const saved = localStorage.getItem("brainiac_user_assessment_scores");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) {
          setShowResetModal(true);
          return;
        }
      }
    } catch (e) {}
    navigate("/assessment");
  };

  const handleConfirmRetake = () => {
    try {
      localStorage.removeItem("brainiac_user_assessment_scores");
      localStorage.removeItem("brainiac_saved_care_plans");
      sessionStorage.removeItem("brainiac_last_active_report");
    } catch (e) {}
    setShowResetModal(false);
    navigate("/assessment");
  };

  const handleViewExisting = () => {
    setShowResetModal(false);
    navigate("/results");
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="intro-root" onMouseMove={handleGlobalMouseMove}>

        {/* ════════════════ SECTION 1: EDITORIAL HERO (COMINVI STYLE) ════════════════ */}
        <section className="hero-editorial-section">
          {/* Pinned Top Navigation */}
          <header className="editorial-nav">
            <div className="nav-brand-editorial" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ cursor: "pointer" }}>
              <img
                src="/brainiac-logo.png"
                alt="Brainiac Neural Logo"
                className="brand-logo-img"
              />
            </div>

            <div className="nav-actions-editorial">
              <SoundPill />
              <button
                className="btn-cta-editorial"
                onClick={handleStartClick}
              >
                START TEST [→]
              </button>
            </div>
          </header>

          {/* Central Editorial Display Stage */}
          <div className="editorial-stage">
            {/* Centered Editorial Book-Face Character with Cursor Parallax */}
            <div className="editorial-centerpiece">
              <HeroBookCharacter mousePos={mousePos} />
            </div>

            {/* Master Typography Across the Centerpiece (Cominvi Style) */}
            <div className="massive-title-container">
              <h1 className="title-word">Brainiac</h1>
            </div>
          </div>
        </section>

        {/* ════════════════ CAPABILITIES ════════════════ */}
        <section className="section" id="capabilities-section">
          <RevealSection className="section-header-wrap">
            <div className="section-tag">The 5 Dimensions</div>
            <h2 className="section-title">What Brainiac Evaluates</h2>
            <p className="section-sub">
              A thoughtful look into how your mind thrives — exploring your focus, emotions, and inner rhythms to support your everyday well-being.
            </p>
          </RevealSection>

          <div className="cap-grid">
            <CapCard delay={0}   title="Focus & Attention"       desc="Understanding how your attention works best so you can create, learn, and rest in true harmony." />
            <CapCard delay={80}  title="Emotional Regulation"    desc="Becoming your own safe harbor — staying centered and calm when life gets loud or overwhelming." />
            <CapCard delay={160} title="Decision Making"         desc="Moving past overthinking and trusting yourself to choose the paths that align with who you are." />
            <CapCard delay={240} title="Cognitive Flexibility"   desc="Giving yourself permission to pivot, rethink, and step into new chapters with confidence." />
            <CapCard delay={320} title="Behavioral Patterns"     desc="Uncovering the daily rhythms that quietly nurture your strength, joy, and peace of mind." />
          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className="section section-alt" id="pipeline-section">
          <RevealSection className="section-header-wrap">
            <div className="section-tag">Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">
              Four thoughtful steps crafted to walk alongside you, turning quiet reflection into uplifting insights for your everyday life.
            </p>
          </RevealSection>

          <div className="steps-list">
            <StepCard delay={0}   num="01" title="Take a Moment for Yourself"       desc="Reflect at your own pace through 20 thoughtful questions designed to honor your unique experiences and habits." />
            <StepCard delay={100} num="02" title="Discover Your Inner Strengths"   desc="See your responses bloom into a holistic map of your mind, celebrating where you thrive and offering clarity on where you are." />
            <StepCard delay={200} num="03" title="Visualize Your Mind in 3D"       desc="Gently explore an interactive 3D model of your brain to connect with how your thoughts, focus, and feelings flow together." />
            <StepCard delay={300} num="04" title="Nurture Your Everyday Growth"    desc="Receive kind, personalized AI guidance with small, meaningful habits tailored to support your mental well-being." />
          </div>
        </section>

        {/* ════════════════ SCIENCE & TRUST ════════════════ */}
        <section className="section">
          <RevealSection className="section-header-wrap">
            <div className="section-tag">Philosophy</div>
            <h2 className="section-title">Grounded in Science, Rooted in Care</h2>
            <p className="section-sub">
              Brainiac blends modern neuroscience with gentle self-compassion — helping you understand your inner world with kindness and clarity.
            </p>
          </RevealSection>

          <div className="pillars-grid">
            <PillarCard delay={0}   title="Brain-Mind Harmony"        desc="Connecting how your thoughts, emotions, and instincts naturally work together — from clear-headed focus to emotional resilience." />
            <PillarCard delay={100} title="The Power of Self-Discovery" desc="Grounded in the understanding that noticing your mental rhythms with gentle curiosity is the first step toward feeling at ease." />
            <PillarCard delay={200} title="Understanding Daily Rhythms" desc="Illuminating the small habits, thoughts, and quiet patterns that subtly shape how you recharge, feel, and thrive." />
            <PillarCard delay={300} title="A Safe Space for Growth"     desc="Created purely for personal insight and self-reflection — an uplifting, welcoming companion to support your well-being." />
          </div>
        </section>

        {/* ════════════════ FINAL CTA ════════════════ */}
        <section className="final-cta-section">
          <RevealSection>
            <div className="final-cta-card">
              <div className="final-cta-aurora-bg">
                <MoltenMetal
                  color1="#18181b"
                  color2="#8e8e93"
                  color3="#ffffff"
                  speed={0.3}
                  scale={3.5}
                  detail={3}
                  glow={1.4}
                  coreSize={0.12}
                  swirl={1}
                  fold={-0.2}
                  blackPoint={0.06}
                  brightness={1.15}
                  colorMode="molten"
                  grain
                  grainIntensity={0.04}
                  mouseInteraction
                  mouseStrength={0.25}
                  opacity={0.8}
                />
              </div>
              <div className="final-cta-inner">
                <div className="section-tag" style={{ marginBottom: "18px" }}>Your Journey</div>
                <h2 className="final-cta-title">
                  Ready to Meet Your<br />
                  <span className="hero-title-accent">Clearest, Calmest Self?</span>
                </h2>
                <p className="final-cta-sub">
                  Take just five quiet minutes for yourself. Explore your mind’s unique rhythms with zero pressure and instant, compassionate clarity.
                </p>
                <button
                  className="btn-primary"
                  onClick={handleStartClick}
                >
                  Begin Your Discovery
                  <span className="btn-arrow">→</span>
                </button>
                <p className="final-cta-note">Your thoughts are sacred. Nothing is ever tracked, stored, or shared.</p>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ── Footer ── */}
        <footer className="footer">
          <p className="footer-note">
            Educational neuroscience platform · Not a medical or clinical diagnostic tool.
          </p>
        </footer>

        {/* ── RETAKE CONFIRMATION MODAL ── */}
        {showResetModal && (
          <div className="modal-backdrop" onClick={() => setShowResetModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                onClick={() => setShowResetModal(false)}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="modal-header">
                <span className="modal-badge">✦ Sanctuary Notice</span>
                <h3 className="modal-title">Ready for a Fresh Beginning?</h3>
              </div>

              <div className="modal-body">
                <p className="modal-text">
                  We found your previous cognitive profile and personalized care plans safely preserved on your device.
                </p>
                <p className="modal-text-sub">
                  Choosing to retake the discovery will gently refresh your baseline scores and active care plans so you can begin a completely fresh exploration.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="modal-btn-confirm"
                  onClick={handleConfirmRetake}
                >
                  Retake Assessment & Start Fresh →
                </button>
                <button
                  className="modal-btn-view-existing"
                  onClick={handleViewExisting}
                >
                  Keep & View My Current Results
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   CSS
══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500;600;700&display=swap');

/* ── Reset & Root Pitch Black ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.intro-root {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ── Background: Pure Pitch Black ── */
.intro-root {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ── Reveal System ── */
.reveal-section {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-section.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ════════════════ SECTION 1: EDITORIAL HERO ════════════════ */
.hero-editorial-section {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 4vw 0px;
  background: #000000;
  box-sizing: border-box;
}

/* Top Pinned Nav */
.editorial-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 20px;
  border-bottom: none;
  z-index: 10;
}
.nav-brand-editorial {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-logo-img {
  height: 44px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.brand-logo-img:hover {
  transform: scale(1.04);
  opacity: 0.85;
}
.nav-actions-editorial {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-432hz-sound {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #e4e4e7;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0 16px;
  border-radius: 20px;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-432hz-sound:hover {
  background-color: #ffffff;
  border-color: #ffffff;
  color: #000000;
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}
.btn-432hz-sound.active {
  background-color: #ffffff;
  color: #000000;
  border-color: #ffffff;
  font-weight: 700;
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
}
.pill-equalizer {
  display: inline-flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 12px;
  flex-shrink: 0;
}
.pill-equalizer .eq-bar {
  width: 2px;
  background-color: currentColor;
  border-radius: 1px;
}
.pill-equalizer .bar-1 { height: 5px; }
.pill-equalizer .bar-2 { height: 11px; }
.pill-equalizer .bar-3 { height: 7px; }

.pill-equalizer.playing .bar-1 {
  animation: introEqBar 1.2s infinite ease-in-out;
}
.pill-equalizer.playing .bar-2 {
  animation: introEqBar 0.9s infinite ease-in-out 0.2s;
}
.pill-equalizer.playing .bar-3 {
  animation: introEqBar 1.4s infinite ease-in-out 0.4s;
}

.pill-equalizer.paused .eq-bar {
  animation-play-state: paused !important;
  opacity: 0.5;
}

@keyframes introEqBar {
  0%, 100% { height: 3px; }
  50% { height: 12px; }
}

.btn-cta-editorial {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  border: none;
  box-shadow: inset 0 0 0 1px #ffffff;
  color: #ffffff;
  font-family: 'Helvetica Now Display', 'Helvetica Neue', Helvetica, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0 22px;
  border-radius: 20px;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-cta-editorial:hover {
  background-color: #ffffff;
  color: #000000;
  box-shadow: inset 0 0 0 1px #ffffff, 0 0 20px rgba(255, 255, 255, 0.4);
}

/* Central Stage */
.editorial-stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 500px;
  margin: 0;
  padding: 0;
  overflow: visible;
}

/* Massive Display Typography (In Front of Character) */
.massive-title-container {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  z-index: 5;
  padding: 0;
  overflow: visible;
}
.title-word {
  font-family: 'Helvetica Now Display', 'Helvetica Neue', Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: clamp(90px, 18vw, 240px);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: #ffffff;
  text-shadow: 0 10px 40px rgba(0, 0, 0, 0.95);
  font-kerning: normal;
  text-rendering: optimizeLegibility;
  font-feature-settings: "kern" 1, "liga" 1;
  margin: 0;
  padding: 0;
}

/* Centered Editorial Book-Face Character Centerpiece */
.editorial-centerpiece {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.hero-character-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  transform-origin: bottom center;
  transition: transform 0.16s ease-out;
  animation: idleCharacterBreathe 6s ease-in-out infinite alternate;
  margin-bottom: 0px;
}
.hero-character-img {
  width: 100%;
  max-width: 1020px;
  height: auto;
  max-height: 84vh;
  object-fit: contain;
  object-position: bottom center;
  display: block;
  vertical-align: bottom;
  line-height: 0;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.95));
}

@keyframes idleCharacterBreathe {
  0% { transform: scale(1); }
  100% { transform: scale(1.015); }
}

/* Pinned Bottom Telemetry & Launchpad */
.editorial-telemetry-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 24px;
  padding-bottom: 24px;
  margin-top: 15px;
  border-top: none;
  z-index: 10;
  gap: 20px;
}
.telemetry-left,
.telemetry-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 4px;
}
.telemetry-right {
  text-align: right;
}
.mono-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: #71717a;
  text-transform: uppercase;
}
.mono-val {
  font-family: 'Roboto Mono', monospace;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #ffffff;
}

/* Bottom Center Launchpad CTA */
.telemetry-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.btn-editorial-launch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 42px;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 99px;
  font-family: 'Helvetica Now Display', 'Helvetica Neue', Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: 0 0 35px rgba(255, 255, 255, 0.4), 0 10px 24px rgba(0, 0, 0, 0.8);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-editorial-launch:hover {
  transform: translateY(-3px) scale(1.03);
  background: #ffffff;
  box-shadow: 0 0 55px rgba(255, 255, 255, 0.7), 0 15px 30px rgba(0, 0, 0, 0.9);
}
.launch-icon {
  font-size: 14px;
}
.launch-arrow {
  font-size: 16px;
  transition: transform 0.2s ease;
}
.btn-editorial-launch:hover .launch-arrow {
  transform: translateX(4px);
}
.launch-meta {
  font-family: 'Roboto Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  color: #71717a;
}

/* ════════════════ SECTION 2: CAPABILITIES ════════════════ */
.section {
  position: relative;
  z-index: 1;
  padding: 110px 6vw;
  background: #000000;
}
#capabilities-section {
  padding-top: 260px;
}
.section-alt {
  background: #000000;
  border-top: none;
  border-bottom: none;
}
.section-header-wrap {
  max-width: 620px;
  margin: 0 auto 64px;
  text-align: center;
}
.section-tag {
  display: inline-block;
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #ffffff;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 99px;
  padding: 4px 14px;
  margin-bottom: 18px;
}
.section-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin-bottom: 16px;
}
.section-sub {
  font-size: 15.5px;
  color: #a1a1aa;
  line-height: 1.75;
}

/* Capability Cards */
.cap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
.cap-card {
  position: relative;
  overflow: hidden;
  background: #080808;
  border: 1px solid transparent;
  border-radius: 18px;
  padding: 28px 24px;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.8s ease, box-shadow 0.8s ease;
  cursor: default;
}
.cap-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffffff;
  border-radius: inherit;
  z-index: 1;
  clip-path: circle(0% at 0% 100%);
  transition: clip-path 1.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.cap-card.revealed {
  opacity: 1;
  transform: translateY(0);
}
.cap-card:hover {
  border-color: #ffffff;
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.25), 0 0 30px rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}
.cap-card:hover::before {
  clip-path: circle(150% at 0% 100%);
}
.cap-icon,
.cap-title,
.cap-desc {
  position: relative;
  z-index: 2;
}
.cap-icon {
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 14px;
  line-height: 1;
  transition: color 0.9s ease;
}
.cap-card:hover .cap-icon {
  color: #000000;
}
.cap-title {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
  transition: color 0.95s cubic-bezier(0.16, 1, 0.3, 1);
}
.cap-card:hover .cap-title {
  color: #000000;
}
.cap-desc {
  font-size: 13.5px;
  color: #a1a1aa;
  line-height: 1.7;
  transition: color 0.95s cubic-bezier(0.16, 1, 0.3, 1);
}
.cap-card:hover .cap-desc {
  color: #18181b;
}

/* ════════════════ SECTION 3: STEPS ════════════════ */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 820px;
  margin: 0 auto;
}
.step-card {
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 28px;
  align-items: flex-start;
  padding: 28px 32px;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  opacity: 0;
  transform: translateX(-18px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.8s ease, box-shadow 0.8s ease;
  cursor: default;
}
.step-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffffff;
  border-radius: inherit;
  z-index: 1;
  clip-path: circle(0% at 0% 50%);
  transition: clip-path 2.4s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.step-card.revealed {
  opacity: 1;
  transform: translateX(0);
}
.step-card:hover {
  border-color: #ffffff;
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}
.step-card:hover::before {
  clip-path: circle(185% at 0% 50%);
}
.step-num,
.step-body,
.step-title,
.step-desc {
  position: relative;
  z-index: 2;
}
.step-num {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.08em;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 11px;
  flex-shrink: 0;
  margin-top: 2px;
  transition: color 1.4s ease, background 1.4s ease, border-color 1.4s ease;
}
.step-card:hover .step-num {
  color: #ffffff;
  background: #000000;
  border-color: #000000;
}
.step-title {
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
  transition: color 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.step-card:hover .step-title {
  color: #000000;
}
.step-desc {
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.7;
  transition: color 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.step-card:hover .step-desc {
  color: #18181b;
}

/* ════════════════ SECTION 4: PILLARS ════════════════ */
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
.pillar-card {
  position: relative;
  overflow: hidden;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 28px 26px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.8s ease, box-shadow 0.8s ease;
  cursor: default;
}
.pillar-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffffff;
  border-radius: inherit;
  z-index: 1;
  clip-path: circle(0% at 0% 100%);
  transition: clip-path 1.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.pillar-card.revealed {
  opacity: 1;
  transform: translateY(0);
}
.pillar-card:hover {
  border-color: #ffffff;
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.25), 0 0 30px rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}
.pillar-card:hover::before {
  clip-path: circle(150% at 0% 100%);
}
.pillar-title,
.pillar-desc {
  position: relative;
  z-index: 2;
}
.pillar-title {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
  transition: color 0.95s cubic-bezier(0.16, 1, 0.3, 1);
}
.pillar-card:hover .pillar-title {
  color: #000000;
}
.pillar-desc {
  font-size: 13.5px;
  color: #a1a1aa;
  line-height: 1.72;
  transition: color 0.95s cubic-bezier(0.16, 1, 0.3, 1);
}
.pillar-card:hover .pillar-desc {
  color: #18181b;
}

/* ════════════════ SECTION 5: FINAL CTA ════════════════ */
.final-cta-section {
  position: relative;
  z-index: 1;
  padding: 80px 0 40px;
  background: #000000;
  display: flex;
  justify-content: center;
}
.final-cta-card {
  position: relative;
  width: 90vw;
  max-width: 1440px;
  min-height: 65vh;
  margin: 0 auto;
  background: #080808;
  border: none;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  transform: translateZ(0);
}
.final-cta-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 32px;
  pointer-events: none;
  z-index: 10;
  box-sizing: border-box;
}
.final-cta-aurora-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.75;
  pointer-events: auto;
}
.final-cta-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  padding: 100px 6vw;
  pointer-events: none;
}
.final-cta-inner > * {
  pointer-events: auto;
}
.final-cta-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 24px;
}
.hero-title-accent {
  background: linear-gradient(135deg, #ffffff 40%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.final-cta-sub {
  font-size: 16.5px;
  color: #a1a1aa;
  line-height: 1.75;
  max-width: 560px;
  margin: 0 auto 26px;
}
.final-cta-note {
  margin-top: 26px;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: #71717a;
  letter-spacing: 0.07em;
}

/* Primary Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 17px 44px;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.75);
}
.btn-arrow {
  font-size: 18px;
  line-height: 1;
  transition: transform 0.18s ease;
}
.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

/* Footer */
.footer {
  position: relative;
  z-index: 1;
  padding: 12px 6vw 36px;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #000000;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px #ffffff;
}
.nav-name {
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #ffffff;
}
.footer-note {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: #71717a;
  letter-spacing: 0.04em;
}

/* Responsive */
@media (max-width: 1024px) {
  .editorial-telemetry-bar {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  .telemetry-right {
    text-align: center;
  }
  .nav-center-status {
    display: none;
  }
}
@media (max-width: 640px) {
  .title-word {
    font-size: 20vw;
  }
  .btn-ghost-editorial {
    display: none;
  }
  .editorial-centerpiece {
    max-width: 380px;
  }
  .final-cta-inner { padding: 44px 24px; }
  .cap-grid { grid-template-columns: 1fr; }
  .pillars-grid { grid-template-columns: 1fr; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.85); }
}

/* ── Retake Modal Styles ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-card {
  background: rgba(12, 12, 12, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  padding: 32px 30px;
  position: relative;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(255, 255, 255, 0.04);
  animation: modalScaleUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: 1;
}

.modal-close-btn:hover {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
  transform: rotate(90deg);
}

.modal-header {
  margin-bottom: 16px;
}

.modal-badge {
  font-family: 'Roboto Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 12px;
}

.modal-title {
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.3;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-text {
  font-size: 14px;
  line-height: 1.6;
  color: #e4e4e7;
  margin-bottom: 10px;
}

.modal-text-sub {
  font-size: 13px;
  line-height: 1.55;
  color: #a1a1aa;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-btn-confirm {
  width: 100%;
  padding: 13px 20px;
  background: #ffffff;
  color: #000000;
  border: 1px solid #ffffff;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 4px 18px rgba(255, 255, 255, 0.2);
}

.modal-btn-confirm:hover {
  background: #e4e4e7;
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(255, 255, 255, 0.35);
}

.modal-btn-view-existing {
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.modal-btn-view-existing:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleUp {
  from { opacity: 0; transform: scale(0.94) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
`;