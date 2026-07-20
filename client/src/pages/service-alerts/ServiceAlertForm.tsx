import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Wrench } from 'lucide-react';
import { serviceAlertApi } from '../../api/serviceAlerts';
import LocationPicker from '../../components/shared/LocationPicker';

const serviceAlertSchema = z.object({
  serviceType:       z.enum(['plumber', 'electrician', 'carpenter', 'ac-repair', 'other']),
  customServiceType: z.string().optional(),
  providerName:      z.string().optional(),
  description:       z.string().min(10, 'Description must be at least 10 characters'),
  location:          z.object({
    address: z.string().min(1, 'Please enter an address'),
    lat:     z.number().refine(v => v !== 0, 'Please detect coordinates'),
    lng:     z.number().refine(v => v !== 0, 'Please detect coordinates'),
  }),
  scheduledTime: z.string().min(1, 'Scheduled date and time is required'),
});
type ServiceAlertFormValues = z.infer<typeof serviceAlertSchema>;

const SERVICE_OPTIONS = [
  { value: 'plumber',     label: '🔧 Plumbing / Leak fixes' },
  { value: 'electrician', label: '⚡ Electrician / Wiring' },
  { value: 'carpenter',   label: '🪚 Carpenter / Wood repairs' },
  { value: 'ac-repair',   label: '❄️ AC Repair / Servicing' },
  { value: 'other',       label: '🛠️ Other / Custom' },
];

export const ServiceAlertForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ServiceAlertFormValues>({
    resolver: zodResolver(serviceAlertSchema),
    defaultValues: { serviceType: 'plumber', location: { address: '', lat: 0, lng: 0 } },
  });

  const selectedType = watch('serviceType');

  const onSubmit = async (values: ServiceAlertFormValues) => {
    if (values.serviceType === 'other' && !values.customServiceType) {
      toast.error('Please specify the custom service type.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        serviceType:       values.serviceType,
        customServiceType: values.customServiceType,
        providerName:      values.providerName,
        description:       values.description,
        address:           values.location.address,
        lat:               values.location.lat,
        lng:               values.location.lng,
        scheduledTime:     values.scheduledTime,
      };
      const res = await serviceAlertApi.create(payload);
      if (res.data.success && res.data.data) {
        toast.success('Visit broadcasted to your neighbourhood!');
        navigate(`/app/service-alerts/${res.data.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to broadcast visit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell fade-up">
      <Link to="/app/service-alerts" className="back-link">
        <ArrowLeft size={16} /> Back to Alerts
      </Link>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--accent-light)', borderRadius: 'var(--r-md)',
            display: 'grid', placeItems: 'center', color: 'var(--accent-dark)', flexShrink: 0,
          }}>
            <Wrench size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Broadcast a Service Visit</h1>
            <p className="page-subtitle">Let neighbours piggyback on your booked service to split call-out fees.</p>
          </div>
        </div>

        <div className="card card-lg">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Service type + provider name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="sa-type">Service category</label>
                <select id="sa-type" className="form-control" {...register('serviceType')}>
                  {SERVICE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sa-provider">Provider name <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                <input
                  id="sa-provider"
                  type="text"
                  placeholder="e.g. QuickFix Plumbers"
                  className="form-control"
                  {...register('providerName')}
                />
              </div>
            </div>

            {/* Custom service type */}
            {selectedType === 'other' && (
              <div className="form-group">
                <label className="form-label" htmlFor="sa-custom">Specify service type</label>
                <input
                  id="sa-custom"
                  type="text"
                  placeholder="e.g. Pest Control, Window Glazier"
                  className="form-control"
                  {...register('customServiceType')}
                />
              </div>
            )}

            {/* Location */}
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <LocationPicker
                  address={field.value.address}
                  lat={field.value.lat}
                  lng={field.value.lng}
                  required
                  onChange={val => setValue('location', val, { shouldValidate: true })}
                />
              )}
            />
            {errors.location?.address && <span className="form-error">{errors.location.address.message}</span>}
            {(errors.location?.lat || errors.location?.lng) && (
              <span className="form-error">Please use "Detect Location" to confirm coordinates.</span>
            )}

            {/* Scheduled time */}
            <div className="form-group">
              <label className="form-label" htmlFor="sa-time">Scheduled date & time</label>
              <input
                id="sa-time"
                type="datetime-local"
                className={`form-control ${errors.scheduledTime ? 'error' : ''}`}
                {...register('scheduledTime')}
              />
              {errors.scheduledTime && <span className="form-error">{errors.scheduledTime.message}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="sa-desc">Details / Scope of visit</label>
              <textarea
                id="sa-desc"
                rows={4}
                placeholder="What are they fixing? Do they have capacity for more bookings? How should neighbours contact you to coordinate?"
                className={`form-control ${errors.description ? 'error' : ''}`}
                style={{ minHeight: 110 }}
                {...register('description')}
              />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
              id="submit-sa-btn"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Broadcasting…' : 'Broadcast Visit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceAlertForm;
