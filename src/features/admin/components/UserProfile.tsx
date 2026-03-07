import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { confirmToast } from '../../../lib/confirmToast';
import { changePassword, getCurrentUserProfile, toggleTwoFactor } from '../../auth/auth.service';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import type { Gender, UserProfileDto } from '../../auth/dto/auth.dto';
import { updateUser } from '../services';
import { 
  User, 
  Shield, 
  Lock, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  Edit3, 
  CheckCircle2, 
  Smartphone, 
  ChevronRight,
  UserCircle,
  Eye,
  EyeOff,
  Loader2,
  Fingerprint,
  XCircle,
  Info
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import CRUDModal from '../../shared/components/CRUDModal';

// Date helpers
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
  dateOfBirth: string;
  nationality: string;
  nationalIdentificationNumber: string;
  passportNumber: string;
  driverLicenseNumber: string;
  shopName: string;
  shopLocation: string;
  organisationName: string;
};

const EMPTY_FORM: EditForm = {
  firstName: '', lastName: '', email: '', gender: '', phoneNumber: '',
  title: '', initials: '', dateOfBirth: '', nationality: '',
  nationalIdentificationNumber: '', passportNumber: '', driverLicenseNumber: '',
  shopName: '', shopLocation: '', organisationName: '',
};

type TabId = 'personal' | 'organization' | 'security';

const UserProfile: React.FC = () => {
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Loading States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    if (profile) return;
    setLoading(true);
    getCurrentUserProfile().then((data) => {
      setProfile(data);
      if (session) saveAuthSession({ ...session, profile: data });
    }).finally(() => setLoading(false));
  }, []);

  const displayName = useMemo(() => {
    const first = profile?.firstName ?? '';
    const last = profile?.lastName ?? '';
    return `${first} ${last}`.trim() || profile?.username || 'User';
  }, [profile]);

  const initials = useMemo(() => {
    return [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
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
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profile?.id || !editForm.gender) return;
    try {
      setIsSavingProfile(true);
      const payload = {
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
      };
      await updateUser(payload);
      setProfile(payload as UserProfileDto);
      if (session) saveAuthSession({ ...session, profile: payload as UserProfileDto });
      toast.success('Profile updated');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
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
      setIsPasswordModalOpen(false);
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
    confirmToast(`${next ? 'Enable' : 'Disable'} Two-Factor Authentication?`, () => {
      setIsTogglingOtp(true);
      toggleTwoFactor(profile.id!, next).then((updated) => {
        const nextProfile = { ...profile, otpEnabled: updated.otpEnabled ?? next };
        setProfile(nextProfile);
        if (session) saveAuthSession({ ...session, profile: nextProfile });
        toast.success(`2FA ${next ? 'enabled' : 'disabled'}`);
      }).finally(() => setIsTogglingOtp(false));
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Profile Header */}
      <div className="glass-card p-10 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden text-slate-900 dark:text-white">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
         
         <div className="relative">
            <div className="w-28 h-28 rounded-[2.5rem] bg-emerald-600 text-white text-4xl font-black flex items-center justify-center shadow-2xl shadow-emerald-900/30 border-4 border-white dark:border-slate-900">
               {initials}
            </div>
            <button 
              onClick={openEdit}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 hover:scale-110 transition-transform"
            >
               <Edit3 size={18} />
            </button>
         </div>

         <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{displayName}</h2>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><Mail size={12} className="text-emerald-500" /> {profile?.email}</span>
               <span className="flex items-center gap-1.5"><Smartphone size={12} className="text-emerald-500" /> {profile?.phoneNumber || 'No phone'}</span>
               <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-800/50">{profile?.group?.name}</span>
            </div>
         </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={cn(
              "flex items-center gap-2.5 px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeProfileTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900 dark:text-white">
             <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-8">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Identity & Demographics</h4>
                <div className="grid grid-cols-2 gap-y-6">
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">First Name</p>
                      <p className="text-sm font-bold">{profile?.firstName || '—'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Last Name</p>
                      <p className="text-sm font-bold">{profile?.lastName || '—'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Gender</p>
                      <p className="text-sm font-bold">{profile?.gender || '—'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Date of Birth</p>
                      <p className="text-sm font-bold">{profile?.dateOfBirth || '—'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Nationality</p>
                      <p className="text-sm font-bold">{profile?.nationality || '—'}</p>
                   </div>
                </div>
             </div>

             <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-8">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">KYC Documentation</h4>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase">National ID</p>
                         <p className="text-sm font-bold font-mono">{profile?.nationalIdentificationNumber || 'Not provided'}</p>
                      </div>
                      <Shield size={20} className={profile?.nationalIdentificationNumber ? "text-emerald-500" : "text-slate-300"} />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase">Passport Number</p>
                         <p className="text-sm font-bold font-mono">{profile?.passportNumber || 'Not provided'}</p>
                      </div>
                      <Globe size={20} className={profile?.passportNumber ? "text-emerald-500" : "text-slate-300"} />
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'organization' && (
          <div className="max-w-3xl animate-in slide-in-from-bottom-4">
             <div className="glass-card p-10 border-slate-200 dark:border-slate-800 space-y-10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                      <Building2 size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business Affiliation</h3>
                      <p className="text-sm text-slate-500 font-medium">Linked organization and operational details.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-900 dark:text-white">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Name</p>
                      <p className="text-base font-bold">{profile?.organisationName || 'Private Individual'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shop/Trade Name</p>
                      <p className="text-base font-bold">{profile?.shopName || '—'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Location</p>
                      <p className="text-base font-bold">{profile?.shopLocation || '—'}</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-3xl space-y-6">
             <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center">
                      <Fingerprint size={24} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Multi-Factor Auth</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Secure logins with one-time verification codes.</p>
                   </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={isTogglingOtp}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all",
                    profile?.otpEnabled ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                   <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", profile?.otpEnabled ? "right-1" : "left-1")} />
                </button>
             </div>

             <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-600">
                         <Lock size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">Account Password</h4>
                         <p className="text-xs text-slate-500 font-medium mt-0.5">Regularly updated passwords ensure higher security.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsPasswordModalOpen(true)}
                     className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-white"
                   >
                     Change
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <CRUDModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Profile Information"
        onSubmit={handleSaveProfile}
        isSubmitting={isSavingProfile}
        submitLabel="Commit Updates"
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Basic Details</h4>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
                 <input 
                   value={editForm.firstName} 
                   onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
                 <input 
                   value={editForm.lastName} 
                   onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Gender</label>
                 <select 
                   value={editForm.gender} 
                   onChange={e => setEditForm({...editForm, gender: e.target.value as any})}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                 >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                 </select>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Contact & ID</h4>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                 <input 
                   type="email" 
                   value={editForm.email} 
                   onChange={e => setEditForm({...editForm, email: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                 <input 
                   value={editForm.phoneNumber} 
                   onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">National ID</label>
                 <input 
                   value={editForm.nationalIdentificationNumber} 
                   onChange={e => setEditForm({...editForm, nationalIdentificationNumber: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
           </div>
        </div>
      </CRUDModal>

      {/* Change Password Modal */}
      <CRUDModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Security Password"
        onSubmit={handleChangePassword}
        isSubmitting={isSavingPassword}
        submitLabel="Update Password"
      >
        <div className="space-y-5">
           <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-3">
              <Info className="text-amber-600 shrink-0" size={18} />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Changing your password will require you to log back in on all devices.</p>
           </div>

           <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock size={16} />
                 </div>
                 <input
                   type={showPasswords.current ? "text" : "password"}
                   value={passwordForm.currentPassword}
                   onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                   className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                   placeholder="••••••••"
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                 >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Shield size={16} />
                 </div>
                 <input
                   type={showPasswords.next ? "text" : "password"}
                   value={passwordForm.newPassword}
                   onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                   className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                   placeholder="At least 8 characters"
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPasswords({...showPasswords, next: !showPasswords.next})}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                 >
                    {showPasswords.next ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <CheckCircle2 size={16} />
                 </div>
                 <input
                   type={showPasswords.confirm ? "text" : "password"}
                   value={passwordForm.confirmPassword}
                   onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                   className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                   placeholder="Repeat new password"
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                 >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
              </div>
           </div>
        </div>
      </CRUDModal>
    </div>
  );
};

export default UserProfile;
