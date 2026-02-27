import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUserProfile } from '../../auth/auth.service';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import type { UserProfileDto } from '../../auth/dto/auth.dto';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCX_vV9EyjAURNA75Ew1cacAmyL1_zLC_LWTvPRzXiTmbHAkcYffvlhR2Zeoj-kKY1Y07HD5H8hm4YARk10BoIWYAozXWVVvw1ndoQJ62m4t_FNG4CERZwkg6_L2bnZ74yYP_aV2fAUoLjVaAeM1IQImX8e_GnvlSW2Fnpm0-iMiwImKLnfjq36EwAVl1svXsUIVQ07jrN15SWXj9vbWAhveG64qrgsmHsaKhmnTmYNpHje8HAwJ9XEi0JXjxzfCRKnUW3xRylP6qkA';

const UserProfile: React.FC = () => {
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) return;
    let mounted = true;
    setLoading(true);
    getCurrentUserProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        if (session) {
          saveAuthSession({ ...session, profile: data });
        }
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [profile, session]);

  const displayName = useMemo(() => {
    const first = profile?.firstName ?? '';
    const last = profile?.lastName ?? '';
    return `${first} ${last}`.trim() || profile?.username || 'User';
  }, [profile]);

  const displayRole = useMemo(() => {
    return profile?.group?.name ? profile.group.name.replace(/_/g, ' ') : 'User';
  }, [profile]);

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16 pt-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">My Profile</p>
        <h2 className="text-2xl font-extrabold text-dark-text mt-1">Profile Overview</h2>
      </div>

      <div className="bg-white border border-neutral-light rounded-3xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full bg-cover bg-center border border-neutral-light"
            style={{ backgroundImage: `url('${DEFAULT_AVATAR}')` }}
          />
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold text-dark-text">
            {loading ? 'Loading...' : displayName}
          </h3>
          <p className="text-sm text-neutral-text mt-1">{displayRole}</p>
          <p className="text-sm text-neutral-text/70 mt-2">{profile?.email ?? ''}</p>
        </div>
      </div>

      <section className="bg-white border border-neutral-light rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-dark-text">Personal Information</h3>
          <button className="text-xs font-bold text-primary border border-primary/30 rounded-full px-4 py-2">
            Edit
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">First Name</p>
            <p className="font-semibold text-dark-text mt-2">{profile?.firstName ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Last Name</p>
            <p className="font-semibold text-dark-text mt-2">{profile?.lastName ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Email Address</p>
            <p className="font-semibold text-dark-text mt-2">{profile?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Phone Number</p>
            <p className="font-semibold text-dark-text mt-2">{profile?.phoneNumber ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">User Role</p>
            <p className="font-semibold text-dark-text mt-2">{displayRole}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Username</p>
            <p className="font-semibold text-dark-text mt-2">{profile?.username ?? '—'}</p>
          </div>
        </div>
      </section>

      {(profile?.shopName || profile?.organisationName || profile?.shopLocation) ? (
        <section className="bg-white border border-neutral-light rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-dark-text">
              {profile?.organisationName ? 'Organization' : 'Business'} Information
            </h3>
            <button className="text-xs font-bold text-neutral-text border border-neutral-light rounded-full px-4 py-2">
              Edit
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {profile?.organisationName ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Organization</p>
                <p className="font-semibold text-dark-text mt-2">{profile.organisationName}</p>
              </div>
            ) : null}
            {profile?.shopName ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Shop Name</p>
                <p className="font-semibold text-dark-text mt-2">{profile.shopName}</p>
              </div>
            ) : null}
            {profile?.shopLocation ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Location</p>
                <p className="font-semibold text-dark-text mt-2">{profile.shopLocation}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default UserProfile;
