export interface PlanFeatures {
  maxDrivers: number;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  customReports: boolean;
  prioritySupport: boolean;
  unlimitedDrivers: boolean;
  customIntegrations: boolean;
  dedicatedSupport: boolean;
  slaGuarantee: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
  features: PlanFeatures;
  description: string;
  trialDays: number;
}

export const PLANS: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    trialDays: 14,
    description: 'Perfect for small fleets',
    features: {
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
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    trialDays: 14,
    description: 'For growing businesses',
    features: {
      maxDrivers: 100,
      advancedAnalytics: true,
      apiAccess: true,
      customReports: true,
      prioritySupport: true,
      unlimitedDrivers: false,
      customIntegrations: false,
      dedicatedSupport: false,
      slaGuarantee: false,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    trialDays: 30,
    description: 'For large organizations',
    features: {
      maxDrivers: 0, // Will be set as unlimited
      advancedAnalytics: true,
      apiAccess: true,
      customReports: true,
      prioritySupport: true,
      unlimitedDrivers: true,
      customIntegrations: true,
      dedicatedSupport: true,
      slaGuarantee: true,
    },
  },
};

export function getPlanFeatures(planId: string): PlanFeatures {
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan ID');
  }
  return plan.features;
}

export function getPlanPrice(planId: string): number {
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan ID');
  }
  return plan.price;
}
