# Brainiac Developer Wiki

Welcome to the internal engineering documentation and technical specifications for the Brainiac platform.

---

## Navigation

- [System Architecture and Data Flow](Architecture-and-Data-Flow.md)
- [Interactive 3D WebGL Rendering Pipeline](WebGL-3D-Rendering-Pipeline.md)
- [Psychometrics Formulation and Scoring Engine](Psychometrics-Engine-and-Scoring.md)
- [Backend LLM Inference Gateway and Routing](Backend-LLM-Inference-Gateway.md)

---

## Technical Overview

Brainiac combines modern frontend graphic pipelines with psychometric scoring algorithms and real-time generative language models:

- **Frontend**: React 19 single-page application bundled with Vite.
- **Graphic Layer**: Three.js integration using `@react-three/fiber` and `@react-three/drei` for 3D GLTF asset loading and procedural GLSL vertex/fragment shading.
- **Audio Engine**: Web Audio API oscillator synthesis generating custom frequency soundscapes mapped to cognitive states.
- **Backend Service**: Express.js microservice serving as a resilient proxy with automated multi-provider LLM fallbacks (Google Gemini, Hugging Face Inference Router, Cerebras, Pollinations, and local heuristic generation).
