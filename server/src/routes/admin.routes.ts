import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../middlewares/admin.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticateJWT);

// Standard Admin Routes
router.get('/stats', requireAdmin, adminController.getDashboardStats);
router.get('/users', requireAdmin, adminController.getUsers);
router.post('/users/:id/adjust', requireAdmin, adminController.adjustUserBalance);
router.post('/users/:id/level', requireAdmin, adminController.setUserLevel);
router.post('/users/:id/ban', requireAdmin, adminController.toggleShadowBan);

// Super Admin Only Routes
router.post('/users/:id/role', requireSuperAdmin, adminController.setAdminRole);
router.get('/config', requireSuperAdmin, adminController.getSystemConfig);
router.post('/config', requireSuperAdmin, adminController.updateSystemConfig);

export default router;
