import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface LocationValue {
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  address: string;
  lat: number;
  lng: number;
  onChange: (value: LocationValue) => void;
  required?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  address,
  lat,
  lng,
  onChange,
  required = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'Locora-Neighbourhood-App',
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            const resolvedAddress = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            onChange({
              address: resolvedAddress,
              lat: latitude,
              lng: longitude,
            });
          } else {
            onChange({
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude,
            });
          }
        } catch (error) {
          onChange({
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert('Failed to get your location. Please type your address manually.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="location-picker-label">
          Location / Address {required && <span style={{ color: 'var(--err)' }}>*</span>}
        </span>
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={loading}
          className="detect-btn"
          id="detect-location-btn"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Navigation size={12} />
          )}
          <span>Detect Location</span>
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--n-400)' }} />
        <input
          type="text"
          placeholder="e.g. 42 Park Avenue, Block C"
          required={required}
          value={address}
          onChange={(e) => {
            onChange({
              address: e.target.value,
              lat: lat || 0,
              lng: lng || 0,
            });
          }}
          className="form-control"
          style={{ paddingLeft: 42 }}
        />
      </div>

      {lat && lng ? (
        <span className="form-hint">
          Coordinates matched: {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      ) : null}
    </div>
  );
};

export default LocationPicker;
