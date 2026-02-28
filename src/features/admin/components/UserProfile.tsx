import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { confirmToast } from '../../../lib/confirmToast';
import { changePassword, getCurrentUserProfile, toggleTwoFactor } from '../../auth/auth.service';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import type { Gender, UserProfileDto } from '../../auth/dto/auth.dto';
import { updateUser } from '../services';

// Date helpers — server uses dd/MM/yyyy, HTML date input uses YYYY-MM-DD
const serverToHtmlDate = (val: string | null | undefined): string => {
  if (!val) return '';
  const parts = val.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return val;
};

const htmlToServerDate = (val: string): string => {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }
  return val;
};

type EditForm = {
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender | '';
  phoneNumber: string;
  title: string;
  initials: string;
  dateOfBirth: string; // YYYY-MM-DD for the HTML input
  nationality: string;
  nationalIdentificationNumber: string;
  passportNumber: string;
  driverLicenseNumber: string;
  shopName: string;
  shopLocation: string;
  organisationName: string;
};

const EMPTY_FORM: EditForm = {
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  phoneNumber: '',
  title: '',
  initials: '',
  dateOfBirth: '',
  nationality: '',
  nationalIdentificationNumber: '',
  passportNumber: '',
  driverLicenseNumber: '',
  shopName: '',
  shopLocation: '',
  organisationName: '',
};

const UserProfile: React.FC = () => {
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

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

  const initials = useMemo(() => {
    return [profile?.firstName?.[0], profile?.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'U';
  }, [profile]);

  const openEdit = () => {
    setEditForm({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
      gender: (profile?.gender as Gender) ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      title: profile?.title ?? '',
      initials: profile?.initials ?? '',
      dateOfBirth: serverToHtmlDate(profile?.dateOfBirth),
      nationality: profile?.nationality ?? '',
      nationalIdentificationNumber: profile?.nationalIdentificationNumber ?? '',
      passportNumber: profile?.passportNumber ?? '',
      driverLicenseNumber: profile?.driverLicenseNumber ?? '',
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
    if (!editForm.gender) {
      toast.error('Gender is required');
      return;
    }
    try {
      setIsSavingProfile(true);
      await updateUser({
        ...profile,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        gender: editForm.gender,
        phoneNumber: editForm.phoneNumber.trim() || undefined,
        title: editForm.title.trim() || undefined,
        initials: editForm.initials.trim() || undefined,
        dateOfBirth: editForm.dateOfBirth ? htmlToServerDate(editForm.dateOfBirth) : undefined,
        nationality: editForm.nationality.trim() || undefined,
        nationalIdentificationNumber: editForm.nationalIdentificationNumber.trim() || undefined,
        passportNumber: editForm.passportNumber.trim() || undefined,
        driverLicenseNumber: editForm.driverLicenseNumber.trim() || undefined,
        shopName: editForm.shopName.trim() || undefined,
        shopLocation: editForm.shopLocation.trim() || undefined,
        organisationName: editForm.organisationName.trim() || undefined,
      });
      const next: UserProfileDto = {
        ...profile,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        gender: editForm.gender as Gender,
        phoneNumber: editForm.phoneNumber.trim() || profile.phoneNumber,
        title: editForm.title.trim() || undefined,
        initials: editForm.initials.trim() || undefined,
        dateOfBirth: editForm.dateOfBirth ? htmlToServerDate(editForm.dateOfBirth) : undefined,
        nationality: editForm.nationality.trim() || undefined,
        nationalIdentificationNumber: editForm.nationalIdentificationNumber.trim() || undefined,
        passportNumber: editForm.passportNumber.trim() || undefined,
        driverLicenseNumber: editForm.driverLicenseNumber.trim() || undefined,
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

  const handleToggle2FA = () => {
    if (!profile?.id) return;
    const next = !profile.otpEnabled;
    const label = next ? 'Enable' : 'Disable';
    confirmToast(`${label} Two-Factor Authentication?`, () => {
      setIsTogglingOtp(true);
      toggleTwoFactor(profile.id!, next)
        .then((updated) => {
          const nextProfile = { ...profile, otpEnabled: updated.otpEnabled ?? next };
          setProfile(nextProfile);
          if (session) saveAuthSession({ ...session, profile: nextProfile });
          toast.success(`Two-Factor Authentication ${next ? 'enabled' : 'disabled'}`);
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : 'Failed to update 2FA');
        })
        .finally(() => {
          setIsTogglingOtp(false);
        });
    });
  };

  const inputClass = 'mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20';
  const labelClass = 'text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold';

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16 pt-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">My Profile</p>
        <h2 className="text-2xl font-extrabold text-dark-text mt-1">Profile Overview</h2>
      </div>

      {/* Avatar + name card */}
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-20 h-20 rounded-full bg-primary/20 text-primary text-2xl font-bold flex items-center justify-center shrink-0">
          {initials}
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
      <section className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 md:p-8">
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
          <form onSubmit={(e) => void handleSaveProfile(e)} className="mt-6 space-y-5">
            {/* Required fields */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neutral-text/40 font-bold mb-3">Required</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>First Name *</span>
                  <input
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Last Name *</span>
                  <input
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Email Address *</span>
                  <input
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Gender *</span>
                  <select
                    required
                    value={editForm.gender}
                    onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value as Gender | '' }))}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Optional fields */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neutral-text/40 font-bold mb-3">Contact & Personal</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>Phone Number</span>
                  <input
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Date of Birth</span>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Title</span>
                  <input
                    value={editForm.title}
                    placeholder="e.g. Mr, Mrs, Dr"
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Initials</span>
                  <input
                    value={editForm.initials}
                    placeholder="e.g. J.D."
                    onChange={(e) => setEditForm((p) => ({ ...p, initials: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Nationality</span>
                  <input
                    value={editForm.nationality}
                    onChange={(e) => setEditForm((p) => ({ ...p, nationality: e.target.value }))}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>

            {/* ID fields */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neutral-text/40 font-bold mb-3">Identification</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>National ID Number</span>
                  <input
                    value={editForm.nationalIdentificationNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, nationalIdentificationNumber: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Passport Number</span>
                  <input
                    value={editForm.passportNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, passportNumber: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Driver License Number</span>
                  <input
                    value={editForm.driverLicenseNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, driverLicenseNumber: e.target.value }))}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>

            {/* Business fields — only shown if they have values on the profile */}
            {(profile?.shopName !== undefined || profile?.shopLocation !== undefined || profile?.organisationName !== undefined) ? (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-neutral-text/40 font-bold mb-3">Business</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.organisationName !== undefined ? (
                    <label className="block md:col-span-2">
                      <span className={labelClass}>Organisation Name</span>
                      <input
                        value={editForm.organisationName}
                        onChange={(e) => setEditForm((p) => ({ ...p, organisationName: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                  ) : null}
                  {profile?.shopName !== undefined ? (
                    <label className="block">
                      <span className={labelClass}>Shop Name</span>
                      <input
                        value={editForm.shopName}
                        onChange={(e) => setEditForm((p) => ({ ...p, shopName: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                  ) : null}
                  {profile?.shopLocation !== undefined ? (
                    <label className="block">
                      <span className={labelClass}>Shop Location</span>
                      <input
                        value={editForm.shopLocation}
                        onChange={(e) => setEditForm((p) => ({ ...p, shopLocation: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            ) : null}

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
          <div className="mt-6 space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className={labelClass}>First Name</p>
                <p className="font-semibold text-dark-text mt-2">{profile?.firstName ?? '—'}</p>
              </div>
              <div>
                <p className={labelClass}>Last Name</p>
                <p className="font-semibold text-dark-text mt-2">{profile?.lastName ?? '—'}</p>
              </div>
              <div>
                <p className={labelClass}>Email Address</p>
                <p className="font-semibold text-dark-text mt-2">{profile?.email ?? '—'}</p>
              </div>
              <div>
                <p className={labelClass}>Gender</p>
                <p className="font-semibold text-dark-text mt-2">
                  {profile?.gender ? String(profile.gender).charAt(0) + String(profile.gender).slice(1).toLowerCase() : '—'}
                </p>
              </div>
              <div>
                <p className={labelClass}>Phone Number</p>
                <p className="font-semibold text-dark-text mt-2">{profile?.phoneNumber ?? '—'}</p>
              </div>
              <div>
                <p className={labelClass}>Date of Birth</p>
                <p className="font-semibold text-dark-text mt-2">{profile?.dateOfBirth ?? '—'}</p>
              </div>
              {profile?.title ? (
                <div>
                  <p className={labelClass}>Title</p>
                  <p className="font-semibold text-dark-text mt-2">{profile.title}</p>
                </div>
              ) : null}
              {profile?.nationality ? (
                <div>
                  <p className={labelClass}>Nationality</p>
                  <p className="font-semibold text-dark-text mt-2">{profile.nationality}</p>
                </div>
              ) : null}
              <div>
                <p className={labelClass}>Username</p>
                <p className="font-semibold text-dark-text mt-2">{profile?.username ?? '—'}</p>
              </div>
              <div>
                <p className={labelClass}>User Role</p>
                <p className="font-semibold text-dark-text mt-2">{displayRole}</p>
              </div>
            </div>

            {/* ID fields */}
            {(profile?.nationalIdentificationNumber || profile?.passportNumber || profile?.driverLicenseNumber) ? (
              <>
                <div className="border-t border-neutral-light pt-4">
                  <p className="text-[11px] uppercase tracking-widest text-neutral-text/40 font-bold mb-4">Identification</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {profile?.nationalIdentificationNumber ? (
                      <div>
                        <p className={labelClass}>National ID Number</p>
                        <p className="font-semibold text-dark-text mt-2">{profile.nationalIdentificationNumber}</p>
                      </div>
                    ) : null}
                    {profile?.passportNumber ? (
                      <div>
                        <p className={labelClass}>Passport Number</p>
                        <p className="font-semibold text-dark-text mt-2">{profile.passportNumber}</p>
                      </div>
                    ) : null}
                    {profile?.driverLicenseNumber ? (
                      <div>
                        <p className={labelClass}>Driver License</p>
                        <p className="font-semibold text-dark-text mt-2">{profile.driverLicenseNumber}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </section>

      {/* Business / Org section (read-only) */}
      {!isEditing && (profile?.shopName || profile?.organisationName || profile?.shopLocation) ? (
        <section className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 md:p-8">
          <h3 className="text-base font-bold text-dark-text">
            {profile?.organisationName ? 'Organization' : 'Business'} Information
          </h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {profile?.organisationName ? (
              <div>
                <p className={labelClass}>Organization</p>
                <p className="font-semibold text-dark-text mt-2">{profile.organisationName}</p>
              </div>
            ) : null}
            {profile?.shopName ? (
              <div>
                <p className={labelClass}>Shop Name</p>
                <p className="font-semibold text-dark-text mt-2">{profile.shopName}</p>
              </div>
            ) : null}
            {profile?.shopLocation ? (
              <div>
                <p className={labelClass}>Location</p>
                <p className="font-semibold text-dark-text mt-2">{profile.shopLocation}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Security section */}
      <section className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 md:p-8 space-y-6">
        <h3 className="text-base font-bold text-dark-text">Security</h3>

        {/* Change Password */}
        <div className="border border-neutral-light rounded-xl p-5">
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
                <span className={labelClass}>Current Password</span>
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
                <span className={labelClass}>New Password</span>
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
                <span className={labelClass}>Confirm New Password</span>
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
        <div className="border border-neutral-light rounded-xl p-5">
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
