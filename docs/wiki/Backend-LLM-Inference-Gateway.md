# Backend LLM Inference Gateway and Routing

## 1. Overview

The `brainiac-backend` microservice acts as an authenticated intermediary between client requests and upstream LLM providers. This prevents client-side API key leakage and provides high availability through automated fallback chains.

---

## 2. Multi-Tier Fallback Hierarchy

When a client dispatches an inference request to `/api/ai-improve`:

1. **Tier 1 — Google Gemini 2.5 Flash:**
   - Primary low-latency model (~300ms typical execution).
   - Strict system prompt enforcement for structured 5-section response.

2. **Tier 2 — Hugging Face Inference Router:**
   - Meta Llama 3 8B Instruct endpoint fallback.

3. **Tier 3 — Cerebras Inference Engine:**
   - Ultra-fast token generation endpoint fallback.

4. **Tier 4 — Pollinations AI:**
   - Secondary external endpoint fallback.

5. **Tier 5 — Deterministic Heuristic Engine:**
   - Zero-dependency local protocol generator ensuring zero downtime even under complete upstream network failure.

---

## 3. Contract Specification

Requests to the proxy must comply with the following JSON payload schema:

```json
{
  "regionName": "Prefrontal Cortex",
  "focus": "Executive Function",
  "userInput": "Persistent difficulty maintaining attention during deep work sessions."
}
```

The response is returned as deterministic structured text adhering to the five mandatory sections:
1. `Core Neural Insight:`
2. `Morning Mindful Ritual:`
3. `Daytime Flow & Reset:`
4. `Sensory Grounding Pause:`
5. `Evening Wind-Down & Deep Rest:`
