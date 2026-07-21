export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  address?: string;
  bio?: string;
  department?: string;
  latitude?: number;
  longitude?: number;
  lastLocationUpdatedAt?: string;
  createdAt?: string;
}

export interface Activity {
  _id: string;
  title: string;
  description: string;
  category: 'sport' | 'wellness' | 'social' | 'education' | 'garage-sale' | 'volunteering' | 'other';
  address: string;
  location: GeoPoint;
  startTime: string;
  endTime?: string;
  createdBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    department?: string;
  };
  interestedCount: number;
  maxParticipants: number;
  currentParticipants: number;
  participants?: User[];
  distance?: number;
  createdAt: string;
}

export interface LostFound {
  _id: string;
  reportedBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email?: string;
  };
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: 'pet' | 'keys' | 'wallet' | 'phone' | 'bag' | 'documents' | 'jewellery' | 'other';
  address: string;
  location: GeoPoint;
  date: string;
  status: 'open' | 'resolved';
  contactPreference: string;
  distance?: number;
  createdAt: string;
}

export interface ServiceAlert {
  _id: string;
  serviceType: 'plumber' | 'electrician' | 'carpenter' | 'ac-repair' | 'other';
  customServiceType?: string;
  providerName?: string;
  description: string;
  address: string;
  location: GeoPoint;
  scheduledTime: string;
  status: 'open' | 'closed' | 'expired';
  createdBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email?: string;
  };
  expiresAt: string;
  distance?: number;
  createdAt: string;
}

export interface ServiceAlertInterest {
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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HostBlock {
  _id: string;
  hostId: string;
  blockedUserId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email: string;
  };
  reason?: string;
  blockedAt: string;
}

export interface ActivityMessage {
  _id: string;
  activityId: string;
  senderId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  message: string;
  createdAt: string;
}

export interface LostFoundMessage {
  _id?: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface LostFoundChat {
  _id: string;
  itemId: {
    _id: string;
    title: string;
    type: 'lost' | 'found';
    status: 'open' | 'resolved';
    description: string;
  };
  ownerId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email: string;
  };
  claimantId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email: string;
  };
  messages: LostFoundMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  serviceName: string;
  serviceType: 'electrician' | 'plumber' | 'carpenter' | 'laundry' | 'tutor' | 'mechanic' | 'other';
  phoneNumber: string;
  providerId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email: string;
  };
  address: string;
  location: GeoPoint;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}
