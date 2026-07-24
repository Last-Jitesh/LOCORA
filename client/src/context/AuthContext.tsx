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

// ── Client-side isLoggedIn cookie (JS-readable, frontend domain) ──────────────
// The HttpOnly refreshToken lives on the backend domain and can't be read by JS.
// This cookie lives on the FRONTEND domain so we can synchronously check on load.
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

const setLoggedInCookie = () => {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `isLoggedIn=true; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
};

const clearLoggedInCookie = () => {
  document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
};

const getLoggedInCookie = () =>
  document.cookie.split('; ').some(c => c.startsWith('isLoggedIn=true'));

const buildRefreshBase = () =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  // Start in loading state only if the isLoggedIn cookie exists — otherwise we
  // know for sure the user is not logged in and can render immediately.
  const [isLoading, setIsLoading] = useState(() => getLoggedInCookie());
  const hasChecked = useRef(false);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessTokenState(token);
    setAccessToken(token);
    setLoggedInCookie(); // set on FRONTEND domain so JS can read it
  };

  const clearAuth = () => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
    clearLoggedInCookie(); // clear from frontend domain
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
      // Raw axios (no interceptors) so a 401 here doesn't fire the logout
      // callback and wipe state before we're done initialising.
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

    // Only hit the network if the cookie says there might be a session.
    if (!hasChecked.current && getLoggedInCookie()) {
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
