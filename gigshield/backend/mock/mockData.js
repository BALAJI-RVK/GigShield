const crypto = require('crypto');

/**
 * Helper to hash phone numbers
 * @param {string} phone 
 * @returns {string} SHA-256 hash
 */
function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

const workers = [
  {
    name: "Ravi",
    type: "Full-time",
    city: "Bangalore",
    workerHash: hashPhone("9876543210"),
    zone: "560034",
    platforms: ["zomato", "swiggy"],
    weeklyEarningsHistory: [10200, 9800, 11000, 10500, 9200, 10800, 11200, 9900, 10100, 10600, 9700, 10300],
    baselineCompletions: 4.2,
    baseLat: 12.9352,
    baseLng: 77.6245
  },
  {
    name: "Priya",
    type: "Regular",
    city: "Mumbai",
    workerHash: hashPhone("8765432109"),
    zone: "400053",
    platforms: ["swiggy"],
    weeklyEarningsHistory: [5800, 6200, 5500, 6100, 5900, 6300, 5700, 6000, 5600, 6400, 5800, 6100],
    baselineCompletions: 2.8,
    baseLat: 19.1363,
    baseLng: 72.8277
  },
  {
    name: "Arjun",
    type: "Casual",
    city: "Delhi",
    workerHash: hashPhone("7654321098"),
    zone: "110001",
    platforms: ["zomato"],
    weeklyEarningsHistory: [1800, 2200, 1500, 2100, 1900, 2300, 1700, 2000, 1600, 2400, 1800, 2100],
    baselineCompletions: 1.5,
    baseLat: 28.6304,
    baseLng: 77.2177
  }
];

module.exports = { workers, hashPhone };
