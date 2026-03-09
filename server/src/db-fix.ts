import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Create NewsType enum if it doesn't exist
        try {
            await prisma.$executeRawUnsafe(`CREATE TYPE "NewsType" AS ENUM ('INFO', 'WARNING', 'EVENT');`);
            console.log('Success: NewsType enum created.');
        } catch (e: any) {
            if (e.message.includes('already exists')) {
                console.log('NewsType enum already exists.');
            } else {
                throw e;
            }
        }

        // 2. Add weeklyMiningCount to User
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyMiningCount" INTEGER DEFAULT 0;`);
        console.log('Success: weeklyMiningCount column verified.');

        // 3. Ensure Announcement table exists with correct types
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Announcement";`); // Drop to be sure about schema
        await prisma.$executeRawUnsafe(`
            CREATE TABLE "Announcement" (
                "id" TEXT NOT NULL,
                "text" TEXT NOT NULL,
                "type" "NewsType" NOT NULL DEFAULT 'INFO',
                "active" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('Success: Announcement table created with NewsType enum.');

    } catch (error) {
        console.error('Error executing raw SQL:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
