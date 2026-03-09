import { Router } from 'express';
import { getPlans, investInPlan, getMyInvestments, luckySpin, requestWithdrawal } from '../controllers/investment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/plans', authenticateJWT, getPlans);
router.post('/invest', authenticateJWT, investInPlan);
router.get('/my-investments', authenticateJWT, getMyInvestments);
router.post('/lucky-spin', authenticateJWT, luckySpin);
router.post('/withdraw', authenticateJWT, requestWithdrawal);

export default router;
