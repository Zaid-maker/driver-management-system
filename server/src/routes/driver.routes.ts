import { Router } from 'express';
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats,
  getAnalytics,
  getRecentActivities
} from '../controllers/driver.controller.js';
import { validateDriver, validateDriverUpdate } from '../middleware/validation.js';
import { protect, restrictTo, restrictToOwnResource } from '../middleware/auth.js';

const router = Router();

// Protect all routes (require authentication)
router.use(protect);

// Statistics route (admin only)
router.get('/stats', restrictTo('admin'), getDriverStats);

// Analytics route (admin only)
router.get('/analytics', restrictTo('admin'), getAnalytics);

// Recent activities route (admin only)
router.get('/activities', restrictTo('admin'), getRecentActivities);

// Get all drivers (admin only)
router.get('/', restrictTo('admin'), getAllDrivers);

// Get driver by ID (admin can view any, driver can view own)
router.get('/:id', restrictToOwnResource, getDriverById);

// Create driver (admin only)
router.post('/', restrictTo('admin'), validateDriver, createDriver);

// Update driver (admin can update any, driver can update own)
router.put('/:id', restrictToOwnResource, validateDriverUpdate, updateDriver);

// Delete driver (admin only)
router.delete('/:id', restrictTo('admin'), deleteDriver);

export default router;
