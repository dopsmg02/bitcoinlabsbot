import { Router } from 'express';
import { authenticateTelegram } from '../controllers/auth.controller';

const router = Router();

router.post('/telegram', authenticateTelegram);

export default router;
