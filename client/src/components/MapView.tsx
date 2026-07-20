import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon broken by Vite's asset bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom amber marker to match the app theme
const amberIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapMarkerItem {
  id?: string;
  lat: number;
  lng: number;
  label: string;
  subLabel?: string;
}

interface MapViewProps {
  /** Latitude of map center */
  lat: number;
  /** Longitude of map center */
  lng: number;
  /** Zoom level (default: 15) */
  zoom?: number;
  /** Label shown in the marker popup */
  popupLabel?: string;
  /** Multiple markers to display on the map */
  markers?: MapMarkerItem[];
  /** Extra CSS class for sizing */
  className?: string;
}

/** Re-centers the map whenever lat/lng change */
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function MapView({
  lat,
  lng,
  zoom = 15,
  popupLabel,
  markers = [],
  className = 'map-container',
}: MapViewProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className={className}
      style={{ width: '100%' }}
      scrollWheelZoom={false}
    >
      {/* OpenStreetMap tiles — completely free, no key required */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap lat={lat} lng={lng} />

      {popupLabel && (
        <Marker position={[lat, lng]} icon={amberIcon}>
          <Popup>{popupLabel}</Popup>
        </Marker>
      )}

      {markers.map((item, idx) => (
        <Marker key={item.id || idx} position={[item.lat, item.lng]} icon={amberIcon}>
          <Popup>
            <div className="font-sans">
              <strong className="block text-xs font-bold text-[#1E1208]">{item.label}</strong>
              {item.subLabel && <span className="block text-[10px] text-[#6B4C2A]">{item.subLabel}</span>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

