
import React, { useEffect, useState } from 'react';
import { getPaginatedUsers } from '../services';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  totalSpent: number;
  initials: string;
  role?: string;
}

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    permissions: {
      payments: true,
      reports: false,
      settings: false
    }
  });

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Tinashe Musekiwa', email: 'tinashe.m@gmail.com', phone: '+263 772 123 456', joinDate: 'Jan 15, 2024', status: 'Active', totalSpent: 450.50, initials: 'TM', role: 'Customer' },
    { id: '2', name: 'Chipo Chino', email: 'chipo.chino@yahoo.com', phone: '+263 783 987 654', joinDate: 'Feb 10, 2024', status: 'Active', totalSpent: 120.00, initials: 'CC', role: 'Customer' },
    { id: '3', name: 'Sipho Moyo', email: 'sipho.moyo@outlook.com', phone: '+263 712 555 333', joinDate: 'Mar 05, 2024', status: 'Pending', totalSpent: 0.00, initials: 'SM', role: 'Agent' },
    { id: '4', name: 'Grace Nyathi', email: 'grace.n@icloud.com', phone: '+263 774 444 888', joinDate: 'Apr 12, 2024', status: 'Active', totalSpent: 890.20, initials: 'GN', role: 'Admin' },
    { id: '5', name: 'Farai Gumbo', email: 'farai.gumbo@live.com', phone: '+263 777 222 111', joinDate: 'May 01, 2024', status: 'Inactive', totalSpent: 25.00, initials: 'FG', role: 'Customer' },
    { id: '6', name: 'Rutendo Mpofu', email: 'rutendo.m@gmail.com', phone: '+263 782 000 999', joinDate: 'May 15, 2024', status: 'Active', totalSpent: 155.75, initials: 'RM', role: 'Support' },
  ]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const page = await getPaginatedUsers({ page: 0, size: 50 });
        const apiUsers = (page.content ?? []).map((user, index) => {
          const first = String(user.firstName ?? '').trim();
          const last = String(user.lastName ?? '').trim();
          const username = String(user.username ?? '').trim();
          const displayName =
            [first, last].filter(Boolean).join(' ') || username || `User ${index + 1}`;
          const initials = displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('');
          return {
            id: String(user.id ?? `U-${index}`),
            name: displayName,
            email: String(user.email ?? '-'),
            phone: String(user.phoneNumber ?? '-'),
            joinDate: 'N/A',
            status: user.active === false ? 'Inactive' : 'Active',
            totalSpent: 0,
            initials: initials || 'U',
            role: 'User',
          } as User;
        });

        if (apiUsers.length > 0) {
          setUsers(apiUsers);
          setDataSource('api');
        }
      } catch {
        setDataSource('mock');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: inviteForm.name,
        email: inviteForm.email,
        phone: inviteForm.phone,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Pending',
        totalSpent: 0,
        initials: inviteForm.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        role: inviteForm.role
      };
      setUsers([newUser, ...users]);
      setIsSending(false);
      setIsInviteDrawerOpen(false);
      setInviteForm({
        name: '',
        email: '',
        phone: '',
        role: 'Customer',
        permissions: { payments: true, reports: false, settings: false }
      });
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">User Management</h2>
          <p className="text-sm text-neutral-text">Manage end-users, view their transaction history, and control account access.</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-text mt-2">
            Source: {isLoadingUsers ? 'Loading...' : dataSource === 'api' ? 'Live API' : 'Fallback Mock'}
          </p>
        </div>
        <button 
          onClick={() => setIsInviteDrawerOpen(true)}
          className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Invite New User
        </button>
      </div>

      {/* User Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '12,450', icon: 'group', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Today', value: '3,842', icon: 'bolt', color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Pending Verif.', value: users.filter(u => u.status === 'Pending').length.toString(), icon: 'how_to_reg', color: 'text-orange-500', bg: 'bg-orange-100' },
          { label: 'Avg LTV', value: '$84.20', icon: 'monetization_on', color: 'text-blue-500', bg: 'bg-blue-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white  p-6 rounded-3xl border border-neutral-light dark:border-white/5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-extrabold text-dark-text dark:text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white  p-4 rounded-3xl border border-neutral-light dark:border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text dark:text-white font-bold"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-neutral-light/30 dark:bg-white/5 text-neutral-text rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-light/50 transition-all">
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            Status
          </button>
          <button className="p-3 bg-neutral-light/30 dark:bg-white/5 text-neutral-text rounded-xl hover:bg-neutral-light/50 transition-all">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white  rounded-[3rem] shadow-sm border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20 dark:bg-white/5 border-b border-neutral-light dark:border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Join Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">LTV</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light dark:divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                        {user.initials}
                      </div>
                      <div>
                        <p className="text-sm font-black text-dark-text dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-neutral-text font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-neutral-text/80 uppercase tracking-widest">{user.role || 'User'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-neutral-text font-bold">{user.joinDate}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${
                      user.status === 'Active' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                      user.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-sm font-black text-dark-text dark:text-white">${user.totalSpent.toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-neutral-text transition-all" title="View Profile">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-neutral-text transition-all" title="Edit User">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination */}
        <div className="p-8 bg-neutral-light/5 border-t border-neutral-light dark:border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Showing {filteredUsers.length} of 12,450 users</p>
          <div className="flex gap-4">
            <button className="text-[10px] font-black uppercase text-neutral-text hover:text-primary disabled:opacity-30" disabled>Previous Page</button>
            <button className="text-[10px] font-black uppercase text-primary hover:underline">Next Page</button>
          </div>
        </div>
      </div>

      {/* Invite User Drawer */}
      {isInviteDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-dark-text/40 backdrop-blur-sm transition-opacity" onClick={() => setIsInviteDrawerOpen(false)}></div>
          
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-neutral-light flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-dark-text tracking-tight">Invite New User</h3>
                <p className="text-xs font-bold text-neutral-text uppercase tracking-widest mt-1">Ecosystem Access Control</p>
              </div>
              <button onClick={() => setIsInviteDrawerOpen(false)} className="p-3 hover:bg-neutral-light rounded-2xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="flex-1 overflow-y-auto p-10 space-y-10">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-[0.2em] border-b border-neutral-light pb-2">Identification</h4>
                <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-text uppercase">Full Legal Name</label>
                      <input 
                        type="text" 
                        required
                        value={inviteForm.name}
                        onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                        className="w-full bg-[#f8fafc] border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                        placeholder="Johnathan Doe"
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-text uppercase">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={inviteForm.email}
                          onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                          className="w-full bg-[#f8fafc] border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                          placeholder="name@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-text uppercase">Mobile Number</label>
                        <input 
                          type="tel" 
                          value={inviteForm.phone}
                          onChange={e => setInviteForm({...inviteForm, phone: e.target.value})}
                          className="w-full bg-[#f8fafc] border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                          placeholder="+263 77*******"
                        />
                      </div>
                   </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-[0.2em] border-b border-neutral-light pb-2">Access & Permissions</h4>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-text uppercase">System Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Customer', 'Agent', 'Admin', 'Support', 'Finance'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInviteForm({...inviteForm, role})}
                        className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          inviteForm.role === role ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-light text-neutral-text hover:border-primary/20'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <p className="text-[10px] font-black text-neutral-text uppercase">Specific Access Toggles</p>
                  <div className="space-y-3">
                    {[
                      { id: 'payments', label: 'Processing & Payments', desc: 'Allow user to initiate and settle bills.' },
                      { id: 'reports', label: 'Financial Reporting', desc: 'Access to revenue charts and ledgers.' },
                      { id: 'settings', label: 'System Configuration', desc: 'Modify global platform policies.' }
                    ].map((p) => (
                      <div key={p.id} className="p-4 bg-[#f8fafc] rounded-2xl border border-neutral-light flex items-center justify-between">
                         <div>
                            <p className="text-xs font-black text-dark-text tracking-tight uppercase">{p.label}</p>
                            <p className="text-[9px] text-neutral-text font-bold uppercase tracking-tighter">{p.desc}</p>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setInviteForm({...inviteForm, permissions: {...inviteForm.permissions, [p.id]: !inviteForm.permissions[p.id as keyof typeof inviteForm.permissions]}})}
                           className={`w-10 h-5 rounded-full relative transition-all ${inviteForm.permissions[p.id as keyof typeof inviteForm.permissions] ? 'bg-primary' : 'bg-neutral-light'}`}
                         >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${inviteForm.permissions[p.id as keyof typeof inviteForm.permissions] ? 'right-1' : 'left-1'}`}></div>
                         </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </form>

            <div className="p-8 border-t border-neutral-light bg-[#f8fafc] flex gap-4">
              <button 
                type="button"
                onClick={() => setIsInviteDrawerOpen(false)}
                className="flex-1 py-5 rounded-2xl border border-neutral-light font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleSendInvite}
                disabled={isSending || !inviteForm.name || !inviteForm.email}
                className="flex-1 py-5 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Dispatching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send Invitation
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

