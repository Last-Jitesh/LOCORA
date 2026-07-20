import api from './axios';
import type { User } from '../types';

export interface AuthData {
  accessToken: string;
  user: User;
}

export const authApi = {
  requestOtp: (email: string) =>
    api.post<{ success: boolean; message: string }>('/auth/otp/request', { email }),

  verifyOtp: (email: string, otp: string) =>
    api.post<{ success: boolean; data: AuthData }>('/auth/otp/verify', { email, otp }),

  refresh: () =>
    api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/refresh'),

  logout: () =>
    api.post<{ success: boolean }>('/auth/logout'),

  getMe: () =>
    api.get<{ success: boolean; data: User }>('/auth/me'),

  updateMe: (data: Partial<User>) =>
    api.patch<{ success: boolean; data: User }>('/auth/me', data),

  getSessions: () =>
    api.get<{ success: boolean; data: any[] }>('/auth/sessions'),

  revokeSession: (id: string) =>
    api.delete<{ success: boolean }>(`/auth/sessions/${id}`),
};
