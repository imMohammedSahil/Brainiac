import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

/* ── SVG Neural orb background ── */
function NeuralOrb({ style }) {
  return (
    <div className="neural-orb" style={style} aria-hidden="true">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
        <circle cx="100" cy="100" r="55" stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
        <circle cx="100" cy="100" r="30" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5" />
        {[0,45,90,135,180,225,270,315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 30 * Math.cos(rad);
          const y1 = 100 + 30 * Math.sin(rad);
          const x2 = 100 + 80 * Math.cos(rad);
          const y2 = 100 + 80 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(99,102,241,0.06)" strokeWidth="0.5" />;
        })}
        {[0,60,120,180,240,300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + 55 * Math.cos(rad);
          const cy = 100 + 55 * Math.sin(rad);
          return <circle key={i} cx={cx} cy={cy} r="2.5" fill="rgba(129,140,248,0.2)" />;
        })}
      </svg>
    </div>
  );
}

/* ── Capability card ── */
function CapCard({ icon, title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`cap-card ${visible ? "revealed" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="cap-icon">{icon}</div>
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
      <div className="pillar-dot" />
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

  return (
    <>
      <style>{CSS}</style>

      <div className="intro-root">

        {/* ── Ambient background ── */}
        <div className="ambient-layer" aria-hidden="true">
          <div className="amb-blob amb-1" />
          <div className="amb-blob amb-2" />
          <div className="amb-blob amb-3" />
          <div className="amb-grid" />
        </div>

        {/* ════════════════ HERO ════════════════ */}
        <section className="hero-section">
          <NeuralOrb style={{ top: "5%", right: "6%", width: "420px", height: "420px", opacity: 0.6 }} />
          <NeuralOrb style={{ bottom: "-8%", left: "-4%", width: "320px", height: "320px", opacity: 0.35 }} />

          {/* Nav bar */}
          <nav className="hero-nav">
            <div className="nav-brand">
              <span className="nav-dot" />
              <span className="nav-name">Brainiac</span>
            </div>
            <span className="nav-tag">Neuroscience Platform</span>
          </nav>

          {/* Hero content */}
          <div className="hero-content">
            <div className="hero-badge hero-anim" style={{ animationDelay: "0ms" }}>
              <span className="hero-badge-dot" />
              Cognitive Intelligence System
            </div>

            <h1 className="hero-title hero-anim" style={{ animationDelay: "80ms" }}>
              Understand Your<br />
              <span className="hero-title-accent">Neural Architecture</span>
            </h1>

            <p className="hero-sub hero-anim" style={{ animationDelay: "180ms" }}>
              A neuroscience-inspired assessment platform that maps your cognitive
              landscape — identifying strengths, revealing blind spots, and delivering
              precision guidance for brain optimization.
            </p>

            <div className="hero-cta hero-anim" style={{ animationDelay: "280ms" }}>
              <button
                className="btn-primary"
                onClick={() => navigate("/assessment")}
              >
                Begin Assessment
                <span className="btn-arrow">→</span>
              </button>
              <span className="hero-cta-note">30 questions · ~5 minutes · Free</span>
            </div>

            {/* Stat pills */}
            <div className="hero-stats hero-anim" style={{ animationDelay: "400ms" }}>
              {[
                { val: "10", label: "Brain Regions Mapped" },
                { val: "30", label: "Assessment Dimensions" },
                { val: "AI", label: "Powered Guidance" },
              ].map((s, i) => (
                <div key={i} className="stat-pill">
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ CAPABILITIES ════════════════ */}
        <section className="section">
          <RevealSection className="section-header-wrap">
            <div className="section-tag">Neural Analysis</div>
            <h2 className="section-title">What Brainiac Evaluates</h2>
            <p className="section-sub">
              Each assessment dimension is rooted in established cognitive neuroscience
              frameworks, translated into meaningful self-awareness metrics.
            </p>
          </RevealSection>

          <div className="cap-grid">
            <CapCard delay={0}   icon="◎" title="Focus & Attention"       desc="Evaluates sustained concentration capacity, selective attention, and resistance to cognitive distraction." />
            <CapCard delay={80}  icon="◈" title="Emotional Regulation"    desc="Assesses limbic balance, emotional response patterns, and adaptive coping mechanisms under stress." />
            <CapCard delay={160} icon="◇" title="Decision Making"         desc="Maps prefrontal executive function, risk assessment bias, and deliberative reasoning quality." />
            <CapCard delay={240} icon="◉" title="Cognitive Flexibility"   desc="Measures mental adaptability, perspective-shifting capacity, and resilience to cognitive rigidity." />
            <CapCard delay={320} icon="◐" title="Behavioral Patterns"     desc="Identifies habitual response loops, behavioral tendencies, and areas of automatic processing." />
          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className="section section-alt">
          <RevealSection className="section-header-wrap">
            <div className="section-tag">Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">
              Four stages from intake to insight — designed for clarity, depth, and actionability.
            </p>
          </RevealSection>

          <div className="steps-list">
            <StepCard delay={0}   num="01" title="Complete the Assessment"       desc="Answer 30 carefully designed questions spanning cognitive, emotional, and behavioral domains." />
            <StepCard delay={100} num="02" title="Receive Brain Health Insights" desc="Your responses are mapped to a multi-region scoring dashboard revealing your neural profile." />
            <StepCard delay={200} num="03" title="Explore Interactive Brain Regions" desc="Navigate a 3D brain model to examine region-specific findings with anatomical context." />
            <StepCard delay={300} num="04" title="Get AI Improvement Guidance"   desc="Receive personalized, AI-generated recommendations targeted to your specific cognitive profile." />
          </div>
        </section>

        {/* ════════════════ SCIENCE & TRUST ════════════════ */}
        <section className="section">
          <RevealSection className="section-header-wrap">
            <div className="section-tag">Foundation</div>
            <h2 className="section-title">Built on Neuroscience</h2>
            <p className="section-sub">
              Brainiac is an educational and self-awareness platform grounded in
              established principles from cognitive and behavioral neuroscience.
            </p>
          </RevealSection>

          <div className="pillars-grid">
            <PillarCard delay={0}   title="Neuroscience-Inspired Framework"   desc="Assessment dimensions correspond to established brain region functions — from prefrontal executive control to limbic emotional processing." />
            <PillarCard delay={100} title="Cognitive Awareness Principles"     desc="Designed around the understanding that conscious self-assessment is the first step toward meaningful cognitive improvement." />
            <PillarCard delay={200} title="Behavioral Insight Modeling"        desc="Captures habitual thought and behavioral patterns that influence brain health outcomes over time." />
            <PillarCard delay={300} title="Educational Purpose"                desc="All insights are intended for educational self-awareness. Brainiac is not a clinical diagnostic tool." />
          </div>
        </section>

        {/* ════════════════ FINAL CTA ════════════════ */}
        <section className="final-cta-section">
          <RevealSection>
            <div className="final-cta-card">
              <NeuralOrb style={{ top: "-30%", right: "-5%", width: "360px", height: "360px", opacity: 0.4 }} />
              <div className="final-cta-inner">
                <div className="section-tag" style={{ marginBottom: "18px" }}>Begin</div>
                <h2 className="final-cta-title">
                  Ready to Map Your<br />
                  <span className="hero-title-accent">Cognitive Landscape?</span>
                </h2>
                <p className="final-cta-sub">
                  The assessment takes approximately five minutes. Your results are
                  processed instantly and remain private to your session.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/assessment")}
                >
                  Start Assessment
                  <span className="btn-arrow">→</span>
                </button>
                <p className="final-cta-note">No account required · No data stored · Fully private</p>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="footer-brand">
            <span className="nav-dot" />
            <span className="nav-name">Brainiac</span>
          </div>
          <p className="footer-note">
            Educational neuroscience platform · Not a medical or clinical diagnostic tool.
          </p>
        </footer>

      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   CSS
══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Reset & root ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.intro-root {
  min-height: 100vh;
  background: #050810;
  color: #e2e8f0;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ── Ambient background ── */
.ambient-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.amb-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}
.amb-1 {
  width: 700px; height: 700px;
  top: -200px; left: -200px;
  background: radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%);
  animation: blobDrift 20s ease-in-out infinite alternate;
}
.amb-2 {
  width: 500px; height: 500px;
  top: 30%; right: -150px;
  background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
  animation: blobDrift 25s ease-in-out infinite alternate-reverse;
}
.amb-3 {
  width: 600px; height: 600px;
  bottom: -200px; left: 20%;
  background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
  animation: blobDrift 18s ease-in-out infinite alternate;
}
.amb-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px);
  background-size: 80px 80px;
}
@keyframes blobDrift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.08); }
}

/* ── Reveal system ── */
.reveal-section {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal-section.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ── Hero section ── */
.hero-section {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 6vw;
}

/* Nav */
.hero-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nav-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 10px #6366f1;
}
.nav-name {
  font-family: 'Sora', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #c7d2fe;
  letter-spacing: 0.02em;
}
.nav-tag {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #334155;
}

/* Hero content */
.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 0 80px;
  max-width: 780px;
}

/* Hero entrance animations */
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-anim {
  opacity: 0;
  animation: heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #818cf8;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.22);
  border-radius: 99px;
  padding: 6px 16px;
  margin-bottom: 28px;
  width: fit-content;
}
.hero-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 6px #6366f1;
  animation: pulse 2.4s ease infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

.hero-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #e2e8f0;
  margin-bottom: 24px;
}
.hero-title-accent {
  background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 45%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 17px;
  font-weight: 400;
  line-height: 1.75;
  color: #64748b;
  max-width: 560px;
  margin-bottom: 40px;
}

.hero-cta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}
.hero-cta-note {
  font-size: 12px;
  color: #334155;
  letter-spacing: 0.06em;
}

/* Stat pills */
.hero-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.stat-pill {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 22px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  min-width: 110px;
}
.stat-val {
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #a5b4fc;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 11px;
  color: #475569;
  letter-spacing: 0.05em;
  line-height: 1.4;
}

/* Neural orb */
.neural-orb {
  position: absolute;
  pointer-events: none;
}
.neural-orb svg {
  width: 100%;
  height: 100%;
}

/* ── Shared section ── */
.section {
  position: relative;
  z-index: 1;
  padding: 100px 6vw;
}
.section-alt {
  background: rgba(99,102,241,0.02);
  border-top: 1px solid rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.section-header-wrap {
  max-width: 620px;
  margin: 0 auto 64px;
  text-align: center;
}
.section-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6366f1;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 99px;
  padding: 4px 14px;
  margin-bottom: 18px;
}
.section-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 16px;
}
.section-sub {
  font-size: 15px;
  color: #64748b;
  line-height: 1.75;
}

/* ── Capability cards ── */
.cap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
.cap-card {
  background: linear-gradient(145deg, rgba(13,17,32,0.95), rgba(9,12,22,0.98));
  border: 1px solid rgba(255,255,255,0.055);
  border-radius: 18px;
  padding: 28px 24px;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.2s, box-shadow 0.2s;
  cursor: default;
}
.cap-card.revealed {
  opacity: 1;
  transform: translateY(0);
}
.cap-card:hover {
  border-color: rgba(99,102,241,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.08);
  transform: translateY(-3px);
}
.cap-icon {
  font-size: 20px;
  color: #818cf8;
  margin-bottom: 14px;
  line-height: 1;
}
.cap-title {
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #c7d2fe;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}
.cap-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.7;
}

/* ── Steps ── */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 820px;
  margin: 0 auto;
}
.step-card {
  display: flex;
  gap: 28px;
  align-items: flex-start;
  padding: 28px 32px;
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  opacity: 0;
  transform: translateX(-18px);
  transition: opacity 0.6s ease, transform 0.6s ease, background 0.2s, border-color 0.2s;
}
.step-card.revealed {
  opacity: 1;
  transform: translateX(0);
}
.step-card:hover {
  background: rgba(99,102,241,0.04);
  border-color: rgba(99,102,241,0.15);
}
.step-num {
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #4338ca;
  letter-spacing: 0.08em;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.18);
  border-radius: 8px;
  padding: 6px 11px;
  flex-shrink: 0;
  margin-top: 2px;
}
.step-body {}
.step-title {
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #c7d2fe;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}
.step-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.7;
}

/* ── Pillars ── */
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
.pillar-card {
  background: linear-gradient(145deg, rgba(13,17,32,0.95), rgba(9,12,22,0.98));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 18px;
  padding: 28px 26px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.2s;
}
.pillar-card.revealed {
  opacity: 1;
  transform: translateY(0);
}
.pillar-card:hover {
  border-color: rgba(99,102,241,0.2);
}
.pillar-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 8px #6366f1;
  margin-bottom: 16px;
}
.pillar-title {
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #a5b4fc;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}
.pillar-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.72;
}

/* ── Final CTA ── */
.final-cta-section {
  position: relative;
  z-index: 1;
  padding: 100px 6vw 80px;
}
.final-cta-card {
  position: relative;
  max-width: 820px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(13,17,36,0.97) 0%, rgba(9,12,24,0.98) 100%);
  border: 1px solid rgba(99,102,241,0.22);
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.03),
    0 40px 100px rgba(0,0,0,0.6),
    0 0 60px rgba(99,102,241,0.1);
}
.final-cta-card::before {
  content: '';
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent);
}
.final-cta-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 64px 48px;
}
.final-cta-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 800;
  color: #e2e8f0;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 20px;
}
.final-cta-sub {
  font-size: 15px;
  color: #64748b;
  line-height: 1.75;
  max-width: 480px;
  margin: 0 auto 36px;
}
.final-cta-note {
  margin-top: 18px;
  font-size: 11.5px;
  color: #334155;
  letter-spacing: 0.07em;
}

/* ── Primary button ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 38px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow:
    0 0 30px rgba(99,102,241,0.4),
    0 4px 20px rgba(0,0,0,0.45);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 0 50px rgba(99,102,241,0.55),
    0 10px 32px rgba(0,0,0,0.55);
}
.btn-arrow {
  font-size: 18px;
  line-height: 1;
  transition: transform 0.18s ease;
}
.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

/* ── Footer ── */
.footer {
  position: relative;
  z-index: 1;
  padding: 32px 6vw;
  border-top: 1px solid rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-note {
  font-size: 12px;
  color: #1e293b;
  letter-spacing: 0.04em;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .hero-cta { flex-direction: column; align-items: flex-start; }
  .final-cta-inner { padding: 44px 24px; }
  .hero-stats { gap: 10px; }
  .stat-pill { min-width: 90px; padding: 12px 16px; }
  .cap-grid { grid-template-columns: 1fr; }
  .pillars-grid { grid-template-columns: 1fr; }
}
`;