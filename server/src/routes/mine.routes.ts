import { Router } from 'express';
import { syncProgress } from '../controllers/mine.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/sync', authenticateJWT, syncProgress);

export default router;
