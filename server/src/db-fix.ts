import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to add weeklyMiningCount column manually...');
    try {
        // 1. Check if column exists (optional but safer)
        // 2. Add column
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyMiningCount" INTEGER DEFAULT 0;`);
        console.log('Success: Column added or already exists.');

        // Also ensure Announcement table exists if previous push failed
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Announcement" (
        "id" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'INFO',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
      );
    `);
        console.log('Success: Announcement table verified.');

    } catch (error) {
        console.error('Error executing raw SQL:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
