import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Mail, Loader2, MapPin, ArrowRight, Users, Shield } from 'lucide-react';
import { authApi } from '../../api/auth';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type EmailFormValues = z.infer<typeof emailSchema>;

export const SignInEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.requestOtp(data.email);
      if (res.data.success) {
        toast.success('OTP sent! Check your inbox.');
        navigate('/signin/otp', { state: { email: data.email } });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Try again.');
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
              { icon: Shield, label: 'Secure OTP login' },
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
          <h2>Your neighbourhood,<br />just an OTP away.</h2>
          <p>No passwords. No hassle. Enter your email and we'll send you a 6-digit code to get started.</p>
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
        <p className="auth-subtitle">Enter your email to receive a secure sign-in code.</p>

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

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '13px', fontSize: 15 }}>
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Sending Code…</>
            ) : (
              <>Continue <ArrowRight size={17} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color .2s' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInEmail;
