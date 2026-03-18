const crypto = require('crypto');

/**
 * Helper to hash phone numbers identically to the seed script
 * @param {string} phone 
 * @returns {string} SHA-256 hash
 */
function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

// Our 3 mock workers with baseline data
const workers = [
  {
    name: "Ravi",
    type: "Full-time",
    city: "Bangalore",
    workerHash: hashPhone("9876543210"),
    zone: "560034",
    platforms: ["zomato", "swiggy"],
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
    baselineCompletions: 1.5,
    baseLat: 28.6304,
    baseLng: 77.2177
  }
];

module.exports = { workers, hashPhone };
