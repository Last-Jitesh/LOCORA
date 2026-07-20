import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trash2, ArrowLeft, Loader2, Send, Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceAlertApi } from '../../api/serviceAlerts';
import type { ServiceAlertInterestResponse } from '../../api/serviceAlerts';
import { useAuth } from '../../context/AuthContext';
import MapView from '../../components/MapView';
import type { ServiceAlert } from '../../types';

export const ServiceAlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [alertData, setAlertData] = useState<ServiceAlert | null>(null);
  const [interests, setInterests] = useState<ServiceAlertInterestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestMessage, setInterestMessage] = useState('');
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await serviceAlertApi.getById(id);
      if (res.data.success && res.data.data) {
        setAlertData(res.data.data);
        
        // Only fetch list of interests if user is creator
        if (res.data.data.createdBy._id === user?.id) {
          const interestRes = await serviceAlertApi.getInterested(id);
          if (interestRes.data.success && interestRes.data.data) {
            setInterests(interestRes.data.data);
          }
        } else {
          // If not creator, see if user has already expressed interest
          const interestRes = await serviceAlertApi.getInterested(id).catch(() => null);
          if (interestRes && interestRes.data?.success && interestRes.data?.data) {
            setInterests(interestRes.data.data);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load service alert details.');
      navigate('/app/service-alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  const handleCloseAlert = async () => {
    if (!id || !window.confirm('Are you sure you want to close this service alert?')) return;
    try {
      await serviceAlertApi.close(id);
      toast.success('Service alert closed.');
      fetchDetails();
    } catch (err) {
      toast.error('Failed to close service alert.');
    }
  };

  const handleExpressInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || submittingInterest) return;
    setSubmittingInterest(true);
    try {
      await serviceAlertApi.expressInterest(id, interestMessage);
      toast.success('Your piggyback request has been sent to the host!');
      setInterestMessage('');
      fetchDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmittingInterest(false);
    }
  };

  const handleInterestAction = async (interestId: string, status: 'accepted' | 'declined') => {
    if (!id) return;
    setActionLoadingId(interestId);
    try {
      await serviceAlertApi.updateInterestStatus(id, interestId, status);
      toast.success(`Request ${status}!`);
      fetchDetails();
    } catch (err) {
      toast.error('Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading alert details...</p>
      </div>
    );
  }

  if (!alertData) return null;

  const isCreator = alertData.createdBy._id === user?.id;
  const isOpen = alertData.status === 'open';

  // Find current user's interest request if they are not the creator
  const myInterest = interests.find((item) => item.userId._id === user?.id);

  return (
    <div className="page-shell fade-up">
      {/* Back and actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <Link to="/app/service-alerts" className="back-link">
          <ArrowLeft size={16} /> Back to Alerts
        </Link>
        {isCreator && isOpen && (
          <button onClick={handleCloseAlert} className="btn btn-danger btn-sm" id="close-broadcast-btn">
            <X size={14} /> Close Broadcast
          </button>
        )}
      </div>

      <div className="detail-layout">
        {/* Main Panel */}
        <div className="detail-main">
          <div className="card">
            {/* Header badges */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
              <span className="badge badge-accent">
                {alertData.serviceType === 'other' && alertData.customServiceType
                  ? alertData.customServiceType
                  : alertData.serviceType}
              </span>
              <span className={`badge ${isOpen ? 'badge-green' : 'badge-gray'}`}>
                {isOpen ? 'Scheduled' : 'Closed'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', marginBottom: 16 }}>
              {alertData.providerName ? `${alertData.providerName} Visiting` : 'Specialist Visit Scheduled'}
            </h1>

            {alertData.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-line' }}>
                {alertData.description}
              </p>
            )}

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box"><Calendar size={16} /></div>
                <div>
                  <div className="section-eyebrow">Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>
                    {new Date(alertData.scheduledTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="meta-icon-box"><Clock size={16} /></div>
                <div>
                  <div className="section-eyebrow">Time</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14 }}>
                    {new Date(alertData.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {alertData.address && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', gridColumn: '1 / -1' }}>
                  <div className="meta-icon-box" style={{ marginTop: 2 }}><MapPin size={16} /></div>
                  <div>
                    <div className="section-eyebrow">Location</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 14, lineHeight: 1.4 }}>{alertData.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Location */}
          {alertData.location?.coordinates && (
            <div className="map-wrapper" style={{ height: 260 }}>
              <MapView
                lat={alertData.location.coordinates[1]}
                lng={alertData.location.coordinates[0]}
                zoom={16}
                popupLabel={`${alertData.serviceType} visit at ${alertData.providerName || 'Local Specialist'}`}
                className="map-wrapper"
              />
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="detail-sidebar">
          {/* Host info */}
          <div className="card">
            <div className="section-eyebrow" style={{ marginBottom: 14 }}>Broadcast by</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="avatar avatar-md">
                {alertData.createdBy.avatarUrl
                  ? <img src={alertData.createdBy.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : alertData.createdBy.name.charAt(0).toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }}>{alertData.createdBy.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Neighbour</div>
              </div>
            </div>
          </div>

          {/* Action Card: Piggyback request */}
          {!isCreator && (
            <div className="card">
              <h3 style={{ fontSize: 14, marginBottom: 8 }}>Piggyback on this visit</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                Ask the host if you can share this provider's visit to split call-out fees.
              </p>
              
              {!isOpen ? (
                <div style={{
                  background: 'var(--err-bg)', border: '1.5px solid rgba(192,57,43,.15)',
                  color: 'var(--err)', borderRadius: 'var(--r-md)', padding: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                }}>
                  <ShieldAlert size={14} />
                  <span>This visit window is closed.</span>
                </div>
              ) : myInterest ? (
                <div style={{
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <span className="section-eyebrow" style={{ margin: 0 }}>Your Request Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`badge ${
                      myInterest.status === 'accepted' ? 'badge-green' :
                      myInterest.status === 'declined' ? 'badge-red' : 'badge-warm'
                    }`}>
                      {myInterest.status}
                    </span>
                  </div>
                  {myInterest.status === 'accepted' && (
                    <div style={{ fontSize: 12, color: 'var(--text-body)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      Approved! Contact: <strong style={{ color: 'var(--text-h)' }}>{alertData.createdBy.email}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleExpressInterest} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. 'I need a small wire fix too, take 10 minutes'"
                    value={interestMessage}
                    onChange={(e) => setInterestMessage(e.target.value)}
                    className="form-control"
                    style={{ fontSize: 13, minHeight: 80 }}
                  />
                  <button
                    type="submit"
                    disabled={submittingInterest}
                    className="btn btn-primary btn-full btn-sm"
                  >
                    {submittingInterest ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>Request Piggyback</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* List of piggybackers (Creator View) */}
          {isCreator && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div className="section-eyebrow" style={{ margin: 0 }}>Piggyback Requests</div>
                {interests.length > 0 && (
                  <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
                    {interests.length}
                  </span>
                )}
              </div>

              {interests.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No neighbor requests yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 300, overflowY: 'auto' }}>
                  {interests.map((item) => (
                    <div key={item._id} className="interest-item">
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="avatar avatar-sm">
                              {item.userId.avatarUrl ? (
                                <img src={item.userId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                              ) : (
                                item.userId.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)' }}>{item.userId.name}</span>
                          </div>
                          <span className={`badge ${
                            item.status === 'accepted' ? 'badge-green' :
                            item.status === 'declined' ? 'badge-red' : 'badge-warm'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        {item.message && (
                          <p style={{ fontSize: 12, color: 'var(--text-body)', fontStyle: 'italic', background: 'var(--n-0)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 8 }}>
                            "{item.message}"
                          </p>
                        )}

                        {item.status === 'pending' && isOpen && (
                          <div className="interest-actions">
                            <button
                              onClick={() => handleInterestAction(item._id, 'accepted')}
                              disabled={actionLoadingId === item._id}
                              className="btn btn-primary btn-sm"
                              style={{ flex: 1, padding: '5px 10px', fontSize: 11, background: 'var(--ok)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#226b3c')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ok)')}
                            >
                              <Check size={11} /> Accept
                            </button>
                            <button
                              onClick={() => handleInterestAction(item._id, 'declined')}
                              disabled={actionLoadingId === item._id}
                              className="btn btn-danger btn-sm"
                              style={{ flex: 1, padding: '5px 10px', fontSize: 11 }}
                            >
                              <X size={11} /> Decline
                            </button>
                          </div>
                        )}

                        {item.status === 'accepted' && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Email: <span style={{ color: 'var(--text-body)' }}>{item.userId.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceAlertDetail;
