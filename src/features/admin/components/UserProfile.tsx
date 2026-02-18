
import React, { useState } from 'react';

const UserProfile: React.FC = () => {
  const [roles, setRoles] = useState({
    admin: true,
    finance: false,
    support: true,
    editor: false,
    viewer: true
  });

  const toggleRole = (role: keyof typeof roles) => {
    setRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-light flex flex-col items-center w-full md:w-80 shrink-0">
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full border-4 border-primary/20 bg-cover bg-center" 
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCX_vV9EyjAURNA75Ew1cacAmyL1_zLC_LWTvPRzXiTmbHAkcYffvlhR2Zeoj-kKY1Y07HD5H8hm4YARk10BoIWYAozXWVVvw1ndoQJ62m4t_FNG4CERZwkg6_L2bnZ74yYP_aV2fAUoLjVaAeM1IQImX8e_GnvlSW2Fnpm0-iMiwImKLnfjq36EwAVl1svXsUIVQ07jrN15SWXj9vbWAhveG64qrgsmHsaKhmnTmYNpHje8HAwJ9XEi0JXjxzfCRKnUW3xRylP6qkA')` }}
            ></div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 className="mt-6 text-xl font-extrabold text-dark-text">Alex Mukunda</h2>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1 text-center">System Administrator</p>
          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center gap-3 text-sm text-neutral-text">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span>Joined May 2023</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-text">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span>Harare, Zimbabwe</span>
            </div>
          </div>
        </div>

        {/* Info Tabs & Forms */}
        <div className="flex-1 space-y-6 w-full">
          {/* Personal Information */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-light">
            <h3 className="text-lg font-bold text-dark-text mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Full Name</label>
                <input type="text" defaultValue="Alex Mukunda" className="w-full bg-neutral-light/30 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Email Address</label>
                <input type="email" defaultValue="alex.m@esebills.com" className="w-full bg-neutral-light/30 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Phone Number</label>
                <input type="text" defaultValue="+263 771 234 567" className="w-full bg-neutral-light/30 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Department</label>
                <input type="text" defaultValue="Operations" className="w-full bg-neutral-light/30 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20">
                Save Changes
              </button>
            </div>
          </div>

          {/* Roles & Permissions Management Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-light">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark-text">Roles & Permissions</h3>
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-tighter">Admin View</span>
            </div>
            <p className="text-sm text-neutral-text mb-8">Manage the specific access levels and administrative privileges assigned to this profile.</p>
            
            <div className="space-y-4">
              {[
                { id: 'admin', label: 'System Administrator', desc: 'Full access to all system settings, user management, and financial data.', icon: 'shield_person' },
                { id: 'finance', label: 'Finance Manager', desc: 'Manage revenue distributions, biller settlements, and tax reports.', icon: 'account_balance_wallet' },
                { id: 'support', label: 'Support Agent', desc: 'Access to customer transaction history and user verification tools.', icon: 'support_agent' },
                { id: 'editor', label: 'Content Editor', desc: 'Can update biller profiles, service categories, and FAQ sections.', icon: 'edit_note' },
                { id: 'viewer', label: 'Global Viewer', desc: 'Read-only access to all dashboards, analytics, and transaction lists.', icon: 'visibility' },
              ].map((role) => (
                <div key={role.id} className="group flex items-start gap-4 p-4 rounded-2xl border border-neutral-light hover:bg-neutral-light/20 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${roles[role.id as keyof typeof roles] ? 'bg-primary text-white' : 'bg-neutral-light text-neutral-text'}`}>
                    <span className="material-symbols-outlined">{role.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-dark-text">{role.label}</p>
                      <button 
                        onClick={() => toggleRole(role.id as keyof typeof roles)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${roles[role.id as keyof typeof roles] ? 'bg-accent-green' : 'bg-neutral-text/30'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${roles[role.id as keyof typeof roles] ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-xs text-neutral-text leading-relaxed">{role.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-neutral-light">
              <div className="flex items-center gap-3 text-sm font-bold text-accent-green">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>Role changes will take effect upon the next session login.</span>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-light">
            <h3 className="text-lg font-bold text-dark-text mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-neutral-light/20 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent-green/10 text-accent-green rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-text">Two-Factor Authentication</p>
                    <p className="text-xs text-neutral-text">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button className="w-12 h-6 bg-accent-green rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-neutral-light/20 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">lock_reset</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-text">Change Password</p>
                    <p className="text-xs text-neutral-text">Last changed 3 months ago.</p>
                  </div>
                </div>
                <button className="text-primary text-sm font-bold hover:underline">Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
