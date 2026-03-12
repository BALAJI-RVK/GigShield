const express = require('express');
const { handlePlatformWebhook } = require('../ingestion/webhookReceiver');

const router = express.Router();

/**
 * Endpoint for Zomato/Swiggy activity updates and zone suspensions
 * This goes straight into Layer 1 (Ingestion)
 */
router.post('/webhooks/platform', handlePlatformWebhook);

module.exports = router;
