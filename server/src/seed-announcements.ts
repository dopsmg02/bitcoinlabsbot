import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding announcements...');

    await prisma.announcement.createMany({
        data: [
            { text: 'Welcome to Bitcoin Labs! Start your investment journey now.' },
            { text: 'Global Leaderboard is LIVE! Check your rank in the new TOP tab.' },
            { text: 'Withdrawals are processed within 24-48 hours. Ensure your wallet address is correct.' }
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
