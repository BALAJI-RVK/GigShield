// ─────────────────────────────────────────────────────────
// LAYER 3 — GATE 1: Environmental Trigger
// ─────────────────────────────────────────────────────────
// This is the first check every claim must pass.
// GATE 1 asks: "Is there a real, measurable disruption
// happening in this zone right now?"
// For Phase 1, we only implement the rainfall trigger.
// Gate 1 does NOT look at the worker at all — it only
// looks at the environment.
// ─────────────────────────────────────────────────────────

/**
 * Evaluates whether an environmental disruption trigger is active.
 *
 * @param {object} weatherData - Raw data object from OpenWeatherMap
 *   Expected to have: { rain_1h: number, weather: [{main: string}] }
 *
 * @returns {{ triggered: boolean, reason: string, severity: string }}
 *   triggered: true if this zone qualifies for a payout trigger
 *   reason: a plain English explanation of why it was triggered or not
 *   severity: "none", "moderate", or "severe"
 */
function evaluateGate1(weatherData) {

  // If no weather data was received at all, Gate 1 cannot fire.
  // Think of this like: "We can't confirm any disruption without data."
  if (!weatherData) {
    return {
      triggered: false,      // Gate 1 did not pass
      reason: 'No weather data available for this zone', // Explanation
      severity: 'none'       // No disruption
    };
  }

  // Extract the rainfall amount for the last 1 hour from the weather data.
  // OpenWeatherMap puts this inside: data.rain['1h']
  // We provide multiple fallbacks in case the key format differs.
  const rain1h =
    weatherData.rain_1h ||              // Our normalized format
    (weatherData.rain && weatherData.rain['1h']) || // OpenWeatherMap native format
    0;                                  // Default to 0 if no rain data exists

  // THE CORE RULE: >= 35mm/hour is the rainfall threshold.
  // WHY 35mm? Below 35mm riders work through the rain.
  // ABOVE 35mm: roads flood, visibility hits zero, platforms halt.
  // This is the point where income actually stops.
  if (rain1h >= 35) {
    return {
      triggered: true,       // ✅ Gate 1 passes — disruption is confirmed
      reason: `Heavy rainfall detected: ${rain1h}mm/hr exceeds 35mm/hr threshold`,
      severity: rain1h >= 50 ? 'extreme' : 'severe' // Extra severity if very heavy
    };
  }

  // If we reach here, conditions are normal — Gate 1 does NOT trigger.
  return {
    triggered: false,        // ❌ Gate 1 fails — no qualifying disruption
    reason: `Normal conditions. Rain: ${rain1h}mm/hr (threshold: 35mm/hr)`,
    severity: 'none'
  };
}

// Export the function so it can be imported by dualGate.js
module.exports = { evaluateGate1 };
