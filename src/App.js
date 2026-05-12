import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Intro from "./pages/Intro";
import Questionnaire from "./components/Questionnaire";
import Results from "./components/Results";
import BrainView from "./pages/BrainView";
import Improve from "./pages/Improve";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/assessment" element={<Questionnaire />} />
        <Route path="/results" element={<Results />} />
        <Route path="/brain" element={<BrainView />} />
        <Route path="/improve" element={<Improve />} />
      </Routes>
    </Router>
  );
}

export default App;