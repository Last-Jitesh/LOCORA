import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin } from 'lucide-react';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 16,
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 52, height: 52, background: 'var(--accent)',
          borderRadius: 14, display: 'grid', placeItems: 'center',
          boxShadow: '0 8px 24px rgba(232,144,26,.3)',
          animation: 'pulse .9s ease-in-out infinite alternate',
        }}>
          <MapPin size={26} color="#fff" strokeWidth={2.4} />
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
          Entering neighbourhood…
        </p>
        <style>{`@keyframes pulse { to { transform: scale(1.08); box-shadow: 0 12px 32px rgba(232,144,26,.4); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
