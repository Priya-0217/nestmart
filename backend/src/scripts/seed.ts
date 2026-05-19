import { connectPrisma, disconnectPrisma, prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import bcrypt from "bcryptjs";

async function seed() {
  logger.info("Starting admin seed...");

  await connectPrisma();

  // Create Admin User
  const adminEmail = "admin@nestmart.com";
  const adminPassword = "admin123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: "admin",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      passwordHash: adminPasswordHash,
      role: "admin",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  logger.info(`Admin user ensured: ${adminEmail} / ${adminPassword}`);
  logger.info("Admin seed completed successfully!");
}

seed()
  .catch((err) => {
    logger.error({ err }, "Seed failed");
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
