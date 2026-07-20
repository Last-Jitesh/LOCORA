import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { CircleUserRound, Shield, LogOut, Laptop, Smartphone, Key, MapPin, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

interface SessionItem {
  _id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const loadSessions = async () => {
    try {
      const res = await authApi.getSessions();
      if (res.data.success && res.data.data) {
        setSessions(res.data.data);
      }
    } catch {
      toast.error('Failed to load active sessions.');
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        address: user.address || '',
      });
      loadSessions();
    }
  }, [user, reset]);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setUpdating(true);
    try {
      const res = await authApi.updateMe(values);
      if (res.data.success && res.data.data) {
        toast.success('Profile updated successfully!');
        const currentToken = (window as any).accessToken || '';
        login(res.data.data, currentToken);
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to revoke this session? That device will be logged out.')) return;
    setRevokingId(sessionId);
    try {
      await authApi.revokeSession(sessionId);
      toast.success('Session revoked successfully.');
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch {
      toast.error('Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  const parseUserAgent = (ua?: string) => {
    if (!ua) return { icon: Laptop, text: 'Desktop / Unknown Device' };
    const lowercase = ua.toLowerCase();
    if (lowercase.includes('mobile') || lowercase.includes('android') || lowercase.includes('iphone')) {
      return { icon: Smartphone, text: 'Mobile Device' };
    }
    return { icon: Laptop, text: 'Desktop / Browser' };
  };

  return (
    <div className="page-shell fade-up">
      <div className="page-head">
        <div>
          <h1>Profile & Sessions</h1>
          <p className="page-subtitle">Manage your account profile, neighborhood details, and active logins.</p>
        </div>
      </div>

      <div className="detail-layout">
        {/* Profile Card */}
        <div className="detail-main">
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

        {/* Sessions Card */}
        <div className="detail-sidebar">
          <div className="card">
            <h2 style={{ fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }} className="text-accent">
              <Key size={16} />
              <span>Active Sessions</span>
            </h2>

            {loadingSessions ? (
              <div className="spinner-wrap" style={{ padding: '24px 0' }}>
                <div className="spinner spinner-sm" />
              </div>
            ) : sessions.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No active sessions found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
                {sessions.map((session) => {
                  const device = parseUserAgent(session.userAgent);
                  const IconComponent = device.icon;
                  return (
                    <div
                      key={session._id}
                      style={{
                        padding: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--accent)', marginTop: 2 }}>
                          <IconComponent size={15} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-h)' }} className="truncate-1">{device.text}</span>
                          <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>IP: {session.ipAddress || 'Unknown'}</span>
                          <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>
                            Since: {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={revokingId === session._id}
                        onClick={() => handleRevokeSession(session._id)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: 11, padding: '5px 8px' }}
                      >
                        {revokingId === session._id ? 'Revoking...' : 'Revoke Access'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
