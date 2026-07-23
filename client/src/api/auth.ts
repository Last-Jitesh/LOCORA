import api from './axios';
import type { User } from '../types';

export interface AuthData {
  accessToken: string;
  user: User;
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    api.post<{ success: boolean; data: AuthData }>('/auth/signup', { name, email, password }),

  signin: (email: string, password: string) =>
    api.post<{ success: boolean; data: AuthData }>('/auth/signin', { email, password }),

  /** Refresh access token — sends HttpOnly refreshToken cookie automatically */
  refresh: () =>
    api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/refresh'),

  /** Logout from current device — revokes the refreshToken cookie */
  logout: () =>
    api.post<{ success: boolean }>('/auth/logout'),

  /** Logout from all devices — revokes all refresh tokens for this user */
  logoutAll: () =>
    api.post<{ success: boolean }>('/auth/logout-all'),

  getMe: () =>
    api.get<{ success: boolean; data: User }>('/auth/me'),

  updateMe: (data: Partial<User>) =>
    api.patch<{ success: boolean; data: User }>('/auth/me', data),

  getSessions: () =>
    api.get<{ success: boolean; data: any[] }>('/auth/sessions'),

  revokeSession: (id: string) =>
    api.delete<{ success: boolean }>(`/auth/sessions/${id}`),
};
