/**
 * Layer 3: Gate 2 (Activity & Income Proxy)
 * Evaluates whether the specific worker was actively trying to earn during the disruption.
 * Input: worker activity webhook payload from the database/redis state
 * Output: { validated: boolean, reason: string }
 */
function evaluateGate2(workerState, disruptionZone) {
  if (!workerState) {
    return { validated: false, reason: "No worker state found" };
  }

  // Phase 1 implementation:
  // Check if worker is online/on_delivery AND in the affected zone.
  // In a full implementation, we'd check if they were active for >= 45 mins.
  
  if (workerState.status === 'offline') {
    return { validated: false, reason: "Worker was offline" };
  }

  if (workerState.zone !== disruptionZone) {
    return { validated: false, reason: `Worker in zone ${workerState.zone}, disruption in ${disruptionZone}` };
  }

  return {
    validated: true,
    reason: "Worker was active in the disruption zone"
  };
}

module.exports = {
  evaluateGate2
};
