import api from './axios';
import type { LostFound } from '../types';

export const lostFoundApi = {
  create: (data: Partial<LostFound>) =>
    api.post<{ success: boolean; data: LostFound }>('/lost-found', data),

  getAll: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: LostFound[]; pagination: any }>('/lost-found', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: LostFound }>(`/lost-found/${id}`),

  resolve: (id: string) =>
    api.patch<{ success: boolean; data: LostFound }>(`/lost-found/${id}/resolve`),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/lost-found/${id}`),
};
export default lostFoundApi;
