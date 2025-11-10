import { Router } from 'express';
import {
  login,
  registerAdmin,
  createDriverAccount,
  getMe,
  changePassword,
  deactivateUser,
  activateUser,
} from '../controllers/auth.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register-admin', registerAdmin); // Should be protected in production

// Protected routes (require authentication)
router.use(protect); // All routes after this require authentication

router.get('/me', getMe);
router.put('/change-password', changePassword);

// Admin only routes
router.post('/create-driver-account', restrictTo('admin'), createDriverAccount);
router.put('/deactivate/:userId', restrictTo('admin'), deactivateUser);
router.put('/activate/:userId', restrictTo('admin'), activateUser);

export default router;
