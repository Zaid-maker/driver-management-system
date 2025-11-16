import type { Request, Response } from 'express';
import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { Driver } from '../models/driver.model.js';
import { PLANS, getPlanFeatures } from '../config/plans.js';

// Get current user's subscription
export const getSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      // Create a trial subscription if none exists
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

      subscription = await Subscription.create({
        user: userId,
        plan: 'starter',
        status: 'trialing',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEnd,
        trialEnd: trialEnd,
        maxDrivers: 25,
        features: PLANS['starter']?.features || {
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

    res.set('Cache-Control', 'private, max-age=30');
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available plans
export const getPlans = async (req: Request, res: Response) => {
  try {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.json(Object.values(PLANS));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update subscription
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const selectedPlan = PLANS[plan];
    const currentDate = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    let subscription = await Subscription.findOne({ user: userId });

    if (subscription) {
      // Update existing subscription
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.currentPeriodStart = currentDate;
      subscription.currentPeriodEnd = periodEnd;
      subscription.maxDrivers = selectedPlan.features.maxDrivers;
      subscription.features = selectedPlan.features;
      subscription.cancelAtPeriodEnd = false;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        user: userId,
        plan,
        status: 'active',
        currentPeriodStart: currentDate,
        currentPeriodEnd: periodEnd,
        maxDrivers: selectedPlan.features.maxDrivers,
        features: selectedPlan.features,
      });
    }

    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update subscription plan
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const selectedPlan = PLANS[plan];

    // Check if downgrading and would exceed driver limit
    if (
      !selectedPlan.features.unlimitedDrivers &&
      selectedPlan.features.maxDrivers < subscription.maxDrivers
    ) {
      const driverCount = await Driver.countDocuments({ userId });
      if (driverCount > selectedPlan.features.maxDrivers) {
        return res.status(400).json({
          message: `Cannot downgrade to ${selectedPlan.name} plan. You have ${driverCount} drivers but this plan only allows ${selectedPlan.features.maxDrivers}. Please remove ${driverCount - selectedPlan.features.maxDrivers} driver(s) first.`,
        });
      }
    }

    subscription.plan = plan;
    subscription.maxDrivers = selectedPlan.features.maxDrivers;
    subscription.features = selectedPlan.features;
    await subscription.save();

    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      message: 'Subscription will be canceled at the end of the billing period',
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Resume subscription
export const resumeSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.cancelAtPeriodEnd = false;
    if (subscription.status === 'canceled' || subscription.status === 'expired') {
      subscription.status = 'active';
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      subscription.currentPeriodEnd = periodEnd;
    }
    await subscription.save();

    res.json({
      message: 'Subscription resumed successfully',
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Check subscription limits
export const checkLimits = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    let subscription = await Subscription.findOne({ user: userId });

    // Auto-create a trial subscription if none exists (for first-time banner checks)
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

    const driverCount = await Driver.countDocuments({ userId });
    const canAddDriver = subscription.features.unlimitedDrivers || driverCount < subscription.maxDrivers;

    res.set('Cache-Control', 'private, max-age=30');
    res.json({
      plan: subscription.plan,
      status: subscription.status,
      currentDrivers: driverCount,
      maxDrivers: subscription.features.unlimitedDrivers ? 'Unlimited' : subscription.maxDrivers,
      canAddDriver,
      features: subscription.features,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscription usage stats
export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    let subscription = await Subscription.findOne({ user: userId });

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

    const driverCount = await Driver.countDocuments({ userId });
    const activeDriverCount = await Driver.countDocuments({ userId, status: 'active' });
    const inactiveDriverCount = await Driver.countDocuments({ userId, status: 'inactive' });
    const pendingDriverCount = await Driver.countDocuments({ userId, status: 'pending' });

    const daysRemaining = Math.ceil(
      (subscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    res.set('Cache-Control', 'private, max-age=15');
    res.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysRemaining,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      usage: {
        totalDrivers: driverCount,
        activeDrivers: activeDriverCount,
        inactiveDrivers: inactiveDriverCount,
        pendingDrivers: pendingDriverCount,
        maxDrivers: subscription.features.unlimitedDrivers ? 'Unlimited' : subscription.maxDrivers,
        usagePercentage: subscription.features.unlimitedDrivers
          ? 0
          : Math.round((driverCount / subscription.maxDrivers) * 100),
      },
      features: subscription.features,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
