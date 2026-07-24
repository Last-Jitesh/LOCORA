import React, { useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, MapPin, ArrowRight, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

// Synchronous cookie check — no async/useEffect needed
const isLoggedInCookie = () =>
  document.cookie.split('; ').some(c => c.startsWith('isLoggedIn=true'));

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If already logged in, skip this page entirely
  if (isLoggedInCookie()) {
    return <Navigate to="/app/activity" replace />;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await authApi.signin(data.email, data.password);
      if (res.data.success && res.data.data) {
        login(res.data.data.user, res.data.data.accessToken);
        toast.success(`Welcome back, ${res.data.data.user.name}!`);
        const from = (location.state as any)?.from?.pathname || '/app/activity';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-panel-left-content fade-up">
          <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { icon: Users, label: 'Community-first' },
              { icon: Shield, label: 'JWT Secured' },
            ].map(({ icon: Ic, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                padding: '7px 14px', borderRadius: 'var(--r-full)',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                <Ic size={13} /> {label}
              </div>
            ))}
          </div>
          <h2>Your neighbourhood,<br />just a sign-in away.</h2>
          <p>Connect with your community. Sign in to access local activities, services, and more.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <MapPin size={20} strokeWidth={2.4} />
          </div>
          <strong>locora</strong>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue.</p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--n-400)' }} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`form-control ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: 42 }}
                {...register('email')}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--n-400)' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: 42, paddingRight: 42 }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--n-400)', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '13px', fontSize: 15 }}>
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in…</>
            ) : (
              <>Sign In <ArrowRight size={17} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>
            Sign up
          </Link>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color .2s' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
