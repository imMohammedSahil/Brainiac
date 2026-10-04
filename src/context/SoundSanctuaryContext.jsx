import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const SoundSanctuaryContext = createContext({
  audioPlaying: false,
  audioPaused: false,
  toggleAudio: () => {},
  pauseAudio: () => {},
  resumeAudio: () => {},
  stopAudio: () => {},
  restartAudio: () => {}
});

export function SoundSanctuaryProvider({ children }) {
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [audioPaused, setAudioPaused] = useState(false);
  const audioIframeRef = useRef(null);

  // Auto-play ambient 432Hz music on first entry / interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      try {
        if (audioIframeRef.current && audioIframeRef.current.contentWindow) {
          audioIframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "playVideo", args: [] }),
            "*"
          );
        }
      } catch (e) {
        console.warn("Autoplay interaction trigger notice:", e);
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  const pauseAudio = () => {
    setAudioPaused(true);
    try {
      if (audioIframeRef.current && audioIframeRef.current.contentWindow) {
        audioIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      }
    } catch (e) {
      console.warn("Could not pause 432Hz soundscape iframe:", e);
    }
  };

  const resumeAudio = () => {
    setAudioPaused(false);
    try {
      if (audioIframeRef.current && audioIframeRef.current.contentWindow) {
        audioIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
    } catch (e) {
      console.warn("Could not resume 432Hz soundscape iframe:", e);
    }
  };

  const stopAudio = () => {
    setAudioPlaying(false);
    setAudioPaused(false);
  };

  const restartAudio = () => {
    if (!audioPlaying) {
      setAudioPlaying(true);
      setAudioPaused(false);
      return;
    }
    setAudioPaused(false);
    try {
      if (audioIframeRef.current && audioIframeRef.current.contentWindow) {
        audioIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "seekTo", args: [0, true] }),
          "*"
        );
        audioIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
    } catch (e) {
      console.warn("Could not restart 432Hz soundscape iframe:", e);
    }
  };

  const toggleAudio = () => {
    if (!audioPlaying) {
      setAudioPlaying(true);
      setAudioPaused(false);
    } else if (audioPaused) {
      resumeAudio();
    } else {
      pauseAudio();
    }
  };

  return (
    <SoundSanctuaryContext.Provider
      value={{
        audioPlaying,
        audioPaused,
        toggleAudio,
        pauseAudio,
        resumeAudio,
        stopAudio,
        restartAudio
      }}
    >
      {children}

      {/* Persistent Global 432Hz Audio Engine (Unobtrusive & controlled via top-right pill) */}
      {audioPlaying && (
        <iframe
          ref={audioIframeRef}
          src="https://www.youtube.com/embed/TK1Ij_-mank?enablejsapi=1&autoplay=1&loop=1&playlist=TK1Ij_-mank&controls=0&modestbranding=1"
          title="Joe Hisaishi • Howl's Moving Castle (432Hz Restorative Resonance)"
          allow="autoplay"
          className="cr-hidden-audio-frame"
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: "0.001",
            pointerEvents: "none",
            border: "none"
          }}
        />
      )}
    </SoundSanctuaryContext.Provider>
  );
}

export function useSoundSanctuary() {
  return useContext(SoundSanctuaryContext);
}

