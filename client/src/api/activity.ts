import api from './axios';
import type { Activity } from '../types';

export interface ActivityInterestResponse {
  _id: string;
  activityId: string;
  userId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export const activityApi = {
  create: (data: Partial<Activity>) =>
    api.post<{ success: boolean; data: Activity }>('/activities', data),

  getAll: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Activity[]; pagination: any }>('/activities', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Activity }>(`/activities/${id}`),

  toggleInterest: (id: string) =>
    api.post<{ success: boolean }>(`/activities/${id}/interest`),

  getInterestedUsers: (id: string) =>
    api.get<{ success: boolean; data: ActivityInterestResponse[] }>(`/activities/${id}/interest`),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/activities/${id}`),
};
export default activityApi;
