import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../../api/lostfound';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import type { LostFoundChat, LostFoundMessage } from '../../types';

export const LostFoundChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // chatId
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [chat, setChat] = useState<LostFoundChat | null>(null);
  const [messages, setMessages] = useState<LostFoundMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadChatData = async () => {
    if (!id) return;
    try {
      const res = await lostFoundApi.getChat(id);
      if (res.data.success && res.data.data) {
        setChat(res.data.data);
        setMessages(res.data.data.messages || []);
      } else {
        toast.error('Chat not found.');
        navigate('/app/lost-found');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load chat.');
      navigate('/app/lost-found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect socket and listen for live messages
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinLostFoundChat', { chatId: id });

    socket.on('lostFoundMessage', (message: LostFoundMessage) => {
      setMessages((prev) => {
        // Prevent duplicate append
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.off('lostFoundMessage');
    };
  }, [socket, id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !id) return;

    socket.emit('sendLostFoundMessage', {
      chatId: id,
      text: newMessage.trim(),
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="page-shell spinner-wrap">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading private chat…</p>
      </div>
    );
  }

  if (!chat) return null;

  const isOwner = chat.ownerId._id === user?.id;
  const partnerName = isOwner ? chat.claimantId.name : chat.ownerId.name;
  const itemTitle = chat.itemId?.title || 'Reported Item';
  const itemStatus = chat.itemId?.status || 'open';

  return (
    <div className="page-shell fade-up" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} className="back-link" style={{ marginBottom: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }} className="truncate-1">
            <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
            <span>Chat with {partnerName}</span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Regarding: <strong>{itemTitle}</strong> • {itemStatus === 'resolved' ? 'Resolved' : 'Open'}
          </p>
        </div>
      </div>

      {/* Messages list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', maxWidth: 300 }}>
            <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>Start the chat</p>
            <p style={{ fontSize: 12, lineHeight: 1.4 }}>
              Coordinate safe return details. We recommend meeting in a well-lit, public location.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg._id || idx}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? 'var(--accent)' : 'var(--bg-subtle)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    color: isMe ? 'var(--accent-text, #ffffff)' : 'var(--text-h)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </p>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 9,
                      textAlign: 'right',
                      marginTop: 4,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Warning message banner */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          background: 'rgba(217, 119, 6, 0.1)',
          border: '1px solid rgba(217, 119, 6, 0.2)',
          borderRadius: 'var(--r-md)',
          padding: '10px 12px',
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <ShieldAlert size={16} style={{ color: 'rgb(217, 119, 6)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Safety Tip: Do not share sensitive personal information. Agree to meet in public spaces if handovers are required.
        </p>
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          gap: 8,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          padding: '6px 8px',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${partnerName}...`}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: 'var(--text-h)',
            padding: '6px 8px',
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="btn btn-accent btn-sm"
          style={{ borderRadius: 'var(--r-sm)', padding: '6px 12px' }}
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  );
};

export default LostFoundChatPage;
