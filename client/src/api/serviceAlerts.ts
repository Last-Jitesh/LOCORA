import api from './axios';
import type { ServiceAlert, ServiceAlertInterest } from '../types';

export interface ServiceAlertInterestResponse {
  _id: string;
  serviceAlertId: string;
  userId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export const serviceAlertApi = {
  create: (data: Partial<ServiceAlert>) =>
    api.post<{ success: boolean; data: ServiceAlert }>('/service-alerts', data),

  getAll: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: ServiceAlert[]; pagination: any }>('/service-alerts', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: ServiceAlert }>(`/service-alerts/${id}`),

  expressInterest: (id: string, message?: string) =>
    api.post<{ success: boolean; data: ServiceAlertInterest }>(`/service-alerts/${id}/interest`, { message }),

  getInterested: (id: string) =>
    api.get<{ success: boolean; data: ServiceAlertInterestResponse[] }>(`/service-alerts/${id}/interest`),

  updateInterestStatus: (id: string, interestId: string, status: 'accepted' | 'declined') =>
    api.patch<{ success: boolean; data: ServiceAlertInterestResponse }>(`/service-alerts/${id}/interest/${interestId}`, { status }),

  close: (id: string) =>
    api.patch<{ success: boolean; data: ServiceAlert }>(`/service-alerts/${id}/close`),
};
export default serviceAlertApi;
