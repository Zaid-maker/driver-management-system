import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export interface Driver {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseClass: string;
  status: 'active' | 'inactive' | 'pending';
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  expiredLicenses: number;
}

export interface MonthlyRegistration {
  month: string;
  drivers: number;
}

export interface LicenseClassCount {
  class: string;
  count: number;
}

export interface ExpirationTimeline {
  month: string;
  expiring: number;
}

export interface RecentActivity {
  type: 'created' | 'updated' | 'expiring' | 'deactivated';
  driverName: string;
  timestamp: string;
  status: string;
  licenseExpiry?: string;
}

export interface AnalyticsData {
  monthlyRegistrations: MonthlyRegistration[];
  licenseClassDistribution: LicenseClassCount[];
  expirationTimeline: ExpirationTimeline[];
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Driver API methods
export const driverApi = {
  // Subscription APIs
  getPlans: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/plans');
    return response.data;
  },

  getSubscription: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/subscription');
    return response.data;
  },

  updateSubscription: async (plan: string): Promise<ApiResponse<any>> => {
    const response = await api.patch('/subscription', { plan });
    return response.data;
  },

  getSubscriptionLimits: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/subscription/limits');
    return response.data;
  },

  getSubscriptionUsage: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/subscription/usage');
    return response.data;
  },
  // Get all drivers with optional filters
  getAllDrivers: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginationResponse<Driver>> => {
    const response = await api.get('/drivers', { params });
    return response.data;
  },

  // Get driver by ID
  getDriverById: async (id: string): Promise<ApiResponse<Driver>> => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  // Create new driver
  createDriver: async (driver: Omit<Driver, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Driver>> => {
    const response = await api.post('/drivers', driver);
    return response.data;
  },

  // Update driver
  updateDriver: async (id: string, driver: Partial<Driver>): Promise<ApiResponse<Driver>> => {
    const response = await api.put(`/drivers/${id}`, driver);
    return response.data;
  },

  // Delete driver
  deleteDriver: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  // Get driver statistics
  getStats: async (): Promise<ApiResponse<DriverStats>> => {
    const response = await api.get('/drivers/stats');
    return response.data;
  },

  // Get analytics data for charts
  getAnalytics: async (): Promise<ApiResponse<AnalyticsData>> => {
    const response = await api.get('/drivers/analytics');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit?: number): Promise<ApiResponse<RecentActivity[]>> => {
    const response = await api.get('/drivers/activities', {
      params: { limit }
    });
    return response.data;
  },

  // Set auth token
  setAuthToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Authentication methods
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  registerAdmin: async (email: string, password: string, adminSecret: string): Promise<ApiResponse<{ token: string; user: any }>> => {
    const response = await api.post('/auth/register-admin', { email, password, adminSecret });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  createDriverAccount: async (driverId: string, email: string, password: string, sendCredentials?: boolean): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/create-driver-account', { driverId, email, password, sendCredentials });
    return response.data;
  },

  deactivateUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/auth/deactivate/${userId}`);
    return response.data;
  },

  activateUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/auth/activate/${userId}`);
    return response.data;
  },
};

export default api;
