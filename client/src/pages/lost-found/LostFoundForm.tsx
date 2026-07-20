import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { lostFoundApi } from '../../api/lostfound';
import LocationPicker from '../../components/shared/LocationPicker';

const lostFoundSchema = z.object({
  type:              z.enum(['lost', 'found']),
  title:             z.string().min(5, 'Title must be at least 5 characters').max(100),
  description:       z.string().min(10, 'Description must be at least 10 characters'),
  category:          z.enum(['pet', 'keys', 'wallet', 'phone', 'bag', 'documents', 'jewellery', 'other']),
  location:          z.object({
    address: z.string().min(1, 'Please enter an address'),
    lat:     z.number().refine(v => v !== 0, 'Please detect coordinates'),
    lng:     z.number().refine(v => v !== 0, 'Please detect coordinates'),
  }),
  date:              z.string().min(1, 'Date is required'),
  contactPreference: z.string().min(5, 'Please enter a contact method (phone, email, etc.)'),
});
type LostFoundFormValues = z.infer<typeof lostFoundSchema>;

const CATEGORIES = [
  { value: 'pet',        label: '🐾 Pets' },
  { value: 'keys',       label: '🔑 Keys' },
  { value: 'wallet',     label: '👛 Wallets / Purses' },
  { value: 'phone',      label: '📱 Phones / Devices' },
  { value: 'bag',        label: '🎒 Bags / Backpacks' },
  { value: 'documents',  label: '📄 Documents / ID' },
  { value: 'jewellery',  label: '💍 Jewelry / Watches' },
  { value: 'other',      label: '📦 Other' },
];

export const LostFoundForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<LostFoundFormValues>({
    resolver: zodResolver(lostFoundSchema),
    defaultValues: { type: 'lost', category: 'other', location: { address: '', lat: 0, lng: 0 } },
  });

  const reportType = watch('type');

  const onSubmit = async (values: LostFoundFormValues) => {
    setLoading(true);
    try {
      const payload = {
        type:              values.type,
        title:             values.title,
        description:       values.description,
        category:          values.category,
        address:           values.location.address,
        lat:               values.location.lat,
        lng:               values.location.lng,
        date:              values.date,
        contactPreference: values.contactPreference,
      };
      const res = await lostFoundApi.create(payload);
      if (res.data.success && res.data.data) {
        toast.success('Report submitted successfully!');
        navigate(`/app/lost-found/${res.data.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell fade-up">
      <Link to="/app/lost-found" className="back-link">
        <ArrowLeft size={16} /> Back to Board
      </Link>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--accent-light)', borderRadius: 'var(--r-md)',
            display: 'grid', placeItems: 'center', color: 'var(--accent-dark)', flexShrink: 0,
          }}>
            <Search size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Report a Lost or Found Item</h1>
            <p className="page-subtitle">Help your neighbours reconnect with their belongings.</p>
          </div>
        </div>

        <div className="card card-lg">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Type toggle */}
            <div className="form-group">
              <label className="form-label">Report type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['lost', 'found'] as const).map(t => (
                  <label key={t} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    border: `1.5px solid ${reportType === t ? 'var(--accent)' : 'var(--border)'}`,
                    background: reportType === t ? 'var(--accent-light)' : 'var(--n-0)',
                    color: reportType === t ? 'var(--accent-dark)' : 'var(--text-body)',
                    transition: 'all .15s',
                  }}>
                    <input type="radio" value={t} style={{ display: 'none' }} {...register('type')} />
                    {t === 'lost' ? '🔍 I lost this item' : '✅ I found this item'}
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="lf-title">Item title</label>
              <input
                id="lf-title"
                type="text"
                placeholder="e.g. Lost Golden Retriever, Found bunch of keys"
                className={`form-control ${errors.title ? 'error' : ''}`}
                {...register('title')}
              />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="lf-category">Category</label>
              <select id="lf-category" className="form-control" {...register('category')}>
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

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="lf-date">Date {reportType === 'lost' ? 'lost' : 'found'}</label>
              <input id="lf-date" type="date" className={`form-control ${errors.date ? 'error' : ''}`} {...register('date')} />
              {errors.date && <span className="form-error">{errors.date.message}</span>}
            </div>

            {/* Contact preference */}
            <div className="form-group">
              <label className="form-label" htmlFor="lf-contact">Contact method</label>
              <input
                id="lf-contact"
                type="text"
                placeholder="e.g. Call 9876543210, meet near park gate, email@example.com"
                className={`form-control ${errors.contactPreference ? 'error' : ''}`}
                {...register('contactPreference')}
              />
              <span className="form-hint">This will be shown to neighbours who can help — keep it safe.</span>
              {errors.contactPreference && <span className="form-error">{errors.contactPreference.message}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="lf-desc">Description</label>
              <textarea
                id="lf-desc"
                rows={4}
                placeholder="Describe unique markings, color, size, brand, or where it was last seen / found."
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
              id="submit-lf-btn"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LostFoundForm;
