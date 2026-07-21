import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceApi } from '../../api/services';

const SERVICE_TYPES = [
  { value: 'electrician',  label: '⚡ Electrician' },
  { value: 'plumber',      label: '🚰 Plumber' },
  { value: 'carpenter',    label: '🪚 Carpenter' },
  { value: 'laundry',      label: '🧺 Laundry Service' },
  { value: 'tutor',        label: '📚 Tutor' },
  { value: 'mechanic',     label: '🔧 Mechanic' },
  { value: 'other',        label: '📦 Other Service' },
];

export const ServiceForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState('other');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await serviceApi.create({
        serviceName: serviceName.trim(),
        serviceType,
        phoneNumber: phoneNumber.trim(),
      });
      if (res.data.success) {
        toast.success('Registered successfully as a local service provider!');
        navigate('/app/services');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register service provider.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell fade-up">
      {/* Back Link */}
      <Link to="/app/services" className="back-link">
        <ArrowLeft size={16} /> Back to Services
      </Link>

      <div className="page-head" style={{ marginBottom: 24 }}>
        <div>
          <h1>List Your Service</h1>
          <p className="page-subtitle">Let nearby neighbors find and contact you for your services.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Business / Service Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="serviceName">Business or Listing Name *</label>
            <input
              type="text"
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., Jitesh Electrical Works"
              className="form-control"
              required
              disabled={loading}
            />
          </div>

          {/* Service Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="serviceType">Service Category *</label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="form-control"
              required
              disabled={loading}
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="phoneNumber">Contact Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., +91 98765 43210"
              className="form-control"
              required
              disabled={loading}
            />
          </div>

          {/* Note about address/location */}
          <div
            style={{
              padding: 12,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            <strong>Note:</strong> Your service listing location and address will automatically sync with your registered profile location to make it easy for nearby neighbors to locate you.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Link to="/app/services" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="submit-service-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Registering...
                </>
              ) : (
                <>
                  <Save size={16} /> List Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
