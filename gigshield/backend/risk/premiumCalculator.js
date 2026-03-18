// Calculate the weekly premium for a worker based on the Wage Mirror Principle
// Formula: (avg(12-week earnings) * 0.75%) * zoneRiskScore * seasonalMultiplier
function calculateWeeklyPremium(earningsHistory, zoneRiskScore = 1.0, seasonalMultiplier = 1.0) {
  // Check if the earnings history array is empty or undefined
  if (!earningsHistory || earningsHistory.length === 0) {
    // If we have no history, the premium is mathematically 0 (or a fallback base rate)
    return 0; 
  }

  // Use the reduce function to sum up all earnings inside the 12-week tracked array
  const totalEarnings = earningsHistory.reduce((sum, val) => sum + val, 0);
  
  // Divide the total sum by the number of weeks (usually 12) to get the trailing average
  const avgEarnings = totalEarnings / earningsHistory.length;

  // The base premium is exactly 0.75% of their average weekly earnings
  const basePremium = avgEarnings * 0.0075;

  // Multiply the base premium by the risk score and season multiplier (1.0 for Phase 1)
  const finalPremium = basePremium * zoneRiskScore * seasonalMultiplier;

  // Round the final premium calculation to 2 decimal places to represent standard currency
  return Math.round(finalPremium * 100) / 100;
}

// Export the function so it can be called later by our triggers and endpoints
module.exports = {
  calculateWeeklyPremium
};

// ─────────────────────────────────────────────────────────
// QUICK TEST BLOCK (ONLY RUNS IF THIS FILE IS RUN DIRECTLY)
// ─────────────────────────────────────────────────────────

// If this file is run from the terminal directly (not imported as a module)
if (require.main === module) {
  // Define Ravi's mock array from the Master Context
  const raviEarnings = [10200, 9800, 11000, 10500, 9200, 10800, 11200, 9900, 10100, 10600, 9700, 10300];
  // Calculate Ravi's premium
  const raviPremium = calculateWeeklyPremium(raviEarnings);
  
  // Define Priya's mock array from the Master Context
  const priyaEarnings = [5800, 6200, 5500, 6100, 5900, 6300, 5700, 6000, 5600, 6400, 5800, 6100];
  // Calculate Priya's premium
  const priyaPremium = calculateWeeklyPremium(priyaEarnings);

  // Define Arjun's mock array from the Master Context
  const arjunEarnings = [1800, 2200, 1500, 2100, 1900, 2300, 1700, 2000, 1600, 2400, 1800, 2100];
  // Calculate Arjun's premium
  const arjunPremium = calculateWeeklyPremium(arjunEarnings);

  // Print out the expected vs actual results to the screen
  console.log(`[Premium Check] Ravi (Full-time): ₹${raviPremium} (Expected: ~₹78)`);
  console.log(`[Premium Check] Priya (Regular): ₹${priyaPremium} (Expected: ~₹45)`);
  console.log(`[Premium Check] Arjun (Casual): ₹${arjunPremium} (Expected: ~₹15)`);
}
