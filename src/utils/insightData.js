export function buildInsightData(regionScores = {}) {
  const weak = [];
  const moderate = [];
  const strong = [];

  const keys = Object.keys(regionScores);
  for (const region of keys) {
    const score = regionScores[region];

    if (score < 45) weak.push(region);
    else if (score < 75) moderate.push(region);
    else strong.push(region);
  }

  return {
    weak,
    moderate,
    strong,
    overall: keys.length > 0
      ? Object.values(regionScores).reduce((a, b) => a + b, 0) / keys.length
      : 0
  };
}