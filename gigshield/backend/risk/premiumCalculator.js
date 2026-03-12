/**
 * Layer 2: Premium Calculator
 * Input: worker's 12-week earnings array
 * Output: weekly premium in INR
 * Formula: (avg(earnings) × 0.0075) × zoneRiskScore × seasonalMultiplier
 */
function calculateWeeklyPremium(earningsHistory, zoneRiskScore = 1.0, seasonalMultiplier = 1.0) {
  if (!earningsHistory || earningsHistory.length === 0) {
    return 0; // No earnings history, no premium calculation possible
  }

  // Calculate the 12-week trailing average
  const totalEarnings = earningsHistory.reduce((sum, val) => sum + val, 0);
  const avgEarnings = totalEarnings / earningsHistory.length;

  // Premium is 0.75% of average weekly earnings
  const basePremium = avgEarnings * 0.0075;

  // Apply multipliers
  const finalPremium = basePremium * zoneRiskScore * seasonalMultiplier;

  return Math.round(finalPremium * 100) / 100; // Round to 2 decimal places
}

module.exports = {
  calculateWeeklyPremium
};
