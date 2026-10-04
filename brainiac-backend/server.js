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

const handleAiImprove = async (req, res) => {
  const { prompt, regionName, focus, userInput } = req.body || {};
  let aiText = "";

  const systemMessage =
    "You are a deeply warm, compassionate, loving, and supportive neuroscience-informed wellness companion. Always speak in a gentle, feel-good, empathetic tone that makes the user feel truly cared for, validated, and safe. Never use emojis or markdown asterisks. Directly weave the user's specific context and emotions into the rituals so every recommendation feels uniquely crafted for them. Provide practical, nourishing rituals divided clearly into 4 sections: Core Neural Insight, Morning Mindful Rituals, Daytime Flow & Energy, and Evening Wind-Down & Deep Rest.";

  // 1. Google Gemini 2.5 Flash (Ultra-Fast ~300ms, deeply personalized)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && !geminiKey.includes("your_gemini")) {
    const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"];

    for (const model of modelsToTry) {
      if (aiText && aiText.trim().length > 0) break;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemMessage }]
            },
            contents: [
              {
                parts: [{ text: prompt || `User is experiencing: "${userInput}". Nurturing brain region: ${regionName}, focus: ${focus}. Create 4 sections: Core Neural Insight, Morning Mindful Rituals, Daytime Flow & Energy, Evening Wind-Down & Deep Rest.` }]
              }
            ],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 800,
              thinkingConfig: { thinkingBudget: 0 }
            }
          })
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`Gemini (${model}) API error:`, errData);
        }
      } catch (geminiErr) {
        console.warn(`Gemini (${model}) notice:`, geminiErr.message);
      }
    }
  }

  // 2. Groq / Hugging Face Fallback if API keys present
  const groqKey = process.env.GROQ_API_KEY;
  if (!aiText && groqKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          temperature: 0.75,
        }),
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        aiText = data?.choices?.[0]?.message?.content || "";
      }
    } catch (groqErr) {
      console.warn("Groq notice:", groqErr.message);
    }
  }

  // 3. High-Quality Free OpenAI-Compatible LLM Tier (Pollinations)
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
          temperature: 0.75,
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

  // 4. Intelligent Personalized Synthesizer Fallback if offline / timeout
  if (!aiText || aiText.trim().length === 0 || aiText === "No AI response.") {
    aiText = generateCarePlan(regionName, focus, userInput);
  }

  // Clean formatting: strip markdown asterisks and standardize spacing cleanly
  aiText = aiText.replace(/\*\*/g, "");
  aiText = aiText.replace(
    /(Core Neural Insight:|Morning Mindful Rituals?:|Daytime Flow & Energy:|Evening Wind-Down & Deep Rest:)/gi,
    "\n\n$1\n"
  );
  aiText = aiText.replace(/ - /g, "\n- ");
  aiText = aiText.replace(/\n\s*\n\s*-/g, "\n- ");
  aiText = aiText.replace(/\n{3,}/g, "\n\n");

  res.json({ result: aiText.trim(), cached: false });
};

app.post("/ai-improve", handleAiImprove);
app.post("/api/ai-improve", handleAiImprove);
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Live AI Care Server running on port ${PORT} (Zero-Cache Mode)`);
});