import { Router } from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement } from '../controllers/announcement.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', authenticateJWT, requireAdmin, createAnnouncement);
router.patch('/:id', authenticateJWT, requireAdmin, updateAnnouncement);

export default router;
