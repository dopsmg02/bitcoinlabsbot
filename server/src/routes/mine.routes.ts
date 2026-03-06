import { Router } from 'express';
import { syncMining } from '../controllers/mine.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/sync', authenticateJWT, syncMining);

export default router;
