/**
 * Bitcoin Labs Loyalty Tier Logic
 * Determines starting bonus based on Telegram ID age and Premium status.
 * Values are in USDT ($).
 */
export interface LoyaltyTierResult {
    level: number;
    welcomeBonus: number;
    tierName: string;
}

export const calculateLoyaltyTier = (tgId: string, isPremium: boolean): LoyaltyTierResult => {
    let level = 1;
    let welcomeBonus = 0.50; // Base bonus
    let tierName = 'Standard';

    const idLength = tgId.length;
    const prefix = parseInt(tgId[0], 10) || 7;

    if (idLength <= 9) {
        // Old account
        level = 4;
        welcomeBonus = 5.00;
        tierName = 'Platinum';
    } else if (idLength === 10) {
        if (prefix >= 1 && prefix <= 3) {
            level = 3;
            welcomeBonus = 2.50;
            tierName = 'Gold';
        } else if (prefix >= 4 && prefix <= 6) {
            level = 2;
            welcomeBonus = 1.00;
            tierName = 'Silver';
        } else {
            level = 1;
            welcomeBonus = 0.50;
            tierName = 'Bronze';
        }
    } else {
        // New Account
        level = 1;
        welcomeBonus = 0.25;
        tierName = 'Starter';
    }

    // Premium Boost
    if (isPremium) {
        level = Math.min(level + 1, 4);
        welcomeBonus += 1.00;
        tierName += ' (VIP)';
    }

    return { level, welcomeBonus, tierName };
};
