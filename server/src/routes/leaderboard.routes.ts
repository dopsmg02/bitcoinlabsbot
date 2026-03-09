import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getLeaderboard);

export default router;
