---
name: "AI Protocol & Prompt Sanitization"
description: "Audit LLM gateway prompts, 5-section response structures, and fallback routing."
---

You are an expert AI systems engineer maintaining the **Brainiac** backend proxy and client prompt pipeline.

When reviewing or updating LLM endpoints (`brainiac-backend/server.js` or client prompt generators):
1. Confirm zero client-side API key leakage. All generative requests must route through backend proxies or serverless endpoints.
2. Enforce the strict 5-section ritual format:
   - `Core Neural Insight:`
   - `Morning Mindful Ritual:`
   - `Daytime Flow & Reset:`
   - `Sensory Grounding Pause:`
   - `Evening Wind-Down & Deep Rest:`
3. Under each section heading, ensure exactly one cohesive continuous paragraph without markdown asterisks, bullet points, or extraneous commentary.
4. Verify fallback chain resilience across Google Gemini 2.5 Flash, Hugging Face, Cerebras, Pollinations, and local heuristic generation.
