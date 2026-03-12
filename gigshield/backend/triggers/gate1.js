/**
 * Layer 3: Gate 1 (Environmental Trigger)
 * Evaluates whether an external disruption is confirmed in the worker's zone.
 * Input: weather data object from OpenWeatherMap (or similar APIs)
 * Output: { triggered: boolean, reason: string, severity: string }
 */
function evaluateGate1(weatherData) {
  // Phase 1 implementation: Check for rainfall > 35mm/hr
  
  if (!weatherData) {
    return { triggered: false, reason: "No weather data", severity: "none" };
  }

  // OpenWeatherMap puts 1h rain volume in data.rain['1h'] usually
  const rain1h = weatherData.rain_1h || (weatherData.rain && weatherData.rain['1h']) || 0;

  if (rain1h > 35) {
    return {
      triggered: true,
      reason: `Heavy rainfall detected: ${rain1h}mm/hr`,
      severity: "severe"
    };
  }

  // Not triggered
  return {
    triggered: false,
    reason: `Normal conditions. Rain: ${rain1h}mm/hr`,
    severity: "none"
  };
}

module.exports = {
  evaluateGate1
};
