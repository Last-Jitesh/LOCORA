import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { CircleUserRound, MapPin, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, login, accessToken } = useAuth();
  const [updating, setUpdating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        address: user.address || '',
        bio: (user as any).bio || '',
        department: (user as any).department || '',
      });
    }
  }, [user, reset]);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setUpdating(true);
    try {
      const res = await authApi.updateMe(values);
      if (res.data.success && res.data.data) {
        toast.success('Profile updated successfully!');
        login(res.data.data, accessToken || '');
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page-shell fade-up">
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">Manage your account details and neighbourhood information.</p>
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }} className="text-accent">
            <CircleUserRound size={18} />
            <span>Personal Information</span>
          </h2>

          <form onSubmit={handleSubmit(onUpdateProfile)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">Full name</label>
                <input
                  id="prof-name"
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  {...register('name')}
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email address <span style={{ textTransform: 'none', fontWeight: 450, color: 'var(--text-muted)' }}>(verified)</span></label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="form-control"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-address" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} /> Default Address
              </label>
              <input
                id="prof-address"
                type="text"
                placeholder="e.g. 42 Park Avenue, Block C"
                className="form-control"
                {...register('address')}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-dept">Department / College</label>
              <input
                id="prof-dept"
                type="text"
                placeholder="e.g. Computer Science, Engineering"
                className="form-control"
                {...register('department')}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-bio">Bio</label>
              <textarea
                id="prof-bio"
                rows={3}
                placeholder="Tell your neighbours a bit about yourself..."
                className="form-control"
                style={{ minHeight: 80 }}
                {...register('bio')}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', padding: '10px 24px', marginTop: 8 }}
              id="save-profile-btn"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
