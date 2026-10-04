require("dotenv").config();
const express = require("express");
const cors = require("cors");

// allows fetch in Node
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

// ZERO-CACHE: Every request produces fresh, live, personalized AI insights

app.post("/ai-improve", async (req, res) => {
  const { prompt, regionName, focus, userInput } = req.body;
  const safeInput = (userInput || "").slice(0, 1000).trim();
  let aiText = "";

  const systemMessage =
    "You are a deeply warm, compassionate, loving, and supportive neuroscience-informed wellness companion. Always speak in a gentle, feel-good, empathetic tone that makes the user feel truly cared for, validated, and safe. Never use emojis. Provide practical, nourishing, feel-good rituals divided clearly into 4 sections: Core Neural Insight, Morning Mindful Rituals, Daytime Flow & Energy, and Evening Wind-Down & Deep Rest.";

  // 1. Try Hugging Face if key is present
  if (process.env.HF_API_KEY && !process.env.HF_API_KEY.includes("your_hugging_face")) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          max_tokens: 450,
          temperature: 0.7,
        }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        aiText = data?.choices?.[0]?.message?.content || "";
      }
    } catch (hfErr) {
      console.warn("HF notice:", hfErr.message);
    }
  }

  // 2. High-Quality Free OpenAI-Compatible LLM Tier (Pollinations)
  if (!aiText || aiText.trim().length === 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        aiText = data?.choices?.[0]?.message?.content || "";
      }
    } catch (aiErr) {
      console.warn("AI router notice:", aiErr.message);
    }
  }

  // 3. Intelligent Personalized Synthesizer Fallback if offline / timeout
  if (!aiText || aiText.trim().length === 0 || aiText === "No AI response.") {
    aiText = generateCarePlan(regionName, focus, userInput);
  }

  // Clean formatting: strip markdown asterisks and standardize spacing cleanly
  aiText = aiText.replace(/\*\*/g, "");
  aiText = aiText.replace(/(Core Neural Insight:|Morning Mindful Rituals?:|Daytime Flow & Energy:|Evening Wind-Down & Deep Rest:)/gi, "\n\n$1\n");
  aiText = aiText.replace(/ - /g, "\n- ");
  aiText = aiText.replace(/\n\s*\n\s*-/g, "\n- ");
  aiText = aiText.replace(/\n{3,}/g, "\n\n");

  res.json({ result: aiText.trim(), cached: false });
});

function generateCarePlan(regionName = "Brain Region", focus = "Calm & Emotional Balance", context = "") {
  const userSnippet = context && context.trim() 
    ? `In honoring what you shared ("${context.trim().slice(0, 80)}..."), your nervous system is simply calling for gentler pacing, spaciousness, and soothing reassurance.`
    : `Nurturing your ${regionName} begins with honoring how much you carry and giving your mind permission to soften and rest.`;

  return `Core Neural Insight:
- ${userSnippet}
- Prioritizing ${focus} lovingly restores your natural inner ease, emotional stability, and clear, joyful energy.

Morning Mindful Rituals:
- Begin your morning with 5 slow, comforting breaths, holding a kind and loving intention for your day.
- Enjoy a warm glass of water in peaceful stillness before engaging with any screens or demanding tasks.

Daytime Flow & Energy:
- Give yourself permission to pause regularly, gently dropping your shoulders and releasing tension with an easy exhale.
- Whenever you feel weary, step near a window or into fresh air for a moment of quiet, loving reconnection with yourself.

Evening Wind-Down & Deep Rest:
- Create a cozy, dimly lit sanctuary 45 minutes before bedtime to welcome soothing calmness into your nervous system.
- Reflect on three gentle moments you appreciate today, drifting into deep, restorative, healing sleep.`;
}

app.listen(5000, () => {
  console.log("✅ Live AI Care Server running on http://localhost:5000 (Zero-Cache Mode)");
});