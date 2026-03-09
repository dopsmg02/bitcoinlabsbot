import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Resetting weekly mining counts...');

    try {
        const result = await prisma.user.updateMany({
            data: {
                weeklyMiningCount: 0
            }
        });
        console.log(`Success: Reset ${result.count} users.`);
    } catch (error) {
        console.error('Error resetting counts:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
