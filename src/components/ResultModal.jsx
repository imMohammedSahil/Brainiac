import React from "react";
import "./ResultModal.css";

export default function ResultModal({ result, onClose }) {
  if (!result) return null;

  const parseSections = (rawText) => {
    if (!rawText) return [];

    const rawBlocks = rawText.split(/\n\s*\n/).filter(b => b.trim().length > 0);
    const parsed = [];

    rawBlocks.forEach((block, idx) => {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const firstLine = lines[0];
      const isHeader = firstLine.endsWith(":") || (!firstLine.startsWith("-") && !firstLine.startsWith("•") && !firstLine.startsWith("*") && lines.length > 1);

      if (isHeader) {
        const title = firstLine.replace(/:$/, "").replace(/^#+\s*/, "").replace(/^\*+\s*/, "").trim();
        const items = lines.slice(1).map(l => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
        parsed.push({
          title,
          items: items.length > 0 ? items : [lines[1] || title]
        });
      } else {
        const items = lines.map(l => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
        parsed.push({
          title: `Insight Module 0${idx + 1}`,
          items
        });
      }
    });

    return parsed.length > 0 ? parsed : [{ title: "Personalized Care Protocol", items: [rawText] }];
  };

  const sections = parseSections(result);

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* ── HEADER ── */}
        <header className="rm-header">
          <div className="rm-top-bar">
            <span className="rm-badge-accent">First Light</span>
            <button className="rm-close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>

          <h2 className="rm-title">Personalized Care Report</h2>
          <p className="rm-subtitle">
            Gentle, evidence-informed daily routines tailored to support your nervous system.
          </p>
        </header>

        {/* ── BODY / SECTIONS ── */}
        <div className="rm-body">
          <div className="rm-sections-grid">
            {sections.map((sec, idx) => (
              <section key={idx} className="rm-card">
                <div className="rm-card-header">
                  <span className="rm-card-num">0{idx + 1}</span>
                  <h3 className="rm-card-title">{sec.title}</h3>
                </div>

                <ul className="rm-card-list">
                  {sec.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="rm-card-item">
                      <span className="rm-bullet-dot" />
                      <span className="rm-item-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="rm-footer">
          <button className="rm-done-btn" onClick={onClose}>
            Done For Now
          </button>
        </footer>

      </div>
    </div>
  );
}