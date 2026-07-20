import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Shield, Phone, Mail, Building2, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../api/users';
import type { User, Badge } from '../types';

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    try {
      const res = await userApi.getProfile(id);
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
        setBadges(res.data.data.badges || []);
      }
    } catch {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner" />
        <p className="text-sm text-[#C8A96E]">Retrieving neighbor record...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="section text-center py-16">
        <h2 className="font-serif text-2xl text-[#F5E6C8] mb-2">Resident Profile Not Found</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary inline-flex items-center gap-1.5">
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8A96E] hover:text-[#F5E6C8] uppercase tracking-wider transition-colors">
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Summary & Reputation points */}
        <div className="card md:col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-28 h-28 rounded-full object-cover border-2 border-[#C8941A]" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#C8941A]/20 text-[#C8941A] flex items-center justify-center font-bold text-3xl border border-[#C8941A]/30">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="font-serif text-xl font-bold text-[#F5E6C8]">{profile.name}</h2>
              {profile.isVerified && <CheckCircle2 size={16} className="text-[#7A9E4E]" />}
            </div>
            <span className="badge badge-gold text-[10px]">{profile.role}</span>
          </div>

          <div className="w-full pt-4 border-t border-[#C8941A]/10">
            <div className="stat-box">
              <div className="stat-value">{profile.reputationScore || 0}</div>
              <div className="stat-label">Reputation Points</div>
            </div>
            <p className="text-[10px] text-[#8B7050] mt-2 italic leading-relaxed">
              Earn +5 points per review helpfulness, +10 points per host activity.
            </p>
          </div>
        </div>

        {/* Right Space: Contact details and badge listings */}
        <div className="md:col-span-2 space-y-6">
          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F5E6C8] pb-1.5 border-b border-[#C8941A]/10">
              Resident Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#C8A96E]">
              {profile.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#C8941A]" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-[#C8941A]" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-start gap-2.5 col-span-2">
                  <Building2 size={16} className="text-[#C8941A] mt-0.5" />
                  <span>{profile.address}</span>
                </div>
              )}
              {profile.societyCode && (
                <div className="flex items-center gap-2.5 col-span-2">
                  <Shield size={16} className="text-[#C8941A]" />
                  <span>Belongs to Society: {profile.societyCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Badges and milestones */}
          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F5E6C8] pb-1.5 border-b border-[#C8941A]/10 flex items-center gap-2">
              <Award className="text-[#C8941A]" size={18} />
              <span>Community Badges ({badges.length})</span>
            </h3>

            {badges.length === 0 ? (
              <p className="text-xs text-[#8B7050]">No tier badges earned yet. Participate in events to upgrade tiers!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div key={badge._id} className="flex items-center gap-3 p-3 bg-black/20 rounded border border-[#C8941A]/10">
                    <span className="text-2xl">{badge.icon || '🏆'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5E6C8]">{badge.name}</h4>
                      <p className="text-[10px] text-[#8B7050]">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

