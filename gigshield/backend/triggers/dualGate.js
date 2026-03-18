// ─────────────────────────────────────────────────────────
// LAYER 3 — DUAL GATE: The Core Decision Engine
// ─────────────────────────────────────────────────────────
// This file connects Gate 1 and Gate 2.
// ONLY if BOTH gates return true does a Claim get created.
//
// Think of this as the brain that:
//   1. Asks Gate 1: "Is there a real disruption?" 
//   2. Asks Gate 2: "Was the worker actively trying to earn?"
//   3. If YES to both → creates a Claim record in PostgreSQL
//   4. If NO to either → logs the reason and does nothing
//
// It also calculates the PAYOUT AMOUNT using the formula:
//   hourlyRate = avg(12-week earnings) ÷ (6 days × 8 hrs)
//   payoutAmount = hourlyRate × hoursLost × 0.75 (75% cap)
// ─────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client'); // Connect to PostgreSQL
const { evaluateGate1 } = require('./gate1');        // Import Gate 1 logic
const { evaluateGate2 } = require('./gate2');        // Import Gate 2 logic

// Create a single shared Prisma client instance for this file
const prisma = new PrismaClient();

/**
 * Calculate the payout amount using the Wage Mirror formula.
 * Payout = hourlyRate × hoursLost × 0.75 (75% cap)
 *
 * @param {number[]} earningsHistory - 12-week earnings array in ₹
 * @param {number} hoursLost - How many hours the disruption lasted
 * @returns {number} The payout amount in ₹, capped at 75%
 */
function calculatePayoutAmount(earningsHistory, hoursLost) {
  // Average weekly earnings across the trailing 12 weeks
  const avgWeeklyEarnings =
    earningsHistory.reduce((sum, val) => sum + val, 0) / earningsHistory.length;

  // Assume a worker works 6 days a week for 8 hours per day = 48 work hours per week
  const weeklyWorkHours = 48;

  // Calculate the hourly earning rate from weekly average
  const hourlyRate = avgWeeklyEarnings / weeklyWorkHours;

  // Apply the 0.75 cap — payout is 75% of lost income (NOT 100%)
  // WHY 75%? Prevents moral hazard — a worker shouldn't earn MORE
  // from a disruption than from actually working.
  const payoutAmount = hourlyRate * hoursLost * 0.75;

  // Round to 2 decimal places for currency display
  return Math.round(payoutAmount * 100) / 100;
}

/**
 * Main entry point: runs both gates and creates a Claim if both pass.
 *
 * @param {string} workerId       - UUID of the worker from PostgreSQL
 * @param {string} policyId       - UUID of the active policy from PostgreSQL
 * @param {object} workerState    - Worker's activity snapshot (from Redis/webhook)
 * @param {object} weatherData    - Raw weather object from OpenWeatherMap
 * @param {string} disruptionZone - Pin code of the disruption area
 * @param {number} hoursLost      - How many hours of income were lost
 * @param {number[]} earningsHistory - Worker's 12-week trailing earnings array
 *
 * @returns {object} Result with claim info or rejection reason
 */
async function processDualGate(
  workerId,
  policyId,
  workerState,
  weatherData,
  disruptionZone,
  hoursLost,
  earningsHistory
) {
  // ── STEP 1: Run Gate 1 ─────────────────────────────────
  const gate1Result = evaluateGate1(weatherData);
  console.log(`[Dual Gate] Gate 1 result: triggered=${gate1Result.triggered} — ${gate1Result.reason}`);

  // ── STEP 2: Run Gate 2 ─────────────────────────────────
  const gate2Result = evaluateGate2(workerState, disruptionZone);
  console.log(`[Dual Gate] Gate 2 result: validated=${gate2Result.validated} — ${gate2Result.reason}`);

  // ── STEP 3: Did BOTH gates pass? ──────────────────────
  const bothPassed = gate1Result.triggered && gate2Result.validated;

  // Determine what type of disruption caused the trigger
  const disruptionType = gate1Result.triggered ? 'heavy_rainfall' : 'none';

  // Calculate payout only if both gates passed; 0 if rejected
  const payoutAmount = bothPassed
    ? calculatePayoutAmount(earningsHistory, hoursLost)
    : 0;

  // Calculate timing for the claim record
  const disruptionStartTime = new Date();
  const disruptionEndTime = new Date(
    disruptionStartTime.getTime() + hoursLost * 60 * 60 * 1000
  );

  // ── STEP 4: Write the Claim to PostgreSQL ─────────────
  // We ALWAYS create a Claim record regardless of whether it passed or not.
  // This gives us a full audit trail for the underwriter.
  try {
    const claim = await prisma.claim.create({
      data: {
        workerId: workerId,             // Link to the Worker record
        policyId: policyId,             // Link to the weekly Policy record
        disruptionType: disruptionType, // What caused the disruption
        gate1Passed: gate1Result.triggered,   // Did the environment qualify?
        gate2Passed: gate2Result.validated,   // Was the worker active?
        fraudCheckPassed: false,        // Phase 2: Fraud layer runs next
        payoutAmount: payoutAmount,     // Calculated payout (0 if rejected)
        payoutStatus: bothPassed ? 'pending_fraud_check' : 'rejected',
        disruptionStartTime: disruptionStartTime,
        disruptionEndTime: disruptionEndTime,
        hoursLost: hoursLost,
      }
    });

    console.log(
      `[Dual Gate] Claim created: ${claim.id} — Status: ${claim.payoutStatus}`
    );

    // Return the result so the API endpoint can send it back to the caller
    return {
      success: true,
      claimId: claim.id,
      bothPassed,
      payoutAmount,
      payoutStatus: claim.payoutStatus,
      gate1: { triggered: gate1Result.triggered, reason: gate1Result.reason },
      gate2: { validated: gate2Result.validated, reason: gate2Result.reason }
    };
  } catch (err) {
    // If the database write failed, log it clearly
    console.error(`[Dual Gate Error] Failed to create claim: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Export the function so the API route can call it
module.exports = { processDualGate };
