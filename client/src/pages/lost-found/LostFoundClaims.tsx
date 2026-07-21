import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../../api/lostfound';
import { useAuth } from '../../context/AuthContext';
import type { LostFoundChat } from '../../types';

export const LostFoundClaims: React.FC = () => {
  const [chats, setChats] = useState<LostFoundChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      const res = await lostFoundApi.getMyClaims();
      if (res.data.success && res.data.data) {
        setChats(res.data.data);
      }
    } catch {
      toast.error('Failed to load claim chats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading claims list…</p>
      </div>
    );
  }

  return (
    <div className="page-shell fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/app/lost-found" className="back-link" style={{ marginBottom: 0 }}>
          <ArrowLeft size={16} /> Back to Board
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Claim Chats</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Active conversations regarding lost & found items.
          </p>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <MessageSquare size={26} />
          </div>
          <h3>No claim chats found</h3>
          <p>
            When you initiate a claim on someone else's post or when someone initiates a claim on your report, conversations will appear here.
          </p>
          <Link to="/app/lost-found" className="btn btn-primary" style={{ marginTop: 12 }}>
            Browse Board
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {chats.map((chat) => {
            const isOwner = chat.ownerId._id === user?.id;
            const partner = isOwner ? chat.claimantId : chat.ownerId;
            const item = chat.itemId;
            const lastMsg = chat.messages[chat.messages.length - 1];

            return (
              <div
                key={chat._id}
                onClick={() => navigate(`/app/lost-found/chats/${chat._id}`)}
                style={{
                  padding: 18,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                className="hover-card"
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-accent" style={{ fontSize: 10 }}>
                      {item?.title || 'Deleted Item'}
                    </span>
                    <span
                      className={`badge ${
                        item?.type === 'lost' ? 'badge-red' : 'badge-green'
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {item?.type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span
                      className={`badge ${
                        item?.status === 'resolved' ? 'badge-gray' : 'badge-green'
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {item?.status === 'resolved' ? 'Resolved' : 'Active'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-h)', marginBottom: 6 }}>
                    Chat with {partner.name}
                  </h3>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    <span>Updated {new Date(chat.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </p>

                  {lastMsg ? (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '6px 10px',
                        borderRadius: 'var(--r-sm)',
                        display: 'inline-block',
                        maxWidth: '100%',
                      }}
                      className="truncate-1"
                    >
                      <strong>{lastMsg.senderId === user?.id ? 'You' : partner.name}:</strong> {lastMsg.text}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 10 }}>
                      No messages yet. Send a greeting to begin coordinate transfer.
                    </p>
                  )}
                </div>

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    color: 'var(--accent-dark)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LostFoundClaims;
