import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, MapPin, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceApi } from '../../api/services';
import type { Service } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';

const SERVICE_TYPES = [
  { value: '',             label: 'All Services' },
  { value: 'electrician',  label: '⚡ Electrician' },
  { value: 'plumber',      label: '🚰 Plumber' },
  { value: 'carpenter',    label: '🪚 Carpenter' },
  { value: 'laundry',      label: '🧺 Laundry Service' },
  { value: 'tutor',        label: '📚 Tutor' },
  { value: 'mechanic',     label: '🔧 Mechanic' },
  { value: 'other',        label: '📦 Other Service' },
];

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState('');
  const [distance, setDistance] = useState(5);
  const { coords } = useGeolocation();
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.radius = distance;
      }
      if (serviceType) {
        params.serviceType = serviceType;
      }
      const res = await serviceApi.getAll(params);
      if (res.data.success && res.data.data) {
        setServices(res.data.data);
      }
    } catch {
      toast.error('Failed to load local service providers');
    } finally {
      setLoading(false);
    }
  }, [coords, serviceType, distance]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="page-shell fade-up">
      {/* Head */}
      <div className="page-head">
        <div>
          <h1>Local Services</h1>
          <p className="page-subtitle">Find or list trusted local service providers in your neighborhood.</p>
        </div>
        <Link to="/app/services/new" className="btn btn-primary" id="register-provider-btn">
          <Plus size={16} /> Register as Provider
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ marginBottom: 24 }}>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: 200 }}
        >
          {SERVICE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {coords && (
          <select
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
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

      {/* Grid List */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Searching local listings…</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={26} />
          </div>
          <h3>No service providers listed</h3>
          <p>
            {serviceType
              ? `Be the first to list a ${serviceType} service in this area!`
              : 'Register your skills or service business to help neighbors nearby.'}
          </p>
          <Link to="/app/services/new" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
            <Plus size={14} /> Register Listing
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {services.map((svc, i) => {
            const provider = svc.providerId || (svc as any).provider;
            return (
              <div
                key={svc._id}
                onClick={() => navigate(`/app/services/${svc._id}`)}
                className={`item-card fade-up delay-${Math.min(i + 1, 3)}`}
                style={{ cursor: 'pointer' }}
                id={`service-card-${svc._id}`}
              >
                <div className="item-card-top">
                  <span className="badge badge-accent">
                    {SERVICE_TYPES.find((t) => t.value === svc.serviceType)?.label || svc.serviceType}
                  </span>
                  {svc.distance !== undefined && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-dark)' }}>
                      {(svc.distance / 1000).toFixed(1)} km away
                    </span>
                  )}
                </div>

                <div style={{ margin: '12px 0 16px 0' }}>
                  <div className="item-card-title">{svc.serviceName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <div className="avatar avatar-sm" style={{ width: 24, height: 24, fontSize: 10 }}>
                      {provider?.avatarUrl ? (
                        <img src={provider.avatarUrl} alt="" style={{ borderRadius: '50%', width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        provider?.name?.charAt(0).toUpperCase() || 'P'
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{provider?.name || 'Local Provider'}</span>
                  </div>
                </div>

                <div className="item-card-meta" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div className="item-card-meta-row" style={{ fontSize: 12 }}>
                    <Phone size={12} />
                    <span>{svc.phoneNumber}</span>
                  </div>
                  {svc.address && (
                    <div className="item-card-meta-row" style={{ fontSize: 12 }}>
                      <MapPin size={12} />
                      <span className="truncate-1">{svc.address}</span>
                    </div>
                  )}
                </div>

                <div className="item-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderTop: 'none', paddingTop: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)' }}>View Details</span>
                  <ChevronRight size={16} color="var(--accent)" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;
