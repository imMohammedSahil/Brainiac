import React from "react";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";

export default function SoundPill({ className = "" }) {
  const { audioPlaying, audioPaused, toggleAudio, pauseAudio, resumeAudio, restartAudio } = useSoundSanctuary();

  const isPlaying = audioPlaying && !audioPaused;
  const isPaused = audioPlaying && audioPaused;

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (!audioPlaying) {
      toggleAudio();
    } else if (audioPaused) {
      resumeAudio();
    } else {
      pauseAudio();
    }
  };

  const handleRestart = (e) => {
    e.stopPropagation();
    restartAudio();
  };

  return (
    <div
      className={`sound-pill-root ${isPlaying ? "playing" : ""} ${isPaused ? "paused" : ""} ${className}`}
      onClick={toggleAudio}
      role="button"
      tabIndex={0}
      aria-label="432Hz Music Ambient Soundscape"
    >
      {/* 3-Bar Equalizer */}
      <div className={`sound-pill-eq ${isPlaying ? "active" : ""}`}>
        <span className="sound-pill-bar sp-bar-1" />
        <span className="sound-pill-bar sp-bar-2" />
        <span className="sound-pill-bar sp-bar-3" />
      </div>

      {/* Main Label */}
      <span className="sound-pill-label">432Hz Music</span>

      {/* Action Icons: Pause/Play & Restart */}
      <div className="sound-pill-actions">
        {/* Pause / Resume Button */}
        <button
          type="button"
          className="sound-pill-icon-btn"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause Music" : "Play / Resume Music"}
        >
          {isPlaying ? (
            /* Pause SVG */
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="4" height="16" rx="1.5" />
              <rect x="15" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            /* Play SVG */
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )}
        </button>

        {/* Restart Button */}
        <button
          type="button"
          className="sound-pill-icon-btn"
          onClick={handleRestart}
          aria-label="Restart from Beginning"
        >
          {/* Replay/Restart SVG */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      <style>{`
        .sound-pill-root {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px 5px 12px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          user-select: none;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          box-shadow: none;
          vertical-align: middle;
          position: relative;
        }

        .sound-pill-root.playing {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }

        .sound-pill-root.paused {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: none;
        }

        .sound-pill-root:hover,
        .sound-pill-root.playing:hover,
        .sound-pill-root.paused:hover {
          background: #ffffff !important;
          color: #000000 !important;
          border-color: #ffffff !important;
          box-shadow: none;
          transform: none;
        }

        .sound-pill-root:active,
        .sound-pill-root.playing:active,
        .sound-pill-root.paused:active {
          transform: none;
        }

        .sound-pill-root:hover .sound-pill-bar,
        .sound-pill-root.playing:hover .sound-pill-bar,
        .sound-pill-root.paused:hover .sound-pill-bar {
          background-color: #000000 !important;
        }

        /* 3-Bar Equalizer */
        .sound-pill-eq {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
          width: 10px;
          flex-shrink: 0;
        }

        .sound-pill-bar {
          width: 2px;
          border-radius: 1px;
          background-color: currentColor;
          transition: height 0.2s ease, opacity 0.2s ease;
        }

        .sound-pill-bar.sp-bar-1 { height: 4px; }
        .sound-pill-bar.sp-bar-2 { height: 10px; }
        .sound-pill-bar.sp-bar-3 { height: 6px; }

        .sound-pill-eq.active .sp-bar-1 {
          animation: spEqAnim 1.1s infinite ease-in-out;
        }
        .sound-pill-eq.active .sp-bar-2 {
          animation: spEqAnim 0.85s infinite ease-in-out 0.2s;
        }
        .sound-pill-eq.active .sp-bar-3 {
          animation: spEqAnim 1.3s infinite ease-in-out 0.4s;
        }

        @keyframes spEqAnim {
          0%, 100% { height: 3px; }
          50% { height: 12px; }
        }

        .sound-pill-label {
          line-height: 1;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Action Buttons Container - Separator line removed */
        .sound-pill-actions {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: 2px;
        }

        /* Micro Action Buttons */
        .sound-pill-icon-btn {
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: currentColor;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          box-shadow: none;
        }

        .sound-pill-icon-btn:hover {
          transform: scale(1.12);
          background: #ffffff !important;
          color: #000000 !important;
          border-color: #ffffff !important;
          box-shadow: none;
        }

        .sound-pill-root:hover .sound-pill-icon-btn {
          background: rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 0, 0, 0.16);
          color: #000000;
        }

        .sound-pill-root:hover .sound-pill-icon-btn:hover {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
