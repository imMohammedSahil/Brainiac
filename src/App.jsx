import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SmoothScroll from "./components/SmoothScroll";
import { SoundSanctuaryProvider } from "./context/SoundSanctuaryContext";
import AudioCursorPrompt from "./components/AudioCursorPrompt";
import Intro from "./pages/Intro";
import Questionnaire from "./components/Questionnaire";
import Results from "./components/Results";
import BrainView from "./pages/BrainView";
import Improve from "./pages/Improve";
import CareReport from "./pages/CareReport";

function App() {
  return (
    <Router>
      <SoundSanctuaryProvider>
        <AudioCursorPrompt />
        <SmoothScroll>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/assessment" element={<Questionnaire />} />
            <Route path="/results" element={<Results />} />
            <Route path="/brain" element={<BrainView />} />
            <Route path="/improve" element={<Improve />} />
            <Route path="/care-plan" element={<CareReport />} />
            <Route path="/care-report" element={<CareReport />} />
          </Routes>
        </SmoothScroll>
      </SoundSanctuaryProvider>
    </Router>
  );
}

export default App;