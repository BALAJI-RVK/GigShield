const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Helper to hash phone numbers
function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

async function main() {
  console.log(`[Seed] Starting database seed...`);

  // Define the 3 mock workers from the Master Context
  const workersData = [
    {
      workerHash: hashPhone("9876543210"), // Ravi
      platforms: ["zomato", "swiggy"],
      zone: "560034",
      city: "Bangalore",
      weeklyEarningsHistory: [10200, 9800, 11000, 10500, 9200, 10800, 11200, 9900, 10100, 10600, 9700, 10300],
      currentWeeklyPremium: 78.19, // Pre-calculated for Phase 1
      zoneRiskScore: 1.0,
      seasonalMultiplier: 1.0,
      isActive: true
    },
    {
      workerHash: hashPhone("8765432109"), // Priya
      platforms: ["swiggy"],
      zone: "400053",
      city: "Mumbai",
      weeklyEarningsHistory: [5800, 6200, 5500, 6100, 5900, 6300, 5700, 6000, 5600, 6400, 5800, 6100],
      currentWeeklyPremium: 45.06,
      zoneRiskScore: 1.0,
      seasonalMultiplier: 1.0,
      isActive: true
    },
    {
      workerHash: hashPhone("7654321098"), // Arjun
      platforms: ["zomato"],
      zone: "110001",
      city: "Delhi",
      weeklyEarningsHistory: [1800, 2200, 1500, 2100, 1900, 2300, 1700, 2000, 1600, 2400, 1800, 2100],
      currentWeeklyPremium: 15.06,
      zoneRiskScore: 1.0,
      seasonalMultiplier: 1.0,
      isActive: true
    }
  ];

  // Insert workers one by one
  for (const worker of workersData) {
    // upsert ensures we don't duplicate them if you run seed twice
    const result = await prisma.worker.upsert({
      where: { workerHash: worker.workerHash },
      update: {},
      create: worker,
    });
    console.log(`[Seed] Seeded worker for zone: ${result.zone}`);
  }

  console.log(`[Seed] Database seeding complete.`);
}

main()
  .catch((e) => {
    console.error(`[Seed Error]`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
