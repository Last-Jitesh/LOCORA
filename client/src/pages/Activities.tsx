import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, MapPin, Calendar, Clock, ChevronRight, LocateFixed, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { activityApi } from '../api/activity';
import type { Activity } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';

const CATEGORIES = [
  { value: '',             label: 'All Categories' },
  { value: 'sport',        label: '🏃 Sports / Games' },
  { value: 'wellness',     label: '🧘 Wellness / Yoga' },
  { value: 'social',       label: '🎉 Social Meetups' },
  { value: 'education',    label: '📚 Education / Study' },
  { value: 'garage-sale',  label: '🏷️ Garage Sales' },
  { value: 'volunteering', label: '🤝 Volunteering' },
  { value: 'other',        label: '📌 Other Events' },
];

const DISTANCES = [
  { value: 2,  label: 'Within 2 km' },
  { value: 5,  label: 'Within 5 km' },
  { value: 15, label: 'Within 15 km' },
  { value: 30, label: 'Within 30 km' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [distance, setDistance] = useState(5);
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();

  const fetchActivities = useCallback(async () => {
    if (!coords) return; // Don't fetch without location
    setLoading(true);
    try {
      const params: Record<string, any> = {
        lat: coords.lat,
        lng: coords.lng,
        radius: distance,
      };
      if (category) params.category = category;
      const res = await activityApi.getAll(params);
      if (res.data.success && res.data.data) setActivities(res.data.data);
    } catch {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [coords, category, distance]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  // ── Location still loading ────────────────────────────────────────────────
  if (geoLoading) {
    return (
      <div className="page-shell fade-up">
        <div className="page-head">
          <div>
            <h1>Community Activities</h1>
            <p className="page-subtitle">Browse local gatherings and events near your block.</p>
          </div>
        </div>
        <div className="spinner-wrap" style={{ marginTop: 64 }}>
          <div className="spinner" />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>
            Getting your location…
          </p>
        </div>
      </div>
    );
  }

  // ── Location denied / not available ──────────────────────────────────────
  if (!coords) {
    return (
      <div className="page-shell fade-up">
        <div className="page-head">
          <div>
            <h1>Community Activities</h1>
            <p className="page-subtitle">Browse local gatherings and events near your block.</p>
          </div>
          <Link to="/app/activity/new" className="btn btn-primary" id="host-activity-btn">
            <Plus size={16} /> Host Activity
          </Link>
        </div>

        {/* Location required prompt */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '64px 24px',
          gap: 20,
        }}>
          <div style={{
            width: 72, height: 72,
            background: 'var(--accent-light)',
            borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            border: '2px solid var(--accent)',
          }}>
            <LocateFixed size={32} color="var(--accent)" strokeWidth={1.8} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-h)' }}>
              Location access needed
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
              Locora shows activities near <strong>your neighbourhood</strong>. We need your location to find events on your street — your data is never stored or shared.
            </p>
          </div>

          {geoError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--r-lg)', padding: '10px 16px',
              fontSize: 13, color: '#ef4444', fontWeight: 600,
            }}>
              <AlertTriangle size={15} />
              {geoError.includes('denied')
                ? 'Location blocked — please enable it in your browser settings'
                : geoError}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: 15 }}
            onClick={() => window.location.reload()}
          >
            <LocateFixed size={16} />
            Enable Location & Retry
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Or go to browser → Site Settings → Location → Allow
          </p>
        </div>
      </div>
    );
  }

  // ── Normal render (location available) ───────────────────────────────────
  return (
    <div className="page-shell fade-up">
      {/* Head */}
      <div className="page-head">
        <div>
          <h1>Community Activities</h1>
          <p className="page-subtitle">Browse local gatherings and events near your block.</p>
        </div>
        <Link to="/app/activity/new" className="btn btn-primary" id="host-activity-btn">
          <Plus size={16} /> Host Activity
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: 170 }}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
          className="form-control"
          style={{ width: 'auto', minWidth: 140 }}
        >
          {DISTANCES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Searching neighbourhood events…</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CalendarDays size={28} /></div>
          <h3>No activities found nearby</h3>
          <p>No events within {distance} km of your location. Try a wider radius or be the first to host one!</p>
          <Link to="/app/activity/new" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
            <Plus size={14} /> Host Activity
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {activities.map((act, i) => {
            const maxParts = act.maxParticipants || 10;
            const currParts = act.currentParticipants || 0;
            const isFull = currParts >= maxParts;
            const remaining = Math.max(0, maxParts - currParts);
            return (
              <Link
                key={act._id}
                to={`/app/activity/${act._id}`}
                className={`item-card fade-up delay-${Math.min(i + 1, 3)}`}
                id={`activity-card-${act._id}`}
              >
                {/* Top row */}
                <div className="item-card-top">
                  <span className="badge badge-accent">{act.category || 'Event'}</span>
                  {isFull ? (
                    <span className="badge badge-red">No Slots Left</span>
                  ) : (
                    <span className="badge badge-green" style={{ fontSize: 11 }}>
                      {remaining} {remaining === 1 ? 'slot' : 'slots'} left
                    </span>
                  )}
                </div>

                {/* Title & desc */}
                <div>
                  <div className="item-card-title">{act.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                    Joined: {currParts} / {maxParts}
                  </div>
                  {act.description && (
                    <div className="item-card-desc" style={{ marginTop: 6 }}>{act.description}</div>
                  )}
                </div>

                {/* Meta */}
                <div className="item-card-meta">
                  <div className="item-card-meta-row">
                    <Calendar size={13} />
                    <span>{formatDate(act.startTime)}</span>
                  </div>
                  <div className="item-card-meta-row">
                    <Clock size={13} />
                    <span>{formatTime(act.startTime)}</span>
                  </div>
                  {act.address && (
                    <div className="item-card-meta-row">
                      <MapPin size={13} />
                      <span className="truncate-1" style={{ maxWidth: 200 }}>{act.address}</span>
                    </div>
                  )}
                  {act.distance !== undefined && (
                    <div style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 700, marginTop: 2 }}>
                      {(act.distance / 1000).toFixed(1)} km away
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="item-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)' }}>View details</span>
                  <ChevronRight size={16} color="var(--accent)" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Activities;


const CATEGORIES = [
  { value: '',             label: 'All Categories' },
  { value: 'sport',        label: '🏃 Sports / Games' },
  { value: 'wellness',     label: '🧘 Wellness / Yoga' },
  { value: 'social',       label: '🎉 Social Meetups' },
  { value: 'education',    label: '📚 Education / Study' },
  { value: 'garage-sale',  label: '🏷️ Garage Sales' },
  { value: 'volunteering', label: '🤝 Volunteering' },
  { value: 'other',        label: '📌 Other Events' },
];

const DISTANCES = [
  { value: 2,  label: 'Within 2 km' },
  { value: 5,  label: 'Within 5 km' },
  { value: 15, label: 'Within 15 km' },
  { value: 30, label: 'Within 30 km' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [distance, setDistance] = useState(5);
  const { coords } = useGeolocation();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; params.radius = distance; }
      if (category) params.category = category;
      const res = await activityApi.getAll(params);
      if (res.data.success && res.data.data) setActivities(res.data.data);
    } catch {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [coords, category, distance]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return (
    <div className="page-shell fade-up">
      {/* Head */}
      <div className="page-head">
        <div>
          <h1>Community Activities</h1>
          <p className="page-subtitle">Browse local gatherings and events near your block.</p>
        </div>
        <Link to="/app/activity/new" className="btn btn-primary" id="host-activity-btn">
          <Plus size={16} /> Host Activity
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: 170 }}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {coords && (
          <select
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
            className="form-control"
            style={{ width: 'auto', minWidth: 140 }}
          >
            {DISTANCES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Searching neighbourhood events…</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CalendarDays size={28} /></div>
          <h3>No activities found</h3>
          <p>Be the first to host an activity on your block!</p>
          <Link to="/app/activity/new" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
            <Plus size={14} /> Host Activity
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {activities.map((act, i) => {
            const maxParts = act.maxParticipants || 10;
            const currParts = act.currentParticipants || 0;
            const isFull = currParts >= maxParts;
            const remaining = Math.max(0, maxParts - currParts);
            return (
              <Link
                key={act._id}
                to={`/app/activity/${act._id}`}
                className={`item-card fade-up delay-${Math.min(i + 1, 3)}`}
                id={`activity-card-${act._id}`}
              >
                {/* Top row */}
                <div className="item-card-top">
                  <span className="badge badge-accent">{act.category || 'Event'}</span>
                  {isFull ? (
                    <span className="badge badge-red">No Slots Left</span>
                  ) : (
                    <span className="badge badge-green" style={{ fontSize: 11 }}>
                      {remaining} {remaining === 1 ? 'slot' : 'slots'} left
                    </span>
                  )}
                </div>

                {/* Title & desc */}
                <div>
                  <div className="item-card-title">{act.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                    Joined: {currParts} / {maxParts}
                  </div>
                  {act.description && (
                    <div className="item-card-desc" style={{ marginTop: 6 }}>{act.description}</div>
                  )}
                </div>

                {/* Meta */}
                <div className="item-card-meta">
                  <div className="item-card-meta-row">
                    <Calendar size={13} />
                    <span>{formatDate(act.startTime)}</span>
                  </div>
                  <div className="item-card-meta-row">
                    <Clock size={13} />
                    <span>{formatTime(act.startTime)}</span>
                  </div>
                  {act.address && (
                    <div className="item-card-meta-row">
                      <MapPin size={13} />
                      <span className="truncate-1" style={{ maxWidth: 200 }}>{act.address}</span>
                    </div>
                  )}
                  {act.distance !== undefined && (
                    <div style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 700, marginTop: 2 }}>
                      {(act.distance / 1000).toFixed(1)} km away
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="item-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)' }}>View details</span>
                  <ChevronRight size={16} color="var(--accent)" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Activities;
