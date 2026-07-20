import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessTokenState(token);
    setAccessToken(token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await authApi.refresh();
      if (res.data?.success && res.data?.data) {
        login(res.data.data.user, res.data.data.accessToken);
      }
    } catch {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
    });

    checkAuth();
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
