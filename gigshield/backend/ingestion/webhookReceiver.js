const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Handle incoming platform webhooks (activity & suspension)
 * Layer 1 Input
 */
const handlePlatformWebhook = async (req, res) => {
  const payload = req.body;
  
  try {
    // 1. If it's a zone suspension event
    if (payload.event_type === 'zone_suspension') {
      console.log(`[Ingestion] Received Zone Suspension from ${payload.platform} for zone ${payload.zone}`);
      
      const newEvent = await prisma.disruptionEvent.create({
        data: {
          zone: payload.zone,
          eventType: payload.event_type,
          severity: 'severe',
          confirmedByApi: true,
          apiSource: payload.platform,
          startTime: new Date(payload.timestamp),
          endTime: new Date(new Date(payload.timestamp).getTime() + payload.estimated_duration_minutes * 60000)
        }
      });
      // We would ideally enqueue this to Layer 3 now.
      return res.status(200).json({ success: true, eventId: newEvent.id });
    }

    // 2. If it's a regular worker activity update
    if (payload.worker_hash && payload.status) {
      // In a real app, we'd update Redis with their live status.
      // E.g. redis.set(`worker:${payload.worker_hash}:status`, JSON.stringify(payload), 'EX', 3600);
      return res.status(200).json({ success: true, message: "Activity logged" });
    }

    res.status(400).json({ success: false, error: 'Unknown payload type' });
  } catch (error) {
    console.error(`[Ingestion Error] ${error.message}`);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  handlePlatformWebhook
};
