# SaaS Pricing System Documentation

## Overview

The Driver Management System now includes a complete SaaS pricing and subscription management system with three tiers: **Starter**, **Professional**, and **Enterprise**.

## Plans & Pricing

### Starter Plan - $29/month
- Up to 25 drivers
- Email support
- Mobile access
- License tracking
- Calendar view
- 14-day free trial

### Professional Plan - $79/month (Most Popular)
- Up to 100 drivers
- Advanced analytics ✨
- API access ✨
- Custom reports ✨
- Priority support ✨
- All Starter features
- 14-day free trial

### Enterprise Plan - $299/month
- Unlimited drivers ✨
- Custom integrations ✨
- Dedicated support ✨
- SLA guarantee ✨
- All Professional features
- 30-day free trial

## Features

### Backend (Server)

#### Models
- **`Subscription Model`** (`server/src/models/subscription.model.ts`)
  - Tracks user subscriptions
  - Stores plan details, status, and billing periods
  - Includes methods for checking active status and driver limits
  
#### Configuration
- **`Plans Config`** (`server/src/config/plans.ts`)
  - Centralized plan definitions
  - Feature flags for each tier
  - Pricing and trial period configuration

#### Controllers
- **`Subscription Controller`** (`server/src/controllers/subscription.controller.ts`)
  - `getSubscription` - Get current user's subscription
  - `getPlans` - List all available plans
  - `createSubscription` - Create or activate subscription
  - `updateSubscription` - Upgrade/downgrade plan
  - `cancelSubscription` - Cancel at period end
  - `resumeSubscription` - Resume canceled subscription
  - `checkLimits` - Check driver limits
  - `getUsageStats` - Get detailed usage statistics

#### Middleware
- **`Subscription Middleware`** (`server/src/middleware/subscription.middleware.ts`)
  - `requireActiveSubscription` - Ensures valid subscription
  - `checkDriverLimit` - Enforces driver count limits
  - `requireFeature` - Checks feature access by plan

#### Routes
- **`Subscription Routes`** (`server/src/routes/subscription.routes.ts`)
  - `GET /api/subscription` - Current subscription
  - `GET /api/plans` - Available plans
  - `POST /api/subscription` - Create subscription
  - `PATCH /api/subscription` - Update plan
  - `POST /api/subscription/cancel` - Cancel subscription
  - `POST /api/subscription/resume` - Resume subscription
  - `GET /api/subscription/limits` - Check limits
  - `GET /api/subscription/usage` - Usage statistics

### Frontend (Client)

#### Pages
- **`Pricing`** (`client/src/pages/Pricing.tsx`)
  - Display all plans
  - Plan comparison
  - Upgrade/downgrade functionality
  - Current plan indicator

- **`Subscription Dashboard`** (`client/src/pages/SubscriptionDashboard.tsx`)
  - Subscription status overview
  - Driver usage statistics with progress bars
  - Feature access list
  - Billing period information
  - Upgrade CTAs

#### Components
- **`SubscriptionBanner`** (`client/src/components/SubscriptionBanner.tsx`)
  - Shows trial status
  - Warns when approaching driver limit
  - Displays upgrade prompts

#### Navigation
- Added "Plan" link in main navigation
- Mobile menu includes subscription access
- Landing page pricing section links to `/pricing`

## API Endpoints

### Public Endpoints
None - all subscription endpoints require authentication

### Protected Endpoints

#### Get Current Subscription
```
GET /api/subscription
Authorization: Bearer <token>

Response:
{
  "user": "user_id",
  "plan": "professional",
  "status": "active",
  "currentPeriodStart": "2025-01-01T00:00:00.000Z",
  "currentPeriodEnd": "2025-02-01T00:00:00.000Z",
  "maxDrivers": 100,
  "features": {
    "advancedAnalytics": true,
    "apiAccess": true,
    ...
  }
}
```

#### Update Subscription
```
PATCH /api/subscription
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "plan": "enterprise"
}

Response: Updated subscription object
```

#### Check Limits
```
GET /api/subscription/limits
Authorization: Bearer <token>

Response:
{
  "plan": "starter",
  "status": "active",
  "currentDrivers": 20,
  "maxDrivers": 25,
  "canAddDriver": true,
  "features": { ... }
}
```

#### Get Usage Statistics
```
GET /api/subscription/usage
Authorization: Bearer <token>

Response:
{
  "subscription": {
    "plan": "professional",
    "status": "active",
    "daysRemaining": 25
  },
  "usage": {
    "totalDrivers": 45,
    "activeDrivers": 38,
    "inactiveDrivers": 5,
    "pendingDrivers": 2,
    "maxDrivers": 100,
    "usagePercentage": 45
  },
  "features": { ... }
}
```

## Subscription Enforcement

### Driver Limit Enforcement
- Applied to `POST /api/drivers` endpoint
- Checked before creating new driver
- Returns error if limit reached with upgrade prompt

### Feature Access Control
- Middleware checks plan features
- Can be applied to any route: `requireFeature('advancedAnalytics')`
- Returns 403 with upgrade message if feature not available

### Subscription Status Validation
- All driver routes require active subscription
- Trial period allowed
- Expired subscriptions blocked with renewal prompt

## Error Responses

### No Subscription
```json
{
  "message": "No active subscription found",
  "code": "NO_SUBSCRIPTION"
}
```

### Driver Limit Reached
```json
{
  "message": "Driver limit reached. Your starter plan allows 25 drivers. Upgrade to add more.",
  "code": "DRIVER_LIMIT_REACHED",
  "currentCount": 25,
  "maxDrivers": 25,
  "plan": "starter"
}
```

### Feature Not Available
```json
{
  "message": "This feature requires a higher plan. Your current plan is starter.",
  "code": "FEATURE_NOT_AVAILABLE",
  "feature": "advancedAnalytics",
  "plan": "starter"
}
```

### Subscription Expired
```json
{
  "message": "Your subscription has expired. Please renew to continue.",
  "code": "SUBSCRIPTION_EXPIRED"
}
```

## Trial Period

- **New users** automatically get a trial subscription
- **Starter**: 14 days
- **Professional**: 14 days  
- **Enterprise**: 30 days
- Status set to `trialing` during trial
- Full access to plan features during trial
- Banner shown in dashboard during trial

## Upgrade/Downgrade Flow

### Upgrade
1. User selects higher-tier plan
2. Driver limit and features immediately updated
3. Prorated billing applies (mock - implement with Stripe)
4. No driver data lost

### Downgrade
1. System checks current driver count
2. If exceeds new limit, prevents downgrade with message
3. User must delete drivers first
4. Once under limit, downgrade allowed
5. Takes effect at end of billing period

## Integration Points

### Stripe Integration (Future)
The system is designed for Stripe integration:

1. Add environment variables:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

2. Install Stripe SDK:
```bash
bun add stripe
```

3. Implement webhook handler for:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

4. Update controller to create Stripe sessions
5. Store `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`

## UI Features

### Pricing Page
- Comparison of all three plans
- Feature lists with checkmarks
- "Most Popular" badge on Professional
- "Current Plan" indicator
- Immediate plan switching
- FAQ section

### Subscription Dashboard
- Current plan status card
- Days remaining indicator
- Driver usage with progress bar
- Color-coded usage warnings (green < 60%, yellow < 80%, red ≥ 80%)
- Active/pending/inactive driver breakdown
- Feature access checklist
- Upgrade CTA for non-enterprise users

### Dashboard Banner
- Shows during trial period
- Warns when approaching driver limit (≥ 80%)
- Blocks driver creation when limit reached
- Links to pricing page

## Testing the System

### 1. Create Admin Account
```bash
cd server
npm run seed:admin
```

### 2. Login
- Email: admin@drivermanagement.com
- Password: admin123

### 3. Check Subscription
- Navigate to "Plan" in navigation
- Should see trial subscription

### 4. Test Driver Limits
- Add drivers until limit reached
- Try to add one more - should see error
- Upgrade plan
- Can now add more drivers

### 5. Test Plan Changes
- Start with Starter (25 drivers)
- Upgrade to Professional (100 drivers)
- Try downgrade - should warn if over limit

## Future Enhancements

### Payment Processing
- [ ] Stripe Checkout integration
- [ ] Webhook handlers for subscription events
- [ ] Invoice generation
- [ ] Payment method management

### Features
- [ ] Annual billing option (discount)
- [ ] Custom enterprise pricing
- [ ] Add-ons (extra drivers, storage, etc.)
- [ ] Usage-based billing
- [ ] Multi-seat management

### Analytics
- [ ] Revenue tracking
- [ ] Churn analysis
- [ ] Upgrade/downgrade patterns
- [ ] Trial conversion rates

### User Experience
- [ ] Email notifications for trial expiry
- [ ] Dunning management
- [ ] Grace period after payment failure
- [ ] Subscription pause option

## Database Schema

```typescript
Subscription {
  user: ObjectId (ref: User) - unique
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: Boolean
  trialEnd?: Date
  maxDrivers: Number
  features: {
    advancedAnalytics: Boolean
    apiAccess: Boolean
    customReports: Boolean
    prioritySupport: Boolean
    unlimitedDrivers: Boolean
    customIntegrations: Boolean
    dedicatedSupport: Boolean
    slaGuarantee: Boolean
  }
  stripeCustomerId?: String
  stripeSubscriptionId?: String
  stripePriceId?: String
  timestamps: true
}
```

## Security Considerations

1. **Subscription validation** on every request to driver endpoints
2. **Feature checks** before allowing access to premium features
3. **Driver limits** enforced at database and API level
4. **Status checks** prevent expired subscriptions from accessing system
5. **User-subscription relationship** is one-to-one
6. **Plan data** stored in config, not modifiable by users

## Support & Troubleshooting

### User Can't Add Drivers
1. Check subscription status: `GET /api/subscription`
2. Verify driver count: `GET /api/subscription/limits`
3. Check if at limit: compare `currentDrivers` vs `maxDrivers`
4. Prompt to upgrade if at limit

### Subscription Not Found
1. Check if user authenticated
2. Verify MongoDB connection
3. Check if subscription auto-created on first access
4. Manually create via POST if needed

### Feature Not Working
1. Check plan features: `GET /api/subscription`
2. Verify middleware applied to route
3. Check feature flag name matches
4. Ensure subscription is active

---

**Questions?** Check the code comments or contact support.
