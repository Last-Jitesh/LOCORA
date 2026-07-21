import api from './axios';

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  address?: string;
  phone?: string;
  website?: string;
  distance: number;
}

export const placesApi = {
  getNearby: (params: { lat: number; lng: number; radius: number; categories: string; limit?: number }) =>
    api.get<{ success: boolean; data: NearbyPlace[] }>('/places/nearby', { params }),
};
