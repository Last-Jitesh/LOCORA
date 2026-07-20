import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../api/lostfound';
import type { LostFound } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';

const CATEGORIES = [
  { value: '',           label: 'All Categories' },
  { value: 'pet',        label: '🐾 Pets' },
  { value: 'keys',       label: '🔑 Keys' },
  { value: 'wallet',     label: '👛 Wallets / Purses' },
  { value: 'phone',      label: '📱 Phones / Devices' },
  { value: 'bag',        label: '🎒 Bags / Backpacks' },
  { value: 'documents',  label: '📄 Documents / ID' },
  { value: 'jewellery',  label: '💍 Jewelry / Watches' },
  { value: 'other',      label: '📦 Other' },
];

export const LostFoundBoard: React.FC = () => {
  const [items, setItems] = useState<LostFound[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [category, setCategory] = useState('');
  const [distance, setDistance] = useState(5);
  const { coords } = useGeolocation();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { type, status: 'open' };
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; params.radius = distance; }
      if (category) params.category = category;
      const res = await lostFoundApi.getAll(params);
      if (res.data.success && res.data.data) setItems(res.data.data);
    } catch {
      toast.error('Failed to load Lost & Found board');
    } finally {
      setLoading(false);
    }
  }, [coords, type, category, distance]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <div className="page-shell fade-up">
      {/* Head */}
      <div className="page-head">
        <div>
          <h1>Lost & Found</h1>
          <p className="page-subtitle">Report lost items or browse found objects in your neighbourhood.</p>
        </div>
        <Link to="/app/lost-found/new" className="btn btn-primary" id="report-item-btn">
          <Plus size={16} /> Report Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${type === 'lost' ? 'active' : ''}`}
          onClick={() => setType('lost')}
          id="tab-lost"
        >
          Lost Items
        </button>
        <button
          className={`tab-btn ${type === 'found' ? 'active' : ''}`}
          onClick={() => setType('found')}
          id="tab-found"
        >
          Found Items
        </button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: 190 }}
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
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={15}>Within 15 km</option>
            <option value={30}>Within 30 km</option>
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Searching reported items…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={26} /></div>
          <h3>No {type} items reported</h3>
          <p>
            {type === 'lost'
              ? 'Great news — no lost items in this area. If you lost something, report it here.'
              : 'Nothing found yet. If you found an item, click "Report Item" to help out.'}
          </p>
          <Link to="/app/lost-found/new" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
            <Plus size={14} /> Report Item
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {items.map((item, i) => (
            <Link
              key={item._id}
              to={`/app/lost-found/${item._id}`}
              className={`item-card fade-up delay-${Math.min(i + 1, 3)}`}
              id={`lf-card-${item._id}`}
            >
              <div className="item-card-top">
                <span className="badge badge-accent">{item.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}
                  className={item.type === 'lost' ? 'text-danger' : 'text-success'}>
                  {item.type === 'lost'
                    ? <AlertTriangle size={13} />
                    : <CheckCircle size={13} />
                  }
                  {item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
              </div>

              <div>
                <div className="item-card-title">{item.title}</div>
                {item.description && (
                  <div className="item-card-desc" style={{ marginTop: 6 }}>{item.description}</div>
                )}
              </div>

              <div className="item-card-meta">
                <div className="item-card-meta-row">
                  <Calendar size={13} />
                  <span>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {item.address && (
                  <div className="item-card-meta-row">
                    <MapPin size={13} />
                    <span className="truncate-1" style={{ maxWidth: 200 }}>{item.address}</span>
                  </div>
                )}
                {item.distance !== undefined && (
                  <div style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 700, marginTop: 2 }}>
                    {(item.distance / 1000).toFixed(1)} km away
                  </div>
                )}
              </div>

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

export default LostFoundBoard;
