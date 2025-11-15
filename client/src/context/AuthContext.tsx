import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { driverApi } from '../services/api';

interface User {
  _id: string;
  email: string;
  role: 'admin' | 'driver';
  driver?: any;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Set token in axios defaults
      driverApi.setAuthToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await driverApi.login(email, password);
      const { token: newToken, user: newUser } = response.data;

      // Save to state
      setToken(newToken);
      setUser(newUser);

      // Calculate token expiry (30 days from now)
      const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);

      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      // Set token in axios defaults
      driverApi.setAuthToken(newToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    driverApi.setAuthToken(null);
  };

  const refreshUser = async () => {
    try {
      if (token) {
        const response = await driverApi.getMe();
        const updatedUser = response.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  // Check token expiry on mount and periodically
  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem('tokenExpiry');
      if (expiry && new Date().getTime() > parseInt(expiry)) {
        logout();
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
