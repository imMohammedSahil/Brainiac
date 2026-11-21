# System Architecture and Data Flow

## 1. High-Level Topology

Brainiac separates concerns between client-side compute (WebGL rendering, psychometric questionnaire execution, client audio synthesis) and backend orchestration (API key security, rate limiting, LLM streaming).

```
[ User Input / Survey Responses ]
               |
               v
[ 20-Factor Assessment Matrix ]
               |
               v
[ Scoring & Valence Normalizer ]
               |
               v
     +---------+---------+
     |                   |
     v                   v
[ 3D WebGL Canvas ]  [ Prompt Compiler ]
(Color & Pulse Map)      |
                         v
               [ Express API Gateway ]
                         |
                         v
               [ Multi-Model Router ]
           (Gemini -> HF -> Cerebras -> Heuristic)
                         |
                         v
               [ Protocol Renderer Modal ]
```

---

## 2. Assessment State Management

The assessment engine stores user evaluations in client state across 20 distinct metrics. Each metric targets a specific cognitive pillar with defined valence polarity (positive indicator vs. inverse stress indicator).
Scores are normalized into a unified scale $[0, 100]$ across 10 anatomical regions before binding to WebGL uniform buffers.
