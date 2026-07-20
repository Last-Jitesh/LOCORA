// Convert km to meters for MongoDB $geoNear / $near
export const kmToMeters = (km: number): number => km * 1000;

// Parse radius from query param (default 5km)
export const parseRadius = (radiusParam: unknown, defaultKm = 5): number => {
  const parsed = Number(radiusParam);
  if (isNaN(parsed) || parsed <= 0) return defaultKm;
  return Math.min(parsed, 50); // cap at 50km
};

// Parse coordinates from query params
export const parseCoords = (lat: unknown, lng: unknown): { lat: number; lng: number } | null => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng)) return null;
  if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) return null;
  return { lat: parsedLat, lng: parsedLng };
};
