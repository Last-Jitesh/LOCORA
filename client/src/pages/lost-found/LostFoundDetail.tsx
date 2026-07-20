import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trash2, CheckCircle, ArrowLeft, PhoneCall, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../../api/lostfound';
import { useAuth } from '../../context/AuthContext';
import MapView from '../../components/MapView';
import type { LostFound } from '../../types';

export const LostFoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<LostFound | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealContact, setRevealContact] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await lostFoundApi.getById(id);
      if (res.data.success && res.data.data) setItem(res.data.data);
    } catch {
      toast.error('Failed to load item details.');
      navigate('/app/lost-found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const handleResolve = async () => {
    if (!id) return;
    try {
      await lostFoundApi.resolve(id);
      toast.success('Marked as resolved!');
      fetchDetails();
    } catch {
      toast.error('Failed to mark as resolved.');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await lostFoundApi.delete(id);
      toast.success('Report deleted.');
      navigate('/app/lost-found');
    } catch {
      toast.error('Failed to delete report.');
    }
  };

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading report…</p>
      </div>
    );
  }
  if (!item) return null;

  const isCreator = item.reportedBy._id === user?.id;
  const isOpen = item.status === 'open';

  return (
    <div className="page-shell fade-up">
      {/* Back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <Link to="/app/lost-found" className="back-link">
          <ArrowLeft size={16} /> Back to Board
        </Link>
        {isCreator && (
          <div style={{ display: 'flex', gap: 8 }}>
            {isOpen && (
              <button onClick={handleResolve} className="btn btn-outline btn-sm" id="resolve-btn">
                <CheckCircle size={14} /> Mark Resolved
              </button>
            )}
            <button onClick={handleDelete} className="btn btn-danger btn-sm" id="delete-lf-btn">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="detail-layout">
        {/* ── Main ───────────────────────────────────────────────────── */}
        <div className="detail-main">
          <div className="card">
            {/* Header badges */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <span className="badge badge-accent">{item.category}</span>
              <span className={`badge ${item.type === 'lost' ? 'badge-red' : 'badge-green'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {item.type === 'lost' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </span>
              <span className={`badge ${isOpen ? 'badge-green' : 'badge-gray'}`}>
                {isOpen ? 'Open' : 'Resolved'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', marginBottom: 16 }}>{item.title}</h1>

            {item.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-line' }}>
                {item.description}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box"><Calendar size={16} /></div>
                <div>
                  <div className="section-eyebrow">Date {item.type === 'lost' ? 'Lost' : 'Found'}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              {item.address && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', gridColumn: '1 / -1' }}>
                  <div className="meta-icon-box" style={{ marginTop: 2 }}><MapPin size={16} /></div>
                  <div>
                    <div className="section-eyebrow">Location</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14, lineHeight: 1.4 }}>{item.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          {item.location?.coordinates && (
            <div className="map-wrapper" style={{ height: 260 }}>
              <MapView
                lat={item.location.coordinates[1]}
                lng={item.location.coordinates[0]}
                zoom={16}
                popupLabel={`${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}`}
                className="map-wrapper"
              />
            </div>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="detail-sidebar">
          {/* Reporter */}
          <div className="card">
            <div className="section-eyebrow" style={{ marginBottom: 14 }}>Reported by</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="avatar avatar-md">
                {item.reportedBy.avatarUrl
                  ? <img src={item.reportedBy.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : item.reportedBy.name.charAt(0).toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }}>{item.reportedBy.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Neighbour</div>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, margin: '0 auto 12px',
                background: 'var(--accent-light)', borderRadius: '50%',
                display: 'grid', placeItems: 'center', color: 'var(--accent-dark)',
              }}>
                <PhoneCall size={20} />
              </div>
              <h3 style={{ fontSize: 14, marginBottom: 6 }}>Contact the reporter</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                For privacy, reveal contact only if you can genuinely help.
              </p>
            </div>

            {revealContact ? (
              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'left',
              }}>
                <div className="section-eyebrow" style={{ marginBottom: 8 }}>Contact preference</div>
                <p style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14, wordBreak: 'break-word' }}>
                  {item.contactPreference || `Email: ${item.reportedBy.email}`}
                </p>
                {!item.contactPreference && (
                  <a
                    href={`mailto:${item.reportedBy.email}`}
                    className="btn btn-outline btn-sm btn-full"
                    style={{ marginTop: 12 }}
                  >
                    Send Email
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={() => setRevealContact(true)}
                className="btn btn-primary btn-full"
                id="reveal-contact-btn"
              >
                <PhoneCall size={15} /> Show Contact Info
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFoundDetail;
