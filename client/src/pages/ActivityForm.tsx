import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, CalendarDays } from 'lucide-react';
import { activityApi } from '../api/activity';
import LocationPicker from '../components/shared/LocationPicker';

const activitySchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category:    z.enum(['sport', 'wellness', 'social', 'education', 'garage-sale', 'volunteering', 'other']),
  location:    z.object({
    address: z.string().min(1, 'Please enter an address'),
    lat:     z.number().refine(v => v !== 0, 'Please detect coordinates'),
    lng:     z.number().refine(v => v !== 0, 'Please detect coordinates'),
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime:   z.string().optional(),
});
type ActivityFormValues = z.infer<typeof activitySchema>;

const CATEGORIES = [
  { value: 'sport',        label: '🏃 Sports / Games' },
  { value: 'wellness',     label: '🧘 Wellness / Yoga' },
  { value: 'social',       label: '🎉 Social Meetups' },
  { value: 'education',    label: '📚 Education / Study' },
  { value: 'garage-sale',  label: '🏷️ Garage Sales' },
  { value: 'volunteering', label: '🤝 Volunteering' },
  { value: 'other',        label: '📌 Other Events' },
];

export const ActivityForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: { category: 'other', location: { address: '', lat: 0, lng: 0 } },
  });

  const onSubmit = async (values: ActivityFormValues) => {
    setLoading(true);
    try {
      const payload = {
        title:       values.title,
        description: values.description,
        category:    values.category,
        address:     values.location.address,
        lat:         values.location.lat,
        lng:         values.location.lng,
        startTime:   values.startTime,
        ...(values.endTime && { endTime: values.endTime }),
      };
      const res = await activityApi.create(payload);
      if (res.data.success && res.data.data) {
        toast.success('Activity hosted successfully!');
        navigate(`/app/activity/${res.data.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create activity. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell fade-up">
      <Link to="/app/activity" className="back-link">
        <ArrowLeft size={16} /> Back to Activities
      </Link>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Form header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--accent-light)', borderRadius: 'var(--r-md)',
            display: 'grid', placeItems: 'center', color: 'var(--accent-dark)', flexShrink: 0,
          }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Host a Neighbourhood Activity</h1>
            <p className="page-subtitle">Fill in the details for your upcoming event.</p>
          </div>
        </div>

        <div className="card card-lg">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="act-title">Event title</label>
              <input
                id="act-title"
                type="text"
                placeholder="e.g. Park Yoga Meetup, Block Yard Sale"
                className={`form-control ${errors.title ? 'error' : ''}`}
                {...register('title')}
              />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="act-category">Category</label>
              <select id="act-category" className="form-control" {...register('category')}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

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

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="act-start">Start date & time</label>
                <input
                  id="act-start"
                  type="datetime-local"
                  className={`form-control ${errors.startTime ? 'error' : ''}`}
                  {...register('startTime')}
                />
                {errors.startTime && <span className="form-error">{errors.startTime.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="act-end">End time <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(optional)</span></label>
                <input
                  id="act-end"
                  type="datetime-local"
                  className="form-control"
                  {...register('endTime')}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="act-desc">Description</label>
              <textarea
                id="act-desc"
                rows={4}
                placeholder="What are the details? What should neighbours bring or know?"
                className={`form-control ${errors.description ? 'error' : ''}`}
                style={{ minHeight: 110 }}
                {...register('description')}
              />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
              id="submit-activity-btn"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Hosting…' : 'Host Activity'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm;
