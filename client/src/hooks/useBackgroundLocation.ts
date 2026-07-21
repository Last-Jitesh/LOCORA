import { useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export const useBackgroundLocation = () => {
  const { isAuthenticated, user } = useAuth();
  const lastSentCoords = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !navigator.geolocation) return;

    // Try to restore user's current coordinates from their profile on mount
    if (user && (user as any).latitude && (user as any).longitude) {
      lastSentCoords.current = {
        lat: (user as any).latitude,
        lng: (user as any).longitude,
      };
    }

    const sendLocationUpdate = async (lat: number, lng: number) => {
      try {
        await axios.patch('/users/me/location', { latitude: lat, longitude: lng });
        lastSentCoords.current = { lat, lng };
      } catch {
        // Silently ignore background location update errors
      }
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      if (!lastSentCoords.current) {
        // First location update
        sendLocationUpdate(latitude, longitude);
      } else {
        // Compare distance with last sent location
        const distance = haversineDistance(
          lastSentCoords.current.lat,
          lastSentCoords.current.lng,
          latitude,
          longitude
        );

        // Update if moved >= 1 km
        if (distance >= 1.0) {
          sendLocationUpdate(latitude, longitude);
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn('Geolocation error:', error.message);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: false, // Low accuracy is fine for 1km updates and saves battery
      timeout: 30000,
      maximumAge: 60000 * 5, // 5 minutes cache is fine
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isAuthenticated, user]);
};

export default useBackgroundLocation;
