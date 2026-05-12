export function buildBrainPrompt(data) {
  return `
You are a neuroscience assistant.

A user's brain function assessment shows:

Weak regions: ${data.weak.join(", ") || "none"}
Moderate regions: ${data.moderate.join(", ") || "none"}
Strong regions: ${data.strong.join(", ") || "none"}

Overall brain health score: ${Math.round(data.overall)}

Explain in simple language:

1. What these results mean
2. How they affect daily life
3. Gentle improvement suggestions

Keep tone supportive and concise.
`;
}