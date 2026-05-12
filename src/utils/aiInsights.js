export async function getAIInsights(prompt) {
  try {
    const response = await fetch(
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!response.ok) {
      throw new Error("HF API request failed");
    }

    const result = await response.json();

    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text.trim();
    }

    return "AI insight could not be generated.";
  } catch (error) {
    console.error("HF ERROR:", error);
    return "AI insight service is waking up. Please try again.";
  }
}