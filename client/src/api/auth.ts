import api from './axios';
import type { User } from '../types';

export interface AuthData {
  accessToken: string;
  user: User;
}

export interface SessionItem {
  _id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    api.post<{ success: boolean; data: AuthData }>('/auth/signup', { name, email, password }),

  signin: (email: string, password: string) =>
    api.post<{ success: boolean; data: AuthData }>('/auth/signin', { email, password }),

  /** Refresh access token — sends HttpOnly refreshToken cookie automatically */
  refresh: () =>
    api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/refresh'),

  /** Logout — clears the HttpOnly refresh token cookie on the server */
  logout: () =>
    api.post<{ success: boolean }>('/auth/logout'),

  getMe: () =>
    api.get<{ success: boolean; data: User }>('/auth/me'),

  updateMe: (data: Partial<User>) =>
    api.patch<{ success: boolean; data: User }>('/auth/me', data),

  /** Get all active sessions for the current user */
  getSessions: () =>
    api.get<{ success: boolean; data: SessionItem[] }>('/auth/sessions'),

  /** Revoke a specific session by ID */
  revokeSession: (sessionId: string) =>
    api.delete<{ success: boolean }>(`/auth/sessions/${sessionId}`),

  /** Logout from all devices */
  logoutAll: () =>
    api.post<{ success: boolean }>('/auth/logout-all'),
};
