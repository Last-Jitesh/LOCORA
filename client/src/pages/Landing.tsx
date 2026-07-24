import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, Search, Wrench, ArrowRight, MapPin, Users, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Read the isLoggedIn cookie — set by JS on the frontend domain after login
const getLoggedInCookie = () =>
  document.cookie.split('; ').some(c => c.startsWith('isLoggedIn=true'));

const features = [
  {
    icon: CalendarDays,
    title: 'Community Activities',
    desc: 'Discover morning walks, park sports, garage sales, and block meetups organized by neighbors just around the corner.',
  },
  {
    icon: Search,
    title: 'Lost & Found',
    desc: 'Report a missing pet, lost keys, or a found wallet. Reconnect items with their owners quickly and safely.',
  },
  {
    icon: Wrench,
    title: 'Service Piggybacking',
    desc: 'Plumber coming over? Broadcast it to neighbors so they can save on call-out fees by booking the same visit.',
  },
];

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If cookie says logged-in, send them straight to the app immediately
  // (synchronous — no waiting for the async checkAuth to complete)
  if (getLoggedInCookie()) {
    return <Navigate to="/app/activity" replace />;
  }

  useEffect(() => {
    // Wake up the backend on Render so that the server is ready by the time the user reaches the sign in page
    fetch(`${import.meta.env.VITE_API_URL}/health`).catch(() => {});
  }, []);

  return (
    <div className="landing-shell">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        {/* Nav */}
        <div className="landing-nav">
          <Link to="/" className="landing-nav-logo">
            <span className="landing-nav-logo-mark">
              <MapPin size={20} strokeWidth={2.4} />
            </span>
            <span>
              <strong>locora</strong>
              <small>your neighbourhood</small>
            </span>
          </Link>
          <Link
            to={isAuthenticated ? '/app/activity' : '/signin'}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              color: '#fff',
              padding: '9px 22px',
              borderRadius: 'var(--r-lg)',
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'background .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            {isAuthenticated ? <><LayoutDashboard size={15} /> Dashboard</> : 'Sign In'}
          </Link>
        </div>

        {/* Hero body */}
        <div className="landing-hero-body">
          <div style={{ maxWidth: 600 }}>
            <div className="landing-eyebrow">
              <Users size={13} />
              The social layer of every neighbourhood
            </div>
            <h1 className="landing-h1">
              Connect with your block.<br />
              <span>Help and get helped,</span><br />
              right next door.
            </h1>
            <p className="landing-lead">
              Locora brings neighbors together. Find local events, recover lost items, and share service visits — all within your street.
            </p>
            <div className="landing-cta-row">
              <Link to={isAuthenticated ? '/app/activity' : '/signin'} className="landing-cta-primary">
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                {isAuthenticated ? <LayoutDashboard size={17} /> : <ArrowRight size={17} />}
              </Link>
              <a href="#features" className="landing-cta-secondary">
                See Features
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 2,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: 24, height: 40, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 12,
            display: 'flex', justifyContent: 'center', paddingTop: 6,
          }}>
            <div style={{
              width: 4, height: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 2,
              animation: 'scrollDot 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" style={{ background: 'var(--n-0)', borderBottom: '1px solid var(--border)' }}>
        <div className="landing-features">
          <h2>Everything your block needs</h2>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc }) => (
              <div className="feature-card fade-up" key={title}>
                <div className="feature-icon">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--accent-light)', padding: '52px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { icon: Shield, label: 'Verified Neighbours' },
              { icon: MapPin, label: 'Location-based' },
              { icon: Users, label: 'Community-first' },
            ].map(({ icon: Ic, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--accent-dark)', fontSize: 14 }}>
                <Ic size={18} />
                {label}
              </div>
            ))}
          </div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', marginBottom: 16 }}>Ready to meet your neighbours?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
            Join Locora in seconds — no password required, just your email address.
          </p>
          <Link to={isAuthenticated ? '/app/activity' : '/signin'} className="btn btn-primary btn-lg">
            {isAuthenticated ? 'Open Dashboard' : "Join Now — It's Free"}
            {isAuthenticated ? <LayoutDashboard size={17} /> : <ArrowRight size={17} />}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
            <MapPin size={14} color="#fff" strokeWidth={2.4} />
          </div>
          <strong style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.03em' }}>locora</strong>
        </div>
        <p>© {new Date().getFullYear()} Locora · The Social Layer of Every Neighborhood</p>
        <Link to={isAuthenticated ? '/app/activity' : '/signin'} style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>
          {isAuthenticated ? 'Dashboard →' : 'Sign In →'}
        </Link>
      </footer>

      <style>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%       { transform: translateY(8px); opacity: .4; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
