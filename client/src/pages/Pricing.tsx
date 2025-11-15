import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverApi } from '../services/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  trialDays: number;
  features: {
    maxDrivers: number;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customReports: boolean;
    prioritySupport: boolean;
    unlimitedDrivers: boolean;
    customIntegrations: boolean;
    dedicatedSupport: boolean;
    slaGuarantee: boolean;
  };
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansData, subData] = await Promise.all([
        driverApi.getPlans(),
        driverApi.getSubscription(),
      ]);
      setPlans(plansData.data);
      setSubscription(subData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (subscription?.plan === planId) return;

    setProcessingPlan(planId);
    try {
      await driverApi.updateSubscription(planId);
      await fetchData();
      alert('Plan updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update plan');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getFeatureList = (features: Plan['features']) => {
    const featureList = [
      features.unlimitedDrivers
        ? 'Unlimited drivers'
        : `Up to ${features.maxDrivers} drivers`,
      features.advancedAnalytics && 'Advanced analytics',
      features.apiAccess && 'API access',
      features.customReports && 'Custom reports',
      features.prioritySupport ? 'Priority support' : 'Email support',
      features.customIntegrations && 'Custom integrations',
      features.dedicatedSupport && 'Dedicated support',
      features.slaGuarantee && 'SLA guarantee',
      'License tracking',
      'Calendar view',
      'Mobile access',
    ];

    return featureList.filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select the perfect plan for your fleet size
          </p>
          {subscription && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isPopular = plan.id === 'professional';

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 ${
                  isPopular
                    ? 'border-blue-600 dark:border-blue-400 transform scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                } ${isCurrentPlan ? 'ring-4 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Current
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2 mb-2">/month</span>
                    </div>
                    {plan.trialDays > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        {plan.trialDays}-day free trial
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {getFeatureList(plan.features).map((feature, i) => (
                      <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || processingPlan === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      isCurrentPlan
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                    } ${processingPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {processingPlan === plan.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      'Select Plan'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription Management */}
        {subscription && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Subscription Management
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={`px-2 py-1 rounded ${
                      subscription.status === 'active' || subscription.status === 'trialing'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Renews on:</span>{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-end space-x-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my driver limit?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You'll be prompted to upgrade to a higher plan before adding more drivers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All plans come with a free trial period. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
