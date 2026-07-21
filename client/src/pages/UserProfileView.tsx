import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Landmark, Info } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import type { User } from '../types';

export const UserProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/users/${id}`);
        if (res.data.success && res.data.data) {
          setProfile(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load user profile.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading profile…</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="page-shell fade-up">
      <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 24, fontSize: 14, color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card card-lg" style={{ textAlign: 'center', padding: '40px 24px' }}>
          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: 'var(--accent-light)',
            display: 'grid', placeItems: 'center', color: 'var(--accent-dark)', fontSize: 36, fontWeight: 700,
            margin: '0 auto 20px', overflow: 'hidden'
          }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name & Role */}
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-h)', marginBottom: 4 }}>{profile.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Neighbourhood Participant</p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 24px' }} />

          {/* Details list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {profile.department && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Landmark size={18} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div className="section-eyebrow" style={{ marginBottom: 2 }}>Department / College</div>
                  <div style={{ fontSize: 14, color: 'var(--text-h)', fontWeight: 500 }}>{profile.department}</div>
                </div>
              </div>
            )}

            {profile.bio && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={18} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div className="section-eyebrow" style={{ marginBottom: 2 }}>Bio</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{profile.bio}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Calendar size={18} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div className="section-eyebrow" style={{ marginBottom: 2 }}>Joined Locora</div>
                <div style={{ fontSize: 14, color: 'var(--text-h)', fontWeight: 500 }}>
                  {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
