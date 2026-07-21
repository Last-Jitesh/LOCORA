import api from './axios';
import type { Activity, User, ActivityMessage } from '../types';

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

export interface ActivityParticipantsResponse {
  participants: User[];
  host: User;
  currentParticipants: number;
  maxParticipants: number;
}

export const activityApi = {
  create: (data: Partial<Activity>) =>
    api.post<{ success: boolean; data: Activity }>('/activities', data),

  getAll: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Activity[]; pagination: any }>('/activities', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Activity }>(`/activities/${id}`),

  join: (id: string) =>
    api.post<{ success: boolean; data: Activity }>(`/activities/${id}/join`),

  leave: (id: string) =>
    api.post<{ success: boolean }>(`/activities/${id}/leave`),

  getParticipants: (id: string) =>
    api.get<{ success: boolean; data: ActivityParticipantsResponse }>(`/activities/${id}/participants`),

  getMessages: (id: string) =>
    api.get<{ success: boolean; data: ActivityMessage[] }>(`/activities/${id}/messages`),

  blockUser: (data: { blockedUserId: string; activityId: string; reason?: string }) =>
    api.post<{ success: boolean }>('/blocks', data),

  toggleInterest: (id: string) =>
    api.post<{ success: boolean }>(`/activities/${id}/interest`),

  getInterestedUsers: (id: string) =>
    api.get<{ success: boolean; data: ActivityInterestResponse[] }>(`/activities/${id}/interest`),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/activities/${id}`),
};
export default activityApi;
