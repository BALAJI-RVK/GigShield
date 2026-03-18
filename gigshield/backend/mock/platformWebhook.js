const express = require('express');
const { workers } = require('./mockData');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.MOCK_PLATFORM_PORT || 3001;
const INTERVAL = process.env.MOCK_WEBHOOK_INTERVAL_MS || 5000;

// URL of our central GigShield ingestion endpoint
const GIGSHIELD_WEBHOOK_URL = 'http://localhost:4000/api/webhooks/platform';

/**
 * Generate mock activity payload for a given worker
 */
function generateActivityPayload(worker) {
  // Pick one of the platforms the worker is active on
  const platform = worker.platforms[Math.floor(Math.random() * worker.platforms.length)];
  
  // Add some jitter to GPS
  const latJitter = (Math.random() - 0.5) * 0.01;
  const lngJitter = (Math.random() - 0.5) * 0.01;

  // Add some jitter to completions
  const completionsJitter = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
  let completions_last_hour = worker.baselineCompletions + completionsJitter;
  if(completions_last_hour < 0) completions_last_hour = 0;

  return {
    worker_hash: worker.workerHash,
    platform: platform,
    timestamp: new Date().toISOString(),
    status: Math.random() > 0.1 ? "online" : "on_delivery",
    gps: {
      lat: worker.baseLat + latJitter,
      lng: worker.baseLng + lngJitter
    },
    zone: worker.zone,
    completions_last_hour: Math.round(completions_last_hour),
    avg_completions_baseline: worker.baselineCompletions
  };
}

/**
 * Emit webhooks periodically
 */
function startEmitting() {
  console.log(`[Mock Server] Starting continuous worker activity simulation...`);
  
  setInterval(async () => {
    for (const worker of workers) {
      if (Math.random() > 0.8) continue; // Randomly skip some ticks to simulate real-world fuzziness

      const payload = generateActivityPayload(worker);
      
      try {
        const response = await fetch(GIGSHIELD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log(`[Event Sent] ${worker.name} on ${payload.platform} -> Status: ${response.status}`);
      } catch (err) {
        console.log(`[Event Failed] Target offline: ${GIGSHIELD_WEBHOOK_URL}`);
      }
    }
  }, INTERVAL);
}

app.listen(PORT, () => {
  console.log(`[Mock Platform Server] Running on port ${PORT}`);
  startEmitting();
});
