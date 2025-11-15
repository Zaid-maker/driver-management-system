import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  maxDrivers: number;
  features: {
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customReports: boolean;
    prioritySupport: boolean;
    unlimitedDrivers: boolean;
    customIntegrations: boolean;
    dedicatedSupport: boolean;
    slaGuarantee: boolean;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      required: true,
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'expired'],
      required: true,
      default: 'trialing',
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    trialEnd: {
      type: Date,
    },
    maxDrivers: {
      type: Number,
      required: true,
    },
    features: {
      advancedAnalytics: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      customReports: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      unlimitedDrivers: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      dedicatedSupport: { type: Boolean, default: false },
      slaGuarantee: { type: Boolean, default: false },
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePriceId: String,
    paymentMethod: String,
  },
  {
    timestamps: true,
  }
);

// Method to check if subscription is active
SubscriptionSchema.methods.isActive = function () {
  return this.status === 'active' || this.status === 'trialing';
};

// Method to check if user can add more drivers
SubscriptionSchema.methods.canAddDriver = async function () {
  if (this.features.unlimitedDrivers) return true;
  
  const Driver = mongoose.model('Driver');
  const driverCount = await Driver.countDocuments({ userId: this.user });
  
  return driverCount < this.maxDrivers;
};

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
