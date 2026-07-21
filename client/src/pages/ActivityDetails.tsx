import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trash2, ArrowLeft, Loader2, Users, MessageSquare, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { activityApi } from '../api/activity';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import useSocket from '../hooks/useSocket';
import type { Activity, User } from '../types';

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
  const socket = useSocket();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await activityApi.getById(id);
      if (res.data.success && res.data.data) {
        setActivity(res.data.data);
      }
    } catch {
      toast.error('Failed to load activity details.');
      navigate('/app/activity');
    }
  };

  const fetchParticipants = async () => {
    if (!id) return;
    try {
      const res = await activityApi.getParticipants(id);
      if (res.data.success && res.data.data) {
        setParticipants(res.data.data.participants);
        setIsJoined(res.data.data.participants.some(p => p._id === user?.id || p.id === user?.id));
      }
    } catch (err) {
      console.error('Failed to load participants list', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchDetails(), fetchParticipants()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [id, user]);

  // Socket.IO Room Listeners for Real-Time counter & Moderation
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinActivityRoom', { activityId: id });

    socket.on('participant:update', (data: { activityId: string; currentParticipants: number; maxParticipants: number; isFull: boolean }) => {
      if (data.activityId === id) {
        setActivity(prev => prev ? {
          ...prev,
          currentParticipants: data.currentParticipants,
          maxParticipants: data.maxParticipants
        } : null);
        fetchParticipants();
      }
    });

    socket.on('user:blocked', (data: { blockedUserId: string; activityId: string; message: string }) => {
      if (data.activityId === id && data.blockedUserId === user?.id) {
        toast.error(data.message);
        navigate('/app/activity');
      }
    });

    return () => {
      socket.emit('leaveActivityRoom', { activityId: id });
      socket.off('participant:update');
      socket.off('user:blocked');
    };
  }, [socket, id, user, navigate]);

  const handleJoinLeave = async () => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      if (isJoined) {
        await activityApi.leave(id);
        toast.success('You left this activity.');
      } else {
        await activityApi.join(id);
        toast.success('Successfully joined the activity!');
      }
      await Promise.all([fetchDetails(), fetchParticipants()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockParticipant = async (participantId: string, participantName: string) => {
    if (!id || !window.confirm(`Are you sure you want to block ${participantName}? They will be removed from this activity, from the group chat, and blocked from all your future hosted activities.`)) return;
    try {
      await activityApi.blockUser({ blockedUserId: participantId, activityId: id });
      toast.success(`${participantName} has been blocked.`);
      await Promise.all([fetchDetails(), fetchParticipants()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to block user.');
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
  const hostId = typeof activity.createdBy === 'object' ? (activity.createdBy as any)?._id : activity.createdBy;
  const hostName = typeof activity.createdBy === 'object' ? (activity.createdBy as any)?.name : 'Host Neighbour';
  const hostAvatar = typeof activity.createdBy === 'object' ? (activity.createdBy as any)?.avatarUrl : undefined;
  const isCreator = Boolean(hostId && user?.id && String(hostId) === String(user.id));

  const maxParts = activity.maxParticipants || 10;
  const currParts = activity.currentParticipants || 0;
  const remainingSlots = Math.max(0, maxParts - currParts);
  const isFull = currParts >= maxParts;
  const canAccessChat = isCreator || isJoined;

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
            <span className="badge badge-accent" style={{ marginBottom: 16 }}>{activity.category || 'Event'}</span>
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

          {/* Map (Optional display if lat/lng are set) */}
          {activity.location?.coordinates && activity.location.coordinates[0] !== 0 && (
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
          {/* Join / Leave CTA */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, margin: '0 auto 12px',
                background: 'var(--accent-light)', borderRadius: '50%',
                display: 'grid', placeItems: 'center', color: 'var(--accent-dark)',
              }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 6 }}>
                {isCreator ? 'Hosting Activity' : 'Join this activity?'}
              </h3>
              
              {/* Real-time counters */}
              <div style={{ margin: '12px 0', padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h)' }}>
                  Joined: {currParts} / {maxParts}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {isFull ? (
                    <span style={{ color: 'var(--err)', fontWeight: 600 }}>No Slots Left</span>
                  ) : (
                    `Remaining Slots: ${remainingSlots}`
                  )}
                </div>
              </div>
            </div>

            {!isCreator && (
              <button
                onClick={handleJoinLeave}
                disabled={actionLoading || (isFull && !isJoined)}
                className={isJoined ? 'btn btn-outline btn-full' : 'btn btn-primary btn-full'}
                id="join-activity-btn"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isJoined ? (
                  'Leave Activity'
                ) : isFull ? (
                  'No Slots Left'
                ) : (
                  'Join Activity'
                )}
              </button>
            )}

            {/* Chat button */}
            {canAccessChat && (
              <Link
                to={`/app/activity/${activity._id}/chat`}
                className="btn btn-accent btn-full"
                style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                id="open-group-chat-btn"
              >
                <MessageSquare size={16} /> Open Group Chat
              </Link>
            )}

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
              <div className="avatar avatar-md" style={{ cursor: 'pointer' }} onClick={() => hostId && navigate(`/app/users/${hostId}`)}>
                {hostAvatar ? (
                  <img src={hostAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  hostName.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14, cursor: 'pointer' }}
                  onClick={() => hostId && navigate(`/app/users/${hostId}`)}
                >
                  {hostName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Host Neighbour</div>
              </div>
            </div>
          </div>

          {/* Participant list */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div className="section-eyebrow" style={{ margin: 0 }}>Participants ({participants.length})</div>
            </div>
            {participants.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No participants joined yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 250, overflowY: 'auto' }}>
                {participants.map(p => (
                  <div key={p._id || p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => navigate(`/app/users/${p._id || p.id}`)}
                      >
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          p.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)', cursor: 'pointer' }}
                        className="truncate-1"
                        onClick={() => navigate(`/app/users/${p._id || p.id}`)}
                      >
                        {p.name}
                      </span>
                    </div>

                    {/* Host moderation block button */}
                    {isCreator && (p._id !== user?.id && p.id !== user?.id) && (
                      <button
                        onClick={() => handleBlockParticipant(p._id || p.id || '', p.name)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ShieldAlert size={12} /> Block
                      </button>
                    )}
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
