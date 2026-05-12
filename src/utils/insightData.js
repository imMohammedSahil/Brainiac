export function buildInsightData(regionScores) {
  const weak = [];
  const moderate = [];
  const strong = [];

  for (const region in regionScores) {
    const score = regionScores[region];

    if (score < 40) weak.push(region);
    else if (score < 70) moderate.push(region);
    else strong.push(region);
  }

  return {
    weak,
    moderate,
    strong,
    overall:
      Object.values(regionScores).reduce((a,b)=>a+b,0) /
      Object.keys(regionScores).length
  };
}