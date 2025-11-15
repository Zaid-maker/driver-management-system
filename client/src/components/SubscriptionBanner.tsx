import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverApi } from '../services/api';

interface SubscriptionLimits {
  plan: string;
  status: string;
  currentDrivers: number;
  maxDrivers: string | number;
  canAddDriver: boolean;
  features: Record<string, boolean>;
}

export default function SubscriptionBanner() {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await driverApi.getSubscriptionLimits();
      setLimits(response.data);
    } catch (error) {
      console.error('Error fetching subscription limits:', error);
    }
  };

  if (!limits) return null;

  const usagePercent =
    typeof limits.maxDrivers === 'number'
      ? Math.round((limits.currentDrivers / limits.maxDrivers) * 100)
      : 0;

  const isNearLimit = usagePercent >= 80;
  const isTrialing = limits.status === 'trialing';

  if (!isNearLimit && !isTrialing) return null;

  return (
    <div
      className={`mb-6 rounded-lg p-4 ${
        isTrialing
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <svg
            className={`h-6 w-6 mt-0.5 ${
              isTrialing
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isTrialing ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            )}
          </svg>
          <div className="flex-1">
            {isTrialing ? (
              <>
                <h3
                  className={`text-sm font-semibold ${
                    isTrialing
                      ? 'text-blue-900 dark:text-blue-300'
                      : 'text-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  Trial Period Active
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  You're currently on a free trial of the {limits.plan} plan. Upgrade to continue after your trial ends.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                  Driver Limit Warning
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  You're using {limits.currentDrivers} of {limits.maxDrivers} drivers ({usagePercent}%). 
                  {!limits.canAddDriver && ' You cannot add more drivers until you upgrade your plan.'}
                </p>
              </>
            )}
          </div>
        </div>
        <Link
          to="/dashboard/pricing"
          className={`ml-4 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isTrialing
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              : 'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'
          }`}
        >
          {isTrialing ? 'View Plans' : 'Upgrade Now'}
        </Link>
      </div>
    </div>
  );
}
