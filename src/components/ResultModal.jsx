import React from "react";
import "./ResultModal.css";

export default function ResultModal({ result, onClose }) {
  if (!result) return null;

  return (
    <div className="modalOverlay">
      <div className="modalBox">

        {/* HEADER */}
        <div className="modalHeader">
          <span className="modalBadge">Brainiac</span>
          <h2 className="modalTitle">AI Guidance Report</h2>
          <p className="aiTag">Personalized neural improvement recommendations</p>
        </div>

        {/* CONTENT */}
        <div className="modalContent">
          {result}
        </div>

        {/* CLOSE BUTTON */}
        <div className="modalFooter">
          <button className="closeBtn" onClick={onClose}>
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}