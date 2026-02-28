import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { changePassword, getCurrentUserProfile, toggleTwoFactor } from '../../auth/auth.service';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import type { UserProfileDto } from '../../auth/dto/auth.dto';
import { updateUser } from '../services';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCX_vV9EyjAURNA75Ew1cacAmyL1_zLC_LWTvPRzXiTmbHAkcYffvlhR2Zeoj-kKY1Y07HD5H8hm4YARk10BoIWYAozXWVVvw1ndoQJ62m4t_FNG4CERZwkg6_L2bnZ74yYP_aV2fAUoLjVaAeM1IQImX8e_GnvlSW2Fnpm0-iMiwImKLnfjq36EwAVl1svXsUIVQ07jrN15SWXj9vbWAhveG64qrgsmHsaKhmnTmYNpHje8HAwJ9XEi0JXjxzfCRKnUW3xRylP6qkA';

type EditForm = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  shopName: string
  shopLocation: string
  organisationName: string
}

const UserProfile: React.FC = () => {
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const [loading, setLoading] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    shopName: '',
    shopLocation: '',
    organisationName: '',
  });

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // 2FA state
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);

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

  const openEdit = () => {
    setEditForm({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      shopName: profile?.shopName ?? '',
      shopLocation: profile?.shopLocation ?? '',
      organisationName: profile?.organisationName ?? '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.id) {
      toast.error('Profile ID missing');
      return;
    }
    try {
      setIsSavingProfile(true);
      await updateUser({
        ...profile,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        shopName: editForm.shopName.trim() || undefined,
        shopLocation: editForm.shopLocation.trim() || undefined,
        organisationName: editForm.organisationName.trim() || undefined,
      });
      const next: UserProfileDto = {
        ...profile,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        shopName: editForm.shopName.trim() || profile.shopName,
        shopLocation: editForm.shopLocation.trim() || profile.shopLocation,
        organisationName: editForm.organisationName.trim() || profile.organisationName,
      };
      setProfile(next);
      if (session) saveAuthSession({ ...session, profile: next });
      toast.success('Profile updated');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    try {
      setIsSavingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!profile?.id) return;
    const next = !profile.otpEnabled;
    const label = next ? 'enable' : 'disable';
    if (!window.confirm(`Are you sure you want to ${label} Two-Factor Authentication?`)) return;
    try {
      setIsTogglingOtp(true);
      const updated = await toggleTwoFactor(profile.id, next);
      const nextProfile = { ...profile, otpEnabled: updated.otpEnabled ?? next };
      setProfile(nextProfile);
      if (session) saveAuthSession({ ...session, profile: nextProfile });
      toast.success(`Two-Factor Authentication ${next ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update 2FA');
    } finally {
      setIsTogglingOtp(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16 pt-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">My Profile</p>
        <h2 className="text-2xl font-extrabold text-dark-text mt-1">Profile Overview</h2>
      </div>

      {/* Avatar + name card */}
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

      {/* Personal Information */}
      <section className="bg-white border border-neutral-light rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-dark-text">Personal Information</h3>
          {!isEditing ? (
            <button
              type="button"
              onClick={openEdit}
              className="text-xs font-bold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors"
            >
              Edit
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <form onSubmit={(e) => void handleSaveProfile(e)} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">First Name</span>
                <input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Last Name</span>
                <input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Email Address</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Phone Number</span>
                <input
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              {profile?.shopName !== undefined ? (
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Shop Name</span>
                  <input
                    value={editForm.shopName}
                    onChange={(e) => setEditForm((p) => ({ ...p, shopName: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              ) : null}
              {profile?.shopLocation !== undefined ? (
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Shop Location</span>
                  <input
                    value={editForm.shopLocation}
                    onChange={(e) => setEditForm((p) => ({ ...p, shopLocation: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              ) : null}
              {profile?.organisationName !== undefined ? (
                <label className="block md:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Organisation Name</span>
                  <input
                    value={editForm.organisationName}
                    onChange={(e) => setEditForm((p) => ({ ...p, organisationName: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              ) : null}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold disabled:opacity-60"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 rounded-full border border-neutral-light text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
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
        )}
      </section>

      {/* Business / Org section (read-only handled by edit above) */}
      {!isEditing && (profile?.shopName || profile?.organisationName || profile?.shopLocation) ? (
        <section className="bg-white border border-neutral-light rounded-3xl shadow-sm p-6 md:p-8">
          <h3 className="text-base font-bold text-dark-text">
            {profile?.organisationName ? 'Organization' : 'Business'} Information
          </h3>
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

      {/* Security section */}
      <section className="bg-white border border-neutral-light rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
        <h3 className="text-base font-bold text-dark-text">Security</h3>

        {/* Change Password */}
        <div className="border border-neutral-light rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-primary">lock</span>
              <div>
                <p className="text-sm font-bold text-dark-text">Password</p>
                <p className="text-xs text-neutral-text mt-0.5">Change your account password</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm((p) => !p);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="text-xs font-bold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors"
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showPasswordForm ? (
            <form onSubmit={(e) => void handleChangePassword(e)} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Current Password</span>
                <div className="relative mt-1">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    required
                    placeholder="Enter current password"
                    className="w-full h-10 rounded-lg border border-neutral-light px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showCurrentPw ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">New Password</span>
                <div className="relative mt-1">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    required
                    placeholder="At least 8 characters"
                    className="w-full h-10 rounded-lg border border-neutral-light px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPw ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Confirm New Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  placeholder="Repeat new password"
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold disabled:opacity-60"
              >
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          ) : null}
        </div>

        {/* Two-Factor Authentication */}
        <div className="border border-neutral-light rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-primary">verified_user</span>
              <div>
                <p className="text-sm font-bold text-dark-text">Two-Factor Authentication</p>
                <p className="text-xs text-neutral-text mt-0.5">
                  {profile?.otpEnabled
                    ? 'OTP verification is active on your account'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleToggle2FA()}
              disabled={isTogglingOtp || !profile}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                profile?.otpEnabled ? 'bg-primary' : 'bg-neutral-light'
              }`}
              role="switch"
              aria-checked={Boolean(profile?.otpEnabled)}
              title={profile?.otpEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  profile?.otpEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {profile?.otpEnabled ? (
            <p className="mt-3 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Two-Factor Authentication is enabled
            </p>
          ) : (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Enable 2FA to secure your account with OTP verification on each login
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
