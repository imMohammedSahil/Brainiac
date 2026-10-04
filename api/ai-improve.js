export default async function handler(req, res) {
  // Set CORS headers for API calls
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, regionName, focus, userInput } = req.body || {};
  let aiText = "";

  const systemMessage =
    "You are a deeply warm, compassionate, loving, and supportive neuroscience-informed wellness companion. Always speak in a gentle, feel-good, empathetic tone that makes the user feel truly cared for, validated, and safe. Never use emojis or markdown asterisks. Directly weave the user's specific context and emotions into the rituals so every recommendation feels uniquely crafted for them. Provide practical, nourishing rituals divided clearly into 4 sections: Core Neural Insight, Morning Mindful Rituals, Daytime Flow & Energy, and Evening Wind-Down & Deep Rest.";

  // 1. Google Gemini Flash (Primary: Ultra-Fast, Highly Empathetic & Intelligent)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && !geminiKey.includes("your_gemini")) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      
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
              parts: [{ text: prompt || `Please create a warm, personalized care plan for ${regionName} focusing on ${focus}. Context: "${userInput}"` }]
            }
          ],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 750,
          }
        })
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (geminiErr) {
      console.warn("Gemini Flash notice:", geminiErr.message);
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

  const hfKey = process.env.HF_API_KEY;
  if (!aiText && hfKey && !hfKey.includes("your_hugging_face")) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.75,
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

  res.status(200).json({ result: aiText.trim(), cached: false });
}

function generateCarePlan(regionName = "Brain Region", focus = "Calm & Emotional Balance", context = "") {
  const userSnippet =
    context && context.trim()
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
