import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth';
import { setAccessToken, setLogoutCallback } from '../api/axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A plain axios instance with NO interceptors — used only for the initial
// silent refresh so the 401 interceptor in api/axios.ts doesn't trigger
// a logout callback before we even know if we're logged in.
const buildRefreshBase = () =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // prevent double-invocation of checkAuth in strict-mode
  const hasChecked = useRef(false);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessTokenState(token);
    setAccessToken(token);
  };

  const clearAuth = () => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      clearAuth();
    }
  };

  const checkAuth = async () => {
    try {
      // Use a raw axios call (no interceptors) so a 401 here doesn't
      // trigger the logout callback and wipe state before we're done initialising.
      const { data } = await axios.post(
        `${buildRefreshBase()}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      if (data?.success && data?.data) {
        login(data.data.user, data.data.accessToken);
      } else {
        clearAuth();
      }
    } catch {
      // Not authenticated — this is normal on first visit; just clear.
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLogoutCallback(clearAuth);

    if (!hasChecked.current) {
      hasChecked.current = true;
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
