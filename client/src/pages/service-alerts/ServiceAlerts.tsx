import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Plus, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceAlertApi } from '../../api/serviceAlerts';
import type { ServiceAlert } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';

const SERVICE_TYPES = [
  { value: '',            label: 'All Services' },
  { value: 'plumber',     label: '🔧 Plumber' },
  { value: 'electrician', label: '⚡ Electrician' },
  { value: 'carpenter',   label: '🪚 Carpenter' },
  { value: 'ac-repair',   label: '❄️ AC Repair' },
  { value: 'other',       label: '🛠️ Other' },
];

export const ServiceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState('');
  const [distance, setDistance] = useState(5);
  const { coords } = useGeolocation();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; params.radius = distance; }
      if (serviceType) params.serviceType = serviceType;
      const res = await serviceAlertApi.getAll(params);
      if (res.data.success && res.data.data) setAlerts(res.data.data);
    } catch {
      toast.error('Failed to load Service Alerts');
    } finally {
      setLoading(false);
    }
  }, [coords, serviceType, distance]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  return (
    <div className="page-shell fade-up">
      <div className="page-head">
        <div>
          <h1>Service Alerts</h1>
          <p className="page-subtitle">See neighbours booking service visits and coordinate to split costs.</p>
        </div>
        <Link to="/app/service-alerts/new" className="btn btn-primary" id="broadcast-btn">
          <Plus size={16} /> Broadcast Visit
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <select
          value={serviceType}
          onChange={e => setServiceType(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: 170 }}
        >
          {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {coords && (
          <select
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
            className="form-control"
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={15}>Within 15 km</option>
            <option value={30}>Within 30 km</option>
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Looking for service visits nearby…</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Wrench size={26} /></div>
          <h3>No service visits broadcasted</h3>
          <p>Booking a plumber or electrician? Broadcast the visit and let neighbours piggyback to save on call-out fees!</p>
          <Link to="/app/service-alerts/new" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
            <Plus size={14} /> Broadcast Visit
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {alerts.map((alert, i) => (
            <Link
              key={alert._id}
              to={`/app/service-alerts/${alert._id}`}
              className={`item-card fade-up delay-${Math.min(i + 1, 3)}`}
              id={`sa-card-${alert._id}`}
            >
              <div className="item-card-top">
                <span className="badge badge-accent">
                  {alert.serviceType === 'other' && alert.customServiceType
                    ? alert.customServiceType
                    : alert.serviceType}
                </span>
                <span className="badge badge-green">Open</span>
              </div>

              <div>
                <div className="item-card-title">
                  {alert.providerName || 'Local Specialist'} visiting
                </div>
                {alert.description && (
                  <div className="item-card-desc" style={{ marginTop: 6 }}>{alert.description}</div>
                )}
              </div>

              <div className="item-card-meta">
                <div className="item-card-meta-row">
                  <Calendar size={13} />
                  <span>{new Date(alert.scheduledTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="item-card-meta-row">
                  <Clock size={13} />
                  <span>{new Date(alert.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {alert.address && (
                  <div className="item-card-meta-row">
                    <MapPin size={13} />
                    <span className="truncate-1" style={{ maxWidth: 200 }}>{alert.address}</span>
                  </div>
                )}
                {alert.distance !== undefined && (
                  <div style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 700, marginTop: 2 }}>
                    {(alert.distance / 1000).toFixed(1)} km away
                  </div>
                )}
              </div>

              <div className="item-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)' }}>View & Piggyback</span>
                <ChevronRight size={16} color="var(--accent)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceAlerts;
