/**
 * Telegram Loyalty Tier (TLT) Logic
 * Determis starting level and bonus gold based on Telegram ID age (length/prefix) and Premium status.
 */
export interface TLTResult {
    level: number;
    bonusGold: number;
    tierName: string;
}

export const calculateTLT = (tgId: string, isPremium: boolean): TLTResult => {
    let level = 1;
    let bonusGold = 0;
    let tierName = 'New Miner';

    const idLength = tgId.length;
    const prefix = parseInt(tgId[0], 10) || 7;

    if (idLength <= 9) {
        // ID 9 digit (akun sepuh)
        level = 4;
        bonusGold = 50000;
        tierName = 'Ancient Miner';
    } else if (idLength === 10) {
        if (prefix >= 1 && prefix <= 3) {
            // ID 10 digit kepala 1,2,3
            level = 3;
            bonusGold = 25000;
            tierName = 'Veteran Miner';
        } else if (prefix >= 4 && prefix <= 6) {
            // ID 10 digit kepala 4,5,6
            level = 2;
            bonusGold = 10000;
            tierName = 'Senior Miner';
        } else {
            // ID 10 digit kepala 7,8,9
            level = 1;
            bonusGold = 5000;
            tierName = 'Active Miner';
        }
    } else {
        // ID 11 Digit
        level = 1;
        bonusGold = 2000;
        tierName = 'Recruit Miner';
    }

    // Premium Boost
    if (isPremium) {
        level = Math.min(level + 1, 4);
        bonusGold += 10000;
        tierName += ' (VIP)';
    }

    return { level, bonusGold, tierName };
};
