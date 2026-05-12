export function getHealthColor(score) {

  if (score <= 35) return "#ff0000";   // red → needs attention
  if (score <= 50) return "#ff7a00";   // orange → weak
  if (score <= 65) return "#ffd400";   // yellow → moderate
  if (score <= 80) return "#4caf50";   // green → good
  return "#2196f3";                    // blue → excellent

}