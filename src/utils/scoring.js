import { questions } from "../data/questions";

export function calculateScores(answers) {
  const regionTotals = {};
  const regionCounts = {};

  questions.forEach(q => {
    const rawAnswer = answers[q.id];

    if (rawAnswer === undefined) return;

    const adjusted = q.reverse ? 6 - rawAnswer : rawAnswer;

    if (!regionTotals[q.region]) {
      regionTotals[q.region] = 0;
      regionCounts[q.region] = 0;
    }

    regionTotals[q.region] += adjusted;
    regionCounts[q.region] += 1;
  });

  const normalized = {};

  Object.keys(regionTotals).forEach(region => {
    const maxScore = regionCounts[region] * 5;
    normalized[region] = (regionTotals[region] / maxScore) * 100;
  });

  return normalized;
}