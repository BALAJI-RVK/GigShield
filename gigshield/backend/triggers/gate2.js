// ─────────────────────────────────────────────────────────
// LAYER 3 — GATE 2: Activity & Income Proxy Validation
// ─────────────────────────────────────────────────────────
// This is the second check every claim must pass.
// GATE 2 asks: "Was THIS specific worker actually trying
// to earn money during the disruption?"
//
// Even if a city-wide flood is happening (Gate 1 passes),
// a worker who was asleep at home gets NO payout.
// The worker must have been ACTIVELY ONLINE in that zone.
//
// Phase 1 checks:
//   1. Worker status must be "online" or "on_delivery" (not "offline")
//   2. Worker must be in the SAME zone as the disruption
//   3. Worker's online duration during disruption must be ≥ 45 mins
//      (for Phase 1, we get this from the onlineMinutes field
//       which the mock server will include in disruption simulations)
// ─────────────────────────────────────────────────────────

/**
 * Evaluates whether the worker was actively trying to earn during the disruption.
 *
 * @param {object} workerState - The worker's last known activity snapshot
 *   Expected to have:
 *     worker_hash: string
 *     status: "online" | "offline" | "on_delivery"
 *     zone: string (pin code)
 *     onlineMinutes: number (how long they were online during disruption)
 *     completions_last_hour: number
 *     avg_completions_baseline: number
 *
 * @param {string} disruptionZone - The pin code where disruption is active
 *
 * @returns {{ validated: boolean, reason: string }}
 *   validated: true if this worker qualifies for a claim
 *   reason: plain English explanation of the decision
 */
function evaluateGate2(workerState, disruptionZone) {

  // If we have no record of this worker's state, we cannot validate them.
  // This can happen if they never sent a webhook before the disruption.
  if (!workerState) {
    return {
      validated: false,
      reason: 'No activity data found for this worker during disruption window'
    };
  }

  // CHECK 1: Was the worker's app open and active?
  // A worker who is "offline" was either home, sleeping, or chose to stop.
  // We do NOT pay out to workers who were not even logged in.
  if (workerState.status === 'offline') {
    return {
      validated: false,
      reason: `Worker was offline during disruption — no income loss to compensate`
    };
  }

  // CHECK 2: Was the worker INSIDE the disrupted zone?
  // A worker in Delhi does not get paid for a Mumbai flood.
  // We compare the worker's GPS zone pin code to the disruption zone pin code.
  if (workerState.zone !== disruptionZone) {
    return {
      validated: false,
      reason: `Worker in zone ${workerState.zone}, but disruption was in zone ${disruptionZone}`
    };
  }

  // CHECK 3: Was the worker online for at least 45 MINUTES during the disruption?
  // WHY 45 mins? Less than 45 mins could be a natural toilet break, phone dying,
  // or voluntary logout — not a forced disruption.
  // For Phase 1, onlineMinutes is passed in via the simulation payload.
  // For Phase 2, this is calculated from the Redis timestamp log.
  const onlineMinutes = workerState.onlineMinutes || 0;

  if (onlineMinutes < 45) {
    return {
      validated: false,
      reason: `Worker was only online for ${onlineMinutes} mins (minimum required: 45 mins)`
    };
  }

  // CHECK 4: Did their delivery rate DROP during the disruption?
  // Compare their actual completions vs their personal historical baseline.
  // If they completed MORE than their baseline, there was no disruption effect.
  const actualCompletions = workerState.completions_last_hour || 0;
  const baselineCompletions = workerState.avg_completions_baseline || 1;

  // We allow up to 50% of their baseline before we declare "no disruption impact"
  const dropThreshold = baselineCompletions * 0.5;

  if (actualCompletions > dropThreshold) {
    return {
      validated: false,
      reason: `Completion rate (${actualCompletions}/hr) did not drop significantly vs baseline (${baselineCompletions}/hr)`
    };
  }

  // ALL CHECKS PASSED — this worker genuinely lost income due to the disruption.
  return {
    validated: true,
    reason: `Worker was online ${onlineMinutes} mins in zone ${disruptionZone} during disruption. Completions dropped from ${baselineCompletions} to ${actualCompletions}/hr.`
  };
}

// Export the function so it can be imported by dualGate.js
module.exports = { evaluateGate2 };
