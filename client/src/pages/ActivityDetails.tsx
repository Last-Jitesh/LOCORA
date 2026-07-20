import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, Trash2, ArrowLeft, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { activityApi } from '../api/activity';
import type { ActivityInterestResponse } from '../api/activity';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import type { Activity } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export const ActivityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [interestedUsers, setInterestedUsers] = useState<ActivityInterestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await activityApi.getById(id);
      if (res.data.success && res.data.data) setActivity(res.data.data);

      const iRes = await activityApi.getInterestedUsers(id);
      if (iRes.data.success && iRes.data.data) {
        setInterestedUsers(iRes.data.data);
        setIsInterested(iRes.data.data.some(i => i.userId._id === user?.id));
      }
    } catch {
      toast.error('Failed to load activity details.');
      navigate('/app/activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id, user]);

  const handleToggleInterest = async () => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      await activityApi.toggleInterest(id);
      toast.success(isInterested ? 'Removed interest.' : 'Interest expressed! The host will be notified.');
      await fetchDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this activity? This cannot be undone.')) return;
    try {
      await activityApi.delete(id);
      toast.success('Activity deleted.');
      navigate('/app/activity');
    } catch {
      toast.error('Failed to delete activity.');
    }
  };

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading event…</p>
      </div>
    );
  }

  if (!activity) return null;
  const isCreator = activity.createdBy._id === user?.id;

  return (
    <div className="page-shell fade-up">
      {/* Back + delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <Link to="/app/activity" className="back-link">
          <ArrowLeft size={16} /> Back to Activities
        </Link>
        {isCreator && (
          <button onClick={handleDelete} className="btn btn-danger btn-sm" id="delete-activity-btn">
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      <div className="detail-layout">
        {/* ── Main panel ─────────────────────────────────────────────── */}
        <div className="detail-main">
          {/* Event header card */}
          <div className="card">
            <span className="badge badge-accent" style={{ marginBottom: 16 }}>{activity.category}</span>
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: 12 }}>{activity.title}</h1>
            {activity.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-line' }}>
                {activity.description}
              </p>
            )}

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box"><Calendar size={16} /></div>
                <div>
                  <div className="section-eyebrow">Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>{formatDate(activity.startTime)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box"><Clock size={16} /></div>
                <div>
                  <div className="section-eyebrow">Time</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>
                    {formatTime(activity.startTime)}
                    {activity.endTime && ` – ${formatTime(activity.endTime)}`}
                  </div>
                </div>
              </div>
              {activity.address && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', gridColumn: '1 / -1' }}>
                  <div className="meta-icon-box" style={{ marginTop: 2 }}><MapPin size={16} /></div>
                  <div>
                    <div className="section-eyebrow">Location</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14, lineHeight: 1.4 }}>{activity.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          {activity.location?.coordinates && (
            <div className="map-wrapper" style={{ height: 280 }}>
              <MapView
                lat={activity.location.coordinates[1]}
                lng={activity.location.coordinates[0]}
                zoom={16}
                popupLabel={activity.title}
                className="map-wrapper"
              />
            </div>
          )}
        </div>

        {/* ── Sidebar panel ──────────────────────────────────────────── */}
        <div className="detail-sidebar">
          {/* Interest CTA */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, margin: '0 auto 12px',
                background: 'var(--accent-light)', borderRadius: '50%',
                display: 'grid', placeItems: 'center', color: 'var(--accent-dark)',
              }}>
                <Star size={22} />
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 6 }}>Join this activity?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Let the host know you're interested.
              </p>
            </div>

            <button
              onClick={handleToggleInterest}
              disabled={actionLoading || isCreator}
              className={isInterested ? 'btn btn-outline btn-full' : 'btn btn-primary btn-full'}
              id="express-interest-btn"
            >
              {actionLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <Star size={16} style={{ fill: isInterested ? 'var(--accent)' : 'none' }} />
              }
              {isInterested ? 'Interested ✓' : 'Express Interest'}
            </button>

            {isCreator && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                You are hosting this activity.
              </p>
            )}
          </div>

          {/* Host info */}
          <div className="card">
            <div className="section-eyebrow" style={{ marginBottom: 14 }}>Hosted by</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="avatar avatar-md">
                {activity.createdBy.avatarUrl
                  ? <img src={activity.createdBy.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : activity.createdBy.name.charAt(0).toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }}>{activity.createdBy.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Neighbour</div>
              </div>
            </div>
          </div>

          {/* Interested neighbors */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div className="section-eyebrow" style={{ margin: 0 }}>Interested</div>
              {interestedUsers.length > 0 && (
                <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
                  <Users size={10} /> {interestedUsers.length}
                </span>
              )}
            </div>
            {interestedUsers.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No neighbours interested yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                {interestedUsers.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="avatar avatar-sm">
                      {item.userId.avatarUrl
                        ? <img src={item.userId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : item.userId.name.charAt(0).toUpperCase()
                      }
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>{item.userId.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
