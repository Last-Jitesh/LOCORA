import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { KeyRound, Mail, Loader2, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setLoading(true);
    try {
      const res = await authApi.login(data as any);
      if (res.data.success && res.data.data) {
        login(res.data.data.user, res.data.data.accessToken);
        toast.success('Welcome back to Locora!');
        navigate('/businesses');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero">
      <div className="card card-xl w-full max-w-[460px] relative z-10 animate-fade-in bg-gradient-to-b from-[#1A1208] to-[#0F0A04]/90 border border-[#C8941A]/30">
        <div className="flex flex-col items-center mb-8">
          <span className="brand-mark mb-4" aria-hidden="true"><MapPin size={20} /></span>
          <h2 className="text-3xl font-bold tracking-tight text-[#F5E6C8]">
            Welcome back
          </h2>
          <p className="text-sm text-[#C8A96E] mt-2">
            Sign in to see what’s happening nearby.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7050]" />
              <input
                type="email"
                placeholder="you@neighborhood.com"
                className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7050]" />
              <input
                type="password"
                placeholder="••••••••"
                className={`form-input pl-10 ${errors.password ? 'error' : ''}`}
                {...register('password')}
              />
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full py-3 text-base flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">New Neighbor?</span>
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="inline-block text-[#C8941A] hover:text-[#F5E6C8] text-sm font-semibold transition-colors duration-200"
          >
            Create an Account & Join Community
          </Link>
        </div>
      </div>
    </div>
  );
};
