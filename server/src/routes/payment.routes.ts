import { Router } from 'express';
import { createDeposit, handleWebhook } from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Create a new deposit request (Authenticated)
router.post('/create', authenticateJWT, createDeposit);

// Plisio Webhook (No Auth - handled via hash/verified signature)
router.post('/webhook', handleWebhook);

export default router;
