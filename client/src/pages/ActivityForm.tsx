import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, CalendarDays } from 'lucide-react';
import { activityApi } from '../api/activity';
import { useGeolocation } from '../hooks/useGeolocation';

const activitySchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category:    z.enum(['sport', 'wellness', 'social', 'education', 'garage-sale', 'volunteering', 'other']),
  address:     z.string().min(1, 'Please enter a venue/address'),
  startTime:   z.string().min(1, 'Start time is required'),
  endTime:     z.string().optional(),
  maxParticipants: z.preprocess(
    (val) => Number(val),
    z.number().min(2, 'Maximum participants must be at least 2')
  ),
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
  const { coords } = useGeolocation();

  const { register, handleSubmit, formState: { errors } } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: { category: 'other', maxParticipants: 10 },
  });

  const onSubmit = async (values: ActivityFormValues) => {
    setLoading(true);
    try {
      const payload = {
        title:       values.title,
        description: values.description,
        category:    values.category,
        address:     values.address,
        lat:         coords?.lat || 0,
        lng:         coords?.lng || 0,
        startTime:   values.startTime,
        maxParticipants: values.maxParticipants,
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

            {/* Category & Max Participants */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="act-category">Category</label>
                <select id="act-category" className="form-control" {...register('category')}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="act-max-participants">Maximum Participants</label>
                <input
                  id="act-max-participants"
                  type="number"
                  placeholder="e.g. 10"
                  className={`form-control ${errors.maxParticipants ? 'error' : ''}`}
                  {...register('maxParticipants')}
                />
                {errors.maxParticipants && <span className="form-error">{errors.maxParticipants.message}</span>}
              </div>
            </div>

            {/* Venue Address (No detect coordinates needed) */}
            <div className="form-group">
              <label className="form-label" htmlFor="act-address">Venue Address / Location</label>
              <input
                id="act-address"
                type="text"
                placeholder="e.g. Community Center, 42 Park Avenue"
                className={`form-control ${errors.address ? 'error' : ''}`}
                {...register('address')}
              />
              {errors.address && <span className="form-error">{errors.address.message}</span>}
            </div>

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
