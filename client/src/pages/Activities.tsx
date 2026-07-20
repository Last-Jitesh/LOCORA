import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, MapPin, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
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
          {activities.map((act, i) => (
            <Link
              key={act._id}
              to={`/app/activity/${act._id}`}
              className={`item-card fade-up delay-${Math.min(i + 1, 3)}`}
              id={`activity-card-${act._id}`}
            >
              {/* Top row */}
              <div className="item-card-top">
                <span className="badge badge-accent">{act.category}</span>
                {act.interestedCount !== undefined && act.interestedCount > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Users size={13} /> {act.interestedCount}
                  </span>
                )}
              </div>

              {/* Title & desc */}
              <div>
                <div className="item-card-title">{act.title}</div>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Activities;
