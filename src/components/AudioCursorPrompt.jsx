import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSoundSanctuary } from "../context/SoundSanctuaryContext";

export default function AudioCursorPrompt() {
  const location = useLocation();
  const { resumeAudio } = useSoundSanctuary();
  
  // Track if clicked in the current session/pageview
  const [hasClicked, setHasClicked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const pillRef = useRef(null);
  const animFrameRef = useRef(null);

  // ONLY render on homepage ("/")
  const isHomepage = location.pathname === "/";

  useEffect(() => {
    if (!isHomepage || hasClicked) return;

    // Smooth Lerp animation loop
    const updatePosition = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.18;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.18;

      if (pillRef.current) {
        pillRef.current.style.transform = `translate3d(${posRef.current.x + 18}px, ${posRef.current.y + 18}px, 0)`;
      }
      animFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animFrameRef.current = requestAnimationFrame(updatePosition);

    const handleMouseMove = (e) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      if (!hasMoved) {
        setHasMoved(true);
        setVisible(true);
      }
    };

    const handleGlobalClick = () => {
      setHasClicked(true);
      setVisible(false);

      // Trigger audio play
      try {
        resumeAudio();
      } catch (err) {
        console.warn("Audio unlock notice:", err);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleGlobalClick, { once: true });
    window.addEventListener("touchstart", handleGlobalClick, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isHomepage, hasClicked, resumeAudio, hasMoved]);

  // If not on homepage or already clicked, don't render
  if (!isHomepage || hasClicked) return null;

  return (
    <>
      <div
        ref={pillRef}
        className={`audio-cursor-pill ${visible ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <span className="audio-cursor-dot" />
        <span className="audio-cursor-text">CLICK — TO ENABLE MUSIC</span>
      </div>

      <style>{`
        .audio-cursor-pill {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 999999;
          pointer-events: none;
          user-select: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #ffffff;
          color: #000000;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
          opacity: 0;
          transform: translate3d(-9999px, -9999px, 0) scale(0.85);
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .audio-cursor-pill.is-visible {
          opacity: 1;
        }

        .audio-cursor-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #000000;
          flex-shrink: 0;
          animation: audioCursorPulse 1.4s infinite ease-in-out;
        }

        @keyframes audioCursorPulse {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .audio-cursor-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
          color: #000000;
        }

        @media (max-width: 768px) {
          .audio-cursor-pill {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
