import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { activityApi } from '../api/activity';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import type { Activity, ActivityMessage } from '../types';

export const ActivityGroupChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [messages, setMessages] = useState<ActivityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadChatData = async () => {
    if (!id) return;
    try {
      // 1. Fetch activity details to verify participant status
      const actRes = await activityApi.getById(id);
      if (!actRes.data.success || !actRes.data.data) {
        toast.error('Activity not found.');
        navigate('/app/activity');
        return;
      }
      const act = actRes.data.data;
      setActivity(act);

      // Verify authorization
      const isHost = act.createdBy._id === user?.id;

      // Note: We might need to refetch participants lists explicitly if it's not pre-populated in getById.
      // Let's also fetch participants to be sure.
      const partRes = await activityApi.getParticipants(id);
      const actsParticipants = partRes.data.data.participants;
      const isActuallyJoined = actsParticipants.some(p => p._id === user?.id || p.id === user?.id);

      if (!isHost && !isActuallyJoined) {
        toast.error('Only participants can access this activity group chat.');
        navigate(`/app/activity/${id}`);
        return;
      }

      // 2. Fetch messages history
      const msgRes = await activityApi.getMessages(id);
      if (msgRes.data.success && msgRes.data.data) {
        setMessages(msgRes.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load chat history.');
      navigate(`/app/activity/${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [id, user]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listener for real-time messages
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinActivityRoom', { activityId: id });

    socket.on('activityMessage', (message: ActivityMessage) => {
      if (String(message.activityId) === String(id)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on('user:blocked', (data: { blockedUserId: string; activityId: string; message: string }) => {
      if (data.activityId === id && data.blockedUserId === user?.id) {
        toast.error('You have been blocked from this activity by the host.');
        navigate('/app/activity');
      }
    });

    return () => {
      socket.emit('leaveActivityRoom', { activityId: id });
      socket.off('activityMessage');
      socket.off('user:blocked');
    };
  }, [socket, id, user, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !id) return;

    socket.emit('sendActivityMessage', {
      activityId: id,
      message: newMessage.trim(),
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading chat room…</p>
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="page-shell fade-up" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Link to={`/app/activity/${activity._id}`} className="back-link" style={{ marginBottom: 0 }}>
          <ArrowLeft size={16} /> Details
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }} className="truncate-1">
            <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
            <span>{activity.title} — Chat</span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Secure activity group chat • {messages.length} messages</p>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontSize: 13, fontStyle: 'italic' }}>No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId._id === user?.id || (msg.senderId as any).id === user?.id;
            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                }}
              >
                {/* Sender avatar */}
                <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                  {msg.senderId.avatarUrl ? (
                    <img src={msg.senderId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    msg.senderId.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Message body */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-h)' }}>
                      {isMe ? 'You' : msg.senderId.name}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    style={{
                      background: isMe ? 'var(--accent)' : 'var(--bg-subtle)',
                      color: isMe ? '#ffffff' : 'var(--text-h)',
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      fontSize: 13,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="form-control"
          style={{ borderRadius: '24px', paddingLeft: 18 }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="btn btn-primary"
          style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'grid', placeItems: 'center', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ActivityGroupChat;
