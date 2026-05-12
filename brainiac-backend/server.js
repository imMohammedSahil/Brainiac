require("dotenv").config();
const express = require("express");
const cors = require("cors");

// allows fetch in Node
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

app.post("/ai-improve", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.4,
        }),
      }
    );

    const text = await response.text();
    console.log("RAW HF RESPONSE:", text);

    const data = JSON.parse(text);

    const aiText =
      data?.choices?.[0]?.message?.content ||
      "No AI response.";

    res.json({ result: aiText });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(5000, () => {
  console.log("✅ AI server running on http://localhost:5000");
});