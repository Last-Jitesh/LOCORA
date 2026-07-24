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

// Read a browser cookie by name (works because isLoggedIn is NOT httpOnly)
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const buildRefreshBase = () =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  // Start loading only if the isLoggedIn cookie exists — otherwise we KNOW
  // the user is logged out and can render immediately without a network round-trip.
  const [isLoading, setIsLoading] = useState(() => getCookie('isLoggedIn') === 'true');
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
      // Raw axios — no interceptors — so a 401 here doesn't fire the logout
      // callback and double-wipe state while we're still initialising.
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
      // No valid session — normal on first visit or after token expiry.
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLogoutCallback(clearAuth);

    // Only attempt the network refresh if the isLoggedIn cookie is present.
    // If it's absent the user is definitely not logged in — skip the request.
    if (!hasChecked.current && getCookie('isLoggedIn') === 'true') {
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
