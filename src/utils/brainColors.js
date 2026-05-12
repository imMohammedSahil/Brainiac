export function getRegionColor(score) {
  if (score >= 80) return "#00e5ff";   // vibrant
  if (score >= 60) return "#00bfa5";
  if (score >= 40) return "#ffd600";
  if (score >= 20) return "#ff9100";
  return "#ff1744";                    // critical
}