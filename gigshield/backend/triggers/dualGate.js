const { evaluateGate1 } = require('./gate1');
const { evaluateGate2 } = require('./gate2');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Layer 3: Dual Gate Wireup
 * Evaluates both gates for a given disruption event and worker state.
 * Only creates a Claim record in PostgreSQL if both return true.
 */
async function processDualGate(workerId, policyId, workerState, weatherData, disruptionZone) {
  const gate1Result = evaluateGate1(weatherData);
  const gate2Result = evaluateGate2(workerState, disruptionZone);

  const bothPassed = gate1Result.triggered && gate2Result.validated;

  try {
    const claim = await prisma.claim.create({
      data: {
        workerId: workerId,
        policyId: policyId,
        disruptionType: gate1Result.triggered ? "rainfall" : "none",
        gate1Passed: gate1Result.triggered,
        gate2Passed: gate2Result.validated,
        fraudCheckPassed: false, // Phase 2: Fraud Validation Layer runs next
        payoutAmount: 0, // Calculated post-fraud check
        payoutStatus: bothPassed ? "pending_fraud_check" : "rejected",
        disruptionStartTime: new Date(),
        disruptionEndTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // mocked 2 hrs
        hoursLost: 2 
      }
    });

    return {
      success: true,
      claimId: claim.id,
      bothPassed,
      gate1Reason: gate1Result.reason,
      gate2Reason: gate2Result.reason
    };
  } catch (err) {
    console.error(`[Dual Gate Error] Failed to create claim: ${err.message}`);
    return { success: false, error: err.message };
  }
}

module.exports = {
  processDualGate
};
