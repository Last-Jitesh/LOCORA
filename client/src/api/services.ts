import api from './axios';
import type { Service, ApiResponse } from '../types';

export const serviceApi = {
  create: (data: { serviceName: string; serviceType: string; phoneNumber: string }) =>
    api.post<ApiResponse<Service>>('/services', data),

  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Service[]>>('/services', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Service>>(`/services/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/services/${id}`),
};

export default serviceApi;
