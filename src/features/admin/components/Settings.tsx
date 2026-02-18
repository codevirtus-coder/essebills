
import React, { useState } from 'react';
import { DEFAULT_SYSTEM_CONFIG, INITIAL_CATEGORIES } from '../data/constants';
import { SystemConfig, ServiceCategory, FAQItem } from '../data/types';

interface SettingsProps {
  faqs?: FAQItem[];
  setFaqs?: (faqs: FAQItem[]) => void;
  initialTab?: string;
}

const Settings: React.FC<SettingsProps> = ({ faqs = [], setFaqs, initialTab }) => {
  const [activeCategory, setActiveCategory] = useState(initialTab || 'commissions');
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [categories, setCategories] = useState<ServiceCategory[]>(INITIAL_CATEGORIES);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for FAQ editing
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  
  // Local state for Category editing
  const [editingCat, setEditingCat] = useState<Partial<ServiceCategory> | null>(null);

  const settingTabs = [
    { id: 'commissions', label: 'Revenue Split', icon: 'account_tree' },
    { id: 'categories', label: 'Biller Settings', icon: 'grid_view' },
    { id: 'faqs', label: 'FAQ Manager', icon: 'quiz' },
    { id: 'security', label: 'Security & Access', icon: 'shield_lock' },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('System policies synchronized successfully.');
    }, 1000);
  };

  const updateSplit = (id: string, field: 'agentRate' | 'platformRate', val: string) => {
    const num = parseFloat(val) || 0;
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: num } : c));
  };

  const toggleCategoryActive = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleSaveCategory = () => {
    if (!editingCat) return;
    if (editingCat.id) {
      setCategories(categories.map(c => c.id === editingCat.id ? { ...c, ...editingCat } as ServiceCategory : c));
    } else {
      const newCat: ServiceCategory = {
        id: `cat_${Date.now()}`,
        label: editingCat.label || 'New Category',
        icon: editingCat.icon || 'star',
        isActive: true,
        agentRate: editingCat.agentRate || 2.5,
        platformRate: editingCat.platformRate || 1.0
      };
      setCategories([...categories, newCat]);
    }
    setEditingCat(null);
  };

  const handleDeleteFaq = (id: string) => {
    if (setFaqs) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const handleSaveFaq = () => {
    if (!setFaqs || !editingFaq) return;
    
    if (editingFaq.id) {
      // Update existing
      setFaqs(faqs.map(f => f.id === editingFaq.id ? (editingFaq as FAQItem) : f));
    } else {
      // Add new
      const newFaq: FAQItem = {
        id: Math.random().toString(36).substr(2, 9),
        category: editingFaq.category || 'General',
        question: editingFaq.question || '',
        answer: editingFaq.answer || ''
      };
      setFaqs([...faqs, newFaq]);
    }
    setEditingFaq(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-dark-text">Admin Control</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Master Policy Portal</p>
          </div>
          {settingTabs.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeCategory === cat.id ? 'bg-primary text-white shadow-xl' : 'text-neutral-text hover:bg-neutral-light'
              }`}
            >
              <span className="material-symbols-outlined">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6 min-w-0">
          {activeCategory === 'commissions' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-neutral-light space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-dark-text">Revenue Distribution Rules</h3>
                    <p className="text-xs font-bold text-neutral-text uppercase tracking-widest mt-1">Configure Split per Category</p>
                  </div>
                  <span className="p-4 bg-accent-green/10 text-accent-green rounded-2xl material-symbols-outlined font-black">payments</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-8 bg-[#f8fafc] rounded-3xl border border-transparent hover:border-primary/20 transition-all space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-neutral-light">
                            <span className="material-symbols-outlined">{cat.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-black text-dark-text">{cat.label}</h4>
                            <p className="text-[10px] font-bold text-neutral-text uppercase">Total Deduction: {(cat.agentRate + cat.platformRate).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-neutral-text uppercase tracking-[0.2em] flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                             Agent Commission (%)
                          </label>
                          <input 
                            type="number" step="0.1" 
                            value={cat.agentRate}
                            onChange={(e) => updateSplit(cat.id, 'agentRate', e.target.value)}
                            className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-2 focus:ring-accent-green/20" 
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-neutral-text uppercase tracking-[0.2em] flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-primary"></span>
                             Platform Retention (%)
                          </label>
                          <input 
                            type="number" step="0.1" 
                            value={cat.platformRate}
                            onChange={(e) => updateSplit(cat.id, 'platformRate', e.target.value)}
                            className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'categories' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-neutral-light space-y-8">
                   <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-dark-text">Biller Categories</h3>
                        <p className="text-xs font-bold text-neutral-text uppercase tracking-widest mt-1">Manage public-facing service groupings</p>
                      </div>
                      <button 
                        onClick={() => setEditingCat({ label: '', icon: 'star', isActive: true, agentRate: 2.5, platformRate: 1.0 })}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        New Biller Category
                      </button>
                   </div>

                   {editingCat && (
                      <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 space-y-6 animate-in zoom-in-95">
                         <h4 className="text-sm font-black uppercase tracking-widest border-b border-primary/10 pb-4">
                            {editingCat.id ? 'Modify Biller Category' : 'Create Biller Category'}
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-neutral-text uppercase">Display Label</label>
                               <input 
                                 type="text" 
                                 value={editingCat.label}
                                 onChange={(e) => setEditingCat({...editingCat, label: e.target.value})}
                                 className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                 placeholder="e.g. Health & Wellness"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-neutral-text uppercase">Material Icon Name</label>
                               <div className="flex gap-3">
                                  <input 
                                    type="text" 
                                    value={editingCat.icon}
                                    onChange={(e) => setEditingCat({...editingCat, icon: e.target.value})}
                                    className="flex-1 bg-white border-none rounded-xl p-3 text-sm font-bold"
                                    placeholder="e.g. medical_services"
                                  />
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-neutral-light">
                                     <span className="material-symbols-outlined">{editingCat.icon}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setEditingCat(null)} className="px-6 py-3 rounded-xl border border-neutral-light font-black text-[10px] uppercase">Discard</button>
                            <button onClick={handleSaveCategory} className="px-10 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/20">Commit Changes</button>
                         </div>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((cat) => (
                         <div key={cat.id} className={`p-6 rounded-[2.5rem] border transition-all group flex items-center justify-between ${cat.isActive ? 'bg-[#f8fafc] border-transparent hover:border-primary/20' : 'bg-neutral-light/20 border-dashed border-neutral-light opacity-60'}`}>
                            <div className="flex items-center gap-5">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${cat.isActive ? 'bg-white text-primary' : 'bg-neutral-light text-neutral-text'}`}>
                                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                               </div>
                               <div>
                                  <h4 className="text-sm font-black text-dark-text tracking-tight uppercase">{cat.label}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                     <div className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-accent-green' : 'bg-neutral-text/40'}`}></div>
                                     <p className="text-[10px] font-bold text-neutral-text uppercase">{cat.isActive ? 'Live in Marketplace' : 'Hidden Grouping'}</p>
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => setEditingCat(cat)}
                                 className="p-3 hover:bg-primary/10 text-primary rounded-xl transition-all"
                               >
                                  <span className="material-symbols-outlined text-lg">edit</span>
                               </button>
                               <button 
                                 onClick={() => toggleCategoryActive(cat.id)}
                                 className={`p-3 rounded-xl transition-all ${cat.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-accent-green/10 text-accent-green'}`}
                                 title={cat.isActive ? 'Disable' : 'Enable'}
                               >
                                  <span className="material-symbols-outlined text-lg">{cat.isActive ? 'visibility_off' : 'visibility'}</span>
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {activeCategory === 'faqs' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-neutral-light space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-dark-text">FAQ Content Manager</h3>
                      <p className="text-xs font-bold text-neutral-text uppercase tracking-widest mt-1">Manage public help center content</p>
                    </div>
                    <button 
                      onClick={() => setEditingFaq({ category: 'General', question: '', answer: '' })}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      New FAQ
                    </button>
                 </div>

                 {editingFaq && (
                    <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 space-y-6 animate-in zoom-in-95">
                       <h4 className="text-sm font-black uppercase tracking-widest border-b border-primary/10 pb-4">
                          {editingFaq.id ? 'Edit FAQ Item' : 'New FAQ Item'}
                       </h4>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-neutral-text uppercase">Category</label>
                             <select 
                               value={editingFaq.category}
                               onChange={(e) => setEditingFaq({...editingFaq, category: e.target.value})}
                               className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                             >
                                <option value="General">General</option>
                                <option value="Payments">Payments</option>
                                <option value="Security">Security</option>
                                <option value="Agents">Agents</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-neutral-text uppercase">Question</label>
                             <input 
                               type="text" 
                               value={editingFaq.question}
                               onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})}
                               className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                               placeholder="Enter the question..."
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-neutral-text uppercase">Answer</label>
                          <textarea 
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})}
                            className="w-full bg-white border-none rounded-2xl p-4 text-sm font-medium leading-relaxed min-h-[120px]"
                            placeholder="Enter the detailed answer..."
                          />
                       </div>
                       <div className="flex justify-end gap-3">
                          <button onClick={() => setEditingFaq(null)} className="px-6 py-3 rounded-xl border border-neutral-light font-black text-[10px] uppercase">Cancel</button>
                          <button onClick={handleSaveFaq} className="px-10 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/20">Save Item</button>
                       </div>
                    </div>
                 )}

                 <div className="grid grid-cols-1 gap-4">
                    {faqs.map((faq) => (
                       <div key={faq.id} className="p-6 bg-[#f8fafc] rounded-[2rem] border border-transparent hover:border-primary/20 transition-all group flex items-start justify-between">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded uppercase">{faq.category}</span>
                                <h4 className="text-sm font-black text-dark-text tracking-tight">{faq.question}</h4>
                             </div>
                             <p className="text-xs text-neutral-text line-clamp-1">{faq.answer}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => setEditingFaq(faq)}
                               className="p-2 hover:bg-primary/10 text-primary rounded-lg"
                             >
                                <span className="material-symbols-outlined text-lg">edit</span>
                             </button>
                             <button 
                               onClick={() => handleDeleteFaq(faq.id)}
                               className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                             >
                                <span className="material-symbols-outlined text-lg">delete</span>
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
               </div>
             </div>
          )}

          {activeCategory === 'security' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-neutral-light space-y-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-dark-text">Global Security Policies</h3>
                      <p className="text-xs font-bold text-neutral-text uppercase tracking-widest mt-1">Platform-wide access controls & threat prevention</p>
                    </div>
                    <span className="p-4 bg-primary/10 text-primary rounded-2xl material-symbols-outlined font-black">security</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* 2FA Card */}
                     <div className="p-8 bg-[#f8fafc] rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all space-y-6 group">
                        <div className="flex items-center justify-between">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-neutral-light">
                              <span className="material-symbols-outlined">verified_user</span>
                           </div>
                           <button 
                              onClick={() => setConfig({...config, allowAgentRegistrations: !config.allowAgentRegistrations})}
                              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${config.allowAgentRegistrations ? 'bg-accent-green' : 'bg-neutral-light'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${config.allowAgentRegistrations ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </div>
                        <div>
                           <h4 className="font-black text-dark-text uppercase tracking-tight">Mandatory 2FA</h4>
                           <p className="text-[10px] font-bold text-neutral-text uppercase leading-relaxed mt-1">Require all administrative and biller accounts to use multi-factor verification.</p>
                        </div>
                     </div>

                     {/* Maintenance Mode Card */}
                     <div className="p-8 bg-[#f8fafc] rounded-[2.5rem] border border-transparent hover:border-red-500/20 transition-all space-y-6 group">
                        <div className="flex items-center justify-between">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-neutral-light">
                              <span className="material-symbols-outlined">construction</span>
                           </div>
                           <button 
                              onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${config.maintenanceMode ? 'bg-red-500' : 'bg-neutral-light'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${config.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </div>
                        <div>
                           <h4 className="font-black text-dark-text uppercase tracking-tight">Maintenance Mode</h4>
                           <p className="text-[10px] font-bold text-neutral-text uppercase leading-relaxed mt-1">Temporarily disable public bill payments while maintaining admin access.</p>
                        </div>
                     </div>

                     {/* Session Timeout */}
                     <div className="p-8 bg-[#f8fafc] rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-neutral-light">
                              <span className="material-symbols-outlined">timer_off</span>
                           </div>
                           <h4 className="font-black text-dark-text uppercase tracking-tight">Idle Session Timeout</h4>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Inactivity Limit (Minutes)</label>
                           <select 
                             value={config.maxDailyTransaction === 5000 ? '15' : '30'} 
                             className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-2 focus:ring-primary/20 appearance-none"
                           >
                              <option value="15">15 Minutes (High Security)</option>
                              <option value="30">30 Minutes (Standard)</option>
                              <option value="60">60 Minutes (Extended)</option>
                           </select>
                        </div>
                     </div>

                     {/* Password Policy */}
                     <div className="p-8 bg-[#f8fafc] rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-neutral-light">
                              <span className="material-symbols-outlined">password</span>
                           </div>
                           <h4 className="font-black text-dark-text uppercase tracking-tight">Complexity Rules</h4>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Minimum Requirements</label>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="p-3 bg-white rounded-xl border border-neutral-light flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                                 <span className="text-[10px] font-black text-dark-text">12+ Chars</span>
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-neutral-light flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                                 <span className="text-[10px] font-black text-dark-text">Special Case</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-neutral-light">
                     <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <div>
                           <h5 className="text-[11px] font-black text-dark-text uppercase">Policy Audit Trail</h5>
                           <p className="text-[10px] text-neutral-text font-medium leading-relaxed mt-1">All changes to global security policies are recorded in the master audit logs for compliance tracking.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className="flex justify-end pt-6">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3"
            >
              {isSaving ? <span className="material-symbols-outlined animate-spin">sync</span> : null}
              {isSaving ? 'Deploying Rules...' : 'Synchronize Global Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
