import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { KeyRound, Loader2, MapPin, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'Digits only'),
});
type OtpFormValues = z.infer<typeof otpSchema>;

export const SignInOtp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email;

  if (!email) return <Navigate to="/signin" replace />;

  const { register, handleSubmit, formState: { errors } } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, data.otp);
      if (res.data.success && res.data.data) {
        login(res.data.data.user, res.data.data.accessToken);
        toast.success(`Welcome, ${res.data.data.user.name}!`);
        const from = (location.state as any)?.from?.pathname || '/app/activity';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed. Check the code and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.requestOtp(email);
      toast.success('New OTP sent to your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-panel-left-content fade-up">
          <div style={{
            width: 56, height: 56, background: 'rgba(255,255,255,.2)',
            border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 'var(--r-lg)',
            display: 'grid', placeItems: 'center', marginBottom: 24, color: '#fff',
          }}>
            <KeyRound size={26} />
          </div>
          <h2>Check your inbox</h2>
          <p>We've sent a 6-digit verification code to <strong style={{ color: '#fff' }}>{email}</strong>. Enter it on the right to sign in securely.</p>
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

        <button
          onClick={() => navigate('/signin')}
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-start', padding: '6px 10px', marginBottom: 16, gap: 5 }}
        >
          <ArrowLeft size={15} /> Change email
        </button>

        <h1 className="auth-title">Enter verification code</h1>
        <p className="auth-subtitle">
          Sent to <strong style={{ color: 'var(--text-h)' }}>{email}</strong>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="otp" style={{ textAlign: 'center' }}>
              6-digit code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className={`form-control otp-input ${errors.otp ? 'error' : ''}`}
              {...register('otp')}
            />
            {errors.otp && <span className="form-error" style={{ textAlign: 'center' }}>{errors.otp.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ padding: '13px', fontSize: 15 }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Verifying…</>
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, color: 'var(--accent-dark)' }}
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInOtp;
