import express from 'express';
import {
  getSubscription,
  getPlans,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  checkLimits,
  getUsageStats,
} from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current subscription
router.get('/subscription', getSubscription);

// Get available plans
router.get('/plans', getPlans);

// Create/update subscription
router.post('/subscription', createSubscription);

// Update subscription plan
router.patch('/subscription', updateSubscription);

// Cancel subscription
router.post('/subscription/cancel', cancelSubscription);

// Resume subscription
router.post('/subscription/resume', resumeSubscription);

// Check subscription limits
router.get('/subscription/limits', checkLimits);

// Get usage statistics
router.get('/subscription/usage', getUsageStats);

export default router;
