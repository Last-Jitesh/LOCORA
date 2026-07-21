import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Trash2, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import MapView from '../../components/MapView';
import type { Service } from '../../types';

const SERVICE_TYPES = [
  { value: 'electrician',  label: '⚡ Electrician' },
  { value: 'plumber',      label: '🚰 Plumber' },
  { value: 'carpenter',    label: '🪚 Carpenter' },
  { value: 'laundry',      label: '🧺 Laundry Service' },
  { value: 'tutor',        label: '📚 Tutor' },
  { value: 'mechanic',     label: '🔧 Mechanic' },
  { value: 'other',        label: '📦 Other Service' },
];

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServiceDetails = async () => {
    if (!id) return;
    try {
      const res = await serviceApi.getById(id);
      if (res.data.success && res.data.data) {
        setService(res.data.data);
      } else {
        toast.error('Service listing not found.');
        navigate('/app/services');
      }
    } catch {
      toast.error('Failed to load service listing.');
      navigate('/app/services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete your service listing?')) return;
    setDeleteLoading(true);
    try {
      const res = await serviceApi.delete(id);
      if (res.data.success) {
        toast.success('Service listing deleted successfully.');
        navigate('/app/services');
      }
    } catch {
      toast.error('Failed to delete service listing.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading service details…</p>
      </div>
    );
  }

  if (!service) return null;

  const provider = service.providerId || (service as any).provider;
  const isProvider = provider?._id === user?.id || provider?.id === user?.id;

  return (
    <div className="page-shell fade-up">
      {/* Back + Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <Link to="/app/services" className="back-link" style={{ marginBottom: 0 }}>
          <ArrowLeft size={16} /> Back to Services
        </Link>
        {isProvider && (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="btn btn-danger btn-sm"
            id="delete-service-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {deleteLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete Listing
          </button>
        )}
      </div>

      <div className="detail-layout">
        {/* Main Details Panel */}
        <div className="detail-main">
          <div className="card">
            <span className="badge badge-accent" style={{ marginBottom: 16 }}>
              {SERVICE_TYPES.find((t) => t.value === service.serviceType)?.label || service.serviceType}
            </span>
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', marginBottom: 16 }}>
              {service.serviceName}
            </h1>

            {/* Provider and listing details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="section-eyebrow">Contact Number</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>
                    {service.phoneNumber}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="section-eyebrow">Listed Since</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>
                    {new Date(service.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {service.address && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', gridColumn: '1 / -1' }}>
                  <div className="meta-icon-box" style={{ marginTop: 2 }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="section-eyebrow">Location / Address</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14, lineHeight: 1.4 }}>
                      {service.address}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MapView of provider listing */}
          {service.location?.coordinates && service.location.coordinates[0] !== 0 && (
            <div className="map-wrapper" style={{ height: 280 }}>
              <MapView
                lat={service.location.coordinates[1]}
                lng={service.location.coordinates[0]}
                zoom={15}
                popupLabel={`${service.serviceName} (${service.serviceType})`}
                className="map-wrapper"
              />
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="detail-sidebar">
          {/* Provider Card */}
          <div className="card">
            <div className="section-eyebrow" style={{ marginBottom: 14 }}>Service Provider</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
              <div className="avatar avatar-md">
                {provider?.avatarUrl ? (
                  <img
                    src={provider.avatarUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  provider?.name?.charAt(0).toUpperCase() || 'P'
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }} className="truncate-1">
                  {provider?.name || 'Local Provider'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={13} style={{ color: 'var(--accent)' }} /> Verified Neighbor
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={`tel:${service.phoneNumber}`}
                className="btn btn-primary btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                id="call-provider-btn"
              >
                <Phone size={15} /> Call Provider
              </a>
              {provider?.email && (
                <a
                  href={`mailto:${provider.email}`}
                  className="btn btn-outline btn-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Mail size={15} /> Send Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
