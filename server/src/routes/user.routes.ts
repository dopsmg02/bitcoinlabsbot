import { Router } from 'express';
import { getProfile, getReferrals, getTransactions } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);
router.get('/referrals', authenticateJWT, getReferrals);
router.get('/history', authenticateJWT, getTransactions);

export default router;
