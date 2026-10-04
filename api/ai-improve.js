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
    "You are a deeply warm, compassionate, loving, and supportive neuroscience-informed wellness companion. Always speak in a gentle, feel-good, empathetic tone that makes the user feel truly cared for, validated, and safe. Never use emojis or markdown asterisks. Directly weave the user's specific context and emotions into the rituals. Do NOT include conversational greetings, preambles, or conclusions outside the 5 sections. Start directly with 'Core Neural Insight:'. Provide EXACTLY 5 distinct sections. Under EACH section heading, write EXACTLY ONE single, cohesive, continuous paragraph (3 to 4 lines, around 45 to 60 words, consisting of 2 to 3 soothing sentences). Do NOT output multiple paragraphs or bullet lists under a single section. Sections: Core Neural Insight:, Morning Mindful Ritual:, Daytime Flow & Reset:, Sensory Grounding Pause:, Evening Wind-Down & Deep Rest:.";

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
                parts: [{ text: prompt || `User is experiencing: "${userInput}". Nurturing brain region: ${regionName}, focus: ${focus}. Provide EXACTLY 5 sections, with each section being ONE single continuous paragraph of 3 to 4 lines.` }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 650,
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
          temperature: 0.7,
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

  // 4. Intelligent Personalized Synthesizer Fallback if offline / timeout
  if (!aiText || aiText.trim().length === 0 || aiText === "No AI response.") {
    aiText = generateCarePlan(regionName, focus, userInput);
  }

  // Clean formatting: strip markdown asterisks and standardize spacing cleanly
  aiText = aiText.replace(/\*\*/g, "");
  if (aiText.includes("Core Neural Insight:")) {
    aiText = aiText.substring(aiText.indexOf("Core Neural Insight:"));
  }
  aiText = aiText.replace(
    /(Core Neural Insight:|Morning Mindful Rituals?:|Daytime Flow & (?:Energy|Reset):|Sensory Grounding Pause:|Evening Wind-Down & Deep Rest:)/gi,
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
      ? `In honoring what you shared ("${context.trim().slice(0, 90)}..."), your nervous system is simply calling for gentler pacing, spaciousness, and soothing reassurance.`
      : `Nurturing your ${regionName} begins with honoring how much you carry and giving your mind wholehearted permission to soften and rest.`;

  return `Core Neural Insight:
${userSnippet} Prioritizing ${focus} lovingly creates the safe internal space your brain needs to restore natural inner ease, emotional stability, and clear, joyful energy.

Morning Mindful Ritual:
Begin your morning with 5 slow, comforting breaths before leaving bed, bringing to mind one kind word to gently carry with you throughout the day ahead. Enjoy a warm glass of water in peaceful stillness near a window, letting soft natural light gently awaken your frontal pathways without the rush of screens.

Daytime Flow & Reset:
Take regular micro-pauses throughout your day to gently drop your shoulders, unclamp your jaw, and release built-up tension with an easy, extended exhale. Whenever your mind feels crowded, step into fresh air for two quiet minutes to reconnect with your natural rhythm.

Sensory Grounding Pause:
Whenever you notice fatigue or mental overload setting in, pause for two minutes with a cup of warm tea or step into fresh air to lovingly reground your senses. Allow the gentle warmth and grounding physical sensations to soothe your nervous system.

Evening Wind-Down & Deep Rest:
Create a cozy, dimly lit sanctuary 45 minutes before bedtime, closing demanding tabs and letting warm lighting signal complete safety to your nervous system. Reflect on three quiet, comforting moments you appreciate from today, allowing your body to soften into deep, restorative, and healing sleep.`;
}
