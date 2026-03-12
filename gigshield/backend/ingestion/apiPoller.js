const dotenv = require('dotenv');
dotenv.config();

/**
 * Polls OpenWeatherMap API for relevant zones
 * Mock layer for the hackathon
 */
class ApiPoller {
  constructor() {
    this.interval = null;
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = process.env.OPENWEATHER_BASE_URL;
  }

  async pollWeatherForZone(zone) {
    if (!this.apiKey || this.apiKey === 'your_key_here') {
      // Return mock data if no key is provided
      console.log(`[API Poller] Mocking Weather API for zone ${zone}`);
      return {
        rain_1h: Math.random() > 0.8 ? 40 : 0, // 20% chance of heavy rain
        weather: [{ main: 'Rain' }]
      };
    }

    // For a real app, map zone (pincode) to lat/lon. Using hardcoded Bangalore for demo.
    const lat = 12.9716;
    const lon = 77.5946;
    try {
      const resp = await fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
      const data = await resp.json();
      return data;
    } catch (e) {
      console.error(`[API Poller] Weather fetch failed: ${e.message}`);
      return null;
    }
  }

  start(intervalMs = 600000) { // 10 minutes default
    console.log(`[API Poller] Starting weather ingestion interval...`);
    this.interval = setInterval(async () => {
      // In a real app, we'd aggregate all active zones from Redis
      const zonesToTrack = ['560034', '400053', '110001']; 
      for (const zone of zonesToTrack) {
        const data = await this.pollWeatherForZone(zone);
        // Process this data...
      }
    }, intervalMs);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = new ApiPoller();
