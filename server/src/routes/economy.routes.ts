import { Router } from 'express';
import { convertGoldToMax, requestWithdrawal, upgradeMiner } from '../controllers/economy.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/convert', authenticateJWT, convertGoldToMax);
router.post('/withdraw', authenticateJWT, requestWithdrawal);
router.post('/upgrade', authenticateJWT, upgradeMiner);

export default router;
