import type { Request, Response, NextFunction } from 'express';
import { Subscription } from '../models/subscription.model.js';
import { Driver } from '../models/driver.model.js';
import { PLANS } from '../config/plans.js';

// Middleware to check if subscription is active
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    let subscription = await Subscription.findOne({ user: userId });

    // Auto-create a trial subscription if none exists
    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + (PLANS['starter']?.trialDays || 14));

      subscription = await Subscription.create({
        user: userId,
        plan: 'starter',
        status: 'trialing',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialEnd,
        maxDrivers: PLANS['starter']?.features.maxDrivers ?? 25,
        features: PLANS['starter']?.features ?? {
          maxDrivers: 25,
          advancedAnalytics: false,
          apiAccess: false,
          customReports: false,
          prioritySupport: false,
          unlimitedDrivers: false,
          customIntegrations: false,
          dedicatedSupport: false,
          slaGuarantee: false,
        },
      });
    }

    // Check if subscription is active or in trial
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return res.status(403).json({
        message: 'Your subscription is not active. Please update your payment method.',
        code: 'SUBSCRIPTION_INACTIVE',
        status: subscription.status,
      });
    }

    // Check if subscription has expired
    if (new Date() > subscription.currentPeriodEnd) {
      subscription.status = 'expired';
      await subscription.save();

      return res.status(403).json({
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
      });
    }

    // Attach subscription to request for use in controllers
    req.subscription = subscription;
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Middleware to check driver limit before creating
export const checkDriverLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(403).json({
        message: 'No subscription found',
        code: 'NO_SUBSCRIPTION',
      });
    }

    // Skip check if unlimited drivers
    if (subscription.features.unlimitedDrivers) {
      return next();
    }

    const driverCount = await Driver.countDocuments({ userId });

    if (driverCount >= subscription.maxDrivers) {
      return res.status(403).json({
        message: `Driver limit reached. Your ${subscription.plan} plan allows ${subscription.maxDrivers} drivers. Upgrade to add more.`,
        code: 'DRIVER_LIMIT_REACHED',
        currentCount: driverCount,
        maxDrivers: subscription.maxDrivers,
        plan: subscription.plan,
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Middleware to check feature access
export const requireFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const subscription = await Subscription.findOne({ user: userId });

      if (!subscription) {
        return res.status(403).json({
          message: 'No subscription found',
          code: 'NO_SUBSCRIPTION',
        });
      }

      // Check if feature is enabled for this plan
      const featureEnabled = subscription.features[featureName as keyof typeof subscription.features];

      if (!featureEnabled) {
        return res.status(403).json({
          message: `This feature requires a higher plan. Your current plan is ${subscription.plan}.`,
          code: 'FEATURE_NOT_AVAILABLE',
          feature: featureName,
          plan: subscription.plan,
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
};

// Add subscription to custom Request type
declare global {
  namespace Express {
    interface Request {
      subscription?: any;
    }
  }
}
