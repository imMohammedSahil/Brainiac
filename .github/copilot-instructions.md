# Brainiac — Agent & Copilot Instructions

This document provides architectural rules, conventions, and context for AI agents, GitHub Copilot, and contributors working on **Brainiac**.

---

## 1. Project Philosophy & Stack

**Brainiac** is a high-performance neuroscience and cognitive intelligence platform with real-time 3D WebGL neural mapping, client-side psychometrics, and LLM-powered personalized protocols.

- **Frontend**: React 19, Vite, React Three Fiber (R3F), Three.js, GSAP, Web Audio API, Tailwind / CSS modules.
- **Backend / Gateway**: Node.js + Express proxy (`brainiac-backend/`), Multi-model LLM router (Google Gemini 2.5 Flash primary with graceful fallbacks to Hugging Face, Cerebras, Pollinations, and local heuristic generation).
- **Deployment**: Vercel frontend with serverless API rewrites, Node.js backend.

---

## 2. WebGL & 3D Rendering Principles

1. **GPU Resource Disposal**: Always clean up geometries, materials, and textures when R3F components unmount. Never leave hanging WebGL render targets.
2. **Animation Loops**: Use `useFrame` hook from `@react-three/fiber` for delta-timed continuous transforms; avoid setting raw React state inside frame loops.
3. **Responsive Viewport**: Retain aspect ratio across mobile and widescreen devices without clipping the neural 3D model.
4. **Context Loss Recovery**: Ensure scene fails gracefully if WebGL is disabled or context is lost.

---

## 3. Psychometric & Scoring Engine

1. **Deterministic Scoring**: Assessment matrix computes 10 distinct regional scores normalized between 0 and 100.
2. **Valence Inversion**: Certain questions are reverse-coded (e.g. stress or anxiety indices inverted to represent resilience). Maintain consistency when modifying survey logic.
3. **No Direct Mutation**: Psychometric state updates must be immutable.

---

## 4. LLM Prompting & Protocol Guidelines

1. **Empathetic & Neuroscience-Informed Tone**: The companion should be warm, soothing, and scientifically grounded.
2. **Strict Section Format**: Ritual protocols must conform to 5 distinct sections:
   - `Core Neural Insight:`
   - `Morning Mindful Ritual:`
   - `Daytime Flow & Reset:`
   - `Sensory Grounding Pause:`
   - `Evening Wind-Down & Deep Rest:`
3. **No Markdown Bloat**: Prohibit extraneous preambles, asterisks, or markdown lists under sections to maintain strict UI rendering compatibility.

---

## 5. Security & Hygiene Rules

- **Zero Secret Leaks**: Never hardcode API keys (Gemini, HuggingFace, etc.) in the frontend codebase. All external LLM requests must flow through the authenticated backend gateway or serverless routes.
- **Dependency Hygiene**: Use standard npm commands. Run `npm run build` to verify bundles before committing.
