import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverApi } from '../services/api';

interface UsageStats {
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    daysRemaining: number;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    totalDrivers: number;
    activeDrivers: number;
    inactiveDrivers: number;
    pendingDrivers: number;
    maxDrivers: string | number;
    usagePercentage: number;
  };
  features: Record<string, boolean>;
}

export default function SubscriptionDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await driverApi.getSubscriptionUsage();
      setStats(response as any);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load subscription data</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription & Usage
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your subscription status and usage limits
        </p>
      </div>

      {/* Subscription Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Plan</h3>
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {stats.subscription.plan}
          </p>
          <Link
            to="/dashboard/pricing"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
          >
            Change Plan →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</h3>
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-3xl font-bold capitalize ${
            stats.subscription.status === 'active' || stats.subscription.status === 'trialing'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {stats.subscription.status}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Remaining</h3>
            <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.subscription.daysRemaining}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Until {new Date(stats.subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Driver Usage</h3>
            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.usage.totalDrivers}
            <span className="text-lg text-gray-600 dark:text-gray-400">
              /{stats.usage.maxDrivers}
            </span>
          </p>
          {typeof stats.usage.maxDrivers === 'number' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    stats.usage.usagePercentage > 80
                      ? 'bg-red-600'
                      : stats.usage.usagePercentage > 60
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(stats.usage.usagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stats.usage.usagePercentage}% used
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Driver Breakdown</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.usage.activeDrivers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.usage.pendingDrivers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.usage.inactiveDrivers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.features).map(([key, enabled]) => (
            <div
              key={key}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                enabled
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <svg
                className={`h-5 w-5 ${
                  enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {enabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              <span className="text-sm text-gray-900 dark:text-white capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {stats.subscription.plan !== 'enterprise' && (
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready for more?</h3>
          <p className="text-blue-100 mb-6">
            Upgrade your plan to unlock additional features and increase your driver limit
          </p>
          <Link
            to="/dashboard/pricing"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
}
