import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding announcements...');

    await prisma.announcement.createMany({
        data: [
            { text: 'Welcome to Max Miner! Start mining now to earn $MAX tokens.', type: 'INFO' },
            { text: 'Global Leaderboard is LIVE! Check your rank in the new TOP tab.', type: 'EVENT' },
            { text: 'Withdrawals are processed within 24-48 hours. Ensure your BSC address is correct.', type: 'WARNING' }
        ]
    });

    console.log('Seeding complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
